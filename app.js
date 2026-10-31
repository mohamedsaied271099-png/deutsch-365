import { LEVELS, WEEKS, TEACHERS, LISTENING, DAY_TYPES, getDay, videoSearchUrl, SEED_VOCAB } from "./curriculum.js";
import { icon } from "./icons.js";
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
const $side = document.getElementById("side");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
const currentDay = () => { for (let d = 1; d <= 365; d++) if (!S.done[d]) return d; return 365; };

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

// ---------- التطبيقات: كل تطبيق له قايمة جانبية (side) وشاشة لكل قسم (view) ----------
const APPS = {
  today: {
    icon: "📅", name: "النهارده", color: "#d97706",
    badge: () => `يوم ${currentDay()}`,
    defaultSection: () => String(currentDay()),
    side() {
      const cur = currentDay();
      const n = +route.section || cur;
      const wk = getDay(n).week;
      const days = [1, 2, 3, 4, 5, 6, 7].map((k) => (wk - 1) * 7 + k);
      if (wk === 52) days.push(365);
      return [
        { head: `الأسبوع ${wk}: ${WEEKS[wk - 1].t}` },
        ...days.map((dn) => {
          const d = getDay(dn);
          return { id: String(dn), label: `${d.type.icon} يوم ${dn} · ${d.type.name}`, mark: S.done[dn] ? "✅" : dn === cur ? "👈" : "" };
        }),
        { head: "تنقّل" },
        ...(wk > 1 ? [{ id: String((wk - 2) * 7 + 1), label: "⬅️ الأسبوع اللي فات" }] : []),
        ...(wk < 52 ? [{ id: String(wk * 7 + 1), label: "➡️ الأسبوع الجاي" }] : []),
        ...(n !== cur ? [{ id: String(cur), label: "🎯 ارجع ليومك الحالي" }] : []),
      ];
    },
    view: (s) => todayView(+s || currentDay()),
  },
  plan: {
    icon: "🗺️", name: "الخطة", color: "#0284c7",
    badge: () => `${Object.keys(S.done).length}/365`,
    defaultSection: () => getDay(currentDay()).level.id,
    side: () => [
      { head: "المستويات" },
      ...LEVELS.map((L) => {
        const done = Object.keys(S.done).filter((k) => getDay(+k).level.id === L.id).length;
        const total = (L.to - L.from + 1) * 7 + (L.id === "B2" ? 1 : 0);
        return { id: L.id, label: `${L.id} · أسابيع ${L.from}–${L.to}`, mark: `${done}/${total}`, color: L.color };
      }),
    ],
    view: (s) => planView(LEVELS.find((L) => L.id === s) || LEVELS[0]),
  },
  cards: {
    icon: "🧠", name: "البطاقات", color: "#db2777",
    badge: () => `${dueCards().length} مستحقة`,
    defaultSection: () => "review",
    side: () => [
      { head: "البطاقات" },
      { id: "review", label: "🔁 المراجعة", mark: String(dueCards().length) },
      { id: "all", label: "📚 كل كلماتي", mark: String(Object.keys(S.cards).length) },
      { id: "add", label: "➕ ضيف كلمات الأسبوع" },
      { head: "صناديق الحفظ" },
      ...BOX_DAYS.map((days, b) => ({ id: "box" + b, label: b === 0 ? "🆕 جديدة / نسيتها" : `📦 بترجع كل ${days} يوم`, mark: String(Object.values(S.cards).filter((c) => c.box === b).length) })),
    ],
    view: (s) => s === "all" ? allCardsView() : s === "add" ? addWeekVocab(getDay(currentDay())) : s.startsWith("box") ? allCardsView(+s.slice(3)) : reviewView(),
  },
  tutor: {
    icon: "🤖", name: "المدرس", color: "#7c3aed",
    badge: () => "أستاذ هانز",
    defaultSection: () => "explain",
    side: () => [
      { head: "أوضاع المدرس" },
      ...Object.entries(MODES).map(([k, m]) => ({ id: k, label: m.label, mark: S.chats[`${currentDay()}:${k}`]?.length ? "💬" : "" })),
      { head: "اشتراكاتك" },
      { id: "project", label: "🔗 تعليمات الـ Project" },
    ],
    view: (s) => s === "project" ? projectView() : tutorView(MODES[s] ? s : "explain"),
  },
  settings: {
    icon: "⚙️", name: "الإعدادات", color: "#475569",
    badge: () => "",
    defaultSection: () => "link",
    side: () => [
      { head: "الإعدادات" },
      { id: "link", label: "🔗 ربط Claude و ChatGPT" },
      { id: "general", label: "📆 تاريخ البداية والـ API" },
      { id: "backup", label: "💾 نسخة احتياطية" },
      { id: "teachers", label: "👨‍🏫 المدرسين على يوتيوب" },
    ],
    view: (s) => ({ link: projectView, general: generalView, backup: backupView, teachers: teachersView }[s] || projectView)(),
  },
};

