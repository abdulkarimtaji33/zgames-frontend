/**
 * Static fallback blog content, used when the backend Blog module has no
 * published posts yet (e.g. a fresh/empty database) so the blog pages have
 * real, per-post content to show instead of an empty state. Once real posts
 * exist in the backend, `blogApi` results take priority over this data.
 */
export interface StaticBlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  content: string[];
}

export const BLOG_POSTS: StaticBlogPost[] = [
  {
    slug: 'top-ps5-games-2025',
    title: 'Top 10 PS5 Games to Play in 2025',
    excerpt: 'From action-packed exclusives to epic RPGs, here are the must-play PS5 games this year.',
    category: 'PlayStation',
    date: '2025-01-15',
    readTime: '5 min read',
    author: 'CGA Games Team',
    content: [
      "2025 is shaping up to be one of the strongest years yet for PlayStation 5 owners, with a mix of first-party exclusives and highly anticipated third-party releases landing on the platform.",
      "Sony's first-party studios continue to push the hardware, delivering cinematic single-player adventures alongside a growing slate of live-service titles. Whether you're after a sprawling open world or a tightly focused action game, there's something worth adding to your backlog.",
      "We've rounded up our picks based on critical reception, community buzz, and what we've personally spent the most hours playing — spanning everything from narrative-driven epics to competitive multiplayer standouts.",
    ],
  },
  {
    slug: 'pokemon-tcg-guide',
    title: 'Beginner Guide to Pokémon TCG',
    excerpt: 'New to trading cards? We break down everything you need to know to start your Pokémon TCG journey.',
    category: 'Trading Cards',
    date: '2025-01-10',
    readTime: '8 min read',
    author: 'CGA Games Team',
    content: [
      "The Pokémon Trading Card Game has exploded in popularity again, drawing in both nostalgic collectors and brand-new players. If you're just getting started, the sheer number of sets and card types can feel overwhelming.",
      "At its core, the game is built around energy types, basic and evolution Pokémon, and trainer cards that let you manipulate the board. Understanding these building blocks is the fastest way to go from confused newcomer to confident deck-builder.",
      "In this guide we cover how to read a card, how a turn works, what makes a card valuable to collectors versus useful to players, and where to find starter decks and booster boxes to build your first collection.",
    ],
  },
  {
    slug: 'xbox-vs-playstation-2025',
    title: 'Xbox vs PlayStation in 2025: Which to Buy?',
    excerpt: 'An honest comparison of both platforms to help you make the right choice for your gaming style.',
    category: 'Consoles',
    date: '2025-01-05',
    readTime: '6 min read',
    author: 'CGA Games Team',
    content: [
      "Choosing between Xbox and PlayStation is less about raw hardware specs these days and more about ecosystem, exclusives, and how you like to play — subscription-first versus buying titles outright.",
      "Xbox's Game Pass continues to be a compelling value proposition for players who want a huge rotating library at a flat monthly cost, while PlayStation still leans on a strong lineup of narrative-driven exclusives you won't find anywhere else.",
      "We break down price, performance, exclusive lineups, and online service quality to help you decide which console actually fits how you game, rather than which one has the louder marketing campaign.",
    ],
  },
  {
    slug: 'best-gaming-monitors',
    title: 'Best Gaming Monitors for PC Gamers in 2025',
    excerpt: 'Upgrade your setup with our picks for the best 144Hz+ monitors across all budgets.',
    category: 'PC Gaming',
    date: '2024-12-28',
    readTime: '7 min read',
    author: 'CGA Games Team',
    content: [
      "A great monitor can make a bigger difference to your day-to-day gaming experience than most GPU upgrades, especially once you move past 60Hz and start noticing how much smoother fast-paced games feel.",
      "We tested panels across budget, mid-range, and high-end tiers, weighing refresh rate, response time, panel technology (IPS vs VA vs OLED), and HDR support against real-world pricing in the region.",
      "Whether you're chasing competitive esports performance or the best possible picture quality for single-player titles, we've got a recommendation that fits your budget and your desk.",
    ],
  },
  {
    slug: 'how-to-store-pokemon-cards',
    title: 'How to Store and Protect Your Pokémon Cards',
    excerpt: 'Keep your collection safe and valuable with these storage and grading tips.',
    category: 'Trading Cards',
    date: '2024-12-20',
    readTime: '4 min read',
    author: 'CGA Games Team',
    content: [
      "Whether you're holding onto cards for sentimental value or as an investment, proper storage is the single biggest factor in preserving their condition and long-term value.",
      "Humidity, direct sunlight, and rough handling are the biggest threats to a collection. Penny sleeves, top loaders, and binder pages each serve a different purpose depending on whether you're storing, displaying, or trading cards.",
      "We also cover the basics of grading — what companies like PSA and BGS look for, and when it's actually worth the cost of submitting a card for grading versus keeping it raw.",
    ],
  },
  {
    slug: 'nintendo-switch-2-preview',
    title: 'Nintendo Switch 2: Everything We Know',
    excerpt: 'The most anticipated gaming hardware of 2025 — specs, release date, and games.',
    category: 'Nintendo',
    date: '2024-12-15',
    readTime: '5 min read',
    author: 'CGA Games Team',
    content: [
      "Nintendo's next console has been the subject of speculation for years, and with official details finally trickling out, we've compiled everything confirmed so far in one place.",
      "From backward compatibility with existing Switch titles to rumored performance improvements aimed at closing the gap with other current-gen consoles, there's a lot riding on this launch.",
      "We'll keep this article updated as Nintendo shares more, but here's what we know today about hardware, launch titles, and what it means for your existing game library.",
    ],
  },
];

export function findStaticPostBySlug(slug: string): StaticBlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
