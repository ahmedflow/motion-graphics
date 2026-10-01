#!/usr/bin/env node
// Creates a Remotion motion-graphics project with the animation kit + a demo composition.
// Usage: node setup.mjs <project-folder>
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const template = path.resolve(here, '../assets/template');
const target = path.resolve(process.argv[2] || 'motion-project');

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

console.log(`
Done. Next:
  cd "${target}"
  npx tsc -p .                                   # type-check
  npx remotion still Demo out/check.jpg --frame=90 --scale=0.4
  npm run studio                                 # live preview in the browser
`);
