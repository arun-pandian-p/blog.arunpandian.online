# Implementation Plan — Awwwards Replica Presets & Dynamic Element Creator

Updated plan based on **direct research of all 7 reference sites** (fetched and analyzed 2026-07-09). Each preset below is specified from the actual site's structure, copy patterns, signature components, and animation behaviors — not generic descriptions. It also specifies the full **Create New Element** engine for the Visual Editor.

> [!IMPORTANT] User review required
> - New elements (Heading, Text, Button, Link, Image) can be added to any section (Hero, About, Toolkit, Experience, Footer) or a new Custom Section, stored in `settings.custom_elements`, fully editable with real-time canvas updates.
> - Presets recreate each site's **design language** — typography scale, palette, cursor, grids, marquees, loaders, card systems, and animation choreography — implemented natively in our React/Vite + GSAP/Framer Motion/Lenis stack. We reproduce the *feel and mechanics*, not their assets, copy, or proprietary code (those remain the owners' IP).

---

## Part A — Site Research Findings (what each site actually does)

### 1. Joy Rush — drinkjoyrush.com
- **Platform:** Shopify custom theme (by djarma.kin), GTM, heavy PNG/SVG float assets (clouds, cans).
- **Signature components observed:**
  - **Infinite text marquee** at the very top repeating three phrases in loop: *"always delicious / joyfully bold / effortlessly stylish"* — repeated 4× in DOM (classic seamless marquee duplication technique).
  - Second **badge marquee** in hero: "low calorie · functional ingredients · no added sugars · gluten free" looped 4×.
  - **Age-gate modal** (yes/no) with full-screen takeover on entry.
  - **Floating cloud parallax layers** (`cloud-sm/md/lg.png`, `footer-cloud-left/right`) — multi-speed drift.
  - **Anchored + floating can** pair (`can-anchor.png` + `can-float.png`) — scroll-linked float/bob animation.
  - Ingredient **icon grid** with per-item SVG icons; nutrition table as styled list.
  - Mood cards ("Unwind & Reset", "Gather & Connect", "Celebrate & Spark", "Play & Indulge") — 4-up hover cards.
  - Lowercase-everything typography, chunky rounded sans; playful review cards with star counts.
  - Bundle tier stepper ("spend $50 → save $5 / $75 → free shipping / $100 → $10 + free shipping").
- **Replica recipe (Preset `joy-rush`):** cream/sky background `#FDF7EE`/`#CDE9F5`, candy accents (tangerine `#F5883D`, cherry `#E64B5A`, teal `#37B5A8`); *Fredoka* headings + *Sora* body, all-lowercase `text-transform`; dual CSS marquees (top tagline + hero badge strip, `animation: marquee 18s linear infinite` with 4× duplication); floating blob/cloud divs with GSAP `yoyo` tweens at 3 parallax speeds; pill buttons with 4px offset soft shadow that depress on hover; card grid with springy `scale(1.03)` hover (Framer Motion).

### 2. K95 — k95.it/en
- **Platform:** Custom build (Cloudflare R2 asset bucket, Strapi-style hashed media), IT/EN locale switch.
- **Signature components observed:**
  - **Duplicated-letter nav hover**: menu items render as "AAllll WWoorrkkss", "SSttuuddiioo", "CCoonnttaacctt" — every letter doubled in DOM for a per-letter slide/swap hover animation (letters roll to reveal their twin).
  - **Page counter/preloader** `[0]` top-left; footer meta row: "BRAND & DIGITAL DESIGN STUDIO · 12 / 20 selected Works · © 2026" — index-style metadata everywhere.
  - Two labeled 3D/canvas modes on the homepage: **"Rings"** and **"Spiral"** — a generative hero (project thumbnails orbit in ring/spiral formations; toggleable layouts).
  - Project thumbnails as small floating cards (`small_cover_*.webp`) scattered/orbiting, each linking to a case study.
  - "SCROLL" prompt, "× CLOSEMENU×CLOSE" duplicated close-label (same letter-doubling motif).
  - Extreme minimalism: logo SVG, uppercase micro-labels, near-zero chrome.
