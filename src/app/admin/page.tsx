import Link from "next/link";
import { listResumes } from "@/lib/storage";
import { getTheme } from "@/lib/themes";
import { SeedSampleButton } from "@/components/admin/SeedSampleButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const resumes = await listResumes();

  return (
    <div className="page">
      <header className="page-header">
        <h1>Resume orders</h1>
        <p>
          Every intake form submission and Google Forms webhook lands here.
          Open a preview, export PDF, then mark it delivered.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/intake" className="primary-btn">
            New resume
          </Link>
          <SeedSampleButton />
        </div>
      </header>

      {resumes.length === 0 ? (
        <div className="empty-state">
          <p>No resumes yet. Create one from the intake form or seed the sample.</p>
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
            <SeedSampleButton />
          </div>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Theme</th>
              <th>Source</th>
              <th>Status</th>
              <th>Created</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {resumes.map((resume) => (
              <tr key={resume.id}>
                <td>
                  <strong>{resume.fullName}</strong>
                  <div style={{ color: "var(--steel)", fontSize: "0.85rem" }}>
                    {resume.contact.email}
                  </div>
                </td>
                <td>{getTheme(resume.theme).name}</td>
                <td>{resume.source}</td>
                <td>
                  <span className={`status-pill ${resume.status}`}>
                    {resume.status}
                  </span>
                </td>
                <td>{new Date(resume.createdAt).toLocaleString()}</td>
                <td>
                  <Link href={`/preview/${resume.id}`}>Open preview</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
