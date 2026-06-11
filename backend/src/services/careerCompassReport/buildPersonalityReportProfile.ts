import { getCareerDescription } from "./careerDescriptions";
import { PERSONALITY_CONTENT, type PersonalityProfile } from "./personalityContent";
import {
  PERSONALITY_CAREERS,
  PERSONALITY_DISPLAY_NAMES,
  PERSONALITY_STREAMS,
  PERSONALITY_SUBJECTS,
} from "./personalityMappings";
import type { CareerCompassAssessmentData } from "./types";

const CAREER_MATCH_PCTS = [96, 93, 91, 88, 87, 86, 84, 81, 80, 78];

const PERSONALITY_CLUSTERS: Record<string, string> = {
  ISTJ: "Operations & Systems",
  ISFJ: "Healthcare & Education",
  INFJ: "Counseling & Social Impact",
  INTJ: "Strategy & Technology",
  ISTP: "Engineering & Technical Trades",
  ISFP: "Creative Arts & Design",
  INFP: "Writing & Social Impact",
  INTP: "Research & Technology",
  ESTP: "Business & Sales",
  ESFP: "Media & Hospitality",
  ENFP: "Marketing & Creative Business",
  ENTP: "Business & Entrepreneurship",
  ESTJ: "Management & Corporate Leadership",
  ESFJ: "People Management & Community",
  ENFJ: "Education & Leadership",
  ENTJ: "Executive Leadership & Strategy",
};

const INDUSTRY_BY_CLUSTER: Record<string, { name: string; desc: string; action: string }[]> = {
  "Management & Corporate Leadership": [
    { name: "Corporate Management", desc: "Large organizations where structure, accountability, and results drive success - a natural fit for decisive leaders.", action: "Shadow a manager for a week" },
    { name: "Finance & Banking", desc: "Banks and financial firms that reward discipline, analysis, and clear decision-making.", action: "Join a finance or investment club" },
    { name: "Government & Public Service", desc: "Institutions that need organized leaders to implement policy and manage operations.", action: "Volunteer for a community governance project" },
    { name: "Operations & Logistics", desc: "Teams that optimize systems, supply chains, and processes for efficiency.", action: "Map a process improvement for a school event" },
    { name: "Consulting", desc: "Firms that solve business problems with structured analysis and recommendations.", action: "Enter a business case competition" },
    { name: "Education Administration", desc: "Schools and institutions needing strong planners and administrators.", action: "Lead a student council initiative" },
    { name: "Healthcare Administration", desc: "Hospitals and clinics that require organized leadership and compliance.", action: "Research healthcare management careers" },
    { name: "Manufacturing & Industry", desc: "Production environments where planning, quality, and execution matter.", action: "Visit an industrial facility" },
    { name: "Real Estate & Property", desc: "Markets combining sales discipline with operational management.", action: "Study a local property market report" },
    { name: "Legal & Compliance", desc: "Fields requiring rules, structure, and authoritative decision-making.", action: "Attend a mock trial or legal awareness session" },
  ],
  "Business & Entrepreneurship": [
    { name: "Technology", desc: "Software, apps, and digital platforms where ideas become products quickly.", action: "Build a small coding side project" },
    { name: "Finance", desc: "Banks, venture capital, and fintech - analytical and relationship-driven.", action: "Join an investment club" },
    { name: "Consulting", desc: "Fresh challenges every few weeks for quick-thinking problem-solvers.", action: "Enter a business case competition" },
    { name: "Startups", desc: "Fast-growing companies with high freedom and ownership.", action: "Apply for a startup internship" },
    { name: "Product", desc: "Teams connecting users, designers, and engineers.", action: "Learn a product-management framework" },
    { name: "Innovation", desc: "Labs inventing new products and rethinking how things are done.", action: "Join an innovation challenge" },
    { name: "Marketing & Advertising", desc: "Brands telling stories and winning customers.", action: "Run a small social-media campaign" },
    { name: "Media & Content", desc: "Videos, podcasts, and content for real audiences.", action: "Start a blog or channel" },
    { name: "Design & UX", desc: "Shaping how products look and feel.", action: "Redesign an app you use daily" },
    { name: "EdTech & Future Tech", desc: "Education technology and emerging fields with growth potential.", action: "Explore a future-tech course" },
  ],
};

