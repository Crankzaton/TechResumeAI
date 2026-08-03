/**
 * LinkedIn-style sample profiles for demo / one-click previews.
 * Inspired by common public profile patterns (not real private data).
 */
export const SAMPLE_PROFILES: Record<string, Record<string, unknown>> = {
  default: {
    fullName: "Alex Morgan",
    headline: "Software Engineer",
    email: "alex.morgan@example.com",
    phones: "+1-415-555-0142",
    linkedin: "linkedin.com/in/alexmorgan",
    location: "San Francisco Bay Area",
    expertise: "APIs\nSystem Design\nAgile Delivery\nStakeholder Management",
    certifications: "AWS Cloud Practitioner",
    languages: "English: Native Proficiency",
    workExperience: `Software Engineer | Contoso | Jan 2021 - Current
- Delivered customer-facing features used by 200k+ monthly users
- Partnered with product and design on roadmap execution
- Improved release reliability with automated checks

Associate Engineer | Fabrikam | Jun 2018 - Dec 2020
- Built internal tools that reduced support tickets by 18%
- Mentored interns on code reviews and testing habits`,
    education: `B.S. Computer Science | State University | 2014 - 2018
Software Engineering`,
    additionalWorks: "Open-source contributor and meetup speaker",
  },

  servicenow: {
    fullName: "Gokul Nath Varadarajan",
    headline: "ServiceNow Developer | CIS-ITSM",
    email: "Gokul.Varadarajan@outlook.com",
    phones: "+91-7598868859\n9176889235",
    linkedin: "linkedin.com/in/gokulnath23/",
    expertise:
      "Customer Service Management\nESC Portal Configuration\nInstance Branding\nAutomated Testing Framework\nFlow Designer\nPerformance Analytics\nCustom Flow Actions\nSLA\nClient Scripts & Business Rules\nSPM - Demand Management",
    certifications_mainline:
      "CSM - Suite Certification\nCertified System Administrator\nCIS - ITSM\nFSO - Banking Accreditation\nCIS - SPM",
    certifications_micro:
      "Performance Analytics\nFlow Designer\nAutomated Test Framework\nWorkplace Service Delivery Essentials",
    certifications_other:
      "Business English (Cert.TBE)\nGoogle UX Professional Design\nUniversity of Cambridge",
    languages:
      "English: Native Proficiency\nTamil: Native Proficiency\nTelugu: Native Proficiency\nKannada: Spoken Proficiency\nHindi: Basic Proficiency",
    workExperience: `Senior Project Engineer | Wipro | 18 Mar 2024 - Current
- Experience in Instance Administration and Access management
- Custom Table Creation and Data Import management
- Expertise in building complex Catalog items and Flow Designer workflows

Infra Transformation Analyst | Accenture | 28 Oct 2021 - 15 Mar 2024
- Custom Application Development for Finance Cycles and Trade Management
- 3rd Party Integration to serve ServiceNow as a Client Interface
- Dynamic payload creations and token management

Trainee Decision Scientist | Musigma | 30 Oct 2019 - 17 Aug 2021
- ITSM - CSM Modules on end-to-end Record producer lifecycle
- SLA & Flow designers, Glide AJAX, and ATF`,
    education: `Bachelors' Degree | Panimalar Engineering College, Chennai | 2015 - 2019
Electronics and Communication Engineering`,
    additionalWorks:
      "Experienced in Figma and Adobe XD prototype creation\nGoogle UX Professional Design certified",
  },

  salesforce: {
    fullName: "Priya Nair",
    headline: "Salesforce Developer | Platform App Builder",
    email: "priya.nair@example.com",
    phones: "+91-98840-11223",
    linkedin: "linkedin.com/in/priyanair-sfdc",
    location: "Bengaluru, India",
    expertise:
      "Apex\nLightning Web Components\nFlow Builder\nSalesforce CPQ\nIntegration (REST/SOAP)\nExperience Cloud",
    certifications:
      "Platform Developer I\nPlatform App Builder\nAdministrator\nSales Cloud Consultant",
    languages: "English: Professional\nMalayalam: Native\nHindi: Professional",
    workExperience: `Salesforce Developer | Capgemini | Mar 2022 - Current
- Built LWC components for quote-to-cash journeys used by 1.2k sales users
- Automated approvals with Flow and reduced manual handoffs by 35%
- Integrated Salesforce with billing systems via named credentials

Salesforce Admin | Cognizant | Jul 2019 - Feb 2022
- Owned org hygiene, permission sets, and release readiness
- Delivered Experience Cloud portals for partner onboarding`,
    education: `B.Tech Information Technology | Anna University | 2015 - 2019`,
    additionalWorks: "Trailhead Ranger · 150+ badges",
  },

  aws: {
    fullName: "Daniel Okonkwo",
    headline: "AWS Solutions Architect",
    email: "daniel.okonkwo@example.com",
    phones: "+1-206-555-0198",
    linkedin: "linkedin.com/in/danielokonkwo",
    location: "Seattle, WA",
    expertise:
      "EC2\nECS/EKS\nLambda\nCloudFormation\nIAM\nVPC\nCost Optimization\nWell-Architected",
    certifications:
      "AWS Solutions Architect – Professional\nAWS Developer – Associate\nHashiCorp Terraform Associate",
    languages: "English: Native Proficiency",
    workExperience: `Cloud Architect | Amazon Web Services Partner | Jan 2021 - Current
- Designed multi-account landing zones for fintech customers
- Cut monthly spend 22% with rightsizing and Savings Plans guidance
- Led migration of monolith workloads to container platforms on EKS

DevOps Engineer | Nordstrom Technology | Aug 2017 - Dec 2020
- Built CI/CD pipelines on CodePipeline and GitHub Actions
- Improved deployment success rate from 91% to 98.5%`,
    education: `B.S. Computer Engineering | University of Washington | 2013 - 2017`,
    additionalWorks: "Speaker at Seattle AWS User Group",
  },

  azure: {
    fullName: "Sophie Laurent",
    headline: "Microsoft Azure Cloud Engineer",
    email: "sophie.laurent@example.com",
    phones: "+33-6-12-34-56-78",
    linkedin: "linkedin.com/in/sophielaurent-azure",
    location: "Paris, France",
    expertise:
      "Azure DevOps\nAKS\nApp Service\nBicep/ARM\nEntra ID\nMonitor\nSecurity Center",
    certifications:
      "AZ-104 Azure Administrator\nAZ-204 Azure Developer\nAZ-400 DevOps Engineer Expert",
    languages: "French: Native\nEnglish: Full Professional",
    workExperience: `Azure Engineer | Microsoft Partner | Feb 2020 - Current
- Implemented AKS platform with GitOps for 40+ microservices
- Standardized Bicep modules adopted across three business units
- Reduced incident MTTR using Azure Monitor workbooks

Cloud Consultant | Capgemini | Sep 2016 - Jan 2020
- Migrated on-prem .NET apps to App Service and SQL Azure`,
    education: `MSc Computer Science | EPITA | 2014 - 2016`,
  },

  react: {
    fullName: "Maya Chen",
    headline: "Senior Frontend Engineer · React",
    email: "maya.chen@example.com",
    phones: "+1-646-555-0177",
    linkedin: "linkedin.com/in/mayachen-react",
    location: "New York, NY",
    expertise:
      "React\nTypeScript\nNext.js\nDesign Systems\nPerformance\nAccessibility\nGraphQL",
    certifications: "Meta Front-End Developer Professional Certificate",
    languages: "English: Native\nMandarin: Professional",
    workExperience: `Senior Frontend Engineer | Stripe | Apr 2021 - Current
- Led dashboard redesign improving task completion time by 27%
- Built shared component library used by 8 product teams
- Championed accessibility audits across checkout surfaces

Frontend Engineer | Spotify | Jun 2018 - Mar 2021
- Shipped React features for playlist and discovery experiences`,
    education: `B.A. Interactive Media | NYU | 2014 - 2018`,
    additionalWorks: "Maintainer of open-source React hooks library (2k★)",
  },

  java: {
    fullName: "Rahul Mehta",
    headline: "Java / Spring Boot Engineer",
    email: "rahul.mehta@example.com",
    phones: "+91-98100-44556",
    linkedin: "linkedin.com/in/rahulmehta-java",
    location: "Pune, India",
    expertise:
      "Java 17\nSpring Boot\nMicroservices\nKafka\nPostgreSQL\nDocker\nREST APIs",
    certifications: "Oracle Certified Professional Java SE\nSpring Professional",
    languages: "English: Professional\nHindi: Native\nMarathi: Native",
    workExperience: `Senior Java Developer | Infosys | Jan 2020 - Current
- Built payment microservices processing 3M events/day on Kafka
- Improved API p95 latency from 420ms to 180ms
- Introduced contract testing across 12 services

Java Developer | TCS | Jul 2016 - Dec 2019
- Delivered Spring Batch jobs for banking reconciliation`,
    education: `B.E. Computer Engineering | COEP | 2012 - 2016`,
  },

  python: {
    fullName: "Elena Petrova",
    headline: "Python Engineer · Data Platforms",
    email: "elena.petrova@example.com",
    phones: "+49-170-1234567",
    linkedin: "linkedin.com/in/elenapetrova-python",
    location: "Berlin, Germany",
    expertise:
      "Python\nFastAPI\nPandas\nAirflow\ndbt\nPostgreSQL\nML Ops basics",
    certifications: "Google Data Analytics Certificate\nAWS Data Analytics Specialty",
    languages: "Russian: Native\nEnglish: Full Professional\nGerman: Professional",
    workExperience: `Data Platform Engineer | Delivery Hero | May 2021 - Current
- Built Airflow pipelines feeding executive metrics dashboards
- Reduced pipeline failures 40% with observability and retries
- Partnered with analysts on dbt models for order quality

Python Developer | Zalando | Aug 2018 - Apr 2021
- Developed FastAPI services for catalog enrichment`,
    education: `MSc Data Science | TU Berlin | 2016 - 2018`,
  },

  kubernetes: {
    fullName: "James Whitfield",
    headline: "Kubernetes Platform Engineer",
    email: "james.whitfield@example.com",
    phones: "+44-7700-900123",
    linkedin: "linkedin.com/in/jameswhitfield-k8s",
    location: "London, UK",
    expertise:
      "Kubernetes\nHelm\nTerraform\nGitOps (Argo CD)\nPrometheus\nGrafana\nSecurity Policies",
    certifications:
      "CKA\nCKAD\nHashiCorp Terraform Associate",
    languages: "English: Native Proficiency",
    workExperience: `Platform Engineer | Monzo | Mar 2021 - Current
- Operated multi-cluster Kubernetes platform for 200+ services
- Implemented progressive delivery with Argo Rollouts
- Cut cluster cost 18% via bin-packing and node autoscaling

SRE | BBC | Jan 2018 - Feb 2021
- Migrated legacy VMs to container workloads on EKS`,
    education: `BSc Computing | University of Manchester | 2013 - 2016`,
  },

  sap: {
    fullName: "Ananya Krishnan",
    headline: "SAP Consultant · S/4HANA",
    email: "ananya.krishnan@example.com",
    phones: "+91-98400-77889",
    linkedin: "linkedin.com/in/ananyakrishnan-sap",
    location: "Hyderabad, India",
    expertise:
      "SAP S/4HANA\nFiori\nABAP\nMM/SD\nIntegration Suite\nProcess Design",
    certifications: "SAP Certified Application Associate — S/4HANA\nSAP Fiori",
    languages: "English: Professional\nTamil: Native\nHindi: Professional",
    workExperience: `SAP Consultant | SAP Partner | Jun 2019 - Current
- Led S/4HANA greenfield workshops for manufacturing clients
- Delivered Fiori apps and custom ABAP enhancements
- Coordinated cutover for multi-country rollouts

SAP Analyst | Deloitte | Aug 2016 - May 2019
- Supported MM/SD process improvements and testing cycles`,
    education: `MBA Operations | XLRI | 2014 - 2016`,
  },

  devops: {
    fullName: "Chris Alvarez",
    headline: "DevOps / SRE Engineer",
    email: "chris.alvarez@example.com",
    phones: "+1-512-555-0133",
    linkedin: "linkedin.com/in/chrisalvarez-sre",
    location: "Austin, TX",
    expertise:
      "CI/CD\nTerraform\nKubernetes\nObservability\nIncident Response\nSLO Design",
    certifications: "CKA\nAWS SysOps Administrator\nGoogle Cloud DevOps Engineer",
    languages: "English: Native\nSpanish: Professional",
    workExperience: `SRE | GitLab | Feb 2022 - Current
- Owned CI runner fleet reliability and autoscaling
- Defined SLOs that reduced pager noise by 30%
- Automated runbooks for top recurring incidents

DevOps Engineer | Dell Technologies | Jul 2018 - Jan 2022
- Built Terraform modules for multi-region infrastructure`,
    education: `B.S. Information Systems | UT Austin | 2014 - 2018`,
  },
};
