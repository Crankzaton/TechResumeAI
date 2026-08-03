export type ThemeId = "servicenow" | "salesforce" | "aws" | "azure";

export interface ContactInfo {
  phones: string[];
  email: string;
  linkedin?: string;
  website?: string;
  location?: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Education {
  degree: string;
  stream?: string;
  institution: string;
  startDate: string;
  endDate: string;
}

export interface Certification {
  name: string;
  category?: "mainline" | "micro" | "other";
}

export interface Language {
  name: string;
  proficiency: string;
}

export interface AdditionalWork {
  description: string;
}

export interface ResumeData {
  id: string;
  createdAt: string;
  updatedAt: string;
  source: "form" | "google-forms" | "manual";
  status: "new" | "previewed" | "delivered";
  theme: ThemeId;
  fullName: string;
  headline?: string;
  contact: ContactInfo;
  expertise: string[];
  certifications: Certification[];
  languages: Language[];
  workExperience: WorkExperience[];
  education: Education[];
  additionalWorks: AdditionalWork[];
  notes?: string;
}

export type ResumeInput = Omit<ResumeData, "id" | "createdAt" | "updatedAt" | "status"> & {
  status?: ResumeData["status"];
};

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  tagline: string;
  accent: string;
  background: string;
  description: string;
}
