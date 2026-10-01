# Motion craft — what makes it look professional

These rules come from real feedback by users on finished videos. They're defaults; if the user asks otherwise, follow the user.

## 1. Everything is frame-driven

Remotion renders frame by frame. CSS animations, `transition`, framer-motion, `setTimeout`, `Date.now()` — none of these work. Every value must be a function of `useCurrentFrame()` via `interpolate`, `spring`, or the kit's `tween` / `smooth` helpers. When porting a 21st.dev component, keep its look, rewrite its motion.

Use **60 fps**. Fast motion at 30 fps looks choppy; 60 fps looks smooth.

## 2. Easing and timing

- Entrances: expo-out `Easing.bezier(0.16, 1, 0.3, 1)` (kit: `EXPO`) over 30–46 frames @60fps. Fast start, very soft landing.
- Camera moves between places: in-out. Calm moves `Easing.bezier(0.65, 0, 0.35, 1)` (`IN_OUT`), 40–60 frames. "Whip" moves `Easing.bezier(0.83, 0, 0.17, 1)` (`WHIP`), 35–45 frames — feels energetic but lands softly.
- Springs: `damping: 200` for no wobble; `damping 12–16, stiffness ~130, mass 0.7` for a small, controlled pop (logos, icons, badges).
- Stagger related items by 4–8 frames. Words in a caption: 4 frames.
- Nothing should ever stop abruptly or start at full speed.

## 3. Camera: one world, not a slideshow

The amateur pattern is: element appears, element disappears, next element appears. The pro pattern is a **camera travelling across one big canvas**:

- Lay out each scene as a 1080×1920 "board" at a position on a large world (kit: `World`, `Board`, `camAt`). Put boards next to / below each other in story order.
- Between scenes, the camera pans to the next board (whip or calm in-out). Elements on the old board don't need to vanish — the camera leaves them.
- Inside a scene, the camera does something purposeful: push in on the key word/number, tilt down from a report to a chart, track sideways along a timeline or a row of items, pull out to reveal "all 8 of them".
- Let lines connect boards (a timeline the camera follows, a curve that rises into the next photo) — continuity reads as craft.
- Keep captions in **screen space** (outside the world) so they never move with the camera. A soft gradient band behind the caption area keeps them readable.

**Never put blur on camera moves or zooms** — users find it nauseating. No motion blur, no `filter: blur` on zoom. Blur is only acceptable as a gentle word entrance if the reference uses it — and the mask-rise caption is usually better.

Don't zoom on every shot for its own sake; every camera move should follow the narration.

## 4. Explain every line visually

For each spoken phrase, ask: what picture would make a viewer *understand* this sentence with the sound off?
- Place → map outline drawing itself + pin drop + card with a real photo of the place.
- "Doctors said…" → a medical report filling in line by line, with the key diagnosis highlighted.
- "won't grow" → growth chart: normal curve dashed, his curve flattening, an arrow showing the gap. Bring it back at the end with the curve breaking through.
- Club / brand / country name → the real crest / logo / flag, popped in with a ring.
- A number → a counter that counts up; a count of items → the items themselves appearing one by one, then a pull-out with "×8".
- A date or first event → a timeline with a ball/dot travelling to the year, plus a small chip with the exact date and opponent.
- A signing / contract → the object (napkin, paper) with a pen drawing the signature (`getPointAtLength` from `@remotion/paths` to move the pen tip).
- A trophy / win → real photo of the trophy in a medallion, stars, confetti burst.

Use real images and logos whenever the narration names something concrete. A plain photo + caption is a slideshow.

## 5. Layout (9:16)

- Safe area: keep important content within x 70–1010, y 140–1380. Captions live around y 1460–1560.
- Photos in rounded frames (radius ~30) with a faint outline 20 px outside that draws itself.
- One idea per screen. Max two lines of caption.
- Big numbers: Inter 600, tabular numerals, letter-spacing −4%.

## 6. Arabic / RTL

- Animate whole words, never letters — Arabic letters join, splitting breaks shaping.
- Put `direction: 'rtl'` on caption containers; wrap Latin/numbers in their own `direction: 'ltr'` span with `unicodeBidi: 'isolate'` (counters like "31 / 2,000" otherwise flip).
- Font: IBM Plex Sans Arabic (loaded in the kit). Weight 500 for body captions, 600 for punch lines.
- Typing effect: slice by code points (`Array.from(text)`); partial words look natural.
- Code/LTR snippets with Arabic strings show bidi glitches — use English strings inside code.

## 7. Transitions between flat scenes (when not using the world camera)

Long soft cross-fade (22 frames, IN_OUT) + slight scale 1 → 1.05. Keep a single shared backdrop outside the scenes so the background never flashes.

## 8. Things users disliked (avoid)

- Blur on zooms or scene transitions.
- Zooming on everything.
- Sound effects piled up or back to back on every little thing ("gives a headache") — use them where they explain or add polish, not everywhere.
- Fast, clicky keyboard sounds on every letter.
- A hard impact sound on a logo reveal.
- Only "put a photo, then a ruler" — not enough explanation per line.
- Showing elements then removing them without camera movement.

## 9. Things users liked

- Word-by-word headline reveals with one accent-coloured word.
- A UI component that types the prompt, a mouse that clicks send.
- Real logos at the moment they're named.
- Continuity devices (timeline the camera follows, a curve that reappears at the end).
- Smooth 60 fps, calm music bed under the voice.
