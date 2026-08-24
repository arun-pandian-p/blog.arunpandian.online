import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Sigma, BarChart3, Wrench, X, ExternalLink,
  FileText, FileSpreadsheet, Presentation, File as FileIcon,
} from 'lucide-react';
import { useContent } from '../context/ContentProvider';
import { getFileKind, isPdf, isImage, isOfficeDoc, officeViewerUrl } from '../utils/fileType';

// Icon shown on a certificate card when the attachment isn't a previewable image.
const CERT_FILE_ICON = {
  pdf: FileText, doc: FileText, sheet: FileSpreadsheet,
  slides: Presentation, text: FileText,
};

const ease = [0.16, 1, 0.3, 1];

// Map icon name strings from the database to actual components
const iconMap = { Database, Sigma, BarChart3, Wrench };

const Skills = () => {
  const { settings } = useContent();
  const skills = settings.skills;

  const categories = skills.categories || [];
  // Certifications live under their own `certifications` settings key (rich
  // objects with issuer/date/image). Fall back to the legacy string list in
  // `skills.certifications`, normalising strings to objects so cards render.
  const rawCerts = settings.certifications?.certifications ?? skills.certifications ?? [];
  const certifications = rawCerts.map((c) => (typeof c === 'string' ? { name: c } : c));
  const ticker = skills.ticker || [];

  const hiddenFields = skills.hiddenFields || [];
  const isVisible = (field) => !hiddenFields.includes(field);

  // Certificate lightbox
  const [activeCert, setActiveCert] = useState(null);
  const media = activeCert ? (activeCert.image || activeCert.credentialUrl) : null;

  useEffect(() => {
    if (!activeCert) return;
    const onKey = (e) => { if (e.key === 'Escape') setActiveCert(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeCert]);

  return (
    <section id="skills" className="py-16 sm:py-24 lg:py-32 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {isVisible('sectionHeaders') && (
          <div className="mb-8 sm:mb-14">
            <span data-edit-id="skills.sectionLabel" data-edit-name="Toolkit · Eyebrow" data-edit-kind="text" data-edit-path="skills.sectionLabel" className="text-xs font-mono tracking-[0.25em] text-accent uppercase">{skills.sectionLabel}</span>
            <h2 data-edit-id="skills.sectionTitle" data-edit-name="Toolkit · Title" data-edit-kind="heading" data-edit-path="skills.sectionTitle" className="mt-2.5 sm:mt-3 font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl text-ink tracking-tight">{skills.sectionTitle}</h2>
          </div>
        )}

        {isVisible('categories') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {categories.map((cat, i) => {
              const Icon = iconMap[cat.icon] || Database;
              return (
                <motion.div
                  key={cat.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, ease, delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                  className="group rounded-2xl border border-line bg-surface p-5 sm:p-6 hover:shadow-[0_20px_50px_-25px_rgba(9,9,11,0.3)] hover:border-ink/20 transition-all duration-300"
                >
                  <div className="h-10 w-10 sm:h-11 sm:w-11 grid place-items-center rounded-xl bg-muted text-ink group-hover:bg-ink group-hover:text-white transition-colors">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-4 sm:mt-5 font-display font-bold text-base sm:text-lg text-ink">{cat.title}</h3>
                  <ul className="mt-3.5 sm:mt-4 space-y-2 sm:space-y-2.5">
                    {(cat.items || []).map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs sm:text-sm text-ink-soft">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-accent shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Certifications - Now rendering as complex objects with images */}
        {isVisible('certifications') && certifications.length > 0 && (
        <div className="mt-10 sm:mt-12">
          <div className="flex items-center justify-between mb-3.5 sm:mb-4">
            <span className="text-xs font-mono tracking-[0.25em] text-accent uppercase">Certifications &amp; Credentials</span>
            {certifications.length > 3 && (
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-ink-soft/60 select-none"
              >
                <span>{certifications.length - 3} more</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </motion.div>
            )}
          </div>

          {/* First 3 — always in a 3-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {certifications.slice(0, 3).map((c, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveCert(c)}
                className="group flex w-full items-start gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl border border-line bg-surface text-left hover:shadow-lg hover:border-ink/20 transition-all duration-300 cursor-pointer min-h-[44px]"
              >
                {c.image && isImage(c.image) ? (
                  <img loading="lazy" decoding="async" src={c.image} alt={c.name} className="h-11 w-11 sm:h-12 sm:w-12 rounded-lg object-cover shrink-0" />
                ) : c.image ? (
                  (() => {
                    const FileKindIcon = CERT_FILE_ICON[getFileKind(c.image)] || FileIcon;
                    return (
                      <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-lg bg-accent-soft flex items-center justify-center text-accent shrink-0">
                        <FileKindIcon size={20} strokeWidth={1.75} />
                      </div>
                    );
                  })()
                ) : (
                  <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-lg bg-muted flex items-center justify-center text-ink-soft shrink-0 font-bold text-base sm:text-lg">
                    {c.name ? c.name.substring(0, 1) : 'C'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-ink text-xs sm:text-base group-hover:text-accent transition-colors line-clamp-2">{c.name}</h4>
                  <p className="text-[11px] sm:text-xs text-ink-soft mt-1">{c.issuer} {c.issueDate && `• ${c.issueDate}`}</p>
                  {c.credentialId && <p className="text-[10px] text-ink-soft mt-0.5 font-mono">ID: {c.credentialId}</p>}
                </div>
              </button>
            ))}
          </div>

          {/* Remaining certs (4+) — horizontal scroll with arrow guide */}
          {certifications.length > 3 && (
            <div className="relative mt-4 sm:mt-5">
              <div className="flex overflow-x-auto gap-3.5 sm:gap-4 pb-3 sm:pb-4 snap-x snap-mandatory hide-scrollbar -mx-4 sm:-mx-8 px-4 sm:px-8">
                {certifications.slice(3).map((c, idx) => (
                  <button
                    key={idx + 3}
                    type="button"
                    onClick={() => setActiveCert(c)}
                    className="group flex w-[82vw] sm:w-[52vw] md:w-[36vw] lg:w-[28vw] shrink-0 snap-center items-start gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl border border-line bg-surface text-left hover:shadow-lg hover:border-ink/20 transition-all duration-300 cursor-pointer min-h-[44px]"
                  >
                    {c.image && isImage(c.image) ? (
                      <img loading="lazy" decoding="async" src={c.image} alt={c.name} className="h-11 w-11 sm:h-12 sm:w-12 rounded-lg object-cover shrink-0" />
                    ) : c.image ? (
                      (() => {
                        const FileKindIcon = CERT_FILE_ICON[getFileKind(c.image)] || FileIcon;
                        return (
                          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-lg bg-accent-soft flex items-center justify-center text-accent shrink-0">
                            <FileKindIcon size={20} strokeWidth={1.75} />
                          </div>
                        );
                      })()
                    ) : (
                      <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-lg bg-muted flex items-center justify-center text-ink-soft shrink-0 font-bold text-base sm:text-lg">
                        {c.name ? c.name.substring(0, 1) : 'C'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-ink text-xs sm:text-base group-hover:text-accent transition-colors line-clamp-2">{c.name}</h4>
                      <p className="text-[11px] sm:text-xs text-ink-soft mt-1">{c.issuer} {c.issueDate && `• ${c.issueDate}`}</p>
                      {c.credentialId && <p className="text-[10px] text-ink-soft mt-0.5 font-mono">ID: {c.credentialId}</p>}
                    </div>
                  </button>
                ))}
              </div>
              {/* Animated right-arrow scroll guide — fades after scroll */}
              <motion.div
                initial={{ opacity: 1 }}
                whileInView={{ opacity: 0 }}
                viewport={{ once: true, amount: 0.9 }}
                transition={{ delay: 2, duration: 0.6 }}
                className="pointer-events-none absolute right-0 top-0 bottom-3 sm:bottom-4 w-16 sm:w-20 flex items-center justify-end pr-2"
                style={{ background: 'linear-gradient(to right, transparent, var(--color-background) 85%)' }}
              >
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
                  className="text-accent"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </motion.div>
              </motion.div>
            </div>
          )}
        </div>
        )}

        {/* Dynamic Custom Elements in Skills */}
        {settings?.custom_elements && Object.values(settings.custom_elements)
          .filter((e) => e.section === 'skills')
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((el) => {
            const commonProps = {
              key: el.id,
              'data-edit-id': el.id,
              'data-edit-name': el.name,
              'data-edit-kind': el.kind,
              'data-edit-path': el.path,
              className: `custom-element custom-element-${el.kind} my-4 transition-all duration-300 inline-block w-full`,
            };
            if (el.kind === 'heading') return <h3 {...commonProps} className={`${commonProps.className} font-display font-bold text-xl sm:text-2xl text-ink`}>{el.value}</h3>;
            if (el.kind === 'text') return <p {...commonProps} className={`${commonProps.className} text-sm sm:text-base text-ink-soft`}>{el.value}</p>;
            if (el.kind === 'button') return <div key={el.id} className="my-3"><a href={el.href || '#'} {...commonProps} className="custom-element-button inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-ink text-white font-semibold hover:bg-accent text-xs sm:text-sm">{el.value}</a></div>;
            if (el.kind === 'link') return <div key={el.id} className="my-3"><a href={el.href || '#'} {...commonProps} className="text-xs sm:text-sm font-semibold text-accent hover:underline">{el.value}</a></div>;
            if (el.kind === 'image') return <img loading="lazy" key={el.id} src={el.value} alt={el.name} {...commonProps} className={`${commonProps.className} max-w-full h-auto rounded-lg border border-line`} />;
            return null;
          })}
      </div>


      {/* Marquee ticker */}
      {isVisible('ticker') && ticker.length > 0 && settings.theme?.layout?.scrollStyle !== 'none' && (
        <div className="mt-14 sm:mt-20 border-y border-line bg-surface/50 backdrop-blur py-2.5 sm:py-3 overflow-hidden w-full [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className={settings.theme?.layout?.scrollStyle === 'vertical' ? "flex flex-col h-20 animate-marquee-vertical" : "flex w-max animate-marquee"}>
            {[...ticker, ...ticker].map((t, i) => (
              <span key={i} className={`mx-4 sm:mx-8 inline-flex items-center gap-4 sm:gap-8 text-xs sm:text-sm font-mono uppercase tracking-widest text-ink-soft ${settings.theme?.layout?.scrollStyle === 'vertical' ? 'py-1' : ''}`}>
                {t}
                <span className="h-1.5 w-1.5 rounded-full bg-accent/50" />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certificate lightbox — click a card to view the image / PDF */}
      <AnimatePresence>
        {activeCert && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActiveCert(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/70 backdrop-blur-sm p-3 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex w-full max-w-3xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl"
            >
              <div className="flex items-center justify-between gap-3 border-b border-line p-3.5 sm:p-4">
                <div className="min-w-0 flex-1">
                  <h4 className="font-display font-bold text-ink text-sm sm:text-base truncate">{activeCert.name}</h4>
                  <p className="text-[11px] sm:text-xs text-ink-soft truncate">{activeCert.issuer}{activeCert.issueDate && ` • ${activeCert.issueDate}`}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {media && (
                    <a
                      href={media} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-ink-soft hover:text-ink hover:border-ink/30 transition-colors min-h-[36px]"
                    >
                      <ExternalLink size={13} /> Open
                    </a>
                  )}
                  <button
                    type="button" onClick={() => setActiveCert(null)} aria-label="Close modal"
                    className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft hover:bg-muted hover:text-ink active:bg-muted transition-colors min-w-[36px] min-h-[36px]"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="grid min-h-[260px] sm:min-h-[300px] flex-1 place-items-center overflow-auto bg-bg p-2">
                {media ? (
                  isImage(media) ? (
                    <img loading="lazy" decoding="async" src={media} alt={activeCert.name} className="max-h-[75vh] w-auto object-contain" />
                  ) : isPdf(media) ? (
                    <iframe src={media} title={activeCert.name} className="h-[70vh] sm:h-[75vh] w-full border-0 bg-white" />
                  ) : isOfficeDoc(media) ? (
                    <iframe
                      src={officeViewerUrl(media)}
                      title={activeCert.name}
                      className="h-[70vh] sm:h-[75vh] w-full border-0 bg-white"
                    />
                  ) : (
                    <div className="grid place-items-center gap-3 sm:gap-4 p-6 sm:p-10 text-center">
                      <FileIcon size={40} strokeWidth={1.5} className="text-accent" />
                      <p className="text-xs sm:text-sm text-ink-soft">
                        This file type can't be previewed in the browser.
                      </p>
                      <a
                        href={media} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:opacity-90 transition-opacity min-h-[44px]"
                      >
                        <ExternalLink size={15} /> Open / Download
                      </a>
                    </div>
                  )
                ) : (
                  <p className="p-8 text-xs sm:text-sm text-ink-soft">No certificate file attached yet.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Skills;
