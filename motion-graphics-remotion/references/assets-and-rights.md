# Real photos, logos, flags — finding them and using them properly

## Where to look

1. **Wikimedia Commons** — real photos of people, places, stadiums, trophies, flags, many with free licenses. Use the bundled script:
   ```bash
   node <skill-dir>/scripts/commons-search.mjs "Messi Barcelona" 12
   ```
   It prints title, license, author, size and a 1920px URL for each hit.
2. **English Wikipedia** file pages — some logos/crests live there (not on Commons). Same API at `https://en.wikipedia.org/w/api.php` (`--wiki en` in the script).
3. Official press kits of a company (for its own logo/products).
4. Files the user owns or supplies.

Never pull from Google Images / news sites / Getty: those are copyrighted. If a Commons photo looks like an agency photo with a suspicious license, mention the doubt.

## Look before proposing

Open each candidate URL in the browser and take a small screenshot. Many files are blurry, distant or mislabelled. Pick the best 1–2 per scene.

## Ask before downloading

Downloads need the user's explicit OK. Present a numbered list: what it shows → which scene, author, license, approximate size. Then download with a descriptive User-Agent (Wikimedia rate-limits anonymous requests — if a file comes back as HTML "Wikimedia Error", wait a second and retry):

```bash
curl -sL -A "motion-graphics-skill/1.0 (personal project)" -o public/<project>/<name>.jpg "<url>"
file public/<project>/<name>.jpg   # make sure it's really an image
```

Prefer 1920px thumbnails over multi-MB originals.

## Credits

Write `public/<project>/CREDITS.md` (file, original title, author, license). CC BY / CC BY-SA require attribution when the video is published — add a small credit line on screen or an end card. If the user says the video is personal / not published, they may skip on-screen credits; keep the CREDITS file anyway and remind them if they later publish.

## People and brands

- Use photos of real people only in a factual, respectful context (biography, news, tribute). Don't make them appear to endorse something, don't put words in their mouth, never clone a real person's voice.
- Logos are trademarks: fine for commentary / storytelling / personal videos; tell the user that commercial use may need permission.

## SVG gotcha

Some SVGs (e.g. Wikipedia crests, flags) have `width`/`height` but **no `viewBox`**, so they won't scale inside `<Img>` (they crop). Add one: `viewBox="0 0 <width> <height>"` on the root `<svg>`.
