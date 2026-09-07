/**
 * Generates the English copy of the lab database.
 *
 *   npm run db:build-en
 *
 * Reads public/db/SQLInjectionLab.db, replaces the Slovak row values listed in
 * TRANSLATIONS, and writes public/db/SQLInjectionLab.en.db. The schema is never
 * touched: table, column and view names stay identical in both files, and so do
 * usernames, e-mails and passwords (the task sets assert against them).
 *
 * This script is the source of truth — do not hand-edit the generated file. It
 * fails loudly if a mapped column holds a value with no translation, or if a
 * translation matches no row, so an edit to the Slovak database can never
 * silently ship a half-translated English copy.
 */
import fs from 'node:fs';
import path from 'node:path';
import initSqlJs from 'sql.js';

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, 'public/db/SQLInjectionLab.db');
const TARGET = path.join(ROOT, 'public/db/SQLInjectionLab.en.db');
const WASM = path.join(ROOT, 'public/sql-wasm.wasm');

/** table → column → { slovak value: english value } */
const TRANSLATIONS: Record<string, Record<string, Record<string, string>>> = {
  users: {
    full_name: {
      'Jan Novák': 'John Newman',
      'Eva Horváthová': 'Eve Hunter',
      'Peter Kováč': 'Peter Smith',
      'Anna Varga': 'Anna Wagner',
    },
    address: {
      'Ulica 123, Mesto': '123 Main Street, Springfield',
      'Hlavná 45, Mesto': '45 High Street, Springfield',
      'Námestie 7, Mesto': '7 Market Square, Springfield',
      'Parková 12, Mesto': '12 Park Avenue, Springfield',
    },
  },
  products: {
    // product_name is asserted verbatim by task 9 of the English set.
    product_name: {
      'Smartfón Samsung Galaxy S20': 'Samsung Galaxy S20 Smartphone',
      'Notebook HP Pavilion 15': 'HP Pavilion 15 Laptop',
      'Televízor LG 55NANO86': 'LG 55NANO86 TV',
      'Slúchadlá Sony WH-1000XM4': 'Sony WH-1000XM4 Headphones',
      'Kniha Harry Potter a Kameň mudrcov':
        'Harry Potter and the Philosophers Stone (Book)',
      'Puzzle 1000 dielov - Nádherný západ slnka':
        '1000-Piece Puzzle - Beautiful Sunset',
      'Športová taška Adidas Performance': 'Adidas Performance Sports Bag',
      'Mikrovlnná rúra Bosch HMT75M451': 'Bosch HMT75M451 Microwave Oven',
      'Kávovar Philips EP3246/70': 'Philips EP3246/70 Coffee Machine',
      'Robotický vysávač iRobot Roomba 960': 'iRobot Roomba 960 Robot Vacuum',
    },
    description: {
      'Nový smartfón so 6,2-palcovým displejom a trojitým fotoaparátom.':
        'A new smartphone with a 6.2-inch display and a triple camera.',
      'Výkonný notebook s 15,6-palcovým displejom a procesorom Intel Core i5.':
        'A powerful laptop with a 15.6-inch display and an Intel Core i5 processor.',
      '55-palcový televízor s technológiou NanoCell a 4K rozlíšením.':
        'A 55-inch TV with NanoCell technology and 4K resolution.',
      'Bezdrôtové slúchadlá s vynikajúcim zvukom a aktívnym potlačením hluku.':
        'Wireless headphones with excellent sound and active noise cancelling.',
      'Prvá kniha slávnej sérii od J.K. Rowlingovej.':
        'The first book in the famous series by J.K. Rowling.',
      'Zábavné puzzle so scénou nádherného západu slnka.':
        'A fun puzzle showing a beautiful sunset scene.',
      'Kvalitná taška pre športové aktivity s pohodlnými ramennými popruhmi.':
        'A quality bag for sports activities with comfortable shoulder straps.',
      'Mikrovlnná rúra s kapacitou 17 litrov a 5 výkonnostnými stupňami.':
        'A microwave oven with a 17-litre capacity and 5 power levels.',
      'Automatický kávovar s možnosťou prípravy viacerých druhov kávy.':
        'An automatic coffee machine that brews several kinds of coffee.',
      'Inteligentný robotický vysávač s navigáciou v reálnom čase a možnosťou ovládania cez mobilnú aplikáciu.':
        'A smart robot vacuum with real-time navigation, controllable from a mobile app.',
    },
  },
  delivery: {
    // status is asserted verbatim by task 7 of the English set.
    status: {
      'Pripravené na odoslanie': 'Ready for dispatch',
      Odoslané: 'Shipped',
    },
  },
  categories: {
    category_name: {
      Smartfóny: 'Smartphones',
      Notebooky: 'Laptops',
      Televízory: 'TVs',
      Slúchadlá: 'Headphones',
      Knihy: 'Books',
      Hračky: 'Toys',
      'Športové potreby': 'Sporting goods',
      Spotrebiče: 'Appliances',
      Kávovary: 'Coffee machines',
      'Robotické vysávače': 'Robot vacuums',
    },
  },
  reviews: {
    review_text: {
      'Veľmi spokojný s týmto smartfónom.': 'Very happy with this smartphone.',
      'Dobrá cena za kvalitný výkon.': 'Good price for solid performance.',
      'Notebook HP Pavilion ma úžasný displej.':
        'The HP Pavilion laptop has a great display.',
      'Kvalitný televízor s ostrým obrazom.':
        'A quality TV with a sharp picture.',
      'Slúchadlá Sony majú skvelý zvuk.': 'The Sony headphones sound excellent.',
      'Harry Potter je vynikajúca kniha.': 'Harry Potter is an excellent book.',
      'Puzzle boli veľmi zábavné na skládanie.':
        'The puzzle was great fun to put together.',
      'Adidas taška je pohodlná na nosenie.':
        'The Adidas bag is comfortable to carry.',
      'Mikrovlnná rúra má rýchle varenie.': 'The microwave heats up quickly.',
      'Philips kávovar robí vynikajúcu kávu.':
        'The Philips coffee machine makes excellent coffee.',
      'iRobot Roomba je skvelý pomocník v domácnosti.':
        'The iRobot Roomba is a great help around the house.',
    },
  },
  payment_methods: {
    payment_method_name: {
      'Kreditná karta': 'Credit card',
      'Debetná karta': 'Debit card',
      'Prevodom na účet': 'Bank transfer',
      Dobierka: 'Cash on delivery',
    },
  },
  coupons: {
    // coupon_code is asserted verbatim by task 4 of the English set.
    coupon_code: {
      LETO2024: 'SUMMER2024',
      ZIMNAVYBAVKA: 'WINTERGEAR',
    },
  },
};

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

