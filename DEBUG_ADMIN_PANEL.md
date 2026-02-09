# Debug Admin Applications Panel

## Issue
Admin applications page shows 6 applicants, but database is empty.

## Step-by-Step Debug

### 1. Open Admin Applications Page
Navigate to: `http://localhost:3001/admin/vendor-applications`

### 2. Open DevTools (F12)
- Go to **Network** tab
- Check "Preserve log"
- Refresh the page

### 3. Look for API Requests
Find requests to:
- `/api/admin/listUsers`
- `/api/admin/listVendors`

### 4. Check Request Details
For each request:
- Click on it
- Go to **Response** tab
- Copy the response JSON

### 5. Check Console for Errors
- Go to **Console** tab
- Look for any red errors
- Look for any oRPC related messages

### 6. Check Application Storage
- Go to **Application** tab
- Expand **Local Storage** → `http://localhost:3001`
- Look for any cached data
- Expand **Session Storage**
- Check **IndexedDB**

### 7. Run This in Console

```javascript
// Check what's actually being called
console.log('=== ORPC CLIENT DEBUG ===');

// Import orpc
import('/src/utils/orpc').then(({ orpc }) => {
  console.log('ORPC client:', orpc);

  // Try to call the API directly
  orpc.admin.listUsers.call({ limit: 5, offset: 0 }).then(result => {
    console.log('listUsers result:', result);
  }).catch(err => {
    console.error('listUsers error:', err);
  });
});
```

### 8. Expected vs Actual

**Expected:**
- API should return empty arrays (0 users with vendor status)
- UI should show "No applications found"

**Actual:**
- UI shows 6 applicants
- These emails don't exist in database

## Next Steps

After collecting the above information, we can determine if:
1. The API is returning wrong data
2. The frontend is using cached data
3. There's a service worker interfering
4. The frontend is using mock data

---

## Quick Fix to Try

In the browser console on the applications page:

```javascript
// Force refresh all queries
window.location.href = 'http://localhost:3001/admin/vendor-applications?_=' + Date.now();
```
