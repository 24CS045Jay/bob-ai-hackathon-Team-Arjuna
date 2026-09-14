import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '../components/layout/AppShell.jsx'
import { SHIP_DATASHEETS, CARGO_TYPES, SHIP_TYPES, FLAGS } from '../data/datasheet.mock.js'
import { buttonPressInteraction } from '../utils/motion.js'

const STATUS_STYLES = {
  active:   { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', label: 'Active' },
  docked:   { bg: 'bg-sky-50 dark:bg-sky-950/40',     text: 'text-sky-700 dark:text-sky-400',     border: 'border-sky-200 dark:border-sky-800',     label: 'Docked' },
  queued:   { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', label: 'Queued' },
  arriving: { bg: 'bg-purple-50 dark:bg-purple-950/40',text: 'text-purple-700 dark:text-purple-400',border: 'border-purple-200 dark:border-purple-800', label: 'Arriving' },
  departed: { bg: 'bg-slate-100 dark:bg-slate-800',   text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700', label: 'Departed' },
}

const EMPTY_SHIP = {
  shipName: '', imo: '', flag: 'Singapore', type: 'Container Ship',
  grossTonnage: '', teu: '', lengthM: '', beamM: '', draftM: '',
  yearBuilt: '', classification: '', owner: '', operator: '',
  status: 'active', lastPort: '', nextPort: '', cargo: []
}

const EMPTY_CARGO = {
  containerId: '', type: 'General Cargo', weightTons: '',
  destination: '', hazmat: false, reefer: false, status: 'loaded'
}

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function DatasheetPage() {
  const [sheets, setSheets] = useState(SHIP_DATASHEETS)
  const [selectedId, setSelectedId] = useState(SHIP_DATASHEETS[0]?.id || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modal state
  const [shipModal, setShipModal] = useState({ open: false, mode: 'add', data: null })
  const [cargoModal, setCargoModal] = useState({ open: false, mode: 'add', data: null, shipId: null })
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: null, id: null, shipId: null })

  // Form state
  const [shipForm, setShipForm] = useState(EMPTY_SHIP)
  const [cargoForm, setCargoForm] = useState(EMPTY_CARGO)

  const selected = sheets.find((s) => s.id === selectedId) || sheets[0]

  const filtered = sheets.filter((s) => {
    const q = searchQuery.toLowerCase()
    const matchQ = !q || s.shipName.toLowerCase().includes(q) || s.imo.toLowerCase().includes(q) || s.owner.toLowerCase().includes(q)
    const matchS = statusFilter === 'all' || s.status === statusFilter
    return matchQ && matchS
  })

  // --- Ship CRUD ---
  const openAddShip = () => {
    setShipForm({ ...EMPTY_SHIP })
    setShipModal({ open: true, mode: 'add', data: null })
  }
  const openEditShip = (ship) => {
    setShipForm({ ...ship })
    setShipModal({ open: true, mode: 'edit', data: ship })
  }
  const saveShip = () => {
    if (!shipForm.shipName.trim() || !shipForm.imo.trim()) return
    if (shipModal.mode === 'add') {
      const newShip = { ...shipForm, id: generateId('ds'), cargo: [] }
      setSheets((prev) => [...prev, newShip])
      setSelectedId(newShip.id)
    } else {
      setSheets((prev) => prev.map((s) => s.id === shipModal.data.id ? { ...s, ...shipForm } : s))
    }
    setShipModal({ open: false, mode: 'add', data: null })
  }
  const confirmDeleteShip = (id) => setDeleteConfirm({ open: true, type: 'ship', id, shipId: null })
  const deleteShip = () => {
    const { id } = deleteConfirm
    setSheets((prev) => prev.filter((s) => s.id !== id))
    if (selectedId === id) setSelectedId(sheets.find((s) => s.id !== id)?.id || null)
    setDeleteConfirm({ open: false, type: null, id: null, shipId: null })
  }

  // --- Cargo CRUD ---
  const openAddCargo = (shipId) => {
    setCargoForm({ ...EMPTY_CARGO })
    setCargoModal({ open: true, mode: 'add', data: null, shipId })
  }
  const openEditCargo = (cargo, shipId) => {
    setCargoForm({ ...cargo })
    setCargoModal({ open: true, mode: 'edit', data: cargo, shipId })
  }
  const saveCargo = () => {
    if (!cargoForm.containerId.trim()) return
    const { shipId, mode } = cargoModal
    setSheets((prev) => prev.map((s) => {
      if (s.id !== shipId) return s
      if (mode === 'add') {
        return { ...s, cargo: [...s.cargo, { ...cargoForm, id: generateId('c') }] }
      } else {
        return { ...s, cargo: s.cargo.map((c) => c.id === cargoModal.data.id ? { ...c, ...cargoForm } : c) }
      }
    }))
    setCargoModal({ open: false, mode: 'add', data: null, shipId: null })
  }
  const confirmDeleteCargo = (cargoId, shipId) => setDeleteConfirm({ open: true, type: 'cargo', id: cargoId, shipId })
  const deleteCargo = () => {
    const { id, shipId } = deleteConfirm
    setSheets((prev) => prev.map((s) => s.id === shipId ? { ...s, cargo: s.cargo.filter((c) => c.id !== id) } : s))
    setDeleteConfirm({ open: false, type: null, id: null, shipId: null })
  }

  return (
    <AppShell crumb="Ship & Cargo Datasheet">
      <div className="space-y-5 max-w-[1680px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-3xl border border-line shadow-xs">
          <div>
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <span className="text-xs font-bold text-[#0085db] bg-sky-100 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                Ship &amp; Cargo Registry
              </span>
              <span className="text-xs text-inksoft font-medium">Full CRUD · Vessel Manifest · Cargo Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
              Ship &amp; Cargo Datasheet
            </h2>
            <p className="text-sm text-inksoft mt-1 leading-relaxed">
              Manage vessel records and their full cargo manifests. Add, edit, or remove ship datasheets and individual cargo entries.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-xs font-semibold text-inksoft bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-line">
              <span className="text-ink font-bold">{sheets.length}</span> Ships &nbsp;·&nbsp;
              <span className="text-ink font-bold">{sheets.reduce((a, s) => a + s.cargo.length, 0)}</span> Cargo Entries
            </div>
            <motion.button
              whileTap={buttonPressInteraction}
              onClick={openAddShip}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#0085db] hover:bg-[#0074c2] text-white text-xs font-bold transition-all shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add Ship
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT: Ship List */}
          <div className="lg:col-span-4 bg-surface rounded-3xl border border-line shadow-xs flex flex-col overflow-hidden">
            <div className="p-4 border-b border-line space-y-3 bg-slate-50/70 dark:bg-slate-800/40">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ship, IMO, owner…"
                  className="w-full bg-white dark:bg-slate-900 border border-line rounded-xl pl-8 pr-3 py-2 text-xs text-ink placeholder:text-inksoft/60 focus:outline-none focus:border-[#0085db]/50 transition-colors"
                />
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-inksoft pointer-events-none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-0.5">
                {['all', 'active', 'docked', 'queued', 'arriving', 'departed'].map((st) => (
                  <button key={st} onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${statusFilter === st ? 'bg-[#0085db] text-white shadow-xs' : 'text-inksoft hover:text-ink hover:bg-slate-200 dark:hover:bg-slate-700 bg-white dark:bg-slate-800'}`}>
                    {st === 'all' ? 'All' : STATUS_STYLES[st]?.label || st}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-line max-h-[680px]">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-xs text-inksoft">No ships matching query</div>
              ) : filtered.map((ship) => {
                const st = STATUS_STYLES[ship.status] || STATUS_STYLES.active
                return (
                  <button key={ship.id} onClick={() => setSelectedId(ship.id)}
                    className={`w-full text-left p-4 transition-all flex items-start justify-between gap-3 cursor-pointer ${selectedId === ship.id ? 'bg-sky-50 dark:bg-sky-950/40 border-l-4 border-[#0085db]' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-ink truncate">{ship.shipName}</div>
                      <div className="text-xs text-inksoft truncate mt-0.5">{ship.imo} · {ship.operator}</div>
                      <div className="text-[11px] text-inksoft/80 mt-1">{ship.teu.toLocaleString()} TEU · {ship.type}</div>
                    </div>
                    <div className="flex-none text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}>{st.label}</span>
                      <div className="text-[11px] text-inksoft mt-1">{ship.cargo.length} cargo</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* RIGHT: Ship Detail + Cargo Table */}
          {selected ? (
            <div className="lg:col-span-8 space-y-5">
              {/* Ship Detail Card */}
              <div className="bg-surface rounded-3xl p-5 sm:p-6 border border-line shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-line pb-5 mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${(STATUS_STYLES[selected.status] || STATUS_STYLES.active).bg} ${(STATUS_STYLES[selected.status] || STATUS_STYLES.active).text} ${(STATUS_STYLES[selected.status] || STATUS_STYLES.active).border}`}>
                        {(STATUS_STYLES[selected.status] || STATUS_STYLES.active).label}
                      </span>
                      <span className="text-xs text-inksoft font-medium">{selected.flag}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-ink">{selected.shipName}</h3>
                    <p className="text-xs text-inksoft mt-1">{selected.imo} · {selected.classification}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button whileTap={buttonPressInteraction} onClick={() => openEditShip(selected)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-ink transition-all border border-line">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      Edit
                    </motion.button>
                    <motion.button whileTap={buttonPressInteraction} onClick={() => confirmDeleteShip(selected.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-xs font-bold text-rose-600 dark:text-rose-400 transition-all border border-rose-200 dark:border-rose-900">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      Delete
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Ship Type', value: selected.type },
                    { label: 'Owner', value: selected.owner },
                    { label: 'Operator', value: selected.operator },
                    { label: 'Year Built', value: selected.yearBuilt },
                    { label: 'Gross Tonnage', value: `${selected.grossTonnage?.toLocaleString()} GT` },
                    { label: 'Capacity', value: `${selected.teu?.toLocaleString()} TEU` },
                    { label: 'Length × Beam', value: `${selected.lengthM}m × ${selected.beamM}m` },
                    { label: 'Max Draft', value: `${selected.draftM}m` },
                    { label: 'Last Port', value: selected.lastPort },
                    { label: 'Next Port', value: selected.nextPort },
                    { label: 'Classification', value: selected.classification },
                    { label: 'Flag State', value: selected.flag },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-line">
                      <span className="text-[10px] font-bold text-inksoft uppercase tracking-wider block mb-1">{label}</span>
                      <span className="text-xs font-semibold text-ink leading-tight block">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cargo Manifest Table */}
              <div className="bg-surface rounded-3xl border border-line shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-line flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40">
                  <div>
                    <h4 className="text-sm font-bold text-ink">Cargo Manifest</h4>
                    <p className="text-xs text-inksoft mt-0.5">{selected.cargo.length} cargo entries for {selected.shipName}</p>
                  </div>
                  <motion.button whileTap={buttonPressInteraction} onClick={() => openAddCargo(selected.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0085db] hover:bg-[#0074c2] text-white text-xs font-bold transition-all shadow-sm">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Cargo
                  </motion.button>
                </div>
                {selected.cargo.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="text-4xl mb-3">📦</div>
                    <div className="text-sm font-bold text-ink mb-1">No cargo entries</div>
                    <div className="text-xs text-inksoft">Click "Add Cargo" to create the first manifest entry.</div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-line bg-slate-50/50 dark:bg-slate-800/30">
                          <th className="text-left px-4 py-3 font-bold text-inksoft uppercase tracking-wider">Container ID</th>
                          <th className="text-left px-4 py-3 font-bold text-inksoft uppercase tracking-wider">Type</th>
                          <th className="text-left px-4 py-3 font-bold text-inksoft uppercase tracking-wider">Weight (T)</th>
                          <th className="text-left px-4 py-3 font-bold text-inksoft uppercase tracking-wider">Destination</th>
                          <th className="text-left px-4 py-3 font-bold text-inksoft uppercase tracking-wider">Flags</th>
                          <th className="text-left px-4 py-3 font-bold text-inksoft uppercase tracking-wider">Status</th>
                          <th className="text-left px-4 py-3 font-bold text-inksoft uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {selected.cargo.map((cargo) => (
                          <tr key={cargo.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-3 font-mono font-semibold text-ink">{cargo.containerId}</td>
                            <td className="px-4 py-3 text-inksoft">{cargo.type}</td>
                            <td className="px-4 py-3 font-mono text-ink">{Number(cargo.weightTons).toLocaleString()}</td>
                            <td className="px-4 py-3 text-inksoft max-w-[160px] truncate">{cargo.destination}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                {cargo.hazmat && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">HAZMAT</span>}
                                {cargo.reefer && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800">REEFER</span>}
                                {!cargo.hazmat && !cargo.reefer && <span className="text-[10px] text-inksoft/60">—</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cargo.status === 'loaded' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : cargo.status === 'discharging' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                                {cargo.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => openEditCargo(cargo, selected.id)}
                                  className="p-1.5 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-950/40 text-inksoft hover:text-[#0085db] transition-colors">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </button>
                                <button onClick={() => confirmDeleteCargo(cargo.id, selected.id)}
                                  className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-inksoft hover:text-rose-600 transition-colors">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="lg:col-span-8 flex items-center justify-center bg-surface rounded-3xl border border-line p-16 text-center">
              <div>
                <div className="text-5xl mb-4">🚢</div>
                <div className="text-sm font-bold text-ink mb-1">No ship selected</div>
                <div className="text-xs text-inksoft">Select a ship from the list or add a new one.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- Ship Modal (Add / Edit) ---- */}
      <AnimatePresence>
        {shipModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface rounded-3xl border border-line shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-surface border-b border-line px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                <h3 className="text-base font-extrabold text-ink">{shipModal.mode === 'add' ? 'Add New Ship' : 'Edit Ship Record'}</h3>
                <button onClick={() => setShipModal({ open: false, mode: 'add', data: null })}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-inksoft hover:text-ink transition-colors">✕</button>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'shipName', label: 'Ship Name *', type: 'text', placeholder: 'e.g. MV Kestrel Bay' },
                    { key: 'imo', label: 'IMO Number *', type: 'text', placeholder: 'e.g. IMO 9412233' },
                    { key: 'owner', label: 'Owner', type: 'text', placeholder: 'Shipping company' },
                    { key: 'operator', label: 'Operator', type: 'text', placeholder: 'Operator name' },
                    { key: 'grossTonnage', label: 'Gross Tonnage (GT)', type: 'number', placeholder: '84500' },
                    { key: 'teu', label: 'TEU Capacity', type: 'number', placeholder: '8450' },
                    { key: 'lengthM', label: 'Length (m)', type: 'number', placeholder: '300' },
                    { key: 'beamM', label: 'Beam (m)', type: 'number', placeholder: '48.2' },
                    { key: 'draftM', label: 'Max Draft (m)', type: 'number', placeholder: '14.2' },
                    { key: 'yearBuilt', label: 'Year Built', type: 'number', placeholder: '2019' },
                    { key: 'classification', label: 'Classification Society', type: 'text', placeholder: "Lloyd's Register" },
                    { key: 'lastPort', label: 'Last Port', type: 'text', placeholder: 'Rotterdam Maasvlakte' },
                    { key: 'nextPort', label: 'Next Port', type: 'text', placeholder: 'Singapore Brani' },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs font-bold text-inksoft uppercase tracking-wider block mb-1.5">{label}</label>
                      <input type={type} value={shipForm[key] || ''} onChange={(e) => setShipForm((p) => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-line rounded-xl px-3 py-2 text-sm text-ink placeholder:text-inksoft/50 focus:outline-none focus:border-[#0085db]/60 transition-colors" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-bold text-inksoft uppercase tracking-wider block mb-1.5">Ship Type</label>
                    <select value={shipForm.type} onChange={(e) => setShipForm((p) => ({ ...p, type: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-line rounded-xl px-3 py-2 text-sm text-ink focus:outline-none focus:border-[#0085db]/60">
                      {SHIP_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-inksoft uppercase tracking-wider block mb-1.5">Flag State</label>
                    <select value={shipForm.flag} onChange={(e) => setShipForm((p) => ({ ...p, flag: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-line rounded-xl px-3 py-2 text-sm text-ink focus:outline-none focus:border-[#0085db]/60">
                      {FLAGS.map((f) => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-inksoft uppercase tracking-wider block mb-1.5">Status</label>
                    <select value={shipForm.status} onChange={(e) => setShipForm((p) => ({ ...p, status: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-line rounded-xl px-3 py-2 text-sm text-ink focus:outline-none focus:border-[#0085db]/60">
                      {Object.entries(STATUS_STYLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-line">
                  <button onClick={() => setShipModal({ open: false, mode: 'add', data: null })}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-inksoft hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-line">
                    Cancel
                  </button>
                  <motion.button whileTap={buttonPressInteraction} onClick={saveShip}
                    className="px-5 py-2 rounded-xl bg-[#0085db] hover:bg-[#0074c2] text-white text-sm font-bold transition-all shadow-sm">
                    {shipModal.mode === 'add' ? 'Add Ship' : 'Save Changes'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Cargo Modal (Add / Edit) ---- */}
      <AnimatePresence>
        {cargoModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface rounded-3xl border border-line shadow-2xl w-full max-w-lg">
              <div className="border-b border-line px-6 py-4 flex items-center justify-between">
                <h3 className="text-base font-extrabold text-ink">{cargoModal.mode === 'add' ? 'Add Cargo Entry' : 'Edit Cargo Entry'}</h3>
                <button onClick={() => setCargoModal({ open: false, mode: 'add', data: null, shipId: null })}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-inksoft hover:text-ink transition-colors">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-inksoft uppercase tracking-wider block mb-1.5">Container ID *</label>
                  <input type="text" value={cargoForm.containerId} onChange={(e) => setCargoForm((p) => ({ ...p, containerId: e.target.value }))}
                    placeholder="e.g. CBHU 441002-7"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-line rounded-xl px-3 py-2 text-sm text-ink placeholder:text-inksoft/50 focus:outline-none focus:border-[#0085db]/60" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-inksoft uppercase tracking-wider block mb-1.5">Cargo Type</label>
                    <select value={cargoForm.type} onChange={(e) => setCargoForm((p) => ({ ...p, type: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-line rounded-xl px-3 py-2 text-sm text-ink focus:outline-none focus:border-[#0085db]/60">
                      {CARGO_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-inksoft uppercase tracking-wider block mb-1.5">Weight (Tons)</label>
                    <input type="number" value={cargoForm.weightTons} onChange={(e) => setCargoForm((p) => ({ ...p, weightTons: e.target.value }))}
                      placeholder="22400"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-line rounded-xl px-3 py-2 text-sm text-ink placeholder:text-inksoft/50 focus:outline-none focus:border-[#0085db]/60" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-inksoft uppercase tracking-wider block mb-1.5">Destination</label>
                  <input type="text" value={cargoForm.destination} onChange={(e) => setCargoForm((p) => ({ ...p, destination: e.target.value }))}
                    placeholder="e.g. Distribution Centre North"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-line rounded-xl px-3 py-2 text-sm text-ink placeholder:text-inksoft/50 focus:outline-none focus:border-[#0085db]/60" />
                </div>
                <div>
                  <label className="text-xs font-bold text-inksoft uppercase tracking-wider block mb-1.5">Status</label>
                  <select value={cargoForm.status} onChange={(e) => setCargoForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-line rounded-xl px-3 py-2 text-sm text-ink focus:outline-none focus:border-[#0085db]/60">
                    {['loaded', 'discharging', 'pending', 'cleared'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={cargoForm.hazmat} onChange={(e) => setCargoForm((p) => ({ ...p, hazmat: e.target.checked }))}
                      className="w-4 h-4 rounded accent-rose-600" />
                    <span className="text-xs font-bold text-inksoft">Hazardous Material (HAZMAT)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={cargoForm.reefer} onChange={(e) => setCargoForm((p) => ({ ...p, reefer: e.target.checked }))}
                      className="w-4 h-4 rounded accent-sky-600" />
                    <span className="text-xs font-bold text-inksoft">Refrigerated (REEFER)</span>
                  </label>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-line">
                  <button onClick={() => setCargoModal({ open: false, mode: 'add', data: null, shipId: null })}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-inksoft hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-line">
                    Cancel
                  </button>
                  <motion.button whileTap={buttonPressInteraction} onClick={saveCargo}
                    className="px-5 py-2 rounded-xl bg-[#0085db] hover:bg-[#0074c2] text-white text-sm font-bold transition-all shadow-sm">
                    {cargoModal.mode === 'add' ? 'Add Cargo' : 'Save Changes'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Delete Confirm Modal ---- */}
      <AnimatePresence>
        {deleteConfirm.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface rounded-3xl border border-line shadow-2xl w-full max-w-sm p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-600 dark:text-rose-400">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/>
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-ink mb-2">Confirm Delete</h3>
              <p className="text-xs text-inksoft mb-5 leading-relaxed">
                {deleteConfirm.type === 'ship'
                  ? 'This will permanently remove the ship record and all associated cargo entries.'
                  : 'This will permanently remove the cargo entry from the manifest.'}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setDeleteConfirm({ open: false, type: null, id: null, shipId: null })}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-inksoft hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-line">
                  Cancel
                </button>
                <motion.button whileTap={buttonPressInteraction} onClick={deleteConfirm.type === 'ship' ? deleteShip : deleteCargo}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-all shadow-sm">
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
