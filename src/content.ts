// Single source of truth for portfolio content. Sources: CV (2026), GitHub, old portfolio.
export const profile = {
  name: 'Tarek Alam Bhuiyan',
  role: 'Software Engineer · AI-Native Full-Stack Developer',
  summary:
    'Based in Dhaka, Bangladesh, I build full-stack web applications, backend services and AI systems: REST APIs, authentication, real-time features, RAG pipelines and ML models. BSc in Computer Science & Engineering from BRAC University, with a solid footing in data structures, algorithms and system design.',
  email: 'tarekalambhuiyan@gmail.com',
  links: [
    {label: 'GitHub', href: 'https://github.com/tarek-codes'},
    {label: 'LinkedIn', href: 'https://www.linkedin.com/in/tarekalambhuiyan'},
    {label: 'LeetCode', href: 'https://leetcode.com/u/2ManyFaces/'},
    {label: 'X', href: 'https://x.com/Tarek11X'},
  ],
};

export const about = {
  photo: '/img_trk.jpeg',
  paragraphs: [
    'Hi, I\u2019m Tarek, though my close ones call me Shrabon. First impressions say quiet and serious; ten minutes later I\u2019m usually the one cracking jokes in the group chat. Making people laugh is my favourite thing, and I promise I\u2019m a lot more fun once you get to know me.',
    'I\u2019ll happily build anything with code, from web apps to AI to civic tech, and I love a good challenge, so you\u2019ll often find me solving problems on LeetCode or racing the clock at hackathons.',
  ],
  // Personal interests, shown as highlighted pills.
  hobbies: [
    {label: 'Travelling', to: '/interests/travelling'},
    {label: 'Listening to Music', to: '/interests/music'},
    {label: 'Playing Video Games', to: '/interests/gaming'},
    {label: 'Learning New Technologies', to: '/interests/learning'},
    {label: 'Watching TV Series & Movies', to: '/interests/watching'},
  ] as {label: string; to?: string}[],
  interests: [
    'Full-Stack Development',
    'Backend & APIs',
    'Machine Learning',
    'NLP',
    'Medical AI',
    'Data Engineering',
    'Civic Tech',
    'System Design',
    'Hackathons',
  ],
};

type Org = {logo?: string; logoBg?: string; initials?: string};
export type ExperienceKind = 'work' | 'research';

export const experience: (Org & {kind: ExperienceKind; role: string; org: string; when: string; where: string; points: string[]})[] = [
  {
    role: 'Software Engineer Intern, Development Team',
    kind: 'work',
    org: 'Lofistack',
    logo: '/logos/lofistack.png', logoBg: '#42296b',
    when: 'Nov 2026 – Present',
    where: 'Remote · Chattogram',
    points: [
      'Recruited through the Lofistack Hackathon 2026 after placing 1st Runner-Up.',
      'Developing custom full-stack web, mobile and AI solutions for real-world products and client requirements.',
      'Contributing across the SDLC, from requirement analysis and research to implementation and deployment.',
    ],
  },
  {
    role: 'Jr. Software Engineer, R&D Team',
    kind: 'work',
    org: 'Penta Global Limited',
    logo: '/logos/penta-mark.png', logoBg: '#0e1e3d',
    when: 'Sep 2026 – Present',
    where: 'Dhaka',
    points: [
      'Research and technical analysis for AVN (All Victims & Veterans Network), a platform documenting state violence in Bangladesh.',
      'Data cleaning, preprocessing and transformation to structure and process AVN case records.',
    ],
  },
  {
    role: 'Researcher',
    kind: 'research',
    org: 'ELITE Research Lab LLC',
    logo: '/logos/elite.png', logoBg: '#f5f5f5',
    when: 'Aug 2026 – Present',
    where: 'Remote · New York, USA',
    points: ['Research in Deep Learning, Medical Imaging and NLP.'],
  },
  {
    role: 'Jr. AI Engineer, Operations Team',
    kind: 'work',
    org: 'Betopia Limited',
    logo: '/logos/betopia-mark.png', logoBg: '#0b0b0b',
    when: 'Feb 2026 – Aug 2026',
    where: 'Dhaka',
    points: [
      'Selected among the top 40 of the Betopia Tech Recruitment Program (BTRP, Batch 01); promoted from Trainee Software Engineer to Junior AI Engineer, ranking 2nd of 40.',
      'Built 3+ production-ready RAG systems with LangChain, embedding models and vector databases: ingestion, chunking, retrieval and response generation.',
      'Built 5+ end-to-end ML pipelines covering preprocessing, EDA, training, evaluation and deployment.',
    ],
  },
];

