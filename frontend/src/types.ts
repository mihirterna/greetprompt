export type OccasionId =
  | 'good_morning'
  | 'ganesh_chaturthi'
  | 'diwali'
  | 'navratri'
  | 'birthday'
  | 'anniversary'
  | 'new_year'
  | 'festival'
  | 'spiritual'
  | 'motivation'
  | 'thank_you'
  | 'custom';

export type CulturalSphere =
  | 'global'
  | 'south_asia'
  | 'latin_america'
  | 'middle_east'
  | 'east_asia'
  | 'europe'
  | 'africa';

export type Region = 'IN' | 'GLOBAL';

export type Language =
  | 'en'
  | 'es'
  | 'pt'
  | 'ar'
  | 'tr'
  | 'ja'
  | 'ko'
  | 'zh'
  | 'id'
  | 'fr'
  | 'de'
  | 'it'
  | 'sw'
  | 'hi'
  | 'mr'
  | 'gu'
  | 'pa'
  | 'te'
  | 'ta'
  | 'bn'
  | 'hinglish';

export interface LanguageInfo {
  id: Language;
  label: string;
  nativeLabel: string;
  fontFamily: string;
  isRtl?: boolean;
}

export interface CulturalSphereInfo {
  id: CulturalSphere;
  label: string;
  flag: string;
  description: string;
  defaultLanguage: Language;
  languages: Language[];
}

export type QualityMode = 'lightning' | 'ultra_hd';
export type AspectRatio = '4:5';
export type BackgroundMode = 'preset' | 'custom_prompt';
export type TextAlignment = 'center' | 'left' | 'right';
export type TextSize = 'compact' | 'standard' | 'grand';
export type FoilAccent = 'gold' | 'rose_gold' | 'silver';
export type MessageTone = 'devotional' | 'poetic' | 'cheerful' | 'formal';
export type TimeOfDay = 'sunrise' | 'morning' | 'sunset' | 'night';

export interface SceneDefinition {
  id: string;
  label: string;
  description: string;
  icon: string;
  previewImage?: string;
  promptModifier: string;
  sphere?: CulturalSphere | 'all';
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    goldGradient: [string, string, string];
    scrimOverlay: string;
    textColor: string;
  };
}

export interface OccasionDefinition {
  id: OccasionId;
  label: string;
  icon: string;
  category: 'daily' | 'celebration' | 'festival' | 'mindset';
  defaultTitle: Record<string, string>;
  scenes: SceneDefinition[];
  sampleQuotes: Record<string, string[]>;
  recipientSuggestions: Array<{ label: string; en: string; native?: string }>;
}

export interface CardRequest {
  occasion: OccasionId;
  sceneId: string;
  sphere?: CulturalSphere;
  backgroundMode?: BackgroundMode;
  customImagePrompt?: string;
  recipientName?: string;
  senderName?: string;
  language?: Language;
  customTitle?: string;
  customQuote?: string;
  customSubtitle?: string;
  textAlignment?: TextAlignment;
  textSize?: TextSize;
  foilAccent?: FoilAccent;
  qualityMode?: QualityMode;
  aspectRatio?: AspectRatio;
}

export interface CardResponse {
  id: string;
  imageUrl?: string;
  svgContent: string;
  promptUsed: string;
  occasion: OccasionId;
  sceneId: string;
  sphere?: CulturalSphere;
  backgroundMode: BackgroundMode;
  recipientName?: string;
  senderName?: string;
  quote: string;
  title: string;
  subtitle?: string;
  textAlignment: TextAlignment;
  textSize: TextSize;
  foilAccent: FoilAccent;
  createdAt: string;
  aspectRatio: AspectRatio;
  fromCache: boolean;
}

export interface AiMessageRequest {
  occasion: OccasionId;
  language?: Language;
  tone?: MessageTone;
  recipientName?: string;
  senderName?: string;
  sphere?: CulturalSphere;
  seed?: number;
}

export interface AiMessageResponse {
  header: string;
  quote: string;
  trailer: string;
}

export interface AiPromptSuggestRequest {
  occasion: OccasionId;
  sphere?: CulturalSphere;
  timeOfDay?: TimeOfDay;
  tone?: MessageTone;
  currentPrompt?: string;
  seed?: number;
}

export interface AiPromptSuggestResponse {
  prompt: string;
}
