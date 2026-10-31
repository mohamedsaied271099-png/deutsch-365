// منهج 365 يوم: من الصفر إلى B2
// 52 أسبوع × 7 أيام = 364 يوم + اليوم 365 امتحان B2 تجريبي كامل

export const LEVELS = [
  { id: "A1", from: 1, to: 12, color: "#16a34a", goal: "تفهم وتستخدم جمل يومية بسيطة، تعرّف نفسك وتسأل أسئلة أساسية" },
  { id: "A2", from: 13, to: 24, color: "#0891b2", goal: "تتكلم عن ماضيك وروتينك واحتياجاتك المباشرة في مواقف مألوفة" },
  { id: "B1", from: 25, to: 38, color: "#7c3aed", goal: "تتصرف في معظم مواقف السفر والشغل، وتكتب نص مترابط عن مواضيع مألوفة" },
  { id: "B2", from: 39, to: 52, color: "#dc2626", goal: "تتناقش بطلاقة وتفهم نصوص معقدة وتكتب نص مفصّل بحجج واضحة" },
];

// مدرسين عرب (معظمهم مصريين) — اتأكد من القناة بنفسك قبل الاشتراك
export const TEACHERS = [
  { name: "مستر محمد شحاته — Shehata Deutsch", url: "https://www.youtube.com/c/MohammadShehata-Official", levels: ["A1", "A2"], key: "مستر شحاته" },
  { name: "ضياء عبدالله — Deiaa Abdullah", url: "https://www.youtube.com/c/DeiaaAbdullah", levels: ["A1", "A2", "B1"], key: "Deiaa Abdullah" },
  { name: "Deutsch mit Hend — هند", url: "https://www.youtube.com/channel/UCH-MsRLul2X6tG0uCtQnPIw", levels: ["A1", "A2", "B1"], key: "Deutsch mit Hend" },
  { name: "حمزة نبيل — Hamza Nabeel", url: "https://www.youtube.com/channel/UCbxP6U9-CKyEOvryfqaMogA", levels: ["B1", "B2"], key: "Hamza Nabeel" },
  { name: "الألمانية فرصة — Deutsch ist eine Chance", url: "https://www.youtube.com/channel/UCZUlpJpOMU5fTAe9_LCutYQ", levels: ["A1", "A2", "B1", "B2"], key: "الألمانية فرصة" },
];

// محتوى ألماني أصلي للاستماع (من غير ترجمة عربي)
export const LISTENING = {
  A1: [{ name: "Nicos Weg A1 — DW (فيه واجهة عربي)", url: "https://learngerman.dw.com/ar/nicos-weg/c-36519687" }],
  A2: [{ name: "Nicos Weg A2 — DW", url: "https://learngerman.dw.com/ar/nicos-weg/c-36519687" }, { name: "Easy German", url: "https://www.youtube.com/@EasyGerman" }],
  B1: [{ name: "Deutsch für Euch", url: "https://www.youtube.com/@DeutschFuerEuch" }, { name: "Easy German", url: "https://www.youtube.com/@EasyGerman" }, { name: "Nicos Weg B1 — DW", url: "https://learngerman.dw.com/ar/nicos-weg/c-36519687" }],
  B2: [{ name: "DW Deutsch (Langsam gesprochene Nachrichten)", url: "https://www.youtube.com/@dwdeutsch" }, { name: "Easy German (بدون ترجمة)", url: "https://www.youtube.com/@EasyGerman" }],
};