// ---------- الشاشة الرئيسية ----------
// الشاشة الرئيسية متقسمة لمجموعات، والإعدادات في الهيدر
const GROUPS = [
  { t: "كل يوم", apps: ["today", "cards"] },
  { t: "التعلّم", apps: ["plan", "tutor"] },
];
const appTitle = (id) => `<span class="title-ic" style="--c:${APPS[id].color}">${icon(id, 18)}</span>${APPS[id].name}`;

function homeView() {
  const n = currentDay();
  const d = getDay(n);
  const doneCount = Object.keys(S.done).length;
  $view.innerHTML = `
    <div class="hero2">
      <div class="hero-top">
        <span class="chip">المستوى ${d.level.id}</span>
        <span class="hero-week">الأسبوع ${d.week} من 52</span>
      </div>
      <div class="hero-main">
        <div><div class="hero-num">${n}<small> / 365</small></div><div class="hero-sub">يوم في الخطة</div></div>
        <div class="hero-trip">${icon("check", 22)}<div><b>${doneCount}</b> يوم<br><small>خلصتهم لحد دلوقتي</small></div></div>
      </div>
      <div class="hero-bar"><i style="width:${(doneCount / 365) * 100}%"></i></div>
      <a class="hero-next" href="#/today/${n}">${icon("today", 18)}<span>مهمة النهارده: ${esc(d.type.name)} · ${esc(d.topic.t)}</span>${icon("chevron", 18)}</a>
    </div>
    ${GROUPS.map((g) => `
      <div class="group-title">${g.t}</div>
      <div class="apps">${g.apps.map((id) => { const a = APPS[id]; return `
        <a class="app" href="#/${id}" style="--c:${a.color}">
          <span class="app-icon">${icon(id, 26)}</span>
          <span class="app-name">${a.name}</span>
          <span class="app-badge">${esc(a.badge()) || "&nbsp;"}</span>
        </a>`; }).join("")}
      </div>`).join("")}`;
}

// الإيموجي اللي في أول العناوين بتتشال عشان الشكل يبقى موحد مع الأيقونات
const stripEmoji = (t) => String(t).replace(/^(?:[\p{Extended_Pictographic}\p{Regional_Indicator}←-⇿⬅-⬇]️?\s*)+/u, "");
function cleanHeadings() {
  $view.querySelectorAll("h2, h3").forEach((h) => { const n = h.firstChild; if (n?.nodeType === 3) n.textContent = stripEmoji(n.textContent); });
}

function renderSide(app, section) {
  $side.style.setProperty("--c", app.color);
  $side.innerHTML = `<div class="side-title">${appTitle(route.app)}</div>` + app.side().map((it) => it.head
    ? `<div class="side-head">${esc(it.head)}</div>`
    : `<a class="side-item ${it.id === section ? "on" : ""}" href="#/${route.app}/${it.id}">
        ${it.color ? `<i class="dot" style="background:${it.color}"></i>` : ""}<span>${esc(stripEmoji(it.label))}</span>${it.mark ? `<small>${esc(it.mark)}</small>` : ""}</a>`).join("");
}

