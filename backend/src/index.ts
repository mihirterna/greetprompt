import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  CardRequest,
  CardResponse,
  Env,
  CulturalSphere,
  Language,
  LanguageInfo,
  AiMessageRequest,
  AiPromptSuggestRequest,
  MessageTone,
} from './types';
import { OCCASIONS, SCENES, ALL_LANGUAGES, CULTURAL_SPHERES } from './templates/scenes';
import { generateBackgroundArt, generateAiMessage, suggestImagePrompt } from './services/ai';
import { generateCardSvg } from './services/textOverlay';
import { saveCardImage, getCardImage } from './services/storage';

const app = new Hono<{ Bindings: Env }>();

// Browser origins permitted to call the API directly. Extend with the
// ALLOWED_ORIGINS comma-separated variable to add custom domains.
const DEFAULT_ALLOWED_ORIGINS = [
  'https://greetprompt.com',
  'https://www.greetprompt.com',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
];

function isAllowedOrigin(origin: string, env: Env): boolean {
  if (DEFAULT_ALLOWED_ORIGINS.includes(origin)) return true;
  // Cloudflare Pages preview / branch deployments. Preview URLs are
  // <hash>.<project>.pages.dev (two labels); the direct alias is
  // <project>.pages.dev (one label) — allow both shapes.
  if (/^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)?\.pages\.dev$/.test(origin)) return true;

  const extra = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return extra.includes(origin);
}