// كل أسبوع: موضوع قواعد + موضوع مفردات + كلمة بحث للفيديو + سيناريو محادثة + مهمة كتابة
export const WEEKS = [
  // ===== A1 =====
  { t: "الحروف والنطق والتحيات", g: "Alphabet, Aussprache (ä ö ü ß ei ie ch)", v: "Begrüßung", q: "الحروف الألمانية والنطق", role: "تقابل جارك الألماني أول مرة وتسلّم عليه", write: "اكتب 3 تحيات مختلفة لأوقات مختلفة من اليوم" },
  { t: "الضمائر وفعل sein والتعارف", g: "Personalpronomen, sein, heißen, kommen aus", v: "Sich vorstellen", q: "الضمائر الشخصية وفعل sein", role: "تعرّف نفسك في أول يوم في كورس اللغة", write: "اكتب 5 جمل تعرّف فيها نفسك (اسمك، بلدك، سنك، شغلك)" },
  { t: "الأرقام والساعة والأيام", g: "Zahlen 0–1000, Uhrzeit, Wochentage, Monate", v: "Zeit & Termine", q: "الأرقام والساعة بالألماني", role: "تحجز ميعاد عند الدكتور بالتليفون", write: "اكتب جدول أسبوعك: كل يوم بتعمل إيه والساعة كام" },
  { t: "الأسماء والأدوات der/die/das والجمع", g: "Genus, bestimmter/unbestimmter Artikel, Plural", v: "Wohnung & Möbel", q: "der die das وقواعد الجمع", role: "توصف شقتك لصاحبك", write: "اوصف أوضتك في 6 جمل مع الأدوات الصح" },
  { t: "تصريف الأفعال في المضارع", g: "Präsens: regelmäßige & unregelmäßige Verben (e→i, a→ä)", v: "Hobbys & Freizeit", q: "تصريف الأفعال في المضارع Präsens", role: "بتتكلم مع زميل عن هواياتكم", write: "اكتب عن 4 هوايات بتحبها وليه" },
  { t: "ترتيب الجملة والأسئلة", g: "Satzbau (Verb an Position 2), W-Fragen, Ja/Nein-Fragen", v: "Stadt & Orte", q: "ترتيب الكلمات في الجملة الألمانية W-Fragen", role: "سائح تايه بيسألك عن أماكن في المدينة", write: "اكتب 8 أسئلة تسألها لشخص جديد بتتعرف عليه" },
  { t: "حالة النصب Akkusativ وفعل haben", g: "Akkusativ (den/einen), haben, mögen", v: "Essen & Trinken", q: "الأكوزاتيف Akkusativ للمبتدئين", role: "تطلب أكل في مطعم ألماني", write: "اكتب إنت بتاكل إيه في يوم عادي (فطار، غدا، عشا)" },
  { t: "النفي nicht و kein", g: "Negation: nicht vs. kein", v: "Einkaufen & Preise", q: "النفي nicht kein الفرق", role: "بتشتري حاجات من السوبرماركت وبتسأل عن الأسعار", write: "اكتب قائمة مشتريات وحوار قصير مع البياع" },
  { t: "الأفعال المساعدة Modalverben", g: "können, müssen, wollen, dürfen, sollen, möchten", v: "Pflichten & Wünsche", q: "Modalverben الأفعال المساعدة", role: "بتتفق مع صاحبك على خروجة ويقولك مش هيقدر", write: "اكتب 6 جمل عن حاجات لازم/عايز/تقدر تعملها الأسبوع ده" },
  { t: "الأفعال المنفصلة والروتين اليومي", g: "Trennbare Verben (aufstehen, einkaufen, anrufen)", v: "Tagesablauf", q: "الأفعال المنفصلة trennbare Verben", role: "بتحكي لزميل يومك من الصبح لبالليل", write: "اوصف يومك العادي بالترتيب (8 جمل على الأقل)" },
  { t: "أدوات الملكية والعائلة", g: "Possessivartikel (mein, dein, sein, ihr...)", v: "Familie", q: "أدوات الملكية Possessivartikel", role: "بتوري صاحبك صور عيلتك وبتعرّفه عليهم", write: "اكتب عن عيلتك: مين هم وبيشتغلوا إيه" },
  { t: "مقدمة الماضي Perfekt + مراجعة A1", g: "Perfekt (Einführung) + Wiederholung A1", v: "Wochenende", q: "Perfekt الماضي التام للمبتدئين", role: "بتحكي لزميلك عملت إيه في الويك إند", write: "اكتب إيميل لصاحبك تحكيله عملت إيه آخر ويك إند" },
  // ===== A2 =====
  { t: "الماضي Perfekt بالتفصيل", g: "Perfekt mit haben/sein, Partizip II (regelmäßig/unregelmäßig)", v: "Reisen & Urlaub", q: "Perfekt haben sein تصريف Partizip", role: "رجعت من أجازة وبتحكي عنها", write: "اكتب عن آخر سفرية روحتها (10 جمل)" },
  { t: "حالة الجر Dativ", g: "Dativ (dem/der/einem), Verben mit Dativ (helfen, gefallen, gehören)", v: "Geschenke & Feste", q: "الداتيف Dativ شرح", role: "بتختار هدية عيد ميلاد لحد من عيلتك", write: "اكتب عن آخر هدية جبتها ولمين" },
  { t: "حروف الجر Akk/Dat/Wechsel", g: "Präpositionen: durch, für / mit, bei, von / in, auf, an (Wechselpräpositionen)", v: "Wegbeschreibung", q: "حروف الجر Wechselpräpositionen", role: "بتوصف لحد الطريق لبيتك", write: "اوصف الطريق من محطة المترو لبيتك" },
  { t: "Präteritum لـ sein/haben والأفعال المساعدة", g: "war, hatte, konnte, musste, wollte", v: "Kindheit", q: "Präteritum war hatte", role: "بتحكي عن طفولتك وإنت كنت صغير", write: "اكتب عن طفولتك: كنت عامل إزاي وكان لازم تعمل إيه" },
  { t: "تصريف الصفات 1", g: "Adjektivdeklination (nach bestimmtem/unbestimmtem Artikel)", v: "Kleidung & Aussehen", q: "تصريف الصفات Adjektivdeklination", role: "بتشتري هدوم من محل وبتوصف اللي عايزه", write: "اوصف شكل ولبس شخص بتحبه" },
  { t: "المقارنة والتفضيل", g: "Komparativ & Superlativ (als, wie, am ...sten)", v: "Wetter & Jahreszeiten", q: "المقارنة Komparativ Superlativ", role: "بتقارن بين الحياة في مصر وألمانيا", write: "قارن بين مدينتين تعرفهم" },
  { t: "الجمل الفرعية weil / dass / wenn", g: "Nebensätze: weil, dass, wenn (Verb am Ende)", v: "Arbeit & Beruf", q: "الجمل الفرعية weil dass", role: "مقابلة شغل بسيطة: ليه عايز الوظيفة دي", write: "اكتب ليه عايز تتعلم ألماني (استخدم weil و dass)" },
  { t: "الأفعال الانعكاسية والصحة", g: "Reflexive Verben (sich freuen, sich waschen...)", v: "Körper & Gesundheit", q: "الأفعال الانعكاسية reflexive Verben", role: "عند الدكتور بتوصف تعبك", write: "اكتب رسالة لمديرك إنك عيان ومش هتيجي" },
  { t: "صيغة الأمر والسفر", g: "Imperativ (du/ihr/Sie)", v: "Verkehr & Bahnhof", q: "صيغة الأمر Imperativ", role: "بتشتري تذكرة قطر في محطة ألمانية", write: "اكتب تعليمات لصاحبك إزاي يوصل لمكان" },
  { t: "Konjunktiv II للطلبات المهذبة", g: "würde, hätte, wäre, könnte (höfliche Bitten)", v: "Im Hotel", q: "Konjunktiv II würde hätte wäre", role: "بتشتكي بأدب في الفندق من مشكلة في الأوضة", write: "اكتب: لو معاك مليون يورو هتعمل إيه؟" },
  { t: "أفعال مع حروف جر ثابتة", g: "Verben mit Präpositionen, da-/wo-Wörter (darauf, worauf)", v: "Gefühle & Interessen", q: "Verben mit Präpositionen da wo", role: "بتتكلم عن الحاجات اللي بتستناها وبتهتم بيها", write: "اكتب عن حاجة مستنيها بفارغ الصبر (warten auf, sich freuen auf)" },
  { t: "مراجعة A2 + امتحان تجريبي", g: "Wiederholung A2, Prüfungsformat Goethe A2", v: "Prüfungswortschatz A2", q: "امتحان Goethe A2 نموذج", role: "محاكاة جزء الكلام في امتحان A2", write: "اكتب إيميل رسمي قصير (نموذج امتحان A2)" },
  // ===== B1 =====
  { t: "الماضي البسيط Präteritum كامل", g: "Präteritum aller Verben (schriftliche Vergangenheit)", v: "Geschichten & Märchen", q: "Präteritum كل الأفعال", role: "بتحكي قصة حصلت لك بأسلوب حكاية", write: "اكتب قصة قصيرة بالـ Präteritum" },
  { t: "جمل فرعية: als/wenn, obwohl, damit, um...zu", g: "Nebensätze: als vs. wenn, obwohl, damit, um ... zu", v: "Lebensziele", q: "als wenn obwohl damit um zu", role: "بتتكلم عن أهدافك وأحلامك في الحياة", write: "اكتب عن هدف كبير في حياتك وإزاي هتحققه" },
  { t: "الجمل الموصولة Relativsätze", g: "Relativsätze (der/die/das/dem/den/denen + Präposition)", v: "Menschen beschreiben", q: "الجمل الموصولة Relativsätze", role: "بتوصف لحد شخص مش عارف اسمه", write: "اوصف 5 أشخاص مهمين في حياتك بجمل موصولة" },
  { t: "حالة الإضافة Genitiv", g: "Genitiv, Präpositionen mit Genitiv (wegen, trotz, während)", v: "Umwelt", q: "الجينيتيف Genitiv wegen trotz", role: "نقاش عن مشاكل البيئة في مدينتك", write: "اكتب عن مشكلة بيئية وأسبابها" },
  { t: "تصريف الصفات كامل", g: "Adjektivdeklination komplett (ohne Artikel, alle Kasus)", v: "Wohnungssuche", q: "تصريف الصفات كل الحالات", role: "بتتصل بصاحب شقة إعلانها عاجبك", write: "اكتب إعلان لشقة للإيجار" },
  { t: "المبني للمجهول Passiv", g: "Passiv Präsens & Präteritum (wird/wurde gemacht)", v: "Technik & Prozesse", q: "المبني للمجهول Passiv", role: "بتشرح إزاي حاجة بتتصنع أو بتتعمل", write: "اشرح خطوات عمل أكلة مصرية بالـ Passiv" },
  { t: "المستقبل Futur I والعمل", g: "Futur I, Vermutungen (wird wohl...)", v: "Arbeitswelt", q: "المستقبل Futur 1", role: "بتتكلم مع زميل عن خططكم المهنية", write: "اكتب حياتك هتبقى عاملة إزاي بعد 5 سنين" },
  { t: "Plusquamperfekt و nachdem/bevor", g: "Plusquamperfekt, nachdem, bevor, während", v: "Lebenslauf-Ereignisse", q: "Plusquamperfekt nachdem", role: "بتحكي تسلسل أحداث مهمة في حياتك", write: "احكي موقف بترتيب زمني باستخدام nachdem و bevor" },
  { t: "Infinitiv mit zu والأسئلة غير المباشرة", g: "zu + Infinitiv, indirekte Fragen (ob, wann, wie...)", v: "Behörden & Ämter", q: "Infinitiv mit zu indirekte Fragen", role: "في الـ Ausländerbehörde بتسأل عن إقامتك", write: "اكتب إيميل تستفسر فيه عن ورق مطلوب" },
  { t: "Konjunktiv II في الماضي والأمنيات", g: "Konjunktiv II Vergangenheit (hätte gemacht, wäre gegangen)", v: "Entscheidungen", q: "Konjunktiv II Vergangenheit", role: "بتتكلم عن قرارات كان نفسك تاخدها بشكل مختلف", write: "اكتب: لو كنت اتعلمت ألماني من زمان كان إيه هيتغير؟" },
  { t: "الرسائل الرسمية والشكاوى", g: "Formelle Briefe, Redemittel: Beschwerde, Anfrage", v: "Kundenservice", q: "كتابة رسالة رسمية بالألماني B1", role: "بتشتكي لخدمة العملاء من منتج بايظ", write: "اكتب رسالة شكوى رسمية (نموذج امتحان B1)" },
  { t: "التعبير عن الرأي والنقاش", g: "Meinung äußern, zustimmen/widersprechen, Konnektoren (deshalb, trotzdem)", v: "Medien & Social Media", q: "التعبير عن الرأي بالألماني B1", role: "نقاش: هل السوشيال ميديا مفيدة ولا مضرة؟", write: "اكتب رأيك في موضوع Forumsbeitrag (نموذج B1)" },
  { t: "التقديم على شغل", g: "Bewerbung, Lebenslauf, Vorstellungsgespräch", v: "Bewerbung", q: "Bewerbung Lebenslauf بالألماني", role: "مقابلة شغل حقيقية بالألماني", write: "اكتب جواب تقديم (Anschreiben) لوظيفة" },
  { t: "مراجعة B1 + امتحان تجريبي", g: "Wiederholung B1, Prüfungsformat Goethe/telc B1", v: "Prüfungswortschatz B1", q: "امتحان B1 Goethe telc نموذج", role: "محاكاة جزء الكلام في امتحان B1 (gemeinsam etwas planen)", write: "حل جزء الكتابة من نموذج امتحان B1 كامل" },
  // ===== B2 =====
  { t: "Passiv مع الأفعال المساعدة وبدائل الـ Passiv", g: "Passiv mit Modalverben, Passiversatz (sich lassen, -bar, sein + zu)", v: "Wissenschaft & Forschung", q: "Passiversatz B2", role: "بتشرح تجربة علمية أو اختراع", write: "اكتب عن اختراع غيّر العالم" },
  { t: "Konjunktiv I والكلام المنقول", g: "Konjunktiv I, indirekte Rede", v: "Nachrichten & Politik", q: "Konjunktiv 1 indirekte Rede", role: "بتنقل لصاحبك خبر سمعته في الأخبار", write: "انقل حوار بين شخصين بالكلام غير المباشر" },
  { t: "أسلوب الأسماء Nominalisierung", g: "Nominalstil vs. Verbalstil", v: "Wirtschaft", q: "Nominalisierung Nominalstil", role: "بتقدم تقرير قصير في اجتماع شغل", write: "حوّل 10 جمل فعلية لأسلوب الأسماء" },
  { t: "Partizip كصفة", g: "Partizipialattribute (das lesende Kind, das gelesene Buch)", v: "Kultur & Kunst", q: "Partizip 1 Partizip 2 als Adjektiv", role: "بتتكلم عن فيلم أو كتاب أثر فيك", write: "اكتب مراجعة لفيلم أو كتاب" },
  { t: "روابط متقدمة", g: "je...desto, sowohl...als auch, weder...noch, zwar...aber, entweder...oder", v: "Bildungssystem", q: "Konnektoren B2 je desto", role: "مقارنة بين نظام التعليم في مصر وألمانيا", write: "اكتب مقارنة بين نظامين تعليم" },
  { t: "Nomen-Verb-Verbindungen", g: "Nomen-Verb-Verbindungen (in Frage kommen, zur Verfügung stehen)", v: "Büro & Kommunikation", q: "Nomen Verb Verbindungen", role: "بتتفاوض على مرتب أو مشروع", write: "اكتب إيميل شغل رسمي فيه 5 Nomen-Verb-Verbindungen" },
  { t: "Modalpartikeln والكلام الطبيعي", g: "Modalpartikeln (doch, mal, ja, eben, halt, eigentlich)", v: "Alltagssprache & Redewendungen", q: "Modalpartikeln doch mal ja", role: "دردشة عادية مع صحاب ألمان في قهوة", write: "اكتب رسالة واتساب لصاحب ألماني بأسلوب طبيعي" },
  { t: "المقال الحجاجي Erörterung", g: "Erörterung: These, Argument, Beispiel, Fazit", v: "Gesellschaft & Migration", q: "Erörterung كتابة مقال B2", role: "نقاش عن الهجرة والاندماج", write: "اكتب مقال حجاجي 250 كلمة: مميزات وعيوب العيشة في بلد تاني" },
  { t: "العرض التقديمي ووصف الرسوم", g: "Präsentation halten, Grafik beschreiben (Redemittel)", v: "Statistik & Trends", q: "Grafik beschreiben Präsentation B2", role: "بتقدم عرض 3 دقايق عن موضوع بتحبه", write: "اوصف رسم بياني عن استخدام الإنترنت" },
  { t: "فهم المسموع: الأخبار والبودكاست", g: "Hörstrategien, Notizen machen", v: "Aktuelles", q: "Hören B2 تدريب استماع", role: "بتلخص بودكاست سمعته لصاحبك", write: "لخّص خبر سمعته في 120 كلمة" },
  { t: "فهم المقروء: المقالات", g: "Lesestrategien, komplexe Satzstrukturen", v: "Presse", q: "Lesen B2 تدريب قراءة", role: "بتناقش مقال قريته", write: "اكتب رد على مقال رأي (Leserbrief)" },
  { t: "الكلام B2: النقاش والتفاوض", g: "Diskussion führen, Kompromiss finden, Redemittel B2", v: "Konflikte & Lösungen", q: "Sprechen B2 Diskussion", role: "محاكاة جزء الكلام في امتحان B2", write: "اكتب ملخص نقاش وحلول مقترحة" },
  { t: "الكتابة B2: منتدى وشكوى", g: "Forumsbeitrag, formelle Beschwerde B2", v: "Verbraucherschutz", q: "Schreiben B2 Goethe نموذج", role: "بتعرض مشكلة على مسؤول وتطلب حل", write: "حل جزء الكتابة من نموذج Goethe B2" },
  { t: "مراجعة B2 الشاملة", g: "Wiederholung B2: alle Grammatikthemen", v: "Prüfungswortschatz B2", q: "مراجعة شاملة B2", role: "محاكاة امتحان كلام B2 كامل", write: "اكتب مقال B2 عن موضوع حر" },
];

