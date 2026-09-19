import {
  CardRequest,
  Env,
  AiMessageRequest,
  AiMessageResponse,
  AiPromptSuggestRequest,
  AiPromptSuggestResponse,
  Language,
} from '../types';
import { SCENES, GLOBAL_NEGATIVE_PROMPT, OCCASIONS } from '../templates/scenes';

export interface BackgroundResult {
  base64DataUrl: string;
  promptUsed: string;
  isMock: boolean;
  isCustomAi: boolean;
}

export function buildDynamicPrompt(request: CardRequest): string {
  // If user provided a custom prompt, use it as the core subject
  if (request.customImagePrompt && request.customImagePrompt.trim()) {
    const userPrompt = request.customImagePrompt.trim();
    const qualityTags =
      'exquisite fine art composition, clean spacious central third for luxury typography, volumetric soft rays, subtle ambient bokeh, elegant fine art color grading, highly detailed 8k masterwork';
    return `${userPrompt}, ${qualityTags}`;
  }

  const occasion = OCCASIONS[request.occasion] || OCCASIONS.good_morning;
  const scene = SCENES[request.sceneId] || occasion.scenes[0] || SCENES.gm_sunrise;

  const baseModifier = scene.promptModifier;
  const occasionContext = `theme of ${occasion.label}`;
  const qualityTags =
    'exquisite photographic composition, clean uncluttered central third for typography, volumetric soft rays, subtle ambient bokeh, elegant fine art color grading, highly detailed 8k masterwork';

  return `${baseModifier}, ${occasionContext}, ${qualityTags}`;
}

export async function generateBackgroundArt(
  request: CardRequest,
  env: Env
): Promise<BackgroundResult> {
  const occasion = OCCASIONS[request.occasion] || OCCASIONS.good_morning;
  const scene = SCENES[request.sceneId] || occasion.scenes[0] || SCENES.gm_sunrise;

  // 1. FAST PATH: Preset Static Scene (0ms, Zero GPU Compute)
  if (request.backgroundMode !== 'custom_prompt' && !request.customImagePrompt?.trim()) {
    const promptUsed = `Curated static scene: ${scene.label}`;
    const staticUrl = scene.previewImage || `/scenes/${scene.id}.jpg`;
    return {
      base64DataUrl: staticUrl,
      promptUsed,
      isMock: false,
      isCustomAi: false,
    };
  }

  // 2. PROMPT-DRIVEN PATH: Cloudflare Workers AI Neural Diffusion
  const isUltraHd = request.qualityMode === 'ultra_hd';
  const model = isUltraHd
    ? env.HD_MODEL || '@cf/stabilityai/stable-diffusion-xl-base-1.0'
    : env.DEFAULT_MODEL || '@cf/bytedance/stable-diffusion-xl-lightning';

  const fullPrompt = buildDynamicPrompt(request);
  const numSteps = isUltraHd ? 20 : 4;
  const width = 1024;
  const height = 1280; // Standard 4:5 mobile portrait aspect ratio

  // Direct Cloudflare Workers AI Binding (env.AI)
  if (env.AI) {
    try {
      console.info(`[Cloudflare Workers AI] Generating custom prompt with ${model} (${numSteps} steps)`);
      const response = await env.AI.run(model, {
        prompt: fullPrompt,
        negative_prompt: GLOBAL_NEGATIVE_PROMPT,
        num_steps: numSteps,
        width,
        height,
      });

      let buffer: ArrayBuffer;
      if (response instanceof ArrayBuffer) {
        buffer = response;
      } else if (response instanceof Uint8Array) {
        buffer = response.buffer as ArrayBuffer;
      } else if (response && typeof (response as any).arrayBuffer === 'function') {
        buffer = await (response as any).arrayBuffer();
      } else {
        const stream = response as ReadableStream;
        const reader = stream.getReader();
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }
        const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
        const merged = new Uint8Array(totalLen);
        let offset = 0;
        for (const c of chunks) {
          merged.set(c, offset);
          offset += c.length;
        }
        buffer = merged.buffer;
      }

      const base64 = uint8ArrayToBase64(new Uint8Array(buffer));
      return {
        base64DataUrl: `data:image/png;base64,${base64}`,
        promptUsed: fullPrompt,
        isMock: false,
        isCustomAi: true,
      };
    } catch (aiError: any) {
      console.warn(`[Cloudflare Workers AI] Binding call failed:`, aiError?.message);
    }
  }

  // Fallback for local preview
  const staticUrl = scene.previewImage || `/scenes/${scene.id}.jpg`;
  return {
    base64DataUrl: staticUrl,
    promptUsed: fullPrompt,
    isMock: true,
    isCustomAi: true,
  };
}



/**
 * Cloudflare Workers AI (Llama 3.1 8B) Greeting Message Generator
 */
