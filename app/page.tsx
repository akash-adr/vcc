import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { OriginStory } from "@/components/sections/OriginStory";
import { Numbers } from "@/components/sections/Numbers";
import { HelixGallery } from "@/components/sections/HelixGallery";
import { MostWatched } from "@/components/sections/MostWatched";
import { FeastShared } from "@/components/sections/FeastShared";
import { JoinFeast } from "@/components/sections/JoinFeast";
import type { Metadata } from "next";
import { Marquee } from "@/components/ui/Marquee";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Manifesto />
      <div className="relative z-20 pb-28 pt-4">
        <Marquee />
      </div>
      <OriginStory />
      <Numbers />
      <HelixGallery />
      <MostWatched />
      <FeastShared />
      <JoinFeast />
    </>
  );
}
