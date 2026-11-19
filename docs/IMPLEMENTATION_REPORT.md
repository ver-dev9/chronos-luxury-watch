# Implementation report — CHRONOS v1.0.0

## Status by chapter

| Chapter | Status | Notes |
|---|---|---|
| 01 Intro | Complete | Timed GSAP reveal (light → dust → silhouette → reflections → title); scroll orbit/dive. Skipped under reduced motion. |
| 02 Collections | Complete | 4 distinct procedural watches, horizontal rail synced to DOM, drag/hover rotate, *Explore Collection* showcase dialog (no purchase). |
| 03 Exploded watch | Complete | 17 parts, scroll-scrubbed and reversible, labels, click / keyboard inspect with outline, disassemble / reassemble / slider. |
| 04 Movement | Complete | Macro camera path, DOF on HIGH. Artistic movement, not a real calibre. |
| 05 Materials | Complete | 8 materials, cross-fade + specimen per material. |
| 06 Art of Time | Complete | Giant meshing gears, Roman ring, pendulum, beams, quote "TIME IS NOT JUST MEASURED. IT IS CRAFTED." |
| 07 Configurator | Complete | Case ×4, dial ×4, strap ×4, markers ×3; live update, rotate buttons, reset, fullscreen, summary, "REVEAL YOUR CREATION"; labelled "A creative study — not available to order." |
| 08 Signature | Complete | 5 pieces on plinths, drag to inspect. |
| 09 Craftsmanship | Complete | 6 animated vignettes. |
| 10 Finale | Complete | Vortex reassembly, credits, footer. |

## Verification actually performed

| Check | Result |
|---|---|
| `tsc -b` (strict) | Pass, 0 errors |
| `eslint .` | Pass, 0 problems |
| `prettier --check .` | Pass |
| `vite build` | Pass |
| Headless Chromium 1440×900, all 10 chapters | Rendered; screenshots in `docs/screenshots` |
| Interaction run (showcase open/close, exploded inspect + reassemble, configurator change + reveal, scroll to end and back) | All steps completed, no page errors |
| Mobile 390×844: intro, collections, exploded, configurator, signature, finale | Rendered |
| Console | Only error: Google Fonts blocked by the sandbox proxy (407); the app falls back to system fonts |
| Automated tests | **None exist** — no test runner was added |

Not verified: real GPU rendering at HIGH/MEDIUM, Safari/Firefox, physical touch devices, real frame rates, screen-reader pass.

## Asset honesty

- No GLB/CAD/photogrammetry files. Every model is procedural Three.js geometry written for this project.
- Draco / Meshopt / KTX2 are documented as the pipeline for future assets but are **not used**, since nothing is loaded.
- Sound is synthesized live with WebAudio; muted by default.

## Bundle (production)

three ≈ 684 kB (176 kB gzip), r3f ≈ 345 kB, post ≈ 101 kB, app ≈ 109 kB, plus one lazy chunk per scene.

## Known limitations

- Movement is decorative; part ratios are illustrative, not horological.
- Motion blur is approximated with velocity-driven chromatic aberration; volumetric light is faked with additive cones.
- Exploded-view labels can crowd at mid-separation on narrow desktop widths.
- `three` chunk exceeds Vite's 500 kB advisory (expected for Three.js).
- Repository description/topics must be set in GitHub settings (the connector cannot edit repo metadata).
- No LICENSE file until the author confirms one.
