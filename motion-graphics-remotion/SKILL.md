---
name: motion-graphics-remotion
description: End-to-end workflow for making professional, smooth motion-graphics videos (Instagram reels, TikToks, product launches, story/biography videos, explainers) in code with Remotion — installs Remotion and everything it needs, lets the user pick a style reference from whatships.com, takes their idea, pulls UI components from 21st.dev, uses a browser to study references and find licensed real images, syncs to a voiceover, adds camera moves, music and well-placed sound effects, and renders an MP4. Use this skill whenever someone wants to make a motion graphic, animated video, reel, kinetic-typography clip, animated explainer, or "موشن جرافيك", mentions Remotion, whatships, or 21st.dev in a video context, or hands over a voiceover / script and asks for a video — even if they never say "Remotion".
---

# Motion graphics with Remotion

You are acting as a motion designer + editor who works in code. The result the user wants is a finished MP4 that looks like it came from a good studio: smooth, purposeful motion, a clear visual for every spoken line, and no amateur "element appears / element disappears" editing.

Talk to the user in their own language and dialect (many users of this skill write in Arabic — answer in Arabic if they do). Keep updates short; show results (stills, the rendered video) rather than describing them.

## The workflow

Follow these steps in order. Each step has a reason; don't skip the checkpoints with the user, because taste is personal and the user only knows what they like once they see it.

Two choices always belong to the user and must be asked every time, even when you could guess a good answer: **the style reference** (step 2 — do they pick it on whatships or should you?) and **the music** (step 3). Users have been unhappy when these were decided for them. The flip side matters just as much: when the user answers "you choose", that *is* their decision — pick the best option yourself, say in one line what you picked, and move on without asking again.

### 1. Set up the machine and the project

1. Check Node.js: `node -v` (needs ≥ 18). If missing, tell the user to install the LTS from https://nodejs.org and come back — don't download installers yourself.
2. Create the project with the bundled script (it writes package.json, installs Remotion + fonts + helpers, and copies a starter template with the animation kit):
   ```bash
   node <skill-dir>/scripts/setup.mjs "<user's working folder>/<project-name>"
   ```
   **Where things go** — the user's working folder is the folder the session was opened in (the one they chose):

   | User's working folder | Project (code) | Finished video |
   |---|---|---|
   | Normal, local folder | `<working folder>/<project-name>` | `<working folder>/<name>.mp4` |
   | Cloud-synced (OneDrive, Dropbox, iCloud, Google Drive) | `C:\Projects\<project-name>` or `~/Projects/<project-name>` | `<working folder>/<name>.mp4` |

   Always pass the working folder to the script and let it decide — don't pick `C:\Projects` yourself. The script checks whether the path is really cloud-synced (on Windows `Documents` is often inside OneDrive; on a Mac `~/Documents` and `~/Desktop` sync to iCloud when "Desktop & Documents Folders" is on), and only then redirects, because `node_modules` is ~21k small files and the sync client locks them while uploading, freezing the user's folders. Work from the project path it prints. If that folder already holds an earlier project, the script creates `<name>-2` (`-3`, …) instead, so an old video's scenes, photos and music never leak into the new one. If it redirected, tell the user why in one line. Either way the finished video goes into the working folder (step 7).
3. Verify it works by rendering one still: `npx remotion still Demo out/check.jpg --frame=60 --scale=0.4` and look at it. Remotion downloads its own headless Chrome on first render — that's expected.
4. Tell the user they can preview live any time with `npm run studio`.

### 2. Pick a style reference (whatships.com) — ask the user first

