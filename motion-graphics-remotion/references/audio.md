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

Common options: `--seconds` (length), `--end <s>` (final chord / hit, default length − 2.5), `--bpm`, `--key C/D/E/F/G/A/Bb…`, `--scale major|minor`, `--no-sfx`.

**Every run is different**: key, chord progression and arpeggio pattern are random unless you pass `--seed`. The script prints the seed/key/scale it used — note it, so if the user likes a version you can regenerate exactly that one (e.g. after changing the length). If the user says "change the music" without naming a style, re-run with the same mood (new seed) or offer another mood.

Line up the music with the story: put `--drop` / `--lift` on the moment the video turns (the reveal, the win), and `--end` on the last beat of the video.

Offering two soundtracks is cheap: generate two moods into different folders and register two `<Composition>`s with a `music` prop; render both and let the user choose.

If the user supplies their own music file, put it in `public/<project>/` and remind them they need the rights to publish it.

## SFX set

Written next to the music (skip with `--no-sfx`): `key1-4.wav` (soft keyboard), `click.wav`, `send.wav`, `ding.wav`, `reveal.wav` (soft swell + chime), `whoosh.wav`.

## How much sound

Users consistently asked for **less**:
- With a voiceover: music only, volume ~0.16 under speech, rise to ~0.3 at the climax and the ending. Zero or one SFX.
- Without voiceover: music + at most ~4 SFX in the whole video, each for a meaningful action (a click on send, a completion ding, a soft logo swell). No sound on every word.
- Keyboard typing: slow, human rhythm, sound on every other letter, volume ~0.12, soft muted "thock" — fast clicky typing is annoying.
- Logo reveal: soft swell + gentle chime, never a hard impact.

You can't hear the result — say so, and tune volumes from the user's feedback.

## Remotion usage

```tsx
<Audio src={staticFile('proj/music.wav')} volume={(f) => interpolate(f, [0, 30, end - 20, end], [0, 0.5, 0.5, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
<Sfx at={frame} src="proj/click.wav" volume={0.6} />
```
