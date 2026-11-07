# KewissTxT website

Static GitHub Pages-ready website for KewissTxT 1.36.0 / Minecraft Java 1.21.11.

## Current design: Anime Space

Anime-realistic blue space paintings flow continuously behind the page. The large repeated landscape panels are removed. The live planet/cloud/galaxy renderer, custom cursor, sparks, floating creator portraits, fireworks, card tilt, magnetic buttons, click ripples and original pack tools are restored. Explicit saved choices, Motion OFF and reduced motion still apply.

The cursor now uses a browser-positioned comet pointer, a visible tapered ribbon, hover/click glints and a worker-backed artwork renderer. See [assets/CURSOR-PERFORMANCE.md](assets/CURSOR-PERFORMANCE.md) for behavior and measurement limits.

Current artwork, prompts and restoration details: [assets/ANIME-SPACE-RESTORATION.md](assets/ANIME-SPACE-RESTORATION.md). Older design notes are history.

Cobweb frames now appear only on placed blocks. Inventory, hotbar, main-hand and offhand items use the normal flat strand silhouette with the selected colors. The mod, standalone ZIP and custom web ZIP export share this behavior. Lab cobweb captures come from the new Minecraft client probe.

## Local preview

From the parent project, double-click Start-Website.cmd or run:

    node tools/PreviewGithubWebsite.mjs

Open http://127.0.0.1:4174/kewisstxt/ . Keep the preview process running.

Rebuild the current landing page and synchronize downloads from dist:

    node tools/BuildAnimeSpaceWebsite.mjs

This is the current entry point. Earlier website generators recreate historical designs.

## Verification

From the parent project:

    node website/kewisstxt-github/verify.mjs
    node tools/VerifyGithubWebsite.mjs
    node tools/VerifySpaceWebsite.mjs
    node tools/VerifySpaceJourney.mjs
    node tools/VerifyCometCursor.mjs
    node tools/VerifyArtWorker.mjs
    node tools/VerifyDeepSpaceUniverse.mjs
    node tools/VerifyAnimeHttp.mjs

The HTTP check requires the local server. These cover local links, checksums, preview controls, focus handling, game behavior, bounded effects, actual animated star pixels and motion preferences. Browser layout screenshots remain unverified because the browser/native automation hosts were unavailable.

## GitHub Pages

Publish this directory's contents at the root of a GitHub repository with a main branch. Preserve .github/workflows/pages.yml and .nojekyll. In Settings > Pages, choose GitHub Actions. No npm install or application build is needed. Relative asset paths support project Pages URLs.

No GitHub repository/account is hardcoded. Public deployment has not been confirmed from this workspace. The existing separately hosted site has not been retired.

## Privacy

No accounts or external analytics. Explicitly saved preview loadouts, motion/effect choices, game scores and achievements use this browser's local storage. Shared setup URLs contain only validated preview choices. Google Fonts loads the typefaces; YouTube opens only when visitors select a creator's channel. Website controls do not modify Minecraft settings.
