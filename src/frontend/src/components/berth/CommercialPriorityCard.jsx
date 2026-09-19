import { motion } from 'framer-motion'
import { useOperationalContext } from '../../context/OperationalContext.jsx'
import { buttonPressInteraction } from '../../utils/motion.js'

export default function CommercialPriorityCard() {
  const { commercialStrategy, setCommercialStrategy, vessels } = useOperationalContext()

  // Find the US and Vietnam ships
  const usShip = vessels.find((v) => v.id === 'v9' || v.originCountry === 'United States') || {
    name: 'MV American Eagle',
    originCountry: 'United States',
    flag: '🇺🇸',
    billingCurrency: 'USD',
    hourlyWaitingRateUSD: 3450,
    localCurrencyRatePerHour: '$3,450 / hr'
  }

  const vnShip = vessels.find((v) => v.id === 'v10' || v.originCountry === 'Vietnam') || {
    name: 'MV Hai Phong Star',
    originCountry: 'Vietnam',
    flag: '🇻🇳',
    billingCurrency: 'VND',
    hourlyWaitingRateUSD: 420,
    localCurrencyRatePerHour: '10,500,000 ₫ / hr'
  }

  const isRevenueMax = commercialStrategy === 'revenue_max'

  return (
    <div className="rounded-3xl border border-sky-300 dark:border-sky-800/80 bg-gradient-to-br from-sky-50 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-sky-950/30 p-5 sm:p-6 shadow-sm space-y-4 font-sans select-none">
      {/* Header & Policy Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-sky-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
              Commercial Optimization Solver
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              USD vs. Foreign Currency Tariff Engine
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-ink tracking-tight">
            Currency-Weighted Berth Priority &amp; Demurrage Policy
          </h3>
          <p className="text-xs text-inksoft max-w-2xl leading-relaxed">
            Configure how the discrete optimization solver resolves concurrent vessel arrivals when billing currencies have disparate exchange values.
          </p>
        </div>

        {/* Strategy Selector Pills */}
        <div className="flex items-center gap-2 bg-slate-200/70 dark:bg-slate-800 p-1.5 rounded-2xl border border-line shrink-0">
          <button
            onClick={() => setCommercialStrategy('revenue_max')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isRevenueMax
                ? 'bg-[#0085db] text-white shadow-sm'
                : 'text-inksoft hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            <span>💵</span>
            <span>Port Revenue Maximization</span>
            <span className="text-[10px] opacity-80 font-normal hidden sm:inline">(Hold USD Ship)</span>
          </button>

          <button
            onClick={() => setCommercialStrategy('cost_min')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              !isRevenueMax
                ? 'bg-[#0085db] text-white shadow-sm'
                : 'text-inksoft hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            <span>⚡</span>
            <span>Carrier Demurrage Minimization</span>
            <span className="text-[10px] opacity-80 font-normal hidden sm:inline">(Clear USD First)</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Vessel Commercial Comparison Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* US Vessel Card */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isRevenueMax 
            ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-xs' 
            : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-xs'
        }`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{usShip.flag}</span>
              <div>
                <span className="text-sm font-extrabold text-ink block">{usShip.name}</span>
                <span className="text-xs text-inksoft font-medium">{usShip.originCountry} • Transpacific Line</span>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-surface border border-line shadow-xs">
              Billed: <b className="text-[#0085db]">{usShip.billingCurrency} ($)</b>
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-line/60 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-inksoft block text-[11px]">Contract Waiting Fee:</span>
              <span className="font-extrabold text-ink text-sm text-emerald-600 dark:text-emerald-400">
                {usShip.localCurrencyRatePerHour}
              </span>
            </div>
            <div>
              <span className="text-inksoft block text-[11px]">Normalized USD Value:</span>
              <span className="font-bold text-ink">
                ${usShip.hourlyWaitingRateUSD.toLocaleString()}/hr
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-inksoft">Assigned Solver Action:</span>
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
              isRevenueMax
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
            }`}>
              {isRevenueMax ? '⏳ Hold in Anchorage (Earns +$3,450/hr)' : '🚢 Berth Assigned (Priority #1)'}
            </span>
          </div>
        </div>

        {/* Vietnam Vessel Card */}
        <div className={`p-4 rounded-2xl border transition-all ${
          !isRevenueMax 
            ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-xs' 
            : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-xs'
        }`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{vnShip.flag}</span>
              <div>
                <span className="text-sm font-extrabold text-ink block">{vnShip.name}</span>
                <span className="text-xs text-inksoft font-medium">{vnShip.originCountry} • Regional Feeder</span>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-surface border border-line shadow-xs">
              Billed: <b className="text-purple-600 dark:text-purple-400">{vnShip.billingCurrency} (₫)</b>
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-line/60 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-inksoft block text-[11px]">Contract Waiting Fee:</span>
              <span className="font-extrabold text-ink text-sm">
                {vnShip.localCurrencyRatePerHour}
              </span>
            </div>
            <div>
              <span className="text-inksoft block text-[11px]">Normalized USD Value:</span>
              <span className="font-bold text-ink">
                ${vnShip.hourlyWaitingRateUSD.toLocaleString()}/hr
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-inksoft">Assigned Solver Action:</span>
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
              !isRevenueMax
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
            }`}>
              {!isRevenueMax ? '⏳ Hold in Anchorage' : '🚢 Berth Assigned (Priority #1)'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Explanatory Banner for Mentor Presentation */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-line flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-[#0085db] flex items-center justify-center font-bold text-sm shrink-0">
          💡
        </div>
        <p className="text-xs text-ink leading-relaxed">
          {isRevenueMax ? (
            <span>
              <b>Current Strategy: Port Demurrage Revenue Maximization.</b> Because the American ship pays in <b>US Dollars ($3,450/hr)</b> and the Vietnamese ship pays in <b>VND (~$420/hr USD equivalent)</b>, the port generates <b>8.2× higher revenue</b> by letting the American vessel wait at anchorage while berthing the Vietnamese ship first.
            </span>
          ) : (
            <span>
              <b>Current Strategy: Carrier Demurrage Minimization.</b> The solver clears the American ship immediately to avoid contractual demurrage damages of <b>$82,800/day</b>, accepting a minor delay on the lower-tariff Vietnamese feeder.
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
