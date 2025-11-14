# PWA Icon Setup

## Current Status
- ✅ `pwa-192x192.png` exists
- ❌ `pwa-512x512.png` missing (optional but recommended)

## To Add 512x512 Icon

1. Create or download a 512x512 pixel PNG image
2. Save it as `public/pwa-512x512.png`
3. Update `vite.config.js` to include both icons:

```javascript
icons: [
  {
    src: '/pwa-192x192.png',
    sizes: '192x192',
    type: 'image/png',
    purpose: 'any'
  },
  {
    src: '/pwa-512x512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'any'
  }
]
```

## Icon Generator Tools
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

