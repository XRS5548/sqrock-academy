import type { CourseView, JobView } from "@/lib/types";

export { site } from "@/lib/site";

export const categories = [
  { name: "Development", icon: "Code", count: 42 },
  { name: "Data & AI", icon: "Brain", count: 24 },
  { name: "Game Development", icon: "GameController", count: 12 },
  { name: "Cloud & DevOps", icon: "Cloud", count: 18 },
  { name: "Business", icon: "ChartLineUp", count: 15 },
  { name: "Marketing", icon: "Megaphone", count: 9 },
];

export const stats = [
  { value: "24k+", label: "Learners on the platform" },
  { value: "120+", label: "Expert-led courses" },
  { value: "93%", label: "Course completion rate" },
  { value: "4.8/5", label: "Average learner rating" },
];

export const features = [
  {
    title: "Built by working professionals",
    description:
      "Every course is created by our in-house team of engineers and practitioners — not scraped from the internet. You learn what teams actually use.",
    icon: "Medal",
  },
  {
    title: "Learn at your own pace",
    description:
      "Lifetime access to every lesson you enrol in, on any device. Download attachments, revisit lessons whenever you need a refresher.",
    icon: "Clock",
  },
  {
    title: "Certification that means something",
    description:
      "Finish the course, clear the final exam set by the instructors, and unlock a verifiable certificate you can add to LinkedIn.",
    icon: "Certificate",
  },
  {
    title: "Jobs and internships, daily",
    description:
      "Our team hunts for fresh openings every day and lists them in one place, so you can spend less time searching and more time applying.",
    icon: "Briefcase",
  },
  {
    title: "Doubt support that replies",
    description:
      "Stuck on something? Email academy@sqrock.cloud and the same team that built the course will help you get unstuck.",
    icon: "ChatCircle",
  },
  {
    title: "Mobile app coming soon",
    description:
      "The Sqrock Academy app lands on 10 December with the same courses, progress and certificates on the go.",
    icon: "DeviceMobile",
  },
];

const lesson = (
  id: string,
  title: string,
  durationMinutes: number,
  position: number,
  opts: {
    videoUrl?: string;
    isPreview?: boolean;
    description?: string;
    attachments?: { name: string; url: string; fileType?: string }[];
  } = {},
) => ({
  id,
  title,
  description: opts.description ?? "",
  videoType: "youtube",
  videoUrl: opts.videoUrl ?? "",
  durationMinutes,
  position,
  isPreview: opts.isPreview ?? false,
  attachments: (opts.attachments ?? []).map((a, i) => ({
    id: `${id}-att-${i}`,
    lessonId: id,
    name: a.name,
    url: a.url,
    fileType: a.fileType ?? "PDF",
    fileSize: null,
  })),
});

