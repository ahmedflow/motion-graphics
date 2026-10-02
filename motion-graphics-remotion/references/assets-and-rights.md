# Real photos, logos, flags — finding them and using them properly

## The image must match the line

The most common failure is a photo that's "about the topic" but doesn't show what the narration says at that moment. Viewers notice instantly.

1. For each storyboard line, write the exact image it needs: subject, action/moment, place, era. ("Ronaldo celebrating a goal for Real Madrid", "Old Trafford stadium exterior", "a smartphone showing a chat app" — not just "Ronaldo" or "football".)
2. Search with those specific words (several phrasings, in English and the local language). Read the file title, description and date.
3. **Open and look at every candidate.** Keep it only if the subject is clearly visible, recognisable at reel size, and matches the moment. Reject: wrong person/team/era, crowd shots where the subject is a dot, blurry or watermarked files, screenshots, fan art, anything you're unsure about.
4. If nothing genuinely fits, don't fall back to a random photo — use the real logo/crest/flag, a drawn illustration, an icon, a chart or big typography for that line.
5. When proposing images, show them as: line → what the image shows → source/license.

## Where to look

0. **Unsplash / Pexels / Pixabay** (in the browser) — free, **no attribution needed**; best for generic subjects (cities, stadiums, technology, people working, nature). Rarely have specific celebrities.
   - **Unsplash fast search**: `curl` to its API needs a key, but from an open unsplash.com tab `fetch('/napi/search/photos?per_page=20&query=' + encodeURIComponent(q))` returns JSON. **Drop results with `premium` or `plus` true** — those are Unsplash+ (paid), not free. Keep `id`, `alt_description`, `user.name`, `urls.small` and `urls.raw`.
   - To compare many candidates at once, replace the tab's `document.body.innerHTML` with a grid of the `urls.small` thumbnails (one row per scene, numbered) and take a single screenshot.
   - Download the chosen ones with `curl -sL "<urls.raw>?w=1920&q=82&fm=jpg" -o public/<project>/<name>.jpg` (works without a key), then open each file and check it.

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

## Credits — never inside the video

Do **not** put a credits / sources card at the end, fine print, or attribution text anywhere in the video. Users find it annoying, and it spoils the ending. Instead:
- Record every file in `public/<project>/CREDITS.md` (file, original title, author, license, link).
- If the video will be published and anything is CC BY / CC BY-SA, give the user a short ready-to-paste credit block for the **post caption / description** — that's a reasonable place for attribution under CC licenses.
- Prefer sources that need no credit at all (Unsplash, Pexels, Pixabay, public domain, CC0) so there's nothing to add.

## People and brands

- Use photos of real people only in a factual, respectful context (biography, news, tribute). Don't make them appear to endorse something, don't put words in their mouth, never clone a real person's voice.
- Logos are trademarks: fine for commentary / storytelling / personal videos; tell the user that commercial use may need permission.

## SVG gotcha

Some SVGs (e.g. Wikipedia crests, flags) have `width`/`height` but **no `viewBox`**, so they won't scale inside `<Img>` (they crop). Add one: `viewBox="0 0 <width> <height>"` on the root `<svg>`.
