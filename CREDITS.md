# Credits and licenses

Last reviewed: 2026-11-25. This is a summary written from the public pages of each source, **not legal advice**.

## 3D models

### Record player — by Temmie_Dola
- Source: https://sketchfab.com/3d-models/record-player-65200511d04f4b4dba0742186ee754b5
- License: **CC BY 4.0** (https://creativecommons.org/licenses/by/4.0/)
- Used in: `public/models/record_player.glb` (home page turntable)
- Changes made (CC BY asks for these to be stated): removed the sleeves, vinyl disc and animation that were baked into the file; resized and re-encoded the textures; erased the logo; printed the name and title on the platter (`scripts/optimize-record-player.mjs`)
- Attribution: shown in the footer of every page (`src/components/ui/SiteFooter.astro`). **Keep it.**

### Vinyl Record — by liamo123
- Source: https://sketchfab.com/3d-models/vinyl-record-7afce8845d9c4331ba3ac96a3d51694f
- License shown on the page: **"Free Standard"** (Sketchfab's standard License Agreement, https://sketchfab.com/licenses)
- Used in: `public/models/vinyl_record.glb` (the records). The album cover is painted over the original label at runtime (`src/components/stage/labelTexture.ts`).
- Attribution: not required by the standard license as far as the page text shows, but it is credited in the footer anyway.

> **Open question — the vinyl model.** From reading Sketchfab's License Agreement:
> - The grant covers displaying, distributing and altering the asset, and it is not limited to non-commercial use.
> - But section 2.2(b) and (h) forbid making the asset available **as a stand-alone file**, or in a way that lets others **download, extract or access** it, and section 2.7 asks websites that use it to carry terms forbidding re-publication of the asset as a file.
> - This site serves the `.glb` file to every visitor's browser, so anyone can save it. The agreement does not say whether that counts as a breach; the wording above can be read to cover it.
>
> Options, safest first:
> 1. **Replace it** with a record made for this project (a disc with a groove texture is simple to build).
> 2. **Ask the author (liamo123)** for written permission to use it in a public website.
> 3. **Accept the risk.** The footer now says the models remain their authors' property and may not be downloaded or redistributed from this site, which is what section 2.7 asks for, but it does not remove the file from the page.
>
> Both models also carry a **"NoAI"** notice on Sketchfab (they may not be used to train or feed generative AI). This project does not do that.

## Images — please confirm you have the right to use them
- **Contact cover** (`public/covers/contact.webp`): the "news coo" bird illustration supplied by Kentaro. Artist and rights not recorded here.
- **Work Experience cover** (`public/covers/work.webp`): an anime frame supplied by Kentaro. Source and rights not recorded here.
- **Project screenshots** (`public/projects/*`): pages of sites built for clients (INITIA, INFINITO HOTEL & SPA, INITIA LOUNGE Mita, ONE ROOF, seta-tei.jp) and Kentaro's own sites. Confirm the clients are happy for the screenshots to be shown.
- **Artist photo** (`public/covers/artist.webp`, `public/images/artist-banner.webp`, `public/og.png`): Kentaro's own photo.

## Fonts
- Montserrat, Inter and Noto Sans JP via Google Fonts (SIL Open Font License).
- Futura (a system font on the machine that built the models) was used only to draw the name into the player's texture image.

## Software
Astro, React, three.js, @react-three/fiber, @react-three/drei, GSAP, Tailwind CSS, sharp and @gltf-transform are open-source (mostly MIT) — see each package's license in `node_modules`.
