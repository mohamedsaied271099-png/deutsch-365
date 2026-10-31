import { LEVELS, WEEKS, TEACHERS, LISTENING, getDay, videoSearchUrl, SEED_VOCAB } from "./curriculum.js";
import { MODELS, MODES, chat, generateVocab, handoffPrompt, openIn, PROJECT_INSTRUCTIONS } from "./tutor.js";

// ---------- الحالة (محفوظة على الجهاز) ----------
const KEY = "deutsch365";
const today = () => new Date().toISOString().slice(0, 10);
const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
};
const S = Object.assign(
  { start: today(), done: {}, xp: 0, streak: 0, lastStudy: null, cards: {}, vocabWeeks: {}, chats: {}, settings: { apiKey: "", model: MODELS[0].id } },
  load(),
);
const save = () => {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { console.warn("save failed", e); }
};

const $view = document.getElementById("view");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
const currentDay = () => { for (let d = 1; d <= 365; d++) if (!S.done[d]) return d; return 365; };
let viewDay = null; // يوم مفتوح من الخطة
let tutorMode = "explain";

function refreshStats() {
  document.getElementById("xp").textContent = S.xp;
  document.getElementById("streak").textContent = S.streak;
}

function addXP(n) {
  S.xp += n;
  const t = today();
  if (S.lastStudy !== t) {
    S.streak = S.lastStudy && daysBetween(S.lastStudy, t) === 1 ? S.streak + 1 : 1;
    S.lastStudy = t;
  }
  save(); refreshStats();
}

