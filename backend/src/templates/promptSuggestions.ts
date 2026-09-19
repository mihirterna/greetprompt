import { OccasionId, CulturalSphere } from '../types';

export interface PromptSuggestion {
  text: string;
  category: 'popular' | 'cultural' | 'lighting' | 'artistic';
  icon: string;
}

export const STYLE_MODIFIERS = [
  { label: '✨ Golden Hour Sunbeams', value: 'cinematic golden hour sunbeams, soft morning haze, 8k photography' },
  { label: '🎨 Fine Art Oil Painting', value: 'ethereal oil painting texture, rich brushstrokes, fine art masterpiece' },
  { label: '🌟 3D Royal Bokeh', value: 'dark royal velvet background, sparkling gold dust, shallow depth of field' },
  { label: '🌸 Japanese Watercolor', value: 'traditional delicate watercolor wash, soft pastel tones, serene minimalist' },
  { label: '🏮 Twilight Lanterns', value: 'magical twilight atmosphere, glowing warm lanterns, starry cosmic sky' },
];

export function getPromptSuggestions(
  occasion: OccasionId,
  sphere: CulturalSphere = 'global',
  timeOfDay: string = 'morning'
): PromptSuggestion[] {
  const suggestions: PromptSuggestion[] = [];

  // South Asia
  if (sphere === 'south_asia') {
    if (occasion === 'good_morning') {
      suggestions.push(
        { text: 'Lord Shri Krishna playing golden bansuri in Vrindavan blooming garden at dawn', category: 'cultural', icon: '🦚' },
        { text: 'Steaming masala chai in clay kulhad on rustic wooden veranda with morning sunlight', category: 'popular', icon: '🫖' },
        { text: 'Golden sunrise over holy Ganges river in Varanasi with glowing temple bells', category: 'cultural', icon: '🕉️' },
        { text: 'Lord Ganesha seated on a glowing sacred lotus with divine morning aura', category: 'cultural', icon: '🌺' },
        { text: 'Majestic Himalayan snow peaks bathed in golden morning alpenglow', category: 'lighting', icon: '🏔️' }
      );
    } else if (occasion === 'birthday') {
      suggestions.push(
        { text: 'Luxury multi-tier chocolate cake with glowing 24k gold leaf candles and sparkles', category: 'popular', icon: '🎂' },
        { text: 'Royal Indian palace celebration hall decorated with fresh marigold garlands and fairy lights', category: 'cultural', icon: '🏰' },
        { text: 'Pastel balloons and gold confetti explosion with festive champagne sparkles', category: 'artistic', icon: '🎈' }
      );
    } else if (occasion === 'spiritual') {
      suggestions.push(
        { text: 'Lord Shiva in deep serene meditation on Mount Kailash under cosmic starry sky', category: 'cultural', icon: '🔱' },
        { text: 'Glowing brass diya oil lamps floating on sacred lotus pond at twilight', category: 'lighting', icon: '🪔' },
        { text: 'Radha Krishna celestial darshan surrounded by peacocks and holy Vrindavan mist', category: 'cultural', icon: '🦚' }
      );
    } else if (occasion === 'diwali' || occasion === 'festival') {
      suggestions.push(
        { text: 'Traditional ornate brass diyas on vibrant peacock rangoli with warm dancing flames', category: 'cultural', icon: '🪔' },
        { text: 'Night sky illuminated by spectacular golden firework sparkles over silhouetted temples', category: 'lighting', icon: '✨' }
      );
    } else {
      suggestions.push(
        { text: 'Triumphant climber on mountain summit reaching toward golden sunrise', category: 'popular', icon: '🧗' },
        { text: 'Majestic peacock dancing in morning dew under blooming royal mango tree', category: 'cultural', icon: '🦚' }
      );
    }
  }

  // Middle East
  else if (sphere === 'middle_east') {
    if (occasion === 'good_morning') {
      suggestions.push(
        { text: 'Traditional golden brass Arabian Dallah with finjan cup and Medjool dates on rich carpet', category: 'cultural', icon: '🫖' },
        { text: 'Golden dunes of Arabian desert during magnificent sunrise with soft wind ripples', category: 'lighting', icon: '🏜️' },
        { text: 'Serene courtyard oasis with tranquil fountain in soft morning light', category: 'popular', icon: '🌴' }
      );
    } else if (occasion === 'spiritual' || occasion === 'diwali' || occasion === 'festival') {
      suggestions.push(
        { text: 'Golden crescent moon floating in royal indigo night sky above silhouetted mosque dome', category: 'cultural', icon: '🌙' },
        { text: 'Glowing ornate brass Fanous lanterns casting intricate geometric arabesque light patterns', category: 'lighting', icon: '🏮' }
      );
    } else {
      suggestions.push(
        { text: 'Luxury celebration cake with gold foil arabesque calligraphy decorations', category: 'popular', icon: '🎂' },
        { text: 'Falcon perched atop a sandstone arch against warm golden hour sunset', category: 'cultural', icon: '🦅' }
      );
    }
  }

  // East Asia
  else if (sphere === 'east_asia') {
    if (occasion === 'good_morning') {
      suggestions.push(
        { text: 'Snow-capped Mount Fuji framed by blooming pink cherry blossom sakura branches at dawn', category: 'cultural', icon: '🗻' },
        { text: 'Serene Japanese Zen bamboo garden with stone water basin and morning sunbeams', category: 'lighting', icon: '🎋' },
        { text: 'Traditional tea set on tatami mat overlooking tranquil koi pond in morning mist', category: 'popular', icon: '🍵' }
      );
    } else if (occasion === 'birthday' || occasion === 'festival') {
      suggestions.push(
        { text: 'Glowing red silk lanterns with gold tassels hanging in festive twilight courtyard', category: 'cultural', icon: '🏮' },
        { text: 'Luxury celebratory matcha cake decorated with edible cherry blossoms and gold flakes', category: 'popular', icon: '🎂' }
      );
    } else {
      suggestions.push(
        { text: 'Majestic red pagoda surrounded by golden autumn maple leaves in soft sunlight', category: 'artistic', icon: '🍁' },
        { text: 'Ethereal mist rolling over emerald karst mountains and river at dawn', category: 'lighting', icon: '🏞️' }
      );
    }
  }

  // Latin America & Iberia
  else if (sphere === 'latin_america') {
    if (occasion === 'good_morning') {
      suggestions.push(
        { text: 'Field of blooming golden sunflowers reaching toward a radiant tropical mountain sunrise', category: 'popular', icon: '🌻' },
        { text: 'Steaming cup of fresh Brazilian coffee on a terracotta tiled balcony overlooking lush green hills', category: 'cultural', icon: '☕' },
        { text: 'Silhouetted palm trees under a breathtaking pastel rose-gold and coral sunrise over the ocean', category: 'lighting', icon: '🌴' }
      );
    } else {
      suggestions.push(
        { text: 'Festive sparklers with tropical celebration cake and exotic blooming orchids', category: 'popular', icon: '🎂' },
        { text: 'Vibrant colonial cobblestone street with blooming bougainvillea in morning light', category: 'artistic', icon: '🌺' }
      );
    }
  }

  // Europe
  else if (sphere === 'europe') {
    if (occasion === 'good_morning') {
      suggestions.push(
        { text: 'Chic Parisian café outdoor marble table with fresh golden flaky croissant and morning espresso', category: 'popular', icon: '🥐' },
        { text: 'Swiss Alpine mountain peaks glowing in early morning alpenglow golden sunlight', category: 'lighting', icon: '🏔️' },
        { text: 'Rolling golden hills of Tuscany with tall cypress trees bathed in warm morning light', category: 'artistic', icon: '🍇' }
      );
    } else {
      suggestions.push(
        { text: 'Artisan patisserie luxury birthday gateau with delicate berry coulis and golden candle flames', category: 'popular', icon: '🎂' },
        { text: 'Rustic Italian stone terrace overlooking vineyard sunset with lavender flowers', category: 'lighting', icon: '🌅' }
      );
    }
  }

  // Global / Anglosphere
  else {
    if (occasion === 'good_morning') {
      suggestions.push(
        { text: 'Golden sunbeams breaking through morning mist over serene mountain lake', category: 'popular', icon: '🌅' },
        { text: 'Aesthetic ceramic artisan coffee cup on dark rustic wooden table in soft window light', category: 'popular', icon: '☕' },
        { text: 'Dewdrops on fresh blooming white roses at sunrise with soft golden glow', category: 'lighting', icon: '🌹' }
      );
    } else if (occasion === 'birthday') {
      suggestions.push(
        { text: 'Gourmet luxury multi-tier celebration cake with glowing warm golden candles and chocolate drizzle', category: 'popular', icon: '🎂' },
        { text: 'Pastel balloon arch with gold confetti explosion and champagne sparkles', category: 'artistic', icon: '🎈' }
      );
    } else if (occasion === 'motivation') {
      suggestions.push(
        { text: 'Triumphant climber standing atop dramatic mountain summit at sunrise in volumetric sunbeams', category: 'popular', icon: '🧗' },
        { text: 'Golden bridge stretching across ocean into a brilliant radiant dawn horizon', category: 'artistic', icon: '🌉' }
      );
    } else {
      suggestions.push(
        { text: 'Peaceful coastal sunrise with gentle turquoise waves and golden sea foam', category: 'lighting', icon: '🌊' },
        { text: 'Cozy fireplace glowing warmly with soft festive bokeh in background', category: 'popular', icon: '🔥' }
      );
    }
  }

  return suggestions;
}
