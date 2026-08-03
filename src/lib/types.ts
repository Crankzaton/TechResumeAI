export type DesignTemplateId =
  | "classic"
  | "signal"
  | "mosaic"
  | "horizon"
  | "atelier"
  | "pulse";

/** How skill/tool tags render — avoids accidental white boxes on dark themes */
export type ChipStyle = "soft" | "accent" | "outline" | "contrast";

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

export interface ProjectItem {
  name: string;
  description: string;
  link?: string;
}

export type SectionKind =
  | "header"
  | "summary"
  | "impact"
  | "skills"
  | "tools"
  | "experience"
  | "projects"
  | "education"
  | "certs"
  | "languages"
  | "awards"
  | "interests"
  | "additional"
  | "custom";

/** Editable composition — order, titles, visibility, duplicates */
export interface ResumeSectionConfig {
  id: string;
  kind: SectionKind;
  title: string;
  visible: boolean;
  /** Freeform body for custom / duplicated text blocks */
  customBody?: string;
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

export interface OneDriveSettings {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  tenantId: string;
  refreshToken: string;
  folderPath: string;
}

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
  oneDrive: OneDriveSettings;
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
  /** Human-friendly ID shown in emails, e.g. TR-1042 */
  resumeNumber: string;
  createdAt: string;
  updatedAt: string;
  source: "form" | "google-forms" | "manual" | "agent" | "sample";
  status: ResumeStatus;
  technologyId: string;
  technologyName: string;
  layout: LayoutStyle;
  designTemplate?: DesignTemplateId;
  chipStyle?: ChipStyle;
  /** Optional override for skill/tool tag colors */
  chipColors?: { background: string; text: string };
  themeColors: Technology["colors"];
  formConnectionId?: string;
  fullName: string;
  headline?: string;
  summary?: string;
  contact: ContactInfo;
  expertise: string[];
  tools?: string[];
  certifications: Certification[];
  languages: Language[];
  workExperience: WorkExperience[];
  projects?: ProjectItem[];
  education: Education[];
  awards?: string[];
  interests?: string[];
  additionalWorks: AdditionalWork[];
  /** Visual section composition for WYSIWYG editing */
  sectionLayout?: ResumeSectionConfig[];
  notes?: string;
  agentLog?: string[];
  emailedAt?: string;
  emailError?: string;
  designVersion: number;
  previousLayouts?: LayoutStyle[];
  previousTemplates?: DesignTemplateId[];
  oneDriveWebUrl?: string;
  oneDriveItemId?: string;
}

export type ResumeInput = Omit<
  ResumeData,
  "id" | "createdAt" | "updatedAt" | "status" | "resumeNumber" | "designVersion"
> & {
  status?: ResumeStatus;
  resumeNumber?: string;
  designVersion?: number;
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
    | "form_linked"
    | "redesign"
    | "onedrive_saved";
  message: string;
  resumeId?: string;
  technologyId?: string;
  meta?: Record<string, string>;
}
