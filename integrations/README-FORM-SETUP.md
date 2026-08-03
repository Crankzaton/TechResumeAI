# PASTE INTO Google Apps Script → Code.gs (REPLACE ALL)

Do NOT wrap this inside `function myFunction() { ... }`.

1. Open your Apps Script project → Editor
2. Select all in Code.gs → Delete
3. Paste the full contents of `create-google-form.gs` (same folder)
4. Confirm Script Properties:
   WEBHOOK_URL = https://characters-governing-stylus-yrs.trycloudflare.com/api/webhook/google-forms
   WEBHOOK_SECRET = techresume-secret-2026
   NOTIFY_EMAIL = gokulnathgoku23@gmail.com
5. Function dropdown → choose **createTechResumeForm** (not myFunction)
6. Run → Allow permissions
7. Check Executions logs or Gmail for the form link

If you previously wrapped everything in myFunction, that run did nothing useful (0.4s, no form).
