# Deep Space design — 2026-11-07

The user's three references informed the scale, fine stars and cold blue light. The new design keeps the pack's interactive features and gives the sky room to breathe.

## Design decisions

- Midnight `#030810`, spacecraft blue `#0B1420`, silver `#EDF3F9`, quiet blue `#97A9BC`, starlight `#A7C9E8`.
- Space Grotesk for large, medium-weight headings; Manrope for copy and controls.
- A wide starfield behind a left-aligned headline. Small creator selectors sit near the lower right, with full creator portraits retained in the crew section. Download and texture preview actions stay prominent.
- A single galactic panorama carries the visual identity. The surrounding controls use quiet borders, neutral surfaces and restrained motion. The actual Minecraft previews retain their authentic colors.
- The old violet clouds, whale and rose planet are absent from the active page. Their image files remain available as history. The old painted surface renderer is not loaded on the landing page.
- Scene controls are expandable, cursor sparks default to OFF, and motion preferences, keyboard navigation, reduced motion and saved views remain supported.

The initial idea was to recolor the existing layered fantasy scene. Review against the user's references favored a new, quieter sky and a simpler hero instead: recoloring alone would leave the visual density unchanged.

## Artwork

Saved asset: `assets/deep-space-panorama.png`.
Generated using the built-in image-generation tool; the supplied pictures were mood references, not edit targets. Existing skin renders were preserved.

Final prompt:

> Use case: stylized-concept. Asset type: wide cinematic background artwork for a Minecraft texture pack website, landscape 3:2 or wider. Create an original quiet deep-space scene inspired by the user's references: immense midnight navy starfield, photographic density of tiny silver stars, a pale icy blue Milky Way sweeping diagonally from lower left to upper right, a single shadowed planet low on the right with a razor-thin blue atmospheric rim, a tiny distant moon. Restrained deep indigo and cold starlight palette. Vast negative space on the left for white website typography; brightest cluster in upper right, leave top and bottom dark for blending into the page. The sense of silent scale in the references, with subtle painterly astronomy detail and believable rock/planet texture. Elegant and immersive, not a cartoon. No pink, no rainbow, no purple glowing fantasy clouds, no whale, no human or anime characters, no text, no labels, no UI, no logo, no watermark. This is background art only, not a website screenshot.

## Verification

`verify.mjs`, `VerifyGithubWebsite.mjs`, `VerifySpaceWebsite.mjs`, `VerifyDeepSpaceUniverse.mjs` and `VerifyAnimeHttp.mjs` cover links, exact download hashes, item previews, saved/shared settings, command search, game behavior, real starfield pixel changes, motion freeze/resume, meteors, scene controls and HTTP delivery. These are automated DOM/canvas checks, not browser layout screenshots. The browser and native automation hosts were unavailable during this update, so full browser visual QA remains outstanding.

The actual Minecraft client cobweb probe passed, covering item model quads in GUI, both first-person hands, both third-person hands and ground contexts, color changes, resource repair, OFF restoration and the standalone ZIP. Fresh game captures replace the previous framed-item captures in the lab.