- **Replica recipe (Preset `k95-minimal`):** white `#FAFAFA` / ink `#111111` monochrome; *Space Grotesk* (or *Archivo*) uppercase micro-labels + massive H1; **letter-duplication hover** (split heading/nav text into per-char spans, render char twice stacked, `translateY(-100%)` roll on hover — GSAP stagger 0.02s); **orbiting thumbnail ring** for project cards (project images positioned on a circle, slow `rotate` transform, "Rings/Spiral" toggle switches polar layout formula); dot cursor (8px dot + 32px trailing ring, `mix-blend-mode: difference`); hairline 1px grid rules; corner meta captions (`12 / 20`, `© 2026`, "SCROLL").

### 3. Julien Calot — juliencalot.com
- **Platform:** **Webflow** (confirmed via `meta-generator: Webflow`) + Webflow Ecommerce (Panier/cart).
- **Signature components observed:**
  - **Percentage preloader**: "JCALOT — 000%" counter that counts up on load.
  - Dual gallery filters: **"BY SERIES" / "BY COLORS"** — an artwork-first grid re-sortable by series (Méditants, Anima, Seascapes, Daydreaming, Passengers, Moonlight…) or by dominant color.
  - Dense **masonry artwork grid** (100+ pieces) with title-duplication links ("La guêpe La guêpe" — hover text-swap duplication again).
  - Series cards carry period metadata ("2024–2025 · Landscape of the mind I · 07 Pieces") — editorial numbering.
  - Cart drawer ("Panier"), minimal chrome, art dominates; uppercase mixed with small caps.
- **Replica recipe (Preset `calot-art`):** gallery-white `#F4F1EC` with ink `#1A1A1A` and one vivid accent rotating per card (extracted from image); *Fraunces* italic display + neutral grotesk body; **count-up preloader** (0→100% with `requestAnimationFrame`, wipes upward on complete); project grid becomes **masonry with filter pills** ("By series / By colors" → maps to our project tags); hover: image scales 1.06 inside fixed frame + title swap-roll; grain overlay (SVG turbulence, 4% opacity); numbered series metadata on cards ("07 Pieces" style counters).

### 4. Depo Luxe — depoluxe.xyz
- **Platform:** WordPress (custom theme, CloudFront CDN) + Vimeo progressive streams; inline base64 mp4 used as hover-preview primer.
- **Signature components observed:**
  - **Full-bleed video wall**: featured grid where every tile is a muted looping film clip (Vimeo 1080p progressive), poster→video swap on hover/inview.
  - **Roman-numeral index list** of works: "I 'Número France' Gus and Lo · II 'Romeo' Turbo Anitta · III 'Blue Voyage'…" — repeated/duplicated I–XVI for loop scrolling (marquee-style vertical index).
  - One-line brand manifesto as the H1: "A strategic and cinematic approach to contemporary luxury."
  - Minimal nav (Featured / Archive / Talent / Approach / Contact) + "Close" overlay menu; heavy black, cinematic.
- **Replica recipe (Preset `depo-luxe`):** near-black `#0B0B0B`, bone-white text `#E8E4DC`, no accent color — luxury restraint; *Cinzel* (or high-contrast serif) for numerals/titles, uppercase tracking +0.15em; projects render as a **cinematic index**: roman numerals (I, II, III… auto-generated) + title + client, hover reveals a fixed-position media preview following the cursor; hero = single manifesto line, oversized serif, `clip-path` line-reveal on load; slow Lenis scroll (lerp 0.06) for the "cinematic" glide; sharp square corners, zero border-radius.

### 5. MONOLOG — bymonolog.com
- **Platform:** **Webflow** (cdn.prod.website-files.com), BunnyCDN WebM loops, Cal.com booking.
- **Signature components observed:**
  - **"Hello world" preloader** and an editorial about-modal with "esc esc" close hint.
  - Long-form **manifesto headline** hero (multi-line statement H1), stat counters ("15+ founder-led brands", "30+ awards"), progress fraction "0# / 03".
  - Rotating word list "listen / create / obsess / inspire"; success-story cards with WebM video loops and stat callouts ("$2M+ in new projects…"); marquee client-logo wall.
  - Japanese-bracket flourishes: "『Refuse to be underestimated.』"; "(REAL CLIENT STORIES)", "(SOCIALS)" parenthetical micro-labels; live clock "Hanoi City ##DD, MM DD, YY (GMT +07)".
  - Kinetic CTA: "Let's build / an experience / That moves / → / People" — staggered line-by-line reveal.
