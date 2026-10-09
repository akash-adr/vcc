// Most-watched videos. Paste each real YouTube ID into `youtubeId`;
// while it is empty the card shows a designed placeholder and links to a YouTube search.

export type Video = {
  id: string;
  title: string;
  views: string;
  youtubeId: string;
  /** placeholder thumbnail colours: [background, accent] */
  palette: [string, string];
};

export const videos: Video[] = [
  { id: "watermelon", title: "Watermelon Juice", views: "340M", youtubeId: "", palette: ["#D9532B", "#4E9A3A"] },
  { id: "biryani", title: "Inside Mutton Biryani", views: "247M", youtubeId: "", palette: ["#A85D38", "#EA971F"] },
  { id: "icecream", title: "Big Ice Cream", views: "240M", youtubeId: "", palette: ["#22612C", "#E3F0D3"] },
  { id: "kuchi", title: "Kuchi Ice (Fruit Popsicles)", views: "222M", youtubeId: "", palette: ["#EA971F", "#D9532B"] },
  { id: "chicken", title: "Full Chicken Roast", views: "166M", youtubeId: "", palette: ["#0F2E17", "#EA971F"] },
];

export const channel = {
  eyebrow: "Chapter 04 · Most watched",
  title: { lead: "Most", accent: "watched." },
  name: "Village Cooking Channel",
  handle: "@VillageCookingChannel",
  subscribers: "31M subscribers",
  videoCount: "280+ videos",
  subscribeUrl: "https://www.youtube.com/@VillageCookingChannel?sub_confirmation=1",
  // channel artwork supplied by the site owner (sources in assets-src/brand/)
  banner: "/images/channel-cover.webp",
  avatar: "/images/channel-logo.webp",
  avatarAlt: "Village Cooking Channel logo",
};

export const thumbnailUrl = (id: string, quality: "maxresdefault" | "hqdefault" = "maxresdefault") =>
  `https://i.ytimg.com/vi/${id}/${quality}.jpg`;

export const searchUrl = (title: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`Village Cooking Channel ${title}`)}`;
