# MANIFEST — Portfolio "Discography" Redesign

> **For Claude:** This is the source of truth for the redesign on branch `redesign/astro`.
> Read it fully before writing code. Build phase by phase (§12) and tick the checkboxes as you go.
> If something here is ambiguous or conflicts with what you find in code, stop and ask — don't guess.
> Items marked **TODO(owner)** need real content from Kentaro. Never invent work history, dates, or company names.

---

## 1. Concept

The portfolio is a **music app, and Kentaro is the artist.**

- The look is a **streaming music player** (the general language of Spotify / Apple Music): dark UI, album art, tracklists, an artist profile page, a persistent "now playing" bar.
- The home screen feels like a **game console menu** (the feel of early-2000s console menus — the GameCube menu is the mood reference). 3D objects float in a dark void, the focused item glows and reacts to input, and the selection animates with weight and sound-like snappiness.
- Every portfolio section is an **album**, shown on the home screen as a **3D vinyl record** (Three.js) with a picture on its center label.
- Opening a record does not cut to a new page. **The record flies up to the top-left corner** and becomes the album art of the album page, while the page content slides in around it.

**One sentence:** *A console-style record shelf where each record opens into a Spotify-style album page about Kentaro's work.*

### Originality rule
This is "inspired by" only. Do **not** copy any real product's logos, icons, sounds, fonts, colors, boot animation or exact layouts (no Spotify green, no GameCube cube/logo/sound). All art and motion are original.

---

### Design direction update (decided with Kentaro)

- **Sleeves hide the records.** On the shelf each album is a **sleeve card** (cover image) and its record sits **behind** it, peeking out of the top edge. Hover raises the record, click **pulls it out of the sleeve**, then the page changes and the record **flies to the top-left slot of the album page and spins** (the Spotify album-header layout). Going back reverses it.
- **Crystal UI (GameCube-menu feel).** All UI elements (back button, track rows, link pills, play button, sleeve cards) are glass "crystal" parts, similar to iOS-style translucent glass: blurred translucent face, bevelled inner highlight, rainbow rim light, a diagonal specular streak, bold white rounded labels with a soft blue glow, and a dark background with faint rainbow aurora blobs. Shelf caption: `··· Menu Selection`. Styles live in `src/styles/globals.css` (`.crystal`, `.menu-text`, `.aurora`, `.page-glow`).
- **How the 3D lines up with the DOM:** the canvas is fixed **behind** the page and uses an orthographic camera with 1 unit = 1 CSS px, so each record just reads the `getBoundingClientRect()` of its sleeve (`[data-card]`) or of the header slot (`[data-record-slot]`) every frame and eases toward it (`src/components/stage/stageLayout.ts`, `RecordStage.tsx`). Opaque DOM cards naturally hide the records; the canvas is persisted across pages with `transition:persist`.

## 2. Experience flow

```
[First visit]  Intro (≤2.5s, skippable, once per session)
      │
      ▼
[Home / "Shelf"]  3D records in a row. One is focused (centered, bigger, slowly spinning).
      │  ← / → / swipe / click a side record = change focus
      │  drag on focused record = tilt it (clamped, springs back)
      │  Enter / click focused record = open
      ▼
[Transition]  Other records fall away, focused record flies to the top-left slot.
      ▼
[Album page]  Spotify-style album header + tracklist. Record sits in the header as the cover.
      │  click a track = expand track details; it becomes "Now Playing" in the bottom bar
      │  Esc / Back button / browser back = reverse transition to Home
      │  Player bar ⏮ / ⏭ = go to previous / next album (record swaps sideways)
      ▼
[Artist page]  "About me" as a music-artist profile (reached from the artist name anywhere,
               or the "Artist" item on the shelf).
```

---

## 3. Information architecture

| Route | Shelf item | Type label | What it is |
|---|---|---|---|
| `/` | — | — | Home / Shelf (3D records) |
| `/artist` | Artist (portrait record) | `ARTIST` | About me, as an artist profile page |
| `/albums/projects` | Projects | `ALBUM` | Things Kentaro built. Each project = a track |
| `/albums/work` | Work Experience | `ALBUM` | Jobs. Each role = a track |
| `/albums/skills` | Skills | `EP` | Tech stack. Each category = a track, items as credits |
| `/albums/contact` | Contact | `SINGLE` | One track: how to reach Kentaro (email, GitHub, LinkedIn) |
| `/404` | — | — | "Track not found" page with a link back to the shelf |

