// Static catalog of editable components — powers the Ctrl+K palette and the
// layers list. `id` must match the data-edit-id set on the element in the site.
export interface CatalogItem {
  id: string;
  name: string;
  group: string;
}

export const CATALOG: CatalogItem[] = [
  { id: 'navbar', name: 'Navbar', group: 'Header' },
  { id: 'nav.brand', name: 'Navbar · Brand name', group: 'Header' },
  { id: 'nav.cta', name: 'Navbar · CTA button', group: 'Header' },

  { id: 'hero.section', name: 'Hero', group: 'Hero' },
  { id: 'hero.badge', name: 'Hero · Badge', group: 'Hero' },
  { id: 'hero.headline', name: 'Hero · Headline', group: 'Hero' },
  { id: 'hero.accent', name: 'Hero · Accent word', group: 'Hero' },
  { id: 'hero.subtitle', name: 'Hero · Subtitle', group: 'Hero' },
  { id: 'hero.primaryCta', name: 'Hero · Primary button', group: 'Hero' },
  { id: 'hero.secondaryCta', name: 'Hero · Secondary button', group: 'Hero' },

  { id: 'about.section', name: 'About', group: 'About' },
  { id: 'about.label', name: 'About · Eyebrow', group: 'About' },
  { id: 'about.title', name: 'About · Title', group: 'About' },
  { id: 'about.narrative', name: 'About · Narrative', group: 'About' },
  { id: 'about.narrativeExtra', name: 'About · Narrative (extra)', group: 'About' },

  { id: 'projects.label', name: 'Projects · Eyebrow', group: 'Projects' },
  { id: 'projects.title', name: 'Projects · Title', group: 'Projects' },
  { id: 'projects.subtitle', name: 'Projects · Subtitle', group: 'Projects' },

  { id: 'blog.label', name: 'Writing · Eyebrow', group: 'Writing' },
  { id: 'blog.title', name: 'Writing · Title', group: 'Writing' },

  { id: 'footer.name', name: 'Footer · Name', group: 'Footer' },
  { id: 'footer.tagline', name: 'Footer · Tagline', group: 'Footer' },
];
