import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useRole } from '../../context/RoleContext.jsx'
import { listItemVariants, buttonPressInteraction } from '../../utils/motion.js'

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useRole()
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'unread'
  const panelRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const filtered = activeTab === 'unread' ? notifications.filter((n) => n.unread) : notifications

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif.id)
    if (notif.path) {
      navigate(notif.path)
      setIsOpen(false)
    }
  }

  const typeIcons = {
    alert: (
      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] flex-none mt-1" />
    ),
    plan: (
      <span className="w-2.5 h-2.5 rounded-full bg-[#0085db] flex-none mt-1" />
    ),
    action: (
      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-none mt-1" />
    ),
    system: (
      <span className="w-2.5 h-2.5 rounded-full bg-slate-400 flex-none mt-1" />
    )
  }

  return (
    <div className="relative font-sans" ref={panelRef}>
      <motion.button
        whileTap={buttonPressInteraction}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notification Center"
        title="Notifications"
        className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
          isOpen
            ? 'bg-slate-100 dark:bg-slate-800 text-ink'
            : 'text-inksoft hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[9.5px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
            {unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-surface border border-line rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.55)] z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-line bg-slate-50/70 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-ink">Notifications</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-[#0085db] dark:bg-sky-950/60 dark:text-sky-300">
                  {unreadCount} new
                </span>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs text-[#0085db] hover:underline font-bold transition-colors cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-line px-4 pt-2.5 gap-4 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'border-[#0085db] text-[#0085db]'
                    : 'border-transparent text-inksoft hover:text-ink'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'unread'
                    ? 'border-[#0085db] text-[#0085db]'
                    : 'border-transparent text-inksoft hover:text-ink'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notification Items List */}
            <div className="max-h-[320px] overflow-y-auto divide-y divide-line/60">
              <AnimatePresence initial={false}>
                {filtered.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 text-center text-xs text-inksoft font-medium"
                  >
                    No notifications to display
                  </motion.div>
                ) : (
                  filtered.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={listItemVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      onClick={() => handleNotificationClick(item)}
                      className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                        item.unread 
                          ? 'bg-sky-50/50 hover:bg-sky-50 dark:bg-sky-950/20 dark:hover:bg-sky-950/40' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {typeIcons[item.type] || typeIcons.system}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-relaxed ${item.unread ? 'text-ink font-bold' : 'text-inksoft font-medium'}`}>
                          {item.title}
                        </p>
                        <span className="text-[11px] text-inksoft/80 mt-1 block font-medium">
                          {item.time}
                        </span>
                      </div>
                      {item.unread && (
                        <span className="w-2 h-2 rounded-full bg-[#0085db] flex-none mt-1.5" />
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 border-t border-line text-center">
              <button
                onClick={() => {
                  navigate('/alerts')
                  setIsOpen(false)
                }}
                className="text-xs text-[#0085db] hover:underline font-bold transition-all cursor-pointer"
              >
                View all operational alerts →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
