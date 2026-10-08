# Unbound website

Static website for Unbound, intended for GitHub Pages at `https://krois.dk/unbound/`.

## Local preview

Run `npm run preview` (or `python3 -m http.server 8080 --bind 127.0.0.1`) from this directory, then open `http://127.0.0.1:8080/unbound/`.

## Landing page

`unbound/experience/` is the dedicated product walkthrough, focused on importing your own MP3 files and transferring them to Apple Watch for offline playback with Pro. Its three-step interactive illustration uses sample content and performs no actual file transfer. Both pages share the scroll-driven device scene; the experience page adds `experience.css` and `experience.js`.

The page is static HTML, CSS, and dependency-free JavaScript. `unbound/assets/landing.css` supplies the shared product-page layout; `home.css` refines the homepage with editorial typography and open feature columns. `devices.css` supplies the shared phone and Watch materials: machined edges, glass reflections, a graphite case, and a contoured sport band. The product background stays minimal. The walkthrough adds `experience.css`; legal/support pages retain `site.css`. The devices use CSS perspective and transforms rather than WebGL or a video. A passive scroll listener updates a requestAnimationFrame loop that stops when settled, offscreen, or in a background tab. Mobile uses a single-column composition with the same scroll-driven transforms.

The system Reduce Motion preference is respected on load and when changed, and visitors can pause motion explicitly. Content and the static device composition work without JavaScript. The Watch player is a CSS illustration based on the app's playback controls, not a captured Watch screenshot. The iPhone uses the Library capture with a small HTML branding overlay to reflect the updated in-app logo. Headers, footers, device previews, and the availability section reference the same transparent logo. Icon URLs carry a revision query to refresh previously cached artwork.

Brand assets come from the companion Unbound app repository:

- `Design/Previews/modern-library-dark.png` → `unbound/assets/library-dark.webp` (660px wide, WebP quality 88).
- `Design/Brand/unbound-logo-transparent.png` → `unbound/assets/app-icon.webp` (256px, WebP quality 95), `apple-touch-icon.png` (180px), `favicon-32.png`, and `favicon.ico` (16/32/48px). These exports preserve alpha around the rounded glass tile, with no black exterior matte or CSS corner clipping. Regenerate with `python Scripts/export-brand-assets.py --site ../unbound-site` from the companion app checkout; requires Pillow.

The copy retains prelaunch availability. Replace the coming-soon labels with the confirmed App Store URL when the app is released.

## Homepage entrance

`intro.js` and `intro.css` show a once-per-session Watch-logo entrance. The round `watch-icon.png` comes from the companion app's Watch AppIcon asset. A 120 Hz fixed-step damped spring handles landing and hover; the in-place transformation preserves velocity while aligning the icon’s inner symbol with the video. Background tabs suspend the animation clock. Entry by pointer, Enter, or Space starts unmuted video in the activation handler; rejected audible playback retries muted. Failures reveal the homepage. Skip, Escape, focus isolation/restoration, reduced motion, anchor links, and the no-JavaScript homepage remain supported. The prompt fades in after five visible seconds; early entry remains available. A decoded video frame starts the 180 ms icon dissolve and 550 ms expansion to full-screen framing. The MP4 starts 0.5 seconds into the original source, with audio trimmed identically. Playback continues during the 0.6-second final fade, starting at media time 4.0 seconds (the original 4.5-second animation endpoint). Portrait touch layouts up to 900 CSS pixels wide rotate the aligned artwork 90° anticlockwise in 350 ms. During the intro, viewport-fit=cover enables edge-to-edge layout; the original viewport setting is restored on completion. Mobile artwork uses 100lvh. Browser-tab framing centers the artwork and controls in the visual viewport, including its offset; standalone mode retains its full-height stage. An oversized black backing, hidden page siblings, and a black root prevent Safari from exposing the homepage beneath its translucent controls. Viewport/theme metadata are restored only after the final fade. The video’s original width fills the large viewport height, accepting cropping on tall phones. Controls stay upright; landscape and desktop playback stay upright. Viewport/orientation changes retarget framing over 350 ms without restarting playback. The standalone prompt uses bold cyan/blue glass lettering.

Refresh the intro stylesheet/script query strings when changing the entrance. Browser tests cover playback failures, early/repeated entry, focus, session bypass, media-time fading, frame-rate consistency, and tab suspension. Playwright's desktop/mobile WebKit profiles are engine tests, not physical iPhone Safari validation.

## Browser checks

```sh
npm ci
npx playwright install chromium webkit
npm test
```

Tests cover Chromium, desktop WebKit, and an iPhone WebKit profile: navigation, public routes, scroll transforms, pause/resume, reduced-motion changes, idle animation updates, responsive overflow, keyboard access, axe WCAG checks, and the no-JavaScript fallback. Test dependencies are development-only.

## Deployment

WordWin is served at `https://krois.dk/WordWin/` from its separate `mathiaskrois/WordWin` source repository. The deployment checks out the full commit SHA pinned in `wordwin-release.txt`, runs its unit tests and production build, and copies the built app alongside Unbound. `/WordWin/release.json` records the deployed WordWin SHA. Its service worker is restricted to `/WordWin/`.

For a WordWin release, first wait for **Verify WordWin** in that repository to pass, then update `wordwin-release.txt` and push this repository. A manual **Deploy GitHub Pages** run may override the pin through the `wordwin_ref` input, which accepts only a full commit SHA. Reverting the pin rolls WordWin back without modifying Unbound content.

The GitHub Actions workflow stages `index.html`, `CNAME`, `unbound/`, and the pinned WordWin production build into `_site/` and deploys after a push to `main`. Tests and development dependencies are excluded. Set the Pages source to **GitHub Actions** and its custom domain to `krois.dk` in repository settings; the Actions deployment does not configure the domain from the `CNAME` file.

The requested App Store URLs are:

- `https://krois.dk/unbound/privacy`
- `https://krois.dk/unbound/terms`
- `https://krois.dk/unbound/support`

## DTU course companion

`/dtu/` is the course directory; `/dtu/12106/` contains the Fall 2026 Quantitative Sustainability overview, 13 weekly plans, a mandatory-work checklist and a searchable index of 362 DTU Learn content items. Microfabrication is the featured case. Raw downloaded course files, videos, session information and student details are not published. The current `/unbound/` and `/wordwin/` deployment is preserved.

Edit `dtu-source/course.mjs` for curated weekly guidance and dated obligations, or `dtu-source/resources.json` for the source-link index. Source content was reviewed on 8 October 2026. Generated HTML in `dtu/` is committed for local previews; the deployment also rebuilds it from the source data.

```sh
npm run build:dtu
npm run test:dtu:dates
npm test
npm run preview
```

The client tracker uses Europe/Copenhagen civil dates and explicit timezone offsets for timed deadlines. ISO calendar week 42 (12–18 October) is a break, not a teaching week; teaching week 7 starts 19 October. Exam time remains unspecified. Completion is personal, device-local state and never represents verified DTU submission status. Site content renders without JavaScript; live dates, filtering and checkboxes are progressive enhancements.

Future courses should get their own source module, registry card and course directory; completion keys must include both course ID and term. Follow the same separation of sourced obligations, original study guidance and authenticated source links. Keep publication scoped to the generated public directory.
