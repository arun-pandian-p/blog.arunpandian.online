export interface PersonalInfo {
  name: string;
  title: string;
  summary: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  website: string;
  location: string;
}

export interface Education {
  institution: string;
  degree: string;
  location: string;
  period: string;
}

export interface Project {
  title: string;
  stack: string[];
  github: string;
  bullets: string[];
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
}

export interface Certification {
  title: string;
  issuer: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  projects: Project[];
  experience: Experience[];
  skills: Record<string, string[]>;
  certifications: Certification[];
}
