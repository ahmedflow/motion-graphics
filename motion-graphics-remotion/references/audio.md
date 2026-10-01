# Music and sound effects

## First: ask which music

Never pick the music silently, and never copy the soundtrack of a previous project or example — users notice when two different videos share the same track. Ask the user (step 3 of SKILL.md) for the **feel** (calm, energetic, chill, minimal, epic, or none) and the **source**: the real music library (A, recommended), generated music (B), or their own file.

## Option A — real music library (recommended)

incompetech.com (Kevin MacLeod) has ~1,400 produced tracks with real instruments, free under CC BY 4.0. Much more variety and quality than generated music.

1. Search by feel (and optionally instrument/genre and tempo):
   ```bash
   node <skill-dir>/scripts/find-music.mjs --feel "Calming,Relaxed" --q piano --limit 8
   node <skill-dir>/scripts/find-music.mjs --feel "Uplifting,Driving" --bpm 100-130
   node <skill-dir>/scripts/find-music.mjs --feels      # all feels with counts
   ```
   Feels: Calming, Relaxed, Uplifting, Bright, Bouncy, Grooving, Driving, Epic, Action, Intense, Mysterious, Dark, Somber, Suspenseful, Humorous… Results come in random order, so different projects get different suggestions.
2. Read the descriptions and pick 3–4 that suit the video (mood, pace, instruments; avoid tracks described as comedic/eerie unless that's the tone). Send them as a short list — title, one line about the sound, and the **preview link** — and let the user listen and choose. You can't hear audio; don't pretend to judge how it sounds.
3. Download only the chosen track into `public/<project>/music.mp3` (it's their pick, but still mention the size).
4. Tracks are usually longer than the video: in Remotion use `startFrom` to skip a slow intro if needed, and fade the volume out over the last ~1 s.
5. Credit (required when published) — add to CREDITS.md and the post description:
   `"<Title>" Kevin MacLeod (incompetech.com) — Licensed under Creative Commons: By Attribution 4.0`

## Option B — generate instead of downloading

`scripts/synth-audio.mjs` synthesizes everything from math — no licensing questions:

```bash
node <skill-dir>/scripts/synth-audio.mjs public/<project> --mood <mood> --seconds <video length> [options]
```

| mood | sound | good for | useful options |
|---|---|---|---|
| `calm` | felt piano arpeggios + pad | storytelling under a narration | `--lift <s>` where it turns brighter (the win / climax) |
| `upbeat` | electronic, riser → drop, kick/clap/hats, plucks | product launch, energy | `--drop <s>` where the beat comes in |
| `lofi` | Rhodes chords, dusty swung drums, vinyl | chill, lifestyle, food, study | `--drop <s>` where drums enter |
| `ambient` | slow evolving pads, no drums | tech, minimal, luxury, calm explainers | — |
| `cinematic` | low string ostinato, building toms, big final chord | epic, sport, trailers, achievements | — |
| `none` | no music, only the SFX set | voice-only, or the user brings music | — |

Common options: `--seconds` (length), `--end <s>` (final chord / hit, default length − 2.5), `--bpm`, `--key C/D/E/F/G/A/Bb…`, `--scale major|minor`, `--sfx` (also write the small SFX set).

Generated music is simple and needs no credit, but it sounds synthetic and one mood always has a similar character — prefer the library when the user wants variety or quality. It contains no random melodic "pings": every note belongs to the continuous bed, so nothing sounds like a sound effect firing for no reason.

**Every run is different**: key, chord progression and arpeggio pattern are random unless you pass `--seed`. The script prints the seed/key/scale it used — note it, so if the user likes a version you can regenerate exactly that one (e.g. after changing the length). If the user says "change the music" without naming a style, re-run with the same mood (new seed) or offer another mood.

Line up the music with the story: put `--drop` / `--lift` on the moment the video turns (the reveal, the win), and `--end` on the last beat of the video.

Offering two soundtracks is cheap: generate two moods into different folders and register two `<Composition>`s with a `music` prop; render both and let the user choose.

If the user supplies their own music file, put it in `public/<project>/` and remind them they need the rights to publish it.

## SFX set

Pass `--sfx` to also write a small soft set: `key.wav` (soft keyboard tap), `click.wav`, `send.wav`, `ding.wav`, `reveal.wav` (soft swell + chime), `whoosh.wav`. You can synthesize other sounds in the same way if a scene needs one.

## How to use sound

The idea is simple: **a sound should earn its place.** Use it when it helps the viewer understand what's happening (a button being pressed, a message sent, something completing, a counter landing on its number) or when it makes a moment feel more polished (a logo reveal, a key transition). Leave it out when it would just be decoration.

What made users' videos annoying was sounds stacked on top of each other or firing one after another on every little thing — every word, every item, every move. Give the video room to breathe: let the music carry the in-between moments, and keep effects soft so they sit under the music rather than on top of it.

Practical notes from user feedback:
- Typing: a fast click on every letter gets irritating quickly; something softer and sparser (or just the music) works better.
- Logo reveal: a soft swell + gentle chime feels premium; a hard impact feels cheap.
- With a voiceover, the voice is the star — keep effects rare and away from the words.
- If the user says the sound is annoying, look at how many effects there are and how close together they are, not only the volume.

You can't hear the result — say so, and adjust from the user's feedback.

## Remotion usage

```tsx
<Audio src={staticFile('proj/music.wav')} volume={(f) => interpolate(f, [0, 30, end - 20, end], [0, 0.5, 0.5, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
<Sfx at={frame} src="proj/click.wav" volume={0.4} />
```
