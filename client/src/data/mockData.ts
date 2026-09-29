import {
  Department,
  Project,
  NewsArticle,
  RoommateListing,
  TechBusiness,
  EventItem,
  LeaderboardEntry,
  UserProfile,
} from '../types';

export const MOCK_STUDENTS: UserProfile[] = [
  {
    id: 'usr-1',
    userId: 'u1',
    username: 'dev_musa',
    fullName: 'Musa Abdullahi',
    matricId: 'CUS/FCI/21/0042',
    department: 'SOFTWARE_ENGINEERING',
    level: '400',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Fullstack engineer & open-source contributor. Building high-performance distributed systems.',
    githubUrl: 'https://github.com/musa-abdullahi',
    linkedinUrl: 'https://linkedin.com/in/musa-abdullahi',
    skills: ['React', 'TypeScript', 'Node.js', 'Go', 'Docker', 'PostgreSQL'],
    interests: ['Distributed Systems', 'Cloud Native', 'FinTech'],
    communityPoints: 1450,
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
  },
  {
    id: 'usr-2',
    userId: 'u2',
    username: 'aisha_cyber',
    fullName: 'Aisha Bello',
    matricId: 'CUS/FCI/22/0118',
    department: 'CYBER_SECURITY',
    level: '300',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    bio: 'Offensive security researcher, CTF player, and network forensics enthusiast. President of CUSTECH Cyber Club.',
    githubUrl: 'https://github.com/aisha-sec',
    linkedinUrl: 'https://linkedin.com/in/aisha-bello',
    skills: ['Penetration Testing', 'Wireshark', 'Python', 'Reverse Engineering', 'Burp Suite'],
    interests: ['Threat Hunting', 'Cryptography', 'Cloud Security'],
    communityPoints: 1820,
    createdAt: '2023-02-20T00:00:00Z',
    updatedAt: '2024-03-12T00:00:00Z',
  },
  {
    id: 'usr-3',
    userId: 'u3',
    username: 'emeka_ml',
    fullName: 'Chukwuemeka Okonkwo',
    matricId: 'CUS/FCI/21/0089',
    department: 'DATA_SCIENCE',
    level: '400',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Deep learning researcher focused on NLP for Nigerian low-resource languages and predictive analytics in healthcare.',
    githubUrl: 'https://github.com/emeka-ds',
    linkedinUrl: 'https://linkedin.com/in/chukwuemeka-okonkwo',
    skills: ['PyTorch', 'Python', 'Pandas', 'FastAPI', 'MLOps', 'Transformers'],
    interests: ['NLP', 'Computer Vision', 'Generative AI'],
    communityPoints: 1290,
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2024-03-08T00:00:00Z',
  },
  {
    id: 'usr-4',
    userId: 'u4',
    username: 'zainab_code',
    fullName: 'Zainab Idris',
    matricId: 'CUS/FCI/23/0015',
    department: 'COMPUTER_SCIENCE',
    level: '200',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
    bio: 'Algorithm enthusiast, competitive programmer, and mobile developer with Flutter.',
    githubUrl: 'https://github.com/zainab-code',
    skills: ['Flutter', 'Dart', 'C++', 'Java', 'Firebase'],
    interests: ['Mobile Development', 'Competitive Programming'],
    communityPoints: 940,
    createdAt: '2023-09-10T00:00:00Z',
    updatedAt: '2024-03-05T00:00:00Z',
  },
  {
    id: 'usr-5',
    userId: 'u5',
    username: 'femi_tech',
    fullName: 'Oluwafemi Adeyemi',
    matricId: 'CUS/FCI/22/0204',
    department: 'INFORMATION_TECHNOLOGY',
    level: '300',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Cloud architecture & DevOps advocate. FCI Campus Google Developer Student Club Lead.',
    githubUrl: 'https://github.com/femi-devops',
    skills: ['AWS', 'Terraform', 'Kubernetes', 'CI/CD', 'Linux'],
    interests: ['Cloud Architecture', 'Site Reliability', 'Community Mentorship'],
    communityPoints: 2150,
    createdAt: '2023-01-10T00:00:00Z',
    updatedAt: '2024-03-14T00:00:00Z',
  },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    slug: 'custech-campus-nav',
    title: 'CUSTECH Interactive Campus Navigator & Augmented Reality Map',
    description: 'An interactive 3D map of Confluence University Osara campus with offline navigation, building discovery, timetable room locator, and AR wayfinding.',
    category: 'MOBILE',
    githubUrl: 'https://github.com/custech-fci/campus-nav',
    demoUrl: 'https://campusnav.custech.edu.ng',
    authorId: 'usr-1',
    author: {
      id: 'usr-1',
      fullName: 'Musa Abdullahi',
      username: 'dev_musa',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      department: 'SOFTWARE_ENGINEERING',
      level: '400',
    },
    technologies: ['Flutter', 'Three.js', 'PostGIS', 'Node.js', 'OpenStreetMap'],
    images: [
      'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=800&q=80',
    ],
    likesCount: 142,
    commentsCount: 28,
    viewsCount: 1250,
    isLiked: true,
    isSaved: true,
    status: 'APPROVED',
    createdAt: '2024-02-14T10:00:00Z',
  },
  {
    id: 'proj-2',
    slug: 'aegis-shield-sentinel',
    title: 'AegisShield: Automated Vulnerability Scanner for Campus Web Portals',
    description: 'A modular, high-speed security vulnerability auditor designed specifically for educational institutions to detect misconfigurations, SQLi, and authentication flaws.',
    category: 'CYBERSECURITY',
    githubUrl: 'https://github.com/aisha-sec/aegis-shield',
    authorId: 'usr-2',
    author: {
      id: 'usr-2',
      fullName: 'Aisha Bello',
      username: 'aisha_cyber',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      department: 'CYBER_SECURITY',
      level: '300',
    },
    technologies: ['Python', 'Docker', 'FastAPI', 'PostgreSQL', 'Scapy'],
    images: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    ],
    likesCount: 210,
    commentsCount: 45,
    viewsCount: 1890,
    isLiked: false,
    status: 'APPROVED',
    createdAt: '2024-01-20T12:00:00Z',
  },
  {
    id: 'proj-3',
    slug: 'ebira-yoruba-nlp-translator',
    title: 'KogiDialect: Neural Translation for Indigenous Languages',
    description: 'Fine-tuned Transformer models enabling machine translation between English, Ebira, Igala, and Yoruba to preserve indigenous Kogi culture and expand digital literacy.',
    category: 'AI',
    githubUrl: 'https://github.com/emeka-ds/kogi-dialect-nlp',
    demoUrl: 'https://kogidialect.ai',
    authorId: 'usr-3',
    author: {
      id: 'usr-3',
      fullName: 'Chukwuemeka Okonkwo',
      username: 'emeka_ml',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      department: 'DATA_SCIENCE',
      level: '400',
    },
    technologies: ['Hugging Face', 'PyTorch', 'FastAPI', 'React', 'TailwindCSS'],
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    ],
    likesCount: 318,
    commentsCount: 62,
    viewsCount: 2400,
    isLiked: true,
    status: 'APPROVED',
    createdAt: '2024-02-01T08:30:00Z',
  },
  {
    id: 'proj-4',
    slug: 'fci-smart-attendance-iot',
    title: 'SmartPresence: Biometric & NFC Lecture Attendance IoT System',
    description: 'Hardware prototype running ESP32 with RFID and fingerprint verification, synchronizing attendance logs in real time with the CUSTECH academic portal.',
    category: 'IOT',
    githubUrl: 'https://github.com/custech-fci/smart-presence',
    authorId: 'usr-5',
    author: {
      id: 'usr-5',
      fullName: 'Oluwafemi Adeyemi',
      username: 'femi_tech',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      department: 'INFORMATION_TECHNOLOGY',
      level: '300',
    },
    technologies: ['C++', 'ESP32', 'MQTT', 'Node.js', 'MongoDB'],
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    ],
    likesCount: 165,
    commentsCount: 19,
    viewsCount: 1100,
    status: 'APPROVED',
    createdAt: '2024-03-02T14:15:00Z',
  },
];

