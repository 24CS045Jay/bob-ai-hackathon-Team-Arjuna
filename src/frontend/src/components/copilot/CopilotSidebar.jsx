import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendCopilotMessage, fetchCopilotStatus } from '../../api/client.js'
import { buttonPressInteraction } from '../../utils/motion.js'

export default function CopilotSidebar({ isOpen, setIsOpen }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'copilot',
      text: `**PortFlow AI Operations Copilot Active.**\n\nI am grounded in live Port of Arjuna telemetry, 72-hour Random Forest congestion forecasts, and discrete berth & crane allocation solvers.\n\nHow can I assist your watch today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model_used: 'PortFlow-Deterministic-Engine',
      confidence: 0.98,
      sources: ['Port of Arjuna Digital Twin', 'Live Berth & Crane Registry'],
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchCopilotStatus().then((s) => setStatus(s))
  }, [])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSend = async (textToSend = null) => {
    const query = (textToSend || inputValue).trim()
    if (!query || isLoading) return

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputValue('')
    setIsLoading(true)

    try {
      const resp = await sendCopilotMessage(query, selectedFilter)
      const botMsg = {
        id: Date.now() + 1,
        sender: 'copilot',
        text: resp.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model_used: resp.model_used,
        confidence: resp.confidence,
        sources: resp.grounding_sources || ['Port Operations Core'],
        citations: resp.citations || [],
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'copilot',
          text: `⚠️ Telemetry pipeline delay. Error: ${e.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model_used: 'Local Emergency Fallback',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const quickPrompts = [
    { label: 'Zone B Bottlenecks', query: 'What is causing congestion in Zone B?' },
    { label: 'MSC Arjuna Berth', query: 'Where should MSC Arjuna berth and what is the UKC?' },
    { label: 'Crane Throughput', query: 'Which cranes are allocated and what is current throughput?' },
    { label: 'Tidal Channel Route', query: 'Show dynamic channel routing and tidal UKC constraints' },
  ]

  const formatText = (text) => {
    // Simple inline parser for bold and linebreaks
    const lines = text.split('\n')
    return lines.map((line, lIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g)
      return (
        <span key={lIdx} className="block min-h-[1.2em]">
          {parts.map((p, pIdx) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-ink">
                  {p.slice(2, -2)}
                </strong>
              )
            }
            return p
          })}
        </span>
      )
    })
  }

  return (
    <>
      {/* Slide-over Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-obsidian-950/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="w-full max-w-md h-full glass-strong border-l border-line flex flex-col bg-obsidian-900 text-ink shadow-2xl select-text"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-line flex items-center justify-between bg-obsidian-800/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-deep flex items-center justify-center text-white shadow-md">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink leading-tight flex items-center gap-1.5">
                      PortFlow AI Copilot
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-brand/20 text-brand border border-brand/30">
                        {status?.watsonx_configured ? 'watsonx.ai' : 'Grounded Engine'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-inksoft font-mono">Port of Arjuna Digital Twin Advisor</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setMessages([
                        {
                          id: Date.now(),
                          sender: 'copilot',
                          text: 'Chat history cleared. Live twin telemetry synchronized.',
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        },
                      ])
                    }
                    title="Clear history"
                    className="p-1.5 rounded-lg hover:bg-obsidian-700/60 text-inksoft hover:text-ink transition-colors text-xs"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-obsidian-700/60 text-inksoft hover:text-ink transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Quick Prompts Bar */}
              <div className="px-4 py-2.5 border-b border-line bg-obsidian-850/50 flex gap-2 overflow-x-auto no-scrollbar">
                {quickPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(p.query)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium glass border border-line hover:border-brand/40 hover:text-brand transition-all flex-shrink-0"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((m) => {
                  const isUser = m.sender === 'user'
                  return (
                    <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                          isUser
                            ? 'bg-brand text-white rounded-br-none shadow-md font-medium'
                            : 'glass border border-line rounded-bl-none text-ink bg-obsidian-800/80 shadow-sm'
                        }`}
                      >
                        {formatText(m.text)}

                        {/* Grounding and metadata */}
                        {!isUser && (m.sources || m.confidence) && (
                          <div className="mt-3 pt-2.5 border-t border-lineSoft/60 flex flex-wrap items-center gap-1.5 text-[10px] text-inksoft font-mono">
                            {m.confidence && (
                              <span className="px-1.5 py-0.5 rounded bg-ok/15 text-ok font-semibold">
                                {Math.round(m.confidence * 100)}% Grounded
                              </span>
                            )}
                            {m.sources?.map((s, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-obsidian-700/60 text-inksoft">
                                📍 {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[9.5px] text-inksoft font-mono mt-1 px-1">{m.timestamp}</span>
                    </div>
                  )
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 p-3 glass border border-line rounded-2xl max-w-[70%]">
                    <span className="w-2 h-2 rounded-full bg-brand animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-brand animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-brand animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] text-inksoft font-mono ml-1">Evaluating live state...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3.5 border-t border-line bg-obsidian-850/80">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask operations advisor (e.g. Zone B congestion)..."
                    className="flex-1 bg-obsidian-900 border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink placeholder:text-inksoft focus:outline-none focus:border-brand transition-colors"
                  />
                  <motion.button
                    type="submit"
                    whileTap={buttonPressInteraction}
                    disabled={isLoading || !inputValue.trim()}
                    className="px-4 py-2.5 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-deep disabled:opacity-40 transition-colors shadow-sm"
                  >
                    Send
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
