#!/usr/bin/env node
// Synthesizes a music bed + a small, soft SFX set as WAV files (no samples, no licensing issues).
//
//   node synth-audio.mjs <outDir> --mood <mood> [--seconds 30] [--bpm N] [--seed N] [--key C|D|E|F|G|A|Bb]
//                                 [--scale minor|major] [--drop 2.5] [--lift 20] [--end 27.5] [--sfx]
//
// Moods:
//   calm       felt piano arpeggios + pad (storytelling, under narration)
//   upbeat     electronic 120 BPM, riser + drop, kick/clap/hats, plucks (product launch, energy)
//   lofi       Rhodes chords, dusty swung drums, vinyl crackle (chill, lifestyle, study)
//   ambient    slow evolving pads + sparse bells, no drums (tech, minimal, luxury)
//   cinematic  low string ostinato, toms building, big final chord (epic, sport, trailers)
//   none       no music (use with --sfx if you only need the effects)
//
// Every run picks a random key, chord progression and pattern unless --seed is given; the seed used is
// printed so a version the user likes can be regenerated exactly. Different projects therefore get different music.
// Writes music.wav (unless none). With --sfx it also writes a small soft SFX set: key.wav, click.wav, send.wav,
// ding.wav, reveal.wav, whoosh.wav.
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outDir = path.resolve(args.find((a, i) => !a.startsWith('--') && !(args[i - 1] || '').startsWith('--')) || 'public/audio');
const has = (n) => args.includes(n);
const opt = (n, d) => (has(n) ? args[args.indexOf(n) + 1] : d);

const MOODS = ['calm', 'upbeat', 'lofi', 'ambient', 'cinematic', 'none'];
const mood = opt('--mood', 'calm');
if (!MOODS.includes(mood)) {
	console.error(`unknown --mood "${mood}". Use one of: ${MOODS.join(', ')}`);
	process.exit(1);
}
const SEED = Number(opt('--seed', Math.floor(Math.random() * 1e9)));
const DEFAULT_BPM = {calm: 72, upbeat: 120, lofi: 84, ambient: 60, cinematic: 96, none: 100};
const BPM = Number(opt('--bpm', DEFAULT_BPM[mood]));
const DUR = Number(opt('--seconds', 30));
const END = Number(opt('--end', DUR - 2.5));
const DROP = Number(opt('--drop', mood === 'upbeat' ? 2.5 : 0));
const LIFT = Number(opt('--lift', 0));
fs.mkdirSync(outDir, {recursive: true});

// ---------- core helpers ----------
const SR = 44100;
const TAU = Math.PI * 2;
let seed = SEED >>> 0 || 1;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const noise = () => rand() * 2 - 1;
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const saw = (ph) => 2 * (ph - Math.floor(ph + 0.5));

const buffer = (sec) => [new Float32Array(Math.ceil(sec * SR)), new Float32Array(Math.ceil(sec * SR))];
const add = ([L, R], start, len, fn, pan = 0, gain = 1) => {
	const gl = Math.cos(((pan + 1) * Math.PI) / 4) * gain;
	const gr = Math.sin(((pan + 1) * Math.PI) / 4) * gain;
	const s0 = Math.floor(start * SR);
	for (let i = 0; i < len * SR; i++) {
		const idx = s0 + i;
		if (idx < 0 || idx >= L.length) continue;
		const v = fn(i / SR);
		L[idx] += v * gl;
		R[idx] += v * gr;
	}
};
const svf = () => {
	let low = 0,
		band = 0;
	return (x, cutoff, q = 0.7) => {
		const f = 2 * Math.sin((Math.PI * clamp(cutoff, 20, SR / 6)) / SR);
		low += f * band;
		const high = x - low - band / q;
		band += f * high;
		return {low, band, high};
	};
};
const write = (name, [L, R], peak = 0.85) => {
	let max = 1e-9;
	for (let i = 0; i < L.length; i++) max = Math.max(max, Math.abs(L[i]), Math.abs(R[i]));
	const g = peak / max;
	const n = L.length;
	const b = Buffer.alloc(44 + n * 4);
	b.write('RIFF', 0);
	b.writeUInt32LE(36 + n * 4, 4);
	b.write('WAVEfmt ', 8);
	b.writeUInt32LE(16, 16);
	b.writeUInt16LE(1, 20);
	b.writeUInt16LE(2, 22);
	b.writeUInt32LE(SR, 24);
	b.writeUInt32LE(SR * 4, 28);
	b.writeUInt16LE(4, 32);
	b.writeUInt16LE(16, 34);
	b.write('data', 36);
	b.writeUInt32LE(n * 4, 40);
	for (let i = 0; i < n; i++) {
		b.writeInt16LE(Math.round(clamp(Math.tanh(L[i] * g), -1, 1) * 32767), 44 + i * 4);
		b.writeInt16LE(Math.round(clamp(Math.tanh(R[i] * g), -1, 1) * 32767), 46 + i * 4);
	}
	fs.writeFileSync(path.join(outDir, name), b);
	console.log('wrote', path.join(outDir, name));
};

