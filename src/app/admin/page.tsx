import { AdminConsole } from "@/components/admin/AdminConsole";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <div className="page page-wide">
      <header className="page-header">
        <h1>Admin console & Resume Agent</h1>
        <p>
          Manage any technology theme, connect Google Forms, and let the agent
          auto-build resumes + email you a one-click share link.
        </p>
      </header>
      <AdminConsole />
    </div>
  );
}
