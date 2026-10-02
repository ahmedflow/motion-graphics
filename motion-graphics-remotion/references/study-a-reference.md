# Studying a reference video

Titles and thumbnails tell you nothing about motion. Look at real frames.

## whatships.com (or any page with a `<video>`)

1. Open the page in the browser tool (built-in browser or Claude in Chrome). The `<video>` has no `src` until it is played, and clicking the play overlay often opens the original X post instead (a new tab the browser blocks) — and when the browser pane is hidden the video may never load. The reliable way: take the MP4 URL from the page's HTML and load it yourself:
   ```js
   const m = document.documentElement.innerHTML.match(/https://proxy.whatships.com/?url=[^"'s]+?.mp4/);
   const v = document.querySelector('video');
   v.src = m[0].replace(/&amp;/g, '&'); v.muted = true; v.preload = 'auto';
   v.load(); v.play().catch(() => {});
   await new Promise((r) => setTimeout(r, 5000)); v.pause();
   ({rs: v.readyState, d: v.duration})   // readyState 4 + a finite duration = ready to seek
   ```
   Seek with a promise that resolves on `seeked` (plus a timeout), so one `javascript_tool` call never hangs:
   `window.seek = (t) => new Promise((r) => { v.currentTime = t; v.addEventListener('seeked', () => setTimeout(r, 300), {once: true}); setTimeout(r, 5000); });`
   To find candidates fast, `https://whatships.com/search-index.json` lists every video (slug, name, meta, searchText) — filter it by words related to the idea instead of scrolling the home page.
2. Make the video fill the viewport and pause it:
   ```js
   const v = document.querySelector('video');
   v.pause();
   v.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:99999;background:#000;object-fit:contain';
   document.body.appendChild(v);
   ({d: v.duration, w: v.videoWidth, h: v.videoHeight})
   ```
3. Sample frames: set `v.currentTime = t`, wait ~700 ms, screenshot (scale 0.4–0.5 is enough). Batch several seek+screenshot pairs in one call. Sample every 3–4 s for an overview, then sample transitions densely (every 0.2 s) around moments that look interesting — that is where the motion language lives.
4. Notes to take:
   - Background, palette (how many colours? one accent?), grain/texture
   - Type: family feel, weight, size relative to frame, how lines enter (fade / rise from mask / blur / per-word)
   - Graphic language: photos? flat UI? hairline drawings? icons in circles? dashed connectors?
   - Transitions: cuts, cross-fades, mask wipes, camera pans, zoom-through
   - Camera: static boards or a moving camera? push-ins on key words?
   - Pacing: seconds per idea, how long text holds
   - Sound: music style, how many SFX
5. Summarise for the user in 3–5 lines, then build in that language — adapted to their content.

Whatships pages expose the underlying MP4 (`v.currentSrc`). Don't download it — viewing frames is enough.

## Common whatships styles (quick guide)

- **Clean white + one accent colour, big medium-weight sans, UI mock-ups with soft shadows** — product launch look. Kinetic headline with one coloured word, glowing input boxes, dropdowns.
- **Monochrome hairline / line-art** — thin black strokes that draw themselves, dashed circles, outline icons, grids of circles, perspective lines. Very calm, very smooth.
- **Device mock-ups** — phone frame with chat bubbles sliding in.
