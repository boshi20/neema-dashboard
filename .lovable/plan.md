

# Mobile App UI Prototype Plan

## What I'll Build

Interactive prototype screens at `/app/preview` routes that showcase the mobile customer app design. You'll be able to view them in the preview panel and test on different mobile screen sizes.

## Prototype Screens

### 1. Home/Browse Screen (`/app/preview/home`)
- **Top**: Search bar + filter/category buttons
- **Main**: Grid of meal cards (using mock data)
  - Large meal image (using placeholder.svg)
  - Meal name in English & Arabic
  - Restaurant name with small icon
  - Pickup time chip (e.g., "🕐 18:00-20:00")
  - Price display: Large discounted price + strikethrough original
  - "Add to Cart" button
- **Bottom**: Navigation bar with 4 tabs (Home active)
- **Features**: Scrollable, pull-to-refresh visual indicator

### 2. Meal Detail Screen (`/app/preview/detail`)
- **Header**: Back button, meal name
- **Hero**: Full-width meal image
- **Content**:
  - Restaurant info card (name, location icon)
  - Description text (bilingual)
  - Pickup window with clock icon
  - Stock indicator ("5 left")
  - Price breakdown (savings calculation)
  - Quantity selector (- button, number, + button)
- **Footer**: Sticky "Add to Cart" button with total
- **Features**: Swipe-to-go-back gesture indicator

### 3. Cart Screen (`/app/preview/cart`)
- **Header**: "Shopping Cart" title
- **List**: Cart item cards
  - Small meal thumbnail
  - Meal name + restaurant
  - Price × Quantity
  - Inline quantity adjuster
  - Swipe-to-delete indicator
- **Summary Card**:
  - Subtotal, Savings (highlighted in green), Total
  - Large "Proceed to Checkout" button
- **Empty State**: Illustration + "Your cart is empty"

### 4. Bottom Navigation Component
- 4 tabs: Home (🏠), Cart (🛒 with badge "2"), Orders (📋), Profile (👤)
- Active state: filled icon + primary color
- Inactive: outline icon + muted color
- Smooth tab switching animation

## Design Specifications

**Layout:**
- Mobile-first: 375px viewport (iPhone SE/X size)
- Safe areas for iOS notch
- Bottom navigation: 60px height, sticky
- Card padding: 16px
- Grid gap: 12px

**Typography:**
- Meal name: text-lg font-semibold
- Price: text-2xl font-bold (primary color)
- Body text: text-sm
- Arabic text: Same sizes, RTL support

**Colors:**
- Reuse existing green primary: `hsl(161 93% 30%)`
- Glassmorphism cards with `glass` class
- Savings/discount: green accent
- Muted text for restaurant name

**Components:**
- Meal cards: `rounded-xl`, `shadow-md`, hover lift effect
- Buttons: Full-width on mobile, `h-12` for easy tapping
- Bottom nav: Fixed position, backdrop blur, border-top

**Visual Enhancements:**
- Skeleton loaders for images
- Badge component for "50% OFF", "Low Stock"
- OMR symbol integration (using existing OmrSymbol component)
- Category chips: rounded-full pills

## Implementation Files

**New files to create:**
1. `src/pages/app/AppPreviewHome.tsx` - Home screen
2. `src/pages/app/AppPreviewDetail.tsx` - Detail screen  
3. `src/pages/app/AppPreviewCart.tsx` - Cart screen
4. `src/components/app/BottomNav.tsx` - Navigation component
5. `src/components/app/MealCard.tsx` - Meal card component
6. `src/components/app/CartItem.tsx` - Cart item component
7. `src/layouts/AppPreviewLayout.tsx` - Mobile layout wrapper

**Routes to add in App.tsx:**
```typescript
<Route path="/app/preview">
  <Route path="home" element={<AppPreviewHome />} />
  <Route path="detail" element={<AppPreviewDetail />} />
  <Route path="cart" element={<AppPreviewCart />} />
</Route>
```

## Data for Prototypes

- Use existing `mockMeals` from `src/data/mockData.ts`
- Static cart state: 2 items for demonstration
- Restaurant name: "Al Madina Restaurant"
- Mock location: "Muscat, Oman"

## Mobile Testing

After building, you can:
1. View at `/app/preview/home` in preview panel
2. Use browser DevTools to switch to mobile viewport (375x667)
3. Test navigation between screens
4. See responsive behavior
5. Review RTL layout (when language switched to Arabic)

## Deliverables

- 3 interactive prototype screens
- Reusable mobile components
- Mobile-optimized layout
- Navigation flow demonstration
- Ready for your feedback and iteration

Once you approve these prototypes, we can adjust styling, spacing, colors, and component designs before building the full functional app with Capacitor.