const DEFAULT_INDUSTRIES = INDUSTRY_BY_CLUSTER["Business & Entrepreneurship"];

function sectionBullets(profile: PersonalityProfile | undefined, titlePart: string, fallback: string[]): string[] {
  const section = profile?.sections.find((item) => item.title.includes(titlePart));
  return section?.bullets.slice(0, 10) ?? fallback;
}

function shortName(displayName: string): string {
  return displayName.replace(/^The\s+/i, "").trim();
}

function dominantTraitLine(slice: CareerCompassAssessmentData["dimensions"]["energy"]): string {
  const dominant = slice.percentA >= slice.percentB ? slice.traitA : slice.traitB;
  const pct = Math.max(slice.percentA, slice.percentB);
  return `${dominant} (${pct}%)`;
}

function buildCareerMatches(careers: string[]) {
  return careers.slice(0, 10).map((name, index) => ({
    name,
    pct: CAREER_MATCH_PCTS[index] ?? 75,
    desc: getCareerDescription(name),
  }));
}

function buildRoleCards(careers: string[]) {
  const summaries: Record<string, string> = {
    "Business Manager": "Lead teams and operations to achieve organizational goals.",
    "Corporate Executive": "Drive strategy and performance at senior leadership levels.",
    "Chartered Accountant": "Manage financial records, audits, and compliance.",
    "Project Manager": "Plan, execute, and deliver projects on time and budget.",
    "Startup Founder": "Build and scale ventures from idea to impact.",
    "Product Manager": "Connect user needs, business goals, and technology.",
  };

  return careers.slice(0, 10).map((title) => ({
    title,
    summary: summaries[title] || `Grow into roles that fit your strengths as a ${title}.`,
    pathway: [
      "Entry: Internships, assistant roles, and school leadership projects",
      "Mid: Specialist or team-lead responsibilities",
      "Leadership: Manager, director, or functional head",
      "Future: Senior executive, advisor, or independent expert",
    ],
  }));
}

function buildStreamCards(suggestedStream: string, subjects: string[], careers: string[]) {
  const recommendedNames = suggestedStream.split("/").map((part) => part.trim()).filter(Boolean);
  const templates = [
    {
      name: "Commerce",
      why: `Subjects like ${subjects.slice(0, 2).join(", ")} align with your analytical and leadership strengths`,
      advantages: `Direct pathway to ${careers.slice(0, 2).join(", ")} and related careers`,
      risks: "Requires consistent practice in quantitative subjects",
      outcomes: careers.slice(0, 3).join(", "),
    },
    {
      name: "Science",
      why: "Builds analytical depth and opens technology and research pathways",
      advantages: "Strong foundation for STEM and applied science careers",
      risks: "Demanding curriculum - balance with your strongest interests",
      outcomes: "Engineering, research, healthcare, data science",
    },
    {
      name: "Arts",
      why: "Supports communication, humanities, and creative career paths",
      advantages: "Develops expression, critical thinking, and social awareness",
      risks: "May need supplementary quantitative skills for some career goals",
      outcomes: "Media, design, psychology, public policy",
    },
    {
      name: "Interdisciplinary",
      why: `Combines your recommended focus (${suggestedStream}) with complementary skills`,
      advantages: "Broader options across business, technology, and leadership",
      risks: "Requires balancing multiple demanding subject areas",
      outcomes: "Integrated programs matching your career cluster",
    },
  ];

  return templates.map((stream) => {
    const isRecommended = recommendedNames.some(
      (part) => stream.name.toLowerCase().includes(part.toLowerCase())
        || part.toLowerCase().includes(stream.name.toLowerCase()),
    );
    return { ...stream, recommended: isRecommended };
  });
}

export interface ActionPlanWeek {
  marker: string;
  title: string;
  items: string[];
}

export interface ActionPlanSection {
  title: string;
  items: string[];
}

export interface PersonalityActionPlans {
  plan30: {
    weeks: ActionPlanWeek[];
    clearGoals: string[];
    mentorship: string[];
    outcomes: string[];
  };
  plan60: {
    phaseLabel: string;
    sections: ActionPlanSection[];
    outcomes: string[];
  };
  plan90: {
    phaseLabel: string;
    sections: ActionPlanSection[];
    outcomes: string[];
  };
}