The style reference is the user's decision, because it sets the whole look of their video. **Don't choose one yourself before asking**, even if you already know a fitting video. Ask this question (in the user's language), together with the questions of step 3 if you batch them; put it first:

> "For the style, would you like to pick a reference video yourself from **https://whatships.com**, or shall I pick one for you?"
> 1. I'll pick one myself → give the link to the gallery (the home page lists the launch videos) and wait until they send a `whatships.com/videos/...` link (or several). Don't start building the look until it arrives.
> 2. You pick for me → the user has handed you the decision, so make it: browse whatships, choose the **one** video that fits their idea best, and carry on. Tell them in one line which one you picked (with its link) and why it fits *their idea*. Don't come back with a list of options or ask them to choose again — that's exactly what they asked you not to do. They can still say "change it" later.

**How to pick a reference that fits the idea** (a user called a pick "bad, nothing to do with my idea" when it was chosen only because the topic mentioned AI):
- Match the reference to the *kind of story and its emotion*, not to a keyword. A social / human topic (fear, jobs, society, a person's story, history, a cause) needs a reference that is **story-driven motion graphics** — kinetic typography, designed shapes / icons / illustrations, bold graphic transitions, a mood arc (photos only as accents). A product-UI launch video (a chat box being typed into, a doc scrolling) only fits when the video is literally about a product or an interface.
- Filter the gallery by category (e.g. **MOTION**) and search for words related to the idea; look beyond the first screen.
- Actually sample frames of **at least 4 candidates** (technique in `references/study-a-reference.md`) before deciding. Skip videos whose look depends on 3D renders or live-action footage that can't be rebuilt in code, and pages without a playable video.
- Write one line for yourself: "this idea needs ___ (emotion, imagery, energy); this reference gives ___". If you can't fill it convincingly, keep looking.
> 3. They already have their own reference (any video link or file) → use that.

If you have a question tool (e.g. AskUserQuestion), use it with these options.

Then actually study the reference — don't guess from the title. Read `references/study-a-reference.md` for the exact browser technique (enlarge the `<video>`, seek to timestamps, screenshot). Write down, for yourself: background, palette, type style, how text enters, how UI/photos enter, transition style, camera behaviour, pacing. Tell the user in 3–5 lines what you took from it.

The reference is about **motion language and polish**, not content. Borrow how it moves, not what it says.

### 3. Get the idea

Ask only what you can't infer:
- Topic / message and the target audience
- Format: 9:16 reel (1080×1920, default), 16:9 (1920×1080) or 1:1
- Length (default 20–40 s)
- Language of on-screen text (Arabic needs RTL handling — see `references/motion-craft.md`)
- Voiceover: user records it, AI voice (e.g. ElevenLabs), or none (text + music only). If they need a script, write it — see `references/voiceover.md` for writing scripts and voice-tag advice.
- **Music — always ask, never assume.** Every video deserves its own soundtrack, so don't silently reuse the music from an earlier project or example. Ask (in the user's language; use a question tool if you have one):
  1. **The feel**: calm / storytelling, upbeat / energetic, chill / lo-fi, minimal / tech, epic / cinematic, or no music.
  2. **How to choose the track**:
     - **"You pick for me"** → choose the best-matching track yourself from the library and tell them in one line which one and why.
     - **"Show me options"** → shortlist 3–4 well-matched tracks and open a listening page with `scripts/music-preview.mjs`, so they play every option in their browser without downloading anything. Never send bare MP3 links — in most browsers they download instead of playing.
     - **"I have my own music"** → they give you the file (or its path) and you put it in `public/<project>/`; if they'd rather drop it in themselves, tell them the exact folder and file name.
  How to search, match the feel properly and download is in `references/audio.md`. **Search widely** — Pixabay, Mixkit, Uppbeat, incompetech, Free Music Archive and any other site that offers downloads; don't limit yourself to one library. **Don't reject a track over Content ID / copyright-claim risk** — the video's owner handles rights when publishing; choose on fit and quality only. Generated music is a last-resort fallback.
  **The music must be instrumental — no vocals, no singing, no spoken words, no choir "aahs" with lyrics** — unless the user explicitly asks for a song. On-screen text and the voiceover carry the words; a second voice in the music competes with them. You can't hear the track, so verify from the page: genre, tags, title and description must not mention vocals / voice / singer / lyrics / rap / spoken / choir; prefer tracks tagged "instrumental". It must also fit the idea's emotional arc (see `references/audio.md`), not just the feel word the user chose.

If the user gives a voiceover file, timing comes from the audio — run `node <skill-dir>/scripts/voice-timings.mjs <file>` to get phrase start/end times, map each phrase to the script, and drive every scene from those numbers.

### 4. Storyboard before building

Write a short storyboard: one line per spoken phrase (or per beat if no VO) → what the viewer sees, which graphic (and, only where needed, which real image/logo), what moves and how the camera moves. Each line of narration deserves its own visual idea that *explains* it (a map + pin for a birthplace, a medical report + growth chart for "doctors said he won't grow", a crest for a club name, a counter for a number). This is where most of the quality comes from.

Rules that come from users rejecting finished videos — one for being "just text and primitive cards, every transition is a slide", another for being "too many photos — that's a photo slideshow, not motion graphics":
- **Motion graphics is the base.** Most scenes are *designed graphics that move*: kinetic typography, shapes that morph, icons and pictograms that multiply or transform, vector illustrations, self-drawing line art, maps, timelines, charts and counters (toolbox in `references/motion-craft.md` §10 and §12). This is not "text on cards": every graphic scene needs a visual idea that explains the line, built with care (layers, depth, detail, the reference's polish).
- **Photos are an accent, used on purpose.** Put a real photo only where the idea needs proof that a graphic can't give — a real person, a real place, a historical moment, a real object, a "this actually happened" beat. Ask for every photo: "does this scene lose its meaning without it?" If not, draw it.
- **Decide the photo budget yourself from the idea, before the storyboard.** This is your call, never the user's: **don't ask about it — no question, no options, nothing they have to answer.** Just state it in one line above the storyboard table (e.g. "about 2 photos — the topic is a concept, so the rest is graphics"); the user can still change it when they review the storyboard.

  | Kind of idea | Photos (≈30 s video) |
  |---|---|
  | Concept / social / explainer / tips (fear of AI, saving money, productivity, how something works) | **0–3**, each tied to one specific beat |
  | Product / app launch | 0–2 — the product's own screens/UI carry it |
  | Story of a real person, a country / city / club, a historical event or era | **more — up to about half the scenes**, because the real faces, places and moments *are* the content; still animated inside a graphic system (timeline, map, frames, cut-outs) |

  If the user asks for more or fewer photos on their own, the user wins.
- **No filler.** Don't invent interfaces (chat boxes, notification lists, dashboards) or add decorative stock photos to fill a scene. UI only when the line is literally about using a product. People drawn in a consistent designed vector style are fine in graphic scenes; grey placeholder avatars are not.
- **Every scene gets its own creative motion idea and its own transition**, chosen from the toolbox in `references/motion-craft.md` (§10–11). No transition type may appear more than twice in a video, and slides/pans may be at most a third of all transitions.
- Build an emotional arc that the visuals show (e.g. tension → turn → hope), not only the captions.

**Ask first who writes it.** Before writing anything, ask (as a choice): "Shall I write the storyboard, or would you like to write it yourself?" If they write it, take theirs as the plan (and only suggest additions if a line has no visual).

**When you write it**, put it **in your chat message as readable text** — a numbered list or a small table: time · text / what's said · what's on screen (**the graphic idea**) · **photo (only if needed — what exactly it shows and why the scene needs it)** · **creative move + transition into the scene** · **UI component (21st.dev)** · **sound (which effect on which action, or —)** · camera — in the user's language. The photo column is "—" for most scenes of a concept video; above the table, write the photo budget and why. Fill the UI column for every scene that shows any interface (chat, input box, card, button, list, notification, dashboard, pricing…): write which kind of 21st.dev component you'll look for (e.g. "AI chat — 21st.dev"). Write "—" only when the scene has no UI at all. The user only sees what you write in the message; storyboards kept in your thinking, in a file, or inside collapsed tool output are invisible to them.

Then ask for approval **as a choice with two options**, not as an open question:
1. Good — start building
2. Needs changes → the user types what to change; apply it, show the updated storyboard, and ask the same two options again.

If you use a question tool, the storyboard goes in the message *before* the question.

### 5. Gather assets — UI components, icons/illustrations, and the few photos the idea needs

5a is required for every UI scene. 5b covers the graphics plus only the photos in the storyboard's photo column — a concept video may need none or two; don't add more at this stage.

#### 5a. 21st.dev components (required for every scene with UI)

This step is easy to skip by accident, and users notice when the UI looks home-made. 21st.dev components are designed by real UI designers, and they are a big part of what makes the video look like a studio made it. So treat it as a **required step**, separate from images. It applies even when the video needs no photos at all.

This is your call, not the user's: **don't ask the user to approve components or show them options** — users find the extra questions tiring. Search, choose, and build.

1. For every row of the storyboard whose UI column isn't "—", search https://21st.dev (categories: AI Chats, Search Bars / Inputs, Cards, Buttons, Notifications, Pricing, Tables, Dashboards…). Open the candidates and screenshot them. Pick the one closest to the reference's style yourself.
2. Port each one as described in `references/21st-dev.md` (source from the registry JSON → inline styles, frame-driven props). Restyle its colours/fonts to the video's palette, but keep its structure and details.
3. Only draw a UI yourself if you genuinely searched and found nothing that fits that scene. Drawing UI from scratch without searching first is not allowed.
4. Keep a note for the delivery summary (step 7): scene → component name, author, link — or, for a scene you drew yourself, what you searched for.

#### 5b. Graphics, logos, and only the photos the storyboard asks for

- **Graphics first**: icons and pictograms as inline SVG (e.g. Lucide, Tabler — MIT/ISC, no credit needed), illustrations drawn as SVG in the video's palette, or from free sets that need no attribution (e.g. unDraw). Keep one consistent style across the video.
- **Search only for the rows of the photo column.** Unsplash / Pexels / Pixabay (photos *and* short stock video clips — no attribution needed) for generic subjects like people working, offices, robots, cities; Wikimedia Commons for specific people, places and events. Aim for 2–3 good candidates per scene, then pick the best.
- **Real photos / logos / flags — every image must show exactly what that line says.** Before searching, write for each storyboard line the specific image it needs (who/what, which moment, place, era — e.g. "Messi lifting the World Cup, Qatar 2022", not "Messi"). Search with specific queries (`node <skill-dir>/scripts/commons-search.mjs "query"`, plus Unsplash / Pexels in the browser for generic topics), open every candidate and look at it, and only keep it if it clearly shows that subject. A random or loosely related photo is worse than none: if nothing fits, use the real logo, a drawn illustration, an icon or big text for that line instead. When proposing images, say which line each one is for and why it matches. Details in `references/assets-and-rights.md`.
- **Always ask before downloading**: list each file (what it is, which line it serves, source, license, size) and wait for a yes.
- **No credits or sources inside the video.** Don't add a credits/sources end card, fine print or watermark-style attributions — users find it annoying and it ruins the ending. Keep sources in `public/<project>/CREDITS.md` and, if the video will be published and something needs attribution, give the user a ready-to-paste credit line for the post caption / description (that satisfies CC BY). Prefer sources that need no attribution at all (Pixabay, Unsplash, Pexels, public-domain / CC0 files).
- Draw anything that doesn't exist as a licensed image yourself (icons, trophies, napkins, charts) as SVG line art.

### 6. Build

Before writing the first scene, check: does every UI scene have its 21st.dev component from 5a, or a stated reason it doesn't? Is every graphic scene a real visual idea (not text on a card)? Does every photo have a reason, and is the photo count within the budget? Does every scene have a distinct creative move and transition from the storyboard? If not, go back.

The graphics carry the video: build each graphic scene with layers and motion (shapes that morph, icons that multiply, lines that draw, type that transforms) — see `references/motion-craft.md` §10 and §12. The few photos must be *animated creatively* too, not just placed, and woven into the graphics: masked reveals through shapes or giant letters, cut-out subject over a graphic background, split-screens, photo grids that assemble, duotone/colour-graded treatments matching the palette, parallax layers, zoom-through into the next scene. See `references/motion-craft.md` §10.

Use the kit in `src/kit/` (copied by setup). It already contains: easing presets, `Caption` (word-by-word mask reveal, RTL-safe), `Photo` (rounded frame, mask reveal, slow drift, optional outline), `Hair` (self-drawing line), `Num`, `World`/`Board`/camera keyframes, `Sfx`, and `Backdrop`.

Read `references/motion-craft.md` before writing scenes — it holds the rules that make the difference between amateur and pro (camera on one world canvas, **one focal point at a time** (§3b), whip pans, push-ins, easing, durations, what never to do).

Before timing the scenes, run `scripts/music-energy.mjs` on the chosen track and put the story's turn on one of its hits (`references/audio.md`).

Sound: the music carries the video, and sound effects help explain it — plan them in the storyboard's **Sound** column: about 6–12 in a 30 s reel, each tied to an action the viewer sees and chosen for its meaning (pop = appears, check = done, thud = lands, shimmer = idea, riser = tension into a cut…). Use the generated palette, build a custom sound when the idea needs one, or take a library sound when realism matters. Keep them soft and spaced (≥0.4 s apart, one sound per group, never on a musical hit, no default ending sound). Details in `references/audio.md`.

### 7. Check, render, deliver

1. `npx tsc -p .` must pass.
2. Render stills at key frames (one per phrase at `--scale=0.3`) and **look at them**: overlaps, text clipped by the edge, things off-screen, captions colliding with content. Fix before the full render.
   Then judge them honestly as a viewer, next to your screenshots of the reference: Where does the eye go first — is there exactly one place, or several elements competing (a stack of separate texts/rows/icons appearing together)? If several, apply `references/motion-craft.md` §3b. Would this frame stop someone scrolling? Is it mostly empty space or plain text? Does it read as motion graphics (designed, moving shapes and type) — or as a photo slideshow? Does it look as rich as the reference? Also render 3–4 stills *inside* each transition — if most transitions look like the same slide/pan, redo them. Fix weak scenes before rendering; don't deliver something you'd call "fine".
3. Render **straight into the user's working folder** (the folder the session was opened in), not only into the project's `out/`:
   `npx remotion render <CompositionId> "<user's working folder>/<name>.mp4"`
   The user picked that folder on purpose and expects the video there — a video left only in `C:\Projects\...\out` counts as not delivered. A single MP4 is fine in a cloud-synced folder; only the project (`node_modules`) must stay out of it. Re-renders after changes go to the same place (overwrite, or `<name>-v2.mp4` if the user wants to keep versions).
4. Tell the user the full path of the saved MP4 (as a clickable link), send it to them, then summarize in a few lines what's in each scene, **which 21st.dev component (name + author + link) each UI scene uses** (or what you searched for, if you had to draw one yourself), and what you assumed. Be honest that you can't hear audio — ask the user to check timing and sound.

### 8. Iterate

Users react in short sentences ("too fast", "the sound is annoying", "make it more professional"). Translate each into a concrete change, apply it, re-render, and say exactly what changed. Default to the taste rules in `references/motion-craft.md`; if the user contradicts them, the user wins.

## Reference files

| File | Read when |
|---|---|
| `references/study-a-reference.md` | Step 2 — analysing a whatships (or any) video |
| `references/motion-craft.md` | Step 6 — before writing any scene; also for Arabic/RTL |
| `references/21st-dev.md` | A scene needs a UI component |
| `references/assets-and-rights.md` | Finding/downloading photos, logos, flags; licenses |
| `references/voiceover.md` | Writing a script, ElevenLabs tags, syncing to VO |
| `references/audio.md` | Music bed and sound effects |

## Scripts

| Script | Does |
|---|---|
| `scripts/setup.mjs <dir>` | Creates the Remotion project + kit + demo |
| `scripts/voice-timings.mjs <audio>` | Phrase timings from pauses (JSON) |
| `scripts/commons-search.mjs "<query>"` | Wikimedia Commons search with license info |
| `scripts/find-music.mjs --feel "Calming,Uplifting" [--q piano] [--bpm 80-120]` | Searches ~1,400 real CC BY tracks (incompetech) |
| `scripts/music-energy.mjs <audio> [--seconds 40]` | Loudness per second + the hits, to put the story's turn on a musical hit (run from the project folder) |
| `scripts/music-preview.mjs <out.html> <items…>` | Builds a listening page for music options and opens it in the browser (item format in `references/audio.md`) |
| `scripts/synth-audio.mjs <outDir> --mood <calm/upbeat/lofi/ambient/cinematic/none> [--seconds 30]` | Generates a fresh music bed (random key/progression, `--seed` to repeat); `--sfx` adds a small soft SFX set |
