import React from 'react';
import { motion } from 'framer-motion';
import arunProfile from '../assets/arun-profile.jpg';
import SliceReveal from './SliceReveal';
import { useContent } from '../context/ContentProvider';

const ease = [0.16, 1, 0.3, 1];

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.08, ease } }),
};

const About = () => {
  const { settings } = useContent();
  const about = settings.about;

  const stats = about.stats || [];
  const stack = about.stack || [];
  const hiddenFields = about.hiddenFields || [];
  const isVisible = (field) => !hiddenFields.includes(field);

  return (
    <section id="about" data-edit-id="about.section" data-edit-name="About" data-edit-kind="section" className="relative py-24 sm:py-32 bg-surface border-y border-line">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        {isVisible('sectionHeaders') && (
          <div className="mb-12">
            <span data-edit-id="about.label" data-edit-name="About · Eyebrow" data-edit-kind="text" data-edit-path="about.sectionLabel" className="text-xs font-mono tracking-[0.25em] text-accent uppercase">{about.sectionLabel}</span>
            <h2 data-edit-id="about.title" data-edit-name="About · Title" data-edit-kind="heading" data-edit-path="about.sectionTitle" className="mt-3 font-display font-extrabold text-3xl sm:text-5xl text-ink tracking-tight">
              {about.sectionTitle}
            </h2>
          </div>
        )}

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 sm:gap-5">
          {/* Profile portrait — shows Arun clearly, unveiled in slices */}
          {isVisible('narrative') && (
            <SliceReveal className="lg:col-span-2 h-full">
              <motion.div
                custom={0} variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="group relative h-full overflow-hidden rounded-3xl border border-line bg-ink"
              >
                <img loading="lazy"
                  data-edit-id="about.profileImage" data-edit-name="About · Profile image" data-edit-kind="image" data-edit-path="about.profileImage"
                  src={about.profileImage || arunProfile}
                  alt={about.profileCaption || 'Arun Pandian'}
                  className="h-full w-full min-h-[260px] object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-5 pt-14">
                  <p data-edit-id="about.profileCaption" data-edit-name="About · Profile caption" data-edit-kind="text" data-edit-path="about.profileCaption" className="font-display font-bold text-white text-lg leading-tight">{about.profileCaption}</p>
                  <p data-edit-id="about.profileSubCaption" data-edit-name="About · Profile subcaption" data-edit-kind="text" data-edit-path="about.profileSubCaption" className="mt-0.5 text-xs font-mono text-white/70">{about.profileSubCaption}</p>
                </div>
              </motion.div>
            </SliceReveal>
          )}

          {/* Narrative — large card */}
          {isVisible('narrative') && (
            <motion.div
              custom={1} variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="lg:col-span-4 group relative overflow-hidden rounded-3xl border border-line bg-bg p-7 sm:p-9"
            >
              <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-accent/5 blur-2xl transition-opacity duration-700 opacity-0 group-hover:opacity-100" />
              <p data-edit-id="about.narrative" data-edit-name="About · Narrative" data-edit-kind="text" data-edit-path="about.narrative"
                 className="relative text-xl sm:text-2xl text-ink leading-snug font-medium text-balance"
                 dangerouslySetInnerHTML={{ __html: about.narrative }} />
              <p data-edit-id="about.narrativeExtra" data-edit-name="About · Narrative (extra)" data-edit-kind="text" data-edit-path="about.narrativeExtra" className="relative mt-5 text-ink-soft leading-relaxed">{about.narrativeExtra}</p>
              <div className="relative mt-6 flex flex-wrap gap-2">
                {stack.map((t) => (
                  <span key={t} className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-mono text-ink-soft">
                    {t}
                  </span>
                ))}
              </div>

              {/* Dynamic Custom Elements in About */}
              {settings?.custom_elements && Object.values(settings.custom_elements)
                .filter((e) => e.section === 'about')
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
                  if (el.kind === 'heading') return <h4 {...commonProps} className={`${commonProps.className} font-display font-bold text-lg sm:text-xl text-ink`}>{el.value}</h4>;
                  if (el.kind === 'text') return <p {...commonProps} className={`${commonProps.className} text-sm text-ink-soft`}>{el.value}</p>;
                  if (el.kind === 'button') return <div key={el.id} className="my-2"><a href={el.href || '#'} {...commonProps} className="custom-element-button inline-flex items-center justify-center px-4 py-2 rounded-full bg-ink text-white font-semibold hover:bg-accent text-xs">{el.value}</a></div>;
                  if (el.kind === 'link') return <div key={el.id} className="my-2"><a href={el.href || '#'} {...commonProps} className="text-xs font-semibold text-accent hover:underline">{el.value}</a></div>;
                  if (el.kind === 'image') return <img loading="lazy" key={el.id} src={el.value} alt={el.name} {...commonProps} className={`${commonProps.className} max-w-full h-auto rounded-lg border border-line`} />;
                  return null;
                })}
            </motion.div>
          )}

          {/* SQL terminal card */}
          <motion.div
            custom={2} variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }}
            data-edit-id="about.sqlCard" data-edit-name="About · SQL Terminal" data-edit-kind="section"
            className="lg:col-span-2 rounded-3xl border border-ink/80 bg-ink p-5 shadow-[0_30px_60px_-30px_rgba(9,9,11,0.6)]"
          >
            <div className="flex items-center gap-1.5 mb-4">
              <span className="h-3 w-3 rounded-full bg-danger/90" />
              <span className="h-3 w-3 rounded-full bg-amber-400/90" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/90" />
              <span data-edit-id="about.sqlFilename" data-edit-name="About · SQL filename" data-edit-kind="text" data-edit-path="about.sqlFilename" className="ml-2 text-[10px] font-mono text-white/40">{about.sqlFilename || 'whoami.sql'}</span>
            </div>
            <pre data-edit-id="about.sqlQuery" data-edit-name="About · SQL query" data-edit-kind="text" data-edit-path="about.sqlQuery" className="font-mono text-[12.5px] leading-relaxed text-white/90 whitespace-pre-wrap">
