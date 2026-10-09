import { fail, json, readJson } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { addSubscriber } from "@/lib/submissions-store";
import { fieldErrors, newsletterSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return fail(400, "We couldn't read that. Please try again.");

  const limit = rateLimit(`newsletter:${clientIp(req)}`);
  if (!limit.ok) return fail(429, "Too many tries. Please wait a few minutes.", { retryAfter: limit.retryAfter });

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) return fail(400, fieldErrors(parsed.error).email ?? "That email doesn't look quite right.");

  try {
    await addSubscriber(parsed.data.email);
    return json({ ok: true });
  } catch (e) {
    console.error("[vcc] newsletter failed:", e);
    return fail(500, "Something went wrong on our side. Please try again shortly.");
  }
}
