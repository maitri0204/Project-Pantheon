/** Career Intelligence Module - derived from Assessment.pdf (ISE profile) */

export type Rating = "High" | "Medium" | "Low";

export interface CareerFit {
  career: string;
  match: number;
  supportedBy: string[];
  whyItFits: string;
  interpretation: string;
  recommendedAction: string;
}

export interface JobRoles {
  careerPath: string;
  entryLevel: string[];
  midLevel: string[];
  seniorLevel: string[];
}

export interface CareerGrowth {
  careerPath: string;
  technicalSkills: string[];
  softSkills: string[];
  certifications: string[];
  courses: string[];
  projects: string[];
  networking: string[];
  communities: string[];
}

export interface MarketInsight {
  careerPath: string;
  topIndustries: string[];
  futureDemand: Rating;
  growthPotential: Rating;
  remoteWork: Rating;
  leadershipPotential: Rating;
  workLifeBalance: Rating;
  careerStability: Rating;
  industryTrends: string;
}

export interface RoadmapPhase {
  phase: string;
  title: string;
  priority: string;
  goal: string;
  goalDetail: string;
  tasks: string[];
  mentorType: string[];
  platforms: string[];
  resources: string[];
  expectedOutcome: string;
}

export const careerFitTop10: CareerFit[] = [
  {
    career: "Data Scientist / ML Engineer",
    match: 95,
    supportedBy: [
      "Numerical Reasoning (90%)",
      "Logical & Analytical Reasoning (90%)",
      "Investigative Interest (100%)",
      "Creativity & Innovation (90%)",
    ],
    whyItFits:
      "Your profile combines elite quantitative reasoning with investigative drive - the core DNA of data science roles.",
    interpretation:
      "You process complex datasets naturally and prefer evidence-based decisions. This alignment is rare and highly marketable.",
    recommendedAction:
      "Start a Python + SQL learning path and publish one Kaggle notebook within 30 days.",
  },
  {
    career: "Business Analyst",
    match: 88,
    supportedBy: [
      "Numerical Aptitude (90%)",
      "Value-Based Decision Style (94%)",
      "Enterprising Interest (43%)",
      "Communication Skills (68%)",
    ],
    whyItFits:
      "You translate data into business decisions with clarity - ideal for bridging technical and stakeholder teams.",
    interpretation:
      "Strong aptitude plus principled decision-making suits requirements gathering and process optimisation roles.",
    recommendedAction:
      "Complete a case-study portfolio mapping one business problem to a data-backed recommendation.",
  },
  {
    career: "Research Analyst",
    match: 85,
    supportedBy: [
      "Investigative Interest (100%)",
      "Memory & Processing Speed (90%)",
      "Solitary Learning (80%)",
      "Conceptual Thinking (84%)",
    ],
    whyItFits:
      "Deep research, synthesis, and independent analysis match your investigative and solitary learning strengths.",
    interpretation:
      "You thrive when given time to explore hypotheses and produce structured insights without constant interruption.",
    recommendedAction:
      "Write two industry briefs (500 words each) on sectors aligned with your Academics .",
  },
  {
    career: "Product Manager",
    match: 82,
    supportedBy: [
      "Creativity & Innovation (90%)",
      "Flexible Working Style (94%)",
      "Social Interest (57%)",
      "Teamwork (70%)",
    ],
    whyItFits:
      "Product leadership rewards conceptual thinking, adaptability, and cross-functional collaboration - all present in your profile.",
    interpretation:
      "EQ development will accelerate your influence with engineering and design partners.",
    recommendedAction:
      "Shadow a PM for one sprint or complete a product discovery exercise with user interviews.",
  },
  {
    career: "Management Consultant",
    match: 80,
    supportedBy: [
      "Logical Reasoning (90%)",
      "Communication Skills (68%)",
      "Stress Resilience (75%)",
      "Enterprising Interest (43%)",
    ],
    whyItFits:
      "Consulting demands structured problem-solving under pressure - supported by your resilience and analytical scores.",
    interpretation:
      "Verbal aptitude (60%) is the main gap; case interview practice will close it quickly.",
    recommendedAction:
      "Practice 10 case frameworks (profitability, market entry) with timed mock interviews.",
  },
  {
    career: "Financial Analyst",
    match: 78,
    supportedBy: [
      "Numerical Reasoning (90%)",
      "Conventional Interest (40%)",
      "Attention to Detail (Memory 90%)",
      "Value-Based Decisions (94%)",
    ],
    whyItFits:
      "Financial modelling and forecasting align with numerical strength and preference for structured, principled analysis.",
    interpretation:
      "Conventional interest is moderate - pair finance skills with tech or consulting for broader fit.",
    recommendedAction:
      "Build a three-statement model in Excel for a public company you follow.",
  },
  {
    career: "UX Researcher",
    match: 75,
    supportedBy: [
      "Social Interest (57%)",
      "Investigative Interest (100%)",
      "Conceptual Thinking (84%)",
      "Reflective Orientation (88%)",
    ],
    whyItFits:
      "UX research blends user empathy with systematic inquiry - investigative + social dimensions support this path.",
    interpretation:
      "Empathy (25%) is a development area; user interview practice will strengthen qualitative research credibility.",
    recommendedAction:
      "Conduct 5 user interviews and synthesise findings into one journey map.",
  },
  {
    career: "Operations Analyst",
    match: 72,
    supportedBy: [
      "Numerical Aptitude (90%)",
      "Adaptability (65%)",
      "Logical Reasoning (90%)",
      "Conventional Interest (40%)",
    ],
    whyItFits:
      "Operations roles need process optimisation and metrics - your numerical and logical scores are well suited.",
    interpretation:
      "Kinesthetic learning is lower; seek roles with digital dashboards rather than purely physical operations.",
    recommendedAction:
      "Map one workflow end-to-end and propose two efficiency metrics to track.",
  },
  {
    career: "Strategy Analyst",
    match: 70,
    supportedBy: [
      "Conceptual Thinking (84%)",
      "Decision Style (94%)",
      "Investigative Interest (100%)",
      "Creativity (90%)",
    ],
    whyItFits:
      "Corporate strategy requires big-picture framing and rigorous analysis - your thinking and decision styles excel here.",
    interpretation:
      "Strategy roles often need executive communication; invest in storytelling alongside analysis.",
    recommendedAction:
      "Draft a one-page strategy memo for a company you admire using Porter's Five Forces.",
  },
  {
    career: "Healthcare Data Analyst",
    match: 68,
    supportedBy: [
      "Numerical Reasoning (90%)",
      "Social Interest (57%)",
      "Investigative Interest (100%)",
      "Stress Awareness (80%)",
    ],
    whyItFits:
      "Healthcare analytics combines mission-driven work with data skills - social + investigative fit is strong.",
    interpretation:
      "Domain knowledge (HIPAA, clinical metrics) is learnable; your analytical base is the harder skill to acquire.",
    recommendedAction:
      "Explore one public health dataset and produce a visual dashboard on patient outcomes.",
  },
];

