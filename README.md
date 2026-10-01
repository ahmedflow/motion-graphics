# سكيل الموشن جرافيك (motion-graphics-remotion)

سكيل لـ Claude يسوي لك موشن جرافيك احترافي بالكود باستخدام Remotion، من التثبيت إلى ملف الفيديو النهائي MP4.

## التثبيت

- **Claude (الويب أو تطبيق الكمبيوتر):** افتح ملف `motion-graphics-remotion.skill` واضغط **Save skill**. لو ما طلع لك الزر، روح إلى الإعدادات ← Capabilities ← Skills، وارفع الملف من هناك.
- **Claude Code:** فك ضغط الملف داخل `~/.claude/skills/`، عشان يصير المسار `~/.claude/skills/motion-graphics-remotion/SKILL.md`.

لازم يكون عندك **Node.js 18 أو أحدث**، وتنزله من https://nodejs.org. أما Remotion وكل الأدوات الثانية، فالسكيل ينزلها لك بنفسه.

## طريقة الاستخدام

اكتب لـ Claude شي مثل: "ابغى أسوي موشن جرافيك عن ...". بعدها يمشي معك بالخطوات هذي:

1. ينزّل Remotion والأدوات اللي يحتاجها، ويتأكد إنها تشتغل.
2. يعطيك رابط **https://whatships.com** تختار منه فيديو يعجبك ستايله، ويحلل حركته فريم بفريم.
3. ياخذ منك الفكرة: الموضوع، والمقاس، والمدة، واللغة، والفويس أوفر، والموسيقى.
4. يكتب ستوري بورد قصير ويعرضه عليك قبل ما يبدأ.
5. يجيب كومبوننتات من **21st.dev**، ويدور على صور وشعارات حقيقية مرخّصة من Wikimedia. وما ينزّل أي ملف إلا بعد موافقتك.
6. يبني الفيديو بحركة كاميرا سلسة وبدون blur، مع موسيقى ومؤثرات صوتية قليلة. وإذا عندك فويس أوفر، يضبط كل شي على توقيته.
7. يرندر لقطات ثابتة يشيك عليها، وبعدها يرندر الفيديو ويرسله لك. وبعد كذا تعدلون مع بعض.

## محتوى السكيل

- `SKILL.md`: خطوات العمل.
- `references/`: قواعد الحركة الاحترافية، وتحليل ستايل المرجع، وطريقة استخدام 21st.dev، وحقوق الصور، والفويس أوفر، والصوت.
- `scripts/`:
  - `setup.mjs`: ينشئ المشروع.
  - `voice-timings.mjs`: يطلّع توقيت كل جملة في الفويس أوفر.
  - `commons-search.mjs`: يدور صور مرخّصة.
  - `synth-audio.mjs`: يولّد موسيقى ومؤثرات صوتية بدون مشاكل حقوق.
- `assets/template/`: قالب جاهز فيه أدوات الحركة: النصوص المتحركة، والصور، وكاميرا العالم، والخطوط اللي ترسم نفسها.

---

## English

**motion-graphics-remotion** is a Claude skill for making professional motion-graphics videos in code with [Remotion](https://www.remotion.dev): it installs everything, lets you pick a style reference from [whatships.com](https://whatships.com), takes your idea, pulls UI components from [21st.dev](https://21st.dev), finds licensed real images on Wikimedia Commons (asking before every download), syncs to your voiceover, moves a camera across one world canvas, adds a synthesized music bed with minimal SFX, and renders an MP4.

**Install**
- Claude (web / desktop): open `motion-graphics-remotion.skill` → **Save skill** (or Settings → Capabilities → Skills → upload).
- Claude Code: copy the `motion-graphics-remotion/` folder into `~/.claude/skills/`.

Requires Node.js 18+. Then just ask Claude: *"make me a motion graphic about …"*.
