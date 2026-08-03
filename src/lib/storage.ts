import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import type {
  AgentEvent,
  AgentSettings,
  FormConnection,
  FormConnectionInput,
  ResumeData,
  ResumeInput,
  Technology,
  TechnologyInput,
} from "./types";
import { DEFAULT_TECHNOLOGIES } from "./default-technologies";

const DATA_DIR = path.join(process.cwd(), "data");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const full = path.join(DATA_DIR, file);
  try {
    const raw = await fs.readFile(full, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    await fs.writeFile(full, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  }
}

async function writeJson<T>(file: string, data: T) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, file),
    JSON.stringify(data, null, 2),
    "utf8",
  );
}

function now() {
  return new Date().toISOString();
}

function seedTechnologies(): Technology[] {
  const stamped = now();
  return DEFAULT_TECHNOLOGIES.map((t) => ({
    ...t,
    id: t.id || nanoid(8),
    createdAt: stamped,
    updatedAt: stamped,
    active: t.active ?? true,
  }));
}

export function defaultAgentSettings(): AgentSettings {
  return {
    freelancerName: "Gokul Nath",
    notifyEmail: process.env.NOTIFY_EMAIL || "gokulnathgoku23@gmail.com",
    fromEmail:
      process.env.FROM_EMAIL ||
      process.env.SMTP_USER ||
      "gokulnathgoku23@gmail.com",
    autoGenerate: true,
    autoEmail: true,
    publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://localhost:3000",
    smtp: {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
      secure: process.env.SMTP_SECURE === "true",
    },
    oneDrive: {
      enabled: process.env.ONEDRIVE_ENABLED === "true",
      clientId: process.env.ONEDRIVE_CLIENT_ID || "",
      clientSecret: process.env.ONEDRIVE_CLIENT_SECRET || "",
      tenantId: process.env.ONEDRIVE_TENANT_ID || "common",
      refreshToken: process.env.ONEDRIVE_REFRESH_TOKEN || "",
      folderPath: process.env.ONEDRIVE_FOLDER || "TechResumeAI",
    },
    updatedAt: now(),
  };
}

/* -------- Technologies -------- */

export async function listTechnologies(): Promise<Technology[]> {
  let list = await readJson<Technology[]>("technologies.json", []);
  if (list.length === 0) {
    list = seedTechnologies();
    await writeJson("technologies.json", list);
  }
  return list.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getTechnology(id: string): Promise<Technology | null> {
  const list = await listTechnologies();
  return (
    list.find((t) => t.id === id || t.slug === id.toLowerCase()) ?? null
  );
}

export async function findTechnologyByName(
  name: string,
): Promise<Technology | null> {
  const list = await listTechnologies();
  const needle = name.toLowerCase().trim();
  return (
    list.find(
      (t) =>
        t.name.toLowerCase() === needle ||
        t.slug === needle ||
        needle.includes(t.slug) ||
        t.name.toLowerCase().includes(needle),
    ) ?? null
  );
}

export async function createTechnology(
  input: TechnologyInput,
): Promise<Technology> {
  const list = await listTechnologies();
  const item: Technology = {
    ...input,
    id: input.id || nanoid(8),
    createdAt: now(),
    updatedAt: now(),
    active: input.active ?? true,
  };
  list.push(item);
  await writeJson("technologies.json", list);
  return item;
}

export async function updateTechnology(
  id: string,
  patch: Partial<Technology>,
): Promise<Technology | null> {
  const list = await listTechnologies();
  const idx = list.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], ...patch, id, updatedAt: now() };
  await writeJson("technologies.json", list);
  return list[idx];
}

export async function deleteTechnology(id: string): Promise<boolean> {
  const list = await listTechnologies();
  const next = list.filter((t) => t.id !== id);
  if (next.length === list.length) return false;
  await writeJson("technologies.json", next);
  return true;
}

/* -------- Form connections -------- */

export async function listFormConnections(): Promise<FormConnection[]> {
  return readJson<FormConnection[]>("forms.json", []);
}

export async function getFormConnection(
  id: string,
): Promise<FormConnection | null> {
  const list = await listFormConnections();
  return list.find((f) => f.id === id) ?? null;
}

export async function createFormConnection(
  input: FormConnectionInput,
): Promise<FormConnection> {
  const list = await listFormConnections();
  const item: FormConnection = {
    ...input,
    id: input.id || nanoid(8),
    createdAt: now(),
    updatedAt: now(),
    active: input.active ?? true,
  };
  list.unshift(item);
  await writeJson("forms.json", list);
  return item;
}

export async function updateFormConnection(
  id: string,
  patch: Partial<FormConnection>,
): Promise<FormConnection | null> {
  const list = await listFormConnections();
  const idx = list.findIndex((f) => f.id === id);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], ...patch, id, updatedAt: now() };
  await writeJson("forms.json", list);
  return list[idx];
}

