import { cacheLife, cacheTag } from "next/cache";
import { countSubmissions } from "@/lib/submissions-store";
import { COUNT_TAG } from "@/lib/constants";

export async function GET() {
  return Response.json({ count: await getCount() });
}

async function getCount() {
  "use cache";
  cacheLife({ stale: 30, revalidate: 30, expire: 300 });
  cacheTag(COUNT_TAG);
  try {
    return await countSubmissions();
  } catch (e) {
    console.error("[vcc] count unavailable:", e);
    return null; // the counter simply hides until the next refresh
  }
}
