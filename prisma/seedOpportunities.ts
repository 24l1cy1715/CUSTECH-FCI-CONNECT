import { PrismaClient } from '../server/node_modules/.prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding FCI Opportunities...');

  // Find an admin or first user as creator
  const user = await prisma.user.findFirst({
    include: { profile: true },
  });

  if (!user) {
    console.error('No user found to create opportunities');
    return;
  }

  // Get skills
  const skills = await prisma.skill.findMany();
  const skillMap = new Map(skills.map((s) => [s.slug, s.id]));

  const opportunitiesData = [
    {
      slug: 'securetech-cybersecurity-intern-2026',
      title: 'Cybersecurity Operations & Threat Analysis Intern',
      organization: 'SecureTech Nigeria Solutions',
      category: 'INTERNSHIP' as any,
      location: 'Lagos / Hybrid',
      isRemote: true,
      applicationUrl: 'https://securetech.ng/careers/internships',
      applicationProcess: 'Submit your CV and CUSTECH FCI Connect portfolio link via the portal. Shortlisted candidates will be invited for a technical assessment on network defense.',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days left
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      eligibility: 'Open to 300L, 400L & 500L Cyber Security, Computer Science, and Software Engineering students with strong foundation in Linux and network fundamentals.',
      status: 'APPROVED' as any,
      isFeatured: true,
      description: `Join SecureTech's Tier-1 Security Operations Center (SOC) team as a junior security analyst. You will gain direct experience with:
- Investigating real-time endpoint telemetry and intrusion alerts
- Log parsing and SIEM configuration
- Penetration testing lab environments
- Automated script development in Python for vulnerability mitigation.

Stipend provided along with full mentorship from certified CISSP professionals.`,
      requiredSkills: [
        { slug: 'cybersecurity', priority: 'REQUIRED' as any, minLevel: 'INTERMEDIATE' as any },
        { slug: 'linux', priority: 'REQUIRED' as any, minLevel: 'INTERMEDIATE' as any },
        { slug: 'python', priority: 'REQUIRED' as any, minLevel: 'BEGINNER' as any },
        { slug: 'networking', priority: 'PREFERRED' as any, minLevel: 'BEGINNER' as any },
      ],
    },
    {
      slug: 'custech-confluence-hackathon-2026',
      title: 'CUSTECH Confluence Innovation Hackathon 2026',
      organization: 'CUSTECH Faculty of Computing & Informatics',
      category: 'HACKATHON' as any,
      location: 'FCI Complex Auditorium, Osara',
      isRemote: false,
      applicationUrl: 'https://hackathon.custech.edu.ng/register',
      applicationProcess: 'Form a team of 2-4 members on FCI Connect Team Builder and register your project pitch before the deadline.',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days left
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      eligibility: 'All active undergraduate students of CUSTECH (any department in FCI or Faculty of Engineering).',
      status: 'APPROVED' as any,
      isFeatured: true,
      description: `The premier annual student hackathon organized by FCI CUSTECH! Build transformative software, AI, or IoT solutions tackling regional challenges in Kogi State and Nigeria:
- Track 1: Smart Agriculture & Agritech Sensors
- Track 2: Fintech & Micro-Savings for Rural Merchants
- Track 3: Healthcare Diagnostics & Telemedicine
- Track 4: Cybersecurity & Cloud Infrastructure

Grand Prize: ₦1,500,000 + Incubation Support at CUSTECH Innovation Hub.`,
      requiredSkills: [
        { slug: 'react', priority: 'REQUIRED' as any, minLevel: 'INTERMEDIATE' as any },
        { slug: 'node-js', priority: 'REQUIRED' as any, minLevel: 'INTERMEDIATE' as any },
        { slug: 'ui-ux', priority: 'PREFERRED' as any, minLevel: 'BEGINNER' as any },
      ],
    },
    {
      slug: 'google-developer-scholarship-africa-2026',
      title: 'Google Africa Developer Scholarship (GADS) 2026',
      organization: 'Google Developers & Pluralsight',
      category: 'SCHOLARSHIP' as any,
      location: 'Worldwide / Remote',
      isRemote: true,
      applicationUrl: 'https://developers.google.com/community/scholarships',
      applicationProcess: 'Apply online and complete the initial Pluralsight skill assessment within 10 days of acceptance.',
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days left (closing soon!)
      startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      eligibility: 'Must be an African resident university student pursuing a degree in computing, engineering, or related STEM fields.',
      status: 'APPROVED' as any,
      isFeatured: true,
      description: `Comprehensive 6-month scholarship covering deep technical tracks in Cloud Architecture (Google Cloud), Mobile Web Specialist, and Associate Android Developer. Includes certification exam vouchers fully covered by Google.`,
      requiredSkills: [
        { slug: 'cloud', priority: 'REQUIRED' as any, minLevel: 'BEGINNER' as any },
        { slug: 'devops', priority: 'PREFERRED' as any, minLevel: 'BEGINNER' as any },
      ],
    },
    {
      slug: 'fintech-fullstack-software-engineer-contract',
      title: 'Junior Fullstack Engineer (React & TypeScript)',
      organization: 'PayBridge Technologies',
      category: 'JOB' as any,
      location: 'Abuja / Remote',
      isRemote: true,
      applicationUrl: 'https://paybridge.tech/jobs/fullstack-junior',
      applicationProcess: 'Submit your GitHub, live projects, and portfolio. Qualified candidates will complete a 48-hour take-home API challenge.',
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      eligibility: 'Final year (400L/500L) students or recent graduates with demonstrable fullstack web application projects.',
      status: 'APPROVED' as any,
      isFeatured: false,
      description: `PayBridge is expanding our merchant settlement infrastructure across West Africa. Looking for passionate builders experienced with modern React, TypeScript, Node.js, and relational SQL databases. Competitive junior compensation in USD/NGN.`,
      requiredSkills: [
        { slug: 'react', priority: 'REQUIRED' as any, minLevel: 'ADVANCED' as any },
        { slug: 'typescript', priority: 'REQUIRED' as any, minLevel: 'INTERMEDIATE' as any },
        { slug: 'database', priority: 'REQUIRED' as any, minLevel: 'INTERMEDIATE' as any },
        { slug: 'node-js', priority: 'PREFERRED' as any, minLevel: 'INTERMEDIATE' as any },
      ],
    },
    {
      slug: 'ai-machine-learning-research-fellowship',
      title: 'Applied AI & Computer Vision Research Fellowship',
      organization: 'African Institute for Mathematical Sciences (AIMS)',
      category: 'FELLOWSHIP' as any,
      location: 'Kigali / Remote',
      isRemote: true,
      applicationUrl: 'https://aims.ac.rw/fellowships/ai-2026',
      applicationProcess: 'Submit an academic transcript, research statement (max 2 pages), and two references.',
      deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      eligibility: 'Undergraduate or postgraduate students in Computer Science, Data Science, or Mathematics with high academic standing.',
      status: 'APPROVED' as any,
      isFeatured: false,
      description: `A 6-month paid research fellowship focusing on low-resource language processing and satellite computer vision for climate monitoring in Sub-Saharan Africa. Fellows will co-author papers for top-tier machine learning conferences (NeurIPS/ICLR).`,
      requiredSkills: [
        { slug: 'ai-machine-learning', priority: 'REQUIRED' as any, minLevel: 'INTERMEDIATE' as any },
        { slug: 'python', priority: 'REQUIRED' as any, minLevel: 'ADVANCED' as any },
        { slug: 'data-science', priority: 'REQUIRED' as any, minLevel: 'INTERMEDIATE' as any },
      ],
    },
    {
      slug: 'ui-ux-design-workshop-custech',
      title: 'Intensive UI/UX Design System Workshop & Portfolio Sprint',
      organization: 'FCI Creative Computing Lab & Figma Africa',
      category: 'WORKSHOP' as any,
      location: 'FCI Complex Computer Lab 2, Osara',
      isRemote: false,
      applicationUrl: 'https://custech.edu.ng/fci/workshops/uiux',
      applicationProcess: 'Register with your student ID on FCI Connect. Limited to 50 participants.',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      eligibility: 'All FCI students interested in modern product design, user research, wireframing, and component design systems.',
      status: 'APPROVED' as any,
      isFeatured: false,
      description: `Learn industry-standard design thinking, Figma auto-layout, interactive prototyping, and design token management. Every participant completes a polished mobile app case study ready for their FCI portfolio.`,
      requiredSkills: [
        { slug: 'ui-ux', priority: 'REQUIRED' as any, minLevel: 'BEGINNER' as any },
        { slug: 'graphic-design', priority: 'PREFERRED' as any, minLevel: 'BEGINNER' as any },
      ],
    },
  ];

  for (const opp of opportunitiesData) {
    const { requiredSkills, ...oppFields } = opp;
    const created = await prisma.opportunity.upsert({
      where: { slug: oppFields.slug },
      update: {
        ...oppFields,
        createdById: user.id,
      },
      create: {
        ...oppFields,
        createdById: user.id,
      },
    });

    // Seed skills for opportunity
    for (const rs of requiredSkills) {
      const skillId = skillMap.get(rs.slug);
      if (skillId) {
        await prisma.opportunitySkill.upsert({
          where: {
            opportunityId_skillId: {
              opportunityId: created.id,
              skillId,
            },
          },
          update: {
            priority: rs.priority,
            minLevel: rs.minLevel,
          },
          create: {
            opportunityId: created.id,
            skillId,
            priority: rs.priority,
            minLevel: rs.minLevel,
          },
        });
      }
    }
  }

  console.log('✓ Successfully seeded FCI Opportunities');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
