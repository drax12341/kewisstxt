# Previous Illustrated Cosmos design

This records the previous cartoon design. It has been replaced by the procedural, shaded scene described in `REAL-ORBIT.md`. The current landing page does not load these illustrations.

## Artwork

- `toon-blackhole.svg`: dark event horizon, layered peach/lavender accretion disk, luminous rim, traveling disk marks and glints.
- `toon-saturn.svg`: peach cel-shaded body, curved cloud bands, inked ring silhouette and foreground ring occlusion.
- `toon-ocean.svg`: blue planet, mint continents, cloud streaks, rim highlights and a cel-shadowed night side.
- `toon-moon.svg`: lavender moon with outlined craters and a broad curved shadow.
- `toon-lava.svg`: coral world with branching magma lines and a plum night side.
- `toon-comet.svg`: outlined anime glint, translucent tapered tail and companion sparkle.
- `toon-asteroids.svg`: three geometric, faceted rocks with independent drifting groups.
- `cartoon-nebula.svg`: illustrated blue/violet cloud ribbons, four-point stars and a small constellation.

All artwork is original project code. `tools/GenerateCartoonCosmos.mjs` authors the geometry; `tools/BuildCartoonWebsite.mjs` places independent, uniquely named instances throughout the site. Existing player skin images remain unchanged.

## Motion and interaction

The CSS animates the illustrated objects and flowing black-hole highlights. A capped canvas layer paints 84 desktop or 46 mobile stars, occasional comets, and a user-triggered 1.8-second warp. The scene responds gently to a mouse pointer. OFF, reduced motion and hidden tabs stop decorative motion and cancel warp effects.

The existing spark system also draws small anime-style glints within click/firework bursts. Particle limits and lifetime removal are retained.

## Review

`tools/RenderCartoonCosmos.mjs` renders the exact vectors into artwork review PNGs under `build/cartoon-cosmos`. These are artwork proofs, not browser screenshots. DOM/interaction tests are in `tools/VerifySpaceWebsite.mjs`; all former item, palette, download and game checks remain available.
