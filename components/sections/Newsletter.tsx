"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { gsap } from "@/lib/gsap";
import { newsletter } from "@/data/join";
import { newsletterSchema } from "@/lib/validation";
import { BananaLeaf } from "@/components/ui/BananaLeaf";

export function Newsletter() {
  const uid = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const field = useRef<HTMLDivElement>(null);
  const done = useRef<HTMLParagraphElement>(null);

  const validate = (v: string) => {
    const r = newsletterSchema.safeParse({ email: v });
    return r.success ? "" : (r.error.issues[0]?.message ?? "");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    const msg = validate(email);
    setError(msg);
    if (msg) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      setStatus("done");
      // the input morphs into a pill
      requestAnimationFrame(() => {
        gsap.fromTo(done.current, { scaleX: 0.4, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 0.7, ease: "expo.out" });
      });
    } catch (err) {
      setError(err instanceof Error && navigator.onLine ? err.message : "You seem to be offline. Please try again.");
      setStatus("idle");
      gsap.fromTo(field.current, { x: 0 }, { keyframes: { x: [-6, 6, -6, 6, 0] }, duration: 0.4, ease: "none" });
    }
  };

  return (
    <section aria-labelledby={`${uid}-title`} className="relative bg-leaf-100">
      <div className="container-x flex flex-col gap-5 pb-16 pt-10 md:flex-row md:items-center md:justify-between md:pb-16 md:pt-12">
        <h2 id={`${uid}-title`} className="flex items-center gap-3 font-display text-[clamp(1.4rem,1rem+1.4vw,2.2rem)] font-extrabold leading-tight tracking-tightest">
          <BananaLeaf veins={false} className="h-7 w-3.5 shrink-0 rotate-[24deg] text-leaf-500" />
          {newsletter.title}
        </h2>

        {status === "done" ? (
          <p ref={done} role="status" className="w-max origin-left rounded-full bg-leaf-900 px-6 py-3.5 font-bold text-paper">
            {newsletter.done}
          </p>
        ) : (
          <form onSubmit={submit} noValidate className="w-full md:w-auto">
            <div ref={field} className="flex w-full items-center gap-2 rounded-full border border-line bg-white p-1.5 md:w-[440px]">
              <label htmlFor={`${uid}-email`} className="sr-only">
                {newsletter.label}
              </label>
              <input
                id={`${uid}-email`}
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                maxLength={120}
                placeholder={newsletter.placeholder}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(validate(e.target.value));
                }}
                onBlur={() => email && setError(validate(email))}
                aria-invalid={error ? true : undefined}
                aria-describedby={`${uid}-error`}
                className="min-w-0 flex-1 bg-transparent px-4 py-2 font-medium text-leaf-900 outline-none placeholder:text-leaf-900/40"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="shrink-0 rounded-full bg-turmeric px-5 py-2.5 text-sm font-bold text-leaf-900 transition-colors hover:bg-leaf-900 hover:text-paper disabled:opacity-70"
              >
                {status === "sending" ? "…" : newsletter.button}
              </button>
            </div>
            <p id={`${uid}-error`} aria-live="polite" className="min-h-[1.25em] px-4 pt-1.5 text-sm font-semibold text-ember-ink">
              {error}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
