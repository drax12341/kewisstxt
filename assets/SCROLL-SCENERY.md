# Scrolling space scenery

The first Deep Space pass left the lower page too empty. This revision gives the entire page visible scenery while retaining the cold-blue space direction.

## Design plan and review

Keep midnight `#030810`, spacecraft blue `#0B1420`, silver `#EDF3F9`, quiet blue `#97A9BC` and starlight `#A7C9E8`. Keep Space Grotesk for headings and Manrope for controls. Use a full-viewport background behind the existing content, changing with the page sections. Two full-width views create places to appreciate the artwork without a UI panel covering it. Place orbital charts, constellations and small satellite drawings in the section margins.

The initial option was to brighten the same background. Reviewing the user's complaint showed that would still repeat one scene throughout the page. The implemented version adds a detailed ring system and a cratered horizon, plus close-up controls and a larger artwork dialog. Controls and pack previews retain their existing layouts.

Page sequence:

```
Hero / original galactic sky
Features and textures / ring system + orbital drawings
Wide ring-system view / selectable close-ups
Crew and release history / planet detail and star charts
Showcase and item inspector / moonlit horizon
Wide moonlit view / galaxy, terrain and planet close-ups
Game / lunar sky
Install and help / ring-system backdrop
```

The fixed backgrounds crossfade only when the active section changes. Small parallax updates run on scroll and resize, with no new perpetual animation loop. Motion OFF and reduced motion disable depth movement and transitions. Decorative charts do not receive pointer events. The scene gallery uses a native modal dialog, labeled controls, arrow-key scene switching and focus restoration. The original observatory remains separate.

## Assets

Two new images were generated with the built-in image-generation tool. The PNG originals are preserved in this directory:

- `deep-space-rings.png`, with the optimized website version `deep-space-rings.webp`.
- `deep-space-horizon.png`, with the optimized website version `deep-space-horizon.webp`.

The earlier `deep-space-panorama.png` also has an optimized `deep-space-panorama.webp`. The three WebP files total approximately 1.1 MiB. They are format conversions of the artwork, without creative edits.

Ring-system prompt:

> Wide cinematic deep-space background artwork for the middle of a Minecraft texture pack website, landscape composition 1536x1024. A spectacular detailed pale blue-gray ringed gas giant occupies the RIGHT THIRD, its broad oblique rings sweeping across the lower half and out of frame. Fine icy ring particles, intricate storm bands, several tiny moons casting shadows, a small distant planet in the upper left, and dense silver star clusters with wisps of blue interstellar dust. Black navy and cool steel blue with small warm ivory highlights, restrained saturation. More things to discover and more visible detail than an empty starfield, but believable astronomical art, not magical fantasy. Center-left area has dim dust and stars so white UI remains legible over it. Planet has strong readable silver rim light and visible texture in the dark side, not a featureless silhouette. High fidelity cinematic space photography aesthetic, immersive scale. No text, UI, logo, anime, people, whales, pink clouds, rainbow colors or watermark. Background art only.

Moonlit-horizon prompt:

> Wide cinematic space environment artwork for a website lower-page background, landscape 1536x1024. View from low orbit above a cratered icy moon, rugged charcoal-blue mountain ridges and softly lit craters across the LOWER THIRD, a vast dense starfield above, a delicate bright blue-white spiral galaxy visible at UPPER LEFT, a large shadowed blue planet half outside the RIGHT edge, two distant small moons and a faint diagonal dust stream. Rich visible geological detail, fine stars and space dust throughout, softly lit silver terrain. Midnight navy, slate, cold blue and white, restrained saturation; enough light to appreciate the detail, not pitch-black. Leave the center upper-middle quiet for white website interface. Sophisticated cinematic astronomical illustration, photographic detail, coherent perspective, no cartoon fantasy. No text, interface, frames, logos, people, anime, pink nebulae, rainbow colors or watermark. Background artwork only.

The artwork depicts imagined space environments; its captions describe the images rather than documented astronomical objects.

## Verification

`tools/VerifySpaceJourney.mjs` checks section changes, route navigation, event-driven parallax, close-up selection, gallery behavior, keyboard switching, focus restoration, OFF/reduced/hidden handling, stylesheet parsing and the compressed artwork budget. Existing preview, starfield and download checks remain in use. New assets and scripts are checked over HTTP as exact file bytes.

Background-only composition proofs at desktop and mobile sizes are in `build/space-journey/`. These verify the artwork under the background scrim; they are not browser screenshots. Browser/native automation hosts were unavailable, so full browser layout review remains outstanding.
