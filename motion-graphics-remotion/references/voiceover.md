# Voiceover: script, voice, timing

## Writing the script

- Short sentences, one idea each, with a visual you can show for it.
- 30–40 s ≈ 7 sentences. Start with a hook, end by calling back to the start.
- Write numbers and years **as words** for TTS (e.g. Arabic "ألفين وأربعة", "ستمئة واثنان وسبعون") — AI voices misread digits.
- Avoid facts you're not sure of; stop the story at the last thing you're confident about and say so.
- If the user wants Modern Standard Arabic (فصحى), offer full diacritics (تشكيل) on request, and double-check verb forms (e.g. "لن يَكْبَرَ" = won't grow up in size/age, vs "يَكْبُرَ" = become great).

## Choosing the voice

1. **User records it** — best for dialects. Ask for a quiet room, phone is fine, ~1 s silence between sentences.
2. **AI voice (ElevenLabs etc.)** — the user generates it with their own account; you never handle their API key unless they put it in a `.env` themselves.
3. **No voice** — text + music.

Never imitate a real person's voice.

## ElevenLabs tips (from experience)

- Audio tags like `[calm]` only work with the **Eleven v3** model. Other models read the tags out loud — that's the #1 problem users hit. Also make sure no backticks or notes are pasted.
- Fewer tags is better. Many emotional tags (`[excited]`, `[amused]`, `[dramatic]`…) make the narration exaggerated or laughable. For storytelling: one `[calm]` at the very start, nothing else. If the tone drifts later, repeat the same `[calm]` at the start of each paragraph — don't add new emotions.
- Exclamation marks push the voice to get excited; use full stops for a calm narrator.
- Pauses: `...` or `—`. `[pause]` is not an official tag.
- Raise **Stability** (60–75%) for a steadier read; choose a "narrator / storyteller" voice, not an ad voice.
- For non-v3 models, give a tag-free version where punctuation carries the rhythm.

## Syncing the video to the voice

1. Copy the file into `public/<project>/voice.mp3`.
2. Run `node <skill-dir>/scripts/voice-timings.mjs public/<project>/voice.mp3` → JSON with each speech segment's `start`/`end` (seconds). Try `--db -32 --min 0.18` for finer splits; sentence ends usually have the longest pauses (≥ 0.37 s), commas/ellipses shorter.
3. Map segments to script phrases by counting and by duration plausibility. You can't hear the audio — say so and ask the user to check sync.
4. In code: start the voice ~0.5 s in (`<Sequence from={T(0)}>`), define `T(sec)` → frame, and name a constant per phrase. Every caption and every scene beat references those constants, so changing a timing moves everything consistently.
5. Each caption shows the phrase's key words (not necessarily the whole sentence) from its start until the next phrase starts.
