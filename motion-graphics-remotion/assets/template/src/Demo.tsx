// Demo: proves the setup works and shows the patterns — world camera, whip pan, push-in,
// self-drawing lines, a counter, word-by-word captions. Replace with the real video.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Backdrop, Board, Caption, CaptionBand, Full, Hair, Num, World, makeCamera} from './kit/kit';
import {C, WHIP, pop, tween} from './kit/theme';

export const DEMO_TOTAL = 360;

const BOARDS = {
	one: [0, 0],
	two: [1300, 0],
} as const;

const cam = makeCamera([
	{f: 0, x: 540, y: 900, z: 1.25},
	{f: 90, x: 540, y: 960, z: 1.0},
	{f: 150, x: 540, y: 960, z: 1.02},
	{f: 190, x: 1840, y: 960, z: 1.0, ease: WHIP},
	{f: 300, x: 1840, y: 900, z: 1.15},
	{f: DEMO_TOTAL, x: 1840, y: 900, z: 1.16},
]);

const Ring: React.FC<{at: number}> = ({at}) => {
	const f = useCurrentFrame();
	const p = tween(f, at, 60);
	const s = pop(f, at + 20);
	return (
		<>
			<Full>
				<circle cx={540} cy={820} r={260} fill="none" stroke={C.ink} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} transform="rotate(-90 540 820)" />
				<Hair d="M140 1180 H940" p={tween(f, at + 10, 50)} />
			</Full>
			<div style={{position: 'absolute', left: 540, top: 820, width: 180, height: 180, marginLeft: -90, marginTop: -90, borderRadius: 90, background: C.accent, transform: `scale(${Math.max(0, s)})`}} />
		</>
	);
};

const Counter: React.FC<{at: number}> = ({at}) => {
	const f = useCurrentFrame();
	const n = Math.round(tween(f, at, 120, 0, 100, (x) => 1 - Math.pow(1 - x, 3)));
	return (
		<div style={{position: 'absolute', top: 640, width: '100%', textAlign: 'center', opacity: tween(f, at - 10, 20)}}>
			<Num size={320}>{n}%</Num>
		</div>
	);
};

export const Demo: React.FC = () => (
	<AbsoluteFill>
		<Backdrop />
		<World cam={cam}>
			<Board at={BOARDS.one}>
				<Ring at={10} />
			</Board>
			<Board at={BOARDS.two}>
				<Counter at={190} />
			</Board>
		</World>
		<CaptionBand />
		<Caption text="Remotion جاهز للعمل" from={20} to={180} y={1480} accent={['جاهز']} />
		<Caption text="كل شي يتحرك بسلاسة" from={190} to={DEMO_TOTAL} y={1480} accent={['بسلاسة']} />
	</AbsoluteFill>
);
