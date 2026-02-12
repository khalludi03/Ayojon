/**
 * Production Seed Script for Ayojon - Bangladesh Event Rental Marketplace
 * 
 * - Downloads images from Unsplash
 * - Uploads to Supabase S3 bucket
 * - Seeds database with realistic Bangladesh market data
 * 
 * Run with: bun run packages/db/src/seed-production.ts
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import * as schema from "./schema";
import { S3Client } from "bun";
import { env } from "@my-better-t-app/env/server";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
});

const db = drizzle(pool, { schema });

const s3Client = new S3Client({
  accessKeyId: env.S3_ACCESS_KEY_ID,
  secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  bucket: env.S3_BUCKET,
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
});

function getPublicUrl(key: string): string {
  if (env.S3_PUBLIC_URL) {
    const baseUrl = env.S3_PUBLIC_URL.endsWith("/")
      ? env.S3_PUBLIC_URL.slice(0, -1)
      : env.S3_PUBLIC_URL;
    const cleanKey = key.startsWith("/") ? key.slice(1) : key;
    return `${baseUrl}/${cleanKey}`;
  }
  const endpoint = env.S3_ENDPOINT.endsWith("/")
    ? env.S3_ENDPOINT.slice(0, -1)
    : env.S3_ENDPOINT;
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  return `${endpoint}/${env.S3_BUCKET}/${cleanKey}`;
}

async function downloadAndUploadImage(sourceUrl: string, s3Key: string): Promise<string> {
  try {
    console.log(`    📥 Downloading: ${sourceUrl}`);
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      console.log(`    ⚠️ Image not available (${response.status}), using placeholder`);
      return `https://placehold.co/800x600/f5f5f5/666666?text=Image+Not+Available`;
    }
    
    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    
    const file = s3Client.file(s3Key);
    await file.write(buffer);
    
    const publicUrl = getPublicUrl(s3Key);
    console.log(`    ✅ Uploaded: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.log(`    ⚠️ Failed to upload, using placeholder`);
    return `https://placehold.co/800x600/f5f5f5/666666?text=Image+Not+Available`;
  }
}

async function uploadSeedImages(): Promise<Map<string, string>> {
  console.log("\n📤 Uploading seed images to S3...\n");
  
  const urlMap = new Map<string, string>();
  
  const images = [
    // Hero Banners (1920x600)
    { source: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=600&fit=crop", banner: "hero-wedding" },
    { source: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1920&h=600&fit=crop", banner: "hero-decorations" },
    { source: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1920&h=600&fit=crop", banner: "hero-party" },
    { source: "https://images.unsplash.com/photo-1519167758481-83f29da8c6c9?w=1920&h=600&fit=crop", banner: "hero-furniture" },
    
    // Promo Cards (400x300)
    { source: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop", promo: "promo-wedding" },
    { source: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop", promo: "promo-photo" },
    { source: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=300&fit=crop", promo: "promo-sound" },
    { source: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop", promo: "promo-entertainment" },
    
    // Category Banners
    { source: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&h=400&fit=crop", category: "decorations-banner" },
    { source: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=1200&h=400&fit=crop", category: "sound-lighting-banner" },
    { source: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=400&fit=crop", category: "furniture-banner" },
    { source: "https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&h=400&fit=crop", category: "catering-banner" },
    { source: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&h=400&fit=crop", category: "photography-banner" },
    { source: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&h=400&fit=crop", category: "party-banner" },
    { source: "https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=1200&h=400&fit=crop", category: "clothing-banner" },
    { source: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=400&fit=crop", category: "stage-banner" },
    { source: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&h=400&fit=crop", category: "floral-banner" },
    { source: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=400&fit=crop", category: "entertainment-banner" },
    
    // Product Images
    { source: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800", product: "balloon-arch" },
    { source: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800", product: "balloon-setup" },
    { source: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800", product: "birthday-decor" },
    { source: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800", product: "neon-sign" },
    { source: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800", product: "flower-wall" },
    { source: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800", product: "wedding-stage" },
    { source: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800", product: "pa-system" },
    { source: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800", product: "dj-setup" },
    { source: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800", product: "microphone" },
    { source: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800", product: "stage-lights" },
    { source: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800", product: "projector" },
    { source: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800", product: "chiavari-chair" },
    { source: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800", product: "tables" },
    { source: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800", product: "wedding-tent" },
    { source: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800", product: "party-canopy" },
    { source: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800", product: "lounge-furniture" },
    { source: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800", product: "chafing-dish" },
    { source: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800", product: "bar-equipment" },
    { source: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800", product: "serving-trays" },
    { source: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800", product: "photo-booth" },
    { source: "https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800", product: "groom-sherwani" },
    { source: "https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?w=800", product: "bridal-lehenga" },
    { source: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800", product: "kids-formal" },
    { source: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800", product: "stage-curtain" },
    { source: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800", product: "flowers" },
    { source: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800", product: "drone" },
    { source: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800", product: "karaoke" },
    { source: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800", product: "magic-show" },
    { source: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800", product: "cake-stand" },
    { source: "https://images.unsplash.com/photo-1544145945-f90425340cf7?w=800", product: "beverage-dispenser" },
    { source: "https://images.unsplash.com/photo-1519167758481-83f29da8c6c9?w=800", product: "furniture-general" },
  ];
  
  for (const img of images) {
    let key: string;
    if (img.banner) {
      key = `seed/banners/${img.banner}.jpg`;
    } else if (img.promo) {
      key = `seed/promos/${img.promo}.jpg`;
    } else if (img.category) {
      key = `seed/categories/${img.category}.jpg`;
    } else {
      key = `seed/products/${img.product}.jpg`;
    }
    
    const uploadedUrl = await downloadAndUploadImage(img.source, key);
    urlMap.set(img.source, uploadedUrl);
  }
  
  console.log(`\n  ✅ Uploaded ${urlMap.size} images\n`);
  return urlMap;
}

const CATEGORIES_DATA = [
  {
    id: "decorations",
    name: "Decorations & Balloons",
    slug: "decorations-balloons",
    icon: "Sparkles",
    description: "Transform your venue with stunning decorations, balloon arrangements, LED lights, and themed decor.",
    subcategories: [
      { id: "balloon-arches", name: "Balloon Arches & Bouquets", slug: "balloon-arches" },
      { id: "backdrops", name: "Backdrops & Photo Walls", slug: "backdrops" },
      { id: "led-decor", name: "LED Lights & Neon Signs", slug: "led-decor" },
      { id: "themed-decor", name: "Themed Decorations", slug: "themed-decor" },
      { id: "ceiling-decor", name: "Ceiling & Hanging Decor", slug: "ceiling-decor" },
      { id: "entrance-decor", name: "Entrance & Gate Decor", slug: "entrance-decor" },
      { id: "flower-arrangements", name: "Flower Arrangements", slug: "flower-arrangements" },
    ],
  },
  {
    id: "sound-lighting",
    name: "Sound & Lighting",
    slug: "sound-lighting",
    icon: "Mic",
    description: "Professional audio and lighting equipment for events of all sizes.",
    subcategories: [
      { id: "pa-systems", name: "PA Systems & Speakers", slug: "pa-systems" },
      { id: "microphones", name: "Microphones & Wireless Systems", slug: "microphones" },
      { id: "dj-equipment", name: "DJ Equipment", slug: "dj-equipment" },
      { id: "stage-lights", name: "Stage Lights & Effects", slug: "stage-lights" },
      { id: "uplighting", name: "Uplighting & Ambient Lights", slug: "uplighting" },
      { id: "projectors", name: "Projectors & Screens", slug: "projectors" },
    ],
  },
  {
    id: "furniture-tents",
    name: "Furniture & Tents",
    slug: "furniture-tents",
    icon: "Home",
    description: "Quality event furniture and tents for comfortable seating and weather protection.",
    subcategories: [
      { id: "chairs", name: "Chairs (Chiavari, Folding, etc.)", slug: "chairs" },
      { id: "tables", name: "Tables (Round, Banquet, Cocktail)", slug: "tables" },
      { id: "tents-canopies", name: "Tents & Canopies", slug: "tents-canopies" },
      { id: "lounge-furniture", name: "Lounge Furniture", slug: "lounge-furniture" },
      { id: "stages", name: "Stages & Platforms", slug: "stages" },
      { id: "linens-covers", name: "Table Linens & Chair Covers", slug: "linens-covers" },
    ],
  },
  {
    id: "catering-equipment",
    name: "Catering Equipment",
    slug: "catering-equipment",
    icon: "UtensilsCrossed",
    description: "Professional catering equipment and supplies for seamless food and beverage service.",
    subcategories: [
      { id: "chafing-dishes", name: "Chafing Dishes & Warmers", slug: "chafing-dishes" },
      { id: "glassware", name: "Glassware & Drinkware", slug: "glassware" },
      { id: "serving-platters", name: "Serving Platters & Bowls", slug: "serving-platters" },
      { id: "bar-equipment", name: "Bar Equipment", slug: "bar-equipment" },
      { id: "beverage-dispensers", name: "Beverage Dispensers", slug: "beverage-dispensers" },
      { id: "catering-supplies", name: "Catering Supplies & Utensils", slug: "catering-supplies" },
    ],
  },
  {
    id: "photography-video",
    name: "Photography & Video",
    slug: "photography-video",
    icon: "Camera",
    description: "Capture every precious moment with professional photography and videography equipment.",
    subcategories: [
      { id: "photo-booths", name: "Photo Booths", slug: "photo-booths" },
      { id: "cameras-lenses", name: "Cameras & Lenses", slug: "cameras-lenses" },
      { id: "lighting-kits", name: "Lighting Kits", slug: "lighting-kits" },
      { id: "video-cameras", name: "Video Cameras & Camcorders", slug: "video-cameras" },
      { id: "drones", name: "Drones & Aerial Photography", slug: "drones" },
      { id: "photo-props", name: "Photo Props & Accessories", slug: "photo-props" },
    ],
  },
  {
    id: "party-supplies",
    name: "Party Supplies",
    slug: "party-supplies",
    icon: "PartyPopper",
    description: "Complete party essentials and supplies to add fun and flair to any celebration.",
    subcategories: [
      { id: "tableware", name: "Disposable Tableware", slug: "tableware" },
      { id: "party-favors", name: "Party Favors & Giveaways", slug: "party-favors" },
      { id: "banners-signs", name: "Banners & Signs", slug: "banners-signs" },
      { id: "confetti-poppers", name: "Confetti & Poppers", slug: "confetti-poppers" },
      { id: "cake-supplies", name: "Cake Stands & Toppers", slug: "cake-supplies" },
      { id: "centerpieces", name: "Centerpieces & Table Decor", slug: "centerpieces" },
    ],
  },
  {
    id: "event-clothing",
    name: "Event Clothing & Costumes",
    slug: "event-clothing-costumes",
    icon: "Shirt",
    description: "Look your best with our collection of formal wear, traditional attire, and creative costumes.",
    subcategories: [
      { id: "wedding-attire", name: "Wedding Attire", slug: "wedding-attire" },
      { id: "traditional-wear", name: "Traditional & Ethnic Wear", slug: "traditional-wear" },
      { id: "tuxedos-suits", name: "Tuxedos & Formal Suits", slug: "tuxedos-suits" },
      { id: "costumes", name: "Costumes & Character Outfits", slug: "costumes" },
      { id: "accessories", name: "Accessories (Veils, Ties, etc.)", slug: "accessories" },
      { id: "kids-formal", name: "Kids' Formal Wear", slug: "kids-formal" },
    ],
  },
  {
    id: "stage-backdrops",
    name: "Stage & Backdrops",
    slug: "stage-backdrops",
    icon: "LayoutPanelTop",
    description: "Create the perfect focal point with professional stage setups and beautiful backdrops.",
    subcategories: [
      { id: "stage-platforms", name: "Stage Platforms", slug: "stage-platforms" },
      { id: "backdrop-stands", name: "Backdrop Stands & Frames", slug: "backdrop-stands" },
      { id: "fabric-backdrops", name: "Fabric Backdrops", slug: "fabric-backdrops" },
      { id: "floral-walls", name: "Floral Walls", slug: "floral-walls" },
      { id: "pipe-drape", name: "Pipe & Drape Systems", slug: "pipe-drape" },
      { id: "curtains", name: "Stage Curtains & Skirting", slug: "curtains" },
    ],
  },
  {
    id: "floral-arrangements",
    name: "Floral Arrangements",
    slug: "floral-arrangements",
    icon: "Flower",
    description: "Add natural beauty and elegance with fresh and artificial floral arrangements.",
    subcategories: [
      { id: "bouquets", name: "Bouquets & Hand Flowers", slug: "bouquets" },
      { id: "centerpieces-floral", name: "Floral Centerpieces", slug: "centerpieces-floral" },
      { id: "garlands", name: "Garlands & Vines", slug: "garlands" },
      { id: "corsages", name: "Corsages & Boutonnieres", slug: "corsages" },
      { id: "vases", name: "Vases & Containers", slug: "vases" },
      { id: "artificial-flowers", name: "Artificial Flowers", slug: "artificial-flowers" },
    ],
  },
  {
    id: "entertainment",
    name: "Entertainment & Activities",
    slug: "entertainment-activities",
    icon: "Gamepad2",
    description: "Keep your guests entertained with interactive games, inflatables, and performance equipment.",
    subcategories: [
      { id: "inflatables", name: "Inflatables & Bounce Houses", slug: "inflatables" },
      { id: "carnival-games", name: "Carnival Games", slug: "carnival-games" },
      { id: "karaoke", name: "Karaoke Equipment", slug: "karaoke" },
      { id: "arcade-games", name: "Arcade Games", slug: "arcade-games" },
      { id: "lawn-games", name: "Lawn & Outdoor Games", slug: "lawn-games" },
      { id: "magic-props", name: "Magic & Performance Props", slug: "magic-props" },
    ],
  },
];

const EVENT_TYPES_DATA = [
  { id: "wedding", name: "Wedding", slug: "wedding" },
  { id: "birthday", name: "Birthday Party", slug: "birthday" },
  { id: "corporate", name: "Corporate Event", slug: "corporate" },
  { id: "anniversary", name: "Anniversary", slug: "anniversary" },
  { id: "graduation", name: "Graduation", slug: "graduation" },
  { id: "baby-shower", name: "Baby Shower", slug: "baby-shower" },
  { id: "engagement", name: "Engagement", slug: "engagement" },
  { id: "religious", name: "Religious Ceremony", slug: "religious" },
  { id: "conference", name: "Conference", slug: "conference" },
  { id: "festival", name: "Festival", slug: "festival" },
];

type VendorLocation = "Dhaka" | "Chittagong" | "Sylhet" | "Rajshahi" | "Khulna";

const VENDORS_DATA: Array<{
  name: string;
  slug: string;
  description: string;
  location: VendorLocation;
  isVerified: boolean;
  phone: string;
  email: string;
}> = [
  {
    name: "Dhaka Event Essentials",
    slug: "dhaka-event-essentials",
    description: "Dhaka's premier event rental service since 2015. Quality products, timely delivery, and professional setup.",
    location: "Dhaka",
    isVerified: true,
    phone: "+880 1711-123456",
    email: "info@dhakaevent.com",
  },
  {
    name: "Royal Wedding Planners BD",
    slug: "royal-wedding-planners",
    description: "Specializing in luxury wedding decor and furniture. From traditional Bengali weddings to modern ceremonies.",
    location: "Dhaka",
    isVerified: true,
    phone: "+880 1819-234567",
    email: "royalweddingbd@gmail.com",
  },
  {
    name: "Sound & Light Pro Bangladesh",
    slug: "sound-light-pro-bd",
    description: "Professional sound systems and lighting solutions for events of all sizes.",
    location: "Dhaka",
    isVerified: true,
    phone: "+880 1911-345678",
    email: "soundlightpro@gmail.com",
  },
  {
    name: "Party Zone Chittagong",
    slug: "party-zone-chittagong",
    description: "Chittagong's favorite party supply store. Balloons, decorations, and everything for memorable celebrations.",
    location: "Chittagong",
    isVerified: true,
    phone: "+880 1812-456789",
    email: "partyzone.ctg@gmail.com",
  },
  {
    name: "Elegant Events Sylhet",
    slug: "elegant-events-sylhet",
    description: "Bringing elegance to every occasion in Sylhet. Wedding decor, furniture rental, and event styling.",
    location: "Sylhet",
    isVerified: true,
    phone: "+880 1713-567890",
    email: "elegantsylhet@gmail.com",
  },
  {
    name: "Photo Booth Bangladesh",
    slug: "photo-booth-bangladesh",
    description: "Premium photo booth rentals with instant printing and social media sharing.",
    location: "Dhaka",
    isVerified: true,
    phone: "+880 1914-678901",
    email: "photoboothbd@gmail.com",
  },
  {
    name: "Tent House Dhaka",
    slug: "tent-house-dhaka",
    description: "Premium tent and canopy rentals for outdoor events. Professional setup included.",
    location: "Dhaka",
    isVerified: true,
    phone: "+880 1815-789012",
    email: "tenthousedhaka@gmail.com",
  },
  {
    name: "Floral Dreams BD",
    slug: "floral-dreams-bd",
    description: "Beautiful fresh and artificial flower arrangements for weddings and special occasions.",
    location: "Dhaka",
    isVerified: true,
    phone: "+880 1716-890123",
    email: "floraldreamsbd@gmail.com",
  },
  {
    name: "DJ Equipment Rental BD",
    slug: "dj-equipment-rental",
    description: "Professional DJ equipment, speakers, and lighting for rent.",
    location: "Dhaka",
    isVerified: true,
    phone: "+880 1917-901234",
    email: "djrentalbd@gmail.com",
  },
  {
    name: "Kids Party World",
    slug: "kids-party-world",
    description: "Everything for kids parties! Bounce houses, carnival games, cartoon characters, and themed decorations.",
    location: "Dhaka",
    isVerified: true,
    phone: "+880 1818-012345",
    email: "kidspartyworld@gmail.com",
  },
  {
    name: "Corporate Events Solutions",
    slug: "corporate-events-solutions",
    description: "Complete corporate event solutions. Conference setups, stage decoration, and audio-visual equipment.",
    location: "Dhaka",
    isVerified: true,
    phone: "+880 1719-123450",
    email: "corporateeventbd@gmail.com",
  },
  {
    name: "Traditional Bengali Decor",
    slug: "traditional-bengali-decor",
    description: "Authentic Bengali wedding and event decoration. Shola decor, alpana, and cultural setups.",
    location: "Dhaka",
    isVerified: true,
    phone: "+880 1920-234561",
    email: "traditionaldecor@gmail.com",
  },
  {
    name: "Rajshahi Event Services",
    slug: "rajshahi-event-services",
    description: "Complete event rental services in Rajshahi region.",
    location: "Rajshahi",
    isVerified: false,
    phone: "+880 1721-345672",
    email: "rajshahevent@gmail.com",
  },
  {
    name: "Khulna Party Supplies",
    slug: "khulna-party-supplies",
    description: "Quality party supplies and event equipment in Khulna.",
    location: "Khulna",
    isVerified: false,
    phone: "+880 1822-456783",
    email: "khulnaparty@gmail.com",
  },
  {
    name: "Stage & Decor Pro",
    slug: "stage-decor-pro",
    description: "Professional stage construction and backdrop design.",
    location: "Dhaka",
    isVerified: true,
    phone: "+880 1923-567894",
    email: "stagedecorpro@gmail.com",
  },
];

function createProducts(imageUrls: Map<string, string>): any[] {
  const getImage = (originalUrl: string) => imageUrls.get(originalUrl) || originalUrl;
  
  return [
    {
      title: "Premium Balloon Arch Kit - Rose Gold",
      slug: "premium-balloon-arch-kit-rose-gold",
      description: "Create stunning balloon arches with our premium kit. Includes 150+ high-quality latex balloons in rose gold, pink, and white, decorative strip, and electric pump. Perfect for wedding entrances, birthday parties, and photo backdrops.",
      descriptionShort: "150+ balloon arch kit with pump",
      categoryId: "decorations",
      subcategoryId: "balloon-arches",
      price: "3500",
      salePrice: "2800",
      stock: 100,
      isFeatured: true,
      dealType: "flash",
      images: [
        { url: getImage("https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800"), alt: "Rose gold balloon arch kit", isPrimary: true },
      ],
      variants: [
        { type: "color", value: "Rose Gold Mix", priceModifier: "0", stock: 40 },
        { type: "color", value: "Blue Mix", priceModifier: "0", stock: 30 },
        { type: "color", value: "Gold Mix", priceModifier: "200", stock: 30 },
      ],
      eventTypes: ["wedding", "birthday", "engagement", "baby-shower"],
      content: {
        keyFeatures: ["150+ premium latex balloons", "Electric balloon pump included", "5m decorating strip", "Easy assembly guide"],
        whatsIncluded: ["60 rose gold balloons", "40 pink balloons", "50 white balloons", "5m decorating strip", "Electric pump"],
        badges: ["choice", "top_seller"] as string[],
        returnPolicy: "7-day return for unopened packages",
        warranty: "30 days on pump",
      },
    },
    {
      title: "Giant Number Balloons - Gold (0-9)",
      slug: "giant-number-balloons-gold",
      description: "40-inch metallic gold number balloons for birthdays and anniversaries. Self-sealing, helium-quality balloons.",
      descriptionShort: "40\" gold number balloons",
      categoryId: "decorations",
      subcategoryId: "balloon-arches",
      price: "450",
      salePrice: null,
      stock: 200,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800"), alt: "Gold number balloons", isPrimary: true },
      ],
      variants: [
        { type: "color", value: "Gold", priceModifier: "0", stock: 100 },
        { type: "color", value: "Silver", priceModifier: "0", stock: 50 },
        { type: "color", value: "Rose Gold", priceModifier: "50", stock: 50 },
      ],
      eventTypes: ["birthday", "anniversary"],
      content: {
        keyFeatures: ["40-inch size", "Self-sealing valve", "Helium quality", "Metallic finish"],
        whatsIncluded: ["1x Number balloon", "Straw for inflation", "Ribbon"],
        badges: ["top_seller"],
        returnPolicy: "No return on inflated balloons",
        warranty: "No warranty",
      },
    },
    {
      title: "LED Curtain Lights - 3m x 3m",
      slug: "led-curtain-lights-3x3m",
      description: "Beautiful LED curtain lights for backdrop decoration. 300 warm white LEDs, 8 lighting modes, remote control included.",
      descriptionShort: "300 LED curtain lights with remote",
      categoryId: "decorations",
      subcategoryId: "led-decor",
      price: "1800",
      salePrice: "1450",
      stock: 75,
      isFeatured: true,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800"), alt: "LED curtain lights", isPrimary: true },
      ],
      variants: [
        { type: "color", value: "Warm White", priceModifier: "0", stock: 30 },
        { type: "color", value: "Cool White", priceModifier: "0", stock: 25 },
        { type: "color", value: "Multi-color", priceModifier: "200", stock: 20 },
      ],
      eventTypes: ["wedding", "birthday", "festival", "religious"],
      content: {
        keyFeatures: ["300 LED lights", "8 lighting modes", "Remote control", "IP44 waterproof"],
        whatsIncluded: ["LED curtain", "Remote control", "Power adapter", "Hooks"],
        badges: ["choice"],
        returnPolicy: "7-day return policy",
        warranty: "6 months",
      },
    },
    {
      title: "Custom Neon Sign - Wedding/Event",
      slug: "custom-neon-sign-wedding",
      description: "Personalized LED neon sign for your special event. Custom text up to 12 characters.",
      descriptionShort: "Custom LED neon sign - 12 chars",
      categoryId: "decorations",
      subcategoryId: "led-decor",
      price: "12000",
      salePrice: "9500",
      stock: 30,
      isFeatured: true,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1557683316-973673baf926?w=800"), alt: "Custom neon sign", isPrimary: true },
      ],
      variants: [
        { type: "color", value: "Warm White", priceModifier: "0", stock: 10 },
        { type: "color", value: "Pink", priceModifier: "0", stock: 10 },
        { type: "color", value: "Blue", priceModifier: "500", stock: 10 },
      ],
      eventTypes: ["wedding", "birthday", "engagement"],
      content: {
        keyFeatures: ["Custom text up to 12 chars", "Multiple color options", "Dimmer control", "Low energy LED"],
        whatsIncluded: ["Custom neon sign", "Power adapter", "Mounting kit", "Dimmer switch"],
        badges: ["new", "choice"],
        setupInstructions: "Wall mount or stand included",
        returnPolicy: "Custom items non-returnable unless defective",
        warranty: "1 year",
      },
    },
    {
      title: "Flower Wall Backdrop - White Roses",
      slug: "flower-wall-backdrop-white-roses",
      description: "Stunning artificial flower wall backdrop featuring premium silk roses. 2.4m x 2.4m panel.",
      descriptionShort: "2.4m x 2.4m artificial rose wall",
      categoryId: "decorations",
      subcategoryId: "backdrops",
      price: "25000",
      salePrice: null,
      stock: 15,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800"), alt: "White rose flower wall", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "engagement", "birthday"],
      content: {
        keyFeatures: ["Premium silk flowers", "2.4m x 2.4m size", "Easy assembly", "Reusable"],
        whatsIncluded: ["Flower wall panels", "Stand frame", "Assembly instructions"],
        badges: ["verified"],
        setupInstructions: "Professional setup available for additional fee",
        returnPolicy: "14-day return policy",
        warranty: "No warranty",
      },
    },
    {
      title: "Wedding Stage Decoration Package",
      slug: "wedding-stage-decoration-package",
      description: "Complete wedding stage decoration set includes fabric draping, LED lights, flower arrangements, and decorative elements.",
      descriptionShort: "Complete wedding stage setup",
      categoryId: "decorations",
      subcategoryId: "themed-decor",
      price: "85000",
      salePrice: "75000",
      stock: 10,
      isFeatured: true,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1519741497674-611481863552?w=800"), alt: "Wedding stage decoration", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "engagement"],
      content: {
        keyFeatures: ["Complete stage setup", "Premium fabrics", "LED lighting included", "Customizable design"],
        whatsIncluded: ["Fabric backdrop", "LED lights", "Flower arrangements", "Floor carpet", "Side decorations"],
        badges: ["choice", "verified"],
        setupInstructions: "Professional setup included in Dhaka",
        returnPolicy: "Booking cancellation 7 days before event",
        warranty: "Full coverage during event",
      },
    },
    {
      title: "JBL PartyBox 310 - Portable PA System",
      slug: "jbl-partybox-310-portable-pa",
      description: "Professional 240W portable PA system with built-in light show. Bluetooth connectivity, microphone input. 18-hour battery life.",
      descriptionShort: "240W portable PA with light show",
      categoryId: "sound-lighting",
      subcategoryId: "pa-systems",
      price: "8500",
      salePrice: null,
      stock: 8,
      isFeatured: true,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800"), alt: "JBL PartyBox 310", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["birthday", "wedding", "corporate"],
      content: {
        keyFeatures: ["240W output", "Built-in light show", "18-hour battery", "Bluetooth 5.1"],
        whatsIncluded: ["JBL PartyBox 310", "Power cable", "Microphone cable", "User manual"],
        badges: ["verified", "choice"],
        setupInstructions: "Plug and play - easy setup",
        returnPolicy: "7-day return policy",
        warranty: "1 year manufacturer warranty",
      },
    },
    {
      title: "Professional PA System - 1000W",
      slug: "professional-pa-system-1000w",
      description: "Complete professional PA system with 2x 15\" speakers, 10-channel mixer, wireless microphones. Includes delivery and setup in Dhaka.",
      descriptionShort: "1000W PA system with wireless mics",
      categoryId: "sound-lighting",
      subcategoryId: "pa-systems",
      price: "15000",
      salePrice: "12500",
      stock: 5,
      isFeatured: true,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800"), alt: "Professional PA system", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "corporate", "conference", "festival"],
      content: {
        keyFeatures: ["1000W total output", "2x 15\" speakers", "10-channel mixer", "2 wireless mics"],
        whatsIncluded: ["2x Speaker cabinets", "10-channel mixer", "2x Wireless microphones", "2x Speaker stands", "All cables"],
        badges: ["verified"],
        setupInstructions: "Professional setup available for BDT 2000",
        returnPolicy: "48-hour cancellation policy",
        warranty: "Full coverage during rental period",
      },
    },
    {
      title: "Shure SM58 Wireless Microphone Set",
      slug: "shure-sm58-wireless-microphone-set",
      description: "Professional wireless microphone system with 2x SM58 legendary vocal mics. Crystal clear sound, 100m range.",
      descriptionShort: "2x SM58 wireless microphones",
      categoryId: "sound-lighting",
      subcategoryId: "microphones",
      price: "4500",
      salePrice: null,
      stock: 12,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800"), alt: "Shure SM58 wireless set", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "corporate", "conference"],
      content: {
        keyFeatures: ["Legendary SM58 sound", "100m wireless range", "14-hour battery", "Easy setup"],
        whatsIncluded: ["2x SM58 handhelds", "Receiver unit", "Power adapter", "Carry case"],
        badges: ["verified"],
        returnPolicy: "7-day return policy",
        warranty: "Full coverage during rental",
      },
    },
    {
      title: "Pioneer DJ Controller - DDJ-FLX4",
      slug: "pioneer-dj-controller-ddj-flx4",
      description: "Professional 2-channel DJ controller compatible with Rekordbox and Serato DJ.",
      descriptionShort: "2-channel DJ controller",
      categoryId: "sound-lighting",
      subcategoryId: "dj-equipment",
      price: "6000",
      salePrice: null,
      stock: 6,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=800"), alt: "Pioneer DDJ-FLX4", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "birthday", "corporate"],
      content: {
        keyFeatures: ["Compatible with Rekordbox/Serato", "Large jog wheels", "Performance pads", "Built-in sound card"],
        whatsIncluded: ["DDJ-FLX4 controller", "USB cable", "Software license", "User manual"],
        badges: ["verified"],
        returnPolicy: "7-day return policy",
        warranty: "Full coverage during rental",
      },
    },
    {
      title: "Stage Light Package - 8 PAR + 4 Moving Heads",
      slug: "stage-light-package-par-moving",
      description: "Complete stage lighting package with 8x LED PAR cans and 4x moving head lights. DMX controller included.",
      descriptionShort: "12 light stage package",
      categoryId: "sound-lighting",
      subcategoryId: "stage-lights",
      price: "18000",
      salePrice: "15000",
      stock: 4,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800"), alt: "Stage light package", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "corporate", "conference", "festival"],
      content: {
        keyFeatures: ["8x LED PAR cans", "4x Moving heads", "DMX controller", "Multiple color modes"],
        whatsIncluded: ["8x LED PAR lights", "4x Moving head lights", "DMX controller", "All cables and stands"],
        badges: ["choice"],
        setupInstructions: "Professional setup available for BDT 3000",
        returnPolicy: "48-hour cancellation policy",
        warranty: "Full coverage during rental",
      },
    },
    {
      title: "3000 Lumens Projector + 100\" Screen",
      slug: "projector-3000-lumens-100-screen",
      description: "Full HD 1080p projector with 3000 lumens brightness. Includes 100-inch motorized screen.",
      descriptionShort: "Full HD projector with 100\" screen",
      categoryId: "sound-lighting",
      subcategoryId: "projectors",
      price: "5000",
      salePrice: null,
      stock: 8,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800"), alt: "Projector and screen", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "corporate", "conference", "birthday"],
      content: {
        keyFeatures: ["1080p Full HD", "3000 lumens", "100\" motorized screen", "HDMI/VGA inputs"],
        whatsIncluded: ["HD Projector", "100\" motorized screen", "Remote control", "HDMI cable", "Tripod stand"],
        badges: ["verified"],
        returnPolicy: "7-day return policy",
        warranty: "Full coverage during rental",
      },
    },
    {
      title: "Chiavari Chair - Gold (Rental)",
      slug: "chiavari-chair-gold-rental",
      description: "Elegant gold chiavari chairs perfect for weddings and formal events. Premium polycarbonate construction with comfortable cushion. Minimum rental: 50 chairs.",
      descriptionShort: "Gold chiavari chair with cushion",
      categoryId: "furniture-tents",
      subcategoryId: "chairs",
      price: "120",
      salePrice: "99",
      stock: 500,
      isFeatured: true,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1519167758481-83f29da8c6c9?w=800"), alt: "Gold chiavari chair", isPrimary: true },
      ],
      variants: [
        { type: "color", value: "Gold", priceModifier: "0", stock: 200 },
        { type: "color", value: "Silver", priceModifier: "0", stock: 150 },
        { type: "color", value: "White", priceModifier: "-10", stock: 150 },
      ],
      eventTypes: ["wedding", "engagement", "corporate"],
      content: {
        keyFeatures: ["Premium polycarbonate", "150kg weight capacity", "Stackable design", "Cushion included"],
        whatsIncluded: ["1x Chiavari chair", "1x Seat cushion"],
        badges: ["top_seller", "choice"],
        returnPolicy: "Minimum rental 50 chairs",
        warranty: "Full coverage during rental",
      },
    },
    {
      title: "Round Banquet Table - 5ft",
      slug: "round-banquet-table-5ft",
      description: "Professional 5ft round banquet table seats 8-10 guests. Folding legs for easy storage.",
      descriptionShort: "5ft round folding table",
      categoryId: "furniture-tents",
      subcategoryId: "tables",
      price: "350",
      salePrice: null,
      stock: 100,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1519167758481-83f29da8c6c9?w=800"), alt: "Round banquet table", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "corporate", "birthday"],
      content: {
        keyFeatures: ["5ft diameter", "Seats 8-10", "Folding legs", "Heavy-duty construction"],
        whatsIncluded: ["1x Round table", "Table cover (optional)"],
        badges: ["top_seller"],
        returnPolicy: "Minimum rental 10 tables",
        warranty: "Full coverage during rental",
      },
    },
    {
      title: "Wedding Tent - 40x60ft",
      slug: "wedding-tent-40x60ft",
      description: "Large 40x60ft wedding tent accommodates up to 300 guests. White canvas with aluminum frame. Includes sidewalls, lighting, and professional setup.",
      descriptionShort: "40x60ft tent (300 guests)",
      categoryId: "furniture-tents",
      subcategoryId: "tents-canopies",
      price: "150000",
      salePrice: "120000",
      stock: 3,
      isFeatured: true,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800"), alt: "Wedding tent", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "festival", "corporate"],
      content: {
        keyFeatures: ["40x60ft size", "300 guest capacity", "White canvas", "Weather resistant"],
        whatsIncluded: ["Complete tent structure", "Sidewalls", "Basic lighting", "Setup/dismantle"],
        badges: ["verified", "choice"],
        setupInstructions: "Professional setup included",
        returnPolicy: "Booking cancellation 14 days before event",
        warranty: "Full coverage during event",
      },
    },
    {
      title: "Lounge Furniture Set - Modern",
      slug: "lounge-furniture-set-modern",
      description: "Complete modern lounge set includes 2x sofas, 2x armchairs, 1x coffee table, and 2x side tables.",
      descriptionShort: "5-piece lounge furniture set",
      categoryId: "furniture-tents",
      subcategoryId: "lounge-furniture",
      price: "12000",
      salePrice: null,
      stock: 4,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"), alt: "Lounge furniture set", isPrimary: true },
      ],
      variants: [
        { type: "color", value: "White", priceModifier: "0", stock: 2 },
        { type: "color", value: "Grey", priceModifier: "0", stock: 1 },
        { type: "color", value: "Navy", priceModifier: "500", stock: 1 },
      ],
      eventTypes: ["wedding", "corporate", "conference"],
      content: {
        keyFeatures: ["Modern design", "Premium fabric", "Comfortable seating", "Elegant appearance"],
        whatsIncluded: ["2x Sofas", "2x Armchairs", "1x Coffee table", "2x Side tables"],
        badges: ["choice"],
        setupInstructions: "Delivery and setup included in Dhaka",
        returnPolicy: "48-hour cancellation policy",
        warranty: "Full coverage during rental",
      },
    },
    {
      title: "Chair Cover & Sash Set",
      slug: "chair-cover-sash-set",
      description: "Premium spandex chair covers with matching sashes. Fits standard chiavari and folding chairs.",
      descriptionShort: "Chair cover with sash",
      categoryId: "furniture-tents",
      subcategoryId: "linens-covers",
      price: "80",
      salePrice: "65",
      stock: 500,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1519167758481-83f29da8c6c9?w=800"), alt: "Chair cover set", isPrimary: true },
      ],
      variants: [
        { type: "color", value: "White/Gold", priceModifier: "0", stock: 150 },
        { type: "color", value: "White/Pink", priceModifier: "0", stock: 100 },
        { type: "color", value: "Ivory/Champagne", priceModifier: "10", stock: 100 },
      ],
      eventTypes: ["wedding", "engagement", "anniversary"],
      content: {
        keyFeatures: ["Premium spandex", "Universal fit", "Wrinkle-free", "Machine washable"],
        whatsIncluded: ["1x Chair cover", "1x Decorative sash"],
        badges: ["top_seller"],
        returnPolicy: "Minimum rental 50 sets",
        warranty: "No warranty",
      },
    },
    {
      title: "Chafing Dish Set - Full Size",
      slug: "chafing-dish-set-full-size",
      description: "Professional full-size chafing dish with fuel holders. Keeps food warm for hours.",
      descriptionShort: "Full-size chafing dish",
      categoryId: "catering-equipment",
      subcategoryId: "chafing-dishes",
      price: "800",
      salePrice: "650",
      stock: 50,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1555244162-803834f70033?w=800"), alt: "Chafing dish", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "corporate", "birthday", "festival"],
      content: {
        keyFeatures: ["Full-size 20x12\"", "Stainless steel", "Fuel holders included", "Easy assembly"],
        whatsIncluded: ["Chafing dish frame", "Water pan", "Food pan", "Cover", "2x Fuel holders"],
        badges: ["top_seller"],
        returnPolicy: "7-day return policy",
        warranty: "Full coverage during rental",
      },
    },
    {
      title: "Beverage Dispenser - 3 Gallon",
      slug: "beverage-dispenser-3-gallon",
      description: "Elegant 3-gallon beverage dispenser with metal stand and spigot. BPA-free acrylic container.",
      descriptionShort: "3-gallon drink dispenser",
      categoryId: "catering-equipment",
      subcategoryId: "beverage-dispensers",
      price: "1200",
      salePrice: "950",
      stock: 25,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1544145945-f90425340cf7?w=800"), alt: "Beverage dispenser", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "birthday", "corporate"],
      content: {
        keyFeatures: ["3-gallon capacity", "Metal stand included", "Easy-pour spigot", "BPA-free"],
        whatsIncluded: ["Acrylic container", "Metal stand", "Lid"],
        badges: ["choice"],
        returnPolicy: "7-day return policy",
        warranty: "No warranty",
      },
    },
    {
      title: "Bar Equipment Package",
      slug: "bar-equipment-package",
      description: "Complete bar setup includes cocktail shaker, jigger, muddler, strainer, bar spoon, cutting board, and ice bucket.",
      descriptionShort: "Complete 10-piece bar set",
      categoryId: "catering-equipment",
      subcategoryId: "bar-equipment",
      price: "4500",
      salePrice: null,
      stock: 10,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800"), alt: "Bar equipment set", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "corporate", "birthday"],
      content: {
        keyFeatures: ["Complete bar set", "Professional quality", "Stainless steel", "Carry case included"],
        whatsIncluded: ["Cocktail shaker", "Jigger", "Muddler", "Strainer", "Bar spoon", "Cutting board", "Ice bucket", "Pour spouts set", "Bar mat", "Carry case"],
        badges: ["verified"],
        returnPolicy: "7-day return policy",
        warranty: "Full coverage during rental",
      },
    },
    {
      title: "360 Photo Booth - Complete",
      slug: "360-photo-booth-complete",
      description: "Professional 360-degree video booth creates stunning slow-motion videos. Operator included.",
      descriptionShort: "360° photo booth with operator",
      categoryId: "photography-video",
      subcategoryId: "photo-booths",
      price: "45000",
      salePrice: "38000",
      stock: 3,
      isFeatured: true,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800"), alt: "360 photo booth", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "corporate", "birthday", "festival"],
      content: {
        keyFeatures: ["360° slow motion video", "Instant social sharing", "LED lighting", "Operator included"],
        whatsIncluded: ["360 platform", "iPad with software", "LED ring light", "Backdrop", "Operator service"],
        badges: ["choice", "verified"],
        setupInstructions: "Professional setup and operator included",
        returnPolicy: "Booking cancellation 7 days before event",
        warranty: "Full coverage during event",
      },
    },
    {
      title: "Classic Photo Booth",
      slug: "classic-photo-booth",
      description: "Traditional photo booth with instant prints. Includes props, backdrop, and attendant.",
      descriptionShort: "Photo booth with prints",
      categoryId: "photography-video",
      subcategoryId: "photo-booths",
      price: "25000",
      salePrice: "22000",
      stock: 5,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800"), alt: "Classic photo booth", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "birthday", "corporate"],
      content: {
        keyFeatures: ["Instant prints", "Props included", "Backdrops available", "Attendant service"],
        whatsIncluded: ["Photo booth enclosure", "Camera and printer", "Props set", "Backdrop", "Unlimited prints"],
        badges: ["top_seller"],
        setupInstructions: "Professional setup included",
        returnPolicy: "Booking cancellation 7 days before event",
        warranty: "Full coverage during event",
      },
    },
    {
      title: "Ring Light with Stand - 18\"",
      slug: "ring-light-stand-18-inch",
      description: "Professional 18-inch LED ring light with adjustable stand. Phone holder included.",
      descriptionShort: "18\" ring light with stand",
      categoryId: "photography-video",
      subcategoryId: "lighting-kits",
      price: "1500",
      salePrice: null,
      stock: 20,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800"), alt: "Ring light setup", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "birthday", "corporate"],
      content: {
        keyFeatures: ["18\" diameter", "Adjustable brightness", "Color temperature control", "Phone holder"],
        whatsIncluded: ["Ring light", "Stand (6ft)", "Phone holder", "Power adapter", "Carry bag"],
        badges: ["top_seller"],
        returnPolicy: "7-day return policy",
        warranty: "6 months",
      },
    },
    {
      title: "Drone Photography - DJI Mavic 3",
      slug: "drone-photography-dji-mavic-3",
      description: "Professional aerial photography and videography with DJI Mavic 3. Licensed pilot included.",
      descriptionShort: "Aerial photography service",
      categoryId: "photography-video",
      subcategoryId: "drones",
      price: "35000",
      salePrice: null,
      stock: 2,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800"), alt: "Drone photography", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "corporate", "festival"],
      content: {
        keyFeatures: ["4K video", "20MP photos", "Licensed pilot", "Edited footage"],
        whatsIncluded: ["2 hours shooting", "Edited video reel", "25+ edited photos", "Raw footage"],
        badges: ["verified", "choice"],
        setupInstructions: "Licensed pilot included",
        returnPolicy: "Weather-dependent rescheduling",
        warranty: "Full coverage",
      },
    },
    {
      title: "Disposable Dinnerware Set - 100 Guests",
      slug: "disposable-dinnerware-set-100-guests",
      description: "Complete disposable dinnerware for 100 guests. Premium plastic plates, cups, and cutlery.",
      descriptionShort: "100-guest dinnerware set",
      categoryId: "party-supplies",
      subcategoryId: "tableware",
      price: "5000",
      salePrice: "4200",
      stock: 40,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800"), alt: "Dinnerware set", isPrimary: true },
      ],
      variants: [
        { type: "color", value: "Gold", priceModifier: "0", stock: 15 },
        { type: "color", value: "Silver", priceModifier: "0", stock: 15 },
        { type: "color", value: "White", priceModifier: "-500", stock: 10 },
      ],
      eventTypes: ["wedding", "birthday", "corporate"],
      content: {
        keyFeatures: ["Premium quality", "Elegant design", "Food-safe", "Complete set"],
        whatsIncluded: ["100x Dinner plates", "100x Salad plates", "100x Cups", "100x Forks", "100x Knives", "100x Spoons"],
        badges: ["choice"],
        returnPolicy: "7-day return for unopened items",
        warranty: "No warranty",
      },
    },
    {
      title: "Confetti Cannons - 10 Pack",
      slug: "confetti-cannons-10-pack",
      description: "Party confetti cannons for spectacular celebrations. 10 pack with biodegradable paper confetti.",
      descriptionShort: "10 confetti cannons",
      categoryId: "party-supplies",
      subcategoryId: "confetti-poppers",
      price: "1200",
      salePrice: "999",
      stock: 60,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800"), alt: "Confetti cannons", isPrimary: true },
      ],
      variants: [
        { type: "color", value: "Multicolor", priceModifier: "0", stock: 25 },
        { type: "color", value: "Gold", priceModifier: "100", stock: 20 },
        { type: "color", value: "White", priceModifier: "0", stock: 15 },
      ],
      eventTypes: ["wedding", "birthday", "festival"],
      content: {
        keyFeatures: ["Shoots 20ft high", "Biodegradable confetti", "Easy to use", "Safe for indoor/outdoor"],
        whatsIncluded: ["10x Confetti cannons"],
        badges: ["top_seller"],
        returnPolicy: "No return on used items",
        warranty: "No warranty",
      },
    },
    {
      title: "Acrylic Cake Stand - 3 Tier",
      slug: "acrylic-cake-stand-3-tier",
      description: "Elegant 3-tier acrylic cake stand for weddings and parties. Crystal clear design.",
      descriptionShort: "3-tier acrylic cake stand",
      categoryId: "party-supplies",
      subcategoryId: "cake-supplies",
      price: "3500",
      salePrice: null,
      stock: 15,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800"), alt: "3-tier cake stand", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "birthday", "engagement"],
      content: {
        keyFeatures: ["Crystal clear acrylic", "3 tier design", "Easy assembly", "Sturdy construction"],
        whatsIncluded: ["3x Acrylic plates", "Center rod", "Base"],
        badges: ["choice"],
        returnPolicy: "7-day return policy",
        warranty: "No warranty",
      },
    },
    {
      title: "Groom Sherwani - Premium",
      slug: "groom-sherwani-premium",
      description: "Premium groom sherwani with intricate embroidery. Complete set includes sherwani, churidar, stole, and mojari shoes.",
      descriptionShort: "Complete groom sherwani set",
      categoryId: "event-clothing",
      subcategoryId: "wedding-attire",
      price: "8000",
      salePrice: null,
      stock: 10,
      isFeatured: true,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800"), alt: "Groom sherwani", isPrimary: true },
      ],
      variants: [
        { type: "color", value: "Cream/Gold", priceModifier: "0", stock: 4 },
        { type: "color", value: "Navy/Gold", priceModifier: "0", stock: 3 },
        { type: "color", value: "Maroon/Gold", priceModifier: "1000", stock: 3 },
      ],
      eventTypes: ["wedding", "engagement"],
      content: {
        keyFeatures: ["Premium fabric", "Intricate embroidery", "Complete set", "Multiple sizes"],
        whatsIncluded: ["Sherwani top", "Churidar pants", "Stole/dupatta", "Mojari shoes"],
        badges: ["verified", "choice"],
        setupInstructions: "Dry cleaning included",
        returnPolicy: "3-day return for unworn items",
        warranty: "No warranty",
      },
    },
    {
      title: "Bridal Lehenga - Designer",
      slug: "bridal-lehenga-designer",
      description: "Stunning designer bridal lehenga with heavy embroidery and dupatta. Premium quality fabric.",
      descriptionShort: "Designer bridal lehenga",
      categoryId: "event-clothing",
      subcategoryId: "wedding-attire",
      price: "25000",
      salePrice: "22000",
      stock: 5,
      isFeatured: true,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?w=800"), alt: "Bridal lehenga", isPrimary: true },
      ],
      variants: [
        { type: "color", value: "Red/Gold", priceModifier: "0", stock: 2 },
        { type: "color", value: "Maroon/Gold", priceModifier: "0", stock: 2 },
        { type: "color", value: "Pink/Gold", priceModifier: "2000", stock: 1 },
      ],
      eventTypes: ["wedding"],
      content: {
        keyFeatures: ["Heavy embroidery", "Premium fabric", "Designer piece", "Complete set"],
        whatsIncluded: ["Lehenga skirt", "Choli/blouse", "Dupatta", "Storage bag"],
        badges: ["verified", "choice"],
        setupInstructions: "Professional fitting available",
        returnPolicy: "3-day return for unworn items",
        warranty: "No warranty",
      },
    },
    {
      title: "Tuxedo Suit - Premium",
      slug: "tuxedo-suit-premium",
      description: "Premium black tuxedo suit for formal events. Includes jacket, pants, shirt, bow tie, and cummerbund.",
      descriptionShort: "Complete tuxedo suit",
      categoryId: "event-clothing",
      subcategoryId: "tuxedos-suits",
      price: "6000",
      salePrice: null,
      stock: 15,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"), alt: "Tuxedo suit", isPrimary: true },
      ],
      variants: [
        { type: "color", value: "Black", priceModifier: "0", stock: 10 },
        { type: "color", value: "Navy", priceModifier: "0", stock: 5 },
      ],
      eventTypes: ["wedding", "corporate", "conference"],
      content: {
        keyFeatures: ["Premium wool blend", "Tailored fit", "Complete set", "Multiple sizes"],
        whatsIncluded: ["Tuxedo jacket", "Dress pants", "Dress shirt", "Bow tie", "Cummerbund"],
        badges: ["verified"],
        setupInstructions: "Professional fitting included",
        returnPolicy: "3-day return for unworn items",
        warranty: "No warranty",
      },
    },
    {
      title: "Kids Formal Set - Boy",
      slug: "kids-formal-set-boy",
      description: "Adorable formal suit set for boys. Includes jacket, shirt, pants, and bow tie. Ages 2-12.",
      descriptionShort: "Boys formal suit set",
      categoryId: "event-clothing",
      subcategoryId: "kids-formal",
      price: "2500",
      salePrice: null,
      stock: 20,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800"), alt: "Kids formal set", isPrimary: true },
      ],
      variants: [
        { type: "color", value: "Navy", priceModifier: "0", stock: 8 },
        { type: "color", value: "Black", priceModifier: "0", stock: 7 },
        { type: "color", value: "Grey", priceModifier: "0", stock: 5 },
      ],
      eventTypes: ["wedding", "birthday", "religious"],
      content: {
        keyFeatures: ["Comfortable fabric", "Tailored fit", "Complete set", "Ages 2-12"],
        whatsIncluded: ["Jacket", "Shirt", "Pants", "Bow tie"],
        badges: [],
        returnPolicy: "3-day return for unworn items",
        warranty: "No warranty",
      },
    },
    {
      title: "Wedding Backdrop Panel - White Floral",
      slug: "wedding-backdrop-panel-white-floral",
      description: "Elegant white floral backdrop panel for wedding ceremonies. 8x8ft with artificial flowers and greenery.",
      descriptionShort: "8x8ft floral backdrop panel",
      categoryId: "stage-backdrops",
      subcategoryId: "floral-walls",
      price: "35000",
      salePrice: null,
      stock: 5,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800"), alt: "Floral backdrop", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "engagement"],
      content: {
        keyFeatures: ["8x8ft size", "Premium artificial flowers", "Professional setup", "Reusable"],
        whatsIncluded: ["Backdrop panel", "Stand frame", "Setup service"],
        badges: ["choice", "verified"],
        setupInstructions: "Professional setup included in Dhaka",
        returnPolicy: "Booking cancellation 7 days before event",
        warranty: "Full coverage during event",
      },
    },
    {
      title: "Pipe and Drape System - 20ft",
      slug: "pipe-and-drape-system-20ft",
      description: "Professional pipe and drape system for creating elegant backdrops. 20ft wide x 10ft tall.",
      descriptionShort: "20ft pipe & drape kit",
      categoryId: "stage-backdrops",
      subcategoryId: "pipe-drape",
      price: "12000",
      salePrice: null,
      stock: 8,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1519741497674-611481863552?w=800"), alt: "Pipe and drape", isPrimary: true },
      ],
      variants: [
        { type: "color", value: "White", priceModifier: "0", stock: 3 },
        { type: "color", value: "Ivory", priceModifier: "0", stock: 3 },
        { type: "color", value: "Black", priceModifier: "0", stock: 2 },
      ],
      eventTypes: ["wedding", "corporate", "conference"],
      content: {
        keyFeatures: ["20ft wide", "10ft tall", "Easy setup", "Multiple colors"],
        whatsIncluded: ["Upright posts", "Crossbar", "Base plates", "Fabric drape"],
        badges: [],
        setupInstructions: "Setup instructions included",
        returnPolicy: "7-day return policy",
        warranty: "Full coverage during rental",
      },
    },
    {
      title: "Stage Curtain - Red Velvet",
      slug: "stage-curtain-red-velvet",
      description: "Luxurious red velvet stage curtain. 20x12ft with gold fringe.",
      descriptionShort: "20x12ft velvet curtain",
      categoryId: "stage-backdrops",
      subcategoryId: "curtains",
      price: "18000",
      salePrice: null,
      stock: 4,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800"), alt: "Red velvet curtain", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "corporate", "festival"],
      content: {
        keyFeatures: ["Premium velvet", "Gold fringe detail", "20x12ft size", "Mounting hardware"],
        whatsIncluded: ["Velvet curtain", "Mounting hardware", "Tie-backs"],
        badges: [],
        setupInstructions: "Professional setup available",
        returnPolicy: "7-day return policy",
        warranty: "No warranty",
      },
    },
    {
      title: "Bridal Bouquet - Fresh Flowers",
      slug: "bridal-bouquet-fresh-flowers",
      description: "Stunning fresh flower bridal bouquet with roses, lilies, and baby's breath. Custom color options available.",
      descriptionShort: "Fresh bridal bouquet",
      categoryId: "floral-arrangements",
      subcategoryId: "bouquets",
      price: "5000",
      salePrice: null,
      stock: 10,
      isFeatured: true,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800"), alt: "Bridal bouquet", isPrimary: true },
      ],
      variants: [
        { type: "color", value: "White/Rose", priceModifier: "0", stock: 4 },
        { type: "color", value: "Pink/White", priceModifier: "0", stock: 3 },
        { type: "color", value: "Red", priceModifier: "500", stock: 3 },
      ],
      eventTypes: ["wedding"],
      content: {
        keyFeatures: ["Fresh flowers", "Professional arrangement", "Custom colors", "Same-day delivery"],
        whatsIncluded: ["Bridal bouquet", "Boutonniere"],
        badges: ["choice"],
        returnPolicy: "No return on fresh flowers",
        warranty: "Quality guarantee",
      },
    },
    {
      title: "Table Centerpiece - Floral",
      slug: "table-centerpiece-floral",
      description: "Elegant floral table centerpiece with fresh or artificial flowers.",
      descriptionShort: "Floral table centerpiece",
      categoryId: "floral-arrangements",
      subcategoryId: "centerpieces-floral",
      price: "1200",
      salePrice: null,
      stock: 50,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800"), alt: "Floral centerpiece", isPrimary: true },
      ],
      variants: [
        { type: "color", value: "Fresh - White", priceModifier: "0", stock: 20 },
        { type: "color", value: "Fresh - Mixed", priceModifier: "200", stock: 15 },
        { type: "color", value: "Artificial", priceModifier: "-400", stock: 15 },
      ],
      eventTypes: ["wedding", "corporate", "birthday"],
      content: {
        keyFeatures: ["Elegant design", "Low profile", "Vase included", "Multiple options"],
        whatsIncluded: ["Floral arrangement", "Glass vase", "LED lights (optional)"],
        badges: ["top_seller"],
        returnPolicy: "No return on fresh flowers",
        warranty: "Quality guarantee",
      },
    },
    {
      title: "Bounce House - Large Castle",
      slug: "bounce-house-large-castle",
      description: "Large castle-themed bounce house for kids parties. Accommodates 8-10 children.",
      descriptionShort: "Large castle bounce house",
      categoryId: "entertainment",
      subcategoryId: "inflatables",
      price: "12000",
      salePrice: "10000",
      stock: 5,
      isFeatured: true,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800"), alt: "Castle bounce house", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["birthday"],
      content: {
        keyFeatures: ["8-10 children capacity", "Castle design", "Safety certified", "Easy setup"],
        whatsIncluded: ["Bounce house", "Blower", "Stakes", "Safety mats", "Repair kit"],
        badges: ["top_seller", "choice"],
        setupInstructions: "Setup included in Dhaka",
        returnPolicy: "Booking cancellation 3 days before event",
        warranty: "Full coverage during rental",
      },
    },
    {
      title: "Carnival Game Package - 5 Games",
      slug: "carnival-game-package-5-games",
      description: "Complete carnival game package with 5 classic games: Ring Toss, Can Knockdown, Duck Pond, Balloon Darts, and Spin-to-Win.",
      descriptionShort: "5 carnival games set",
      categoryId: "entertainment",
      subcategoryId: "carnival-games",
      price: "15000",
      salePrice: null,
      stock: 4,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800"), alt: "Carnival games", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["birthday", "festival", "corporate"],
      content: {
        keyFeatures: ["5 classic games", "All supplies included", "Easy setup", "Fun for all ages"],
        whatsIncluded: ["Ring Toss", "Can Knockdown", "Duck Pond", "Balloon Darts", "Spin-to-Win", "Prizes pack"],
        badges: ["choice"],
        setupInstructions: "Setup instructions included",
        returnPolicy: "7-day return policy",
        warranty: "Full coverage during rental",
      },
    },
    {
      title: "Karaoke System - Complete",
      slug: "karaoke-system-complete",
      description: "Complete karaoke system with 2 wireless microphones, speaker, and screen. 10,000+ Bengali and Hindi songs.",
      descriptionShort: "Complete karaoke setup",
      categoryId: "entertainment",
      subcategoryId: "karaoke",
      price: "8000",
      salePrice: null,
      stock: 6,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800"), alt: "Karaoke system", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["birthday", "wedding", "corporate"],
      content: {
        keyFeatures: ["10,000+ songs", "2 wireless mics", "Large screen", "Easy to use"],
        whatsIncluded: ["Karaoke machine", "2x Wireless microphones", "Speaker", "Screen", "Song books"],
        badges: ["top_seller"],
        setupInstructions: "Plug and play - easy setup",
        returnPolicy: "7-day return policy",
        warranty: "Full coverage during rental",
      },
    },
    {
      title: "Giant Jenga - Premium Wood",
      slug: "giant-jenga-premium-wood",
      description: "Giant Jenga game with premium wooden blocks. Stacks over 5ft tall!",
      descriptionShort: "Giant Jenga game set",
      categoryId: "entertainment",
      subcategoryId: "lawn-games",
      price: "3000",
      salePrice: "2500",
      stock: 10,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800"), alt: "Giant Jenga", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["wedding", "birthday", "corporate"],
      content: {
        keyFeatures: ["5ft+ tall", "Premium wood", "58 blocks", "Carry case"],
        whatsIncluded: ["58 wooden blocks", "Carry case", "Setup guide"],
        badges: ["top_seller"],
        returnPolicy: "7-day return policy",
        warranty: "No warranty",
      },
    },
    {
      title: "Magic Show Package",
      slug: "magic-show-package",
      description: "Professional magician for your event! 45-minute show with interactive tricks and illusions.",
      descriptionShort: "45-min magic show",
      categoryId: "entertainment",
      subcategoryId: "magic-props",
      price: "25000",
      salePrice: null,
      stock: 3,
      images: [
        { url: getImage("https://images.unsplash.com/photo-1503095396549-807759245b35?w=800"), alt: "Magic show", isPrimary: true },
      ],
      variants: [],
      eventTypes: ["birthday", "wedding", "corporate"],
      content: {
        keyFeatures: ["Professional magician", "45-minute show", "Interactive tricks", "All ages"],
        whatsIncluded: ["45-minute performance", "Props and equipment", "Sound system (if needed)"],
        badges: ["verified", "choice"],
        setupInstructions: "Performer arrives 30 min early",
        returnPolicy: "Booking cancellation 7 days before event",
        warranty: "Full satisfaction guarantee",
      },
    },
  ];
}

async function seedCategories(imageUrls: Map<string, string>) {
  console.log("Seeding categories...");

  for (let i = 0; i < CATEGORIES_DATA.length; i++) {
    const cat = CATEGORIES_DATA[i]!;
    const imageUrl = imageUrls.get(`https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&h=400&fit=crop`) || 
                     `https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&h=400&fit=crop`;

    await db
      .insert(schema.categories)
      .values({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        imageUrl,
        sortOrder: i,
      })
      .onConflictDoUpdate({
        target: schema.categories.id,
        set: {
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          description: cat.description,
          imageUrl,
          sortOrder: i,
        },
      });

    for (let j = 0; j < cat.subcategories.length; j++) {
      const sub = cat.subcategories[j]!;
      await db
        .insert(schema.subcategories)
        .values({
          id: sub.id,
          parentId: cat.id,
          name: sub.name,
          slug: sub.slug,
          sortOrder: j,
        })
        .onConflictDoUpdate({
          target: schema.subcategories.id,
          set: {
            parentId: cat.id,
            name: sub.name,
            slug: sub.slug,
            sortOrder: j,
          },
        });
    }
  }

  console.log(`  ✓ Seeded ${CATEGORIES_DATA.length} categories`);
}

async function seedEventTypes() {
  console.log("Seeding event types...");

  for (let i = 0; i < EVENT_TYPES_DATA.length; i++) {
    const evt = EVENT_TYPES_DATA[i]!;
    await db
      .insert(schema.eventTypes)
      .values({
        id: evt.id,
        name: evt.name,
        slug: evt.slug,
        sortOrder: i,
      })
      .onConflictDoUpdate({
        target: schema.eventTypes.id,
        set: {
          name: evt.name,
          slug: evt.slug,
          sortOrder: i,
        },
      });
  }

  console.log(`  ✓ Seeded ${EVENT_TYPES_DATA.length} event types`);
}

async function seedVendors(userIds: string[]) {
  console.log("Seeding vendors...");

  const vendorIds: string[] = [];
  const vendorsToCreate = VENDORS_DATA.slice(0, userIds.length);

  for (let i = 0; i < vendorsToCreate.length; i++) {
    const vendor = vendorsToCreate[i]!;
    const userId = userIds[i]!;

    const existing = await db
      .select({ id: schema.vendors.id })
      .from(schema.vendors)
      .where(eq(schema.vendors.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      const vendorId = existing[0]!.id;
      vendorIds.push(vendorId);
      await db
        .update(schema.vendors)
        .set({
          name: vendor.name,
          slug: vendor.slug,
          description: vendor.description,
          location: vendor.location,
          isVerified: vendor.isVerified,
        })
        .where(eq(schema.vendors.id, vendorId));
    } else {
      const vendorId = nanoid();
      vendorIds.push(vendorId);
      await db.insert(schema.vendors).values({
        id: vendorId,
        userId: userId,
        name: vendor.name,
        slug: vendor.slug,
        description: vendor.description,
        location: vendor.location,
        isVerified: vendor.isVerified,
        ratingAverage: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
        productCount: 0,
      });
    }
  }

  console.log(`  ✓ Seeded ${vendorsToCreate.length} vendors`);
  return vendorIds;
}

async function seedProducts(vendorIds: string[], imageUrls: Map<string, string>) {
  console.log("Seeding products...");

  const products = createProducts(imageUrls);
  let upserted = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i]!;
    const vendorId = vendorIds[i % vendorIds.length]!;

    const existing = await db
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(eq(schema.products.slug, product.slug))
      .limit(1);

    let productId: string;

    if (existing.length > 0) {
      productId = existing[0]!.id;
      await db
        .update(schema.products)
        .set({
          vendorId: vendorId,
          categoryId: product.categoryId,
          subcategoryId: product.subcategoryId,
          title: product.title,
          description: product.description,
          descriptionShort: product.descriptionShort,
          status: "active",
          stockStatus: product.stock > 10 ? "in_stock" : "low_stock",
          stock: product.stock,
          price: product.price,
          salePrice: product.salePrice,
          discountPercentage: product.salePrice
            ? Math.round(
                ((Number(product.price) - Number(product.salePrice)) /
                  Number(product.price)) *
                  100,
              )
            : null,
          currency: "BDT",
          content: product.content,
          isFeatured: product.isFeatured ?? false,
          dealType: product.dealType ?? null,
          freeShipping: Number(product.price) > 5000,
          shippingCost: Number(product.price) > 5000 ? null : "150",
          shippingEstimatedDays: 3,
        })
        .where(eq(schema.products.id, productId));

      await db.delete(schema.productImages).where(eq(schema.productImages.productId, productId));
      await db.delete(schema.productVariants).where(eq(schema.productVariants.productId, productId));
      await db.delete(schema.productEventTypes).where(eq(schema.productEventTypes.productId, productId));
    } else {
      productId = nanoid();
      await db.insert(schema.products).values({
        id: productId,
        vendorId: vendorId,
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
        title: product.title,
        slug: product.slug,
        description: product.description,
        descriptionShort: product.descriptionShort,
        status: "active",
        stockStatus: product.stock > 10 ? "in_stock" : "low_stock",
        stock: product.stock,
        price: product.price,
        salePrice: product.salePrice,
        discountPercentage: product.salePrice
          ? Math.round(
              ((Number(product.price) - Number(product.salePrice)) /
                Number(product.price)) *
                100,
            )
          : null,
        currency: "BDT",
        content: product.content,
        isFeatured: product.isFeatured ?? false,
        dealType: product.dealType ?? null,
        ratingAverage: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
        ratingCount: Math.floor(Math.random() * 100) + 10,
        freeShipping: Number(product.price) > 5000,
        shippingCost: Number(product.price) > 5000 ? null : "150",
        shippingEstimatedDays: 3,
      });
    }

    for (let j = 0; j < product.images.length; j++) {
      const img = product.images[j]!;
      await db.insert(schema.productImages).values({
        id: nanoid(),
        productId: productId,
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary,
        sortOrder: j,
      });
    }

    for (const variant of product.variants || []) {
      await db.insert(schema.productVariants).values({
        id: nanoid(),
        productId: productId,
        type: variant.type,
        value: variant.value,
        priceModifier: variant.priceModifier,
        stock: variant.stock,
      });
    }

    for (const eventTypeId of product.eventTypes) {
      await db.insert(schema.productEventTypes).values({
        id: nanoid(),
        productId: productId,
        eventTypeId: eventTypeId,
      });
    }

    upserted++;
  }

  console.log(`  ✓ Seeded ${upserted} products`);
}

async function seedSampleUsers() {
  console.log("Ensuring sample users exist...");

  const existingUsers = await db.select().from(schema.user);
  const userIds = existingUsers.map((u) => u.id);

  const usersNeeded = Math.max(0, 15 - userIds.length);
  
  for (let i = 0; i < usersNeeded; i++) {
    const email = `vendor${userIds.length + i + 1}@ayojon.com`;
    const userId = nanoid();
    userIds.push(userId);
    await db.insert(schema.user).values({
      id: userId,
      name: VENDORS_DATA[userIds.length - 1]?.name || `Vendor ${userIds.length}`,
      email,
      emailVerified: true,
      role: "vendor",
      vendorStatus: "approved",
    });
  }

  console.log(`  ✓ Have ${userIds.length} users`);
  return userIds;
}

async function seedHomeBanners(imageUrls: Map<string, string>) {
  console.log("Seeding home banners...");

  const banners = [
    {
      id: "banner-1",
      title: "Dream Wedding Setup",
      subtitle: "Transform your special day with our premium wedding decor and furniture rentals",
      buttonText: "Explore Wedding",
      buttonLink: "/category/wedding-essentials",
      imageUrl: imageUrls.get("https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=600&fit=crop") || "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=600&fit=crop",
      sortOrder: 0,
    },
    {
      id: "banner-2",
      title: "Stunning Decorations",
      subtitle: "Balloon arches, flower walls, LED lights - everything for a memorable event",
      buttonText: "Shop Decorations",
      buttonLink: "/category/decorations-balloons",
      imageUrl: imageUrls.get("https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1920&h=600&fit=crop") || "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1920&h=600&fit=crop",
      sortOrder: 1,
    },
    {
      id: "banner-3",
      title: "Party Supplies & More",
      subtitle: "Make every celebration unforgettable with our complete party solutions",
      buttonText: "Party Supplies",
      buttonLink: "/category/party-supplies",
      imageUrl: imageUrls.get("https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1920&h=600&fit=crop") || "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1920&h=600&fit=crop",
      sortOrder: 2,
    },
    {
      id: "banner-4",
      title: "Premium Furniture",
      subtitle: "Elegant chiavari chairs, banquet tables, and lounge sets for your guests",
      buttonText: "View Furniture",
      buttonLink: "/category/furniture-tents",
      imageUrl: imageUrls.get("https://images.unsplash.com/photo-1519167758481-83f29da8c6c9?w=1920&h=600&fit=crop") || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&h=600&fit=crop",
      sortOrder: 3,
    },
  ];

  for (const banner of banners) {
    await db
      .insert(schema.homeBanners)
      .values(banner)
      .onConflictDoUpdate({
        target: schema.homeBanners.id,
        set: {
          title: banner.title,
          subtitle: banner.subtitle,
          buttonText: banner.buttonText,
          buttonLink: banner.buttonLink,
          imageUrl: banner.imageUrl,
          sortOrder: banner.sortOrder,
          isActive: true,
        },
      });
  }

  console.log(`  ✓ Seeded ${banners.length} home banners`);
}

async function seedPromoCards(imageUrls: Map<string, string>) {
  console.log("Seeding promo cards...");

  const promoCards = [
    {
      id: "promo-1",
      slotNumber: 1,
      label: "UP TO 30% OFF",
      title: "Wedding Essentials",
      link: "/category/wedding-essentials",
      imageUrl: imageUrls.get("https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop") || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop",
    },
    {
      id: "promo-2",
      slotNumber: 2,
      label: "NEW ARRIVALS",
      title: "Photo Booths",
      link: "/category/photography-video",
      imageUrl: imageUrls.get("https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop") || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop",
    },
    {
      id: "promo-3",
      slotNumber: 3,
      label: "PROFESSIONAL GRADE",
      title: "Sound & Lighting",
      link: "/category/sound-lighting",
      imageUrl: imageUrls.get("https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=300&fit=crop") || "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=300&fit=crop",
    },
    {
      id: "promo-4",
      slotNumber: 4,
      label: "KIDS PARTIES",
      title: "Entertainment & Games",
      link: "/category/entertainment-activities",
      imageUrl: imageUrls.get("https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop") || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop",
    },
  ];

  for (const card of promoCards) {
    await db
      .insert(schema.homePromoCards)
      .values(card)
      .onConflictDoUpdate({
        target: schema.homePromoCards.slotNumber,
        set: {
          label: card.label,
          title: card.title,
          link: card.link,
          imageUrl: card.imageUrl,
          isActive: true,
        },
      });
  }

  console.log(`  ✓ Seeded ${promoCards.length} promo cards`);
}

async function seedReviews(userIds: string[]) {
  console.log("Seeding reviews...");

  const products = await db
    .select({ id: schema.products.id })
    .from(schema.products)
    .limit(30);

  if (products.length === 0) {
    console.log("  ⚠ No products found, skipping reviews");
    return;
  }

  const comments = [
    "Excellent quality! My event was a huge success.",
    "Great service and timely delivery. Highly recommended!",
    "Product exactly as described. Will rent again.",
    "Good value for money. Professional service.",
    "Amazing experience! The team was very helpful.",
  ];

  let upserted = 0;

  for (const product of products) {
    const existingReviews = await db
      .select({ id: schema.reviews.id, userId: schema.reviews.userId })
      .from(schema.reviews)
      .where(eq(schema.reviews.productId, product.id));

    const existingUserIds = new Set(existingReviews.map(r => r.userId));
    
    if (existingReviews.length >= 3) continue;

    const reviewsToAdd = Math.floor(Math.random() * 3) + 2;
    let added = 0;

    for (let i = 0; i < reviewsToAdd && added < reviewsToAdd; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)]!;
      
      // Skip if this user already reviewed this product
      if (existingUserIds.has(userId)) continue;
      existingUserIds.add(userId);
      
      try {
        await db.insert(schema.reviews).values({
          id: nanoid(),
          productId: product.id,
          userId: userId,
          rating: Math.floor(Math.random() * 2) + 4,
          title: "Great experience!",
          comment: comments[Math.floor(Math.random() * comments.length)]!,
          isVerifiedPurchase: Math.random() > 0.3,
          helpfulVotes: Math.floor(Math.random() * 20),
          notHelpfulVotes: Math.floor(Math.random() * 3),
        });
        upserted++;
        added++;
      } catch (e) {
        // Ignore duplicate key errors
      }
    }
  }

  console.log(`  ✓ Seeded ${upserted} reviews`);
}

async function main() {
  console.log("\n🌱 Starting production seed with S3 uploads...\n");

  try {
    const imageUrls = await uploadSeedImages();
    
    await seedCategories(imageUrls);
    await seedEventTypes();

    const userIds = await seedSampleUsers();
    const vendorIds = await seedVendors(userIds);

    await seedProducts(vendorIds, imageUrls);
    await seedReviews(userIds);
    
    await seedHomeBanners(imageUrls);
    await seedPromoCards(imageUrls);

    console.log("\n📊 Summary:");
    console.log(`  ✓ ${(await db.select().from(schema.categories)).length} Categories`);
    console.log(`  ✓ ${(await db.select().from(schema.subcategories)).length} Subcategories`);
    console.log(`  ✓ ${(await db.select().from(schema.eventTypes)).length} Event Types`);
    console.log(`  ✓ ${(await db.select().from(schema.vendors)).length} Vendors`);
    console.log(`  ✓ ${(await db.select().from(schema.products)).length} Products`);
    console.log(`  ✓ ${(await db.select().from(schema.productImages)).length} Product Images`);
    console.log(`  ✓ ${(await db.select().from(schema.reviews)).length} Reviews`);
    console.log(`  ✓ ${(await db.select().from(schema.homeBanners)).length} Home Banners`);
    console.log(`  ✓ ${(await db.select().from(schema.homePromoCards)).length} Promo Cards`);

    console.log("\n✅ Production seed completed with S3 image uploads!\n");
  } catch (error) {
    console.error("\n❌ Error:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

main();
