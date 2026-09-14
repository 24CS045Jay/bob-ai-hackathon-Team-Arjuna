export default function ZoomControl({ onZoomIn, onZoomOut, onReset }) {
  return (
    <div className="absolute right-3.5 bottom-3.5 glass-strong border border-lineSoft rounded-xl overflow-hidden shadow-lg z-10 flex flex-col">
      <button
        onClick={onZoomIn}
        aria-label="Zoom in"
        title="Zoom In"
        className="w-8 h-8 flex items-center justify-center border-b border-line text-inksoft hover:text-ink hover:bg-line/20 text-base font-semibold transition-colors"
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        aria-label="Zoom out"
        title="Zoom Out"
        className="w-8 h-8 flex items-center justify-center border-b border-line text-inksoft hover:text-ink hover:bg-line/20 text-base font-semibold transition-colors"
      >
        −
      </button>
      {onReset && (
        <button
          onClick={onReset}
          aria-label="Reset zoom"
          title="Reset Zoom"
          className="w-8 h-8 flex items-center justify-center text-inksoft hover:text-ink hover:bg-line/20 text-[10px] font-mono transition-colors"
        >
          1:1
        </button>
      )}
    </div>
  )
}