// ---------- النطق (مجاني من المتصفح) ----------
function speak(text) {
  if (!("speechSynthesis" in window)) return alert("المتصفح ده مش بيدعم النطق");
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE"; u.rate = 0.9;
  const v = speechSynthesis.getVoices().find((x) => x.lang.startsWith("de"));
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}
// بنطق الجزء الألماني بس من الرسالة (الحروف اللاتينية)
const germanParts = (t) => (t.match(/[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß0-9 ,.!?'’\-]{3,}/g) || []).join(". ");

// ---------- البطاقات: تكرار متباعد (نظام Leitner) ----------
const BOX_DAYS = [0, 1, 3, 7, 16, 35, 90];
function addCards(words) {
  let n = 0;
  for (const w of words) {
    if (S.cards[w.de]) continue;
    S.cards[w.de] = { ar: w.ar, ex: w.ex || "", tip: w.tip || "", box: 0, due: today() };
    n++;
  }
  save();
  return n;
}
const dueCards = () => Object.entries(S.cards).filter(([, c]) => c.due <= today());
function grade(de, ok) {
  const c = S.cards[de];
  c.box = ok === 2 ? Math.min(c.box + 2, 6) : ok === 1 ? Math.min(c.box + 1, 6) : 0;
  const d = new Date(); d.setDate(d.getDate() + BOX_DAYS[c.box]);
  c.due = d.toISOString().slice(0, 10);
  addXP(ok ? 2 : 1);
}
function genderClass(de) {
  const m = de.match(/^(der|die|das)\s/i);
  return m ? "g-" + m[1].toLowerCase() : "";
}

// ---------- الشاشات ----------
const views = {
  today() {
    const n = viewDay || currentDay();
    const d = getDay(n);
    const expected = Math.min(365, daysBetween(S.start, today()) + 1);
    const doneCount = Object.keys(S.done).length;
    const lag = expected - doneCount - 1;
    const v = videoSearchUrl(d);
    const due = dueCards().length;
    const levelDone = Object.keys(S.done).filter((k) => getDay(+k).level.id === d.level.id).length;
    const levelTotal = (d.level.to - d.level.from + 1) * 7;

    $view.innerHTML = `
      <div class="card">
        <div class="row" style="align-items:center">
          <div><span class="pill" style="background:${d.level.color}">${d.level.id}</span>
          <span class="muted">الأسبوع ${d.week} · اليوم</span> <span class="big">${n}</span><span class="muted"> / 365</span></div>
        </div>
        <div class="bar"><i style="width:${(doneCount / 365) * 100}%"></i></div>
        <div class="muted">خلصت ${doneCount} يوم · مستوى ${d.level.id}: ${levelDone}/${levelTotal} ·
        ${viewDay ? "بتتفرج على يوم من الخطة" : lag > 0 ? `⚠️ متأخر ${lag} يوم عن الخطة — ذاكر يومين النهارده لو تقدر` : "✅ ماشي في ميعادك"}</div>
        <p class="muted" style="margin-top:8px">🎯 هدف المستوى: ${d.level.goal}</p>
      </div>

      <div class="card">
        <h2>${d.type.icon} ${d.type.name}: ${esc(d.topic.t)}</h2>
        <div class="muted" dir="ltr" style="text-align:right">${esc(d.topic.g)}</div>
        <p>${d.type.desc}</p>
        ${dayTasks(d, v)}
      </div>

      <div class="card">
        <h3>🧠 مراجعة يومية (10 دقايق)</h3>
        <p class="muted">عندك <b>${due}</b> بطاقة مستحقة للمراجعة النهارده.</p>
        <button class="btn alt" data-go="cards">راجع البطاقات</button>
      </div>

      <div class="card">
        ${S.done[n] ? `<p>✅ اليوم ده خلصان.</p><button class="btn alt" id="undo">رجّعه مش خلصان</button>`
          : `<button class="btn ok" id="finish">✔️ خلصت مهمة اليوم (+50 ⭐)</button>`}
        ${viewDay ? `<button class="btn alt" id="back">ارجع ليومك الحالي</button>` : ""}
      </div>`;

    bindCommon();
    on("#finish", () => { S.done[n] = today(); addXP(50); viewDay = null; celebrate(n); });
    on("#undo", () => { delete S.done[n]; save(); render(); });
    on("#back", () => { viewDay = null; render(); });
    on("#addVocab", () => addWeekVocab(d));
    on("#shadow", () => shadowing(d));
  },

  plan() {
    const cur = currentDay();
    $view.innerHTML = LEVELS.map((L) => `
      <div class="card">
        <h2><span class="pill" style="background:${L.color}">${L.id}</span> الأسابيع ${L.from}–${L.to}</h2>
        <p class="muted">${L.goal}</p>
        ${WEEKS.slice(L.from - 1, L.to).map((w, i) => {
          const wk = L.from + i;
          return `<details><summary><b>أسبوع ${wk}:</b> ${esc(w.t)}</summary>
            <p class="muted" dir="ltr" style="text-align:right">${esc(w.g)} · ${esc(w.v)}</p>
            <div class="grid">${[1, 2, 3, 4, 5, 6, 7].map((k) => {
              const dn = (wk - 1) * 7 + k;
              return `<button data-day="${dn}" class="${S.done[dn] ? "done" : ""} ${dn === cur ? "cur" : ""}">${dn}</button>`;
            }).join("")}${wk === 52 ? `<button data-day="365" class="${S.done[365] ? "done" : ""} ${cur === 365 ? "cur" : ""}">🎓</button>` : ""}</div>
          </details>`;
        }).join("")}
      </div>`).join("");
    $view.querySelectorAll("[data-day]").forEach((b) => b.onclick = () => { viewDay = +b.dataset.day; go("today"); });
  },

  cards() {
    const due = dueCards();
    const total = Object.keys(S.cards).length;
    if (!due.length) {
      $view.innerHTML = `<div class="card"><h2>🎉 مفيش بطاقات مستحقة</h2>
        <p class="muted">عندك ${total} كلمة في المجموعة. الكلمات بترجعلك في الوقت المناسب قبل ما تنساها (1، 3، 7، 16، 35، 90 يوم).</p>
        <p class="muted">ألوان الأدوات: <b class="g-der">der</b> · <b class="g-die">die</b> · <b class="g-das">das</b></p>
        <button class="btn" id="addVocab">➕ ضيف كلمات الأسبوع</button></div>`;
      on("#addVocab", () => addWeekVocab(getDay(currentDay())));
      return;
    }
    const [de, c] = due[0];
    $view.innerHTML = `<div class="card flash">
        <div class="muted">${due.length} متبقية</div>
        <div class="de ${genderClass(de)}">${esc(de)}</div>
        <div><button class="btn alt" id="say">🔊 اسمع</button></div>
        <div id="back" hidden>
          <div class="big">${esc(c.ar)}</div>
          <div class="ex">${esc(c.ex)}</div>
          ${c.tip ? `<p class="muted">💡 ${esc(c.tip)}</p>` : ""}
          <div><button class="btn bad" data-g="0">مش فاكر</button><button class="btn acc" data-g="1">صعب</button><button class="btn ok" data-g="2">سهل</button></div>
        </div>
        <button class="btn" id="show">اكشف المعنى</button>
      </div>`;
    speak(de);
    on("#say", () => speak(de + ". " + c.ex));
    on("#show", (e) => { e.target.hidden = true; document.getElementById("back").hidden = false; });
    $view.querySelectorAll("[data-g]").forEach((b) => b.onclick = () => { grade(de, +b.dataset.g); render(); });
  },

  tutor() {
    const d = getDay(viewDay || currentDay());
    const key = `${d.day}:${tutorMode}`;
    const hist = S.chats[key] || [];
    const hasKey = !!S.settings.apiKey;
    $view.innerHTML = `
      <div class="card">
        <h2>🤖 أستاذ هانز</h2>
        <p class="muted">اليوم ${d.day} · ${esc(d.topic.t)}</p>
        <div class="modes">${Object.entries(MODES).map(([k, m]) => `<button data-mode="${k}" class="${k === tutorMode ? "on" : ""}">${m.label}</button>`).join("")}</div>
        ${tutorMode === "roleplay" ? `<p class="muted">🎭 الموقف: ${esc(d.topic.role)}</p>` : ""}
        ${tutorMode === "correct" ? `<p class="muted">📝 المهمة: ${esc(d.topic.write)}</p>` : ""}
        <p><b>استخدم اشتراكك:</b> <button class="btn" data-handoff="claude" data-mode="${tutorMode}">🟠 افتح في Claude</button><button class="btn" data-handoff="chatgpt" data-mode="${tutorMode}">🟢 افتح في ChatGPT</button></p>
        <p class="muted">بيفتح المحادثة على حسابك ومعاها كل سياق اليوم (البرومبت بيتنسخ كمان، لو الرسالة ماظهرتش اعمل لصق).</p>
        ${!hasKey ? `<p class="muted">الشات اللي تحت جوه التطبيق اختياري ومحتاج مفتاح API منفصل في <a href="#" data-go="settings">الإعدادات</a>.</p>` : ""}
        <div class="chat" id="chat">${hist.map(renderMsg).join("")}</div>
        <div class="composer">
          <textarea id="inp" placeholder="اكتب بالألماني أو بالعربي..."></textarea>
          <div style="display:flex;flex-direction:column">
            <button class="btn" id="send" ${hasKey ? "" : "disabled"}>إرسال</button>
            <button class="btn alt" id="mic" title="اتكلم بالألماني">🎤</button>
          </div>
        </div>
        ${hist.length ? `<button class="btn alt" id="clear">🗑️ محادثة جديدة</button>` : ""}
        ${!hist.length && MODES[tutorMode].start && hasKey ? `<button class="btn acc" id="kick">ابدأ: "${MODES[tutorMode].start}"</button>` : ""}
      </div>`;
    bindCommon();
    const box = document.getElementById("chat"); box.scrollTop = box.scrollHeight;
    $view.querySelectorAll("[data-mode]").forEach((b) => b.onclick = () => { tutorMode = b.dataset.mode; render(); });
    $view.querySelectorAll("[data-say]").forEach((b) => b.onclick = () => speak(germanParts(b.closest(".msg").querySelector(".t").textContent)));
    on("#clear", () => { delete S.chats[key]; save(); render(); });
    on("#kick", () => send(d, key, MODES[tutorMode].start));
    on("#send", () => { const t = document.getElementById("inp").value.trim(); if (t) send(d, key, t); });
    on("#mic", () => listen((t) => { document.getElementById("inp").value = t; }));
  },

  settings() {
    const s = S.settings;
    $view.innerHTML = `
      <div class="card">
        <h2>🔗 ربط اشتراكك في Claude و ChatGPT</h2>
        <p class="muted">اعمل الخطوة دي مرة واحدة بس: اعمل <b>Project</b> اسمه "Deutsch 365" في Claude وواحد في ChatGPT، والصق التعليمات دي في خانة Instructions. كده المدرس هيفتكر أسلوبك وغلطاتك طول السنة، وافتح محادثات الأيام جوه الـ Project ده.</p>
        <textarea id="projInst" readonly style="width:100%;min-height:140px;border-radius:10px;padding:8px;background:var(--bg);color:var(--text);border:1px solid var(--line)">${esc(PROJECT_INSTRUCTIONS)}</textarea>
        <button class="btn" id="copyInst">📋 انسخ التعليمات</button>
        <a class="btn alt" href="https://claude.ai/projects" target="_blank" rel="noopener">Claude Projects</a>
        <a class="btn alt" href="https://chatgpt.com/" target="_blank" rel="noopener">ChatGPT</a>
      </div>
      <div class="card">
        <h2>⚙️ الإعدادات</h2>
        <label>مفتاح Claude API (اختياري)</label>
        <p class="muted">مش محتاجه لو هتستخدم اشتراكك. ميزته: الشات جوه التطبيق + توليد كلمات الأسابيع من 13 لـ 52 أوتوماتيك. الاشتراك (Pro) مش بيدي API، ده حساب منفصل.</p>
        <input id="key" type="password" value="${esc(s.apiKey)}" placeholder="sk-ant-..." />
        <p class="muted">بيتحفظ على الجهاز ده بس. هتجيبه من <a href="https://platform.claude.com" target="_blank" rel="noopener">platform.claude.com</a> واشحن 5$ — هتكفيك شهور مع Haiku.</p>
        <label>الموديل</label>
        <select id="model">${MODELS.map((m) => `<option value="${m.id}" ${m.id === s.model ? "selected" : ""}>${m.name}</option>`).join("")}</select>
        <label>تاريخ البداية</label>
        <input id="start" type="date" value="${S.start}" />
        <button class="btn ok" id="saveS">حفظ</button>
      </div>
      <div class="card">
        <h3>💾 نسخة احتياطية</h3>
        <p class="muted">تقدمك محفوظ في المتصفح. خد نسخة كل أسبوع عشان لو المتصفح اتمسح.</p>
        <button class="btn alt" id="exp">تنزيل نسخة</button>
        <label class="btn alt">استرجاع نسخة<input id="imp" type="file" accept=".json" hidden /></label>
      </div>
      <div class="card">
        <h3>👨‍🏫 المدرسين المرشحين على يوتيوب</h3>
        <ul class="tasks">${TEACHERS.map((t) => `<li><a href="${t.url}" target="_blank" rel="noopener">${esc(t.name)}</a> <span class="muted">(${t.levels.join("، ")})</span></li>`).join("")}</ul>
      </div>`;
    on("#copyInst", () => { navigator.clipboard?.writeText(PROJECT_INSTRUCTIONS); alert("اتنسخت ✅ الصقها في Instructions بتاعة الـ Project"); });
    on("#saveS", () => {
      s.apiKey = document.getElementById("key").value.trim();
      s.model = document.getElementById("model").value;
      S.start = document.getElementById("start").value || S.start;
      save(); alert("اتحفظ ✅");
    });
    on("#exp", () => {
      const data = { ...S, settings: { ...S.settings, apiKey: "" } }; // المفتاح مش بيتصدّر
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }));
      a.download = `deutsch365-${today()}.json`; a.click();
    });
    document.getElementById("imp").onchange = async (e) => {
      try {
        const data = JSON.parse(await e.target.files[0].text());
        const k = S.settings.apiKey;
        Object.assign(S, data); S.settings.apiKey = S.settings.apiKey || k;
        save(); alert("اترجعت ✅"); render(); refreshStats();
      } catch { alert("الملف ده مش صالح"); }
    };
  },
};