export async function generateAiMessage(
  req: AiMessageRequest,
  env: Env
): Promise<AiMessageResponse> {
  const occasion = OCCASIONS[req.occasion] || OCCASIONS.good_morning;
  const lang: Language = req.language || 'en';
  const tone = req.tone || 'devotional';
  const recipient = req.recipientName?.trim() || '';
  const sender = req.senderName?.trim() || '';
  const randomSeed = req.seed || Math.floor(Math.random() * 100000);

  const toneInstructions: Record<string, string> = {
    devotional: 'Sacred, reverent, and spiritual blessings, invoking divine grace, peace, and sacred mantras/shlokas.',
    poetic: 'Lyrical, artistic, and deeply expressive rhythm with elegant metaphors and heartfelt warmth.',
    cheerful: 'Joyful, lively, warm, and uplifting wishes filled with smiles, sunshine, and celebration.',
    formal: 'Dignified, respectful, professional, and gracious well-wishes suitable for elders or colleagues.',
  };

  const scriptNames: Record<string, string> = {
    mr: 'Marathi language (मराठी)',
    hi: 'Hindi language (हिन्दी)',
    gu: 'Gujarati language (ગુજરાતી)',
    pa: 'Punjabi language (ਪੰਜਾਬੀ)',
    te: 'Telugu language (తెలుగు)',
    ta: 'Tamil language (தமிழ்)',
    bn: 'Bengali language (বাংলা)',
    hinglish: 'Hinglish (Hindi written in English alphabets)',
    en: 'English language',
    es: 'Spanish language (Español)',
    pt: 'Portuguese language (Português)',
    ar: 'Arabic language (العربية)',
    fr: 'French language (Français)',
    de: 'German language (Deutsch)',
    it: 'Italian language (Italiano)',
    ja: 'Japanese language (日本語)',
    ko: 'Korean language (한국어)',
    zh: 'Chinese language (中文)',
  };

  const targetLang = scriptNames[lang] || `${lang} language`;

  const toneGuidanceMap: Record<string, string> = {
    devotional: 'Sacred blessings, divine grace, spiritual peace',
    poetic: 'Lyrical, rhyming, metaphorical, artistic',
    cheerful: 'Warm, joyful, energetic, smiling celebration',
    formal: 'Respectful, polite, dignified best wishes',
  };
  const selectedToneGuidance = toneGuidanceMap[tone] || 'Warm and auspicious blessings';

  // 1. Try Cloudflare Workers AI Llama 3.1 8B Multilingual LLM
  if (env.AI) {
    try {
      const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are an expert cultural poet. Write personalized greeting cards in ${targetLang}. Write ONLY in authentic ${targetLang}. Never include English notes, filler, or placeholders.<|eot_id|><|start_header_id|>user<|end_header_id|>
Write a ${tone} greeting wish for "${occasion.label}" in ${targetLang}.${recipient ? ` Recipient: ${recipient}.` : ''}${sender ? ` Sender: ${sender}.` : ''}

Format your response strictly as:
TITLE: <Short festive title in ${targetLang}>
MESSAGE: <1 to 2 lines of ${tone} wish in ${targetLang}>
SIGN_OFF: <Short sign-off blessing in ${targetLang}><|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

      const response: any = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        prompt,
        max_tokens: 180,
        temperature: 0.85,
      });

      const raw = (response?.response || (typeof response === 'string' ? response : '')).trim();

      let header = '';
      let quote = '';
      let trailer = '';

      const titleMatch = raw.match(/(?:^\s*(?:\d+[\.\)]|\*\*|\*|#)?\s*(?:TITLE|HEADER)\s*(?:\*\*|\*)?:\s*)([^\n\r]+)/im);
      const messageMatch = raw.match(/(?:^\s*(?:\d+[\.\)]|\*\*|\*|#)?\s*(?:MESSAGE|QUOTE|BODY)\s*(?:\*\*|\*)?:\s*)([\s\S]+?)(?=\n\s*(?:\d+[\.\)]|\*\*|\*|#)?\s*(?:SIGN_OFF|TRAILER|FOOTER|TITLE|HEADER|NOTE|---)|$)/im);
      const signOffMatch = raw.match(/(?:^\s*(?:\d+[\.\)]|\*\*|\*|#)?\s*(?:SIGN_OFF|TRAILER|FOOTER)\s*(?:\*\*|\*)?:\s*)([^\n\r]+)/im);

      if (titleMatch && messageMatch) {
        header = titleMatch[1].trim();
        quote = messageMatch[1].trim();
        trailer = signOffMatch ? signOffMatch[1].trim() : '✨ WISHING YOU BLESSINGS ✨';
      } else {
        const lines = raw
          .split('\n')
          .map((l: string) => l.replace(/^(?:(?:\d+[\.\)]|\*\*|\*|#)?\s*(?:TITLE|HEADER|MESSAGE|QUOTE|BODY|SIGN_OFF|TRAILER|FOOTER)\s*(?:\*\*|\*)?:\s*)/i, '').trim())
          .filter((l: string) => l.length > 0 && !l.startsWith('---') && !l.startsWith('**') && !l.startsWith('#') && !l.startsWith('=') && !l.toLowerCase().startsWith('note'));

        if (lines.length >= 2) {
          header = lines[0];
          quote = lines.slice(1, 3).join(' ');
          trailer = lines[3] || '✨ WISHING YOU JOY & BLESSINGS ✨';
        }
      }

      // Cut off any conversational notes appended by LLM
      const stripNotes = (text: string) =>
        text.split(/\n(?:\*\*Note|Note|Please note|\(Note|Example:|---|\[)/i)[0].trim();

      header = stripNotes(header).replace(/^["'`*#=]+|["'`*#=]+$/g, '').trim();
      quote = stripNotes(quote).replace(/^["'`*#=]+|["'`*#=]+$/g, '').trim();
      trailer = stripNotes(trailer).replace(/^["'`*#=]+|["'`*#=]+$/g, '').trim();

      // Script-matching validation: ensure generated text is in the requested alphabet
      const scriptRegexMap: Record<string, RegExp> = {
        mr: /[\u0900-\u097F]/,
        hi: /[\u0900-\u097F]/,
        gu: /[\u0A80-\u0AFF]/,
        pa: /[\u0A00-\u0A7F]/,
        te: /[\u0C00-\u0C7F]/,
        ta: /[\u0B80-\u0BFF]/,
        bn: /[\u0980-\u09FF]/,
        ar: /[\u0600-\u06FF]/,
        ja: /[\u3040-\u30FF\u4E00-\u9FAF]/,
        ko: /[\uAC00-\uD7AF]/,
        zh: /[\u4E00-\u9FFF]/,
      };

      const requiredRegex = scriptRegexMap[lang];
      const matchesRequiredScript = !requiredRegex || (requiredRegex.test(header) && requiredRegex.test(quote));

      const containsJunk = (text: string) => {
        const lower = text.toLowerCase();
        return (
          text.includes('\uFFFD') ||
          text.includes('') ||
          lower.includes('missing seed') ||
          lower.includes('variation seed') ||
          lower.includes('here is') ||
          lower.includes("here's") ||
          text.includes('[') ||
          text.includes(']') ||
          text.includes('<') ||
          text.includes('>')
        );
      };

      if (
        header &&
        quote &&
        quote.length > 8 &&
        !containsJunk(header) &&
        !containsJunk(quote) &&
        matchesRequiredScript
      ) {
        return {
          header,
          quote,
          trailer: trailer && !containsJunk(trailer) ? trailer : '✨ WISHING YOU JOY, PEACE & BLESSINGS ✨',
        };
      }
    } catch (err: any) {
      console.warn('[Cloudflare Workers AI Llama 3.1 8B] Message generation error:', err?.message);
    }
  }

  // 2. Resilient Tone-Aware Template Library
  const TONE_POOLS: Record<string, Record<string, Record<string, { headers: string[]; quotes: string[]; trailers: string[] }>>> = {
    ganesh_chaturthi: {
      devotional: {
        mr: {
          headers: ['गणेशोत्सवाच्या मंगलमय शुभेच्छा', 'श्री गणेशाय नमः', 'विघ्नहर्त्या चरणी नमन'],
          quotes: [
            'गणरायाच्या चरणी नतमस्तक होऊन आपणास व आपल्या परिवारास सुख, समृद्धी आणि उत्तम आरोग्य लाभो हीच प्रार्थना. गणपती बाप्पा मोरया!',
            'विघ्नहर्त्या गणरायाच्या कृपेने आपल्या आयुष्यातील सर्व विघ्न दूर होवोत आणि सदा मंगल होवो. मंगलमूर्ती मोरया!',
            'बाप्पाच्या पवित्र चरणी वंदन! आपल्या घरात सुख, शांती आणि ऐश्वर्याचा अखंड वास राहो.',
          ],
          trailers: ['✨ मंगलमूर्ती मोरया ✨', '🙏 चरणी नतमस्तक 🙏', '✨ गणपती बाप्पा मोरया ✨'],
        },
        hi: {
          headers: ['गणेश चतुर्थी की हार्दिक शुभकामनाएं', 'श्री गणेशाय नमः', 'जय गणपति बप्पा'],
          quotes: [
            'भगवान श्री गणेश आपके जीवन से सभी विघ्न-बाधाओं को दूर करें और सुख, शांति एवं समृद्धि प्रदान करें। गणपति बप्पा मोरया!',
            'रिद्धि-सिद्धि के दाता भगवान गणेश जी का आशीर्वाद आप और आपके परिवार पर सदा बना रहे।',
          ],
          trailers: ['✨ गणपति बप्पा मोरया ✨', '🙏 सस्नेह नमन 🙏', '✨ शुभ गणेशोत्सव ✨'],
        },
        en: {
          headers: ['Blessed Ganesh Chaturthi', 'Divine Blessings of Ganesha', 'Holy Ganesh Utsav'],
          quotes: [
            'May the divine grace of Lord Ganesha illuminate your soul with wisdom, peace, and eternal devotion. Ganpati Bappa Morya!',
            'Praying that the remover of obstacles clears every hurdle on your path and blesses your home with peace and grace.',
          ],
          trailers: ['✨ GANPATI BAPPA MORYA ✨', '🙏 WITH DEVOTIONAL REVERENCE 🙏', '✨ DIVINE BLESSINGS ✨'],
        },
      },
      poetic: {
        mr: {
          headers: ['बाप्पाचे आगमन', 'उत्सव सौख्याचा', 'गोडवा सणाचा'],
          quotes: [
            'मोदकांचा गोडवा, दुर्वांची हिरवळ, बाप्पाच्या आगमनाने आनंदली अवघी सृष्टी सकल! गणेशोत्सवाच्या हार्दिक शुभेच्छा.',
            'सोनियाच्या पावलांनी गणपती आले घरी, आनंद आणि सौख्याची घेऊन नवलाई सारी! बाप्पा मोरया.',
            'सजले मखर, उजळल्या दाही दिशा, बाप्पाच्या आगमनाने पूर्ण व्हावी प्रत्येक मनीची आशा!',
          ],
          trailers: ['🌸 सस्नेह सदिच्छा 🌸', '🌸 आनंदी उत्सव 🌸', '✨ बाप्पा मोरया ✨'],
        },
        hi: {
          headers: ['सज गया दरबार', 'बप्पा का आगमन', 'खुशियों का उत्सव'],
          quotes: [
            'दीपों की ज्योति संग बाप्पा का प्यार, खुशियों से भर जाए आपका संसार! गणेश चतुर्थी की हार्दिक शुभकामनाएं।',
            'रिद्धि-सिद्धि संग विराजे लंबोदर प्यारे, महक उठे जीवन आपके आंगन के द्वारे। मंगलमय गणेशोत्सव!',
          ],
          trailers: ['🌸 सस्नेह शुभकामनाएं 🌸', '🌸 उत्सव उमंग 🌸', '✨ जय श्री गणेश ✨'],
        },
        en: {
          headers: ['A Symphony of Blessings', 'Golden Petals of Joy', 'Melody of Devotion'],
          quotes: [
            'Like morning dew on sacred lotus leaves, may Ganeshas blessings gently fall upon your heart and home.',
            'With every sacred chime of temple bells and sweet fragrance of marigolds, may your days rhyme with endless joy.',
          ],
          trailers: ['🌸 WITH HEARTFELT WARMTH 🌸', '🌸 CELESTIAL BLESSINGS 🌸', '✨ JOY & HARMONY ✨'],
        },
      },
      cheerful: {
        mr: {
          headers: ['जल्लोष बाप्पाचा!', 'धमाल गणेशोत्सव!', 'आनंदाचा सण!'],
          quotes: [
            'बाप्पाच्या आगमनाने घराघरात आनंद आणि जल्लोष! तुम्हाला व तुमच्या परिवाराला गणेशोत्सवाच्या खूप खूप उत्साही शुभेच्छा!',
            'ढोल-ताशांच्या गजरात आणि गुलालाच्या रंगात बाप्पाचे स्वागत करूया! उत्सव आनंदाचा, जल्लोष बाप्पाच्या मोरयाचा!',
          ],
          trailers: ['🎉 जल्लोषमय शुभेच्छा 🎉', '☕ उदंड आनंद ☕', '🎉 गणपती बाप्पा मोरया 🎉'],
        },
        hi: {
          headers: ['बप्पा का त्योहार!', 'धूमधाम गणेशोत्सव!', 'उमंग और उल्लास!'],
          quotes: [
            'ढोल-नगाड़ों की थाप पर बप्पा का स्वागत करें! आपके चेहरे पर हमेशा मुस्कान खिली रहे। हैप्पी गणेश चतुर्थी!',
            'उमंग, उत्साह और मोदक की मिठास से भरपूर गणेश चतुर्थी की ढेरों खुशहाल शुभकामनाएं!',
          ],
          trailers: ['🎉 ढेरों खुशियां 🎉', '☕ मुस्कुराहटें सदा ☕', '🎉 हैप्पी गणेशोत्सव 🎉'],
        },
        en: {
          headers: ['Joyful Ganesh Festival!', 'Sweet Celebrations!', 'Festive Cheers!'],
          quotes: [
            'Wishing you a bright, energetic, and joyful celebration filled with delicious modaks, laughter, and cheer!',
            'May the festive dhol-tasha beats and sweet blessings of Bappa bring endless smiles to you and your loved ones!',
          ],
          trailers: ['🎉 FESTIVE CHEERS & SMILES 🎉', '☕ SWEET BLESSINGS ☕', '🎉 HAPPY GANESHOTSAV 🎉'],
        },
      },
      formal: {
        mr: {
          headers: ['गणेशोत्सवाच्या सस्नेह सदिच्छा', 'मंगलमय शुभेच्छा', 'आदरपूर्वक नमस्कार'],
          quotes: [
            'गणेशोत्सवाच्या या पावन पर्वावर आपणास व आपल्या कुटुंबीयांस हार्दिक सदिच्छा. आपणास सुख, समृद्धी व दीर्घायुष्य लाभो हीच सदिच्छा.',
            'श्रीगणेश चतुर्थीच्या पवित्र दिनी आपणास सस्नेह नमस्कार. आपल्या सर्व कार्यक्षेत्रात निरंतर यश आणि प्रगती लाभो.',
          ],
          trailers: ['🤝 सस्नेह नमस्कार 🤝', '🤝 आदरपूर्वक सदिच्छा 🤝', '✨ हार्दिक सदिच्छा ✨'],
        },
        hi: {
          headers: ['गणेश चतुर्थी की सस्नेह शुभकामनाएं', 'सादर प्रणाम एवं सदिच्छा', 'पावन पर्व की बधाई'],
          quotes: [
            'गणेश चतुर्थी के पावन अवसर पर आपको एवं आपके परिवार को सादर एवं हार्दिक शुभकामनाएं। सुख एवं समृद्धि की कामना सहित।',
            'भगवान गणेश की कृपा से आपका कार्यक्षेत्र एवं परिवार सदा प्रगतिशील और सम्मानित रहे। सादर प्रणाम।',
          ],
          trailers: ['🤝 सादर प्रणाम 🤝', '🤝 सस्नेह शुभकामनाएं 🤝', '✨ सविनय सदिच्छा ✨'],
        },
        en: {
          headers: ['Warm Greetings on Ganesh Chaturthi', 'Respectful Best Wishes', 'Auspicious Greetings'],
          quotes: [
            'Wishing you and your esteemed family a blessed, prosperous, and joyous Ganesh Chaturthi. May success accompany all your endeavors.',
            'On this auspicious occasion of Ganesh Chaturthi, please accept my heartfelt regards and sincere wishes for your continued happiness and good health.',
          ],
          trailers: ['🤝 WITH WARM REGARDS 🤝', '🤝 SINCERE BEST WISHES 🤝', '✨ ESTEEMED GREETINGS ✨'],
        },
      },
    },
    diwali: {
      devotional: {
        mr: {
          headers: ['दिवाळीच्या मंगलमय शुभेच्छा', 'लक्ष्मीपूजनाच्या सदिच्छा', 'शुभ दीपावली'],
          quotes: [
            'माता महालक्ष्मी आणि विघ्नहर्ता गणरायाच्या कृपेने आपल्या घरात सुख, शांती आणि ऐश्वर्याचा अखंड वास राहो. शुभ दीपावली!',
            'तेजस्वी दिव्यांच्या प्रकाशाने आपल्या जीवनातील सर्व अंधकार दूर होवो आणि मांगल्याचा प्रकाश पडो. पावन दिवाळीच्या शुभेच्छा!',
          ],
          trailers: ['✨ शुभ दीपावली ✨', '🙏 महालक्ष्मी कृपा 🙏', '✨ मंगलमय दीपपर्व ✨'],
        },
        hi: {
          headers: ['शुभ दीपावली', 'महालक्ष्मी कृपा', 'दीपावली की हार्दिक शुभकामनाएं'],
          quotes: [
            'मां लक्ष्मी और भगवान गणेश का आशीर्वाद आपके घर-परिवार पर सदा बना रहे। सुख, शांति और समृद्धि से परिपूर्ण दीपावली की शुभकामनाएं!',
            'जगमगाते दीपों का यह पावन पर्व आपके जीवन को सुख, स्वास्थ्य और ऐश्वर्य से आलोकित करे।',
          ],
          trailers: ['✨ शुभ दीपावली ✨', '🙏 महालक्ष्मी नमन 🙏', '✨ जय मां लक्ष्मी ✨'],
        },
        en: {
          headers: ['Auspicious Deepavali', 'Divine Light of Diwali', 'Blessed Deepotsav'],
          quotes: [
            'May Goddess Lakshmi and Lord Ganesha shower your home with eternal peace, prosperity, and divine radiance this Diwali.',
            'May the sacred light of thousand diyas dispel all darkness and illuminate your heart with wisdom and grace.',
          ],
          trailers: ['✨ BLESSED DIWALI ✨', '🙏 DIVINE RADIANCE 🙏', '✨ HAPPY DEEPAVALI ✨'],
        },
      },
      poetic: {
        mr: {
          headers: ['दीपोत्सवाचा आनंद', 'उजळली दाही दिशा', 'सोनियाची दिवाळी'],
          quotes: [
            'रांगोळीच्या सप्तरंगात, दिव्यांच्या मंद प्रकाशात, उजळून निघो तुमचे आयुष्य सुखाच्या गोड सहवासात! दीपावलीच्या हार्दिक शुभेच्छा.',
            'उटण्याचा सुगंध, रांगोळीची आरास, दिव्यांची लखलख अन् फराळाचा सुवास! आनंदमयी दिवाळीच्या मनःपूर्वक शुभेच्छा.',
          ],
          trailers: ['🌸 सस्नेह सदिच्छा 🌸', '🌸 आनंदी दीपोत्सव 🌸', '✨ शुभ दीपावली ✨'],
        },
        hi: {
          headers: ['दीपों का त्योहार', 'रोशन हो संसार', 'खुशियों की दीवाली'],
          quotes: [
            'दीपों की जगमगाहट, पटाखों की गूंज, खुशियों की मिठास संग महके आपकी हर एक सांझ! शुभ दीपावली।',
            'रंगोली के रंग, अपनों का संग, आपके जीवन में भर जाए हर रोज नई उमंग! शुभ दीपावली।',
          ],
          trailers: ['🌸 सस्नेह शुभकामनाएं 🌸', '🌸 जगमगाती दीपावली 🌸', '✨ शुभ दीपोत्सव ✨'],
        },
        en: {
          headers: ['Festival of Lights', 'Radiance & Joy', 'Glow of Celebration'],
          quotes: [
            'May the golden glow of diyas and vibrant hues of rangoli fill your life with poetry, harmony, and joy.',
            'As millions of lanterns illuminate the night, may hope and happiness sparkle in every corner of your world.',
          ],
          trailers: ['🌸 WARMTH & RADIANCE 🌸', '🌸 SPARKLE & JOY 🌸', '✨ HAPPY DIWALI ✨'],
        },
      },
      cheerful: {
        mr: {
          headers: ['धमाल दिवाळी!', 'फराळाचा आनंद!', 'जल्लोष दीपोत्सवाचा!'],
          quotes: [
            'कडक लाडू, कुरकुरीत चकली आणि खमंग चिवडा! फराळाच्या गोडव्यासह तुम्हाला व तुमच्या परिवाराला दिवाळीच्या खूप खूप उत्साही शुभेच्छा!',
            'फटाक्यांची आतषबाजी आणि दिव्यांची रोषणाई! या दिवाळीत भरपूर आनंद आणि धमाल करा!',
          ],
          trailers: ['🎉 धमाल दिवाळी 🎉', '☕ गोड गोड सदिच्छा ☕', '🎉 हॅपी दिवाळी 🎉'],
        },
        hi: {
          headers: ['धूमधड़ाका दीवाली!', 'मिठाइयों की मिठास!', 'हैप्पी दीवाली!'],
          quotes: [
            'मिठाइयों की मिठास और पटाखों की रौनक! आपको और आपके परिवार को दीवाली की बहुत-बहुत खुशहाल और मजेदार शुभकामनाएं!',
            'खूब खाओ मिठाई, खूब जलाओ दीप! इस दीवाली आपकी हर मुराद पूरी हो जाए!',
          ],
          trailers: ['🎉 हैप्पी दीवाली 🎉', '☕ ढेर सारी खुशियां ☕', '🎉 शुभ दीपावली 🎉'],
        },
        en: {
          headers: ['Sparkling Diwali!', 'Sweet Celebrations!', 'Joyous Deepavali!'],
          quotes: [
            'Wishing you a sparkling, sweet, and fun-filled Diwali packed with delicious treats, crackers, and big smiles!',
            'May your Diwali be as bright as the sparklers and as sweet as the box of festive mithai!',
          ],
          trailers: ['🎉 SPARKLES & SMILES 🎉', '☕ SWEET CELEBRATIONS ☕', '🎉 HAPPY DIWALI 🎉'],
        },
      },
      formal: {
        mr: {
          headers: ['दीपावलीच्या मनःपूर्वक सदिच्छा', 'दीपावलीच्या मंगलमय शुभेच्छा', 'सस्नेह नमस्कार'],
          quotes: [
            'दीपावलीच्या या मंगल पर्वावर आपणास व आपल्या परिवारास मनःपूर्वक सदिच्छा. हे नवीन वर्ष आपल्यासाठी भरभराटीचे व यशाचे जावो हीच सदिच्छा.',
            'दीपावलीच्या पावन दिनी सस्नेह नमस्कार. आपल्या उद्योग व कार्यक्षेत्रात अखंड यश आणि प्रगती लाभो हीच प्रार्थना.',
          ],
          trailers: ['🤝 सस्नेह सदिच्छा 🤝', '🤝 आदरपूर्वक नमस्कार 🤝', '✨ शुभ दीपावली ✨'],
        },
        hi: {
          headers: ['दीपावली की हार्दिक शुभकामनाएं', 'सस्नेह नमस्कार एवं सदिच्छा', 'शुभ दीपावली'],
          quotes: [
            'दीपावली के इस पावन पर्व पर आपको एवं आपके परिवार को हार्दिक शुभकामनाएं। आने वाला वर्ष आपके लिए समृद्धि और सफलता से परिपूर्ण हो।',
            'दीपावली के पावन अवसर पर सादर प्रणाम। आपके व्यवसाय एवं कार्यक्षेत्र में निरंतर प्रगति और यश की मंगलकामनाएं।',
          ],
          trailers: ['🤝 सादर प्रणाम 🤝', '🤝 सस्नेह शुभकामनाएं 🤝', '✨ शुभ दीपोत्सव ✨'],
        },
        en: {
          headers: ['Warm Greetings on Deepavali', 'Heartiest Diwali Wishes', 'Season\'s Greetings'],
          quotes: [
            'Wishing you and your esteemed family a joyous and prosperous Deepavali. May the festive season bring lasting success and prosperity.',
            'On the auspicious occasion of Diwali, please accept our sincere wishes for peace, good health, and continued accomplishment.',
          ],
          trailers: ['🤝 WITH WARM REGARDS 🤝', '🤝 SINCERE BEST WISHES 🤝', '✨ PROSPEROUS DIWALI ✨'],
        },
      },
    },
    good_morning: {
      devotional: {
        mr: {
          headers: ['शुभ प्रभात — हरी ॐ', 'प्रभात वंदन', 'श्रीकृष्ण चरणी नमन'],
          quotes: [
            'प्रभातसमयी देवाच्या चरणी नतमस्तक होऊन प्रार्थना, तुमचा आजचा दिवस सुख, समाधान आणि सकारात्मक ऊर्जेने भरलेला जावो. शुभ प्रभात!',
            'गोड सकाळच्या सुंदर शुभेच्छा! भगवंताच्या कृपेने आपल्या सर्व इच्छा पूर्ण होवोत. जय श्री कृष्ण!',
          ],
          trailers: ['✨ शुभ प्रभात ✨', '🙏 हरी ॐ तत्सत् 🙏', '✨ जय श्री कृष्ण ✨'],
        },
        hi: {
          headers: ['प्रभात वंदन', 'जय श्री कृष्ण', 'शुभ प्रभात'],
          quotes: [
            'सुबह की पहली किरण के साथ ईश्वर के चरणों में नमन। आपका आज का दिन मंगलमय, सुखद और शांतिपूर्ण हो। जय श्री राधे कृष्णा!',
            'ईश्वर की कृपा और आशीर्वाद सदा आप और आपके परिवार पर बनी रहे। शुभ प्रभात!',
          ],
          trailers: ['✨ शुभ प्रभात ✨', '🙏 जय श्री कृष्ण 🙏', '✨ प्रभात वंदन ✨'],
        },
        en: {
          headers: ['Sacred Dawn Blessings', 'Peaceful Morning Blessings', 'Divine Sunrise Grace'],
          quotes: [
            'May the gentle dawn remind you of divine grace and fill your heart with inner stillness, gratitude, and peace.',
            'Waking up with prayer and faith. May divine blessings guide your footsteps throughout this beautiful day.',
          ],
          trailers: ['✨ PEACEFUL DAWN ✨', '🙏 DIVINE GRACE 🙏', '✨ BLESSED MORNING ✨'],
        },
      },
      poetic: {
        mr: {
          headers: ['सोनेरी सकाळ', 'सुंदर प्रभात', 'रम्य पहाट'],
          quotes: [
            'सोनेरी किरणांची कोवळी माया, आकाशात रंगांची सुंदर छाया! प्रसन्न मनाने सुरू होवो तुमचा प्रत्येक क्षण, शुभ प्रभात!',
            'पहाटेची मंजुळ गाणी, पानांवरील दवबिंदूंचे पाणी! तुमचा दिवस आनंदाच्या सुरांनी बहरावा हीच सदिच्छा.',
          ],
          trailers: ['🌸 प्रसन्न प्रभात 🌸', '🌸 सोनेरी सदिच्छा 🌸', '✨ शुभ सकाळ ✨'],
        },
        hi: {
          headers: ['सुनहरी सुबह', 'रौशन नया सवेरा', 'मधुर प्रभात'],
          quotes: [
            'सूरज की पहली किरण संग महक उठा चमन, खुशियों की सौगात लाए आपका हर एक क्षण! शुभ प्रभात।',
            'तारों की विदाई संग आया नया उजाला, हर पल में महके खुशियों का प्याला! शुभ प्रभात।',
          ],
          trailers: ['🌸 मधुर सवेरा 🌸', '🌸 खिलती मुस्कान 🌸', '✨ शुभ प्रभात ✨'],
        },
        en: {
          headers: ['Golden Morning Melody', 'Whispers of Dawn', 'A Symphony of Light'],
          quotes: [
            'As the morning sun paints the sky in shades of amber and rose, may your spirit awaken to infinite possibilities.',
            'Like the gentle morning dew upon blooming petals, may quiet joy rest upon your soul today.',
          ],
          trailers: ['🌸 WITH POETIC WARMTH 🌸', '🌸 GOLDEN DAWN 🌸', '✨ BEAUTIFUL DAY ✨'],
        },
      },
      cheerful: {
        mr: {
          headers: ['मस्त सकाळ!', 'उत्साही शुभ प्रभात!', 'हसतमुख प्रभात!'],
          quotes: [
            'गरमागरम वाफाळलेला चहा आणि चेहऱ्यावर गोड हास्य! तुमचा आजचा दिवस नव्या उत्साहाने आणि यशाने भरून जावो. गुड मॉर्निंग!',
            'एक नवी सकाळ, नवा उत्साह आणि नवी स्वप्ने! चला, दिवस खास बनवूया! मस्त मजेत राहा!',
          ],
          trailers: ['☕ वाफाळलेला चहा & हास्य ☕', '🎉 उत्साही सकाळ 🎉', '☀️ हॅपी मॉर्निंग ☀️'],
        },
        hi: {
          headers: ['चाय की चुस्की संग सुबह!', 'उत्साह भरा सवेरा!', 'गुड मॉर्निंग!'],
          quotes: [
            'गरमा-गरम कड़क चाय और चेहरे पर प्यारी सी मुस्कान! आपका दिन ऊर्जा, उमंग और खुशियों से भरा रहे। गुड मॉर्निंग!',
            'नया दिन, नई उमंग और ढेर सारी सफलताएं! खिलखिलाते रहिए और दिन का आनंद लीजिए!',
          ],
          trailers: ['☕ कड़क चाय & मुस्कान ☕', '🎉 शानदार दिन 🎉', '☀️ गुड मॉर्निंग ☀️'],
        },
        en: {
          headers: ['Rise & Shine!', 'Bright & Cheerful Morning!', 'Sunny Greetings!'],
          quotes: [
            'Grab your favorite cup of chai, put a big smile on your face, and conquer this wonderful day with energy and joy!',
            'May your coffee be strong, your smile be bright, and your day be filled with delightful surprises!',
          ],
          trailers: ['☕ STEAMING CHAI & SMILES ☕', '🎉 RISE & SHINE 🎉', '☀️ HAVE A GREAT DAY ☀️'],
        },
      },
      formal: {
        mr: {
          headers: ['सस्नेह शुभ प्रभात', 'प्रभात वंदन', 'आदरपूर्वक नमस्कार'],
          quotes: [
            'नवीन दिवसाच्या सुरुवातीस आपणास सस्नेह नमस्कार. आपला आजचा दिवस फलदायी, आरोग्यदायी व यशस्वी जावो हीच मनःपूर्वक सदिच्छा.',
            'प्रभात समयी आदरपूर्वक शुभेच्छा. आपल्या सर्व नियोजित कार्यात निरंतर यश लाभो ही सदिच्छा.',
          ],
          trailers: ['🤝 सस्नेह नमस्कार 🤝', '🤝 आदरपूर्वक सदिच्छा 🤝', '✨ शुभ प्रभात ✨'],
        },
        hi: {
          headers: ['सादर प्रभात वंदन', 'सस्नेह शुभ प्रभात', 'शुभकामनाएं'],
          quotes: [
            'एक नए दिन के शुभारंभ पर आपको सादर प्रणाम। आपका दिन उत्पादक, सुखद और सफलता से परिपूर्ण रहे।',
            'प्रभात वंदन। आशा है कि आपका दिन उत्तम स्वास्थ्य, शांति और कार्यकुशलता से भरा रहेगा।',
          ],
          trailers: ['🤝 सादर प्रणाम 🤝', '🤝 सस्नेह शुभकामनाएं 🤝', '✨ मंगलमय दिन ✨'],
        },
        en: {
          headers: ['Good Morning & Best Wishes', 'Pleasant Morning Greetings', 'Warm Professional Regards'],
          quotes: [
            'Wishing you a pleasant, productive, and highly fulfilling day ahead. May your endeavors meet with great success.',
            'Sending warm morning greetings and best wishes for a fruitful and accomplished day.',
          ],
          trailers: ['🤝 WITH WARM REGARDS 🤝', '🤝 SINCERE BEST WISHES 🤝', '✨ PRODUCTIVE DAY ✨'],
        },
      },
    },
  };

  const occPool = TONE_POOLS[req.occasion];
  const tonePool = occPool?.[tone] || occPool?.devotional;
  const langPool = tonePool?.[lang] || tonePool?.en || tonePool?.mr;

  if (langPool) {
    const header = langPool.headers[Math.floor(Math.random() * langPool.headers.length)];
    const quote = langPool.quotes[Math.floor(Math.random() * langPool.quotes.length)];
    const trailer = langPool.trailers[Math.floor(Math.random() * langPool.trailers.length)];
    return { header, quote, trailer };
  }

  // 3. Fallback from Occasion Definition
  const defaultHeader = occasion.defaultTitle[lang] || occasion.defaultTitle.en || occasion.label;
  const quotesList = occasion.sampleQuotes[lang] || occasion.sampleQuotes.en || ['Wishing you joy, peace and prosperity.'];
  const randomQuote = quotesList[Math.floor(Math.random() * quotesList.length)];

  return {
    header: defaultHeader,
    quote: randomQuote,
    trailer: '✨ WISHING YOU JOY, PEACE & BLESSINGS ✨',
  };
}

/**
 * Context-Aware AI Image Prompt Suggestion Generator (Generates diverse variations on every click)
 */
export async function suggestImagePrompt(
  req: AiPromptSuggestRequest,
  env: Env
): Promise<AiPromptSuggestResponse> {
  const occasion = OCCASIONS[req.occasion] || OCCASIONS.good_morning;
  const sphere = req.sphere || 'south_asia';
  const timeOfDay = req.timeOfDay || 'sunrise';
  const tone = req.tone || 'devotional';

  const visualFocalAngles = [
    'grand royal sanctum with majestic golden ornaments and glowing oil lamps',
    'eco-friendly celebration with fresh yellow-orange marigold garlands and sacred offerings',
    'atmospheric twilight celebration illuminated by thousands of candle lanterns and bokeh sparkles',
    'sacred morning aarti at sunrise with incense smoke curling in golden sunbeams',
    'panoramic scenic landscape with golden volumetric sunlight breaking through soft morning mist',
    'intricate artistic floral peacock rangoli on marble floor surrounded by floating water diyas',
    'close-up fine-art composition with rich velvet background and warm golden cinematic lighting',
    'serene nature backdrop with blooming flowers, tranquil water reflection, and peaceful dawn rays',
  ];

  const chosenFocus = visualFocalAngles[Math.floor(Math.random() * visualFocalAngles.length)];
  const randomSeed = req.seed || Math.floor(Math.random() * 100000);

    try {
      const promptReq = `You are a photographic prompt generator. Write a single-sentence visual description for a greeting card scene.
Occasion: ${occasion.label}
Cultural Region: ${sphere}
Time of Day / Atmosphere: ${timeOfDay}
Visual Focus: ${chosenFocus}
Mood: ${tone}
Variation Seed: ${randomSeed}

RULES:
- Return ONLY the image description.
- Under 35 words.
- NO introductory filler (NEVER say "Here is", "Here's", "Sure", etc.).
- NO conversational notes, commentary, or placeholders.`;

      const response: any = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
        prompt: promptReq,
        max_tokens: 80,
        temperature: 0.75,
      });

      let raw = (response?.response || (typeof response === 'string' ? response : '')).trim();

      // Extract quoted prompt if model returned quotes
      const quoteMatch = raw.match(/"([^"\n\r]{15,})"/);
      if (quoteMatch) {
        raw = quoteMatch[1];
      } else {
        // Strip common conversational preambles
        raw = raw.replace(/^(?:here(?:'s|\s+is)?(?:\s+(?:a|the|your))?(?:\s+sample|\s+scene|\s+description|\s+prompt)?\s*[:\-\.]?\s*)/i, '');
        // Strip trailing notes, parentheses, brackets, or markdown lines
        raw = raw.split(/\n(?:\*\*Note|Note|Please note|\(Note|Example:|---|\[|Awaiting)/i)[0].trim();
        // Remove trailing parenthetical remarks
        raw = raw.replace(/\s*\([^)]*\)\s*$/, '').trim();
        raw = raw.replace(/^["'`*#=]+|["'`*#=]+$/g, '').trim();
      }

      // Ensure prompt is substantive and does not contain conversation/placeholder junk
      const isJunk =
        raw.toLowerCase().includes('awaiting your') ||
        raw.toLowerCase().includes('your response') ||
        raw.toLowerCase().includes('format your response') ||
        raw.includes('[') ||
        raw.includes(']');

      if (raw && raw.length >= 18 && !isJunk && raw !== req.currentPrompt) {
        return { prompt: raw };
      }
    } catch (err: any) {
      console.warn('[Cloudflare Workers AI Llama 3.2] Prompt suggestion error:', err?.message);
    }

  // 2. Multi-Variation Fallback Pool (Always provides a different prompt on repeat clicks)
  const multiPresets: Record<string, string[]> = {
    ganesh_chaturthi: [
      'Lalbaugcha Raja royal Lord Ganesha idol with ornate golden crown, red velvet curtains, glowing brass oil lamps, fresh marigold garlands, warm devotional volumetric illumination',
      'eco-friendly clay Ganpati Bappa with fresh yellow orange marigold garland, sacred durva grass, silver plate of modaks, warm festive morning dawn light',
      'sacred Hindu temple sanctum sanctorum, morning aarti with brass bells, incense smoke, glowing diyas, divine Ganesha murti, warm cinematic spiritual lighting',
      'radiant golden Lord Ganesha sculpture, glowing brass oil lamps, red hibiscus and yellow marigold flowers, soft warm ambient temple glow',
      'festive home mandap decorated with fresh flower strings, brass samai lamps with dancing flames, modak sweets, and Lord Ganesha blessing posture',
    ],
    diwali: [
      'grand royal Indian palace courtyard during Diwali Deepotsav illuminated by thousands of glowing golden terracotta diyas and candle lanterns, vibrant peacock flower rangoli',
      'rows of traditional terracotta brass diyas with flickering golden flames, fresh orange marigold flower garlands, festive warmth, clean spacious center',
      'vibrant peacock floral rangoli on marble floor, surrounded by glowing floating diya bowls and sparkle lights, festive Diwali celebration',
      'Goddess Lakshmi and Lord Ganesha divine golden blessings, lotus flower throne, falling gold coins, warm sacred incense glow',
      'festive evening courtyard under starry sky with warm fairy lights, glittering lanterns, and golden sparkles',
    ],
    navratri: [
      'radiant Goddess Durga golden divine aura holding sacred trishul, lion mount, surrounded by blooming pink lotus flowers and festive incense smoke',
      'traditional vibrant Garba Dandiya Raas celebration night, festive ethnic attire, bokeh fairy lights, joyful festive atmosphere',
      'sacred Durga Puja pandal with golden dhunuchi smoke, grand brass bells, and devotional night aarti illumination',
    ],
    good_morning: [
      'breathtaking mountain valley sunrise with golden sunbeams breaking through soft morning mist, serene lake reflection, lush green pine trees',
      'authentic Indian steaming masala chai tea in traditional terracotta clay kulhad cup on rustic wooden veranda, gentle morning dawn light',
      'divine Lord Shri Krishna celestial silhouette with golden bansuri flute and iridescent peacock feather mor pankh, ethereal sacred golden aura',
      'majestic snow-capped Mount Fuji framed by blooming pink cherry blossom sakura branches during soft morning dawn, pastel pink sky',
      'gorgeous field of blooming golden sunflowers reaching toward a radiant tropical sunrise with warm amber glow',
      'chic Parisian café outdoor marble table with fresh golden flaky croissant and artisan coffee in porcelain cup, soft golden morning light',
    ],
    birthday: [
      'luxury artisanal multi-tier celebration birthday cake with warm flickering golden candles, champagne bokeh sparkles, dark velvet table setup',
      'festive birthday celebration setting with golden balloons, sparkling confetti, and glowing fairy lights',
      'gourmet chocolate birthday cake decorated with 24k edible gold leaf and warm candlelight glow',
    ],
    new_year: [
      'spectacular midnight golden fireworks exploding over modern metropolis skyline with river water reflections, celebration of New Year',
      'luxury festive champagne flutes, golden confetti, sparkling bokeh lights, celebration of New Year, warm elegant glowing atmosphere',
      'peaceful snow-covered winter forest with golden first dawn sunrise of the brand new year',
    ],
    motivation: [
      'inspirational silhouette of a climber on mountain summit reaching the peak at dawn, majestic golden sunburst horizon breaking through clouds',
      'lone path leading through a majestic misty forest toward a radiant glowing sunrise, inspiring determination',
      'mighty eagle soaring above golden sunlit mountain peaks at sunrise, symbolizing success and freedom',
    ],
    spiritual: [
      'serene sacred temple courtyard at dawn, morning aarti with glowing brass lamps, soft incense smoke curling in golden sunbeams',
      'magical twilight night with glowing golden crescent moon floating in deep indigo sky above a silhouetted Arabian mosque skyline',
      'peaceful lotus pond at sunrise with dew drops, soft golden morning light, and tranquil zen atmosphere',
    ],
  };

  const pool = multiPresets[req.occasion] || multiPresets.good_morning;
  const filteredPool = pool.filter((p) => p !== req.currentPrompt);
  const selectedPool = filteredPool.length > 0 ? filteredPool : pool;
  const selected = selectedPool[Math.floor(Math.random() * selectedPool.length)];

  return { prompt: selected };
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
