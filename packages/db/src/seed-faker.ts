/**
 * Enhanced Database Seed Script with Faker.js
 *
 * Populates the database with realistic fake data:
 * - Categories (10 static from existing seed)
 * - Subcategories (~60 static)
 * - Event Types (10 static)
 * - 50 Faker-generated vendors
 * - 500 Faker-generated products
 * - 1000+ Faker-generated reviews
 * - 100 Faker-generated users
 *
 * Run with: bun run packages/db/src/seed-faker.ts
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { faker } from "@faker-js/faker";
import * as schema from "./schema";

// Set seed for reproducible data
faker.seed(12345);

// Connect directly without env package for seed script
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
});

const db = drizzle(pool, { schema });

// =============================================================================
// STATIC DATA (from original seed)
// =============================================================================

const CATEGORIES_DATA = [
  {
    id: "decorations",
    name: "Decorations & Balloons",
    slug: "decorations-balloons",
    icon: "Sparkles",
    description: "Transform your venue with stunning decorations, balloon arrangements, LED lights, and themed decor.",
    imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&h=400&fit=crop",
    subcategories: [
      { id: "balloon-arches", name: "Balloon Arches & Bouquets", slug: "balloon-arches" },
      { id: "backdrops", name: "Backdrops & Photo Walls", slug: "backdrops" },
      { id: "led-decor", name: "LED Lights & Neon Signs", slug: "led-decor" },
      { id: "themed-decor", name: "Themed Decorations", slug: "themed-decor" },
      { id: "ceiling-decor", name: "Ceiling & Hanging Decor", slug: "ceiling-decor" },
      { id: "entrance-decor", name: "Entrance & Gate Decor", slug: "entrance-decor" },
    ],
  },
  {
    id: "sound-lighting",
    name: "Sound & Lighting",
    slug: "sound-lighting",
    icon: "Mic",
    description: "Professional audio and lighting equipment to set the mood and energize your event.",
    imageUrl: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=1200&h=400&fit=crop",
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
    imageUrl: "https://images.unsplash.com/photo-1519167758481-83f29da8c6c9?w=1200&h=400&fit=crop",
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
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&h=400&fit=crop",
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
    imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&h=400&fit=crop",
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
    imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&h=400&fit=crop",
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
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop",
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
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=400&fit=crop",
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
    imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&h=400&fit=crop",
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
    imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=400&fit=crop",
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
const LOCATIONS: VendorLocation[] = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna"];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function randomEventTypes(count: number = 2): string[] {
  return faker.helpers.arrayElements(
    EVENT_TYPES_DATA.map((e) => e.id),
    count
  );
}

function getSubcategoriesForCategory(categoryId: string) {
  const cat = CATEGORIES_DATA.find((c) => c.id === categoryId);
  return cat?.subcategories || [];
}

// =============================================================================
// SEED FUNCTIONS
// =============================================================================

async function seedCategories() {
  console.log("Seeding categories...");

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

  console.log(`  ✓ Seeded ${CATEGORIES_DATA.length} categories with subcategories`);
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

async function seedUsers(count: number = 100): Promise<string[]> {
  console.log(`Seeding ${count} users with Faker...`);

  const userIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const userId = nanoid();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    try {
      await db.insert(schema.user).values({
        id: userId,
        name: `${firstName} ${lastName}`,
        email,
        emailVerified: faker.datatype.boolean({ probability: 0.8 }),
        image: faker.image.avatar(),
        role: "customer",
      });
      userIds.push(userId);
    } catch (error) {
      // Skip duplicate emails
      continue;
    }
  }

  console.log(`  ✓ Created ${userIds.length} users`);
  return userIds;
}

async function seedVendors(userIds: string[], count: number = 50): Promise<string[]> {
  console.log(`Seeding ${count} vendors with Faker...`);

  const vendorIds: string[] = [];
  const usedUserIds = new Set<string>();

  for (let i = 0; i < Math.min(count, userIds.length); i++) {
    // Find unused user ID
    let userId = userIds[i]!;
    if (usedUserIds.has(userId)) continue;

    const companyName = faker.company.name();
    const vendorId = nanoid();

    try {
      await db.insert(schema.vendors).values({
        id: vendorId,
        userId: userId,
        name: companyName,
        slug: slugify(companyName) + "-" + nanoid(6),
        description: faker.company.catchPhrase() + ". " + faker.lorem.sentence(),
        logoUrl: faker.image.urlPicsumPhotos({ width: 200, height: 200 }),
        bannerUrl: faker.image.urlPicsumPhotos({ width: 1200, height: 400 }),
        location: faker.helpers.arrayElement(LOCATIONS),
        address: faker.location.streetAddress(),
        phone: faker.phone.number(),
        email: faker.internet.email({ firstName: companyName.split(" ")[0] }).toLowerCase(),
        website: faker.internet.url(),
        isVerified: faker.datatype.boolean({ probability: 0.7 }),
        isActive: faker.datatype.boolean({ probability: 0.95 }),
        ratingAverage: parseFloat(faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
        ratingCount: faker.number.int({ min: 0, max: 200 }),
        productCount: 0,
        totalSales: faker.number.int({ min: 0, max: 1000 }),
        joinedAt: faker.date.past({ years: 3 }),
      });

      vendorIds.push(vendorId);
      usedUserIds.add(userId);

      // Update user role to vendor
      await db
        .update(schema.user)
        .set({ role: "vendor" })
        .where(eq(schema.user.id, userId));
    } catch (error) {
      continue;
    }
  }

  console.log(`  ✓ Created ${vendorIds.length} vendors`);
  return vendorIds;
}

async function seedProducts(vendorIds: string[], count: number = 500) {
  console.log(`Seeding ${count} products with Faker...`);

  const productIds: string[] = [];
  const productNamePrefixes = [
    "Premium", "Deluxe", "Professional", "Elegant", "Modern", "Classic",
    "Luxury", "Standard", "Basic", "Advanced", "Ultimate", "Custom"
  ];

  const productTypes = [
    "Kit", "Set", "Package", "Bundle", "Collection", "System",
    "Unit", "Piece", "Arrangement", "Display", "Stand"
  ];

  for (let i = 0; i < count; i++) {
    const categoryData = faker.helpers.arrayElement(CATEGORIES_DATA);
    const subcategoryData = faker.helpers.arrayElement(categoryData.subcategories);
    const vendorId = faker.helpers.arrayElement(vendorIds);

    const prefix = faker.helpers.arrayElement(productNamePrefixes);
    const type = faker.helpers.arrayElement(productTypes);
    const title = `${prefix} ${subcategoryData.name.split(" ")[0]} ${type}`;
    const slug = slugify(title) + "-" + nanoid(6);

    const basePrice = faker.number.int({ min: 500, max: 50000 });
    const hasDiscount = faker.datatype.boolean({ probability: 0.3 });
    const salePrice = hasDiscount ? Math.floor(basePrice * faker.number.float({ min: 0.6, max: 0.9 })) : null;
    const stock = faker.number.int({ min: 0, max: 200 });

    const productId = nanoid();

    try {
      await db.insert(schema.products).values({
        id: productId,
        vendorId: vendorId,
        categoryId: categoryData.id,
        subcategoryId: subcategoryData.id,
        title: title,
        slug: slug,
        description: faker.lorem.paragraphs(2),
        descriptionShort: faker.lorem.sentence(),
        brand: faker.company.name(),
        sku: faker.string.alphanumeric(8).toUpperCase(),
        status: faker.helpers.arrayElement(["active", "active", "active", "draft"]),
        stockStatus: stock > 10 ? "in_stock" : stock > 0 ? "low_stock" : "out_of_stock",
        stock: stock,
        lowStockThreshold: 5,
        price: basePrice.toString(),
        salePrice: salePrice?.toString() || null,
        discountPercentage: salePrice ? Math.round(((basePrice - salePrice) / basePrice) * 100) : null,
        currency: "BDT",
        ratingAverage: parseFloat(faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }).toFixed(1)),
        ratingCount: faker.number.int({ min: 0, max: 150 }),
        weightKg: faker.number.float({ min: 0.1, max: 50, fractionDigits: 2 }).toString(),
        freeShipping: basePrice > 5000 || faker.datatype.boolean({ probability: 0.2 }),
        shippingCost: basePrice > 5000 ? null : faker.number.int({ min: 100, max: 500 }).toString(),
        shippingEstimatedDays: faker.number.int({ min: 1, max: 7 }),
        content: {
          keyFeatures: Array.from({ length: faker.number.int({ min: 3, max: 6 }) }, () => faker.lorem.sentence()),
          whatsIncluded: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => faker.commerce.productName()),
          badges: faker.helpers.arrayElements(["choice", "top_seller", "new", "verified"], faker.number.int({ min: 0, max: 2 })),
          returnPolicy: "7-day return policy for unused items",
          warranty: faker.helpers.arrayElement(["No warranty", "30 days", "6 months", "1 year warranty"]),
        },
        isFeatured: faker.datatype.boolean({ probability: 0.1 }),
        condition: faker.helpers.arrayElement(["new", "new", "new", "like-new"]),
        viewCount: faker.number.int({ min: 0, max: 5000 }),
        salesCount: faker.number.int({ min: 0, max: 500 }),
      });

      productIds.push(productId);

      // Add 1-3 images
      const imageCount = faker.number.int({ min: 1, max: 3 });
      for (let j = 0; j < imageCount; j++) {
        await db.insert(schema.productImages).values({
          id: nanoid(),
          productId: productId,
          url: faker.image.urlPicsumPhotos({ width: 800, height: 600 }),
          alt: `${title} image ${j + 1}`,
          isPrimary: j === 0,
          sortOrder: j,
        });
      }

      // Add event types (2-3 random)
      const eventTypes = randomEventTypes(faker.number.int({ min: 2, max: 3 }));
      for (const eventTypeId of eventTypes) {
        await db.insert(schema.productEventTypes).values({
          id: nanoid(),
          productId: productId,
          eventTypeId: eventTypeId,
        });
      }

      // Add shipping options
      await db.insert(schema.productShippingOptions).values({
        id: nanoid(),
        productId: productId,
        method: "standard",
        cost: "150",
        estimatedDays: 3,
        isDefault: true,
      });

      if (faker.datatype.boolean({ probability: 0.5 })) {
        await db.insert(schema.productShippingOptions).values({
          id: nanoid(),
          productId: productId,
          method: "express",
          cost: "350",
          estimatedDays: 1,
          isDefault: false,
        });
      }
    } catch (error) {
      console.error(`Error creating product ${i}:`, error);
      continue;
    }

    if ((i + 1) % 100 === 0) {
      console.log(`  ... ${i + 1}/${count} products created`);
    }
  }

  console.log(`  ✓ Created ${productIds.length} products with images and relations`);
  return productIds;
}

async function seedReviews(productIds: string[], userIds: string[], count: number = 1000) {
  console.log(`Seeding ${count} reviews with Faker...`);

  let created = 0;

  for (let i = 0; i < count; i++) {
    const productId = faker.helpers.arrayElement(productIds);
    const userId = faker.helpers.arrayElement(userIds);
    const rating = faker.number.int({ min: 1, max: 5 });

    try {
      await db.insert(schema.reviews).values({
        id: nanoid(),
        productId: productId,
        userId: userId,
        rating: rating,
        title: rating >= 4 ? faker.helpers.arrayElement([
          "Great product!",
          "Excellent quality",
          "Highly recommend",
          "Perfect for my event",
          "Exceeded expectations",
        ]) : faker.helpers.arrayElement([
          "Not as expected",
          "Could be better",
          "Average quality",
          null,
        ]),
        comment: faker.lorem.paragraph(),
        isVerifiedPurchase: faker.datatype.boolean({ probability: 0.7 }),
        isAnonymous: faker.datatype.boolean({ probability: 0.1 }),
        isApproved: faker.datatype.boolean({ probability: 0.95 }),
        helpfulVotes: faker.number.int({ min: 0, max: 50 }),
        notHelpfulVotes: faker.number.int({ min: 0, max: 10 }),
      });

      created++;
    } catch (error) {
      continue;
    }

    if ((i + 1) % 200 === 0) {
      console.log(`  ... ${i + 1}/${count} reviews created`);
    }
  }

  console.log(`  ✓ Created ${created} reviews`);
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  console.log("\n🌱 Starting enhanced database seed with Faker.js...\n");

  try {
    // Seed static data
    await seedCategories();
    await seedEventTypes();

    // Seed dynamic data with Faker
    const userIds = await seedUsers(100);
    const vendorIds = await seedVendors(userIds, 50);
    const productIds = await seedProducts(vendorIds, 500);
    await seedReviews(productIds, userIds, 1000);

    // Final report
    console.log("\n📊 Database Summary:");
    const stats = {
      users: (await db.select().from(schema.user)).length,
      vendors: (await db.select().from(schema.vendors)).length,
      categories: (await db.select().from(schema.categories)).length,
      subcategories: (await db.select().from(schema.subcategories)).length,
      eventTypes: (await db.select().from(schema.eventTypes)).length,
      products: (await db.select().from(schema.products)).length,
      productImages: (await db.select().from(schema.productImages)).length,
      reviews: (await db.select().from(schema.reviews)).length,
    };

    Object.entries(stats).forEach(([key, value]) => {
      console.log(`  📎 ${key}: ${value}`);
    });

    console.log("\n✅ Database seeding completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

main();
