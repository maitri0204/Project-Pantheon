import { buildPersonalityReportProfile } from "./buildPersonalityReportProfile";
import type { CareerCompassAssessmentData } from "./types";
import { reportStyles } from "./styles";

function footer(page: number, total: number, student: string): string {
  return `
    <div class="page-footer">
      <span>Career Compass Report &bull; ${student}</span>
      <span class="page-num">${page} / ${total}</span>
      <span>Confidential</span>
    </div>`;
}

function pageHeader(tag: string, title: string): string {
  return `
    <div class="page-header">
      <div class="page-header-left">
        <div class="section-tag">${tag}</div>
        <h2>${title}</h2>
      </div>
      <div class="page-header-accent"></div>
    </div>`;
}

function bulletCard(title: string, items: string[], variant = "card", extraClass = ""): string {
  const icons: Record<string, string> = {
    "card-strength": "✦",
    "card-growth": "↑",
    "card-insight": "◈",
    "card-snapshot": "◎",
    "card-motivator": "★",
    "card-challenge": "!",
    "card-style": "◆",
    "card-highlight": "✦",
    "card-risk": "△",
    "card-opportunity": "✓",
    card: "•",
  };
  const icon = icons[variant] || "•";
  return `
    <div class="card ${variant} ${extraClass}">
      <h3><span class="card-icon">${icon}</span>${title}</h3>
      <ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>
    </div>`;
}

function dnaCard(num: string, title: string, items: string[]): string {
  return `
    <div class="dna-card accent" data-num="${num}">
      <h3>${title}</h3>
      <ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>
    </div>`;
}

function roleCard(title: string, summary: string, items: string[]): string {
  return `
    <div class="role-card">
      <h3>${title}</h3>
      <p class="role-summary">${summary}</p>
      <ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>
    </div>`;
}

function portfolioCard(title: string, items: string[]): string {
  return `
    <div class="portfolio-card">
      <h3>${title}</h3>
      <ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>
    </div>`;
}

function skillCard(title: string, items: string[]): string {
  return `
    <div class="skill-card">
      <h3>${title}</h3>
      <ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>
    </div>`;
}

interface DimensionCardConfig {
  cssClass: string;
  title: string;
  primaryLabel: string;
  primaryPct: number;
  secondaryLabel: string;
  secondaryPct: number;
  leftBarColor: string;
  rightBarColor: string;
  leftBarPct: number;
  rightBarPct: number;
  leftBarLabel: string;
  rightBarLabel: string;
}

function dimensionCard(c: DimensionCardConfig): string {
  return `
    <div class="dimension-card ${c.cssClass}">
      <div class="dimension-card-title">${c.title}</div>
      <div class="dimension-wheel">
        <div class="wheel-label">${c.primaryLabel}</div>
        <div class="wheel-pct">${c.primaryPct}%</div>
      </div>
      <div class="dimension-secondary"><b>${c.secondaryLabel}</b><br>${c.secondaryPct}%</div>
      <div class="dimension-split-bar">
        <div class="seg-left" style="width:${c.leftBarPct}%;background:${c.leftBarColor}"></div>
        <div class="seg-right" style="width:${c.rightBarPct}%;background:${c.rightBarColor}"></div>
      </div>
      <div class="dimension-bar-labels">
        <span>${c.leftBarLabel}</span>
        <span>${c.rightBarLabel}</span>
      </div>
    </div>`;
}

function dimensionCardFromSlice(
  cssClass: string,
  title: string,
  slice: CareerCompassAssessmentData["dimensions"]["energy"],
  colors: { a: string; b: string },
): DimensionCardConfig {
  const aWins = slice.percentA >= slice.percentB;

  return {
    cssClass,
    title,
    primaryLabel: aWins ? slice.traitA : slice.traitB,
    primaryPct: aWins ? slice.percentA : slice.percentB,
    secondaryLabel: aWins ? slice.traitB : slice.traitA,
    secondaryPct: aWins ? slice.percentB : slice.percentA,
    leftBarColor: colors.a,
    rightBarColor: colors.b,
    leftBarPct: slice.percentA,
    rightBarPct: slice.percentB,
    leftBarLabel: slice.traitA,
    rightBarLabel: slice.traitB,
  };
}

function buildDimensionOverview(d: CareerCompassAssessmentData): string {
  const dims = d.dimensions;
  const cards: DimensionCardConfig[] = [
    dimensionCardFromSlice("dim-energy", "ENERGY STYLE", dims.energy, { a: "#6c5ce7", b: "#00b894" }),
    dimensionCardFromSlice("dim-life", "LIFE STYLE", dims.working, { a: "#00cec9", b: "#d63031" }),
    dimensionCardFromSlice("dim-cognitive", "COGNITIVE STYLE", dims.cognitive, { a: "#e17055", b: "#0984e3" }),
    dimensionCardFromSlice("dim-values", "VALUES STYLE", dims.decision, { a: "#fdcb6e", b: "#e84393" }),
  ];

  return `
    <div class="dimension-overview">
      <div class="dimension-overview-intro">
        <h3>Dimension overview</h3>
        <p>Org-average split on each personality axis using full style names.</p>
      </div>
      <div class="dimension-cards-row">
        ${cards.map(dimensionCard).join("")}
      </div>
    </div>`;
}

