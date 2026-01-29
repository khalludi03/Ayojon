// Category Seed Data - Ayojon Event Marketplace Categories

import type { Category, CategoryIconName } from '@/types';

export const CATEGORIES: Array<Category> = [
  {
    id: 'decorations',
    name: 'Decorations & Balloons',
    slug: 'decorations-balloons',
    icon: 'Sparkles' as CategoryIconName,
    subcategories: [
      { id: 'balloon-arches', name: 'Balloon Arches & Bouquets', slug: 'balloon-arches', parentId: 'decorations' },
      { id: 'backdrops', name: 'Backdrops & Photo Walls', slug: 'backdrops', parentId: 'decorations' },
      { id: 'led-decor', name: 'LED Lights & Neon Signs', slug: 'led-decor', parentId: 'decorations' },
      { id: 'themed-decor', name: 'Themed Decorations', slug: 'themed-decor', parentId: 'decorations' },
      { id: 'ceiling-decor', name: 'Ceiling & Hanging Decor', slug: 'ceiling-decor', parentId: 'decorations' },
      { id: 'entrance-decor', name: 'Entrance & Gate Decor', slug: 'entrance-decor', parentId: 'decorations' },
    ],
  },
  {
    id: 'sound-lighting',
    name: 'Sound & Lighting',
    slug: 'sound-lighting',
    icon: 'Mic' as CategoryIconName,
    subcategories: [
      { id: 'pa-systems', name: 'PA Systems & Speakers', slug: 'pa-systems', parentId: 'sound-lighting' },
      { id: 'microphones', name: 'Microphones & Wireless Systems', slug: 'microphones', parentId: 'sound-lighting' },
      { id: 'dj-equipment', name: 'DJ Equipment', slug: 'dj-equipment', parentId: 'sound-lighting' },
      { id: 'stage-lights', name: 'Stage Lights & Effects', slug: 'stage-lights', parentId: 'sound-lighting' },
      { id: 'uplighting', name: 'Uplighting & Ambient Lights', slug: 'uplighting', parentId: 'sound-lighting' },
      { id: 'projectors', name: 'Projectors & Screens', slug: 'projectors', parentId: 'sound-lighting' },
    ],
  },
  {
    id: 'furniture-tents',
    name: 'Furniture & Tents',
    slug: 'furniture-tents',
    icon: 'Home' as CategoryIconName,
    subcategories: [
      { id: 'chairs', name: 'Chairs (Chiavari, Folding, etc.)', slug: 'chairs', parentId: 'furniture-tents' },
      { id: 'tables', name: 'Tables (Round, Banquet, Cocktail)', slug: 'tables', parentId: 'furniture-tents' },
      { id: 'tents-canopies', name: 'Tents & Canopies', slug: 'tents-canopies', parentId: 'furniture-tents' },
      { id: 'lounge-furniture', name: 'Lounge Furniture', slug: 'lounge-furniture', parentId: 'furniture-tents' },
      { id: 'stages', name: 'Stages & Platforms', slug: 'stages', parentId: 'furniture-tents' },
      { id: 'linens-covers', name: 'Table Linens & Chair Covers', slug: 'linens-covers', parentId: 'furniture-tents' },
    ],
  },
  {
    id: 'catering-equipment',
    name: 'Catering Equipment',
    slug: 'catering-equipment',
    icon: 'UtensilsCrossed' as CategoryIconName,
    subcategories: [
      { id: 'chafing-dishes', name: 'Chafing Dishes & Warmers', slug: 'chafing-dishes', parentId: 'catering-equipment' },
      { id: 'glassware', name: 'Glassware & Drinkware', slug: 'glassware', parentId: 'catering-equipment' },
      { id: 'serving-platters', name: 'Serving Platters & Bowls', slug: 'serving-platters', parentId: 'catering-equipment' },
      { id: 'bar-equipment', name: 'Bar Equipment', slug: 'bar-equipment', parentId: 'catering-equipment' },
      { id: 'beverage-dispensers', name: 'Beverage Dispensers', slug: 'beverage-dispensers', parentId: 'catering-equipment' },
      { id: 'catering-supplies', name: 'Catering Supplies & Utensils', slug: 'catering-supplies', parentId: 'catering-equipment' },
    ],
  },
  {
    id: 'photography-video',
    name: 'Photography & Video',
    slug: 'photography-video',
    icon: 'Camera' as CategoryIconName,
    subcategories: [
      { id: 'photo-booths', name: 'Photo Booths', slug: 'photo-booths', parentId: 'photography-video' },
      { id: 'cameras-lenses', name: 'Cameras & Lenses', slug: 'cameras-lenses', parentId: 'photography-video' },
      { id: 'lighting-kits', name: 'Lighting Kits', slug: 'lighting-kits', parentId: 'photography-video' },
      { id: 'video-cameras', name: 'Video Cameras & Camcorders', slug: 'video-cameras', parentId: 'photography-video' },
      { id: 'drones', name: 'Drones & Aerial Photography', slug: 'drones', parentId: 'photography-video' },
      { id: 'photo-props', name: 'Photo Props & Accessories', slug: 'photo-props', parentId: 'photography-video' },
    ],
  },
  {
    id: 'party-supplies',
    name: 'Party Supplies',
    slug: 'party-supplies',
    icon: 'PartyPopper' as CategoryIconName,
    subcategories: [
      { id: 'tableware', name: 'Disposable Tableware', slug: 'tableware', parentId: 'party-supplies' },
      { id: 'party-favors', name: 'Party Favors & Giveaways', slug: 'party-favors', parentId: 'party-supplies' },
      { id: 'banners-signs', name: 'Banners & Signs', slug: 'banners-signs', parentId: 'party-supplies' },
      { id: 'confetti-poppers', name: 'Confetti & Poppers', slug: 'confetti-poppers', parentId: 'party-supplies' },
      { id: 'cake-supplies', name: 'Cake Stands & Toppers', slug: 'cake-supplies', parentId: 'party-supplies' },
      { id: 'centerpieces', name: 'Centerpieces & Table Decor', slug: 'centerpieces', parentId: 'party-supplies' },
    ],
  },
  {
    id: 'event-clothing',
    name: 'Event Clothing & Costumes',
    slug: 'event-clothing-costumes',
    icon: 'Shirt' as CategoryIconName,
    subcategories: [
      { id: 'wedding-attire', name: 'Wedding Attire', slug: 'wedding-attire', parentId: 'event-clothing' },
      { id: 'traditional-wear', name: 'Traditional & Ethnic Wear', slug: 'traditional-wear', parentId: 'event-clothing' },
      { id: 'tuxedos-suits', name: 'Tuxedos & Formal Suits', slug: 'tuxedos-suits', parentId: 'event-clothing' },
      { id: 'costumes', name: 'Costumes & Character Outfits', slug: 'costumes', parentId: 'event-clothing' },
      { id: 'accessories', name: 'Accessories (Veils, Ties, etc.)', slug: 'accessories', parentId: 'event-clothing' },
      { id: 'kids-formal', name: "Kids' Formal Wear", slug: 'kids-formal', parentId: 'event-clothing' },
    ],
  },
  {
    id: 'stage-backdrops',
    name: 'Stage & Backdrops',
    slug: 'stage-backdrops',
    icon: 'LayoutPanelTop' as CategoryIconName,
    subcategories: [
      { id: 'stage-platforms', name: 'Stage Platforms', slug: 'stage-platforms', parentId: 'stage-backdrops' },
      { id: 'backdrop-stands', name: 'Backdrop Stands & Frames', slug: 'backdrop-stands', parentId: 'stage-backdrops' },
      { id: 'fabric-backdrops', name: 'Fabric Backdrops', slug: 'fabric-backdrops', parentId: 'stage-backdrops' },
      { id: 'floral-walls', name: 'Floral Walls', slug: 'floral-walls', parentId: 'stage-backdrops' },
      { id: 'pipe-drape', name: 'Pipe & Drape Systems', slug: 'pipe-drape', parentId: 'stage-backdrops' },
      { id: 'curtains', name: 'Stage Curtains & Skirting', slug: 'curtains', parentId: 'stage-backdrops' },
    ],
  },
  {
    id: 'floral-arrangements',
    name: 'Floral Arrangements',
    slug: 'floral-arrangements',
    icon: 'Flower' as CategoryIconName,
    subcategories: [
      { id: 'bouquets', name: 'Bouquets & Hand Flowers', slug: 'bouquets', parentId: 'floral-arrangements' },
      { id: 'centerpieces-floral', name: 'Floral Centerpieces', slug: 'centerpieces-floral', parentId: 'floral-arrangements' },
      { id: 'garlands', name: 'Garlands & Vines', slug: 'garlands', parentId: 'floral-arrangements' },
      { id: 'corsages', name: 'Corsages & Boutonnieres', slug: 'corsages', parentId: 'floral-arrangements' },
      { id: 'vases', name: 'Vases & Containers', slug: 'vases', parentId: 'floral-arrangements' },
      { id: 'artificial-flowers', name: 'Artificial Flowers', slug: 'artificial-flowers', parentId: 'floral-arrangements' },
    ],
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Activities',
    slug: 'entertainment-activities',
    icon: 'Gamepad2' as CategoryIconName,
    subcategories: [
      { id: 'inflatables', name: 'Inflatables & Bounce Houses', slug: 'inflatables', parentId: 'entertainment' },
      { id: 'carnival-games', name: 'Carnival Games', slug: 'carnival-games', parentId: 'entertainment' },
      { id: 'karaoke', name: 'Karaoke Equipment', slug: 'karaoke', parentId: 'entertainment' },
      { id: 'arcade-games', name: 'Arcade Games', slug: 'arcade-games', parentId: 'entertainment' },
      { id: 'lawn-games', name: 'Lawn & Outdoor Games', slug: 'lawn-games', parentId: 'entertainment' },
      { id: 'magic-props', name: 'Magic & Performance Props', slug: 'magic-props', parentId: 'entertainment' },
    ],
  },
];

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.slug === slug);
}

export function getAllSubcategories(): Array<{ id: string; name: string; parentId: string }> {
  return CATEGORIES.flatMap((cat) => cat.subcategories);
}