export const MOCK_NEWS: NewsArticle[] = [
  {
    id: 'news-highlight-2026',
    slug: 'tech-news-highlights-september-2026',
    title: 'Tech News Highlights 2026: GPT-6 Reasoning, Windows 12 AI Core, and Critical Cybersecurity Frontiers',
    excerpt: 'An exhaustive executive briefing on the September 2026 technology landscape — from autonomous AI reasoning engines and next-gen operating systems to zero-day enterprise exploits.',
    content: `The global technology ecosystem in late 2026 has crossed a definitive threshold into self-orchestrating computation and ambient intelligence. Across artificial intelligence, operating system paradigms, enterprise threat models, and global digital adoption, the convergence of software and cognitive infrastructure is accelerating at an unprecedented pace.

### 01. AI & Technology Updates: Smarter AI, Bigger Horizons
The AI landscape reached a seismic milestone with the official debut of OpenAI’s GPT-6 architecture. Engineered with multi-step reflexive reasoning, native code sandbox execution, and continuous real-time web telemetry, the model bridges the gap between static response generation and autonomous analytical execution. 

Simultaneously, Google introduced Gemini 2.5, delivering native multi-modal processing at 10x lower inference latency for edge developers. Meta further expanded the developer ecosystem with its suite of generative creator tools, allowing small and medium technology enterprises to build dynamic 3D virtual environments and spatial assets with plain-language prompting.

### 02. Software & Operating System Innovations
Personal and enterprise computing is undergoing its most radical architecture shift in two decades:
- **Microsoft Windows 12 (Insider Preview)**: Introducing deep kernel-level neural integration, replacing traditional filesystem indexing with semantic knowledge vectors and context-aware system agents.
- **Apple iOS 26**: Rolling out an overhauled contextual Siri powered by on-device hybrid neural models, alongside zero-knowledge enterprise telemetry shields.
- **Notion AI Workspaces**: Elevating organizational productivity through multi-document autonomous synthesis, real-time code auditing, and relational graph mapping.

### 03. Cybersecurity News: Defenses in an Era of Synthetic Threats
As cognitive capabilities advance, the threat perimeter has transformed:
- **AI-Synthesized Phishing**: Enterprise SOC teams report a 400% surge in deep-context phishing emails dynamically calibrated using public digital exhaust and voice cloning.
- **Critical Android Zero-Day (CVE-2026-XXXX)**: Google released emergency patches addressing memory safety bypasses in legacy media decoding libraries.
- **Ransomware Adaptation**: Threat actors are targeting localized supply chains and decentralized academic institutions, demanding proactive zero-trust network segregation.

### 04. Global Business Trends & Market Trajectory
Cloud infrastructure investments among Fortune 500 tech leaders are pacing toward an aggregate $2.5 Trillion spend. The demand for sub-nanometer semiconductor chips has fueled record-high equity valuations, while hybrid distributed work platforms have stabilized into permanent institutional fixtures across Africa, Europe, and Asia.

### 05. Digital Milestones & Cultural Impact
- **ChatGPT**: Surpassed 700 million weekly active users, underscoring AI's status as a fundamental utility alongside electricity and telecommunications.
- **Next-Gen Starship**: SpaceX concluded cryogenic static-fire milestones, paving the path for high-bandwidth orbital data centers.
- **Digital Payments**: UPI and real-time bank settlements registered historic transaction records, setting global benchmarks for sovereign financial rails.

*For CUSTECH FCI researchers and students, these global trends reinforce our mandate: mastering resilient software architectures, zero-trust security postures, and proactive artificial intelligence engineering.*`,
    coverImage: '/images/news/tech-news-highlights-2026.jpg',
    category: 'Technology Trends',
    author: {
      id: 'staff-1',
      fullName: 'Dr. K. A. Ibrahim',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      role: 'Dean, Faculty of Computing & Informatics',
    },
    tags: ['AI', 'Cyber Security', 'Innovation', 'Future Tech'],
    isFeatured: true,
    readingTimeMinutes: 5,
    viewsCount: 4890,
    commentsCount: 52,
    publishedAt: '2026-09-10T08:00:00Z',
    createdAt: '2026-09-10T07:30:00Z',
  },
  {
    id: 'news-future-intelligent',
    slug: 'the-future-is-intelligent-human-ai-creativity',
    title: 'The Future is Intelligent: Why FCI is Championing Human-Centric AI Collaboration',
    excerpt: 'Artificial intelligence is not a substitute for human intuition — it is an amplifier. Inside the emerging symbiosis between student engineers and cognitive agents.',
    content: `The classical debate of "Humans versus Machines" is obsolete. In its place stands a vastly more transformative paradigm: human-machine symbiosis.

At the Faculty of Computing and Informatics (FCI), Confluence University of Science and Technology, Osara, our pedagogical and research ethos is anchored in four cardinal pillars:
1. **Smarter Solutions**: Deploying algorithmic models to parse colossal dimensional datasets, allowing human engineers to focus on architectural nuance and ethical alignment.
2. **Better Decisions**: Real-time probabilistic forecasting and automated anomaly detection that empower developers, data scientists, and administrators to act with empirical precision.
3. **Faster Innovation**: Compressing development lifecycles from months into days through automated scaffolding, intelligent refactoring, and deterministic testing.
4. **Stronger Together**: The synthesis of human empathy, critical judgment, and creative lateral thinking with machine endurance and precision.

### The Engineering Studio of 2026
Modern software engineering laboratories at CUSTECH FCI no longer feature students staring at static terminal buffers. Instead, interactive workspaces blend real-time compiler telemetry, conversational semantic debuggers, and visual architectural canvases.

When our software engineering and computer science undergraduates embark on capstone solutions — whether developing precision agriculture drones for Kogi State farmlands or decentralized micro-finance platforms — AI copilots serve as tireless research assistants, suggesting optimal data structures, flagging edge cases, and simulating load dynamics under hostile concurrency.

### Cultivating the Next Generation of Technologists
"We do not teach our students merely to write syntax that an LLM can generate in seconds," notes Dr. Amina Bello, Lead of the FCI Machine Intelligence Research Initiative. "We teach them to critique architectures, rigorously stress-test algorithms, interrogate bias, and envision systems that improve real human lives."

*Innovate. Collaborate. Elevate. The future belongs not to artificial intelligence alone, but to the engineers who master its collaborative power.*`,
    coverImage: '/images/news/future-is-intelligent-human-ai.jpg',
    category: 'Editorial',
    author: {
      id: 'staff-3',
      fullName: 'Dr. Amina Bello',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      role: 'Associate Professor, Machine Intelligence',
    },
    tags: ['AI', 'Innovation', 'Campus', 'Students'],
    isFeatured: true,
    readingTimeMinutes: 4,
    viewsCount: 3820,
    commentsCount: 41,
    publishedAt: '2026-09-15T10:00:00Z',
    createdAt: '2026-09-15T09:15:00Z',
  },
  {
    id: 'news-thynk-wearable',
    slug: 'thynk-wearable-tech-spatial-computing',
    title: 'THYNK Special Edition: Revolutionizing Daily Life & Academic Productivity with Wearable AR Tech',
    excerpt: 'From holographic heads-up displays to neural spatial audio, wearable hardware is redefining human productivity, smart home control, and interactive engineering education.',
    content: `In the latest annual Reader Awards edition of THYNK Magazine, technology analysts examined how wearable devices have graduated from passive health wristbands into full-fledged spatial operating platforms.

### Wearable Heads-Up Displays (HUDs) Enter the Mainstream
Equipped with micro-OLED optical waveguides, biometric eye-tracking, and sub-watt neural processing units (NPUs), modern augmented-reality eyewear provides persistent spatial interfaces without disconnecting users from their immediate physical surroundings.

Key breakthroughs highlighted in the feature include:
- **Spatial Engineering Blueprints**: Visualizing 3D CAD schematics, network topologies, and circuit diagrams floating directly above laboratory workbenches.
- **Smart Campus & Home Integration**: Instant telemetry overlays when glancing at smart appliances, power distribution meters, or laboratory server racks.
- **Dynamic Contextual Computing**: Real-time transcription, instant syntax reference lookups, and visual graph diagnostics during live software development sessions.

### Hardware Powerhouses of 2025/2026
The review section dissects this year's top-tier computing hardware:
- **Top 10 High-Performance Laptops**: Comparing thermal efficiency and on-die NPU throughput for student engineers training local quantized weights.
- **Intelligent Noise-Cancelling Earbuds**: Next-generation spatial audio with conversational pass-through and algorithmic acoustic filtering for noisy campus environments.
- **Cloud Storage Mastery**: Architectures for zero-latency bidirectional caching between local edge devices and distributed cloud repositories.

As CUSTECH expands its HCI (Human-Computer Interaction) curriculum, integrating wearable and spatial paradigms into our student projects will prepare our graduates to pioneer the interfaces of tomorrow.`,
    coverImage: '/images/news/thynk-wearable-tech-revolution.jpg',
    category: 'Gadgets & Wearables',
    author: {
      id: 'usr-1',
      fullName: 'Musa Abdullahi',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role: 'Lead Software Architect, FCI Tech Club',
    },
    tags: ['Future Tech', 'AI', 'Innovation', 'Lab'],
    isFeatured: false,
    readingTimeMinutes: 4,
    viewsCount: 2940,
    commentsCount: 28,
    publishedAt: '2026-09-18T14:30:00Z',
    createdAt: '2026-09-18T13:45:00Z',
  },
  {
    id: 'news-social-design-2025',
    slug: 'future-social-media-design-cybernetic-ui',
    title: 'The Future of Social Media Design: Cybernetic Aesthetics, Spatial UI, and Generative Design Systems',
    excerpt: 'Explore how cyberpunk cybernetics, holographic glassmorphism, and generative component tokens are fundamentally transforming modern digital interfaces.',
    content: `Digital design is undergoing an aesthetic and functional renaissance. The flat, monochromatic minimalism that dominated the 2010s has yielded to high-fidelity, sensory-rich cybernetic visual systems.

### Key Visual & UX Design Trends
1. **Cybernetic Visual Languages**: High-contrast dark canvases illuminated by neon cyan, electric indigo, and luminous cobalt blue highlights that simulate futuristic heads-up displays and cyber-wearable telemetry.
2. **Procedural Glassmorphism & Depth**: Multi-layered transparent panes with dynamic blur, subtle edge refraction, and chromatic dispersion that establish immediate optical hierarchy.
3. **Micro-HUD Elements**: Borrowing precision crosshairs, coordinate trackers, vector rulers, and diagnostic data badges from avionics and industrial CAD software to convey technical mastery.
4. **Generative Adaptive Tokens**: Design systems that dynamically synthesize palette harmonies, typography scales, and component spacing tailored in real time to the user’s cognitive workload and ambient lighting.

### Implications for FCI Web & Mobile Builders
For student designers and front-end developers building on CUSTECH FCI Connect:
- Embrace layered elevation and subtle reactive animations with Framer Motion and Tailwind.
- Treat every interface as an interactive console: prioritize information density without sacrificing visual calm.
- Utilize semantic CSS variables to support sleek dark modes, ensuring accessibility and contrast compliance across all devices.

As digital communications shift into immersive web environments, mastering these visual vocabularies equips our student creators to build products that captivate users globally.`,
    coverImage: '/images/news/future-social-media-design.jpg',
    category: 'Design & Creative',
    author: {
      id: 'staff-4',
      fullName: 'Zainab O. Ahmed',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role: 'Director, Creative Computing & UI/UX Lab',
    },
    tags: ['Design', 'Innovation', 'Students'],
    isFeatured: false,
    readingTimeMinutes: 3,
    viewsCount: 3110,
    commentsCount: 33,
    publishedAt: '2026-09-20T11:00:00Z',
    createdAt: '2026-09-20T10:10:00Z',
  },
  {
    id: 'news-ubiquitous-tech-2026',
    slug: 'ubiquitous-tech-2026-distributed-intelligence',
    title: 'The Technology Express: Ubiquitous Computing, Ambient Intelligence, and the $2.5 Trillion AI Shift',
    excerpt: 'Tech is no longer something we sit in front of — it is the invisible, pervasive fabric orchestrating cities, economies, and planetary infrastructure.',
    content: `The January 2026 cover story of *The Technology Express* poses a profound premise: technology has achieved ubiquity. Defined by the Oxford English Dictionary as "present, appearing, or found everywhere," ubiquitous computing signifies the transition from explicit human computer interaction to continuous ambient support.

### The Global $2.5 Trillion Inflection Point
Worldwide investment in artificial intelligence, hyperscale data clusters, and low-latency satellite constellations is projected to cross $2.5 Trillion this year. Key drivers shaping this economic transformation include:
- **Dubai's 90% Digital Cashless Endgame**: The emirate has neared total financial digitization, creating an ultra-frictionless sovereign economy powered by AI fraud telemetry and cryptographic identity verifications.
- **Global Tech Hub Consolidation**: The migration of top AI labs and hardware infrastructure to tech-friendly economic corridors offering green solar energy and regulatory clarity.
- **The AI Output Quality Challenge**: As algorithmic content generation scales into trillions of tokens daily, enterprises are redirecting engineering focus toward verification, formal logic proofs, and hallucination reduction.

### The Planetary Architecture: Autonomous Matrix
The publication's striking geometric cover symbolizes the complex, faceted nature of distributed decentralized infrastructure — where microservices, containerized edge nodes, and autonomous consensus engines coordinate across planetary networks.

### What This Means for Confluence University
At CUSTECH FCI, ubiquitous computing is not science fiction — it is our syllabus. From IoT-driven flood monitoring along the Niger-Benue confluence to distributed cryptographic databases securing student credentials, our students are actively engineering systems meant to operate quietly, reliably, and invisibly in the service of society.`,
    coverImage: '/images/news/ubiquitous-tech-2026.jpg',
    category: 'Industry Analysis',
    author: {
      id: 'staff-2',
      fullName: 'Prof. S. O. Jimoh',
      role: 'Head of Department, Cyber Security',
    },
    tags: ['Future Tech', 'Cyber Security', 'Innovation'],
    isFeatured: false,
    readingTimeMinutes: 5,
    viewsCount: 2780,
    commentsCount: 22,
    publishedAt: '2026-09-22T16:00:00Z',
    createdAt: '2026-09-22T15:00:00Z',
  },
  {
    id: 'news-1',
    slug: 'custech-fci-hackathon-2024-winners',
    title: 'FCI Students Clinch First Prize at National Inter-University Tech Challenge',
    excerpt: 'The Faculty of Computing and Informatics team developed a solar-powered edge computing sensor for rural agricultural monitoring, taking top honors.',
    content: `Students of the Faculty of Computing and Informatics at Confluence University of Science and Technology (CUSTECH), Osara, have emerged champions at the prestigious 2024 National Inter-University Innovation Challenge.

The competition, which drew over 60 universities from across West Africa, saw CUSTECH's team present 'AgriSense Edge', an indigenous low-power computing node that monitors soil moisture, temperature, and pest patterns using decentralized edge AI.

The Vice-Chancellor commended the students and highlighted the faculty's commitment to hands-on engineering and transformative technological solutions tailored to regional challenges.`,
    coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
    category: 'Achievements',
    author: {
      id: 'staff-1',
      fullName: 'Dr. K. A. Ibrahim',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      role: 'Dean, Faculty of Computing & Informatics',
    },
    tags: ['Hackathon', 'Awards', 'FCI Excellence', 'Innovation'],
    isFeatured: false,
    readingTimeMinutes: 4,
    viewsCount: 3420,
    commentsCount: 38,
    publishedAt: '2024-03-12T09:00:00Z',
    createdAt: '2024-03-12T08:00:00Z',
  },
  {
    id: 'news-2',
    slug: 'new-cybersecurity-laboratory-commissioned',
    title: 'Cutting-Edge Cybersecurity & Cloud Research Lab Commissioned at CUSTECH',
    excerpt: 'State-of-the-art facilities equipped with high-spec workstations, forensic testbeds, and private server clusters officially unveiled for FCI students.',
    content: `In a landmark move to bolster practical cybersecurity training, the university has officially inaugurated the new Advanced Cybersecurity and Cloud Systems Research Laboratory at the FCI Complex.

Equipped with 100 high-performance workstations, simulated enterprise network environments, and a dedicated threat detection sandbox, the laboratory empowers students to gain hands-on penetration testing and digital forensics experience.`,
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
    category: 'Campus Updates',
    author: {
      id: 'staff-2',
      fullName: 'Prof. S. O. Jimoh',
      role: 'Head of Department, Cyber Security',
    },
    tags: ['Lab', 'Cyber Security', 'Infrastructure', 'Campus'],
    isFeatured: false,
    readingTimeMinutes: 3,
    viewsCount: 2150,
    commentsCount: 19,
    publishedAt: '2024-03-08T11:30:00Z',
    createdAt: '2024-03-08T10:00:00Z',
  },
  {
    id: 'news-3',
    slug: 'google-developer-student-club-workshop-ai',
    title: 'GDSC CUSTECH Announces 3-Week Intensive Generative AI Bootcamp',
    excerpt: 'Open to all 100 to 500 level students, covering LLM fine-tuning, retrieval-augmented generation (RAG), and cloud deployment.',
    content: `The Google Developer Student Clubs chapter at CUSTECH is launching a 3-week comprehensive bootcamp focusing on the frontiers of artificial intelligence and modern web development.

Participants will complete capstone projects that will be showcased on the CUSTECH FCI Connect platform, with mentorship from industry engineers.`,
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
    category: 'Workshops',
    author: {
      id: 'usr-5',
      fullName: 'Oluwafemi Adeyemi',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      role: 'GDSC Lead',
    },
    tags: ['GDSC', 'AI', 'Bootcamp', 'Students'],
    isFeatured: false,
    readingTimeMinutes: 2,
    viewsCount: 1640,
    commentsCount: 24,
    publishedAt: '2024-03-04T15:00:00Z',
    createdAt: '2024-03-04T14:00:00Z',
  },
];