// قالب الأسبوع: كل يوم له نوع نشاط مختلف (تنويع = حفظ أفضل)
export const DAY_TYPES = [
  { id: "grammar", icon: "📘", name: "قواعد", desc: "اتفرج على الشرح بالعربي، وبعدين اطلب من المدرس الذكي يشرحلك بأمثلة من حياتك" },
  { id: "vocab", icon: "🧠", name: "مفردات", desc: "اتعلم كلمات الأسبوع بالبطاقات + حيلة حفظ مصرية لكل كلمة" },
  { id: "practice", icon: "✍️", name: "تمارين", desc: "المدرس الذكي يديك تمارين على قاعدة الأسبوع ويصححها" },
  { id: "listening", icon: "🎧", name: "استماع", desc: "اتفرج على حلقة ألماني أصلي واكتب 5 جمل فهمتها" },
  { id: "writing", icon: "📝", name: "كتابة", desc: "اكتب النص المطلوب والمدرس يصححلك ويشرح غلطاتك" },
  { id: "speaking", icon: "🗣️", name: "محادثة", desc: "تمثيل موقف حقيقي مع المدرس الذكي بالصوت + تكرار النطق (Shadowing)" },
  { id: "review", icon: "🏆", name: "مراجعة واختبار", desc: "اختبار الأسبوع + مراجعة البطاقات المتأخرة" },
];

