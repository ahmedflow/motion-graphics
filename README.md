# سكيل الموشن جرافيك (motion-graphics-remotion)

سكيل لـ Claude يسوي لك موشن جرافيك احترافي بالكود باستخدام Remotion، من التثبيت إلى ملف الفيديو النهائي MP4.

## التثبيت

### أسهل طريقة (Claude Code)

افتح Claude Code والصق له:

```
ثبّت المهارة: https://github.com/ahmedflow/motion-graphics
```

بعدها افتح جلسة جديدة، واكتب: "سوّ لي موشن جرافيك عن ..."

> **Installation instructions for Claude** (when a user asks you to install this skill from this link):
> 1. Clone or download this repository to a temporary folder.
> 2. Copy the **whole** `motion-graphics-remotion/` folder — `SKILL.md` plus `scripts/`, `references/` and `assets/` — to the user's skills folder: `~/.claude/skills/motion-graphics-remotion/` (Windows: `%USERPROFILE%\.claude\skills\motion-graphics-remotion\`). If an older copy exists there, replace it.
> 3. Check that `~/.claude/skills/motion-graphics-remotion/SKILL.md` and the three subfolders exist, then delete the temporary clone.
> 4. Tell the user it's installed and that they need to start a **new session** for the skill to load.

### طرق ثانية

- **Claude (الويب أو تطبيق الكمبيوتر):** افتح ملف `motion-graphics-remotion.skill` واضغط **Save skill**. لو ما طلع لك الزر، روح إلى الإعدادات ← Capabilities ← Skills، وارفع الملف من هناك.
- **Claude Code:** فك ضغط الملف داخل `~/.claude/skills/`، عشان يصير المسار `~/.claude/skills/motion-graphics-remotion/SKILL.md`.

لازم يكون عندك **Node.js 18 أو أحدث**، وتنزله من https://nodejs.org. أما Remotion وكل الأدوات الثانية، فالسكيل ينزلها لك بنفسه.

## طريقة الاستخدام

اكتب لـ Claude شي مثل: "ابغى أسوي موشن جرافيك عن ...". بعدها يمشي معك بالخطوات هذي:

1. ينزّل Remotion والأدوات اللي يحتاجها، ويتأكد إنها تشتغل.
2. يعطيك رابط **https://whatships.com** تختار منه فيديو يعجبك ستايله، ويحلل حركته فريم بفريم.
3. يسألك من البداية، وبدفعة وحدة: الستايل، وإحساس الموسيقى، والمقاس والمدة، والفويس أوفر. بعدها ياخذ منك الفكرة.
4. يسألك مين يكتب الستوري بورد. لو قلت له "اكتبه أنت"، يكتبه ويعرضه عليك ويكمل التنفيذ على طول بدون ما يرجع يسألك عن رأيك (وتقدر توقفه وتطلب تعديل في أي وقت).
5. لو الفيديو عن براند حقيقي، يجيب **الشعار الرسمي** وألوانه بنفسه حتى لو ما أعطيته، وما يصمم شعار من الصفر. وبعدين يجيب كومبوننتات من **21st.dev**، ويدور على صور وشعارات حقيقية مرخّصة من Wikimedia. وما ينزّل أي ملف إلا بعد موافقتك.
6. يبني الفيديو بحركة كاميرا سلسة وبدون blur، مع موسيقى ومؤثرات صوتية قليلة. وإذا عندك فويس أوفر، يضبط كل شي على توقيته.
7. يرندر لقطات ثابتة يشيك عليها، وبعدها يرندر الفيديو ويرسله لك. وبعد كذا تعدلون مع بعض.

**وين ينحفظ كل شي؟** المشروع والفيديو النهائي ينحفظون في المجلد اللي فتحت منه الجلسة. إذا كان مجلدك متزامن مع OneDrive أو Dropbox أو iCloud أو Google Drive، ينحفظ كود المشروع في `C:Projects` (أو `~/Projects` على ماك ولينكس) عشان ما يعلّق جهازك، والفيديو النهائي يبقى في مجلدك.

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

**Where files go:** the project and the finished video are saved in the folder you opened the session in. If that folder is synced to OneDrive, Dropbox, iCloud or Google Drive, the project code goes to `C:Projects` (or `~/Projects`) so the sync client doesn't freeze your machine, and the finished video still lands in your folder.
