/* =============================================================================
   Thesis Survey — app logic
   - One question per card (Tinder-style swipe between cards)
   - Evaluation section = two cards: persistent conversation + current question
   - Bilingual EN/TR (answers stored by option INDEX, so language is decoupled)
   - Validation, branching (consent end / Q4 skip), random A/B scenario
   - Auto-advance after answering single-answer questions
   - SEND shows an "are you sure?" confirmation, then POSTs to Google Apps Script
   No personal data is collected.
   ========================================================================== */

/* ----------------------------------------------------------------- CONFIG */
const SHEETS_ENDPOINT = "";   // paste your Apps Script /exec URL when ready
const AUTO_ADVANCE = true;    // auto-move to next card after a single-tap answer

/* --------------------------------------------------------------- STATE */
const answers = {};           // index (single/multiple/binary) or value (likert/matrix)
const scenarioVersion = Math.random() < 0.5 ? "A" : "B";
let lang = localStorage.getItem("survey_lang") || "tr";
let screens = [];
let stepIndex = 0;
let ended = false;
let animating = false;
let enterDir = 1;
let submitState = "idle";
let renderToken = 0;          // invalidates in-flight typing when the screen changes
let scenarioRevealed = false; // type the conversation once, then show it instantly

/* ----------------------------------------------------------------- HELPERS */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const t = (obj) => (obj && obj[lang] != null ? obj[lang] : obj && obj.en) || "";
const scaleLabels = (name) => SURVEY.scales[name][lang] || SURVEY.scales[name].en;
const AUTO_TYPES = ["binary", "single", "multiple", "likert"];

/* ----------------------------------------------------- FLOW (one Q / card) */
function computeSkipped() {
  const skipped = new Set();
  SURVEY.sections.forEach((s) => (s.questions || []).forEach((q) => {
    if (q.skipIfFirst && answers[q.id] === 0) q.skipIfFirst.forEach((id) => skipped.add(id));
  }));
  return skipped;
}

function buildScreens() {
  const skipped = computeSkipped();
  const out = [];
  SURVEY.sections.forEach((s) => {
    if (s.type === "questions") {
      if (s.group) {
        out.push({ kind: "group", s });               // all questions on one card
      } else {
        s.questions.forEach((q) => { if (!skipped.has(q.id)) out.push({ kind: "question", s, q }); });
      }
    } else if (s.type === "scenario") {
      /* no standalone screen — the conversation types out inside the evaluation dual card */
    } else {
      out.push({ kind: s.type, s }); // intro | thanks
    }
  });
  return out;
}

/* ----------------------------------------------------------------- RENDER */
function render() {
  renderToken++;                // cancel any in-flight typewriter from a previous screen
  const root = $("#screen");
  root.innerHTML = "";
  root.classList.remove("screen--wide");
  $("#appTitle").textContent = t(SURVEY.title);
  $("#langTR").classList.toggle("active", lang === "tr");
  $("#langEN").classList.toggle("active", lang === "en");

  if (ended) { renderEnded(root); updateFooter(null); return; }

  screens = buildScreens();
  if (stepIndex > screens.length - 1) stepIndex = screens.length - 1;
  const screen = screens[stepIndex];
  const isDual = screen.kind === "question" && screen.s.withScenario;

  if (isDual) renderDual(root, screen);
  else        renderSingle(root, screen);

  // entering swipe animation on the swipe-anim element
  const anim = $(".swipe-anim", root);
  if (anim) {
    anim.classList.add(enterDir >= 0 ? "is-enter-right" : "is-enter-left");
    requestAnimationFrame(() => requestAnimationFrame(() =>
      anim.classList.remove("is-enter-right", "is-enter-left")));
  }

  updateFooter(screen);
  // Note: we intentionally do NOT scroll to top — keep the user where they were.
}

function newCard(color) {
  const card = el("section", "card");
  if (color) card.style.background = color;
  return card;
}