- **Replica recipe (Preset `monolog-editorial`):** warm paper `#EFEAE3`, espresso ink `#221E1A`, single warm accent `#C96F4A`; *Instrument Serif* / *Cormorant Garamond* display with grotesk body; **word-rotator** component (listen/create/obsess/inspire → our skill verbs) with `y: 100% → 0` masked line swaps; long manifesto H1 with per-line `clip-path` stagger; parenthetical micro-labels "(ABOUT)", "(WORK)" before each section; animated stat counters on scroll-inview; live local-time clock in footer; corner-bracket 『』 accents on blockquotes.

### 6. Hildén & Kaira — hildenkaira.fi
- **Platform:** **Webflow** + BunnyCDN video, GDPR multi-zone consent UI, "Design by Dylan".
- **Signature components observed:**
  - **Provocative statement hero**: "If you can't reach a million people with 0€ ad spend, your branding sucks." + guarantee subline — confrontational copy as the design.
  - **Letter-by-letter image logo**: brand name assembled from 12 individual letter images (h·i·l·d·é·n·&·k·a·i·r·a) — enables per-letter entrance stagger.
  - Case-study rows: brand statement + 3 phone-format video cards each with view/like counters ("765k+ views") + aggregate stat block ("Organic views 2,033,086") + "Show case" link.
  - Metallic 3D emoji set (heart, fire, wink, pigeon, mic) used as floating decorations; numbered service cards ("0 1", "0 2", "0 3"); testimonial slider "1 / 5".
- **Replica recipe (Preset `hilden-craft`):** off-white `#F3F2EE`, deep forest `#1E2B23`, slate `#5C6660`; *Outfit* / *DM Sans* with tight leading; hero = **oversized provocative statement** (we'll template the user's own bold claim from `hero.headline`) with word-stagger entrance; brand name renders as **per-letter spans with independent spring entrances** (replicating the letter-image assembly); project cards adopt the **stat-block pattern** (big odometer numbers + label, count-up on inview); numbered "0 1 / 0 2 / 0 3" service/skill cards with expanding hover; floating micro-decoration emoji/badge slots.

### 7. Radian — rideradian.com
- **Platform:** **Webflow** by UNCOMMON.nl, BunnyCDN cinematic hero video, viewport locked (`user-scalable=0`).
- **Signature components observed:**
  - **Numbered scroll navigation**: "01 / 09 · Overview" fixed progress indicator; side dot-nav of sections (Overview → Performance → Battery → Storage → Design → App → Maintenance → Specs → Pre-order) — a 9-chapter scroll story.
  - **Full-screen cinematic video hero** with centered claim "A new era of enduro starts here." + dual CTAs + "Scroll" prompt.
  - **Feature headline stack**: "Swap in 30 seconds / Power, instantly / Smart storage / Ride in silence / Less maintenance / Tune your ride / Confident by design" — scroll-driven list where the active line highlights and its image swaps.
  - **Multi-layer forest parallax** ("Be the first on the line": background forest + motor + left trees + right trees as separate layers moving at different scroll speeds).
  - GPS-coordinate micro-labels ("54.3439°N 7.6321°W"), frame counters "01/50", spec-sheet aesthetic; electric yellow on black.
- **Replica recipe (Preset `radian-energy`):** pitch black `#0A0A0A` + electric yellow `#F3D016` + white; *Anton*/condensed uppercase display, mono micro-labels; **chapter scroll-nav**: fixed "01 / 05 · Hero" counter + dot rail bound to section IntersectionObserver; **scroll-driven feature list** (skills render as giant lines, active line at viewport center gets full opacity + accent, others 20%); **3-layer parallax band** in About (GSAP ScrollTrigger, speeds 0.2/0.5/0.9); coordinate/mono meta labels next to section titles; diagonal hazard-stripe divider option.