export const education: (Org & {degree: string; school: string; when: string; where: string; note: string})[] = [
  {
    degree: 'BSc in Computer Science & Engineering',
    school: 'BRAC University',
    logo: '/logos/bracu.svg', logoBg: '#f5f5f5',
    when: 'Jan 2022 – Jan 2026',
    where: 'Dhaka',
    note: 'Thesis: XEB-FuseNet, a multimodal deep-learning framework for thoracic disease diagnosis.',
  },
  {
    degree: 'Higher Secondary Certificate (HSC), Science',
    school: 'Govt. Mohammadpur Model School and College',
    logo: '/logos/mmsc.png', logoBg: '#f5f5f5',
    when: 'Jan 2019 – Dec 2020',
    where: 'Dhaka',
    note: '',
  },
  {
    degree: 'Secondary School Certificate (SSC), Science',
    school: 'Dhanmondi Govt. Boys\u2019 High School',
    logo: '/logos/dgbhs.png', logoBg: '#f5f5f5',
    when: 'Jan 2017 – Dec 2018',
    where: 'Dhaka',
    note: '',
  },
];

export type Shot = {page: string; src: string; href: string};

export type Project = {
  slug: string;
  name: string;
  kind: string;
  summary: string;
  overview: string;
  highlights: string[];
  stack: string[];
  hero?: string;
  shots?: Shot[];
  code?: string;
  live?: string;
};

