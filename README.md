# Unbound website

Static website for Unbound, intended for GitHub Pages at `https://krois.dk/unbound/`.

## Local preview

Run `npm run preview` (or `python3 -m http.server 8080 --bind 127.0.0.1`) from this directory, then open `http://127.0.0.1:8080/unbound/`.

## Landing page

The page is static HTML, CSS, and dependency-free JavaScript. `unbound/assets/landing.css` is scoped to the landing page; legal/support pages retain `site.css`. The devices use CSS perspective and transforms rather than WebGL or a video. A passive scroll listener updates a requestAnimationFrame loop that stops when settled, offscreen, or in a background tab. Mobile uses a single-column composition with the same scroll-driven transforms.

The system Reduce Motion preference is respected on load and when changed, and visitors can pause motion explicitly. Content and the static device composition work without JavaScript. The Watch player is a CSS illustration based on the app's playback controls, not a captured Watch screenshot. The iPhone uses the actual current Library preview.

Brand assets come from the companion Unbound app repository:

- `Design/Previews/modern-library-dark.png` → `unbound/assets/library-dark.webp` (660px wide, WebP quality 88).
- `Unbound/Assets.xcassets/AppIconPreview.imageset/AppIconPreview.png` → `unbound/assets/app-icon.webp` (128px, WebP quality 90).

The copy retains prelaunch availability. Replace the coming-soon labels with the confirmed App Store URL when the app is released.

## Browser checks

```sh
npm ci
npx playwright install chromium webkit
npm test
```

Tests cover Chromium, desktop WebKit, and an iPhone WebKit profile: navigation, public routes, scroll transforms, pause/resume, reduced-motion changes, idle animation updates, responsive overflow, keyboard access, axe WCAG checks, and the no-JavaScript fallback. Test dependencies are development-only.

## Deployment

The GitHub Actions workflow stages only `index.html`, `CNAME`, and `unbound/` into `_site/` and deploys after a push to `main`. Tests and development dependencies are excluded. Set the Pages source to **GitHub Actions** and its custom domain to `krois.dk` in repository settings; the Actions deployment does not configure the domain from the `CNAME` file.

The requested App Store URLs are:

- `https://krois.dk/unbound/privacy`
- `https://krois.dk/unbound/terms`
- `https://krois.dk/unbound/support`