### 8–10. Three premium originals (kept, now specified)
8. **Avant-Garde** — violet `#5B3DF5` / deep navy `#101226`, *Syne* display, overlapping rotated cards (−3°/+2°), oversized outlined text (`-webkit-text-stroke`), hover fill-in.
9. **Retro Cyber** — acid `#B4FF39` on `#050505`, *JetBrains Mono*, scanline overlay, blinking block cursor after headings, terminal-style typing entrance, visible pixel grid.
10. **Metropolitan Luxe** — navy `#0E1B2C` + gold `#C9A961`, *Playfair Display* with hairline dividers, small-caps nav, slow luxurious fades (0.9s ease), gold underline draw-on-hover.

---

## Part B — Proposed Changes

### B1. Preset engine
#### [MODIFY] `src/theme/presets.ts`
Extend the preset shape beyond colors/typography to a **full design-language token set**:
```ts
interface Preset {
  colors: { bg, surface, text, accent, muted };
  typography: { headingFont, fontFamily, headingWeight, bodyWeight, headingTransform, letterSpacing };
  radius: string;                    // 999px (joy-rush) → 0px (depo-luxe)
  cursor: 'default' | 'dot' | 'ring' | 'blend';
  modifiers: Modifier[];             // declarative feature flags, see B2
  motion: { lerp: number; duration: number; ease: string; stagger: number };
}
type Modifier =
  | 'marquee-top' | 'marquee-badges'        // joy-rush
  | 'letter-roll-nav' | 'orbit-gallery'     // k95
  | 'preloader-counter' | 'grain' | 'masonry-filters'  // calot
  | 'roman-index' | 'cursor-media-preview'  // depo-luxe
  | 'word-rotator' | 'micro-labels' | 'stat-counters' | 'live-clock' // monolog
  | 'letter-stagger-brand' | 'numbered-cards'           // hilden
  | 'chapter-nav' | 'feature-scroll-list' | 'parallax-band' | 'mono-meta' // radian
  | 'grid-lines' | 'scanlines' | 'text-stroke' | 'diagonal-divider';
```
All 10 presets defined with the exact tokens from Part A.

#### [NEW] `src/theme/modifiers/` (one component per modifier)
`Marquee.tsx`, `LetterRoll.tsx`, `OrbitGallery.tsx`, `PreloaderCounter.tsx`, `Grain.tsx`, `RomanIndex.tsx`, `CursorPreview.tsx`, `WordRotator.tsx`, `StatCounter.tsx`, `ChapterNav.tsx`, `FeatureScrollList.tsx`, `ParallaxBand.tsx`, `CustomCursor.tsx`, `Scanlines.tsx`. Each is self-contained (GSAP/Framer Motion), reads theme tokens, and mounts only when its flag is active in the current preset.

#### [MODIFY] `src/pages/HomePage.jsx`
- Load `theme.fontFamily` / `theme.headingFont` on demand via the existing `ensureFont()` loader.
- Mount active modifier components around/inside sections based on `theme.modifiers`.
- Render `settings.custom_elements` per section (B3).

#### [MODIFY] `src/theme/ThemeProvider.tsx` + `src/theme/store.ts`
- Add `radius`, `cursor`, `modifiers`, `motion` to theme state, CSS-variable emission (`--radius`, `--motion-ease`…), and `SYNC_THEME` payload so the Studio preview updates live.
- Lenis lerp driven by `motion.lerp` (0.06 depo-luxe → 0.12 joy-rush).

### B2. Studio integration
#### [MODIFY] `src/pages/admin/Studio.tsx`
- Preset grid becomes 10 visual swatch cards (mini palette + font sample per preset).
- New "Effects" group: toggles for the active preset's modifiers (turn marquee/cursor/grain on/off individually) and cursor style picker.

