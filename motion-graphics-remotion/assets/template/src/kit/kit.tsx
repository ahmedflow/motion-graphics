// Animation kit: captions, photos, self-drawing lines, world camera, sfx.
// Everything is driven by useCurrentFrame() — no CSS animations (Remotion renders frame by frame).
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, EXPO, IN_OUT, arabic, inter, tween} from './theme';

// in/out envelope for an element living between `from` and `to`
export const life = (f: number, from: number, to: number, inDur = 36, outDur = 22) => ({
	enter: tween(f, from, inDur, 0, 1, EXPO),
	exit: tween(f, to - outDur, outDur, 0, 1, IN_OUT),
});

// ---------- Caption: words rise out of a mask one by one (RTL-safe: animates whole words) ----------
export const Caption: React.FC<{
	text: string;
	from: number;
	to: number;
	y: number;
	size?: number;
	weight?: number;
	color?: string;
	font?: string;
	dir?: 'rtl' | 'ltr';
	accent?: string[]; // words to colour with the accent
}> = ({text, from, to, y, size = 76, weight = 500, color = C.ink, font = arabic, dir = 'rtl', accent = []}) => {
	const f = useCurrentFrame();
	if (f < from || f > to) return null;
	const {exit} = life(f, from, to);
	return (
		<div
			style={{
				position: 'absolute',
				top: y,
				left: 70,
				right: 70,
				direction: dir,
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				columnGap: size * 0.28,
				fontFamily: font,
				fontSize: size,
				fontWeight: weight,
				color,
				lineHeight: 1.35,
				opacity: 1 - exit,
				transform: `translateY(${-exit * 24}px)`,
			}}
		>
			{text.split(' ').map((w, i) => {
				const p = tween(f, from + i * 4, 34);
				return (
					<span key={i} style={{display: 'inline-block', overflow: 'hidden', padding: '0.08em 0 0.22em'}}>
						<span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`, opacity: Math.min(1, p * 2), color: accent.includes(w) ? C.accent : undefined}}>{w}</span>
					</span>
				);
			})}
		</div>
	);
};

// ---------- Photo: rounded frame, mask reveal, slow drift, outline that draws itself ----------
export const Photo: React.FC<{
	src: string; // path inside /public
	from: number;
	to: number;
	x: number;
	y: number;
	w: number;
	h: number;
	reveal?: 'up' | 'center' | 'left';
	pos?: string; // object-position, e.g. '50% 30%' to keep a face in frame
	drift?: [number, number]; // image scale over its life (keep subtle: 1.0 → 1.05)
	gray?: number; // 0..1
	radius?: number;
	outline?: boolean;
}> = ({src, from, to, x, y, w, h, reveal = 'up', pos = '50% 50%', drift = [1, 1.05], gray = 0, radius = 30, outline = true}) => {
	const f = useCurrentFrame();
	if (f < from || f > to) return null;
	const {exit} = life(f, from, to, 46, 24);
	const p = tween(f, from, 46);
	const clip =
		reveal === 'up'
			? `inset(${(1 - p) * 100}% 0 0 0 round ${radius}px)`
			: reveal === 'center'
				? `inset(${(1 - p) * 50}% 0 ${(1 - p) * 50}% 0 round ${radius}px)`
				: `inset(0 0 0 ${(1 - p) * 100}% round ${radius}px)`;
	const scale = interpolate(f, [from, to], drift, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const line = tween(f, from + 20, 50);
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: 1 - exit, transform: `translateY(${-exit * 40}px)`}}>
			{outline ? (
				<svg width={w + 40} height={h + 40} style={{position: 'absolute', left: -20, top: -20, overflow: 'visible'}}>
					<rect x={1} y={1} width={w + 38} height={h + 38} rx={radius + 18} fill="none" stroke={C.hair} strokeWidth={1.6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} opacity={0.35} />
				</svg>
			) : null}
			<div style={{position: 'absolute', inset: 0, clipPath: clip, borderRadius: radius, overflow: 'hidden', background: '#ddd'}}>
				<Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${scale})`, filter: gray > 0 ? `grayscale(${gray})` : undefined}} />
			</div>
		</div>
	);
};

// ---------- self-drawing hairline (use inside <Full> or any <svg>) ----------
export const Hair: React.FC<{d: string; p: number; width?: number; color?: string}> = ({d, p, width = 2, color = C.hair}) => (
	<path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
);

export const Full: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>
		{children}
	</svg>
);

export const Num: React.FC<{children: React.ReactNode; size: number; weight?: number; style?: React.CSSProperties}> = ({children, size, weight = 600, style}) => (
	<span style={{fontFamily: inter, fontSize: size, fontWeight: weight, letterSpacing: -size * 0.04, fontVariantNumeric: 'tabular-nums', color: C.ink, ...style}}>{children}</span>
);

// Sound effect at a frame. Use sparingly: max ~3 per video, >= 4 s apart, never on text/transitions/camera moves.
export const Sfx: React.FC<{at: number; src: string; volume?: number}> = ({at, src, volume = 0.3}) => (
	<Sequence from={Math.round(at)} layout="none">
		<Audio src={staticFile(src)} volume={volume} />
	</Sequence>
);

export const Backdrop: React.FC<{dots?: boolean}> = ({dots = true}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: C.bg}}>
			{dots ? (
				<AbsoluteFill
					style={{
						backgroundImage: 'radial-gradient(rgba(0,0,0,0.09) 2.2px, transparent 2.4px)',
						backgroundSize: '36px 36px',
						backgroundPosition: `0px ${(f * 0.25) % 36}px`,
						maskImage: 'radial-gradient(ellipse 75% 60% at 50% 50%, black 30%, transparent 100%)',
					}}
				/>
			) : null}
		</AbsoluteFill>
	);
};