export const MOCK_ROOMMATES: RoommateListing[] = [
  {
    id: 'room-1',
    title: 'Spacious Self-Contain near CUSTECH Main Gate, Osara',
    description: 'Looking for a tidy and studious FCI roommate to share a newly built self-contain apartment. 24/7 borehole water, prepaid meter, security guard on site, and fast fiber broadband connection.',
    location: 'Osara Campus Gate, Kogi State',
    landmark: 'Behind Royal Guest Inn',
    rentAmount: 85000,
    rentFrequency: 'ANNUAL',
    roomType: 'SELF_CONTAIN',
    genderPreference: 'MALE_ONLY',
    departmentPreference: 'SOFTWARE_ENGINEERING',
    levelPreference: '300',
    photos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: ['Prepaid Meter', 'Borehole Water', 'Fenced & Gated', 'High-Speed Wi-Fi', 'Generator Slot'],
    contactPhone: '+234 812 345 6789',
    contactWhatsapp: '+234 812 345 6789',
    ownerId: 'usr-1',
    owner: {
      id: 'usr-1',
      fullName: 'Musa Abdullahi',
      username: 'dev_musa',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      department: 'SOFTWARE_ENGINEERING',
      level: '400',
    },
    isSaved: false,
    isActive: true,
    createdAt: '2024-03-05T08:00:00Z',
  },
  {
    id: 'room-2',
    title: '2-Bedroom Flatmate Wanted (Private Master Room Available)',
    description: 'Quiet environment ideal for reading and coding. Modern kitchen, solar inverter power backup for uninterrupted laptop charging and studies.',
    location: 'Adogo Road, Osara',
    landmark: 'Beside Winners Chapel',
    rentAmount: 110000,
    rentFrequency: 'ANNUAL',
    roomType: 'TWO_BEDROOM',
    genderPreference: 'FEMALE_ONLY',
    departmentPreference: 'CYBER_SECURITY',
    levelPreference: '200',
    photos: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: ['Solar Power Inverter', 'Paved Compound', 'Running Water', 'POP Ceiling'],
    contactPhone: '+234 803 987 6543',
    contactWhatsapp: '+234 803 987 6543',
    ownerId: 'usr-2',
    owner: {
      id: 'usr-2',
      fullName: 'Aisha Bello',
      username: 'aisha_cyber',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      department: 'CYBER_SECURITY',
      level: '300',
    },
    isSaved: true,
    isActive: true,
    createdAt: '2024-03-08T10:30:00Z',
  },
];

