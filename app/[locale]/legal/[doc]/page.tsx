import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import {
  LEGAL_DOCS,
  LEGAL_UPDATED,
  legalContent,
  type LegalDoc,
} from '@/lib/legal-content';

type PageParams = { locale: string; doc: string };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    LEGAL_DOCS.map((doc) => ({ locale, doc }))
  );
}

function isLegalDoc(doc: string): doc is LegalDoc {
  return (LEGAL_DOCS as readonly string[]).includes(doc);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale, doc } = await params;
  if (!isLegalDoc(doc)) return {};
  const content = legalContent[locale as 'sk' | 'en']?.[doc];
  return { title: content?.title, description: content?.intro };
}

export default async function LegalDocPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale, doc } = await params;
  if (!isLegalDoc(doc)) notFound();
  setRequestLocale(locale);

  const content = legalContent[locale as 'sk' | 'en'][doc];
  const t = await getTranslations('Legal');
  const format = await getFormatter();
  const updated = format.dateTime(new Date(LEGAL_UPDATED), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight">{content.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('lastUpdated')}: {updated}
      </p>
      <p className="mt-6 text-lg text-muted-foreground">{content.intro}</p>

      <div className="mt-10 space-y-8">
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold">{section.heading}</h2>
            <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">
              {section.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
