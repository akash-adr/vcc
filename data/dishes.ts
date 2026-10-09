// Signature dishes for /kitchen. `video` points at an entry in data/videos.ts when there is one;
// otherwise the card links to a YouTube search. Steps describe the general village method, not a specific video.

export type DishCategory = "Veg" | "Non-veg" | "Sweets";

export type Dish = {
  id: string;
  title: string;
  ta: string;
  /** the big letter on the typographic card */
  initial: string;
  line: string;
  description: string;
  steps: [string, string, string];
  fire: 1 | 2 | 3;
  category: DishCategory;
  /** id in data/videos.ts */
  video?: string;
  /** optional photo in /public/images/dishes; typographic card otherwise */
  image?: string;
};

export const dishCategories = ["All", "Veg", "Non-veg", "Sweets"] as const;

export const dishes: Dish[] = [
  {
    id: "watermelon",
    initial: "W",
    title: "Watermelon Juice",
    ta: "தர்பூசணி ஜூஸ்",
    line: "Their most-watched video: fruit by the cartload, juiced in the open.",
    description: "A summer cooler made at village scale: whole watermelons scooped, crushed and chilled for everyone who turns up.",
    steps: ["Halve the melons and scoop the flesh into a giant vessel.", "Crush and strain, sweeten lightly and add a pinch of salt.", "Chill with ice and serve straight from the pot."],
    fire: 1,
    category: "Veg",
    video: "watermelon",
  },
  {
    id: "biryani",
    initial: "B",
    title: "Inside Mutton Biryani",
    ta: "மட்டன் பிரியாணி",
    line: "Layered, sealed and slow-cooked over firewood.",
    description: "Biryani the way a village feast needs it: a huge pot, fragrant rice and mutton layered and sealed so nothing escapes.",
    steps: ["Marinate the mutton in curd, chilli and a freshly ground masala.", "Layer half-cooked rice over the meat in a wide pot.", "Seal the lid and cook on low embers until the steam says it's done."],
    fire: 3,
    category: "Non-veg",
    video: "biryani",
  },
  {
    id: "icecream",
    initial: "I",
    title: "Big Ice Cream",
    ta: "ஐஸ்கிரீம்",
    line: "Dessert for a hundred, churned by hand.",
    description: "A giant batch of ice cream, proof that the family's kitchen isn't only fire and spice.",
    steps: ["Simmer milk with sugar until rich and slightly thick.", "Cool it, fold in fruit and nuts.", "Freeze and churn in batches big enough for the whole village."],
    fire: 1,
    category: "Sweets",
    video: "icecream",
  },
  {
    id: "eesal",
    initial: "E",
    title: "Winged Termite Fry",
    ta: "ஈசல் வறுவல்",
    line: "Eesal: the monsoon snack from their very first video.",
    description: "Winged termites gathered after the first rains, a childhood snack in rural Tamil Nadu and where the channel began.",
    steps: ["Gather the termites as they swarm after the rain.", "Clean and dry-roast them in a wide pan.", "Toss with a little salt and chilli while still crisp."],
    fire: 2,
    category: "Non-veg",
  },
  {
    id: "uppukari",
    initial: "U",
    title: "Mutton Uppu Kari",
    ta: "மட்டன் உப்பு கறி",
    line: "Salt, chilli, shallots. Nothing else needed.",
    description: "A dry, fiery Chettinad-style mutton fry built on very few ingredients and a lot of patience.",
    steps: ["Cook the mutton with salt and turmeric until tender.", "Fry shallots and dried red chillies in plenty of oil.", "Add the mutton and roast until dark and dry."],
    fire: 3,
    category: "Non-veg",
  },
  {
    id: "kuzhimandi",
    initial: "K",
    title: "Kuzhi Mandi",
    ta: "குழி மந்தி",
    line: "Biryani cooked in a pit under the ground.",
    description: "An underground-oven biryani: the meat hangs over rice in a sealed pit and smokes slowly in the heat of the earth.",
    steps: ["Dig a pit and heat it with a hard-burning wood fire.", "Set the rice pot in and hang the spiced meat above it.", "Seal the pit and let the earth do the cooking."],
    fire: 3,
    category: "Non-veg",
  },
];

export const kitchen = {
  header: { kicker: "Thatha's", title: "KITCHEN", line: "Giant pots. Firewood. Hand-ground masala. No shortcuts." },
  dishesTitle: { lead: "Signature", accent: "dishes." },
  dishesEyebrow: "Served on a banana leaf",
  way: {
    eyebrow: "The VCC way",
    items: [
      { icon: "fire", label: "Firewood", ta: "விறகு அடுப்பு" },
      { icon: "pot", label: "Clay & giant vessels", ta: "மண் பாத்திரம்" },
      { icon: "ammi", label: "Stone-ground spices", ta: "அம்மி" },
      { icon: "leaf", label: "Banana-leaf serving", ta: "வாழை இலை" },
    ],
  },
};
