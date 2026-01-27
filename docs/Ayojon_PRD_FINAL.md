# Ayojon — Multi-Vendor E-Commerce Platform for Event Products & Rentals

## Product Requirements Document (PRD) - MVP Edition

**Status:** Draft  
**Version:** 2.0 - Simplified Structure  
**Last Updated:** January 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Vision & Goals](#product-vision--goals)
3. [Story Point Reference](#story-point-reference)
4. [Epic Overview](#epic-overview)
5. [Epic 1: User Registration & Authentication](#epic-1-user-registration--authentication)
6. [Epic 2: Homepage & Core Navigation](#epic-2-homepage--core-navigation)
7. [Epic 3: Product Browsing & Search](#epic-3-product-browsing--search)
8. [Epic 4: Product Details & Rental Options](#epic-4-product-details--rental-options)
9. [Epic 5: Shopping Cart Management](#epic-5-shopping-cart-management)
10. [Epic 6: Checkout & Payment Flow](#epic-6-checkout--payment-flow)
11. [Epic 7: User Account & Profile](#epic-7-user-account--profile)
12. [Epic 8: Order Tracking & History](#epic-8-order-tracking--history)
13. [Epic 9: Vendor Dashboard & Management](#epic-9-vendor-dashboard--management)
14. [Epic 10: Reviews & Ratings System](#epic-10-reviews--ratings-system)
15. [Non-Functional Requirements](#non-functional-requirements)
16. [Success Metrics](#success-metrics)

---

## Executive Summary

Ayojon is a multi-vendor e-commerce platform specializing in event-related products and rentals, targeting South Asian users, primarily in Bangladesh. The platform enables multiple vendors to sell and rent event products (decorations, sound systems, lighting, furniture, catering supplies, photography equipment, etc.) while providing consumers with a unified shopping experience.

**One-Line Pitch:** "The Daraz for events—shop and rent everything you need for any occasion, from hundreds of vendors in one place."

**Scope:** Frontend prototype with mock data simulation demonstrating the complete e-commerce experience for both customers and vendors.

**Target Market:** South Asian users, primarily English-speaking Bangladesh (BDT ৳)  
**Device Priority:** Mobile (70%), Desktop (25%), Tablet (5%)

---

## Product Vision & Goals

**Vision:** Deliver a polished, production-ready frontend prototype that demonstrates the complete e-commerce shopping experience for event products, with comprehensive vendor management capabilities.

**Primary Goals:**
- Build secure authentication flows for both users and vendors
- Build a fully functional e-commerce UI with product-centric browsing
- Implement comprehensive product filtering and sorting
- Support both rental and purchase product flows
- Demonstrate local payment flows (COD, bKash, Nagad, card)
- Enable vendor self-service portal for product and order management
- Achieve Lighthouse performance score > 90

---

## Story Point Reference

| Points | Complexity | Typical Effort |
|--------|-----------|----------------|
| 1 | Trivial | < 2 hours |
| 2 | Simple | 2-4 hours |
| 3 | Moderate | 4-8 hours |
| 5 | Complex | 1-2 days |
| 8 | Very Complex | 2-3 days |
| 13 | Large | 3-5 days |

---

## Epic Overview

| # | Epic Name | Description | Total Points |
|---|-----------|-------------|--------------|
| 1 | User Registration & Authentication | Complete user sign-up, login, and session management | 32 |
| 2 | Homepage & Core Navigation | Landing page with featured products and navigation | 50 |
| 3 | Product Browsing & Search | Product discovery with filters and search | 52 |
| 4 | Product Details & Rental Options | Comprehensive product pages with rental scheduling | 48 |
| 5 | Shopping Cart Management | Cart operations for both purchase and rental items | 40 |
| 6 | Checkout & Payment Flow | Complete checkout with local payment methods | 58 |
| 7 | User Account & Profile | User dashboard and profile management | 38 |
| 8 | Order Tracking & History | Order management and rental tracking | 42 |
| 9 | Vendor Dashboard & Management | Vendor portal for products and orders | 52 |
| 10 | Reviews & Ratings System | Product and vendor review capabilities | 18 |
| **TOTAL** | | | **430** |

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
- Sign up form with: Full Name, Email, Password, Confirm Password, Phone Number (optional)
- Password requirements: Min 8 characters, uppercase, lowercase, number, special character
- Email format validation with real-time feedback
- Password strength indicator (weak/medium/strong)
- "Sign Up" button disabled until all fields valid
- Terms & Conditions checkbox (required)
- Success message and auto-login after registration
- Error messages for: Email already exists, Invalid format, Weak password
- Redirect to homepage after successful signup

---

### US-1.2: User Login
**`3 points`**

**As a** registered user  
**I want to** sign in with my email and password  
**So that** I can access my account and orders

**Acceptance Criteria:**
- Login form with: Email, Password fields
- "Remember me" checkbox to persist session
- "Forgot password?" link prominently displayed
- "Sign In" button
- Navigate to homepage or return URL after successful login
- Clear error message: "Invalid email or password"
- Account lockout after 5 failed attempts (15-minute cooldown)
- Loading state on button during authentication

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
- Privacy disclaimer about data sharing

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
- Privacy disclaimer about data sharing

---

### US-1.5: Password Reset Flow
**`5 points`**

**As a** user  
**I want to** reset my password  
**So that** I can regain access if I forget my credentials

**Acceptance Criteria:**
- "Forgot Password" page with email input field
- "Send Reset Link" button
- Mock email sent confirmation message with instructions
- Reset password page accessible via unique link
- New password form with: New Password, Confirm Password fields
- Same password requirements as signup
- Password strength indicator
- Success message after reset
- Redirect to login page after successful reset
- Expired link handling (24-hour expiry simulation)

---

### US-1.6: User Logout
**`2 points`**

**As a** logged-in user  
**I want to** sign out of my account  
**So that** I can end my session securely

**Acceptance Criteria:**
- "Sign Out" option in user menu dropdown (top-right)
- Clear all session data on sign-out
- Redirect to homepage
- Confirmation toast: "You've been signed out successfully"
- Cart data persists for 30 days (mock implementation)
- Remove authentication tokens

---

### US-1.7: Session Management
**`3 points`**

**As a** logged-in user  
**I want to** maintain my session across page refreshes  
**So that** I don't have to re-login constantly

**Acceptance Criteria:**
- Persist authentication state in local storage (mock JWT)
- Auto-restore session on page load if valid
- Display user name/avatar in header when logged in
- Session expiry after 7 days of inactivity
- Show login prompt when session expires
- Protected routes redirect to login if not authenticated

---

### US-1.8: Guest Checkout Option
**`4 points`**

**As a** visitor  
**I want to** checkout without creating an account  
**So that** I can complete purchases quickly

**Acceptance Criteria:**
- "Continue as Guest" option on checkout page
- Guest checkout form: Name, Email, Phone Number
- Order confirmation sent to provided email (mock)
- Option to create account after order placement
- Guest order lookup via email + order ID
- Note about account benefits (tracking, history, etc.)

---

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
- Search bar in header (desktop: prominent, mobile: icon)
- Category mega menu dropdown (desktop only)
- Icons: Cart (with item count badge), User menu, Theme toggle
- Mobile: Hamburger menu with drawer navigation
- User menu dropdown: My Orders, My Rentals, Profile, Settings, Sign Out
- Guest user menu: Sign In, Sign Up
- Responsive design: full header on desktop, compact on mobile
- Active page indicator in navigation

---

### US-2.2: Hero Section with Promotions
**`5 points`**

**As a** visitor  
**I want to** see featured promotions and banner  
**So that** I'm aware of current deals and events

**Acceptance Criteria:**
- Large hero banner with auto-rotating carousel (3-5 slides)
- Each slide: Image, Headline, Subtext, CTA button
- Manual navigation dots below carousel
- Auto-advance every 5 seconds (pause on hover)
- Mobile: single column, smaller height
- CTA buttons link to relevant category/deal pages
- Smooth transitions between slides

---

### US-2.3: Event Type Quick Categories
**`3 points`**

**As a** visitor  
**I want to** browse products by event type  
**So that** I can quickly find items for my specific occasion

**Acceptance Criteria:**
- Grid of event type cards: Wedding, Birthday, Corporate, Religious, Anniversary, Baby Shower
- Each card: Icon, Event name, "Shop Now" link
- Clicking card navigates to filtered product results
- Responsive grid: 6 columns (desktop), 3 columns (tablet), 2 columns (mobile)
- Hover effect on cards

---

### US-2.4: Flash Deals Section
**`5 points`**

**As a** shopper  
**I want to** see time-limited deals  
**So that** I can take advantage of special offers

**Acceptance Criteria:**
- "Flash Deals" section with countdown timer
- Horizontal scrollable product carousel
- Each product card: Image, Name, Original price (struck), Deal price, Discount %, Timer
- Countdown timer format: "Ends in HH:MM:SS"
- "View All Deals" link to dedicated flash deals page
- Mobile: 1.5 products visible, swipeable
- Desktop: 4-5 products visible, arrow navigation

---

### US-2.5: Featured Products Grid
**`8 points`**

**As a** shopper  
**I want to** see popular and recommended products  
**So that** I can discover trending items

**Acceptance Criteria:**
- "Featured Products" section
- Grid layout: 4 columns (desktop), 2 columns (mobile)
- Product card components: Image, Name, Price, Rating (stars + count), "Add to Cart" button, Heart icon (wishlist)
- Rental products show: "From ৳X/day" pricing
- "Ayojon Choice" badge on curated products
- Hover effects: elevated shadow, show quick actions
- "Load More" button to extend grid (pagination simulation)
- Display 12 products initially

---

### US-2.6: Category Showcase Sections
**`5 points`**

**As a** visitor  
**I want to** explore products by major categories  
**So that** I can browse organized product collections

**Acceptance Criteria:**
- Multiple category sections: "Decorations", "Sound & Lighting", "Furniture", "Catering Equipment"
- Each section: Title, "View All" link, Horizontal product carousel (6-8 products)
- Product cards (same as featured products)
- Responsive carousel with arrow navigation
- "View All" links to category page with all products

---

### US-2.7: Footer with Information
**`3 points`**

**As a** visitor  
**I want to** access important links and information  
**So that** I can learn about the platform and policies

**Acceptance Criteria:**
- Footer sections: About Us, Customer Service, Vendor, Quick Links, Payment Methods, Social Media
- Links: About, Contact, FAQ, Terms, Privacy Policy, Return Policy, Vendor Registration, How to Rent
- Display accepted payment icons: bKash, Nagad, Visa, Mastercard, Cash on Delivery
- Social media icons: Facebook, Instagram, Twitter (mock links)
- Copyright notice with year
- Newsletter signup form (mock submission)
- Mobile: stacked sections, collapsible if needed

---

### US-2.8: Breadcrumb Navigation
**`3 points`**

**As a** user  
**I want to** see my current location in the site hierarchy  
**So that** I can easily navigate back

**Acceptance Criteria:**
- Breadcrumb trail on all non-homepage pages
- Format: Home > Category > Subcategory > Product
- Each crumb is clickable link
- Current page is not a link (bold text)
- Separator between crumbs (/ or >)
- Mobile: condensed breadcrumb (show last 2-3 levels)

---

### US-2.9: Theme Toggle (Dark/Light Mode)
**`5 points`**

**As a** user  
**I want to** switch between light and dark themes  
**So that** I can choose my preferred visual style

**Acceptance Criteria:**
- Theme toggle button in header (sun/moon icon)
- Clicking toggles between light and dark mode
- Persist theme preference in local storage
- Apply theme immediately across all components
- Smooth transition animations (200-300ms)
- All text remains readable in both themes (contrast check)
- System theme detection on first visit

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

**Description:** Comprehensive product discovery system with advanced search, filtering, and sorting capabilities to help users find exactly what they need.

**Business Value:** Enables efficient product discovery and improves conversion rates

**Total Points:** 52

---

### US-3.1: Search Bar with Autocomplete
**`8 points`**

**As a** shopper  
**I want to** search for products with autocomplete suggestions  
**So that** I can quickly find specific items

**Acceptance Criteria:**
- Search bar in header (always visible)
- Autocomplete dropdown appears after 2 characters
- Suggestions include: Popular searches, Product names, Categories
- Highlight matching text in suggestions
- Show product thumbnail + price in product suggestions
- Keyboard navigation (arrow keys + enter)
- "Search" button or enter key triggers full search
- Mobile: expand to full screen search overlay
- Show "Recent Searches" when focused (no input yet)
- Clear search button (X icon)

---

### US-3.2: Search Results Page
**`8 points`**

**As a** shopper  
**I want to** see comprehensive search results  
**So that** I can review all matching products

**Acceptance Criteria:**
- Search results page shows: Search query, Result count, Product grid
- Display message: "Showing X results for '[query]'"
- Product grid (same cards as homepage)
- Sorting options at top: Relevance, Price: Low to High, Price: High to Low, Rating, Newest
- Pagination at bottom (page numbers + prev/next)
- "No results found" state with: Suggestions, Popular categories, Search tips
- Mobile: full-width grid (1-2 columns)
- Desktop: 4 columns with sidebar filters

---

### US-3.3: Category Pages
**`5 points`**

**As a** shopper  
**I want to** browse products within a category  
**So that** I can see all available options in that category

**Acceptance Criteria:**
- Category page layout: Banner, Description, Product grid
- Category banner with: Image, Title, Item count
- Brief category description text
- Product grid with all items in category
- Breadcrumb: Home > [Parent Category] > [Category]
- Subcategory filters (if applicable)
- Same sorting and pagination as search results
- "Related Categories" section at bottom

---

### US-3.4: Advanced Filters Sidebar
**`13 points`**

**As a** shopper  
**I want to** filter products by multiple criteria  
**So that** I can narrow down to exactly what I need

**Acceptance Criteria:**
- Filter sidebar (desktop: left side, mobile: drawer/modal)
- Filter categories:
  - **Price Range:** Slider with min/max inputs (৳0 - ৳50,000)
  - **Availability:** Rental, Purchase, Both
  - **Event Type:** Checkboxes (Wedding, Birthday, Corporate, etc.)
  - **Product Condition:** New, Like New, Good
  - **Rating:** Star filter (4+ stars, 3+ stars, etc.)
  - **Vendor Location:** Dropdown (all divisions)
  - **Delivery Options:** Same Day, Next Day, Standard
- "Apply Filters" button (mobile)
- "Clear All Filters" link
- Show active filter count in header
- Active filters displayed as removable chips above results
- Filter results update on apply (not real-time)
- Persist filters in URL query params

---

### US-3.5: Rental Duration Filter
**`5 points`**

**As a** shopper looking for rentals  
**I want to** filter by rental duration  
**So that** I can find items available for my event dates

**Acceptance Criteria:**
- Rental-specific filter section appears when "Rental" selected
- Date range picker: Start Date, End Date
- Duration display: "X days" auto-calculated
- Check product availability for selected dates
- Show "Available" or "Not Available" on product cards
- Unavailable products grayed out or moved to bottom
- Option to show only available items
- Clear date selection button

---

### US-3.6: Sorting Options
**`3 points`**

**As a** shopper  
**I want to** sort products by different criteria  
**So that** I can view items in my preferred order

**Acceptance Criteria:**
- Sorting dropdown at top of product grid
- Options: Relevance (default for search), Price: Low to High, Price: High to Low, Rating: High to Low, Newest First, Most Popular
- Selected option displayed in dropdown
- Results re-render on sort change (smooth animation)
- Sort persists across pagination
- Mobile: full-width dropdown

---

### US-3.7: Product Quick View
**`5 points`**

**As a** shopper  
**I want to** preview product details without leaving the page  
**So that** I can quickly evaluate multiple products

**Acceptance Criteria:**
- "Quick View" button on product card hover (desktop)
- Modal opens with: Product image carousel, Name, Price, Rating, Short description, Size/Color options (if applicable), "Add to Cart" button, "View Full Details" link
- Close button (X) and overlay click to close
- Mobile: tap product image to trigger quick view
- Smooth fade-in animation
- Can add to cart directly from quick view
- Quantity selector in quick view

---

### US-3.8: Wishlist from Product Grid
**`3 points`**

**As a** shopper  
**I want to** add products to wishlist from the grid  
**So that** I can save items for later

**Acceptance Criteria:**
- Heart icon on product cards (top-right corner)
- Click heart to add/remove from wishlist
- Filled heart = wishlisted, outline = not wishlisted
- Toast notification: "Added to wishlist" / "Removed from wishlist"
- Login required - show login modal if guest clicks
- Wishlist count updates in header
- Wishlist persists across sessions

---

### US-3.9: "Compare Products" Feature
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

## Epic 4: Product Details & Rental Options

**Description:** Comprehensive product detail pages with image galleries, specifications, pricing, rental scheduling, and vendor information.

**Business Value:** Provides complete information for purchase decisions and rental bookings

**Total Points:** 48

---

### US-4.1: Product Image Gallery
**`5 points`**

**As a** shopper  
**I want to** view high-quality product images  
**So that** I can see the product clearly before buying

**Acceptance Criteria:**
- Large primary image display
- Thumbnail carousel below (4-6 visible thumbnails)
- Click thumbnail to change main image
- Arrow navigation to browse through images
- Zoom on hover (desktop) or pinch-to-zoom (mobile)
- Lightbox view when clicking main image (fullscreen gallery)
- Image counter: "X / Y"
- Support 5-10 images per product
- "Ayojon Choice" badge overlay on first image if applicable

---

### US-4.2: Product Information Section
**`5 points`**

**As a** shopper  
**I want to** read detailed product information  
**So that** I know exactly what I'm getting

**Acceptance Criteria:**
- Product title (H1)
- Brand name (clickable link to brand page)
- Rating display: Stars + rating number + review count (e.g., "4.5 ★ (128 reviews)")
- Availability status: "In Stock" (green) / "Limited Stock" (orange) / "Out of Stock" (red)
- Product code/SKU
- Vendor name with link to vendor storefront
- Vendor verification badge if applicable
- "Free Delivery" or "Delivery: ৳X" badge
- Social share buttons: Facebook, Twitter, WhatsApp, Copy Link

---

### US-4.3: Pricing and Purchase Options
**`5 points`**

**As a** shopper  
**I want to** see clear pricing information  
**So that** I understand the total cost

**Acceptance Criteria:**
- **For Purchase Items:**
  - Large price display with currency (৳)
  - Original price (if on sale, struck through)
  - Discount percentage badge (e.g., "25% OFF")
  - "You save ৳X" text
  - Tax/VAT information (if applicable)
- **For Rental Items:**
  - Daily rate: "৳X / day"
  - Weekly rate: "৳X / week" (if available)
  - Security deposit amount
  - Minimum rental period notice
- Quantity selector (- / number / +)
- Max quantity limit display
- Stock quantity display if low (< 10 items)

---

### US-4.4: Rental Date Picker
**`8 points`**

**As a** shopper  
**I want to** select rental dates  
**So that** I can book the product for my event

**Acceptance Criteria:**
- Date range picker component (calendar view)
- Select start date and end date
- Blocked/unavailable dates marked in red
- Already booked dates not selectable
- Minimum rental duration enforced (e.g., 1 day)
- Maximum future booking (e.g., 6 months)
- Auto-calculate rental duration: "X days"
- Auto-calculate total cost: Daily rate × Days + Security deposit
- Delivery date: 1 day before event (calculated)
- Return date: 1 day after event (calculated)
- Date format: DD MMM YYYY
- Mobile: native date picker or optimized calendar

---

### US-4.5: Add to Cart Actions
**`5 points`**

**As a** shopper  
**I want to** add products to my cart  
**So that** I can proceed to checkout

**Acceptance Criteria:**
- **For Purchase:**
  - "Add to Cart" button (primary CTA)
  - "Buy Now" button (skip cart, go to checkout)
- **For Rental:**
  - Date selection required before adding to cart
  - "Add to Cart" button disabled until dates selected
  - Validation message if dates not selected
- Loading state on button click
- Success toast: "Added to cart"
- Cart count badge updates
- Modal option: "Continue Shopping" or "Go to Cart"
- Quantity must be selected (default: 1)
- Stock availability check before adding

---

### US-4.6: Product Specifications Tab
**`3 points`**

**As a** shopper  
**I want to** view detailed product specifications  
**So that** I can verify it meets my requirements

**Acceptance Criteria:**
- Tabbed interface: "Description", "Specifications", "Reviews"
- **Specifications Tab:**
  - Table format with key-value pairs
  - Categories: Dimensions, Weight, Material, Color, Power Requirements, Capacity, etc.
  - Rental-specific specs: Setup time, Teardown time, Space required
- Expandable sections if too long
- Mobile: full-width table, horizontal scroll if needed

---

### US-4.7: Product Description Tab
**`3 points`**

**As a** shopper  
**I want to** read the full product description  
**So that** I understand what's included

**Acceptance Criteria:**
- **Description Tab:**
  - Full product description (rich text)
  - "What's Included" section (bulleted list)
  - "Setup Instructions" (if applicable)
  - "Usage Guidelines" (for rentals)
  - "Damage Policy" (for rentals)
- Formatted text: Bold, italics, lists, headings
- Expandable "Read More" if text > 500 words
- Mobile: optimized text sizing

---

### US-4.8: Customer Reviews Display
**`8 points`**

**As a** shopper  
**I want to** read customer reviews  
**So that** I can learn from others' experiences

**Acceptance Criteria:**
- **Reviews Tab:**
  - Overall rating summary: Large star rating + average score + total reviews
  - Rating breakdown: 5-star bar chart (% per star level)
  - Filter reviews: All, With Photos, Verified Purchase, Rental Reviews
  - Sort reviews: Most Recent, Most Helpful, Highest Rating, Lowest Rating
  - Individual review cards:
    - User name (or "Anonymous")
    - User avatar
    - Star rating
    - Review date
    - Verified Purchase badge
    - Review text
    - Photos (if uploaded, gallery view)
    - Helpful votes: "Was this helpful? Yes (X) / No (Y)"
    - Vendor response (if any)
- Pagination: Load more reviews
- "Write a Review" button (appears if purchased/rented)

---

### US-4.9: Vendor Information Card
**`3 points`**

**As a** shopper  
**I want to** see vendor details  
**So that** I know who I'm buying from

**Acceptance Criteria:**
- Vendor card on right sidebar (desktop) or below product info (mobile)
- Vendor logo/avatar
- Vendor name (link to storefront)
- Verification badge if verified
- Vendor rating: Stars + review count
- "Join Date" or "Years in Business"
- Response time: "Replies within X hours"
- "View Store" button (link to vendor storefront)
- "Chat Now" button (mock chat interface or WhatsApp)
- "Follow" button with follower count

---

### US-4.10: Related Products Section
**`3 points`**

**As a** shopper  
**I want to** see related or similar products  
**So that** I can explore alternatives

**Acceptance Criteria:**
- "You May Also Like" section at page bottom
- Horizontal scrollable carousel
- Show 6-8 related products
- Product cards (same as homepage)
- Products from same category or complementary items
- Desktop: arrow navigation
- Mobile: swipeable

---

## Epic 5: Shopping Cart Management

**Description:** Full-featured shopping cart system handling both purchase and rental items with quantity management, price calculations, and cart persistence.

**Business Value:** Critical step in the purchase funnel that impacts conversion

**Total Points:** 40

---

### US-5.1: Cart Drawer (Quick View)
**`5 points`**

**As a** shopper  
**I want to** see my cart without leaving the current page  
**So that** I can quickly review items

**Acceptance Criteria:**
- Cart icon in header with item count badge
- Click cart icon to open slide-out drawer from right
- Cart drawer displays: Cart items (mini cards), Subtotal, "View Cart" button, "Checkout" button
- Each cart item card: Thumbnail, Name, Price, Quantity, Remove button
- Empty cart state: "Your cart is empty" with "Continue Shopping" link
- Close drawer: X button or click outside
- Add to cart from anywhere opens drawer briefly
- Mobile: drawer takes 80% of screen width

---

### US-5.2: Full Cart Page
**`8 points`**

**As a** shopper  
**I want to** view and manage all cart items  
**So that** I can finalize my order before checkout

**Acceptance Criteria:**
- Dedicated cart page (/cart)
- Cart items table/list:
  - Product image (clickable to PDP)
  - Product name + vendor
  - Price per unit
  - Quantity selector (update button)
  - Subtotal for item
  - Remove button (trash icon)
  - Rental items show: Date range, Duration, Daily rate
- "Continue Shopping" button
- "Clear Cart" button (with confirmation)
- Sticky order summary sidebar (desktop) or bottom (mobile)
- Order summary: Subtotal, Shipping (calculated or "Free"), Tax/VAT, Total
- "Proceed to Checkout" button (primary CTA)
- Empty cart state with suggested products

---

### US-5.3: Quantity Management
**`5 points`**

**As a** shopper  
**I want to** change item quantities in cart  
**So that** I can order the right amount

**Acceptance Criteria:**
- Quantity selector: Minus button, Number input, Plus button
- Decrease quantity (min: 1)
- Increase quantity (max: stock limit or 99)
- "Update" button appears after changing quantity
- Click update to recalculate totals
- Disable minus button at quantity = 1
- Disable plus button at max quantity
- Show stock limit message: "Only X left in stock"
- Auto-update subtotal and total
- Loading state during update

---

### US-5.4: Remove Cart Items
**`3 points`**

**As a** shopper  
**I want to** remove items from cart  
**So that** I can delete items I no longer want

**Acceptance Criteria:**
- Remove button (trash icon) on each cart item
- Click remove shows confirmation modal: "Remove this item from cart?"
- "Cancel" and "Remove" buttons in modal
- Remove item immediately on confirm
- Undo option in toast: "Undo" link available for 5 seconds
- If undo clicked, item restored to cart
- Recalculate totals after removal
- Update cart count badge

---

### US-5.5: Save for Later
**`3 points`**

**As a** shopper  
**I want to** move items to "Saved for Later"  
**So that** I can purchase them another time

**Acceptance Criteria:**
- "Save for Later" link/button on each cart item
- Move item to separate "Saved for Later" section (below cart items)
- Saved items don't count toward cart total
- "Move to Cart" button on saved items
- Remove button on saved items
- Saved items persist for 30 days
- Login required to save items

---

### US-5.6: Cart Price Breakdown
**`5 points`**

**As a** shopper  
**I want to** see a detailed price breakdown  
**So that** I understand all charges

**Acceptance Criteria:**
- Order summary card displays:
  - Items subtotal (sum of all items)
  - Shipping cost (based on delivery option)
  - Tax/VAT (calculate as % of subtotal)
  - Discount (if coupon applied)
  - Security deposits (for rentals, separate line)
  - **Grand Total** (bold, large font)
- Breakdown updates on quantity change
- Highlight savings if discount applied
- Delivery fee: "FREE" if above threshold, else "৳X"
- Mobile: collapsible summary

---

### US-5.7: Apply Discount Coupon
**`5 points`**

**As a** shopper  
**I want to** apply discount coupons  
**So that** I can save money

**Acceptance Criteria:**
- "Have a coupon?" collapsible section in order summary
- Coupon input field + "Apply" button
- Validate coupon code (mock validation)
- Success message: "Coupon applied! You saved ৳X"
- Show discount line in price breakdown
- Display applied coupon with "Remove" option
- Error messages: "Invalid coupon", "Expired", "Minimum order not met"
- Support multiple coupon types: % off, fixed amount, free shipping

---

### US-5.8: Mixed Cart (Purchase + Rental)
**`3 points`**

**As a** shopper  
**I want to** have both purchase and rental items in one cart  
**So that** I can order everything together

**Acceptance Criteria:**
- Cart displays both purchase and rental items
- Section headers: "Items to Purchase" and "Items to Rent"
- Rental items show date range prominently
- Security deposits summed separately
- Delivery scheduling considers rental dates
- Checkout handles both item types
- Cart total includes both purchase + rental costs + deposits

---

### US-5.9: Cart Persistence
**`3 points`**

**As a** shopper  
**I want to** my cart saved across sessions  
**So that** I don't lose items if I close the browser

**Acceptance Criteria:**
- Save cart to local storage on every update
- Restore cart on page load (if not logged in)
- Logged-in users: sync cart with account (mock sync)
- Cart persists for 30 days
- Show cart items from previous session on return
- "You have X items in your cart" message on homepage if cart not empty
- Expire rental item dates if past (show warning)

---

## Epic 6: Checkout & Payment Flow

**Description:** Secure and streamlined checkout process supporting multiple payment methods including local options like bKash and Nagad.

**Business Value:** Final conversion step—must be smooth to prevent cart abandonment

**Total Points:** 58

---

### US-6.1: Checkout Page Layout
**`5 points`**

**As a** shopper  
**I want to** see a clear checkout process  
**So that** I know what steps to complete

**Acceptance Criteria:**
- Multi-step checkout: Shipping → Scheduling (rentals) → Payment → Confirmation
- Progress indicator at top: Step 1 / 2 / 3 / 4
- Each step highlighted when active
- Breadcrumb-style progress bar
- Order summary sidebar (always visible on desktop)
- Order summary shows: Items, Quantities, Subtotal, Shipping, Tax, Total
- "Edit Cart" link in order summary
- Mobile: collapsible order summary

---

### US-6.2: Shipping Address Form
**`8 points`**

**As a** shopper  
**I want to** enter my delivery address  
**So that** my order arrives at the right place

**Acceptance Criteria:**
- Shipping address form fields:
  - Full Name (required)
  - Phone Number (required, Bangladesh format)
  - Address Line 1 (required)
  - Address Line 2 (optional)
  - City (required, dropdown)
  - Division (required, dropdown)
  - Postal Code (optional)
  - Address Type: Home / Office (radio buttons)
- "Save this address for future orders" checkbox
- Logged-in users: "Use saved address" option (dropdown of saved addresses)
- "Add new address" button to add another
- Field validation: Required fields, phone format, postal code format
- "Continue to Payment" button (disabled until valid)
- Guest checkout: additional email field

---

### US-6.3: Delivery Options Selection
**`5 points`**

**As a** shopper  
**I want to** choose my delivery method  
**So that** I can get my order when needed

**Acceptance Criteria:**
- Delivery method options:
  - **Standard Delivery:** 3-5 business days - FREE (orders > ৳1000) or ৳50
  - **Express Delivery:** 1-2 business days - ৳100
  - **Same-Day Delivery:** Order before 12 PM - ৳150 (if available)
- Radio button selection
- Selected option highlighted with border
- Estimated delivery date displayed
- Delivery cost updates in order summary
- Some products may not support all options (show notice)
- Rental items: fixed delivery schedule based on event date

---

### US-6.4: Rental Scheduling Details
**`5 points`**

**As a** shopper with rental items  
**I want to** confirm delivery and return times  
**So that** I have the items when needed

**Acceptance Criteria:**
- Rental scheduling step (only if cart has rentals)
- Display rental items with date ranges
- Delivery details:
  - Delivery date: 1 day before event start
  - Preferred delivery time slot: Morning (9-12) / Afternoon (12-3) / Evening (3-6)
  - Setup assistance: Yes / No toggle
- Return details:
  - Return date: 1 day after event end
  - Preferred pickup time slot
- Special instructions text area
- Security deposit amount reminder
- "Confirm Schedule" button

---

### US-6.5: Payment Method Selection
**`8 points`**

**As a** shopper  
**I want to** choose how to pay  
**So that** I can complete my purchase conveniently

**Acceptance Criteria:**
- Payment method options (radio buttons):
  - **Cash on Delivery (COD)** - Icon + description
  - **bKash** - Icon + "Pay via bKash mobile wallet"
  - **Nagad** - Icon + "Pay via Nagad mobile wallet"
  - **Credit/Debit Card** - Icon + "Visa, Mastercard accepted"
- Selected method highlighted
- COD: Additional ৳50 fee (if applicable)
- Each method shows: Icon, Name, Brief description, Fees (if any)
- "Payment Terms" link (opens modal with T&C)
- Disable unavailable methods (e.g., COD for high-value rentals)

---

### US-6.6: bKash Payment Flow
**`8 points`**

**As a** shopper  
**I want to** pay using bKash  
**So that** I can use my mobile wallet

**Acceptance Criteria:**
- When bKash selected, show bKash payment form:
  - bKash mobile number input (11 digits)
  - OTP verification field (mock)
  - "Send OTP" button
  - "Verify & Pay" button
- Mock OTP: Any 6-digit code works
- Loading state during "payment processing"
- Success screen with: Transaction ID, Amount paid, Timestamp
- Error handling: Invalid number, OTP mismatch, Insufficient balance
- "Back to Order" button after success
- Payment confirmation stored in order

---

### US-6.7: Nagad Payment Flow
**`8 points`**

**As a** shopper  
**I want to** pay using Nagad  
**So that** I have another mobile payment option

**Acceptance Criteria:**
- When Nagad selected, show Nagad payment form:
  - Nagad mobile number input (11 digits)
  - PIN input (4-digit, password field)
  - "Pay Now" button
- Mock PIN: Any 4-digit code works
- Loading state during "payment processing"
- Success screen with: Transaction ID, Amount paid, Timestamp
- Error handling: Invalid number, Wrong PIN, Insufficient balance
- "Back to Order" button after success
- Payment confirmation stored in order

---

### US-6.8: Card Payment Form
**`8 points`**

**As a** shopper  
**I want to** pay with credit/debit card  
**So that** I can use international payment methods

**Acceptance Criteria:**
- When Card selected, show card payment form:
  - Card number input (16 digits, auto-formatted with spaces)
  - Card holder name
  - Expiry date (MM/YY)
  - CVV (3 digits, password field)
  - "Save card for future purchases" checkbox
- Card type detection: Visa, Mastercard icon appears
- Field validation: Luhn algorithm for card number, valid expiry date, CVV length
- "Pay ৳X" button
- Mock payment processing (2-3 second delay)
- Success/failure screens
- Error messages: Card declined, Invalid details, Expired card

---

### US-6.9: Order Review Before Payment
**`3 points`**

**As a** shopper  
**I want to** review my order before paying  
**So that** I can confirm everything is correct

**Acceptance Criteria:**
- Order review section before final payment:
  - All items listed with prices
  - Delivery address
  - Delivery method
  - Contact information
  - Total amount to pay
- "Edit" links next to each section (go back to that step)
- Terms & Conditions checkbox: "I agree to the T&C"
- "Place Order" button (primary CTA, large)
- Button disabled until T&C checked
- Confirmation modal: "Are you sure you want to place this order?"

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
- Account page at /account
- Sidebar navigation: Overview, Orders, Rentals, Wishlist, Addresses, Profile, Settings
- Overview section displays:
  - Welcome message: "Welcome back, [Name]!"
  - Quick stats: Total orders, Active rentals, Wishlist items
  - Recent orders (last 3) with status
  - Quick actions: Track Order, Rent Again, View Wishlist
- Desktop: sidebar on left, content on right
- Mobile: dropdown menu navigation

---

### US-7.2: Edit Profile Information
**`5 points`**

**As a** user  
**I want to** update my profile details  
**So that** my information is current

**Acceptance Criteria:**
- Profile edit form:
  - Profile picture upload (avatar)
  - Full Name (required)
  - Email (required, show verification status)
  - Phone Number (optional)
  - Date of Birth (optional, for birthday discounts)
  - Gender (optional, dropdown)
- "Save Changes" button
- "Cancel" button (discard changes)
- Field validation
- Success message on save
- If email changed, require re-verification (mock email sent)
- Profile picture preview before saving

---

### US-7.3: Manage Saved Addresses
**`8 points`**

**As a** user  
**I want to** save multiple delivery addresses  
**So that** I can quickly select them at checkout

**Acceptance Criteria:**
- Saved addresses page
- Display all saved addresses as cards
- Each address card: Name, Phone, Full address, Type (Home/Office), "Edit" and "Delete" buttons, "Set as Default" checkbox
- Default address highlighted (border + badge)
- "Add New Address" button (opens form modal)
- Address form (same fields as checkout)
- Edit address (opens same form pre-filled)
- Delete address (confirmation modal)
- Maximum 5 addresses allowed
- "Use this address" button if accessed from checkout

---

### US-7.4: Wishlist Management
**`5 points`**

**As a** user  
**I want to** manage my saved products  
**So that** I can keep track of items I like

**Acceptance Criteria:**
- Wishlist page (/wishlist)
- Grid of wishlisted products (same product cards)
- Remove from wishlist: Heart icon or "Remove" button
- "Add to Cart" button on each card
- "Move All to Cart" option (if multiple items)
- Empty wishlist state: "Your wishlist is empty" with "Explore Products" link
- Sort options: Recently Added, Price: Low to High, Price: High to Low
- Wishlist count in header updates

---

### US-7.5: Change Password
**`3 points`**

**As a** user  
**I want to** change my password  
**So that** I can keep my account secure

**Acceptance Criteria:**
- Password change form in Settings:
  - Current Password (required)
  - New Password (required, same requirements as signup)
  - Confirm New Password (required)
- Password strength indicator for new password
- "Update Password" button
- Validation: Current password must be correct, New password must meet requirements, Passwords must match
- Success message: "Password updated successfully"
- Auto logout and require re-login after password change
- Error: "Current password is incorrect"

---

### US-7.6: Notification Preferences
**`3 points`**

**As a** user  
**I want to** control what notifications I receive  
**So that** I only get relevant updates

**Acceptance Criteria:**
- Notification settings page
- Categories with toggle switches:
  - **Order Updates:** Order status, Delivery updates
  - **Rentals:** Pickup reminders, Return reminders
  - **Promotions:** Sales, Flash deals, New arrivals
  - **Product Alerts:** Back in stock, Price drops
  - **Account:** Security alerts, Password changes
- Toggle each category on/off
- "Save Preferences" button
- All toggles can be controlled individually
- Success message on save

---

### US-7.7: Deactivate Account
**`3 points`**

**As a** user  
**I want to** deactivate my account  
**So that** I can stop using the platform temporarily

**Acceptance Criteria:**
- "Deactivate Account" option in Settings
- Click shows warning modal: "Are you sure? Your account will be hidden but not deleted. You can reactivate anytime."
- Reasons dropdown: Not using anymore, Privacy concerns, Found alternative, Other
- Optional feedback text area
- "Deactivate" and "Cancel" buttons
- On deactivate: Logout user, Hide account, Keep data for 90 days
- Reactivation: Login again to reactivate
- Pending orders/rentals prevent deactivation

---

### US-7.8: Account Activity Log
**`3 points`**

**As a** user  
**I want to** see my recent account activity  
**So that** I can monitor for suspicious actions

**Acceptance Criteria:**
- Activity log page in Settings
- List of recent activities (last 30 days):
  - Login attempts (success/failed)
  - Password changes
  - Address updates
  - Profile edits
  - Device info (browser, OS, location)
- Each entry: Action, Date/Time, Device, Location
- Color coding: Green (normal), Red (suspicious)
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
- Phone number required for SMS/WhatsApp
- Preferred language: English, Bangla (future)
- "Save Preferences" button
- Marketing consent checkbox: "I agree to receive marketing communications"
- Unsubscribe option

---

## Epic 8: Order Tracking & History

**Description:** Complete order management system for tracking purchases and rentals, viewing history, and managing returns.

**Business Value:** Provides post-purchase support and transparency

**Total Points:** 42

---

### US-8.1: Order History List
**`5 points`**

**As a** user  
**I want to** view all my past orders  
**So that** I can track my purchase history

**Acceptance Criteria:**
- Orders page (/account/orders)
- List of orders sorted by date (newest first)
- Each order card displays:
  - Order number (e.g., #AYJ-2025-001234)
  - Order date
  - Total amount
  - Status badge: Pending, Confirmed, Shipped, Delivered, Cancelled
  - Thumbnail images of first 2-3 items
  - "View Details" button
- Filter by status: All, Pending, Delivered, Cancelled
- Search by order number
- Date range filter
- Pagination: 10 orders per page
- Empty state: "No orders yet" with "Start Shopping" button

---

### US-8.2: Order Details Page
**`8 points`**

**As a** user  
**I want to** see complete details of an order  
**So that** I know exactly what I ordered

**Acceptance Criteria:**
- Order details page (/account/orders/[id])
- Order information:
  - Order number, Order date, Status
  - Estimated delivery date
  - Tracking number (if shipped)
- Items section: List all ordered items with images, names, quantities, prices
- Delivery address
- Payment method
- Price breakdown: Subtotal, Shipping, Tax, Discount, Total
- Order timeline: Placed → Confirmed → Shipped → Delivered (progress tracker)
- Action buttons based on status:
  - "Track Order" (if shipped)
  - "Cancel Order" (if pending/confirmed)
  - "Return Items" (if delivered, within return window)
  - "Buy Again" (add same items to cart)
  - "Download Invoice" (PDF)
- Customer support: "Need help?" link

---

### US-8.3: Live Order Tracking
**`8 points`**

**As a** user  
**I want to** track my order in real-time  
**So that** I know when it will arrive

**Acceptance Criteria:**
- Order tracking page (/track/[order-number])
- Tracking available via: Order number + Email/Phone (for guests)
- Map view showing: Warehouse location, Current package location, Delivery address (mock map with pins)
- Status timeline (vertical):
  - Order Placed ✓ (timestamp)
  - Order Confirmed ✓ (timestamp)
  - Shipped ✓ (timestamp, courier name)
  - Out for Delivery (in progress)
  - Delivered (pending)
- Delivery person details: Name, Phone, Photo (when out for delivery)
- "Call Delivery Person" button (mock or WhatsApp)
- Estimated delivery: "Expected by [Date] [Time]"
- Share tracking link button
- Notifications enabled: SMS/Email updates on status change

---

### US-8.4: Active Rentals Dashboard
**`5 points`**

**As a** user  
**I want to** see my current and upcoming rentals  
**So that** I can manage rental schedules

**Acceptance Criteria:**
- Rentals page (/account/rentals)
- Tabs: Active, Upcoming, Completed
- Each rental card:
  - Product image and name
  - Rental ID
  - Event date
  - Rental duration (X days)
  - Status: Upcoming, Active, Return Pending, Completed
  - Delivery date
  - Return date
  - Security deposit status
- Countdown timer for upcoming deliveries
- "Extend Rental" button (if extension available)
- "Contact Vendor" button
- Return reminder: "Return in X days" (highlighted if close)

---

### US-8.5: Rental Return Process
**`5 points`**

**As a** user with active rental  
**I want to** initiate the return process  
**So that** I can return items and get my deposit back

**Acceptance Criteria:**
- "Request Pickup" button on rental card
- Return request form:
  - Preferred pickup date/time slot
  - Special instructions
  - Item condition checklist (checkboxes for each rented item)
  - Photo upload (optional, document condition)
- Submit request
- Confirmation: "Pickup request submitted. Vendor will contact you."
- Vendor confirmation (mock notification)
- Pickup scheduled in rental timeline
- After pickup: Deposit refund processed (mock 3-5 days)
- "Pickup Completed" status update

---

### US-8.6: Cancel Order
**`3 points`**

**As a** user  
**I want to** cancel my order before it ships  
**So that** I can stop an unwanted purchase

**Acceptance Criteria:**
- "Cancel Order" button on order details (only for Pending/Confirmed orders)
- Cancellation modal: "Why are you cancelling?" with reasons dropdown
- Optional comment text area
- "Confirm Cancellation" button
- Confirmation: "Order cancelled successfully. Refund will be processed in 5-7 days."
- Order status updates to "Cancelled"
- Email notification sent (mock)
- Cannot cancel if order already shipped
- Refund timeline displayed

---

### US-8.7: Extend Rental Duration
**`5 points`**

**As a** user with active rental  
**I want to** extend my rental period  
**So that** I can keep items longer

**Acceptance Criteria:**
- "Extend Rental" button on rental details
- Extension form:
  - Current return date displayed
  - New return date picker (future dates only)
  - Additional days calculated automatically
  - Additional cost calculated: Daily rate × Extra days
  - Extended security deposit (if applicable)
- "Confirm Extension" button
- Vendor approval required (mock instant approval)
- Payment for extension: Use same payment method or select new
- Success: "Rental extended! New return date: [Date]"
- Cannot extend if unavailable (someone else booked)

---

### US-8.8: Invoice Download
**`3 points`**

**As a** user  
**I want to** download order invoices  
**So that** I have records for my purchases

**Acceptance Criteria:**
- "Download Invoice" button on order details page
- Generate PDF invoice with:
  - Invoice header: "Ayojon" logo, Invoice #, Date
  - Billing address, Delivery address
  - Items table: Name, Quantity, Price, Subtotal
  - Payment method
  - Grand total
  - Terms and conditions footer
- PDF file named: Invoice_AYJ_[OrderNumber].pdf
- Open PDF in new tab
- "Email Invoice" option (sends to user's email)

---

## Epic 9: Vendor Dashboard & Management

**Description:** Comprehensive vendor portal for managing products, inventory, orders, and store settings.

**Business Value:** Enables vendor self-service and reduces operational overhead

**Total Points:** 52

---

### US-9.1: Vendor Registration & Onboarding
**`13 points`**

**As a** business owner  
**I want to** register as a vendor  
**So that** I can sell products on the platform

**Acceptance Criteria:**
- "Become a Vendor" link in footer
- Multi-step vendor registration form:
  - **Step 1 - Account:** Email, Password, Confirm Password
  - **Step 2 - Business Info:** Business Name, Business Type (Individual/Company/Enterprise), Tax ID/Trade License Number, Business Phone, Business Address, Years in Business
  - **Step 3 - Store Details:** Store Name (unique), Store Description (500 chars), Product Categories (multi-select), Store Logo Upload, Store Banner Upload
  - **Step 4 - Verification:** Upload documents: Trade License, NID/Passport, Bank Account Details (for payments)
- Progress bar showing current step
- "Previous" and "Next" buttons
- Submit for admin approval
- Confirmation: "Application submitted! We'll review within 2-3 business days."
- Email notification on approval (mock)
- Pending status displayed until approved
- Can't access vendor dashboard until approved

---

### US-9.2: Vendor Dashboard Overview
**`5 points`**

**As an** approved vendor  
**I want to** see my store performance  
**So that** I can track my business metrics

**Acceptance Criteria:**
- Vendor dashboard (/vendor/dashboard)
- Top navigation: Dashboard, Products, Orders, Rentals, Store Settings
- KPI cards:
  - Total Revenue (this month, ৳X)
  - Orders This Month (count)
  - Active Rentals (count)
  - Pending Orders (count, clickable)
  - Store Rating (stars + review count)
  - Store Views (this month)
- Revenue chart: Line graph showing last 30 days
- Recent orders table (last 10):
  - Order ID, Customer name, Items, Total, Status, Actions
- Quick actions: Add Product, View Orders, Update Store
- Notifications panel: New orders, Return requests, Low stock alerts

---

### US-9.3: Add New Product
**`8 points`**

**As a** vendor  
**I want to** add products to my store  
**So that** I can sell them to customers

**Acceptance Criteria:**
- "Add Product" button on products page
- Product form (long form):
  - **Basic Info:** Product Name, Brand, SKU (auto-generated or custom)
  - **Description:** Rich text editor for full description, Short description (160 chars)
  - **Category:** Category (dropdown), Subcategory (dropdown), Event Types (multi-select)
  - **Pricing:** Product Type (Purchase/Rental/Both radio buttons)
    - If Purchase: Regular Price, Sale Price (optional), Quantity in Stock
    - If Rental: Daily Rate, Weekly Rate (optional), Monthly Rate (optional), Security Deposit, Minimum Rental Duration (days), Quantity Available
  - **Images:** Upload 5-10 images (drag & drop), Set primary image, Image preview with reorder
  - **Specifications:** Key-Value pairs (add multiple), e.g., Dimensions: 10x20cm
  - **Shipping:** Weight, Dimensions (L×W×H), Fragile? checkbox, Setup Required? checkbox
  - **Inventory:** Stock quantity (if purchase), Available units (if rental)
- "Save as Draft" and "Publish" buttons
- Validation: Required fields, price > 0, at least 1 image
- Success: "Product published successfully!" with "View Product" link

---

### US-9.4: Manage Products List
**`5 points`**

**As a** vendor  
**I want to** view and manage all my products  
**So that** I can keep my inventory organized

**Acceptance Criteria:**
- Products page (/vendor/products)
- Products table/grid:
  - Product image, Name, SKU, Category, Price/Rate, Stock/Available, Status (Active/Draft/Out of Stock), Actions (Edit, Delete, Duplicate)
- Filters: Category, Status, Product Type
- Search by name or SKU
- Sort by: Name, Price, Stock, Date Added
- Bulk actions: Activate, Deactivate, Delete (checkboxes)
- Pagination: 20 products per page
- Quick edit: Click to edit price/stock inline
- "Add Product" button prominently placed

---

### US-9.5: Edit Product Details
**`5 points`**

**As a** vendor  
**I want to** update product information  
**So that** I can keep listings accurate

**Acceptance Criteria:**
- Click "Edit" on product opens edit form
- Same form as "Add Product" but pre-filled
- All fields editable
- "Update Product" button
- Changes saved immediately
- Success message on save
- "Cancel" button discards changes
- Can change product from Draft to Active
- Option to mark as "Out of Stock" (still visible but not purchasable)

---

### US-9.6: Manage Vendor Orders
**`8 points`**

**As a** vendor  
**I want to** process customer orders  
**So that** I can fulfill purchases

**Acceptance Criteria:**
- Orders page (/vendor/orders)
- Orders table:
  - Order ID, Customer Name, Items (count), Total Amount, Order Date, Status, Actions
- Status badges: Pending, Confirmed, Shipped, Delivered, Cancelled, Returned
- Filters: Status, Date Range, Payment Method
- Search by order ID or customer name
- Click order to view full details
- Order detail view:
  - Customer info (name, phone, address)
  - Items ordered with quantities
  - Payment status
  - Delivery instructions
- Actions based on status:
  - Pending → "Confirm Order" button
  - Confirmed → "Mark as Shipped" (enter tracking number)
  - Shipped → "Mark as Delivered"
- Status change updates customer via email/SMS (mock)

---

### US-9.7: Manage Rental Bookings
**`5 points`**

**As a** vendor  
**I want to** manage rental bookings  
**So that** I can schedule deliveries and returns

**Acceptance Criteria:**
- Rentals page (/vendor/rentals)
- Rentals table:
  - Rental ID, Customer, Product, Event Date, Rental Period, Delivery Date, Return Date, Status, Actions
- Status: Upcoming, Active, Return Pending, Completed, Cancelled
- Calendar view option: See all rentals on a calendar
- Click rental to see details:
  - Customer contact info
  - Product details
  - Delivery address
  - Security deposit status
  - Special instructions
- Actions:
  - Upcoming → "Confirm Delivery" (mark as delivered)
  - Active → "Request Return" (sends pickup reminder)
  - Return Pending → "Confirm Return" (inspect item, release deposit)
- Notes section for vendor-only remarks

---

### US-9.8: Store Settings & Branding
**`3 points`**

**As a** vendor  
**I want to** customize my store appearance  
**So that** my brand stands out

**Acceptance Criteria:**
- Store Settings page (/vendor/settings)
- Editable fields:
  - Store Name
  - Store Description (rich text)
  - Logo Upload (replace existing)
  - Banner Upload (replace existing)
  - Store Policies: Return Policy, Shipping Policy, Cancellation Policy (text editors)
  - Contact Info: Business Phone, Business Email, Business Hours
- Social media links: Facebook, Instagram, Website
- "Save Changes" button
- Preview store page button
- Success message on save

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
- Review option appears only after order delivered/rental completed
- "Write a Review" button on order details page
- Review form modal:
  - Product image and name (for reference)
  - Star rating (1-5, required, clickable stars)
  - Review title (optional, max 100 chars)
  - Review text (required, min 20 chars, max 2000 chars)
  - Photo upload (optional, up to 5 images)
  - "Would you recommend this product?" toggle (Yes/No)
- Character count display for review text
- "Submit Review" button (disabled until valid)
- Success: "Review submitted! Thank you for your feedback."
- Review goes live immediately (no moderation)
- Can edit review within 7 days of submission
- One review per product per customer

---

### US-10.2: Rate Vendor Service
**`5 points`**

**As a** customer  
**I want to** rate the vendor's service  
**So that** others know about their reliability

**Acceptance Criteria:**
- Vendor rating option after order completion
- Vendor rating form (separate from product review):
  - Vendor name and logo
  - Rating categories (each 1-5 stars):
    - Product Quality
    - Shipping Speed
    - Communication
    - Overall Experience
  - Optional comment (max 500 chars)
- "Submit Rating" button
- Success message
- Contributes to vendor's overall rating (average of all categories)
- Vendor can see ratings but can't modify
- Can rate vendor even if product review not written

---

### US-10.3: Review Management (Customer)
**`3 points`**

**As a** customer  
**I want to** manage my submitted reviews  
**So that** I can edit or delete them if needed

**Acceptance Criteria:**
- "My Reviews" page in account (/account/reviews)
- List of all submitted reviews:
  - Product image and name
  - Star rating given
  - Review text preview
  - Submit date
  - Helpful votes count
  - Edit and Delete buttons
- Edit review: Opens same form pre-filled, can update rating/text/photos
- Delete review: Confirmation modal, "Are you sure?"
- Success messages for edit/delete
- Cannot edit after 30 days
- Can delete anytime

---

### US-10.4: Vendor Response to Reviews
**`2 points`**

**As a** vendor  
**I want to** respond to customer reviews  
**So that** I can address concerns and thank customers

**Acceptance Criteria:**
- "Reviews" tab in vendor dashboard
- List of all reviews for vendor's products
- Each review shows: Customer name, Product, Rating, Review text, Date
- "Reply" button on each review
- Reply form: Text area (max 500 chars)
- "Submit Reply" button
- Reply appears below customer review on product page
- Display: "Vendor Response" header, Reply text, Vendor name, Date
- Can edit reply within 7 days
- Professional tone suggested in placeholder text

---

---

## Non-Functional Requirements

### Performance
- Lighthouse Performance score > 90
- First Contentful Paint < 1.2s
- Largest Contentful Paint < 2.0s
- Time to Interactive < 3.0s
- Initial Bundle Size (gzipped) < 150KB

### Accessibility
- WCAG AA compliance
- Full keyboard navigation
- Screen reader support (ARIA labels)
- Color contrast ratio ≥ 4.5:1
- Visible focus indicators

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari iOS 14+
- Chrome Android 90+

### Responsiveness
- Mobile: 320px - 639px
- Tablet: 640px - 1023px
- Desktop: 1024px - 1535px
- Large Desktop: 1536px+

### Data Management
- All data stored in mock/local state (Faker.js for generation)
- LocalStorage for cart persistence (30 days)
- Session storage for temporary filters/sorts
- Mock API delays (500-1000ms) for realistic feel

---

## Success Metrics

| Metric | Target | Method |
|--------|--------|---------|
| Lighthouse Performance | > 90 | Chrome DevTools |
| Lighthouse Accessibility | > 95 | Chrome DevTools |
| Component Coverage | 100% of PRD | Manual QA checklist |
| Theme Consistency | Pass both modes | Visual testing |
| Filter Functionality | All filters work correctly | Automated + Manual testing |
| Task Completion Rate | > 90% | User testing scenarios |
| Checkout Flow Completion | > 80% | Flow testing |
| Mobile Responsiveness | No horizontal scroll | Device testing |
| Authentication Success Rate | > 95% | Login/signup flow testing |

---

**Document Version:** 2.0 - MVP Simplified Structure  
**Last Updated:** January 26, 2026  
**Total Story Points:** 430 (13-16 two-week sprints at 40 points/sprint)

---

*End of Document*