export const jobRoleExplorer: JobRoles[] = [
  {
    careerPath: "Data Science",
    entryLevel: ["Data Analyst", "BI Analyst", "Junior Data Scientist", "Analytics Associate"],
    midLevel: ["Data Scientist", "Analytics Consultant", "ML Engineer", "Applied Scientist"],
    seniorLevel: ["Lead Data Scientist", "Head of Analytics", "Director of Data", "Chief Data Officer"],
  },
  {
    careerPath: "Business Analysis",
    entryLevel: ["Junior Business Analyst", "Operations Coordinator", "Reporting Analyst"],
    midLevel: ["Business Analyst", "Senior BA", "Product Analyst", "Process Analyst"],
    seniorLevel: ["Lead Business Analyst", "BA Practice Lead", "Director of Business Analysis"],
  },
  {
    careerPath: "Management Consulting",
    entryLevel: ["Analyst", "Associate Consultant", "Research Associate"],
    midLevel: ["Consultant", "Senior Consultant", "Engagement Manager"],
    seniorLevel: ["Principal", "Partner", "Practice Director"],
  },
  {
    careerPath: "Product Management",
    entryLevel: ["Associate PM", "Product Analyst", "Junior Product Owner"],
    midLevel: ["Product Manager", "Senior PM", "Group PM"],
    seniorLevel: ["Director of Product", "VP Product", "Chief Product Officer"],
  },
  {
    careerPath: "Research & Insights",
    entryLevel: ["Research Assistant", "Market Research Analyst", "Insights Coordinator"],
    midLevel: ["Research Analyst", "Senior Researcher", "Insights Manager"],
    seniorLevel: ["Research Director", "Head of Insights", "Chief Research Officer"],
  },
  {
    careerPath: "Financial Analysis",
    entryLevel: ["Financial Analyst", "Junior Accountant", "FP&A Analyst"],
    midLevel: ["Senior Financial Analyst", "Finance Manager", "Corporate Finance Associate"],
    seniorLevel: ["Finance Director", "CFO Track", "Head of FP&A"],
  },
];