function clubSuggestion(cluster: string, stream: string): string {
  const suggestions: Record<string, string> = {
    "Operations & Systems": "accountancy, economics, or operations club",
    "Healthcare & Education": "health sciences, biology, or community service club",
    "Counseling & Social Impact": "psychology, debate, or social impact club",
    "Strategy & Technology": "coding, mathematics, or strategy club",
    "Engineering & Technical Trades": "robotics, science, or engineering club",
    "Creative Arts & Design": "art, design, or media club",
    "Writing & Social Impact": "literature, journalism, or creative writing club",
    "Research & Technology": "science, research, or computer science club",
    "Business & Sales": "business development or marketing club",
    "Media & Hospitality": "media, drama, or events club",
    "Marketing & Creative Business": "marketing, branding, or communication club",
    "Business & Entrepreneurship": "entrepreneurship or innovation club",
    "Management & Corporate Leadership": "commerce, leadership, or student council club",
    "People Management & Community": "HR, community service, or peer mentoring club",
    "Education & Leadership": "teaching, MUN, or leadership club",
    "Executive Leadership & Strategy": "business strategy or economics club",
  };
  return suggestions[cluster] || `${stream.toLowerCase()} or career exploration club`;
}

function projectSuggestion(cluster: string, careers: string[], subjects: string[]): string {
  const primaryCareer = careers[0] || "your top career match";
  const primarySubject = subjects[0] || "your recommended subject";

  if (cluster.includes("Entrepreneurship")) {
    return "Launch a small venture idea, business plan, or product prototype";
  }
  if (cluster.includes("Creative") || cluster.includes("Media") || cluster.includes("Arts")) {
    return `Create a creative portfolio piece in ${primarySubject}`;
  }
  if (cluster.includes("Engineering") || cluster.includes("Technology") || cluster.includes("Research")) {
    return `Build a hands-on STEM project in ${primarySubject}`;
  }
  if (cluster.includes("Healthcare") || cluster.includes("Education") || cluster.includes("Counseling")) {
    return `Complete a community or service project related to ${primaryCareer}`;
  }
  if (cluster.includes("Management") || cluster.includes("Executive") || cluster.includes("Corporate")) {
    return `Complete a management case study or ${primarySubject} analysis project`;
  }
  return `Complete a project aligned with ${primaryCareer}`;
}

function competitionSuggestion(cluster: string, subjects: string[]): string {
  const suggestions: Record<string, string> = {
    "Business & Entrepreneurship": "startup pitch or innovation fair",
    "Management & Corporate Leadership": "business quiz or case competition",
    "Executive Leadership & Strategy": "economics olympiad or strategy case comp",
    "Engineering & Technical Trades": "science fair or robotics competition",
    "Research & Technology": "hackathon or science olympiad",
    "Creative Arts & Design": "art, design, or media competition",
    "Media & Hospitality": "debate, MUN, or presentation contest",
    "Healthcare & Education": "health awareness or science quiz",
    "Education & Leadership": "MUN, debate, or teaching demonstration",
  };
  return suggestions[cluster] || `school-level ${subjects[0] || "subject"} competition`;
}

function workplaceVisit(cluster: string, industries: { name: string }[]): string {
  const industry = industries[0]?.name || "your target industry";
  if (cluster.includes("Entrepreneurship") || cluster === "Business & Sales") {
    return "Visit a startup, sales floor, or business office";
  }
  if (cluster.includes("Healthcare")) {
    return "Visit a hospital, clinic, or healthcare facility (with permission)";
  }
  if (cluster.includes("Education")) {
    return "Visit a school, training centre, or education institution";
  }
  if (cluster.includes("Engineering") || cluster.includes("Technology")) {
    return "Visit an engineering lab, tech company, or industrial site";
  }
  if (cluster.includes("Creative") || cluster.includes("Media")) {
    return "Visit a studio, agency, or creative workspace";
  }
  return `Visit a ${industry.toLowerCase()} workplace or corporate office`;
}

