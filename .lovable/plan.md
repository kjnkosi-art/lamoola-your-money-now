

## Plan: Refresh Landing Page Colour Vibrancy

The page currently alternates between `#F7F7F4` off-white and plain `#FFFFFF` white sections with only text — making it feel flat and monotone. The fix is to introduce more contrast, use the brand colours more boldly, and add visual depth without changing the brand palette itself.

### Changes (all in `src/pages/LandingPage.tsx`)

**1. Hero section — add energy**
- Add a subtle gradient overlay from `#5F8B40` at 8% opacity on the left to transparent on the right, giving the hero warmth
- Increase circle watermark opacity from 5% to 10% so the background pattern is more visible
- Add a green accent line or dot cluster above the eyebrow text
- Make the "Get Started" button use the orange `#EB5E07` instead of olive green — gives a strong CTA pop against the muted background

**2. Why Lamoola section — green accent band**
- Add a top border or decorative bar using the gradient strip (`#5F8B40 → #6AE809 → #EB5E07`) as a section separator
- Add a light green tinted background (`#5F8B40` at 5% opacity) instead of plain white to differentiate it

**3. How It Works section — dark contrast block**
- Change from `#F7F7F4` to the navy `#062247` background with white text
- This creates a strong visual break and makes the page feel layered and dynamic
- Eyebrow label stays orange, headline becomes white

**4. Financial Wellness section — keep white but add green left-border accent**
- Subtle `4px` left border in `#6AE809` on the content container for visual interest

**5. Contact section — warm green background**
- Change from `#F7F7F4` to a richer `#5F8B40` background at 10% opacity, or use a soft gradient from white to light green
- This signals "action zone" before the dark footer

**6. Footer — add gradient top border**
- Add the brand gradient strip (`#5F8B40 → #6AE809 → #EB5E07`, 4px) at the top of the footer for visual continuity with the nav

**7. General polish**
- Increase watermark circle opacity to 8-10% across all sections that use them
- Add a second circle watermark to the "How It Works" dark section (at 8% opacity, white or lime green) for depth

### No other files modified. Brand colours remain the same — they are just applied more boldly.

