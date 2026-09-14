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
      <span className="w-2 h-2 rounded-full bg-crit animate-critGlow shadow-[0_0_6px_rgba(229,73,61,0.6)] flex-none mt-1.5" />
    ),
    plan: (
      <span className="w-2 h-2 rounded-full bg-brand-glow flex-none mt-1.5" />
    ),
    action: (
      <span className="w-2 h-2 rounded-full bg-ok flex-none mt-1.5" />
    ),
    system: (
      <span className="w-2 h-2 rounded-full bg-inksoft flex-none mt-1.5" />
    )
  }

  return (
    <div className="relative" ref={panelRef}>
      <motion.button
        whileTap={buttonPressInteraction}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notification Center"
        className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
          isOpen ? 'bg-obsidian-800 text-ink border border-lineSoft' : 'text-inksoft hover:text-ink hover:bg-obsidian-800/60'
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C9 2 7 4.5 7 8v4l-2 4h14l-2-4V8c0-3.5-2-6-5-6z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10 18a2 2 0 004 0" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-crit text-white text-[9.5px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-obsidian-900 shadow-sm animate-pulseDot">
            {unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 glass-strong border border-lineSoft rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-3.5 border-b border-line bg-obsidian-800/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-ink">Notifications</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-brand/15 text-brand-glow border border-brand/30">
                  {unreadCount} new
                </span>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[11px] text-inksoft hover:text-brand-glow transition-colors font-medium font-mono"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="flex border-b border-line px-3 pt-2 gap-3 text-xs">
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'border-brand text-brand-glow font-semibold'
                    : 'border-transparent text-inksoft hover:text-ink'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'unread'
                    ? 'border-brand text-brand-glow font-semibold'
                    : 'border-transparent text-inksoft hover:text-ink'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <div className="max-h-[320px] overflow-y-auto divide-y divide-line/40">
              <AnimatePresence initial={false}>
                {filtered.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 text-center text-xs text-inksoft"
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
                      className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                        item.unread ? 'bg-brand/5 hover:bg-brand/10' : 'hover:bg-obsidian-800/40'
                      }`}
                    >
                      {typeIcons[item.type] || typeIcons.system}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-snug ${item.unread ? 'text-ink font-semibold' : 'text-inksoft'}`}>
                          {item.title}
                        </p>
                        <span className="text-[10px] font-mono text-inksoft/70 mt-1 block">
                          {item.time}
                        </span>
                      </div>
                      {item.unread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-glow flex-none mt-1.5" />
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="p-2.5 bg-obsidian-800/80 border-t border-line text-center">
              <button
                onClick={() => {
                  navigate('/alerts')
                  setIsOpen(false)
                }}
                className="text-xs text-brand-glow hover:underline font-semibold"
              >
                View all operational exceptions →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
