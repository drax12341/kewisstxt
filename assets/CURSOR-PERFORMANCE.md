# Comet cursor and responsiveness

The former cursor was a JavaScript-positioned ring and a large moving glow. Every pointer event also changed root attributes, while the painted background processed roughly half a million pixels on the same thread. The existing trail emitted only a few tiny particles.

## Current cursor

The primary pointer is a browser-positioned SVG, with the same precise hotspot across normal, hover and pressed states. Its position does not depend on a JavaScript follow animation. The new design uses a faceted silver/cyan comet and small star accents. Star crosshair and System cursor choices remain available; text fields retain their text caret.

Native SVG assets:

- `cursor-comet.svg`
- `cursor-comet-hover.svg`
- `cursor-comet-press.svg`
- `cursor-star.svg`

These are code-native vector assets, not image-generated bitmap artwork.

The separate ribbon uses at most 40 samples, one scheduled paint at a time, and a 340 ms lifetime. Its tapered light strand, second stardust strand, small glints and short hover/click pulses clear after expiry. It redraws only its dirty region. Idle, touch, hidden-page, Motion OFF and reduced-motion behavior avoid a permanent cursor animation loop. Steady pointer movement writes no body classes/styles/data attributes. The old ring/glow and duplicate particle trail are disabled.

## Artwork processing

`art-renderer.js` prefers `anime-art-worker.js` with OffscreenCanvas and transferable ImageBitmaps. The original live sky, planet, clouds and ring light remain. Only the newest request is retained, with at most one worker job in flight; replaced bitmaps are closed. The worker's frame clock remains stable across viewport resizes. Unsupported/failed worker environments use a compact renderer instead.

In the local native Canvas2D benchmark, the previous three-layer update took about 31 ms median with the current sky. The compact fallback took about 10 ms. Supported browsers move those pixel loops off the main thread entirely. The ribbon check measured about 0.2 ms median per paint. These are local native-renderer measurements, not browser input-latency measurements or universal performance guarantees.

## Verification

`tools/VerifyCometCursor.mjs` checks real ribbon pixels, no root writes during movement, one queued frame, bounded samples and pulses, complete expiry, saved modes and OFF/reduced/hidden/touch behavior. `tools/VerifyArtWorker.mjs` executes the production artwork worker in a separate thread with a native Canvas2D adapter, checks actual changing pixels and main-thread timer progress, and exercises bridge backpressure, resize caching and bitmap cleanup.

Local proofs and measurements are in `build/cursor/`, including `comet-design-proof.png`, `ribbon-pixels.png`, `render-report.json` and `artwork-benchmark.json`. They are not browser screenshots. Browser/native UI automation hosts remained unavailable, so live browser cursor latency has not been measured.
