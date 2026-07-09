import type { Metadata } from 'next';
import { Inter, Rajdhani } from 'next/font/google';
import { Providers } from '@/components/Providers';
import '@/styles/globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const rajdhani = Rajdhani({
  variable: '--font-rajdhani',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'ZGames - Gaming Ecommerce',
  description: 'Premium gaming ecommerce platform for the GCC region',
};

async function getDefaultTheme(): Promise<'light' | 'dark'> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/public/theme`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return 'light';
    const data = await res.json();
    return data?.theme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const defaultTheme = await getDefaultTheme();

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${rajdhani.variable} min-h-full flex flex-col bg-background text-foreground antialiased`}
      >
        <Providers defaultTheme={defaultTheme}>{children}</Providers>
      </body>
    </html>
  );
}
