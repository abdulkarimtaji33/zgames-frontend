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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${rajdhani.variable} min-h-full flex flex-col bg-background text-foreground antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}