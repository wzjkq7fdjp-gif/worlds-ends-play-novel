// ============================================================
// HER PAGES — Argjila's memories, in her words.
//
// Every "anchor" below is a real detail Argjila shared. Every
// "text" is left empty on purpose: these moments are hers to
// write, and the game will not invent them. When she writes one,
// paste her words into `text` (use \n for a new line) and the
// page opens in the game, in the Her Pages menu and in the scene
// where the memory appears. Pages she told Rufki (rather than wrote
// herself) carry a `by` line saying so; she can replace any of them
// with her own sentences.
// ============================================================
export const MEMORIES = [
  {
    id: "before",
    title: "The minute before",
    date: "October 24, 2025",
    anchor: "I was at the house waiting for you that day. We once lived about a minute away from each other on Ocean Parkway.",
    text: "",
  },
  {
    id: "first",
    title: "What I noticed first",
    date: "October 24, 2025",
    anchor: "What I noticed first, and the first second I felt something different.",
    text: "",
  },
  {
    id: "realized",
    title: "When I knew I liked you",
    date: "Late 2025",
    anchor: "I cannot point to one exact day yet. The shift was happening in all those ordinary exchanges.",
    text: "",
  },
  {
    id: "reunion",
    title: "When you came back",
    date: "Around February 15, 2026",
    anchor: "I would rather tell you the real scene later than write a fake one now.",
    text: "",
  },
  {
    id: "pennsylvania",
    title: "Pennsylvania",
    date: "April 17–19, 2026",
    anchor: "Our first stretch of officially being together, away from our normal routines.",
    text: "",
  },
  {
    id: "kitchen",
    title: "The kitchen",
    date: "Around May 9, 2026",
    anchor: "The moment in the kitchen that we have called a confession.",
    text: "You told me how you loved me.\nI shed tears, and I felt even closer to you.",
    by: "Told by Argjila · written down by Rufki",
  },
  {
    id: "dance",
    title: "Our dance",
    date: "May 2026",
    anchor: "Our dance in May.",
    text: "Our slow dance.\nI felt at peace.",
    by: "Told by Argjila · written down by Rufki",
  },
  {
    id: "return",
    title: "Coming back to the city",
    date: "May 2026",
    anchor: "Coming back to New York City from upstate. What I was looking at, and what we talked about.",
    text: "I had a lot of fun. We listened to music, and everything was great.\nI was with you, and I comforted you before we got home.",
    by: "Told by Argjila · written down by Rufki",
  },
  {
    id: "park",
    title: "The park near Target",
    date: "2026",
    anchor: "It might sound like a small location to somebody else. To me, it is part of the map of us.",
    text: "I got to see a new side of you, a version of you.\nI'm happy I could be there for you in your moment.",
    by: "Told by Argjila · written down by Rufki",
  },
  {
    id: "song",
    title: "“About You”",
    date: "The 1975",
    anchor: "I chose “About You” by The 1975 for a reason, and I made you a card for it.",
    text: "It reminds me of us.\nIt's the song from the beginning, when we met. I listened to it.",
    by: "Told by Argjila · written down by Rufki",
  },
];
export const memory = (id) => MEMORIES.find((m) => m.id === id);