<span className="text-indigo-300">SELECT</span> role, focus{'\n'}
<span className="text-indigo-300">FROM</span>   arun_pandian{'\n'}
<span className="text-indigo-300">WHERE</span>  curiosity = <span className="text-emerald-300">TRUE</span>;
            </pre>
            <div className="mt-4 border-t border-white/10 pt-3 font-mono text-[12px] text-white/50">
              <span className="text-accent">→</span> {about.profileCaption} · turns
              <br />&nbsp;&nbsp;messy data into decisions
            </div>
          </motion.div>

          {/* Education */}
          {isVisible('education') && (
            <motion.div
              custom={3} variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }}
              data-edit-id="about.education" data-edit-name="About · Education" data-edit-kind="section"
              className="lg:col-span-2 rounded-3xl border border-line bg-bg p-6"
            >
              <span className="text-xs font-mono text-accent uppercase tracking-wider">Education</span>
              <p data-edit-id="about.education.school" data-edit-name="About · School" data-edit-kind="text" data-edit-path="about.education.school" className="mt-2 text-ink font-semibold leading-snug">{about.education?.school}</p>
              <p data-edit-id="about.education.degree" data-edit-name="About · Degree" data-edit-kind="text" data-edit-path="about.education.degree" className="mt-1 text-sm text-ink-soft">{about.education?.degree}</p>
              <p data-edit-id="about.education.years" data-edit-name="About · Years" data-edit-kind="text" data-edit-path="about.education.years" className="mt-3 text-xs font-mono text-ink-soft/70">{about.education?.years}</p>
            </motion.div>
          )}

          {/* Goals — short & long term */}
          {isVisible('goals') && (
            <motion.div
              custom={4} variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }}
              data-edit-id="about.goals" data-edit-name="About · Goals" data-edit-kind="section"
              className="lg:col-span-2 rounded-3xl border border-line bg-bg p-6"
            >
              <span className="text-xs font-mono text-accent uppercase tracking-wider">Goals</span>
              <p className="mt-2 text-ink font-medium leading-snug">
                <span className="text-accent">Now →</span> <span data-edit-id="about.goals.now" data-edit-name="About · Goal Now" data-edit-kind="text" data-edit-path="about.goals.now">{about.goals?.now}</span>
              </p>
              <p className="mt-3 text-ink font-medium leading-snug">
                <span className="text-accent">Next →</span> <span data-edit-id="about.goals.next" data-edit-name="About · Goal Next" data-edit-kind="text" data-edit-path="about.goals.next">{about.goals?.next}</span>
              </p>
            </motion.div>
          )}
        </div>

        {/* Stats strip */}
        {isVisible('stats') && stats.length > 0 && (
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-line bg-line">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, ease, delay: i * 0.08 }}
                className="bg-surface p-6 sm:p-8"
              >
                <div className="font-display font-extrabold text-3xl sm:text-4xl text-ink tabular-nums">{s.value}</div>
                <div className="mt-1 text-sm text-ink-soft">{s.label}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default About;
