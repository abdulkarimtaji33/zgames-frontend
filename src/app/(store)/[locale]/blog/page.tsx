'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { blogApi } from '@/lib/api';
import { BLOG_POSTS as STATIC_POSTS } from './data';

interface DisplayPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
}

const FALLBACK_CATEGORIES = ['PlayStation', 'Xbox', 'Nintendo', 'PC Gaming', 'Trading Cards', 'Consoles'];

export default function BlogPage() {
  const [posts, setPosts] = useState<DisplayPost[] | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    let cancelled = false;
    blogApi.findAll({ limit: 50 })
      .then((res) => {
        if (cancelled) return;
        const items = res.data.data.items ?? [];
        if (items.length === 0) {
          setPosts(
            STATIC_POSTS.map((p) => ({
              slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category, date: p.date, readTime: p.readTime,
            })),
          );
          return;
        }
        setPosts(
          items.map((p) => ({
            slug: p.slug,
            title: p.title,
            excerpt: p.excerpt ?? '',
            category: p.category?.name ?? 'General',
            date: p.publishedAt ?? '',
            readTime: '5 min read',
          })),
        );
      })
      .catch(() => {
        if (cancelled) return;
        setPosts(
          STATIC_POSTS.map((p) => ({
            slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category, date: p.date, readTime: p.readTime,
          })),
        );
      });
    return () => { cancelled = true; };
  }, []);

  const displayPosts = posts ?? [];

  const categories = useMemo(() => {
    const fromPosts = Array.from(new Set(displayPosts.map((p) => p.category)));
    return ['All', ...(fromPosts.length > 0 ? fromPosts : FALLBACK_CATEGORIES)];
  }, [displayPosts]);

  const filteredPosts = useMemo(
    () => (activeCategory === 'All' ? displayPosts : displayPosts.filter((p) => p.category === activeCategory)),
    [displayPosts, activeCategory],
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="font-heading text-4xl font-bold mb-3">CGA Games Blog</h1>
        <p className="text-foreground-muted">Gaming news, reviews, guides, and more.</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            aria-pressed={activeCategory === cat}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeCategory === cat ? 'bg-accent text-white border-accent' : 'border-border text-foreground-muted hover:border-border-hover hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured post */}
      {filteredPosts.length > 0 ? (
        <div className="mb-10 reveal">
          <Link href={`/en/blog/${filteredPosts[0].slug}`} className="group">
            <div className="rounded-xl bg-gradient-to-br from-accent/15 via-surface-1 to-surface-2 border border-border overflow-hidden shadow-sm transition-shadow hover:shadow-md">
              <div className="p-8 md:p-12">
                <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium border border-accent/30 mb-4">
                  {filteredPosts[0].category}
                </span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4 group-hover:text-accent transition-colors">
                  {filteredPosts[0].title}
                </h2>
                <p className="text-foreground-muted text-lg mb-4 max-w-2xl">{filteredPosts[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-foreground-subtle">
                  <span>{filteredPosts[0].date}</span>
                  <span>·</span>
                  <span>{filteredPosts[0].readTime}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ) : null}

      {/* Post grid */}
      {filteredPosts.length > 1 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.slice(1).map((post) => (
            <Link key={post.slug} href={`/en/blog/${post.slug}`} className="group reveal">
              <div className="rounded-xl bg-card border border-border overflow-hidden hover:border-border-hover hover:shadow-md transition-all h-full flex flex-col shadow-sm">
                <div className="bg-surface-2 h-40 flex items-center justify-center text-4xl">🎮</div>
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
      ) : filteredPosts.length === 0 && posts !== null ? (
        <div className="text-center py-16 rounded-xl bg-card border border-border">
          <p className="text-4xl mb-3">📰</p>
          <h2 className="font-heading text-xl font-bold mb-2">No articles yet</h2>
          <p className="text-foreground-muted">
            {activeCategory === 'All'
              ? 'Check back soon for gaming news, reviews, and guides.'
              : `No articles found in "${activeCategory}" yet. Try another category.`}
          </p>
        </div>
      ) : null}
    </div>
  );
}
