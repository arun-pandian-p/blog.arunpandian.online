import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const BlogCard = ({ blog }) => {
  const { title, excerpt, content, tags, readTime, publishedAt } = blog;
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedDate = new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="group flex flex-col justify-between h-full rounded-3xl border border-line bg-surface overflow-hidden hover:border-ink/20 hover:shadow-[0_30px_70px_-40px_rgba(9,9,11,0.4)] transition-all duration-300"
    >
      <div>
        {blog.cover_image && (
          <div className="w-full h-48 overflow-hidden bg-muted">
            <img loading="lazy" 
              src={blog.cover_image} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center gap-4 text-xs text-ink-soft font-mono mb-4">
            <span className="flex items-center gap-1.5"><Calendar size={12} />{formattedDate}</span>
            <span className="flex items-center gap-1.5"><Clock size={12} />{readTime}</span>
          </div>

          <h3 className="font-display font-bold text-lg text-ink leading-snug group-hover:text-accent transition-colors">{title}</h3>
        <p className="mt-2.5 text-sm text-ink-soft leading-relaxed">{excerpt}</p>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-line text-sm space-y-3 leading-relaxed">
                {content.split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('###')) {
                    return <h4 key={index} className="font-display font-bold text-base text-ink mt-4">{paragraph.replace('###', '').trim()}</h4>;
                  }
                  if (/^(\d+\.|\*|-)/.test(paragraph)) {
                    return (
                      <ul key={index} className="list-disc pl-5 space-y-1.5 text-ink-soft">
                        {paragraph.split('\n').map((item, idx) => (
                          <li key={idx}>{item.replace(/^(\d+\.|\*|-)\s*/, '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={index} className="text-ink-soft">{paragraph}</p>;
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {tags && tags.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-muted text-ink-soft">{tag}</span>
          ))}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs font-semibold text-accent hover:gap-2 transition-all"
        >
          {isExpanded ? <>Collapse <ChevronUp size={14} /></> : <>Read post <ChevronDown size={14} /></>}
        </button>
      </div>
      </div>
    </motion.article>
  );
};

export default BlogCard;