function renderSingle(root, screen) {
  const card = newCard(screen.s.card);
  card.classList.add("swipe-anim");
  const body = el("div", "card__body");

  if (screen.kind === "intro")       renderIntro(body, screen.s);
  else if (screen.kind === "thanks") renderThanks(body, screen.s);
  else if (screen.kind === "group")  renderGroup(body, screen.s);
  else                               renderQuestion(body, screen.s, screen.q);

  card.appendChild(body);
  if (screen.kind === "thanks") card.classList.add("card--center"); // centre text, no nav
  else card.appendChild(buildNav(screen));
  root.appendChild(card);
}

function renderDual(root, screen) {
  root.classList.add("screen--wide");
  const scen = SURVEY.sections.find((s) => s.id === screen.s.withScenario);

  const dual = el("div", "dual");

  // left: the conversation (types out the first time it's seen, instant afterwards)
  const chat = newCard(scen.card);
  const chatBody = el("div", "card__body");
  renderScenario(chatBody, scen, !scenarioRevealed);
  chat.appendChild(chatBody);
  dual.appendChild(chat);

  // right: the current question (this one swipes)
  const qCard = newCard(screen.s.card);
  qCard.classList.add("swipe-anim", "dual__q");
  const qBody = el("div", "card__body");
  renderQuestion(qBody, screen.s, screen.q);
  qCard.appendChild(qBody);
  qCard.appendChild(buildNav(screen));
  dual.appendChild(qCard);

  root.appendChild(dual);
}

function renderIntro(body, s) {
  body.appendChild(el("h2", "section-title", esc(t(s.title))));
  const wrap = el("div", "intro-body");
  s.body.forEach((p) => wrap.appendChild(el("p", null, esc(t(p)))));
  body.appendChild(wrap);
}

function renderThanks(body, s) {
  const wrap = el("div", "centered-card");
  wrap.appendChild(el("h2", "centered-card__title", esc(t(s.title))));
  wrap.appendChild(el("p", "centered-card__body", esc(t(s.body))));
  const status = el("p", "thanks__status " + statusClass(), statusText());
  status.id = "submitStatus";
  wrap.appendChild(status);
  body.appendChild(wrap);
}

function statusText() {
  if (submitState === "sending") return t(SURVEY.ui.sending);
  if (submitState === "ok") return t(SURVEY.ui.ok);
  if (submitState === "err") return t(SURVEY.ui.err);
  return "";
}
function statusClass() { return submitState === "ok" ? "ok" : submitState === "err" ? "err" : ""; }

function buildQuestionBlock(q) {
  const qWrap = el("div", "q");
  qWrap.dataset.qid = q.id;
  qWrap.appendChild(el("p", "q__text", `<span class="q__num">${esc(q.id)}.</span>${esc(t(q.text))}`));
  if (q.type === "binary")      qWrap.appendChild(buildBinary(q));
  else if (q.type === "likert") qWrap.appendChild(buildLikert(q));
  else if (q.type === "matrix") qWrap.appendChild(buildMatrix(q));
  else                          qWrap.appendChild(buildOptions(q));
  return qWrap;
}

function renderQuestion(body, s, q) {
  body.appendChild(el("p", "section-eyebrow", esc(t(s.section))));
  body.appendChild(el("h2", "section-title", esc(t(s.title))));
  body.appendChild(buildQuestionBlock(q));
}

// all of a section's questions on one card (e.g. consent)
function renderGroup(body, s) {
  body.appendChild(el("p", "section-eyebrow", esc(t(s.section))));
  body.appendChild(el("h2", "section-title", esc(t(s.title))));
  s.questions.forEach((q) => body.appendChild(buildQuestionBlock(q)));
}

function buildBinary(q) {
  const labels = lang === "tr" ? ["Evet", "Hayır"] : ["Yes", "No"];
  const box = el("div", "binary");
  labels.forEach((label, i) => {
    const b = el("button", "pill " + (i === 0 ? "is-yes" : "is-no"), esc(label));
    b.type = "button";
    if (answers[q.id] === i) b.classList.add("selected");
    b.addEventListener("click", () => {
      answers[q.id] = i;
      box.querySelectorAll(".pill").forEach((p, pi) => p.classList.toggle("selected", pi === i));
      clearInvalid(q.id);
      onAnswered(q);
    });
    box.appendChild(b);
  });
  return box;
}

