import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Target, Cpu, ShieldAlert, Heart } from 'lucide-react';

const SECTION_ICONS = {
  mission: Target,
  how: Cpu,
  safety: ShieldAlert,
  credits: Heart,
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'About' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('About');
  const keys = ['mission', 'how', 'safety', 'credits'] as const;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{t('subtitle')}</p>

      <div className="mt-12 space-y-10">
        {keys.map((key) => {
          const Icon = SECTION_ICONS[key];
          return (
            <section key={key} className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon className="size-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {t(`sections.${key}.title`)}
                </h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {t(`sections.${key}.body`)}
                </p>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
