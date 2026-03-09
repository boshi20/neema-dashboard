

# Logo Design Plan for SavePlate

## Context
SavePlate is a restaurant dashboard application focused on meal management, reducing food waste, and order tracking. The brand uses:
- **Primary color**: Teal/green (#00916E - HSL 161 93% 30%)
- **Design style**: Modern, clean with glassmorphic effects
- **Core values**: Sustainability, food waste reduction, restaurant efficiency

## Logo Approach

I'll create a modern, minimalist logo that incorporates:

1. **Visual Elements**:
   - A stylized plate icon with a leaf or checkmark motif (representing "saving" and sustainability)
   - Clean, geometric shapes
   - Modern sans-serif typography for "SavePlate"

2. **Color Palette**:
   - Primary teal (#00916E)
   - Accent lighter teal (#34D399)
   - White/transparent backgrounds for versatility

3. **Deliverables**:
   - Square favicon version (512x512px) for use as favicon and mobile icons
   - Horizontal logo version (for sidebars and headers)
   - Both light and dark mode compatible

## Implementation Steps

1. **Generate logo using AI image generation** (google/gemini-2.5-flash-image)
   - Create a modern, minimalist plate icon with sustainability theme
   - Use the brand's teal color palette
   - Generate at high resolution for quality

2. **Save logo files**:
   - Save favicon version to `public/favicon.png`
   - Save full logo to `public/logo.png`

3. **Update HTML references**:
   - Update `index.html` to reference the new favicon
   - Add proper meta tags for various icon sizes

4. **Update component usage**:
   - The logo will automatically be available for use in `DashboardLayout` and `AdminLayout` components via the user logo upload feature

## Technical Details

- Using Lovable AI Gateway for image generation
- Will generate professional, scalable logo design
- Ensures brand consistency across restaurant and admin interfaces
- Compatible with both light and dark themes

