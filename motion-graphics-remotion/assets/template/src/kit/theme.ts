import {loadFont as loadArabic} from '@remotion/google-fonts/IBMPlexSansArabic';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {Easing, interpolate, spring} from 'remotion';

export const FPS = 60;

export const arabic = loadArabic('normal', {weights: ['400', '500', '600', '700'], subsets: ['arabic', 'latin']}).fontFamily;
export const inter = loadInter('normal', {weights: ['400', '500', '600', '700', '800'], subsets: ['latin']}).fontFamily;

// Palette — change per project (keep one accent colour)
export const C = {
	bg: '#FAFAF8',
	ink: '#111111',
	muted: '#8C8C88',
	hair: 'rgba(17,17,17,0.85)',
	accent: '#D97757',
	card: '#FFFFFF',
};

// Easing presets
export const EXPO = Easing.bezier(0.16, 1, 0.3, 1); // entrances: fast start, very soft landing
export const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1); // calm camera moves, exits
export const WHIP = Easing.bezier(0.83, 0, 0.17, 1); // energetic camera moves between boards

export const tween = (f: number, start: number, dur: number, from = 0, to = 1, easing: (t: number) => number = EXPO) =>
	interpolate(f, [start, start + dur], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

// spring helpers
export const smooth = (f: number, delay = 0, dur = 24) => spring({frame: f - delay, fps: FPS, config: {damping: 200}, durationInFrames: dur});
export const pop = (f: number, delay = 0, damping = 14) => spring({frame: f - delay, fps: FPS, config: {damping, stiffness: 130, mass: 0.7}});

// T(seconds into the voiceover) -> frame, when the voice starts VOICE_OFFSET seconds into the video
export const VOICE_OFFSET = 0.5;
export const T = (s: number) => Math.round((s + VOICE_OFFSET) * FPS);