export const projects: Project[] = [
  {
    slug: 'avn',
    name: 'AVN',
    kind: 'Research · Data · Live Platform',
    summary: 'A victim-led public record of state violence in Bangladesh, documenting cases since 2009.',
    overview:
      'The All Victims & Veterans Network (AVN) is a public, open-access record of state violence in Bangladesh: extra-judicial killings, border killings, custodial deaths, death-penalty records and the Shapla massacre. I work on it as part of the R&D team at Penta Global Limited.',
    highlights: [
      'Research and technical analysis for the platform.',
      'Data cleaning, preprocessing and transformation to structure and process AVN case records.',
      'Live at avnbd.org with dedicated pages per category of violence.',
    ],
    stack: ['Research', 'Data Cleaning', 'Data Transformation'],
    hero: '/shots/avn-home.jpg',
    live: 'https://avnbd.org/',
    shots: [
      {page: 'Home', src: '/shots/avn-home.jpg', href: 'https://avnbd.org/'},
      {page: 'Extra-Judicial Killing', src: '/shots/avn-ejk.jpg', href: 'https://avnbd.org/extra-judicial-killing'},
      {page: 'Border Killing', src: '/shots/avn-border.jpg', href: 'https://avnbd.org/border-killing'},
      {page: 'Custodial Death', src: '/shots/avn-custody.jpg', href: 'https://avnbd.org/custodial-death'},
      {page: 'Shapla Massacre', src: '/shots/avn-shapla.jpg', href: 'https://avnbd.org/shapla-massacre'},
    ],
  },
  {
    slug: 'xeb-fusenet',
    name: 'XEB-FuseNet',
    kind: 'Thesis · Deep Learning',
    summary:
      'Hierarchical attention-based fusion of chest X-rays, ECG and blood labs for thoracic disease diagnosis. 0.916 AUC for Edema.',
    overview:
      'My BSc thesis: a tri-modal deep-learning framework that diagnoses five thoracic disease classes by fusing chest X-rays, ECG signals and blood laboratory data. Fusion is hierarchical and attention-gated, so the model decides how much each modality should contribute for a given patient.',
    highlights: [
      'Modality-specific encoders: InceptionV3 for chest X-rays, 1D-ResNet for ECG, an MLP for blood labs.',
      'Two-stage hierarchical attention fusion, ordered like the clinical diagnostic pathway.',
      'Edema AUC of 0.916, beating unimodal (0.872) and dual-fusion (0.893) baselines.',
      'Grad-CAM for interpretability and DeLong’s test for statistical comparison.',
      'Built on the Symile-MIMIC dataset.',
    ],
    stack: ['PyTorch', 'InceptionV3', 'ResNet1D', 'MLP', 'Grad-CAM'],
  },
  {
    slug: 'assignflow',
    name: 'AssignFlow',
    kind: 'Full-Stack · Live',
    summary: 'Role-based assignment and submission management platform with 15+ REST endpoints and Redis caching.',
    overview:
      'A modern assignment management platform with dedicated portals for admins, teachers and students: classes, assignments, multi-file submissions, grading, analytics and bilingual UI.',
    highlights: [
      '3 user roles, 7+ core modules, authentication, protected routes, submissions and dashboards.',
      '15+ REST endpoints with ASP.NET Core for authentication, assignments, submissions, grading, classes and analytics.',
      'Redis caching and optimized queries for frequently accessed data.',
    ],
    stack: ['Next.js', 'ASP.NET Core', 'PostgreSQL', 'Redis', 'TypeScript'],
    hero: '/shots/assignflow-home.jpg',
    live: 'https://assignflow-bd.vercel.app/',
    code: 'https://github.com/tarek-codes/assignflow',
    shots: [
      {page: 'Landing', src: '/shots/assignflow-home.jpg', href: 'https://assignflow-bd.vercel.app/'},
      {page: 'Login', src: '/shots/assignflow-login.jpg', href: 'https://assignflow-bd.vercel.app/login'},
      {page: 'Register', src: '/shots/assignflow-register.jpg', href: 'https://assignflow-bd.vercel.app/register'},
    ],
  },
  {
    slug: 'school-result-engine',
    name: 'School Result & GPA Engine',
    kind: 'Hackathon · Full-Stack · Live',
    summary: 'Deterministic result processing and GPA calculation for secondary schools, with a formal sign-off before publishing.',
    overview:
      'Built in the 4-hour Lofistack Hackathon 2026 as part of Team VibeStack, the 1st Runner-Up. A tabulation suite for head examiners, teachers and school administrators that processes marks into grade points, GPA and printable transcripts.',
    highlights: [
      'Dual-component verification: theory and practical marks must each pass on their own before subject aggregation.',
      'Elective bonus and compulsory-failure locking, following standard curriculum guidelines.',
      'Fixed-divisor decimal engine that removes floating-point drift from every aggregate.',
      'CSV and JSON ingestion with row-level error diagnostics, plus cohort failure analytics.',
      'Formal pre-publication sign-off and official single-page transcripts.',
    ],
    stack: [],
    hero: '/shots/result-gpa-home.jpg',
    live: 'https://lsh26-t069-p08.vercel.app/',
    shots: [
      {page: 'Overview', src: '/shots/result-gpa-home.jpg', href: 'https://lsh26-t069-p08.vercel.app/'},
      {page: 'Features', src: '/shots/result-gpa-features.jpg', href: 'https://lsh26-t069-p08.vercel.app/'},
    ],
  },
  {
    slug: 'khoroch',
    name: 'Khoroch',
    kind: 'AI · Full-Stack',
    summary: 'AI-powered expense tracker with voice-to-expense, receipt OCR and a bilingual interface.',
    overview:
      'An expense tracker that makes logging money effortless: speak or snap a receipt and Gemini extracts the transaction. It covers budgets, bills, subscriptions, lending and analytics.',
    highlights: [
      'Expense CRUD, budgets, bills, subscriptions, lending and analytics.',
      'Voice-to-expense and receipt OCR powered by Google Gemini Flash.',
      'Bilingual UI and role-based access.',
    ],
    stack: ['Next.js', 'React', 'NestJS', 'TypeORM', 'PostgreSQL', 'Gemini'],
    code: 'https://github.com/tarek-codes/Khoroch-AI-Powered-Expense-Tracker',
  },
  {
    slug: 'vibespot',
    name: 'VibeSpot',
    kind: 'Full-Stack · Team of 5',
    summary: 'Community-powered venue and event discovery for Dhaka, with Google sign-in that cut login time ~60%.',
    overview:
      'A discovery platform for venues and events in Dhaka. Users check in, save wishlists and leave ratings and reviews; admins moderate through role-based dashboards. Built by an Agile team of five.',
    highlights: [
      '8+ core features: discovery, check-ins, wishlists, ratings and reviews.',
      '12+ REST APIs with Laravel Sanctum token authentication and role-based admin dashboards.',
      'Google OAuth via Laravel Socialite, reducing login and sign-up time by ~60% over manual entry.',
    ],
    stack: ['Next.js', 'Laravel', 'PostgreSQL', 'Tailwind'],
    code: 'https://github.com/betopia-btrp/VibeSpot-Hangout-Platform',
  },
  {
    slug: 'petsphere',
    name: 'PetSphere',
    kind: 'Full-Stack',
    summary: 'Pet adoption and management system with JWT auth, RBAC and real-time chat.',
    overview:
      'A comprehensive pet adoption and management system: listings, adoption requests, lost reports and health tracking, with one-to-one messaging between users.',
    highlights: [
      '10+ core features including pet listings, adoption requests, lost reports and health tracking.',
      '15+ RESTful endpoints with JWT authentication and role-based authorization.',
      'One-to-one messaging over WebSockets (Socket.IO).',
    ],
    stack: ['Node.js', 'Express', 'MongoDB', 'Socket.IO', 'Tailwind'],
    code: 'https://github.com/2ManyFaces/PetSphere_CSE471_Section06_Group07',
  },
  {
    slug: 'word2sense',
    name: 'Word2Sense',
    kind: 'NLP · Research',
    summary: 'Compares word representations on ~340k QA pairs. Best: BiLSTM + Skip-gram at 0.725 accuracy.',
    overview:
      'A comparative study of text representations for multi-class text classification, pairing BoW, TF-IDF, GloVe and Skip-gram with classical ML and neural models.',
    highlights: [
      '~340k question-answer pairs across 10 categories.',
      'Best result: BiLSTM with Skip-gram embeddings at 0.725 accuracy.',
    ],
    stack: ['Python', 'BiLSTM', 'scikit-learn', 'GloVe'],
    code: 'https://github.com/tarek-codes/Word2Sense_Multi-Class-Text-Classification',
  },
  {
    slug: 'mycopredict',
    name: 'MycoPredict',
    kind: 'Machine Learning',
    summary: 'Mushroom edibility classification on 8,124 samples with 92%+ average accuracy across 6+ models.',
    overview:
      'Classifies mushrooms as edible or poisonous on the UCI Mushroom dataset, from exploratory analysis and feature encoding through model comparison.',
    highlights: [
      '8,124 samples with 22 features.',
      '6+ models compared on accuracy, F1, recall and AUC.',
      '92%+ average accuracy.',
    ],
    stack: ['scikit-learn', 'Pandas', 'Seaborn', 'NumPy'],
    code: 'https://github.com/tarek-codes/MycoPredict-Mushroom-Edibility-Prediction-Using-ML',
  },
  {
    slug: 'smart-irrigation',
    name: 'Solar-Powered Smart Irrigation',
    kind: 'IoT · Embedded Systems',
    summary: 'An autonomous, off-grid irrigation and remote monitoring system with a dual water source.',
    overview:
      'A university project (Oct\u2013Dec 2025, BRAC University): an autonomous, solar-powered smart irrigation and remote monitoring system designed to improve water efficiency and cut manual labor in urban and small-scale agriculture.',
    highlights: [
      'Autonomous and off-grid, powered by solar.',
      'Dual water source with remote monitoring.',
      'Aimed at saving water and reducing manual work in urban and small-scale farming.',
    ],
    stack: ['Embedded Systems', 'IoT'],
  },
  {
    slug: 'enterprise-network',
    name: 'Enterprise Network Design',
    kind: 'Networking · Cisco Packet Tracer',
    summary: 'A multi-zone enterprise network connecting five organizations and an apartment committee.',
    overview:
      'A university project (Nov\u2013Dec 2025, BRAC University): a multi-zone enterprise network designed and simulated in Cisco Packet Tracer, connecting five organizational networks and an apartment committee network.',
    highlights: [
      'Network topology with VLSM subnetting and IP addressing.',
      'Router interface configuration, DHCP, DNS, web and email services.',
      'Inter-network communication across all zones.',
    ],
    stack: ['Cisco Packet Tracer', 'Computer Networking', 'VLSM', 'DHCP', 'DNS'],
  },
];

