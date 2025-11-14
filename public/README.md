# Public Assets

This directory contains static assets for the application.

## PWA Icons

For PWA functionality, you need to add proper app icons:

1. **pwa-192x192.png** - 192x192 pixels (required)
2. **pwa-512x512.png** - 512x512 pixels (required)

These icons are referenced in `vite.config.js` for the PWA manifest.

### Creating Icons

You can use online tools like:
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

Or create them manually:
- Use your app logo/branding
- Ensure they're square images
- Use PNG format with transparency if needed

## Favicon

The `vite.svg` is the default Vite favicon. Replace it with your own favicon if desired.

## Other Assets

You can add other static assets here:
- Images
- Fonts
- Other static files

All files in this directory will be copied to the `dist` folder during build.

