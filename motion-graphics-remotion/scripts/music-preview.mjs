#!/usr/bin/env node
// Builds one listening page for music candidates and opens it in the user's default browser (e.g. Chrome),
// so they can play every option right there instead of downloading files to hear them.
//
//   node music-preview.mjs <out.html> "Title|URL|one-line note" "Title|URL|note" ...
//
// URL can be a direct audio file (.mp3/.wav/.ogg — gets an inline player, e.g. incompetech) or a track page
// (e.g. a pixabay.com/music/... page — gets an "Open & play" button that opens the page, which has its own player).
import {exec} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [outArg, ...items] = process.argv.slice(2);
if (!outArg || !items.length) {
	console.error('usage: node music-preview.mjs <out.html> "Title|URL|note" ...');
	process.exit(1);
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);
const rows = items.map((it, i) => {
	const [title, url, note = ''] = it.split('|');
	const isAudio = /\.(mp3|wav|ogg|m4a)(\?|$)/i.test(url);
	const player = isAudio
		? `<audio controls preload="none" src="${esc(url)}"></audio>`
		: `<a class="btn" href="${esc(url)}" target="_blank" rel="noopener">▶ Open &amp; play</a>`;
	return `<div class="card"><div class="num">${i + 1}</div><div class="body"><div class="title">${esc(title)}</div><div class="note">${esc(note)}</div>${player}</div></div>`;
});
const html = `<!doctype html><html lang="ar"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Music options</title><style>
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Tahoma,sans-serif;background:#f6f5f1;color:#141413}
main{max-width:720px;margin:0 auto;padding:32px 16px}h1{font-size:22px;margin:0 0 6px}p{color:#6b6a65;margin:0 0 22px}
.card{display:flex;gap:16px;background:#fff;border:1px solid #e6e2d8;border-radius:14px;padding:16px;margin-bottom:12px}
.num{width:34px;height:34px;border-radius:17px;background:#141413;color:#fff;display:grid;place-items:center;font-weight:700;flex:none}
.body{flex:1;min-width:0}.title{font-weight:700;font-size:17px}.note{color:#6b6a65;font-size:14px;margin:4px 0 10px}
audio{width:100%}.btn{display:inline-block;background:#141413;color:#fff;text-decoration:none;padding:9px 16px;border-radius:10px;font-weight:600}
@media (prefers-color-scheme:dark){body{background:#1b1b1a;color:#f2f1ec}.card{background:#262624;border-color:#3a3936}.num{background:#f2f1ec;color:#141413}.btn{background:#f2f1ec;color:#141413}}
</style></head><body><main><h1>🎵 Music options · خيارات الموسيقى</h1>
<p>Play each one here, then tell Claude the number you like. · شغّل كل واحد هنا، وبعدين قول لـ Claude رقم اللي عجبك.</p>
${rows.join('\n')}</main></body></html>`;

const out = path.resolve(outArg);
fs.mkdirSync(path.dirname(out), {recursive: true});
fs.writeFileSync(out, html);
console.log('wrote', out);

const opener = process.platform === 'win32' ? `start "" "${out}"` : process.platform === 'darwin' ? `open "${out}"` : `xdg-open "${out}"`;
exec(opener, (err) => {
	if (err) console.log('Could not open the browser automatically — open this file yourself:', out);
	else console.log('opened in the default browser');
});