export const skills: {group: string; items: string[]}[] = [
  {group: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'Java', 'PHP', 'C', 'C++', 'SQL']},
  {group: 'Web & Backend', items: ['Next.js', 'React', 'Node.js', 'NestJS', 'Django', 'FastAPI', 'Laravel', 'Tailwind CSS', 'Playwright', 'Locust']},
  {group: 'AI / ML', items: ['PyTorch', 'TensorFlow', 'Keras', 'scikit-learn', 'LangChain', 'LlamaIndex', 'ChromaDB', 'Pandas']},
  {group: 'Data & Tools', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Git', 'Celery', 'Postman', 'Figma']},
  {group: 'Spoken Languages', items: ['Bangla', 'English', 'Japanese']},
];

export const achievements = [
  {
    title: 'Lofistack Hackathon 2026',
    group: 'Hackathons',
    note: '1st Runner-Up · Team VibeStack (team lead) · 180+ entries, 72 finalists',
    href: 'https://my-certificates.com/certificates/6aa02325df30fc41b2cd7735',
    image: '/lofi.jpg',
    imageAlt: 'Lofistack Hackathon 2026 1st Runner-Up poster: Team VibeStack, Faisal Hossain and Tarek Alam Bhuiyan',
    imageHref: 'https://live.hackathon.lofistack.com/prizegiving',
  },
  {title: 'BUCC Intrahacktive Hackathon', group: 'Hackathons', note: 'Database Wizard · BRAC University Computer Club', href: 'https://drive.google.com/file/d/1QnVPVa141Mral5nBFhLEMUsCOVzNdj5o/view', image: '/certs/bucc-database-wizard.png', imageAlt: 'Certificate: Database Wizard award, BUCC Intrahacktive Hackathon'},
  {title: 'MIST Neofetch Hackathon', group: 'Hackathons', note: 'Programming Hero · MIST Innovation Club', href: 'https://drive.google.com/file/d/15Gw8_R1a3b7WHYZpvAcI4iicteZhYD3o/view', image: '/certs/mist-neofetch.png', imageAlt: 'Certificate: MIST Neofetch Hackathon, Programming Hero'},
  {title: 'SICIP Training on MLDL', group: 'Training', note: 'Certificate Course on Machine Learning and Deep Learning · Ministry of Finance & Asian Development Bank', href: 'https://drive.google.com/file/d/1m_ayJ4wHRfG4NN6X31K879U5fqZzXmcj/view', image: '/certs/sicip-mldl.png', imageAlt: 'SICIP Certificate Course on Machine Learning and Deep Learning, with BRAC University, Government of Bangladesh and ADB logos'},
  {title: 'DofE: Duke of Edinburgh’s International Award', group: 'Certifications', note: 'Bronze · 2022 · The Duke of Edinburgh’s Award Foundation', href: 'https://drive.google.com/file/d/1Htl9szl1CPnxYtIJ9OrH4lpe7bM5tw-Q/view', image: '/certs/dofe-bronze.png', imageAlt: 'The Duke of Edinburgh’s Award DofE emblem on a bronze plaque'},
  {title: 'AI Fundamentals', group: 'Certifications', note: 'DataCamp', href: 'https://www.datacamp.com/skill-verification/AIF0025451703728', image: '/certs/datacamp-ai-fundamentals.png', imageAlt: 'DataCamp certificate: AI Fundamentals'},
  {title: 'Intermediate SQL', group: 'Certifications', note: 'DataCamp', href: 'https://www.datacamp.com/completed/statement-of-accomplishment/course/114e366d7194002d5c73c64232aacbdb96b95786', image: '/certs/datacamp-intermediate-sql.png', imageAlt: 'DataCamp certificate: Intermediate SQL'},
];


