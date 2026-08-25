import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BarChart3, Sparkles } from 'lucide-react';
import ProjectChartPreview from './ProjectChartPreview';

export default function FeaturedStory({ project }) {
  const featured = project || {
    id: '1',
    title: 'Amazon Delivery Performance & Prediction Dashboard',
    subtitle: 'An end-to-end operational analytics model predicting customer delivery arrival times from weather conditions, traffic jam severity, and driver parameters.',
    tags: ['Power BI', 'DAX', 'SQL', 'Python', 'Machine Learning'],
    question: 'How do weather, traffic congestion and urban zones impact delivery lead times and SLA breaches?',
    image_url: null,
  };

  const question = featured.question || 'How do weather, traffic and delivery conditions affect delivery performance?';

  return (
    <section className="py-12 sm:py-16 bg-[#fcfcfd] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Eyebrow Flagship Banner */}
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-blue-700">
              Featured Flagship Investigation
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500 hidden sm:inline">
            Interactive BI Case Study
          </span>
        </div>

        {/* Large Editorial Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm">
          
          {/* Visual Showcase (Left Column) */}
          <div className="lg:col-span-7">
            <Link to={`/project/${featured.id || 1}`} className="block relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-md group bg-slate-50 aspect-[16/10]">
              <ProjectChartPreview
                type={0}
                title={featured.title}
                imageUrl={featured.image_url}
              />
              <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors" />
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur px-3 py-2 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-slate-600 font-semibold">
                  Live Power BI Report with Drilldowns
                </span>
                <span className="text-blue-600 font-bold font-mono text-[11px] flex items-center gap-1">
                  Interact ↗
                </span>
              </div>
            </Link>
          </div>

          {/* Editorial Content (Right Column) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Stack Badges */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(featured.tags || ['Power BI', 'SQL', 'Python', 'DAX']).slice(0, 4).map((tag) => (
                  <span key={tag} className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-700">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 leading-tight mb-3">
                <Link to={`/project/${featured.id || 1}`} className="hover:text-blue-600 transition-colors">
                  {featured.title}
                </Link>
              </h2>

              {/* Business Question in Editorial Callout */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 mb-5">
                <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-blue-700 block mb-1">
                  Analytical Business Question:
                </span>
                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed italic">
                  "{question}"
                </p>
              </div>

              {/* Key Insight Summary */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                Discovered that Jam traffic conditions compound with rain storms to introduce up to <strong>+48 minutes</strong> in delivery delay variance, while urban city routes consistently maintain a <strong>109-minute</strong> turnaround.
              </p>
            </div>

            {/* Action CTA */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <Link
                to={`/project/${featured.id || 1}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
              >
                <span>Explore Interactive Analysis</span>
                <ArrowUpRight size={16} />
              </Link>

              <span className="text-[11px] font-mono text-slate-500">
                100% Free Public Access
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}