function streamCardHtml(stream: {
  name: string;
  why: string;
  advantages: string;
  risks: string;
  outcomes: string;
  recommended: boolean;
}): string {
  const tag = stream.recommended
    ? '<span class="tag tag-gold">Recommended</span>'
    : stream.name === "Interdisciplinary"
      ? '<span class="tag tag-blue">Emerging</span>'
      : '<span class="tag tag-gray">Secondary</span>';
  const cardClass = stream.recommended
    ? "stream-card recommended"
    : stream.name === "Interdisciplinary"
      ? "stream-card secondary-card"
      : "stream-card emerging-card";

  return `
          <div class="${cardClass}">
            <h4>${stream.name} ${tag}</h4>
            <ul class="stream-list">
              <li><b>Why it fits:</b> ${stream.why}</li>
              <li><b>Advantages:</b> ${stream.advantages}</li>
              <li><b>Risks:</b> ${stream.risks}</li>
              <li><b>Career outcomes:</b> ${stream.outcomes}</li>
            </ul>
          </div>`;
}

export function buildReportHtml(data: CareerCompassAssessmentData): string {
  const total = 20;
  const s = data.student;
  const profile = buildPersonalityReportProfile(data);
  const dnaTitles = ["Who You Are", "How You Think", "How You Learn", "How You Decide", "How You Work", "Future Success Drivers"];

  const pages: string[] = [];

  // PAGE 1 — COVER
  pages.push(`
    <div class="page cover">
      <div class="cover-top-bar"></div>
      <div class="cover-body">
        <div class="cover-header-row">
          <div class="cover-left">
            <div class="cover-badge">Intelligence Report</div>
            <h1>Career Compass<br>Intelligence Report</h1>
            <p class="cover-sub">Personalized career guidance powered by psychometric assessment</p>
          </div>
          <div class="cover-hero">
            <div class="personality-hero">
              <div class="type">${data.personalityType}</div>
              <div class="label">Personality Type</div>
            </div>
          </div>
        </div>
        <div class="cover-mid">
          <div class="cover-meta-item"><div class="cover-meta-label">Student Name</div><div class="cover-meta-value">${s.name}</div></div>
          <div class="cover-meta-item"><div class="cover-meta-label">Assessment Date</div><div class="cover-meta-value">${s.assessmentDate}</div></div>
          <div class="cover-meta-item"><div class="cover-meta-label">Grade</div><div class="cover-meta-value">Class ${s.grade}</div></div>
        </div>
        <div class="exec-statement">
          ${profile.coverStatement}
        </div>
      </div>
      ${footer(1, total, s.name)}
    </div>`);

  // PAGE 2 — EXECUTIVE SUMMARY
  pages.push(`
    <div class="page page-exec">
      <div class="page-inner">
        ${pageHeader("Executive Overview", "Executive Summary")}
        <div class="exec-metrics">
          <div class="metric-card"><div class="value">${data.personalityType.replace("The ", "")}</div><div class="label">Personality Type</div></div>
          <div class="metric-card"><div class="value">${data.strongestTrait}</div><div class="label">Strongest Trait</div></div>
          <div class="metric-card"><div class="value">${data.suggestedStream}</div><div class="label">Suggested Stream</div></div>
        </div>
        <div class="exec-intro">
          <p>${profile.executiveIntro} Use it as your starting map before diving into the detailed sections that follow.</p>
        </div>
        <div class="exec-panels">
          <div class="exec-panel">
            ${bulletCard("Top Strengths", profile.topStrengths, "card-snapshot")}
            ${bulletCard("Key Insights", profile.keyInsights, "card-snapshot")}
          </div>
          <div class="exec-panel">
            ${bulletCard("Growth Areas", profile.growthAreas, "card-snapshot")}
            ${bulletCard("Career Snapshot", profile.careerSnapshot, "card-snapshot")}
          </div>
        </div>
      </div>
      ${footer(2, total, s.name)}
    </div>`);

  // PAGE 3 — CAREER DNA
  pages.push(`
    <div class="page">
      <div class="page-inner">
        ${pageHeader("Identity Profile", "Your Career Compass")}
        <div class="dna-grid">
          ${profile.dnaCards.map((items, index) => dnaCard(
            String(index + 1).padStart(2, "0"),
            dnaTitles[index] || "Career DNA",
            items,
          )).join("")}
        </div>
      </div>
      ${footer(3, total, s.name)}
    </div>`);

  // PAGE 4 — PERSONALITY ARCHITECTURE (Dimension Overview, 2x2 wheels)
  pages.push(`
    <div class="page">
      <div class="page-inner">
        ${pageHeader("Dimension Analysis", "Personality Architecture")}
        ${buildDimensionOverview(data)}
      </div>
      ${footer(4, total, s.name)}
    </div>`);

  // PAGE 5 — PERSONALITY DEEP DIVE
  pages.push(`
    <div class="page">
      <div class="page-inner">
        ${pageHeader("Type Analysis", `Personality Type Deep Dive - ${profile.personalityName}`)}
        <div class="dive-row-top">
          ${bulletCard("Strengths", profile.deepDive.strengths, "card-strength")}
          ${bulletCard("Motivators", profile.deepDive.motivators, "card-motivator")}
          ${bulletCard("Challenges", profile.deepDive.challenges, "card-challenge")}
        </div>
        <div class="dive-row-bottom">
          ${bulletCard("Learning Style", profile.deepDive.learningStyle, "card-style")}
          ${bulletCard("Communication Style", profile.deepDive.communicationStyle, "card-style")}
          ${bulletCard("Leadership Style", profile.deepDive.leadershipStyle, "card-style")}
        </div>
      </div>
      ${footer(5, total, s.name)}
    </div>`);

  // PAGE 6 — ACADEMIC PROFILE
  pages.push(`
    <div class="page">
      <div class="page-inner">
        ${pageHeader("Learning Profile", "Preferred Academic Profile")}
        <div class="academic-grid">
          ${bulletCard("Learning Style", profile.deepDive.learningStyle.slice(0, 8), "card-style")}
          ${bulletCard("Study Habits to Build", [
            "Use Pomodoro for focused deep-work blocks",
            "Create mind maps for big-picture subjects",
            "Study in groups for Economics and Business",
            "Set weekly goals to combat procrastination",
            "Reward completed milestones to stay consistent",
            "Block calendar time for hardest subjects first",
            "Summarize each chapter in your own words within 24 hours",
            "Track progress weekly — what worked and what did not",
          ], "card-style")}
          ${bulletCard("Attention Pattern", [
            "High focus on interesting, novel topics",
            "Attention drops during repetitive tasks",
            "Energized by competitive academic settings",
            "Switch subjects every 45 min for best retention",
            "Use short breaks to reset and refocus",
            "Novelty and challenge restore focus quickly",
            "Avoid marathon study sessions without clear goals",
            "Pair boring tasks with music or timed challenges",
          ], "card-style")}
          ${bulletCard("Memory Pattern", [
            "Remembers concepts and frameworks well",
            "May forget details - use flashcards",
            "Associative memory: link facts to stories",
            "Review notes within 24 hours of class",
            "Teach a topic to lock it into long-term memory",
            "Use acronyms and visual anchors for key definitions",
            "Connect new facts to business or tech examples you care about",
            "Spaced repetition works better than one-time cramming",
          ], "card-style")}
          <div class="academic-span">
            ${bulletCard("Exam Strategy", [
              "Start preparation 3 weeks before - avoid last-minute cramming",
              "Practice case-study format questions for Commerce subjects",
              "Use past papers to identify high-weightage topics",
              "Form study groups for Economics and Computer Science",
              "Build a revision schedule with clear daily targets",
            ], "card-highlight", "card-compact")}
          </div>
        </div>
      </div>
      ${footer(6, total, s.name)}
    </div>`);

  // PAGE 7 — STREAM RECOMMENDATION
  pages.push(`
    <div class="page">
      <div class="page-inner">
        ${pageHeader("Academic Direction", "Stream Recommendation Report")}
        <div class="stream-layout">
          ${profile.streams.map(streamCardHtml).join("")}
        </div>
      </div>
      ${footer(7, total, s.name)}
    </div>`);

  // PAGE 8 — SUBJECT FIT
  pages.push(`
    <div class="page">
      <div class="page-inner">
        ${pageHeader("Subject Analysis", "Subject Fit Analysis")}
        <div class="subject-layout">
          ${profile.subjects
            .map(
              (sub) => `
            <div class="subject-card">
              <h3>${sub.name} <span class="tag tag-gold">Recommended</span></h3>
              <ul>
                <li><b>Why it fits:</b> ${sub.why}</li>
                <li><b>Difficulty:</b> ${sub.difficulty}</li>
                <li><b>Future relevance:</b> ${sub.relevance}</li>
                <li><b>Career opportunities:</b> ${sub.careers}</li>
              </ul>
            </div>`
            )
            .join("")}
          ${bulletCard("Action Plan for Subjects", [
            `Focus weekly study time on ${profile.subjects.map((item) => item.name).join(", ")}`,
            `Join clubs or programs related to ${profile.primaryCluster.toLowerCase()}`,
            `Read industry news relevant to ${profile.careerMatches.slice(0, 2).map((item) => item.name).join(" and ")}`,
            "Build a small project that applies each recommended subject",
            "Participate in subject-related competitions at school level",
            "Find a mentor working in your top career matches",
            `Map each subject to careers: ${data.recommendedCareers.slice(0, 3).join(", ")}`,
          ], "card-snapshot", "card-compact")}
        </div>
      </div>
      ${footer(8, total, s.name)}
    </div>`);

  // PAGE 9 — TOP 10 CAREERS (was page 10)
  pages.push(`
    <div class="page">
      <div class="page-inner">
        ${pageHeader("Career Matches", "Top 10 Career Matches")}
        <div class="matches-layout">
          ${profile.careerMatches.map(
            (c, i) => `
            <div class="career-match">
              <div class="match-rank">${i + 1}</div>
              <div class="match-info">
                <div class="name">${c.name}</div>
                <div class="why">${c.desc}</div>
                <div class="match-pct-bar"><div class="match-pct-bar-fill" style="width:${c.pct}%"></div></div>
              </div>
              <div class="match-pct">${c.pct}%</div>
            </div>`
          ).join("")}
        </div>
      </div>
      ${footer(9, total, s.name)}
    </div>`);

  // PAGE 10 — JOB ROLE EXPLORER (was page 11)
  pages.push(`
    <div class="page page-roles">
      <div class="page-inner">
        ${pageHeader("Role Pathways", "Job Role Explorer")}
        <div class="roles-grid">
          ${profile.roleCards.map((role) => roleCard(role.title, role.summary, role.pathway)).join("")}
        </div>
      </div>
      ${footer(10, total, s.name)}
    </div>`);

  // PAGE 11 — INDUSTRY EXPLORATION (was page 12)
  pages.push(`
    <div class="page page-industry">
      <div class="page-inner">
        ${pageHeader("Industry Fit", "Industry Exploration Report")}
        <p class="industry-intro">${profile.industryIntro}</p>
        <div class="industry-list">
          ${profile.industries
            .map(
              (ind) => `
            <div class="industry-item">
              <div class="industry-item-body">
                <div class="industry-item-name">${ind.name}</div>
                <div class="industry-item-desc">${ind.desc}</div>
              </div>
              <div class="industry-item-action"><span class="industry-item-action-label">Try this</span>${ind.action}</div>
            </div>`
            )
            .join("")}
        </div>
      </div>
      ${footer(11, total, s.name)}
    </div>`);

  // PAGE 12 — FUTURE SKILLS (was page 13)
  pages.push(`
    <div class="page page-skills">
      <div class="page-inner">
        ${pageHeader("Skills Forecast", "Future Skills Report - 2030 Ready (Suggested)")}
        <div class="skills-layout">
          <div class="skills-grid">
            ${skillCard("Critical Thinking", [
              "Your strength - sharpen with case studies",
              "Practice structured problem frameworks",
              "Join debate and MUN competitions",
              "Question assumptions before accepting conclusions",
              "Break complex problems into smaller testable parts",
            ])}
            ${skillCard("AI Literacy", [
              "Learn how AI tools work and their limits",
              "Use ChatGPT for research and ideation",
              "Understand AI's impact on your target careers",
              "Know when to trust AI output and when to verify",
              "Build projects combining human judgment with AI",
            ])}
            ${skillCard("Leadership", [
              "Start leading small team projects now",
              "Volunteer for club president roles",
              "Practice delegating, not just ideating",
              "Set clear goals and track team progress weekly",
              "Take ownership when plans fail - lead recovery",
            ])}
            ${skillCard("Communication", [
              "Your superpower - refine public speaking",
              "Practice pitching ideas in 60 seconds",
              "Write clearly: emails, reports, and presentations",
              "Listen actively before responding in debates",
              "Adapt your message for parents, peers, and professionals",
            ])}
            ${skillCard("Problem Solving", [
              "Enter hackathons and business case comps",
              "Use design thinking frameworks",
              "Define the problem before jumping to solutions",
              "Prototype fast, test with users, then improve",
              "Document your process in a portfolio",
            ])}
            ${skillCard("Entrepreneurship", [
              "Launch a micro-business or social project",
              "Learn lean startup methodology",
              "Validate ideas with real customers before scaling",
              "Enter pitch competitions and startup fairs",
              "Build a habit of spotting problems worth solving",
            ])}
          </div>
          ${bulletCard("Adaptability - Your Growth Edge", [
            "Learn one new skill every quarter",
            "Follow industry trends via podcasts and newsletters",
            "Develop structured planning to complement flexibility",
            "Embrace feedback and iterate quickly on your work",
            "Treat change as opportunity, not disruption",
            "Practice switching tasks without losing momentum",
            "Build backup plans when primary goals shift",
            "Read one article weekly outside your comfort zone",
            "Volunteer for roles that stretch your abilities",
            "Reflect monthly on lessons from unexpected changes",
            "Stay calm when plans change — focus on what you control",
            "Keep a skills log of what you learn each month",
          ], "card-snapshot", "skills-adapt-card")}
        </div>
      </div>
      ${footer(12, total, s.name)}
    </div>`);

  // PAGE 13 — PROJECT ROADMAP (was page 15)
  pages.push(`
    <div class="page">
      <div class="page-inner">
        ${pageHeader("Build Your Profile", "Project & Portfolio Roadmap")}
        <div class="page-dense">
          <div class="page-dense-grid page-dense-vertical">
            ${portfolioCard("Projects to Build", [
              "Launch a small online business or service",
              "Create a product prototype (app or website)",
              "Write a market analysis report on a trend",
              "Develop a personal brand on LinkedIn",
              "Document each project in a portfolio page",
              "Build a landing page explaining your idea and target users",
              "Run a 2-week experiment and record results in a one-page summary",
              "Share progress weekly with a mentor or counselor",
            ])}
            ${portfolioCard("Competitions", [
              "Tata Crucible / Hult Prize (business)",
              "Google Code-in / Hackathons (tech)",
              "Economic Times Business Quiz",
              "School-level entrepreneurship fairs",
              "National-level case study challenges",
              "Inter-school debate and MUN tournaments",
              "Innovation challenges hosted by local incubators",
              "Apply early — note deadlines and eligibility criteria",
            ])}
            ${portfolioCard("Business Challenges", [
              "Stock market simulation leagues",
              "Case study competitions (consulting style)",
              "Startup pitch events at school level",
              "Social entrepreneurship challenges",
              "Mock investor pitch presentations",
              "Business plan contests with real judging panels",
              "Economics olympiad and financial literacy quizzes",
              "Team-based challenges to practice collaboration under pressure",
            ])}
            ${portfolioCard("Leadership Activities", [
              "President of Entrepreneurship Club",
              "Organize school TEDx or speaker events",
              "Lead a community service initiative",
              "Mentor junior students in your strengths",
              "Captain a team for a group project or event",
              "Volunteer to coordinate school fairs or fundraisers",
              "Start a peer study group for Commerce or CS subjects",
              "Document leadership wins in your career journal",
            ])}
          </div>
        </div>
      </div>
      ${footer(13, total, s.name)}
    </div>`);

  // PAGE 14 — RISKS & BLIND SPOTS (was page 16)
  pages.push(`
    <div class="page">
      <div class="page-inner">
        ${pageHeader("Awareness", "Potential Career Risks & Blind Spots")}
        <div class="page-dense">
          <div class="page-dense-grid page-dense-vertical">
            ${bulletCard("Personality-Related Challenges", [
              "Starting many projects but finishing few",
              "Overconfidence leading to missed feedback",
              "Ignoring details in financial or technical work",
              "Debating when collaboration is needed",
              "Losing interest once the exciting phase ends",
              "Moving on before validating whether an idea truly works",
              "Underestimating how much follow-through impresses colleges and employers",
              "Letting enthusiasm override structured planning",
            ], "card-risk")}
            ${bulletCard("Common Mistakes to Avoid", [
              "Choosing careers purely for excitement",
              "Neglecting foundational academic skills",
              "Avoiding routine practice in weak subjects",
              "Ignoring emotional intelligence development",
              "Underestimating the value of consistency",
              "Comparing yourself to peers instead of your own progress",
              "Skipping research before committing to a stream or subject",
              "Assuming talent alone replaces disciplined practice",
            ], "card-risk")}
            ${bulletCard("Decision Risks", [
              "Impulsive career switches without research",
              "Following trends without self-assessment",
              "Underestimating importance of credentials",
              "Avoiding structured long-term planning",
              "Overcommitting to too many ideas at once",
              "Choosing paths based on social pressure rather than fit",
              "Delaying hard conversations with parents or counselors",
              "Ignoring backup plans while pursuing ambitious goals",
            ], "card-risk")}
            ${bulletCard("Growth Opportunities", [
              "Build a 'finish what you start' habit tracker",
              "Partner with detail-oriented collaborators",
              "Schedule weekly reflection on progress",
              "Seek feedback actively from mentors",
              "Turn one idea into a fully completed project",
              "Celebrate small completions to build momentum",
              "Use this report as a monthly check-in with your counselor",
              "Treat blind spots as skills you can train, not fixed limits",
            ], "card-opportunity")}
          </div>
        </div>
      </div>
      ${footer(14, total, s.name)}
    </div>`);

  // PAGE 15 — 30-DAY PLAN (was page 17)
  pages.push(`
    <div class="page page-plan-30">
      <div class="page-inner">
        ${pageHeader("Suggested Action Plan", "30-Day Career Exploration Plan")}
        <div class="plan-progress">
          <div class="plan-step done"><div class="plan-step-dot"></div><div class="plan-step-label">Week 1</div></div>
          <div class="plan-step done"><div class="plan-step-dot"></div><div class="plan-step-label">Week 2</div></div>
          <div class="plan-step done"><div class="plan-step-dot"></div><div class="plan-step-label">Week 3</div></div>
          <div class="plan-step active"><div class="plan-step-dot"></div><div class="plan-step-label">Week 4</div></div>
        </div>
        <div class="timeline-layout">
          <div class="timeline-item"><div class="timeline-marker">Week<br>1</div><div class="timeline-content"><h4>Discover & Research</h4><ul><li>Read about 3 target careers in depth</li><li>Watch 5 career journey videos on YouTube</li><li>Take a free online Python or business course</li><li>Write a 1-page career interest statement</li></ul></div></div>
          <div class="timeline-item"><div class="timeline-marker">Week<br>2</div><div class="timeline-content"><h4>Connect & Learn</h4><ul><li>Interview 2 professionals in target fields</li><li>Join an entrepreneurship or debate club</li><li>Start following 10 industry leaders on LinkedIn</li><li>Attend a webinar or career talk</li></ul></div></div>
          <div class="timeline-item"><div class="timeline-marker">Week<br>3</div><div class="timeline-content"><h4>Build & Experiment</h4><ul><li>Launch a small project (blog, app idea, business plan)</li><li>Enter a school-level competition</li><li>Practice a 3-minute career pitch</li><li>Map subject choices to career goals</li></ul></div></div>
          <div class="timeline-item"><div class="timeline-marker">Week<br>4</div><div class="timeline-content"><h4>Reflect & Plan</h4><ul><li>Review what excited you most this month</li><li>Shortlist top 3 careers for deeper exploration</li><li>Create a 60-day plan with specific goals</li><li>Share findings with counselor and parents</li></ul></div></div>
          <div class="plan-extra-row">
            ${bulletCard("Clear Goals & Tasks", [
              "Define one primary career question to answer this month",
              "Complete 3 small research tasks each week",
              "Track daily progress in a simple journal",
              "Target: 3 careers explored in depth",
            ], "card-insight", "card-compact")}
            ${bulletCard("Guidance & Mentorship", [
              "Identify 2 mentors — a teacher and an industry person",
              "Schedule a weekly 15-minute counselor check-in",
              "Ask each mentor one focused question per meeting",
              "Join a peer group for accountability",
            ], "card-style", "card-compact")}
          </div>
          ${bulletCard("Expected Outcomes", [
            "Clear shortlist of 3 career directions",
            "One completed mini-project or competition entry",
            "Professional network of 2+ mentors",
            "Written career exploration journal",
          ], "card-snapshot", "card-compact")}
        </div>
      </div>
      ${footer(15, total, s.name)}
    </div>`);

  // PAGE 16 — 60-DAY PLAN (was page 18)
  pages.push(`
    <div class="page">
      <div class="page-inner">
        ${pageHeader("Suggested Action Plan", "60-Day Career Discovery Plan")}
        <div class="plan-60-layout">
          <div class="plan-header-strip">Days 31 – 60 &nbsp;|&nbsp; Discovery Phase</div>
          <div class="plan-60-grid">
            ${bulletCard("Clear Goals & Tasks", [
              "Convert research into one concrete project plan",
              "Break the project into weekly milestones",
              "Allocate 5 focused hours per week to building",
              "Review and adjust goals every two weeks",
            ], "card-style")}
            ${bulletCard("Goals (Days 31–60)", [
              "Deep-dive into top 3 career paths",
              "Build first portfolio piece",
              "Develop one technical or business skill",
              "Establish mentor relationship",
            ], "card-style")}
            ${bulletCard("Projects", [
              "Complete a business plan or product mockup",
              "Build a simple website or app prototype",
              "Write 3 industry analysis articles",
              "Create a personal portfolio page",
            ], "card-style")}
            ${bulletCard("Skill Building", [
              "Complete an online course (Coursera/Udemy)",
              "Practice public speaking weekly",
              "Learn Excel/Google Sheets for analysis",
              "Study one entrepreneurship case per week",
            ], "card-style")}
            ${bulletCard("Networking", [
              "Attend 2 industry events or meetups",
              "Connect with 5 alumni from target colleges",
              "Join online communities (IndieHackers, etc.)",
              "Schedule monthly counselor check-ins",
            ], "card-style")}
            ${bulletCard("Guidance & Mentorship", [
              "Request feedback on your project from a mentor",
              "Shadow or interview one working professional",
              "Connect with 5 alumni in target fields",
              "Document mentor advice in your career journal",
            ], "card-style")}
          </div>
          ${bulletCard("Expected Outcomes", [
            "Portfolio with 2+ tangible projects",
            "Confirmed stream and subject selection",
            "Skill certification or competition result",
            "5+ professional connections",
          ], "card-snapshot", "card-compact")}
        </div>
      </div>
      ${footer(16, total, s.name)}
    </div>`);

  // PAGE 17 — 90-DAY PLAN (was page 19)
  pages.push(`
    <div class="page">
      <div class="page-inner">
        ${pageHeader("Suggested Action Plan", "90-Day Career Acceleration Plan")}
        <div class="plan-90-layout">
          <div class="plan-header-strip">Days 61 – 90 &nbsp;|&nbsp; Acceleration Phase</div>
          <div class="plan-90-grid">
            ${bulletCard("Clear Goals & Tasks", [
              "Set a flagship outcome to complete by Day 90",
              "Define success metrics for your portfolio piece",
              "Schedule weekly build-and-review sprints",
              "Prepare a final progress presentation",
            ], "card-style")}
            ${bulletCard("Goals (Days 61–90)", [
              "Finalize stream and subject choices",
              "Complete a flagship portfolio project",
              "Apply to 2 competitions or programs",
              "Create a 1-year academic roadmap",
            ], "card-style")}
            ${bulletCard("Portfolio", [
              "Publish your best project publicly",
              "Document learnings in a career journal",
              "Get feedback from 3 professionals",
              "Update LinkedIn with achievements",
            ], "card-style")}
            ${bulletCard("Career Exploration", [
              "Shadow a professional for a day",
              "Visit a startup or corporate office",
              "Attend a career fair or expo",
              "Complete a virtual internship module",
            ], "card-style")}
            ${bulletCard("Industry Exposure", [
              "Subscribe to 3 industry newsletters",
              "Analyze 5 company business models",
              "Present findings to class or club",
              "Identify summer program opportunities",
            ], "card-style")}
            ${bulletCard("Guidance & Mentorship", [
              "Get your portfolio reviewed by 3 professionals",
              "Find a long-term mentor in your top career",
              "Build a personal advisory circle of 3-4 people",
              "Plan next year's goals with your counselor",
            ], "card-style")}
          </div>
          ${bulletCard("Expected Outcomes", [
            "Definitive career direction with evidence",
            "Published portfolio showcasing abilities",
            "Competition entry or program application",
            "Ready for next academic year with clear plan",
          ], "card-snapshot", "card-compact")}
        </div>
      </div>
      ${footer(17, total, s.name)}
    </div>`);

  // PAGE 18 — PARENT GUIDANCE (was page 20)
  pages.push(`
    <div class="page">
      <div class="page-inner">
        ${pageHeader("Family Guide", "Parent Guidance Dashboard")}
        <div class="page-dense">
          <div class="page-dense-grid page-dense-vertical">
            ${bulletCard("How Parents Can Support", [
              "Encourage project-based learning over rote study",
              "Provide space for entrepreneurial experiments",
              "Celebrate effort and iteration, not just results",
              "Connect child with professional mentors",
              "Encourage finishing projects, not just starting them",
              "Help set weekly goals without micromanaging daily tasks",
              "Recognize debate and curiosity as strengths, not defiance",
              "Offer resources (books, courses) aligned with their interests",
            ], "card-style")}
            ${bulletCard("Career Conversations", [
              "Ask 'What problem would you solve?' not 'What job?'",
              "Discuss current events and business trends",
              "Share stories of people in diverse careers",
              "Avoid comparing with peers — focus on unique strengths",
              "Listen more than you advise during these talks",
              "Use open questions: 'What excited you this week?'",
              "Revisit career talks monthly — interests evolve at this age",
              "Connect classroom subjects to real-world career examples",
            ], "card-style")}
            ${bulletCard("Decision Support", [
              "Support Commerce/Science dual-path exploration",
              "Visit colleges and career fairs together",
              "Help research programs and scholarships",
              "Trust the assessment data alongside interests",
              "Let your child lead the final decision",
              "Discuss trade-offs openly: workload, exams, long-term fit",
              "Meet the school counselor to align family and school plans",
              "Keep a shared folder of programs, deadlines, and notes",
            ], "card-style")}
            ${bulletCard("Avoiding Pressure", [
              "Don't force traditional safe careers only",
              "Allow room for failure in experiments",
              "Recognize that entrepreneurial paths are valid",
              "Balance ambition with mental well-being",
              "Keep expectations realistic and encouraging",
              "Separate effort from outcome in how you give feedback",
              "Watch for burnout when your child takes on too many ideas",
              "Model healthy work habits and rest — not constant hustle",
            ], "card-style")}
            ${bulletCard("Growth Support", [
              "Enroll in structured programs (entrepreneurship camps)",
              "Invest in communication and leadership workshops",
              "Create a home environment that welcomes debate and ideas",
              "Review this report together and set family goals",
              "Celebrate completed milestones — pitches, projects, competitions",
              "Schedule a quarterly family check-in on career exploration progress",
            ], "card-snapshot")}
          </div>
        </div>
      </div>
      ${footer(18, total, s.name)}
    </div>`);

  // PAGE 19 — FUTURE OUTLOOK (was page 21)
  pages.push(`
    <div class="page">
      <div class="page-inner">
        ${pageHeader("Your Future", "Future Outlook Report")}
        <div class="page-dense">
          <div class="page-dense-grid page-dense-vertical">
            ${bulletCard("Potential Career Growth", [
              `Strong fit for ${profile.primaryCluster}`,
              `Top career match: ${profile.careerMatches[0]?.name || data.recommendedCareers[0]}`,
              `Recommended stream: ${data.suggestedStream}`,
              `Ideal subjects: ${data.suggestedSubjects.join(", ")}`,
              "Early portfolio work strengthens college and job applications",
              "Leadership experience in school builds long-term career advantage",
              "Consistent skill building compounds over 5-10 years",
              "Your personality type thrives with clear goals and accountability",
            ], "card-insight")}
            ${bulletCard("Leadership Potential", profile.deepDive.leadershipStyle.slice(0, 8), "card-strength")}
            ${bulletCard(`${profile.shortName} Career Potential`, [
              `Primary cluster: ${profile.primaryCluster}`,
              `Top matches: ${profile.careerMatches.slice(0, 3).map((item) => item.name).join(", ")}`,
              `Target industries: ${profile.industries.slice(0, 3).map((item) => item.name).join(", ")}`,
              `Build skills aligned with ${data.suggestedSubjects.slice(0, 2).join(" and ")}`,
              "Start exploring careers through internships and projects now",
              "Network with professionals in your top career matches",
              "Use your strengths while working on identified growth areas",
              "Revisit career goals with your counselor each term",
            ], "card-motivator")}
            ${bulletCard("Industry Fit", [
              `Best industries: ${profile.industries.slice(0, 4).map((item) => item.name).join(", ")}`,
              `Career readiness score: ${data.careerReadinessScore}%`,
              `Strongest trait: ${data.strongestTrait}`,
              "Stay updated on trends in your target industries",
              "Combine academic subjects with real-world exposure",
              "Participate in competitions related to your career cluster",
              "Document learning in a career exploration journal",
              "Balance ambition with consistent execution",
            ], "card-motivator")}
            ${bulletCard("Long-Term Success Factors", [
              ...profile.growthAreas.slice(0, 4),
              "Build a strong professional network early",
              "Seek mentors who challenge and support you",
              "Revisit this report yearly as interests evolve",
            ], "card-highlight")}
          </div>
        </div>
      </div>
      ${footer(19, total, s.name)}
    </div>`);

  // PAGE 20 — FINAL CAREER BLUEPRINT (was page 22)
  pages.push(`
    <div class="page page-blueprint">
      <div class="page-inner">
        ${pageHeader("Your Blueprint", "Final Career Blueprint")}
        <div class="blueprint-layout">
          <div class="blueprint-hero">
            <div class="bh-label">Your Career Identity</div>
            <div class="bh-title">${profile.careerIdentity}</div>
          </div>
          <div class="blueprint-grid">
            <div class="blueprint-item featured"><div class="bi-label">Career Identity</div><div class="bi-value">${profile.careerIdentity}</div></div>
            <div class="blueprint-item"><div class="bi-label">Ideal Stream</div><div class="bi-value">${data.suggestedStream}</div></div>
            <div class="blueprint-item"><div class="bi-label">Ideal Subjects</div><div class="bi-value">${data.suggestedSubjects.join(", ")}</div></div>
            <div class="blueprint-item"><div class="bi-label">Ideal Careers</div><div class="bi-value">${data.recommendedCareers.slice(0, 3).join(", ")}</div></div>
            <div class="blueprint-item"><div class="bi-label">Key Skills</div><div class="bi-value">${profile.blueprintSkills}</div></div>
            <div class="blueprint-item"><div class="bi-label">90-Day Goal</div><div class="bi-value">Launch portfolio project + finalize stream</div></div>
          </div>
          <div class="conclusion-box">
            <p><b>Professional Conclusion:</b> ${profile.conclusionParagraph(s.name, s.counselor, s.institute)}</p>
          </div>
        </div>
      </div>
      ${footer(20, total, s.name)}
    </div>`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>${reportStyles}</style>
</head>
<body>${pages.join("")}</body>
</html>`;
}
