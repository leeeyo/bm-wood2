# Open Graph Image for SEO

## Recommended: Create `og-image.png`

For optimal social sharing (Facebook, LinkedIn, Twitter, etc.), add an Open Graph image:

- **Filename:** `og-image.png` (place in `public/`)
- **Dimensions:** 1200 x 630 pixels
- **Format:** PNG or JPG
- **Max size:** Under 8 MB
- **Content:** BM Wood logo, tagline "Menuiserie et Agencement sur Mesure", and brand colors

The metadata in `app/layout.tsx` references `/og-image.png`. Until you add it, the fallback `/bmwood-header.png` is used as the secondary image.

## Validation

After adding the image, validate with:
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
