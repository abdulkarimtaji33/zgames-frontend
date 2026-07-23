import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/en/blog" className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-accent transition-colors mb-8">
          <ChevronLeft className="h-4 w-4" /> Back to Blog
        </Link>

        {/* Header */}
        <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20 mb-4">
          PlayStation
        </span>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          {params.slug.split('-').map((w: string) => w[0]?.toUpperCase() + w.slice(1)).join(' ')}
        </h1>
        <div className="flex items-center gap-4 text-sm text-foreground-muted mb-8">
          <span>January 15, 2025</span>
          <span>·</span>
          <span>5 min read</span>
          <span>·</span>
          <span>By CGA Games Team</span>
        </div>

        {/* Image */}
        <div className="rounded-2xl bg-background-tertiary h-64 md:h-80 flex items-center justify-center text-6xl mb-8">🎮</div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <p className="text-foreground-muted leading-relaxed text-base mb-4">
            Welcome to our comprehensive guide. In this article, we will cover everything you need to know about the latest gaming trends and products available in the GCC market.
          </p>
          <h2 className="font-heading text-2xl font-bold text-foreground mt-8 mb-4">Key Highlights</h2>
          <p className="text-foreground-muted leading-relaxed mb-4">
            The gaming industry continues to evolve rapidly, bringing exciting new titles, hardware, and experiences to gamers across the region. Stay tuned for our latest coverage.
          </p>
        </div>
      </div>
    </div>
  );
}