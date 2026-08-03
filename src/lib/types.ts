export type LayoutStyle =
  | "platform-dark"
  | "cloud-blue"
  | "console-dark"
  | "portal-light"
  | "modern-clean"
  | "terminal";

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

export interface Technology {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  layout: LayoutStyle;
  colors: {
    background: string;
    surface: string;
    accent: string;
    accentText: string;
    text: string;
    muted: string;
    cardHeader: string;
    cardBody: string;
    sidebar: string;
  };
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export type TechnologyInput = Omit<Technology, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};

export interface FormConnection {
  id: string;
  name: string;
  technologyId: string;
  googleFormUrl?: string;
  formIdHint?: string;
  fieldMapNotes?: string;
  webhookSecret?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FormConnectionInput = Omit<
  FormConnection,
  "id" | "createdAt" | "updatedAt"
> & { id?: string };

export interface AgentSettings {
  freelancerName: string;
  notifyEmail: string;
  fromEmail: string;
  autoGenerate: boolean;
  autoEmail: boolean;
  publicBaseUrl: string;
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
  };
  updatedAt: string;
}

export type ResumeStatus =
  | "new"
  | "generating"
  | "ready"
  | "previewed"
  | "emailed"
  | "delivered"
  | "failed";

export interface ResumeData {
  id: string;
  createdAt: string;
  updatedAt: string;
  source: "form" | "google-forms" | "manual" | "agent" | "sample";
  status: ResumeStatus;
  technologyId: string;
  technologyName: string;
  layout: LayoutStyle;
  themeColors: Technology["colors"];
  formConnectionId?: string;
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
  agentLog?: string[];
  emailedAt?: string;
  emailError?: string;
}

export type ResumeInput = Omit<
  ResumeData,
  "id" | "createdAt" | "updatedAt" | "status"
> & {
  status?: ResumeStatus;
};

export interface AgentEvent {
  id: string;
  createdAt: string;
  type:
    | "form_received"
    | "resume_built"
    | "email_sent"
    | "email_failed"
    | "manual_build"
    | "tech_created"
    | "form_linked";
  message: string;
  resumeId?: string;
  technologyId?: string;
  meta?: Record<string, string>;
}
