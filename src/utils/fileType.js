// Shared helpers for detecting the kind of an uploaded file from its URL or name.
// Used by the admin upload widget (ImageUpload) and the public certificate cards.

const EXT_RE = /\.([a-z0-9]+)(?:\?|#|$)/i;

const KIND_BY_EXT = {
  // images
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image',
  svg: 'image', avif: 'image', bmp: 'image', heic: 'image', heif: 'image',
  // video
  mp4: 'video', webm: 'video', ogg: 'video', mov: 'video', m4v: 'video',
  // documents
  pdf: 'pdf',
  doc: 'doc', docx: 'doc', rtf: 'doc', odt: 'doc', pages: 'doc',
  xls: 'sheet', xlsx: 'sheet', csv: 'sheet', ods: 'sheet', numbers: 'sheet',
  ppt: 'slides', pptx: 'slides', odp: 'slides', key: 'slides',
  // text / code
  txt: 'text', md: 'text', json: 'text', log: 'text',
  // archives
  zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive', gz: 'archive',
};

/** Extract a lowercase file extension from a URL or filename. */
export function getExtension(urlOrName = '') {
  const match = String(urlOrName).match(EXT_RE);
  return match ? match[1].toLowerCase() : '';
}

/**
 * Classify a file into a coarse "kind" used to pick the right preview:
 * image | video | pdf | doc | sheet | slides | text | archive | other
 */
export function getFileKind(urlOrName = '') {
  return KIND_BY_EXT[getExtension(urlOrName)] || 'other';
}

export const isImage = (u) => getFileKind(u) === 'image';
export const isVideo = (u) => getFileKind(u) === 'video';
export const isPdf = (u) => getFileKind(u) === 'pdf';
/** Office-style documents that browsers can't render inline (Word/Excel/PowerPoint). */
export const isOfficeDoc = (u) => ['doc', 'sheet', 'slides'].includes(getFileKind(u));

/** Human-readable label for a file kind, e.g. "PDF document", "Word document". */
export function getKindLabel(urlOrName = '') {
  const ext = getExtension(urlOrName);
  switch (getFileKind(urlOrName)) {
    case 'image': return 'Image';
    case 'video': return 'Video';
    case 'pdf': return 'PDF document';
    case 'doc': return 'Word document';
    case 'sheet': return 'Spreadsheet';
    case 'slides': return 'Presentation';
    case 'text': return 'Text document';
    case 'archive': return 'Archive';
    default: return ext ? `${ext.toUpperCase()} file` : 'File';
  }
}

/** Last path segment of a URL, decoded, for showing the original-ish filename. */
export function getFileName(url = '') {
  try {
    const clean = String(url).split(/[?#]/)[0];
    const seg = clean.substring(clean.lastIndexOf('/') + 1);
    return decodeURIComponent(seg) || 'file';
  } catch {
    return 'file';
  }
}

/**
 * URL that renders an Office document inline via Microsoft's public viewer.
 * Requires the source file to be publicly reachable (Supabase public URLs are).
 */
export function officeViewerUrl(url) {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
}
