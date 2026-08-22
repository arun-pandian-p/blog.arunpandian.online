// 100+ Google Fonts available in the Visual Editor.
// Fonts are loaded on demand (only when actually applied) via <link> injection,
// so there is no upfront cost and no npm dependency.

export type FontCat = 'Sans' | 'Serif' | 'Display' | 'Handwriting' | 'Mono';

export interface FontDef {
  name: string;      // exact Google Fonts family name
  cat: FontCat;
  stack: string;     // CSS font-family value stored on the element
}

const FALLBACK: Record<FontCat, string> = {
  Sans: 'sans-serif',
  Serif: 'serif',
  Display: 'sans-serif',
  Handwriting: 'cursive',
  Mono: 'monospace',
};

function def(name: string, cat: FontCat): FontDef {
  return { name, cat, stack: `"${name}", ${FALLBACK[cat]}` };
}

const SANS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway', 'Nunito',
  'Nunito Sans', 'Work Sans', 'Rubik', 'Mulish', 'Manrope', 'DM Sans', 'Space Grotesk',
  'Archivo', 'Outfit', 'Sora', 'Jost', 'Karla', 'Barlow', 'Josefin Sans', 'Quicksand',
  'Cabin', 'Titillium Web', 'Fira Sans', 'PT Sans', 'Source Sans 3', 'Noto Sans', 'Heebo',
  'Assistant', 'Red Hat Display', 'Public Sans', 'Figtree', 'Plus Jakarta Sans', 'Lexend',
  'Urbanist', 'Epilogue', 'Kanit', 'Oxygen',
].map((n) => def(n, 'Sans'));

const SERIF = [
  'Playfair Display', 'Merriweather', 'Lora', 'PT Serif', 'Noto Serif', 'Roboto Slab',
  'Bitter', 'Crimson Text', 'Cormorant Garamond', 'EB Garamond', 'Libre Baskerville',
  'Source Serif 4', 'Zilla Slab', 'Domine', 'Frank Ruhl Libre', 'Spectral', 'Cardo',
  'Arvo', 'Bree Serif', 'Vollkorn', 'Alegreya', 'Newsreader', 'Fraunces', 'DM Serif Display',
  'Josefin Slab',
].map((n) => def(n, 'Serif'));

const DISPLAY = [
  'Bebas Neue', 'Anton', 'Righteous', 'Comfortaa', 'Pacifico', 'Lobster', 'Abril Fatface',
  'Fjalla One', 'Alfa Slab One', 'Bungee', 'Staatliches', 'Teko', 'Chakra Petch', 'Orbitron',
  'Russo One', 'Bangers', 'Fredoka', 'Baloo 2', 'Secular One', 'Rowdies', 'Paytone One',
  'Passion One',
].map((n) => def(n, 'Display'));

const HANDWRITING = [
  'Dancing Script', 'Caveat', 'Satisfy', 'Great Vibes', 'Sacramento', 'Shadows Into Light',
  'Indie Flower', 'Permanent Marker', 'Kalam', 'Patrick Hand', 'Amatic SC', 'Courgette',
].map((n) => def(n, 'Handwriting'));

const MONO = [
  'Fira Code', 'JetBrains Mono', 'Source Code Pro', 'IBM Plex Mono', 'Space Mono',
  'Roboto Mono', 'Inconsolata', 'Ubuntu Mono', 'Overpass Mono', 'DM Mono', 'Red Hat Mono',
].map((n) => def(n, 'Mono'));

export const FONTS: FontDef[] = [...SANS, ...SERIF, ...DISPLAY, ...HANDWRITING, ...MONO];

export const FONT_CATEGORIES: FontCat[] = ['Sans', 'Serif', 'Display', 'Handwriting', 'Mono'];

// Fonts that reliably ship multiple weights → request 400/700; the rest are
// single-weight display faces where requesting extra weights would 400-error.
const MULTIWEIGHT = new Set(
  [...SANS, ...SERIF, ...MONO].map((f) => f.name.toLowerCase())
);

const SYSTEM = new Set([
  'sans-serif', 'serif', 'monospace', 'cursive', 'system-ui', 'ui-sans-serif',
  'ui-serif', 'ui-monospace', 'inherit', 'initial',
]);

function firstFamily(value: string): string {
  return (value || '').split(',')[0].replace(/["']/g, '').trim();
}

/** Ensure a Google font is loaded in the current document (idempotent). */
export function ensureFont(value: string) {
  if (typeof document === 'undefined') return;
  const family = firstFamily(value);
  if (!family || SYSTEM.has(family.toLowerCase())) return;

  const id = 'gf-' + family.replace(/\s+/g, '-').toLowerCase();
  if (document.getElementById(id)) return;

  const param = family.replace(/\s+/g, '+');
  const weights = MULTIWEIGHT.has(family.toLowerCase()) ? ':wght@400;500;600;700' : '';
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${param}${weights}&display=swap`;
  document.head.appendChild(link);
}

/** Scan a CSS string for font-family declarations and load each font. */
export function ensureFontsFromCss(css: string) {
  if (!css) return;
  const re = /font-family:\s*([^;!}]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) ensureFont(m[1]);
}
