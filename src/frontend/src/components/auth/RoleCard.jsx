import { motion } from 'framer-motion'
import { buttonPressInteraction } from '../../utils/motion.js'

export default function RoleCard({ role, onSelect }) {
  const roleSummaries = {
    admin: {
      desc: 'Full dispatch control & operational overrides.',
      chips: ['Master Overrides', 'System Config'],
    },
    shift_supervisor: {
      desc: '72h rolling plans & quay crane gang allocations.',
      chips: ['Plan Approval', 'Crane Dispatch'],
    },
    berth_planner: {
      desc: 'Quayside vessel allocations & hydrographic UKC.',
      chips: ['Berth Schedule', 'UKC Validation'],
    },
    gate_controller: {
      desc: 'Truck OCR lanes & intermodal drayage flow.',
      chips: ['Gate Ingress', 'Queue Diversion'],
    },
    viewer: {
      desc: 'Read-only maritime digital twin telemetry.',
      chips: ['Live Tracking', 'Read Only'],
    },
  }

  const roleMeta = roleSummaries[role.code] || {
    desc: role.description?.slice(0, 50) + '...',
    chips: ['Standard Role'],
  }

  return (
    <motion.button
      whileTap={buttonPressInteraction}
      onClick={() => onSelect(role.code)}
      className="group text-left bg-surface rounded-2xl p-5 border border-line hover:border-brand/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full cursor-pointer"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded-full border border-brand/20">
            {role.tag}
          </span>
          <span className="w-7 h-7 rounded-full bg-slate-100 border border-line text-ink flex items-center justify-center text-xs font-bold font-sans">
            {role.initials}
          </span>
        </div>

        <h4 className="text-sm font-bold text-ink mb-1 group-hover:text-brand transition-colors">
          {role.title}
        </h4>
        <p className="text-xs text-inksoft leading-snug mb-3">
          {roleMeta.desc}
        </p>
      </div>

      <div className="border-t border-line pt-3 w-full">
        <div className="flex items-center gap-1.5 mb-3">
          {roleMeta.chips.map((chip, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2 py-0.5 rounded-full bg-slate-50 text-inksoft border border-line font-medium"
            >
              {chip}
            </span>
          ))}
        </div>
        <span className="text-xs font-semibold text-brand flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Enter as {role.initials} →
        </span>
      </div>
    </motion.button>
  )
}
