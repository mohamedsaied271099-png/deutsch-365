// المدرس الذكي: بيكلم Claude مباشرة من المتصفح بمفتاح API بتاعك (مفيش سيرفر = مفيش تكلفة استضافة)
import Anthropic from "https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.135.0/+esm";

export const MODELS = [
  { id: "claude-haiku-5-5", name: "Claude Haiku 5.5 — الأرخص (موصى به للتوفير)", effort: "low" },
  { id: "claude-sonnet-5-5", name: "Claude Sonnet 5.5 — أذكى، 20× التكلفة", effort: "low" },
  { id: "claude-opus-5-5", name: "Claude Opus 5.5 — الأقوى، 40× التكلفة", effort: "low" },
];

export const MODES = {
  explain: { label: "📘 اشرحلي", start: "اشرحلي قاعدة الأسبوع ده من الأول خالص بأمثلة من حياتي في مصر." },
  quiz: { label: "✍️ امتحنّي", start: "اديني تمرين على قاعدة الأسبوع." },
  correct: { label: "📝 صحّحلي", start: null },
  roleplay: { label: "🗣️ محادثة", start: "يلا نبدأ الموقف." },
  free: { label: "💬 سؤال حر", start: null },
};

const MODE_RULES = {
  explain: `اشرح القاعدة خطوة بخطوة بالعامية المصرية. ابدأ بتشبيه من الحياة اليومية في مصر، بعدين القاعدة في جدول بسيط، بعدين 4 أمثلة ألماني مع ترجمتها. في الآخر اسأل سؤال صغير تتأكد إن الطالب فهم. لو اسم ألماني ظهر اكتب أداته دايماً (der/die/das).`,
  quiz: `إنت ممتحن. اسأل سؤال واحد بس في المرة (ملء فراغ، ترجمة من عربي لألماني، أو ترتيب جملة) على قاعدة الأسبوع ومفرداته. استنى الإجابة. صحح: ✅ أو ❌ مع شرح الغلطة في سطرين، وبعدين السؤال اللي بعده. صعّب الأسئلة تدريجياً. كل 5 أسئلة اعرض النتيجة.`,
  correct: `الطالب هيبعتلك نص ألماني كتبه. رد بالترتيب:
1) النسخة المصححة كاملة.
2) قايمة الغلطات: الغلط ← الصح ← ليه (بالعامية، سطر لكل غلطة).
3) تقييم من 10 على مستوى الطالب الحالي.
4) جملة واحدة أحسن بأسلوب أعلى شوية من مستواه يتعلم منها.`,
  roleplay: `إنت بتمثل شخصية ألمانية في الموقف المكتوب تحت. اتكلم ألماني بس على قد مستوى الطالب، جمل قصيرة. بعد كل رد ليك، حط سطر منفصل يبدأ بـ "💡" فيه تصحيح لغلطات الطالب في آخر رسالة (لو فيه) بالعربي ومعنى الكلمات الصعبة اللي إنت استخدمتها. لو الطالب كتب عربي، ساعده يقول الجملة بالألماني.`,
  free: `جاوب على أي سؤال عن اللغة الألمانية أو الحياة في ألمانيا، باختصار وبأمثلة.`,
};

export function systemPrompt(day, mode) {
  const lvl = day.level.id;
  return `إنت "أستاذ هانز"، مدرس ألماني مصري دمه خفيف وصبور، بتعلّم طالب مصري هدفه يوصل لمستوى B2 في 365 يوم.
اتكلم بالعامية المصرية في الشرح، والألماني في الأمثلة. ردودك قصيرة ومركزة (مش أكتر من 200 كلمة إلا لو الطالب طلب).
استخدم أسلوب تعليم مبتكر: تشبيهات من الحياة في مصر، حيل حفظ مضحكة تربط الكلمة الألمانية بكلمة عربية أو مصرية شبهها في النطق، وتلوين الأدوات: der 🔵 / die 🔴 / das 🟢.
ماتستخدمش قواعد أعلى من مستوى الطالب إلا لو هتشرحها.

موقف الطالب الحالي:
- اليوم ${day.day} من 365، الأسبوع ${day.week}، المستوى ${lvl}
- قاعدة الأسبوع: ${day.topic.t} (${day.topic.g})
- مفردات الأسبوع: ${day.topic.v}
- موقف المحادثة: ${day.topic.role}
- مهمة الكتابة: ${day.topic.write}

طريقة الرد في الوضع ده:
${MODE_RULES[mode]}`;
}

