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

But the world camera is **one tool, not the whole video**. A video where every scene change is the camera panning to the next board reads as "everything is a slide" — users rejected exactly that. Mix camera moves with the creative transitions in §11.

- Lay out each scene as a 1080×1920 "board" at a position on a large world (kit: `World`, `Board`, `camAt`). Put boards next to / below each other in story order.
- Between scenes, the camera pans to the next board (whip or calm in-out). Elements on the old board don't need to vanish — the camera leaves them.
- Inside a scene, the camera does something purposeful: push in on the key word/number, tilt down from a report to a chart, track sideways along a timeline or a row of items, pull out to reveal "all 8 of them".
- Let lines connect boards (a timeline the camera follows, a curve that rises into the next photo) — continuity reads as craft.
- Keep captions in **screen space** (outside the world) so they never move with the camera. A soft gradient band behind the caption area keeps them readable.

**Never put blur on camera moves or zooms** — users find it nauseating. No motion blur, no `filter: blur` on zoom. Blur is only acceptable as a gentle word entrance if the reference uses it — and the mask-rise caption is usually better.

Don't zoom on every shot for its own sake; every camera move should follow the narration.

## 4. Explain every line visually

For each spoken phrase, ask: what picture would make a viewer *understand* this sentence with the sound off?
- Place → map outline drawing itself + pin drop (+ one real photo of the place only if the story is about that place).
- "Doctors said…" → a medical report filling in line by line, with the key diagnosis highlighted.
- "won't grow" → growth chart: normal curve dashed, his curve flattening, an arrow showing the gap. Bring it back at the end with the curve breaking through.
- Club / brand / country name → the real crest / logo / flag, popped in with a ring.
- A number → a counter that counts up; a count of items → the items themselves appearing one by one, then a pull-out with "×8".
- A date or first event → a timeline with a ball/dot travelling to the year, plus a small chip with the exact date and opponent.
- A signing / contract → the object (napkin, paper) with a pen drawing the signature (`getPointAtLength` from `@remotion/paths` to move the pen tip).
- A trophy / win → drawn trophy in a medallion (or the real photo in a biography/sport story), stars, confetti burst.
- A job / a worker → a pictogram person at a desk; "many jobs" → the pictogram multiplying into a grid; "replaced" → some pictograms morphing into robot icons.
- "Fear" / "news everywhere" → headline bars stacking and shaking, a warning icon pulsing, a stress line rising.

