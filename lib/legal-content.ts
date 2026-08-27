/**
 * Bilingual legal content. Plain data so a single route can render all docs.
 * NOTE: This is a good-faith template — have it reviewed by legal counsel
 * before relying on it in production.
 */

export const LEGAL_DOCS = ['terms', 'privacy', 'cookies', 'disclaimer'] as const;
export type LegalDoc = (typeof LEGAL_DOCS)[number];

export const LEGAL_UPDATED = '2026-06-18';

type Section = { heading: string; body: string[] };
type Doc = { title: string; intro: string; sections: Section[] };
type Locale = 'sk' | 'en';

export const legalContent: Record<Locale, Record<LegalDoc, Doc>> = {
  sk: {
    terms: {
      title: 'Podmienky používania',
      intro:
        'Tieto podmienky upravujú používanie platformy SQL Injection Lab. Používaním služby s nimi vyjadrujete súhlas.',
      sections: [
        {
          heading: '1. Výhradne vzdelávacie účely',
          body: [
            'SQL Injection Lab je vzdelávací nástroj určený na pochopenie a precvičovanie techník SQL injection v bezpečnom, izolovanom prostredí. Služba nesmie byť použitá na žiadny iný účel.',
            'Techniky, ktoré sa naučíte, nesmiete použiť proti žiadnym systémom, aplikáciám alebo databázam tretích strán bez ich výslovného a preukázateľného súhlasu.',
          ],
        },
        {
          heading: '2. Prijateľné používanie',
          body: [
            'Zaväzujete sa nepoužívať službu na nezákonnú činnosť, neoprávnený prístup k cudzím systémom ani na poškodzovanie iných osôb. Neoprávnený prístup k počítačovým systémom je trestný čin podľa platných právnych predpisov.',
            'Je zakázané nahrávať obsah alebo databázy, ktoré porušujú práva tretích strán, obsahujú škodlivý kód určený na útok mimo izolovaného prostredia, alebo ktoré sú nezákonné.',
          ],
        },
        {
          heading: '3. Účty a prihlásenie',
          body: [
            'Tréning je dostupný iba prihláseným používateľom. Prihlásenie prebieha cez poskytovateľov Google alebo GitHub. Zodpovedáte za zachovanie dôvernosti svojho prístupu.',
          ],
        },
        {
          heading: '4. Vlastný obsah',
          body: [
            'Môžete importovať vlastné sady úloh a nahrať vlastné databázy. Za nahraný obsah nesiete plnú zodpovednosť a potvrdzujete, že máte právo ho použiť.',
          ],
        },
        {
          heading: '5. Vylúčenie záruk a zodpovednosti',
          body: [
            'Služba sa poskytuje „tak ako je“ bez akýchkoľvek záruk. Prevádzkovateľ nezodpovedá za škody vzniknuté používaním alebo nesprávnym používaním služby vrátane akéhokoľvek zneužitia naučených techník.',
          ],
        },
        {
          heading: '6. Zmeny a ukončenie',
          body: [
            'Vyhradzujeme si právo kedykoľvek zmeniť tieto podmienky alebo ukončiť poskytovanie služby. Pokračovaním v používaní po zmene vyjadrujete súhlas s aktualizovanými podmienkami.',
          ],
        },
      ],
    },
    privacy: {
      title: 'Ochrana súkromia',
      intro:
        'Tieto zásady vysvetľujú, aké osobné údaje spracúvame a prečo. Záleží nám na vašom súkromí.',
      sections: [
        {
          heading: '1. Aké údaje spracúvame',
          body: [
            'Pri prihlásení cez Google alebo GitHub spracúvame vaše meno, e-mailovú adresu a profilový obrázok. Ďalej ukladáme údaje o vašom tréningu — relácie, pokusy, odoslané dotazy a výsledky.',
            'Automaticky spracúvame technické údaje (napr. typ prehliadača) a údaje z analytických a reklamných cookies, ak ste udelili súhlas.',
          ],
        },
        {
          heading: '2. Účel a právny základ',
          body: [
            'Údaje spracúvame na poskytovanie služby (plnenie zmluvy), sledovanie vášho pokroku a zlepšovanie platformy. Analytické a reklamné cookies spracúvame iba na základe vášho súhlasu.',
          ],
        },
        {
          heading: '3. Príjemcovia a spracovatelia',
          body: [
            'Využívame poskytovateľov: Google a GitHub (prihlásenie), Neon (databáza), Vercel (hosting), Google Analytics a Google AdSense (analytika a reklama, len so súhlasom).',
          ],
        },
        {
          heading: '4. Vaše práva',
          body: [
            'Máte právo na prístup k údajom, ich opravu, vymazanie, obmedzenie spracúvania, prenosnosť a namietanie. Svoj účet a súvisiace údaje môžete kedykoľvek vymazať v nastaveniach alebo kontaktovaním prevádzkovateľa.',
          ],
        },
        {
          heading: '5. Uchovávanie',
          body: [
            'Údaje uchovávame, kým máte aktívny účet. Po vymazaní účtu sú súvisiace údaje odstránené, ak ich nemusíme uchovať zo zákonných dôvodov.',
          ],
        },
      ],
    },
    cookies: {
      title: 'Zásady používania cookies',
      intro:
        'Používame cookies a podobné technológie. Tu nájdete prehľad a možnosti správy.',
      sections: [
        {
          heading: '1. Nevyhnutné cookies',
          body: [
            'Tieto cookies sú potrebné na fungovanie služby, najmä na udržanie prihlásenia. Nedajú sa vypnúť a nevyžadujú súhlas.',
          ],
        },
        {
          heading: '2. Analytické cookies',
          body: [
            'So súhlasom používame Google Analytics na pochopenie, ako sa služba používa, aby sme ju mohli zlepšovať.',
          ],
        },
        {
          heading: '3. Reklamné cookies',
          body: [
            'So súhlasom používame Google AdSense na zobrazovanie reklám. Bez súhlasu sa môžu zobrazovať len nepersonalizované reklamy.',
          ],
        },
        {
          heading: '4. Správa súhlasu',
          body: [
            'Pri prvej návšteve sa zobrazí lišta súhlasu. Svoje rozhodnutie môžete kedykoľvek zmeniť vymazaním cookies v prehliadači. Súhlas spravujeme pomocou Google Consent Mode v2.',
          ],
        },
      ],
    },
    disclaimer: {
      title: 'Vyhlásenie',
      intro:
        'Dôležité upozornenie o účele a obmedzeniach tejto platformy.',
      sections: [
        {
          heading: 'Vzdelávací nástroj',
          body: [
            'SQL Injection Lab slúži výhradne na vzdelávacie a výskumné účely. Všetky úlohy bežia proti databáze spustenej lokálne vo vašom prehliadači — žiadne reálne systémy nie sú ohrozené.',
          ],
        },
        {
          heading: 'Etické a zákonné používanie',
          body: [
            'Techniky uvedené na tejto platforme používajte iba v prostredí, na ktoré máte výslovné povolenie. Autor a prevádzkovateľ nenesú zodpovednosť za akékoľvek zneužitie získaných vedomostí.',
          ],
        },
      ],
    },
  },
  en: {
    terms: {
      title: 'Terms of Use',
      intro:
        'These terms govern your use of the SQL Injection Lab platform. By using the service you agree to them.',
      sections: [
        {
          heading: '1. Educational purposes only',
          body: [
            'SQL Injection Lab is an educational tool intended for understanding and practising SQL injection techniques in a safe, isolated environment. The service must not be used for any other purpose.',
            'You must not use the techniques you learn against any third-party systems, applications or databases without their explicit and demonstrable consent.',
          ],
        },
        {
          heading: '2. Acceptable use',
          body: [
            'You agree not to use the service for any unlawful activity, unauthorized access to systems, or to harm others. Unauthorized access to computer systems is a criminal offence under applicable law.',
            'You may not upload content or databases that infringe third-party rights, contain malicious code intended to operate outside the isolated environment, or are otherwise unlawful.',
          ],
        },
        {
          heading: '3. Accounts and sign-in',
          body: [
            'Training is available to signed-in users only. Sign-in is provided via Google or GitHub. You are responsible for keeping your access credentials confidential.',
          ],
        },
        {
          heading: '4. Your content',
          body: [
            'You may import your own task sets and upload your own databases. You are fully responsible for the content you upload and confirm you have the right to use it.',
          ],
        },
        {
          heading: '5. Disclaimer of warranties and liability',
          body: [
            'The service is provided "as is" without warranties of any kind. The operator is not liable for any damages arising from the use or misuse of the service, including any misuse of the techniques learned.',
          ],
        },
        {
          heading: '6. Changes and termination',
          body: [
            'We may change these terms or discontinue the service at any time. Continued use after a change constitutes acceptance of the updated terms.',
          ],
        },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      intro:
        'This policy explains what personal data we process and why. Your privacy matters to us.',
      sections: [
        {
          heading: '1. Data we process',
          body: [
            'When you sign in with Google or GitHub we process your name, email address and profile picture. We also store training data — sessions, attempts, submitted queries and results.',
            'We automatically process technical data (e.g. browser type) and data from analytics and advertising cookies, if you have consented.',
          ],
        },
        {
          heading: '2. Purpose and legal basis',
          body: [
            'We process data to provide the service (performance of a contract), to track your progress and to improve the platform. Analytics and advertising cookies are processed only based on your consent.',
          ],
        },
        {
          heading: '3. Recipients and processors',
          body: [
            'We use the following providers: Google and GitHub (sign-in), Neon (database), Vercel (hosting), Google Analytics and Google AdSense (analytics and ads, with consent only).',
          ],
        },
        {
          heading: '4. Your rights',
          body: [
            'You have the right to access, rectify, erase, restrict, port and object to the processing of your data. You can delete your account and related data at any time in settings or by contacting the operator.',
          ],
        },
        {
          heading: '5. Retention',
          body: [
            'We retain data while your account is active. After account deletion, related data is removed unless we are required to retain it for legal reasons.',
          ],
        },
      ],
    },
    cookies: {
      title: 'Cookie Policy',
      intro: 'We use cookies and similar technologies. Here is an overview and how to manage them.',
      sections: [
        {
          heading: '1. Necessary cookies',
          body: [
            'These cookies are required for the service to work, in particular to keep you signed in. They cannot be disabled and do not require consent.',
          ],
        },
        {
          heading: '2. Analytics cookies',
          body: [
            'With your consent we use Google Analytics to understand how the service is used so we can improve it.',
          ],
        },
        {
          heading: '3. Advertising cookies',
          body: [
            'With your consent we use Google AdSense to display ads. Without consent, only non-personalized ads may be shown.',
          ],
        },
        {
          heading: '4. Managing consent',
          body: [
            'On your first visit a consent banner is shown. You can change your decision at any time by clearing cookies in your browser. Consent is managed using Google Consent Mode v2.',
          ],
        },
      ],
    },
    disclaimer: {
      title: 'Disclaimer',
      intro: 'An important notice about the purpose and limitations of this platform.',
      sections: [
        {
          heading: 'Educational tool',
          body: [
            'SQL Injection Lab is intended solely for educational and research purposes. All tasks run against a database executed locally in your browser — no real systems are at risk.',
          ],
        },
        {
          heading: 'Ethical and lawful use',
          body: [
            'Only use the techniques shown on this platform in environments you are explicitly authorized to test. The author and operator accept no responsibility for any misuse of the knowledge gained.',
          ],
        },
      ],
    },
  },
};
