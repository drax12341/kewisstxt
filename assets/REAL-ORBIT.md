# Real Orbit

The active scene is rendered from code. It uses no AI-generated images or photographic background. The old cartoon SVGs and generated nebula are not used by the current landing page.

## Surfaces

`tools/GenerateOrbitalMaps.mjs` deterministically creates equirectangular maps from seeded spherical noise:

- `orbital-earth-map.png`: oceans, land, arid areas and polar ice for a fictional terrestrial world.
- `orbital-gas-map.png`: muted gas bands, finer turbulence and a storm region.
- `orbital-moon-map.png`: rough grey terrain and 75 distributed craters.
- `orbital-cloud-map.png`: an independent cloud density layer, also sampled for disk turbulence.
- `orbital-ring-map.png`: fine band density and a dark gap for the ringed planet.

The imagery is a custom visual approximation, not an astronomical simulation or an actual photograph of Earth or Saturn.

## Live scene

`orbital-renderer.js` projects these maps onto lit spheres with a stable light direction and a day/night terminator. The terrestrial world has a specular ocean, independently moving clouds and a thin atmosphere. Rings are composited behind/in front of the sphere according to approximate depth. The black hole uses an opaque horizon, thin bright rim, a flowing warm disk and a lensed arc approximation.

Five object types share one WebGL context and five reusable output caches. Fifteen page instances copy those current frames. Where WebGL is unavailable, a lower-resolution Canvas2D renderer uses the same surface math at a capped rate. Static posters are rendered by that same code for initial loading and last-resort fallback.

`real-orbit.js` owns a single accumulated animation clock for surface rotation, cloud motion, disk flow and star movement. It paints 230 desktop or 115 mobile point stars plus occasional tapered falling stars. Dust/haze and group motion use slow CSS animation. Motion OFF and reduced-motion preferences freeze the scene; hidden tabs stop its clock and cancel warp effects. Resume does not fast-forward by elapsed wall time.

## Build and verify

- `node tools/GenerateOrbitalMaps.mjs` creates all five deterministic maps and the quiet deep-space SVG base.
- `node tools/RenderRealOrbit.mjs` creates posters and an artwork proof under `build/real-orbit`.
- `node tools/BuildRealOrbitWebsite.mjs` builds the current landing HTML and release metadata.
- `node tools/VerifyOrbitalRenderer.mjs` verifies visible alpha-masked bodies, time-varying surfaces, and the actual 2D fallback/cache path.
- `node tools/VerifyRealOrbitCanvas.mjs` exercises the real Canvas2D page scene, checks that pixel output changes, and verifies OFF/resume/hidden-tab behavior.
- The existing full-site interaction and release-download checks remain in place.

Artwork proofs are not browser screenshots. GPU driver rendering and complete visual browser QA were unavailable in this session; the software rendering path was executed against a real canvas backend.