// ---------- harmony: random key + progression per run ----------
const KEYS = {C: 48, Db: 49, D: 50, Eb: 51, E: 52, F: 53, Gb: 54, G: 55, Ab: 44, A: 45, Bb: 46, B: 47};
const keyName = opt('--key', pick(Object.keys(KEYS)));
const TONIC = KEYS[keyName] ?? 50; // octave-3 root
const scale = opt('--scale', mood === 'upbeat' || mood === 'lofi' ? pick(['major', 'minor']) : mood === 'ambient' ? pick(['major', 'minor']) : 'minor');
const PROGS = {
	minor: [
		[[0, 'm'], [8, 'M'], [3, 'M'], [10, 'M']],
		[[0, 'm'], [5, 'm'], [8, 'M'], [7, 'M']],
		[[0, 'm'], [10, 'M'], [8, 'M'], [7, 'M']],
		[[0, 'm'], [3, 'M'], [10, 'M'], [5, 'm']],
		[[0, 'm'], [8, 'M'], [5, 'm'], [7, 'M']],
	],
	major: [
		[[0, 'M'], [7, 'M'], [9, 'm'], [5, 'M']],
		[[0, 'M'], [5, 'M'], [9, 'm'], [7, 'M']],
		[[0, 'M'], [9, 'm'], [5, 'M'], [7, 'M']],
		[[5, 'M'], [7, 'M'], [4, 'm'], [9, 'm']],
		[[0, 'M'], [4, 'm'], [5, 'M'], [7, 'M']],
	],
};
const progSpec = pick(PROGS[scale]);
const liftSpec = pick(PROGS.major);
// voice a chord around octave 4: [bass root, 3rd, 5th, 7th/octave]
const voice = ([deg, q], seventh = true) => {
	const r = TONIC + deg;
	const third = q === 'm' ? 3 : 4;
	const top = seventh ? (q === 'm' ? 10 : 11) : 12;
	const up = [r + 12, r + 12 + third, r + 12 + 7, r + 12 + top].map((n) => (n > TONIC + 26 ? n - 12 : n));
	return {root: r, notes: up.sort((a, b) => a - b)};
};
const prog = progSpec.map((c) => voice(c, mood === 'lofi' || mood === 'ambient'));
const liftProg = liftSpec.map((c) => voice(c, false));
const PATTERNS = [[1, 2, 3, 2], [0, 2, 1, 3], [1, 3, 2, 3], [0, 1, 2, 3], [2, 1, 3, 1]];
const pattern = pick(PATTERNS);

const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const chordAt = (t, p = prog) => p[Math.floor(t / BAR) % p.length];
const finalChord = () => {
	const third = scale === 'major' || mood === 'cinematic' ? 4 : 3;
	return [TONIC - 12, TONIC, TONIC + 7, TONIC + 12, TONIC + 12 + third, TONIC + 19, TONIC + 24];
};

