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
} from './types';
import { OCCASIONS, SCENES, ALL_LANGUAGES, CULTURAL_SPHERES } from './templates/scenes';
import { generateBackgroundArt, generateAiMessage, suggestImagePrompt } from './services/ai';
import { generateCardSvg } from './services/textOverlay';
import { saveCardImage, getCardImage } from './services/storage';

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for all frontend origins
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

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

// AI Debug Endpoint
app.get('/api/test-ai-raw', async (c) => {
  const model = c.req.query('model') || '@cf/meta/llama-3.2-3b-instruct';
  try {
    const res: any = await c.env.AI.run(model, {
      prompt: 'Write a 2-line devotional greeting for Ganesh Chaturthi in English.',
      max_tokens: 100,
    });
    return c.json({ success: true, model, res });
  } catch (err: any) {
    return c.json({ success: false, model, error: err?.message });
  }
});

// AI Greeting Message Generation (Llama 3.1 8B)
app.post('/api/ai/message', async (c) => {
  try {
    const body = await c.req.json<AiMessageRequest>();
    const result = await generateAiMessage(body, c.env);
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
    const result = await suggestImagePrompt(body, c.env);
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

    if (!body.occasion || !body.sceneId) {
      return c.json({ error: 'Missing required fields: occasion and sceneId are mandatory' }, 400);
    }

    const cardId = `wish_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 1. Generate or fetch AI Background Art
    const background = await generateBackgroundArt(body, c.env);

    // 2. Render Edge Vector Card with Dynamic Multi-script Typography & RTL support
    const svgContent = generateCardSvg({
      request: body,
      bgDataUrl: background.base64DataUrl,
    });

    // 3. Persist to Storage (R2 / Edge Cache)
    const imageUrl = await saveCardImage(cardId, svgContent, c.env);

    const occasionDef = OCCASIONS[body.occasion] || OCCASIONS.good_morning;
    const lang = body.language || 'en';
    const title =
      body.customTitle ||
      occasionDef.defaultTitle[lang] ||
      occasionDef.defaultTitle.en ||
      occasionDef.label;

    const quote =
      body.customQuote ||
      occasionDef.sampleQuotes[lang]?.[0] ||
      occasionDef.sampleQuotes.en?.[0] ||
      'Wishing you peace and joy.';

    const responseData: CardResponse = {
      id: cardId,
      imageUrl,
      svgContent,
      promptUsed: background.promptUsed,
      occasion: body.occasion,
      sceneId: body.sceneId,
      sphere: body.sphere,
      backgroundMode: body.backgroundMode || 'preset',
      recipientName: body.recipientName,
      senderName: body.senderName,
      quote,
      title,
      subtitle: body.customSubtitle || '✨ WISHING YOU JOY, PEACE & BLESSINGS ✨',
      textAlignment: body.textAlignment || 'center',
      textSize: body.textSize || 'standard',
      foilAccent: body.foilAccent || 'gold',
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
  const image = await getCardImage(key, c.env);

  if (!image) {
    return c.text('Image not found', 404);
  }

  return new Response(image.content, {
    headers: {
      'Content-Type': image.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  });
});

export default app;
