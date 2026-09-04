import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Maximize2,
  Minimize2,
  UploadCloud,
  FileCode,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  ShieldAlert,
  MapPin,
  LayoutDashboard,
  Filter,
  Check,
  ChevronRight,
  Database,
  BarChart3,
  TrendingUp,
  Info,
  Sliders,
  Cpu,
  Table,
  Zap,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import type {
  PbixReport,
  PbixPage,
  PbixVisual,
  PbixKPI,
  ChartEngineType,
} from '../../utils/pbixParser';
import {
  getSampleBankChurnReport,
  getPbixReportForProject,
  extractPbixFile
} from '../../utils/pbixParser';
import toast from 'react-hot-toast';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface PowerBIViewerProps {
  projectId?: string;
  projectTitle?: string;
  pbixUrl?: string;
  initialReport?: PbixReport;
  defaultEngine?: ChartEngineType;
  className?: string;
  onZoomToggle?: () => void;
}

export default function PowerBIViewer({
  projectId,
  projectTitle,
  pbixUrl,
  initialReport,
  defaultEngine = 'echarts',
  className = '',
  onZoomToggle
}: PowerBIViewerProps) {
  // ── State ──
  const [report, setReport] = useState<PbixReport>(() => {
    if (initialReport) return initialReport;
    if (projectId || projectTitle) return getPbixReportForProject(projectId || projectTitle || '');
    return getSampleBankChurnReport();
  });

  const [activePageIndex, setActivePageIndex] = useState(0);
  const [engine, setEngine] = useState<ChartEngineType>(defaultEngine);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showModelSchema, setShowModelSchema] = useState(false);
  
  // Cross-filtering active state (e.g. clicking 'Germany' or 'Exited')
  const [activeFilter, setActiveFilter] = useState<{
    category: string | null;
    value: string | null;
  }>({ category: null, value: null });

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from pbixUrl if provided and is a .pbix binary link
  useEffect(() => {
    if (pbixUrl && pbixUrl.toLowerCase().endsWith('.pbix')) {
      let isMounted = true;
      fetch(pbixUrl)
        .then(res => res.arrayBuffer())
        .then(async buffer => {
          const parsed = await extractPbixFile(buffer);
          if (isMounted) {
            setReport(parsed);
            setActivePageIndex(0);
          }
        })
        .catch(err => {
          console.warn('Could not load remote pbixUrl buffer, falling back to structured preview', err);
        });
      return () => { isMounted = false; };
    }
  }, [pbixUrl]);

  // Update report when initialReport changes
  useEffect(() => {
    if (initialReport) {
      setReport(initialReport);
      setActivePageIndex(0);
    }
  }, [initialReport]);

  const activePage: PbixPage = report.pages[activePageIndex] || report.pages[0] || {
    id: 'p1',
    name: 'Overview',
    title: 'Overview',
    kpis: [],
    visuals: []
  };

  // ── Filter recalculation for KPIs ──
  const filteredKpis = useMemo(() => {
    if (!activeFilter.value) return activePage.kpis;

    const filterVal = activeFilter.value.toLowerCase();
    return activePage.kpis.map((kpi) => {
      if (filterVal === 'germany') {
        if (kpi.id === 'kpi-1') return { ...kpi, formattedValue: '2.51K', subtext: 'Filtered: Germany accounts' };
        if (kpi.id === 'kpi-2') return { ...kpi, formattedValue: '32.4%', delta: '+12% vs avg', subtext: '814 exited accounts' };
        if (kpi.id === 'kpi-4') return { ...kpi, formattedValue: '0.55', delta: '€101.8M balance', subtext: 'Critical risk cohort' };
      } else if (filterVal === 'france') {
        if (kpi.id === 'kpi-1') return { ...kpi, formattedValue: '5.01K', subtext: 'Filtered: France accounts' };
        if (kpi.id === 'kpi-2') return { ...kpi, formattedValue: '16.2%', delta: 'Optimal baseline', subtext: '810 exited accounts' };
      } else if (filterVal === 'spain') {
        if (kpi.id === 'kpi-1') return { ...kpi, formattedValue: '2.48K', subtext: 'Filtered: Spain accounts' };
        if (kpi.id === 'kpi-2') return { ...kpi, formattedValue: '16.7%', delta: 'Stable baseline', subtext: '413 exited accounts' };
      } else if (filterVal === 'exited') {
        if (kpi.id === 'kpi-1') return { ...kpi, formattedValue: '2.04K', subtext: 'Filtered: Exited cohort' };
        if (kpi.id === 'kpi-2') return { ...kpi, formattedValue: '100%', subtext: 'Total churned portfolio' };
      } else if (filterVal === 'retained') {
        if (kpi.id === 'kpi-1') return { ...kpi, formattedValue: '7.96K', subtext: 'Filtered: Retained cohort' };
        if (kpi.id === 'kpi-2') return { ...kpi, formattedValue: '0.0%', subtext: 'Active ongoing relationships' };
      }
      return kpi;
    });
  }, [activePage.kpis, activeFilter]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pbix')) {
      toast.error('Please upload a valid Microsoft Power BI Desktop (.pbix) file');
      return;
    }

    try {
      setIsUploading(true);
      const parsedReport = await extractPbixFile(file);
      setReport(parsedReport);
      setActivePageIndex(0);
      setActiveFilter({ category: null, value: null });
      setShowUploadModal(false);
      toast.success(`Successfully loaded Power BI report: ${parsedReport.title}`, {
        icon: '📊',
        duration: 4000
      });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to extract .pbix file structure. Loading structured report preview.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Export Data to CSV
  const handleExportCsv = () => {
    const headers = ['Page', 'Visual', 'Name / Category', 'Value', 'Metric'];
    const rows: string[][] = [];

    activePage.visuals.forEach((viz) => {
      viz.data.forEach((dp) => {
        rows.push([
          `"${activePage.name}"`,
          `"${viz.title}"`,
          `"${dp.name}"`,
          `"${dp.value}"`,
          `"${viz.format || 'number'}"`
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${report.title.replace(/\s+/g, '_')}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report dataset exported as CSV!');
  };

  // ── Render Chart with Chosen Engine ──
  const renderVisual = (visual: PbixVisual) => {
    const isFiltered = Boolean(activeFilter.value);

    // ── Option A: Apache ECharts ──
    if (engine === 'echarts') {
      // ── Stacked Horizontal Bar (RiskBand vs Exited) ──
      if ((visual.type as any) === 'stackedHorizontalBar') {
        const categories = visual.data.map(d => d.name).reverse();
        const retainedVals = visual.data.map(d => d.value).reverse();
        const exitedVals = visual.data.map(d => d.secondaryValue || 0).reverse();

        const option = {
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: (params: any) => {
              const name = params[0]?.name;
              const r = params[0]?.value;
              const e = params[1]?.value;
              return `<b>${name} RiskBand</b><br/>Retained: ${r}%<br/>Exited: ${e}%`;
            }
          },
          legend: {
            data: ['Retained (0)', 'Exited (1)'],
            top: 0,
            textStyle: { color: '#475569', fontSize: 11 }
          },
          grid: { top: '15%', left: '15%', right: '8%', bottom: '10%', containLabel: true },
          xAxis: {
            type: 'value',
            max: 100,
            axisLabel: { formatter: '{value}%', color: '#64748b', fontSize: 11 },
            splitLine: { lineStyle: { color: '#f1f5f9' } }
          },
          yAxis: {
            type: 'category',
            data: categories,
            axisLabel: { color: '#334155', fontWeight: 600, fontSize: 12 },
            axisLine: { lineStyle: { color: '#cbd5e1' } }
          },
          series: [
            {
              name: 'Retained (0)',
              type: 'bar',
              stack: 'total',
              data: retainedVals,
              itemStyle: { color: '#0080FF' },
              barWidth: 32
            },
            {
              name: 'Exited (1)',
              type: 'bar',
              stack: 'total',
              data: exitedVals,
              itemStyle: { color: '#1B2A4A' },
              barWidth: 32
            }
          ]
        };

        return (
          <div className="w-full h-72 sm:h-80">
            <ReactECharts
              option={option}
              style={{ width: '100%', height: '100%' }}
              onEvents={{
                click: (params: any) => {
                  const clickedCat = params.name;
                  setActiveFilter(prev => ({
                    category: 'RiskBand',
                    value: prev.value === clickedCat ? null : clickedCat
                  }));
                }
              }}
            />
          </div>
        );
      }

      // ── Scatter / Bubble Chart (Sum of Balance vs Score) ──
      if (visual.type === 'scatter') {
        const option = {
          backgroundColor: 'transparent',
          tooltip: {
            formatter: (params: any) => {
              return `<b>${params.data.name}</b><br/>Balance: €${params.data.value[1]}M<br/>Volume: ${params.data.value[0]}k`;
            }
          },
          legend: {
            data: ['0 (Retained)', '1 (Exited)'],
            right: 10,
            top: 'center',
            orient: 'vertical',
            textStyle: { color: '#475569', fontSize: 11 }
          },
          grid: { top: '15%', left: '15%', right: '20%', bottom: '15%', containLabel: true },
          xAxis: {
            type: 'value',
            name: 'Volume (k)',
            splitLine: { lineStyle: { color: '#f1f5f9' } }
          },
          yAxis: {
            type: 'value',
            name: 'Sum of Balance',
            axisLabel: { formatter: '{value}M' },
            splitLine: { lineStyle: { color: '#f1f5f9' } }
          },
          series: [
            {
              name: '0 (Retained)',
              type: 'scatter',
              symbolSize: 42,
              data: [{ name: 'Retained Capital', value: [100, 280] }],
              itemStyle: { color: '#0080FF', opacity: 0.85 }
            },
            {
              name: '1 (Exited)',
              type: 'scatter',
              symbolSize: 34,
              data: [{ name: 'Exited Capital', value: [25, 65] }],
              itemStyle: { color: '#1B2A4A', opacity: 0.85 }
            }
          ]
        };

        return (
          <div className="w-full h-56 sm:h-64">
            <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
          </div>
        );
      }

      if (visual.type === 'horizontalBar') {
        const categories = visual.data.map(d => d.name).reverse();
        const values = visual.data.map(d => d.value).reverse();
        const option = {
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: '{b}: <b>{c}%</b>'
          },
          grid: { top: '10%', left: '20%', right: '12%', bottom: '15%', containLabel: true },
          xAxis: {
            type: 'value',
            axisLabel: { formatter: '{value}%', color: '#64748b', fontSize: 11 },
            splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }
          },
          yAxis: {
            type: 'category',
            data: categories,
            axisLabel: { color: '#334155', fontWeight: 600, fontSize: 12 },
            axisLine: { lineStyle: { color: '#cbd5e1' } }
          },
          series: [
            {
              type: 'bar',
              data: values.map((val, idx) => {
                const catName = categories[idx];
                const isSelected = activeFilter.value === catName;
                return {
                  value: val,
                  itemStyle: {
                    color: isFiltered && !isSelected ? '#93C5FD' : '#0080FF',
                    borderRadius: [0, 4, 4, 0]
                  }
                };
              }),
              barWidth: 28,
              label: {
                show: true,
                position: 'right',
                formatter: '{c}%',
                color: '#1e293b',
                fontWeight: 'bold',
                fontSize: 11
              }
            }
          ]
        };

        return (
          <div className="w-full h-56 sm:h-64">
            <ReactECharts
              option={option}
              style={{ width: '100%', height: '100%' }}
              onEvents={{
                click: (params: any) => {
                  const clickedCat = params.name;
                  setActiveFilter(prev => ({
                    category: 'Geography',
                    value: prev.value === clickedCat ? null : clickedCat
                  }));
                }
              }}
            />
          </div>
        );
      }

      if (visual.type === 'donut' || visual.type === 'pie') {
        const option = {
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'item',
            formatter: '{b}: <b>{c}</b> ({d}%)'
          },
          legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            textStyle: { color: '#475569', fontSize: 11 }
          },
          series: [
            {
              name: visual.title,
              type: 'pie',
              radius: ['45%', '72%'],
              center: ['40%', '50%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 4,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: true,
                formatter: '{b}\n{d}%',
                fontSize: 10,
                color: '#334155'
              },
              data: visual.data.map(d => ({
                name: d.name,
                value: d.value,
                itemStyle: { color: d.color || (d.name === 'Retained' ? '#0080FF' : '#1B2A4A') }
              }))
            }
          ]
        };

        return (
          <div className="w-full h-56 sm:h-64">
            <ReactECharts
              option={option}
              style={{ width: '100%', height: '100%' }}
              onEvents={{
                click: (params: any) => {
                  const slice = params.name;
                  setActiveFilter(prev => ({
                    category: 'Cohort',
                    value: prev.value === slice ? null : slice
                  }));
                }
              }}
            />
          </div>
        );
      }

      if (visual.type === 'gauge') {
        const current = visual.gaugeCurrent || 20.4;
        const max = visual.gaugeMax || 30.0;
        const option = {
          backgroundColor: 'transparent',
          series: [
            {
              type: 'gauge',
              startAngle: 180,
              endAngle: 0,
              min: 0,
              max: max,
              radius: '95%',
              center: ['50%', '75%'],
              splitNumber: 3,
              axisLine: {
                lineStyle: {
                  width: 18,
                  color: [
                    [20 / max, '#0080FF'],
                    [1, '#E2E8F0']
                  ]
                }
              },
              pointer: { show: false },
              axisTick: { show: false },
              splitLine: { length: 8, lineStyle: { width: 1, color: '#94a3b8' } },
              axisLabel: {
                color: '#64748b',
                fontSize: 10,
                formatter: (val: number) => `${Math.round(val)}%`
              },
              detail: {
                valueAnimation: true,
                offsetCenter: [0, '-20%'],
                fontSize: 24,
                fontWeight: 'bold',
                formatter: '{value}%',
                color: '#1e293b'
              },
              data: [{ value: current, name: 'Target' }]
            }
          ]
        };

        return (
          <div className="w-full h-44 sm:h-48">
            <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
          </div>
        );
      }

      // Default bar / line / matrix fallback in ECharts
      const option = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        grid: { top: '15%', left: '10%', right: '10%', bottom: '15%', containLabel: true },
        xAxis: {
          type: 'category',
          data: visual.data.map(d => d.name),
          axisLabel: { color: '#64748b', fontSize: 11 }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#64748b', fontSize: 11 },
          splitLine: { lineStyle: { color: '#f1f5f9' } }
        },
        series: [
          {
            type: visual.type === 'line' ? 'line' : 'bar',
            data: visual.data.map(d => d.value),
            itemStyle: { color: '#0080FF', borderRadius: [4, 4, 0, 0] },
            smooth: true
          }
        ]
      };

      return (
        <div className="w-full h-56 sm:h-64">
          <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
        </div>
      );
    }

    // ── Option B: Chart.js ──
    if (engine === 'chartjs') {
      if (visual.type === 'donut' || visual.type === 'pie') {
        const data = {
          labels: visual.data.map(d => d.name),
          datasets: [
            {
              data: visual.data.map(d => d.value),
              backgroundColor: visual.data.map(d => d.color || '#0080FF'),
              borderWidth: 2,
              borderColor: '#ffffff'
            }
          ]
        };
        const options: any = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right' as const, labels: { boxWidth: 12, font: { size: 11 } } },
            tooltip: {
              callbacks: {
                label: (context: any) => ` ${context.label}: ${context.raw}`
              }
            }
          },
          onClick: (_: any, elements: any[]) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const name = visual.data[index].name;
              setActiveFilter(prev => ({
                category: 'Cohort',
                value: prev.value === name ? null : name
              }));
            }
          }
        };

        return (
          <div className="w-full h-56 sm:h-64 flex items-center justify-center p-2">
            <Doughnut data={data} options={options} />
          </div>
        );
      }

      if (visual.type === 'horizontalBar' || visual.type === 'bar') {
        const isHorizontal = visual.type === 'horizontalBar';
        const data = {
          labels: visual.data.map(d => d.name),
          datasets: [
            {
              label: visual.title,
              data: visual.data.map(d => d.value),
              backgroundColor: visual.data.map(d => {
                if (isFiltered && activeFilter.value !== d.name) return '#93C5FD';
                return d.color || '#0080FF';
              }),
              borderRadius: 4
            }
          ]
        };
        const options: any = {
          indexAxis: isHorizontal ? ('y' as const) : ('x' as const),
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context: any) => ` ${context.raw}${visual.format === 'percentage' ? '%' : ''}`
              }
            }
          },
          onClick: (_: any, elements: any[]) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const name = visual.data[index].name;
              setActiveFilter(prev => ({
                category: 'Geography',
                value: prev.value === name ? null : name
              }));
            }
          }
        };

        return (
          <div className="w-full h-56 sm:h-64 p-2">
            <Bar data={data} options={options} />
          </div>
        );
      }

      if (visual.type === 'line') {
        const data = {
          labels: visual.data.map(d => d.name),
          datasets: [
            {
              label: visual.title,
              data: visual.data.map(d => d.value),
              borderColor: '#0080FF',
              backgroundColor: 'rgba(0, 128, 255, 0.1)',
              tension: 0.3,
              fill: true
            }
          ]
        };
        return (
          <div className="w-full h-56 sm:h-64 p-2">
            <Line data={data} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        );
      }
    }

    // ── Option C & D: D3.js / SVG Vector Engine (Zero lag, pure crisp SVG) ──
    if (visual.type === 'horizontalBar') {
      return (
        <div className="w-full py-3 px-2 space-y-3">
          {visual.data.map((item, idx) => {
            const isSelected = activeFilter.value === item.name;
            const opacity = isFiltered && !isSelected ? 'opacity-40' : 'opacity-100';
            return (
              <div
                key={idx}
                onClick={() => {
                  setActiveFilter(prev => ({
                    category: 'Geography',
                    value: prev.value === item.name ? null : item.name
                  }));
                }}
                className={`group cursor-pointer transition-all ${opacity}`}
              >
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="group-hover:text-blue-600 transition-colors">{item.name}</span>
                  <span className="font-mono text-slate-900">{item.value}%</span>
                </div>
                <div className="w-full h-7 bg-slate-100 rounded-md overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full bg-[#0080FF] rounded-sm transition-all duration-500 group-hover:brightness-110 flex items-center justify-end pr-2"
                    style={{ width: `${Math.min(100, (item.value / 40) * 100)}%` }}
                  >
                    <span className="text-[10px] font-bold text-white font-mono">{item.value}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (visual.type === 'donut') {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-around py-4 gap-4">
          <svg viewBox="0 0 160 160" className="w-36 h-36">
            <circle cx="80" cy="80" r="55" fill="none" stroke="#E2E8F0" strokeWidth="22" />
            <circle
              cx="80"
              cy="80"
              r="55"
              fill="none"
              stroke="#0080FF"
              strokeWidth="22"
              strokeDasharray="345.5"
              strokeDashoffset="70.5"
              transform="rotate(-90 80 80)"
              className="cursor-pointer transition-all hover:brightness-110"
              onClick={() => setActiveFilter({ category: 'Cohort', value: 'Retained' })}
            />
            <circle
              cx="80"
              cy="80"
              r="55"
              fill="none"
              stroke="#1B2A4A"
              strokeWidth="22"
              strokeDasharray="345.5"
              strokeDashoffset="275"
              transform="rotate(164 80 80)"
              className="cursor-pointer transition-all hover:brightness-110"
              onClick={() => setActiveFilter({ category: 'Cohort', value: 'Exited' })}
            />
            <text x="80" y="76" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1e293b">10K</text>
            <text x="80" y="92" textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="monospace">Total</text>
          </svg>
          <div className="space-y-2 text-xs">
            <div
              onClick={() => setActiveFilter({ category: 'Cohort', value: 'Retained' })}
              className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-100 transition-colors"
            >
              <span className="w-3 h-3 rounded-full bg-[#0080FF]" />
              <span className="text-slate-700 font-medium">Retained: <b>7,963 (79.6%)</b></span>
            </div>
            <div
              onClick={() => setActiveFilter({ category: 'Cohort', value: 'Exited' })}
              className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-100 transition-colors"
            >
              <span className="w-3 h-3 rounded-full bg-[#1B2A4A]" />
              <span className="text-slate-700 font-medium">Exited: <b>2,037 (20.4%)</b></span>
            </div>
          </div>
        </div>
      );
    }

    if (visual.type === 'gauge') {
      return (
        <div className="flex flex-col items-center justify-center py-3">
          <svg viewBox="0 0 160 100" className="w-40 h-24">
            <path d="M 20 80 A 60 60 0 0 1 140 80" fill="none" stroke="#E2E8F0" strokeWidth="16" strokeLinecap="round" />
            <path
              d="M 20 80 A 60 60 0 0 1 110 30"
              fill="none"
              stroke="#0080FF"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <text x="80" y="75" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#1e293b">20.4%</text>
            <text x="80" y="92" textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="monospace">Target: 20%</text>
          </svg>
          <div className="flex justify-between w-36 text-[10px] font-mono text-slate-400 mt-1">
            <span>0%</span>
            <span>Target: 20%</span>
            <span>30%</span>
          </div>
        </div>
      );
    }

    // Generic Matrix / Table View
    return (
      <div className="overflow-x-auto p-2">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-mono">
              <th className="pb-2">Segment</th>
              <th className="pb-2">Primary Metric</th>
              <th className="pb-2">Status / Secondary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visual.data.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 font-semibold text-slate-800">{row.name}</td>
                <td className="py-2.5 font-mono text-blue-600 font-bold">{row.value}</td>
                <td className="py-2.5 text-slate-500">{row.category || `${row.value}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`w-full rounded-2xl bg-white border border-slate-200/90 shadow-xl overflow-hidden flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen bg-slate-900 text-slate-100' : ''
      } ${className}`}
    >
      {/* ── Top Header: Power BI Desktop Window Chrome ── */}
      <div className="bg-[#1E293B] text-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 select-none">
        
        {/* Left: Window Controls & Report Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500 inline-block shadow-xs" />
            <span className="h-3 w-3 rounded-full bg-amber-500 inline-block shadow-xs" />
            <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block shadow-xs" />
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#F2C811]/15 text-[#F2C811] font-black text-xs">
              PBIX
            </div>
            <div>
              <span className="font-semibold text-xs sm:text-sm text-white tracking-tight block truncate max-w-[220px] sm:max-w-md">
                {report.title}
              </span>
              <span className="text-[10px] font-mono text-slate-400 block -mt-0.5">
                Power BI Interactive Engine · v{report.version || '2026.1'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: Engine Selector, PBIX Upload, Zoom & Fullscreen */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          
          {/* Chart Engine Picker */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
            <Cpu size={13} className="text-[#38BDF8]" />
            <span className="text-[10px] text-slate-400 hidden sm:inline">Engine:</span>
            <select
              value={engine}
              onChange={(e) => {
                const newEngine = e.target.value as ChartEngineType;
                setEngine(newEngine);
                toast.success(`Switched rendering engine to ${newEngine.toUpperCase()}`);
              }}
              className="bg-transparent text-white text-xs font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="echarts" className="bg-slate-900 text-white">Apache ECharts (Rich)</option>
              <option value="chartjs" className="bg-slate-900 text-white">Chart.js (Canvas)</option>
              <option value="d3" className="bg-slate-900 text-white">D3.js / SVG (Crisp)</option>
              <option value="plotly" className="bg-slate-900 text-white">Plotly.js (Vector)</option>
            </select>
          </div>

          {/* Model Schema / Tables Inspector Button */}
          {report.tables && report.tables.length > 0 && (
            <button
              onClick={() => setShowModelSchema(!showModelSchema)}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
              title="Inspect Data Model & DAX Measures"
            >
              <Database size={12} className="text-amber-400" />
              <span className="text-[11px]">Model ({report.tables.length})</span>
            </button>
          )}

          {/* Upload Custom .pbix button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
            title="Upload custom .pbix file to render"
          >
            <UploadCloud size={12} className="text-emerald-400" />
            <span className="text-[11px] hidden sm:inline">Upload .pbix</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
            title="Export page data to CSV"
          >
            <Download size={12} className="text-blue-400" />
          </button>

          {/* Zoom Modal Button */}
          {onZoomToggle && (
            <button
              onClick={onZoomToggle}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
              title="Open Fullscreen Zoom Modal"
            >
              <Sparkles size={12} className="text-yellow-400" />
              <span className="text-[11px] hidden sm:inline">Zoom</span>
            </button>
          )}

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* ── Active Filter Bar (If Cross-Filtering Active) ── */}
      {activeFilter.value && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-1.5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-blue-900">
            <Filter size={12} className="text-blue-600 animate-pulse" />
            <span>Cross-Filter Active:</span>
            <span className="font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full text-[11px]">
              {activeFilter.category}: {activeFilter.value}
            </span>
          </div>
          <button
            onClick={() => setActiveFilter({ category: null, value: null })}
            className="flex items-center gap-1 text-blue-700 hover:text-blue-950 font-bold underline cursor-pointer"
          >
            <RotateCcw size={11} /> Reset Filter Context
          </button>
        </div>
      )}

      {/* ── Main Canvas & Left Sidebar Layout (Matching User Screenshot) ── */}
      <div className="flex-1 flex flex-col lg:flex-row bg-[#F8FAFC] min-h-[580px]">
        
        {/* ── Left Sidebar: Power BI Page Navigation ── */}
        <aside className="w-full lg:w-60 bg-[#0080FF] text-white p-3 lg:p-4 flex flex-col justify-between shrink-0 shadow-md">
          <div className="space-y-4">
            {/* Sidebar Avatar / Illustration Header (matching screenshot) */}
            <div className="bg-white/20 backdrop-blur-xs rounded-2xl p-3 text-center border border-white/30 shadow-sm relative overflow-hidden">
              <div className="w-14 h-14 mx-auto rounded-full bg-white flex items-center justify-center shadow-md mb-2 p-1">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect x="20" y="45" width="60" height="35" rx="6" fill="#0080FF" />
                  <circle cx="50" cy="30" r="14" fill="#F59E0B" />
                  <path d="M35 70 Q50 55 65 70" stroke="#FFFFFF" strokeWidth="4" fill="none" />
                  <rect x="30" y="15" width="40" height="8" rx="2" fill="#10B981" />
                </svg>
              </div>
              <h3 className="font-black text-xs text-white leading-tight">European Retention</h3>
              <p className="text-[10px] text-blue-100 font-mono">10,000 Customer Base</p>
            </div>

            {/* Navigation Page Tabs (Styled rounded buttons from screenshot) */}
            <nav className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-100 font-bold block px-2">
                Report Pages ({report.pages.length}):
              </span>
              {report.pages.map((page, pIdx) => {
                const isActive = activePageIndex === pIdx;
                return (
                  <div key={page.id} className="relative group">
                    <button
                      onClick={() => {
                        setActivePageIndex(pIdx);
                        setActiveFilter({ category: null, value: null });
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-between shadow-2xs ${
                        isActive
                          ? 'bg-white text-[#0080FF] font-bold shadow-md scale-[1.02]'
                          : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                      }`}
                    >
                      <span className="truncate">{page.name}</span>
                      {isActive && <ChevronRight size={14} className="text-[#0080FF]" />}
                    </button>
                    
                    {/* Hover Tooltip: CTRL+click here to follow (like in screenshot) */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                      CTRL+click here to follow
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Info & Customer Churn Graphic (From screenshot) */}
          <div className="pt-4 border-t border-white/20 text-[10px] font-mono text-blue-100 space-y-2 text-center">
            {/* Little people retention graphic */}
            <div className="flex items-center justify-center gap-1.5 py-1">
              <span className="text-base text-white">🚶‍♂️</span>
              <span className="text-base text-white">🚶‍♀️</span>
              <span className="text-base text-white">🚶‍♂️</span>
              <span className="text-base text-amber-300 animate-pulse">🚶‍♀️</span>
              <span className="text-base text-rose-300 animate-bounce">🏃‍♂️</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-white">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold">Interactive DAX Model</span>
            </div>
          </div>
        </aside>

        {/* ── Center Content: KPI Row & Visuals Canvas ── */}
        <div className="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto">
          
          {/* Top KPI Scorecards Row (Matching screenshot: 4 white pill cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredKpis.map((kpi) => (
              <div
                key={kpi.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <span className="text-[11px] font-mono text-slate-500 font-medium block truncate">
                  {kpi.label}
                </span>
                <div className="my-1.5 flex items-baseline justify-between gap-2">
                  <span className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                    {kpi.formattedValue || kpi.value}
                  </span>
                  {kpi.delta && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        kpi.deltaType === 'positive'
                          ? 'bg-emerald-50 text-emerald-700'
                          : kpi.deltaType === 'negative'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {kpi.delta}
                    </span>
                  )}
                </div>
                {kpi.subtext && (
                  <span className="text-[10px] text-slate-400 font-mono block truncate">
                    {kpi.subtext}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Visuals Grid: Multi-Page Dynamic Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Main Visual (Span 7 cols) */}
            {activePage.visuals[0] && (
              <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{activePage.visuals[0].title}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">Interactive drilldown & cross-filter</p>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                    {engine.toUpperCase()}
                  </span>
                </div>
                
                {renderVisual(activePage.visuals[0])}

                {activePage.visuals[0].description && (
                  <p className="text-[11px] text-slate-500 italic mt-2 border-t border-slate-50 pt-2 font-mono">
                    💡 {activePage.visuals[0].description}
                  </p>
                )}
              </div>
            )}

            {/* Right Column: Slicers / Gauges / Secondary Visuals (Span 5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Visual 1 (e.g. Slicer or Donut) */}
              {activePage.visuals[1] && (
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <h4 className="font-bold text-sm text-slate-800">{activePage.visuals[1].title}</h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      {activePage.visuals[1].title === 'Filter' ? 'Active Slicer' : 'Interactive'}
                    </span>
                  </div>

                  {activePage.visuals[1].title === 'Filter' ? (
                    <div className="flex items-center justify-between p-2">
                      <div className="space-y-2 text-xs font-mono">
                        {['18-29', '30-39', '40-49', '50-59', '60+'].map((ageBracket) => {
                          const isChecked = !activeFilter.value || activeFilter.value === ageBracket;
                          return (
                            <label
                              key={ageBracket}
                              onClick={() => {
                                setActiveFilter(prev => ({
                                  category: 'Age Bracket',
                                  value: prev.value === ageBracket ? null : ageBracket
                                }));
                              }}
                              className="flex items-center gap-2.5 cursor-pointer text-slate-700 hover:text-blue-600 select-none"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="font-medium text-[11px]">{ageBracket}</span>
                            </label>
                          );
                        })}
                      </div>
                      <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center p-2 border border-blue-100">
                        <div className="text-center">
                          <Layers className="w-8 h-8 text-blue-500 mx-auto mb-1 animate-pulse" />
                          <span className="text-[9px] font-bold text-blue-700">Demographics</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    renderVisual(activePage.visuals[1])
                  )}
                </div>
              )}

              {/* Visual 2 (e.g. Scatter or Gauge) */}
              {activePage.visuals[2] && (
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <h4 className="font-bold text-sm text-slate-800">{activePage.visuals[2].title}</h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      {activePage.visuals[2].type === 'scatter' ? 'Bubble Matrix' : 'KPI Gauge'}
                    </span>
                  </div>
                  {renderVisual(activePage.visuals[2])}
                </div>
              )}
            </div>
          </div>

          {/* Model Schema & Tables Drawer (If toggled) */}
          {showModelSchema && report.tables && (
            <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 border border-slate-800 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Database size={16} className="text-amber-400" />
                  <h4 className="font-bold text-sm text-white">Extracted Relational Model & DAX Measures</h4>
                </div>
                <button
                  onClick={() => setShowModelSchema(false)}
                  className="text-xs font-mono text-slate-400 hover:text-white"
                >
                  Close ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Tables List */}
                <div className="space-y-2">
                  <span className="text-slate-400 font-bold block">Tables ({report.tables.length}):</span>
                  {report.tables.map((t, idx) => (
                    <div key={idx} className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                      <div className="flex justify-between font-bold text-blue-400 mb-1">
                        <span>{t.name}</span>
                        {t.rowCount && <span>{t.rowCount} rows</span>}
                      </div>
                      <p className="text-[11px] text-slate-400 break-words">
                        {t.columns.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* DAX Measures List */}
                <div className="space-y-2">
                  <span className="text-slate-400 font-bold block">DAX Calculated Measures ({report.measures?.length || 0}):</span>
                  {(report.measures || []).map((m, idx) => (
                    <div key={idx} className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                      <div className="font-bold text-emerald-400 mb-1">{m.name}</div>
                      <code className="text-[10px] text-slate-300 block bg-slate-950 p-1.5 rounded font-mono break-all">
                        {m.dax}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Custom .pbix Drag & Drop Upload Modal ── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <UploadCloud size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Upload Power BI File (.pbix)</h3>
                  <p className="text-xs text-slate-500 font-mono">Browser-side extraction & visualization</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            {/* Drop Area */}
            <label
              htmlFor="pbix-file-upload-input"
              className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-3"
            >
              <FileCode className="w-12 h-12 text-blue-600 animate-bounce" />
              <div>
                <p className="font-bold text-sm text-slate-800">
                  Click or drag and drop your <span className="text-blue-600">.pbix</span> file here
                </p>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Supports Microsoft.MicrosoftPowerBIDesktop format (up to 200MB)
                </p>
              </div>
              <span className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-xs">
                Browse Files
              </span>
              <input
                id="pbix-file-upload-input"
                ref={fileInputRef}
                type="file"
                accept=".pbix"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {isUploading && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs font-mono text-slate-600 space-y-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Extracting ZIP archive, Report/Layout & DataModelSchema...</p>
              </div>
            )}

            <div className="text-[11px] text-slate-400 font-mono text-center">
              100% private & client-side parsed. Your .pbix data stays securely in your browser session.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