// ---------- شاشات النهارده والخطة ----------
function todayView(n) {
  const d = getDay(n);
  const cur = currentDay();
  const expected = Math.min(365, daysBetween(S.start, today()) + 1);
  const doneCount = Object.keys(S.done).length;
  const lag = expected - doneCount - 1;
  const v = videoSearchUrl(d);
  const due = dueCards().length;
  const levelDone = Object.keys(S.done).filter((k) => getDay(+k).level.id === d.level.id).length;
  const levelTotal = (d.level.to - d.level.from + 1) * 7;

  $view.innerHTML = `
    <div class="card">
      <div><span class="pill" style="background:${d.level.color}">${d.level.id}</span>
      <span class="muted">الأسبوع ${d.week} · اليوم</span> <span class="big">${n}</span><span class="muted"> / 365</span></div>
      <div class="bar"><i style="width:${(doneCount / 365) * 100}%"></i></div>
      <div class="muted">خلصت ${doneCount} يوم · مستوى ${d.level.id}: ${levelDone}/${levelTotal} ·
      ${n !== cur ? "بتتفرج على يوم تاني غير يومك الحالي" : lag > 0 ? `⚠️ متأخر ${lag} يوم عن الخطة — ذاكر يومين النهارده لو تقدر` : "✅ ماشي في ميعادك"}</div>
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
      <a class="btn alt" href="#/cards/review">راجع البطاقات</a>
    </div>

    <div class="card">
      ${S.done[n] ? `<p>✅ اليوم ده خلصان.</p><button class="btn alt" id="undo">رجّعه مش خلصان</button>`
        : `<button class="btn ok" id="finish">✔️ خلصت مهمة اليوم (+50 ⭐)</button>`}
    </div>`;

  bindCommon(n);
  on("#finish", () => { S.done[n] = today(); addXP(50); celebrate(n); });
  on("#undo", () => { delete S.done[n]; save(); render(); });
  on("#addVocab", () => { location.hash = "#/cards/add"; });
  on("#shadow", () => shadowing());
}

function planView(L) {
  const cur = currentDay();
  $view.innerHTML = `
    <div class="card">
      <h2><span class="pill" style="background:${L.color}">${L.id}</span> الأسابيع ${L.from}–${L.to}</h2>
      <p class="muted">🎯 ${L.goal}</p>
      <p class="muted">${DAY_TYPES.map((t) => `${t.icon} ${t.name}`).join(" · ")}</p>
    </div>
    ${WEEKS.slice(L.from - 1, L.to).map((w, i) => {
      const wk = L.from + i;
      const days = [1, 2, 3, 4, 5, 6, 7].map((k) => (wk - 1) * 7 + k);
      const doneN = days.filter((dn) => S.done[dn]).length;
      return `<div class="card">
        <h3>أسبوع ${wk}: ${esc(w.t)} <small class="muted">${doneN}/7</small></h3>
        <p class="muted" dir="ltr" style="text-align:right">${esc(w.g)} · ${esc(w.v)}</p>
        <div class="grid">${days.map((dn) => `<a href="#/today/${dn}" class="${S.done[dn] ? "done" : ""} ${dn === cur ? "cur" : ""}" title="${getDay(dn).type.name}">${getDay(dn).type.icon}<br>${dn}</a>`).join("")}
        ${wk === 52 ? `<a href="#/today/365" class="${S.done[365] ? "done" : ""} ${cur === 365 ? "cur" : ""}">🎓<br>365</a>` : ""}</div>
      </div>`;
    }).join("")}`;
}

