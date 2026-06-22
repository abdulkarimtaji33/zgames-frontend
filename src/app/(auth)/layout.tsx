import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/en" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-accent flex items-center justify-center font-heading font-bold text-white text-sm">Z</div>
          <span className="font-heading text-2xl font-bold">
            <span className="text-accent">Z</span>
            <span className="text-foreground">GAMES</span>
          </span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/en" className="text-foreground-muted hover:text-foreground transition-colors">
            ← Back to Store
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-border text-center text-xs text-foreground-subtle">
        © {new Date().getFullYear()} ZGames · <Link href="/en/privacy" className="hover:text-foreground-muted">Privacy</Link> · <Link href="/en/terms" className="hover:text-foreground-muted">Terms</Link>
      </footer>
    </div>
  );
}