// مهام اليوم حسب نوعه
function dayTasks(d, v) {
  const lvl = d.level.id;
  const tutorBtn = (mode, label) => `<div style="margin-top:8px"><b>${label}</b><br>
    <button class="btn" data-handoff="claude" data-mode="${mode}">🟠 في Claude</button><button class="btn" data-handoff="chatgpt" data-mode="${mode}">🟢 في ChatGPT</button>${S.settings.apiKey ? `<button class="btn alt" data-tutor="${mode}">🤖 هنا في التطبيق</button>` : ""}</div>`;
  const video = `<p>🎬 <a href="${v.url}" target="_blank" rel="noopener">شرح "${esc(d.topic.q)}" على يوتيوب</a>
    <br><span class="muted">مدرسين مقترحين لمستواك: ${v.alt.map((t) => `<a href="${t.url}" target="_blank" rel="noopener">${esc(t.name)}</a>`).join(" · ")}</span></p>`;
  switch (d.type.id) {
    case "grammar":
      return `<ol class="tasks"><li>${video}</li><li>اكتب القاعدة في كشكولك بإيدك (الكتابة بالإيد بتثبّت)</li><li>اطلب من أستاذ هانز يشرحها بأمثلة من حياتك</li></ol>${tutorBtn("explain", "📘 اشرحلي")}`;
    case "vocab":
      return `<ol class="tasks"><li>ضيف كلمات موضوع "${esc(d.topic.v)}" للبطاقات</li><li>راجعهم مرتين: الصبح وبالليل</li><li>اعمل 3 جمل عن نفسك بكل كلمة صعبة</li></ol>
        <button class="btn" id="addVocab">➕ ضيف كلمات الأسبوع</button>`;
    case "practice":
      return `<ol class="tasks"><li>حل 10 أسئلة مع أستاذ هانز</li><li>أي غلطة اتكررت مرتين: اكتبها في "كشكول الغلطات"</li></ol>${tutorBtn("quiz", "✍️ امتحنّي")}`;
    case "listening":
      return `<ol class="tasks"><li>اتفرج على حلقة من: ${LISTENING[lvl].map((x) => `<a href="${x.url}" target="_blank" rel="noopener">${esc(x.name)}</a>`).join(" · ")}</li>
        <li>أول مرة من غير ترجمة، تاني مرة بترجمة ألماني (مش عربي)</li><li>اكتب 5 جمل فهمتها وابعتها للتصحيح</li></ol>${tutorBtn("correct", "📝 صحّحلي")}`;
    case "writing":
      return `<p>📝 <b>المهمة:</b> ${esc(d.topic.write)}</p><ol class="tasks"><li>اكتب من غير ترجمة جوجل</li><li>ابعته لأستاذ هانز يصححه</li><li>اكتبه تاني صح من الذاكرة</li></ol>${tutorBtn("correct", "📝 صحّحلي")}`;
    case "speaking":
      return `<p>🎭 <b>الموقف:</b> ${esc(d.topic.role)}</p><ol class="tasks"><li>Shadowing: اسمع كل جملة وكررها بصوت عالي 3 مرات</li><li>اعمل الموقف مع أستاذ هانز بالمايك 🎤</li></ol>
        <button class="btn alt" id="shadow">🔊 Shadowing لكلمات الأسبوع</button>${tutorBtn("roleplay", "🗣️ ابدأ المحادثة")}
        <p class="muted">💡 أقوى استخدام لاشتراكك: افتح المحادثة من الموبايل وشغّل <b>الوضع الصوتي</b> في ChatGPT أو Claude واتكلم بصوتك كأنك في ألمانيا.</p>`;
    case "review":
      return `<ol class="tasks"><li>خلّص كل البطاقات المستحقة</li><li>اختبار الأسبوع: قول لأستاذ هانز "اختبار الأسبوع" (10 أسئلة)</li><li>لو جبت أقل من 7/10 عيد يوم القواعد</li></ol>${tutorBtn("quiz", "🏆 اختبار الأسبوع")}`;
    default:
      return `<ol class="tasks"><li>حمّل نموذج امتحان Goethe B2 الرسمي واحله في وقته</li><li>صحح الكتابة والكلام مع أستاذ هانز</li></ol>${tutorBtn("correct", "📝 صحّح كتابتي")}${tutorBtn("roleplay", "🗣️ امتحان الكلام")}`;
  }
}

