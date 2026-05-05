# Homepage Management Feature - Implementation Guide

## Overview

This feature allows admins to manage the homepage images through the admin panel:

1. **Main Banner Slider** - Unlimited carousel slides with images and text
2. **4 Promotional Cards** - Fixed 4-slot grid beside the banner

---

## ✅ What Was Built

### 1. Database Schema

**Location**: `packages/db/src/schema/homepage.ts`

Two new tables were created:

- `home_banners` - Stores main carousel slides
  - Fields: id, imageUrl, title, subtitle, buttonText, buttonLink, isActive, sortOrder
  - Indexed for performance on active status and sort order

- `home_promo_cards` - Stores 4 promotional cards
  - Fields: id, slotNumber (1-4), imageUrl, label, title, link, isActive
  - Unique constraint on slotNumber

### 2. Backend APIs

**Public Endpoints** (`packages/api/src/routers/homepage.ts`):

- `GET /api/homepage.listBanners` - Returns active banners ordered by sortOrder
- `GET /api/homepage.listPromoCards` - Returns active promo cards ordered by slotNumber

**Admin Endpoints** (added to `packages/api/src/routers/admin.ts`):

Banner Management:

- `POST /api/admin.listAllBanners` - List all banners (active + inactive)
- `POST /api/admin.createBanner` - Create a new banner
- `PATCH /api/admin.updateBanner` - Update banner fields
- `DELETE /api/admin.deleteBanner` - Delete banner (also removes image from S3)
- `POST /api/admin.reorderBanners` - Update sortOrder for multiple banners

Promo Card Management:

- `POST /api/admin.listAllPromoCards` - List all promo cards
- `PATCH /api/admin.updatePromoCard` - Update or create promo card for a slot

### 3. Admin Panel Pages

**Banner Management** (`apps/web/src/routes/admin/homepage-banners.tsx`):

- List view with drag-and-drop reordering
- Create/Edit modal with image upload
- Toggle active/inactive status
- Delete confirmation
- Displays preview images and metadata

**Promo Card Management** (`apps/web/src/routes/admin/homepage-promo-cards.tsx`):

- 4-slot grid layout
- Edit modal for each slot
- Image upload for each card
- Toggle active/inactive per slot
- Visual preview of each card

### 4. Frontend Homepage

**Updated HeroCarousel** (`apps/web/src/components/carousel/HeroCarousel.tsx`):

- Fetches banners and promo cards from API
- Shows only active items
- Auto-rotates every 5 seconds
- Includes navigation arrows and dots
- Responsive design with loading skeleton

---

## 🚀 How to Use

### For Admins

1. **Access Admin Panel**:
   - Navigate to `/admin/homepage-banners` for banner management
   - Navigate to `/admin/homepage-promo-cards` for promo card management

2. **Manage Banners**:
   - Click "Add Banner" to create a new slide
   - Upload an image (stored in S3)
   - Fill in title, subtitle, button text, and link
   - Toggle "Active" to show/hide on homepage
   - Drag banners to reorder them
   - Click edit icon to modify
   - Click trash icon to delete

3. **Manage Promo Cards**:
   - Each slot (1-4) can be edited independently
   - Click "Edit" or "Add" on any slot
   - Upload image and fill in label, title, and link
   - Toggle "Active" to show/hide that card
   - All 4 cards are displayed in a 2x2 grid

### For Users (Homepage)

The homepage automatically displays:

- Active banner slides in a carousel (auto-rotates)
- Active promo cards in a 2x2 grid beside the banner
- Mobile-responsive layout (stacked on mobile, side-by-side on desktop)

---

## 📁 File Structure

```
packages/
├── db/
│   └── src/schema/homepage.ts              # Database schema
└── api/
    └── src/routers/
        ├── homepage.ts                      # Public APIs
        └── admin.ts                         # Admin APIs (updated)

apps/
├── web/src/
│   ├── routes/admin/
│   │   ├── homepage-banners.tsx            # Banner management UI
│   │   └── homepage-promo-cards.tsx        # Promo card management UI
│   └── components/carousel/
│       └── HeroCarousel.tsx                # Homepage carousel (updated)
└── server/src/
    └── index.ts                             # Server entry point

scripts/
├── apply-homepage-migration.ts              # Migration script
└── seed-homepage-data.ts                    # Seed script
```

