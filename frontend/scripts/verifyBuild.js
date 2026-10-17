// Verifies the built dist/ output for SEO correctness before a deploy:
//   - the root page and every landing page from seo.config.json exist
//   - each page has the exact title, canonical, OG/Twitter URLs and images
//     that seo.config.json promises
//   - dist/sitemap.xml lists the same trailing-slash URLs (and no slashless
//     redirecting variants)
// Runs in CI after `npm run build`; also available locally as `npm run verify`.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const seoConfig = JSON.parse(readFileSync(join(rootDir, 'seo.config.json'), 'utf8'));
const SITE_URL = seoConfig.siteUrl.replace(/\/+$/, '');

const decodeEntities = (value) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

let failures = 0;
const fail = (message) => {
  console.error(`✖ ${message}`);
  failures += 1;
};

function checkPage(label, file) {
  if (!existsSync(file)) {
    fail(`${label}: missing dist file ${file}`);
    return null;
  }
  return readFileSync(file, 'utf8');
}

function checkValue(label, html, pattern, expected) {
  const match = html.match(pattern);
  if (!match) {
    fail(`${label}: pattern ${pattern} not found`);
    return;
  }
  const actual = decodeEntities(match[1]);
  if (actual !== expected) {
    fail(`${label}: expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}`);
  }
}

// --- Root page -------------------------------------------------------------
const rootCanonical = `${SITE_URL}/`;
const rootHtml = checkPage('root', join(distDir, 'index.html'));
if (rootHtml) {
  checkValue('root title', rootHtml, /<title>([^<]*)<\/title>/, seoConfig.default.title);
  checkValue('root canonical', rootHtml, /<link rel="canonical" href="([^"]*)"/, rootCanonical);
  checkValue('root og:url', rootHtml, /<meta property="og:url" content="([^"]*)"/, rootCanonical);
  checkValue('root og:title', rootHtml, /<meta property="og:title" content="([^"]*)"/, seoConfig.default.title);
  checkValue(
    'root og:description',
    rootHtml,
    /<meta property="og:description" content="([^"]*)"/,
    seoConfig.default.description
  );
}

// --- Landing pages from the shared config ----------------------------------
const landingSlugs = Object.keys(seoConfig.landingPages);
for (const slug of landingSlugs) {
  const page = seoConfig.landingPages[slug];
  const label = `/${slug}/`;
  const canonical = `${SITE_URL}/${slug}/`;

  if (page.title === seoConfig.default.title) {
    fail(`${label}: title is identical to the default page title (must be unique)`);
  }

  const html = checkPage(label, join(distDir, slug, 'index.html'));
  if (!html) continue;

  checkValue(`${label} title`, html, /<title>([^<]*)<\/title>/, page.title);
  checkValue(`${label} canonical`, html, /<link rel="canonical" href="([^"]*)"/, canonical);
  checkValue(`${label} og:url`, html, /<meta property="og:url" content="([^"]*)"/, canonical);
  checkValue(`${label} og:title`, html, /<meta property="og:title" content="([^"]*)"/, page.title);
  checkValue(`${label} og:image`, html, /<meta property="og:image" content="([^"]*)"/, page.image);
  checkValue(`${label} twitter:url`, html, /<meta name="twitter:url" content="([^"]*)"/, canonical);
  checkValue(`${label} twitter:image`, html, /<meta name="twitter:image" content="([^"]*)"/, page.image);
}

// --- Sitemap must list the trailing-slash URLs Pages serves ----------------
const sitemapFile = join(distDir, 'sitemap.xml');
if (!existsSync(sitemapFile)) {
  fail('sitemap: dist/sitemap.xml missing');
} else {
  const sitemap = readFileSync(sitemapFile, 'utf8');
  const expected = [rootCanonical, ...landingSlugs.map((slug) => `${SITE_URL}/${slug}/`)];
  const slashless = [SITE_URL, ...landingSlugs.map((slug) => `${SITE_URL}/${slug}`)];

  for (const url of expected) {
    if (!sitemap.includes(`<loc>${url}</loc>`)) fail(`sitemap: missing <loc>${url}</loc>`);
  }
  for (const url of slashless) {
    if (sitemap.includes(`<loc>${url}</loc>`)) fail(`sitemap: slashless redirecting URL <loc>${url}</loc> present`);
  }
}

if (failures > 0) {
  console.error(`✖ Build verification failed with ${failures} problem(s).`);
  process.exit(1);
}
console.log(`✅ Build verified: root + ${landingSlugs.length} landing pages, canonicals and sitemap aligned.`);
