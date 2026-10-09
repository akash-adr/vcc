import { revalidateTag } from "next/cache";
import { fail, json, readJson } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { countSubmissions, insertSubmission } from "@/lib/submissions-store";
import { fieldErrors, submissionSchema } from "@/lib/validation";
import { COUNT_TAG } from "@/lib/constants";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return fail(400, "We couldn't read that form. Please try again.");

  // Honeypot filled → a bot. Answer like a success so it learns nothing, but store nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json({ ok: true, count: null });
  }

  const limit = rateLimit(`submit:${clientIp(req)}`);
  if (!limit.ok) {
    return fail(429, "Easy there! That's a lot of recipes at once. Please try again in a few minutes.", { retryAfter: limit.retryAfter });
  }

  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, "A few details need another look.", { fieldErrors: fieldErrors(parsed.error) });
  }

  try {
    await insertSubmission(parsed.data);
    const count = await countSubmissions();
    revalidateTag(COUNT_TAG, "max");
    return json({ ok: true, count });
  } catch (e) {
    console.error("[vcc] submit failed:", e);
    return fail(500, "Our kitchen fire went out for a moment. Your recipe wasn't sent; please try again shortly.");
  }
}
