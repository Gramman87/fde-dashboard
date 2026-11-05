import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it, mock } from "node:test";
import { GET } from "../app/api/insights/route";
import { POST } from "../app/api/query/route";
import { resetSharedBudget } from "../lib/budget";
import { getInsights, parseInsights, resetInsightsCache } from "../lib/insights";
import {
  brokenStream,
  errorEventStream,
  FakeAnthropic,
  refusalStream,
  streamOf,
  textMessage,
} from "./fakeAnthropic";

const INSIGHTS = {
  insights: [
    { type: "positive", title: "Up", insight: "MRR rose." },
    { type: "critical", title: "Risk", insight: "Solstice AI is churning." },
  ],
};

const ask = (question: unknown) =>
  POST(
    new Request("http://test/api/query", {
      method: "POST",
      body: JSON.stringify({ question }),
    }),
  );

const fake = new FakeAnthropic();
let baseUrl: string;

before(async () => {
  baseUrl = await fake.start();
  mock.method(console, "error", () => {});
});

after(async () => {
  await fake.stop();
  mock.restoreAll();
});

beforeEach(() => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  process.env.ANTHROPIC_BASE_URL = baseUrl;
  delete process.env.CLAUDE_DAILY_LIMIT;
  fake.requests.length = 0;
  fake.replies = [];
  resetInsightsCache();
  resetSharedBudget();
});

describe("GET /api/insights", () => {
  it("returns Claude's insights, labelled", async () => {
    fake.replies = [{ json: textMessage(JSON.stringify(INSIGHTS)) }];

    const body = await (await GET()).json();

    assert.equal(body.engine, "claude");
    assert.equal(body.notice, null);
    assert.equal(body.insights[1].title, "Risk");
  });

  it("serves repeat loads from the cache without another API call", async () => {
    fake.replies = [{ json: textMessage(JSON.stringify(INSIGHTS)) }];

    await GET();
    await GET();

    assert.equal(fake.requests.length, 1);
  });

  it("calls the API again once the cache expires", async () => {
    fake.replies = [{ json: textMessage(JSON.stringify(INSIGHTS)) }];

    await getInsights(1_000);
    await getInsights(1_000 + 60 * 60 * 1000 + 1);

    assert.equal(fake.requests.length, 2);
  });

  it("falls back with 200 when no key is set, so the page can't go blank", async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const res = await GET();
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.engine, "demo");
    assert.match(body.notice, /no API key/);
    assert.equal(body.insights.length, 4);
    assert.equal(fake.requests.length, 0);
  });

  for (const status of [500, 401, 400, 429]) {
    it(`falls back on an API ${status}`, async () => {
      fake.replies = [{ status }];

      const body = await (await GET()).json();

      assert.equal(body.engine, "demo");
      assert.match(body.notice, /unavailable/);
    });
  }

  it("falls back when the reply isn't usable, and doesn't cache that", async () => {
    fake.replies = [{ json: textMessage("Sure! Here are some insights") }, { json: textMessage(JSON.stringify(INSIGHTS)) }];

    assert.equal((await (await GET()).json()).engine, "demo");
    assert.equal((await (await GET()).json()).engine, "claude");
  });

  it("stops calling the API when the daily budget is used up", async () => {
    process.env.CLAUDE_DAILY_LIMIT = "1";
    fake.replies = [{ status: 400 }]; // not a status the SDK retries

    await GET();
    const body = await (await GET()).json();

    assert.match(body.notice, /budget/);
    assert.equal(fake.requests.length, 1);
  });
});

describe("parseInsights", () => {
  it("accepts a fenced reply", () => {
    assert.equal(parseInsights("```json\n" + JSON.stringify(INSIGHTS) + "\n```").length, 2);
  });

  it("rejects anything the UI couldn't render", () => {
    for (const bad of [
      "not json",
      "{}",
      '{"insights":[]}',
      '{"insights":[null]}',
      '{"insights":[{"type":"amazing","title":"x","insight":"y"}]}',
      '{"insights":[{"type":"positive","title":7,"insight":"y"}]}',
    ]) {
      assert.throws(() => parseInsights(bad), Error, bad);
    }
  });
});

describe("POST /api/query", () => {
  it("streams Claude's answer and says who answered", async () => {
    fake.replies = [streamOf(["Churn is ", "falling."])];

    const res = await ask("How is churn?");

    assert.equal(res.headers.get("X-Engine"), "claude");
    assert.equal(res.headers.get("X-Notice"), null);
    assert.equal(await res.text(), "Churn is falling.");
    assert.equal(fake.requests[0].stream, true);
  });

  it("delivers text before the model has finished", async () => {
    fake.replies = [streamOf(["First", " second"])];

    const reader = (await ask("q")).body!.getReader();
    const { value } = await reader.read();

    assert.equal(new TextDecoder().decode(value), "First");
    await reader.cancel();
  });

  it("answers from rules when no key is set", async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const res = await ask("How is churn trending?");

    assert.equal(res.headers.get("X-Engine"), "demo");
    assert.match(res.headers.get("X-Notice")!, /no API key/);
    assert.match(await res.text(), /Churn is 2\.8%/);
  });

  for (const [name, reply] of [
    ["an API 500", { status: 500 }],
    ["an API 400 such as no credits", { status: 400 }],
    ["a refusal", refusalStream()],
    ["a stream that dies before any text", brokenStream([])],
  ] as const) {
    it(`falls back cleanly on ${name}`, async () => {
      fake.replies = [reply];

      const res = await ask("How is churn trending?");

      assert.equal(res.status, 200);
      assert.equal(res.headers.get("X-Engine"), "demo");
      assert.match(await res.text(), /Churn is 2\.8%/);
    });
  }

  for (const [name, reply] of [
    ["a dropped connection", brokenStream(["The answer is"])],
    ["an overloaded error event", errorEventStream(["The answer is"])],
  ] as const) {
    it(`keeps the partial answer after ${name}, and doesn't add a second one`, async () => {
      fake.replies = [reply];

      const res = await ask("How is churn trending?");
      const text = await res.text();

      assert.equal(res.headers.get("X-Engine"), "claude");
      assert.match(text, /^The answer is/);
      assert.match(text, /stopped before finishing/);
      assert.doesNotMatch(text, /Churn is 2\.8%/);
    });
  }

  it("says so when an answer hits the token limit", async () => {
    fake.replies = [streamOf(["Half an ans"], "max_tokens")];

    assert.match(await (await ask("q")).text(), /^Half an ans[\s\S]*stopped before finishing/);
  });

  it("rejects bad input without calling the API", async () => {
    fake.replies = [streamOf(["x"])];
    const notJson = await POST(new Request("http://test", { method: "POST", body: "{nope" }));

    assert.equal(notJson.status, 400);
    for (const question of [undefined, "", "   ", 7, "x".repeat(1001)]) {
      assert.equal((await ask(question)).status, 400);
    }
    assert.equal(fake.requests.length, 0);
  });

  it("stops calling the API when the daily budget is used up", async () => {
    process.env.CLAUDE_DAILY_LIMIT = "1";
    fake.replies = [streamOf(["Hi."])];

    await (await ask("first")).text();
    const res = await ask("How is churn trending?");

    assert.match(res.headers.get("X-Notice")!, /budget/);
    assert.equal(fake.requests.length, 1);
  });
});