// ---------- World camera ----------
// Lay scenes out as 1080x1920 boards on one big canvas, then move a camera across it.
//   const BOARDS = {intro: [0, 0], next: [1300, 0], ...}
//   const cam = makeCamera([{f: 0, x: 540, y: 960, z: 1}, {f: 120, x: 1840, y: 960, z: 1, ease: WHIP}, ...])
//   <World cam={cam}> <Board at={BOARDS.intro}>...</Board> </World>
// x/y = world point at the centre of the screen, z = zoom. `ease` applies to the move *arriving* at that key.
export type CamKey = {f: number; x: number; y: number; z: number; ease?: (t: number) => number};

export const makeCamera = (keys: CamKey[]) => (f: number) => {
	if (f <= keys[0].f) return keys[0];
	for (let i = 0; i < keys.length - 1; i++) {
		const a = keys[i];
		const b = keys[i + 1];
		if (f <= b.f) {
			const t = (b.ease ?? IN_OUT)((f - a.f) / (b.f - a.f));
			return {f, x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t};
		}
	}
	return keys[keys.length - 1];
};

export const World: React.FC<{cam: (f: number) => {x: number; y: number; z: number}; children: React.ReactNode}> = ({cam, children}) => {
	const f = useCurrentFrame();
	const c = cam(f);
	// no blur on camera moves — users find it nauseating
	return (
		<div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${540 - c.x * c.z}px, ${960 - c.y * c.z}px) scale(${c.z})`}}>
			{children}
		</div>
	);
};

export const Board: React.FC<{at: readonly [number, number]; children: React.ReactNode}> = ({at, children}) => (
	<div style={{position: 'absolute', left: at[0], top: at[1], width: 1080, height: 1920}}>{children}</div>
);

// soft band so screen-space captions stay readable over moving content
export const CaptionBand: React.FC<{top?: number}> = ({top = 1330}) => (
	<div style={{position: 'absolute', left: 0, right: 0, top, bottom: 0, background: `linear-gradient(to bottom, rgba(250,250,248,0), ${C.bg} 30%)`}} />
);