export function levelOfWeek(w) {
  return LEVELS.find((l) => w >= l.from && w <= l.to);
}

export function getDay(dayNum) {
  if (dayNum === 365) {
    return {
      day: 365, week: 52, level: LEVELS[3], type: { id: "exam", icon: "🎓", name: "الامتحان النهائي", desc: "امتحان B2 تجريبي كامل: قراءة، استماع، كتابة، كلام" },
      topic: { t: "امتحان B2 النهائي", g: "Modellprüfung Goethe-Zertifikat B2", v: "Alles", q: "Goethe B2 Modellprüfung", role: "امتحان كلام B2 كامل", write: "مقال B2 + رسالة رسمية" },
    };
  }
  const week = Math.ceil(dayNum / 7);
  const dow = (dayNum - 1) % 7;
  return { day: dayNum, week, level: levelOfWeek(week), type: DAY_TYPES[dow], topic: WEEKS[week - 1] };
}

export function videoSearchUrl(day) {
  const lvl = day.level.id;
  const teacher = TEACHERS.find((t) => t.levels.includes(lvl)) || TEACHERS[0];
  const q = `${day.topic.q} ${lvl} ألماني`;
  return { teacher, url: "https://www.youtube.com/results?search_query=" + encodeURIComponent(q), alt: TEACHERS.filter((t) => t.levels.includes(lvl)) };
}

