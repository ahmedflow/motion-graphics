#!/usr/bin/env node
// Loudness of a music track, second by second, plus its "hits" (sudden jumps in energy).
// Use it to put the story's turn on a musical hit and to pick `startFrom`.
// Usage (from the Remotion project folder — it uses Remotion's bundled ffmpeg):
//   node music-energy.mjs public/<project>/music.mp3 [--seconds 40] [--json]
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const opt = (name, def) => {
	const i = args.indexOf(name);
	return i >= 0 && args[i + 1] ? Number(args[i + 1]) : def;
};
const maxSeconds = opt('--seconds', Infinity);
const asJson = args.includes('--json');
if (!file || !fs.existsSync(file)) {
	console.error('Usage: node music-energy.mjs <audio file> [--seconds 40] [--json]   (run from the Remotion project folder)');
	process.exit(1);
}

// decode to 8 kHz mono 16-bit WAV next to the cwd (relative paths are the most reliable with the bundled ffmpeg on Windows)
const RATE = 8000;
const tmp = `.energy-${process.pid}.wav`;
try {
	execSync(`npx remotion ffmpeg -hide_banner -loglevel error -y -i "${file}" -ac 1 -ar ${RATE} -c:a pcm_s16le "${tmp}"`, {stdio: ['ignore', 'ignore', 'inherit'], shell: true});
} catch {
	console.error('Decoding failed — run this from a Remotion project folder (needs `npx remotion ffmpeg`).');
	process.exit(1);
}
const buf = fs.readFileSync(tmp);
fs.unlinkSync(tmp);

// find the "data" chunk instead of assuming a 44-byte header
let off = 12;
let data = null;
while (off + 8 <= buf.length) {
	const id = buf.toString('ascii', off, off + 4);
	const size = buf.readUInt32LE(off + 4);
	if (id === 'data') {
		data = buf.subarray(off + 8, Math.min(buf.length, off + 8 + size));
		break;
	}
	off += 8 + size + (size % 2);
}
if (!data) {
	console.error('Could not read the decoded audio.');
	process.exit(1);
}

const n = data.length / 2;
const secs = Math.min(Math.ceil(n / RATE), maxSeconds);
const db = [];
for (let s = 0; s < secs; s++) {
	let acc = 0;
	let c = 0;
	for (let i = s * RATE; i < Math.min(n, (s + 1) * RATE); i++) {
		const v = data.readInt16LE(i * 2) / 32768;
		acc += v * v;
		c++;
	}
	db.push(c ? Math.round(20 * Math.log10(Math.sqrt(acc / c) + 1e-9)) : -99);
}

// a hit: at least 3 dB louder than the average of the two seconds before it
const hits = [];
for (let s = 2; s < db.length; s++) {
	const before = (db[s - 1] + db[s - 2]) / 2;
	if (db[s] - before >= 3 && db[s] > -40) hits.push(s);
}
const firstSound = db.findIndex((d) => d > -40);

if (asJson) {
	console.log(JSON.stringify({file: path.basename(file), dbPerSecond: db, hits, firstSound}, null, 2));
} else {
	const loud = Math.max(...db);
	console.log(`${path.basename(file)} — loudness per second (dB, 0 = max). # = relative energy, ◀ = hit\n`);
	db.forEach((d, s) => {
		const bar = '#'.repeat(Math.max(0, Math.round((d - (loud - 30)) / 1.5)));
		console.log(`${String(s).padStart(4)}s ${String(d).padStart(4)}  ${bar.padEnd(20)}${hits.includes(s) ? ' ◀ hit' : ''}`);
	});
	console.log(`\nfirst sound: ${firstSound}s   hits: ${hits.map((h) => h + 's').join(', ') || 'none'}`);
	if (hits.length > 1) {
		const gaps = hits.slice(1).map((h, i) => h - hits[i]);
		console.log(`gaps between hits: ${gaps.join(', ')} s`);
	}
	console.log('Put the story turn on a hit; with startFrom you can shift every hit earlier.');
}
