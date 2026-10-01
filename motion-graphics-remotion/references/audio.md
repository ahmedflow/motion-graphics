# Music and sound effects

## First: ask which music

Never pick the music silently, and never copy the soundtrack of a previous project or example — users notice when two different videos share the same track. Ask the user to choose (step 3 of SKILL.md): calm piano, upbeat electronic, lo-fi, ambient, cinematic, no music, or their own file.

## Generate instead of downloading

`scripts/synth-audio.mjs` synthesizes everything from math — no licensing questions:

```bash
node <skill-dir>/scripts/synth-audio.mjs public/<project> --mood <mood> --seconds <video length> [options]
```

| mood | sound | good for | useful options |
|---|---|---|---|
| `calm` | felt piano arpeggios + pad | storytelling under a narration | `--lift <s>` where it turns brighter (the win / climax) |
| `upbeat` | electronic, riser → drop, kick/clap/hats, plucks | product launch, energy | `--drop <s>` where the beat comes in |
| `lofi` | Rhodes chords, dusty swung drums, vinyl | chill, lifestyle, food, study | `--drop <s>` where drums enter |
| `ambient` | slow evolving pads, sparse bells, no drums | tech, minimal, luxury, calm explainers | — |
| `cinematic` | low string ostinato, building toms, big final chord | epic, sport, trailers, achievements | — |
| `none` | no music, only the SFX set | voice-only, or the user brings music | — |

Common options: `--seconds` (length), `--end <s>` (final chord / hit, default length − 2.5), `--bpm`, `--key C/D/E/F/G/A/Bb…`, `--scale major|minor`, `--sfx` (also write the small SFX set).

**Every run is different**: key, chord progression and arpeggio pattern are random unless you pass `--seed`. The script prints the seed/key/scale it used — note it, so if the user likes a version you can regenerate exactly that one (e.g. after changing the length). If the user says "change the music" without naming a style, re-run with the same mood (new seed) or offer another mood.

Line up the music with the story: put `--drop` / `--lift` on the moment the video turns (the reveal, the win), and `--end` on the last beat of the video.

Offering two soundtracks is cheap: generate two moods into different folders and register two `<Composition>`s with a `music` prop; render both and let the user choose.

If the user supplies their own music file, put it in `public/<project>/` and remind them they need the rights to publish it.

## SFX set (opt-in)

Sound effects are only written when you pass `--sfx`: `key.wav` (one soft keyboard tap), `click.wav`, `send.wav`, `ding.wav`, `reveal.wav` (soft swell + chime), `whoosh.wav`. Without `--sfx` you only get music — that's the right default.

## How much sound — the rules

Users tested videos made with this skill and found the sound annoying every time there were many effects or effects back to back. The music should carry the video; silence is better than a sound that isn't needed.

1. **Start with zero SFX.** Add one only if it *explains* an action the viewer sees (a click on a button, a message being sent, a task completing) or makes a single key moment clearly more professional (the final logo).
2. **Budget: max 3 SFX per video**, and **at least ~4 seconds between any two**. Never two in a row, never a sound in the same second as another.
3. **Never** on: text/words appearing, captions, scene transitions, camera moves, whip pans, counters ticking, each item of a list popping in, stars/confetti, every photo reveal.
4. **Typing**: no per-letter keyboard clicks. Either silence, or one single soft `key.wav` when typing starts.
5. **Volume**: SFX ≤ 0.35; music ~0.16 under a voiceover, rising to ~0.3 at the climax and ending; without voiceover ~0.45–0.55.
6. **With a voiceover**: music only. At most one SFX, and never while the voice is speaking.
7. **Logo reveal**: soft swell + gentle chime, never a hard impact.
8. **Before rendering, write the SFX list** (time → sound → why it's needed) for yourself, check it against rules 1–3, and delete anything you can't justify. Mention the final list to the user in one line.

You can't hear the result — say so, and tune from the user's feedback. If they say the sound is annoying, remove effects first; don't just lower the volume.

## Remotion usage

```tsx
<Audio src={staticFile('proj/music.wav')} volume={(f) => interpolate(f, [0, 30, end - 20, end], [0, 0.5, 0.5, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
<Sfx at={frame} src="proj/click.wav" volume={0.3} />
```