// ---------- شاشات البطاقات ----------
function reviewView() {
  const due = dueCards();
  const total = Object.keys(S.cards).length;
  if (!due.length) {
    $view.innerHTML = `<div class="card"><h2>🎉 مفيش بطاقات مستحقة</h2>
      <p class="muted">عندك ${total} كلمة في المجموعة. الكلمات بترجعلك في الوقت المناسب قبل ما تنساها (1، 3، 7، 16، 35، 90 يوم).</p>
      <p class="muted">ألوان الأدوات: <b class="g-der">der</b> · <b class="g-die">die</b> · <b class="g-das">das</b></p>
      <a class="btn" href="#/cards/add">➕ ضيف كلمات الأسبوع</a></div>`;
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
}

function allCardsView(box) {
  const list = Object.entries(S.cards).filter(([, c]) => box === undefined || c.box === box);
  $view.innerHTML = `<div class="card">
    <h2>${box === undefined ? "📚 كل كلماتي" : box === 0 ? "🆕 كلمات جديدة / نسيتها" : `📦 كلمات بترجع كل ${BOX_DAYS[box]} يوم`} <small class="muted">(${list.length})</small></h2>
    ${list.length ? `<table class="words">${list.map(([de, c]) => `<tr>
      <td dir="ltr" class="${genderClass(de)}"><b>${esc(de)}</b></td><td>${esc(c.ar)}</td>
      <td><button class="icon-btn" data-say="${esc(de)}">🔊</button></td></tr>`).join("")}</table>`
      : `<p class="muted">مفيش كلمات هنا لسه.</p>`}
  </div>`;
  $view.querySelectorAll("[data-say]").forEach((b) => b.onclick = () => speak(b.dataset.say));
}

// ---------- شاشات المدرس ----------
function tutorView(mode) {
  const d = getDay(currentDay());
  const key = `${d.day}:${mode}`;
  const hist = S.chats[key] || [];
  const hasKey = !!S.settings.apiKey;
  $view.innerHTML = `
    <div class="card">
      <h2>${MODES[mode].label}</h2>
      <p class="muted">اليوم ${d.day} · ${esc(d.topic.t)}</p>
      ${mode === "roleplay" ? `<p class="muted">🎭 الموقف: ${esc(d.topic.role)}</p>` : ""}
      ${mode === "correct" ? `<p class="muted">📝 المهمة: ${esc(d.topic.write)}</p>` : ""}
      <p><b>استخدم اشتراكك:</b><br><button class="btn" data-handoff="claude" data-mode="${mode}">🟠 افتح في Claude</button><button class="btn" data-handoff="chatgpt" data-mode="${mode}">🟢 افتح في ChatGPT</button></p>
      <p class="muted">بيفتح المحادثة على حسابك ومعاها كل سياق اليوم (البرومبت بيتنسخ كمان، لو الرسالة ماظهرتش اعمل لصق).</p>
    </div>
    <div class="card">
      <h3>💬 شات جوه التطبيق ${hasKey ? "" : `<small class="muted">(اختياري — محتاج <a href="#/settings/general">مفتاح API</a>)</small>`}</h3>
      <div class="chat" id="chat">${hist.map(renderMsg).join("")}</div>
      <div class="composer">
        <textarea id="inp" placeholder="اكتب بالألماني أو بالعربي..."></textarea>
        <div style="display:flex;flex-direction:column">
          <button class="btn" id="send" ${hasKey ? "" : "disabled"}>إرسال</button>
          <button class="btn alt" id="mic" title="اتكلم بالألماني">🎤</button>
        </div>
      </div>
      ${hist.length ? `<button class="btn alt" id="clear">🗑️ محادثة جديدة</button>` : ""}
      ${!hist.length && MODES[mode].start && hasKey ? `<button class="btn acc" id="kick">ابدأ: "${MODES[mode].start}"</button>` : ""}
    </div>`;
  bindCommon(d.day);
  const box = document.getElementById("chat"); box.scrollTop = box.scrollHeight;
  $view.querySelectorAll("[data-say]").forEach((b) => b.onclick = () => speak(germanParts(b.closest(".msg").querySelector(".t").textContent)));
  on("#clear", () => { delete S.chats[key]; save(); render(); });
  on("#kick", () => send(d, mode, key, MODES[mode].start));
  on("#send", () => { const t = document.getElementById("inp").value.trim(); if (t) send(d, mode, key, t); });
  on("#mic", () => listen((t) => { document.getElementById("inp").value = t; }));
}

// ---------- شاشات الإعدادات ----------
function projectView() {
  $view.innerHTML = `
    <div class="card">
      <h2>🔗 ربط اشتراكك في Claude و ChatGPT</h2>
      <p class="muted">اعمل الخطوة دي مرة واحدة بس: اعمل <b>Project</b> اسمه "Deutsch 365" في Claude وواحد في ChatGPT، والصق التعليمات دي في خانة Instructions. كده المدرس هيفتكر أسلوبك وغلطاتك طول السنة، وافتح محادثات الأيام جوه الـ Project ده.</p>
      <textarea readonly class="box-text">${esc(PROJECT_INSTRUCTIONS)}</textarea>
      <button class="btn" id="copyInst">📋 انسخ التعليمات</button>
      <a class="btn alt" href="https://claude.ai/projects" target="_blank" rel="noopener">Claude Projects</a>
      <a class="btn alt" href="https://chatgpt.com/" target="_blank" rel="noopener">ChatGPT</a>
    </div>`;
  on("#copyInst", () => { navigator.clipboard?.writeText(PROJECT_INSTRUCTIONS); alert("اتنسخت ✅ الصقها في Instructions بتاعة الـ Project"); });
}

function generalView() {
  const s = S.settings;
  $view.innerHTML = `
    <div class="card">
      <h2>📆 تاريخ البداية والـ API</h2>
      <label>تاريخ البداية</label>
      <input id="start" type="date" value="${S.start}" />
      <label>مفتاح Claude API (اختياري)</label>
      <p class="muted">مش محتاجه لو هتستخدم اشتراكك. ميزته: الشات جوه التطبيق + توليد كلمات الأسابيع من 13 لـ 52 أوتوماتيك. الاشتراك (Pro) مش بيدي API، ده حساب منفصل.</p>
      <input id="key" type="password" value="${esc(s.apiKey)}" placeholder="sk-ant-..." />
      <p class="muted">بيتحفظ على الجهاز ده بس. هتجيبه من <a href="https://platform.claude.com" target="_blank" rel="noopener">platform.claude.com</a> واشحن 5$، هتكفيك شهور مع Haiku.</p>
      <label>الموديل</label>
      <select id="model">${MODELS.map((m) => `<option value="${m.id}" ${m.id === s.model ? "selected" : ""}>${m.name}</option>`).join("")}</select>
      <button class="btn ok" id="saveS">حفظ</button>
    </div>`;
  on("#saveS", () => {
    s.apiKey = document.getElementById("key").value.trim();
    s.model = document.getElementById("model").value;
    S.start = document.getElementById("start").value || S.start;
    save(); alert("اتحفظ ✅");
  });
}

function backupView() {
  $view.innerHTML = `
    <div class="card">
      <h2>💾 نسخة احتياطية</h2>
      <p class="muted">تقدمك محفوظ في المتصفح ده بس. خد نسخة كل أسبوع عشان لو المتصفح اتمسح، وتقدر كمان تنقل بيها تقدمك من الكمبيوتر للموبايل.</p>
      <button class="btn" id="exp">⬇️ تنزيل نسخة</button>
      <label class="btn alt">⬆️ استرجاع نسخة<input id="imp" type="file" accept=".json" hidden /></label>
    </div>`;
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
      save(); alert("اترجعت ✅"); refreshStats(); render();
    } catch { alert("الملف ده مش صالح"); }
  };
}