function buildOptions(q) {
  const isChips = q.type === "single" && q.options.every((o) => t(o).length <= 22);
  const box = el("div", "options" + (isChips ? " options--chips" : ""));
  q.options.forEach((opt, i) => {
    const lab = el("label", "opt");
    const input = el("input");
    input.type = "radio"; input.name = q.id; input.checked = answers[q.id] === i;
    input.addEventListener("change", () => { answers[q.id] = i; clearInvalid(q.id); onAnswered(q); });
    lab.appendChild(input);
    lab.appendChild(el("span", "opt__dot"));
    lab.appendChild(el("span", "opt__label", esc(t(opt))));
    box.appendChild(lab);
  });
  return box;
}

function buildLikert(q) {
  const labels = scaleLabels(q.scale);
  const box = el("div", "likert");
  labels.forEach((label, i) => {
    const value = i + 1;
    const lab = el("label", "opt");
    const input = el("input");
    input.type = "radio"; input.name = q.id; input.checked = answers[q.id] === value;
    input.addEventListener("change", () => { answers[q.id] = value; clearInvalid(q.id); onAnswered(q); });
    lab.appendChild(input);
    lab.appendChild(el("span", "opt__dot"));
    lab.appendChild(el("span", "opt__label", `${value}. ${esc(label)}`));
    box.appendChild(lab);
  });
  return box;
}

function buildMatrix(q) {
  const labels = scaleLabels(q.scale);
  if (!answers[q.id]) answers[q.id] = {};
  const box = el("div", "matrix");

  const anchors = el("div", "matrix__anchors");
  anchors.appendChild(el("span", null, esc(labels[0])));
  anchors.appendChild(el("span", null, esc(labels[labels.length - 1])));
  box.appendChild(anchors);

  q.rows.forEach((rowLabel, r) => {
    const row = el("div", "matrix__row");
    row.appendChild(el("div", "matrix__label", esc(t(rowLabel))));
    const scale = el("div", "matrix__scale");
    for (let v = 1; v <= 7; v++) {
      const cell = el("label", "matrix__cell");
      cell.title = labels[v - 1];
      const input = el("input");
      input.type = "radio"; input.name = `${q.id}_r${r}`; input.checked = answers[q.id][`row${r}`] === v;
      input.addEventListener("change", () => { answers[q.id][`row${r}`] = v; clearInvalid(q.id); });
      cell.appendChild(input);
      cell.appendChild(el("span", "opt__dot"));
      cell.appendChild(el("span", "matrix__num", String(v)));
      scale.appendChild(cell);
    }
    row.appendChild(scale);
    box.appendChild(row);
  });
  return box;
}

function scenarioLines(s) { return s.dialogue.concat(s.versions[scenarioVersion]); }

// one chat bubble with an inline "CHATBOT:" / "YOU:" label and a typeable text span
function makeBubble(line, text) {
  const b = el("div", `bubble ${line.who}`);
  b.appendChild(el("span", "who", (line.who === "bot" ? t(SURVEY.ui.chatbot) : t(SURVEY.ui.you)) + ":"));
  b.appendChild(document.createTextNode(" "));
  const span = el("span", "bubble__text");
  span.textContent = text;
  b.appendChild(span);
  return b;
}

// instant render — used in the evaluation dual layout (conversation already seen)
// conversation card. `animate` types it out the first time; instant afterwards.
function renderScenario(body, s, animate) {
  body.appendChild(el("h2", "section-title", esc(t(s.title))));
  body.appendChild(el("p", "scenario__intro", esc(t(s.intro))));
  const chat = el("div", "chat");
  body.appendChild(chat);

  const lines = scenarioLines(s);
  if (animate && !scenarioRevealed) {
    typeScenario(chat, lines, renderToken);
  } else {
    lines.forEach((line) => chat.appendChild(makeBubble(line, t(line.text))));
  }
}

