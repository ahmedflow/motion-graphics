#!/usr/bin/env node
// Search Wikimedia Commons (or English Wikipedia) for images, with license + author + size.
//   node commons-search.mjs "Camp Nou" [limit=10] [--wiki en]
//   node commons-search.mjs --title "File:Flag of Argentina.svg"
// Only reads metadata; it never downloads files.
const args = process.argv.slice(2);
const wiki = args.includes('--wiki') ? args[args.indexOf('--wiki') + 1] : 'commons';
const api = wiki === 'en' ? 'https://en.wikipedia.org/w/api.php' : 'https://commons.wikimedia.org/w/api.php';
const titleMode = args.includes('--title');
const positional = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--wiki' && args[i - 1] !== '--title');
const query = titleMode ? args[args.indexOf('--title') + 1] : positional[0];
const limit = Number(positional[1] || 10);
if (!query) {
	console.error('usage: node commons-search.mjs "<query>" [limit] [--wiki en]  |  --title "File:Name.jpg"');
	process.exit(1);
}

const params = new URLSearchParams({
	action: 'query',
	format: 'json',
	prop: 'imageinfo',
	iiprop: 'url|size|extmetadata',
	iiurlwidth: '1920',
	...(titleMode ? {titles: query} : {generator: 'search', gsrnamespace: '6', gsrlimit: String(limit), gsrsearch: query}),
});
const res = await fetch(`${api}?${params}`, {headers: {'User-Agent': 'motion-graphics-skill/1.0 (asset search)'}});
const json = await res.json();
const pages = Object.values(json.query?.pages || {});
if (!pages.length) {
	console.log('No results.');
	process.exit(0);
}
const strip = (s) => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
for (const p of pages.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))) {
	const i = p.imageinfo?.[0];
	if (!i) {
		console.log(`- ${p.title}: (missing)`);
		continue;
	}
	const m = i.extmetadata || {};
	console.log(`- ${p.title.replace(/^File:/, '')}`);
	console.log(`    license: ${strip(m.LicenseShortName?.value) || '?'} | author: ${strip(m.Artist?.value).slice(0, 60) || '?'} | ${i.width}x${i.height} | ${Math.round(i.size / 1024)} KB`);
	console.log(`    page:    ${i.descriptionurl}`);
	console.log(`    1920px:  ${i.thumburl || i.url}`);
}
