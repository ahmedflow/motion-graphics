#!/usr/bin/env node
// Finds speech segments in a voiceover from its pauses (uses the ffmpeg bundled with Remotion).
// Run from inside the Remotion project:
//   node voice-timings.mjs public/proj/voice.mp3 [--db -32] [--min 0.18]
// Prints JSON: {duration, segments: [{i, start, end, length, pauseAfter}]}
import {spawnSync} from 'node:child_process';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const opt = (name, def) => {
	const i = args.indexOf(name);
	return i >= 0 ? Number(args[i + 1]) : def;
};
if (!file) {
	console.error('usage: node voice-timings.mjs <audio-file> [--db -32] [--min 0.18]');
	process.exit(1);
}
const db = opt('--db', -32);
const min = opt('--min', 0.18);

const cmd = `npx remotion ffmpeg -hide_banner -i "${file.replace(/"/g, '')}" -af silencedetect=noise=${db}dB:d=${min} -f null -`;
const res = spawnSync(cmd, {encoding: 'utf8', shell: true});
const log = (res.stderr || '') + (res.stdout || '');
const dur = log.match(/Duration: (\d+):(\d+):([\d.]+)/);
if (!dur) {
	console.error('Could not read the file. Run this from inside the Remotion project (needs @remotion/cli).\n' + log.slice(0, 800));
	process.exit(1);
}
const duration = Number(dur[1]) * 3600 + Number(dur[2]) * 60 + Number(dur[3]);

const silences = [];
let cur = null;
for (const m of log.matchAll(/silence_(start|end): ([\d.]+)/g)) {
	if (m[1] === 'start') cur = {start: Number(m[2])};
	else if (cur) {
		cur.end = Number(m[2]);
		silences.push(cur);
		cur = null;
	}
}
if (cur) silences.push({start: cur.start, end: duration});

const segments = [];
let t = 0;
for (const s of silences) {
	if (s.start - t > 0.05) segments.push({start: t, end: s.start, pauseAfter: s.end - s.start});
	t = s.end;
}
if (duration - t > 0.05) segments.push({start: t, end: duration, pauseAfter: 0});

const r = (x) => Math.round(x * 100) / 100;
console.log(
	JSON.stringify(
		{
			duration: r(duration),
			note: 'Longer pauseAfter (>= ~0.37s) usually = sentence end; shorter = comma / ellipsis.',
			segments: segments.map((s, i) => ({i, start: r(s.start), end: r(s.end), length: r(s.end - s.start), pauseAfter: r(s.pauseAfter)})),
		},
		null,
		2,
	),
);
