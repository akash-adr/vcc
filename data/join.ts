// Copy for the "Join the Feast" notebook, the leaf-plane success and the newsletter strip.

export const join = {
  eyebrow: { en: "Join the feast", ta: "விருந்தில் சேருங்கள்" },
  title: { lead: "Send us your", accent: "village recipe." },
  intro: "Every family has a dish that tastes like home. Share yours, and the best ones might reach the village kitchen.",
  counter: (n: number) =>
    n === 0 ? "Be the first recipe on its way" : `${n.toLocaleString("en-IN")} ${n === 1 ? "recipe" : "recipes"} already on their way`,
  labels: {
    name: "Your name",
    email: "Email",
    place: "Village / City",
    dish: "Dish name",
    story: "The story behind it",
    fav_video: "Favourite VCC video",
    consent: "I'm happy for my recipe to be featured on this fan site.",
  },
  placeholders: {
    name: "Meenakshi",
    email: "you@example.com",
    place: "Karaikudi",
    dish: "Paati's kara kuzhambu",
    story: "Who taught it to you, and when do you cook it?",
  },
  otherVideo: "Something else",
  submit: "Send it to the village",
  sending: "Sending…",
  thanks: {
    stamp: "RECEIVED",
    title: (dish: string) => `Your ${dish} is on its way.`,
    again: "Send another recipe",
  },
  success: {
    hello: (first: string) => `Vanakkam, ${first}! 🙏`,
    line: "Your recipe is flying to Chinna Veeramangalam.",
    count: (n: number | null) => (n ? `You're recipe #${n.toLocaleString("en-IN")}. Ellarum vaanga!` : "Ellarum vaanga!"),
    back: "Back to the feast",
    again: "Send another recipe",
  },
};

export const newsletter = {
  title: "A new village recipe every Sunday.",
  label: "Email for the Sunday recipe",
  placeholder: "you@example.com",
  button: "Subscribe",
  done: "You're in! 🍃",
};