export const demoCourses: CourseView[] = [
  {
    id: "demo-python",
    slug: "python-for-absolute-beginners",
    title: "Python for Absolute Beginners",
    subtitle:
      "Go from zero to writing real Python programs, with projects at every step.",
    description:
      "<p>This course is designed for people who have never written a line of code. We start from installing Python and end with building small, real applications.</p><p>You will work through hands-on exercises in every lesson, and finish with a set of projects you can show on your resume.</p><h3>What you will build</h3><ul><li>A command line task manager</li><li>A data scraper and CSV report</li><li>A small FastAPI service</li></ul>",
    category: "Development",
    level: "Beginner",
    language: "English",
    thumbnail: null,
    price: 0,
    isFree: true,
    status: "published",
    durationMinutes: 760,
    instructorName: "Aarav Mehta",
    instructorRole: "Senior Software Engineer",
    instructorImage: null,
    certificateEnabled: true,
    examPassPercent: 70,
    examLockHours: 48,
    outcomes: [
      "Write clean, readable Python confidently",
      "Work with files, APIs and third-party packages",
      "Build and ship small automation projects",
      "Prepare for advanced backend development",
    ],
    requirements: [
      "A laptop with any operating system",
      "No prior programming experience needed",
    ],
    tags: ["Python", "Programming", "Automation"],
    enrollments: 8420,
    rating: 49,
    lessons: [
      lesson("py-1", "Welcome and setting up Python", 18, 1, {
        videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw",
        isPreview: true,
        description:
          "Install Python, set up VS Code, and run your very first program.",
        attachments: [
          { name: "Setup checklist.pdf", url: "#" },
          { name: "Cheatsheet - basics.pdf", url: "#" },
        ],
      }),
      lesson("py-2", "Variables, types and operators", 34, 2, {
        videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw",
      }),
      lesson("py-3", "Conditionals and loops", 42, 3, {
        videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw",
      }),
      lesson("py-4", "Functions and modules", 38, 4, {
        videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw",
      }),
      lesson("py-5", "Lists, dicts and comprehensions", 46, 5, {
        videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw",
      }),
      lesson("py-6", "Files, errors and virtual environments", 40, 6, {
        videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw",
      }),
      lesson("py-7", "Project: command line task manager", 55, 7, {
        videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw",
      }),
      lesson("py-8", "Next steps into backend development", 28, 8, {
        videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw",
      }),
    ],
  },
  {
    id: "demo-java",
    slug: "java-backend-masterclass",
    title: "Java Backend Masterclass",
    subtitle:
      "Spring Boot, REST APIs, databases and deployment — the full backend toolkit.",
    description:
      "<p>Build production-grade backend services with Java and Spring Boot. This course covers the patterns and tools used by real backend teams.</p><ul><li>REST API design</li><li>Spring Data JPA and PostgreSQL</li><li>Authentication and testing</li><li>Docker deployment</li></ul>",
    category: "Development",
    level: "Intermediate",
    language: "English",
    thumbnail: null,
    price: 3499,
    isFree: false,
    status: "published",
    durationMinutes: 1260,
    instructorName: "Rohit Sharma",
    instructorRole: "Backend Architect",
    instructorImage: null,
    certificateEnabled: true,
    examPassPercent: 70,
    examLockHours: 48,
    outcomes: [
      "Design clean REST APIs with Spring Boot",
      "Model and query relational data with JPA",
      "Secure services with JWT authentication",
      "Containerise and deploy a backend service",
    ],
    requirements: ["Basic programming knowledge in any language"],
    tags: ["Java", "Spring Boot", "Backend"],
    enrollments: 3120,
    rating: 48,
    lessons: [
      lesson("jv-1", "Course roadmap and project overview", 15, 1, {
        videoUrl: "https://www.youtube.com/embed/eIrMbAQSU34",
        isPreview: true,
      }),
      lesson("jv-2", "Spring Boot fundamentals", 52, 2, {
        videoUrl: "https://www.youtube.com/embed/eIrMbAQSU34",
      }),
      lesson("jv-3", "REST controllers and validation", 48, 3, {
        videoUrl: "https://www.youtube.com/embed/eIrMbAQSU34",
      }),
      lesson("jv-4", "Persistence with JPA and PostgreSQL", 64, 4, {
        videoUrl: "https://www.youtube.com/embed/eIrMbAQSU34",
      }),
      lesson("jv-5", "Authentication with JWT", 58, 5, {
        videoUrl: "https://www.youtube.com/embed/eIrMbAQSU34",
      }),
      lesson("jv-6", "Testing and documentation", 44, 6, {
        videoUrl: "https://www.youtube.com/embed/eIrMbAQSU34",
      }),
      lesson("jv-7", "Dockerising and deploying", 40, 7, {
        videoUrl: "https://www.youtube.com/embed/eIrMbAQSU34",
      }),
    ],
  },
  {
    id: "demo-ml",
    slug: "machine-learning-foundations",
    title: "Machine Learning Foundations",
    subtitle:
      "Understand the maths, build the models, and ship your first ML project.",
    description:
      "<p>A practical introduction to machine learning with Python, scikit-learn and PyTorch. We focus on intuition first, then code.</p>",
    category: "Data & AI",
    level: "Intermediate",
    language: "English",
    thumbnail: null,
    price: 4999,
    isFree: false,
    status: "published",
    durationMinutes: 980,
    instructorName: "Dr. Neha Kulkarni",
    instructorRole: "ML Engineer & Researcher",
    instructorImage: null,
    certificateEnabled: true,
    examPassPercent: 75,
    examLockHours: 48,
    outcomes: [
      "Understand supervised and unsupervised learning",
      "Prepare datasets and evaluate models properly",
      "Train and tune models with scikit-learn",
      "Build a neural network with PyTorch",
    ],
    requirements: ["Comfortable with Python", "School-level mathematics"],
    tags: ["Machine Learning", "Python", "AI"],
    enrollments: 5180,
    rating: 49,
    lessons: [
      lesson("ml-1", "What machine learning really is", 24, 1, {
        isPreview: true,
      }),
      lesson("ml-2", "Data cleaning and feature engineering", 55, 2),
      lesson("ml-3", "Regression and classification", 62, 3),
      lesson("ml-4", "Model evaluation and overfitting", 48, 4),
      lesson("ml-5", "Clustering and dimensionality reduction", 44, 5),
      lesson("ml-6", "Neural networks with PyTorch", 70, 6),
      lesson("ml-7", "Project: end-to-end prediction pipeline", 80, 7),
    ],
  },
  {
    id: "demo-devops",
    slug: "devops-and-aws-in-practice",
    title: "DevOps & AWS in Practice",
    subtitle:
      "CI/CD, containers, infrastructure as code and cloud deployment on AWS.",
    description:
      "<p>Learn the DevOps workflow teams use every day: version control, automated testing, container builds, infrastructure as code and monitoring on AWS.</p>",
    category: "Cloud & DevOps",
    level: "Intermediate",
    language: "English",
    thumbnail: null,
    price: 5999,
    isFree: false,
    status: "published",
    durationMinutes: 1140,
    instructorName: "Karan Verma",
    instructorRole: "Platform Engineer",
    instructorImage: null,
    certificateEnabled: true,
    examPassPercent: 70,
    examLockHours: 48,
    outcomes: [
      "Containerise applications with Docker",
      "Build CI/CD pipelines with GitHub Actions",
      "Provision AWS infrastructure with Terraform",
      "Monitor and scale production services",
    ],
    requirements: ["Basic Linux command line", "Familiarity with Git"],
    tags: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    enrollments: 2760,
    rating: 48,
    lessons: [
      lesson("dv-1", "The DevOps mindset", 20, 1, { isPreview: true }),
      lesson("dv-2", "Linux and shell essentials", 48, 2),
      lesson("dv-3", "Docker and container registries", 56, 3),
      lesson("dv-4", "CI/CD with GitHub Actions", 52, 4),
      lesson("dv-5", "AWS core services", 68, 5),
      lesson("dv-6", "Infrastructure as code with Terraform", 60, 6),
      lesson("dv-7", "Monitoring, logging and scaling", 45, 7),
    ],
  },
  {
    id: "demo-unity",
    slug: "unity-game-development",
    title: "Unity Game Development",
    subtitle:
      "Build and publish your first 3D game with Unity and C#.",
    description:
      "<p>From your first scene to a playable build, this course walks you through the complete Unity workflow with C# scripting.</p>",
    category: "Game Development",
    level: "Beginner",
    language: "English",
    thumbnail: null,
    price: 2999,
    isFree: false,
    status: "published",
    durationMinutes: 880,
    instructorName: "Ishaan Roy",
    instructorRole: "Game Developer",
    instructorImage: null,
    certificateEnabled: true,
    examPassPercent: 70,
    examLockHours: 48,
    outcomes: [
      "Navigate Unity and build 3D scenes",
      "Write C# scripts for gameplay",
      "Add physics, animation and UI",
      "Package a playable game build",
    ],
    requirements: ["A computer that can run Unity"],
    tags: ["Unity", "C#", "Game Dev"],
    enrollments: 1940,
    rating: 47,
    lessons: [
      lesson("un-1", "Installing Unity and project setup", 22, 1, {
        isPreview: true,
      }),
      lesson("un-2", "Scenes, objects and the editor", 40, 2),
      lesson("un-3", "C# scripting basics", 48, 3),
      lesson("un-4", "Physics and player movement", 52, 4),
      lesson("un-5", "Animation and audio", 36, 5),
      lesson("un-6", "Building and publishing", 30, 6),
    ],
  },
  {
    id: "demo-digital-marketing",
    slug: "digital-marketing-that-converts",
    title: "Digital Marketing That Converts",
    subtitle:
      "SEO, performance ads, content and analytics — built around real campaigns.",
    description:
      "<p>Learn how modern marketing teams plan, launch and measure campaigns across search, social and email.</p>",
    category: "Marketing",
    level: "Beginner",
    language: "English",
    thumbnail: null,
    price: 1999,
    isFree: false,
    status: "published",
    durationMinutes: 540,
    instructorName: "Priya Nair",
    instructorRole: "Growth Marketer",
    instructorImage: null,
    certificateEnabled: true,
    examPassPercent: 70,
    examLockHours: 48,
    outcomes: [
      "Plan a full-funnel marketing campaign",
      "Run SEO and content sprints",
      "Set up conversion tracking",
      "Read analytics and improve results",
    ],
    requirements: ["No prior marketing experience needed"],
    tags: ["Marketing", "SEO", "Ads"],
    enrollments: 2210,
    rating: 47,
    lessons: [
      lesson("dm-1", "Marketing foundations", 18, 1, { isPreview: true }),
      lesson("dm-2", "SEO and content strategy", 42, 2),
      lesson("dm-3", "Meta and Google ads", 50, 3),
      lesson("dm-4", "Email and retention", 32, 4),
      lesson("dm-5", "Analytics and reporting", 38, 5),
    ],
  },
  {
    id: "demo-business",
    slug: "business-analysis-essentials",
    title: "Business Analysis Essentials",
    subtitle:
      "Turn business problems into clear requirements, processes and decisions.",
    description:
      "<p>A practical course for aspiring business analysts covering requirement gathering, process mapping, documentation and stakeholder communication.</p>",
    category: "Business",
    level: "Beginner",
    language: "English",
    thumbnail: null,
    price: 2499,
    isFree: false,
    status: "published",
    durationMinutes: 480,
    instructorName: "Sneha Iyer",
    instructorRole: "Senior Business Analyst",
    instructorImage: null,
    certificateEnabled: true,
    examPassPercent: 70,
    examLockHours: 48,
    outcomes: [
      "Run effective stakeholder interviews",
      "Write user stories and acceptance criteria",
      "Map and improve business processes",
      "Present findings with confidence",
    ],
    requirements: ["Curiosity and basic spreadsheet skills"],
    tags: ["Business Analysis", "Agile", "Requirements"],
    enrollments: 1680,
    rating: 46,
    lessons: [
      lesson("ba-1", "The business analyst role", 20, 1, { isPreview: true }),
      lesson("ba-2", "Stakeholders and requirements", 44, 2),
      lesson("ba-3", "Process mapping", 38, 3),
      lesson("ba-4", "User stories and Agile delivery", 40, 4),
      lesson("ba-5", "Communication and documentation", 30, 5),
    ],
  },
  {
    id: "demo-csharp",
    slug: "csharp-and-dotnet-core",
    title: "C# & .NET Core",
    subtitle: "Modern C# for desktop, web and game development.",
    description:
      "<p>Master C# fundamentals and the .NET ecosystem with hands-on projects.</p>",
    category: "Development",
    level: "Beginner",
    language: "English",
    thumbnail: null,
    price: 0,
    isFree: true,
    status: "published",
    durationMinutes: 660,
    instructorName: "Aditya Rao",
    instructorRole: "Software Engineer",
    instructorImage: null,
    certificateEnabled: true,
    examPassPercent: 70,
    examLockHours: 48,
    outcomes: [
      "Write idiomatic C# code",
      "Understand OOP and generics",
      "Build a small .NET web API",
      "Use async/await correctly",
    ],
    requirements: ["No prior C# experience needed"],
    tags: ["C#", ".NET", "OOP"],
    enrollments: 3640,
    rating: 48,
    lessons: [
      lesson("cs-1", "Getting started with .NET", 24, 1, { isPreview: true }),
      lesson("cs-2", "Types, classes and objects", 42, 2),
      lesson("cs-3", "Interfaces, generics and LINQ", 48, 3),
      lesson("cs-4", "Async programming", 38, 4),
      lesson("cs-5", "Building a web API", 52, 5),
    ],
  },
];

