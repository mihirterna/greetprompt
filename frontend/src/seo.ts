import seoConfig from '../seo.config.json';

export interface LandingPageSeo {
  slug: string;
  title: string;
  description: string;
  image: string;
  /** Canonical URL path, always with a trailing slash (e.g. /diwali/). */
  path: string;
  aliases: string[];
}

export const SITE_URL: string = seoConfig.siteUrl;

export const HOME_SEO = {
  title: seoConfig.default.title,
  description: seoConfig.default.description,
  canonicalPath: '/',
};

function normalizePath(pathname: string): string {
  return pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
}

const landingPages: LandingPageSeo[] = Object.entries(seoConfig.landingPages).map(
  ([slug, page]) => ({
    slug,
    title: page.title,
    description: page.description,
    image: page.image,
    path: `/${slug}/`,
    aliases: page.aliases,
  })
);

const pagesByPath = new Map<string, LandingPageSeo>();
for (const page of landingPages) {
  pagesByPath.set(page.slug, page);
  for (const alias of page.aliases) {
    pagesByPath.set(alias, page);
  }
}

export { landingPages };

export interface ResolvedSeo {
  title: string;
  description: string;
  image?: string;
  /** Site-relative canonical path including any trailing slash. */
  canonicalPath: string;
}

/**
 * Resolve SEO metadata strictly from the URL path.
 * Returns null for unknown paths so their existing tags are left untouched.
 */
export function getSeoForPath(pathname: string): ResolvedSeo | null {
  const key = normalizePath(pathname);
  if (!key) return HOME_SEO;

  const page = pagesByPath.get(key);
  if (!page) return null;

  return {
    title: page.title,
    description: page.description,
    image: page.image,
    canonicalPath: page.path,
  };
}
