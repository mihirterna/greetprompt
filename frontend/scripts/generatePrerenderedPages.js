// Generates prerendered landing pages (dist/<slug>/index.html) with unique
// <title>, description, canonical, Open Graph and Twitter meta tags.
// Runs as the last step of `npm run build`, after vite has produced dist/index.html.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distIndex = join(rootDir, 'dist', 'index.html');
const seoConfig = JSON.parse(readFileSync(join(rootDir, 'seo.config.json'), 'utf8'));

const SITE_URL = seoConfig.siteUrl.replace(/\/+$/, '');

if (!existsSync(distIndex)) {
  console.error('✖ dist/index.html not found — run `vite build` first.');
  process.exit(1);
}

const template = readFileSync(distIndex, 'utf8');

if (!template.includes('id="root"')) {
  console.error('✖ dist/index.html does not look like the GreetPrompt app shell.');
  process.exit(1);
}

const escapeHtml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function replaceOnce(html, pattern, replacement, label) {
  const occurrences = [...html.matchAll(new RegExp(pattern.source, 'g'))].length;
  if (occurrences !== 1) {
    throw new Error(`Expected exactly one match for ${label}, found ${occurrences}`);
  }
  return html.replace(pattern, replacement);
}

function buildPage(slug, page) {
  const canonical = `${SITE_URL}/${slug}/`;
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const image = page.image;

  let html = template;

  html = replaceOnce(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`, '<title>');
  html = replaceOnce(
    html,
    /(<meta name="title" content=")[^"]*(")/,
    `$1${title}$2`,
    'meta name=title'
  );
  html = replaceOnce(
    html,
    /(<meta name="description" content=")[^"]*(")/,
    `$1${description}$2`,
    'meta name=description'
  );
  html = replaceOnce(
    html,
    /(<link rel="canonical" href=")[^"]*(")/,
    `$1${canonical}$2`,
    'link rel=canonical'
  );
  html = replaceOnce(html, /(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`, 'og:url');
  html = replaceOnce(html, /(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`, 'og:title');
  html = replaceOnce(
    html,
    /(<meta property="og:description" content=")[^"]*(")/,
    `$1${description}$2`,
    'og:description'
  );
  html = replaceOnce(html, /(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`, 'og:image');
  html = replaceOnce(html, /(<meta name="twitter:url" content=")[^"]*(")/, `$1${canonical}$2`, 'twitter:url');
  html = replaceOnce(html, /(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`, 'twitter:title');
  html = replaceOnce(
    html,
    /(<meta name="twitter:description" content=")[^"]*(")/,
    `$1${description}$2`,
    'twitter:description'
  );
  html = replaceOnce(html, /(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`, 'twitter:image');

  const outDir = join(rootDir, 'dist', slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html, 'utf8');
  return canonical;
}

try {
  const pages = Object.entries(seoConfig.landingPages);
  for (const [slug, page] of pages) {
    const canonical = buildPage(slug, page);
    console.log(`✓ prerendered ${canonical}`);
  }
  console.log(`✅ Generated ${pages.length} landing pages.`);
} catch (err) {
  console.error(`✖ Prerender failed: ${err.message}`);
  process.exit(1);
}