// Restrict cross-origin browser access to known frontends instead of `*`.
app.use(
  '*',
  cors({
    origin: (origin, c) => (origin && isAllowedOrigin(origin, c.env) ? origin : undefined),
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

// User-supplied text limits (also bounded in the UI) to keep prompts sane.
const TEXT_LIMITS = {
  customTitle: 160,
  customQuote: 800,
  customSubtitle: 160,
  recipientName: 80,
  senderName: 80,
  customImagePrompt: 500,
} as const;

function clampText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

// `tone` is interpolated verbatim into LLM prompts ("Write a ${tone} wish…",
// "Mood: ${tone}"). The field is a string union in the types, but request
// bodies are unvalidated at runtime, so restrict it to the known set instead
// of letting arbitrary text through. Unknown values fall back to the existing
// 'devotional' default at the prompt layer.
const MESSAGE_TONES = ['devotional', 'poetic', 'cheerful', 'formal'] as const;

function sanitizeTone(value: unknown): MessageTone | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return (MESSAGE_TONES as readonly string[]).includes(trimmed)
    ? (trimmed as MessageTone)
    : undefined;
}

// Map Country Code & Query to Cultural Sphere
function detectCulturalSphere(countryCode: string, querySphere?: string): CulturalSphere {
  if (querySphere && CULTURAL_SPHERES[querySphere as CulturalSphere]) {
    return querySphere as CulturalSphere;
  }
  const cc = countryCode.toUpperCase();

  // 1. South Asia
  if (['IN', 'PK', 'BD', 'NP', 'LK', 'BT', 'MV'].includes(cc)) {
    return 'south_asia';
  }
  // 2. Latin America & Iberia
  if (
    [
      'BR', 'MX', 'CO', 'AR', 'PE', 'VE', 'CL', 'GT', 'EC', 'BO', 'CU', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'ES'
    ].includes(cc)
  ) {
    return 'latin_america';
  }
  // 3. Middle East & North Africa
  if (['AE', 'SA', 'EG', 'QA', 'KW', 'TR', 'OM', 'BH', 'JO', 'LB', 'MA', 'DZ', 'IQ', 'TN', 'YE'].includes(cc)) {
    return 'middle_east';
  }
  // 4. East & Southeast Asia
  if (['JP', 'KR', 'CN', 'TW', 'HK', 'ID', 'TH', 'VN', 'PH', 'MY', 'SG'].includes(cc)) {
    return 'east_asia';
  }
  // 5. Europe
  if (['FR', 'DE', 'IT', 'NL', 'SE', 'NO', 'DK', 'PL', 'CH', 'AT', 'BE', 'PT', 'GR', 'FI', 'IE', 'CZ', 'RO', 'HU'].includes(cc)) {
    return 'europe';
  }
  // 6. Africa
  if (['NG', 'KE', 'ZA', 'GH', 'TZ', 'UG', 'ET', 'RW', 'SN', 'CI', 'CM'].includes(cc)) {
    return 'africa';
  }

  // 7. Global / Anglosphere
  return 'global';
}

// Intelligent Cultural & City-level language priority mapping
function getPrioritizedLanguages(
  sphere: CulturalSphere,
  stateCode?: string,
  city?: string
): LanguageInfo[] {
  const normState = (stateCode || '').toUpperCase().trim();
  const normCity = (city || '').toLowerCase().trim();

  let priorityIds: Language[];

  if (sphere === 'south_asia') {
    if (['PB', 'CH'].includes(normState) || ['ludhiana', 'amritsar', 'jalandhar', 'chandigarh'].includes(normCity)) {
      priorityIds = ['pa', 'hi', 'en', 'hinglish', 'mr', 'gu', 'te', 'ta', 'bn'];
    } else if (normState === 'GJ' || ['ahmedabad', 'surat', 'vadodara', 'rajkot'].includes(normCity)) {
      priorityIds = ['gu', 'hi', 'en', 'mr', 'hinglish', 'pa', 'te', 'ta', 'bn'];
    } else if (['TS', 'AP', 'TG'].includes(normState) || ['hyderabad', 'visakhapatnam'].includes(normCity)) {
      priorityIds = ['te', 'hi', 'en', 'hinglish', 'ta', 'mr', 'gu', 'pa', 'bn'];
    } else if (normState === 'TN' || ['chennai', 'coimbatore', 'madurai'].includes(normCity)) {
      priorityIds = ['ta', 'en', 'hi', 'te', 'hinglish', 'mr', 'gu', 'pa', 'bn'];
    } else if (normState === 'WB' || ['kolkata', 'howrah'].includes(normCity)) {
      priorityIds = ['bn', 'hi', 'en', 'hinglish', 'mr', 'gu', 'pa', 'te', 'ta'];
    } else if (normState === 'MH' || ['mumbai', 'pune', 'nagpur', 'thane'].includes(normCity)) {
      priorityIds = ['mr', 'hi', 'gu', 'en', 'hinglish', 'pa', 'te', 'ta', 'bn'];
    } else {
      priorityIds = ['hi', 'mr', 'gu', 'pa', 'en', 'hinglish', 'te', 'ta', 'bn'];
    }
  } else if (sphere === 'latin_america') {
    priorityIds = ['es', 'pt', 'en', 'fr', 'it'];
  } else if (sphere === 'middle_east') {
    priorityIds = ['ar', 'tr', 'en', 'fr', 'es'];
  } else if (sphere === 'east_asia') {
    priorityIds = ['ja', 'ko', 'zh', 'id', 'en'];
  } else if (sphere === 'europe') {
    priorityIds = ['fr', 'de', 'it', 'en', 'es', 'pt'];
  } else if (sphere === 'africa') {
    priorityIds = ['en', 'sw', 'fr', 'ar', 'pt'];
  } else {
    // Global / Anglosphere
    priorityIds = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ar', 'ja', 'hi'];
  }

  // Append remaining languages
  const remaining = (Object.keys(ALL_LANGUAGES) as Language[]).filter((l) => !priorityIds.includes(l));
  const fullOrder = [...priorityIds, ...remaining];

  return fullOrder.map((id) => ALL_LANGUAGES[id]).filter(Boolean);
}

// Helper to determine sphere, city, state and timeOfDay from request
function detectGeo(c: any): {
  sphere: CulturalSphere;
  countryCode: string;
  stateCode: string;
  city: string;
  timeOfDay: string;
  prioritizedLanguages: LanguageInfo[];
} {
  const url = new URL(c.req.url);
  const querySphere = url.searchParams.get('sphere') as CulturalSphere | null;
  const cfCountry = (c.req.raw?.cf?.country || c.req.header('cf-ipcountry') || 'US').toUpperCase();

  const sphere = detectCulturalSphere(cfCountry, querySphere || undefined);

  const queryState = (url.searchParams.get('state') || (sphere === 'south_asia' ? c.req.raw?.cf?.regionCode : '') || '').toUpperCase();
  const queryCity = (url.searchParams.get('city') || (sphere === 'south_asia' && !url.searchParams.get('state') ? c.req.raw?.cf?.city : '') || '').toLowerCase();

  const hour = new Date().getUTCHours() + (sphere === 'south_asia' ? 5.5 : sphere === 'east_asia' ? 9 : sphere === 'europe' ? 2 : -5);
  const normalizedHour = (hour + 24) % 24;
  let timeOfDay = 'morning';
  if (normalizedHour >= 12 && normalizedHour < 17) {
    timeOfDay = 'afternoon';
  } else if (normalizedHour >= 17 && normalizedHour < 22) {
    timeOfDay = 'evening';
  } else if (normalizedHour >= 22 || normalizedHour < 4) {
    timeOfDay = 'night';
  }

  const prioritizedLanguages = getPrioritizedLanguages(sphere, queryState, queryCity);

  return {
    sphere,
    countryCode: cfCountry,
    stateCode: queryState,
    city: queryCity,
    timeOfDay,
    prioritizedLanguages,
  };
}

// Health check endpoint
app.get('/api/health', (c) => {
  const geo = detectGeo(c);
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    aiBindingActive: !!c.env.AI,
    r2BindingActive: !!c.env.WISHES_BUCKET,
    environment: c.env.ENVIRONMENT || 'development',
    detectedGeo: geo,
    version: '2.5.0 (Typography & Llama 3.1 Suite)',
  });
});

