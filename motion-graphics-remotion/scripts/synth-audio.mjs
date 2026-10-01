#!/usr/bin/env node
// Synthesizes a music bed + a small, soft SFX set as WAV files (no samples, no licensing issues).
//   node synth-audio.mjs <outDir> --mood calm   [--bpm 72]  [--seconds 42] [--lift 32.7] [--end 38.9]
//   node synth-audio.mjs <outDir> --mood upbeat [--bpm 120] [--seconds 25] [--drop 2.5] [--end 23.2]
// Writes: music.wav, key1-4.wav, click.wav, send.wav, ding.wav, reveal.wav, whoosh.wav
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outDir = path.resolve(args.find((a) => !a.startsWith('--')) || 'public/audio');
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const mood = opt('--mood', 'calm');
const BPM = Number(opt('--bpm', mood === 'calm' ? 72 : 120));
const DUR = Number(opt('--seconds', mood === 'calm' ? 40 : 25));
const END = Number(opt('--end', DUR - 2.5));
const LIFT = Number(opt('--lift', 0)); // calm: where the music turns brighter (0 = never)
const DROP = Number(opt('--drop', 2.5)); // upbeat: where drums come in
fs.mkdirSync(outDir, {recursive: true});

const SR = 44100;
const TAU = Math.PI * 2;
let seed = 12345;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
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

const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const music = buffer(DUR);

