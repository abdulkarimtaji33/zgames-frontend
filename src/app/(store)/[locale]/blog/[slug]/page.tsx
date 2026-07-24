import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import apiClient from '@/lib/api/client';
import type { BlogPostDto } from '@/lib/api';
import { findStaticPostBySlug } from '../data';

interface DisplayPost {
  title: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  paragraphs: string[];
}

function contentToParagraphs(content: BlogPostDto['content']): string[] {
  if (!content) return [];
  if (typeof content === 'string') {
    return content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  }
  return [];
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function fetchPost(slug: string): Promise<DisplayPost | null> {
  try {
    const res = await apiClient.get<{ data: BlogPostDto }>(`/blog/posts/by-slug/${slug}`);
    const post = res.data.data;
    const paragraphs = contentToParagraphs(post.content);
    return {
      title: post.title,
      category: post.category?.name ?? 'General',
      date: post.publishedAt ? formatDate(post.publishedAt) : '',
      readTime: '5 min read',
      author: post.author?.name ?? 'CGA Games Team',
      paragraphs: paragraphs.length > 0 ? paragraphs : [post.excerpt ?? ''].filter(Boolean),
    };
  } catch {
    // Fall through to the static fallback data below (also covers a
    // not-yet-seeded backend, where the API responds with 404).
  }

  const staticPost = findStaticPostBySlug(slug);
  if (!staticPost) return null;
  return {
    title: staticPost.title,
    category: staticPost.category,
    date: formatDate(staticPost.date),
    readTime: staticPost.readTime,
    author: staticPost.author,
    paragraphs: staticPost.content,
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-12">
        <div className="max-w-2xl mx-auto text-center py-16 rounded-xl bg-card border border-border">
          <p className="text-4xl mb-3">📰</p>
          <h1 className="font-heading text-xl font-bold mb-2">Post not found</h1>
          <p className="text-foreground-muted mb-6">This article may have been moved or no longer exists.</p>
          <Link href="/en/blog" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
            <ChevronLeft className="h-4 w-4" /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/en/blog" className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-accent transition-colors mb-8">
          <ChevronLeft className="h-4 w-4" /> Back to Blog
        </Link>

        {/* Header */}
        <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20 mb-4">
          {post.category}
        </span>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-foreground-muted mb-8">
          {post.date && (
            <>
              <span>{post.date}</span>
              <span>·</span>
            </>
          )}
          <span>{post.readTime}</span>
          <span>·</span>
          <span>By {post.author}</span>
        </div>

        {/* Image */}
        <div className="rounded-xl bg-surface-2 h-64 md:h-80 flex items-center justify-center text-6xl mb-8 shadow-sm">🎮</div>

        {/* Content */}
        <div className="prose-measure">
          {post.paragraphs.map((paragraph, i) => (
            <p key={i} className="text-foreground-muted leading-relaxed text-base mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