// Presets endpoint for geo, sphere & city-aware frontend UI initialization
app.get('/api/presets', (c) => {
  const geo = detectGeo(c);

  const occasions = Object.values(OCCASIONS).map((occ) => {
    const sortedScenes = [...occ.scenes].sort((a, b) => {
      if (a.sphere === geo.sphere) return -1;
      if (b.sphere === geo.sphere) return 1;
      if (a.sphere === 'all') return -1;
      if (b.sphere === 'all') return 1;
      return 0;
    });
    return {
      ...occ,
      scenes: sortedScenes,
    };
  });

  return c.json({
    culturalSpheres: Object.values(CULTURAL_SPHERES),
    detectedSphere: geo.sphere,
    detectedGeo: geo,
    occasions,
    allScenes: Object.values(SCENES),
    languages: geo.prioritizedLanguages,
    suggestedLanguage: geo.prioritizedLanguages[0]?.id || 'en',
    suggestedOccasion: geo.timeOfDay === 'morning' ? 'good_morning' : 'ganesh_chaturthi',
  });
});

// AI Greeting Message Generation (Llama 3.1 8B)
app.post('/api/ai/message', async (c) => {
  try {
    const body = await c.req.json<AiMessageRequest>();
    const sanitized: AiMessageRequest = {
      ...body,
      recipientName: clampText(body.recipientName, TEXT_LIMITS.recipientName),
      senderName: clampText(body.senderName, TEXT_LIMITS.senderName),
      tone: sanitizeTone(body.tone),
    };
    const result = await generateAiMessage(sanitized, c.env);
    return c.json(result);
  } catch (err: any) {
    console.error('Error generating AI message:', err);
    return c.json(
      {
        header: 'Warm Wishes',
        quote: 'Wishing you boundless joy, peace and prosperity.',
        trailer: '✨ WISHING YOU JOY & BLESSINGS ✨',
      },
      200
    );
  }
});

// AI Scene Prompt Crafter (Contextual prompt suggestion)
app.post('/api/ai/prompt-suggest', async (c) => {
  try {
    const body = await c.req.json<AiPromptSuggestRequest>();
    const sanitized: AiPromptSuggestRequest = {
      ...body,
      currentPrompt: clampText(body.currentPrompt, TEXT_LIMITS.customImagePrompt),
      tone: sanitizeTone(body.tone),
    };
    const result = await suggestImagePrompt(sanitized, c.env);
    return c.json(result);
  } catch (err: any) {
    console.error('Error suggesting prompt:', err);
    return c.json(
      {
        prompt:
          'Lalbaugcha Raja Lord Ganesha golden idol, illuminated oil lamps, fresh marigold flowers, soft volumetric golden hour morning rays, luxury spiritual photography',
      },
      200
    );
  }
});