// ---------- instruments ----------
const piano = (n, vel = 1, len = 3) => {
	const f = midi(n);
	return (t) => {
		const env = Math.min(1, t / 0.006) * Math.exp(-t * (1.1 + n / 90)) * (t > len - 0.3 ? Math.max(0, (len - t) / 0.3) : 1);
		let v = 0;
		[1, 0.45, 0.22, 0.1, 0.05].forEach((a, k) => (v += a * Math.sin(TAU * f * (k + 1) * (1 + 0.0008 * k * k) * t) * Math.exp(-t * k * 0.9)));
		return v * env * vel * 0.12;
	};
};
const rhodes = (n, len, dark = 2600) => {
	const f = midi(n);
	const lp = svf();
	return (t) => {
		const fm = Math.sin(TAU * f * t) * 1.2 * Math.exp(-t * 4);
		const v = Math.sin(TAU * f * t + fm) + 0.15 * Math.sin(TAU * f * 2 * t) * Math.exp(-t * 6);
		const env = Math.min(1, t / 0.012) * Math.exp(-t * 1.1) * (t > len - 0.15 ? Math.max(0, (len - t) / 0.15) : 1);
		return lp(v * env * (1 + 0.12 * Math.sin(TAU * 4.5 * t)), dark, 0.7).low * 0.1;
	};
};
const pad = (notes, len, gain, att = 1.5) => (t) => {
	const env = Math.min(1, t / att) * Math.min(1, (len - t) / att);
	return notes.reduce((s, n) => s + Math.sin(TAU * midi(n) * t) + 0.6 * Math.sin(TAU * midi(n) * 1.004 * t), 0) * env * gain;
};
const kick = (t) => Math.sin(TAU * (45 * t + (110 / 28) * (1 - Math.exp(-t * 28)))) * Math.exp(-t * 7);
const softKick = (t) => Math.sin(TAU * (50 * t + (80 / 30) * (1 - Math.exp(-t * 30)))) * Math.exp(-t * 9) * 0.8;
const tom = (f0) => (t) => Math.sin(TAU * (f0 * t + (f0 / 12) * (1 - Math.exp(-t * 12)))) * Math.exp(-t * 5);

const music = buffer(DUR);
const fadeOutAt = (t) => (t > END + 0.8 ? Math.max(0, 1 - (t - END - 0.8) / 1.2) : 1);

