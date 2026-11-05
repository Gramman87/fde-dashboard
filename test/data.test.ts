import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DailyBudget } from "../lib/budget";
import { demoAnswer, demoInsights } from "../lib/fallback";
import { churnData, kpis, revenueData, segmentData, userGrowthData } from "../lib/mockData";

describe("sample data", () => {
  it("has cards that agree with their charts", () => {
    assert.equal(kpis.mrr, 561000);
    assert.equal(kpis.mrrGrowth, 7.9); // 520K to 561K
    assert.equal(kpis.churnDelta, -0.1); // 2.9% to 2.8%, shown as 0.5 before
    assert.equal(kpis.dauMauRatio, 32.5);
  });

  it("has annual revenue of twelve times monthly in every month", () => {
    for (const { mrr, arr } of revenueData) assert.equal(arr, mrr * 12);
  });

  it("has segment shares that add up to 100", () => {
    assert.equal(segmentData.reduce((sum, s) => sum + s.mrrSharePct, 0), 100);
  });

  it("really does have churn falling every month, as the demo claims", () => {
    for (let i = 1; i < churnData.length; i++) {
      assert.ok(churnData[i].churnRate < churnData[i - 1].churnRate);
    }
    assert.equal(churnData.length, userGrowthData.length);
  });
});

describe("demo answers", () => {
  const cases: [string, RegExp][] = [
    ["How is churn trending?", /Churn is 2\.8%, down from 4\.2%/],
    ["Which segment drives the most MRR?", /Enterprise is 56%/],
    ["What's the DAU/MAU trend telling us?", /DAU\/MAU is 32\.5%/],
    ["Which accounts need attention?", /Forge & Co \(at-risk, \$21K MRR\) and Solstice AI \(churning, \$14K MRR\).*\$35K/],
    ["How is revenue doing?", /up 7\.9% on last month and 52\.9% since Nov/],
  ];

  for (const [question, expected] of cases) {
    it(`answers "${question}"`, () => assert.match(demoAnswer(question), expected));
  }

  it("says what it can't do rather than pretending", () => {
    assert.match(demoAnswer("Write me a poem"), /only look up fixed topics/);
  });
});

describe("demo insights", () => {
  it("uses types the UI can render", () => {
    const allowed = new Set(["positive", "opportunity", "warning", "critical"]);
    for (const item of demoInsights()) assert.ok(allowed.has(item.type));
  });
});

describe("DailyBudget", () => {
  it("resets the next day", () => {
    let day = "2026-11-02";
    const budget = new DailyBudget(1, () => day);

    assert.equal(budget.tryAcquire(), true);
    assert.equal(budget.tryAcquire(), false);
    day = "2026-11-03";
    assert.equal(budget.tryAcquire(), true);
  });
});