// ---------- استخدام اشتراكك في Claude / ChatGPT (من غير API ومن غير أي تكلفة زيادة) ----------
// بنجهز برومبت كامل بسياق اليوم ونفتحه في الموقع على حسابك المدفوع
export const HANDOFF_STARTS = {
  explain: "ابدأ: اشرحلي قاعدة الأسبوع.",
  quiz: "ابدأ: اديني أول سؤال.",
  correct: "ده النص اللي كتبته، صححه:\n\n(الصق النص هنا)",
  roleplay: "ابدأ الموقف وكلمني بالألماني.",
  free: "عندي سؤال:",
};

export function handoffPrompt(day, mode) {
  return `${systemPrompt(day, mode)}\n\n---\n${HANDOFF_STARTS[mode]}`;
}

export function openIn(app, text) {
  // الاتنين بيقبلوا ?q= عشان يملوا الرسالة. وبننسخها كمان احتياطي لو الرابط ماملاش
  navigator.clipboard?.writeText(text).catch(() => {});
  const q = encodeURIComponent(text);
  const url = app === "claude" ? `https://claude.ai/new?q=${q}` : `https://chatgpt.com/?q=${q}`;
  window.open(url, "_blank", "noopener");
}

// تعليمات تتحط مرة واحدة في Claude Project أو ChatGPT Project عشان المدرس يفتكرك طول السنة
export const PROJECT_INSTRUCTIONS = `إنت "أستاذ هانز"، مدرس ألماني مصري دمه خفيف وصبور. طالبك مصري بيتعلم ألماني من الصفر وهدفه B2 في 365 يوم (A1: أسابيع 1-12، A2: 13-24، B1: 25-38، B2: 39-52).
- اتكلم بالعامية المصرية في الشرح والألماني في الأمثلة، وخلي الردود قصيرة.
- استخدم تشبيهات من الحياة في مصر وحيل حفظ مضحكة، ولوّن الأدوات: der 🔵 / die 🔴 / das 🟢.
- كل رسالة من الطالب هيكون فيها رقم اليوم وقاعدة الأسبوع والوضع (شرح / امتحان / تصحيح / محادثة). التزم بيهم.
- في التصحيح: النص الصح، بعدين كل غلطة ← الصح ← ليه، وتقييم من 10.
- في المحادثة: اتكلم ألماني بس على قد مستواه، وبعد كل رد سطر "💡" فيه تصحيح غلطاته بالعربي.
- افتكر الغلطات اللي بتتكرر عنده وارجعله بيها في المراجعات.`;

function client(apiKey) {
  // dangerouslyAllowBrowser: المفتاح محفوظ على جهازك بس — ماتشاركش التطبيق بالمفتاح بتاعك مع حد
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

// محادثة مع بث مباشر للنص. history = مصفوفة رسائل API (بنحفظ content كامل زي ما رجع)
export async function chat({ apiKey, model, day, mode, history, onText }) {
  const m = MODELS.find((x) => x.id === model) || MODELS[0];
  const stream = client(apiKey).messages.stream({
    model: m.id,
    max_tokens: 4000,
    output_config: { effort: m.effort },
    system: systemPrompt(day, mode),
    messages: history,
  });
  stream.on("text", (t) => onText(t));
  const msg = await stream.finalMessage();
  if (msg.stop_reason === "refusal") {
    throw new Error("المدرس رفض يرد على الرسالة دي. جرّب تعيد صياغتها.");
  }
  return msg;
}

const VOCAB_SCHEMA = {
  type: "object",
  properties: {
    words: {
      type: "array",
      items: {
        type: "object",
        properties: {
          de: { type: "string", description: "الكلمة الألمانية، الأسماء بأداتها der/die/das" },
          ar: { type: "string", description: "المعنى بالعربي المصري" },
          ex: { type: "string", description: "جملة مثال ألماني بسيطة على قد المستوى" },
          tip: { type: "string", description: "حيلة حفظ قصيرة ومضحكة بالعامية المصرية" },
        },
        required: ["de", "ar", "ex", "tip"],
        additionalProperties: false,
      },
    },
  },
  required: ["words"],
  additionalProperties: false,
};

export async function generateVocab({ apiKey, model, day, count = 15, exclude = [] }) {
  const m = MODELS.find((x) => x.id === model) || MODELS[0];
  const msg = await client(apiKey).messages.create({
    model: m.id,
    max_tokens: 4000,
    output_config: { effort: "low", format: { type: "json_schema", schema: VOCAB_SCHEMA } },
    messages: [{
      role: "user",
      content: `اعمل ${count} كلمة ألماني أساسية لطالب مستوى ${day.level.id} في موضوع "${day.topic.v}" ومرتبطة بقاعدة "${day.topic.g}". اختار الكلمات الأكتر استخداماً في الامتحانات والحياة اليومية. ماتكررش: ${exclude.join(", ") || "—"}`,
    }],
  });
  if (msg.stop_reason === "refusal") throw new Error("مقدرش أولّد كلمات دلوقتي.");
  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  return JSON.parse(text).words;
}
