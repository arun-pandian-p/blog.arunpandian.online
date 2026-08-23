import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Briefcase } from 'lucide-react';
import { useContent } from '../context/ContentProvider';

const ease = [0.16, 1, 0.3, 1];

const Timeline = () => {
  const { experiences, settings } = useContent();

  return (
    <section id="timeline" data-edit-id="timeline.section" data-edit-name="Experience" data-edit-kind="section" className="py-16 sm:py-24 lg:py-32 bg-surface border-y border-line">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <div className="mb-8 sm:mb-14">
          <span data-edit-id="timeline.label" data-edit-name="Experience · Eyebrow" data-edit-kind="text" data-edit-path="sections.experience.label" className="text-xs font-mono tracking-[0.25em] text-accent uppercase">{settings?.sections?.experience?.label || '03 — Experience'}</span>
          <h2 data-edit-id="timeline.title" data-edit-name="Experience · Title" data-edit-kind="heading" data-edit-path="sections.experience.title" className="mt-2.5 sm:mt-3 font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl text-ink tracking-tight">{settings?.sections?.experience?.title || "Where I've made an impact"}</h2>
        </div>

        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-[17px] sm:left-6 top-2 bottom-2 w-px bg-line" />
          <div className="space-y-4 sm:space-y-6">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.id || i}
                initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, ease, delay: i * 0.08 }}
                className="relative pl-11 sm:pl-20"
              >
                <div className="absolute left-0 sm:left-1 top-1 grid place-items-center h-8.5 w-8.5 sm:h-10 sm:w-10 rounded-full bg-ink text-white ring-4 ring-surface">
                  <Briefcase size={14} className="sm:w-4 sm:h-4" />
                </div>
              <div
                data-edit-id={`exp.${exp.id || i}`}
                data-edit-name={`Experience · ${exp.company || `Item ${i+1}`}`}
                data-edit-kind="section"
                className="rounded-2xl border border-line bg-bg p-4 sm:p-6 hover:border-ink/20 hover:shadow-[0_20px_50px_-30px_rgba(9,9,11,0.4)] transition-all duration-300 overflow-hidden"
              >
                <div className={`flex flex-col ${exp.media_url ? 'md:flex-row md:items-start md:gap-8' : ''}`}>
                  <div className={`flex-1 ${exp.media_url ? 'mb-4 md:mb-0' : ''}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-3">
                      <span className="px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold rounded-full bg-accent-soft text-accent">{exp.type}</span>
                      <span className="flex items-center gap-1 text-[11px] sm:text-xs text-ink-soft font-mono"><Calendar size={11} className="sm:w-3 sm:h-3" />{exp.period}</span>
                    </div>
                    <h3 data-edit-id={`exp.${exp.id || i}.role`} data-edit-name={`Experience · ${exp.company} Role`} data-edit-kind="text" className="font-display font-bold text-base sm:text-xl text-ink">
                      {exp.role} 
                      {exp.company_website ? (
                        <a href={exp.company_website} target="_blank" rel="noopener noreferrer" className="text-ink-soft font-medium hover:text-accent transition-colors ml-1">· {exp.company}</a>
                      ) : (
                        <span className="text-ink-soft font-medium ml-1">· {exp.company}</span>
                      )}
                    </h3>
                    <p data-edit-id={`exp.${exp.id || i}.impact`} data-edit-name={`Experience · ${exp.company} Impact`} data-edit-kind="text" className="mt-2 sm:mt-2.5 text-xs sm:text-sm text-ink-soft leading-relaxed">{exp.impact}</p>
                  </div>
                  
                  {exp.media_url && (
                    <div className="w-full md:w-[40%] shrink-0 mt-3 md:mt-0">
                      <div className="rounded-xl overflow-hidden border border-line bg-surface relative group">
                        <img loading="lazy" 
                          src={exp.media_url} 
                          alt={`${exp.role} Certificate`}
                          className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                          onClick={() => window.open(exp.media_url, '_blank')}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              </motion.div>
            ))}

            {/* Dynamic Custom Elements in Timeline */}
            {settings?.custom_elements && Object.values(settings.custom_elements)
              .filter((e) => e.section === 'timeline')
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
        </div>
      </div>
    </section>
  );
};

export default Timeline;