export const careerGrowthJourney: CareerGrowth[] = [
  {
    careerPath: "Data Science",
    technicalSkills: ["Python", "SQL", "Statistics", "Machine Learning", "Data Visualisation"],
    softSkills: ["Problem decomposition", "Stakeholder communication", "Curiosity", "Attention to detail"],
    certifications: ["Google Data Analytics", "IBM Data Science Professional", "Microsoft DP-100", "AWS ML Specialty"],
    courses: ["Coursera ML Specialisation", "fast.ai Practical Deep Learning", "Kaggle Learn micro-courses"],
    projects: ["Sales forecasting model", "Recommendation system", "Customer churn prediction", "NLP sentiment dashboard"],
    networking: ["LinkedIn Data Science groups", "Kaggle competitions", "Local meetups", "Mentorship on ADPList"],
    communities: ["Kaggle", "Data Science Stack Exchange", "r/datascience", "Women in ML (if applicable)"],
  },
  {
    careerPath: "Business Analysis",
    technicalSkills: ["Excel / Power BI", "SQL basics", "Process mapping", "Requirements documentation"],
    softSkills: ["Active listening", "Facilitation", "Negotiation", "Critical thinking"],
    certifications: ["IIBA ECBA", "CBAP (long-term)", "Agile BA certifications", "Six Sigma Yellow Belt"],
    courses: ["Business Analysis fundamentals (IIBA)", "Agile BA on Udemy", "SQL for BAs"],
    projects: ["As-is / to-be process map", "BRD for a sample product", "ROI analysis for a process change"],
    networking: ["IIBA chapter events", "LinkedIn BA communities", "Product/BA hybrid meetups"],
    communities: ["IIBA", "Modern Analyst", "BA Times forums"],
  },
  {
    careerPath: "Management Consulting",
    technicalSkills: ["Financial modelling", "Market sizing", "Excel advanced", "Slide storytelling"],
    softSkills: ["Executive presence", "Structured communication", "Resilience", "Team leadership"],
    certifications: ["Case interview prep programmes", "CFA Level I (optional)", "PMP (for implementation)"],
    courses: ["Victor Cheng case prep", "MBB case libraries", "Strategy frameworks masterclass"],
    projects: ["Written case studies (3)", "Pro-bono consulting for NGO", "Industry landscape deck"],
    networking: ["Consulting club alumni", "Case prep partners", "LinkedIn ex-consultants"],
    communities: ["Management Consulted", "PrepLounge", "Consulting Reddit"],
  },
  {
    careerPath: "Product Management",
    technicalSkills: ["Roadmapping tools", "Analytics (Mixpanel/Amplitude)", "Wireframing basics", "SQL for PMs"],
    softSkills: ["Empathy", "Prioritisation", "Influence without authority", "User advocacy"],
    certifications: ["Product School certifications", "Pragmatic Institute", "Google UX Design (foundations)"],
    courses: ["Reforge Product Strategy", "Lenny's Newsletter resources", "One Product Management bootcamp"],
    projects: ["PRD for a feature", "User research synthesis", "Metrics dashboard for a fake product"],
    networking: ["Product Tank meetups", "Mind the Product", "PM Slack communities"],
    communities: ["Product Coalition", "Lenny's Slack", "r/ProductManagement"],
  },
  {
    careerPath: "Research & Insights",
    technicalSkills: ["Survey design", "SPSS / R basics", "Qualitative coding", "Report writing"],
    softSkills: ["Synthesis", "Objectivity", "Presentation", "Intellectual rigour"],
    certifications: ["MRS / ESOMAR certificates", "Google Analytics", "Qualitative research workshops"],
    courses: ["Market research methods", "Statistics for social sciences", "Data storytelling"],
    projects: ["Industry landscape report", "Competitive analysis deck", "User persona research pack"],
    networking: ["Research association events", "Academic-industry bridges", "Insights LinkedIn groups"],
    communities: ["GreenBook", "Quirks", "Insights Association"],
  },
  {
    careerPath: "Financial Analysis",
    technicalSkills: ["Excel modelling", "Accounting fundamentals", "Valuation basics", "ERP familiarity"],
    softSkills: ["Accuracy", "Business acumen", "Ethics", "Time management"],
    certifications: ["CFA Program", "FMVA (CFI)", "CPA foundations (region-specific)"],
    courses: ["Corporate finance on Coursera", "Financial modelling Wall Street Prep", "Accounting basics"],
    projects: ["DCF model for a listed company", "Budget variance analysis", "Investment memo"],
    networking: ["CFA society events", "Finance LinkedIn groups", "Alumni finance networks"],
    communities: ["CFA Institute", "Wall Street Oasis", "r/financialcareers"],
  },
];