function teachersView() {
  $view.innerHTML = `
    <div class="card">
      <h2>👨‍🏫 المدرسين المرشحين على يوتيوب</h2>
      <ul class="tasks">${TEACHERS.map((t) => `<li><a href="${t.url}" target="_blank" rel="noopener">${esc(t.name)}</a> <span class="muted">(${t.levels.join("، ")})</span></li>`).join("")}</ul>
      <h3>🎧 محتوى ألماني أصلي للاستماع</h3>
      <ul class="tasks">${[...new Map(Object.values(LISTENING).flat().map((x) => [x.url + x.name, x])).values()].map((x) => `<li><a href="${x.url}" target="_blank" rel="noopener">${esc(x.name)}</a></li>`).join("")}</ul>
    </div>`;
}

// مهام اليوم حسب نوعه
function dayTasks(d, v) {
  const lvl = d.level.id;
  const tutorBtn = (mode, label) => `<div style="margin-top:8px"><b>${label}</b><br>
    <button class="btn" data-handoff="claude" data-mode="${mode}">🟠 في Claude</button><button class="btn" data-handoff="chatgpt" data-mode="${mode}">🟢 في ChatGPT</button>${S.settings.apiKey ? `<a class="btn alt" href="#/tutor/${mode}">🤖 هنا في التطبيق</a>` : ""}</div>`;
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

function addWeekVocab(d) {
  const seed = SEED_VOCAB[d.week];
  const words = seed ? seed.map(([de, ar, ex]) => ({ de, ar, ex })) : null;
  const added = !!S.vocabWeeks[d.week];
  if (words) {
    $view.innerHTML = `<div class="card"><h2>➕ كلمات أسبوع ${d.week}: ${esc(d.topic.v)}</h2>
      <p class="muted">${words.length} كلمة جاهزة ${added ? "(متضافة عندك بالفعل)" : ""}</p>
      <table class="words">${words.map((w) => `<tr><td dir="ltr" class="${genderClass(w.de)}"><b>${esc(w.de)}</b></td><td>${esc(w.ar)}</td></tr>`).join("")}</table>
      <button class="btn ok" id="addSeed">➕ ضيفهم للبطاقات</button></div>`;
    on("#addSeed", () => {
      const n = addCards(words);
      S.vocabWeeks[d.week] = true; save();
      alert(n ? `اتضاف ${n} كلمة ✅` : "الكلمات دي موجودة عندك بالفعل");
      location.hash = "#/cards/review";
    });
    return;
  }
  vocabViaSubscription(d);
}

// من غير API: Claude/ChatGPT يكتب الكلمات بصيغة سطور، وإنت تلزقها هنا. ومع API بيتولّدوا أوتوماتيك
function vocabViaSubscription(d) {
  const prompt = `اعمل 15 كلمة ألماني أساسية لطالب مستوى ${d.level.id} في موضوع "${d.topic.v}" ومرتبطة بقاعدة "${d.topic.g}".
اكتب كل كلمة في سطر لوحدها بالشكل ده بالظبط ومن غير أي كلام تاني ولا ترقيم:
الكلمة بأداتها | المعنى بالمصري | جملة مثال ألماني | حيلة حفظ مضحكة بالمصري`;
  $view.innerHTML = `<div class="card">
    <h2>➕ كلمات أسبوع ${d.week}: ${esc(d.topic.v)}</h2>
    <ol class="tasks"><li>دوس على Claude أو ChatGPT، هيكتبلك الكلمات</li><li>انسخ الرد كله والصقه هنا</li></ol>
    <button class="btn" id="vc">🟠 Claude</button><button class="btn" id="vg">🟢 ChatGPT</button>
    ${S.settings.apiKey ? `<button class="btn acc" id="vapi">🤖 ولّدهم أوتوماتيك (API)</button>` : ""}
    <textarea id="paste" class="box-text" style="direction:ltr" placeholder="die Wohnung | الشقة | Die Wohnung ist groß. | ..."></textarea>
    <button class="btn ok" id="imp">➕ ضيف للبطاقات</button>
  </div>`;
  on("#vc", () => openIn("claude", prompt));
  on("#vg", () => openIn("chatgpt", prompt));
  on("#vapi", async (e) => {
    e.target.disabled = true; e.target.textContent = "⏳ أستاذ هانز بيجهّز الكلمات...";
    try {
      const words = await generateVocab({ apiKey: S.settings.apiKey, model: S.settings.model, day: d, exclude: Object.keys(S.cards).slice(-150) });
      const n = addCards(words);
      S.vocabWeeks[d.week] = true; save();
      alert(`اتضاف ${n} كلمة جديدة ✅`);
      location.hash = "#/cards/review";
    } catch (err) {
      alert("حصلت مشكلة: " + err.message);
      e.target.disabled = false; e.target.textContent = "🤖 ولّدهم أوتوماتيك (API)";
    }
  });
  on("#imp", () => {
    const words = document.getElementById("paste").value.split("\n")
      .map((l) => l.replace(/^[\s\-*\d.)]+/, "").split("|").map((x) => x.trim()))
      .filter((p) => p.length >= 2 && p[0] && p[1])
      .map(([de, ar, ex, tip]) => ({ de, ar, ex, tip }));
    if (!words.length) return alert("مالقيتش كلمات. اتأكد إن كل سطر فيه | بين الأجزاء");
    const n = addCards(words);
    S.vocabWeeks[d.week] = true; save();
    alert(`اتضاف ${n} كلمة ✅`);
    location.hash = "#/cards/review";
  });
}