### B3. Custom Element Engine ("Create New Element")
#### Data model — stored at `site_settings.custom_elements`
```ts
interface CustomElement {
  id: string;                // `ce-${nanoid}`
  section: 'hero' | 'about' | 'toolkit' | 'experience' | 'footer' | 'custom';
  kind: 'heading' | 'text' | 'button' | 'link' | 'image';
  content: string;           // text or image URL
  href?: string;             // button/link target
  order: number;
  styles?: Record<string, string>; // reuses the existing override format
}
```
#### [MODIFY] `src/editor/editorStore.ts`
- `customElements: CustomElement[]` (history-tracked, persisted like overrides/content).
- Actions: `addCustomElement(section, kind, content, href?)`, `updateCustomElement(id, patch)`, `deleteCustomElement(id)`, `reorderCustomElement(id, dir)`. All routed through the existing `commit()` snapshotting → undo/redo works for element creation/deletion automatically.
- Publish: upsert `custom_elements` alongside `editorOverrides`.

#### [MODIFY] `src/pages/admin/canvas/Inspector.tsx`
- New **"Add Element"** panel (visible when nothing is selected, plus a "+" toolbar entry): pick kind (Heading/Text/Button/Link/Image with icons), target section dropdown, initial content field, href field for button/link → `addCustomElement`, then auto-`requestSelect(newId)`.
- When a custom element is selected: Content tab gains **href editor** and **Delete element** / **Move up/down** controls. All 5 style tabs work unchanged because custom elements carry `data-edit-id` like native ones.

#### [MODIFY] `src/pages/admin/Canvas.tsx`
- Toolbar "+ Add" button opens the Add Element panel; custom elements included in `PREVIEW_OVERRIDE` payload; catalog search (Ctrl+K) merges custom elements dynamically.

#### [MODIFY] `src/editor/CanvasRuntime.tsx`
- No structural change needed for hover/select (attribute-driven), plus: `image` kind gets double-click → URL prompt path routed through `EDITOR_CONTENT`; guard so custom buttons/links don't navigate in edit mode (already covered by click capture).

#### [NEW] `src/components/CustomElements.jsx`
`<CustomElements section="hero" />` — reads merged `settings.custom_elements` (live draft in preview, published on the public site), sorts by `order`, renders each kind with theme-aware default styling and full edit attributes (`data-edit-id={el.id}`, `data-edit-kind`, `data-edit-path={`custom_elements.${el.id}.content`}`).

#### Section integration — add `<CustomElements/>` mount points in:
- `src/components/Hero.jsx` (after CTAs)
- `src/components/About.jsx` (after narrative)
- `src/components/Skills.jsx` (after grid)
- `src/components/Timeline.jsx` (after entries)
- Footer + optional `CustomSection.jsx` (renders only when elements target `custom`)

---

## Part C — Verification Plan
1. Cycle all 10 presets in Theme Studio → colors, fonts (loaded on demand), radius, cursor, and every modifier (marquees, orbit gallery, preloader counter, roman index, word rotator, chapter nav, parallax band, scanlines) mount/unmount live in the preview with no console errors.
2. Per-preset spot checks against Part A recipes: K95 letter-roll on nav hover; Depo Luxe roman-numeral project index + cursor media preview; Radian chapter counter advances "01/05 → 05/05" while scrolling; Monolog word-rotator cycles 4 verbs; Joy Rush top marquee loops seamlessly (no jump at the seam); Calot preloader counts 0→100%.
3. Add a Button element to Hero via Add Element panel → appears instantly in canvas, selectable, inline-editable, href editable, styleable in all tabs, reorderable, deletable; undo/redo covers every step.
4. Publish → reload public site: element and preset render identically for visitors (reads from Supabase, `StyleOverrides` + `custom_elements` applied).
5. Device modes (desktop/laptop/tablet/mobile/custom) — marquees, parallax and orbit layouts degrade gracefully at 390px; `prefers-reduced-motion` disables marquee/parallax/rotators.
6. Regression: existing catalog elements, theme publish, and settings-page live preview still function.

---

## Implemented — 2026-07-09 (code shipped, not just planned)