export const MOCK_BUSINESSES: TechBusiness[] = [
  {
    id: 'biz-1',
    slug: 'confluence-byte-solutions',
    name: 'ConfluenceByte Solutions',
    tagline: 'Custom software engineering & cloud infrastructure for local enterprises',
    description: 'Student-founded technology studio offering custom web development, mobile app construction, cybersecurity audits, and cloud migrations across Kogi State.',
    category: 'Software Development',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    websiteUrl: 'https://confluencebyte.ng',
    email: 'contact@confluencebyte.ng',
    phone: '+234 802 111 2233',
    whatsapp: '+234 802 111 2233',
    ownerId: 'usr-1',
    owner: {
      id: 'usr-1',
      fullName: 'Musa Abdullahi',
      department: 'SOFTWARE_ENGINEERING',
      level: '400',
    },
    services: ['Web Development', 'Mobile Apps (Flutter/React Native)', 'Cloud Architecture', 'UI/UX Design'],
    verified: true,
    rating: 4.9,
    reviewsCount: 23,
    createdAt: '2023-11-15T00:00:00Z',
  },
  {
    id: 'biz-2',
    slug: 'kogi-cyber-guard',
    name: 'Kogi CyberGuard',
    tagline: 'Penetration testing, network security & tech hardware repairs',
    description: 'Specialized cybersecurity consultancy providing vulnerability assessments for SMEs and campus hardware diagnostics including MacBook/ThinkPad board repairs.',
    category: 'Cybersecurity & Hardware',
    logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    email: 'info@kogicyberguard.com',
    phone: '+234 810 555 7788',
    whatsapp: '+234 810 555 7788',
    ownerId: 'usr-2',
    owner: {
      id: 'usr-2',
      fullName: 'Aisha Bello',
      department: 'CYBER_SECURITY',
      level: '300',
    },
    services: ['Security Audits', 'Laptop Hardware Repairs', 'OS Optimization & Recovery', 'Data Backup Systems'],
    verified: true,
    rating: 4.8,
    reviewsCount: 18,
    createdAt: '2023-12-01T00:00:00Z',
  },
];

