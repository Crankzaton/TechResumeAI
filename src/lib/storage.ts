import { nanoid } from "nanoid";
import { promises as fs } from "fs";
import path from "path";
import type { ResumeData, ResumeInput } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "resumes.json");

async function ensureStore(): Promise<ResumeData[]> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as ResumeData[];
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
    return [];
  }
}

async function writeStore(resumes: ResumeData[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(resumes, null, 2), "utf8");
}

export async function listResumes(): Promise<ResumeData[]> {
  const resumes = await ensureStore();
  return resumes.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getResume(id: string): Promise<ResumeData | null> {
  const resumes = await ensureStore();
  return resumes.find((r) => r.id === id) ?? null;
}

export async function createResume(input: ResumeInput): Promise<ResumeData> {
  const resumes = await ensureStore();
  const now = new Date().toISOString();
  const resume: ResumeData = {
    ...input,
    id: nanoid(10),
    createdAt: now,
    updatedAt: now,
    status: input.status ?? "new",
  };
  resumes.unshift(resume);
  await writeStore(resumes);
  return resume;
}

export async function updateResume(
  id: string,
  patch: Partial<ResumeData>,
): Promise<ResumeData | null> {
  const resumes = await ensureStore();
  const index = resumes.findIndex((r) => r.id === id);
  if (index === -1) return null;
  const updated: ResumeData = {
    ...resumes[index],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
  resumes[index] = updated;
  await writeStore(resumes);
  return updated;
}

export async function deleteResume(id: string): Promise<boolean> {
  const resumes = await ensureStore();
  const next = resumes.filter((r) => r.id !== id);
  if (next.length === resumes.length) return false;
  await writeStore(next);
  return true;
}