### 1. Theme adaptability & collision fixes
- **Hero / navbar collision fixed** — `Hero.jsx` top padding raised (`pt-36 sm:pt-40`) so oversized preset headlines (Anton 72px, Cinzel, Playfair) no longer clip under the fixed navbar.
- **Dark-preset contrast fixed** — every `bg-ink text-white` pairing (primary CTA, navbar CTA, story-chip numbers, footer, scroll-top button, custom-element buttons) now uses `text-bg`, so buttons stay readable on Radian/Depo Luxe/Calot/Cyber/Metropolitan dark themes (no more white-on-white pills).
- **Hero radial wash** no longer hard-codes light blue `#eef3ff`; it derives from `--color-accent` via `color-mix`, adapting to all 10 presets.
- Navbar logo color now follows `text-ink` instead of a hard-coded hex.

### 2. Font families collected per website (`presets.ts` → `SITE_FONTS`)
Studio's Body/Heading font dropdowns are now grouped by source site: drinkjoyrush.com (Fredoka, Sora, Baloo 2), k95.it (Space Mono, Archivo), juliencalot.com (Anton, Fraunces, Space Grotesk), depoluxe.xyz (Cinzel, Cormorant Garamond, EB Garamond), bymonolog.com (Instrument Serif, Cormorant Garamond, Archivo), hildenkaira.fi (Playfair Display, Outfit, DM Sans), rideradian.com (Anton, Plus Jakarta Sans, JetBrains Mono), plus Awwwards extras (Syne, Unbounded, Inter…). Each option shows its role (heading/body).

### 3. Studio "Effects" section (`Studio.tsx`)
New sidebar group with: **Animation package** select (all 11 site effect packages, labeled by website — marquee/letter-roll/preloader/roman index/word rotator/letter-stagger/chapter nav/scanlines), **Custom cursor** select (dot — k95, bubble — Joy Rush, invert — Calot, crosshair — Depo Luxe), and **Corner radius** field. All wired through `updateLayout` → live in the preview iframe.

### 4. New site replicas added (`Modifiers.jsx`, `HomePage.jsx`, `Hero.jsx`)
- **LetterStagger** (hildenkaira.fi) — hero headline characters spring in one by one, like H&K's letter-image logo assembly. Active on the `hildenkaira` package.
- **Roman-numeral work index** (depoluxe.xyz) — project cards get I / II / III … numerals with a hairline rule on the `depoluxe` package (`toRoman` helper).
- **Giant footer wordmark** (bymonolog.com) — footer name scales to `clamp(3rem,12vw,10rem)` on the `monolog` package.
- **Scanlines overlay** for the Retro Cyber package.
- Already present and kept: TopMarquee (Joy Rush), 000% PreloaderCounter (Calot), GrainOverlay, RadianScrollNav (01/06 chapter nav), LetterRoll nav hover (K95), WordRotator (Monolog), custom cursors.

### 5. Element "Effects" tab is now real (`Inspector.tsx` + `editorStore.ts`)
`overridesToCss` now supports `hover:`-prefixed properties (compiled to `:hover` rules) and auto-injects `EFFECT_KEYFRAMES`. The Effects tab offers:

- **Loop animation** (labeled by source site): Float / Bounce (drinkjoyrush.com), Spin slow (k95.it), Pulse (rideradian.com), Glitch (Retro Cyber), Wiggle (juliencalot.com).
- **Hover effects**: scale %, lift px, text color, background, and glow presets (Neon — rideradian, Sticker offset — drinkjoyrush, Hairline ring — k95); a smooth transition is applied automatically.
- **Filters & blend**: blur, mix-blend-mode, transition speed.

These work identically in the live canvas and on the published site (both render through `overridesToCss`).

---

## IP note
Presets replicate each reference site's **mechanics and aesthetic direction** (layout systems, animation choreography, typography pairing in equivalent Google Fonts, palettes). They must not embed the sites' photography, video, logos, copy, or exported code. All ten presets ship with your own content from `resumeData`/Supabase.

**Research sources:** drinkjoyrush.com (Shopify), k95.it/en (custom/R2), juliencalot.com (Webflow + Ecommerce), depoluxe.xyz (WordPress + Vimeo), bymonolog.com (Webflow), hildenkaira.fi (Webflow), rideradian.com (Webflow by UNCOMMON) — all fetched 2026-07-09.
