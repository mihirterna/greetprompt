import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AccordionStep } from './components/AccordionStep';
import { OccasionPicker } from './components/OccasionPicker';
import { ScenePicker } from './components/ScenePicker';
import { RecipientPicker } from './components/RecipientPicker';
import { QuotePicker } from './components/QuotePicker';
import { CardPreview } from './components/CardPreview';
import { InstallAppBanner } from './components/InstallAppBanner';
import type {
  CardRequest,
  CardResponse,
  OccasionDefinition,
  OccasionId,
  CulturalSphere,
  CulturalSphereInfo,
  Language,
  LanguageInfo,
  QualityMode,
  BackgroundMode,
} from './types';

const DEFAULT_SPHERES: CulturalSphereInfo[] = [
  {
    id: 'south_asia',
    label: 'India & South Asia',
    flag: '🇮🇳',
    description: 'Festivals, Krishna, Chai, Diyas, Devanagari & Indic scripts',
    defaultLanguage: 'hi',
    languages: ['hi', 'mr', 'gu', 'pa', 'te', 'ta', 'bn', 'en', 'hinglish'],
  },
  {
    id: 'global',
    label: 'Global & Worldwide',
    flag: '🌐',
    description: 'Universal modern aesthetics, English & Spanish greetings',
    defaultLanguage: 'en',
    languages: ['en', 'es', 'fr', 'de', 'it'],
  },
  {
    id: 'latin_america',
    label: 'Latin America & Iberia',
    flag: '💃',
    description: 'Vibrant tropical scenes, fiesta, sunflowers, Español & Português',
    defaultLanguage: 'es',
    languages: ['es', 'pt', 'en'],
  },
  {
    id: 'middle_east',
    label: 'Middle East & Arab World',
    flag: '🕌',
    description: 'Arabian Dallah, Crescent Moon, Fanous, Arabic RTL calligraphy',
    defaultLanguage: 'ar',
    languages: ['ar', 'tr', 'en', 'fr'],
  },
  {
    id: 'east_asia',
    label: 'East & Southeast Asia',
    flag: '🌸',
    description: 'Mount Fuji, Cherry Blossoms, Zen gardens, Japanese, Korean & Chinese',
    defaultLanguage: 'ja',
    languages: ['ja', 'ko', 'zh', 'id', 'en'],
  },
  {
    id: 'europe',
    label: 'Europe & UK',
    flag: '🏰',
    description: 'Parisian cafés, Swiss Alps, Tuscan sunsets, French, German & Italian',
    defaultLanguage: 'fr',
    languages: ['fr', 'de', 'it', 'en', 'es'],
  },
  {
    id: 'africa',
    label: 'Africa & Safari',
    flag: '🌍',
    description: 'Serengeti sunrise, Kilimanjaro, African warmth, Swahili & English',
    defaultLanguage: 'en',
    languages: ['en', 'sw', 'fr'],
  },
];