async function main() {
  const SQL = await initSqlJs({ locateFile: () => WASM });
  const db = new SQL.Database(fs.readFileSync(SOURCE));

  let replaced = 0;

  for (const [table, columns] of Object.entries(TRANSLATIONS)) {
    for (const [column, map] of Object.entries(columns)) {
      // Every distinct value in a mapped column must have a translation.
      const [existing] = db.exec(
        `select distinct ${column} from ${table} where ${column} is not null`
      );
      const values = (existing?.values ?? []).map((row) => String(row[0]));
      const missing = values.filter((v) => !(v in map));
      if (missing.length > 0) {
        fail(`${table}.${column}: no translation for ${JSON.stringify(missing)}`);
      }

      // Every translation must match at least one row.
      for (const [sk, en] of Object.entries(map)) {
        const stmt = db.prepare(
          `update ${table} set ${column} = :en where ${column} = :sk`
        );
        stmt.run({ ':en': en, ':sk': sk });
        stmt.free();
        const changes = db.getRowsModified();
        if (changes === 0) {
          fail(
            `${table}.${column}: translation for ${JSON.stringify(sk)} matched no row`
          );
        }
        replaced += changes;
      }
    }
  }

  fs.writeFileSync(TARGET, Buffer.from(db.export()));
  db.close();

  console.log(
    `✓ Wrote ${path.relative(ROOT, TARGET)} (${replaced} values translated)`
  );
}

main().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
