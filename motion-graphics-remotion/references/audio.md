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
- Open candidate track pages and read the tags, duration and description. Fetching a track page's HTML (from a pixabay.com tab) gives the MP3 URL (`https://cdn.pixabay.com/download/audio/…mp3?filename=…`) and the tags (`/music/search/<tag>/` links). "Content ID Registered" tracks are fine to use.
- Track pages play in the browser, so the listening page can simply link to them (`▶ Open & play`).
- Downloading (after the user's OK): `curl` on the track page gets 403, but the CDN file downloads fine with a browser User-Agent and a Pixabay referer:
  ```bash
  curl -sL -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130" -e "https://pixabay.com/" "<cdn mp3 url>" -o public/<project>/music.mp3
  file public/<project>/music.mp3   # must say MPEG audio, not HTML
  ```
  If that ever fails, click **Download** on the track page in the browser and move the file from the Downloads folder; if that isn't possible either, ask the user to click Download once and tell you where it went.

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

## Finding the hits — sync the story to the music

You can't hear the track, but you can measure it. Run this from the project folder (it uses Remotion's bundled ffmpeg):
```bash
node <skill-dir>/scripts/music-energy.mjs public/<project>/music.mp3 --seconds 40
```
It prints the loudness of every second and marks the **hits** (sudden jumps in energy — a new phrase, the drums coming in, the big chord). Put the story's turn (the reveal, "but here's the truth", the logo) on a hit, and choose `startFrom` so the first hit lands where you need it. Many tracks repeat a phrase every 8 or 16 s, so the hits also tell you a natural scene length.

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

Pass `--sfx` to also write a soft palette: `pop.wav` (element appears), `tick.wav` (counter / small step), `check.wav` (done / correct), `thud.wav` (soft stamp, something lands), `shimmer.wav` (idea, positive turn, sparkle), `riser.wav` (1.5 s tension build into a cut), `swipe.wav` (quick swish for wipes and sliding cards), `whoosh.wav` (bigger camera move / zoom-through), `click.wav`, `key.wav` (soft keyboard tap), `send.wav`, `ding.wav` (notification), `reveal.wav` (swell + chime — real logo reveals only). You can synthesize other sounds in the same way if a scene needs one. Having a file in the set is not a reason to use it — each video picks only the sounds its own moments need.

## Sound design — what each moment sounds like

Sound effects are part of explaining the idea, not decoration. A good motion-graphics reel uses a fair number of them — but each one is attached to something the viewer *sees happening*, chosen for what that action means, soft, and with room around it. Users disliked both extremes: sounds back to back on every little thing ("headache") and a near-silent video where nothing the graphics do is heard.

**Plan it in the storyboard**: add a **Sound** column — for each scene, the one or two actions that deserve a sound and which sound. Typical density for a ~30 s reel: **about 6–12 effects**, roughly one per scene beat that has a meaningful action.

**Match the sound to the meaning**:

| What happens on screen | Sound |
|---|---|
| A key element appears / pops in | `pop` (soft) |
| A number lands, a step advances | `tick` (once at the end, not per digit) |
| Something is done, correct, checked | `check` |
| A stamp, a heavy word, something falls into place | `thud` |
| An idea, a positive turn, a sparkle | `shimmer` |
| Tension builds into a cut / reveal | `riser` ending exactly on the cut |
| A wipe, a card slides, a page turns | `swipe` |
| A big camera move, zoom-through | `whoosh` |
| A notification, an alert | `ding` |
| A real logo / brand reveal | `reveal` |

**Where sounds come from — pick per need**:
1. The generated palette above (`synth-audio.mjs --sfx`) — consistent, soft, no licence questions.
2. **Build a custom sound** when the idea calls for one the palette doesn't have (a heartbeat for anxiety, paper cracking, a cash register, a camera shutter, a clock ticking): write a small synth function the same way (`one('heartbeat.wav', sec, (x) => …)` in a copy of the script — sine/noise, filter, envelope with a soft attack) and generate it into `public/<project>/`.
3. **A library sound** when realism matters (a real crowd, rain, a typewriter): Pixabay Sound Effects (`https://pixabay.com/sound-effects/search/<words>/`, no attribution; same download trick as the music). Listen-proof it by reading the title/tags/duration; keep it short and trim/fade it in Remotion.

**Keep it pleasant — the rules that stop it from being annoying**:
- **Gap**: at least ~0.4 s between two effects; never two effects starting within the same moment.
- **Groups get one sound, not one each**: ten icons popping in = one `pop` (or a soft swipe) for the group; at most 3 quiet ticks for 3 clearly separate steps.
- **Same sound at most ~3 times** in a video, and vary its volume slightly if repeated.
- **Volume**: effects sit under the music — usually 0.15–0.35 (music 0.6–0.7); impacts like `thud` no louder than the music.
- **Never on top of a musical hit** — the music's hit is already the accent; place the effect just before it (a riser into it) or leave it.
- **No default ending sound**: the music ends the video.
- **Before rendering, list all effects** with their frame, sound and the action they belong to; check the gaps and counts above, then render.

## How to use sound

The idea is simple: **a sound should earn its place.** Use it when it helps the viewer understand what's happening (a button being pressed, a message sent, something completing, a counter landing on its number) or when it makes a moment feel more polished (an actual logo reveal, a key transition). Leave it out when it would just be decoration.

**No default ending sound.** Don't put a swell/chime/hit on the last scene by habit — a user noticed the same ending sound in every video. The ending belongs to the music: land the final scene on the track's own hit or final chord (`music-energy.mjs`) and let the music finish it. Use `reveal.wav` only when the video really ends on a logo/brand reveal, and never stack an effect on top of a musical hit. Don't reuse the same set of effects in the same places from video to video; decide per video.

What made users' videos annoying was sounds stacked on top of each other or firing one after another on every little thing — every word, every item, every move. Give the video room to breathe: let the music carry the in-between moments, and keep effects soft so they sit under the music rather than on top of it.

Practical notes from user feedback:
- Typing: a fast click on every letter gets irritating quickly; something softer and sparser (or just the music) works better.
- Logo reveal (only when there is a real logo): a soft swell + gentle chime feels premium; a hard impact feels cheap.
- The final scene of a story / explainer: no effect — the music's own hit or final chord is the ending.
- With a voiceover, the voice is the star — keep effects rare and away from the words.
- If the user says the sound is annoying, look at how many effects there are and how close together they are, not only the volume.

You can't hear the result — say so, and adjust from the user's feedback.

## Remotion usage

```tsx
<Audio src={staticFile('proj/music.wav')} volume={(f) => interpolate(f, [0, 30, end - 20, end], [0, 0.5, 0.5, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
<Sfx at={frame} src="proj/click.wav" volume={0.4} />
```
