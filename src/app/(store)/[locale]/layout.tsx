import type { Metadata } from 'next';

type LocaleParams = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: isAr ? 'زي جيمز - متجر الألعاب الأول في الإمارات والخليج' : 'ZGames - #1 Gaming Store in UAE & GCC',
    description: isAr
      ? 'تسوق PS5 و Xbox و Nintendo وبطاقات التداول والإكسسوارات. شحن سريع إلى الإمارات والسعودية وقطر والكويت والبحرين.'
      : 'Shop PS5, Xbox, Nintendo, PC Gaming, Trading Cards & Accessories. Fast GCC-wide delivery. 100% authentic products.',
    openGraph: {
      title: 'ZGames',
      description: 'Your ultimate gaming destination in the GCC',
      type: 'website',
      locale: isAr ? 'ar_AE' : 'en_US',
    },
    alternates: {
      languages: {
        en: '/en',
        ar: '/ar',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: LocaleParams;
}) {
  await params;
  return <>{children}</>;
}