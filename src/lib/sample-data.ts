import type { ResumeData } from "./types";

/** Demo resume based on the ServiceNow reference design. */
export const SAMPLE_RESUME: Omit<
  ResumeData,
  "id" | "createdAt" | "updatedAt" | "status" | "source"
> = {
  theme: "servicenow",
  fullName: "Gokul Nath Varadarajan",
  contact: {
    phones: ["+91-7598868859", "9176889235"],
    email: "Gokul.Varadarajan@outlook.com",
    linkedin: "linkedin.com/in/gokulnath23/",
  },
  expertise: [
    "Customer Service Management",
    "ESC Portal Configuration",
    "Instance Branding",
    "Automated Testing Framework",
    "Flow Designer",
    "Performance Analytics",
    "Custom Flow Actions",
    "SLA",
    "Client Scripts & Business Rules",
    "SPM - Demand Management",
  ],
  certifications: [
    { name: "CSM - Suite Certification", category: "mainline" },
    { name: "Certified System Administrator", category: "mainline" },
    { name: "CIS - ITSM", category: "mainline" },
    { name: "FSO - Banking Accreditation", category: "mainline" },
    { name: "CIS - SPM", category: "mainline" },
    { name: "Certified System Administrator", category: "micro" },
    { name: "Performance Analytics", category: "micro" },
    { name: "Flow Designer", category: "micro" },
    { name: "Automated Test Framework", category: "micro" },
    { name: "Workplace Service Delivery Essentials", category: "micro" },
    { name: "Business English (Cert.TBE)", category: "other" },
    { name: "Google UX Professional Design", category: "other" },
    { name: "University of Cambridge", category: "other" },
  ],
  languages: [
    { name: "English", proficiency: "Native Proficiency" },
    { name: "Tamil", proficiency: "Native Proficiency" },
    { name: "Telugu", proficiency: "Native Proficiency" },
    { name: "Kannada", proficiency: "Spoken Proficiency" },
    { name: "Hindi", proficiency: "Basic Proficiency" },
  ],
  workExperience: [
    {
      title: "Senior Project Engineer",
      company: "Wipro",
      startDate: "18 Mar 2024",
      endDate: "Current",
      bullets: [
        "Experience in Instance Administration and Access management",
        "Custom Table Creation and Data Import management. Enhancement of record producer and custom form layout configurations",
        "Expertise in building complex Catalog items and flow designer to drive business process",
      ],
    },
    {
      title: "Infra Transformation Analyst",
      company: "Accenture",
      startDate: "28 Oct 2021",
      endDate: "15 Mar 2024",
      bullets: [
        "Experienced in Custom Application Development for Finance Cycles and Trade Management",
        "Worked on 3rd Party Integration to serve ServiceNow as a Client Interface for the Customer",
        "Worked on On-demand integration and custom use case management for the finance operation",
        "Technical requirement analysis and feasibility check management",
        "Worked on Dynamic payload creations and token management",
        "Worked in Global release and boarding of new markets for the banking operations",
        "Minimal experience in UI pages and custom UI actions",
        "Worked on Catalog management for the operations of Banking vertical",
        "Worked minimally on remote table creations",
      ],
    },
    {
      title: "Trainee Decision Scientist",
      company: "Musigma",
      startDate: "30 Oct 2019",
      endDate: "17 Aug 2021",
      bullets: [
        "Experienced in ITSM - CSM Modules on end to end Record producer life cycle development and management",
        "Implemented SLA & Flow designers and sub-flows. Expertise in Advanced notification configurations for the business requirements",
        "Worked on business rules, script includes, UI Policies, Client Scripts and Glide AJAX concepts to enhance business outcomes",
        "Trained in Automated Testing Framework (ATF)",
        "Experience in SPM - Demand Management",
        "Experience in Creating Reports and well trained in Performance analytics key concepts",
        "Worked on Complex Assessment requirements and Survey Configuration",
        "Experience in Assignment Rules and Native List Configuration View",
        "Worked on ServiceNow E-Bonding Integrations",
      ],
    },
  ],
  education: [
    {
      degree: "Bachelors' Degree",
      stream: "Electronics and Communication Engineering",
      institution: "Panimalar Engineering College, Chennai",
      startDate: "2015",
      endDate: "2019",
    },
  ],
  additionalWorks: [
    {
      description:
        "Well Experienced in Figma and Adobe XD designing and prototype creation for product presentations",
    },
    {
      description:
        "Google UX Professional Design training completed and Certified. Web and mobile prototype created for e-book website",
    },
  ],
};
