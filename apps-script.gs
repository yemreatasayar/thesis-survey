/* =============================================================================
   Google Apps Script — receives survey submissions and appends them to a Sheet.

   SETUP (one time):
   1. Create a Google Sheet. Note its name of the first tab (default "Sheet1").
   2. Extensions ▸ Apps Script. Delete the sample code, paste THIS file.
   3. Deploy ▸ New deployment ▸ type "Web app".
        - Execute as: Me
        - Who has access: Anyone
      Copy the Web app URL (ends with /exec).
   4. Put that URL into webapp/app.js  ->  const SHEETS_ENDPOINT = "...";
   5. Done. Each submission becomes one row.

   No personal data is collected by the survey; only the answers below.
   ========================================================================== */

// Column order written to the sheet. Edit if your questions change.
// Revised questionnaire (19 Qs) + between-subjects condition + comprehension gate.
var HEADERS = [
  "timestamp", "participant_id", "condition", "language",
  // eligibility + background
  "Q1","Q2","Q3","Q4","Q5","Q6","Q6_text","Q7",
  // general chatbot evaluation (Q8, 3 items, 1–7)
  "q8_1","q8_2","q8_3",
  // comprehension gate (Q9, Q10) — first attempt preserved
  "q9_first_answer","q9_first_correct","q9_final_answer","q9_attempt_count",
  "q10_first_answer","q10_first_correct","q10_final_answer","q10_attempt_count",
  "correction_shown","final_confirmation_required","final_confirmation_completed","comprehension_passed",
  // outcomes
  "Q11",                                  // channel choice: chatbot | human
  "q12_1","q12_2","q12_3","q12_4","q12_item_order",   // perceived failure cost (order randomised)
  "q13_1","q13_2","q13_3",                // continuous willingness
  "q14_1","q14_2",                        // perceived competence
  "q15_1","q15_2",                        // scenario-specific trust
  "q16_1","q16_2",                        // process credibility
  // demographics
  "Q17","Q18","Q19","Q19_text"
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // avoid two submissions writing the same row
  try {
    var data = JSON.parse(e.postData.contents);
    var a = data.answers || {};
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Write header row once
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    // Duplicate guard: never write the same participant_id twice (last line of
    // defence against refresh/retry double-submits; browser flag is the first).
    var pid = data.participant_id || "";
    if (pid) {
      var pidCol = HEADERS.indexOf("participant_id") + 1;   // 1-based
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        var existing = sheet.getRange(2, pidCol, lastRow - 1, 1).getValues();
        for (var i = 0; i < existing.length; i++) {
          if (String(existing[i][0]) === String(pid)) {
            return ContentService
              .createTextOutput(JSON.stringify({ ok: true, duplicate: true }))
              .setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
    }

    var row = HEADERS.map(function (h) {
      if (h === "timestamp") return data.submittedAt || new Date().toISOString();
      if (h === "participant_id") return data.participant_id || "";
      if (h === "condition") return data.condition || "";
      if (h === "language") return data.language || "";

      // The client sends a flat, pre-expanded answers object (keys = column names).
      var val = a[h];
      return val == null ? "" : val;
    });

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Lets you open the /exec URL in a browser to confirm the deployment works.
function doGet() {
  return ContentService.createTextOutput("Survey endpoint is live.");
}