export const careerMarketInsights: MarketInsight[] = [
  {
    careerPath: "Data Scientist / ML Engineer",
    topIndustries: ["Technology", "Finance", "Healthcare", "E-commerce", "Consulting"],
    futureDemand: "High",
    growthPotential: "High",
    remoteWork: "High",
    leadershipPotential: "High",
    workLifeBalance: "Medium",
    careerStability: "High",
    industryTrends: "AI adoption and generative AI roles expanding rapidly through 2030.",
  },
  {
    careerPath: "Business Analyst",
    topIndustries: ["Banking", "Insurance", "Retail", "Government", "SaaS"],
    futureDemand: "High",
    growthPotential: "Medium",
    remoteWork: "High",
    leadershipPotential: "Medium",
    workLifeBalance: "High",
    careerStability: "High",
    industryTrends: "Agile BA and product-analyst hybrid roles growing in digital transformation programmes.",
  },
  {
    careerPath: "Management Consultant",
    topIndustries: ["Professional services", "Corporate strategy", "Private equity", "Public sector"],
    futureDemand: "Medium",
    growthPotential: "High",
    remoteWork: "Medium",
    leadershipPotential: "High",
    workLifeBalance: "Low",
    careerStability: "High",
    industryTrends: "Specialist boutiques and digital transformation practices outpacing generalist growth.",
  },
  {
    careerPath: "Product Manager",
    topIndustries: ["SaaS", "Fintech", "Healthtech", "Consumer apps", "B2B platforms"],
    futureDemand: "High",
    growthPotential: "High",
    remoteWork: "High",
    leadershipPotential: "High",
    workLifeBalance: "Medium",
    careerStability: "Medium",
    industryTrends: "AI-native product roles and platform PM specialisations in high demand.",
  },
  {
    careerPath: "Research Analyst",
    topIndustries: ["Market research", "Think tanks", "Academia", "Corporate strategy", "Media"],
    futureDemand: "Medium",
    growthPotential: "Medium",
    remoteWork: "High",
    leadershipPotential: "Medium",
    workLifeBalance: "High",
    careerStability: "Medium",
    industryTrends: "Insights automation tools changing junior roles; synthesis skills remain premium.",
  },
  {
    careerPath: "Financial Analyst",
    topIndustries: ["Banking", "Asset management", "Corporate finance", "Real estate", "Insurance"],
    futureDemand: "Medium",
    growthPotential: "Medium",
    remoteWork: "Medium",
    leadershipPotential: "High",
    workLifeBalance: "Low",
    careerStability: "High",
    industryTrends: "FP&A and strategic finance roles growing; routine reporting increasingly automated.",
  },
];

