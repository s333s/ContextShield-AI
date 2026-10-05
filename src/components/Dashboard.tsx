import { useMemo } from 'react';
import {
  DEMO_STATS, DEMO_EXPOSURE_OVER_TIME, DEMO_CATEGORY_DISTRIBUTION,
  DEMO_PROTECTION_RATE,
} from '@/analyzers/demoData';
import {
  Shield, ShieldCheck, AlertTriangle, TrendingDown,
  BarChart3, PieChart as PieIcon, Activity,
} from 'lucide-react';

export function Dashboard() {
  const stats = useMemo(() => [
    {
      label: 'Total Prompts',
      value: DEMO_STATS.promptsAnalyzed,
      icon: Shield,
      color: 'text-cyber-400',
      bg: 'bg-cyber-500/10',
      border: 'border-cyber-500/30',
    },
    {
      label: 'Sensitive Details Blocked',
      value: DEMO_STATS.sensitiveDetailsDetected,
      icon: AlertTriangle,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
    },
    {
      label: 'Average Privacy Score',
      value: `${DEMO_STATS.averageExposureReduced}%`,
      suffix: 'reduced',
      icon: TrendingDown,
      color: 'text-shield-400',
      bg: 'bg-shield-500/10',
      border: 'border-shield-500/30',
    },
    {
      label: 'Protection Rate',
      value: `${Math.round((DEMO_STATS.promptsProtected / DEMO_STATS.promptsAnalyzed) * 100)}%`,
      icon: ShieldCheck,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
    },
  ], []);

  const maxExposure = Math.max(...DEMO_EXPOSURE_OVER_TIME.map((d) => d.value));
  const totalCategories = DEMO_CATEGORY_DISTRIBUTION.reduce((s, d) => s + d.count, 0);
  const totalProtection = DEMO_PROTECTION_RATE.reduce((s, d) => s + d.value, 0);

  // SVG donut chart for category distribution
  let cumulativePercent = 0;
  const donutSegments = DEMO_CATEGORY_DISTRIBUTION.map((d) => {
    const percent = (d.count / totalCategories) * 100;
    const startAngle = (cumulativePercent / 100) * 360;
    const endAngle = ((cumulativePercent + percent) / 100) * 360;
    cumulativePercent += percent;
    return { ...d, percent, startAngle, endAngle };
  });

  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="glass-card p-4 hover:scale-[1.02] transition-transform animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`inline-flex p-2 rounded-lg border ${stat.bg} ${stat.border} mb-3`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-dark-100">{stat.value}</p>
              <p className="text-xs text-dark-400 mt-1">{stat.label}</p>
              {stat.suffix && (
                <p className="text-[10px] text-dark-500 mt-0.5">{stat.suffix}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Exposure over time */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-cyber-400" />
            <h3 className="text-sm font-semibold text-dark-200">Privacy Exposure Over Time</h3>
          </div>
          <div className="flex items-end justify-between gap-2 h-40">
            {DEMO_EXPOSURE_OVER_TIME.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex items-end justify-center h-full">
                  <div
                    className="w-full max-w-[40px] rounded-t-md transition-all duration-500 hover:brightness-125 relative"
                    style={{
                      height: `${(d.value / maxExposure) * 100}%`,
                      background: `linear-gradient(to top, ${
                        d.value > 80 ? '#dc2626' :
                        d.value > 60 ? '#f97316' :
                        d.value > 40 ? '#eab308' : '#22c55e'
                      }, ${d.value > 80 ? '#ef4444' :
                        d.value > 60 ? '#fb923c' :
                        d.value > 40 ? '#facc15' : '#4ade80'})`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-dark-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.value}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-dark-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category distribution donut */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="w-4 h-4 text-cyber-400" />
            <h3 className="text-sm font-semibold text-dark-200">Sensitive Category Distribution</h3>
          </div>
          <div className="flex items-center gap-6">
            <svg width="140" height="140" viewBox="0 0 140 140" className="flex-shrink-0">
              {donutSegments.map((seg, i) => (
                <path
                  key={i}
                  d={describeArc(70, 70, 55, seg.startAngle, seg.endAngle)}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="16"
                  strokeLinecap="round"
                  className="hover:brightness-125 transition-all cursor-pointer"
                >
                  <title>{`${seg.category}: ${seg.count} (${Math.round(seg.percent)}%)`}</title>
                </path>
              ))}
              <text x="70" y="66" textAnchor="middle" className="fill-dark-100 text-2xl font-bold">
                {totalCategories}
              </text>
              <text x="70" y="82" textAnchor="middle" className="fill-dark-400 text-[10px]">
                total items
              </text>
            </svg>
            <div className="flex-1 space-y-2">
              {DEMO_CATEGORY_DISTRIBUTION.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: d.color }} />
                  <span className="text-xs text-dark-300 flex-1">{d.category}</span>
                  <span className="text-xs font-semibold text-dark-100">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Protected vs Unprotected */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-shield-400" />
          <h3 className="text-sm font-semibold text-dark-200">Protected vs Unprotected Prompts</h3>
        </div>
        <div className="flex h-8 rounded-lg overflow-hidden">
          {DEMO_PROTECTION_RATE.map((d, i) => {
            const percent = (d.value / totalProtection) * 100;
            return (
              <div
                key={i}
                className="flex items-center justify-center transition-all duration-700"
                style={{
                  width: `${percent}%`,
                  background: d.label === 'Protected' ? '#22c55e' : '#475569',
                }}
              >
                <span className="text-xs font-semibold text-white">
                  {d.value} ({Math.round(percent)}%)
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-6 mt-3">
          {DEMO_PROTECTION_RATE.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: d.label === 'Protected' ? '#22c55e' : '#475569' }}
              />
              <span className="text-xs text-dark-300">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy notice */}
      <div className="glass-card p-4 border-l-4 border-l-shield-500/50">
        <div className="flex items-start gap-3">
          <Shield className="w-4 h-4 text-shield-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-dark-400 leading-relaxed">
            All statistics shown here are stored locally in your browser and are based on anonymized counts only.
            ContextShield never stores or uploads your actual prompts. Raw prompt text is processed in-memory and
            discarded immediately after analysis.
          </p>
        </div>
      </div>
    </div>
  );
}
