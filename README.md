# TechResumeAI

Freelancer **resume agent**: share one Google Form link → client submits with a
**Technology** choice → agent builds a themed resume with ID `TR-####` → emails
you a one-click link. Redesign anytime by Resume ID.

## What you need to go live

| Item | Why |
| --- | --- |
| **Gmail App Password** | So the agent can email you |  
| **Deployed https URL** | Google Forms cannot call localhost |
| **Run `create-google-form.gs` once** | Creates the Form (with Technology field) in your Gmail |
| **OneDrive creds (optional)** | Store resume JSON in your 1TB drive |

Full checklist: Admin → **What I need** tab.

## Quick start

```bash
npm install
npm run dev
```

1. Admin → Agent → paste Gmail App Password  
2. Deploy app → set `PUBLIC_BASE_URL`  
3. script.google.com → paste `integrations/create-google-form.gs` → run `createTechResumeForm`  
4. Share only the published form link with customers  

## Redesign by ID

Emails include **Resume ID** (`TR-1042`). In Admin → Orders (or tell the agent):

```bash
curl -X POST https://YOUR_APP/api/resumes/TR-1042/redesign \
  -H 'Content-Type: application/json' \
  -d '{"technology":"AWS","sendEmail":true}'
```

Same ID, new design version, email again.

## Technology field

The Google Form has a required **Technology** dropdown. That value selects the
resume theme (ServiceNow, AWS, React, SAP, … or any tech you add in Admin).

## Env

See `.env.example` for SMTP + OneDrive variables.
