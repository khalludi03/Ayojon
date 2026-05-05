/**
 * Database Seed Script for Ayojon
 *
 * Populates the database with:
 * - Categories (10 static)
 * - Subcategories (~60)
 * - Event Types
 * - Sample Vendors
 * - Sample Products with variants, images, specs
 * - Sample Reviews
 *
 * Run with: bun run packages/db/src/seed.ts
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import * as schema from "./schema";

// Connect directly without env package for seed script
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
});

const db = drizzle(pool, { schema });

// =============================================================================
// CATEGORIES DATA (from seeds/categories.ts)
// =============================================================================

const CATEGORIES_DATA = [
  {
    id: "decorations",
    name: "Decorations & Balloons",
    slug: "decorations-balloons",
    icon: "Sparkles",
    description:
      "Transform your venue with stunning decorations, balloon arrangements, LED lights, and themed decor.",
    imageUrl:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&h=400&fit=crop",
    subcategories: [
      {
        id: "balloon-arches",
        name: "Balloon Arches & Bouquets",
        slug: "balloon-arches",
      },
      { id: "backdrops", name: "Backdrops & Photo Walls", slug: "backdrops" },
      { id: "led-decor", name: "LED Lights & Neon Signs", slug: "led-decor" },
      { id: "themed-decor", name: "Themed Decorations", slug: "themed-decor" },
      {
        id: "ceiling-decor",
        name: "Ceiling & Hanging Decor",
        slug: "ceiling-decor",
      },
      {
        id: "entrance-decor",
        name: "Entrance & Gate Decor",
        slug: "entrance-decor",
      },
    ],
  },
  {
    id: "sound-lighting",
    name: "Sound & Lighting",
    slug: "sound-lighting",
    icon: "Mic",
    description:
      "Professional audio and lighting equipment to set the mood and energize your event.",
    imageUrl:
      "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=1200&h=400&fit=crop",
    subcategories: [
      { id: "pa-systems", name: "PA Systems & Speakers", slug: "pa-systems" },
      {
        id: "microphones",
        name: "Microphones & Wireless Systems",
        slug: "microphones",
      },
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
    description:
      "Quality event furniture and tents for comfortable seating and weather protection.",
    imageUrl:
      "https://images.unsplash.com/photo-1519167758481-83f29da8c6c9?w=1200&h=400&fit=crop",
    subcategories: [
      {
        id: "chairs",
        name: "Chairs (Chiavari, Folding, etc.)",
        slug: "chairs",
      },
      { id: "tables", name: "Tables (Round, Banquet, Cocktail)", slug: "tables" },
      { id: "tents-canopies", name: "Tents & Canopies", slug: "tents-canopies" },
      { id: "lounge-furniture", name: "Lounge Furniture", slug: "lounge-furniture" },
      { id: "stages", name: "Stages & Platforms", slug: "stages" },
      {
        id: "linens-covers",
        name: "Table Linens & Chair Covers",
        slug: "linens-covers",
      },
    ],
  },
  {
    id: "catering-equipment",
    name: "Catering Equipment",
    slug: "catering-equipment",
    icon: "UtensilsCrossed",
    description:
      "Professional catering equipment and supplies for seamless food and beverage service.",
    imageUrl:
      "https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&h=400&fit=crop",
    subcategories: [
      {
        id: "chafing-dishes",
        name: "Chafing Dishes & Warmers",
        slug: "chafing-dishes",
      },
      { id: "glassware", name: "Glassware & Drinkware", slug: "glassware" },
      {
        id: "serving-platters",
        name: "Serving Platters & Bowls",
        slug: "serving-platters",
      },
      { id: "bar-equipment", name: "Bar Equipment", slug: "bar-equipment" },
      {
        id: "beverage-dispensers",
        name: "Beverage Dispensers",
        slug: "beverage-dispensers",
      },
      {
        id: "catering-supplies",
        name: "Catering Supplies & Utensils",
        slug: "catering-supplies",
      },
    ],
  },
  {
    id: "photography-video",
    name: "Photography & Video",
    slug: "photography-video",
    icon: "Camera",
    description:
      "Capture every precious moment with professional photography and videography equipment.",
    imageUrl:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&h=400&fit=crop",
    subcategories: [
      { id: "photo-booths", name: "Photo Booths", slug: "photo-booths" },
      { id: "cameras-lenses", name: "Cameras & Lenses", slug: "cameras-lenses" },
      { id: "lighting-kits", name: "Lighting Kits", slug: "lighting-kits" },
      {
        id: "video-cameras",
        name: "Video Cameras & Camcorders",
        slug: "video-cameras",
      },
      { id: "drones", name: "Drones & Aerial Photography", slug: "drones" },
      {
        id: "photo-props",
        name: "Photo Props & Accessories",
        slug: "photo-props",
      },
    ],
  },
  {
    id: "party-supplies",
    name: "Party Supplies",
    slug: "party-supplies",
    icon: "PartyPopper",
    description:
      "Complete party essentials and supplies to add fun and flair to any celebration.",
    imageUrl:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&h=400&fit=crop",
    subcategories: [
      { id: "tableware", name: "Disposable Tableware", slug: "tableware" },
      {
        id: "party-favors",
        name: "Party Favors & Giveaways",
        slug: "party-favors",
      },
      { id: "banners-signs", name: "Banners & Signs", slug: "banners-signs" },
      {
        id: "confetti-poppers",
        name: "Confetti & Poppers",
        slug: "confetti-poppers",
      },
      { id: "cake-supplies", name: "Cake Stands & Toppers", slug: "cake-supplies" },
      {
        id: "centerpieces",
        name: "Centerpieces & Table Decor",
        slug: "centerpieces",
      },
    ],
  },
  {
    id: "event-clothing",
    name: "Event Clothing & Costumes",
    slug: "event-clothing-costumes",
    icon: "Shirt",
    description:
      "Look your best with our collection of formal wear, traditional attire, and creative costumes.",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop",
    subcategories: [
      { id: "wedding-attire", name: "Wedding Attire", slug: "wedding-attire" },
      {
        id: "traditional-wear",
        name: "Traditional & Ethnic Wear",
        slug: "traditional-wear",
      },
      { id: "tuxedos-suits", name: "Tuxedos & Formal Suits", slug: "tuxedos-suits" },
      {
        id: "costumes",
        name: "Costumes & Character Outfits",
        slug: "costumes",
      },
      {
        id: "accessories",
        name: "Accessories (Veils, Ties, etc.)",
        slug: "accessories",
      },
      { id: "kids-formal", name: "Kids' Formal Wear", slug: "kids-formal" },
    ],
  },
  {
    id: "stage-backdrops",
    name: "Stage & Backdrops",
    slug: "stage-backdrops",
    icon: "LayoutPanelTop",
    description:
      "Create the perfect focal point with professional stage setups and beautiful backdrops.",
    imageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=400&fit=crop",
    subcategories: [
      { id: "stage-platforms", name: "Stage Platforms", slug: "stage-platforms" },
      {
        id: "backdrop-stands",
        name: "Backdrop Stands & Frames",
        slug: "backdrop-stands",
      },
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
    description:
      "Add natural beauty and elegance with fresh and artificial floral arrangements.",
    imageUrl:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&h=400&fit=crop",
    subcategories: [
      { id: "bouquets", name: "Bouquets & Hand Flowers", slug: "bouquets" },
      {
        id: "centerpieces-floral",
        name: "Floral Centerpieces",
        slug: "centerpieces-floral",
      },
      { id: "garlands", name: "Garlands & Vines", slug: "garlands" },
      { id: "corsages", name: "Corsages & Boutonnieres", slug: "corsages" },
      { id: "vases", name: "Vases & Containers", slug: "vases" },
      {
        id: "artificial-flowers",
        name: "Artificial Flowers",
        slug: "artificial-flowers",
      },
    ],
  },
  {
    id: "entertainment",
    name: "Entertainment & Activities",
    slug: "entertainment-activities",
    icon: "Gamepad2",
    description:
      "Keep your guests entertained with interactive games, inflatables, and performance equipment.",
    imageUrl:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=400&fit=crop",
    subcategories: [
      {
        id: "inflatables",
        name: "Inflatables & Bounce Houses",
        slug: "inflatables",
      },
      { id: "carnival-games", name: "Carnival Games", slug: "carnival-games" },
      { id: "karaoke", name: "Karaoke Equipment", slug: "karaoke" },
      { id: "arcade-games", name: "Arcade Games", slug: "arcade-games" },
      { id: "lawn-games", name: "Lawn & Outdoor Games", slug: "lawn-games" },
      { id: "magic-props", name: "Magic & Performance Props", slug: "magic-props" },
    ],
  },
];

// =============================================================================
// EVENT TYPES DATA
// =============================================================================

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

// =============================================================================
// SAMPLE VENDORS DATA
// =============================================================================

type VendorLocation = "Dhaka" | "Chittagong" | "Sylhet" | "Rajshahi" | "Khulna";

const VENDORS_DATA: Array<{
  name: string;
  slug: string;
  description: string;
  location: VendorLocation;
  isVerified: boolean;
}> = [
  {
    name: "Dhaka Event Essentials",
    slug: "dhaka-event-essentials",
    description:
      "Your one-stop shop for all event supplies in Dhaka. Quality products and exceptional service.",
    location: "Dhaka",
    isVerified: true,
  },
  {
    name: "Celebration Station",
    slug: "celebration-station",
    description:
      "Making every celebration memorable with premium party supplies and decorations.",
    location: "Chittagong",
    isVerified: true,
  },
  {
    name: "Royal Events BD",
    slug: "royal-events-bd",
    description:
      "Luxury event equipment and professional-grade supplies for upscale occasions.",
    location: "Dhaka",
    isVerified: true,
  },
  {
    name: "PartyPro Sylhet",
    slug: "partypro-sylhet",
    description:
      "Bringing fun and excitement to every event in Sylhet and surrounding areas.",
    location: "Sylhet",
    isVerified: false,
  },
  {
    name: "Wedding Wonders",
    slug: "wedding-wonders",
    description:
      "Specializing in wedding decor, attire, and everything you need for your special day.",
    location: "Dhaka",
    isVerified: true,
  },
];

// =============================================================================
// SAMPLE PRODUCTS DATA
// =============================================================================

const SAMPLE_PRODUCTS = [
  {
    title: "Premium Balloon Arch Kit - Rose Gold",
    slug: "premium-balloon-arch-kit-rose-gold",
    description:
      "Create stunning balloon arches with our premium kit. Includes 100+ balloons in rose gold, pink, and white colors, along with arch strip and pump.",
    descriptionShort: "100+ balloon arch kit in rose gold theme",
    categoryId: "decorations",
    subcategoryId: "balloon-arches",
    price: "2500",
    salePrice: "1999",
    stock: 50,
    content: {
      keyFeatures: [
        "100+ premium quality balloons",
        "Includes balloon arch strip",
        "Hand pump included",
        "Easy assembly instructions",
      ],
      whatsIncluded: [
        "50 rose gold balloons",
        "30 pink balloons",
        "20 white balloons",
        "1 arch strip (5m)",
        "1 hand pump",
        "Instructions card",
      ],
      badges: ["choice", "top_seller"] as Array<"choice" | "top_seller">,
      returnPolicy: "7-day return policy for unopened packages",
      warranty: "No warranty on consumable items",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
        alt: "Rose gold balloon arch",
        isPrimary: true,
      },
      {
        url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
        alt: "Balloon arch setup",
        isPrimary: false,
      },
    ],
    variants: [
      { type: "color" as const, value: "Rose Gold", priceModifier: "0", stock: 20 },
      { type: "color" as const, value: "Blue", priceModifier: "0", stock: 15 },
      { type: "color" as const, value: "Gold", priceModifier: "200", stock: 15 },
    ],
    eventTypes: ["wedding", "birthday", "engagement", "baby-shower"],
  },
  {
    title: "Professional PA System 500W",
    slug: "professional-pa-system-500w",
    description:
      "High-quality PA system perfect for medium to large events. Crystal clear sound with powerful bass. Includes wireless microphone.",
    descriptionShort: "500W PA system with wireless mic",
    categoryId: "sound-lighting",
    subcategoryId: "pa-systems",
    price: "45000",
    salePrice: null,
    stock: 10,
    content: {
      keyFeatures: [
        "500W RMS power output",
        "2 wireless microphones included",
        "Bluetooth connectivity",
        "USB/SD card support",
        "Echo and reverb effects",
      ],
      whatsIncluded: [
        "2x 250W speakers",
        "2x wireless microphones",
        "1x mixer unit",
        "Speaker cables",
        "Power cables",
      ],
      badges: ["verified"] as Array<"verified">,
      setupInstructions: "Professional setup available for additional fee",
      returnPolicy: "14-day return policy",
      warranty: "1 year manufacturer warranty",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800",
        alt: "PA System speakers",
        isPrimary: true,
      },
    ],
    variants: [],
    eventTypes: ["wedding", "corporate", "conference", "festival"],
  },
  {
    title: "Chiavari Chair - Gold",
    slug: "chiavari-chair-gold",
    description:
      "Elegant gold chiavari chairs perfect for weddings and formal events. Durable polycarbonate construction with cushion included.",
    descriptionShort: "Elegant gold chiavari chair with cushion",
    categoryId: "furniture-tents",
    subcategoryId: "chairs",
    price: "1200",
    salePrice: "999",
    stock: 200,
    content: {
      keyFeatures: [
        "Premium polycarbonate material",
        "Weight capacity: 150kg",
        "Stackable design",
        "Cushion included",
        "Indoor/outdoor use",
      ],
      whatsIncluded: ["1x Chiavari chair", "1x Seat cushion"],
      badges: ["top_seller"] as Array<"top_seller">,
      returnPolicy: "Return within 3 days if damaged",
      warranty: "6 months warranty",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1519167758481-83f29da8c6c9?w=800",
        alt: "Gold chiavari chair",
        isPrimary: true,
      },
    ],
    variants: [
      { type: "color" as const, value: "Gold", priceModifier: "0", stock: 100 },
      { type: "color" as const, value: "Silver", priceModifier: "0", stock: 50 },
      { type: "color" as const, value: "White", priceModifier: "-100", stock: 50 },
    ],
    eventTypes: ["wedding", "corporate", "engagement"],
  },
  {
    title: "LED Neon Sign - Custom Text",
    slug: "led-neon-sign-custom",
    description:
      "Customizable LED neon sign for events. Choose your text and color. Perfect for weddings, birthdays, and photo backdrops.",
    descriptionShort: "Custom LED neon sign for events",
    categoryId: "decorations",
    subcategoryId: "led-decor",
    price: "8500",
    salePrice: "7500",
    stock: 25,
    isFeatured: true,
    content: {
      keyFeatures: [
        "Custom text up to 10 characters",
        "Multiple color options",
        "Dimmable brightness",
        "Low energy consumption",
        "5m power cord",
      ],
      whatsIncluded: [
        "1x LED neon sign",
        "Wall mounting kit",
        "Power adapter",
        "Dimmer switch",
      ],
      badges: ["new", "choice"] as Array<"new" | "choice">,
      setupInstructions:
        "Easy wall mount or stand-alone setup. Professional installation available.",
      returnPolicy: "Custom items non-returnable unless defective",
      warranty: "1 year warranty",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1563865436874-9aef32095fad?w=800",
        alt: "LED neon sign",
        isPrimary: true,
      },
    ],
    variants: [
      { type: "color" as const, value: "Warm White", priceModifier: "0", stock: 10 },
      { type: "color" as const, value: "Pink", priceModifier: "0", stock: 10 },
      { type: "color" as const, value: "Blue", priceModifier: "500", stock: 5 },
    ],
    eventTypes: ["wedding", "birthday", "engagement"],
  },
  {
    title: "360 Photo Booth",
    slug: "360-photo-booth",
    description:
      "Professional 360-degree video booth that creates stunning slow-motion videos. Perfect for weddings, parties, and corporate events.",
    descriptionShort: "Professional 360° video booth",
    categoryId: "photography-video",
    subcategoryId: "photo-booths",
    price: "150000",
    salePrice: null,
    stock: 5,
    isFeatured: true,
    content: {
      keyFeatures: [
        "360-degree slow motion capture",
        "Instant sharing to social media",
        "Custom overlays and branding",
        "LED ring light included",
        "Fits 1-4 people on platform",
      ],
      whatsIncluded: [
        "360 photo booth platform",
        "iPad with software",
        "LED ring light",
        "Carrying cases",
        "Setup guide",
      ],
      badges: ["verified", "choice"] as Array<"verified" | "choice">,
      setupInstructions: "Professional operator included with rental",
      returnPolicy: "48-hour cancellation policy",
      warranty: "Full coverage during rental period",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800",
        alt: "360 photo booth",
        isPrimary: true,
      },
    ],
    variants: [],
    eventTypes: ["wedding", "corporate", "birthday", "graduation"],
  },
];

// =============================================================================
// SEED FUNCTIONS
// =============================================================================

async function seedCategories() {
  console.log("Seeding categories (idempotent upsert)...");

  let categoriesUpserted = 0;
  let subcategoriesUpserted = 0;

  for (let i = 0; i < CATEGORIES_DATA.length; i++) {
    const cat = CATEGORIES_DATA[i]!;

    await db
      .insert(schema.categories)
      .values({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        imageUrl: cat.imageUrl,
        sortOrder: i,
      })
      .onConflictDoUpdate({
        target: schema.categories.id,
        set: {
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          description: cat.description,
          imageUrl: cat.imageUrl,
          sortOrder: i,
        },
      });
    categoriesUpserted++;

    // Upsert subcategories
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
      subcategoriesUpserted++;
    }
  }

  console.log(
    `  ✓ Upserted ${categoriesUpserted} categories with ${subcategoriesUpserted} subcategories`,
  );
}

async function seedEventTypes() {
  console.log("Seeding event types (idempotent upsert)...");

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

  console.log(`  ✓ Upserted ${EVENT_TYPES_DATA.length} event types`);
}

async function seedVendors(userIds: string[]) {
  console.log("Seeding vendors (idempotent upsert)...");

  const vendorIds: string[] = [];

  // Only create as many vendors as we have users
  const vendorsToCreate = VENDORS_DATA.slice(0, userIds.length);

  for (let i = 0; i < vendorsToCreate.length; i++) {
    const vendor = vendorsToCreate[i]!;
    const userId = userIds[i]!;

    // Check if a vendor already exists for this user
    const existing = await db
      .select({ id: schema.vendors.id })
      .from(schema.vendors)
      .where(eq(schema.vendors.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing vendor
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
      // Insert new vendor
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
        ratingAverage: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        productCount: 0,
      });
    }
  }

  console.log(`  ✓ Upserted ${vendorsToCreate.length} vendors`);
  return vendorIds;
}

async function seedProducts(vendorIds: string[]) {
  console.log("Seeding products (idempotent upsert)...");

  let upserted = 0;

  for (let i = 0; i < SAMPLE_PRODUCTS.length; i++) {
    const product = SAMPLE_PRODUCTS[i]!;
    const vendorId = vendorIds[i % vendorIds.length]!;

    // Check if product already exists by slug
    const existing = await db
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(eq(schema.products.slug, product.slug))
      .limit(1);

    let productId: string;

    if (existing.length > 0) {
      // Update existing product
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
          freeShipping: Number(product.price) > 5000,
          shippingCost: Number(product.price) > 5000 ? null : "150",
          shippingEstimatedDays: 3,
        })
        .where(eq(schema.products.id, productId));

      // Delete and re-insert child records to ensure completeness
      await db.delete(schema.productImages).where(eq(schema.productImages.productId, productId));
      await db.delete(schema.productVariants).where(eq(schema.productVariants.productId, productId));
      await db.delete(schema.productEventTypes).where(eq(schema.productEventTypes.productId, productId));
      await db.delete(schema.productShippingOptions).where(eq(schema.productShippingOptions.productId, productId));
      await db.delete(schema.productSpecifications).where(eq(schema.productSpecifications.productId, productId));
    } else {
      // Insert new product
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
        ratingAverage: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        ratingCount: Math.floor(Math.random() * 100) + 10,
        freeShipping: Number(product.price) > 5000,
        shippingCost: Number(product.price) > 5000 ? null : "150",
        shippingEstimatedDays: 3,
      });
    }

    // Insert images
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

    // Insert variants
    for (const variant of product.variants) {
      await db.insert(schema.productVariants).values({
        id: nanoid(),
        productId: productId,
        type: variant.type,
        value: variant.value,
        priceModifier: variant.priceModifier,
        stock: variant.stock,
      });
    }

    // Insert event types junction
    for (const eventTypeId of product.eventTypes) {
      await db.insert(schema.productEventTypes).values({
        id: nanoid(),
        productId: productId,
        eventTypeId: eventTypeId,
      });
    }

    // Insert shipping options
    await db.insert(schema.productShippingOptions).values({
      id: nanoid(),
      productId: productId,
      method: "standard",
      cost: "150",
      estimatedDays: 3,
      isDefault: true,
    });

    await db.insert(schema.productShippingOptions).values({
      id: nanoid(),
      productId: productId,
      method: "express",
      cost: "350",
      estimatedDays: 1,
      isDefault: false,
    });

    // Insert specification
    await db.insert(schema.productSpecifications).values({
      id: nanoid(),
      productId: productId,
      key: "Category",
      value: product.categoryId,
      sortOrder: 0,
    });

    upserted++;
  }

  console.log(`  ✓ Upserted ${upserted} products with images, variants, event types, and shipping`);
}

async function seedSampleUsers() {
  console.log("Ensuring sample users exist (idempotent)...");

  // Get all existing users
  const existingUsers = await db.select().from(schema.user);
  const userIds = existingUsers.map((u) => u.id);

  if (userIds.length >= 5) {
    console.log(`  ✓ Found ${userIds.length} existing users (sufficient)`);
    return userIds;
  }

  // Create additional users if needed — upsert by email to avoid duplicates
  const usersNeeded = 5 - userIds.length;
  for (let i = 0; i < usersNeeded; i++) {
    const email = `testvendor${i + 1}@ayojon.com`;

    // Check if this email already exists (shouldn't given the count check, but safe)
    const existing = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.email, email))
      .limit(1);

    if (existing.length > 0) {
      if (!userIds.includes(existing[0]!.id)) {
        userIds.push(existing[0]!.id);
      }
    } else {
      const userId = nanoid();
      userIds.push(userId);
      await db.insert(schema.user).values({
        id: userId,
        name: `Test Vendor ${i + 1}`,
        email,
        emailVerified: true,
      });
    }
  }

  console.log(`  ✓ Now have ${userIds.length} users (ensured ${usersNeeded} new)`);
  return userIds;
}

async function seedReviews(userIds: string[]) {
  console.log("Seeding reviews (idempotent)...");

  // Get products that need reviews
  const products = await db
    .select({ id: schema.products.id })
    .from(schema.products)
    .limit(5);

  if (products.length === 0) {
    console.log("  ⚠ No products found, skipping reviews");
    return;
  }

  const comments = [
    "Great product! Exactly as described and arrived on time.",
    "Good quality but shipping took longer than expected.",
    "Excellent value for money. Would buy again!",
    "The product is okay but could be better.",
    "Amazing! My event was a huge success thanks to this.",
  ];

  let upserted = 0;

  for (const product of products) {
    // Check existing review count for this product
    const existingReviews = await db
      .select({ id: schema.reviews.id })
      .from(schema.reviews)
      .where(eq(schema.reviews.productId, product.id));

    if (existingReviews.length >= 2) {
      // Already has enough reviews
      continue;
    }

    // Add reviews up to 2-4 total
    const targetReviews = Math.floor(Math.random() * 3) + 2;
    const reviewsToAdd = targetReviews - existingReviews.length;

    for (let i = 0; i < reviewsToAdd; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)]!;
      const reviewId = nanoid();

      await db.insert(schema.reviews)
        .values({
          id: reviewId,
          productId: product.id,
          userId: userId,
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
          title: i % 2 === 0 ? "Great purchase!" : null,
          comment: comments[Math.floor(Math.random() * comments.length)]!,
          isVerifiedPurchase: Math.random() > 0.3,
          helpfulVotes: Math.floor(Math.random() * 20),
          notHelpfulVotes: Math.floor(Math.random() * 3),
        })
        .onConflictDoNothing({ 
          target: [schema.reviews.productId, schema.reviews.userId] 
        });
      upserted++;
    }
  }

  console.log(`  ✓ Ensured reviews for ${products.length} products (${upserted} new reviews added)`);
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  console.log("\n🌱 Starting database seed (idempotent mode)...\n");

  try {
    // Seed in order of dependencies
    await seedCategories();
    await seedEventTypes();

    const userIds = await seedSampleUsers();
    const vendorIds = await seedVendors(userIds);

    await seedProducts(vendorIds);
    await seedReviews(userIds);

    // Completeness report
    console.log("\n📊 Completeness Report:");
    const catCount = (await db.select().from(schema.categories)).length;
    const subCount = (await db.select().from(schema.subcategories)).length;
    const evtCount = (await db.select().from(schema.eventTypes)).length;
    const vendorCount = (await db.select().from(schema.vendors)).length;
    const prodCount = (await db.select().from(schema.products)).length;
    const imgCount = (await db.select().from(schema.productImages)).length;
    const varCount = (await db.select().from(schema.productVariants)).length;
    const revCount = (await db.select().from(schema.reviews)).length;

    const expectedCats = CATEGORIES_DATA.length;
    const expectedSubs = CATEGORIES_DATA.reduce((acc, c) => acc + c.subcategories.length, 0);
    const expectedEvts = EVENT_TYPES_DATA.length;
    const expectedProds = SAMPLE_PRODUCTS.length;

    const check = (label: string, actual: number, expected: number) => {
      const status = actual >= expected ? "✅" : "⚠️";
      console.log(`  ${status} ${label}: ${actual}/${expected}`);
    };

    check("Categories", catCount, expectedCats);
    check("Subcategories", subCount, expectedSubs);
    check("Event Types", evtCount, expectedEvts);
    check("Vendors", vendorCount, Math.min(VENDORS_DATA.length, 5));
    check("Products", prodCount, expectedProds);
    console.log(`  📎 Product Images: ${imgCount}`);
    console.log(`  📎 Product Variants: ${varCount}`);
    console.log(`  📎 Reviews: ${revCount}`);

    console.log("\n✅ Database seeding completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

main();
