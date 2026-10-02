# Music and sound effects

## First: ask which music

Never pick the music silently, and never copy the soundtrack of a previous project or example. Ask (step 3 of SKILL.md) for the **feel** and **how to choose**: "you pick for me", "show me options", or "I have my own music".

## Matching the feel — this is where it usually goes wrong

A track tagged "epic" can still be eerie, comic, too slow, or start with 40 s of nothing. Pick like a music supervisor, not a keyword filter:

1. **Write a one-line brief first**: the feel, the energy curve of the video (e.g. "calm start, builds to a triumphant end"), tempo range, and instruments that fit the topic (tech → electronic/synth/piano; sport → drums/orchestra; luxury → ambient/piano; lifestyle → acoustic/lo-fi). Base it on the *idea and its emotional arc* (e.g. "fear of losing jobs: uneasy, tense start → turns hopeful at the end"), not only on the feel word the user picked — a generic "inspiring piano" was rejected as not fitting the idea.
1b. **Instrumental only.** Reject any track with vocals, singing, rap, spoken words, vocal chops or choir with lyrics (check genre, tags, title, description; search with the word "instrumental"; on Pixabay skip anything whose tags mention vocal/voice/singer/lyrics). The only exception is the user explicitly asking for a song. If in doubt, choose another track.
2. **Read each candidate's tags, title and description** and reject anything with a conflicting feel (eerie, unnerving, humorous, dark, horror, comedy, medieval… when that's not the tone), anything whose description suggests a different use, and anything shorter than the video.
3. **Prefer tracks whose energy starts quickly** — a reel has no time for a long intro (or plan a `startFrom` to skip it).
4. Keep only 3–4 that genuinely fit the brief. If the search returns poor matches, search again with other words rather than offering weak options.
5. You can't hear music. Say so honestly; the listening page lets the user judge.

## Where to look — search widely, pick the best fit

Don't stick to one library. A user complained when the search was limited to one source and then filtered down to only two tracks. Search **several sources** and choose purely on **fit and quality** — the idea, the emotional arc, the energy curve, instrumental.

**Don't reject a track over Content ID / copyright-claim risk** (e.g. Pixabay's "Content ID Registered" label, or a possibly muted post). The video's owner handles publishing and rights themselves. You may mention a known claim risk in one line when presenting the pick, but it never removes a track from the shortlist.

Good places to search (any downloadable track is fine): Pixabay Music, Mixkit, Uppbeat, incompetech, Free Music Archive, Bensound, YouTube Audio Library, or any other site that offers the track as a download. The only limit: use files a site actually offers for download — don't rip commercial songs from streaming services.

## Source — Pixabay Music

Huge, modern catalogue, free, no attribution needed.

- Search in the browser: `https://pixabay.com/music/search/<words>/` (e.g. `epic cinematic`, `corporate technology`, `lofi chill`, `inspiring piano`), or use the page's Genre / Mood / Duration filters.
- Open candidate track pages and read the tags, duration and description. "Content ID Registered" tracks are fine to use.
- Track pages play in the browser, so the listening page can simply link to them (`▶ Open & play`).
- Downloading: Pixabay blocks script downloads (`curl` gets 403). After the user picks one, click **Download** on that track page in the browser (with their OK) and move the file from their Downloads folder into `public/<project>/music.mp3`; if that isn't possible, ask the user to click Download once and tell you where it went.

## Source — incompetech.com (Kevin MacLeod)

~1,400 produced tracks, free under **CC BY 4.0** (needs a credit line in the post caption — never inside the video). Downloads work directly, and the MP3 links play inline on the listening page.

```bash
node <skill-dir>/scripts/find-music.mjs --feel "Uplifting,Epic" --q orchestra --bpm 90-130 --min 60
node <skill-dir>/scripts/find-music.mjs --feels      # all feels with counts
```

Credit to give the user for the caption: `Music: "<Title>" Kevin MacLeod (incompetech.com), CC BY 4.0`.

## The listening page

Never send bare MP3 links (they download instead of playing). Build one page with all candidates and open it in the user's browser:

```bash
node <skill-dir>/scripts/music-preview.mjs out/music-options.html   "Epic — leberch|https://pixabay.com/music/orchestral-epic-509664/|Pixabay · orchestral trailer build, 2:16"   "At Launch|https://incompetech.com/music/royalty-free/mp3-royaltyfree/At%20Launch.mp3|Brass + strings, building, 102 BPM"
```

Each item is `Title|URL|one-line note`. Direct audio URLs get an inline player; page URLs get an "Open & play" button. Then ask the user which number they want (a question tool with the numbered options works well).

## Using the track in Remotion

Tracks are longer than the video: `<Audio src={staticFile('proj/music.mp3')} startFrom={skipFrames} volume={…} />`, fading in over ~0.5 s and out over the last ~1 s. Under a voiceover keep it around 0.15–0.2.

## Source — generated music (fallback)

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
