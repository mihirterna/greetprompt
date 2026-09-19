import { OccasionId, CulturalSphere } from '../types';

interface SemanticBranch {
  triggers: string[];
  variations: Array<{
    keywords: string[];
    suffix: string;
  }>;
  defaultSuffix: string;
}

const SEMANTIC_BRANCHES: SemanticBranch[] = [
  // 1. Krishna / Devotional
  {
    triggers: ['krishna', 'kanha', 'govinda', 'gopal', 'radha krishna', 'shri krishna', 'shree krishna'],
    variations: [
      {
        keywords: ['chariot', 'rath', 'kurukshetra', 'war', 'battlefield', 'arjuna'],
        suffix: ' in the epic battlefield of Kurukshetra with divine golden rays and celestial conch shell, 8k fine art',
      },
      {
        keywords: ['butter', 'makhan', 'pot', 'matka', 'eating', 'eating butter'],
        suffix: ' from a traditional clay pot in Gokul with divine childlike aura and morning sunlight, fine art painting',
      },
      {
        keywords: ['radha', 'barsana', 'swings', 'jhula'],
        suffix: ' under the blossoming Kalpavriksha tree in soft celestial golden hour rays with peacocks, 8k render',
      },
      {
        keywords: ['cows', 'cow', 'gau', 'pasture', 'grazing', 'forest'],
        suffix: ' surrounded by holy cows in lush green Vrindavan pastures at dawn with golden sunbeams',
      },
      {
        keywords: ['dancing', 'ras', 'raas', 'river', 'yamuna'],
        suffix: ' on the serene banks of river Yamuna in divine moonlight with blooming white lotus flowers',
      },
      {
        keywords: ['flute', 'bansuri', 'playing'],
        suffix: ' in holy Vrindavan blooming garden at dawn with glowing peacock feather and gentle mist',
      },
    ],
    defaultSuffix: ' playing a celestial golden bansuri flute in Vrindavan blooming garden at dawn with glowing peacock feather',
  },

  // 2. Ganesha
  {
    triggers: ['ganesha', 'ganpati', 'vinayaka', 'vighnaharta'],
    variations: [
      {
        keywords: ['lotus', 'sitting', 'throne', 'seated'],
        suffix: ' seated on a glowing sacred pink lotus with divine golden morning aura and fresh modak offerings',
      },
      {
        keywords: ['temple', 'aarti', 'pooja', 'diya'],
        suffix: ' inside a grand ancient stone temple surrounded by glowing brass oil lamps and marigold garlands',
      },
    ],
    defaultSuffix: ' with divine golden aura, holding sacred lotus and modak in gentle morning sunlight, 8k devotional art',
  },

  // 3. Shiva
  {
    triggers: ['shiva', 'mahadev', 'bholenath', 'shankar', 'kailash', 'trishul'],
    variations: [
      {
        keywords: ['meditation', 'meditating', 'dhyan', 'samadhi', 'sitting'],
        suffix: ' in deep peaceful meditation on Mount Kailash under a starry cosmic twilight sky with crescent moon',
      },
      {
        keywords: ['ganga', 'river', 'waterfall'],
        suffix: ' with sacred holy river Ganga descending through flowing matted hair against glowing sunrise peaks',
      },
    ],
    defaultSuffix: ' in serene meditation on snowy mountain peak with trishul and glowing crescent moon aura, 8k fine art',
  },

  // 4. Tea / Coffee
  {
    triggers: ['chai', 'tea', 'coffee', 'espresso', 'latte', 'cappuccino', 'kulhad'],
    variations: [
      {
        keywords: ['balcony', 'veranda', 'porch', 'terrace', 'window'],
        suffix: ' on a rustic wooden veranda overlooking misty green mountain valleys in soft morning sunbeams',
      },
      {
        keywords: ['cafe', 'paris', 'bistro', 'croissant', 'marble'],
        suffix: ' with a fresh golden buttery croissant on outdoor marble bistro table in morning sunlight',
      },
      {
        keywords: ['book', 'reading', 'cozy', 'table'],
        suffix: ' beside an open book and fresh white jasmine flowers on dark rustic wooden table, cozy morning light',
      },
    ],
    defaultSuffix: ' steaming in a terracotta clay kulhad on dark rustic wooden table with gentle morning sunbeams and mist',
  },

  // 5. Birthday Cake
  {
    triggers: ['cake', 'birthday', 'pastry', 'cupcake', 'celebration'],
    variations: [
      {
        keywords: ['chocolate', 'gold', 'tier', 'luxury'],
        suffix: ' decorated with 24k gold leaf foil, delicate berries, and glowing golden candles against dark velvet backdrop',
      },
      {
        keywords: ['balloon', 'confetti', 'party'],
        suffix: ' in front of a pastel balloon arch with gold confetti explosion and champagne sparkles bokeh',
      },
      {
        keywords: ['matcha', 'sakura', 'japanese'],
        suffix: ' decorated with edible pink sakura cherry blossoms and delicate matcha powder on dark slate',
      },
    ],
    defaultSuffix: ' gourmet multi-tier luxury cake with glowing warm golden candles and champagne sparkles bokeh, studio photography',
  },

  // 6. Mountains & Climber
  {
    triggers: ['mountain', 'peak', 'climber', 'hiker', 'summit', 'fuji', 'alps', 'himalaya'],
    variations: [
      {
        keywords: ['climber', 'hiker', 'explorer', 'standing'],
        suffix: ' standing triumphant atop the summit at sunrise with volumetric golden sunbeams breaking through clouds',
      },
      {
        keywords: ['fuji', 'sakura', 'cherry blossom', 'japan'],
        suffix: ' framed by blooming pink cherry blossom sakura branches over tranquil lake reflection during soft dawn',
      },
      {
        keywords: ['lake', 'water', 'reflection'],
        suffix: ' reflecting in crystal-clear alpine lake surrounded by emerald pine trees in morning mist',
      },
    ],
    defaultSuffix: ' majestic snow-covered peaks glowing in early morning alpenglow golden sunlight with tranquil lake reflection',
  },

  // 7. Diyas & Lanterns
  {
    triggers: ['diya', 'diyas', 'lantern', 'lanterns', 'lamp', 'lamps', 'candle', 'candles', 'rangoli'],
    variations: [
      {
        keywords: ['rangoli', 'marigold', 'flower'],
        suffix: ' arranged around vibrant peacock marigold flower rangoli on royal dark velvet floor, festive warm bokeh',
      },
      {
        keywords: ['floating', 'water', 'pond', 'river'],
        suffix: ' floating gently on a sacred lotus pond at twilight with golden dancing flame reflections, 8k render',
      },
      {
        keywords: ['arabic', 'fanous', 'moroccan', 'mosque'],
        suffix: ' casting intricate geometric arabesque light patterns on dark velvet backdrop, magical festive night',
      },
    ],
    defaultSuffix: ' glowing with warm dancing golden flames and soft festive sparkles bokeh, rich elegant ambiance',
  },

  // 8. Animals & Wildlife
  {
    triggers: ['peacock', 'bird', 'lion', 'elephant', 'dog', 'cat', 'retriever'],
    variations: [
      {
        keywords: ['peacock', 'mor', 'feather'],
        suffix: ' with vibrant iridescent plumage displayed under blooming royal mango tree in morning golden light',
      },
      {
        keywords: ['dog', 'retriever', 'puppy'],
        suffix: ' wearing a festive party hat beside a birthday cake with pastel balloons and warm golden bokeh',
      },
      {
        keywords: ['lion', 'safari', 'savanna', 'acacia'],
        suffix: ' resting peacefully under flat-top acacia tree during radiant orange sunrise in the Serengeti',
      },
    ],
    defaultSuffix: ' in tranquil natural habitat bathed in golden hour sunrise rays with soft atmospheric depth, 8k photography',
  },

  // 9. Vehicles & Rustic Scenes
  {
    triggers: ['bicycle', 'bike', 'scooter', 'vespa', 'car', 'boat', 'canoe', 'cabin'],
    variations: [
      {
        keywords: ['beach', 'sea', 'ocean', 'coast', 'sand'],
        suffix: ' parked on golden sand dunes overlooking turquoise ocean waves in warm sunset light',
      },
      {
        keywords: ['basket', 'flowers', 'vintage'],
        suffix: ' with a wicker basket full of fresh colorful blooming flowers parked against rustic cobblestone wall at dawn',
      },
      {
        keywords: ['cabin', 'woods', 'forest'],
        suffix: ' with smoke curling gently from the chimney surrounded by pine trees in soft golden sunrise mist',
      },
    ],
    defaultSuffix: ' parked beside blooming lavender flowers in soft golden morning sunlight on quaint European path',
  },
];

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper: Calculate exact word-boundary suffix overlap
function calculateSuffixOverlap(input: string, targetSuffix: string): string {
  const cleanTarget = targetSuffix.trim();
  const lowerTarget = cleanTarget.toLowerCase();
  const lowerInput = input.toLowerCase().trim();

  // If input already contains the full target suffix, nothing left
  if (lowerInput.endsWith(lowerTarget)) {
    return '';
  }

  // 1. Check if the target begins with the exact end of input (character match)
  for (let c = Math.min(lowerInput.length, lowerTarget.length); c >= 2; c--) {
    const endChunk = lowerInput.substring(lowerInput.length - c);
    if (lowerTarget.startsWith(endChunk)) {
      const remaining = cleanTarget.substring(c);
      if (remaining.trim()) {
        return (remaining.startsWith(' ') || remaining.startsWith(',') ? '' : ' ') + remaining.trimStart();
      }
      return '';
    }
  }

  // 2. Check whole-word matches on word boundaries from the end of input
  const words = lowerInput.split(/\s+/);
  for (let len = Math.min(words.length, 4); len >= 1; len--) {
    const endPhrase = words.slice(-len).join(' ');
    // Match only full words with regex \b
    const regex = new RegExp(`\\b${escapeRegex(endPhrase)}\\b`, 'i');
    const match = regex.exec(lowerTarget);
    if (match && match.index !== undefined) {
      const remaining = cleanTarget.substring(match.index + endPhrase.length);
      if (remaining.trim()) {
        return (remaining.startsWith(' ') || remaining.startsWith(',') ? '' : ' ') + remaining.trimStart();
      }
      return '';
    }
  }

  // Return full suffix cleanly with space prefix if needed
  return (cleanTarget.startsWith(' ') || cleanTarget.startsWith(',') ? '' : ' ') + cleanTarget;
}