Order on the shelf (left → right): **Artist, Projects, Work Experience, Skills, Contact.** Default focus on first load: **Projects.**

Every route is a real URL (deep-linkable, works on refresh, shows up in search).

---

## 4. Tech stack

| Area | Choice | Notes |
|---|---|---|
| Framework | **Astro 7**, `output: 'static'` | Config modelled on `../oshimoto.net/astro.config.mjs` (stack reference only — do **not** copy its content) |
| Page navigation | **Astro `<ClientRouter />`** (view transitions) | Lets the 3D canvas survive page changes |
| UI islands | **React 19** via `@astrojs/react` | Only for interactive parts. React 19 is required by @react-three/fiber 9 |
| 3D | **three 0.187**, **@react-three/fiber 9**, **@react-three/drei 10** | One canvas for the whole site |
| Animation | **GSAP 3** | Record flight, page content entrance. Also used inside R3F (tween object values, not React state) |
| Styling | **Tailwind CSS 4** via `@tailwindcss/vite` + CSS custom properties for tokens | No Sass |
| Language | **TypeScript 5** strict (`astro/tsconfigs/strict`, `@/*` → `src/*`) | `npm run build` runs `astro check` first |
| Hosting | **Vercel** (`@astrojs/vercel`) + `@vercel/analytics` | Keep analytics |
| Package manager | **npm**, Node ≥ 22.12 (`.nvmrc`) | yarn/corepack aren't installed on this machine (corepack is gone from Node 25+) |

Not used: Lenis (album pages are short; native scroll is fine), Sass, CRA.

---

## 5. The key architecture decision: one persistent canvas

The record must move continuously from the home screen into the album header, across a real URL change. So:

1. `src/layouts/AppLayout.astro` renders **one** `<RecordStage client:only="react" transition:persist="stage" />`.
   It is a `position: fixed; inset: 0` canvas **behind** the DOM (`z-index: 0`). Page DOM sits above (`z-index: 10`).
2. `<ClientRouter />` swaps the page DOM; the canvas is persisted and never remounts.
3. The stage reads the current route from a tiny store (`src/lib/stageStore.ts`, plain observable or `zustand`) that is updated on `astro:page-load` and on `astro:before-preparation` (so the flight can start **before** the new page is in).
4. **Stage modes:**
   - `shelf` — records in a row, input enabled, canvas receives pointer events.
   - `album` — only the active record is visible, parked in the **record slot**; canvas has `pointer-events: none` (except the record itself may still react to hover).
   - `artist` — the portrait record parks in the artist header slot.
   - `hidden` — 404 / no-WebGL.
