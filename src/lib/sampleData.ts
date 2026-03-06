import type { PortfolioData } from '../../shared/types'

export const sampleData: PortfolioData = {
  meta: {
    initials: 'J.D.',
    title: 'Software Developer',
    generatedAt: new Date().toISOString(),
    version: 1,
  },
  profile: {
    summary:
      'Experienced software developer with a passion for building scalable web applications and intuitive user interfaces. Comfortable across the full stack with a focus on clean, maintainable code.',
  },
  skills: [
    { category: 'Languages', items: ['TypeScript', 'Python', 'Go', 'SQL'] },
    { category: 'Frontend', items: ['React', 'Next.js', 'Tailwind CSS', 'Vue.js'] },
    { category: 'Backend', items: ['Node.js', 'Express', 'Django', 'PostgreSQL'] },
    { category: 'DevOps', items: ['Docker', 'AWS', 'CI/CD', 'Terraform'] },
  ],
  experience: [
    {
      role: 'Senior Developer',
      company: 'Acme Corp',
      period: '2022 – Present',
      highlights: [
        'Led development of customer-facing dashboard serving 50k+ monthly users',
        'Migrated legacy monolith to microservices architecture',
        'Mentored team of 4 junior developers',
      ],
    },
    {
      role: 'Full-Stack Developer',
      company: 'Startup Labs',
      period: '2019 – 2022',
      highlights: [
        'Built real-time collaboration features using WebSockets',
        'Designed and implemented RESTful API consumed by web and mobile clients',
        'Improved test coverage from 40% to 85%',
      ],
    },
  ],
  education: [
    {
      degree: 'BSc Computer Science',
      institution: 'State University',
      year: '2019',
    },
  ],
  projects: [
    {
      name: 'TaskFlow',
      description: 'Open-source project management tool with kanban boards and real-time updates.',
      tech: ['Next.js', 'PostgreSQL', 'Prisma', 'WebSockets'],
      highlights: [],
    },
    {
      name: 'CloudDeploy',
      description: 'CLI tool for one-command deployment to multiple cloud providers.',
      tech: ['Go', 'AWS SDK', 'Docker'],
      highlights: [],
    },
  ],
  other: [],
  contact: {
    encrypted: true,
  },
}
