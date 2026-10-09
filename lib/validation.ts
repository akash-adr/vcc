// Shared by the API routes and the client form, so both give the same friendly messages.
import { z } from "zod";
import { videos } from "@/data/videos";

export const FAV_VIDEO_OPTIONS = [...videos.map((v) => v.id), "other"] as const;

export const submissionSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name (at least 2 letters).").max(80, "That name is a little long (80 characters max)."),
  email: z.string().trim().max(120, "That email is too long.").pipe(z.email("That email doesn't look quite right.")),
  place: z.string().trim().max(80, "Keep the village or city under 80 characters.").optional().default(""),
  dish: z.string().trim().min(2, "What's the dish called?").max(80, "Keep the dish name under 80 characters."),
  story: z.string().trim().max(1000, "The story can be up to 1000 characters.").optional().default(""),
  fav_video: z.union([z.enum(FAV_VIDEO_OPTIONS), z.literal("")], "Please pick a video from the list.").optional().default(""),
  consent: z.literal(true, "Please tick the box so we can feature your recipe."),
  /** honeypot: real people never see or fill this */
  website: z.string().optional().default(""),
});

export type SubmissionInput = z.input<typeof submissionSchema>;
export type Submission = z.output<typeof submissionSchema>;
export type FieldName = keyof Submission;

export const newsletterSchema = z.object({
  email: z.string().trim().max(120, "That email is too long.").pipe(z.email("That email doesn't look quite right.")),
});

/** First error message per field, for inline display. */
export function fieldErrors(error: z.ZodError): Partial<Record<string, string>> {
  const out: Partial<Record<string, string>> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Validate a single field (used on blur). Returns the message or undefined. */
export function validateField(name: FieldName, value: unknown): string | undefined {
  const field = submissionSchema.shape[name];
  const result = field.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}
