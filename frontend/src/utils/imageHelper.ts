export const DEFAULT_COVER_IMAGE = '/assets/blogs/default_cover.svg';

export function resolveImageUrl(url?: string | null, fallback = DEFAULT_COVER_IMAGE): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallback;
  }
  const clean = url.trim();

  // If already absolute or data URL
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:') || clean.startsWith('blob:')) {
    return clean;
  }

  // If starts with /assets/
  if (clean.startsWith('/assets/')) {
    return clean;
  }

  // If starts with assets/
  if (clean.startsWith('assets/')) {
    return `/${clean}`;
  }

  return clean;
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, fallback = DEFAULT_COVER_IMAGE) {
  const target = e.currentTarget;
  if (target.dataset.hasFailedFallback === 'true') {
    target.style.display = 'none';
    return;
  }
  target.dataset.hasFailedFallback = 'true';
  target.src = fallback;
}

