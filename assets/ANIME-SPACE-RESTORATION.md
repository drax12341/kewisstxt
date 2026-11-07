# Anime Space restoration

The user's screenshot showed a hard cut between a full-width picture panel and the same fixed background repeated underneath. The photographic paintings also lost the intended anime-realistic character. This pass replaces those paintings, removes the two picture panels, and restores the site's authored interactions.

## Current direction

Use midnight blue, dusty periwinkle, icy cyan and small ivory highlights. Keep the existing Space Grotesk / Manrope typography. The background remains continuous behind the existing pack sections. The artwork viewer and its close-up choices move into the universe controls rather than occupying separate landscape sections.

The earlier direction stripped too much away. This version restores the live planet, orbiting ring light, cloud currents, galaxy motion, aurora controls, creator portraits, fireworks launcher, custom cursor, spark trails, card tilt, magnetic buttons, click ripples and reveal transitions. Explicit Motion OFF, reduced-motion and saved trail choices remain respected. The custom cursor now offers Orbit, Star crosshair and System choices.

The current build entry point is `node tools/BuildAnimeSpaceWebsite.mjs` from the parent mod project. Older build entry points recreate intermediate designs.

## Artwork and prompts

Generated with the built-in image-generation tool. PNG originals are retained, with WebP delivery copies in this directory:

- `anime-space-sky.png` / `anime-space-sky.webp`
- `anime-space-rings.png` / `anime-space-rings.webp`
- `anime-space-horizon.png` / `anime-space-horizon.webp`

The original transparent planet and cloud plates are retained for the live depth renderer. Their CSS finish uses cooler blue tones. The new sky's galaxy animation is centered on its actual painted galaxy.

### Sky prompt

> Original wide cinematic anime-realistic space background painting, landscape 1536x1024, for an immersive Minecraft community website. Delicately hand-painted anime film environment art with realistic lighting and volume, visible painterly cloud edges, beautiful indigo ink shadows and silver-blue highlights. An immense sweeping river of sparkling blue-white stars and softly luminous layered nebula dust across a deep midnight navy sky, a small elegant spiral galaxy at the upper right at roughly 70 percent width, a few tiny distant moons, a graceful subtle whale-shaped silhouette made from deep blue cosmic dust at upper left, understated fine shooting-star trails. The whale should be a quiet discovery rather than cartoon foreground. Rich details throughout, especially the right half and lower edge; center-left darker and calmer for white website typography. Restrained deep blue, periwinkle, icy cyan and very small warm ivory glints, slight muted violet in shadows, NOT pink or rainbow. Soft cinematic atmosphere and compelling hand-painted shapes, not a NASA photograph, not hard 3D rendering, not plastic AI wallpaper. Space is the main subject. No text, interface, border, logos or watermark. No giant planet or foreground ground in this plate, it is a sky painting.

### Ringed-world prompt

> Original wide ANIME-REALISTIC deep-space environment painting, landscape 1536x1024, matching a hand-painted anime film background with realistic atmosphere, subtle brushwork and rich layered detail. A luminous blue-violet ringed planet floats at the RIGHT, with elegant thin ice-blue rings sweeping diagonally. Small moons, scattered rocky fragments, stardust, clusters of tiny white stars and a soft flowing blue nebula fill the sky. A distant misty planetary horizon at lower left, quiet cosmic ocean atmosphere, cinematic depth and a sense of wonder. Planet weather has beautifully painted curling cloud bands and natural gentle shading, not photographic swirly noise. Keep the left-center navy enough for web content, but include delicate constellations and small discoveries across all regions. The palette is midnight indigo, dusty blue, slate violet and pale cyan, with warm ivory reflected light; avoid bright pink, rainbow, and excessive saturation. It must look like a masterfully painted serious anime space film background rather than sterile realistic sci-fi stock photography. No people, no text, no UI, no borders, no logos, no watermark.

### Cloud-sea prompt

> Original wide anime-realistic celestial environment painting, landscape 1536x1024, for a scrolling space website. Hand-painted high-end anime film background, painterly natural forms with realistic lighting. Dreamlike dark-blue cloud ocean follows the curved rim of a planet across the LOWER QUARTER, sculpted cloud layers edged with pale moonlight; the sky above is full of intricate fine stars and flowing midnight-blue nebula currents. Small spiral galaxy at upper left, two quiet moons, a distant shadowed blue planet partly outside the upper RIGHT edge, occasional tiny floating rock silhouettes. Rich detailed brushwork, atmospheric perspective, believable celestial light, subtle movement suggested by wisps, beautiful depth. A serene cosmic sky scene, not a barren crater landscape, not NASA photography, not a 3D render or generic fantasy game screenshot. Restrained navy, blue and muted lavender, icy cyan and silvery white. Center area remains calm for readable website panels, while edges have many subtle details to discover. No dominant bright pink, no rainbow, no character, no words, no UI, no border, no watermark.

## Verification

The static checks cover links, scripts, stylesheets, downloads and the restored scene markup. The interaction checks cover actual cursor movement and mode changes, cursor visibility in the CSS cascade, visible fireworks controls, portrait animation, card tilt, button ripples, original pack tools, saved choices and motion OFF/reduced behavior. The native Canvas2D check verifies changing pixels in the sky, planet and cloud surfaces, in addition to the starfield checks. The journey check verifies continuous sector backgrounds and gallery close-ups without full-width picture panels.

Browser and native UI automation hosts remained unavailable. Full browser layout screenshots could not be produced; the user's supplied screenshot guided the hard-edge/repetition fix. These automated checks do not replace a visual browser review.
