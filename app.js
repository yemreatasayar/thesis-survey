/* =============================================================================
   Thesis Survey — app logic (revised questionnaire, 19 Qs)
   - Card-based, mobile-first (Tinder-style swipe between cards)
   - Bilingual EN/TR (answers stored by option INDEX, language is decoupled)
   - Between-subjects experiment: condition "standard" | "lossless"
     assigned 50/50 AFTER Q8, persisted (refresh never changes it)
   - Text scenario + condition-specific service process (no chatbot chat page)
   - Comprehension gate (Q9, Q10): first-attempt preserved, condition-specific
     correction, retry of wrong items, final confirmation after 2nd miss
   - After Q11 (channel choice) backward navigation to scenario/gate is locked
   - Validation, branching (consent end / Q4 skip), optional "Other" text
   - SEND shows an "are you sure?" confirmation, then POSTs to Google Apps Script
   No personal data is collected.
   ========================================================================== */

/* ----------------------------------------------------------------- CONFIG */
const SHEETS_ENDPOINT = "https://script.google.com/macros/s/AKfycbyXTnovAl66NST70RKK4fbI7x8jVB5BlI4fxY_t4g2U6UNNJ_of1S93SxEgFK75e0obIA/exec";
const SUBMIT_ENABLED = false;  // MASTER SWITCH — false = don't write to the Sheet (test mode). Flip to true to collect data.
const DEBUG_MODE = false;      // true = enable test-only URL params (?cond, ?preview) + bypass completion lock. MUST be false in production.
const AUTO_ADVANCE = true;     // auto-move to next card after a single-tap answer

/* --------------------------------------------------------------- STATE */
const answers = {};           // index (single/binary) or value (matrix); also `${id}_text` for "Other"

// Anonymous participant id (dedupe only; no PII). Stable across refreshes.
function uuid() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
const participantId = (() => {
  let id = localStorage.getItem("survey_pid");
  if (!id) { id = uuid(); localStorage.setItem("survey_pid", id); }
  return id;
})();

// Experimental condition: 50/50, persisted. ?cond=standard|lossless forces it (DEBUG only).
let condition = (() => {
  const forced = DEBUG_MODE ? (new URLSearchParams(location.search).get("cond") || "").toLowerCase() : "";
  if (forced === "standard" || forced === "lossless") {
    localStorage.setItem("survey_condition", forced);
    return forced;
  }
  return localStorage.getItem("survey_condition") || null;  // assigned after Q8
})();
function ensureCondition() {
  if (condition) return condition;
  condition = Math.random() < 0.5 ? "standard" : "lossless";
  localStorage.setItem("survey_condition", condition);
  return condition;
}

// Comprehension-gate state machine
const comp = {
  phase: "ask",          // "ask" | "correct" | "confirm"
  items: { Q9: blankComp(), Q10: blankComp() },
  correctionShown: false,
  finalConfirmRequired: false,
  finalConfirmDone: false,
  passed: false,
};
function blankComp() { return { first: null, firstCorrect: null, last: null, attempts: 0, ok: false }; }

let q12Order = null;          // display order of Q12 items (recorded), set lazily
let outcomeLocked = false;    // true after Q11 — blocks return to scenario/gate

// Initial language: ?lang=en / ?lang=tr (or the /EN/ link) wins, else saved, else TR.
function initialLang() {
  const p = (new URLSearchParams(location.search).get("lang") || "").toLowerCase();
  if (p === "en" || p === "eng") return "en";
  if (p === "tr") return "tr";
  if (/\/en\/?$/i.test(location.pathname)) return "en";
  return localStorage.getItem("survey_lang") || "tr";
}
let lang = initialLang();
let screens = [];
let stepIndex = 0;
let ended = false;
let animating = false;
let enterDir = 1;
let submitState = "idle";

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
// display number prefix: "Q12" in English, "S12" in Turkish
const qNum = (q) => (lang === "tr" ? "S" : "Q") + q.id.slice(1);
const scenarioSection = () => SURVEY.sections.find((s) => s.id === "scenario");
const sectionOf = (id) => SURVEY.sections.find((s) => s.id === id);
const otherIndexOf = (q) => (q.otherIndex != null ? q.otherIndex : q.options.length - 1);

