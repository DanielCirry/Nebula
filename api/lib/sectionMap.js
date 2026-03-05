export const SECTION_MAP = {
  profile: ['profile', 'summary', 'about', 'about me', 'objective', 'personal statement', 'bio', 'personal profile', 'professional summary', 'career objective'],
  experience: ['experience', 'experiences', 'employment', 'work history', 'career', 'professional experience', 'work experience', 'work experiences', 'employment history', 'career history'],
  skills: ['skills', 'technical skills', 'other skills', 'competencies', 'core competencies', 'technologies', 'expertise', 'technical expertise', 'key skills', 'abilities', 'soft skills', 'hard skills'],
  education: ['education', 'academic', 'qualifications', 'academic qualifications', 'training', 'academic background'],
  projects: ['projects', 'portfolio', 'selected work', 'key projects', 'personal projects', 'notable projects', 'project experience'],
  contact: ['contact', 'contact information', 'contact details', 'get in touch', 'contact me'],
  certifications: ['certifications', 'certificates', 'accreditations', 'professional certifications', 'licenses'],
  languages: ['languages', 'language skills', 'language proficiency'],
  interests: ['interests', 'hobbies', 'hobbies and interests'],
  references: ['references', 'referees'],
}

export function classifyHeading(heading) {
  const normalized = heading.toLowerCase().trim()

  // Exact match first
  for (const [section, keywords] of Object.entries(SECTION_MAP)) {
    if (keywords.includes(normalized)) return section
  }

  // Fuzzy match: find the longest keyword match to pick the most specific section
  let bestSection = null
  let bestLength = 0

  for (const [section, keywords] of Object.entries(SECTION_MAP)) {
    for (const kw of keywords) {
      if (normalized.includes(kw) && kw.length > bestLength) {
        bestSection = section
        bestLength = kw.length
      }
      if (kw.includes(normalized) && normalized.length > 3 && normalized.length > bestLength) {
        bestSection = section
        bestLength = normalized.length
      }
    }
  }

  return bestSection
}
