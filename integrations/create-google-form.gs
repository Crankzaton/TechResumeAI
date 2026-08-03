/**
 * TechResumeAI — Google Form creator + webhook
 *
 * IMPORTANT:
 * - Paste this file ALONE into Code.gs
 * - Do NOT wrap it inside function myFunction() { ... }
 * - In the function dropdown, choose createTechResumeForm → Run
 *
 * Script Properties (Project Settings):
 *   WEBHOOK_URL    = https://characters-governing-stylus-yrs.trycloudflare.com/api/webhook/google-forms
 *   WEBHOOK_SECRET = techresume-secret-2026
 *   NOTIFY_EMAIL   = gokulnathgoku23@gmail.com
 */

var TECH_CHOICES = [
  "ServiceNow",
  "Salesforce",
  "AWS",
  "Microsoft Azure",
  "React / Frontend",
  "Java / Spring",
  "Python / Data",
  "Kubernetes / DevOps",
  "SAP",
  "DevOps / SRE",
  "Other (write in Notes)",
];

function createTechResumeForm() {
  var props = PropertiesService.getScriptProperties();
  var webhookUrl = props.getProperty("WEBHOOK_URL");
  if (!webhookUrl) {
    throw new Error("Set Script Property WEBHOOK_URL first");
  }

  var form = FormApp.create("TechResumeAI — Client Resume Intake");
  form.setDescription(
    "Fill this once. Pick your Technology — that chooses the resume theme.\n" +
      "You can type details OR paste resume/LinkedIn text in the attachment text box.",
  );
  form.setConfirmationMessage(
    "Thanks! Your resume is being prepared. The freelancer will share it shortly.",
  );
  form.setCollectEmail(true);
  form.setProgressBar(true);

  form
    .addListItem()
    .setTitle("Technology")
    .setHelpText("Required — chooses which themed resume to generate.")
    .setChoiceValues(TECH_CHOICES)
    .setRequired(true);

  form.addTextItem().setTitle("Full Name").setRequired(true);
  form.addTextItem().setTitle("Mobile / Phone").setRequired(true);
  form.addTextItem().setTitle("Headline").setHelpText("Optional — e.g. Developer | CIS-ITSM");
  form.addTextItem().setTitle("LinkedIn").setHelpText("linkedin.com/in/...");
  form.addTextItem().setTitle("Location");

  form
    .addParagraphTextItem()
    .setTitle("Skills")
    .setHelpText("One skill per line")
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle("Experience")
    .setHelpText(
      "Format:\nTitle | Company | Start - End\n- bullet\n- bullet\n\n(blank line between roles)",
    )
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle("Education")
    .setHelpText("Degree | Institution | Years");

  form
    .addParagraphTextItem()
    .setTitle("Certifications")
    .setHelpText("One per line");

  form
    .addParagraphTextItem()
    .setTitle("Languages")
    .setHelpText("English: Native Proficiency");

  form
    .addParagraphTextItem()
    .setTitle("Resume / LinkedIn text (paste)")
    .setHelpText(
      "Optional — paste full resume or LinkedIn About/Experience text. Used if Skills/Experience are short.",
    );

  form.addParagraphTextItem().setTitle("Notes");

  try {
    form
      .addFileUploadItem()
      .setTitle("Resume file (optional)")
      .setHelpText("PDF/DOC/DOCX if available. Also paste text above for best results.")
      .setMaxFiles(1);
  } catch (err) {
    Logger.log("File upload item skipped: " + err);
  }

  var ss = SpreadsheetApp.create("TechResumeAI — Form Responses");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  ScriptApp.newTrigger("onFormSubmit").forForm(form).onFormSubmit().create();

  props.setProperty("FORM_ID", form.getId());
  props.setProperty("FORM_EDIT_URL", form.getEditUrl());
  props.setProperty("FORM_PUBLISHED_URL", form.getPublishedUrl());
  props.setProperty("SHEET_URL", ss.getUrl());

  var published = form.getPublishedUrl();
  var edit = form.getEditUrl();

  Logger.log("=== TechResumeAI Form Created ===");
  Logger.log("Share this link with customers: " + published);
  Logger.log("Edit form: " + edit);
  Logger.log("Responses sheet: " + ss.getUrl());

  var notify = props.getProperty("NOTIFY_EMAIL");
  if (notify) {
    MailApp.sendEmail(
      notify,
      "TechResumeAI Google Form is ready",
      "Share this form link with customers:\n\n" +
        published +
        "\n\nEdit form:\n" +
        edit +
        "\n\nResponses sheet:\n" +
        ss.getUrl() +
        "\n\nWebhook:\n" +
        webhookUrl,
    );
  }

  return { publishedUrl: published, editUrl: edit, sheetUrl: ss.getUrl() };
}

function onFormSubmit(e) {
  var props = PropertiesService.getScriptProperties();
  var webhookUrl = props.getProperty("WEBHOOK_URL");
  var secret = props.getProperty("WEBHOOK_SECRET");
  if (!webhookUrl) throw new Error("WEBHOOK_URL missing");

  var named = e.namedValues || {};
  var payload = {};
  Object.keys(named).forEach(function (key) {
    var values = named[key];
    payload[key] = Array.isArray(values) ? values.join("\n") : values;
  });

  payload.Technology = first(named, ["Technology", "Technology Theme"]);
  payload.technologyName = payload.Technology;
  payload.theme = payload.Technology;
  payload.fullName = first(named, ["Full Name", "Name"]);
  payload.email =
    first(named, ["Email Address", "Email"]) ||
    (e.response && e.response.getRespondentEmail && e.response.getRespondentEmail());
  payload.phones = first(named, ["Mobile / Phone", "Phone Numbers", "Phone"]);
  payload.linkedin = first(named, ["LinkedIn"]);
  payload.headline = first(named, ["Headline"]);
  payload.location = first(named, ["Location"]);
  payload.expertise = first(named, ["Skills", "Expertise"]);
  payload.certifications_mainline = first(named, ["Certifications"]);
  payload.languages = first(named, ["Languages"]);
  payload.workExperience = first(named, ["Experience", "Work Experience"]);
  payload.education = first(named, ["Education"]);
  payload.notes = first(named, ["Notes"]);
  payload.pastedResume = first(named, [
    "Resume / LinkedIn text (paste)",
    "Resume text",
    "Pasted resume",
  ]);

  // If paste box has content and experience is thin, prefer pasted content as experience seed
  if (payload.pastedResume && (!payload.workExperience || payload.workExperience.length < 40)) {
    payload.workExperience = payload.pastedResume;
  }
  if (payload.pastedResume && (!payload.expertise || payload.expertise.length < 10)) {
    payload.additionalWorks = payload.pastedResume;
  }

  var headers = { "Content-Type": "application/json" };
  if (secret) headers["x-webhook-secret"] = secret;

  var response = UrlFetchApp.fetch(webhookUrl, {
    method: "post",
    contentType: "application/json",
    headers: headers,
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  Logger.log("Agent status: " + response.getResponseCode());
  Logger.log(response.getContentText());
}

function first(named, keys) {
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (named[key] && named[key][0]) return named[key][0];
  }
  return "";
}

function showFormLinks() {
  var props = PropertiesService.getScriptProperties();
  Logger.log("Published: " + props.getProperty("FORM_PUBLISHED_URL"));
  Logger.log("Edit: " + props.getProperty("FORM_EDIT_URL"));
  Logger.log("Sheet: " + props.getProperty("SHEET_URL"));
}
