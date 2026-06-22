import Link from 'next/link';

const BLOG_POSTS = [
  { slug: 'top-ps5-games-2025', title: 'Top 10 PS5 Games to Play in 2025', excerpt: 'From action-packed exclusives to epic RPGs, here are the must-play PS5 games this year.', category: 'PlayStation', date: '2025-01-15', readTime: '5 min read' },
  { slug: 'pokemon-tcg-guide', title: 'Beginner Guide to Pokémon TCG', excerpt: 'New to trading cards? We break down everything you need to know to start your Pokémon TCG journey.', category: 'Trading Cards', date: '2025-01-10', readTime: '8 min read' },
  { slug: 'xbox-vs-playstation-2025', title: 'Xbox vs PlayStation in 2025: Which to Buy?', excerpt: 'An honest comparison of both platforms to help you make the right choice for your gaming style.', category: 'Consoles', date: '2025-01-05', readTime: '6 min read' },
  { slug: 'best-gaming-monitors', title: 'Best Gaming Monitors for PC Gamers in 2025', excerpt: 'Upgrade your setup with our picks for the best 144Hz+ monitors across all budgets.', category: 'PC Gaming', date: '2024-12-28', readTime: '7 min read' },
  { slug: 'how-to-store-pokemon-cards', title: 'How to Store and Protect Your Pokémon Cards', excerpt: 'Keep your collection safe and valuable with these storage and grading tips.', category: 'Trading Cards', date: '2024-12-20', readTime: '4 min read' },
  { slug: 'nintendo-switch-2-preview', title: 'Nintendo Switch 2: Everything We Know', excerpt: 'The most anticipated gaming hardware of 2025 — specs, release date, and games.', category: 'Nintendo', date: '2024-12-15', readTime: '5 min read' },
];

const CATEGORIES = ['All', 'PlayStation', 'Xbox', 'Nintendo', 'PC Gaming', 'Trading Cards', 'Consoles'];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="font-heading text-4xl font-bold mb-3">ZGames Blog</h1>
        <p className="text-foreground-muted">Gaming news, reviews, guides, and more.</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button key={cat} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            cat === 'All' ? 'bg-accent text-white border-accent' : 'border-border text-foreground-muted hover:border-border-hover hover:text-foreground'
          }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Featured post */}
      <div className="mb-10">
        <Link href={`/en/blog/${BLOG_POSTS[0].slug}`} className="group">
          <div className="rounded-2xl bg-gradient-to-br from-accent/20 via-background-secondary to-background-tertiary border border-border overflow-hidden">
            <div className="p-8 md:p-12">
              <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium border border-accent/30 mb-4">
                {BLOG_POSTS[0].category}
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4 group-hover:text-accent transition-colors">
                {BLOG_POSTS[0].title}
              </h2>
              <p className="text-foreground-muted text-lg mb-4 max-w-2xl">{BLOG_POSTS[0].excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-foreground-subtle">
                <span>{BLOG_POSTS[0].date}</span>
                <span>·</span>
                <span>{BLOG_POSTS[0].readTime}</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Post grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BLOG_POSTS.slice(1).map((post) => (
          <Link key={post.slug} href={`/en/blog/${post.slug}`} className="group">
            <div className="rounded-xl bg-card border border-border overflow-hidden hover:border-border-hover transition-colors h-full flex flex-col">
              <div className="bg-background-tertiary h-40 flex items-center justify-center text-4xl">🎮</div>
              <div className="p-5 flex flex-col flex-1">
                <span className="inline-block px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20 mb-3 self-start">
                  {post.category}
                </span>
                <h2 className="font-heading text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2 flex-1">
                  {post.title}
                </h2>
                <p className="text-sm text-foreground-muted mb-3 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-foreground-subtle mt-auto">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}