// Primary Card Generation Endpoint
app.post('/api/generate', async (c) => {
  try {
    const body = await c.req.json<CardRequest>();

    if (!body.occasion || !body.sceneId || !OCCASIONS[body.occasion]) {
      return c.json({ error: 'Invalid request: a known occasion and a sceneId are mandatory' }, 400);
    }

    const sanitized: CardRequest = {
      ...body,
      sceneId: String(body.sceneId).slice(0, 64),
      customTitle: clampText(body.customTitle, TEXT_LIMITS.customTitle),
      customQuote: clampText(body.customQuote, TEXT_LIMITS.customQuote),
      customSubtitle: clampText(body.customSubtitle, TEXT_LIMITS.customSubtitle),
      recipientName: clampText(body.recipientName, TEXT_LIMITS.recipientName),
      senderName: clampText(body.senderName, TEXT_LIMITS.senderName),
      customImagePrompt: clampText(body.customImagePrompt, TEXT_LIMITS.customImagePrompt),
    };

    const cardId = `wish_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 1. Generate or fetch AI Background Art
    const background = await generateBackgroundArt(sanitized, c.env);

    // 2. Render Edge Vector Card with Dynamic Multi-script Typography & RTL support
    const svgContent = generateCardSvg({
      request: sanitized,
      bgDataUrl: background.base64DataUrl,
    });

    // 3. Persist to Storage (R2 / Edge Cache)
    const imageUrl = await saveCardImage(cardId, svgContent, c.env);

    const occasionDef = OCCASIONS[sanitized.occasion] || OCCASIONS.good_morning;
    const lang = sanitized.language || 'en';
    const title =
      sanitized.customTitle ||
      occasionDef.defaultTitle[lang] ||
      occasionDef.defaultTitle.en ||
      occasionDef.label;

    const quote =
      sanitized.customQuote ||
      occasionDef.sampleQuotes[lang]?.[0] ||
      occasionDef.sampleQuotes.en?.[0] ||
      'Wishing you peace and joy.';

    const responseData: CardResponse = {
      id: cardId,
      imageUrl,
      svgContent,
      promptUsed: background.promptUsed,
      occasion: sanitized.occasion,
      sceneId: sanitized.sceneId,
      sphere: sanitized.sphere,
      backgroundMode: sanitized.backgroundMode || 'preset',
      recipientName: sanitized.recipientName,
      senderName: sanitized.senderName,
      quote,
      title,
      subtitle: sanitized.customSubtitle || '✨ WISHING YOU JOY, PEACE & BLESSINGS ✨',
      textAlignment: sanitized.textAlignment || 'center',
      textSize: sanitized.textSize || 'standard',
      foilAccent: sanitized.foilAccent || 'gold',
      createdAt: new Date().toISOString(),
      aspectRatio: '4:5',
      fromCache: background.isMock,
    };

    return c.json(responseData);
  } catch (error: any) {
    console.error('Error generating wishing card:', error);
    return c.json(
      {
        error: 'Failed to generate card',
        message: error?.message || 'Internal server error',
      },
      500
    );
  }
});

// Image serving endpoint with CDN caching headers
app.get('/api/images/:key', async (c) => {
  const key = c.req.param('key');

  // Only serve SVG cards this API itself generates.
  if (!/^wish_[0-9]+_[a-z0-9]+\.svg$/i.test(key)) {
    return c.text('Image not found', 404);
  }

  const image = await getCardImage(key, c.env);

  if (!image) {
    return c.text('Image not found', 404);
  }

  return new Response(image.content, {
    headers: {
      'Content-Type': image.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      // Intentionally open like a CDN edge: these are public, immutable,
      // generated assets and third-party embeds fetch them cross-origin.
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy':
        "default-src 'none'; img-src 'self' data:; font-src 'self' data: https://fonts.gstatic.com; style-src 'unsafe-inline' https://fonts.googleapis.com",
    },
  });
});

export default app;