// كلمات جاهزة لأسابيع A1 (تشتغل من غير إنترنت). باقي الأسابيع المدرس الذكي يولّدها.
// [ألماني، عربي، مثال]
export const SEED_VOCAB = {
  1: [["Hallo", "أهلاً", "Hallo, wie geht's?"], ["Guten Morgen", "صباح الخير", "Guten Morgen, Frau Müller!"], ["Guten Tag", "نهارك سعيد", "Guten Tag, Herr Schmidt."], ["Guten Abend", "مساء الخير", "Guten Abend zusammen!"], ["Gute Nacht", "تصبح على خير", "Gute Nacht und schlaf gut!"], ["Tschüss", "باي", "Tschüss, bis morgen!"], ["Auf Wiedersehen", "مع السلامة (رسمي)", "Auf Wiedersehen, Herr Doktor."], ["Danke", "شكراً", "Danke schön!"], ["Bitte", "من فضلك / العفو", "Ein Wasser, bitte."], ["Entschuldigung", "لو سمحت / آسف", "Entschuldigung, wo ist der Bahnhof?"]],
  2: [["ich heiße", "اسمي", "Ich heiße Ahmed."], ["ich komme aus", "أنا من", "Ich komme aus Ägypten."], ["ich wohne in", "أنا ساكن في", "Ich wohne in Kairo."], ["ich bin", "أنا (أكون)", "Ich bin 25 Jahre alt."], ["der Name", "الاسم", "Mein Name ist Sara."], ["das Land", "البلد", "Ägypten ist ein schönes Land."], ["die Sprache", "اللغة", "Ich lerne die deutsche Sprache."], ["der Beruf", "المهنة", "Was ist dein Beruf?"], ["sprechen", "يتكلم", "Ich spreche Arabisch."], ["lernen", "يتعلم", "Ich lerne Deutsch."]],
  3: [["eins, zwei, drei", "واحد، اتنين، تلاتة", "Ich habe drei Brüder."], ["die Uhr", "الساعة", "Wie spät ist es? Es ist acht Uhr."], ["halb", "نص", "Es ist halb neun (8:30)."], ["Viertel", "ربع", "Es ist Viertel nach zwei."], ["der Montag", "الاتنين", "Am Montag arbeite ich."], ["das Wochenende", "الويك إند", "Am Wochenende schlafe ich lange."], ["heute", "النهارده", "Heute ist Freitag."], ["morgen", "بكرة", "Morgen habe ich frei."], ["der Termin", "الميعاد", "Ich habe einen Termin um 10 Uhr."], ["die Woche", "الأسبوع", "Die Woche hat sieben Tage."]],
  4: [["der Tisch", "الترابيزة", "Der Tisch ist groß."], ["die Lampe", "اللمبة", "Die Lampe ist neu."], ["das Bett", "السرير", "Das Bett ist bequem."], ["der Stuhl", "الكرسي", "Der Stuhl ist alt."], ["die Küche", "المطبخ", "Die Küche ist klein."], ["das Zimmer", "الأوضة", "Mein Zimmer ist hell."], ["das Fenster", "الشباك", "Das Fenster ist offen."], ["die Tür", "الباب", "Die Tür ist zu."], ["der Schrank", "الدولاب", "Der Schrank ist braun."], ["die Wohnung", "الشقة", "Die Wohnung hat drei Zimmer."]],
  5: [["spielen", "يلعب", "Ich spiele Fußball."], ["lesen (liest)", "يقرا", "Er liest ein Buch."], ["fahren (fährt)", "يسوق / يركب", "Sie fährt Fahrrad."], ["schwimmen", "يعوم", "Wir schwimmen im Sommer."], ["kochen", "يطبخ", "Ich koche gern."], ["sehen (sieht)", "يشوف", "Er sieht einen Film."], ["hören", "يسمع", "Ich höre Musik."], ["treffen (trifft)", "يقابل", "Ich treffe Freunde."], ["gern", "بحب (أعمل)", "Ich tanze gern."], ["die Freizeit", "وقت الفراغ", "In der Freizeit lese ich."]],
  6: [["der Bahnhof", "محطة القطر", "Wo ist der Bahnhof?"], ["die Apotheke", "الصيدلية", "Die Apotheke ist dort."], ["das Krankenhaus", "المستشفى", "Das Krankenhaus ist groß."], ["die Straße", "الشارع", "Die Straße ist lang."], ["der Supermarkt", "السوبرماركت", "Der Supermarkt ist neben der Bank."], ["die Bank", "البنك", "Ich gehe zur Bank."], ["wo", "فين", "Wo wohnst du?"], ["wann", "إمتى", "Wann kommst du?"], ["warum", "ليه", "Warum lernst du Deutsch?"], ["wie", "إزاي", "Wie heißt du?"]],
  7: [["das Brot", "العيش", "Ich esse Brot."], ["der Käse", "الجبنة", "Ich möchte einen Käse."], ["das Wasser", "المية", "Ein Wasser, bitte."], ["der Kaffee", "القهوة", "Ich trinke einen Kaffee."], ["der Tee", "الشاي", "Ich trinke gern Tee."], ["das Ei", "البيضة", "Ich esse ein Ei zum Frühstück."], ["das Fleisch", "اللحمة", "Ich esse kein Schweinefleisch."], ["der Apfel", "التفاحة", "Ich habe einen Apfel."], ["das Frühstück", "الفطار", "Das Frühstück ist um 8 Uhr."], ["die Rechnung", "الحساب (الفاتورة)", "Die Rechnung, bitte!"]],
  8: [["kaufen", "يشتري", "Ich kaufe Milch."], ["kosten", "يتكلف", "Was kostet das?"], ["teuer", "غالي", "Das ist zu teuer."], ["billig", "رخيص", "Die Äpfel sind billig."], ["der Euro", "اليورو", "Das kostet fünf Euro."], ["die Kasse", "الكاشير", "Bitte zahlen Sie an der Kasse."], ["die Tüte", "الشنطة البلاستيك", "Brauchen Sie eine Tüte?"], ["das Angebot", "العرض", "Das ist im Angebot."], ["bezahlen", "يدفع", "Kann ich mit Karte bezahlen?"], ["brauchen", "يحتاج", "Ich brauche keinen Zucker."]],
  9: [["können", "يقدر", "Ich kann gut schwimmen."], ["müssen", "لازم", "Ich muss heute arbeiten."], ["wollen", "عايز (بقوة)", "Ich will nach Deutschland."], ["dürfen", "مسموح له", "Hier darf man nicht rauchen."], ["sollen", "المفروض", "Du sollst mehr Wasser trinken."], ["möchten", "حابب (بأدب)", "Ich möchte einen Tee."], ["die Zeit", "الوقت", "Ich habe keine Zeit."], ["leider", "للأسف", "Leider kann ich nicht kommen."], ["vielleicht", "يمكن", "Vielleicht komme ich später."], ["die Hausaufgabe", "الواجب", "Ich muss meine Hausaufgaben machen."]],
  10: [["aufstehen", "يصحى من النوم", "Ich stehe um 7 Uhr auf."], ["einkaufen", "يتسوق", "Ich kaufe am Samstag ein."], ["anrufen", "يتصل", "Ich rufe meine Mutter an."], ["fernsehen", "يتفرج على التلفزيون", "Abends sehe ich fern."], ["anfangen", "يبدأ", "Der Kurs fängt um 9 an."], ["aufräumen", "يرتب", "Ich räume mein Zimmer auf."], ["einschlafen", "ينام (يغفل)", "Ich schlafe um 11 ein."], ["mitkommen", "ييجي معاه", "Kommst du mit?"], ["zuerst", "الأول", "Zuerst frühstücke ich."], ["danach", "بعد كده", "Danach gehe ich zur Arbeit."]],
  11: [["die Mutter", "الأم", "Meine Mutter ist Lehrerin."], ["der Vater", "الأب", "Mein Vater arbeitet viel."], ["der Bruder", "الأخ", "Mein Bruder ist jünger."], ["die Schwester", "الأخت", "Meine Schwester studiert."], ["die Eltern", "الأهل (الأب والأم)", "Meine Eltern wohnen in Alexandria."], ["der Sohn", "الابن", "Sein Sohn ist fünf."], ["die Tochter", "البنت", "Ihre Tochter heißt Mona."], ["die Großeltern", "الجد والجدة", "Meine Großeltern sind alt."], ["verheiratet", "متجوز", "Ich bin verheiratet."], ["ledig", "أعزب", "Mein Bruder ist ledig."]],
  12: [["gemacht", "عمل (ماضي)", "Was hast du gemacht?"], ["gegangen", "راح", "Ich bin ins Kino gegangen."], ["gegessen", "أكل", "Wir haben Pizza gegessen."], ["gesehen", "شاف", "Ich habe einen Film gesehen."], ["gespielt", "لعب", "Ich habe Fußball gespielt."], ["gefahren", "سافر / ركب", "Wir sind nach Berlin gefahren."], ["geschlafen", "نام", "Ich habe lange geschlafen."], ["getroffen", "قابل", "Ich habe Freunde getroffen."], ["gestern", "امبارح", "Gestern war ich müde."], ["letzte Woche", "الأسبوع اللي فات", "Letzte Woche war ich krank."]],
};
