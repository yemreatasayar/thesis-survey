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
var HEADERS = [
  "timestamp", "scenarioVersion",
  "Q1","Q2","Q3","Q4","Q5","Q6","Q7","Q8","Q9",
  // Q10 = willingness (5 tasks), Q11 = complexity (5 tasks)
  "Q10_1","Q10_2","Q10_3","Q10_4","Q10_5",
  "Q11_1","Q11_2","Q11_3","Q11_4","Q11_5",
  "Q12","Q13","Q14","Q15","Q16","Q17","Q18","Q19","Q20","Q21","Q22","Q23","Q24",
  "Q25","Q26","Q27"
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

    var row = HEADERS.map(function (h) {
      if (h === "timestamp") return data.submittedAt || new Date().toISOString();
      if (h === "scenarioVersion") return data.scenarioVersion || "";

      // Matrix items Q10_n / Q11_n  ->  answers.Q10.row(n-1)
      var m = h.match(/^(Q10|Q11)_(\d)$/);
      if (m) {
        var obj = a[m[1]] || {};
        var v = obj["row" + (parseInt(m[2], 10) - 1)];
        return v == null ? "" : v;
      }

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
