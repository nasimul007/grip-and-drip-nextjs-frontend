# Frontend Integration — Progress Tracker

## Status Legend
✅ Done | 🔄 In Progress | ⬜ Pending

## Steps

### Step 1: Foundation
✅ Create `.env.local` — `NEXT_PUBLIC_API_URL=http://localhost:8000`
✅ Create `src/lib/api.ts` — API client with JWT auto-refresh
✅ Create `src/lib/types.ts` — TypeScript types matching Django serializers
✅ Create `src/redux/features/auth-slice.ts` — user, isAuthenticated
✅ Update `src/redux/store.ts` — add auth reducer to store

### Step 2: Auth Integration
✅ Wire Signin page → `POST /api/auth/login/`
✅ Wire Signup page → `POST /api/auth/register/`
✅ Update Header → show username when logged in, Sign In link when logged out
✅ Logout button in nav bar → clears tokens + Redux state

### Step 3: Products & Categories
⬜ Replace Home categories with `GET /api/categories/`
⬜ Replace Home best sellers with `GET /api/products/?is_featured=true`
⬜ Replace Shop data with `GET /api/products/` (filters, pagination)
⬜ Create dynamic route `shop/[slug]/page.tsx`
⬜ Wire ShopDetail to `GET /api/products/<slug>/`
⬜ Wire Header category dropdown to API

### Step 4: Cart
⬜ Sync Redux cart with `GET /api/cart/` (authenticated users)
⬜ Wire "Add to Cart" → `POST /api/cart/add/`
⬜ Wire quantity update → `PATCH /api/cart/items/<id>/`
⬜ Wire remove → `DELETE /api/cart/items/<id>/remove/`
⬜ Wire clear → `POST /api/cart/clear/`
⬜ Guest cart handling (localStorage/Redux only)

### Step 5: Checkout & Orders
⬜ Fetch shipping rates from `GET /api/shipping-rates/`
⬜ Wire order placement → `POST /api/orders/`
⬜ Replace My Account orders → `GET /api/orders/list/`
⬜ Profile update → `PATCH /api/auth/profile/`

### Step 6: Contact & Newsletter
⬜ Wire Contact form → `POST /api/contact/`
⬜ Wire Newsletter → `POST /api/newsletter/subscribe/`
