import { AdminConsole } from "@/components/admin/AdminConsole";
import {
  getAgentSettings,
  listAgentEvents,
  listFormConnections,
  listResumes,
  listTechnologies,
} from "@/lib/storage";
import { isSmtpConfigured } from "@/lib/email";
import { isOneDriveConfigured } from "@/lib/onedrive";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [technologies, forms, resumes, settings, events] = await Promise.all([
    listTechnologies(),
    listFormConnections(),
    listResumes(),
    getAgentSettings(),
    listAgentEvents(40),
  ]);

  const initial = {
    technologies,
    forms,
    resumes: resumes.map((r) => ({
      id: r.id,
      resumeNumber: r.resumeNumber,
      fullName: r.fullName,
      technologyName: r.technologyName,
      layout: r.layout,
      designVersion: r.designVersion,
      status: r.status,
      source: r.source,
      createdAt: r.createdAt,
      contact: { email: r.contact.email },
    })),
    agent: {
      settings: {
        ...settings,
        smtp: {
          ...settings.smtp,
          pass: settings.smtp.pass ? "••••••••" : "",
        },
        oneDrive: {
          ...settings.oneDrive,
          clientSecret: settings.oneDrive?.clientSecret ? "••••••••" : "",
          refreshToken: settings.oneDrive?.refreshToken ? "••••••••" : "",
        },
      },
      smtpConfigured: isSmtpConfigured(settings),
      oneDriveConfigured: isOneDriveConfigured(settings),
      events,
    },
  };

  return (
    <div className="page page-wide">
      <header className="page-header">
        <h1>Admin console & Resume Agent</h1>
        <p>
          Manage any technology theme, connect Google Forms, and let the agent
          auto-build resumes + email you a one-click share link.
        </p>
      </header>
      <AdminConsole initial={initial} />
    </div>
  );
}