5. **Record slot:** each album/artist page has an empty element `<div data-record-slot />` where the cover should appear. The stage measures its `getBoundingClientRect()`, converts the rect center and size into world space, and parks the record there. Recompute on resize and on scroll (the record scrolls away with the header — follow the slot's rect every frame while in `album` mode, or use drei `<View>` tracking).
6. **Deep links:** if the first load is `/albums/work`, the record starts already parked (no flight). The intro is skipped.
7. **Back navigation:** browser back / Esc / back button run the reverse flight. Use `astro:before-preparation` to detect direction (`event.direction` / navigation type).

Alternative considered and rejected: a single-page React app with a client router — loses static per-page HTML and real URLs; Astro + persist gives both.

---

## 6. Home / Shelf spec (the console-menu screen)

### Layout
- Full-viewport dark scene. Background: deep near-black with a slow, soft radial glow tinted by the **focused album's accent color** (cross-fades 0.6s on focus change).
- Records in a horizontal row, slight arc (side records a bit further back and turned ~20° toward center).
- Focused record: centered, scale 1.0, lifted slightly, rim light on. Side records: scale ~0.7, dimmed to ~55% brightness.
- Under the focused record (DOM, not 3D): type label (`ALBUM`), title, `Kentaro Oshimoto · 2025 · 6 tracks`. Text swaps with a short vertical mask slide on focus change.
- Top-left: small logo/wordmark "KENTARO OSHIMOTO". Top-right: EN/JA switch (Phase 7) and a sound toggle (Phase 8, off by default).
- Bottom: hint row — `← → Select   ⏎ Open   Drag to tilt` (on touch: `Swipe · Tap to open`).

### The record (3D object)
- **Model:** `public/models/vinyl_record.glb`, from Sketchfab, "Vinyl Record" by liamo123, under the Sketchfab Standard license. Credit it in the footer/colophon.
  - One mesh (`Circle_Material.001_0`) and one PBR material with baseColor + metallicRoughness + normal maps, all 1024² PNG. File size is about 1 MB. No animations.
  - The disc lies flat in **XY** with radius ≈ 0.949 and thickness 0.01 along **+Z**. Rotate it so it faces the camera and scale it to the layout. Load it with drei `useGLTF` and `useGLTF.preload`.
  - The texture atlas has **two faces**: side A sits in the top half of the UV, centered ≈ (257, 257) px, and side B in the bottom half, centered ≈ (257, 770) px. The baked center label is a blue circle, radius ≈ 85 px, with third-party text on it. That text **must always be covered**.
- **Center label = album picture:** per record, build a `CanvasTexture`. Draw the original baseColor first, then paint the album cover, clipped to a circle, over **both** label areas. Give each record a cloned material using that texture, and keep the normal and roughness maps shared. Keep the label centers and radius in `stage/config.ts` and tune them visually. If compositing ever looks wrong, the fallback is a thin `CircleGeometry` decal with the cover texture on each face, z-offset ±0.0005.
- **Optimize the GLB** (Phase 3) with `@gltf-transform/cli`: `optimize --texture-compress webp --texture-size 1024`, aiming for ≤ 400 KB. Keep the original out of the build.
- **Sleeve (optional, Phase 6 polish):** the square cover behind the record, record pulled ~40% out of it. If it hurts readability or performance, leave it out.
- **Idle:** the focused record spins slowly around its own axis (~8 rpm feel), side records are still.
- **Lighting:** one key light, a soft rim light, and an environment made with drei `<Environment>` + `<Lightformer>`s (no remote HDR downloads).

### Rotation — "rotatable, but not all the way"
- Drag (mouse or touch) on the focused record **tilts** it: yaw clamped to **±35°**, pitch clamped to **±20°**. It never flips around.
- Use rubber-banding near the limits (resistance grows), then **springs back** to rest on release (spring, ~0.6s, slight overshoot).
- When not dragging, the record follows the pointer very slightly (±4°) for a "alive" console feel.

### Navigation
- `←` / `→`, swipe, mouse wheel (horizontal or vertical, throttled), or clicking a side record = move focus. Focus wraps around? **No** — stop at ends with a small bump animation.
- Focus change: records slide along the arc (0.45s, `power3.out`).
- `Enter`, `Space`, or click/tap the focused record = open.

### Accessibility layer
The canvas is decoration for screen readers. A visually-hidden (but focusable) `<nav aria-label="Albums">` list of real `<a href>` links mirrors the shelf. Keyboard focus on a link = focus that record in 3D. Visible focus ring is drawn as a glow around the record + outline on the DOM caption.

---

## 7. Page transition spec

### Shelf → Album (total ≈ 0.9s)
| t | What happens |
|---|---|
| 0.00 | Input locked. Focused record stops idle spin (eases to rest angle). Hint row + caption fade out (0.2s). |
| 0.05 | Side records fall away: move down + back, fade out (0.35s, `power2.in`, staggered 0.04s from the center outward). |
| 0.10 | Navigation starts (ClientRouter fetches the album page). |
| 0.15 | Focused record **flies to the record slot (top-left)**: position + scale tween (0.7s, `power3.inOut`). It turns to face the camera with a small final tilt (~-8° yaw) and does a half spin while flying. |
| 0.45 | New page DOM is in. Album header text slides up + fades in (stagger 0.06s). Background tint settles on the album accent. |
| 0.65 | Tracklist rows slide up + fade in (stagger 0.03s). |
| 0.90 | Input unlocked. Record resumes a very slow idle spin in the header. |

### Album → Shelf (reverse, ≈ 0.8s)
DOM content fades out first (0.25s), then the record flies back to its shelf position and the other records rise back in.

### Album → Album (player bar ⏮ / ⏭)
Current record slides out to the left/right and fades; the next one slides in from the opposite side into the same slot (0.6s). Content cross-fades.

### Reduced motion (`prefers-reduced-motion: reduce`)
No flight, no spin, no tilt-follow. Records cross-fade between positions (0.2s). Content fades only. The drag tilt still works but without spring overshoot.

### Rule
Animate only `transform` and `opacity` on DOM elements. In 3D, animate object position/rotation/scale and material opacity. Never animate layout properties.

---

## 8. Album page spec (Spotify-style album)

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Back to shelf                                           EN/JA │
│ ┌──────────┐                                                     │
│ │ [record  │  ALBUM                                              │
│ │  slot]   │  Projects                                           │
│ │          │  ● Kentaro Oshimoto · 2025 · 2 tracks               │
│ └──────────┘                                                     │
│  ▶  (big circular play = opens track 1)    ⋯                     │
│ ──────────────────────────────────────────────────────────────── │
│  #   Title                     Tags                 Year   Link  │
│  1   oshimoto.net              Astro · React · GSAP 2025    ↗    │
│  2   seta-tei.jp               …                    …       ↗    │
│ ──────────────────────────────────────────────────────────────── │
│  Liner notes: short paragraph about this album                   │
├──────────────────────────────────────────────────────────────────┤
│ [mini cover] oshimoto.net · Kentaro Oshimoto   ⏮  ▶  ⏭   ━━○━━  │  ← Now Playing bar
└──────────────────────────────────────────────────────────────────┘
```

- **Header background:** vertical gradient from the album accent color (top) into the base background (like a music app album header).
- **Record slot:** ~232px square on PC, ~160px on SP. The 3D record parks here (§5).
- **Meta line:** artist name is a link to `/artist`. "Year" = most recent year in the album. Track count is computed.
- **Tracklist:** a real `<ol>`. Hover row = lighter background, number turns into ▶. Click/Enter on a row = **expands** it in place (accordion) showing: description, screenshot(s), role, tech used, links. Only one row open at a time. The opened track becomes "Now Playing".
- **"Duration" column** is reused per album: Projects → year, Work → period (`2024 — Present`), Skills → item count.
- **Liner notes:** optional short text block under the tracklist.

### Per-album track content
- **Projects:** title, year, tags (tech), description, image, live link, repo link (optional).
- **Work Experience:** role title, company, period, location, bullet points of what was done, tech used. **TODO(owner):** all entries.
- **Skills (EP):** tracks = Frontend, Backend, Database, Tools. Expanded row lists the items as "credits" chips.
- **Contact (EP):** four tracks — Email (mailto), GitHub, LinkedIn, and **Direct Mail** (a form: name, email, message + hidden honeypot). The form posts to the EmailJS REST API using `PUBLIC_EMAILJS_SERVICE_ID` / `PUBLIC_EMAILJS_TEMPLATE_ID` / `PUBLIC_EMAILJS_PUBLIC_KEY` (see `.env.example`; template variables `{{name}} {{email}} {{message}}`). Spam protection: hidden honeypot + **Google reCAPTCHA v2 checkbox** (site key in `PUBLIC_RECAPTCHA_SITE_KEY`; the secret key goes in the EmailJS dashboard, which verifies the `g-recaptcha-response` token — never in this repo). In `npm run dev` only, Google's public test key is used so the widget is visible. With EmailJS unset the form falls back to opening a prefilled `mailto:`.

---

## 9. Artist page spec (About me)

Modelled on a music-app **artist profile**:

- **Banner:** full-width photo of Kentaro (TODO(owner): photo) with dark gradient at the bottom. Over it: a "✓ Verified Artist"-style badge (original icon), name **KENTARO OSHIMOTO** in huge type, and a playful stat line, e.g. `Full Stack Developer · Tokyo, Japan`.
- **Record slot** for the portrait record sits overlapping the banner bottom-left.
- **Popular:** top 3 tracks across all albums (best projects), same row style as the tracklist; clicking goes to that album with that track opened (`/albums/projects#oshimoto-net`).
- **Discography:** grid of album cards (cover, title, `Album · 2025`). Clicking a card = navigate to that album with the record flight starting from the card position (Phase 6 polish; v1 can use the normal flight).
- **About card:** big card with a photo and the bio. Starting bio (from the current site):
  - EN: "Born and raised in America, now living in Tokyo, Japan. Currently working as a Full Stack Developer at a Japanese startup company."
  - JA: "アメリカ生まれ・育ち。現在は東京在住。日本のスタートアップ企業でフルスタックエンジニアとして働いています。"
  - TODO(owner): longer bio if wanted.
- **Links:** GitHub, LinkedIn, Email (icons from `public/icons/`).

---

## 10. Global UI

- **Now Playing bar** (album + artist pages only, not on the shelf): fixed bottom, 72px PC / 64px SP. Shows the current track (or the album if none open), artist name, ⏮ ⏭ for previous/next album, ▶ toggles the open track's row. The progress bar is decorative: it shows the scroll progress of the page. Persisted across navigation with `transition:persist`.
- **Back button** top-left on album/artist pages (`← Shelf`). `Esc` does the same.
- **No custom cursor**, no Lenis.
- **Intro** (Phase 8): first session visit only, skippable on any input, ≤2.5s — records drop into place one by one with a soft "settle". `sessionStorage` flag (wrapped in try/catch).

---

## 11. Design tokens

Put all of these as CSS custom properties in `src/styles/globals.css` and expose them to Tailwind 4 via `@theme`.

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#0b0b0d` | Page / scene background |
| `--color-surface` | `#151518` | Cards, tracklist hover |
| `--color-surface-2` | `#1f1f24` | Now Playing bar |
| `--color-text` | `#f4f4f5` | Main text |
| `--color-text-muted` | `#a1a1aa` | Meta, numbers, captions |
| `--color-accent` | per album (see data) | Header gradient, focus glow, active row |
| `--font-display` | a bold geometric sans (e.g. "Montserrat" 800 via Google Fonts) | Titles |
| `--font-body` | "Inter" or system sans | Body |
| `--font-jp` | "Noto Sans JP" | Japanese text |
| `--gutter-sp` | `16px` | **Standard SP side padding — every text block on SP uses this** |
| `--gutter-pc` | `40px` | Standard PC side padding |
| `--radius-card` | `8px` | Cards, covers |
| `--ease-out` | `cubic-bezier(.22,1,.36,1)` | DOM transitions |

Breakpoint: SP `< 768px`, PC `≥ 768px`. Write mobile-first (`md:` = PC).

**SP rule:** captions, ※ notes and body copy must never touch the viewport edge — always inside the `--gutter-sp` container. Check every page at 375px width.

---

## 12. Data model

All content lives in typed data files, not in components. Every user-facing string is bilingual.

```ts
// src/data/types.ts
export type Lang = 'en' | 'ja';
export type L10n = Record<Lang, string>;

export type AlbumType = 'ALBUM' | 'EP' | 'SINGLE';

export interface Track {
  slug: string;            // used for #anchor and Now Playing
  title: L10n;
  meta?: L10n;             // the "duration" column text (year, period, count…)
  tags?: string[];         // tech names, not translated
  description?: L10n;
  bullets?: L10n[];
  images?: { src: string; alt: L10n }[];
  links?: { label: string; href: string }[];
}

export interface Album {
  slug: 'projects' | 'work' | 'skills' | 'contact';
  type: AlbumType;
  title: L10n;
  year?: number;          // omit until the real year is known
  accent: string;          // hex, drives header gradient + shelf glow
  cover: string;           // image on the record label, e.g. /covers/projects.webp
  linerNotes?: L10n;
  tracks: Track[];
}

export interface Artist {
  name: L10n;
  tagline: L10n;
  bio: L10n;
  banner: string;
  portrait: string;        // record label for the "Artist" shelf item
  accent: string;
  socials: { kind: 'github' | 'linkedin' | 'email'; label: string; href: string }[];
  popular: { album: Album['slug']; track: string }[];
}
```

Files: `src/data/albums.ts` (exports `albums: Album[]` in shelf order), `src/data/artist.ts`, `src/data/ui.ts` (UI strings like "Back to shelf").

### Seed content (from the current site)
- **Projects:** `oshimoto.net` → https://www.oshimoto.net/ (image `/projects/oshimotonet.png`); `seta-tei.jp` → https://www.seta-tei.jp/ (image `/projects/seta-tei.png`). TODO(owner): years, descriptions, tags, more projects.
- **Skills:** Frontend — HTML, CSS, Sass, JavaScript, TypeScript, React, Next.js, Astro · Backend — Node.js · Database — PostgreSQL, MongoDB · Tools — Docker, Claude Code. (Add Three.js once this site ships.)
- **Work:** filled in from the resume (`Kentaro_Oshimoto_Resume_EN.docx`): AXR (Full Stack Engineer, Nov 2026 – present) and Holon Inc. (Frontend Developer, Jun 2023 – Oct 2026). Japanese text is a translation of the English resume — TODO(owner): review. The phone number from the resume is intentionally NOT on the site.
- **Contact / socials:** GitHub `kenola12345` (from the resume; the old site had `bap-ssbm`), LinkedIn `kentaro-oshimoto` (from the old `Footer.tsx`), email `ken.oshimoto@gmail.com`. TODO(owner): confirm LinkedIn is still current.
- **Covers:** Artist = selfie on the pier (`public/covers/artist.webp`, face-centered crop; full photo at `public/images/artist-banner.webp` for the banner). Projects = the retro-computer illustration (`public/covers/projects.webp`). TODO(owner): Work, Skills, Contact covers — placeholder SVGs (accent color + title) until provided.

---

## 13. Directory structure

```
portfolio2/
├─ MANIFEST.md
├─ astro.config.mjs
├─ package.json            # npm
├─ tsconfig.json
├─ public/
│  ├─ models/vinyl_record.glb  # record model (Sketchfab, liamo123 — credit required in colophon)
│  ├─ covers/              # album label images (.webp)
│  ├─ projects/            # existing screenshots (keep)
│  ├─ icons/               # existing social icons (keep)
│  └─ favicon.svg
└─ src/
   ├─ layouts/
   │  └─ AppLayout.astro            # <ClientRouter/>, persisted RecordStage + NowPlayingBar
   ├─ pages/
   │  ├─ index.astro                # Shelf (DOM captions + a11y nav)
   │  ├─ artist.astro
   │  ├─ albums/[slug].astro        # getStaticPaths from albums.ts
   │  └─ 404.astro
   ├─ components/
   │  ├─ stage/                     # everything Three.js (React)
   │  │  ├─ RecordStage.tsx         # <Canvas>, mode switching, route listener
   │  │  ├─ Record.tsx              # GLB record (useGLTF) + per-album label texture + (sleeve)
   │  │  ├─ Shelf.tsx               # arc layout, focus, input
   │  │  ├─ useTiltDrag.ts          # clamped drag + spring back
   │  │  ├─ useRecordSlot.ts        # DOM rect → world space
   │  │  ├─ labelTexture.ts         # cover image composited onto the GLB label areas
   │  │  ├─ config.ts               # durations, clamp angles, label UV centers/radius
   │  │  └─ transitions.ts          # GSAP timelines (flight in/out, swap)
   │  ├─ album/
   │  │  ├─ AlbumHeader.astro
   │  │  ├─ Tracklist.tsx           # accordion rows (island)
   │  │  └─ LinerNotes.astro
   │  ├─ artist/
   │  │  ├─ ArtistBanner.astro
   │  │  ├─ PopularTracks.astro
   │  │  ├─ Discography.astro
   │  │  └─ AboutCard.astro
   │  └─ ui/
   │     ├─ NowPlayingBar.tsx
   │     ├─ BackButton.astro
   │     ├─ ShelfCaption.tsx
   │     └─ LangSwitch.astro
   ├─ data/                         # types.ts, albums.ts, artist.ts, ui.ts
   ├─ lib/
   │  ├─ stageStore.ts              # current mode / album / focus index
   │  └─ i18n.ts                    # t(), getLang(url)
   └─ styles/globals.css            # tokens + Tailwind @theme
```

---

## 14. Performance, fallbacks, quality bar

- **One** WebGL canvas. `dpr={[1, 2]}`. The GLB is loaded once; all records share its geometry and normal/roughness maps and differ only in their label texture. Cover textures ≤ 1024px `.webp`, loaded with `useTexture` + `Suspense`; shelf shows a dim placeholder disc while loading.
- Pause rendering when the tab is hidden; use `frameloop="demand"` in `album` mode when the record is not animating.
- Lazy-load the 3D bundle (`client:only` + dynamic import) so album page **text** renders first. LCP must be the DOM title, never the canvas.
- **No WebGL / context lost:** stage switches to `hidden`; the shelf falls back to a 2D grid of cover images (CSS 3D tilt on hover) using the same a11y nav links. Album pages show the cover `<img>` in the record slot.
- Targets: Lighthouse Performance ≥ 85 on mobile for album pages, Accessibility ≥ 95, 60fps on the shelf on a mid-range laptop.
- `astro build` passes with zero TypeScript errors before any phase is called done.

---

## 15. Implementation phases

Each phase ends with: `npm run build` passes, the site is checked in the browser at 1440px and 375px, and a commit.

### Phase 1 — Clean slate
- [x] Remove CRA files (`src/`, `build/`, `package-lock.json`, `tailwind.config.js`, CRA `tsconfig.json`, `README.md`, CRA `public/` files, old flower/leaf SVGs). Keep `public/projects`, `public/icons`.
- [x] Set up Astro 7 + React 19 + Tailwind 4 + Vercel adapter + `@vercel/analytics`. npm.
- [x] Add three, @react-three/fiber, @react-three/drei, gsap.
- [x] `globals.css` with tokens (§11) in `@theme` + `wrap` utility for the gutters. Fonts via Google Fonts (`AppLayout.astro`).
- [x] Data types + seed data (`src/data/`) with placeholder SVG covers in `public/covers/` (§12).

### Phase 2 — Static pages (done early, together with Phases 3–4 basics)
- [x] `AppLayout` with `<ClientRouter />`.
- [x] Album page from data: header with the live record in the slot, tracklist accordion (`<details name>`), liner notes.
- [x] Artist page: about card (banner photo + bio + socials) and discography. TODO: "Popular" section.
- [x] Shelf page as sleeve cards + captions; cards are real links (also the keyboard / no-WebGL fallback).
- [ ] 404 page.
- [ ] Check SP gutters on every page.

### Phase 3 — 3D record + shelf
- [x] Persistent `RecordStage` canvas behind the DOM.
- [ ] Optimize `public/models/vinyl_record.glb` (webp textures, ≤ 400 KB).
- [x] `Record`: load the GLB, composite each album cover over both baked labels, lighting, glowing rim.
- [ ] Shelf arc layout, focus change via keys / click / swipe / wheel, accent glow.
- [ ] Clamped tilt drag with spring back + subtle pointer follow.
- [ ] Captions sync with focus; a11y nav sync with focus.

### Phase 4 — Record flight transition
- [ ] `stageStore` driven by Astro navigation events.
- [x] DOM rect → world tracking (`stageLayout.ts`), incl. resize/scroll (read every frame).
- [x] Shelf → Album flight + content entrance (§7). Album → Shelf reverse. (Browser back: still to test.)
- [ ] Deep-link loads start parked. Replace the slot `<img>` with the live record (keep `<img>` as fallback).

### Phase 5 — Now Playing bar + album-to-album
- [ ] Persisted `NowPlayingBar`, track selection sync, scroll-progress bar.
- [ ] ⏮ / ⏭ album swap animation.
- [ ] `#track-slug` anchors open the right row.

### Phase 6 — Polish
- [ ] Reduced-motion path for every animation.
- [ ] No-WebGL fallback verified (disable WebGL in DevTools).
- [ ] Optional sleeve on records; discography-card flight start.
- [ ] Performance pass against §14 targets.

### Phase 7 — Bilingual (EN/JA)
- [ ] Astro i18n routing: EN default at `/`, JA at `/ja/...`. `LangSwitch` keeps the current page. Switching language keeps the stage (no re-intro).

### Phase 8 — Extras (nice to have)
- [ ] Intro sequence (§10).
- [ ] Original UI sounds (focus tick, open whoosh), **muted by default**, toggle in the header, respects user choice in `localStorage`.

---

## 16. Coding rules for this repo

- Code comments in **Japanese**, matching the existing project style: a one-line summary at the top of every component/function, and a WHY comment when a value or rule isn't obvious.
- Components: Astro for static markup, React only when it needs state/interaction or Three.js.
- Keep Three.js state out of React re-renders: mutate refs in `useFrame`, tween with GSAP, store only "mode / focused index / active album" in `stageStore`.
- No magic numbers in components — animation durations, clamp angles and layout sizes live in `src/components/stage/config.ts`.
- `localStorage` / `sessionStorage` access always in `try/catch`.
- Commit style: `type(scope): subject` (e.g. `feat(stage): add clamped tilt drag`), as in the existing history.

---

## 17. Open questions for Kentaro

1. Final album list — are Artist / Projects / Work / Skills / Contact right, or add more (e.g. "Side B: experiments", education)?
2. Album titles — plain ("Projects") or playful names with the plain name as a subtitle?
3. Work experience entries (company, period, bullets) — and can the company be named?
4. Cover images for each album + a portrait/banner photo — will you provide them, or should Claude design generated covers?
5. Keep EN/JA bilingual from the start, or ship EN first (current plan: Phase 7)?
6. UI sounds — want them at all?
