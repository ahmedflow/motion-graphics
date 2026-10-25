# Voiceover: script, voice, timing

## Writing the script

- Short sentences, one idea each, with a visual you can show for it.
- 30–40 s ≈ 7 sentences. Start with a hook, end by calling back to the start.
- Write numbers and years **as words** for TTS (e.g. Arabic "ألفين وأربعة", "ستمئة واثنان وسبعون") — AI voices misread digits.
- Hand the script over as a **ready-to-paste block**, one sentence per line, in the user's language — and for an AI voice, already tagged (below). It is the first deliverable when the video has a voiceover: the video is built after the audio exists (SKILL.md step 3b).
- Avoid facts you're not sure of; stop the story at the last thing you're confident about and say so.
- If the user wants Modern Standard Arabic (فصحى), offer full diacritics (تشكيل) on request, and double-check verb forms (e.g. "لن يَكْبَرَ" = won't grow up in size/age, vs "يَكْبُرَ" = become great).

## Choosing the voice

1. **User records it** — best for dialects. Ask for a quiet room, phone is fine, ~1 s silence between sentences.
2. **AI voice (ElevenLabs etc.)** — the user generates it with their own account; you never handle their API key unless they put it in a `.env` themselves.
3. **No voice** — text + music.

Never imitate a real person's voice.

## ElevenLabs tips (from experience)

- Audio tags like `[calm]` only work with the **Eleven v3** model. Other models read the tags out loud — that's the #1 problem users hit. Also make sure no backticks or notes are pasted.
- **The first line is the hook — don't open it with `[calm]`.** A user's opening came out "far too calm"; use `[curious]` (or `[warm]`) on a question hook, connect the list with commas instead of "..." and end it with "!" if it should land with energy. After the hook, `[calm]` / `[warm]` / `[confident]` are enough for the rest.
- **Never use `[sighs]` / `[breathes]`-type tags** — the user heard a loud, obvious breath. Long "..." pauses also make the voice take audible breaths; use commas where the rhythm should stay connected.
- Fewer tags is better. Many emotional tags (`[excited]`, `[amused]`, `[dramatic]`…) make the narration exaggerated or laughable. For storytelling: one `[calm]` at the very start, nothing else. If the tone drifts later, repeat the same `[calm]` at the start of each paragraph — don't add new emotions.
- Exclamation marks push the voice to get excited; use full stops for a calm narrator.
- Pauses: `...` or `—`. `[pause]` is not an official tag.
- Raise **Stability** (60–75%) for a steadier read; choose a "narrator / storyteller" voice, not an ad voice.
- For non-v3 models, give a tag-free version where punctuation carries the rhythm.

## Syncing the video to the voice

1. Copy the file into `public/<project>/voice.mp3`.
2. Run `node <skill-dir>/scripts/voice-timings.mjs public/<project>/voice.mp3` → JSON with each speech segment's `start`/`end` (seconds). Try `--db -32 --min 0.18` for finer splits; sentence ends usually have the longest pauses (≥ 0.37 s), commas/ellipses shorter.
3. Map segments to script phrases by counting and by duration plausibility. You can't hear the audio — say so and ask the user to check sync.
4. **The video follows the voice, the voice doesn't squeeze the video.** Give each scene the time its animation needs. When a sentence is shorter than its scene (e.g. "Exit visa? One tap." followed by a click, a flight path and a stamp), split the voiceover into per-sentence chunks — cut in the silences between sentences — and place each chunk at its own time, leaving breathing room before the next sentence. Never speed up a scene's choreography to catch the next line: a user called that scene "finished strangely fast".
   ```ts
   // cut: [from, to] in the voice file (cut inside the pauses) · speech: first word in the file · at: where that word plays in the video
   export const VO_LINES = [
     {cut: [0, 3.9], speech: 0, at: 0.5},
     {cut: [3.9, 7.13], speech: 4.08, at: 4.6},
     // …one entry per sentence; raise `at` to give the previous scene more room
   ] as const;
   const v = (line: number, fileSec: number) => VO_LINES[line].at + (fileSec - VO_LINES[line].speech); // voice time → video time
   // every beat: B = {click: v(4, 15.9), …}
   ```
   ```tsx
   {VO_LINES.map((l, i) => (
     <Sequence key={i} from={s(l.at - (l.speech - l.cut[0]))} durationInFrames={s(l.cut[1] - l.cut[0])} layout="none">
       <Audio src={staticFile('proj/voice.mp3')} startFrom={s(l.cut[0])} endAt={s(l.cut[1])} />
     </Sequence>
   ))}
   ```
   Gaps of 0.3–1.2 s between sentences sound natural under music; keep the video's total length in check (≈ voice length + a few seconds).
5. In code: start the voice ~0.5 s in (`<Sequence from={T(0)}>`), define `T(sec)` → frame, and name a constant per phrase. Every caption and every scene beat references those constants, so changing a timing moves everything consistently.
6. Each caption shows the phrase's key words (not necessarily the whole sentence) from its start until the next phrase starts.
