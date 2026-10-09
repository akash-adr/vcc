"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { BananaLeaf } from "@/components/ui/BananaLeaf";
import { join } from "@/data/join";
import { videos } from "@/data/videos";
import { submissionSchema, fieldErrors, validateField, type FieldName } from "@/lib/validation";

export type SubmitResult = { firstName: string; dish: string; count: number | null; origin: { x: number; y: number } };

type Values = { name: string; email: string; place: string; dish: string; story: string; fav_video: string; consent: boolean; website: string };
const EMPTY: Values = { name: "", email: "", place: "", dish: "", story: "", fav_video: "", consent: false, website: "" };
const ORDER: FieldName[] = ["name", "email", "place", "dish", "story", "fav_video", "consent"];

const inputCls =
  "w-full border-0 border-b border-leaf-900/25 bg-transparent px-0 py-1.5 font-medium text-leaf-900 outline-none transition-colors placeholder:font-serif placeholder:text-[1.05em] placeholder:italic placeholder:text-leaf-900/40 focus:border-leaf-700 focus-visible:rounded-none focus-visible:border-b-2 focus-visible:outline-none aria-[invalid=true]:border-ember-ink";

function Row({ id, label, required, error, children, hint }: { id: string; label: string; required?: boolean; error?: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="rf-row">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.68em] font-bold uppercase tracking-[0.16em] text-leaf-900/70">
          {label}
          {required && (
            <span aria-hidden="true" className="text-ember-ink">
              {" "}*
            </span>
          )}
        </label>
        {hint}
      </div>
      {children}
      <p id={`${id}-error`} className={`min-h-[1.15em] pt-0.5 text-[0.72em] font-semibold text-ember-ink transition-opacity ${error ? "opacity-100" : "opacity-0"}`}>
        {error}
      </p>
    </div>
  );
}

