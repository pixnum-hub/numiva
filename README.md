# Numiva — PWA file set

Deploy every file below together, at the same directory level, on any static host (Netlify, Vercel, GitHub Pages, S3+CloudFront, nginx, etc.). PWA install and offline support require **HTTPS** (or `localhost` for local testing).

## Files

| File | Purpose |
|---|---|
| `index.html` | The app itself. |
| `offline.html` | Shown by the service worker if a page load fails while offline and nothing is cached yet. |
| `manifest.json` | Web app manifest — name, theme colors, icons, install behavior. Linked from `index.html`. |
| `sw.js` | Service worker — caches the app shell for offline use, and drives the "new version available" update toast already wired up in `index.html`. |
| `browserconfig.xml` | Windows/Edge pinned-tile configuration. Linked via `<meta name="msapplication-config">`. |
| `robots.txt` | Allows search engines to crawl the site. |
| `favicon.ico` | Multi-resolution (16/32/48px) favicon. |
| `icons/` | Every icon size referenced by `manifest.json` and the `<link rel="apple-touch-icon">` tags in `index.html` — covers iOS home-screen icons (legacy sizes through iOS 15+), Android/Chrome install icons (including a `-maskable` variant for adaptive icons), and the Windows tile image. |

## Deploying

1. Upload all files, preserving the `icons/` subfolder.
2. Confirm the site is served over HTTPS.
3. Open it once while online so the service worker installs and precaches the app shell — after that, it works offline.
4. To ship an update later: edit `index.html`/`sw.js` as needed and bump `CACHE_NAME` at the top of `sw.js` (e.g. `numiva-v2` → `numiva-v3`). That's what triggers the "new version ready" toast for returning visitors.

## Notes

- The service worker deliberately skips registration when running inside the Claude chat preview (`claudeusercontent.com`), since that environment only serves `index.html` on its own. On a real deployment this check is a no-op.
- `icons/icon-*.png` sizes: 16, 32, 48, 57, 60, 70, 72, 76, 96, 114, 120, 128, 144, 150, 152, 167, 180, 192, 256, 384, 512, plus `512-maskable`, plus `mstile-150.png` for Windows.
