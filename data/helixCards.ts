// The 10 cards of the helix gallery: the six members (from data/members.ts) interleaved with four channel cards.
// Face ↔ name pairings come from the supplied named portrait files (see data/members.ts).
import { members, type Member } from "./members";
import { site } from "./site";

export type HelixCard =
  | { kind: "member"; id: string; short: string; member: Member; story: [string, string]; url: string }
  | {
      kind: "stat";
      id: string;
      short: string;
      numeral: string;
      /** font for the numeral: Tamil needs Catamaran */
      numeralFont?: "display" | "tamil";
      label: string;
      fact: string;
      tone: "leaf" | "turmeric";
      url: string;
    };

const m = (slug: string) => members.find((x) => x.slug === slug)!;
const member = (slug: string, short: string): HelixCard => {
  const mem = m(slug);
  return {
    kind: "member",
    id: slug,
    short,
    member: mem,
    story: [mem.fact, "Cooking with the family in Chinna Veeramangalam."],
    url: site.youtube,
  };
};

export const helixCards: HelixCard[] = [
  member("m-periyathambi", "Thatha"),
  { kind: "stat", id: "family", short: "31M+ Family", numeral: "31M+", label: "FAMILY ON YOUTUBE", fact: "More than 31 million people subscribe to a village kitchen.", tone: "turmeric", url: site.youtube },
  member("v-subramanian", "Subramanian"),
  member("v-murugesan", "Murugesan"),
  { kind: "stat", id: "diamond", short: "Diamond Button", numeral: "1st", label: "DIAMOND PLAY BUTTON", fact: "The first Tamil channel to earn YouTube's Diamond Play Button.", tone: "leaf", url: site.youtube },
  member("v-ayyanar", "Ayyanar"),
  member("t-muthumanickam", "Muthumanickam"),
  { kind: "stat", id: "fed", short: "100+ Fed", numeral: "100+", label: "FED EVERY SHOOT", fact: "Every pot is cooked for a crowd, and the food goes to people who need it.", tone: "turmeric", url: site.youtube },
  member("g-tamilselvan", "Tamilselvan"),
  { kind: "stat", id: "vaanga", short: "Ellarum Vaanga", numeral: "வாங்க", numeralFont: "tamil", label: "ELLARUM VAANGA", fact: "Everyone is welcome. That's how every video begins.", tone: "leaf", url: "/#join" },
];

export const helixMeta = {
  title: { lead: "Meet the", accent: "FAMILY" },
  prompt: "Who do you want to meet?",
  sayHi: "Ellarum vaanga ✦ say hi",
  closing: { lead: "Ellarum", accent: "vaanga." },
  watch: "Watch their videos",
};

/** helix geometry, shared by the scene and the overlay */
export const HELIX = { stepDeg: 52, stepY: 1.35, radius: 3.2, radiusMobile: 2.4 } as const;

export const helixImages = members.map((x) => x.image);
