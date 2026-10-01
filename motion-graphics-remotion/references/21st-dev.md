# Using 21st.dev components in Remotion

21st.dev is a registry of React + Tailwind components. In a video, a component is a *look* (layout, spacing, colours, details) — its interactivity and CSS animations are useless because Remotion renders frame by frame.

## Find one

Browse categories in the browser: `https://21st.dev/community/components` (Search Bars, AI Chats, Cards, Buttons, Texts, Backgrounds, Pricing, Notifications…). Open a component page and take a screenshot to judge the look.

## Get the source

Each component page shows a **Source** line such as `hirael.com/r/prompt-input.json` (a shadcn registry item). Fetch it — it's JSON, not an executable:

```bash
curl -sL https://<host>/r/<name>.json -o reference-21st/<name>.json
node -e "const j=require('./reference-21st/<name>.json'); j.files.forEach(f=>require('fs').writeFileSync('reference-21st/'+f.path.split('/').pop(), f.content))"
```

Some components are served at `https://21st.dev/r/<author>/<name>` (may return 403 to curl; then use the Source link from the page or copy the code shown under "Component.tsx" with `get_page_text`). Check the license on the page (most are MIT) and keep a comment crediting the author in the ported file.

If the user has the 21st.dev **Magic MCP** connected, you may use it to generate/search components instead.

## Port it

1. Read the component's JSX and Tailwind classes; note structure (e.g. attachment chip → textarea → toolbar with model select → send button → footer hint + counter).
2. Rewrite it as a plain React component with **inline styles** in pixel units sized for 1080-wide video (roughly 2–2.5× web sizes: 14px text → 32–46px).
3. Turn every piece of state into a prop driven by frame: `text` (typed so far), `caret` (blinking via `Math.floor(f/18)%2`), `focus` (0..1 ring glow), `press` (0..1 button scale), `sent`, etc.
4. Remove Radix/portals/hover/focus logic. Replace icons with inline SVG paths (lucide paths are fine).
5. Fix positions you need to target (e.g. export the send button centre so a mouse pointer can glide to it).
6. Animate from the scene: typing with human rhythm (uneven gaps, pause at spaces), mouse in with IN_OUT arc, click → scale 0.88 → ripple → button turns to a stop square.

Mention to the user which 21st.dev component (and author) you used.
