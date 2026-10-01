#!/usr/bin/env node
// Search a real, free music library: Kevin MacLeod / incompetech.com (~1,400 produced tracks, CC BY 4.0).
// Only reads the catalogue; it never downloads audio.
//
//   node find-music.mjs --feel "Calming,Uplifting" [--q piano] [--bpm 70-110] [--min 60] [--limit 8]
//   node find-music.mjs --feels            # list all available feels
//
// --feel   comma-separated feels; a track matches if it has ANY of them (e.g. Calming, Uplifting, Bright, Epic,
//          Driving, Grooving, Relaxed, Mysterious, Intense, Somber, Suspenseful, Action, Bouncy, Dark…)
// --q      words that must appear in title / description / instruments / genre (e.g. "piano", "electronic")
// --bpm    tempo range, e.g. 90-130
// --min    minimum track length in seconds (default: 30)
// Prints title, feel, bpm, length, instruments, a short description, and a PREVIEW link the user can open to listen.
const CATALOGUE = 'https://incompetech.com/music/royalty-free/pieces.json';
const MP3 = (file) => 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/' + encodeURIComponent(file);

const args = process.argv.slice(2);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);

const res = await fetch(CATALOGUE, {headers: {'User-Agent': 'motion-graphics-skill/1.0 (music search)'}});
if (!res.ok) {
	console.error('Could not load the catalogue:', res.status);
	process.exit(1);
}
const pieces = await res.json();
const feelsOf = (p) => (p.feel || '').split(',').map((s) => s.trim()).filter(Boolean);
const secs = (len) => {
	const [h, m, s] = (len || '0:0:0').split(':').map(Number);
	return h * 3600 + m * 60 + s;
};

if (args.includes('--feels')) {
	const count = {};
	pieces.forEach((p) => feelsOf(p).forEach((f) => (count[f] = (count[f] || 0) + 1)));
	console.log(Object.entries(count).sort((a, b) => b[1] - a[1]).map(([f, n]) => `${f} (${n})`).join(', '));
	process.exit(0);
}

const wantFeels = (opt('--feel', '') || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
const words = (opt('--q', '') || '').toLowerCase().split(/\s+/).filter(Boolean);
const [bpmLo, bpmHi] = (opt('--bpm', '0-999') || '0-999').split('-').map(Number);
const minLen = Number(opt('--min', 30));
const limit = Number(opt('--limit', 8));

let hits = pieces.filter((p) => {
	const feels = feelsOf(p).map((f) => f.toLowerCase());
	if (wantFeels.length && !wantFeels.some((f) => feels.includes(f))) return false;
	const hay = `${p.title} ${p.description} ${p.instruments} ${p.feel}`.toLowerCase();
	if (words.some((w) => !hay.includes(w))) return false;
	const bpm = Number(p.bpm) || 0;
	if (bpm && (bpm < bpmLo || bpm > (bpmHi || 999))) return false;
	return secs(p.length) >= minLen;
});

// shuffle so different projects get different suggestions
for (let i = hits.length - 1; i > 0; i--) {
	const j = Math.floor(Math.random() * (i + 1));
	[hits[i], hits[j]] = [hits[j], hits[i]];
}
console.log(`${hits.length} matching tracks — showing ${Math.min(limit, hits.length)} (random order):\n`);
hits = hits.slice(0, limit);
for (const p of hits) {
	console.log(`• ${p.title}`);
	console.log(`    feel: ${p.feel} | bpm: ${p.bpm} | length: ${p.length} | instruments: ${p.instruments}`);
	if (p.description) console.log(`    ${p.description.replace(/\s+/g, ' ').slice(0, 160)}`);
	console.log(`    preview/download: ${MP3(p.filename)}`);
}
console.log(`
License: CC BY 4.0 — credit when published:
  "<Title>" Kevin MacLeod (incompetech.com)
  Licensed under Creative Commons: By Attribution 4.0 License
  http://creativecommons.org/licenses/by/4.0/`);
