import { PrismaClient, RoleName, Department, Level, ProjectCategory, ProjectStatus, NewsStatus, RoomType, ListingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { prisma } from '../server/src/config/prisma';

async function main() {
  console.log('🌱 Starting CUSTECH FCI CONNECT database seed...');

  // 1. Seed Roles
  const roles: RoleName[] = [
    'STUDENT',
    'BUSINESS_OWNER',
    'EDITOR',
    'MODERATOR',
    'ADMIN',
    'SUPER_ADMIN',
  ];

  const roleMap: Record<string, string> = {};

  for (const roleName of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    roleMap[roleName] = role.id;
  }
  console.log('✓ Roles seeded');

  // 2. Seed Super Admin
  const adminPasswordHash = await bcrypt.hash('Admin@FCI2024!', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@custech.edu.ng' },
    update: {},
    create: {
      email: 'admin@custech.edu.ng',
      passwordHash: adminPasswordHash,
      emailVerified: true,
      userRoles: {
        create: [
          { roleId: roleMap['SUPER_ADMIN'] },
          { roleId: roleMap['ADMIN'] },
        ],
      },
      profile: {
        create: {
          username: 'fci_admin',
          fullName: 'Prof. S. O. Jimoh',
          department: 'CYBER_SECURITY',
          level: 'PHD',
          bio: 'Faculty of Computing and Informatics Systems Administrator & Cybersecurity Lead.',
          communityPoints: 5000,
        },
      },
    },
  });
  console.log(`✓ Admin user created (${adminUser.email})`);

  // 3. Seed Sample Student Users
  const studentPasswordHash = await bcrypt.hash('Student@2024', 12);

  const studentA = await prisma.user.upsert({
    where: { email: 'musa.abdullahi@custech.edu.ng' },
    update: {},
    create: {
      email: 'musa.abdullahi@custech.edu.ng',
      passwordHash: studentPasswordHash,
      emailVerified: true,
      userRoles: {
        create: [{ roleId: roleMap['STUDENT'] }],
      },
      profile: {
        create: {
          username: 'dev_musa',
          fullName: 'Musa Abdullahi',
          matricId: 'CUS/FCI/21/0042',
          department: 'SOFTWARE_ENGINEERING',
          level: 'LEVEL_400',
          bio: 'Fullstack engineer & open-source contributor. Building high-performance distributed systems.',
          githubUrl: 'https://github.com/musa-abdullahi',
          communityPoints: 1450,
          skills: JSON.stringify(['React', 'TypeScript', 'Node.js', 'Go', 'Docker']),
        },
      },
    },
  });

  const studentB = await prisma.user.upsert({
    where: { email: 'aisha.bello@custech.edu.ng' },
    update: {},
    create: {
      email: 'aisha.bello@custech.edu.ng',
      passwordHash: studentPasswordHash,
      emailVerified: true,
      userRoles: {
        create: [{ roleId: roleMap['STUDENT'] }],
      },
      profile: {
        create: {
          username: 'aisha_cyber',
          fullName: 'Aisha Bello',
          matricId: 'CUS/FCI/22/0118',
          department: 'CYBER_SECURITY',
          level: 'LEVEL_300',
          bio: 'Offensive security researcher and CUSTECH Cyber Club President.',
          githubUrl: 'https://github.com/aisha-sec',
          communityPoints: 1820,
          skills: JSON.stringify(['Penetration Testing', 'Python', 'Wireshark', 'Burp Suite']),
        },
      },
    },
  });
  console.log('✓ Sample students seeded');

  // 4. Seed Sample Projects
  await prisma.project.upsert({
    where: { slug: 'custech-campus-nav' },
    update: {},
    create: {
      slug: 'custech-campus-nav',
      title: 'CUSTECH Interactive Campus Navigator & AR Map',
      description: 'An interactive 3D map of Confluence University Osara campus with offline navigation and timetable room locator.',
      category: 'MOBILE_DEVELOPMENT',
      status: 'APPROVED',
      authorId: studentA.id,
      views: 1250,
      githubUrl: 'https://github.com/custech-fci/campus-nav',
      demoUrl: 'https://campusnav.custech.edu.ng',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80', orderIndex: 0 },
        ],
      },
    },
  });

  await prisma.project.upsert({
    where: { slug: 'aegis-shield-sentinel' },
    update: {},
    create: {
      slug: 'aegis-shield-sentinel',
      title: 'AegisShield: Automated Vulnerability Scanner for Campus Portals',
      description: 'A modular, high-speed security vulnerability auditor designed specifically for educational institutions.',
      category: 'CYBERSECURITY',
      status: 'APPROVED',
      authorId: studentB.id,
      views: 1890,
      githubUrl: 'https://github.com/aisha-sec/aegis-shield',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80', orderIndex: 0 },
        ],
      },
    },
  });
  console.log('✓ Sample projects seeded');

  // 5. Seed News Category & Article
  const newsCategory = await prisma.newsCategory.upsert({
    where: { slug: 'achievements' },
    update: {},
    create: {
      name: 'Achievements',
      slug: 'achievements',
    },
  });

  await prisma.newsArticle.upsert({
    where: { slug: 'custech-fci-hackathon-2024-winners' },
    update: {},
    create: {
      slug: 'custech-fci-hackathon-2024-winners',
      title: 'FCI Students Clinch First Prize at National Inter-University Tech Challenge',
      excerpt: 'The Faculty of Computing and Informatics team developed a solar-powered edge computing sensor for rural agricultural monitoring.',
      content: 'Full report on the victory of CUSTECH FCI students at the prestigious 2024 National Inter-University Innovation Challenge held in Abuja.',
      coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
      categoryId: newsCategory.id,
      authorId: adminUser.id,
      status: 'PUBLISHED',
      isFeatured: true,
      readingTime: 4,
      publishedAt: new Date(),
    },
  });
  console.log('✓ News articles seeded');

  // 6. Seed Comprehensive Skills Catalog
  const skillDefinitions = [
    // Programming
    { name: 'Python', slug: 'python', category: 'PROGRAMMING' as const, description: 'General-purpose programming language widely used in AI, Data Science, and Backend development.' },
    { name: 'JavaScript', slug: 'javascript', category: 'PROGRAMMING' as const, description: 'Core language of the modern web ecosystem.' },
    { name: 'TypeScript', slug: 'typescript', category: 'PROGRAMMING' as const, description: 'Typed superset of JavaScript providing static types and industrial reliability.' },
    { name: 'Go', slug: 'go', category: 'PROGRAMMING' as const, description: 'High-concurrency compiled language developed by Google for cloud systems.' },
    { name: 'Rust', slug: 'rust', category: 'PROGRAMMING' as const, description: 'Memory-safe systems programming language.' },
    { name: 'Java', slug: 'java', category: 'PROGRAMMING' as const, description: 'Enterprise object-oriented language for robust distributed systems.' },
    { name: 'C++', slug: 'cpp', category: 'PROGRAMMING' as const, description: 'High-performance systems and game development language.' },

    // Web Development
    { name: 'React', slug: 'react', category: 'WEB_DEVELOPMENT' as const, description: 'Declarative component-driven frontend library.' },
    { name: 'Next.js', slug: 'nextjs', category: 'WEB_DEVELOPMENT' as const, description: 'Production React framework for server-rendered and static web applications.' },
    { name: 'Node.js', slug: 'nodejs', category: 'WEB_DEVELOPMENT' as const, description: 'Asynchronous event-driven JavaScript runtime for scalable network applications.' },
    { name: 'Express', slug: 'express', category: 'WEB_DEVELOPMENT' as const, description: 'Fast, unopinionated, minimalist web framework for Node.js.' },
    { name: 'Tailwind CSS', slug: 'tailwind-css', category: 'WEB_DEVELOPMENT' as const, description: 'Utility-first CSS framework for rapid modern UI development.' },
    { name: 'FastAPI', slug: 'fastapi', category: 'WEB_DEVELOPMENT' as const, description: 'High-performance Python web framework for building REST & GraphQL APIs.' },

    // Mobile Development
    { name: 'Flutter', slug: 'flutter', category: 'MOBILE_DEVELOPMENT' as const, description: 'Google cross-platform UI toolkit for building natively compiled applications.' },
    { name: 'React Native', slug: 'react-native', category: 'MOBILE_DEVELOPMENT' as const, description: 'Framework for creating native iOS and Android apps using React.' },
    { name: 'Kotlin', slug: 'kotlin', category: 'MOBILE_DEVELOPMENT' as const, description: 'Modern concise language for native Android app development.' },

    // Cybersecurity
    { name: 'Penetration Testing', slug: 'penetration-testing', category: 'CYBERSECURITY' as const, description: 'Authorized simulated cyberattacks against computer systems to check for vulnerabilities.' },
    { name: 'Ethical Hacking', slug: 'ethical-hacking', category: 'CYBERSECURITY' as const, description: 'Techniques and security methodologies for vulnerability research and defensive hardening.' },
    { name: 'Wireshark', slug: 'wireshark', category: 'CYBERSECURITY' as const, description: 'Network packet analysis tool for deep protocol inspection and packet dissection.' },
    { name: 'Burp Suite', slug: 'burp-suite', category: 'CYBERSECURITY' as const, description: 'Web vulnerability scanner and proxy tool for penetration testers.' },
    { name: 'Cryptography', slug: 'cryptography', category: 'CYBERSECURITY' as const, description: 'Encryption protocols, public-key infrastructure, and cryptographic verification.' },

    // Networking
    { name: 'Linux', slug: 'linux', category: 'NETWORKING' as const, description: 'Open-source Unix-like operating system kernel foundational to servers and security.' },
    { name: 'Computer Networks', slug: 'computer-networks', category: 'NETWORKING' as const, description: 'TCP/IP architecture, subnetting, switching, routing, and network topology design.' },
    { name: 'Cisco Packet Tracer', slug: 'cisco-packet-tracer', category: 'NETWORKING' as const, description: 'Visual simulation tool for designing and troubleshooting network configurations.' },

    // AI & Machine Learning
    { name: 'Machine Learning', slug: 'machine-learning', category: 'AI_MACHINE_LEARNING' as const, description: 'Algorithms and statistical models enabling computers to learn and predict from data.' },
    { name: 'Deep Learning', slug: 'deep-learning', category: 'AI_MACHINE_LEARNING' as const, description: 'Neural network architectures for speech, image recognition, and multimodal inference.' },
    { name: 'PyTorch', slug: 'pytorch', category: 'AI_MACHINE_LEARNING' as const, description: 'Open-source tensor and deep learning library with dynamic computation graphs.' },
    { name: 'TensorFlow', slug: 'tensorflow', category: 'AI_MACHINE_LEARNING' as const, description: 'End-to-end open source platform for machine learning model training and serving.' },
    { name: 'Natural Language Processing', slug: 'nlp', category: 'AI_MACHINE_LEARNING' as const, description: 'Techniques for processing, analyzing, and synthesizing human language data.' },

    // Data Science
    { name: 'Data Analytics', slug: 'data-analytics', category: 'DATA_SCIENCE' as const, description: 'Quantitative analysis, statistical hypothesis testing, and exploratory data mining.' },
    { name: 'Pandas', slug: 'pandas', category: 'DATA_SCIENCE' as const, description: 'High-performance data manipulation and analysis library in Python.' },
    { name: 'PowerBI', slug: 'powerbi', category: 'DATA_SCIENCE' as const, description: 'Interactive business intelligence and data dashboard visualization suite.' },

    // Database
    { name: 'MySQL', slug: 'mysql', category: 'DATABASE' as const, description: 'Relational database management system with ACID transactions and high throughput.' },
    { name: 'PostgreSQL', slug: 'postgresql', category: 'DATABASE' as const, description: 'Advanced open-source relational database with powerful JSON & geospatial support.' },
    { name: 'MongoDB', slug: 'mongodb', category: 'DATABASE' as const, description: 'Document-oriented NoSQL database for flexible and unstructured schemas.' },
    { name: 'Redis', slug: 'redis', category: 'DATABASE' as const, description: 'In-memory data structure store used as a distributed cache and message broker.' },

    // UI/UX & Design
    { name: 'Figma', slug: 'figma', category: 'UI_UX' as const, description: 'Collaborative cloud interface design and interactive prototyping tool.' },
    { name: 'UI/UX Design', slug: 'ui-ux-design', category: 'UI_UX' as const, description: 'User-centered product design, usability heuristics, and wireframing.' },
    { name: 'Graphic Design', slug: 'graphic-design', category: 'GRAPHIC_DESIGN' as const, description: 'Visual communication, brand identities, typography, and vector illustration.' },

    // Cloud & DevOps
    { name: 'Docker', slug: 'docker', category: 'DEVOPS' as const, description: 'Containerization platform for packaging applications with all dependencies.' },
    { name: 'Kubernetes', slug: 'kubernetes', category: 'DEVOPS' as const, description: 'Container orchestration system for automating deployment, scaling, and management.' },
    { name: 'AWS', slug: 'aws', category: 'CLOUD' as const, description: 'Amazon Web Services cloud computing platform.' },

    // Leadership & Hardware
    { name: 'Arduino', slug: 'arduino', category: 'HARDWARE' as const, description: 'Open-source microcontroller hardware and prototyping ecosystem.' },
    { name: 'Project Management', slug: 'project-management', category: 'LEADERSHIP' as const, description: 'Agile sprint execution, milestone tracking, and cross-functional team leadership.' },
  ];

  const skillMap: Record<string, string> = {};

  for (const s of skillDefinitions) {
    const skill = await prisma.skill.upsert({
      where: { slug: s.slug },
      update: {
        category: s.category,
        description: s.description,
      },
      create: s,
    });
    skillMap[s.slug] = skill.id;
  }
  console.log(`✓ Seeded ${skillDefinitions.length} skills across categories`);

  // 7. Seed Additional Diverse Students for Team Matching
  const studentC = await prisma.user.upsert({
    where: { email: 'grace.ayomide@custech.edu.ng' },
    update: {},
    create: {
      email: 'grace.ayomide@custech.edu.ng',
      passwordHash: studentPasswordHash,
      emailVerified: true,
      userRoles: { create: [{ roleId: roleMap['STUDENT'] }] },
      profile: {
        create: {
          username: 'grace_ai',
          fullName: 'Grace Ayomide',
          matricId: 'CUS/FCI/22/0304',
          department: 'DATA_SCIENCE',
          level: 'LEVEL_300',
          bio: 'Data Scientist & AI Researcher. Passionate about machine learning algorithms and computer vision.',
          githubUrl: 'https://github.com/grace-ayomide',
          communityPoints: 2150,
          skills: JSON.stringify(['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'Data Analytics']),
        },
      },
    },
  });

  const studentD = await prisma.user.upsert({
    where: { email: 'samuel.okon@custech.edu.ng' },
    update: {},
    create: {
      email: 'samuel.okon@custech.edu.ng',
      passwordHash: studentPasswordHash,
      emailVerified: true,
      userRoles: { create: [{ roleId: roleMap['STUDENT'] }] },
      profile: {
        create: {
          username: 'samuel_design',
          fullName: 'Samuel Okon',
          matricId: 'CUS/FCI/23/0087',
          department: 'INFORMATION_TECHNOLOGY',
          level: 'LEVEL_200',
          bio: 'Product Designer & Frontend Developer. Designing accessible interfaces that wow users.',
          githubUrl: 'https://github.com/samuel-okon',
          communityPoints: 950,
          skills: JSON.stringify(['Figma', 'UI/UX Design', 'React', 'Tailwind CSS', 'Graphic Design']),
        },
      },
    },
  });
  console.log('✓ Additional diverse students seeded');

  // 8. Assign Real StudentSkills with Proficiencies
  const studentSkillsData = [
    // Musa: Fullstack Software Engineer
    { userId: studentA.id, skillId: skillMap['react'], proficiency: 'EXPERT' as const, isPrimary: true, yearsOfExperience: 3 },
    { userId: studentA.id, skillId: skillMap['typescript'], proficiency: 'EXPERT' as const, isPrimary: true, yearsOfExperience: 3 },
    { userId: studentA.id, skillId: skillMap['nodejs'], proficiency: 'ADVANCED' as const, isPrimary: false, yearsOfExperience: 2 },
    { userId: studentA.id, skillId: skillMap['go'], proficiency: 'INTERMEDIATE' as const, isPrimary: false, yearsOfExperience: 1 },
    { userId: studentA.id, skillId: skillMap['docker'], proficiency: 'ADVANCED' as const, isPrimary: false, yearsOfExperience: 2 },
    { userId: studentA.id, skillId: skillMap['mysql'], proficiency: 'ADVANCED' as const, isPrimary: false, yearsOfExperience: 2 },

    // Aisha: Cybersecurity Specialist
    { userId: studentB.id, skillId: skillMap['penetration-testing'], proficiency: 'EXPERT' as const, isPrimary: true, yearsOfExperience: 3 },
    { userId: studentB.id, skillId: skillMap['python'], proficiency: 'ADVANCED' as const, isPrimary: true, yearsOfExperience: 2 },
    { userId: studentB.id, skillId: skillMap['wireshark'], proficiency: 'ADVANCED' as const, isPrimary: false, yearsOfExperience: 2 },
    { userId: studentB.id, skillId: skillMap['burp-suite'], proficiency: 'ADVANCED' as const, isPrimary: false, yearsOfExperience: 2 },
    { userId: studentB.id, skillId: skillMap['linux'], proficiency: 'EXPERT' as const, isPrimary: false, yearsOfExperience: 3 },
    { userId: studentB.id, skillId: skillMap['computer-networks'], proficiency: 'ADVANCED' as const, isPrimary: false, yearsOfExperience: 2 },

    // Grace: AI & Data Science
    { userId: studentC.id, skillId: skillMap['python'], proficiency: 'EXPERT' as const, isPrimary: true, yearsOfExperience: 3 },
    { userId: studentC.id, skillId: skillMap['machine-learning'], proficiency: 'EXPERT' as const, isPrimary: true, yearsOfExperience: 2 },
    { userId: studentC.id, skillId: skillMap['pytorch'], proficiency: 'ADVANCED' as const, isPrimary: false, yearsOfExperience: 2 },
    { userId: studentC.id, skillId: skillMap['data-analytics'], proficiency: 'EXPERT' as const, isPrimary: false, yearsOfExperience: 3 },
    { userId: studentC.id, skillId: skillMap['deep-learning'], proficiency: 'ADVANCED' as const, isPrimary: false, yearsOfExperience: 2 },

    // Samuel: UI/UX & Frontend
    { userId: studentD.id, skillId: skillMap['figma'], proficiency: 'EXPERT' as const, isPrimary: true, yearsOfExperience: 2 },
    { userId: studentD.id, skillId: skillMap['ui-ux-design'], proficiency: 'EXPERT' as const, isPrimary: true, yearsOfExperience: 2 },
    { userId: studentD.id, skillId: skillMap['react'], proficiency: 'ADVANCED' as const, isPrimary: false, yearsOfExperience: 1 },
    { userId: studentD.id, skillId: skillMap['tailwind-css'], proficiency: 'ADVANCED' as const, isPrimary: false, yearsOfExperience: 2 },
    { userId: studentD.id, skillId: skillMap['graphic-design'], proficiency: 'INTERMEDIATE' as const, isPrimary: false, yearsOfExperience: 1 },
  ];

  for (const ss of studentSkillsData) {
    if (ss.skillId) {
      await prisma.studentSkill.upsert({
        where: {
          userId_skillId: {
            userId: ss.userId,
            skillId: ss.skillId,
          },
        },
        update: {
          proficiency: ss.proficiency,
          isPrimary: ss.isPrimary,
          yearsOfExperience: ss.yearsOfExperience,
        },
        create: ss,
      });
    }
  }
  console.log('✓ Student skills with proficiencies seeded');

  // 9. Connect Projects to Skills
  const campusNavProject = await prisma.project.findUnique({ where: { slug: 'custech-campus-nav' } });
  if (campusNavProject) {
    const navSkills = ['react', 'typescript', 'mobile-development', 'ui-ux-design', 'flutter'];
    for (const slug of navSkills) {
      if (skillMap[slug]) {
        await prisma.projectSkill.upsert({
          where: {
            projectId_skillId: {
              projectId: campusNavProject.id,
              skillId: skillMap[slug],
            },
          },
          update: {},
          create: {
            projectId: campusNavProject.id,
            skillId: skillMap[slug],
          },
        });
      }
    }
  }

  const aegisProject = await prisma.project.findUnique({ where: { slug: 'aegis-shield-sentinel' } });
  if (aegisProject) {
    const secSkills = ['python', 'penetration-testing', 'wireshark', 'linux', 'ethical-hacking'];
    for (const slug of secSkills) {
      if (skillMap[slug]) {
        await prisma.projectSkill.upsert({
          where: {
            projectId_skillId: {
              projectId: aegisProject.id,
              skillId: skillMap[slug],
            },
          },
          update: {},
          create: {
            projectId: aegisProject.id,
            skillId: skillMap[slug],
          },
        });
      }
    }
  }
  console.log('✓ Project-skill associations linked');

  // ── 10. Seed Phase 6: Learning Hub & Digital IDs ──────────────────────────────
  console.log('🌱 Seeding Phase 6 Learning Hub and Digital Identities...');

  const studentUsers = await prisma.user.findMany({
    where: { email: { in: ['ibrahim.m@custech.edu.ng', 'amina.y@custech.edu.ng'] } },
    include: { profile: true },
  });

  const primaryAuthor = adminUser.id;

  // 10.1 Learning Resources
  const res1 = await prisma.learningResource.upsert({
    where: { slug: 'cyb-305-network-defense-protocols' },
    update: {},
    create: {
      title: 'CYB 305: Network Defense & Packet Inspection Protocols',
      slug: 'cyb-305-network-defense-protocols',
      description: 'Comprehensive faculty lecture note covering firewall filtering rules, Wireshark packet capture analysis, intrusion detection heuristics, and bastion host hardening.',
      resourceType: 'LECTURE_NOTE',
      category: 'CYBERSECURITY',
      subject: 'Network Security',
      courseCode: 'CYB 305',
      department: 'CYBER_SECURITY',
      level: 'LEVEL_300',
      semester: '1',
      url: 'https://custech.edu.ng/resources/cyb305-handout.pdf',
      fileUrl: 'https://custech.edu.ng/files/cyb305-full-notes.pdf',
      authorId: primaryAuthor,
      status: 'APPROVED',
      isPublished: true,
      isFeatured: true,
      viewsCount: 142,
      downloadsCount: 48,
    },
  });

  const res2 = await prisma.learningResource.upsert({
    where: { slug: 'csc-301-data-structures-and-algorithms' },
    update: {},
    create: {
      title: 'CSC 301: Advanced Data Structures & Algorithmic Analysis',
      slug: 'csc-301-data-structures-and-algorithms',
      description: 'Official CUSTECH lecture slide set and problem sheet exploring self-balancing AVL trees, B-Trees, graph traversals (Dijkstra, Bellman-Ford), and dynamic programming paradigms.',
      resourceType: 'PDF',
      category: 'COMPUTER_SCIENCE',
      subject: 'Data Structures',
      courseCode: 'CSC 301',
      department: 'COMPUTER_SCIENCE',
      level: 'LEVEL_300',
      semester: '1',
      url: 'https://custech.edu.ng/resources/csc301-syllabus.pdf',
      fileUrl: 'https://custech.edu.ng/files/csc301-complete.pdf',
      authorId: primaryAuthor,
      status: 'APPROVED',
      isPublished: true,
      isFeatured: true,
      viewsCount: 215,
      downloadsCount: 89,
    },
  });

  const res3 = await prisma.learningResource.upsert({
    where: { slug: 'python-security-automation-masterclass' },
    update: {},
    create: {
      title: 'Python for Security Automation & Penetration Testing',
      slug: 'python-security-automation-masterclass',
      description: 'Hands-on tutorial series detailing socket programming, automated port scanners, vulnerability fuzzers, and payload generation with scapy.',
      resourceType: 'VIDEO',
      category: 'CYBERSECURITY',
      subject: 'Security Scripting',
      courseCode: 'CYB 204',
      department: 'CYBER_SECURITY',
      level: 'LEVEL_200',
      semester: '2',
      url: 'https://www.youtube.com/watch?v=3Kq1MIfTWCE',
      authorId: primaryAuthor,
      status: 'APPROVED',
      isPublished: true,
      isFeatured: false,
      viewsCount: 96,
      downloadsCount: 22,
    },
  });

  const res4 = await prisma.learningResource.upsert({
    where: { slug: 'full-stack-web-architecture-handout' },
    update: {},
    create: {
      title: 'Modern Full-Stack Web Architecture & RESTful API Engineering',
      slug: 'full-stack-web-architecture-handout',
      description: 'End-to-end tutorial covering React 19, TypeScript, Express middleware patterns, database indexing, and JSON Web Token security.',
      resourceType: 'TUTORIAL',
      category: 'SOFTWARE_ENGINEERING',
      subject: 'Web Engineering',
      courseCode: 'SWE 302',
      department: 'SOFTWARE_ENGINEERING',
      level: 'LEVEL_300',
      semester: '2',
      url: 'https://developer.mozilla.org/en-US/docs/Learn',
      authorId: primaryAuthor,
      status: 'APPROVED',
      isPublished: true,
      isFeatured: true,
      viewsCount: 180,
      downloadsCount: 65,
    },
  });

  console.log('✓ Phase 6 Learning Resources seeded');

  // 10.2 Learning Paths
  const cyberPath = await prisma.learningPath.upsert({
    where: { slug: 'cybersecurity-analyst-pathway' },
    update: {},
    create: {
      title: 'Cybersecurity Analyst Pathway',
      slug: 'cybersecurity-analyst-pathway',
      description: 'Structured community learning roadmap designed to take computing students from fundamental networking to practical packet defense and penetration testing.',
      category: 'CYBERSECURITY',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '10 Weeks',
      isPublished: true,
      isFeatured: true,
      items: {
        create: [
          { resourceId: res3.id, position: 1, isRequired: true },
          { resourceId: res1.id, position: 2, isRequired: true },
        ],
      },
    },
  });

  const fullStackPath = await prisma.learningPath.upsert({
    where: { slug: 'full-stack-architect-pathway' },
    update: {},
    create: {
      title: 'Full-Stack Software Architect Pathway',
      slug: 'full-stack-architect-pathway',
      description: 'Deep dive into data structures, modern frontend UI development, scalable backend services, and clean relational database modeling.',
      category: 'SOFTWARE_ENGINEERING',
      difficulty: 'ADVANCED',
      estimatedDuration: '12 Weeks',
      isPublished: true,
      isFeatured: true,
      items: {
        create: [
          { resourceId: res2.id, position: 1, isRequired: true },
          { resourceId: res4.id, position: 2, isRequired: true },
        ],
      },
    },
  });

  console.log('✓ Phase 6 Learning Paths seeded');

  // 10.3 Digital Identities for Sample Students
  for (let i = 0; i < studentUsers.length; i++) {
    const student = studentUsers[i];
    const cryptoToken = require('crypto').randomBytes(24).toString('hex');
    const fciNumber = `FCI-2026-0042${i + 1}`;

    await prisma.digitalIdentity.upsert({
      where: { userId: student.id },
      update: {},
      create: {
        userId: student.id,
        fciId: fciNumber,
        verificationToken: cryptoToken,
        status: 'VERIFIED',
        issuedAt: new Date(),
        showSkills: true,
        showAchievements: true,
        showPortfolio: true,
      },
    });
  }

  console.log('✓ Phase 6 Digital Identities seeded');

  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