Use real logos when a brand is named, and real photos when the line needs proof (a real person, place, moment). Otherwise explain it with graphics. A plain photo + caption is a slideshow — and a video made mostly of photos is not motion graphics.

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
- **Every element that contains Arabic needs its own `direction: 'rtl'`** — pills, chips, labels and badges too, not only captions. Without it, a trailing "…" or "؟" jumps to the start of the text ("…المكتب فاضي" instead of "المكتب فاضي…").
- Photo inside giant letters (`backgroundClip: 'text'`): put the background and the clip on **each word's own element**. If the clip is on a parent and the children have `transform` or `opacity` (as every animated word does), the text renders invisible.

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
- A video that is mostly text + home-made cards (chat boxes, notification lists, profile cards with drawn avatars) — "primitive, nothing visual supporting what is said".
- The opposite: a photo in almost every scene (collage, photo card, photo inside letters…) for a concept topic — "too many photos, it isn't motion graphics anymore". Photos only where the idea needs them.
- Transitions that are almost all the same slide / whip pan.
- A style reference picked by keyword (e.g. an AI product-UI launch for a video about people's fear of losing jobs) that has nothing to do with the idea.
- Music with vocals or spoken words under on-screen text.

## 9. Things users liked

- Word-by-word headline reveals with one accent-coloured word.
- A UI component that types the prompt, a mouse that clicks send.
- Real logos at the moment they're named.
- Continuity devices (timeline the camera follows, a curve that reappears at the end).
- Smooth 60 fps, calm music bed under the voice.

## 10. Creative motion toolbox — use a different idea in every scene

Plain "fade/slide in, hold, slide out" is not motion design. Each scene should have at least one move that makes a viewer think "nice". Pick per scene, don't repeat the same one back to back:

- **Kinetic typography**: words that scale/rotate into place one by one, a key word that grows to fill the frame and becomes the background of the next scene, words stacked in a tight block with mixed weights/sizes, a word that splits or gets crossed out and replaced (animate whole words in Arabic).
- **Photo inside type / shapes**: a real photo revealed *through* giant letters or a circle/blob mask that expands to full frame.
- **Cut-out subject**: a person/object photo (PNG with transparent background, or masked) layered over a graphic background, with parallax between layers.
- **Photo grid / collage that assembles**: many real photos fly in to form a grid or mosaic, then the camera dives into one of them.
- **Split screen / before–after**: a divider line wipes across one photo to reveal its contrast (e.g. old office → AI office).
- **Duotone / colour grading**: tint all photos in the video's palette so real imagery and graphics feel like one design.
- **Shape morph**: a shape morphs into the next (circle → pill → card → full frame) carrying the viewer between scenes (`@remotion/paths` `interpolatePath`).
- **Data that moves**: counters, bars that grow from the subject in the photo, icons that multiply into a crowd ("1 → 1,000 people").
- **Line that travels**: a hairline that draws itself across scenes and connects them (timeline, path, signature).
- **Depth**: layers at different scale speeds (foreground text, mid photo, background shapes), slow 3D tilt of a card/photo (`perspective` + `rotateY` ≤ 12°).
- **Texture & light**: grain overlay, soft light leaks or a moving gradient behind the subject — subtle, never blur on motion.

## 11. Transition vocabulary — vary it

Plan the transition into every scene in the storyboard. No type more than twice per video; slides/pans at most a third of all transitions.

- **Match cut**: a shape/colour/position in scene A becomes an element of scene B (a circle avatar → the dot of a timeline; a red number → a red bar).
- **Zoom-through**: push into a letter, a screen, the pupil of an eye, or a window in the photo, coming out in the next scene.
- **Mask wipe**: the next scene arrives through an expanding shape (circle, diagonal bar, the outline of a word).
- **Shape morph** (see §10) or **colour-block wipe**: a block of the accent colour sweeps the frame and leaves the next scene behind it.
- **Split / shutter**: the frame splits into 2–4 strips that slide apart revealing the next scene.
- **Typography carry**: the last word of a line stays on screen, scales up and becomes the background or title of the next scene.
- **Whip pan / camera move** on the world canvas (§3) — fine, but only as part of the mix.
- **Hard cut on the beat** — clean cuts timed to the music are professional too; use for energy changes.

Use the reference's own transitions as the first choice wherever they fit; the list above fills the rest.

## 12. Graphic building blocks — explaining without a photo

The base of a motion-graphics video. Build these as SVG/divs in the video's palette, in one consistent style (line weight, corner radius, colours):

- **Pictograms / isotype**: a simple person, desk, building, robot, coin… Show quantity and change with them — one becomes a row, a row becomes a crowd, some turn into another icon.
- **Icon morph**: one icon turns into the next (briefcase → robot head → lightbulb) with `interpolatePath` or a scale/rotate swap behind a mask — it carries the story without words.
- **Designed illustration**: a small scene (desk, lamp, laptop, figure) drawn as flat shapes, assembled piece by piece with staggered pops, then the camera moves through it.
- **Self-drawing line art**: outlines that draw themselves (`strokeDashoffset`), then fill with colour.
- **Charts that act**: bars that grow, a line that climbs then dips, a pie that splits, a counter — one value highlighted in the accent colour.
- **Maps & timelines**: an outline that draws, a dot that travels, years that tick by.
- **Shapes as actors**: a circle that grows into a planet, splits in two, becomes a button; blocks that stack, tilt and fall — abstract shapes can say "pressure", "replacement", "growth".
- **Typography as image**: a key word built from blocks, filled with a pattern, cracked, stamped, or pushed off-screen by another word.

Every scene still gets its own move and its own transition (§10–11). Weave the few photos into these graphics so everything feels like one design.
