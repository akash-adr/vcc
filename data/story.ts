// Copy for the home story sections (manifesto, origin, feast).

/** Words wrapped in *asterisks* render in Instrument Serif italic turmeric. */
export const manifesto = {
  statement: "No studio. No music. Just *fire,* *family* and food for a hundred.",
  backdrop: "சமையல்",
};

export const origin = {
  eyebrow: "Chapter 01 · Origin",
  title: { lead: "The flight that", accent: "never took off." },
  panels: [
    {
      stamp: "2018",
      stampSub: "DEPARTURE",
      tone: "turmeric",
      title: "Passports were ready.",
      text: "Five young men from a farming family were set to leave the village for work abroad.",
    },
    {
      stamp: "THE IDEA",
      stampSub: "APPROVED",
      tone: "ember",
      title: "One idea kept them home.",
      text: "Subramanian suggested a YouTube channel instead. They all grew up cooking in the fields.",
    },
    {
      stamp: "OCT 2018",
      stampSub: "FIRST UPLOAD",
      tone: "turmeric",
      title: "Then the termites came.",
      text: "Their first video: eesal (winged termites), a monsoon snack from their childhood.",
    },
    {
      stamp: "1 CRORE",
      stampSub: "DIAMOND",
      tone: "ember",
      title: "First in Tamil.",
      text: "In 2021 they became the first Tamil channel to cross 10 million subscribers and earn the Diamond Play Button.",
    },
  ],
} as const;

export const feast = {
  title: { lead: "Every feast is", accent: "shared." },
  facts: [
    { icon: "pot", text: "Every dish is cooked for 100+ people" },
    { icon: "hands", text: "After filming, food goes to villagers, orphanages and old-age homes" },
    { icon: "heart", text: "₹10 lakh donated to the Tamil Nadu CM Public Relief Fund (2021)" },
  ],
  closing: { ta: "கொடுப்பது எங்கள் பாரம்பரியம்", en: "Giving is our tradition." },
  cta: { label: "Send us your village recipe", href: "/#join" },
} as const;
