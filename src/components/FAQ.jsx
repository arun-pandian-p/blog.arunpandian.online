import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import DoodleGuide from './DoodleGuide';

const faqs = [
  {
    question: "What topics does blog.arunpandian.online cover?",
    answer: "We publish in-depth technical articles covering modern software engineering, distributed systems, web architectures, cloud infrastructure, and developer tooling."
  },
  {
    question: "Can other writers publish stories on this platform?",
    answer: "Yes! Any registered user can write, draft with the rich Tiptap editor, autosave, preview, and publish their own articles with full author profile attribution."
  },
  {
    question: "How does the editorial and review workflow work?",
    answer: "Authors maintain full ownership of their articles with draft protection, custom tags, cover images, and instant publishing without requiring third-party approval."
  },
  {
    question: "How do I subscribe to future publications?",
    answer: "You can enter your email in the newsletter form on any publication page or feed to receive new article notifications, or follow specific authors directly."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section id="faq" className="py-16 sm:py-24 lg:py-32 bg-surface border-b border-line">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-8 sm:mb-14">
          <span className="text-xs font-mono tracking-[0.25em] text-accent uppercase">FAQ</span>
          <h2 className="mt-2.5 sm:mt-3 font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl text-ink tracking-tight">
            Frequently Asked Questions
          </h2>

          {/* Doodle Guide for FAQ */}
          <div className="mt-5 flex justify-center">
            <DoodleGuide
              tag="FAQ"
              text="Quick answers to common questions & workflow"
              subtext="Tap any question to expand details ↓"
              icon="question"
              arrow="curved-down-right"
              arrowPosition="bottom-right"
              rotation={1.5}
              color="var(--color-primary, #2563EB)"
            />
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className="border border-line rounded-2xl overflow-hidden bg-bg hover:border-ink/20 transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left focus:outline-none min-h-[48px] cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-display font-bold text-sm sm:text-lg text-ink pr-4 sm:pr-8">
                    {faq.question}
                  </span>
                  <div className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-line flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180 bg-accent text-white border-accent' : 'text-ink-soft'}`}>
                    <ChevronDown size={15} />
                  </div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 text-xs sm:text-sm text-ink-soft leading-relaxed border-t border-line/50 mt-1 sm:mt-2">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