const DEFAULT_LANGUAGES: LanguageInfo[] = [
  { id: 'mr', label: 'Marathi', nativeLabel: 'मराठी', fontFamily: "'Rozha One', 'Yatra One', sans-serif" },
  { id: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', fontFamily: "'Rozha One', 'Yatra One', sans-serif" },
  { id: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી', fontFamily: "'Anek Gujarati', serif" },
  { id: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ', fontFamily: "'Anek Gurmukhi', sans-serif" },
  { id: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', fontFamily: "'Anek Telugu', sans-serif" },
  { id: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', fontFamily: "'Anek Tamil', sans-serif" },
  { id: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', fontFamily: "'Anek Bangla', sans-serif" },
  { id: 'en', label: 'English', nativeLabel: 'English', fontFamily: "'Cinzel', 'Playfair Display', serif" },
  { id: 'hinglish', label: 'Hinglish', nativeLabel: 'Hinglish', fontFamily: "'Poppins', sans-serif" },
  { id: 'es', label: 'Spanish', nativeLabel: 'Español', fontFamily: "'Playfair Display', serif" },
  { id: 'pt', label: 'Portuguese', nativeLabel: 'Português', fontFamily: "'Playfair Display', serif" },
  { id: 'ar', label: 'Arabic', nativeLabel: 'العربية', fontFamily: "'Amiri', 'Cairo', serif", isRtl: true },
  { id: 'ja', label: 'Japanese', nativeLabel: '日本語', fontFamily: "'Noto Serif JP', serif" },
  { id: 'ko', label: 'Korean', nativeLabel: '한국어', fontFamily: "'Noto Serif KR', serif" },
  { id: 'zh', label: 'Chinese', nativeLabel: '简体中文', fontFamily: "'Noto Serif SC', serif" },
  { id: 'fr', label: 'French', nativeLabel: 'Français', fontFamily: "'Playfair Display', serif" },
  { id: 'de', label: 'German', nativeLabel: 'Deutsch', fontFamily: "'Playfair Display', serif" },
  { id: 'it', label: 'Italian', nativeLabel: 'Italiano', fontFamily: "'Playfair Display', serif" },
  { id: 'sw', label: 'Swahili', nativeLabel: 'Kiswahili', fontFamily: "'Poppins', sans-serif" },
  { id: 'tr', label: 'Turkish', nativeLabel: 'Türkçe', fontFamily: "'Playfair Display', serif" },
  { id: 'id', label: 'Indonesian', nativeLabel: 'Bahasa', fontFamily: "'Poppins', sans-serif" },
];

const INITIAL_OCCASIONS: OccasionDefinition[] = [
  {
    id: 'ganesh_chaturthi',
    label: 'Ganesh Chaturthi',
    icon: '🐘',
    category: 'festival',
    defaultTitle: {
      mr: 'गणेशोत्सवाच्या हार्दिक शुभेच्छा',
      hi: 'गणेश चतुर्थी की हार्दिक शुभकामनाएं',
      gu: 'ગણેશ ચતુર્થીની હાર્દિક શુભેચ્છાઓ',
      pa: 'ਗਣੇਸ਼ ਚਤੁਰਥੀ ਦੀਆਂ ਮੁਬਾਰਕਾਂ',
      te: 'వినాయక చవితి శుభాకాంక్షలు',
      ta: 'விநாயகர் சதுர்த்தி நல்வாழ்த்துகள்',
      bn: 'গণেশ চতুর্থীর শুভেচ্ছা',
      en: 'Happy Ganesh Chaturthi',
      es: '¡Feliz Ganesh Chaturthi!',
    },
    scenes: [
      {
        id: 'ganesha_royal',
        label: 'Royal Darshan',
        description: 'Lalbaugcha Raja grand Lord Ganesha idol with majestic crown',
        icon: '👑',
        previewImage: '/scenes/ganesha_royal.jpg',
        promptModifier: 'Lalbaugcha Raja grand Lord Ganesha idol, majestic golden crown, opulent red velvet backdrop, temple flowers garland',
        sphere: 'south_asia',
        colorPalette: {
          primary: '#FFD700',
          secondary: '#FF8F00',
          accent: '#D32F2F',
          goldGradient: ['#FFFDE7', '#FFD54F', '#C62828'],
          scrimOverlay: 'rgba(25, 4, 4, 0.55)',
          textColor: '#FFFFFF',
        },
      },
      {
        id: 'ganesha_gold',
        label: 'Golden Bappa',
        description: 'Radiant golden Ganesha with glowing temple oil lamps',
        icon: '🪔',
        previewImage: '/scenes/ganesha_gold.jpg',
        promptModifier: 'glowing brass golden Lord Ganesha idol, warm flickering temple oil lamps, red hibiscus flowers',
        sphere: 'south_asia',
        colorPalette: {
          primary: '#FFE082',
          secondary: '#FFB300',
          accent: '#FF6F00',
          goldGradient: ['#FFF8E1', '#FFD54F', '#FF6F00'],
          scrimOverlay: 'rgba(20, 10, 4, 0.52)',
          textColor: '#FFFFFF',
        },
      },
      {
        id: 'ganesha_modak',
        label: 'Clay & Modak',
        description: 'Eco-friendly clay Ganpati with fresh marigolds & steamed modaks',
        icon: '🌺',
        previewImage: '/scenes/ganesha_modak.jpg',
        promptModifier: 'eco friendly clay Ganpati Bappa with fresh yellow orange marigold garland, sacred durva grass, silver plate of modaks',
        sphere: 'south_asia',
        colorPalette: {
          primary: '#FFCA28',
          secondary: '#66BB6A',
          accent: '#FF7043',
          goldGradient: ['#FFF9C4', '#FFD54F', '#388E3C'],
          scrimOverlay: 'rgba(16, 20, 10, 0.50)',
          textColor: '#FFFFFF',
        },
      },
      {
        id: 'ganesha_temple',
        label: 'Temple Aarti',
        description: 'Siddhivinayak morning aarti with sanctum sanctorum bells',
        icon: '🛕',
        previewImage: '/scenes/ganesha_temple.jpg',
        promptModifier: 'sacred Hindu temple sanctum sanctorum, morning aarti with brass bells, incense smoke, divine Ganesha murti',
        sphere: 'south_asia',
        colorPalette: {
          primary: '#FFD54F',
          secondary: '#FF8F00',
          accent: '#FFA000',
          goldGradient: ['#FFF8E1', '#FFCA28', '#E65100'],
          scrimOverlay: 'rgba(24, 12, 4, 0.55)',
          textColor: '#FFFFFF',
        },
      },
    ],
    sampleQuotes: {
      mr: ['वक्रतुंड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥ बाप्पाच्या आगमनाने आपल्या घरात सुख, समृद्धी आणि समाधान लाभो! गणपती बाप्पा मोरया!'],
      hi: ['भगवान श्री गणेश आपके जीवन के सभी विघ्नों को हरें और सुख, शांति व समृद्धि का वरदान दें। गणपति बाप्पा मोरया!'],
      gu: ['ભગવાન શ્રી ગણેશ તમારા જીવનમાં સુખ, શાંતિ અને સમૃદ્ધિ લાવે. ગણેશ ચતુર્થીની હાર્દિક શુભકામનાઓ!'],
      pa: ['ਗਣਪਤੀ ਬੱਪਾ ਤੁਹਾਡੀ ਝੋਲੀ ਖੁਸ਼ੀਆਂ ਨਾਲ ਭਰ ਦੇਣ। ਗਣੇਸ਼ ਚਤੁਰਥੀ ਦੀਆਂ ਮੁਬਾਰਕਾਂ!'],
      te: ['వినాయక చవితి పర్వదినం సందర్భంగా మీకు, మీ కుటుంబ సభ్యులకు హృదయపూర్వక శుభాకాంక్షలు!'],
      ta: ['விநாயகர் சதுர்த்தி நன்னாளில் உங்கள் வாழ்வில் எல்லா வளமும் நலமும் பொங்கட்டும்!'],
      bn: ['ভগবান শ্রী গণেশের আশীর্বাদে আপনার জীবন সুখ, শান্তি ও সমৃদ্ধিতে ভরে উঠুক।'],
      en: ['May Lord Ganesha remove all obstacles from your path and bless your home with peace, happiness, and prosperity! Ganpati Bappa Morya!'],
      es: ['¡Que el Señor Ganesha elimine todos los obstáculos de tu camino y bendiga tu hogar con paz, salud y alegría!'],
    },
    recipientSuggestions: [
      { label: 'Family', en: 'Beloved Family', native: 'परिवार / कुटुंब' },
      { label: 'Friend', en: 'Dear Friend', native: 'मित्र / दोस्त' },
      { label: 'All', en: 'All Devotees', native: 'सर्व गणेशभक्त' },
    ],
  },
  {
    id: 'diwali',
    label: 'Diwali & Deepotsav',
    icon: '🪔',
    category: 'festival',
    defaultTitle: {
      mr: 'शुभ दीपावली',
      hi: 'दीपावली की शुभकामनाएं',
      gu: 'દિવાળીની શુભકામનાઓ',
      pa: 'ਦਿਵਾਲੀ ਮੁਬਾਰਕ',
      te: 'దీపావళి శుభాకాంక్షలు',
      ta: 'தீபாவளி நல்வாழ்த்துகள்',
      bn: 'শুভ দীপাবলি',
      en: 'Happy & Prosperous Diwali',
      es: '¡Feliz Diwali!',
    },
    scenes: [
      {
        id: 'diwali_palace',
        label: 'Palace Courtyard',
        description: 'Grand royal palace courtyard illuminated with thousands of diyas',
        icon: '🏰',
        previewImage: '/scenes/diwali_palace.jpg',
        promptModifier: 'grand royal Indian palace courtyard during Diwali Deepotsav, illuminated by thousands of golden oil lamps',
        sphere: 'south_asia',
        colorPalette: {
          primary: '#FFE082',
          secondary: '#FF8F00',
          accent: '#FF6F00',
          goldGradient: ['#FFF8E1', '#FFD54F', '#FF6F00'],
          scrimOverlay: 'rgba(25, 10, 4, 0.52)',
          textColor: '#FFFFFF',
        },
      },
      {
        id: 'diwali_diyas',
        label: 'Brass Diyas',
        description: 'Rows of traditional terracotta & brass diyas with marigolds',
        icon: '🪔',
        previewImage: '/scenes/diwali_diyas.jpg',
        promptModifier: 'rows of traditional terracotta brass diyas with flickering golden flames, fresh orange marigold garlands',
        sphere: 'south_asia',
        colorPalette: {
          primary: '#FFA000',
          secondary: '#FF6F00',
          accent: '#FFD700',
          goldGradient: ['#FFF8E1', '#FFD54F', '#FF8F00'],
          scrimOverlay: 'rgba(28, 8, 2, 0.55)',
          textColor: '#FFFFFF',
        },
      },
      {
        id: 'diwali_rangoli',
        label: 'Peacock Rangoli',
        description: 'Vibrant peacock floral rangoli with floating candle bowls',
        icon: '🌸',
        previewImage: '/scenes/diwali_rangoli.jpg',
        promptModifier: 'vibrant peacock floral rangoli on marble floor, surrounded by glowing floating diya bowls',
        sphere: 'south_asia',
        colorPalette: {
          primary: '#80DEEA',
          secondary: '#FF4081',
          accent: '#FFD700',
          goldGradient: ['#E0F7FA', '#FF80AB', '#FFD54F'],
          scrimOverlay: 'rgba(16, 6, 24, 0.52)',
          textColor: '#FFFFFF',
        },
      },
      {
        id: 'diwali_lakshmi',
        label: 'Lakshmi Blessings',
        description: 'Maa Lakshmi & Lord Ganesha divine blessings on golden lotus',
        icon: '✨',
        previewImage: '/scenes/diwali_lakshmi.jpg',
        promptModifier: 'Goddess Lakshmi and Lord Ganesha divine golden blessings, lotus flower throne, falling gold coins',
        sphere: 'south_asia',
        colorPalette: {
          primary: '#FFD700',
          secondary: '#FF4081',
          accent: '#FF8F00',
          goldGradient: ['#FFFDE7', '#FF80AB', '#FF6F00'],
          scrimOverlay: 'rgba(22, 6, 12, 0.55)',
          textColor: '#FFFFFF',
        },
      },
    ],
    sampleQuotes: {
      mr: ['दिव्यांचा हा तेजोमय सण आपल्या आयुष्यातील अंधार दूर करून सुख, समृद्धी आणि यशाचा प्रकाश घेऊन येवो. शुभ दीपावली!'],
      hi: ['दीपों का यह पावन पर्व आपके जीवन को प्रकाश, आनंद, उत्तम स्वास्थ्य और अपार वैभव से भर दे। शुभ दीपावली!'],
      gu: ['દિવાળીના શુભ પર્વ પર આપના જીવનમાં સુખ, શાંતિ અને સમૃદ્ધિનો દીપક સદાય પ્રજ્વલિત રહે.'],
      en: ['May the divine glow of Diwali lamps illuminate your path with joy, good health, and boundless prosperity! Happy Diwali!'],
    },
    recipientSuggestions: [
      { label: 'Family', en: 'Beloved Family', native: 'प्रिय परिवार' },
      { label: 'Friends', en: 'Dear Friends', native: 'सर्व मित्रमंडळी' },
    ],
  },
  {
    id: 'navratri',
    label: 'Navratri & Durga',
    icon: '🌸',
    category: 'festival',
    defaultTitle: {
      mr: 'नवरात्रीच्या हार्दिक शुभेच्छा',
      hi: 'शुभ नवरात्रि व दुर्गा पूजा',
      gu: 'નવરાત્રીની હાર્દિક શુભેચ્છાઓ',
      bn: 'শুভ দুর্গাপূজা',
      en: 'Happy Navratri & Durga Puja',
    },
    scenes: [
      {
        id: 'durga_divine',
        label: 'Maa Durga',
        description: 'Maa Durga radiant golden aura with divine trishul & lotus',
        icon: '🦁',
        previewImage: '/scenes/durga_divine.jpg',
        promptModifier: 'Maa Durga radiant divine aura, golden ornaments, holding trishul, lion mount, lotus flowers',
        sphere: 'south_asia',
        colorPalette: {
          primary: '#FF5252',
          secondary: '#FFD700',
          accent: '#FF9100',
          goldGradient: ['#FFEBEE', '#FFD700', '#D50000'],
          scrimOverlay: 'rgba(30, 4, 4, 0.55)',
          textColor: '#FFFFFF',
        },
      },
      {
        id: 'navratri_garba',
        label: 'Garba Night',
        description: 'Vibrant traditional Garba Dandiya celebration with fairy lights',
        icon: '💃',
        previewImage: '/scenes/navratri_garba.jpg',
        promptModifier: 'traditional vibrant Garba Dandiya Raas celebration night, festive ethnic attire, bokeh fairy lights',
        sphere: 'south_asia',
        colorPalette: {
          primary: '#E040FB',
          secondary: '#FFD700',
          accent: '#00E676',
          goldGradient: ['#F3E5F5', '#FFD54F', '#AA00FF'],
          scrimOverlay: 'rgba(20, 4, 28, 0.52)',
          textColor: '#FFFFFF',
        },
      },
    ],
    sampleQuotes: {
      mr: ['आई दुर्गेच्या आशीर्वादाने आपल्या आयुष्यात सामर्थ्य, आनंद आणि भरभराट लाभो. नवरात्रोत्सवाच्या मनःपूर्वक शुभेच्छा!'],
      hi: ['माँ दुर्गा आपको शक्ति, बुद्धि, आरोग्य और सुख-समृद्धि प्रदान करें। शुभ नवरात्रि!'],
      gu: ['માં આદ્યશક્તિ આપની તમામ મનોકામનાઓ પૂર્ણ કરે. નવરાત્રી પર્વની હાર્દિક શુભેચ્છાઓ!'],
      en: ['May Goddess Durga bestow strength, joy, harmony, and prosperity upon you and your family! Happy Navratri!'],
    },
    recipientSuggestions: [
      { label: 'Family', en: 'Family & Friends', native: 'सर्व प्रियजन' },
    ],
  },
  {
    id: 'good_morning',
    label: 'Good Morning',
    icon: '☀️',
    category: 'daily',
    defaultTitle: {
      mr: 'शुभ प्रभात',
      hi: 'शुभ प्रभात',
      gu: 'શુભ સવાર',
      pa: 'ਸ਼ੁਭ ਸਵੇਰ',
      en: 'Good Morning',
      es: '¡Buenos Días!',
      pt: 'Bom Dia!',
      ar: 'صباح الخير',
      ja: 'おはようございます',
      fr: 'Bonjour !',
    },
    scenes: [
      {
        id: 'gm_krishna',
        label: 'Shri Krishna',
        description: 'Lord Krishna with divine flute and peacock feather',
        icon: '🦚',
        previewImage: '/scenes/gm_krishna.jpg',
        promptModifier: 'divine Lord Krishna playing golden flute with glowing peacock feather',
        sphere: 'south_asia',
        colorPalette: {
          primary: '#80DEEA',
          secondary: '#FFD54F',
          accent: '#FFCA28',
          goldGradient: ['#E0F7FA', '#FFD54F', '#FF8F00'],
          scrimOverlay: 'rgba(6, 18, 28, 0.52)',
          textColor: '#FFFFFF',
        },
      },
      {
        id: 'gm_chai',
        label: 'Desi Chai',
        description: 'Steaming ginger cardamom tea in traditional clay kulhad cup at dawn',
        icon: '🫖',
        previewImage: '/scenes/gm_chai.jpg',
        promptModifier: 'authentic Indian steaming masala chai tea in traditional terracotta clay kulhad cup',
        sphere: 'south_asia',
        colorPalette: {
          primary: '#FFCC80',
          secondary: '#D7CCC8',
          accent: '#FFA726',
          goldGradient: ['#FFF3E0', '#FFB74D', '#F57C00'],
          scrimOverlay: 'rgba(28, 14, 8, 0.48)',
          textColor: '#FFFFFF',
        },
      },
      {
        id: 'gm_sunrise',
        label: 'Misty Sunrise',
        description: 'Golden sunbeams breaking through morning mist over serene peaks',
        icon: '🌄',
        previewImage: '/scenes/gm_sunrise.jpg',
        promptModifier: 'cinematic golden hour sunrise, breathtaking sunbeams cutting through soft morning mist',
        sphere: 'all',
        colorPalette: {
          primary: '#FFE259',
          secondary: '#FFA751',
          accent: '#FF7043',
          goldGradient: ['#FFF275', '#FFA751', '#E5A638'],
          scrimOverlay: 'rgba(15, 8, 4, 0.42)',
          textColor: '#FFFFFF',
        },
      },
      {
        id: 'ea_fuji',
        label: 'Mount Fuji',
        description: 'Snow-capped Mount Fuji framed by delicate pink sakura branches',
        icon: '🗻',
        previewImage: '/scenes/ea_fuji.jpg',
        promptModifier: 'majestic snow-capped Mount Fuji with pink cherry blossoms at dawn',
        sphere: 'east_asia',
        colorPalette: {
          primary: '#F8BBD0',
          secondary: '#90CAF9',
          accent: '#FFD54F',
          goldGradient: ['#FCE4EC', '#F8BBD0', '#D81B60'],
          scrimOverlay: 'rgba(12, 14, 24, 0.45)',
          textColor: '#FFFFFF',
        },
      },
      {
        id: 'lat_sunflower',
        label: 'Sunflowers',
        description: 'Vibrant golden sunflowers bathed in warm tropical morning sun',
        icon: '🌻',
        previewImage: '/scenes/lat_sunflower.jpg',
        promptModifier: 'gorgeous field of blooming golden sunflowers reaching toward a radiant tropical sunrise',
        sphere: 'latin_america',
        colorPalette: {
          primary: '#FFD54F',
          secondary: '#FFA000',
          accent: '#FF6F00',
          goldGradient: ['#FFF9C4', '#FFD54F', '#FF8F00'],
          scrimOverlay: 'rgba(18, 12, 4, 0.45)',
          textColor: '#FFFFFF',
        },
      },
      {
        id: 'eu_paris',
        label: 'Paris Morning',
        description: 'Chic Parisian café table with fresh flaky croissant and coffee',
        icon: '🥐',
        previewImage: '/scenes/eu_paris.jpg',
        promptModifier: 'chic Parisian café outdoor marble table with fresh golden flaky croissant and coffee',
        sphere: 'europe',
        colorPalette: {
          primary: '#FFE082',
          secondary: '#D7CCC8',
          accent: '#BCAAA4',
          goldGradient: ['#FFF8E1', '#FFE082', '#A1887F'],
          scrimOverlay: 'rgba(20, 14, 10, 0.45)',
          textColor: '#FFFFFF',
        },
      },
      {
        id: 'af_serengeti',
        label: 'Serengeti Dawn',
        description: 'Acacia tree silhouetted against a glowing savanna sunrise',
        icon: '🦁',
        previewImage: '/scenes/af_serengeti.jpg',
        promptModifier: 'majestic silhouette of an African acacia tree against a glowing savanna sunrise',
        sphere: 'africa',
        colorPalette: {
          primary: '#FFA726',
          secondary: '#FF7043',
          accent: '#FFD54F',
          goldGradient: ['#FFF3E0', '#FFA726', '#D84315'],
          scrimOverlay: 'rgba(24, 10, 4, 0.50)',
          textColor: '#FFFFFF',
        },
      },
      {
        id: 'me_dallah',
        label: 'Arabian Dallah',
        description: 'Golden brass Dallah coffee pot with royal Medjool dates',
        icon: '☕',
        previewImage: '/scenes/me_dallah.jpg',
        promptModifier: 'golden brass Arabian Dallah coffee pot with porcelain cup and dates',
        sphere: 'middle_east',
        colorPalette: {
          primary: '#FFD700',
          secondary: '#FFA000',
          accent: '#D7CCC8',
          goldGradient: ['#FFFDE7', '#FFD54F', '#FF8F00'],
          scrimOverlay: 'rgba(22, 14, 6, 0.52)',
          textColor: '#FFFFFF',
        },
      },
    ],
    sampleQuotes: {
      mr: ['प्रत्येक नवीन सकाळ आपल्या आयुष्यात नवीन आशा, आनंद आणि समाधान घेऊन येवो. आपला आजचा दिवस मंगलमय जावो!'],
      hi: ['एक नई सुबह, नई उम्मीद और नई खुशियों के साथ आपका स्वागत करती है। आपका दिन शुभ और मंगलमय हो!'],
      gu: ['નવી સવાર, નવી આશા અને નવી ઉર્જા સાથે આપનો આજનો દિવસ ખુશહાલ અને સફળ રહે.'],
      pa: ['ਹਰ ਨਵੀਂ ਸਵੇਰ ਤੁਹਾਡੀ ਜ਼ਿੰਦਗੀ ਵਿੱਚ ਨਵੀਆਂ ਖੁਸ਼ੀਆਂ ਅਤੇ ਕਾਮਯਾਬੀ ਲੈ ਕੇ ਆਵੇ। ਸ਼ੁਭ ਸਵੇਰ!'],
      en: ['May this morning bring you fresh hope, radiant energy, and moments filled with gratitude and peace.'],
      es: ['¡Que este nuevo día te regale paz, alegría, energía positiva y hermosos momentos!'],
      pt: ['Que este novo amanhecer traga paz, bênçãos renovadas e muita inspiração para sua jornada.'],
      ar: ['صباح يشرق بالأمل والخير، ونسأل الله أن يملأ قلوبكم بالسكينة والتوفيق والبركة.'],
      ja: ['新しい朝があなたに平和と喜び、そして素晴らしい出会いをもたらしますように。'],
      fr: ['Que cette douce matinée vous apporte sérénité, énergie et bonheur tout au long de la journée.'],
    },
    recipientSuggestions: [
      { label: 'Friend', en: 'Dear Friend', native: 'Dear Friend / मित्र' },
      { label: 'Family', en: 'Family', native: 'Family / परिवार' },
      { label: 'Colleague', en: 'Colleague', native: 'Colleague / सहकारी' },
    ],
  },
  {
    id: 'birthday',
    label: 'Birthday',
    icon: '🎂',
    category: 'celebration',
    defaultTitle: {
      mr: 'वाढदिवसाच्या हार्दिक शुभेच्छा',
      hi: 'जन्मदिन की शुभकामनाएं',
      gu: 'જન્મદિવસની શુભેચ્છાઓ',
      pa: 'ਜਨਮਦਿਨ ਮੁਬਾਰਕ',
      en: 'Happy Birthday!',
      es: '¡Feliz Cumpleaños!',
    },
    scenes: [
      {
        id: 'bday_cake',
        label: 'Gourmet Cake',
        description: 'Multi-tier celebration cake with warm golden candles',
        icon: '🎂',
        previewImage: '/scenes/bday_cake.jpg',
        promptModifier: 'gourmet luxury multi-tier celebration birthday cake with glowing warm golden candles',
        sphere: 'all',
        colorPalette: {
          primary: '#FFD700',
          secondary: '#FFA000',
          accent: '#FF6F00',
          goldGradient: ['#FFFDE7', '#FFD54F', '#FF8F00'],
          scrimOverlay: 'rgba(20, 8, 4, 0.52)',
          textColor: '#FFFFFF',
        },
      },
    ],
    sampleQuotes: {
      mr: ['ईश्वर आपणास दीर्घायुष्य, उत्तम आरोग्य आणि भरभराटीचे आयुष्य देवो. वाढदिवसाच्या मनःपूर्वक शुभेच्छा!'],
      hi: ['ईश्वर आपको उत्तम स्वास्थ्य, दीर्घायु, सुख, समृद्धि और निरंतर सफलता प्रदान करे। जन्मदिन की हार्दिक शुभकामनाएं!'],
      gu: ['ભગવાન તમને દીર્ઘાયુષ્ય, સારું સ્વાસ્થ્ય અને અખૂટ સુખ-સમૃદ્ધિ આપે. જન્મદિવસની શુભેચ્છાઓ!'],
      pa: ['ਪਰਮਾਤਮਾ ਤੁਹਾਨੂੰ ਲੰਬੀ ਉਮਰ, ਚੰਗੀ ਸਿਹਤ ਅਤੇ ਹਰ ਖੇਤਰ ਵਿੱਚ ਕਾਮਯਾਬੀ ਬਖਸ਼ਣ। ਜਨਮਦਿਨ ਮੁਬਾਰਕ!'],
      en: ['Wishing you a year filled with immense laughter, good health, and boundless prosperity! Happy Birthday!'],
      es: ['¡Que este nuevo año de vida esté lleno de bendiciones, amor y salud! ¡Feliz Cumpleaños!'],
    },
    recipientSuggestions: [
      { label: 'Friend', en: 'Dear Friend', native: 'Amigo / मित्र' },
      { label: 'Sister', en: 'Dearest Sister', native: 'Sister / बहना' },
      { label: 'Brother', en: 'Dear Brother', native: 'Brother / भाई' },
      { label: 'Partner', en: 'My Love', native: 'My Love / Amor' },
    ],
  },
  {
    id: 'new_year',
    label: 'New Year 2026',
    icon: '🎆',
    category: 'celebration',
    defaultTitle: {
      en: 'Happy New Year 2026!',
      es: '¡Feliz Año Nuevo 2026!',
      fr: 'Bonne Année 2026 !',
      hi: 'नव वर्ष 2026 की शुभकामनाएं',
      mr: 'नवीन वर्षाच्या हार्दिक शुभेच्छा 2026',
    },
    scenes: [
      {
        id: 'newyear_fireworks',
        label: 'Fireworks',
        description: 'Spectacular midnight golden fireworks over modern skyline',
        icon: '🎆',
        previewImage: '/scenes/newyear_fireworks.jpg',
        promptModifier: 'spectacular midnight golden fireworks over modern city skyline',
        sphere: 'all',
        colorPalette: {
          primary: '#FFE082',
          secondary: '#80D8FF',
          accent: '#FF80AB',
          goldGradient: ['#FFF8E1', '#FFD54F', '#0091EA'],
          scrimOverlay: 'rgba(8, 12, 28, 0.55)',
          textColor: '#FFFFFF',
        },
      },
      {
        id: 'newyear_gold',
        label: 'Sparkles',
        description: 'Festive champagne flutes with golden confetti & bokeh',
        icon: '🥂',
        previewImage: '/scenes/newyear_gold.jpg',
        promptModifier: 'luxury festive champagne flutes, golden confetti, sparkling bokeh lights',
        sphere: 'all',
        colorPalette: {
          primary: '#FFD700',
          secondary: '#FFA000',
          accent: '#FFE082',
          goldGradient: ['#FFFDE7', '#FFD54F', '#FF8F00'],
          scrimOverlay: 'rgba(20, 14, 4, 0.52)',
          textColor: '#FFFFFF',
        },
      },
    ],
    sampleQuotes: {
      en: ['Wishing you 365 days of grand success, sparkling laughter, great health, and boundless joy in 2026!'],
      hi: ['आने वाला नया साल आपके जीवन में नई उमंग, खुशियां और अपार सफलताएं लेकर आए। नव वर्ष 2026 मंगलमय हो!'],
      mr: ['नवीन वर्ष २०२६ आपणास सुख, समृद्धी, आरोग्य आणि भरभराटीचे जावो. नवीन वर्षाच्या हार्दिक शुभेच्छा!'],
    },
    recipientSuggestions: [
      { label: 'Everyone', en: 'All Loved Ones', native: 'सर्व आप्तस्वकीय' },
    ],
  },
  {
    id: 'motivation',
    label: 'Mindset & Success',
    icon: '⚡',
    category: 'mindset',
    defaultTitle: {
      en: 'Daily Motivation',
      es: 'Motivación Diaria',
      hi: 'सफलता की प्रेरणा',
      mr: 'यश आणि प्रेरणा',
    },
    scenes: [
      {
        id: 'mot_climber',
        label: 'Summit Dawn',
        description: 'Climber on mountain peak illuminated by rising sun',
        icon: '🧗',
        previewImage: '/scenes/mot_climber.jpg',
        promptModifier: 'triumphant silhouette of an explorer atop a mountain summit at sunrise',
        sphere: 'all',
        colorPalette: {
          primary: '#FFE259',
          secondary: '#FFA751',
          accent: '#FF7043',
          goldGradient: ['#FFF9C4', '#FFA751', '#E65100'],
          scrimOverlay: 'rgba(12, 10, 8, 0.45)',
          textColor: '#FFFFFF',
        },
      },
    ],
    sampleQuotes: {
      en: ['Every day is a fresh beginning. Stay focused, stay determined, and conquer your dreams today!'],
      hi: ['हर नया दिन एक नया अवसर है। अपने सपनों पर विश्वास रखें और निरंतर आगे बढ़ते रहें!'],
      mr: ['प्रत्येक दिवस ही यशाची नवी संधी असते. आपल्या ध्येयावर विश्वास ठेवा आणि वाटचाल करत राहा!'],
    },
    recipientSuggestions: [
      { label: 'Champion', en: 'Dear Champion', native: 'मित्र / Champion' },
    ],
  },
];

export const App: React.FC = () => {
  const [currentSphere, setCurrentSphere] = useState<CulturalSphere>('south_asia');
  const [spheres, setSpheres] = useState<CulturalSphereInfo[]>(DEFAULT_SPHERES);
  const [occasions, setOccasions] = useState<OccasionDefinition[]>(INITIAL_OCCASIONS);
  const [languages, setLanguages] = useState<LanguageInfo[]>(DEFAULT_LANGUAGES);
  const [locationName, setLocationName] = useState<string>('');

  // Accordion state
  const [openStep, setOpenStep] = useState<number>(1);

  // Read URL path and query parameters for deep-linking and festival landing pages
  const parseUrlState = () => {
    if (typeof window === 'undefined') return { occasion: null, to: '', from: '', lang: '', scene: '' };
    const pathname = window.location.pathname.toLowerCase().replace(/^\/|\/$/g, '');
    const searchParams = new URLSearchParams(window.location.search);

    const pathOccasionMap: Record<string, OccasionId> = {
      'ganesh-chaturthi': 'ganesh_chaturthi',
      'ganeshchaturthi': 'ganesh_chaturthi',
      'ganpati': 'ganesh_chaturthi',
      'diwali': 'diwali',
      'deepavali': 'diwali',
      'good-morning': 'good_morning',
      'morning': 'good_morning',
      'birthday': 'birthday',
      'navratri': 'navratri',
      'new-year': 'new_year',
      'newyear': 'new_year',
    };

    const occasion = pathOccasionMap[pathname] || (searchParams.get('occasion') as OccasionId) || null;
    const to = searchParams.get('to') || searchParams.get('recipient') || '';
    const from = searchParams.get('from') || searchParams.get('sender') || '';
    const lang = searchParams.get('lang') || searchParams.get('language') || '';
    const scene = searchParams.get('scene') || searchParams.get('sceneId') || '';

    return { occasion, to, from, lang, scene };
  };

  const [incomingGiftBanner, setIncomingGiftBanner] = useState<{ recipient: string; sender: string } | null>(() => {
    const { to, from } = parseUrlState();
    if (to || from) {
      return { recipient: to, sender: from };
    }
    return null;
  });

  // Form State with Time-of-Day Adaptive Default & Deep-Link Recognition
  const [request, setRequest] = useState<CardRequest>(() => {
    const { occasion: urlOccasion, to: urlTo, from: urlFrom, lang: urlLang, scene: urlScene } = parseUrlState();
    const hour = new Date().getHours();
    const isMorning = hour >= 5 && hour < 12;
    const initialOccasion: OccasionId = urlOccasion || (isMorning ? 'good_morning' : 'ganesh_chaturthi');
    const initialOcc = INITIAL_OCCASIONS.find((o) => o.id === initialOccasion) || INITIAL_OCCASIONS[0];
    const initialScene = urlScene || initialOcc.scenes[0]?.id || 'ganesha_royal';
    const chosenLang = ((urlLang as Language) || (initialOccasion === 'ganesh_chaturthi' ? 'mr' : 'en')) as Language;
    const initialTitle = initialOcc.defaultTitle[chosenLang] || initialOcc.defaultTitle.mr || initialOcc.defaultTitle.en || '';
    const initialQuote = initialOcc.sampleQuotes[chosenLang]?.[0] || initialOcc.sampleQuotes.mr?.[0] || initialOcc.sampleQuotes.en?.[0] || '';

    return {
      occasion: initialOccasion,
      sceneId: initialScene,
      sphere: 'south_asia',
      backgroundMode: 'preset',
      customImagePrompt: '',
      recipientName: urlTo,
      senderName: urlFrom,
      language: chosenLang,
      customTitle: initialTitle,
      customQuote: initialQuote,
      customSubtitle: '✨ WISHING YOU JOY, PEACE & BLESSINGS ✨',
      textAlignment: 'center',
      textSize: 'standard',
      foilAccent: 'gold',
      qualityMode: 'lightning',
      aspectRatio: '4:5',
    };
  });

  const [generatedCard, setGeneratedCard] = useState<CardResponse | null>(null);
  const [customGeneratedBackground, setCustomGeneratedBackground] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const loadPresets = async (sphereOverride?: CulturalSphere) => {
    try {
      const url = sphereOverride ? `/api/presets?sphere=${sphereOverride}` : '/api/presets';
      const res = await fetch(url);
      const data = await res.json();

      if (data.culturalSpheres) {
        setSpheres(data.culturalSpheres);
      }
      if (data.occasions && data.occasions.length > 0) {
        setOccasions(data.occasions);
      }
      if (data.languages && data.languages.length > 0) {
        setLanguages(data.languages);
      }

      if (data.detectedGeo) {
        const geo = data.detectedGeo;
        const activeSphere = sphereOverride || data.detectedSphere || geo.sphere || 'south_asia';
        setCurrentSphere(activeSphere);

        const topLang = geo.prioritizedLanguages?.[0]?.id || data.suggestedLanguage || (activeSphere === 'south_asia' ? 'mr' : 'en');

        const cityCapitalized = geo.city ? geo.city.charAt(0).toUpperCase() + geo.city.slice(1) : '';
        const loc = [cityCapitalized, geo.stateCode, geo.countryCode].filter(Boolean).join(', ');
        setLocationName(loc);

        // Preserve URL occasion / recipient / sender / scene if user arrived via custom link
        setRequest((prev) => {
          const { occasion: urlOccasion, to: urlTo, from: urlFrom, lang: urlLang, scene: urlScene } = parseUrlState();
          const targetOccId = urlOccasion || prev.occasion;
          const targetOcc = (data.occasions || INITIAL_OCCASIONS).find((o: any) => o.id === targetOccId) || data.occasions?.[0] || INITIAL_OCCASIONS[0];
          const targetLang = ((urlLang as Language) || prev.language || topLang) as Language;
          const defaultQuote = (targetOccId === prev.occasion && prev.customQuote) ? prev.customQuote : (targetOcc.sampleQuotes?.[targetLang]?.[0] || targetOcc.sampleQuotes?.en?.[0] || prev.customQuote);
          const defaultTitle = (targetOccId === prev.occasion && prev.customTitle) ? prev.customTitle : (targetOcc.defaultTitle?.[targetLang] || targetOcc.defaultTitle?.en || prev.customTitle);
          const defaultScene = urlScene || (targetOccId === prev.occasion ? prev.sceneId : targetOcc.scenes?.[0]?.id) || prev.sceneId;

          return {
            ...prev,
            sphere: activeSphere,
            occasion: targetOccId,
            sceneId: defaultScene,
            language: targetLang,
            customTitle: defaultTitle,
            customQuote: defaultQuote,
            recipientName: urlTo || prev.recipientName,
            senderName: urlFrom || prev.senderName,
          };
        });
      }
    } catch (err) {
      console.info('Using local preset cache:', err);
    }
  };

  // On mount: Auto-detect location & presets without forcing an override
  useEffect(() => {
    loadPresets();
  }, []);

  const currentOccasion = occasions.find((o) => o.id === request.occasion) || occasions[0];
  const currentScene =
    currentOccasion.scenes.find((s) => s.id === request.sceneId) || currentOccasion.scenes[0];

  const currentLangObj = languages.find((l) => l.id === request.language) || languages[0];
  const activeSphereObj = spheres.find((s) => s.id === currentSphere) || spheres[0];

  const handleSelectOccasion = (id: OccasionId) => {
    const nextOccasion = occasions.find((o) => o.id === id) || occasions[0];
    const nextScene = nextOccasion.scenes[0] || currentScene;
    const lang = request.language || 'mr';
    const defaultTitle =
      nextOccasion.defaultTitle[lang] || nextOccasion.defaultTitle.en || nextOccasion.label;
    const defaultQuote =
      nextOccasion.sampleQuotes[lang]?.[0] ||
      nextOccasion.sampleQuotes.hi?.[0] ||
      nextOccasion.sampleQuotes.en?.[0] ||
      '';

    setRequest((prev) => ({
      ...prev,
      occasion: id,
      sceneId: nextScene.id,
      customTitle: defaultTitle,
      customQuote: defaultQuote,
    }));
    setGeneratedCard(null);
    setCustomGeneratedBackground(null);
    setOpenStep(2);
  };

  const handleSelectScene = (sceneId: string) => {
    setRequest((prev) => ({ ...prev, sceneId, backgroundMode: 'preset' }));
    setGeneratedCard(null);
    setCustomGeneratedBackground(null);
    setOpenStep(3);
  };

  const handleSelectSphere = (newSphere: CulturalSphere) => {
    loadPresets(newSphere);
    setGeneratedCard(null);
    setCustomGeneratedBackground(null);
  };

  const toggleStep = (step: number) => {
    setOpenStep((current) => (current === step ? 0 : step));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const data: CardResponse = await response.json();
      setGeneratedCard(data);

      // Extract generated image data URL/base64 so live SVG updates can render on top of it without losing it
      const imgMatch = data.svgContent?.match(/<image[^>]+(?:href|xlink:href)=["']([^"']+)["']/i);
      if (imgMatch && imgMatch[1]) {
        setCustomGeneratedBackground(imgMatch[1]);
      }

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FFD700', '#FFA500', '#FF4500', '#FFF'],
      });
    } catch (err: any) {
      console.error('Error generating card:', err);
      setError(err?.message || 'Failed to generate card with AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col font-sans">
      <Navbar
        currentSphere={currentSphere}
        spheres={spheres}
        onSelectSphere={handleSelectSphere}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        {/* Incoming Personalized Card Shared Banner */}
        {incomingGiftBanner && (
          <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/10 border border-amber-500/40 max-w-2xl mx-auto shadow-lg shadow-amber-500/10 flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3 text-left">
              <span className="text-2xl sm:text-3xl">🎁</span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-amber-200">
                  {incomingGiftBanner.recipient
                    ? `Special card personalized for ${incomingGiftBanner.recipient}!`
                    : 'Personalized Wishing Card Shared With You!'}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-300">
                  {incomingGiftBanner.sender
                    ? `From ${incomingGiftBanner.sender}. Customize below to send your blessing back in 1 click!`
                    : 'You can personalize your own card below and share it back in 1 click.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIncomingGiftBanner(null)}
              className="text-xs text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        {/* Hero Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <span>✨ GreetPrompt • AI Wishing Cards &amp; Scene Prompts</span>
            {locationName && (
              <span className="text-[11px] text-slate-300 font-normal">
                • 📍 {locationName}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Personalized Wishing Cards{' '}
            <span className="text-gold-gradient block sm:inline">&amp; AI Prompts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {activeSphereObj?.description ||
              'Create stunning greeting cards with luxury gold typography, AI scene prompts, and 1-tap WhatsApp sharing.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm max-w-3xl mx-auto flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-xs underline font-bold ml-4 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Expandable/Collapsible Step Accordion (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Step 1: Choose Occasion */}
            <AccordionStep
              stepNumber={1}
              title="Choose Occasion"
              isOpen={openStep === 1}
              onToggle={() => toggleStep(1)}
              summaryBadge={
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  <span>{currentOccasion?.icon}</span>
                  <span>{currentOccasion?.label}</span>
                </span>
              }
            >
              <OccasionPicker
                occasions={occasions}
                selectedOccasion={request.occasion}
                onSelectOccasion={handleSelectOccasion}
              />
            </AccordionStep>

            {/* Step 2: Background Scene & Visual Subject (Hybrid Dual-Engine) */}
            <AccordionStep
              stepNumber={2}
              title="Background Scene &amp; Visuals"
              isOpen={openStep === 2}
              onToggle={() => toggleStep(2)}
              summaryBadge={
                request.backgroundMode === 'custom_prompt' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                    <span>✨</span>
                    <span className="truncate max-w-[140px]">Custom AI Prompt</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold">
                    <span>{currentScene?.icon}</span>
                    <span className="truncate max-w-[140px]">{currentScene?.label}</span>
                  </span>
                )
              }
            >
              <ScenePicker
                scenes={currentOccasion.scenes}
                selectedSceneId={request.sceneId}
                sphere={currentSphere}
                occasionId={request.occasion}
                backgroundMode={request.backgroundMode || 'preset'}
                customPrompt={request.customImagePrompt || ''}
                onSelectScene={handleSelectScene}
                onChangeBackgroundMode={(mode: BackgroundMode) => {
                  setRequest((prev) => ({ ...prev, backgroundMode: mode }));
                  setGeneratedCard(null);
                }}
                onChangeCustomPrompt={(prompt: string) => {
                  setRequest((prev) => ({
                    ...prev,
                    backgroundMode: 'custom_prompt',
                    customImagePrompt: prompt,
                  }));
                  setGeneratedCard(null);
                }}
              />
            </AccordionStep>

            {/* Step 3: Personalize Names */}
            <AccordionStep
              stepNumber={3}
              title="Personalize Names"
              isOpen={openStep === 3}
              onToggle={() => toggleStep(3)}
              summaryBadge={
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-slate-300 text-xs font-medium truncate max-w-[160px]">
                  {request.recipientName ? `To: ${request.recipientName}` : 'Custom Recipient'}
                </span>
              }
            >
              <RecipientPicker
                occasionDef={currentOccasion}
                language={request.language || 'mr'}
                recipientName={request.recipientName || ''}
                senderName={request.senderName || ''}
                onChangeRecipient={(val) => {
                  setRequest((prev) => ({ ...prev, recipientName: val }));
                  setGeneratedCard(null);
                }}
                onChangeSender={(val) => {
                  setRequest((prev) => ({ ...prev, senderName: val }));
                  setGeneratedCard(null);
                }}
              />
            </AccordionStep>

            {/* Step 4: Greeting Message & Language */}
            <AccordionStep
              stepNumber={4}
              title="Greeting Message &amp; Language"
              isOpen={openStep === 4}
              onToggle={() => toggleStep(4)}
              summaryBadge={
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
                  {currentLangObj?.nativeLabel || 'मराठी'}
                </span>
              }
            >
              <QuotePicker
                occasionDef={currentOccasion}
                language={request.language || 'mr'}
                supportedLanguages={languages}
                customTitle={request.customTitle || ''}
                customQuote={request.customQuote || ''}
                customSubtitle={request.customSubtitle || ''}
                textAlignment={request.textAlignment || 'center'}
                textSize={request.textSize || 'standard'}
                foilAccent={request.foilAccent || 'gold'}
                recipientName={request.recipientName}
                senderName={request.senderName}
                onChangeLanguage={(lang: Language) => {
                  const newTitle =
                    currentOccasion?.defaultTitle[lang] ||
                    currentOccasion?.defaultTitle.en ||
                    currentOccasion?.label ||
                    '';
                  const newQuote =
                    currentOccasion?.sampleQuotes[lang]?.[0] ||
                    currentOccasion?.sampleQuotes.hi?.[0] ||
                    currentOccasion?.sampleQuotes.en?.[0] ||
                    '';
                  setRequest((prev) => ({
                    ...prev,
                    language: lang,
                    customTitle: newTitle,
                    customQuote: newQuote,
                  }));
                  setGeneratedCard(null);
                }}
                onChangeTitle={(title: string) => {
                  setRequest((prev) => ({ ...prev, customTitle: title }));
                  setGeneratedCard(null);
                }}
                onChangeQuote={(quote: string) => {
                  setRequest((prev) => ({ ...prev, customQuote: quote }));
                  setGeneratedCard(null);
                }}
                onChangeSubtitle={(subtitle: string) => {
                  setRequest((prev) => ({ ...prev, customSubtitle: subtitle }));
                  setGeneratedCard(null);
                }}
                onChangeAlignment={(align) => {
                  setRequest((prev) => ({ ...prev, textAlignment: align }));
                  setGeneratedCard(null);
                }}
                onChangeTextSize={(size) => {
                  setRequest((prev) => ({ ...prev, textSize: size }));
                  setGeneratedCard(null);
                }}
                onChangeFoilAccent={(foil) => {
                  setRequest((prev) => ({ ...prev, foilAccent: foil }));
                  setGeneratedCard(null);
                }}
              />
            </AccordionStep>
          </div>

          {/* Right Column: Live WYSIWYG Card Preview & Actions (5 Cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20">
            <div className="glass-panel p-4 sm:p-5 rounded-3xl">
              <CardPreview
                request={request}
                generatedCard={generatedCard}
                customGeneratedBackground={customGeneratedBackground}
                isLoading={isLoading}
                onGenerate={handleGenerate}
                onChangeQuality={(mode: QualityMode) =>
                  setRequest((prev) => ({ ...prev, qualityMode: mode }))
                }
                occasionDef={currentOccasion}
                sceneDef={currentScene}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <InstallAppBanner />
    </div>
  );
};

export default App;