function onlineCommunity(cluster: string): string {
  const suggestions: Record<string, string> = {
    "Business & Entrepreneurship": "IndieHackers, startup, or product communities",
    "Management & Corporate Leadership": "finance, management, or commerce student forums",
    "Research & Technology": "GitHub, Kaggle, or STEM learning communities",
    "Creative Arts & Design": "Behance, Dribbble, or creative portfolio groups",
    "Healthcare & Education": "healthcare or education volunteer networks",
    "Education & Leadership": "teaching, counseling, or youth leadership groups",
  };
  return suggestions[cluster] || "career exploration and alumni groups";
}

function skillFocus(subjects: string[], cluster: string): string {
  if (subjects.length >= 2) {
    return `Develop skills in ${subjects.slice(0, 2).join(" and ")}`;
  }
  if (cluster.includes("Technology") || cluster.includes("Research")) {
    return "Develop one technical or analytical skill";
  }
  if (cluster.includes("Creative") || cluster.includes("Media")) {
    return "Develop one creative or communication skill";
  }
  return "Develop one skill aligned with your recommended stream";
}

function buildActionPlans(
  short: string,
  cluster: string,
  stream: string,
  subjects: string[],
  careers: string[],
  industries: { name: string }[],
): PersonalityActionPlans {
  const topCareers = careers.slice(0, 3);
  const topIndustries = industries.slice(0, 3).map((item) => item.name);
  const subjectList = subjects.slice(0, 3).join(", ");
  const careerFocus = topCareers.join(", ");

  return {
    plan30: {
      weeks: [
        {
          marker: "Week<br>1",
          title: "Discover & Research",
          items: [
            `Research ${careerFocus} as careers for a ${short}`,
            `Watch 5 career journey videos in ${topIndustries[0] || cluster}`,
            `Take a free online course in ${subjects[0] || stream}`,
            `Write a 1-page career interest statement for your ${short} profile`,
          ],
        },
        {
          marker: "Week<br>2",
          title: "Connect & Learn",
          items: [
            `Interview 2 professionals in ${topCareers[0]} or ${topCareers[1]} roles`,
            `Join a ${clubSuggestion(cluster, stream)}`,
            `Follow 10 leaders in ${topIndustries.join(", ") || cluster} on LinkedIn`,
            `Attend a webinar on ${topCareers[0]} career pathways`,
          ],
        },
        {
          marker: "Week<br>3",
          title: "Build & Experiment",
          items: [
            projectSuggestion(cluster, careers, subjects),
            `Enter a ${competitionSuggestion(cluster, subjects)}`,
            `Practice a 3-minute pitch for ${topCareers[0]}`,
            `Map ${subjectList} subjects to your career goals`,
          ],
        },
        {
          marker: "Week<br>4",
          title: "Reflect & Plan",
          items: [
            `Review which ${short} strengths showed up most this month`,
            `Shortlist top 3 careers: ${careerFocus}`,
            "Create a 60-day plan with specific goals",
            "Share findings with counselor and parents",
          ],
        },
      ],
      clearGoals: [
        `Define one career question for your ${short} profile`,
        `Complete 3 research tasks on ${topCareers[0]} each week`,
        "Track daily progress in a simple journal",
        `Target: explore ${careerFocus} in depth`,
      ],
      mentorship: [
        `Find a mentor in ${topCareers[0]} or ${topIndustries[0] || cluster}`,
        "Schedule a weekly 15-minute counselor check-in",
        "Ask each mentor one focused question per meeting",
        `Join a peer group interested in ${stream}`,
      ],
      outcomes: [
        `Clear shortlist aligned with ${short}: ${careerFocus}`,
        `One completed mini-project in ${subjects[0] || stream}`,
        "Professional network of 2+ mentors",
      ],
    },
    plan60: {
      phaseLabel: `Days 31 – 60 | Discovery Phase for ${short}`,
      sections: [
        {
          title: "Clear Goals & Tasks",
          items: [
            `Convert ${topCareers[0]} research into one concrete project plan`,
            "Break the project into weekly milestones",
            `Allocate 5 focused hours per week to ${subjects[0] || "skill building"}`,
            "Review and adjust goals every two weeks",
          ],
        },
        {
          title: "Goals (Days 31–60)",
          items: [
            `Deep-dive into ${careerFocus}`,
            `Build first portfolio piece for ${topCareers[0]}`,
            skillFocus(subjects, cluster),
            `Establish mentor relationship in ${topIndustries[0] || cluster}`,
          ],
        },
        {
          title: "Projects",
          items: [
            projectSuggestion(cluster, careers, subjects),
            `Create a subject project in ${subjectList}`,
            `Write 3 summaries on ${topIndustries[0] || cluster} trends`,
            `Build a portfolio page highlighting ${short} strengths`,
          ],
        },
        {
          title: "Skill Building",
          items: [
            `Complete an online course in ${subjects[0] || stream}`,
            "Practice communication and presentation weekly",
            `Strengthen ${subjects[1] || subjects[0] || "analytical"} skills with practice sets`,
            `Study one ${cluster.toLowerCase()} case or example per week`,
          ],
        },
        {
          title: "Networking",
          items: [
            `Attend 2 events related to ${topIndustries[0] || cluster}`,
            `Connect with 5 alumni pursuing ${topCareers[0]} paths`,
            `Join ${onlineCommunity(cluster)}`,
            "Schedule monthly counselor check-ins",
          ],
        },
        {
          title: "Guidance & Mentorship",
          items: [
            `Request feedback on your ${topCareers[0]} project from a mentor`,
            `Shadow or interview a ${topCareers[0]} professional`,
            `Connect with alumni in ${careerFocus}`,
            "Document mentor advice in your career journal",
          ],
        },
      ],
      outcomes: [
        `Portfolio with 2+ projects in ${subjects[0] || stream}`,
        `Confirmed ${stream} stream and ${subjectList} subjects`,
        `Skill progress in ${subjects[0] || "your focus area"}`,
        `5+ connections in ${cluster.toLowerCase()}`,
      ],
    },
    plan90: {
      phaseLabel: `Days 61 – 90 | Acceleration Phase for ${short}`,
      sections: [
        {
          title: "Clear Goals & Tasks",
          items: [
            `Set a flagship ${topCareers[0]} outcome to complete by Day 90`,
            "Define success metrics for your portfolio piece",
            "Schedule weekly build-and-review sprints",
            `Prepare a presentation on your ${short} career direction`,
          ],
        },
        {
          title: "Goals (Days 61–90)",
          items: [
            `Finalize ${stream} stream and ${subjectList} subjects`,
            `Complete a flagship project for ${topCareers[0]}`,
            `Apply to 2 ${competitionSuggestion(cluster, subjects)} opportunities`,
            "Create a 1-year academic roadmap",
          ],
        },
        {
          title: "Portfolio",
          items: [
            `Publish your best ${topCareers[0]} project publicly`,
            "Document learnings in a career journal",
            `Get feedback from 3 ${topIndustries[0] || cluster} professionals`,
            "Update your profile with achievements",
          ],
        },
        {
          title: "Career Exploration",
          items: [
            `Shadow a ${topCareers[0]} professional for a day`,
            workplaceVisit(cluster, industries),
            `Attend a career fair focused on ${cluster.toLowerCase()}`,
            `Complete a virtual module in ${subjects[0] || stream}`,
          ],
        },
        {
          title: "Industry Exposure",
          items: [
            `Subscribe to 3 newsletters on ${topIndustries.join(", ") || cluster}`,
            `Analyze 5 organizations hiring ${topCareers[0]} roles`,
            "Present findings to class or club",
            `Identify summer programs for ${careerFocus}`,
          ],
        },
        {
          title: "Guidance & Mentorship",
          items: [
            `Get your ${topCareers[0]} portfolio reviewed by 3 professionals`,
            `Find a long-term mentor in ${topCareers[0]}`,
            "Build a personal advisory circle of 3-4 people",
            `Plan next year's goals for ${stream} with your counselor`,
          ],
        },
      ],
      outcomes: [
        `Definitive direction as a ${short} with evidence`,
        `Published portfolio for ${topCareers[0]}`,
        `Competition entry or program in ${cluster.toLowerCase()}`,
        `Ready for ${stream} with a clear 1-year plan`,
      ],
    },
  };
}