/* ---------- Interests pages ---------- */

export type Spot = {name: string; lat: number; lon: number; district: string};
export type Place = {id: string; name: string; area: string; lat: number; lon: number; district: string; spots: Spot[]};

/**
 * Places visited in Bangladesh. Each place has a main point (lat/lon) and the specific spots visited there.
 * Add a place or a spot with its coordinates and it shows up on the map and in the list.
 */
export const travel: Place[] = [
  {
    id: 'sylhet', name: 'Sylhet', area: 'Sylhet Division', lat: 24.8949, lon: 91.8687, district: 'Sylhet',
    spots: [
      {name: 'Jaflong', lat: 25.1730, lon: 92.0203, district: 'Sylhet'},
      {name: 'Ratargul Swamp Forest', lat: 25.0121, lon: 91.9229, district: 'Sylhet'},
      {name: 'Lalakhal', lat: 25.1165, lon: 92.1842, district: 'Sylhet'},
      {name: 'Shah Jalal Dargah', lat: 24.9022, lon: 91.8664, district: 'Sylhet'},
    ],
  },
  {
    id: 'srimangal', name: 'Srimangal', area: 'Moulvibazar, Sylhet Division', lat: 24.3065, lon: 91.7296, district: 'Moulvibazar',
    spots: [
      {name: 'Lawachara National Park', lat: 24.3292, lon: 91.7879, district: 'Moulvibazar'},
      {name: 'Madhabpur Lake', lat: 24.2810, lon: 91.8173, district: 'Moulvibazar'},
      {name: 'Baikka Beel', lat: 24.3502, lon: 91.6993, district: 'Moulvibazar'},
    ],
  },
  {
    id: 'sunamganj', name: 'Sunamganj', area: 'Sylhet Division', lat: 25.0658, lon: 91.3950, district: 'Sunamganj',
    spots: [
      {name: 'Tanguar Haor', lat: 25.1484, lon: 91.0549, district: 'Sunamganj'},
      {name: 'Niladri Lake, Tekerghat', lat: 25.1969, lon: 91.2131, district: 'Sunamganj'},
      {name: 'Barek Tila', lat: 25.1922, lon: 91.2509, district: 'Sunamganj'},
      {name: 'Jadukata River', lat: 25.1085, lon: 91.2437, district: 'Sunamganj'},
    ],
  },
  {
    id: 'dhaka', name: 'Dhaka', area: 'Dhaka Division', lat: 23.8103, lon: 90.4125, district: 'Dhaka',
    spots: [
      {name: 'Lalbagh Fort', lat: 23.7188, lon: 90.3882, district: 'Dhaka'},
      {name: 'Ahsan Manzil', lat: 23.7085, lon: 90.4056, district: 'Dhaka'},
      {name: 'Curzon Hall', lat: 23.7273, lon: 90.4019, district: 'Dhaka'},
      {name: 'Jatiya Sangsad Bhaban', lat: 23.7623, lon: 90.3785, district: 'Dhaka'},
      {name: 'Panam Nagar, Sonargaon', lat: 23.6558, lon: 90.6033, district: 'Narayanganj'},
    ],
  },
  {
    id: 'tangail', name: 'Tangail', area: 'Dhaka Division', lat: 24.2513, lon: 89.9167, district: 'Tangail',
    spots: [
      {name: 'Madhupur National Park', lat: 24.6899, lon: 90.0945, district: 'Tangail'},
      {name: 'Dhanbari', lat: 24.6774, lon: 89.9519, district: 'Tangail'},
      {name: 'Bangabandhu Jamuna Bridge', lat: 24.3895, lon: 89.8201, district: 'Tangail'},
    ],
  },
  {
    id: 'chittagong', name: 'Chittagong', area: 'Chattogram Division', lat: 22.3569, lon: 91.7832, district: 'Chattogram',
    spots: [
      {name: 'Patenga Sea Beach', lat: 22.2344, lon: 91.7923, district: 'Chattogram'},
      {name: 'Foy\u2019s Lake', lat: 22.3735, lon: 91.7880, district: 'Chattogram'},
      {name: 'Batali Hill', lat: 22.3441, lon: 91.8134, district: 'Chattogram'},
      {name: 'Ethnological Museum', lat: 22.3280, lon: 91.8151, district: 'Chattogram'},
      {name: 'War Cemetery', lat: 22.3572, lon: 91.8287, district: 'Chattogram'},
    ],
  },
  {
    id: 'coxs-bazar', name: 'Cox\u2019s Bazar', area: 'Chattogram Division', lat: 21.4272, lon: 92.0058, district: 'Cox\'s Bazar',
    spots: [
      {name: 'Cox\u2019s Bazar & Laboni Beach', lat: 21.4296, lon: 91.9756, district: 'Cox\'s Bazar'},
      {name: 'Himchari National Park', lat: 21.3535, lon: 92.0475, district: 'Cox\'s Bazar'},
      {name: 'Inani', lat: 21.1507, lon: 92.0859, district: 'Cox\'s Bazar'},
    ],
  },
];