export const roadmapPhases: RoadmapPhase[] = [
  {
    phase: "Week 1 - 4",
    title: "Foundation Building",
    priority: "HIGH PRIORITY",
    goal: "Establish career clarity and close your highest-impact development gap (Emotional Intelligence).",
    goalDetail:
      "Your ISE profile and 95% Data Science match define a clear north star. This phase builds self-awareness, target role clarity, and EQ foundations so later skill work is purposeful - not random.",
    tasks: [
      "Complete a certified EQ assessment and one coaching session.",
      "Document your top 3 target careers with match rationale from this report.",
      "Build a skills gap matrix: current scores vs. role requirements.",
      "Set up a learning workspace (Python, SQL, notebooks).",
      "Schedule weekly 30-minute career review blocks in your calendar.",
    ],
    mentorType: ["Career counsellor", "EQ coach", "Data professional (informational)"],
    platforms: ["ADPList", "LinkedIn Learning"],
    resources: [
      "This Career DNA report (sections 07-09)",
      "Coursera: Learning How to Learn",
      "Book: Emotional Intelligence 2.0",
    ],
    expectedOutcome:
      "Written 90-day career plan with EQ baseline score and confirmed primary target role (Data Science or BA).",
  },
  {
    phase: "Week 5 - 8",
    title: "Skill Development",
    priority: "HIGH PRIORITY",
    goal: "Convert analytical strengths into portfolio-ready technical and communication competencies.",
    goalDetail:
      "Numerical and logical scores (90%) are your unfair advantage. This phase turns them into demonstrable projects while strengthening verbal and empathy skills for interviews and teamwork.",
    tasks: [
      "Complete Python + SQL fundamentals (40+ hours).",
      "Ship one end-to-end data project on GitHub with README.",
      "Join one public speaking or communication workshop.",
      "Practice active listening: 3 structured conversations per week.",
      "Contribute to one online community (Kaggle, IIBA, or PM Slack).",
    ],
    mentorType: ["Technical mentor", "Portfolio reviewer", "Communication coach"],
    platforms: ["Kaggle", "Coursera / fast.ai", "Toastmasters or similar"],
    resources: [
      "Google Data Analytics Certificate (modules 1-4)",
      "Kaggle Titanic + one custom dataset project",
      "Case interview or BA case library (if consulting track)",
    ],
    expectedOutcome:
      "Live GitHub portfolio link + completed project demo ready for LinkedIn and applications.",
  },
  {
    phase: "Week 9 - 12",
    title: "Career Alignment & Launch",
    priority: "HIGH PRIORITY",
    goal: "Position yourself for target roles with optimised materials, network, and interview readiness.",
    goalDetail:
      "Execution separates planners from hires. This phase focuses on outward-facing career assets: resume, LinkedIn, networking, and structured interview practice aligned to your top match careers.",
    tasks: [
      "Revamp LinkedIn: headline, about, and featured project.",
      "Tailor resume to primary role (data or BA) with quantified bullets.",
      "Conduct 5 informational interviews with professionals in target roles.",
      "Complete 10 mock interviews (technical + behavioural).",
      "Apply to 8-12 aligned roles (internship, graduate, or entry-level).",
    ],
    mentorType: ["Recruiter advisor", "Hiring manager (informational)", "Interview coach"],
    platforms: ["LinkedIn", "Indeed / company portals"],
    resources: [
      "STAR method behavioural prep sheet",
      "Role-specific interview question banks",
      "Salary research: Glassdoor / Levels.fyi",
    ],
    expectedOutcome:
      "Minimum 3 application acknowledgements and 1 live interview pipeline within 90 days.",
  },
];
