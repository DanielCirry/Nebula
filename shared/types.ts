export interface PortfolioMeta {
  initials: string
  title: string
  generatedAt: string
  version: number
  adminPasswordHash?: string
  sectionHeadings?: Record<string, string>
}

export interface SkillCategory {
  category: string
  items: string[]
}

export interface ExperienceEntry {
  role: string
  company: string
  period: string
  highlights: string[]
}

export interface EducationEntry {
  degree: string
  institution: string
  year: string
}

export interface ProjectEntry {
  name: string
  company?: string
  description: string
  role?: string
  tech: string[]
  highlights?: string[]
  link?: string
}

export interface OtherSection {
  heading: string
  content: string
}

export interface ProtectedContact {
  encrypted: true
}

export interface PlainContact {
  encrypted: false
  data: Record<string, string>
}

export type ContactData = ProtectedContact | PlainContact

export interface PortfolioData {
  meta: PortfolioMeta
  profile: { summary: string }
  skills: SkillCategory[]
  experience: ExperienceEntry[]
  education: EducationEntry[]
  projects: ProjectEntry[]
  other: OtherSection[]
  contact: ContactData
}

export interface UploadRequest {
  password: string
  contactPasscode: string
  file: File
}

export interface RevealContactRequest {
  passcode: string
}

export interface RevealContactResponse {
  email?: string
  phone?: string
  linkedin?: string
  [key: string]: string | undefined
}
