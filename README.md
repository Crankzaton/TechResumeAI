# TechResumeAI

Platform-themed resume builder for freelancers. Collect candidate details from a Google Form (or the built-in intake form), pick a technology theme, and generate a print-ready resume.

## Themes

| Theme | Look |
| --- | --- |
| **ServiceNow** | Dark instance UI with filter bar, module sidebar, and list cards (based on the reference resume) |
| **Salesforce** | Lightning workspace blues |
| **AWS** | Console dark + orange accents |
| **Azure** | Portal light cards |

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

1. **Build a resume** → `/intake`
2. **Orders dashboard** → `/admin`
3. **Google Forms setup** → `/docs`
4. Click **Load sample ServiceNow resume** on Orders to preview the reference layout

## Google Forms

1. Create a form with the question titles documented on `/docs`
2. Paste `integrations/google-apps-script.gs` into the linked sheet’s Apps Script
3. Set Script Properties:
   - `WEBHOOK_URL` → `https://YOUR_DOMAIN/api/webhook/google-forms`
   - `WEBHOOK_SECRET` → shared secret (optional)
4. Add an **On form submit** trigger for `onFormSubmit`
5. Set the same secret on the server:

```bash
WEBHOOK_SECRET=your-secret
```

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/resumes` | List orders |
| `GET` | `/api/resumes?seed=sample` | Create/load sample ServiceNow resume |
| `POST` | `/api/resumes` | Create from JSON / intake form |
| `GET/PATCH/DELETE` | `/api/resumes/:id` | Read / update / delete |
| `POST` | `/api/webhook/google-forms` | Google Forms webhook |

Resumes are stored in `data/resumes.json` (local JSON store — swap for a database when you scale).

## PDF export

On the preview page, use **Download / Print PDF** (browser print → Save as PDF). The print stylesheet isolates the resume sheet.

## Stack

Next.js App Router · TypeScript · Tailwind CSS v4 · file-based order store
