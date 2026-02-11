import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { randomBytes } from 'crypto';

// Simple nanoid replacement
function nanoid() {
  return randomBytes(10).toString('base64url');
}

// Load env from server
dotenv.config({ path: resolve(__dirname, '../apps/server/.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sampleBanners = [
  {
    id: nanoid(),
    imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80',
    title: 'Premium Event Equipment Rentals',
    subtitle: 'Everything you need for unforgettable celebrations',
    buttonText: 'Browse Catalog',
    buttonLink: '/products',
    isActive: true,
    sortOrder: 0,
  },
  {
    id: nanoid(),
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80',
    title: 'Flash Sale - Up to 50% OFF',
    subtitle: 'Limited time offer on lighting and sound equipment',
    buttonText: 'View Deals',
    buttonLink: '/flash-deals',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: nanoid(),
    imageUrl: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200&q=80',
    title: 'Transform Your Event Space',
    subtitle: 'Professional staging, lighting, and decor solutions',
    buttonText: 'Explore Options',
    buttonLink: '/products',
    isActive: true,
    sortOrder: 2,
  },
];

const samplePromoCards = [
  {
    id: nanoid(),
    slotNumber: 1,
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f29da8fd88?w=600&q=80',
    label: '50% OFF RENTAL',
    title: 'Event Decorations',
    link: '/category/decorations',
    isActive: true,
  },
  {
    id: nanoid(),
    slotNumber: 2,
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80',
    label: 'NEW ARRIVAL',
    title: 'Sound & Lighting',
    link: '/category/sound-lighting',
    isActive: true,
  },
  {
    id: nanoid(),
    slotNumber: 3,
    imageUrl: 'https://images.unsplash.com/photo-1600490036275-c0c2b8b2ef7d?w=600&q=80',
    label: 'TOP SELLER',
    title: 'Furniture & Tents',
    link: '/category/furniture-tents',
    isActive: true,
  },
  {
    id: nanoid(),
    slotNumber: 4,
    imageUrl: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&q=80',
    label: 'BEST DEALS',
    title: 'Catering Equipment',
    link: '/category/catering-equipment',
    isActive: true,
  },
];

async function seed() {
  console.log('Seeding homepage data...');

  try {
    // Insert banners
    for (const banner of sampleBanners) {
      await pool.query(
        `INSERT INTO home_banners (id, image_url, title, subtitle, button_text, button_link, is_active, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          banner.id,
          banner.imageUrl,
          banner.title,
          banner.subtitle,
          banner.buttonText,
          banner.buttonLink,
          banner.isActive,
          banner.sortOrder,
        ]
      );
    }
    console.log(`✅ Seeded ${sampleBanners.length} banners`);

    // Insert promo cards
    for (const card of samplePromoCards) {
      await pool.query(
        `INSERT INTO home_promo_cards (id, slot_number, image_url, label, title, link, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         ON CONFLICT (slot_number) DO UPDATE SET
           image_url = EXCLUDED.image_url,
           label = EXCLUDED.label,
           title = EXCLUDED.title,
           link = EXCLUDED.link,
           is_active = EXCLUDED.is_active,
           updated_at = NOW()`,
        [
          card.id,
          card.slotNumber,
          card.imageUrl,
          card.label,
          card.title,
          card.link,
          card.isActive,
        ]
      );
    }
    console.log(`✅ Seeded ${samplePromoCards.length} promo cards`);

    // Check final counts
    const { rows: bannerCount } = await pool.query('SELECT COUNT(*) FROM home_banners WHERE is_active = true');
    const { rows: cardCount } = await pool.query('SELECT COUNT(*) FROM home_promo_cards WHERE is_active = true');

    console.log(`\n📊 Summary:`);
    console.log(`  Active Banners: ${bannerCount[0].count}`);
    console.log(`  Active Promo Cards: ${cardCount[0].count}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
