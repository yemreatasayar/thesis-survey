# Consumer Acceptance of AI-Driven Customer Service — Survey

A static, card-based survey website (HTML/CSS/JS) for a Master's thesis.
No personal data is collected. Designed to be hosted free on **GitHub Pages**.

## Files
| File | What it is |
|---|---|
| `index.html` | Page shell + Montserrat font + footer |
| `styles.css` | All styling (colours sampled from the SVG designs) |
| `survey-data.js` | **All questions live here** — edit this to change the survey |
| `app.js` | Rendering, navigation, branching, condition assignment, comprehension gate, submit |
| `apps-script.gs` | Google Apps Script to paste into your Google Sheet (with `participant_id` dedupe) |

## Run locally
```bash
cd webapp
python3 -m http.server 8080
# open http://localhost:8080
```

## Editing questions
Open `survey-data.js`. Each screen is one object in `SURVEY.sections`.
- **Bilingual:** every text is `L("English", "Türkçe")`. Edit either side.
- Change wording: edit the `text` / `options` strings.
- Add/remove an option: edit the `options` array.
- Question types: `binary` (Yes/No), `single` (one choice), `matrix` (several 1–7 statements sharing one scale).
- Branching: `endIfNo:true` (end survey on "No"), `skipIfFirst:[...]` (hide questions when the first option is chosen), `otherText:true` (+optional `otherIndex`) opens an optional text field for an "Other"/self-describe option.

If you add/remove questions, also update `HEADERS` in `apps-script.gs` so the Sheet columns match.

## Switches (top of `app.js`)
- `SUBMIT_ENABLED` — `false` = test mode (nothing written to the Sheet; payload logged to console). Set `true` to collect data. **Must be `true` for go-live** (and the Apps Script redeployed as a new version).
- `DEBUG_MODE` — `false` in production. When `true`, the test-only URL params `?cond=standard|lossless` and `?preview=<screen#>` work, and the "already completed" lock is bypassed. **Keep `false` on the live site** so participants can't skip eligibility/scenario or force a condition.
- `AUTO_ADVANCE = true` — single-tap questions and fully-rated matrices auto-advance. The **comprehension gate (Q9/Q10)** and **Q11 channel choice** are intentionally manual (require NEXT).
- Default language is Turkish; the TR/ENG toggle switches instantly **without losing answers** (answers stored by option index). The research title stays English in both languages.

## Built-in logic (from the thesis)
- **Consent (Q1–Q3):** answering "No" to any ends the survey (no data kept).
- **Q4 "Never":** skips **Q5** only (recorded as `not_applicable`).
- **Between-subjects condition:** after Q8 each participant is assigned `standard` or `lossless` (50/50), persisted so refresh never changes it; only the assigned condition's scenario/process text is shown.
- **Comprehension gate (Q9, Q10):** first-attempt answers preserved; wrong answers get a condition-specific correction and re-ask only the wrong item; a 2nd miss requires a final confirmation checkbox. Backward navigation locks after Q11.
- **Anonymous `participant_id`** (UUID) is generated per browser and sent with the response (for de-duplication only). A `survey_completed` browser flag + Apps Script `participant_id` check prevent duplicate rows.
- **No resume:** a mid-survey refresh keeps the assigned condition and participant id but restarts the questionnaire from the top.

## Connect to Google Sheets (do this when ready)
1. Create a Google Sheet.
2. **Extensions ▸ Apps Script**, paste `apps-script.gs`, save.
3. **Deploy ▸ New deployment ▸ Web app** → Execute as **Me**, Access **Anyone** → copy the `/exec` URL.
4. Paste that URL into `app.js`: `const SHEETS_ENDPOINT = "https://script.google.com/macros/s/.../exec";`
5. Commit & push. Each submission appends one row.

Until the endpoint is set, the survey runs fully and logs the would-be payload to the browser console (the final screen still says "recorded").

## Deploy to GitHub Pages
1. Create a GitHub repo, put these files at the repo root (or in `/docs`).
2. Push.
3. Repo **Settings ▸ Pages** → Source: `main` branch, `/root` (or `/docs`).
4. Your survey is live at `https://<user>.github.io/<repo>/`.

## Privacy
No emails, names, or identifiers are requested or stored. Only the survey answers,
the assigned condition, the language, and an anonymous random `participant_id`
(used solely for de-duplication) are sent. No raw IP, geolocation, or fingerprinting.
The page sets `noindex`.
