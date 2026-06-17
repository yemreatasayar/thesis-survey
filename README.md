# Consumer Acceptance of AI-Driven Customer Service — Survey

A static, card-based survey website (HTML/CSS/JS) for a Master's thesis.
No personal data is collected. Designed to be hosted free on **GitHub Pages**.

## Files
| File | What it is |
|---|---|
| `index.html` | Page shell + Montserrat font + footer |
| `styles.css` | All styling (colours sampled from the SVG designs) |
| `survey-data.js` | **All questions live here** — edit this to change the survey |
| `app.js` | Rendering, navigation, branching, A/B, submit |
| `apps-script.gs` | Google Apps Script to paste into your Google Sheet |

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
- Question types: `binary`, `single`, `multiple`, `likert`, `matrix` (explained at the top of the file).
- Branching: `endIfNo:true` (end survey on 2nd option), `skipIfFirst:[...]` (hide questions when first option chosen).

If you add/remove questions, also update `HEADERS` in `apps-script.gs` so the Sheet columns match.

## Behaviour & options (top of `app.js`)
- `AUTO_ADVANCE = true` — after answering a single-tap question the card auto-swipes to the next one. Set to `false` to require pressing NEXT.
- Default language is Turkish (`lang = "tr"`); the TR/ENG toggle (top-right) switches instantly **without losing answers** (answers are stored by option index, not text).
- Cards swipe Tinder-style (left on next, right on back). One question per card.
- Hover colours (Yes=green, No=red) apply on desktop only.

## Built-in logic (from the thesis)
- **Consent (Q1–Q3):** answering "No" to any ends the survey.
- **Q4 "Never":** skips Q5–Q7.
- **Scenario A/B:** each participant is randomly shown Version A or B; the version is saved with the response (`scenarioVersion`).

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
No emails, names, or identifiers are requested or stored. Only the survey answers
and the random scenario version are sent. The page sets `noindex`.
