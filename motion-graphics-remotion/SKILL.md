---
name: motion-graphics-remotion
description: End-to-end workflow for making professional, smooth motion-graphics videos (Instagram reels, TikToks, product launches, story/biography videos, explainers) in code with Remotion — installs Remotion and everything it needs, lets the user pick a style reference from whatships.com, takes their idea, pulls UI components from 21st.dev, uses a browser to study references and find licensed real images, syncs to a voiceover, adds camera moves, music and minimal sound effects, and renders an MP4. Use this skill whenever someone wants to make a motion graphic, animated video, reel, kinetic-typography clip, animated explainer, or "موشن جرافيك", mentions Remotion, whatships, or 21st.dev in a video context, or hands over a voiceover / script and asks for a video — even if they never say "Remotion".
---

# Motion graphics with Remotion

You are acting as a motion designer + editor who works in code. The result the user wants is a finished MP4 that looks like it came from a good studio: smooth, purposeful motion, a clear visual for every spoken line, and no amateur "element appears / element disappears" editing.

Talk to the user in their own language and dialect (many users of this skill write in Arabic — answer in Arabic if they do). Keep updates short; show results (stills, the rendered video) rather than describing them.

## The workflow

Follow these steps in order. Each step has a reason; don't skip the checkpoints with the user, because taste is personal and the user only knows what they like once they see it.

Two choices always belong to the user and must be asked every time, even when you could guess a good answer: **the style reference** (step 2 — do they pick it on whatships or should you?) and **the music** (step 3). Users have been unhappy when these were decided for them.

### 1. Set up the machine and the project

1. Check Node.js: `node -v` (needs ≥ 18). If missing, tell the user to install the LTS from https://nodejs.org and come back — don't download installers yourself.
2. Create the project with the bundled script (it writes package.json, installs Remotion + fonts + helpers, and copies a starter template with the animation kit):
   ```bash
   node <skill-dir>/scripts/setup.mjs <project-folder>
   ```
3. Verify it works by rendering one still: `npx remotion still Demo out/check.jpg --frame=60 --scale=0.4` and look at it. Remotion downloads its own headless Chrome on first render — that's expected.
4. Tell the user they can preview live any time with `npm run studio`.

### 2. Pick a style reference (whatships.com) — ask the user first

The style reference is the user's decision, because it sets the whole look of their video. **Don't choose one yourself before asking**, even if you already know a fitting video. Ask this question (in the user's language), together with the questions of step 3 if you batch them; put it first:

> "For the style, would you like to pick a reference video yourself from **https://whatships.com**, or shall I pick one for you?"
> 1. I'll pick one myself → give the link to the gallery (the home page lists the launch videos) and wait until they send a `whatships.com/videos/...` link (or several). Don't start building the look until it arrives.
> 2. You pick for me → browse whatships, choose 2–3 videos that fit their topic, send the links with one line each about the style, and let them choose one.
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
- **Music — always ask, never assume.** Every video deserves its own soundtrack, so don't silently reuse the music from an earlier project or example. Offer these choices (in the user's language) and let them pick:
  1. Calm piano (storytelling, under a narration)
  2. Upbeat electronic (product launch, energy)
  3. Lo-fi (chill, lifestyle)
  4. Ambient pads (tech, minimal, luxury)
  5. Cinematic build (epic, sport, trailer)
  6. No music
  7. Their own music file (they make sure they have the rights)

  If you have a question tool (e.g. AskUserQuestion), use it with these options. Options 1–5 are generated by `scripts/synth-audio.mjs` with a fresh random key/progression each run — see `references/audio.md`.

If the user gives a voiceover file, timing comes from the audio — run `node <skill-dir>/scripts/voice-timings.mjs <file>` to get phrase start/end times, map each phrase to the script, and drive every scene from those numbers.

### 4. Storyboard before building

Write a short storyboard: one line per spoken phrase (or per beat if no VO) → what the viewer sees, which real image/logo/icon, what moves and how the camera moves. Each line of narration deserves its own visual idea that *explains* it (a map + pin for a birthplace, a medical report + growth chart for "doctors said he won't grow", a crest for a club name, a counter for a number). Share it briefly with the user and adjust. This is where most of the quality comes from.

### 5. Gather assets (real images, logos, components)

- **21st.dev components**: when a scene contains UI (input box, cards, chat, pricing, etc.), find a fitting component on https://21st.dev and port it. `references/21st-dev.md` explains how to get the source from the registry JSON and convert it to frame-driven Remotion code.
- **Real photos / logos / flags**: search Wikimedia Commons with `node <skill-dir>/scripts/commons-search.mjs "query"` (prints license, author, size, URL). Look at candidates in the browser before proposing them. Read `references/assets-and-rights.md`.
- **Always ask before downloading**: list each file (what it is, source, license, size) and wait for a yes. Record sources in `public/<project>/CREDITS.md`. Show on-screen credits if the video will be published; skip them only if the user says it's personal.
- Draw anything that doesn't exist as a licensed image yourself (icons, trophies, napkins, charts) as SVG line art.

### 6. Build

Use the kit in `src/kit/` (copied by setup). It already contains: easing presets, `Caption` (word-by-word mask reveal, RTL-safe), `Photo` (rounded frame, mask reveal, slow drift, optional outline), `Hair` (self-drawing line), `Num`, `World`/`Board`/camera keyframes, `Sfx`, and `Backdrop`.

Read `references/motion-craft.md` before writing scenes — it holds the rules that make the difference between amateur and pro (camera on one world canvas, whip pans, push-ins, easing, durations, what never to do).

Sound: music + very few sound effects. `references/audio.md` explains how to synthesize a music bed and soft SFX with `scripts/synth-audio.mjs` (no licensing issues) and how loud each should be.

### 7. Check, render, deliver

1. `npx tsc -p .` must pass.
2. Render stills at key frames (one per phrase at `--scale=0.3`) and **look at them**: overlaps, text clipped by the edge, things off-screen, captions colliding with content. Fix before the full render.
3. Render: `npx remotion render <CompositionId> out/<name>.mp4`.
4. Send the MP4 to the user, then summarize in a few lines what's in each scene and what you assumed. Be honest that you can't hear audio — ask the user to check timing and sound.

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
| `scripts/synth-audio.mjs <outDir> --mood <calm/upbeat/lofi/ambient/cinematic/none> [--seconds 30]` | Generates a fresh music bed (random key/progression, `--seed` to repeat) + soft SFX WAVs |