function typeScenario(chat, lines, token) {
  let i = 0;
  (function nextLine() {
    if (token !== renderToken) return;                 // user navigated away
    if (i >= lines.length) {
      scenarioRevealed = true;                          // seen once → show instantly next time
      return;
    }
    const line = lines[i++];
    const bubble = makeBubble(line, "");
    chat.appendChild(bubble);
    const span = bubble.querySelector(".bubble__text");
    span.classList.add("is-typing");
    typeText(span, t(line.text), token, () => {
      span.classList.remove("is-typing");
      setTimeout(nextLine, 240);                         // brief pause between bubbles
    });
  })();
}

function typeText(node, full, token, done) {
  let n = 0;
  (function step() {
    if (token !== renderToken) return;
    node.textContent = full.slice(0, n);
    if (n < full.length) { n++; setTimeout(step, 12); }  // ~12ms/char — brisk
    else done();
  })();
}

/* ----------------------------------------------------------------- NAV */
function buildNav(screen) {
  const nav = el("div", "nav");
  const back = el("button", "btn btn--back", esc(t(SURVEY.ui.back)));
  back.type = "button";
  if (stepIndex === 0 || screen.kind === "thanks") back.classList.add("btn--ghost");
  back.addEventListener("click", goBack);
  nav.appendChild(back);

  if (screen.kind !== "thanks") {
    const next = screens[stepIndex + 1];
    const isSend = next && next.kind === "thanks";
    const btn = el("button", "btn btn--next", esc(t(isSend ? SURVEY.ui.send : SURVEY.ui.next)));
    btn.type = "button";
    btn.addEventListener("click", goNext);
    nav.appendChild(btn);
  } else {
    nav.appendChild(el("span", "btn btn--ghost", ""));
  }
  return nav;
}

function onAnswered(q) {
  if (!AUTO_ADVANCE) return;
  const cur = screens[stepIndex];
  if (cur && cur.kind === "group") {
    // advance once every question on the card has an answer
    if (cur.s.questions.every((qq) => isAnswered(qq))) {
      setTimeout(() => { if (!animating) goNext(); }, 450);
    }
    return;
  }
  if (!AUTO_TYPES.includes(q.type)) return;
  const next = buildScreens()[stepIndex + 1];
  const endsHere = q.type === "binary" && q.endIfNo && answers[q.id] === 1;
  if (!endsHere && (!next || next.kind === "thanks")) return; // don't auto-submit
  setTimeout(() => { if (!animating) goNext(); }, 420);
}

function goBack() {
  if (animating || stepIndex === 0) return;
  changeStep(-1, {});
}

function goNext() {
  if (animating) return;
  const screen = screens[stepIndex];

  if (screen.kind === "question") {
    if (!isAnswered(screen.q)) { flagMissing(screen.q.id); return; }
    if (screen.q.type === "binary" && screen.q.endIfNo && answers[screen.q.id] === 1) {
      changeStep(1, { end: true });
      return;
    }
  } else if (screen.kind === "group") {
    const missing = screen.s.questions.filter((q) => !isAnswered(q)).map((q) => q.id);
    if (missing.length) { flagMissing(missing); return; }
    for (const q of screen.s.questions) {
      if (q.type === "binary" && q.endIfNo && answers[q.id] === 1) { changeStep(1, { end: true }); return; }
    }
  }

  screens = buildScreens();
  const next = screens[stepIndex + 1];
  if (!next) return;
  if (next.kind === "thanks") { confirmSend(); return; }  // "are you sure?"
  changeStep(1, {});
}

function changeStep(delta, opts) {
  animating = true;
  enterDir = delta;
  const anim = $(".swipe-anim");
  if (anim) anim.classList.add(delta > 0 ? "is-exit-left" : "is-exit-right");
  setTimeout(() => {
    if (opts.end) ended = true; else stepIndex += delta;
    render();
    animating = false;
    if (opts.submit) submit();
  }, 280);
}

