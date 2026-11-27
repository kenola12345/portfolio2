# Credits and licenses

Last reviewed: 2026-11-25. This is a summary written from the public pages of each source, **not legal advice**.

## 3D models

### Record player — by Temmie_Dola
- Source: https://sketchfab.com/3d-models/record-player-65200511d04f4b4dba0742186ee754b5
- License: **CC BY 4.0** (https://creativecommons.org/licenses/by/4.0/)
- Used in: `public/models/record_player.glb` (home page turntable)
- Changes made (CC BY asks for these to be stated): removed the sleeves, vinyl disc and animation that were baked into the file; resized and re-encoded the textures; erased the logo; printed the name and title on the platter (`scripts/optimize-record-player.mjs`)
- Attribution: shown in the footer of every page (`src/components/ui/SiteFooter.astro`). **Keep it.**

### The vinyl records — made for this project
- Built in code (`src/components/stage/Record.tsx`, `labelTexture.ts`): a cylinder with a drawn groove texture and the album cover as the label. No third-party model, so nothing to credit or license.
- An earlier version used Sketchfab's "Vinyl Record" by liamo123 (Sketchfab Standard license). It was removed because that license restricts serving the file for download; `vinyl_record.glb` is no longer in the repo or on the site.
- The record player's Sketchfab page carries a **"NoAI"** notice (not to be used to train or feed generative AI). This project does not do that.

## Images — please confirm you have the right to use them
- **Contact cover** (`public/covers/contact.webp`): the "news coo" bird illustration supplied by Kentaro. Artist and rights not recorded here.
- **Work Experience cover** (`public/covers/work.webp`): an anime frame supplied by Kentaro. Source and rights not recorded here.
- **Project screenshots** (`public/projects/*`): pages of sites built for clients (INITIA, INFINITO HOTEL & SPA, INITIA LOUNGE Mita, ONE ROOF, seta-tei.jp) and Kentaro's own sites. Confirm the clients are happy for the screenshots to be shown.
- **Artist photo** (`public/covers/artist.webp`, `public/images/artist-banner.webp`, `public/og.png`): Kentaro's own photo.

## Music (home "Now spinning" player)
- `public/audio/stylish-hip-hop.mp3` — "Stylish Hip Hop" by blesksound
- `public/audio/chill-hip-hop.mp3` — "Chill Hip Hop" by velariomusic
- `public/audio/oldschool-hip-hop.mp3` — "Oldschool Hip Hop" by sub_clair
- These look like Pixabay downloads (the file names end in Pixabay-style ids). **Please confirm the source and that its license allows use on a public site** (Pixabay's content license normally does, without credit). The artist names are shown in the player.
- Sound effects in the arcade game are synthesised in the browser (no files).

## Fonts
- Montserrat, Inter and Noto Sans JP via Google Fonts (SIL Open Font License).
- Futura (a system font on the machine that built the models) was used only to draw the name into the player's texture image.

## Software
Astro, React, three.js, @react-three/fiber, @react-three/drei, GSAP, Tailwind CSS, sharp and @gltf-transform are open-source (mostly MIT) — see each package's license in `node_modules`.