// Universal Contextual Suffix
function getUniversalContextSuffix(
  userInput: string,
  occasion: OccasionId = 'good_morning',
  sphere: CulturalSphere = 'global'
): string {
  const lower = userInput.toLowerCase().trim();

  // Don't append if user already wrote detailed photographic modifiers
  if (
    lower.includes('8k') ||
    lower.includes('photograph') ||
    lower.includes('volumetric') ||
    lower.includes('masterpiece') ||
    lower.includes('cinematic')
  ) {
    return '';
  }

  // Preposition endings (in, on, at, with, under, near, by)
  if (/\b(in|on|at|with|under|near|by|beside|across|over)\s*$/i.test(userInput)) {
    if (occasion === 'good_morning' || occasion === 'motivation') {
      return ' soft golden morning sunrise rays and gentle mist, 8k fine art photography';
    }
    if (occasion === 'birthday' || occasion === 'anniversary' || occasion === 'festival') {
      return ' sparkling champagne bokeh and festive warm lighting, 8k studio photography';
    }
    if (occasion === 'spiritual' || occasion === 'diwali') {
      return ' glowing brass oil lamps and divine celestial aura at twilight, 8k render';
    }
    return ' soft golden atmospheric lighting and serene natural background, 8k photography';
  }

  if (occasion === 'good_morning') {
    if (sphere === 'south_asia') {
      return ' bathed in soft golden morning sunbeams and sacred dawn mist, 8k devotional photography';
    }
    if (sphere === 'east_asia') {
      return ' in soft morning dawn light with delicate cherry blossom petals and peaceful mist';
    }
    if (sphere === 'europe') {
      return ' in soft golden morning sunlight on quaint European street, elegant lifestyle photography';
    }
    return ' bathed in radiant golden morning sunrise rays with soft atmospheric mist, 8k photography';
  }

  if (occasion === 'birthday' || occasion === 'anniversary' || occasion === 'festival') {
    return ' decorated with luxury 24k gold foil accents, festive confetti sparkles, and warm bokeh';
  }

  if (occasion === 'spiritual' || occasion === 'diwali') {
    return ' illuminated by warm glowing brass lanterns under a starry cosmic twilight sky';
  }

  if (occasion === 'motivation') {
    return ' illuminated by dramatic golden volumetric sunbeams breaking through morning clouds';
  }

  return ' bathed in warm golden ambient lighting with elegant depth of field, 8k fine art';
}

