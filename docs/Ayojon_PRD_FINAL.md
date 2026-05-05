# Ayojon — Multi-Vendor E-Commerce Platform for Event Products

## Product Requirements Document (PRD) - MVP Edition

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Vision & Goals](#product-vision--goals)
3. [Technology Stack](#technology-stack)
4. [Story Point Reference](#story-point-reference)
5. [Epic Overview](#epic-overview)
6. [Epic 1: User Registration & Authentication](#epic-1-user-registration--authentication)
7. [Epic 2: Homepage & Core Navigation](#epic-2-homepage--core-navigation)
8. [Epic 3: Product Browsing & Search](#epic-3-product-browsing--search)
9. [Epic 4: Product Details](#epic-4-product-details)
10. [Epic 5: Shopping Cart Management](#epic-5-shopping-cart-management)
11. [Epic 6: Checkout & Payment Flow](#epic-6-checkout--payment-flow)
12. [Epic 7: User Account & Profile](#epic-7-user-account--profile)
13. [Epic 8: Order Tracking & History](#epic-8-order-tracking--history)
14. [Epic 9: Vendor Dashboard & Management](#epic-9-vendor-dashboard--management)
15. [Epic 10: Reviews & Ratings System](#epic-10-reviews--ratings-system)
16. [Epic 11: Admin Dashboard & Platform Management](#epic-11-admin-dashboard--platform-management)
17. [Non-Functional Requirements](#non-functional-requirements)
18. [Success Metrics](#success-metrics)

---

## Executive Summary

Ayojon is a **full-stack** multi-vendor e-commerce platform specializing in event-related products, targeting South Asian users, primarily in Bangladesh. The platform enables multiple vendors to sell event products (decorations, sound systems, lighting, furniture, catering supplies, photography equipment, etc.) while providing consumers with a unified shopping experience.

**One-Line Pitch:** "The Daraz for events—buy everything you need for any occasion, from hundreds of vendors in one place."

**Scope:** Full-stack application with real database, authentication, file storage, payment workflows, and a comprehensive admin panel.

**Target Market:** South Asian users, primarily English-speaking Bangladesh (BDT ৳)  
**Device Priority:** Mobile (70%), Desktop (25%), Tablet (5%)

---

## Product Vision & Goals

**Vision:** Deliver a production-ready multi-vendor e-commerce platform with comprehensive vendor management, admin tooling, and a polished customer shopping experience for event products.

**Primary Goals:**

- Build secure authentication flows for both users and vendors (email/password + Google + Facebook OAuth)
- Build a fully functional e-commerce UI with product-centric browsing
- Implement comprehensive product filtering and sorting
- Support local payment flows (COD, bKash, Nagad, card)
- Enable vendor self-service portal for product and order management
- Build a full admin dashboard for platform operations
- Achieve Lighthouse performance score > 90

---

## Technology Stack

### Frontend

| Technology          | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| **React 19**        | UI framework                                     |
| **TanStack Router** | File-based routing with type-safe loaders        |
| **TanStack Query**  | Server state management & caching                |
| **Vite**            | Build tool & dev server                          |
| **Tailwind CSS v4** | Utility-first styling                            |
| **shadcn/ui**       | Component library (dialog, dropdown, tabs, etc.) |
| **Zustand**         | Client-side state (cart, filters, theme, etc.)   |
| **Sentry**          | Error tracking                                   |

### Backend

| Technology      | Purpose                                                                  |
| --------------- | ------------------------------------------------------------------------ |
| **Hono**        | HTTP framework (running on Bun runtime)                                  |
| **oRPC**        | Type-safe RPC layer with OpenAPI generation                              |
| **better-auth** | Authentication (email/password, Google OAuth, Facebook OAuth, Email OTP) |
| **Drizzle ORM** | Type-safe database access                                                |
| **Nodemailer**  | Transactional emails (OTP, password reset)                               |
| **Scalar**      | Interactive API documentation                                            |
| **Sentry**      | Error monitoring                                                         |

### Infrastructure

| Technology                | Purpose                                |
| ------------------------- | -------------------------------------- |
| **PostgreSQL (Supabase)** | Primary database                       |
| **Amazon S3**             | File/image storage (presigned uploads) |
| **Bun**                   | JavaScript runtime                     |

### Monorepo Packages

| Package            | Purpose                                  |
| ------------------ | ---------------------------------------- |
| `apps/web`         | Customer, vendor, and admin frontend     |
| `apps/server`      | API server                               |
| `packages/api`     | Routers, services, and business logic    |
| `packages/auth`    | Authentication configuration             |
| `packages/db`      | Database schema (Drizzle) and migrations |
| `packages/config`  | Shared configuration                     |
| `packages/env`     | Environment variable validation          |
| `packages/storage` | S3 storage utilities                     |

---

## Story Point Reference

| Points | Complexity   | Typical Effort |
| ------ | ------------ | -------------- |
| 1      | Trivial      | < 2 hours      |
| 2      | Simple       | 2-4 hours      |
| 3      | Moderate     | 4-8 hours      |
| 5      | Complex      | 1-2 days       |
| 8      | Very Complex | 2-3 days       |
| 13     | Large        | 3-5 days       |

---

## Epic Overview

| #         | Epic Name                             | Description                                              | Total Points |
| --------- | ------------------------------------- | -------------------------------------------------------- | ------------ |
| 1         | User Registration & Authentication    | Complete user sign-up, login, and session management     | 32           |
| 2         | Homepage & Core Navigation            | Landing page with featured products and navigation       | 50           |
| 3         | Product Browsing & Search             | Product discovery with filters and search                | 47           |
| 4         | Product Details                       | Comprehensive product pages with specifications          | 40           |
| 5         | Shopping Cart Management              | Cart operations with quantity management and persistence | 37           |
| 6         | Checkout & Payment Flow               | Complete checkout with local payment methods             | 53           |
| 7         | User Account & Profile                | User dashboard and profile management                    | 38           |
| 8         | Order Tracking & History              | Order management and tracking                            | 27           |
| 9         | Vendor Dashboard & Management         | Vendor portal for products and orders                    | 47           |
| 10        | Reviews & Ratings System              | Product and vendor review capabilities                   | 18           |
| 11        | Admin Dashboard & Platform Management | Admin panel for platform operations                      | 68           |
| **TOTAL** |                                       |                                                          | **457**      |

---

## Epic 1: User Registration & Authentication

**Description:** Enable users to create accounts, authenticate securely, and manage their sessions with support for email/password and social login options.

**Business Value:** Foundation for personalized shopping experience and order tracking

**Total Points:** 32

---

### US-1.1: User Registration with Email

**`5 points`**

**As a** visitor  
**I want to** sign up with my email and password  
**So that** I can create an account and start shopping

**Acceptance Criteria:**

- Sign up form with: Full Name, Email, Password, Confirm Password
- Password requirements enforced
- Email format validation with real-time feedback
- "Sign Up" button disabled until all fields valid
- Success message and auto-login after registration
- Error messages for: Email already exists, Invalid format, Weak password
- Redirect to homepage after successful signup
- Email OTP verification before account creation (6-digit code, 5-min expiry, 3 max attempts)

---

### US-1.2: User Login

**`3 points`**

**As a** registered user  
**I want to** sign in with my email and password  
**So that** I can access my account and orders

**Acceptance Criteria:**

- Login form with: Email, Password fields
- "Forgot password?" link prominently displayed
- "Sign In" button
- Navigate to homepage or role-based dashboard after successful login
- Clear error message for invalid credentials
- Loading state on button during authentication
- Role-based redirect (admin → `/admin/dashboard`, vendor → `/vendor/dashboard`, customer → `/`)
- Auto-reactivation of deactivated accounts on login
- "Remember me" checkbox to persist session
- Rate limiting on login attempts at API level

---

### US-1.3: Google Social Login

**`5 points`**

**As a** user  
**I want to** sign in with my Google account  
**So that** I can quickly access without creating a new password

**Acceptance Criteria:**

- "Continue with Google" button on login and register pages
- OAuth flow with Google authentication
- Auto-create account on first Google sign-in
- Link to existing account if email matches
- Extract name and email from Google profile
- Success navigation to homepage
- Handle OAuth errors gracefully (cancelled, network error)

---

### US-1.4: Facebook Social Login

**`5 points`**

**As a** user  
**I want to** sign in with my Facebook account  
**So that** I have multiple convenient login options

**Acceptance Criteria:**

- "Continue with Facebook" button on login and register pages
- OAuth flow with Facebook authentication
- Auto-create account on first Facebook sign-in
- Link to existing account if email matches
- Extract name and email from Facebook profile
- Success navigation to homepage
- Handle OAuth errors gracefully

---

### US-1.5: Password Reset Flow

**`5 points`**

**As a** user  
**I want to** reset my password  
**So that** I can regain access if I forget my credentials

**Acceptance Criteria:**

- "Forgot Password" page with email input field
- Reset email sent with link via Nodemailer
- Reset password page accessible via unique token
- New password form with: New Password, Confirm Password fields
- Password requirements enforced
- Success message after reset
- Redirect to login page after successful reset
- Token expiry handling

---

### US-1.6: User Logout

**`2 points`**

**As a** logged-in user  
**I want to** sign out of my account  
**So that** I can end my session securely

**Acceptance Criteria:**

- "Sign Out" option in user menu dropdown
- Clear all session data on sign-out
- Redirect to homepage
- Remove authentication tokens/cookies

---

### US-1.7: Session Management

**`3 points`**

**As a** logged-in user  
**I want to** maintain my session across page refreshes  
**So that** I don't have to re-login constantly

**Acceptance Criteria:**

- Persist authentication state via secure HTTP-only cookies (server-side sessions)
- Auto-restore session on page load via `getSession()` API call
- Display user name/avatar in header when logged in
- Protected routes redirect to login if not authenticated
- Session expiry handler component for client-side session monitoring
- Auth middleware in TanStack Router server functions

## Epic 2: Homepage & Core Navigation

**Description:** Create an engaging landing page with featured products, promotions, category navigation, and essential site-wide navigation elements.

**Business Value:** First impression and primary entry point for product discovery

**Total Points:** 50

---

### US-2.1: Header with Navigation

**`8 points`**

**As a** visitor  
**I want to** access key site sections from the header  
**So that** I can easily navigate the platform

**Acceptance Criteria:**

- Fixed header with platform logo (links to homepage)
- Search bar in header (desktop: prominent, mobile: icon → mobile search modal)
- Category mega menu dropdown
- Icons: Cart (with item count badge), User menu, Theme toggle, Wishlist icon, Notification bell
- Mobile: Hamburger menu with drawer navigation
- User menu dropdown: role-based options (customer, vendor, admin)
- Guest user menu: Sign In, Sign Up
- Responsive design
- Three header variants — Customer, Vendor, Admin
- Currency selector for multi-currency support (BDT, INR, PKR, USD)
- Notification bell with unread count badge

---

### US-2.2: Hero Section with Promotions

**`5 points`**

**As a** visitor  
**I want to** see featured promotions and banner  
**So that** I'm aware of current deals and events

**Acceptance Criteria:**

- Large hero banner with auto-rotating carousel
- Each slide: Image, Headline, Subtext, CTA button
- Navigation controls
- Mobile responsive
- Admin-manageable banners via `home_banners` database table
- S3 image upload for banner images
- Sort order and active/inactive toggle

---

### US-2.3: Event Type Quick Categories

**`3 points`**

**As a** visitor  
**I want to** browse products by event type  
**So that** I can quickly find items for my specific occasion

**Acceptance Criteria:**

- Grid of event type cards (Wedding, Birthday, Corporate, Religious, Anniversary, Baby Shower, etc.)
- Each card: Icon, Event name
- Clicking card navigates to filtered product results
- Responsive grid layout
- Event types stored in `event_types` database table

---

### US-2.4: Flash Deals Section

**`5 points`**

**As a** shopper  
**I want to** see time-limited deals  
**So that** I can take advantage of special offers

**Acceptance Criteria:**

- "Flash Deals" section with countdown timer
- Product carousel with deal products
- Each product card: Image, Name, Original price, Deal price, Discount %
- Countdown timer format: "Ends in HH:MM:SS"
- Dedicated flash deals page (`/flash-deals`)
- Admin-configurable flash deal end time in platform settings
- Admin can flag products as flash/hot/daily/clearance/bundle deals

---

### US-2.5: Featured Products Grid

**`8 points`**

**As a** shopper  
**I want to** see popular and recommended products  
**So that** I can discover trending items

**Acceptance Criteria:**

- "Featured Products" section on homepage
- Grid layout: responsive columns
- Product card components: Image, Name, Price, Rating, "Add to Cart" button, Wishlist heart icon
- Product badges (featured, deal type)
- Hover effects
- Featured flag stored in `products` table, toggleable by admin

---

### US-2.6: Category Showcase Sections

**`5 points`**

**As a** visitor  
**I want to** explore products by major categories  
**So that** I can browse organized product collections

**Acceptance Criteria:**

- Multiple category sections on homepage: "Decorations", "Sound & Lighting", "Furniture", "Catering Equipment"
- Each section: Title, "View All" link, Product carousel
- Product cards (same as featured)
- Responsive layout

---

### US-2.7: Footer with Information

**`3 points`**

**As a** visitor  
**I want to** access important links and information  
**So that** I can learn about the platform and policies

**Acceptance Criteria:**

- Footer sections with links (About, Contact, FAQ, Terms, Privacy, etc.)
- Display accepted payment icons
- Social media icons
- Newsletter signup form
- Copyright notice
- Trust badges component

---

### US-2.8: Breadcrumb Navigation

**`3 points`**

**As a** user  
**I want to** see my current location in the site hierarchy  
**So that** I can easily navigate back

**Acceptance Criteria:**

- Breadcrumb trail on non-homepage pages
- Format: Home > Category > Subcategory > Product
- Each crumb is clickable link
- Integrated in customer layout

---

### US-2.9: Theme Toggle (Dark/Light Mode)

**`5 points`**

**As a** user  
**I want to** switch between light and dark themes  
**So that** I can choose my preferred visual style

**Acceptance Criteria:**

- Theme toggle button in header (sun/moon icon)
- Persist theme preference in local storage
- Apply theme immediately across all components
- System theme detection on first visit
- Hydration-safe inline script to prevent flash of wrong theme

---

### US-2.10: Mobile Bottom Navigation

**`5 points`**

**As a** mobile user  
**I want to** quick access to key actions  
**So that** I can navigate efficiently on mobile

**Acceptance Criteria:**

- Fixed bottom navigation bar (mobile only)
- Tabs: Home, Categories, Cart, Account (4 icons)
- Active tab highlighted (color + icon fill)
- Icon with label below each tab
- Cart tab shows item count badge
- Smooth transitions between tabs
- Doesn't overlap with page content

---

## Epic 3: Product Browsing & Search

**Description:** Comprehensive product discovery system with advanced search, filtering, and sorting capabilities.

**Business Value:** Enables efficient product discovery and improves conversion rates

**Total Points:** 47

---

### US-3.1: Search Bar with Autocomplete

**`8 points`**

**As a** shopper  
**I want to** search for products with autocomplete suggestions  
**So that** I can quickly find specific items

**Acceptance Criteria:**

- Search bar in header (always visible)
- Autocomplete/search suggestions via `searchProducts` API (ILIKE query)
- Mobile: full screen search overlay
- Clear search button
- Search triggers navigation to `/products?search=...`
- Custom `useSearch` hook for search state

---

### US-3.2: Search Results Page

**`8 points`**

**As a** shopper  
**I want to** see comprehensive search results  
**So that** I can review all matching products

**Acceptance Criteria:**

- Search results on `/products` page with query param
- Product grid with cards
- Sorting options: Price Low→High, Price High→Low, Rating, Newest, Most Popular
- Pagination
- Filter sidebar with category/subcategory/price/vendor filters
- Active filters displayed as removable chips
- "No results" state

---

### US-3.3: Category Pages

**`5 points`**

**As a** shopper  
**I want to** browse products within a category  
**So that** I can see all available options

**Acceptance Criteria:**

- Category page at `/category/$categorySlug`
- Category banner, description, product count
- Subcategory filter
- Product grid with sorting and pagination
- Related categories section
- Breadcrumb: Home > Category

---

### US-3.4: Advanced Filters Sidebar

**`13 points`**

**As a** shopper  
**I want to** filter products by multiple criteria  
**So that** I can narrow down to exactly what I need

**Acceptance Criteria:**

- Filter sidebar (desktop: left side, mobile: drawer/modal)
- Filter by: Price range, Category, Subcategory, Vendor, Event type
- Rating filter (star-based)
- Delivery options filter
- Product condition filter
- Sorting options
- Active filters displayed as removable chips above results
- Filter results persisted in URL query params
- Client-side filter state management

---

### US-3.5: Sorting Options

**`3 points`**

**As a** shopper  
**I want to** sort products by different criteria  
**So that** I can view items in my preferred order

**Acceptance Criteria:**

- Sorting dropdown on product listing pages
- Options: Price Low→High, Price High→Low, Rating, Newest, Most Popular
- Sort persists across pagination via URL params
- Responsive design

---

### US-3.6: Product Quick View

**`5 points`**

**As a** shopper  
**I want to** preview product details without leaving the page  
**So that** I can quickly evaluate multiple products

**Acceptance Criteria:**

- Quick view modal triggered from product cards
- Product image, name, price, rating, short description
- "Add to Cart" button
- "View Full Details" link
- Zustand store for modal state

---

### US-3.7: Wishlist from Product Grid

**`3 points`**

**As a** shopper  
**I want to** add products to wishlist from the grid  
**So that** I can save items for later

**Acceptance Criteria:**

- Heart icon on product cards
- Click to add/remove from wishlist (toggle)
- Wishlist persists via database (`wishlist` table with composite PK)
- Wishlist icon in header with count
- Client-side wishlist state store
- Dedicated `/wishlist` page and `/account/wishlist` page

---

### US-3.8: "Compare Products" Feature

**`2 points`**

**As a** shopper  
**I want to** compare multiple products side-by-side  
**So that** I can make informed purchase decisions

**Acceptance Criteria:**

- "Compare" checkbox on product cards
- Select up to 3 products to compare
- "Compare (X)" button appears when products selected
- Comparison page shows products in columns
- Compare: Image, Name, Price, Rating, Key specs, Description, Availability
- Remove products from comparison
- Clear all comparison selections

---

## Epic 4: Product Details

**Description:** Comprehensive product detail pages with image galleries, specifications, pricing, and vendor information.

**Business Value:** Provides complete information for purchase decisions

**Total Points:** 40

---

### US-4.1: Product Image Gallery

**`5 points`**

**As a** shopper  
**I want to** view high-quality product images  
**So that** I can see the product clearly before buying

**Acceptance Criteria:**

- Large primary image display
- Thumbnail navigation
- Image gallery component
- Multiple images per product (stored in `product_images` table with S3 URLs)
- Sort order and primary image flag

---

### US-4.2: Product Information Section

**`5 points`**

**As a** shopper  
**I want to** read detailed product information  
**So that** I know exactly what I'm getting

**Acceptance Criteria:**

- Product title, category, description
- Rating display (stars + review count)
- Availability status (in stock / low stock / out of stock)
- SKU display
- Vendor name with link to vendor storefront
- Product badges (featured, deal type)

---

### US-4.3: Pricing and Purchase Options

**`5 points`**

**As a** shopper  
**I want to** see clear pricing information  
**So that** I understand the total cost

**Acceptance Criteria:**

- Price display with currency (৳) — currency selector supports BDT, INR, PKR, USD
- Original price (struck through if on sale)
- Discount percentage badge
- Quantity selector
- Stock quantity display if low

---

### US-4.4: Add to Cart Actions

**`5 points`**

**As a** shopper  
**I want to** add products to my cart  
**So that** I can proceed to checkout

**Acceptance Criteria:**

- "Add to Cart" button
- Loading state on button click
- Success toast notification
- Cart count badge updates
- Cart drawer opens on add
- Quantity selection
- Stock availability check (stock tracked in DB, low/out-of-stock notifications sent to vendor)

---

### US-4.5: Product Specifications Tab

**`3 points`**

**As a** shopper  
**I want to** view detailed product specifications  
**So that** I can verify it meets my requirements

**Acceptance Criteria:**

- Tabbed interface for product details
- Key-value specification pairs stored in `product_specifications` table
- Specifications loaded with product detail API

---

### US-4.6: Product Description Tab

**`3 points`**

**As a** shopper  
**I want to** read the full product description  
**So that** I understand what's included

**Acceptance Criteria:**

- Full product description display
- Key features stored as JSONB array in `keyFeatures` column
- Formatted rich text content

---

### US-4.7: Customer Reviews Display

**`8 points`**

**As a** shopper  
**I want to** read customer reviews  
**So that** I can learn from others' experiences

**Acceptance Criteria:**

- Reviews section with overall rating summary
- Individual review cards with user name, star rating, date, review text
- Review images (stored in `review_images` table with S3)
- Helpful votes ("Was this helpful?" with toggle behavior)
- Pagination
- "Write a Review" button (only if purchased & delivered)
- Verified purchase check before allowing review
- One review per product per customer (enforced by unique DB index)

---

### US-4.8: Vendor Information Card

**`3 points`**

**As a** shopper  
**I want to** see vendor details  
**So that** I know who I'm buying from

**Acceptance Criteria:**

- Vendor name with link to storefront (`/vendor/$vendorId`)
- Vendor profile info (logo, description, rating, product count)
- Verification badge
- Vendor score (composite: 65% avg product rating + 35% order completion rate)

---

### US-4.9: Related Products Section

**`3 points`**

**As a** shopper  
**I want to** see related or similar products  
**So that** I can explore alternatives

**Acceptance Criteria:**

- "You May Also Like" section at page bottom
- Related products loaded from same category
- Product cards displayed below product detail

---

## Epic 5: Shopping Cart Management

**Description:** Full-featured shopping cart system with quantity management, price calculations, and persistence.

**Business Value:** Critical step in the purchase funnel that impacts conversion

**Total Points:** 37

---

### US-5.1: Cart Drawer (Quick View)

**`5 points`**

**As a** shopper  
**I want to** see my cart without leaving the current page  
**So that** I can quickly review items

**Acceptance Criteria:**

- Cart icon in header with item count badge
- Click cart icon to open slide-out drawer from right
- Cart drawer displays: Cart items, Subtotal, "View Cart" / "Checkout" buttons
- Empty cart state

---

### US-5.2: Full Cart Page

**`8 points`**

**As a** shopper  
**I want to** view and manage all cart items  
**So that** I can finalize my order before checkout

**Acceptance Criteria:**

- Dedicated cart page (`/cart`)
- Product image, name, vendor link, price, quantity selector, subtotal, remove button
- "Continue Shopping" button
- Order summary sidebar with price breakdown
- "Proceed to Checkout" button
- Empty cart state with suggested products (recommended products section)
- Login prompt for guest users

---

### US-5.3: Quantity Management

**`5 points`**

**As a** shopper  
**I want to** change item quantities in cart  
**So that** I can order the right amount

**Acceptance Criteria:**

- Quantity selector: minus/plus buttons with number display
- Min/max quantity enforcement
- Auto-update subtotal and total
- Synced with database for logged-in users

---

### US-5.4: Remove Cart Items

**`3 points`**

**As a** shopper  
**I want to** remove items from cart  
**So that** I can delete items I no longer want

**Acceptance Criteria:**

- Remove button on each cart item
- Confirmation dialog
- Recalculate totals after removal
- Update cart count badge

---

### US-5.5: Save for Later

**`3 points`**

**As a** shopper  
**I want to** move items to "Saved for Later"  
**So that** I can purchase them another time

**Acceptance Criteria:**

- "Save for Later" functionality in cart page
- Separate section for saved items
- "Move to Cart" button on saved items

---

### US-5.6: Cart Price Breakdown

**`5 points`**

**As a** shopper  
**I want to** see a detailed price breakdown  
**So that** I understand all charges

**Acceptance Criteria:**

- Order summary: Items subtotal, shipping cost, discount, total
- Breakdown updates on quantity change
- Shipping fee calculation (configurable per platform settings: Dhaka rate vs outside Dhaka rate)

---

### US-5.7: Apply Discount Coupon

**`5 points`**

**As a** shopper  
**I want to** apply discount coupons  
**So that** I can save money

**Acceptance Criteria:**

- Coupon input field in cart
- Apply button with validation
- Discount reflected in price breakdown
- Error messages: "Invalid coupon", "Expired", "Minimum order not met"
- Display applied coupon with "Remove" option

---

### US-5.8: Cart Persistence

**`3 points`**

**As a** shopper  
**I want to** my cart saved across sessions  
**So that** I don't lose items if I close the browser

**Acceptance Criteria:**

- Client-side persistence via Zustand store (local storage)
- Database-backed cart for logged-in users (`cart` table with composite PK on userId + productId + variantId)
- `syncCart` API procedure merges local cart to database on login

---

## Epic 6: Checkout & Payment Flow

**Description:** Secure and streamlined checkout process supporting multiple payment methods including local options like bKash, Nagad, and card payments.

**Business Value:** Final conversion step — must be smooth to prevent cart abandonment

**Total Points:** 53

---

### US-6.1: Checkout Page Layout

**`5 points`**

**As a** shopper  
**I want to** see a clear checkout process  
**So that** I know what steps to complete

**Acceptance Criteria:**

- Multi-step checkout: Shipping → Payment → Review → Confirmation
- Progress indicator
- Order summary visible throughout
- "Edit Cart" option

---

### US-6.2: Shipping Address Form

**`8 points`**

**As a** shopper  
**I want to** enter my delivery address  
**So that** my order arrives at the right place

**Acceptance Criteria:**

- Full address form: Name, Phone, Address Line 1 & 2, City, Division (Dhaka, Chittagong, Sylhet, Rajshahi, Khulna), Postal Code, Address Type (Home/Office)
- "Save this address" option
- Select from saved addresses (max 5 per user)
- "Add new address" option
- Field validation

---

### US-6.3: Delivery Options Selection

**`5 points`**

**As a** shopper  
**I want to** choose my delivery method  
**So that** I can get my order when needed

**Acceptance Criteria:**

- Delivery method options with pricing
- Delivery cost updates in order summary
- Configurable shipping rates in platform settings (Dhaka rate vs outside Dhaka rate)

---

### US-6.4: Payment Method Selection

**`8 points`**

**As a** shopper  
**I want to** choose how to pay  
**So that** I can complete my purchase conveniently

**Acceptance Criteria:**

- bKash payment option
- Cash on Delivery (COD) option
- Nagad payment option
- Credit/Debit Card payment option
- Selected method highlighted
- Payment method stored with order

---

### US-6.5: bKash Payment Flow

**`8 points`**

**As a** shopper  
**I want to** pay using bKash  
**So that** I can use my mobile wallet

**Acceptance Criteria:**

- bKash payment form
- Customer submits bKash Transaction ID + sender mobile number as proof of payment
- Order placed with status `awaiting_payment`
- Customer submits payment proof → status moves to `payment_submitted`
- Admin verifies payment → `payment_received`
- Admin can reject payment with reason → `payment_rejected`
- Payment status tracked in `payments` table

---

### US-6.6: Nagad Payment Flow

**`8 points`**

**As a** shopper  
**I want to** pay using Nagad  
**So that** I have another mobile payment option

**Acceptance Criteria:**

- Nagad payment form with mobile number input (11 digits) and PIN
- "Pay Now" button
- Loading state during payment processing
- Success screen with: Transaction ID, Amount paid, Timestamp
- Error handling: Invalid number, Wrong PIN, Insufficient balance

---

### US-6.7: Card Payment Form

**`8 points`**

**As a** shopper  
**I want to** pay with credit/debit card  
**So that** I can use international payment methods

**Acceptance Criteria:**

- Card payment form: Card number (16 digits), Cardholder name, Expiry date (MM/YY), CVV
- Card type detection: Visa, Mastercard icon
- Field validation: Luhn algorithm for card number, valid expiry, CVV length
- "Pay ৳X" button
- Save card for future purchases checkbox
- Success/failure screens

---

### US-6.8: Order Review Before Payment

**`3 points`**

**As a** shopper  
**I want to** review my order before paying  
**So that** I can confirm everything is correct

**Acceptance Criteria:**

- Order review step in checkout showing all items, address, payment method, total
- "Place Order" button
- Order placed via `order.placeOrder` API

---

## Epic 7: User Account & Profile

**Description:** User account management including profile editing, address management, wishlist, and account settings.

**Business Value:** Enables personalization and improves user retention

**Total Points:** 38

---

### US-7.1: Account Dashboard

**`5 points`**

**As a** logged-in user  
**I want to** see my account dashboard  
**So that** I can access my account features

**Acceptance Criteria:**

- Account page at `/account`
- Sidebar navigation (desktop) and mobile navigation
- Overview section with user stats, recent orders, wishlist count
- Quick action links

---

### US-7.2: Edit Profile Information

**`5 points`**

**As a** user  
**I want to** update my profile details  
**So that** my information is current

**Acceptance Criteria:**

- Profile edit page at `/account/profile`
- Profile fields: Name, Email (with verification status)
- Email change requires OTP verification
- Email change unlinks OAuth accounts for security

---

### US-7.3: Manage Saved Addresses

**`8 points`**

**As a** user  
**I want to** save multiple delivery addresses  
**So that** I can quickly select them at checkout

**Acceptance Criteria:**

- Saved addresses page at `/account/addresses`
- Also accessible at standalone `/addresses` route
- Display all saved addresses as cards
- Default address highlighted
- "Add New Address" button → modal form
- Edit and Delete with confirmation
- Maximum 5 addresses enforced
- "Set as Default" functionality
- Full CRUD via `address` API router

---

### US-7.4: Wishlist Management

**`5 points`**

**As a** user  
**I want to** manage my saved products  
**So that** I can keep track of items I like

**Acceptance Criteria:**

- Wishlist page at `/wishlist` (standalone) and `/account/wishlist` (in account)
- Grid of wishlisted products
- Remove from wishlist
- "Add to Cart" from wishlist
- Empty wishlist state
- Wishlist icon in header with count
- Database-backed (`wishlist` table with composite PK)

---

### US-7.5: Change Password

**`3 points`**

**As a** user  
**I want to** change my password  
**So that** I can keep my account secure

**Acceptance Criteria:**

- Password change form in account settings
- Current password, New password, Confirm new password
- Validation and error handling
- Success message

---

### US-7.6: Notification Preferences

**`3 points`**

**As a** user  
**I want to** control what notifications I receive  
**So that** I only get relevant updates

**Acceptance Criteria:**

- Notification settings page
- Categories with toggle switches:
  - Order Updates: Order status, Delivery updates
  - Promotions: Sales, Flash deals, New arrivals
  - Product Alerts: Back in stock, Price drops
  - Account: Security alerts, Password changes
- Toggle each category on/off
- "Save Preferences" button

---

### US-7.7: Deactivate Account

**`3 points`**

**As a** user  
**I want to** deactivate my account  
**So that** I can stop using the platform temporarily

**Acceptance Criteria:**

- Account deactivation option in settings
- Prevents deactivation if pending orders exist
- Soft deactivation (90-day data retention)
- Reason and feedback captured
- Auto-reactivation on next login

---

### US-7.8: Account Activity Log

**`3 points`**

**As a** user  
**I want to** see my recent account activity  
**So that** I can monitor for suspicious actions

**Acceptance Criteria:**

- Activity log page in Settings
- List of recent activities (last 30 days): Login attempts, Password changes, Profile edits
- Each entry: Action, Date/Time, Device info
- "Sign out all devices" button
- Pagination or "Load More"

---

### US-7.9: Contact Preferences

**`3 points`**

**As a** user  
**I want to** choose how I'm contacted  
**So that** I receive updates via my preferred channel

**Acceptance Criteria:**

- Contact preference section in Settings
- Preferred contact method: Email, SMS, In-App, WhatsApp (checkboxes)
- Preferred language: English, Bangla (future)
- "Save Preferences" button
- Marketing consent checkbox

---

## Epic 8: Order Tracking & History

**Description:** Order management system for tracking purchases, viewing history, and managing cancellations.

**Business Value:** Provides post-purchase support and transparency

**Total Points:** 27

---

### US-8.1: Order History List

**`5 points`**

**As a** user  
**I want to** view all my past orders  
**So that** I can track my purchase history

**Acceptance Criteria:**

- Orders page at `/account/orders`
- List of orders sorted by date
- Each order: order number (format: `AYJ-XXXXXXXX`), date, total, status badge, item thumbnails
- "View Details" button
- Empty state

---

### US-8.2: Order Details Page

**`8 points`**

**As a** user  
**I want to** see complete details of an order  
**So that** I know exactly what I ordered

**Acceptance Criteria:**

- Order details page at `/account/orders/$orderId`
- Order info: number, date, status, payment method, payment status
- Items list with images, names, quantities, prices
- Delivery address
- Price breakdown
- Order timeline component showing status progression
- Action buttons: "Cancel Order" (with reasons), "Buy Again" (add items to cart)
- bKash payment submission (submit transaction ID if awaiting payment)
- Leave product reviews directly from order detail page
- Download invoice as PDF
- Order items store product snapshots (name, price, image at time of order)

---

### US-8.3: Order Tracking

**`8 points`**

**As a** user  
**I want to** track my order in real-time  
**So that** I know when it will arrive

**Acceptance Criteria:**

- Public tracking page at `/track/$orderNumber` (no auth required)
- Status timeline: Placed → Confirmed → Shipped → Out for Delivery → Delivered
- Estimated delivery date
- Share tracking link
- Map view showing delivery progress
- Delivery person details when out for delivery
- Guest tracking via email + order ID

---

### US-8.4: Cancel Order

**`3 points`**

**As a** user  
**I want to** cancel my order before it ships  
**So that** I can stop an unwanted purchase

**Acceptance Criteria:**

- "Cancel Order" button on order details (only for cancellable statuses)
- Cancellation reason selection
- Order status updates to "Cancelled"
- State machine enforces valid transitions (cannot cancel shipped/delivered orders)
- Notification sent on cancellation

---

### US-8.5: Invoice Download

**`3 points`**

**As a** user  
**I want to** download order invoices  
**So that** I have records for my purchases

**Acceptance Criteria:**

- "Download Invoice" button on order details page
- PDF generation with order details
- Invoice includes: header, billing/delivery address, items table, payment method, grand total

---

## Epic 9: Vendor Dashboard & Management

**Description:** Comprehensive vendor portal for managing products, inventory, orders, and store settings.

**Business Value:** Enables vendor self-service and reduces operational overhead

**Total Points:** 47

---

### US-9.1: Vendor Registration & Onboarding

**`13 points`**

**As a** business owner  
**I want to** register as a vendor  
**So that** I can sell products on the platform

**Acceptance Criteria:**

- "Become a Vendor" page at `/become-vendor`
- Multi-step registration wizard:
  - **Step 1 - Account:** Account setup
  - **Step 2 - Business Info:** Business name, type, tax ID, phone, address, years in business
  - **Step 3 - Store Details:** Store name, description, categories, logo upload, banner upload
  - **Step 4 - Verification:** Trade license, NID/passport, bank details — all uploaded to S3
- Progress bar
- Submit for admin approval → `vendor_applications` table
- Pending status page (`/vendor/application-pending`)
- Rejected status page (`/vendor/application-rejected`) with reapply CTA
- Application status check via API
- Admin approval creates vendor profile and updates user role
- Form state persistence across steps

---

### US-9.2: Vendor Dashboard Overview

**`5 points`**

**As an** approved vendor  
**I want to** see my store performance  
**So that** I can track my business metrics

**Acceptance Criteria:**

- Vendor dashboard at `/vendor/dashboard`
- KPI cards: Revenue (after commission), Monthly orders, Pending orders, Store rating, Vendor score
- Revenue chart: 30-day daily revenue line graph (commission deducted)
- Recent orders table
- Quick actions panel
- Notifications panel (vendor-specific: new orders, low stock alerts)

---

### US-9.3: Add New Product

**`8 points`**

**As a** vendor  
**I want to** add products to my store  
**So that** I can sell them to customers

**Acceptance Criteria:**

- "Add Product" functionality on products page
- Product form: Name, Brand, SKU, Description, Category, Subcategory, Event types
- Pricing: Price, Compare-at price, Sale percentage
- Stock quantity, Min order quantity
- Images: S3 upload with presigned URLs, multiple images with sort order
- Key features (JSONB array)
- Product specifications (key-value pairs)
- Shipping options
- Product variants (color, size, material)
- Status: Draft / Active / Out of Stock / Archived
- Vendor product count auto-incremented

---

### US-9.4: Manage Products List

**`5 points`**

**As a** vendor  
**I want to** view and manage all my products  
**So that** I can keep my inventory organized

**Acceptance Criteria:**

- Products page at `/vendor/products`
- Products table with image, name, SKU, category, price, stock, status
- Search, filter, sort functionality
- Edit and Delete actions

---

### US-9.5: Edit Product Details

**`5 points`**

**As a** vendor  
**I want to** update product information  
**So that** I can keep listings accurate

**Acceptance Criteria:**

- Same form as Add Product, pre-filled with existing data
- All fields editable
- "Update Product" saves changes
- Low stock / out of stock notifications auto-sent to vendor when stock changes
- Old S3 images cleaned up when replaced

---

### US-9.6: Manage Vendor Orders

**`8 points`**

**As a** vendor  
**I want to** process customer orders  
**So that** I can fulfill purchases

**Acceptance Criteria:**

- Orders page at `/vendor/orders`
- Orders table: Order ID, Customer, Items, Total, Date, Status, Actions
- Status badges for all order statuses
- Filter by status
- Order detail view at `/vendor/orders/$orderId`
- Status transition actions enforced by state machine:
  - Confirm COD order → `confirmed`
  - Mark as shipped (with optional tracking number) → `shipped`
  - Mark as delivered → `delivered`
- Status changes trigger customer notifications

---

### US-9.7: Store Settings & Branding

**`3 points`**

**As a** vendor  
**I want to** customize my store appearance  
**So that** my brand stands out

**Acceptance Criteria:**

- Store settings page at `/vendor/settings`
- Editable: Store name, Description, Logo, Banner, Contact info
- S3 upload for logo and banner (old files cleaned up on replacement)

---

## Epic 10: Reviews & Ratings System

**Description:** Enable customers to rate and review products and vendors, providing valuable feedback and social proof.

**Business Value:** Builds trust, improves product quality, and influences purchase decisions

**Total Points:** 18

---

### US-10.1: Write Product Review

**`8 points`**

**As a** customer who purchased a product  
**I want to** write a review  
**So that** I can share my experience with others

**Acceptance Criteria:**

- Review only available after order delivered (verified via `review.canReview` API)
- "Write a Review" button on order details page
- Star rating (1-5, required)
- Review title and text
- Photo upload (S3, up to multiple images via `review_images` table)
- "Would you recommend?" toggle
- One review per product per customer (unique index on userId + productId)
- Review submission recalculates product `averageRating` and `reviewCount`
- Vendor notified of new review
- Vendor score automatically recalculated on new review

---

### US-10.2: Rate Vendor Service

**`5 points`**

**As a** customer  
**I want to** rate the vendor's service  
**So that** others know about their reliability

**Acceptance Criteria:**

- Multi-dimensional vendor rating stored in `vendor_ratings` table
- Rating categories: Product Quality, Shipping Speed, Communication, Overall
- Contributes to vendor's overall rating
- Automated vendor score formula: (Avg Product Rating / 5 × 65%) + (Order Completion Rate × 35%)

---

### US-10.3: Review Management (Customer)

**`3 points`**

**As a** customer  
**I want to** manage my submitted reviews  
**So that** I can edit or delete them if needed

**Acceptance Criteria:**

- "My Reviews" page at `/account/reviews`
- List of all submitted reviews
- Edit review (within 30 days, images replaced in S3)
- Delete review (S3 images cleaned up, product rating recalculated)
- Helpful votes on other reviews (toggle helpful/not helpful)

---

### US-10.4: Vendor Response to Reviews

**`2 points`**

**As a** vendor  
**I want to** respond to customer reviews  
**So that** I can address concerns and thank customers

**Acceptance Criteria:**

- "Reviews" tab in vendor dashboard
- List of all reviews for vendor's products
- "Reply" button on each review
- Reply form (max 500 chars)
- Reply appears below customer review on product page
- Can edit reply within 7 days

---

## Epic 11: Admin Dashboard & Platform Management

**Description:** Comprehensive admin panel for managing all aspects of the platform including users, vendors, products, orders, payments, payouts, and homepage content.

**Business Value:** Enables platform operations, vendor oversight, and content management without requiring direct database access.

**Total Points:** 68

---

### US-11.1: Admin Dashboard Overview

**`5 points`**

**As an** admin  
**I want to** see platform-wide metrics  
**So that** I can monitor overall business health

**Acceptance Criteria:**

- Admin dashboard at `/admin/dashboard`
- KPI cards: Total users, Total vendors, Total products, Monthly orders, Monthly revenue
- Order status distribution overview
- Recent activity feed

---

### US-11.2: User Management

**`8 points`**

**As an** admin  
**I want to** manage all user accounts  
**So that** I can maintain platform integrity

**Acceptance Criteria:**

- Users page at `/admin/users`
- Search, pagination, filter by role and vendor status
- User detail view with order count stats
- Update user role (customer / vendor / admin)
- Ban/unban (deactivate/reactivate) users
- Delete user accounts

---

### US-11.3: Vendor Management

**`8 points`**

**As an** admin  
**I want to** manage vendor accounts  
**So that** I can ensure vendor quality

**Acceptance Criteria:**

- Vendors page at `/admin/vendors`
- Search, pagination, status filtering
- Vendor detail view with product count and owner info
- Update vendor status (active/suspended) — syncs with user `vendorStatus`
- Delete vendor profile (cleans up S3 files, reverts user to customer role)

---

### US-11.4: Vendor Application Review

**`8 points`**

**As an** admin  
**I want to** review vendor applications  
**So that** I can approve quality vendors

**Acceptance Criteria:**

- Applications page at `/admin/vendor-applications`
- Search and status filter (pending/approved/rejected)
- Full application detail view including uploaded documents (trade license, NID, bank details)
- Approve application → creates vendor profile, updates user role to vendor
- Reject application with review notes
- Notifications sent on approval/rejection

---

### US-11.5: Product Moderation

**`5 points`**

**As an** admin  
**I want to** moderate product listings  
**So that** I can maintain marketplace quality

**Acceptance Criteria:**

- Products page at `/admin/products`
- Search, vendor/category filter, pagination
- Remove product listings (deletes S3 images)
- Set products as featured
- Set deal type flags: Flash, Hot, Daily, Clearance, Bundle

---

### US-11.6: Order Management

**`8 points`**

**As an** admin  
**I want to** manage all orders  
**So that** I can resolve issues and track fulfillment

**Acceptance Criteria:**

- Orders page at `/admin/orders`
- Full order lifecycle management across both payment flows
- Search by order number, filter by status, pagination
- Status transition actions enforced by state machine
- Support for all order statuses

---

### US-11.7: bKash Payment Verification

**`5 points`**

**As an** admin  
**I want to** verify bKash payments  
**So that** I can confirm customer payments and release orders

**Acceptance Criteria:**

- View pending bKash payments awaiting verification
- Verify payment (transition order to `payment_received`)
- Reject payment with reason (transition to `payment_rejected`)
- Record COD cash collection

---

### US-11.8: Vendor Payout Management

**`8 points`**

**As an** admin  
**I want to** manage vendor payouts  
**So that** vendors receive their earnings

**Acceptance Criteria:**

- View pending vendor payouts
- Payout details with order, items, vendor, and amount info
- Process payout (record payment method and reference number)
- Mark payout as failed with reason
- Commission automatically calculated per platform settings
- Order moves to final status (`vendor_paid` / `vendor_settled`) when all payouts complete
- Manual payout creation for edge cases

---

### US-11.9: Platform Settings

**`5 points`**

**As an** admin  
**I want to** configure platform-wide settings  
**So that** I can control business rules without code changes

**Acceptance Criteria:**

- Settings page at `/admin/settings`
- Configurable platform settings:
  - Platform name, contact email, support phone, currency
  - Commission rate (%)
  - Shipping rates (Dhaka / outside Dhaka)
  - Flash deal end time
  - Free shipping threshold
  - Feature toggles: Guest checkout, Vendor registration, Maintenance mode
- Singleton row pattern (`platform_settings` table, id = "current")

---

### US-11.10: Homepage Banner Management

**`5 points`**

**As an** admin  
**I want to** manage homepage banners  
**So that** I can control promotional content

**Acceptance Criteria:**

- Banners page at `/admin/homepage-banners`
- Create, edit, delete banners
- S3 image upload for banner images
- Drag/reorder sort order
- Active/inactive toggle
- Banner fields: title, subtitle, CTA text, CTA link, image URL, sort order

---

### US-11.11: Homepage Promo Card Management

**`3 points`**

**As an** admin  
**I want to** manage promotional cards on the homepage  
**So that** I can highlight key offerings

**Acceptance Criteria:**

- Promo cards page at `/admin/homepage-promo-cards`
- 4 fixed slots for promo cards
- Edit/create promo card per slot
- S3 image upload
- Fields: slot number, title, subtitle, CTA link, image URL, active toggle

---

## Non-Functional Requirements

### Performance

- Lighthouse Performance score > 90
- Server-side data loading via TanStack Router loaders
- Optimized database queries with indexes on products table
- S3 presigned URLs for direct client-side uploads (no server bandwidth bottleneck)
- TanStack Query caching for API responses

### Security

- Server-side session management (HTTP-only cookies, not client-side JWT)
- Rate limiting on auth endpoints (20 req/15min) and OTP endpoints (5 req/15min)
- S3 file operations authorized by user ID prefix
- Role-based access control (customer, vendor, admin) at both route and API level
- Order state machine prevents invalid transitions
- CORS configured for specific origin
- Sentry error monitoring

### Accessibility

- shadcn/ui components provide ARIA attributes
- Full WCAG AA compliance
- Color contrast ratio ≥ 4.5:1
- Keyboard navigation support

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari iOS 14+
- Chrome Android 90+

### Responsiveness

- Mobile-first design with Tailwind breakpoints
- Three layout variants (customer, vendor, admin) each responsive
- Mobile-specific components (MobileNav, MobileSearchModal, AccountMobileNav)

### Data Management

- PostgreSQL database via Supabase with Drizzle ORM
- S3 file storage for all uploads
- Email delivery via Nodemailer SMTP
- Cart persistence: client-side Zustand store + database sync for logged-in users
- Order snapshots: product name, price, and image stored at order time
- Soft deletion patterns (account deactivation)
- Denormalized counters for performance (product counts, review counts, ratings)

### API Documentation

- Auto-generated OpenAPI specification at `/doc`
- Interactive Scalar API documentation at `/scalar`

---

## Success Metrics

| Metric                      | Target                     |
| --------------------------- | -------------------------- |
| Lighthouse Performance      | > 90                       |
| Lighthouse Accessibility    | > 95                       |
| Component Coverage          | 100% of PRD                |
| Theme Consistency           | Pass both modes            |
| Filter Functionality        | All filters work correctly |
| Task Completion Rate        | > 90%                      |
| Checkout Flow Completion    | > 80%                      |
| Mobile Responsiveness       | No horizontal scroll       |
| Authentication Success Rate | > 95%                      |
| Admin Coverage              | Full platform management   |
| Vendor Self-Service         | Full CRUD operations       |

---

**Document Version:** 1.0 - MVP Planning Document  
**Last Updated:** January 15, 2025  
**Total Story Points:** 457

---

_End of Document_