function buildSubjectCards(subjects: string[], careers: string[]) {
  const difficulties = ["Moderate", "Moderate-High", "High"];
  return subjects.slice(0, 4).map((name, index) => ({
    name,
    why: `Supports your career direction toward ${careers[index] || careers[0] || "your top matches"}`,
    difficulty: difficulties[index] ?? "Moderate",
    relevance: `Core subject for your recommended stream and personality fit`,
    careers: careers.slice(index, index + 2).join(", ") || careers.slice(0, 2).join(", "),
  }));
}

export interface PersonalityReportProfile {
  personalityCode: string;
  personalityName: string;
  shortName: string;
  description: string;
  overview: string;
  coverStatement: string;
  executiveIntro: string;
  topStrengths: string[];
  keyInsights: string[];
  growthAreas: string[];
  careerSnapshot: string[];
  dnaCards: string[][];
  deepDive: {
    strengths: string[];
    motivators: string[];
    challenges: string[];
    learningStyle: string[];
    communicationStyle: string[];
    leadershipStyle: string[];
  };
  careerMatches: { name: string; pct: number; desc: string }[];
  roleCards: { title: string; summary: string; pathway: string[] }[];
  streams: ReturnType<typeof buildStreamCards>;
  subjects: ReturnType<typeof buildSubjectCards>;
  industries: { name: string; desc: string; action: string }[];
  careerIdentity: string;
  primaryCluster: string;
  industryIntro: string;
  conclusionParagraph: (studentName: string, counselor: string, institute: string) => string;
  blueprintSkills: string;
  actionPlans: PersonalityActionPlans;
  blueprint90DayGoal: string;
}

