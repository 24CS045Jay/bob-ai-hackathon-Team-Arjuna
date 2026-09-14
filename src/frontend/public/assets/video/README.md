# Tideline Video Assets & Stock Footage Specification
### Strictly Governed by Section 4.7 of the Tideline System Specification

This directory holds the real, camera-filmed stock video footage for Tideline's full-bleed hero backgrounds.

## Active Video Asset Paths

| Filename | Placement | Theme & Recommended Stock Clip |
|---|---|---|
| `hero-ocean-aerial.mp4` | Primary Landing Hero (`LandingPage.jsx` via `OceanAnimation.jsx`) | **Aerial ocean drone shot / Container ship underway**<br>• Source: Pexels / Coverr / Mixkit / Pixabay<br>• Search terms: `aerial ocean drone 4k`, `container ship at sea aerial`, `ship bow cutting waves`<br>• Target: 1080p, 10–20s seamless loop, ~4–6MB, H.264 MP4 |
| `hero-container-port.webm` | Secondary Port Terminal Stream | **Cargo port gantry cranes & container terminal timelapse**<br>• Source: Coverr / Pexels Videos<br>• Search terms: `container terminal aerial view`, `cargo port cranes timelapse`<br>• Target: 1080p, 15–25s loop, WebM / MP4 |
| `hero-ocean-poster.jpg` | Static Poster Fallback (`poster="..."`) | High-resolution still frame of open ocean and cargo ship under nocturnal/dusk lighting for zero-flash loading and `prefers-reduced-motion` compliance. |

## Strict Rules (Section 4.7)
1. **Forbidden:** No AI-generated/AI-synthesized video, no procedural CSS/SVG wave simulations as primary hero visual, no Lottie vector animations, no Ken Burns fake zooms on static photos.
2. **Required:** Real camera-filmed drone/maritime footage only, layered beneath the obsidian dark scrim (`#0A0D12`) and frosted glass panels.
