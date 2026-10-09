// The family, in wheel order. Portraits are cropped from the named source photos in the
// project root (e.g. "M. Periyathambi.jpg" → members/m-periyathambi.webp) by scripts/build-members.mjs,
// so each face ↔ name pairing comes straight from the supplied file names.

export type Member = {
  slug: string;
  name: string;
  ta: string;
  role: string;
  taRole: string;
  fact: string;
  image: string;
};

export const members: Member[] = [
  {
    slug: "m-periyathambi",
    name: "M. Periyathambi",
    ta: "பெரியதம்பி",
    role: "Thatha · Head Chef",
    taRole: "தாத்தா · தலைமை சமையல்காரர்",
    fact: "Cooked at weddings and feasts for about 50 years before YouTube made him famous.",
    image: "/images/members/m-periyathambi.webp",
  },
  {
    slug: "v-subramanian",
    name: "V. Subramanian",
    ta: "சுப்பிரமணியன்",
    role: "Founder · Camera",
    taRole: "நிறுவனர் · கேமரா",
    fact: "Had the idea that kept everyone home.",
    image: "/images/members/v-subramanian.webp",
  },
  {
    slug: "v-murugesan",
    name: "V. Murugesan",
    ta: "முருகேசன்",
    role: "Cook · Host",
    taRole: "சமையல் · தொகுப்பாளர்",
    fact: "Was preparing to fly abroad before the channel.",
    image: "/images/members/v-murugesan.webp",
  },
  {
    slug: "v-ayyanar",
    name: "V. Ayyanar",
    ta: "அய்யனார்",
    role: "Cook · Host",
    taRole: "சமையல் · தொகுப்பாளர்",
    fact: "“We have always been taught to give.”",
    image: "/images/members/v-ayyanar.webp",
  },
  {
    slug: "t-muthumanickam",
    name: "T. Muthumanickam",
    ta: "முத்துமாணிக்கம்",
    role: "Cook",
    taRole: "சமையல்",
    fact: "Studied catering.",
    image: "/images/members/t-muthumanickam.webp",
  },
  {
    slug: "g-tamilselvan",
    name: "G. Tamilselvan",
    ta: "தமிழ்செல்வன்",
    role: "Cook",
    taRole: "சமையல்",
    fact: "Part of the core cooking crew.",
    image: "/images/members/g-tamilselvan.webp",
  },
];

export const familyMeta = {
  eyebrow: "Chapter 03 · The family",
  title: { lead: "Meet the", accent: "FAMILY" },
  sub: "Six cousins, one grandfather, one fire.",
};
