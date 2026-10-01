#!/usr/bin/env node
// Creates a Remotion motion-graphics project with the animation kit + a demo composition.
// Usage: node setup.mjs <project-folder> [--allow-cloud]
//
// The project is created where asked (normally inside the user's working folder), except in a
// cloud-synced folder (OneDrive, Dropbox, iCloud, Google Drive):
// node_modules alone is ~21k small files, and the sync client locks them while uploading,
// which makes Explorer/Finder freeze and installs/renders hang. A target inside such a folder
// is redirected to C:\Projects\<name> (Windows) or ~/Projects/<name>. --allow-cloud overrides.
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const template = path.resolve(here, '../assets/template');
const args = process.argv.slice(2);
const allowCloud = args.includes('--allow-cloud');
const requested = path.resolve(args.find((a) => !a.startsWith('--')) || 'motion-project');

const home = os.homedir();
const cloudRoots = [process.env.OneDrive, process.env.OneDriveConsumer, process.env.OneDriveCommercial].filter(Boolean).map((p) => path.resolve(p));
// macOS "Desktop & Documents Folders" in iCloud: ~/Documents and ~/Desktop sync although their path says nothing about iCloud.
if (process.platform === 'darwin') {
	const cloudDocs = path.join(home, 'Library', 'Mobile Documents', 'com~apple~CloudDocs');
	for (const name of ['Documents', 'Desktop']) {
		if (fs.existsSync(path.join(cloudDocs, name))) cloudRoots.push(path.join(home, name));
	}
}
// resolve symlinks (e.g. ~/Dropbox -> ~/Library/CloudStorage/Dropbox) on the nearest folder that already exists
const realish = (p) => {
	let dir = p;
	const rest = [];
	while (!fs.existsSync(dir) && path.dirname(dir) !== dir) {
		rest.unshift(path.basename(dir));
		dir = path.dirname(dir);
	}
	try {
		return path.join(fs.realpathSync(dir), ...rest);
	} catch {
		return p;
	}
};
const inCloud = (p) =>
	[p, realish(p)].some((q) => {
		const lower = q.toLowerCase();
		return (
			cloudRoots.some((r) => lower === r.toLowerCase() || lower.startsWith(r.toLowerCase() + path.sep)) ||
			/[\\/](onedrive[^\\/]*|dropbox|icloud ?drive|mobile documents|cloudstorage|google ?drive|my drive)([\\/]|$)/i.test(q)
		);
	});
const projectsRoot = process.platform === 'win32' ? 'C:\\Projects' : path.join(home, 'Projects');
let target = requested;
if (!allowCloud && inCloud(requested)) {
	target = path.join(projectsRoot, path.basename(requested));
	console.log(`\n⚠ ${requested}\n  is inside a cloud-synced folder (OneDrive/Dropbox/iCloud/Google Drive).\n  Syncing node_modules (~21k files) freezes the folder, so the project goes here instead:\n  → ${target}\n  (Put only finished MP4s in the cloud folder. Pass --allow-cloud to override.)\n`);
}

const major = Number(process.versions.node.split('.')[0]);
if (major < 18) {
	console.error(`Node ${process.versions.node} is too old — install Node 18+ (LTS) from https://nodejs.org`);
	process.exit(1);
}

fs.mkdirSync(target, {recursive: true});
console.log('Project folder:', target);

// package.json
const pkgPath = path.join(target, 'package.json');
if (!fs.existsSync(pkgPath)) {
	fs.writeFileSync(
		pkgPath,
		JSON.stringify(
			{
				name: path.basename(target).toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'motion-project',
				version: '1.0.0',
				private: true,
				scripts: {
					studio: 'remotion studio',
					render: 'remotion render',
					still: 'remotion still',
					typecheck: 'tsc -p .',
				},
			},
			null,
			2,
		) + '\n',
	);
}

// copy template files without overwriting the user's work
const copyDir = (from, to) => {
	for (const entry of fs.readdirSync(from, {withFileTypes: true})) {
		const src = path.join(from, entry.name);
		const dst = path.join(to, entry.name);
		if (entry.isDirectory()) {
			fs.mkdirSync(dst, {recursive: true});
			copyDir(src, dst);
		} else if (!fs.existsSync(dst)) {
			fs.copyFileSync(src, dst);
			console.log('  + ' + path.relative(target, dst));
		}
	}
};
copyDir(template, target);
fs.mkdirSync(path.join(target, 'public'), {recursive: true});
fs.mkdirSync(path.join(target, 'out'), {recursive: true});

const run = (cmd) => {
	console.log('\n$ ' + cmd);
	execSync(cmd, {cwd: target, stdio: 'inherit', shell: true});
};

run('npm install remotion @remotion/cli @remotion/google-fonts @remotion/paths @remotion/shapes react react-dom');
run('npm install -D typescript @types/react');

// finished videos always go to the folder the user chose, even when the code was redirected
const videoDir = path.dirname(requested);
console.log(`
Done.
  Project (code):   ${target}
  Finished videos:  ${videoDir}
  Render with:      npx remotion render <Id> "${path.join(videoDir, '<name>.mp4')}"

Next:
  cd "${target}"
  npx tsc -p .                                   # type-check
  npx remotion still Demo out/check.jpg --frame=90 --scale=0.4
  npm run studio                                 # live preview in the browser
`);