---

## 🧪 Testing

### 1. Test Database

Run the seeding script to populate sample data:

```bash
bun /home/takib/Documents/nemo/my-better-t-app/scripts/seed-homepage-data.ts
```

This creates:

- 3 sample banner slides
- 4 sample promo cards

### 2. Test Admin Panel

1. Start the server and web app:

   ```bash
   bun run dev
   ```

2. Login as an admin user

3. Navigate to:
   - http://localhost:5173/admin/homepage-banners
   - http://localhost:5173/admin/homepage-promo-cards

4. Test operations:
   - Create a new banner
   - Upload an image
   - Reorder banners (drag & drop)
   - Toggle active/inactive
   - Edit a banner
   - Delete a banner
   - Update promo cards

### 3. Test Homepage

1. Navigate to: http://localhost:5173/

2. Verify:
   - Carousel displays active banners
   - Auto-rotates every 5 seconds
   - Navigation arrows work
   - Dots indicate current slide
   - Promo cards display in 2x2 grid
   - Clicking cards/buttons navigates correctly
   - Responsive on mobile devices

### 4. Test APIs

**Public Endpoints**:

```bash
# List banners
curl http://localhost:3000/api/homepage.listBanners

# List promo cards
curl http://localhost:3000/api/homepage.listPromoCards
```

**Admin Endpoints** (requires authentication):

```bash
# List all banners
curl -X POST http://localhost:3000/api/admin.listAllBanners \
  -H "Cookie: session=..." \
  -H "Content-Type: application/json"

# Create banner
curl -X POST http://localhost:3000/api/admin.createBanner \
  -H "Cookie: session=..." \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/image.jpg",
    "title": "Test Banner",
    "subtitle": "Test subtitle",
    "buttonText": "Shop Now",
    "buttonLink": "/products",
    "isActive": true,
    "sortOrder": 0
  }'
```

---

## 🔐 Security

- All admin endpoints require authentication and admin role
- File uploads use presigned S3 URLs (secure, direct upload)
- Images are stored with unique IDs to prevent overwriting
- Input validation using Zod schemas
- SQL injection protection via parameterized queries

---

## 🎨 Features

### Banner Management

✅ Unlimited slides
✅ Image upload to S3
✅ Title, subtitle, button text/link
✅ Active/inactive toggle
✅ Drag-and-drop reordering
✅ Auto-rotation on homepage
✅ Navigation arrows and dots

### Promo Card Management

✅ Exactly 4 fixed slots
✅ Image upload per slot
✅ Label, title, and link per card
✅ Active/inactive toggle per card
✅ 2x2 grid display
✅ Responsive layout

### Homepage Display

✅ Fetches data from API
✅ Shows only active items
✅ Auto-slide carousel (5s interval)
✅ Smooth transitions
✅ Loading skeleton
✅ Mobile-responsive
✅ Hover pause on carousel

---

## 📝 Sample Data

The seed script creates:

**Banners**:

1. Wedding Events - "Make Your Wedding Unforgettable"
2. Flash Sale - "Flash Sale - Up to 50% OFF"
3. Corporate Events - "Corporate Events Made Easy"

**Promo Cards**:

1. Wedding Decorations - "50% OFF RENTAL"
2. Sound & Lighting - "NEW ARRIVAL"
3. Furniture & Tents - "TOP SELLER"
4. Catering Equipment - "BEST DEALS"

---

## 🔄 Next Steps

To add more functionality, consider:

1. **Scheduling**: Add startDate/endDate for auto-activation
2. **Analytics**: Track clicks on banners/cards
3. **A/B Testing**: Test different variations
4. **Video Support**: Allow video backgrounds
5. **Localization**: Multi-language support
6. **Templates**: Predefined banner templates

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check server logs for API errors
3. Verify database connection
4. Ensure S3 credentials are configured
5. Check that images are accessible from S3

---

## ✨ Summary

You now have a complete homepage management system with:

- **Backend**: Database schema + APIs
- **Admin Panel**: Full CRUD interfaces with image upload
- **Frontend**: Dynamic homepage carousel and promo cards
- **Sample Data**: Ready to test immediately

Start the dev server and navigate to the admin panel to start managing your homepage!
