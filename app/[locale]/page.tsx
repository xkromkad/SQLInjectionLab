import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import {
  Database,
  ListChecks,
  LineChart,
  Upload,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { JsonLd } from '@/components/seo/json-ld';
import { siteConfig } from '@/lib/site';

const FEATURE_ICONS = {
  realDb: Database,
  tasks: ListChecks,
  progress: LineChart,
  custom: Upload,
} as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Opt into static rendering for this locale before using translations.
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: t('description'),
    inLanguage: locale,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.author.name,
      url: siteConfig.author.url,
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <LandingSections />
    </>
  );
}

function LandingSections() {
  const t = useTranslations('Home');
  const featureKeys = ['realDb', 'tasks', 'progress', 'custom'] as const;
  const exampleKeys = ['union', 'tautology', 'error'] as const;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/15),transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <ShieldAlert className="size-3.5" />
            {t('hero.badge')}
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            {t('hero.subtitle')}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/login">
                {t('hero.ctaPrimary')}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/about">{t('hero.ctaSecondary')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            {t('features.title')}
          </h2>
          <p className="mt-3 text-muted-foreground">{t('features.subtitle')}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featureKeys.map((key) => {
            const Icon = FEATURE_ICONS[key];
            return (
              <Card key={key} className="h-full">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{t(`features.items.${key}.title`)}</CardTitle>
                  <CardDescription>
                    {t(`features.items.${key}.description`)}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Examples */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              {t('examples.title')}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t('examples.subtitle')}
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {exampleKeys.map((key) => (
              <Card key={key} className="h-full">
                <CardHeader>
                  <CardTitle>{t(`examples.items.${key}.title`)}</CardTitle>
                  <CardDescription>
                    {t(`examples.items.${key}.description`)}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight">{t('cta.title')}</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {t('cta.subtitle')}
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/login">
            {t('cta.button')}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>
    </>
  );
}