// ---------- moods ----------
if (mood === 'calm') {
	const liftAt = LIFT > 0 ? LIFT : END;
	for (let t = 0.3, k = 0; t < liftAt - 0.2; t += BEAT / 2, k++) {
		const ch = chordAt(t);
		if (t < DUR * 0.3 && k % 2) continue;
		add(music, t, 3, piano(ch.notes[pattern[k % 4]] + 12, 0.55 + 0.25 * Math.min(1, t / 20) + (k % 4 === 0 ? 0.15 : 0)), k % 2 ? 0.25 : -0.25);
		if (k % 8 === 0) add(music, t, 3, piano(ch.root, 0.7));
	}
	for (let t = DUR * 0.3; t < liftAt; t += BAR) {
		const len = Math.min(BAR + 1.5, liftAt + 0.3 - t);
		add(music, t, len, pad(chordAt(t).notes.slice(1), len, 0.012 + 0.012 * ((t - DUR * 0.3) / 20)));
	}
	if (LIFT > 0) {
		add(music, LIFT - 2.8, 2.9, (t) => {
			const p = t / 2.8;
			return [TONIC + 12, TONIC + 19, TONIC + 24].reduce((s, n) => s + Math.sin(TAU * midi(n) * t), 0) * p * p * 0.03 + noise() * p * p * 0.006;
		});
		for (let t = LIFT, k = 0; t < END - 0.1; t += BEAT / 2, k++) {
			const ch = chordAt(t - LIFT, liftProg);
			add(music, t, 3, piano(ch.notes[pattern[k % 4]] + 12, 0.75 + (k % 4 === 0 ? 0.2 : 0)), k % 2 ? 0.3 : -0.3);
			if (k % 8 === 0) {
				add(music, t, 3.5, piano(ch.root, 0.9));
				add(music, t, BAR + 1, pad(ch.notes.slice(1), BAR + 1, 0.022));
			}
		}
	}
	finalChord().forEach((n, k) => add(music, END + k * 0.05, 3, piano(n, 0.85, 3)));
} else if (mood === 'upbeat') {
	{
		const lpL = svf();
		const lpR = svf();
		const ph = new Array(8).fill(0).map(() => rand());
		const [L, R] = music;
		for (let i = 0; i < L.length; i++) {
			const t = i / SR;
			const notes = chordAt(t).notes;
			let l = 0,
				r = 0;
			notes.forEach((n, k) => {
				ph[k] = (ph[k] + (midi(n) * 1.003) / SR) % 1;
				ph[k + 4] = (ph[k + 4] + (midi(n) * 0.997) / SR) % 1;
				l += saw(ph[k]);
				r += saw(ph[k + 4]);
			});
			const intro = t < DROP;
			const cutoff = intro ? 400 + 1400 * (t / Math.max(DROP, 0.01)) ** 2 : 1500 + 400 * Math.sin(TAU * t * 0.125);
			const fade = (t > END ? Math.max(0, 1 - (t - END) / 1.2) : 1) * Math.min(1, t / 0.6);
			const pump = intro ? 1 : 0.35 + 0.65 * Math.min(1, ((t - DROP) % BEAT) / 0.22);
			L[i] += lpL(l, cutoff, 0.9).low * 0.07 * fade * pump;
			R[i] += lpR(r, cutoff, 0.9).low * 0.07 * fade * pump;
		}
	}
	for (let t = DROP; t < END; t += BEAT) add(music, t, 0.5, (x) => kick(x) * 0.9);
	for (let t = DROP + BEAT / 2; t < END; t += BEAT) {
		const hp = svf();
		add(music, t, 0.12, (x) => hp(noise(), 8000, 0.8).high * Math.exp(-x * 60) * 0.25, 0.3);
	}
	for (let t = DROP + BEAT; t < END; t += 2 * BEAT) {
		const bp = svf();
		add(music, t, 0.3, (x) => bp(noise(), 1500, 1.2).band * Math.exp(-x * 18) * 0.6, 0.05);
	}
	for (let t = DROP, k = 0; t < END; t += BEAT / 2, k++) {
		const ch = chordAt(t);
		const fb = midi(ch.root - 12);
		const lp = svf();
		add(music, t, BEAT / 2, (x) => lp(saw(fb * x) * 0.6 + Math.sin(TAU * fb * x), 500, 0.8).low * Math.min(1, x / 0.01) * Math.exp(-x * 5) * 0.35);
		const fp = midi(ch.notes[pattern[k % 4]] + 12);
		const lp2 = svf();
		add(music, t, 0.6, (x) => lp2(saw(fp * x) + 0.5 * saw(fp * 2.002 * x), 900 + 5000 * Math.exp(-x * 14), 1.4).low * Math.exp(-x * 7) * 0.09, k % 2 ? 0.35 : -0.35);
	}
	if (DROP > 0.5) {
		const hp = svf();
		add(music, DROP - 1.6, 1.6, (x) => hp(noise(), 300 + 7000 * (x / 1.6) ** 2, 1.5).band * (x / 1.6) ** 2 * 0.35);
		add(music, DROP, 1.5, (x) => kick(x) * 1.3);
	}
	add(music, END, 1.3, (x) => kick(x) * 1.2 + Math.sin(TAU * midi(TONIC + 12) * x) * Math.exp(-x * 1.5) * 0.08);
} else if (mood === 'lofi') {
	const start = DROP > 0 ? DROP : BAR;
	for (let t = 0; t < END; t += BAR) {
		const ch = chordAt(t);
		const dark = t < start ? 1400 : 2600;
		ch.notes.forEach((n, k) => {
			add(music, t + k * 0.012, BAR * 0.62, rhodes(n, BAR * 0.62, dark), (k - 1.5) * 0.25);
			add(music, t + 2.5 * BEAT + k * 0.01, BEAT * 1.4, rhodes(n, BEAT * 1.4, 2200), (k - 1.5) * 0.25, 0.55);
		});
	}
	for (let t = start; t < END; t += BAR) {
		const f = midi(chordAt(t).root);
		[[0, 1.6 * BEAT], [2.5 * BEAT, 1.2 * BEAT]].forEach(([o, len]) =>
			add(music, t + o, len, (x) => Math.sin(TAU * f * x) * Math.min(1, x / 0.02) * Math.exp(-x * 1.5) * (x > len - 0.08 ? Math.max(0, (len - x) / 0.08) : 1) * 0.28),
		);
	}
	for (let t = start, bar = 0; t < END - 0.05; t += BAR, bar++) {
		(bar % 2 ? [0, 2.5, 3.25] : [0, 2.5]).forEach((b) => add(music, t + b * BEAT, 0.4, softKick));
		[1, 3].forEach((b) => {
			const bp = svf();
			const lp = svf();
			add(music, t + b * BEAT + 0.015, 0.35, (x) => lp(bp(noise(), 1800, 0.8).band * Math.exp(-x * 16) * 0.5 + Math.sin(TAU * 185 * x) * Math.exp(-x * 25) * 0.35, 4000, 0.7).low, 0.05);
		});
		for (let e = 0; e < 8; e++) {
			const hp = svf();
			add(music, t + e * BEAT * 0.5 + (e % 2 ? BEAT * 0.1 : 0), 0.08, (x) => hp(noise(), 7000, 0.8).high * Math.exp(-x * 70) * (e % 2 ? 0.07 : 0.11), 0.3);
		}
	}
	{
		const [L, R] = music;
		const lp = svf();
		for (let i = 0; i < L.length; i++) {
			const t = i / SR;
			let v = lp(noise(), 3000, 0.7).low * 0.012;
			if (rand() < 0.0004) v += noise() * 0.12;
			L[i] += v * Math.min(1, t / 0.5) * fadeOutAt(t);
			R[i] += v * Math.min(1, t / 0.5) * fadeOutAt(t);
		}
	}
	finalChord().slice(1, 6).forEach((n, k) => add(music, END + k * 0.02, 1.6, rhodes(n, 1.6, 2400), (k - 2) * 0.2));
} else if (mood === 'ambient') {
	for (let t = 0; t < END; t += BAR * 2) {
		const ch = chordAt(t / 2);
		const len = Math.min(BAR * 2 + 3, END + 2 - t);
		const lpL = svf();
		const swell = (x) => 0.5 + 0.5 * Math.sin(TAU * x / (BAR * 2) - Math.PI / 2);
		add(music, t, len, (x) => lpL(pad(ch.notes, len, 0.03, 2.5)(x), 700 + 1600 * swell(x), 0.8).low, -0.2);
		add(music, t, len, pad([ch.root, ch.root + 12], len, 0.02, 2.5), 0.2);
	}
	{
		const [L, R] = music;
		const bp = svf();
		for (let i = 0; i < L.length; i++) {
			const t = i / SR;
			const v = bp(noise(), 900 + 600 * Math.sin(TAU * t * 0.05), 0.6).band * 0.01 * Math.min(1, t / 3) * fadeOutAt(t);
			L[i] += v;
			R[i] -= v * 0.6;
		}
	}
	add(music, END, 4, pad(finalChord().slice(1, 5), 4, 0.03, 0.4));
} else if (mood === 'cinematic') {
	// low strings ostinato (8ths), building toms, swell, big final chord
	for (let t = 0, k = 0; t < END; t += BEAT / 2, k++) {
		const ch = chordAt(t);
		const build = Math.min(1, t / (END * 0.8));
		const f = midi(ch.root + (k % 2 ? 12 : 0));
		const lp = svf();
		add(music, t, BEAT / 2, (x) => lp(saw(f * x) + 0.5 * saw(f * 1.005 * x), 500 + 1800 * build, 0.9).low * Math.min(1, x / 0.015) * Math.exp(-x * 4) * (0.12 + 0.1 * build), k % 2 ? 0.2 : -0.2);
	}
	for (let t = 0; t < END; t += BAR) {
		const ch = chordAt(t);
		const len = BAR + 0.4;
		const lpL = svf();
		const build = Math.min(1, t / (END * 0.8));
		add(music, t, len, (x) => lpL(ch.notes.reduce((s, n) => s + saw(midi(n) * x) + saw(midi(n) * 1.004 * x), 0), 900 + 2200 * build, 0.7).low * Math.min(1, x / 0.6) * Math.min(1, (len - x) / 0.4) * 0.018);
	}
	for (let t = BAR * 2, bar = 2; t < END; t += BAR, bar++) {
		const hits = bar % 2 ? [0, 1.5, 2, 3, 3.5] : [0, 2, 3];
		hits.forEach((b) => add(music, t + b * BEAT, 0.8, tom(pick([62, 70, 82])), rand() * 0.6 - 0.3, 0.35 + 0.4 * Math.min(1, t / END)));
	}
	{
		const hp = svf();
		add(music, END - 2.2, 2.2, (x) => hp(noise(), 400 + 6000 * (x / 2.2) ** 2, 1.2).band * (x / 2.2) ** 2 * 0.25);
	}
	add(music, END, 3.5, (x) => tom(55)(x) * 1.2);
	add(music, END, 4, (x) => finalChord().reduce((s, n) => s + saw(midi(n) * x) * 0.5 + Math.sin(TAU * midi(n) * x), 0) * Math.min(1, x / 0.05) * Math.exp(-x * 0.9) * 0.03);
}

