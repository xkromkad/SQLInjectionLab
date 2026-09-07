'use client';

import Script from 'next/script';

// Both are opt-in: with the env var unset the corresponding script never loads.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

/**
 * Google Analytics (gtag) + AdSense with Consent Mode v2.
 *
 * Consent defaults to "denied" for all storage; the cookie banner calls
 * `gtag('consent', 'update', …)` once the user accepts. Scripts load
 * regardless so Consent Mode can manage cookies/personalization itself.
 *
 * The consent defaults are installed whenever either script is enabled, so
 * AdSense is still covered when analytics is off.
 */
export function Analytics() {
  if (!GTM_ID && !ADSENSE_CLIENT) return null;

  return (
    <>
      {GTM_ID && (
        <Script
          id="gtag-src"
          src={`https://www.googletagmanager.com/gtag/js?id=${GTM_ID}`}
          strategy="afterInteractive"
        />
      )}
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            wait_for_update: 500
          });
          gtag('js', new Date());
          ${GTM_ID ? `gtag('config', '${GTM_ID}');` : ''}
        `}
      </Script>
      {ADSENSE_CLIENT && (
        <Script
          id="adsense"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