export const demoJobs: JobView[] = [
  {
    id: "job-1",
    title: "Junior Python Developer",
    company: "Nimbus Labs",
    companyLogo: null,
    type: "job",
    location: "Bengaluru, India",
    workMode: "Hybrid",
    category: "Engineering",
    experience: "0–2 years",
    salary: "₹6–9 LPA",
    description:
      "<p>We are hiring a junior Python developer to work on our internal automation platform. You will pair with senior engineers, write production code, and help improve our data pipelines.</p><h3>What we look for</h3><ul><li>Solid Python fundamentals</li><li>Comfort with SQL and REST APIs</li><li>Willingness to learn and ask questions</li></ul>",
    applyUrl: "https://example.com/careers",
    applyEmail: null,
    status: "approved",
    featured: true,
    createdAt: new Date(),
  },
  {
    id: "job-2",
    title: "Frontend Engineering Intern",
    company: "Koda Studio",
    companyLogo: null,
    type: "internship",
    location: "Remote",
    workMode: "Remote",
    category: "Engineering",
    experience: "Fresher",
    salary: "₹25,000 / month",
    description:
      "<p>A 6-month paid internship for students who love building interfaces. You will work on real client projects with React and TypeScript.</p>",
    applyUrl: "https://example.com/internships",
    applyEmail: null,
    status: "approved",
    featured: false,
    createdAt: new Date(),
  },
  {
    id: "job-3",
    title: "Data Analyst",
    company: "Finlytics",
    companyLogo: null,
    type: "job",
    location: "Pune, India",
    workMode: "On-site",
    category: "Data",
    experience: "1–3 years",
    salary: "₹8–12 LPA",
    description:
      "<p>Join our analytics team to build dashboards and insights for fintech clients. Strong SQL and a good eye for visualisation are essential.</p>",
    applyUrl: "https://example.com/jobs",
    applyEmail: null,
    status: "approved",
    featured: true,
    createdAt: new Date(),
  },
  {
    id: "job-4",
    title: "Unity Game Developer",
    company: "Pixel Forge",
    companyLogo: null,
    type: "job",
    location: "Remote",
    workMode: "Remote",
    category: "Game Development",
    experience: "2+ years",
    salary: "₹10–16 LPA",
    description:
      "<p>We are building a multiplayer mobile game and need a Unity developer comfortable with C#, physics and performance profiling.</p>",
    applyUrl: "https://example.com/careers",
    applyEmail: null,
    status: "approved",
    featured: false,
    createdAt: new Date(),
  },
  {
    id: "job-5",
    title: "Digital Marketing Intern",
    company: "Bloom Social",
    companyLogo: null,
    type: "internship",
    location: "Mumbai, India",
    workMode: "Hybrid",
    category: "Marketing",
    experience: "Fresher",
    salary: "₹15,000 / month",
    description:
      "<p>Work with our content and performance team to plan social campaigns, track results and report insights.</p>",
    applyUrl: "https://example.com/jobs",
    applyEmail: null,
    status: "approved",
    featured: false,
    createdAt: new Date(),
  },
  {
    id: "job-6",
    title: "Cloud Engineer (AWS)",
    company: "Stackline",
    companyLogo: null,
    type: "job",
    location: "Hyderabad, India",
    workMode: "Hybrid",
    category: "Cloud",
    experience: "2–4 years",
    salary: "₹14–20 LPA",
    description:
      "<p>Help us operate a large AWS footprint. You should be comfortable with Terraform, Kubernetes and CI/CD pipelines.</p>",
    applyUrl: "https://example.com/careers",
    applyEmail: null,
    status: "approved",
    featured: true,
    createdAt: new Date(),
  },
];

