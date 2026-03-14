

## Plan: Replace SVG Pinwheel with Actual Lamoola Logo & Circle Assets

### What changes
Replace the generated `PinwheelIcon` SVG component with the actual uploaded Lamoola logo images and circle pattern throughout the landing page.

### Assets to copy
1. **`user-uploads://LOGO4-3.png`** → `src/assets/logo-nav.png` -- White text logo with green pinwheel, for use on the green nav bar and dark footer
2. **`user-uploads://LOGO-2.png`** (or `Picture1-3.png`) → `src/assets/logo-dark.png` -- Black text logo with green pinwheel, for any light-background usage (hero area scroll-to-top)
3. **`user-uploads://CIRCLES-3.png`** → `src/assets/circles-bg.png` -- Green circle pattern, for hero watermark backgrounds (replacing the SVG pinwheel watermarks)

### File changes

**`src/pages/LandingPage.tsx`**
- Remove `PinwheelIcon` import
- Import the new logo and circles assets
- **Nav**: Replace `PinwheelIcon + "Lamoola" text` with `<img src={logoNav} />` (the white+green logo), sized ~140px wide
- **Hero watermarks**: Replace the two `PinwheelIcon` watermark divs with `<img src={circlesBg} />` at 5% opacity, positioned top-right and bottom-left
- **Footer**: Replace `PinwheelIcon + "Lamoola" text` with `<img src={logoNav} />` sized smaller (~120px)
- Keep all Nunito font weights (900 headlines, 800 eyebrows/buttons, 600 nav, 400 body) unchanged
- Keep all colors, sections, nav behavior, and mobile menu unchanged

**No other files modified.** The `PinwheelIcon` component can remain in the codebase (unused) or be removed -- no impact either way.

