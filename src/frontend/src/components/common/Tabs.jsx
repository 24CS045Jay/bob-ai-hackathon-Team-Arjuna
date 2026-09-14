import { motion } from 'framer-motion'
import { buttonPressInteraction } from '../../utils/motion.js'

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pills',
  className = ''
}) {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-1 ${
        variant === 'pills' ? 'p-1 glass rounded-xl border border-line' : 'border-b border-line'
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <motion.button
            whileTap={buttonPressInteraction}
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`transition-colors text-xs font-semibold select-none flex items-center gap-2 ${
              variant === 'pills'
                ? isActive
                  ? 'bg-brand text-white shadow-[0_0_12px_rgba(59,124,246,0.3)] rounded-lg px-3 py-1.5'
                  : 'text-inksoft hover:text-ink hover:bg-obsidian-800/60 rounded-lg px-3 py-1.5'
                : isActive
                ? 'text-brand-glow border-b-2 border-brand pb-2 pt-1 px-3 -mb-[1px]'
                : 'text-inksoft hover:text-ink pb-2 pt-1 px-3'
            }`}
          >
            {tab.icon && <span className="flex-none">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  variant === 'pills'
                    ? isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-obsidian-700/60 text-inksoft'
                    : isActive
                    ? 'bg-brand/20 text-brand-glow'
                    : 'bg-line/40 text-inksoft'
                }`}
              >
                {tab.count}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
