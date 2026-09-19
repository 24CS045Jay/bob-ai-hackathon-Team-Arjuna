import { useState } from 'react'

/**
 * Real Video Hero Background Component
 * Governed strictly by Section 4.7 (Real Video Hero Background Law):
 * - Native HTML5 <video autoPlay muted loop playsInline preload="metadata">
 * - Static poster frame to eliminate flash
 * - Dark Obsidian gradient scrim (#0A0D12) preserving footage visibility while ensuring text contrast
 * - Accessible fallback for prefers-reduced-motion
 */
export default function OceanAnimation() {
  const [videoError, setVideoError] = useState(false)

  return (
    <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none select-none">
      {/* Generated cinematic ship loop. The poster is used only while the video loads. */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/assets/video/hero-ocean-poster.jpg"
        onError={() => setVideoError(true)}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 motion-reduce:hidden ${
          videoError ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <source src="/assets/video/generate_in_video_in_that_one.mp4" type="video/mp4" />
        <source src="/assets/video/remove_the_task_bar_from_bott.mp4" type="video/mp4" />
      </video>

      {/* Oceanic Scrim & Color Grading Overlay:
          Gives deep twilight navy on the left for crisp white typography contrast,
          while preserving the vibrant sunset sky, ship hull, and foaming ocean wake on the right */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(6,14,24,0.92) 0%, rgba(6,16,28,0.72) 42%, rgba(8,24,42,0.25) 75%, rgba(6,14,24,0.65) 100%), radial-gradient(circle at 80% 30%, rgba(245,158,11,0.08) 0%, transparent 60%)'
        }}
      />

      {/* Subtle bottom & top edge vignetting matching deep maritime ocean footage */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#060E18] via-[#060E18]/80 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#060E18]/80 via-[#060E18]/30 to-transparent" />
    </div>
  )
}
