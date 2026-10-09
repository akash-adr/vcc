import "server-only";

export const json = (body: unknown, status = 200, headers?: HeadersInit) => Response.json(body, { status, headers });

export const fail = (status: number, error: string, extra?: Record<string, unknown>) => json({ ok: false, error, ...extra }, status);

/** Parse a JSON body without throwing. */
export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
