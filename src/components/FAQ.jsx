import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const faqs = [
  {
    question: "What tools do you use for Data Analysis?",
    answer: "My core stack includes SQL (PostgreSQL, MySQL) for data extraction, Python (Pandas, NumPy, scikit-learn) for transformation and modeling, and Power BI or Excel for visualization and dashboarding."
  },
  {
    question: "What is your approach to solving business problems with data?",
    answer: "I start by understanding the core business question. Then, I gather and clean the relevant data, perform exploratory data analysis (EDA) to uncover trends, and finally, build interactive dashboards or reports that provide clear, actionable insights for stakeholders."
  },
  {
    question: "Do you have experience with data cleaning and ETL pipelines?",
    answer: "Yes, I regularly build ETL pipelines using Python and Power Query. I'm experienced in handling missing values, normalizing data, joining complex datasets, and automating workflows using tools like n8n."
  },
  {
    question: "Are you open to full-time Data Analyst roles?",
    answer: "Yes, I am actively seeking entry-level and junior Data Analyst positions where I can contribute to data-driven decision-making and continue growing my analytical skill set."
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
    <section id="faq" className="py-24 sm:py-32 bg-surface border-b border-line">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-mono tracking-[0.25em] text-accent uppercase">FAQ</span>
          <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-5xl text-ink tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className="border border-line rounded-2xl overflow-hidden bg-bg hover:border-ink/20 transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-display font-bold text-lg text-ink pr-8">
                    {faq.question}
                  </span>
                  <div className={`shrink-0 w-8 h-8 rounded-full border border-line flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180 bg-accent text-white border-accent' : 'text-ink-soft'}`}>
                    <ChevronDown size={16} />
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
                      <div className="px-6 pb-6 pt-2 text-ink-soft leading-relaxed border-t border-line/50 mt-2">
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
