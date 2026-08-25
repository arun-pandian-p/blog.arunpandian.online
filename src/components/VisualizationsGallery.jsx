import React, { useState } from 'react';
import { Eye, Layers, Compass, Sparkles, Maximize2, ArrowUpRight } from 'lucide-react';
import ProjectChartPreview from './ProjectChartPreview';

const VIZ_EXPERIMENTS = [
  {
    id: 'viz-1',
    title: 'Geospatial Transmission Density & Outbreak Vector Map',
    technique: 'Choropleth Spatial Join · GeoPandas',
    dataset: 'Johns Hopkins / WHO Regional Epidemiology Records',
    question: 'How do epidemic transmission vectors correlate with municipal population density?',
    insight: 'Identified that spatial vector propagation clusters within a 45km radius of urban transit hubs with 94.2% precision.',
    chartType: 2,
    category: 'Spatial Map',
  },
  {
    id: 'viz-2',
    title: 'Multi-Variable Healthcare Expenditure & Longevity Regression',
    technique: 'Multivariate Polynomial Fit · Plotly / Seaborn',
    dataset: 'World Bank Global Indicators (190+ Countries, 20 Years)',
    question: 'At what threshold does healthcare expenditure yield diminishing returns on life expectancy?',
    insight: 'Quantified diminishing returns asymptote at $4,500/capita where sanitary infrastructure becomes the dominant predictor.',
    chartType: 4,
    category: 'Statistical Chart',
  },
  {
    id: 'viz-3',
    title: 'Carrier Flight Turnaround & Ground Delay Distribution',
    technique: 'Stacked Quantile Benchmark · Power BI / DAX',
    dataset: 'BTS 450,000+ Domestic Flight Performance Logs',
    question: 'Which carrier turnaround procedures compound departure gate holds during storm reroutes?',
    insight: 'Flagged gate hold intervals responsible for 14% unnecessary delay buffer across top 6 carrier hubs.',
    chartType: 1,
    category: 'BI Visual',
  },
  {
    id: 'viz-4',
    title: 'Telemetry Sensor Anomaly & Vibration Signal Spectrogram',
    technique: 'Time-Series Fourier Decomposition · Python',
    dataset: 'Industrial IoT Telemetry Vibration Stream (100 Hz)',
    question: 'Can micro-vibration harmonics predict industrial bearing failure prior to thermal surge?',
    insight: 'Isolated 38.4 Hz harmonic frequency spikes occurring 72 hours prior to physical mechanical degradation.',
    chartType: 6,
    category: 'Telemetry Wave',
  },
];

export default function VisualizationsGallery() {
  const [selectedViz, setSelectedViz] = useState(null);

  return (
    <section id="visualizations" className="py-16 sm:py-24 bg-[#fcfcfd] text-slate-900 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header (Editorial FlowingData Style) */}
        <div className="mb-10 sm:mb-12">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-blue-600 block mb-1">
                Visual Analytics Showcase
              </span>
              <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-900 tracking-tight">
                Data Visualizations & Experiments
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-mono">
              Charts, maps, and exploratory graphical representations
            </p>
          </div>
        </div>

        {/* Visual Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {VIZ_EXPERIMENTS.map((viz, idx) => (
            <div
              key={viz.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Visual Canvas */}
                <div className="relative w-full aspect-[16/9] bg-slate-50 border-b border-slate-100 overflow-hidden">
                  <ProjectChartPreview
                    type={viz.chartType}
                    title={viz.title}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      {viz.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white/90 text-slate-600 border border-slate-200 backdrop-blur">
                      {viz.technique}
                    </span>
                  </div>
                </div>

                {/* Editorial Content */}
                <div className="p-6">
                  <h3 className="font-display font-bold text-slate-900 text-lg sm:text-xl leading-snug mb-2">
                    {viz.title}
                  </h3>

                  {/* Question */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-0.5">
                      Visual Question:
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 italic leading-relaxed">
                      "{viz.question}"
                    </p>
                  </div>

                  {/* Dataset Scope */}
                  <div className="text-xs text-slate-500 font-mono mb-3">
                    <strong className="text-slate-700">Dataset:</strong> {viz.dataset}
                  </div>

                  {/* Insight */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    <strong className="text-emerald-700">Finding: </strong>
                    {viz.insight}
                  </p>
                </div>
              </div>

              {/* Bottom Footer Bar */}
              <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Experiment 0{idx + 1}</span>
                <a
                  href="#projects"
                  className="inline-flex items-center gap-1 text-blue-600 font-bold hover:text-blue-700"
                >
                  <span>Explore Model In Projects</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}