function shadowing() {
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

async function send(d, mode, key, text) {
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
      apiKey: S.settings.apiKey, model: S.settings.model, day: d, mode, history: hist,
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
  location.hash = `#/today/${currentDay()}`;
}

// ---------- التنقل: #/app/section (زرار الرجوع في الموبايل بيشتغل) ----------
let route = { app: null, section: null };
function parseRoute() {
  const [, app, section] = location.hash.replace(/^#/, "").split("/");
  return APPS[app] ? { app, section: section || APPS[app].defaultSection() } : { app: null, section: null };
}
function render() {
  route = parseRoute();
  const app = APPS[route.app];
  document.body.classList.toggle("in-app", !!app);
  document.body.classList.remove("side-open");
  document.getElementById("title").innerHTML = app ? appTitle(route.app) : `<img class="brand-logo" src="icon.svg" alt="" />Deutsch 365`;
  if (!app) { $side.innerHTML = ""; homeView(); }
  else { app.view(route.section); cleanHeadings(); renderSide(app, route.section); }
  window.scrollTo(0, 0);
}
function on(sel, fn) { const el = $view.querySelector(sel); if (el) el.onclick = fn; }
function bindCommon(dayNum) {
  $view.querySelectorAll("[data-handoff]").forEach((b) => b.onclick = () => {
    openIn(b.dataset.handoff, handoffPrompt(getDay(dayNum), b.dataset.mode));
    addXP(5);
  });
}
document.getElementById("menu").innerHTML = icon("menu", 20);
document.getElementById("home").innerHTML = icon("home", 20);
document.getElementById("gear").innerHTML = icon("settings", 20);
document.getElementById("streakBox").insertAdjacentHTML("afterbegin", icon("flame", 16));
document.getElementById("xpBox").insertAdjacentHTML("afterbegin", icon("star", 16));
document.getElementById("home").onclick = () => { location.hash = "#/"; };
document.getElementById("menu").onclick = () => document.body.classList.toggle("side-open");
document.getElementById("scrim").onclick = () => document.body.classList.remove("side-open");
window.addEventListener("hashchange", render);

if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
refreshStats();
render();