export const faqs = [
  {
    q: "Does Sqrock Academy sell courses?",
    a: "Yes. We have a mix of free and paid courses. A free course is fully accessible once you enrol, and paid courses unlock all lessons, attachments and the certification exam.",
  },
  {
    q: "Does the academy create its own courses?",
    a: "Yes. Every course is designed and recorded by our in-house team and instructors. We do not resell third-party content.",
  },
  {
    q: "What kind of courses are available?",
    a: "We focus on industry demand: Python, Java, C#, Unity, Unreal Engine, machine learning, data science, DevOps, AWS and more — plus business analysis, digital marketing and other career skills.",
  },
  {
    q: "Do learners get a certificate?",
    a: "Yes. After finishing a course you take a final exam written by the course team. You need to score above the passing marks to unlock your certificate. If you do not pass, you can retake the exam after 48 hours.",
  },
  {
    q: "Can I find jobs and internships here?",
    a: "Yes. Our team searches for new openings every day and lists them in the Jobs section so students can apply directly. Anyone can also submit a verified job post for their company free of cost — it goes live after admin approval.",
  },
  {
    q: "Is there a mobile app?",
    a: "Yes, the Sqrock Academy app launches on 10 December with the same courses, progress tracking and certificates on mobile.",
  },
  {
    q: "How can students ask questions?",
    a: "Email academy@sqrock.cloud with your question. The same team that builds the courses replies and helps you get unstuck.",
  },
];

export const testimonials = [
  {
    quote:
      "The Python course was the first one I actually finished. Short lessons, real projects, and a certificate I could put on my resume.",
    name: "Ananya S.",
    role: "Software Engineer Intern",
    initials: "AS",
  },
  {
    quote:
      "The exam made me revisit the weak topics. That is exactly what a certification should do — it felt earned, not given.",
    name: "Mohit R.",
    role: "Data Analyst",
    initials: "MR",
  },
  {
    quote:
      "I found my first internship through the jobs board here. The listings are actually checked and updated daily.",
    name: "Fatima K.",
    role: "Frontend Developer",
    initials: "FK",
  },
];