export type Playlist = {name: string; description: string; href: string; embed?: string};
/** Playlists: add {name, description, href} (and optionally a Spotify/YouTube embed URL). */
export const playlists: Playlist[] = [];

export type Watched = {title: string; year?: string; kind: 'series' | 'movie'; poster?: string; rating?: number; note?: string; link?: string; watchedOn?: string};
/** Series and movies I have watched: add {title, year, kind, note}. */
export const watched: Watched[] = [];

export type Game = {title: string; platform?: string; note?: string; cover?: string};
/** Video games I play: add {title, platform, note}. */
export const games: Game[] = [];

export type Learning = {title: string; note?: string; tags: string[]};
/** Things I am learning right now. Editable in /admin. */
export const learning: Learning[] = [
  {
    title: 'Agentic development',
    note: 'Building software with AI coding agents and multi-agent workflows, and learning where human review still matters most.',
    tags: ['Claude Code', 'AI agents', 'Prompting'],
  },
  {
    title: 'Deep learning for medical imaging',
    note: 'Multimodal models for thoracic disease diagnosis, from my thesis to ongoing research at ELITE Research Lab.',
    tags: ['PyTorch', 'Medical imaging', 'Multimodal fusion'],
  },
  {
    title: 'NLP and language models',
    note: 'Text representations, retrieval-augmented generation and LLM-powered apps.',
    tags: ['NLP', 'RAG', 'LangChain'],
  },
  {
    title: 'Web motion and design systems',
    note: 'Craft behind the interface: this portfolio is my playground for design-system components, smooth scrolling and animation.',
    tags: ['Astryx', 'GSAP', 'Lenis'],
  },
];