async function addWeekVocab(d) {
  const seed = SEED_VOCAB[d.week];
  if (seed) {
    const n = addCards(seed.map(([de, ar, ex]) => ({ de, ar, ex })));
    S.vocabWeeks[d.week] = true; save();
    alert(n ? `اتضاف ${n} كلمة ✅` : "الكلمات دي موجودة عندك بالفعل");
    return go("cards");
  }
  if (!S.settings.apiKey) return vocabViaSubscription(d);
  const btn = document.getElementById("addVocab");
  if (btn) { btn.disabled = true; btn.textContent = "⏳ أستاذ هانز بيجهّز الكلمات..."; }
  try {
    const words = await generateVocab({ apiKey: S.settings.apiKey, model: S.settings.model, day: d, exclude: Object.keys(S.cards).slice(-150) });
    const n = addCards(words);
    S.vocabWeeks[d.week] = true; save();
    alert(`اتضاف ${n} كلمة جديدة ✅`);
    go("cards");
  } catch (e) {
    alert("حصلت مشكلة: " + e.message);
    if (btn) { btn.disabled = false; btn.textContent = "➕ ضيف كلمات الأسبوع"; }
  }
}

// من غير API: Claude/ChatGPT يكتب الكلمات بصيغة سطور، وإنت تلزقها هنا
function vocabViaSubscription(d) {
  const prompt = `اعمل 15 كلمة ألماني أساسية لطالب مستوى ${d.level.id} في موضوع "${d.topic.v}" ومرتبطة بقاعدة "${d.topic.g}".
اكتب كل كلمة في سطر لوحدها بالشكل ده بالظبط ومن غير أي كلام تاني ولا ترقيم:
الكلمة بأداتها | المعنى بالمصري | جملة مثال ألماني | حيلة حفظ مضحكة بالمصري`;
  $view.innerHTML = `<div class="card">
    <h2>🧠 كلمات أسبوع ${d.week}: ${esc(d.topic.v)}</h2>
    <ol class="tasks"><li>دوس على Claude أو ChatGPT، هيكتبلك الكلمات</li><li>انسخ الرد كله والصقه هنا</li></ol>
    <button class="btn" id="vc">🟠 Claude</button><button class="btn" id="vg">🟢 ChatGPT</button>
    <textarea id="paste" style="width:100%;min-height:160px;margin-top:8px;direction:ltr;border-radius:10px;padding:8px;background:var(--bg);color:var(--text);border:1px solid var(--line)" placeholder="die Wohnung | الشقة | Die Wohnung ist groß. | ..."></textarea>
    <button class="btn ok" id="imp">➕ ضيف للبطاقات</button>
  </div>`;
  on("#vc", () => openIn("claude", prompt));
  on("#vg", () => openIn("chatgpt", prompt));
  on("#imp", () => {
    const words = document.getElementById("paste").value.split("\n")
      .map((l) => l.replace(/^[\s\-*\d.)]+/, "").split("|").map((x) => x.trim()))
      .filter((p) => p.length >= 2 && p[0] && p[1])
      .map(([de, ar, ex, tip]) => ({ de, ar, ex, tip }));
    if (!words.length) return alert("مالقيتش كلمات. اتأكد إن كل سطر فيه | بين الأجزاء");
    const n = addCards(words);
    S.vocabWeeks[d.week] = true; save();
    alert(`اتضاف ${n} كلمة ✅`);
    go("cards");
  });
}

