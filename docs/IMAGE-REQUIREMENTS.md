# Image Asset Strategy & Requirements

## Section-Specific Requirements

| Section | Purpose | Dimensions | Format | Notes |
|---------|---------|------------|--------|--------|
| **Hero** | Workshop/finished product; parallax layers | 1920×1080+ (2–3 layers) | WebP + JPEG fallback | High contrast for text overlay |
| **Featured Products** | Hero product imagery | Min. 1200×1600px (3:4 portrait) | WebP + JPEG | 4–6 hero images |
| **Projects** | Category showcases | 1200×900px | WebP + JPEG | Best work per category |
| **Philosophy** | Lifestyle/craftsmanship | 800×1000px | WebP + JPEG | 3 images |
| **Expertise** | Different services | 1000×800px | WebP + JPEG | 4 background images |
| **CTA** | Workshop/team at work | 1920×1080px | WebP + JPEG | Full-bleed background |
| **FAQ** | Decorative details | 600×400px | WebP + JPEG | 2–3 detail shots |

## Image Optimization Guidelines

- **Next.js Image**: Use the `next/image` component for automatic optimization and responsive `srcset`.
- **Lazy loading**: Use native `loading="lazy"` or Next.js Image default for below-the-fold images.
- **Blur placeholders**: Add `placeholder="blur"` and `blurDataURL` for smoother loading.
- **Format**: Prefer WebP with JPEG fallback; Next.js Image handles format selection.
- **Compression**: Compress assets to balance quality and file size (e.g. 80–85% quality for photos).
- **Aspect ratios**: Match component aspect ratios (e.g. 3:4 for featured product cards) to avoid layout shift.

## Conversion & Performance Notes

- **Animation performance**: Use `will-change: transform` sparingly; prefer CSS transforms over position changes.
- **IntersectionObserver**: Trigger animations only when sections are visible.
- **Reduced motion**: Support `prefers-reduced-motion` for accessibility (see `globals.css`).
- **Touch targets**: Ensure interactive elements are at least 44×44px on mobile.
