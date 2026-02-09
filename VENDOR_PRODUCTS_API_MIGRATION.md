# Vendor Products API Migration

## Summary
Migrated vendor products management from localStorage to real API endpoints.

## Changes Made

### 1. Fixed API Endpoint Paths (`packages/api/src/routers/product.ts`)
Updated all product endpoint paths to match oRPC naming convention:
- `listMyProducts`: `/vendor/products` → `/product/listMyProducts`
- `createProduct`: `/vendor/products` → `/product/createProduct`
- `updateProduct`: `/vendor/products/:id` → `/product/updateProduct`
- `deleteProduct`: `/vendor/products/:id` → `/product/deleteProduct`

### 2. Updated VendorProductsPage (`apps/web/src/components/vendor/products/VendorProductsPage.tsx`)
**Before:** Used localStorage via `vendor-product-store.ts`
**After:** Uses real API via TanStack Query and oRPC

Key changes:
- Added `useQuery` to fetch products from `orpc.product.listMyProducts`
- Added `useMutation` for delete and update operations
- Maps API response (simple product format) to UI format (VendorProduct type)
- Removed dependency on localStorage functions
- Added loading state

### 3. Updated AddProductForm (`apps/web/src/components/vendor/products/AddProductForm.tsx`)
**Before:** Saved products to localStorage
**After:** Calls real API to create/update products

Key changes:
- Added `useMutation` hooks for create and update operations
- Maps complex form data to simple API format
- Uploads images to S3 before creating product
- Auto-generates slug from product title
- Uses toast notifications for success/error feedback
- Calls `onSuccess` callback to trigger parent refetch

### 4. Data Mapping
The frontend uses a complex `VendorProduct` type with:
- `purchaseDetails` (regularPrice, salePrice, quantity)
- `rentalDetails` (dailyRate, weeklyRate, etc.)
- Complex shipping and specification objects

The API/database uses simpler fields:
- `price`, `salePrice`, `stock`
- Direct fields for shipping dimensions

**Mapping logic:**
- Form → API: Extracts purchase details into price/stock fields
- API → UI: Maps simple fields back to purchaseDetails format

## Product Count Fix
The `productCount` field in the vendors table is now properly updated:
- ✅ **Incremented** when product is created (via transaction)
- ✅ **Decremented** when product is deleted (via transaction)
- ✅ Uses SQL `productCount + 1` / `productCount - 1` to avoid race conditions

## Scripts Created
- `scripts/fix-vendor-product-counts.ts` - Recalculates product counts for all vendors
- `scripts/check-vendor-count-status.ts` - Shows vendor product counts vs actual products
- `scripts/check-all-products.ts` - Lists all products in database

## Testing Checklist
- [ ] Create a new product from vendor panel
- [ ] Verify product appears in database (run `scripts/check-all-products.ts`)
- [ ] Verify vendor `productCount` increments in database
- [ ] Edit an existing product
- [ ] Delete a product
- [ ] Verify vendor `productCount` decrements after delete
- [ ] Test bulk operations (activate, deactivate, delete)
- [ ] Test image upload to S3
- [ ] Test product status changes (draft ↔ active)

## Known Limitations
1. **Category mapping**: Form uses category names, API expects categoryIds - currently hardcoded to 'misc'
2. **Product images**: Images are created in the API but not fetched back in listMyProducts
3. **Rental products**: Database only supports purchase products (single price/stock)
4. **Specifications**: Not stored in database yet

## Next Steps
1. Add proper category ID lookup/mapping
2. Include product images in listMyProducts response
3. Consider simplifying frontend types to match database schema
4. Add product specifications table if needed
5. Support rental products if required