function shadowing(d) {
  const words = Object.entries(S.cards).slice(-15);
  if (!words.length) return alert("ضيف كلمات للبطاقات الأول");
  let i = 0;
  const next = () => {
    if (i >= words.length) return;
    const [de, c] = words[i++];
    const u = new SpeechSynthesisUtterance(c.ex || de);
    u.lang = "de-DE"; u.rate = 0.85;
    u.onend = () => setTimeout(next, 3500); // وقت تكرر فيه بصوتك
    speechSynthesis.speak(u);
  };
  speechSynthesis.cancel(); next();
}

function listen(cb) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return alert("التعرف على الصوت شغال على Chrome أو Edge بس");
  const r = new SR(); r.lang = "de-DE"; r.interimResults = false;
  const mic = document.getElementById("mic"); mic.textContent = "⏺️";
  r.onresult = (e) => cb(e.results[0][0].transcript);
  r.onend = () => { mic.textContent = "🎤"; };
  r.onerror = (e) => alert("مشكلة في المايك: " + e.error);
  r.start();
}

const textOf = (content) => typeof content === "string" ? content : content.filter((b) => b.type === "text").map((b) => b.text).join("");
function renderMsg(m) {
  if (m.role !== "user" && m.role !== "assistant") return "";
  return `<div class="msg ${m.role}"><div class="t">${esc(textOf(m.content))}</div>${m.role === "assistant" ? `<div class="say" data-say>🔊 انطق الألماني</div>` : ""}</div>`;
}

