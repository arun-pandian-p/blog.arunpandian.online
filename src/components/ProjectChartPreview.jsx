import React from 'react';

export default function ProjectChartPreview({ type = 0, title = '', imageUrl = null }) {
  if (imageUrl) {
    return (
      <img
        loading="lazy"
        decoding="async"
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
    );
  }

  // ── High Quality SVG Chart Mockups matching user screenshot ──
  switch (type % 8) {
    case 0:
      // Australian / Regional Facility Map Network
      return (
        <div className="w-full h-full bg-[#f1f5f9] flex flex-col justify-between p-3 relative overflow-hidden select-none">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 border-b border-slate-200 pb-1">
            <span className="font-bold text-slate-700">Geospatial Facility Network</span>
            <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Active · 98 Nodes</span>
          </div>
          <svg viewBox="0 0 320 180" className="w-full h-full" fill="none">
            {/* Coastline shape approximation */}
            <path
              d="M50 40 Q90 20 160 30 T250 50 Q280 80 270 120 T210 160 Q160 170 100 150 T40 100 Z"
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            {/* Network Connections */}
            <path d="M70 60 Q120 70 180 60" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M180 60 Q210 90 230 130" stroke="#3b82f6" strokeWidth="1.5" opacity="0.7" />
            <path d="M70 60 Q140 110 200 135" stroke="#10b981" strokeWidth="1.2" opacity="0.6" />
            <path d="M120 100 Q170 130 240 110" stroke="#6366f1" strokeWidth="1" strokeDasharray="2 2" />
            
            {/* Facility Hub Nodes */}
            <circle cx="70" cy="60" r="5" fill="#10b981" className="animate-pulse" />
            <circle cx="180" cy="60" r="6" fill="#2563eb" />
            <circle cx="230" cy="130" r="7" fill="#0f172a" />
            <circle cx="200" cy="135" r="4.5" fill="#10b981" />
            <circle cx="120" cy="100" r="4" fill="#3b82f6" />
            <circle cx="240" cy="110" r="5" fill="#059669" />
            <circle cx="95" cy="120" r="4" fill="#64748b" />
            <circle cx="150" cy="80" r="3.5" fill="#3b82f6" />
            <circle cx="215" cy="75" r="4" fill="#10b981" />
          </svg>
          <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
            <span>Projection: WGS84</span>
            <span>Latency: 12ms</span>
          </div>
        </div>
      );

    case 1:
      // Relative Delays / Categorical Bar Benchmark Chart
      return (
        <div className="w-full h-full bg-white flex flex-col justify-between p-3 relative overflow-hidden select-none">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-600 border-b border-slate-100 pb-1">
            <span className="font-bold text-slate-800">C3 Flight Delays & Turnaround</span>
            <span className="text-red-500 font-bold bg-red-50 px-1 rounded">Delta +14%</span>
          </div>
          <svg viewBox="0 0 320 170" className="w-full h-full" fill="none">
            {/* Grid lines */}
            <line x1="40" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="40" y1="55" x2="300" y2="55" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="40" y1="90" x2="300" y2="90" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="40" y1="125" x2="300" y2="125" stroke="#cbd5e1" strokeWidth="1.5" />
            
            {/* Bars */}
            <rect x="55" y="30" width="24" height="95" rx="3" fill="#ef4444" />
            <rect x="95" y="60" width="24" height="65" rx="3" fill="#93c5fd" />
            <rect x="135" y="70" width="24" height="55" rx="3" fill="#93c5fd" />
            <rect x="175" y="80" width="24" height="45" rx="3" fill="#93c5fd" />
            <rect x="215" y="92" width="24" height="33" rx="3" fill="#93c5fd" />
            <rect x="255" y="105" width="24" height="20" rx="3" fill="#93c5fd" />

            {/* Labels */}
            <text x="67" y="24" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold">38.4m</text>
            <text x="67" y="137" textAnchor="middle" fill="#64748b" fontSize="8">Carrier A</text>
            <text x="107" y="137" textAnchor="middle" fill="#64748b" fontSize="8">Carrier B</text>
            <text x="147" y="137" textAnchor="middle" fill="#64748b" fontSize="8">Carrier C</text>
            <text x="187" y="137" textAnchor="middle" fill="#64748b" fontSize="8">Carrier D</text>
            <text x="227" y="137" textAnchor="middle" fill="#64748b" fontSize="8">Carrier E</text>
            <text x="267" y="137" textAnchor="middle" fill="#64748b" fontSize="8">Carrier F</text>
          </svg>
          <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
            <span>Metric: Avg Gate Hold Time</span>
            <span>N = 450,200</span>
          </div>
        </div>
      );

    case 2:
      // Global Activity & Distribution Heatmap Tracker
      return (
        <div className="w-full h-full bg-[#1e293b] flex flex-col justify-between p-3 relative overflow-hidden select-none text-white">
          <div className="flex items-center justify-between text-[9px] font-mono border-b border-slate-700 pb-1">
            <span className="font-bold text-sky-400">Global Cluster Density Heatmap</span>
            <span className="text-amber-400 bg-amber-950/60 px-1 rounded">Live Stream</span>
          </div>
          <svg viewBox="0 0 320 170" className="w-full h-full" fill="none">
            {/* World continents silhouette */}
            <path d="M40 50 Q70 30 110 50 T130 90 T70 120 Z" fill="#334155" />
            <path d="M150 40 Q200 30 230 60 T250 110 T170 120 Z" fill="#334155" />
            <path d="M240 110 Q280 100 290 140 T250 155 Z" fill="#334155" />
            
            {/* Heat glow gradients */}
            <circle cx="90" cy="65" r="18" fill="#ef4444" opacity="0.35" className="animate-ping" />
            <circle cx="90" cy="65" r="8" fill="#f97316" />
            <circle cx="180" cy="55" r="22" fill="#ef4444" opacity="0.3" />
            <circle cx="180" cy="55" r="9" fill="#facc15" />
            <circle cx="215" cy="75" r="16" fill="#f97316" opacity="0.4" />
            <circle cx="215" cy="75" r="7" fill="#ef4444" />
            <circle cx="265" cy="130" r="12" fill="#38bdf8" opacity="0.5" />
            <circle cx="265" cy="130" r="5" fill="#0284c7" />
          </svg>
          <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
            <span>Threshold: σ &gt; 2.5</span>
            <span>Coverage: 99.4%</span>
          </div>
        </div>
      );

    case 3:
      // Executive KPI & BI Financial Matrix Dashboard
      return (
        <div className="w-full h-full bg-[#f8fafc] flex flex-col justify-between p-3 relative overflow-hidden select-none">
          <div className="flex items-center justify-between text-[9px] font-mono border-b border-slate-200 pb-1">
            <span className="font-bold text-slate-800">Executive KPI & Financial BI</span>
            <span className="text-blue-600 font-bold bg-blue-50 px-1 rounded">Q3 Review</span>
          </div>
          <div className="grid grid-cols-3 gap-2 my-2">
            <div className="bg-white p-1.5 rounded border border-slate-200 shadow-xs">
              <div className="text-[8px] text-slate-400">Revenue</div>
              <div className="text-[12px] font-bold text-slate-800">$2.48M</div>
              <div className="text-[7px] text-emerald-600">▲ +18.2%</div>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200 shadow-xs">
              <div className="text-[8px] text-slate-400">Active ARR</div>
              <div className="text-[12px] font-bold text-slate-800">$940K</div>
              <div className="text-[7px] text-emerald-600">▲ +24.6%</div>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200 shadow-xs">
              <div className="text-[8px] text-slate-400">Churn Rate</div>
              <div className="text-[12px] font-bold text-slate-800">1.24%</div>
              <div className="text-[7px] text-blue-600">▼ -0.4%</div>
            </div>
          </div>
          <svg viewBox="0 0 320 80" className="w-full h-16" fill="none">
            <path d="M0 60 Q40 40 80 50 T160 30 T240 38 T320 12" stroke="#2563eb" strokeWidth="2.5" fill="none" />
            <path d="M0 60 Q40 40 80 50 T160 30 T240 38 T320 12 L320 80 L0 80 Z" fill="url(#blueGrad)" opacity="0.15" />
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
            <span>Source: PostgreSQL ETL</span>
            <span>DAX Calculations</span>
          </div>
        </div>
      );

    case 4:
      // Multi-Variable Scatter & Bubble Regression Plot
      return (
        <div className="w-full h-full bg-white flex flex-col justify-between p-3 relative overflow-hidden select-none">
          <div className="flex items-center justify-between text-[9px] font-mono border-b border-slate-100 pb-1">
            <span className="font-bold text-slate-800">Life Expectancy vs GDP Scatter</span>
            <span className="text-purple-600 bg-purple-50 px-1 rounded">R² = 0.884</span>
          </div>
          <svg viewBox="0 0 320 170" className="w-full h-full" fill="none">
            {/* Grid */}
            <line x1="30" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="30" y1="65" x2="300" y2="65" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="30" y1="110" x2="300" y2="110" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="30" y1="140" x2="300" y2="140" stroke="#cbd5e1" strokeWidth="1.5" />
            
            {/* Regression Line */}
            <line x1="30" y1="135" x2="300" y2="35" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />

            {/* Bubble Points */}
            <circle cx="50" cy="128" r="8" fill="#34d399" opacity="0.75" />
            <circle cx="85" cy="115" r="14" fill="#38bdf8" opacity="0.65" />
            <circle cx="120" cy="105" r="10" fill="#a855f7" opacity="0.65" />
            <circle cx="150" cy="90" r="22" fill="#34d399" opacity="0.5" />
            <circle cx="180" cy="78" r="16" fill="#f43f5e" opacity="0.65" />
            <circle cx="210" cy="62" r="28" fill="#38bdf8" opacity="0.45" />
            <circle cx="245" cy="50" r="18" fill="#fbbf24" opacity="0.7" />
            <circle cx="280" cy="40" r="12" fill="#a855f7" opacity="0.8" />
          </svg>
          <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
            <span>X: Log GDP per Capita</span>
            <span>Y: Healthy Life Expectancy</span>
          </div>
        </div>
      );

    case 5:
      // Radial / Polar Gauge Skill & Metric Arc Visualizer
      return (
        <div className="w-full h-full bg-[#faf5ff] flex flex-col justify-between p-3 relative overflow-hidden select-none">
          <div className="flex items-center justify-between text-[9px] font-mono border-b border-purple-100 pb-1">
            <span className="font-bold text-purple-900">Polar Skill Demand & DAX Index</span>
            <span className="text-purple-700 bg-purple-100 px-1 rounded">Top 5%</span>
          </div>
          <div className="flex justify-center items-center h-28 my-auto">
            <svg viewBox="0 0 160 160" className="w-28 h-28" fill="none">
              {/* Polar background rings */}
              <circle cx="80" cy="80" r="65" stroke="#f3e8ff" strokeWidth="6" />
              <circle cx="80" cy="80" r="50" stroke="#f3e8ff" strokeWidth="6" />
              <circle cx="80" cy="80" r="35" stroke="#f3e8ff" strokeWidth="6" />

              {/* Polar data arcs */}
              <circle cx="80" cy="80" r="65" stroke="#9333ea" strokeWidth="6" strokeDasharray="408" strokeDashoffset="110" strokeLinecap="round" transform="rotate(-90 80 80)" />
              <circle cx="80" cy="80" r="50" stroke="#3b82f6" strokeWidth="6" strokeDasharray="314" strokeDashoffset="80" strokeLinecap="round" transform="rotate(-90 80 80)" />
              <circle cx="80" cy="80" r="35" stroke="#ec4899" strokeWidth="6" strokeDasharray="220" strokeDashoffset="50" strokeLinecap="round" transform="rotate(-90 80 80)" />

              <text x="80" y="78" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#581c87">94.2%</text>
              <text x="80" y="91" textAnchor="middle" fontSize="7" fill="#7e22ce" fontFamily="monospace">INDEX</text>
            </svg>
          </div>
          <div className="flex justify-between items-center text-[8px] font-mono text-purple-600">
            <span>Outer: SQL & Python</span>
            <span>Inner: Power BI / DAX</span>
          </div>
        </div>
      );

    case 6:
      // Time-Series Telemetry Wave Plot
      return (
        <div className="w-full h-full bg-[#f8fafc] flex flex-col justify-between p-3 relative overflow-hidden select-none">
          <div className="flex items-center justify-between text-[9px] font-mono border-b border-slate-200 pb-1">
            <span className="font-bold text-slate-800">Time-Series Signal Telemetry</span>
            <span className="text-teal-600 bg-teal-50 px-1 rounded">100Hz Stream</span>
          </div>
          <svg viewBox="0 0 320 150" className="w-full h-full" fill="none">
            <line x1="20" y1="75" x2="300" y2="75" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
            
            {/* Wave 1: Blue */}
            <path
              d="M20 75 Q45 20 70 75 T120 75 T170 30 T220 110 T270 60 T300 75"
              stroke="#0284c7"
              strokeWidth="2"
              fill="none"
            />
            {/* Wave 2: Red / Coral */}
            <path
              d="M20 90 Q50 130 80 90 T130 90 T180 120 T230 45 T280 100 T300 90"
              stroke="#f43f5e"
              strokeWidth="2"
              fill="none"
              opacity="0.85"
            />
          </svg>
          <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
            <span>Primary Sensor: Blue (±0.02)</span>
            <span>Filtered Anomaly: Coral</span>
          </div>
        </div>
      );

    case 7:
    default:
      // Gaussian / Normal Distribution Statistical Histogram
      return (
        <div className="w-full h-full bg-white flex flex-col justify-between p-3 relative overflow-hidden select-none">
          <div className="flex items-center justify-between text-[9px] font-mono border-b border-slate-100 pb-1">
            <span className="font-bold text-slate-800">Distribution of Finish Times & Errors</span>
            <span className="text-slate-600 bg-slate-100 px-1 rounded">μ = 4.22, σ = 1.05</span>
          </div>
          <svg viewBox="0 0 320 160" className="w-full h-full" fill="none">
            {/* Histogram bars */}
            <rect x="40" y="130" width="14" height="10" fill="#1e293b" />
            <rect x="58" y="120" width="14" height="20" fill="#1e293b" />
            <rect x="76" y="100" width="14" height="40" fill="#1e293b" />
            <rect x="94" y="75" width="14" height="65" fill="#1e293b" />
            <rect x="112" y="50" width="14" height="90" fill="#1e293b" />
            <rect x="130" y="30" width="14" height="110" fill="#1e293b" />
            <rect x="148" y="20" width="14" height="120" fill="#1e293b" />
            <rect x="166" y="30" width="14" height="110" fill="#1e293b" />
            <rect x="184" y="50" width="14" height="90" fill="#1e293b" />
            <rect x="202" y="75" width="14" height="65" fill="#1e293b" />
            <rect x="220" y="100" width="14" height="40" fill="#1e293b" />
            <rect x="238" y="120" width="14" height="20" fill="#1e293b" />
            <rect x="256" y="130" width="14" height="10" fill="#1e293b" />

            {/* Normal Bell Curve overlay */}
            <path
              d="M35 138 Q110 135 140 40 T155 18 T170 40 Q200 135 275 138"
              stroke="#38bdf8"
              strokeWidth="2.5"
              fill="none"
            />
            {/* Center Mean Line */}
            <line x1="155" y1="12" x2="155" y2="140" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
          </svg>
          <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
            <span>Kurtosis: 3.01</span>
            <span>Skewness: -0.04</span>
          </div>
        </div>
      );
  }
}