if (mood === 'calm') {
	// felt piano + soft pad, D minor story, optional brighter "lift", final D major chord
	const piano = (n, vel = 1, len = 3) => {
		const f = midi(n);
		return (t) => {
			const env = Math.min(1, t / 0.006) * Math.exp(-t * (1.1 + n / 90)) * (t > len - 0.3 ? Math.max(0, (len - t) / 0.3) : 1);
			let v = 0;
			[1, 0.45, 0.22, 0.1, 0.05].forEach((a, k) => (v += a * Math.sin(TAU * f * (k + 1) * (1 + 0.0008 * k * k) * t) * Math.exp(-t * k * 0.9)));
			return v * env * vel * 0.12;
		};
	};
	const pad = (notes, len, gain) => (t) => {
		const env = Math.min(1, t / 1.5) * Math.min(1, (len - t) / 1.5);
		return notes.reduce((s, n) => s + Math.sin(TAU * midi(n) * t) + 0.6 * Math.sin(TAU * midi(n) * 1.004 * t), 0) * env * gain;
	};
	const story = [[50, 57, 62, 65], [46, 53, 58, 62], [41, 53, 57, 60], [48, 52, 55, 60]];
	const lift = [[41, 57, 60, 65], [48, 55, 60, 64], [50, 57, 62, 65], [46, 58, 62, 65]];
	const liftAt = LIFT > 0 ? LIFT : END;
	for (let t = 0.3, k = 0; t < liftAt - 0.2; t += BEAT / 2, k++) {
		const ch = story[Math.floor(t / BAR) % 4];
		if (t < DUR * 0.3 && k % 2) continue; // sparse first act
		add(music, t, 3, piano(ch[[1, 2, 3, 2][k % 4]] + 12, 0.55 + 0.25 * Math.min(1, t / 20) + (k % 4 === 0 ? 0.15 : 0)), k % 2 ? 0.25 : -0.25);
		if (k % 8 === 0) add(music, t, 3, piano(ch[0], 0.7));
	}
	for (let t = DUR * 0.3; t < liftAt; t += BAR) {
		const len = Math.min(BAR + 1.5, liftAt + 0.3 - t);
		add(music, t, len, pad(story[Math.floor(t / BAR) % 4].slice(1), len, 0.012 + 0.012 * ((t - DUR * 0.3) / 20)));
	}
	if (LIFT > 0) {
		add(music, LIFT - 2.8, 2.9, (t) => {
			const p = t / 2.8;
			return (Math.sin(TAU * midi(62) * t) + Math.sin(TAU * midi(69) * t) + Math.sin(TAU * midi(74) * t)) * p * p * 0.03 + noise() * p * p * 0.006;
		});
		for (let t = LIFT, k = 0; t < END - 0.1; t += BEAT / 2, k++) {
			const ch = lift[Math.floor((t - LIFT) / BAR) % 4];
			add(music, t, 3, piano(ch[[1, 2, 3, 2][k % 4]] + 12, 0.75 + (k % 4 === 0 ? 0.2 : 0)), k % 2 ? 0.3 : -0.3);
			if (k % 8 === 0) {
				add(music, t, 3.5, piano(ch[0], 0.9));
				add(music, t, BAR + 1, pad(ch.slice(1), BAR + 1, 0.022));
			}
		}
	}
	[38, 50, 57, 62, 66, 69, 74].forEach((n, k) => add(music, END + k * 0.05, 3, piano(n, 0.85, 3)));
	add(music, END, 3, pad([62, 66, 69], 3, 0.02));
} else {
	// upbeat electronic: filtered pad intro, riser into the drop, kick/clap/hats, sub, plucks, final hit
	const kick = (t) => Math.sin(TAU * (45 * t + (110 / 28) * (1 - Math.exp(-t * 28)))) * Math.exp(-t * 7);
	const chords = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 55, 60, 64], [55, 59, 62, 67]];
	const roots = [45, 41, 48, 43];
	{
		const lpL = svf();
		const lpR = svf();
		const ph = new Array(8).fill(0).map(() => rand());
		const [L, R] = music;
		for (let i = 0; i < L.length; i++) {
			const t = i / SR;
			const notes = chords[Math.floor(t / BAR) % 4];
			let l = 0,
				r = 0;
			notes.forEach((n, k) => {
				ph[k] = (ph[k] + (midi(n) * 1.003) / SR) % 1;
				ph[k + 4] = (ph[k + 4] + (midi(n) * 0.997) / SR) % 1;
				l += saw(ph[k]);
				r += saw(ph[k + 4]);
			});
			const intro = t < DROP;
			const cutoff = intro ? 400 + 1400 * (t / DROP) ** 2 : 1500 + 400 * Math.sin(TAU * t * 0.125);
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
		const ci = Math.floor(t / BAR) % 4;
		const fb = midi(roots[ci] - 12);
		const lp = svf();
		add(music, t, BEAT / 2, (x) => lp(saw(fb * x) * 0.6 + Math.sin(TAU * fb * x), 500, 0.8).low * Math.min(1, x / 0.01) * Math.exp(-x * 5) * 0.35);
		const fp = midi(chords[ci][[0, 2, 1, 3, 2, 1, 3, 2][k % 8]] + 12);
		const lp2 = svf();
		add(music, t, 0.6, (x) => lp2(saw(fp * x) + 0.5 * saw(fp * 2.002 * x), 900 + 5000 * Math.exp(-x * 14), 1.4).low * Math.exp(-x * 7) * 0.09, k % 2 ? 0.35 : -0.35);
	}
	{
		const hp = svf();
		add(music, DROP - 1.6, 1.6, (x) => {
			const p = x / 1.6;
			return hp(noise(), 300 + 7000 * p * p, 1.5).band * p * p * 0.35;
		});
	}
	add(music, DROP, 1.5, (x) => kick(x) * 1.3);
	add(music, END, 1.3, (x) => kick(x) * 1.2 + Math.sin(TAU * midi(57) * x) * Math.exp(-x * 1.5) * 0.08);
}
write('music.wav', music, 0.8);

// ---------- SFX (deliberately few and soft) ----------
const one = (name, sec, fn, peak) => {
	const b = buffer(sec);
	add(b, 0, sec, fn);
	write(name, b, peak);
};
[1, 2, 3, 4].forEach((v) => {
	seed = 777 * v;
	const bp = svf();
	const lp = svf();
	const pitch = 150 + 40 * rand();
	const tone = 900 + 300 * rand();
	one(`key${v}.wav`, 0.12, (x) => lp(Math.sin(TAU * pitch * x) * Math.exp(-x * 60) + bp(noise(), tone, 1.2).band * Math.exp(-x * 160) * 0.5, 2200, 0.7).low * Math.min(1, x / 0.002), 0.6);
});
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