/**
 * 100% In-Browser Real-Time Dynamic Copilot Prediction
 */
export function predictPromptCompletion(
  userInput: string,
  occasion: OccasionId = 'good_morning',
  sphere: CulturalSphere = 'global'
): string {
  const cleanInput = userInput.trim();
  if (!cleanInput || cleanInput.length < 2) {
    return '';
  }

  const lowerInput = cleanInput.toLowerCase();

  // 1. DYNAMIC SEMANTIC MATCHING
  for (const branch of SEMANTIC_BRANCHES) {
    const hasTrigger = branch.triggers.some((t) => lowerInput.includes(t));
    if (hasTrigger) {
      // Find most specific variation
      for (const variation of branch.variations) {
        const hasKeyword = variation.keywords.some((k) => lowerInput.includes(k));
        if (hasKeyword) {
          return calculateSuffixOverlap(cleanInput, variation.suffix);
        }
      }

      // If user typed only the trigger, return default suffix with overlap calculation
      return calculateSuffixOverlap(cleanInput, branch.defaultSuffix);
    }
  }

  // 2. UNIVERSAL FALLBACK FOR ARBITRARY NOVEL PROMPTS
  return calculateSuffixOverlap(cleanInput, getUniversalContextSuffix(cleanInput, occasion, sphere));
}