async function send(d, key, text) {
  const hist = S.chats[key] || (S.chats[key] = []);
  hist.push({ role: "user", content: text });
  save(); render();
  const box = document.getElementById("chat");
  const out = document.createElement("div");
  out.className = "msg assistant"; out.textContent = "…";
  box.appendChild(out); box.scrollTop = box.scrollHeight;
  document.getElementById("send").disabled = true;
  let acc = "";
  try {
    const msg = await chat({
      apiKey: S.settings.apiKey, model: S.settings.model, day: d, mode: tutorMode, history: hist,
      onText: (t) => { acc += t; out.textContent = acc; box.scrollTop = box.scrollHeight; },
    });
    hist.push({ role: "assistant", content: msg.content }); // بنحفظ المحتوى كامل زي ما رجع من الـ API
    addXP(5);
  } catch (e) {
    hist.pop(); // نشيل رسالة المستخدم اللي ماتردش عليها عشان التاريخ يفضل سليم
    alert("حصلت مشكلة: " + (e.status === 401 ? "مفتاح الـ API غلط" : e.message));
  }
  save(); render();
}

function celebrate(n) {
  const d = getDay(n);
  const msg = n % 7 === 0 ? `🏆 خلصت أسبوع ${d.week}! ` : "";
  const lvlEnd = LEVELS.find((L) => L.to * 7 === n);
  alert(`${msg}${lvlEnd ? `🎉🎉 مبروك! خلصت مستوى ${lvlEnd.id} كله!` : "عاش! ✅ +50 ⭐"}`);
  render();
}

// ---------- التنقل ----------
let tab = "today";
function go(t) { tab = t; document.querySelectorAll(".tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === t)); render(); }
function render() { views[tab](); window.scrollTo(0, 0); }
function on(sel, fn) { const el = $view.querySelector(sel); if (el) el.onclick = fn; }
function bindCommon() {
  $view.querySelectorAll("[data-go]").forEach((b) => b.onclick = (e) => { e.preventDefault(); go(b.dataset.go); });
  $view.querySelectorAll("[data-tutor]").forEach((b) => b.onclick = () => { tutorMode = b.dataset.tutor; go("tutor"); });
  $view.querySelectorAll("[data-handoff]").forEach((b) => b.onclick = () => {
    openIn(b.dataset.handoff, handoffPrompt(getDay(viewDay || currentDay()), b.dataset.mode));
    addXP(5);
  });
}
document.querySelectorAll(".tabs button").forEach((b) => b.onclick = () => go(b.dataset.tab));

if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
refreshStats();
render();
