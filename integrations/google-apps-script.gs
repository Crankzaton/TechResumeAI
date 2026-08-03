/**
 * Google Forms → TechResumeAI
 *
 * Setup:
 * 1. Create a Google Form with the question titles listed in /docs
 * 2. Open the form's linked spreadsheet (Responses → Link to Sheets)
 * 3. Extensions → Apps Script → paste this file
 * 4. Set WEBHOOK_URL and optional WEBHOOK_SECRET in Script Properties
 * 5. Install an installable "On form submit" trigger for onFormSubmit
 */

function onFormSubmit(e) {
  var props = PropertiesService.getScriptProperties();
  var webhookUrl = props.getProperty("WEBHOOK_URL");
  var secret = props.getProperty("WEBHOOK_SECRET");

  if (!webhookUrl) {
    throw new Error("Set Script Property WEBHOOK_URL to your deployed /api/webhook/google-forms URL");
  }

  var named = e.namedValues || {};
  var payload = {};
  Object.keys(named).forEach(function (key) {
    var values = named[key];
    payload[key] = Array.isArray(values) ? values.join("\n") : values;
  });

  // Also expose common aliases for resilient mapping
  payload.fullName = first(named, ["Full Name", "Name"]);
  payload.email = first(named, ["Email", "Email Address"]);
  payload.phones = first(named, ["Phone Numbers", "Phone", "Mobile"]);
  payload.linkedin = first(named, ["LinkedIn", "LinkedIn URL"]);
  payload.theme = first(named, ["Technology Theme", "Resume Theme", "Platform"]);
  payload.expertise = first(named, ["Expertise", "Skills", "Technical Skills"]);
  payload.workExperience = first(named, ["Work Experience", "Experience"]);
  payload.education = first(named, ["Education"]);
  payload.languages = first(named, ["Languages"]);
  payload.certifications_mainline = first(named, [
    "Certifications (Main-Line)",
    "Main-Line Certifications",
  ]);
  payload.certifications_micro = first(named, [
    "Certifications (Micro-Cert)",
    "Micro Certifications",
  ]);
  payload.certifications_other = first(named, ["Other Certifications"]);
  payload.additionalWorks = first(named, ["Additional Works", "Projects"]);
  payload.notes = first(named, ["Notes", "Anything else"]);

  var headers = { "Content-Type": "application/json" };
  if (secret) {
    headers["x-webhook-secret"] = secret;
  }

  var response = UrlFetchApp.fetch(webhookUrl, {
    method: "post",
    contentType: "application/json",
    headers: headers,
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  Logger.log("TechResumeAI webhook status: " + response.getResponseCode());
  Logger.log(response.getContentText());
}

function first(named, keys) {
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (named[key] && named[key][0]) {
      return named[key][0];
    }
  }
  return "";
}