export function buildPersonalityReportProfile(data: CareerCompassAssessmentData): PersonalityReportProfile {
  const personalityCode = (data.personalityCode || "ENTP").toUpperCase();
  const personalityName = data.personalityType || PERSONALITY_DISPLAY_NAMES[personalityCode] || personalityCode;
  const short = shortName(personalityName);
  const content = PERSONALITY_CONTENT[personalityCode];
  const careers = data.recommendedCareers.length
    ? data.recommendedCareers
    : (PERSONALITY_CAREERS[personalityCode] ?? PERSONALITY_CAREERS.ENTP);
  const subjects = data.suggestedSubjects.length
    ? data.suggestedSubjects
    : (PERSONALITY_SUBJECTS[personalityCode] ?? PERSONALITY_SUBJECTS.ENTP);
  const stream = data.suggestedStream || PERSONALITY_STREAMS[personalityCode] || "Commerce / Science";
  const cluster = PERSONALITY_CLUSTERS[personalityCode] ?? "Career Exploration";
  const industries = INDUSTRY_BY_CLUSTER[cluster] ?? DEFAULT_INDUSTRIES;

  const energy = dominantTraitLine(data.dimensions.energy);
  const cognitive = dominantTraitLine(data.dimensions.cognitive);
  const decision = dominantTraitLine(data.dimensions.decision);
  const working = dominantTraitLine(data.dimensions.working);

  const overview = content?.overview
    ?? `You are a ${short.toLowerCase()} with distinct strengths that shape your academic and career direction.`;

  return {
    personalityCode,
    personalityName,
    shortName: short,
    description: data.description || overview,
    overview,
    coverStatement: `${overview} This report translates your ${short} profile into clear academic choices, career paths, skill priorities, and a 90-day action plan.`,
    executiveIntro: `This executive summary distills your Career Compass assessment into clear priorities: who you are, how you work best, which academic path fits you, and which careers align with your ${short} profile.`,
    topStrengths: sectionBullets(content, "Key Characteristics", [
      `Strong alignment with ${short} strengths`,
      `Clear ${energy} preference`,
      `${cognitive} in how you process information`,
      `${decision} in choices`,
      `${working} in daily habits`,
    ]).slice(0, 7),
    keyInsights: [
      `Best suited for ${stream}`,
      `Top career matches include ${careers.slice(0, 3).join(", ")}`,
      `Ideal subjects: ${subjects.slice(0, 3).join(", ")}`,
      `Primary career cluster: ${cluster}`,
      `Strongest dimension: ${data.strongestTrait}`,
      `Career readiness score: ${data.careerReadinessScore}%`,
      `Recommended path: ${stream} with focused skill building`,
    ],
    growthAreas: sectionBullets(content, "Potential Blind Spots", [
      "Build habits that turn goals into finished outcomes",
      "Balance strengths with complementary skills",
      "Seek feedback from mentors and counselors",
      "Develop patience for long-term results",
      "Practice active listening in team settings",
    ]).slice(0, 7),
    careerSnapshot: [
      `Primary cluster: ${cluster}`,
      `Top match: ${careers[0]} (${CAREER_MATCH_PCTS[0]}%)`,
      `Ideal subjects: ${subjects.slice(0, 3).join(", ")}`,
      `Target industries: ${industries.slice(0, 3).map((item) => item.name).join(", ")}`,
      "Next step: Begin 30-day exploration plan (Page 15)",
      `Secondary fits: ${careers.slice(1, 3).join(", ")}`,
      `Recommended path: ${stream}`,
    ],
    dnaCards: [
      sectionBullets(content, "Type Description", [`You lead and organize as a ${short}`, "Practical and goal-oriented", "Focused on results and structure"]).slice(0, 5),
      sectionBullets(content, "Take in Information", [`Dominant style: ${cognitive}`, "Uses real assessment dimension scores", "Balances facts with your natural preference"]).slice(0, 5),
      sectionBullets(content, "Direct and Receive Energy", [`Dominant style: ${energy}`, "Learn through your preferred interaction style", "Use environments that match your energy pattern"]).slice(0, 5),
      sectionBullets(content, "Decide and Come to Conclusions", [`Dominant style: ${decision}`, "Structured approach to choices", "Values clarity when making decisions"]).slice(0, 5),
      sectionBullets(content, "Approach the Outside World", [`Dominant style: ${working}`, "Plans and executes with discipline", "Works best with clear expectations"]).slice(0, 5),
      [
        `Choose careers aligned with ${cluster}`,
        `Build skills for ${careers.slice(0, 2).join(" and ")}`,
        `Master subjects: ${subjects.slice(0, 3).join(", ")}`,
        "Seek mentors in your target field",
        "Start building portfolio evidence now",
      ],
    ],
    deepDive: {
      strengths: sectionBullets(content, "Key Characteristics", []).slice(0, 5),
      motivators: sectionBullets(content, "Behave at Work", []).slice(0, 5),
      challenges: sectionBullets(content, "Potential Blind Spots", []).slice(0, 5),
      learningStyle: sectionBullets(content, "Take in Information", []).concat(
        sectionBullets(content, "Direct and Receive Energy", []).slice(0, 3),
      ).slice(0, 10),
      communicationStyle: sectionBullets(content, "Behave with Others", []).slice(0, 10),
      leadershipStyle: sectionBullets(content, "Behave at Work", []).concat([
        "Takes ownership in group settings",
        "Sets direction and expects follow-through",
      ]).slice(0, 10),
    },
    careerMatches: buildCareerMatches(careers),
    roleCards: buildRoleCards(careers),
    streams: buildStreamCards(stream, subjects, careers),
    subjects: buildSubjectCards(subjects, careers),
    industries,
    careerIdentity: `${short} & ${cluster.split(" & ")[0]}`,
    primaryCluster: cluster,
    industryIntro: `A quick guide to the industries that best match your ${short} profile - what each one is, why it could fit you, and one simple way to start exploring it.`,
    blueprintSkills: subjects.slice(0, 2).join(", ") + ", Leadership, Communication",
    actionPlans: buildActionPlans(short, cluster, stream, subjects, careers, industries),
    blueprint90DayGoal: `Complete ${careers[0]} portfolio project + finalize ${stream}`,
    conclusionParagraph: (studentName, counselor, institute) => (
      `${studentName}, your ${short} profile is built for careers in ${cluster.toLowerCase()}. `
      + `Choose ${stream}, master ${subjects.join(", ")}, and start building evidence of your strengths today. `
      + `Your counselor ${counselor} at ${institute} is here to guide you. Begin your 30-day plan now.`
    ),
  };
}