export function RecipeForm({ onSuccess }: { onSuccess: (r: SubmitResult) => void }) {
  const uid = useId();
  const id = (f: string) => `${uid}-${f}`;
  const form = useRef<HTMLFormElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [serverError, setServerError] = useState("");
  const [announce, setAnnounce] = useState("");

  const set = <K extends keyof Values>(k: K, v: Values[K]) => {
    setValues((s) => ({ ...s, [k]: v }));
    // once a field has shown an error, re-check as the user fixes it
    if (errors[k]) setErrors((e) => ({ ...e, [k]: validateField(k as FieldName, v) }));
  };
  const blur = (k: FieldName) => setErrors((e) => ({ ...e, [k]: validateField(k, values[k]) }));

  const aria = (f: FieldName) => ({
    id: id(f),
    "aria-invalid": errors[f] ? true : undefined,
    "aria-describedby": `${id(f)}-error`,
  });

  const shake = () => gsap.fromTo(button.current, { x: 0 }, { keyframes: { x: [-6, 6, -6, 6, -6, 6, 0] }, duration: 0.45, ease: "none" });

  const showErrors = (errs: Partial<Record<string, string>>) => {
    setErrors(errs);
    const first = ORDER.find((f) => errs[f]);
    const n = ORDER.filter((f) => errs[f]).length;
    setAnnounce(`${n} ${n === 1 ? "field needs" : "fields need"} attention: ${first ? errs[first] : ""}`);
    if (first) form.current?.querySelector<HTMLElement>(`#${CSS.escape(id(first))}`)?.focus();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setServerError("");

    const parsed = submissionSchema.safeParse(values);
    if (!parsed.success) {
      showErrors(fieldErrors(parsed.error));
      shake();
      return;
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setServerError(join.offline);
      setAnnounce(join.offline);
      shake();
      return;
    }

    setStatus("sending");
    setAnnounce(join.sending);
    try {
      const res = await fetch("/api/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        if (data.fieldErrors) showErrors(data.fieldErrors);
        const msg = data.error ?? "Something went wrong. Please try again.";
        setServerError(msg);
        setAnnounce(msg);
        setStatus("idle");
        shake();
        return;
      }
      const r = button.current!.getBoundingClientRect();
      onSuccess({
        firstName: parsed.data.name.split(/\s+/)[0],
        dish: parsed.data.dish,
        count: typeof data.count === "number" ? data.count : null,
        origin: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
      });
    } catch {
      const msg = navigator.onLine ? "We couldn't reach the kitchen. Please try again." : join.offline;
      setServerError(msg);
      setAnnounce(msg);
      setStatus("idle");
      shake();
    }
  };

  const L = join.labels;
  const P = join.placeholders;

  return (
    <form ref={form} onSubmit={submit} noValidate className="rf-form flex h-full flex-col gap-[0.55em]" aria-label="Send us your village recipe">
      <Row id={id("name")} label={L.name} required error={errors.name}>
        <input {...aria("name")} name="name" autoComplete="name" required maxLength={80} placeholder={P.name} className={inputCls} value={values.name} onChange={(e) => set("name", e.target.value)} onBlur={() => blur("name")} />
      </Row>
      <Row id={id("email")} label={L.email} required error={errors.email}>
        <input {...aria("email")} name="email" type="email" inputMode="email" autoComplete="email" required maxLength={120} placeholder={P.email} className={inputCls} value={values.email} onChange={(e) => set("email", e.target.value)} onBlur={() => blur("email")} />
      </Row>
      <div className="grid grid-cols-2 gap-x-[1.2em]">
        <Row id={id("place")} label={L.place} error={errors.place}>
          <input {...aria("place")} name="place" autoComplete="address-level2" maxLength={80} placeholder={P.place} className={inputCls} value={values.place} onChange={(e) => set("place", e.target.value)} onBlur={() => blur("place")} />
        </Row>
        <Row id={id("dish")} label={L.dish} required error={errors.dish}>
          <input {...aria("dish")} name="dish" required maxLength={80} placeholder={P.dish} className={inputCls} value={values.dish} onChange={(e) => set("dish", e.target.value)} onBlur={() => blur("dish")} />
        </Row>
      </div>
      <Row
        id={id("story")}
        label={L.story}
        error={errors.story}
        hint={
          <span className={`text-[0.66em] tabular-nums ${values.story.length > 950 ? "text-ember-ink" : "text-leaf-900/70"}`} aria-hidden="true">
            {values.story.length}/1000
          </span>
        }
      >
        <textarea
          {...aria("story")}
          name="story"
          rows={3}
          maxLength={1000}
          placeholder={P.story}
          className={`${inputCls} resize-none bg-[repeating-linear-gradient(transparent_0,transparent_calc(1.6em-1px),rgba(15,46,23,.18)_calc(1.6em-1px),rgba(15,46,23,.18)_1.6em)] leading-[1.6em]`}
          value={values.story}
          onChange={(e) => set("story", e.target.value)}
          onBlur={() => blur("story")}
        />
      </Row>
      <Row id={id("fav_video")} label={L.fav_video} error={errors.fav_video}>
        <select {...aria("fav_video")} name="fav_video" className={`${inputCls} cursor-pointer appearance-none bg-[length:12px] bg-[right_2px_center] bg-no-repeat`} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%230F2E17' stroke-width='1.6'/%3E%3C/svg%3E\")" }} value={values.fav_video} onChange={(e) => set("fav_video", e.target.value)} onBlur={() => blur("fav_video")}>
          <option value="">Choose one…</option>
          {videos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.title}
            </option>
          ))}
          <option value="other">{join.otherVideo}</option>
        </select>
      </Row>

      <div className="rf-row">
        <label htmlFor={id("consent")} className="flex cursor-pointer items-start gap-3 text-[0.82em] leading-snug text-leaf-900/85">
          <input
            {...aria("consent")}
            type="checkbox"
            name="consent"
            required
            checked={values.consent}
            onChange={(e) => {
              set("consent", e.target.checked);
              setErrors((er) => ({ ...er, consent: validateField("consent", e.target.checked) }));
            }}
            className="mt-[0.15em] h-[1.1em] w-[1.1em] shrink-0 cursor-pointer accent-leaf-700"
          />
          <span>
            {L.consent} <span aria-hidden="true" className="text-ember-ink">*</span>
          </span>
        </label>
        <p id={`${id("consent")}-error`} className={`min-h-[1.15em] pt-0.5 text-[0.72em] font-semibold text-ember-ink ${errors.consent ? "" : "opacity-0"}`}>
          {errors.consent}
        </p>
      </div>

      {/* honeypot: off-screen, unreachable by keyboard, hidden from assistive tech */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set("website", e.target.value)} />
      </div>

      <div className="rf-row mt-auto flex flex-col gap-2">
        {serverError && (
          <p role="alert" className="text-[0.8em] font-semibold text-ember-ink">
            {serverError}
          </p>
        )}
        <button
          ref={button}
          type="submit"
          disabled={status === "sending"}
          aria-disabled={status === "sending"}
          className="group inline-flex w-max items-center gap-2.5 rounded-full bg-leaf-900 px-[1.4em] py-[0.8em] text-[0.88em] font-bold text-paper transition-colors hover:bg-leaf-700 disabled:cursor-wait disabled:opacity-80"
        >
          {status === "sending" ? (
            <>
              <BananaLeaf veins={false} className="h-4 w-2 animate-spin text-turmeric [animation-duration:900ms]" />
              {join.sending}
            </>
          ) : (
            <>
              {join.submit}
              <span className="inline-block [perspective:200px]" aria-hidden="true">
                <BananaLeaf veins={false} className="inline-block h-4 w-2 rotate-[24deg] text-leaf-300 transition-transform duration-700 group-hover:[transform:rotate(24deg)_rotateY(180deg)]" />
              </span>
              <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </div>

      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </form>
  );
}
