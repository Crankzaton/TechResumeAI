# TechResumeAI

Freelancer **resume agent**: clients fill Google Forms → agent builds a
technology-themed resume → emails you a one-click preview link to share.

Works for **any technology** you configure (ServiceNow, Salesforce, AWS, Azure,
React, Java, Python, Kubernetes, SAP, DevOps, or custom).

## Quick start

```bash
npm install
npm run dev
```

1. Open **Admin / Agent** → configure notify email + SMTP
2. **Technologies** → add stacks or use samples (one-click preview)
3. **Google Forms** → link a form to a technology, copy webhook URL
4. Paste `integrations/google-apps-script.gs` into the form’s sheet

## Agent automation

When a form is submitted:

1. Webhook receives answers  
2. Resume is generated in the linked technology theme  
3. You get an email: **Open resume (one click)**  
4. Print PDF and send to your customer  

Configure in Admin → **Agent** (or env):

```bash
NOTIFY_EMAIL=you@email.com
FROM_EMAIL=agent@yourdomain.com
PUBLIC_BASE_URL=https://your-app.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@email.com
SMTP_PASS=app-password
WEBHOOK_SECRET=optional-global-secret
```

## Admin console

| Tab | Purpose |
| --- | --- |
| Overview | Stats, one-click samples, agent activity |
| Technologies | Add any tech + colors + layout |
| Google Forms | Bind forms → technologies, webhook URLs |
| Agent | Email / SMTP / auto-generate toggles |
| Orders | All resumes, open / re-email |

## Layout styles

`platform-dark` · `cloud-blue` · `console-dark` · `portal-light` · `modern-clean` · `terminal`

## API

| Endpoint | Role |
| --- | --- |
| `POST /api/webhook/google-forms?formId=` | Form → agent pipeline |
| `GET/POST /api/technologies` | Tech catalog |
| `GET/POST /api/forms` | Form connections |
| `GET/PATCH /api/agent` | Agent settings + events |
| `GET /api/resumes?sample=techId` | One-click sample |
| `POST /api/resumes` | Manual / intake create |

Data is stored under `data/*.json` (swap for a DB when you scale).
