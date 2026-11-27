# Credits and licenses

Last reviewed: 2026-11-25. This is a summary written from the public pages of each source, **not legal advice**.

## 3D models

None. The record player and the vinyl records from the earlier design were removed (the record player was a CC BY 4.0 model by Temmie_Dola on Sketchfab, and `public/models/` and its credit are gone with it). The turntable on the home page is built in code (`src/components/home/Turntable.tsx`).
- The old Sketchfab models carried a "NoAI" notice (not to be used to train or feed generative AI). This project does not do that.

## Images — please confirm you have the right to use them
- **Contact cover** (`public/covers/contact.webp`): the "news coo" bird illustration supplied by Kentaro. Artist and rights not recorded here.
- **Work Experience cover** (`public/covers/work.webp`): an anime frame supplied by Kentaro. Source and rights not recorded here.
- **Project screenshots** (`public/projects/*`): pages of Kentaro's own sites. Client projects are shown anonymously, with generated illustrations instead of screenshots. Confirm the clients are happy for the screenshots to be shown.
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
