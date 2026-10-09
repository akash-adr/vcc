import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { Timeline } from "@/components/sections/story/Timeline";
import { Values } from "@/components/sections/story/Values";
import { Quote } from "@/components/sections/story/Quote";
import { CtaBand } from "@/components/sections/CtaBand";
import { story } from "@/data/timeline";

export const metadata: Metadata = {
  title: "Our Story",
  description: "How five cousins and their grandfather went from the fields of Pudukkottai to 30 million subscribers.",
  alternates: { canonical: "/story" },
};

export default function StoryPage() {
  return (
    <>
      <PageHeader {...story.header} seed={47} />
      <Timeline />
      <Values />
      <Quote />
      <CtaBand title="Your family has a story too." />
    </>
  );
}