export async function deleteFormConnection(id: string): Promise<boolean> {
  const list = await listFormConnections();
  const next = list.filter((f) => f.id !== id);
  if (next.length === list.length) return false;
  await writeJson("forms.json", next);
  return true;
}

/* -------- Resumes -------- */

async function nextResumeNumber(): Promise<string> {
  const counter = await readJson<{ last: number }>("resume-counter.json", {
    last: 1000,
  });
  const next = counter.last + 1;
  await writeJson("resume-counter.json", { last: next });
  return `TR-${next}`;
}

export async function listResumes(): Promise<ResumeData[]> {
  const resumes = await readJson<ResumeData[]>("resumes.json", []);
  return resumes.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getResume(idOrNumber: string): Promise<ResumeData | null> {
  const resumes = await listResumes();
  const key = idOrNumber.trim().toUpperCase();
  return (
    resumes.find(
      (r) =>
        r.id === idOrNumber ||
        r.resumeNumber?.toUpperCase() === key ||
        r.resumeNumber?.toUpperCase() === `TR-${key.replace(/^TR-/, "")}`,
    ) ?? null
  );
}

export async function createResume(input: ResumeInput): Promise<ResumeData> {
  const resumes = await readJson<ResumeData[]>("resumes.json", []);
  const resumeNumber = input.resumeNumber || (await nextResumeNumber());
  const resume: ResumeData = {
    ...input,
    id: nanoid(10),
    resumeNumber,
    designVersion: input.designVersion ?? 1,
    createdAt: now(),
    updatedAt: now(),
    status: input.status ?? "new",
  };
  resumes.unshift(resume);
  await writeJson("resumes.json", resumes);
  return resume;
}

export async function updateResume(
  id: string,
  patch: Partial<ResumeData>,
): Promise<ResumeData | null> {
  const resumes = await readJson<ResumeData[]>("resumes.json", []);
  const idx = resumes.findIndex(
    (r) => r.id === id || r.resumeNumber === id,
  );
  if (idx < 0) return null;
  resumes[idx] = {
    ...resumes[idx],
    ...patch,
    id: resumes[idx].id,
    updatedAt: now(),
  };
  await writeJson("resumes.json", resumes);
  return resumes[idx];
}

export async function deleteResume(id: string): Promise<boolean> {
  const resumes = await readJson<ResumeData[]>("resumes.json", []);
  const next = resumes.filter((r) => r.id !== id && r.resumeNumber !== id);
  if (next.length === resumes.length) return false;
  await writeJson("resumes.json", next);
  return true;
}

/* -------- Agent settings & events -------- */

export async function getAgentSettings(): Promise<AgentSettings> {
  const stored = await readJson<AgentSettings | null>("agent-settings.json", null);
  if (!stored) {
    const defaults = defaultAgentSettings();
    await writeJson("agent-settings.json", defaults);
    return defaults;
  }
  // merge env overrides when SMTP empty
  const defaults = defaultAgentSettings();
  return {
    ...defaults,
    ...stored,
    smtp: {
      ...defaults.smtp,
      ...stored.smtp,
      host: stored.smtp?.host || defaults.smtp.host,
      user: stored.smtp?.user || defaults.smtp.user,
      pass: stored.smtp?.pass || defaults.smtp.pass,
    },
    oneDrive: {
      ...defaults.oneDrive,
      ...(stored.oneDrive || {}),
      clientId: stored.oneDrive?.clientId || defaults.oneDrive.clientId,
      clientSecret:
        stored.oneDrive?.clientSecret || defaults.oneDrive.clientSecret,
      refreshToken:
        stored.oneDrive?.refreshToken || defaults.oneDrive.refreshToken,
    },
    notifyEmail: stored.notifyEmail || defaults.notifyEmail,
    fromEmail: stored.fromEmail || defaults.fromEmail,
    publicBaseUrl: stored.publicBaseUrl || defaults.publicBaseUrl,
  };
}

export async function saveAgentSettings(
  patch: Partial<AgentSettings>,
): Promise<AgentSettings> {
  const current = await getAgentSettings();
  const next: AgentSettings = {
    ...current,
    ...patch,
    smtp: { ...current.smtp, ...(patch.smtp || {}) },
    oneDrive: { ...current.oneDrive, ...(patch.oneDrive || {}) },
    updatedAt: now(),
  };
  await writeJson("agent-settings.json", next);
  return next;
}

export async function listAgentEvents(limit = 50): Promise<AgentEvent[]> {
  const events = await readJson<AgentEvent[]>("agent-events.json", []);
  return events
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
}

export async function addAgentEvent(
  event: Omit<AgentEvent, "id" | "createdAt">,
): Promise<AgentEvent> {
  const events = await readJson<AgentEvent[]>("agent-events.json", []);
  const item: AgentEvent = {
    ...event,
    id: nanoid(8),
    createdAt: now(),
  };
  events.unshift(item);
  await writeJson("agent-events.json", events.slice(0, 200));
  return item;
}
