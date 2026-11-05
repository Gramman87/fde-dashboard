import { getInsights } from "@/lib/insights";

export async function GET() {
  return Response.json(await getInsights());
}