/* ----------------------------------------------------- FLOW (cards) */
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
        out.push({ kind: "group", s, qs: s.questions });            // all questions on one card
      } else {
        s.questions.forEach((q) => { if (!skipped.has(q.id)) out.push({ kind: "question", s, q }); });
      }
    } else if (s.type === "scenario") {
      out.push({ kind: "scenario", s });
    } else if (s.type === "comprehension") {
      out.push({ kind: "comprehension", s });
    } else {
      out.push({ kind: s.type, s }); // intro | thanks
    }
  });
  return out;
}

/* ----------------------------------------------------------------- RENDER */
function render() {
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

  if (screen.kind === "scenario") {
    renderScenarioDual(root, screen);                 // two cards: text + service process
  } else {
    const card = newCard(screen.s.card);
    card.classList.add("swipe-anim");
    const body = el("div", "card__body");

    if (screen.kind === "intro")              renderIntro(body, screen.s);
    else if (screen.kind === "thanks")        renderThanks(body, screen.s);
    else if (screen.kind === "comprehension") renderComprehension(body, screen.s);
    else if (screen.kind === "group")         renderQuestionList(body, screen.s, screen.qs);
    else                                      renderQuestion(body, screen.s, screen.q);

    card.appendChild(body);
    if (screen.kind === "thanks") card.classList.add("card--center"); // centre text, no nav
    else card.appendChild(buildNav(screen));
    root.appendChild(card);
  }

  // entering swipe animation (whichever element carries .swipe-anim)
  const anim = root.querySelector(".swipe-anim");
  if (anim) {
    anim.classList.add(enterDir >= 0 ? "is-enter-right" : "is-enter-left");
    requestAnimationFrame(() => requestAnimationFrame(() =>
      anim.classList.remove("is-enter-right", "is-enter-left")));
  }

  updateFooter(screen);
}