if (mood !== 'none') write('music.wav', music, 0.8);
else if (!has('--sfx')) console.log('mood=none and no --sfx: nothing to write.');

// ---------- SFX (deliberately few and soft) ----------
if (has('--sfx')) {
	const one = (name, sec, fn, peak) => {
		const b = buffer(sec);
		add(b, 0, sec, fn);
		write(name, b, peak);
	};
	{
		seed = 777;
		const bp = svf();
		const lp = svf();
		const pitch = 150 + 40 * rand();
		const tone = 900 + 300 * rand();
		one('key.wav', 0.12, (x) => lp(Math.sin(TAU * pitch * x) * Math.exp(-x * 60) + bp(noise(), tone, 1.2).band * Math.exp(-x * 160) * 0.5, 2200, 0.7).low * Math.min(1, x / 0.002), 0.6);
	}
	one('click.wav', 0.08, (x) => (noise() * Math.exp(-x * 300) + Math.sin(TAU * 1800 * x) * Math.exp(-x * 120) * 0.5) * 0.9, 0.8);
	one('send.wav', 0.7, (x) => (Math.sin(TAU * midi(76) * x) * Math.exp(-x * 6) + (x > 0.08 ? Math.sin(TAU * midi(83) * (x - 0.08)) * Math.exp(-(x - 0.08) * 5) : 0)) * 0.5, 0.7);
	one('ding.wav', 1.4, (x) => [72, 76, 79, 84].reduce((s, n, k) => (x - k * 0.06 > 0 ? s + Math.sin(TAU * midi(n) * (x - k * 0.06)) * Math.exp(-(x - k * 0.06) * 3.5) * 0.3 : s), 0), 0.7);
	{
		const lp = svf();
		const air = svf();
		one('reveal.wav', 3.0, (x) => {
			const swell = x < 0.9 ? Math.pow(x / 0.9, 2) : Math.exp(-(x - 0.9) * 1.6);
			const padv = [69, 76, 81, 85].reduce((s, n) => s + Math.sin(TAU * midi(n) * x + Math.sin(TAU * 5 * x) * 0.3), 0) * 0.18;
			const hiss = air(noise(), 2500 + 3000 * Math.min(1, x / 0.9), 0.9).band * 0.05;
			const bt = x - 0.88;
			const chime = bt > 0 ? [81, 88, 93].reduce((s, n, k) => s + Math.sin(TAU * midi(n) * bt) * Math.exp(-bt * (2.2 + k)) * 0.22, 0) : 0;
			return lp((padv + hiss) * swell + chime, 5000, 0.7).low;
		}, 0.7);
	}
	{
		const f = svf();
		const lp = svf();
		one('whoosh.wav', 0.6, (x) => {
			const p = x / 0.6;
			return lp(f(noise(), 200 + 1400 * Math.sin(Math.PI * p), 1.4).band * Math.sin(Math.PI * Math.pow(p, 0.6)) ** 2, 6000, 0.7).low;
		}, 0.6);
	}
}

console.log(`\nmood=${mood} key=${keyName} ${scale} bpm=${BPM} seed=${SEED}  (re-run with --seed ${SEED} --key ${keyName} --scale ${scale} to get exactly this music again)`);
