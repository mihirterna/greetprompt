const fs = require('fs');

const SCENES_TO_APPEND = `
  // --- Ganesh Chaturthi Multi-Scenes ---
  ganesha_royal: {
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
  ganesha_gold: {
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
  ganesha_modak: {
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
  ganesha_temple: {
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

  // --- Diwali Multi-Scenes ---
  diwali_palace: {
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
  diwali_diyas: {
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
  diwali_rangoli: {
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
  diwali_lakshmi: {
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

  // --- Navratri & Durga Puja ---
  durga_divine: {
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
  navratri_garba: {
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

  // --- New Year 2026 ---
  newyear_fireworks: {
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
  newyear_gold: {
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
`;

let scenesContent = fs.readFileSync('c:\\Users\\mihir\\Projects\\cloudflare-wishes\\backend\\src\\templates\\scenes.ts', 'utf8');

// Insert new scenes inside export const SCENES = { ... }
const scenesObjEnd = scenesContent.indexOf('export const OCCASIONS: Record<OccasionId, OccasionDefinition> = {');
if (scenesObjEnd !== -1) {
  const lastClosingBrace = scenesContent.lastIndexOf('};', scenesObjEnd);
  scenesContent = scenesContent.slice(0, lastClosingBrace) + SCENES_TO_APPEND + scenesContent.slice(lastClosingBrace);
}

// Add new occasions inside OCCASIONS
const NEW_OCCASIONS_STR = `
  ganesh_chaturthi: {
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
      SCENES.ganesha_royal,
      SCENES.ganesha_gold,
      SCENES.ganesha_modak,
      SCENES.ganesha_temple,
    ],
    sampleQuotes: {
      mr: ['वक्रतुंड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥ बाप्पाच्या आगमनाने आपल्या घरात सुख, शांती, समाधान आणि भरभराट येवो!'],
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
  diwali: {
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
      SCENES.diwali_palace,
      SCENES.diwali_diyas,
      SCENES.diwali_rangoli,
      SCENES.diwali_lakshmi,
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
  navratri: {
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
      SCENES.durga_divine,
      SCENES.navratri_garba,
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
  new_year: {
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
      SCENES.newyear_fireworks,
      SCENES.newyear_gold,
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
`;

const occStartIdx = scenesContent.indexOf('export const OCCASIONS: Record<OccasionId, OccasionDefinition> = {');
if (occStartIdx !== -1) {
  const insertPos = occStartIdx + 'export const OCCASIONS: Record<OccasionId, OccasionDefinition> = {'.length;
  scenesContent = scenesContent.slice(0, insertPos) + NEW_OCCASIONS_STR + scenesContent.slice(insertPos);
}

fs.writeFileSync('c:\\Users\\mihir\\Projects\\cloudflare-wishes\\backend\\src\\templates\\scenes.ts', scenesContent);
console.log('backend scenes.ts updated successfully!');