function newCard(color) {
  const card = el("section", "card");
  if (color) card.style.background = color;
  return card;
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

/* ------------------------------------------------------- QUESTION BLOCKS */
function buildQuestionBlock(q) {
  const qWrap = el("div", "q");
  qWrap.dataset.qid = q.id;
  qWrap.appendChild(el("p", "q__text", `<span class="q__num">${esc(qNum(q))}.</span>${esc(t(q.text))}`));
  if (q.type === "binary")      qWrap.appendChild(buildBinary(q));
  else if (q.type === "matrix") qWrap.appendChild(buildMatrix(q));
  else                          qWrap.appendChild(buildOptions(q));
  return qWrap;
}

function renderQuestion(body, s, q) {
  body.appendChild(el("p", "section-eyebrow", esc(t(s.section))));
  body.appendChild(el("h2", "section-title", esc(t(s.title))));
  body.appendChild(buildQuestionBlock(q));
}

function renderQuestionList(body, s, qs) {
  body.appendChild(el("p", "section-eyebrow", esc(t(s.section))));
  body.appendChild(el("h2", "section-title", esc(t(s.title))));
  qs.forEach((q) => body.appendChild(buildQuestionBlock(q)));
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
  const isChips = q.type === "single" && !q.otherText && q.options.every((o) => t(o).length <= 22);
  const box = el("div", "options" + (isChips ? " options--chips" : ""));
  let textInput = null;
  q.options.forEach((opt, i) => {
    const lab = el("label", "opt");
    const input = el("input");
    input.type = "radio"; input.name = q.id; input.checked = answers[q.id] === i;
    input.addEventListener("change", () => {
      answers[q.id] = i;
      clearInvalid(q.id);
      if (textInput) toggleOther(q, textInput);
      onAnswered(q);
    });
    lab.appendChild(input);
    lab.appendChild(el("span", "opt__dot"));
    lab.appendChild(el("span", "opt__label", esc(t(opt))));
    box.appendChild(lab);
  });
  if (q.otherText) {
    textInput = el("input", "other-text");
    textInput.type = "text";
    textInput.maxLength = 250;
    textInput.placeholder = t(SURVEY.ui.otherPlaceholder);
    textInput.value = answers[q.id + "_text"] || "";
    textInput.addEventListener("input", () => { answers[q.id + "_text"] = textInput.value; });
    box.appendChild(textInput);
    toggleOther(q, textInput);
  }
  return box;
}

function toggleOther(q, input) {
  const show = answers[q.id] === otherIndexOf(q);
  input.classList.toggle("is-hidden", !show);
}

// reference anchors above a 1–7 scale: low (1) … mid (4) … high (7)
function scaleAnchors(sc) {
  const a = el("div", "matrix__anchors" + (sc.mid ? " matrix__anchors--triple" : ""));
  a.appendChild(el("span", "matrix__anchor matrix__anchor--low", esc(t(sc.low))));
  if (sc.mid) a.appendChild(el("span", "matrix__anchor matrix__anchor--mid", esc(t(sc.mid))));
  a.appendChild(el("span", "matrix__anchor matrix__anchor--high", esc(t(sc.high))));
  return a;
}

// a single horizontal row of 7 numbered circles
function scaleRow(name, isChecked, onPick) {
  const scale = el("div", "matrix__scale");
  for (let v = 1; v <= 7; v++) {
    const cell = el("label", "matrix__cell");
    const input = el("input");
    input.type = "radio"; input.name = name; input.checked = isChecked(v);
    input.addEventListener("change", () => onPick(v));
    cell.appendChild(input);
    cell.appendChild(el("span", "opt__dot"));
    cell.appendChild(el("span", "matrix__num", String(v)));
    scale.appendChild(cell);
  }
  return scale;
}

// several 1–7 statements sharing one scale (answers stored by TRUE row index)
function buildMatrix(q) {
  const sc = SURVEY.scales[q.scale];
  if (!answers[q.id]) answers[q.id] = {};
  const box = el("div", "matrix");
  box.appendChild(scaleAnchors(sc));

  let order = q.rows.map((_, r) => r);
  if (q.randomize) {
    if (q.id === "Q12" && !q12Order) q12Order = shuffle(order.slice());
    if (q.id === "Q12") order = q12Order;
  }

  order.forEach((r) => {
    const row = el("div", "matrix__row");
    row.appendChild(el("div", "matrix__label", esc(t(q.rows[r]))));
    row.appendChild(scaleRow(`${q.id}_r${r}`,
      (v) => answers[q.id][`row${r}`] === v,
      (v) => { answers[q.id][`row${r}`] = v; clearInvalid(q.id); onAnswered(q); }));
    box.appendChild(row);
  });
  return box;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* --------------------------------------------------------- SCENARIO CARD */
// condition-specific "How the service process works" block.
// `bare` drops the bordered box (used when the block IS its own card).
function buildProcessBlock(scen, bare) {
  const cond = ensureCondition();
  const c = scen.conditions[cond];
  const wrap = el("div", "process" + (bare ? " process--bare" : ""));
  wrap.appendChild(el("h3", "process__heading", esc(t(SURVEY.ui.processHeading))));
  wrap.appendChild(el("p", "process__lead", esc(t(SURVEY.ui.ifChatbot))));
  const ol = el("ol", "process__steps");
  c.steps.forEach((step) => ol.appendChild(el("li", null, esc(t(step)))));
  wrap.appendChild(ol);
  wrap.appendChild(el("p", "process__summary", esc(t(c.summary))));
  wrap.appendChild(el("p", "process__arrow", esc(t(c.arrow))));
  return wrap;
}

// Two cards: left/top = scenario narrative, right/bottom = service process (white).
function renderScenarioDual(root, screen) {
  ensureCondition();
  const s = screen.s;
  root.classList.add("screen--wide");
  const dual = el("div", "dual swipe-anim");

  // left — scenario narrative
  const left = newCard(s.card);
  const lb = el("div", "card__body");
  lb.appendChild(el("p", "section-eyebrow", esc(t(s.section))));
  lb.appendChild(el("h2", "section-title", esc(t(s.title))));
  const intro = el("div", "scenario__intro");
  s.common.forEach((p) => intro.appendChild(el("p", null, esc(t(p)))));
  lb.appendChild(intro);
  lb.appendChild(el("p", "scenario__note", esc(t(s.note))));
  left.appendChild(lb);
  dual.appendChild(left);

  // right — service process (white card) + nav
  const right = newCard("#ffffff");
  right.classList.add("dual__process");
  const rb = el("div", "card__body");
  rb.appendChild(buildProcessBlock(s, true));
  right.appendChild(rb);
  right.appendChild(buildNav(screen));
  dual.appendChild(right);

  root.appendChild(dual);
}

/* ----------------------------------------------------- COMPREHENSION GATE */
function isCorrect(qid, idx) {
  const q = sectionOf("comprehension").questions.find((x) => x.id === qid);
  return idx === q.correct[ensureCondition()];
}

function renderComprehension(body, s) {
  ensureCondition();
  body.appendChild(el("p", "section-eyebrow", esc(t(s.section))));
  body.appendChild(el("h2", "section-title", esc(t(s.title))));

  // collapsible "Review the service process"
  const det = el("details", "review");
  det.appendChild(el("summary", "review__summary", esc(t(SURVEY.ui.reviewProcess))));
  det.appendChild(buildProcessBlock(scenarioSection(), true));   // bare — the panel already frames it
  body.appendChild(det);

  if (comp.phase === "ask") {
    body.appendChild(el("p", "scenario__note", esc(t(s.instruction))));
    s.questions.forEach((q) => body.appendChild(buildQuestionBlock(q)));
  } else {
    // correction message (condition-specific)
    const note = el("div", "correction");
    note.appendChild(el("h3", "correction__heading", esc(t(SURVEY.ui.correctionHeading))));
    SURVEY.corrections[ensureCondition()].forEach((p) => note.appendChild(el("p", null, esc(t(p)))));
    body.appendChild(note);

    if (comp.phase === "correct") {
      // re-ask only the still-incorrect questions
      s.questions.forEach((q) => { if (!comp.items[q.id].ok) body.appendChild(buildQuestionBlock(q)); });
    } else {
      // confirm phase — single checkbox, no re-scoring
      const lab = el("label", "confirm-box");
      const input = el("input");
      input.type = "checkbox"; input.id = "finalConfirm";
      input.checked = comp.finalConfirmDone;
      input.addEventListener("change", () => { comp.finalConfirmDone = input.checked; });
      lab.appendChild(input);
      lab.appendChild(el("span", "opt__dot"));
      lab.appendChild(el("span", "opt__label", esc(t(SURVEY.finalConfirm))));
      body.appendChild(lab);
    }
  }
}

function handleComprehensionNext() {
  const s = sectionOf("comprehension");

  if (comp.phase === "ask") {
    const missing = s.questions.filter((q) => answers[q.id] == null).map((q) => q.id);
    if (missing.length) { flagMissing(missing); return; }
    s.questions.forEach((q) => {
      const it = comp.items[q.id];
      const idx = answers[q.id];
      it.first = idx; it.last = idx; it.attempts = 1;
      it.firstCorrect = isCorrect(q.id, idx);
      it.ok = it.firstCorrect;
    });
    if (s.questions.every((q) => comp.items[q.id].ok)) { passGate(); return; }
    comp.correctionShown = true;
    comp.phase = "correct";
    // clear the wrong answers so the retry radios start empty
    s.questions.forEach((q) => { if (!comp.items[q.id].ok) delete answers[q.id]; });
    rerender();
    return;
  }

  if (comp.phase === "correct") {
    const wrong = s.questions.filter((q) => !comp.items[q.id].ok);
    const missing = wrong.filter((q) => answers[q.id] == null).map((q) => q.id);
    if (missing.length) { flagMissing(missing); return; }
    wrong.forEach((q) => {
      const it = comp.items[q.id];
      const idx = answers[q.id];
      it.last = idx; it.attempts += 1;
      it.ok = isCorrect(q.id, idx);
    });
    if (s.questions.every((q) => comp.items[q.id].ok)) { passGate(); return; }
    // a second miss → final confirmation, no further scoring
    comp.finalConfirmRequired = true;
    comp.phase = "confirm";
    rerender();
    return;
  }

  // confirm phase
  if (!comp.finalConfirmDone) {
    const node = document.getElementById("finalConfirm");
    if (node) node.closest(".confirm-box").classList.add("q--invalid");
    return;
  }
  passGate();
}

function passGate() {
  comp.passed = true;
  changeStep(1, {});
}

function rerender() {
  enterDir = 1;
  render();
}

/* ----------------------------------------------------------------- NAV */
function buildNav(screen) {
  const nav = el("div", "nav");
  const back = el("button", "btn btn--back", esc(t(SURVEY.ui.back)));
  back.type = "button";
  if (stepIndex === 0 || screen.kind === "thanks" || backBlocked()) back.classList.add("btn--ghost");
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

// once Q11 is submitted, the scenario and comprehension gate are off-limits
function backBlocked() {
  if (!outcomeLocked) return false;
  const prev = screens[stepIndex - 1];
  return !!(prev && ["scenario", "comprehension", "choice"].includes(prev.s.id));
}

function onAnswered(q) {
  if (!AUTO_ADVANCE) return;
  const cur = screens[stepIndex];
  if (cur && cur.kind === "comprehension") return;          // gate is driven by Next only
  // Q11 channel choice (lockBefore): require an explicit NEXT — an accidental tap
  // must not auto-advance and trigger the irreversible back-nav lock.
  if (cur && cur.s && cur.s.lockBefore) return;
  // don't auto-advance when an "Other" option needs a typed answer
  if (q.otherText && answers[q.id] === otherIndexOf(q)) return;

  if (cur && cur.kind === "group") {
    if (cur.qs.every((qq) => isAnswered(qq))) {
      setTimeout(() => { if (!animating) goNext(); }, 450);
    }
    return;
  }
  // single-question card: advance once it's fully answered
  // (binary/single = immediately; matrix = once every statement is rated)
  if (!isAnswered(q)) return;
  const next = buildScreens()[stepIndex + 1];
  const endsHere = q.type === "binary" && q.endIfNo && answers[q.id] === 1;
  if (!endsHere && (!next || next.kind === "thanks")) return; // don't auto-submit
  setTimeout(() => { if (!animating) goNext(); }, q.type === "matrix" ? 520 : 420);
}

function goBack() {
  if (animating || stepIndex === 0 || backBlocked()) return;
  changeStep(-1, {});
}

function goNext() {
  if (animating) return;
  const screen = screens[stepIndex];

  if (screen.kind === "comprehension") { handleComprehensionNext(); return; }

  if (screen.kind === "question") {
    if (!isAnswered(screen.q)) { flagMissing(screen.q.id); return; }
    if (screen.q.type === "binary" && screen.q.endIfNo && answers[screen.q.id] === 1) {
      changeStep(1, { end: true });
      return;
    }
  } else if (screen.kind === "group") {
    const missing = screen.qs.filter((q) => !isAnswered(q)).map((q) => q.id);
    if (missing.length) { flagMissing(missing); return; }
    for (const q of screen.qs) {
      if (q.type === "binary" && q.endIfNo && answers[q.id] === 1) { changeStep(1, { end: true }); return; }
    }
  }

  // leaving the channel-choice screen locks backward navigation to the scenario/gate
  if (screen.s.id === "choice") outcomeLocked = true;

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
  const frac = !ended && screens.length > 1 ? stepIndex / (screens.length - 1) : 0;
  const pct = Math.round(frac * 100);
  $("#progressFill").style.width = `${Math.max(frac * 100, ended ? 0 : 2)}%`;
  $("#progressLabel").textContent = `${t(SURVEY.ui.progress)} ${ended ? 0 : pct}%`;
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
function compLabel(qid, idx) {
  if (idx == null) return "";
  const q = sectionOf("comprehension").questions.find((x) => x.id === qid);
  return q.options[idx].en;
}

function buildPayload() {
  const a = {};
  SURVEY.sections.forEach((s) => {
    if (s.id === "comprehension") return;        // handled below
    (s.questions || []).forEach((q) => {
      const v = answers[q.id];
      if (q.type === "binary") { if (v != null) a[q.id] = v === 0 ? "Yes" : "No"; }
      else if (q.type === "matrix") {
        const m = answers[q.id] || {};
        (q.keys || []).forEach((k, r) => { if (m[`row${r}`] != null) a[k] = m[`row${r}`]; });
        if (q.id === "Q12") a.q12_item_order = (q12Order || q.rows.map((_, i) => i)).map((i) => i + 1).join(",");
      } else { // single
        if (v != null) a[q.id] = q.id === "Q11" ? (v === 0 ? "chatbot" : "human") : q.options[v].en;
      }
      // only keep "Other" text if "Other" is still the selected option
      if (q.otherText && v === otherIndexOf(q) && answers[q.id + "_text"]) a[q.id + "_text"] = answers[q.id + "_text"];
    });
  });
  // Q5 not applicable when Q4 = "Never"
  if (answers.Q4 === 0) a.Q5 = "not_applicable";

  // comprehension
  const c9 = comp.items.Q9, c10 = comp.items.Q10;
  a.q9_first_answer = compLabel("Q9", c9.first);
  a.q9_first_correct = c9.firstCorrect;
  a.q9_final_answer = compLabel("Q9", c9.last);
  a.q9_attempt_count = c9.attempts;
  a.q10_first_answer = compLabel("Q10", c10.first);
  a.q10_first_correct = c10.firstCorrect;
  a.q10_final_answer = compLabel("Q10", c10.last);
  a.q10_attempt_count = c10.attempts;
  a.correction_shown = comp.correctionShown;
  a.final_confirmation_required = comp.finalConfirmRequired;
  a.final_confirmation_completed = comp.finalConfirmDone;
  a.comprehension_passed = comp.passed;

  return {
    submittedAt: new Date().toISOString(),
    participant_id: participantId,
    condition: condition,
    language: lang,
    answers: a,
  };
}

function setStatus(state) {
  submitState = state;
  const node = document.getElementById("submitStatus");
  if (node) { node.textContent = statusText(); node.className = "thanks__status " + statusClass(); }
}

async function submit() {
  const payload = buildPayload();
  if (!SHEETS_ENDPOINT || !SUBMIT_ENABLED) {
    console.log("[survey] Submission disabled (test mode) — payload would be:", payload);
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
    // browser-side completion flag (reduces accidental duplicate participation;
    // the Apps Script participant_id dedupe is the authoritative guard).
    localStorage.setItem("survey_completed", "true");
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

  // already completed on this browser → show a neutral message, don't re-take
  // (DEBUG_MODE bypasses so the flow can be re-tested)
  if (!DEBUG_MODE && localStorage.getItem("survey_completed") === "true") {
    renderCompleted();
    return;
  }

  screens = buildScreens();
  if (DEBUG_MODE) {                                    // ?preview=N jumps to a screen (test only)
    const pv = new URLSearchParams(location.search).get("preview");
    if (pv != null && screens[+pv]) stepIndex = +pv;
  }
  render();
}

// neutral "you already completed this survey" screen
function renderCompleted() {
  const root = $("#screen");
  root.innerHTML = "";
  root.classList.remove("screen--wide");
  $("#appTitle").textContent = t(SURVEY.title);
  const card = newCard("#f0faff");
  card.classList.add("card--center");
  const body = el("div", "card__body");
  const wrap = el("div", "centered-card");
  wrap.appendChild(el("h2", "centered-card__title", esc(t(SURVEY.ui.doneTitle))));
  wrap.appendChild(el("p", "centered-card__body", esc(t(SURVEY.ui.doneBody))));
  body.appendChild(wrap);
  card.appendChild(body);
  root.appendChild(card);
  updateFooter(null);
}
init();
