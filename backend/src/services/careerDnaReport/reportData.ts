export const reportData = {
  candidate: {
    name: "DT DEF Testing",
    email: "s@s.com",
    assessmentDate: "9 May 2026",
    reportDate: "3 June 2026",
    totalScore: 449,
    code: "CAREER_DNA",
    answeredLabel: "360 / 360 answered",
  },

  cognitive: {
    total: 30,
    outOf: 40,
    percent: 75,
    items: [
      { label: "Verbal Reasoning", score: 6, max: 10, pct: 60 },
      { label: "Numerical Reasoning", score: 9, max: 10, pct: 90 },
      { label: "Spatial Reasoning", score: 6, max: 10, pct: 60 },
      { label: "Memory & Processing Speed", score: 9, max: 10, pct: 90 },
    ],
  },

  aptitude: {
    total: 39,
    outOf: 50,
    percent: 78,
    items: [
      { label: "Logical & Analytical Reasoning", score: 9, max: 10, pct: 90 },
      { label: "Numerical Aptitude", score: 9, max: 10, pct: 90 },
      { label: "Verbal Aptitude", score: 6, max: 10, pct: 60 },
      { label: "Mechanical Aptitude", score: 6, max: 10, pct: 60 },
      { label: "Creativity & Innovation", score: 9, max: 10, pct: 90 },
    ],
  },

  personality: {
    items: [
      { label: "Social Style", type: "Reflective Orientation", score: 88, max: 100 },
      { label: "Thinking Style", type: "Conceptual Thinking", score: 84, max: 100 },
      { label: "Decision Style", type: "Value-Based Decision", score: 94, max: 100 },
      { label: "Working Style", type: "Flexible Working", score: 94, max: 100 },
    ],
  },

  careerInterest: {
    total: 18,
    outOf: 40,
    dominantCode: "ISE",
    items: [
      { label: "Investigative (I)", score: 7, max: 7, pct: 100 },
      { label: "Social (S)", score: 4, max: 7, pct: 57 },
      { label: "Enterprising (E)", score: 3, max: 7, pct: 43 },
      { label: "Conventional (C)", score: 2, max: 5, pct: 40 },
      { label: "Realistic (R)", score: 2, max: 7, pct: 29 },
      { label: "Artistic (A)", score: 0, max: 7, pct: 0 },
    ],
  },

  emotionalIntelligence: {
    total: 57,
    outOf: 160,
    percent: 36,
    items: [
      { label: "Self-Awareness", score: 20, max: 40, pct: 50 },
      { label: "Emotional Regulation", score: 15, max: 40, pct: 38 },
      { label: "Empathy", score: 10, max: 40, pct: 25 },
      { label: "Social Skills", score: 12, max: 40, pct: 30 },
    ],
  },

  learningStyle: {
    total: 79,
    outOf: 120,
    dominantCode: "ASI",
    items: [
      { label: "Auditory", score: 15, max: 15, pct: 100 },
      { label: "Visual", score: 11, max: 15, pct: 73 },
      { label: "Social", score: 12, max: 15, pct: 80 },
      { label: "Solitary", score: 12, max: 15, pct: 80 },
      { label: "Reading / Writing", score: 9, max: 15, pct: 60 },
      { label: "Logical", score: 9, max: 15, pct: 60 },
      { label: "Musical", score: 6, max: 15, pct: 40 },
      { label: "Kinesthetic", score: 5, max: 15, pct: 33 },
    ],
  },

  behavioralSocial: {
    total: 106,
    outOf: 160,
    percent: 66,
    items: [
      { label: "Adaptability", score: 26, max: 40, pct: 65 },
      { label: "Teamwork", score: 28, max: 40, pct: 70 },
      { label: "Leadership Skills", score: 25, max: 40, pct: 63 },
      { label: "Communication Skills", score: 27, max: 40, pct: 68 },
    ],
  },

  stressResilience: {
    total: 120,
    outOf: 160,
    percent: 75,
    items: [
      { label: "Stress Triggers & Awareness", score: 32, max: 40, pct: 80 },
      { label: "Emotional Coping Strategies", score: 30, max: 40, pct: 75 },
      { label: "Problem-Solving & Self-Talk", score: 28, max: 40, pct: 70 },
      { label: "Resilience & Bounce-Back", score: 30, max: 40, pct: 75 },
    ],
  },

  // Derived summaries used in Executive Summary
  topStrengths: [
    "Numerical & Logical Reasoning (90%)- strong analytical foundation",
    "Creativity & Innovation (90%)- high potential for original problem-solving",
    "Value-Based & Flexible Decision-Making (94%)- clear strategic judgment",
    "Stress Resilience (75%)- effective coping under pressure",
    "Auditory Learning (100%)- excels with verbal instruction and discussion",
  ],

  developmentAreas: [
    "Emotional Intelligence (36%)- empathy and social skills need attention",
    "Artistic Interest (0%)- creative expression channel is unexplored",
    "Empathy (25%)- low interpersonal awareness may limit leadership depth",
    "Kinesthetic Learning (33%)- hands-on skill development could be broadened",
  ],

  keyTakeaways: [
    "Investigative-Social-Enterprising (ISE) profile points to research-driven leadership roles.",
    "High numerical and analytical scores indicate strong STEM and business analytics potential.",
    "Flexible, value-based working and decision styles support adaptable leadership grounded in clear principles.",
    "Emotional intelligence is the primary development lever- structured coaching will yield rapid ROI.",
    "Resilience scores (75%) provide a solid psychological platform for demanding career transitions.",
  ],

  careerRecommendations: [
    { career: "Data Scientist / ML Engineer", match: 88, reason: "Numerical (90%), Logical (90%), Investigative (100%)- ideal analytical profile" },
    { career: "Business Analyst", match: 85, reason: "Aptitude (78%), Logical reasoning, Value-based decisions, Enterprising interest" },
    { career: "Research Analyst", match: 82, reason: "Investigative (100%), high memory and processing, solitary/auditory learning" },
    { career: "Product Manager", match: 79, reason: "Creativity (90%), flexible working, decision clarity, social interest (57%)" },
    { career: "Management Consultant", match: 76, reason: "Aptitude breadth, communication (68%), teamwork (70%), enterprising interest" },
    { career: "UX Researcher", match: 72, reason: "Social interest, conceptual thinking, investigative drive, empathy development needed" },
  ],

  industries: ["Technology & Software", "Financial Services", "Management Consulting", "Research & Academia", "Healthcare Analytics"],
  workEnvironments: ["Hybrid / Remote-first", "Data-driven teams", "Flat organizational structures", "Project-based engagements"],
  futureSkills: ["Python / Data Analysis", "Emotional Intelligence Coaching", "Strategic Communication", "Design Thinking", "AI/ML Literacy"],

  roadmap: [
    {
      phase: "Days 1-30",
      title: "Self-Awareness Foundation",
      priority: "HIGH PRIORITY",
      goal: "Establish clarity on your ISE career profile and close the emotional intelligence gap.",
      tasks: [
        "Complete a structured EQ coaching session with a certified practitioner.",
        "Research top 3 target careers in data science and business analytics.",
        "Build a skills inventory mapping current strengths to target role requirements.",
      ],
    },
    {
      phase: "Days 31-60",
      title: "Skill Activation",
      priority: "HIGH PRIORITY",
      goal: "Convert analytical strengths into demonstrable, portfolio-ready competencies.",
      tasks: [
        "Complete one data analysis project (Kaggle or real-world dataset).",
        "Enroll in a communication or public speaking workshop.",
        "Begin empathy-building practice: daily journaling, active listening exercises.",
      ],
    },
    {
      phase: "Days 61-90",
      title: "Career Launch Preparation",
      priority: "HIGH PRIORITY",
      goal: "Position yourself for target roles with a polished professional presence.",
      tasks: [
        "Revamp LinkedIn profile to reflect ISE strengths and analytical portfolio.",
        "Conduct 3 informational interviews with professionals in target roles.",
        "Apply to 5 aligned opportunities (internship, contract, or full-time).",
      ],
    },
  ],
};
