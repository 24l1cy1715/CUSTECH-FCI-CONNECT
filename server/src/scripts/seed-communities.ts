import { prisma } from '../config/prisma';
import {
  CommunityCategory,
  CommunityVisibility,
  CommunityStatus,
  CommunityMemberRole,
  CommunityMembershipStatus,
} from '@prisma/client';

export async function seedCommunities() {
  console.log('🌱 Seeding rich faculty communities, discussions, and resources...');

  const admin = await prisma.user.findFirst({
    where: { email: 'admin@custech.edu.ng' },
  });

  const students = await prisma.user.findMany({
    where: { email: { not: 'admin@custech.edu.ng' } },
    take: 5,
  });

  if (!admin) {
    console.log('Admin user not found. Skipping community seed.');
    return;
  }

  const primaryOwnerId = students[0]?.id || admin.id;
  const secondaryMemberId = students[1]?.id || admin.id;

  const communitiesData = [
    {
      name: 'Cybersecurity & Ethical Defense Club',
      slug: 'cybersecurity-ethical-defense',
      description: 'The premier offensive & defensive cybersecurity student organization at CUSTECH FCI. CTF competitions, packet analysis labs, and vulnerability research.',
      category: CommunityCategory.CYBERSECURITY,
      visibility: CommunityVisibility.PUBLIC,
      status: CommunityStatus.ACTIVE,
      isFeatured: true,
      logo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      posts: [
        {
          title: 'Welcome to the Cybersecurity Research & CTF Guild (2024/2025)',
          content: 'Welcome all students! Our weekly reverse engineering and defensive packet capture workshop meets every Thursday at the Faculty Computing Lab 2. All skill levels are encouraged.',
          isAnnouncement: true,
          isPinned: true,
        },
        {
          title: 'Wireshark Protocol Dissection & Bastion Hardening Guide',
          content: 'Here is a recap of our hands-on firewall inspection session. Make sure to download the sample pcap capture files from the Resources tab before this Friday.',
          isAnnouncement: false,
          isPinned: false,
        },
      ],
      resources: [
        {
          title: 'National Cybersecurity Hackathon Preparation Repository',
          description: 'Curated list of reverse-engineering challenges, cryptographic cipher suites, and Linux bastion audit notes.',
          url: 'https://custech.edu.ng/cybersecurity/ctf-prep-2024',
          type: 'DOCUMENTATION',
        },
        {
          title: 'Official Packet Inspection Cheatsheet (Wireshark & Tcpdump)',
          description: 'Essential BPF filters and TCP handshake analysis references for FCI students.',
          url: 'https://custech.edu.ng/resources/wireshark-cheatsheet.pdf',
          type: 'DOCUMENTATION',
        },
      ],
    },
    {
      name: 'Software Engineering & Distributed Systems Guild',
      slug: 'software-engineering-guild',
      description: 'Hub for fullstack, backend, mobile, and distributed systems developers at CUSTECH. Code reviews, pair programming, open-source projects, and technical seminars.',
      category: CommunityCategory.SOFTWARE_ENGINEERING,
      visibility: CommunityVisibility.PUBLIC,
      status: CommunityStatus.ACTIVE,
      isFeatured: true,
      logo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
      posts: [
        {
          title: 'Official CUSTECH Open Source Contribution Guidelines',
          content: 'Learn how to contribute to faculty open-source repositories, submit production-grade Pull Requests, and follow semantic versioning standards.',
          isAnnouncement: true,
          isPinned: true,
        },
        {
          title: 'Modern Architecture: Microservices vs Modular Monoliths in Practice',
          content: 'Discussion thread on architecting scalable backend APIs with TypeScript, PostgreSQL, and Redis caching. What trade-offs have you encountered in your projects?',
          isAnnouncement: false,
          isPinned: false,
        },
      ],
      resources: [
        {
          title: 'Clean Architecture in TypeScript & Node.js Guide',
          description: 'Industrial reference guide on domain-driven design, repositories, and interface decoupling.',
          url: 'https://custech.edu.ng/resources/clean-architecture-ts.pdf',
          type: 'ARTICLE',
        },
      ],
    },
    {
      name: 'AI, Machine Learning & Data Innovators',
      slug: 'ai-ml-data-innovators',
      description: 'Exploring machine learning, deep learning, computer vision, natural language processing, and data science applied to local challenges in agriculture and health.',
      category: CommunityCategory.AI_ML,
      visibility: CommunityVisibility.PUBLIC,
      status: CommunityStatus.ACTIVE,
      isFeatured: true,
      logo: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
      posts: [
        {
          title: 'PyTorch Deep Learning Reading Group — Attention Mechanisms',
          content: 'Join our weekly paper review on Transformer architectures and self-attention algorithms this Wednesday at 4 PM in the FCI Innovation Theater.',
          isAnnouncement: true,
          isPinned: true,
        },
      ],
      resources: [
        {
          title: 'CUSTECH Agricultural Computer Vision Dataset',
          description: 'Annotated drone imagery dataset for crop disease classification in Kogi State.',
          url: 'https://custech.edu.ng/datasets/agri-vision-2024',
          type: 'DOCUMENTATION',
        },
      ],
    },
    {
      name: 'Robotics, IoT & Embedded Systems Lab',
      slug: 'robotics-iot-embedded',
      description: 'Hands-on hardware prototyping, microcontrollers (ESP32, STM32, Arduino), sensor networks, and robotic automation.',
      category: CommunityCategory.ROBOTICS,
      visibility: CommunityVisibility.PUBLIC,
      status: CommunityStatus.ACTIVE,
      isFeatured: false,
      logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      posts: [
        {
          title: 'Microcontroller Firmware Workshop Announcement',
          content: 'Free starter kits available for students building IoT environmental monitors. Registration opens this Monday.',
          isAnnouncement: true,
          isPinned: true,
        },
      ],
      resources: [
        {
          title: 'ESP32 FreeRTOS Sensor Telemetry Tutorial',
          description: 'Step-by-step firmware development guide with MQTT transmission to AWS IoT Core.',
          url: 'https://custech.edu.ng/resources/esp32-freertos-guide.pdf',
          type: 'DOCUMENTATION',
        },
      ],
    },
  ];

  for (const cData of communitiesData) {
    const existing = await prisma.community.findUnique({
      where: { slug: cData.slug },
    });

    let communityId: string;

    if (!existing) {
      const created = await prisma.community.create({
        data: {
          name: cData.name,
          slug: cData.slug,
          description: cData.description,
          category: cData.category,
          visibility: cData.visibility,
          status: cData.status,
          isFeatured: cData.isFeatured,
          logo: cData.logo,
          coverImage: cData.coverImage,
          ownerId: primaryOwnerId,
        },
      });
      communityId = created.id;
      console.log(`✓ Created community: ${cData.name}`);
    } else {
      communityId = existing.id;
    }

    // Ensure owner membership
    await prisma.communityMembership.upsert({
      where: { communityId_userId: { communityId, userId: primaryOwnerId } },
      update: { role: CommunityMemberRole.OWNER, status: CommunityMembershipStatus.ACTIVE },
      create: {
        communityId,
        userId: primaryOwnerId,
        role: CommunityMemberRole.OWNER,
        status: CommunityMembershipStatus.ACTIVE,
      },
    });

    // Ensure secondary membership if different
    if (secondaryMemberId !== primaryOwnerId) {
      await prisma.communityMembership.upsert({
        where: { communityId_userId: { communityId, userId: secondaryMemberId } },
        update: { role: CommunityMemberRole.ADMIN, status: CommunityMembershipStatus.ACTIVE },
        create: {
          communityId,
          userId: secondaryMemberId,
          role: CommunityMemberRole.ADMIN,
          status: CommunityMembershipStatus.ACTIVE,
        },
      });
    }

    // Seed Posts
    for (const p of cData.posts) {
      const existingPost = await prisma.communityPost.findFirst({
        where: { communityId, title: p.title },
      });

      if (!existingPost) {
        await prisma.communityPost.create({
          data: {
            communityId,
            authorId: primaryOwnerId,
            title: p.title,
            content: p.content,
            isAnnouncement: p.isAnnouncement,
            isPinned: p.isPinned,
            likesCount: 12,
            commentsCount: 3,
          },
        });
      }
    }

    // Seed Resources
    for (const r of cData.resources) {
      const existingRes = await prisma.communityResource.findFirst({
        where: { communityId, title: r.title },
      });

      if (!existingRes) {
        await prisma.communityResource.create({
          data: {
            communityId,
            createdById: primaryOwnerId,
            title: r.title,
            description: r.description,
            url: r.url,
            type: r.type as any,
          },
        });
      }
    }
  }

  console.log('✓ All community records seeded successfully!');
}

if (require.main === module) {
  seedCommunities()
    .catch((err) => {
      console.error('Error seeding communities:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
