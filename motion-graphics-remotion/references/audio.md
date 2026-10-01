# Music and sound effects

## Generate instead of downloading

`scripts/synth-audio.mjs` synthesizes everything from math — no licensing questions:

```bash
node <skill-dir>/scripts/synth-audio.mjs public/<project> --mood calm --bpm 72 --seconds 42 --lift 32.7 --end 38.9
node <skill-dir>/scripts/synth-audio.mjs public/<project> --mood upbeat --bpm 120 --seconds 25 --drop 2.5 --end 23.2
```

Outputs `music.wav` plus a small SFX set: `key1-4.wav` (soft keyboard), `click.wav`, `send.wav`, `ding.wav`, `reveal.wav` (soft swell + chime), `whoosh.wav`.

- **calm**: felt-piano arpeggios + pad, minor story progression, optional `--lift` (seconds) where it turns brighter (e.g. the win), final major chord at `--end`. Great under narration.
- **upbeat**: electronic 120 BPM, filtered intro, riser into `--drop`, kick/clap/hats, plucks, sidechain pump, final hit at `--end`. Great for product launches without voice.

Offer both moods if the user hasn't chosen — one render per soundtrack is cheap (two `<Composition>`s with a `music` prop).

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
