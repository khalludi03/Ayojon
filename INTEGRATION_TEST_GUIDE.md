# Integration Test Guide: Vendor & Applications
## Complete Database Integration Verification

This guide tests the complete flow from frontend → backend → database.

---

## ✅ Phase 1: Database Setup (DONE)

- [x] Database cleaned
- [x] Only admin@test.com remains
- [x] All tables accessible
- [x] All connections verified

---

## 🧪 Phase 2: Test Admin Applications Flow

### Test 2.1: Create Vendor Application

**Action:** Create a test vendor application in the database

```bash
bun scripts/create-test-application.ts
```

**Expected Result:**
- Creates user: testvendor@example.com
- Creates pending application
- Database should have 1 application

**Verify in Database:**
```bash
bun -e "
import { db } from './packages/db/src/index.js';
import { vendorApplications, user } from './packages/db/src/schema/index.js';
const apps = await db.select().from(vendorApplications);
console.log('Applications:', apps.length);
"
```

### Test 2.2: Admin Panel Shows Application

**Action:**
1. Restart dev server: `bun run dev:server`
2. Clear browser cache: `Ctrl+Shift+R`
3. Open: `http://localhost:3001/admin/vendor-applications`
4. Login as admin@test.com

**Expected Result:**
- Stats show: **1 in "Pending Review"**
- Application list shows: **Test Vendor Application (testvendor@example.com)**
- Status shows "Pending Review"

**✅ PASS:** Application appears in admin panel from database
**❌ FAIL:** Old fake data appears OR no applications shown

### Test 2.3: Approve Application

**Action:**
1. Click "Approve" button on the test application
2. Confirm approval

**Expected Result:**
- Success toast message appears
- Application moves to "Approved" section
- Database creates vendor profile

**Verify in Database:**
```bash
bun -e "
import { db } from './packages/db/src/index.js';
import { vendors, user } from './packages/db/src/schema/index.js';
import { eq } from 'drizzle-orm';
const vendorsList = await db.select().from(vendors);
const testUser = await db.select().from(user).where(eq(user.email, 'testvendor@example.com')).limit(1);
console.log('Vendors created:', vendorsList.length);
console.log('User role:', testUser[0]?.role);
console.log('User vendorStatus:', testUser[0]?.vendorStatus);
"
```

**Expected Database State:**
- Vendors: 1
- User role: "vendor"
- User vendorStatus: "approved"

---

## 🧪 Phase 3: Test Vendor Operations

### Test 3.1: Check Vendor Panel (KNOWN ISSUE)

**Current State:** ⚠️  Vendor products page uses localStorage (NOT database)

**Files to fix:**
- `apps/web/src/components/vendor/products/VendorProductsPage.tsx`
- `apps/web/src/components/vendor/products/AddProductForm.tsx`

**What needs to change:**
- Remove: `getVendorProducts()` from localStorage
- Add: `useQuery(orpc.product.listVendorProducts())`
- Remove: `addVendorProduct()` to localStorage
- Add: `useMutation(orpc.product.createProduct())`

### Test 3.2: Vendor Settings (Logo/Banner Upload)

**Action:**
1. Login as testvendor@example.com
2. Go to vendor settings
3. Upload a logo and banner
4. Click "Save"

**Expected Result:**
- Files upload to S3
- Vendor profile updates in database
- Changes persist after refresh

**Verify in Database:**
```bash
bun -e "
import { db } from './packages/db/src/index.js';
import { vendors } from './packages/db/src/schema/index.js';
const vendorsList = await db.select().from(vendors);
console.log('Logo URL:', vendorsList[0]?.logoUrl);
console.log('Banner URL:', vendorsList[0]?.bannerUrl);
"
```

---

## 🧪 Phase 4: Test Admin Vendor Management

### Test 4.1: Admin Vendors List

**Action:**
1. Go to `http://localhost:3001/admin/vendors`
2. Check if testvendor appears

**Expected Result:**
- Shows 1 vendor
- Shows "Test Store" (or created vendor name)
- Shows testvendor@example.com

### Test 4.2: Admin Update Vendor

**Action:**
1. In admin vendors page
2. Toggle "Active" or "Verified" status
3. Check database

**Verify Status Sync:**
```bash
bun -e "
import { db } from './packages/db/src/index.js';
import { vendors, user } from './packages/db/src/schema/index.js';
const v = await db.select().from(vendors).limit(1);
const u = await db.select().from(user).where(eq(user.id, v[0]?.userId)).limit(1);
console.log('Vendor isActive:', v[0]?.isActive);
console.log('User vendorStatus:', u[0]?.vendorStatus);
"
```

### Test 4.3: Admin Delete Vendor

**Action:**
1. Delete the test vendor from admin panel
2. Check database

**Expected Result:**
- Vendor removed from vendors table
- User reverted to customer role
- Logo/banner deleted from S3

---

## 📊 Phase 5: Comprehensive Status Check

### Run Complete Verification

```bash
bun scripts/verify-database-connections.ts
```

### Expected State After All Tests:

If all tests passed:
```
✅ Admin applications page shows real database data
✅ Approving creates vendor profiles
✅ Vendor settings update database
✅ Admin can manage vendors
✅ Deleting removes from database + S3
✅ No localStorage/mock data interference
```

---

## 🐛 Known Issues to Fix

### CRITICAL: Vendor Products Page

**Location:** `apps/web/src/components/vendor/products/VendorProductsPage.tsx`

**Issue:** Uses localStorage instead of real API

**Fix Required:**
1. Replace localStorage calls with oRPC calls
2. Use real vendor ID from session
3. Connect to backend product endpoints

**Priority:** HIGH (prevents vendors from managing products)

---

## 🎯 Success Criteria

- [ ] Admin applications show real data from database
- [ ] Approving applications creates vendor profiles
- [ ] Vendor settings persist to database
- [ ] Admin vendors page shows real vendors
- [ ] Updating vendor status syncs user.vendorStatus
- [ ] Deleting vendors removes from DB + S3
- [ ] No fake/cached data appears
- [ ] Everything persists after refresh

---

## 📝 Next Steps

1. Run through this test guide step by step
2. Mark which tests pass/fail
3. Fix the vendor products page (localStorage → API)
4. Retest everything
5. Deploy with confidence!