/* --------------------------------------------------------- CONFIRM MODAL */
function confirmSend() {
  const overlay = el("div", "modal");
  const card = el("div", "modal__card");
  card.appendChild(el("h2", "modal__title", esc(t(SURVEY.ui.confirmTitle))));
  card.appendChild(el("p", "modal__body", esc(t(SURVEY.ui.confirmBody))));
  const row = el("div", "modal__actions");

  const no = el("button", "btn btn--back", esc(t(SURVEY.ui.confirmNo)));
  no.type = "button";
  no.addEventListener("click", () => overlay.remove());

  const yes = el("button", "btn btn--next", esc(t(SURVEY.ui.confirmYes)));
  yes.type = "button";
  yes.addEventListener("click", () => { overlay.remove(); changeStep(1, { submit: true }); });

  row.appendChild(no); row.appendChild(yes);
  card.appendChild(row);
  overlay.appendChild(card);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

/* ----------------------------------------------------------- VALIDATION */
function isAnswered(q) {
  if (q.type === "matrix") {
    const a = answers[q.id] || {};
    return q.rows.every((_, r) => a[`row${r}`] != null);
  }
  return answers[q.id] != null;
}
function flagMissing(ids) {
  ids = Array.isArray(ids) ? ids : [ids];
  let first = null;
  ids.forEach((id) => {
    const node = document.querySelector(`.q[data-qid="${id}"]`);
    if (node) { node.classList.add("q--invalid"); if (!first) first = node; }
  });
  if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
}
function clearInvalid(id) {
  const node = document.querySelector(`.q[data-qid="${id}"]`);
  if (node) node.classList.remove("q--invalid");
}

/* ----------------------------------------------------------------- FOOTER */
function updateFooter(screen) {
  const p = screen ? (screen.s.progress || 0) : 0;
  const frac = !ended && screens.length > 1 ? stepIndex / (screens.length - 1) : 0;
  $("#progressFill").style.width = `${Math.max(frac * 100, ended ? 0 : 2)}%`;
  $("#progressLabel").textContent = `${t(SURVEY.ui.progress)} ${p}/5`;
  $("#author").textContent = t(SURVEY.ui.author);
}

/* ----------------------------------------------------------------- ENDED */
function renderEnded(root) {
  const card = newCard("#fff5f5");
  card.classList.add("swipe-anim", "card--center");
  const body = el("div", "card__body");
  const wrap = el("div", "centered-card");
  wrap.appendChild(el("h2", "centered-card__title", esc(t(SURVEY.ui.endedTitle))));
  wrap.appendChild(el("p", "centered-card__body", esc(t(SURVEY.ui.endedBody))));
  body.appendChild(wrap);
  card.appendChild(body);
  root.appendChild(card);
}

/* ----------------------------------------------------------------- LANG */
function setLang(next) {
  if (next === lang) return;
  lang = next;
  localStorage.setItem("survey_lang", lang);
  render();
}

/* ----------------------------------------------------------------- SUBMIT */
function buildPayload() {
  const out = {};
  SURVEY.sections.forEach((s) => (s.questions || []).forEach((q) => {
    const a = answers[q.id];
    if (a == null) return;
    if (q.type === "binary") out[q.id] = a === 0 ? "Yes" : "No";
    else if (q.type === "single" || q.type === "multiple") out[q.id] = q.options[a].en;
    else out[q.id] = a; // likert (1..7) | matrix ({row0:..})
  }));
  return { submittedAt: new Date().toISOString(), scenarioVersion, language: lang, answers: out };
}

function setStatus(state) {
  submitState = state;
  const node = document.getElementById("submitStatus");
  if (node) { node.textContent = statusText(); node.className = "thanks__status " + statusClass(); }
}

async function submit() {
  const payload = buildPayload();
  if (!SHEETS_ENDPOINT) {
    console.log("[survey] No SHEETS_ENDPOINT set — payload would be:", payload);
    setStatus("ok");
    return;
  }
  setStatus("sending");
  try {
    await fetch(SHEETS_ENDPOINT, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    setStatus("ok");
  } catch (e) {
    console.error("[survey] submit failed", e);
    setStatus("err");
  }
}

/* ----------------------------------------------------------------- INIT */
function init() {
  $("#langTR").addEventListener("click", () => setLang("tr"));
  $("#langEN").addEventListener("click", () => setLang("en"));
  screens = buildScreens();
  const pv = new URLSearchParams(location.search).get("preview");
  if (pv != null && screens[+pv]) stepIndex = +pv;
  render();
}
init();
