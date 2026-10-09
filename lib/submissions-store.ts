import "server-only";
import { getSupabase, isSupabaseConfigured } from "./supabase-server";
import type { Submission } from "./validation";

// Data access for submissions + newsletter. Uses Supabase when configured.
// In `next dev` without credentials it falls back to an in-memory store so the
// whole flow can be tried locally; production always requires Supabase.
const inMemoryMode = () => !isSupabaseConfigured() && process.env.NODE_ENV === "development";

const memory = { submissions: [] as Submission[], subscribers: new Set<string>() };
let warned = false;
function warnOnce() {
  if (warned) return;
  warned = true;
  console.warn("[vcc] Supabase env vars missing: using an in-memory store (development only). Nothing is persisted.");
}

export async function insertSubmission(s: Submission) {
  if (inMemoryMode()) {
    warnOnce();
    memory.submissions.push(s);
    return;
  }
  const { error } = await getSupabase()
    .from("recipe_submissions")
    .insert({
      name: s.name,
      email: s.email,
      place: s.place || null,
      dish: s.dish,
      story: s.story || null,
      fav_video: s.fav_video || null,
      consent: s.consent,
    });
  if (error) throw new Error(`insert failed: ${error.message}`);
}

export async function countSubmissions(): Promise<number> {
  if (inMemoryMode()) {
    warnOnce();
    return memory.submissions.length;
  }
  const { count, error } = await getSupabase().from("recipe_submissions").select("id", { count: "exact", head: true });
  if (error) throw new Error(`count failed: ${error.message}`);
  return count ?? 0;
}

export async function addSubscriber(email: string) {
  if (inMemoryMode()) {
    warnOnce();
    memory.subscribers.add(email.toLowerCase());
    return;
  }
  const { error } = await getSupabase()
    .from("newsletter_subscribers")
    .upsert({ email: email.toLowerCase() }, { onConflict: "email", ignoreDuplicates: true });
  if (error) throw new Error(`subscribe failed: ${error.message}`);
}
