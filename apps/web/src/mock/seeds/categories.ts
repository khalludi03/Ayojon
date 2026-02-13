// Category Seed Data - Ayojon Event Marketplace Categories

import type { Category, CategoryIconName } from '@/types'

export const CATEGORIES: Array<Category> = [
  {
    id: 'decorations',
    name: 'Decorations & Balloons',
    slug: 'decorations-balloons',
    icon: 'Sparkles' as CategoryIconName,
    description:
      'Transform your venue with stunning decorations, balloon arrangements, LED lights, and themed decor. From elegant balloon arches to eye-catching neon signs, create the perfect ambiance for any celebration.',
    imageUrl:
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&h=400&fit=crop',
    subcategories: [
      {
        id: 'balloon-arches',
        name: 'Balloon Arches & Bouquets',
        slug: 'balloon-arches',
        parentId: 'decorations',
      },
      {
        id: 'backdrops',
        name: 'Backdrops & Photo Walls',
        slug: 'backdrops',
        parentId: 'decorations',
      },
      {
        id: 'led-decor',
        name: 'LED Lights & Neon Signs',
        slug: 'led-decor',
        parentId: 'decorations',
      },
      {
        id: 'themed-decor',
        name: 'Themed Decorations',
        slug: 'themed-decor',
        parentId: 'decorations',
      },
      {
        id: 'ceiling-decor',
        name: 'Ceiling & Hanging Decor',
        slug: 'ceiling-decor',
        parentId: 'decorations',
      },
      {
        id: 'entrance-decor',
        name: 'Entrance & Gate Decor',
        slug: 'entrance-decor',
        parentId: 'decorations',
      },
    ],
  },
  {
    id: 'sound-lighting',
    name: 'Sound & Lighting',
    slug: 'sound-lighting',
    icon: 'Mic' as CategoryIconName,
    description:
      'Professional audio and lighting equipment to set the mood and energize your event. From powerful PA systems to stunning stage effects, deliver an unforgettable sensory experience for your guests.',
    imageUrl:
      'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=1200&h=400&fit=crop',
    subcategories: [
      {
        id: 'pa-systems',
        name: 'PA Systems & Speakers',
        slug: 'pa-systems',
        parentId: 'sound-lighting',
      },
      {
        id: 'microphones',
        name: 'Microphones & Wireless Systems',
        slug: 'microphones',
        parentId: 'sound-lighting',
      },
      {
        id: 'dj-equipment',
        name: 'DJ Equipment',
        slug: 'dj-equipment',
        parentId: 'sound-lighting',
      },
      {
        id: 'stage-lights',
        name: 'Stage Lights & Effects',
        slug: 'stage-lights',
        parentId: 'sound-lighting',
      },
      {
        id: 'uplighting',
        name: 'Uplighting & Ambient Lights',
        slug: 'uplighting',
        parentId: 'sound-lighting',
      },
      {
        id: 'projectors',
        name: 'Projectors & Screens',
        slug: 'projectors',
        parentId: 'sound-lighting',
      },
    ],
  },
  {
    id: 'furniture-tents',
    name: 'Furniture & Tents',
    slug: 'furniture-tents',
    icon: 'Home' as CategoryIconName,
    description:
      'Quality event furniture and tents for comfortable seating and weather protection. Choose from elegant chiavari chairs, spacious tents, stylish lounge furniture, and more to create the perfect event setup.',
    imageUrl:
      'https://images.unsplash.com/photo-1519167758481-83f29da8c6c9?w=1200&h=400&fit=crop',
    subcategories: [
      {
        id: 'chairs',
        name: 'Chairs (Chiavari, Folding, etc.)',
        slug: 'chairs',
        parentId: 'furniture-tents',
      },
      {
        id: 'tables',
        name: 'Tables (Round, Banquet, Cocktail)',
        slug: 'tables',
        parentId: 'furniture-tents',
      },
      {
        id: 'tents-canopies',
        name: 'Tents & Canopies',
        slug: 'tents-canopies',
        parentId: 'furniture-tents',
      },
      {
        id: 'lounge-furniture',
        name: 'Lounge Furniture',
        slug: 'lounge-furniture',
        parentId: 'furniture-tents',
      },
      {
        id: 'stages',
        name: 'Stages & Platforms',
        slug: 'stages',
        parentId: 'furniture-tents',
      },
      {
        id: 'linens-covers',
        name: 'Table Linens & Chair Covers',
        slug: 'linens-covers',
        parentId: 'furniture-tents',
      },
    ],
  },
  {
    id: 'catering-equipment',
    name: 'Catering Equipment',
    slug: 'catering-equipment',
    icon: 'UtensilsCrossed' as CategoryIconName,
    description:
      'Professional catering equipment and supplies for seamless food and beverage service. From elegant serving platters to modern bar equipment, ensure your guests enjoy a premium dining experience.',
    imageUrl:
      'https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&h=400&fit=crop',
    subcategories: [
      {
        id: 'chafing-dishes',
        name: 'Chafing Dishes & Warmers',
        slug: 'chafing-dishes',
        parentId: 'catering-equipment',
      },
      {
        id: 'glassware',
        name: 'Glassware & Drinkware',
        slug: 'glassware',
        parentId: 'catering-equipment',
      },
      {
        id: 'serving-platters',
        name: 'Serving Platters & Bowls',
        slug: 'serving-platters',
        parentId: 'catering-equipment',
      },
      {
        id: 'bar-equipment',
        name: 'Bar Equipment',
        slug: 'bar-equipment',
        parentId: 'catering-equipment',
      },
      {
        id: 'beverage-dispensers',
        name: 'Beverage Dispensers',
        slug: 'beverage-dispensers',
        parentId: 'catering-equipment',
      },
      {
        id: 'catering-supplies',
        name: 'Catering Supplies & Utensils',
        slug: 'catering-supplies',
        parentId: 'catering-equipment',
      },
    ],
  },
  {
    id: 'photography-video',
    name: 'Photography & Video',
    slug: 'photography-video',
    icon: 'Camera' as CategoryIconName,
    description:
      'Capture every precious moment with professional photography and videography equipment. From interactive photo booths to cutting-edge cameras and drones, preserve memories that last a lifetime.',
    imageUrl:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&h=400&fit=crop',
    subcategories: [
      {
        id: 'photo-booths',
        name: 'Photo Booths',
        slug: 'photo-booths',
        parentId: 'photography-video',
      },
      {
        id: 'cameras-lenses',
        name: 'Cameras & Lenses',
        slug: 'cameras-lenses',
        parentId: 'photography-video',
      },
      {
        id: 'lighting-kits',
        name: 'Lighting Kits',
        slug: 'lighting-kits',
        parentId: 'photography-video',
      },
      {
        id: 'video-cameras',
        name: 'Video Cameras & Camcorders',
        slug: 'video-cameras',
        parentId: 'photography-video',
      },
      {
        id: 'drones',
        name: 'Drones & Aerial Photography',
        slug: 'drones',
        parentId: 'photography-video',
      },
      {
        id: 'photo-props',
        name: 'Photo Props & Accessories',
        slug: 'photo-props',
        parentId: 'photography-video',
      },
    ],
  },
  {
    id: 'party-supplies',
    name: 'Party Supplies',
    slug: 'party-supplies',
    icon: 'PartyPopper' as CategoryIconName,
    description:
      'Complete party essentials and supplies to add fun and flair to any celebration. From festive tableware to exciting party favors, make every moment special with our curated selection.',
    imageUrl:
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&h=400&fit=crop',
    subcategories: [
      {
        id: 'tableware',
        name: 'Disposable Tableware',
        slug: 'tableware',
        parentId: 'party-supplies',
      },
      {
        id: 'party-favors',
        name: 'Party Favors & Giveaways',
        slug: 'party-favors',
        parentId: 'party-supplies',
      },
      {
        id: 'banners-signs',
        name: 'Banners & Signs',
        slug: 'banners-signs',
        parentId: 'party-supplies',
      },
      {
        id: 'confetti-poppers',
        name: 'Confetti & Poppers',
        slug: 'confetti-poppers',
        parentId: 'party-supplies',
      },
      {
        id: 'cake-supplies',
        name: 'Cake Stands & Toppers',
        slug: 'cake-supplies',
        parentId: 'party-supplies',
      },
      {
        id: 'centerpieces',
        name: 'Centerpieces & Table Decor',
        slug: 'centerpieces',
        parentId: 'party-supplies',
      },
    ],
  },
  {
    id: 'event-clothing',
    name: 'Event Clothing & Costumes',
    slug: 'event-clothing-costumes',
    icon: 'Shirt' as CategoryIconName,
    description:
      'Look your best with our collection of formal wear, traditional attire, and creative costumes. From elegant wedding outfits to fun character costumes, dress to impress for any occasion.',
    imageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop',
    subcategories: [
      {
        id: 'wedding-attire',
        name: 'Wedding Attire',
        slug: 'wedding-attire',
        parentId: 'event-clothing',
      },
      {
        id: 'traditional-wear',
        name: 'Traditional & Ethnic Wear',
        slug: 'traditional-wear',
        parentId: 'event-clothing',
      },
      {
        id: 'tuxedos-suits',
        name: 'Tuxedos & Formal Suits',
        slug: 'tuxedos-suits',
        parentId: 'event-clothing',
      },
      {
        id: 'costumes',
        name: 'Costumes & Character Outfits',
        slug: 'costumes',
        parentId: 'event-clothing',
      },
      {
        id: 'accessories',
        name: 'Accessories (Veils, Ties, etc.)',
        slug: 'accessories',
        parentId: 'event-clothing',
      },
      {
        id: 'kids-formal',
        name: "Kids' Formal Wear",
        slug: 'kids-formal',
        parentId: 'event-clothing',
      },
    ],
  },
  {
    id: 'stage-backdrops',
    name: 'Stage & Backdrops',
    slug: 'stage-backdrops',
    icon: 'LayoutPanelTop' as CategoryIconName,
    description:
      'Create the perfect focal point with professional stage setups and beautiful backdrops. From elegant floral walls to versatile pipe and drape systems, frame your special moments in style.',
    imageUrl:
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=400&fit=crop',
    subcategories: [
      {
        id: 'stage-platforms',
        name: 'Stage Platforms',
        slug: 'stage-platforms',
        parentId: 'stage-backdrops',
      },
      {
        id: 'backdrop-stands',
        name: 'Backdrop Stands & Frames',
        slug: 'backdrop-stands',
        parentId: 'stage-backdrops',
      },
      {
        id: 'fabric-backdrops',
        name: 'Fabric Backdrops',
        slug: 'fabric-backdrops',
        parentId: 'stage-backdrops',
      },
      {
        id: 'floral-walls',
        name: 'Floral Walls',
        slug: 'floral-walls',
        parentId: 'stage-backdrops',
      },
      {
        id: 'pipe-drape',
        name: 'Pipe & Drape Systems',
        slug: 'pipe-drape',
        parentId: 'stage-backdrops',
      },
      {
        id: 'curtains',
        name: 'Stage Curtains & Skirting',
        slug: 'curtains',
        parentId: 'stage-backdrops',
      },
    ],
  },
  {
    id: 'floral-arrangements',
    name: 'Floral Arrangements',
    slug: 'floral-arrangements',
    icon: 'Flower' as CategoryIconName,
    description:
      'Add natural beauty and elegance with fresh and artificial floral arrangements. From romantic bouquets to stunning centerpieces, bring color and fragrance to your special day.',
    imageUrl:
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&h=400&fit=crop',
    subcategories: [
      {
        id: 'bouquets',
        name: 'Bouquets & Hand Flowers',
        slug: 'bouquets',
        parentId: 'floral-arrangements',
      },
      {
        id: 'centerpieces-floral',
        name: 'Floral Centerpieces',
        slug: 'centerpieces-floral',
        parentId: 'floral-arrangements',
      },
      {
        id: 'garlands',
        name: 'Garlands & Vines',
        slug: 'garlands',
        parentId: 'floral-arrangements',
      },
      {
        id: 'corsages',
        name: 'Corsages & Boutonnieres',
        slug: 'corsages',
        parentId: 'floral-arrangements',
      },
      {
        id: 'vases',
        name: 'Vases & Containers',
        slug: 'vases',
        parentId: 'floral-arrangements',
      },
      {
        id: 'artificial-flowers',
        name: 'Artificial Flowers',
        slug: 'artificial-flowers',
        parentId: 'floral-arrangements',
      },
    ],
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Activities',
    slug: 'entertainment-activities',
    icon: 'Gamepad2' as CategoryIconName,
    description:
      'Keep your guests entertained with interactive games, inflatables, and performance equipment. From bounce houses for kids to arcade games for all ages, create fun-filled memories.',
    imageUrl:
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=400&fit=crop',
    subcategories: [
      {
        id: 'inflatables',
        name: 'Inflatables & Bounce Houses',
        slug: 'inflatables',
        parentId: 'entertainment',
      },
      {
        id: 'carnival-games',
        name: 'Carnival Games',
        slug: 'carnival-games',
        parentId: 'entertainment',
      },
      {
        id: 'karaoke',
        name: 'Karaoke Equipment',
        slug: 'karaoke',
        parentId: 'entertainment',
      },
      {
        id: 'arcade-games',
        name: 'Arcade Games',
        slug: 'arcade-games',
        parentId: 'entertainment',
      },
      {
        id: 'lawn-games',
        name: 'Lawn & Outdoor Games',
        slug: 'lawn-games',
        parentId: 'entertainment',
      },
      {
        id: 'magic-props',
        name: 'Magic & Performance Props',
        slug: 'magic-props',
        parentId: 'entertainment',
      },
    ],
  },
]

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === id)
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.slug === slug)
}

export function getAllSubcategories(): Array<{
  id: string
  name: string
  parentId: string
}> {
  return CATEGORIES.flatMap((cat) => cat.subcategories)
}

export function getRelatedCategories(
  categoryId: string,
  limit: number = 6,
): Array<Category> {
  // Get all categories except the current one
  const otherCategories = CATEGORIES.filter((cat) => cat.id !== categoryId)

  // Shuffle and return the specified number of related categories
  return otherCategories.sort(() => Math.random() - 0.5).slice(0, limit)
}