export const MOCK_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    slug: 'fci-annual-hackathon-2024',
    title: 'CUSTECH FCI Annual Hackathon 2024: "Innovate for the Confluence"',
    description: '48-hour collaborative engineering sprint with prizes over ₦1,500,000. Tracks include FinTech, AgriTech, EduTech, and Cyber Defence.',
    category: 'HACKATHON',
    location: 'FCI Main Auditorium & Virtual Hybrid',
    isVirtual: false,
    startDate: '2024-04-18T09:00:00Z',
    endDate: '2024-04-20T17:00:00Z',
    bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    organizer: 'Faculty of Computing & Informatics Deanery',
    registrationLimit: 200,
    registeredCount: 146,
    isRegistered: true,
    createdAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'evt-2',
    slug: 'deep-dive-into-offensive-security',
    title: 'Masterclass: Ethical Hacking & Modern Web Vulnerabilities',
    description: 'Hands-on live laboratory session tackling OWASP Top 10 vulnerabilities, API security, and secure coding practices.',
    category: 'WORKSHOP',
    location: 'Cybersecurity Lab 2 & Google Meet',
    isVirtual: true,
    virtualLink: 'https://meet.google.com/xyz-custech-fci',
    startDate: '2024-03-29T14:00:00Z',
    bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    organizer: 'CUSTECH Cyber Club',
    registrationLimit: 80,
    registeredCount: 65,
    isRegistered: false,
    createdAt: '2024-03-05T00:00:00Z',
  },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    user: {
      id: 'usr-5',
      fullName: 'Oluwafemi Adeyemi',
      username: 'femi_tech',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      department: 'INFORMATION_TECHNOLOGY',
      level: '300',
    },
    communityPoints: 2150,
    projectsCount: 4,
    badge: 'GOLD',
    achievements: ['Campus Mentor', 'Hackathon Winner', 'Top Publisher', 'Open Source Hero'],
  },
  {
    rank: 2,
    user: {
      id: 'usr-2',
      fullName: 'Aisha Bello',
      username: 'aisha_cyber',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      department: 'CYBER_SECURITY',
      level: '300',
    },
    communityPoints: 1820,
    projectsCount: 3,
    badge: 'SILVER',
    achievements: ['Security Auditor', 'Club President', 'Top Contributor'],
  },
  {
    rank: 3,
    user: {
      id: 'usr-1',
      fullName: 'Musa Abdullahi',
      username: 'dev_musa',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      department: 'SOFTWARE_ENGINEERING',
      level: '400',
    },
    communityPoints: 1450,
    projectsCount: 5,
    badge: 'BRONZE',
    achievements: ['Architecture Lead', 'Fullstack Pro', 'Active Roommate Host'],
  },
  {
    rank: 4,
    user: {
      id: 'usr-3',
      fullName: 'Chukwuemeka Okonkwo',
      username: 'emeka_ml',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      department: 'DATA_SCIENCE',
      level: '400',
    },
    communityPoints: 1290,
    projectsCount: 2,
    badge: 'CONTRIBUTOR',
    achievements: ['AI Researcher', 'Kogi Dialect Author'],
  },
  {
    rank: 5,
    user: {
      id: 'usr-4',
      fullName: 'Zainab Idris',
      username: 'zainab_code',
      avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
      department: 'COMPUTER_SCIENCE',
      level: '200',
    },
    communityPoints: 940,
    projectsCount: 2,
    badge: 'CONTRIBUTOR',
    achievements: ['Rising Star', 'Algorithm Champion'],
  },
];
