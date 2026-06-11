import { AssessmentData } from "./types";
import { getStrongestDomain, getWeakestDomain } from "./utils";
import { getQuadrantType, getQuadrantProfile, formatQuadrantText } from "./quadrantContent";
import {
  bullets,
  progressBar,
  statCard,
  card,
  pageShell,
  radarChartSvg,
  quadrantSvg,
  domainScoreCards,
  strengthCard,
  challengeCard,
  growthTrajectorySvg,
  timelineRoadmap,
  insightPanel,
  highlightBox,
  sectionDivider,
  iconCard,
  riskOpportunityPanels,
  weekPlanBlock,
  phaseHeader,
} from "./helpers";

const TOTAL = 21;

export function buildAllPages(data: AssessmentData): string {
  const strongest = getStrongestDomain(data);
  const weakest = getWeakestDomain(data);
  const { student, overall, domains, quadrant, learnerType } = data;
  const name = student.name;
  const quadrantType = getQuadrantType(quadrant.knowledge, quadrant.regulation);
  const qProfile = getQuadrantProfile(quadrantType);

  const pages = [
    // PAGE 1 (content) - template cover is prepended in buildReport.ts
    pageShell("Section 01", "Learning Intelligence Snapshot", "A high-level executive overview of your learning profile, key performance indicators, and priority development areas.", `
      <div class="card-grid-4">
        ${statCard(`${overall.percentage}%`, "Overall Score")}
        ${statCard(learnerType.split(" ")[0], "Learner Type", "purple")}
        ${statCard(strongest.name, "Strongest Domain", "success")}
        ${statCard(weakest.name, "Development Priority", "danger")}
      </div>
      <p class="detail-text">This snapshot distills your full assessment into the metrics that matter most. Your overall intelligence score of ${overall.percentage}% reflects balanced potential across five metacognitive domains, with clear signals on where to focus next.</p>
      ${sectionDivider("Performance Overview")}
      <div class="two-col">
        <div>
          ${card("Top Strengths", bullets([
            `Exceptional ${strongest.name} (${strongest.percentage}%) - reviews learning experiences deeply`,
            `Strong Regulation (${domains[3].percentage}%) - adjusts approach when something is not working`,
            `Solid Monitoring (${domains[2].percentage}%) - tracks progress during tasks`,
            "High capacity for self-correction after completing work",
            "Natural ability to learn from past study sessions and improve over time",
            "Emotional steadiness during challenging academic tasks",
          ], "success"), "success", "star", "green")}
          ${card("Development Areas", bullets([
            `Low Awareness (${weakest.percentage}%) - may not recognize when learning is breaking down`,
            `Planning (${domains[1].percentage}%) - study sessions often lack clear structure`,
            "Difficulty identifying personal learning strengths and gaps",
            "May rely on effort over strategy during challenging topics",
            "Tendency to push forward without pausing to check understanding",
            "Study time may not always convert into proportional results",
          ], "danger"), "danger", "alert", "red")}
        </div>
        <div>
          ${card("Key Takeaways", bullets([
            "You learn best through reflection after completing tasks",
            "Your regulation skills are ahead of your awareness skills",
            "Building awareness will unlock your existing strengths",
            "Structured planning will multiply your current progress",
            "Your Reflective Learner profile is a strong foundation for growth",
            "Small daily habit changes can produce large score improvements",
          ], "purple"), "purple", "lightbulb", "purple")}
          <div class="card card-primary">
            <h3>Learning Readiness Meter</h3>
            <div class="meter-container">
              <div class="progress-header"><span>Readiness for Growth</span><span>${overall.percentage}%</span></div>
              <div class="meter-bg"><div class="meter-fill" style="width:${overall.percentage}%"></div></div>
            </div>
            <p>You have a solid foundation with high-impact growth areas clearly identified. Your readiness score indicates you are well-positioned to benefit from a structured 90-day improvement plan.</p>
          </div>
        </div>
      </div>
      ${highlightBox("Executive Summary", `<p>${name} is a <strong>${learnerType}</strong> operating at ${overall.score}/${overall.maxScore} overall. Regulation (${quadrant.regulation}%) significantly exceeds awareness (${quadrant.knowledge}%). This profile suggests strong ability to adjust and reflect, but limited recognition of when learning strategies need to change in real time. Targeted awareness-building and planning routines will produce the fastest gains. Your reflection score of ${domains[4].percentage}% is a powerful asset - Once awareness improves, this strength will accelerate progress across all subjects.</p>`)}
    `, 1, TOTAL),

    // PAGE 3
    pageShell("Section 02", "Your Learning DNA", "Discover how your mind naturally absorbs, processes, and retains information - the core blueprint of your learning identity.", `
      <p class="detail-text">How your brain naturally approaches learning - based on your assessment profile. These patterns explain why certain study methods feel natural and why others feel difficult.</p>
      <div class="two-col">
        <div class="dna-card"><h3>How You Naturally Learn</h3><p>You prefer learning through doing first, then reflecting afterward. You absorb information better when you can review what happened and adjust for next time. Hands-on exposure followed by structured review is your optimal learning cycle. You are not a passive note-taker - you are an active processor who needs time to make sense of new material.</p></div>
        <div class="dna-card"><h3>How You Process Information</h3><p>You process deeply during review phases rather than in the moment. Real-time awareness of confusion is your main growth edge. During first exposure, information may feel scattered; during revision, connections become clear. Building a pause-and-check habit during initial learning will bridge this gap significantly.</p></div>
        <div class="dna-card"><h3>How You Approach Challenges</h3><p>You persist through difficulty and regulate emotions reasonably well (${domains[3].percentage}%). You may not always notice early warning signs before frustration builds. When challenged, you tend to keep going rather than stop and reassess - admirable for persistence, but costly when the approach itself is ineffective.</p></div>
        <div class="dna-card"><h3>How You Respond to Mistakes</h3><p>With ${domains[4].percentage}% reflection, you analyze errors after the fact. You benefit from pausing during tasks to catch mistakes earlier. Post-task error analysis is a genuine strength - Translating this into mid-task correction is your next level of growth.</p></div>
      </div>
      ${sectionDivider("Understanding Framework")}
      <div class="card card-purple">
        <h3>How You Build Understanding</h3>
        <p class="detail-text">Your understanding-building process follows a predictable and improvable sequence. Leveraging this sequence deliberately will make learning faster and more durable.</p>
        ${bullets([
          "Start with exposure to new material, even if initial understanding feels incomplete",
          "Use post-study reflection to connect ideas and identify gaps",
          "Revisit difficult sections with a structured review plan",
          "Ask 'What do I still not understand?' before closing any study session",
          "Convert reflections into concrete next-step actions",
          "Teach concepts back to yourself aloud to test true understanding",
          "Link new information to something you already know well",
          "Use visual organizers to map relationships between ideas",
        ], "purple")}
      </div>
    `, 2, TOTAL),

    // PAGE 4 - METACOGNITION
    pageShell("Section 03", "TEST Dashboard", "Visual breakdown of your five core learning domains - Awareness, Planning, Monitoring, Regulation, and Reflection.", `
      <p class="detail-text">Your test profile across all five domains. Each domain represents a distinct skill in managing your own learning. Together, they determine how effectively you study, perform, and grow.</p>
      <div class="two-col">
        <div class="chart-panel">
          <h3>Domain Radar</h3>
          ${radarChartSvg(domains.map((d) => d.percentage), domains.map((d) => d.name))}
        </div>
        <div class="domain-scores-panel">
          <h3>Domain Scores</h3>
          <div class="domain-scores-list">
            ${domains.map((d) => progressBar(d.name, d.percentage, "default")).join("")}
          </div>
          <p class="detail-text" style="margin-top:10px;">Score breakdown: Awareness ${domains[0].score}/${domains[0].max} · Planning ${domains[1].score}/${domains[1].max} · Monitoring ${domains[2].score}/${domains[2].max} · Regulation ${domains[3].score}/${domains[3].max} · Reflection ${domains[4].score}/${domains[4].max}</p>
        </div>
      </div>
      ${sectionDivider("Domain Ranking")}
      ${domainScoreCards(domains.map((d) => d.name), domains.map((d) => d.percentage))}
      <div class="two-col">
        <div class="card-white"><h4>Strongest Domain</h4><p><strong>${strongest.name}</strong> - ${strongest.percentage}%</p><p>You excel at reviewing and learning from experience. This is your competitive advantage - Use it deliberately after every study session and exam.</p></div>
        <div class="card-white"><h4>Weakest Domain</h4><p><strong>${weakest.name}</strong> - ${weakest.percentage}%</p><p>Building this area will accelerate all other domains. Even a 10-point improvement in Awareness can shift your entire learning trajectory within 60 days.</p></div>
      </div>
      ${card("Domain Comparison", bullets([
        `Awareness (${domains[0].percentage}%) vs Reflection (${domains[4].percentage}%) - Large gap between knowing-in-action and knowing-after-action`,
        `Regulation (${domains[3].percentage}%) leads Planning (${domains[1].percentage}%) - You adjust well but plan less consistently`,
        `Monitoring (${domains[2].percentage}%) is mid-range - Track progress more deliberately during study`,
      ]), "insight", "chart", "blue", true)}
    `, 3, TOTAL),

    // PAGE 5 - QUADRANT
    pageShell("Section 04", "Learner Quadrant Analysis", "Your position on the Knowledge - Regulation matrix reveals how you balance awareness with self-control during learning.", `
      <p class="detail-text">The quadrant matrix maps Knowledge (Awareness) on the X-axis and Regulation on the Y-axis. Each quadrant represents a distinct learner profile with unique strengths and growth paths. Your scores place you in the <strong>${qProfile.label}</strong> zone.</p>
      <div class="two-col quadrant-layout">
        <div class="chart-panel" style="text-align:center;padding:8px;">${quadrantSvg(quadrant.knowledge, quadrant.regulation, quadrantType)}</div>
        <div>
          <div class="card card-primary">
            <h3>Current Quadrant</h3>
            <p><span class="badge">${quadrantType}</span></p>
            <p>Position: Knowledge ${quadrant.knowledge}% | Regulation ${quadrant.regulation}%</p>
            <p class="detail-text">${qProfile.description}</p>
          </div>
          <div class="callout">
            <h3>Meaning</h3>
            <p>${formatQuadrantText(qProfile.meaningIntro, quadrant.knowledge, quadrant.regulation)}</p>
            <p class="detail-text">${qProfile.meaningPractical}</p>
          </div>
        </div>
      </div>
      ${sectionDivider("Strategic Analysis")}
      <p class="detail-text">Understanding your quadrant advantages and limitations helps you make targeted changes. The analysis below is tailored to your <strong>${quadrantType}</strong> profile and shows where to focus improvement efforts.</p>
      <div class="three-col spaced-cards">
        ${card("Advantages", bullets(qProfile.advantages), "success", "check", "green")}
        ${card("Limitations", bullets(qProfile.limitations), "warning", "alert", "amber")}
        ${card("Growth Opportunities", bullets(qProfile.growthOpportunities), "primary", "trend", "blue")}
      </div>
      ${card("Impact Areas", bullets(
        qProfile.impactAreas.map(({ area, text }) => `<strong>${area}:</strong> ${text}`)
      ), "insight", "compass", "purple")}
    `, 4, TOTAL),

    // PAGE 6
    pageShell("Section 05", "Thinking Style Profile", "How you analyze, decide, solve problems, and process information - the cognitive patterns behind your academic behavior.", `
      <p class="detail-text">Your thinking style shapes every academic interaction - from how you approach homework to how you perform under exam pressure. Understanding these patterns gives you direct control over your results.</p>
      <div class="insight-grid">
        ${insightPanel("Thinking Patterns", bullets(["Reflective and analytical after completing work", "Processes information in structured review cycles", "Tends toward depth over speed during revision", "May delay meta-thinking until tasks are finished", "Benefits from written thinking before verbal expression", "Strongest insights emerge during quiet review time"]), "brain", "blue")}
        ${insightPanel("Decision Making", bullets(["Makes better decisions after reviewing outcomes", "Benefits from writing pros/cons before choosing study methods", "Sometimes continues ineffective approaches too long", "Improves decisions when awareness prompts are used", "Should create decision checkpoints during long tasks", "Past outcomes strongly inform future choices"]), "compass", "purple")}
        ${insightPanel("Problem Solving", bullets(["Breaks down problems well during revision", "Needs stronger upfront problem framing", "Uses reflection to fix errors effectively", "Should pause mid-problem to assess approach", "Works best with step-by-step written solutions", "Can solve complex problems when given adequate time"]), "target", "blue")}
        ${insightPanel("Information Processing", bullets(["Deep processing during review sessions", "Surface-level processing during first exposure", "Benefits from summarizing after each section", "Visual organizers improve retention significantly", "Audio review and teach-back methods are highly effective", "Chunking information into smaller parts aids comprehension"]), "lightbulb", "purple")}
      </div>
      ${sectionDivider("Profile Summary")}
      ${riskOpportunityPanels(
        "Strengths",
        bullets(["Deep reflection", "Emotional regulation", "Persistent effort", "Self-correction ability", "Analytical review skills", "Growth-oriented mindset"], "success"),
        "Risks",
        bullets(["Late awareness of confusion", "Unstructured study starts", "Over-reliance on effort", "Inconsistent planning", "Delayed strategy changes", "May not ask for help early enough"], "danger"),
        "Recommendations",
        bullets(["Use 3-minute pre-study plans", "Set mid-task check-in alarms", "Keep an awareness journal", "Review strategies weekly", "Practice explaining concepts aloud daily", "Build a personal strategy menu for stuck moments"], "purple")
      )}
    `, 5, TOTAL),

    // PAGE 7
    pageShell("Section 06", "Study Behavior Analysis", "Practical observations of how you learn across classrooms, homework, exams, revision, and independent study.", `
      <p class="detail-text">Your study behaviors across seven learning contexts reveal consistent patterns. These observations translate directly into actionable changes you can make starting today.</p>
      <div class="insight-grid">
        ${insightPanel("Classroom Learning", bullets(["Listens attentively but may not flag confusion early", "Participates more confidently on familiar topics", "Benefits from asking one clarifying question per class", "Takes notes but rarely annotates areas of uncertainty", "Engagement increases when prior reading was done", "Should mark confusing points in notes during class"]), "book", "blue")}
        ${insightPanel("Homework", bullets(["Completes assignments with reasonable consistency", "May rush through without checking understanding", "Stronger on tasks that allow post-completion review", "Needs a 'understanding check' before submitting", "Quality improves when a plan is written first", "Should compare answers against learning objectives"]), "check", "green")}
        ${insightPanel("Exams", bullets(["Performs better on topics thoroughly revised", "May lose marks on unfamiliar question formats", `Stress regulation is relatively strong (${domains[3].percentage}%)`, "Pre-exam planning would reduce last-minute gaps", "Benefits from timed practice before real exams", "Should allocate time per section before starting"]), "target", "purple")}
        ${insightPanel("Assignments", bullets(["Quality improves with reflection time built in", "First drafts may miss key requirements", "Benefits from rubric review before starting", "Should create mini-deadlines for large projects", "Peer review helps identify blind spots", "Breaking projects into daily tasks improves outcomes"]), "calendar", "blue")}
        ${insightPanel("Revision", bullets([`This is a natural strength - Reflection at ${domains[4].percentage}%`, "Uses revision to fix understanding gaps", "Should add active recall, not just re-reading", "Best results when revision follows a written plan", "Error logs during revision accelerate improvement", "Spaced repetition will multiply revision effectiveness"]), "star", "green")}
        ${insightPanel("Group Learning", bullets(["Contributes thoughtful insights after processing", "May stay quiet when unsure during discussions", "Benefits from assigned roles in group work", "Prepares talking points before group sessions", "Works well as the reflective contributor", "Should volunteer to summarize group discussions"]), "users", "purple")}
      </div>
      ${iconCard("Independent Learning", bullets(["Works well alone with clear goals", "Can lose direction without external structure", "Self-discipline during regulation is a strength", "Set 25-minute focused blocks with 2-minute awareness checks", "Keep a visible timer to maintain pacing", "End each solo session with a 5-minute written reflection", "Prepare materials before starting to avoid distraction breaks"]), "zap", "blue", "primary")}
    `, 6, TOTAL),

    // PAGE 8
    pageShell("Section 07", "Academic Performance Impact", "How your learning profile directly influences exam results, homework quality, participation, and confidence.", `
      <div class="layout-stack">
        <p class="detail-text">How your current learning profile shows up in real academic situations. Each area below connects your assessment scores to everyday school experiences with practical examples.</p>
        <div class="two-col layout-row">
          ${card("Exam Results", bullets([
            "Scores likely vary by subject - stronger where revision habits are established",
            "May lose marks on application questions requiring in-the-moment strategy shifts",
            "Example: Knowing formulas but struggling to select the right approach under time pressure",
            "Pre-exam planning and timed practice will close this gap significantly",
            "Your regulation strength helps you stay calm - use that to think more clearly",
          ]), "primary", "chart", "blue")}
          ${card("Answer Writing", bullets([
            "Writes stronger answers when given time to organize thoughts",
            "May produce incomplete arguments when awareness of question requirements is low",
            "Example: Missing key points in essays despite knowing the content",
            "Practice outlining answers in 2 minutes before writing full responses",
            "Review past answer sheets to identify recurring gaps",
          ]), "purple", "book", "purple")}
        </div>
        ${sectionDivider("Classroom & Daily Work")}
        <div class="insight-grid layout-row">
          ${insightPanel("Understanding Concepts", bullets(["Deep understanding develops after multiple exposures", "Initial lessons may feel unclear without follow-up reflection", "Concept maps after class dramatically improve retention", "Asking 'why' and 'how' deepens conceptual grasp", "Connecting concepts across subjects builds mastery"]), "brain", "blue")}
          ${insightPanel("Completing Homework", bullets(["Completion rate is generally good", "Quality varies based on whether planning preceded the work", "Checking work against learning goals improves accuracy", "A pre-homework plan takes only 3 minutes but saves significant time", "Reviewing errors after submission builds awareness"]), "check", "green")}
          ${insightPanel("Class Participation", bullets(["More active when prepared in advance", "Hesitates when uncertain - Awareness training will help", "Prepared questions increase participation quality", "Writing one question before class boosts engagement", "Volunteering to summarize builds confidence"]), "users", "purple")}
          ${insightPanel("Communication Skills", bullets(["Articulate in structured settings", "May struggle to express confusion in real time", "Practice explaining concepts aloud builds confidence", "Recording yourself explaining topics reveals gaps", "Peer teaching is an excellent communication builder"]), "lightbulb", "blue")}
        </div>
        ${sectionDivider("Mindset & Confidence")}
        <div class="layout-row">
          ${card("Confidence", bullets(["Confidence grows after successful revision cycles", "Drops when entering topics without a plan", "Building awareness creates a more stable confidence base", "Small wins from structured study build lasting self-belief", "Tracking weekly progress in a journal makes growth visible", "Confidence is a skill you can build - not a fixed trait"]), "success", "shield", "green")}
        </div>
      </div>
    `, 7, TOTAL),

    // PAGE 9
    pageShell("Section 08", "Learning Strengths Report", "Your top ranked learning advantages - why they matter and how to leverage them for lasting academic success.", `
      <p class="detail-text">Your top three learning strengths ranked by domain score. These are not just scores - they are capabilities you can actively deploy to accelerate learning in every subject.</p>
      ${strengthCard(1, "1. Reflection (" + domains[4].percentage + "%)", bullets([
        "You naturally review what you have learned and extract lessons",
        "Why it matters: Reflection converts experience into lasting knowledge",
        "How to use it: End every study session with a 5-minute written review",
        "Future success: This skill drives continuous improvement in any career",
        "Real-life example: After a test, you identify exactly which topics to revisit",
        "Deploy daily: Keep a reflection journal and write 3 sentences after each study block",
      ], "success"))}
      ${strengthCard(2, "2. Regulation (" + domains[3].percentage + "%)", bullets([
        "You manage frustration and adjust when strategies are not working",
        "Why it matters: Emotional control keeps you learning during difficulty",
        "How to use it: When stuck, switch methods instead of pushing harder blindly",
        "Future success: Resilience is the top predictor of long-term achievement",
        "Real-life example: Switching from reading to practice problems when stuck",
        "Deploy daily: When frustrated, take a 2-minute break then try a different approach",
      ], "success"))}
      ${strengthCard(3, "3. Monitoring (" + domains[2].percentage + "%)", bullets([
        "You can track whether you are making progress during tasks",
        "Why it matters: Progress tracking prevents wasted study time",
        "How to use it: Set mini-goals and check completion every 20 minutes",
        "Future success: Self-monitoring is essential for independent learning",
        "Real-life example: Noticing you have re-read the same page three times",
        "Deploy daily: Use a checklist for each study session and tick off completed sections",
      ], "success"))}
    `, 8, TOTAL),

    // PAGE 10
    pageShell("Section 09", "Learning Challenges Report", "Priority growth areas ranked by impact - with clear solutions and expected improvement timelines.", `
      <p class="detail-text">Your top learning challenges with severity indicators, root causes, and targeted solutions. Addressing these in order will produce the fastest overall improvement. These are not permanent weaknesses - they are specific skills that can be developed with consistent practice over the next 90 days.</p>
      <p class="detail-text">Each challenge below is ranked by severity and includes a clear daily action you can start immediately. Focus on Challenge 1 first - Improving Awareness will automatically reduce the impact of Challenges 2 and 3.</p>
      ${challengeCard("1. Awareness (" + domains[0].percentage + "%)", bullets([
        "Why it occurs: You focus on completing tasks rather than monitoring understanding in real time",
        "Academic impact: Gaps go unnoticed until exam results arrive",
        "Solution: Pause every 15 minutes and ask 'Am I actually understanding this?'",
        "Expected improvement: 15 - 25% score increase in 60 days with daily practice",
        "Daily action: Set a phone alarm every 15 minutes during study as an awareness prompt",
        "Track progress: Rate your understanding 1 - 10 after each study session",
      ], "danger"), 80)}
      ${challengeCard("2. Planning (" + domains[1].percentage + "%)", bullets([
        "Why it occurs: You start studying without defining specific outcomes",
        "Academic impact: Study time is spent without proportional results",
        "Solution: Write a 3-point plan before every session - topic, method, time",
        "Expected improvement: 20% more efficient study within 30 days",
        "Daily action: Use a study plan template - What, How, How long, Success criteria",
        "Track progress: Count how many sessions started with a written plan each week",
      ], "danger"), 60)}
      ${challengeCard("3. Real-Time Strategy Adjustment", bullets([
        "Why it occurs: Awareness and planning gaps delay strategy changes",
        "Academic impact: Repeating ineffective methods across subjects",
        "Solution: Create a personal 'strategy menu' for when you feel stuck",
        "Expected improvement: Noticeable improvement in problem-solving within 45 days",
        "Daily action: When stuck for 5+ minutes, consult your strategy menu and switch methods",
        "Track progress: Log every strategy switch and note which ones worked",
      ], "danger"), 50)}
      ${highlightBox("Challenge Priority Guide", `<p>Start with Awareness (Challenge 1) in Week 1 of your 90-day plan. Once awareness habits are established, introduce Planning improvements (Challenge 2) in Weeks 2 - 4. Strategy adjustment (Challenge 3) becomes natural once the first two challenges are addressed. Expect visible improvement within 30 days if you follow the daily actions consistently.</p>`)}
    `, 9, TOTAL),

    // PAGE 11
    pageShell("Section 10", "Personalized Learning System", "Your custom learning operating system - optimized study, revision, focus, and exam strategies built for your profile.", `
      <p class="detail-text">A custom learning operating system designed for your ${learnerType} profile. Each strategy below is selected based on your domain scores and quadrant position. Think of this as your personal learning software - Each module is configured specifically for how your brain works.</p>
      <p class="detail-text">Your Awareness score (${domains[0].percentage}%) and Regulation score (${domains[3].percentage}%) shaped these recommendations. Strategies that require real-time self-monitoring are paired with your existing regulation strength, so you can adopt them without feeling overwhelmed.</p>
      ${sectionDivider("Study Operating System")}
      <div class="two-col">
        ${iconCard("Best Study Method", bullets(["Active recall with post-session reflection", "25-minute focused blocks with planned breaks", "Teach-back method - explain concepts aloud", "Start each session with a written goal", "Use the Pomodoro technique with 2-minute awareness checks between blocks", "Switch subjects only after completing a planned section"]), "brain", "blue", "primary")}
        ${iconCard("Best Revision Method", bullets(["Spaced repetition over 3-5-7 day intervals", "Error log review before every test", "Practice questions before re-reading notes", "End revision with a one-page summary", "Create flashcards for weak areas identified in reflection", "Simulate exam conditions during final revision pass"]), "book", "purple", "purple")}
        ${iconCard("Best Focus Strategy", bullets(["Phone-free study zone", "Single-subject blocks (no multitasking)", "2-minute awareness check every 20 minutes", "Background instrumental music only", "Prepare all materials before starting to avoid breaks", "Use website blockers during study sessions"]), "target", "green", "success")}
        ${iconCard("Best Learning Environment", bullets(["Quiet, well-lit desk space", "All materials prepared before starting", "Visible clock or timer for pacing", "Minimal visual distractions", "Consistent study location builds habit association", "Keep water and healthy snacks nearby to avoid interruption"]), "compass", "blue", "primary")}
      </div>
      <div class="two-col">
        ${iconCard("Best Note-Taking Method", bullets(["Cornell notes with a dedicated 'questions' column", "Mark uncertain areas with a highlighter during class", "Rewrite notes within 24 hours using reflection", "Add a summary box at the bottom of each page", "Use symbols for key points, questions, and action items", "Review and reorganize notes weekly into topic folders"]), "book", "purple", "purple")}
        ${iconCard("Best Exam Strategy", bullets(["Read all questions first and plan time allocation", "Answer confident questions before difficult ones", "Leave 10 minutes for review and error-checking", "Use deep breathing if anxiety rises mid-exam", "Write brief outlines for essay questions before answering", "Check units and labels on all calculation problems"]), "shield", "green", "success")}
      </div>
      ${sectionDivider("How To Use This System")}
      ${card("Daily Workflow", bullets([
        "Morning: Review today's study plan (2 min)",
        "Before each session: Write 3-point plan - topic, method, time",
        "During session: 2-minute awareness check every 20 minutes",
        "After session: 5-minute reflection - What worked, what didn't",
        "Evening: Update error log with any mistakes or gaps found",
        "Weekly: Review which strategies produced the best results",
      ]), "primary", "zap", "blue")}
      <p class="detail-text">Use this system consistently for 21 days to build automatic habits. After 21 days, the planning and awareness steps will feel natural and require less conscious effort. Your regulation strength (${domains[3].percentage}%) means you are well-equipped to maintain these habits once established.</p>
    `, 10, TOTAL),

    // PAGE 12
    pageShell("Section 11", "High Performance Student Blueprint", "A structured daily, weekly, and monthly framework designed to build consistent high-performance learning habits.", `
      <p class="detail-text">A custom learning framework with daily, weekly, and monthly habits calibrated to your ${learnerType} profile. Follow this blueprint consistently for 90 days to see measurable transformation.</p>
      ${sectionDivider("Learning Framework")}
      <div class="two-col">
        ${iconCard("Daily Learning Habits", bullets([
          "Morning: Review yesterday's reflection notes (5 min)",
          "Study: 2 sessions of 25 min with pre-session plans",
          "Evening: Write 3 things learned + 1 gap identified",
          "Before bed: Preview tomorrow's study topics",
          "Midday: Quick awareness check - Am I on track today?",
          "After homework: 3-sentence reflection on what was challenging",
        ]), "calendar", "blue", "primary")}
        ${iconCard("Weekly Learning Habits", bullets([
          "Sunday: Plan the week's study schedule with specific goals",
          "Wednesday: Mid-week awareness check - What's working?",
          "Friday: Review all error logs and update strategy menu",
          "Weekend: One deep-revision session per weak subject",
          "Monday: Set 3 weekly learning targets based on upcoming tests",
          "Thursday: Review progress against weekly goals and adjust",
        ]), "calendar", "purple", "purple")}
      </div>
      <div class="two-col">
        ${iconCard("Monthly Learning Habits", bullets([
          "Week 1: Reassess goals and adjust study methods",
          "Week 2: Focus intensive on weakest domain (Awareness)",
          "Week 3: Practice exams under timed conditions",
          "Week 4: Full reflection and strategy update for next month",
          "End of month: Compare self-ratings to previous month",
          "End of month: Celebrate progress and set new targets",
        ]), "trend", "blue", "primary")}
        ${iconCard("Success Metrics", bullets([
          "Awareness score improvement (target: 35%+ within 90 days)",
          "Study plan completion rate (target: 80%+ weekly)",
          "Homework quality self-rating (target: 7/10 average)",
          "Pre-exam confidence rating (target: increase by 2 points monthly)",
          "Number of awareness journal entries per week (target: 10+)",
          "Error log entries reviewed before each test (target: 100%)",
        ]), "target", "green", "success")}
      </div>
    `, 11, TOTAL),

    // PAGE 13 - 90 DAY PLAN Phase 1
    pageShell("Section 12", "90-Day Improvement Plan", "Phase 1 - Foundation: Weeks 1 - 4 (Days 1 - 30). Build learning awareness and establish daily planning habits.", `
      <div class="plan-block"><h3>Overall 90-Day Goal</h3><p>Transform from a Reflective Learner into a proactive, self-regulated learner by systematically building awareness, planning, and monitoring skills over 12 structured weeks.</p></div>
      ${phaseHeader("Phase 1", "Days 1 - 30 · Weeks 1 - 4", "Build learning awareness and establish daily planning habits.")}
      ${weekPlanBlock("Week 1", "Establish the planning habit", [
        "Write a 3-point plan before every study session - topic, method, duration",
        "Create a study plan template and use it for every session this week",
        "Track how many sessions started with a plan (target: 100%)",
        "Identify your most productive study time of day through observation",
      ], [
        "Daily 'What don't I understand?' exercise at end of each session",
        "Practice timed question sets twice this week",
        "Set up your dedicated study space with all materials organized",
      ], [
        "Ask yourself each morning: 'What is my study plan today?'",
        "Discuss your plan with a parent or mentor for accountability",
        "Celebrate completing your first full week of planned study sessions",
        "Review at week end: Which plans worked best? Which need adjustment?",
      ])}
      ${weekPlanBlock("Week 2", "Introduce real-time awareness checks", [
        "Add 2-minute awareness checks every 20 minutes during study",
        "Set phone alarms as awareness prompts during all study blocks",
        "Rate understanding 1 - 10 after each study session in your journal",
        "Identify your top 3 distraction triggers and create avoidance strategies",
      ], [
        "Teach one concept to a family member or friend",
        "Create subject-wise error logs for each active subject",
        "Practice the teach-back method for 10 minutes daily",
      ], [
        "When awareness check reveals confusion, write down the specific gap",
        "Share your awareness journal entries with a trusted mentor weekly",
        "Reward yourself for completing all awareness checks for 5 consecutive days",
        "Note which subjects benefit most from awareness checks",
      ])}
      ${weekPlanBlock("Week 3", "Build the awareness journal", [
        "Start an awareness journal - 3 sentences after each study session",
        "Journal format: What I learned / What confused me / What I'll do next",
        "Review all journal entries every Sunday for patterns",
        "Add a weekly awareness score (1 - 10) to track trend over time",
      ], [
        "Daily 'What don't I understand?' exercise before closing any session",
        "Practice timed question sets twice per week",
        "Create flashcards for all topics flagged in your journal",
      ], [
        "Read your journal entries aloud - Hearing them reveals new insights",
        "Ask a mentor to review one journal entry and give feedback",
        "Identify the single most recurring gap across all entries",
        "Set one specific awareness goal for Week 4 based on patterns found",
      ])}
    `, 12, TOTAL),

    // PAGE 14 - Week 4
    pageShell("Section 12 (continued)", "90-Day Improvement Plan", "Phase 1 - Week 4: Analyze patterns and consolidate Month 1 habits.", `
      ${phaseHeader("Phase 1", "Week 4 · Day 22 - 30", "Analyze patterns and consolidate habits from Weeks 1 - 3.")}
      ${weekPlanBlock("Week 4", "Analyze patterns and consolidate habits", [
        "Review all journal entries and identify top 3 recurring patterns",
        "Create a personal 'awareness triggers' list for quick reference",
        "Refine your study plan template based on 3 weeks of experience",
        "Conduct a self-assessment: rate each domain 1 - 10 compared to Week 1",
      ], [
        "Teach one concept to a family member using your improved method",
        "Complete a full practice session using all habits from Weeks 1 - 3",
        "Update error logs with all mistakes found during the month",
      ], [
        "Write a one-page Month 1 reflection: What changed? What improved?",
        "Set Phase 2 goals based on Month 1 learnings",
        "Expected outcome: Awareness improves to ~30%, study feels more purposeful",
        "Share Month 1 progress with parents and celebrate specific wins",
      ])}
    `, 13, TOTAL),

    // PAGE 15 - 90 DAY PLAN Phase 2 Weeks 5-7
    pageShell("Section 12 (continued)", "90-Day Improvement Plan", "Phase 2 - Integration: Weeks 5 - 7 (Days 31 - 52). Strengthen planning and monitoring systems.", `
      ${phaseHeader("Phase 2", "Days 31 - 60 · Weeks 5 - 8", "Strengthen planning and monitoring to create a self-sustaining study system.")}
      ${weekPlanBlock("Week 5", "Build weekly planning systems", [
        "Create a full weekly study schedule every Sunday with time blocks",
        "Assign specific topics and methods to each study block",
        "Include buffer time for unexpected assignments and review",
        "Share weekly schedule with parent/mentor for accountability",
      ], [
        "Weekly strategy review - What worked, what didn't",
        "Build a personal strategy menu with 5 go-to methods when stuck",
        "Practice one strategy menu item each day in a real study session",
      ], [
        "Review your weekly schedule every morning before school",
        "Adjust Wednesday schedule based on Monday-Tuesday progress",
        "Track weekly plan completion rate (target: 80%+)",
        "Identify which time blocks are most productive and protect them",
      ])}
      ${weekPlanBlock("Week 6", "Deepen monitoring during study", [
        "Add progress checkpoints every 15 minutes during all sessions",
        "Use a visible checklist for each session - tick off completed sections",
        "Log time spent vs. planned time to improve future estimates",
        "Create weekly study schedules with built-in monitoring checkpoints",
      ], [
        "Peer study group with assigned roles (explainer, questioner, summarizer)",
        "Timed writing practice for exam-style answers twice this week",
        "Review error logs and categorize mistakes by type",
      ], [
        "After each session, note whether you finished what you planned",
        "If monitoring reveals you're behind, adjust next session's plan immediately",
        "Discuss monitoring insights with mentor - What patterns do they see?",
        "Celebrate completing a full week of monitored study sessions",
      ])}
      ${weekPlanBlock("Week 7", "Implement spaced repetition", [
        "Implement spaced repetition for all active subjects",
        "Review Week 1 material, Week 5 material, and current week material",
        "Create a spaced repetition calendar for the next 30 days",
        "Add active recall drills before every re-reading session",
      ], [
        "Timed writing practice for exam-style answers",
        "Full error log review for all subjects before any test",
        "Practice explaining difficult concepts without looking at notes",
      ], [
        "Track which topics improve most with spaced repetition",
        "Adjust repetition intervals based on your retention rate",
        "Ask mentor to quiz you on topics from 2 weeks ago",
        "Note subjects where spaced repetition has the biggest impact",
      ])}
    `, 14, TOTAL),

    // PAGE 16 - Week 8
    pageShell("Section 12 (continued)", "90-Day Improvement Plan", "Phase 2 - Week 8: Mid-point practice exam and Month 2 review.", `
      ${phaseHeader("Phase 2", "Week 8 · Day 53 - 60", "Mid-point practice exam and review - measure your progress at the halfway mark.")}
      ${weekPlanBlock("Week 8", "Mid-point practice exam and review", [
        "Conduct a full practice exam under timed conditions",
        "Review every answer - correct and incorrect - with reflection",
        "Compare practice exam performance to your Month 1 baseline",
        "Update strategy menu based on practice exam insights",
      ], [
        "Build a personal strategy menu (5 go-to methods when stuck)",
        "Simulate exam conditions including time pressure and no notes",
        "Create a post-exam reflection document for the practice test",
      ], [
        "Analyze practice exam: Where did awareness fail? Where did planning help?",
        "Expected outcome: Planning reaches ~55%, monitoring becomes habitual",
        "Set specific Phase 3 goals based on mid-point assessment results",
        "Share practice exam insights with parents and discuss improvement plan",
      ])}
    `, 15, TOTAL),

    // PAGE 17 - 90 DAY PLAN Phase 3 Weeks 9-11
    pageShell("Section 12 (continued)", "90-Day Improvement Plan", "Phase 3 - Mastery: Weeks 9 - 11 (Days 61 - 83). Integrate all domains into high-performance learning.", `
      ${phaseHeader("Phase 3", "Days 61 - 90 · Weeks 9 - 12", "Integrate all metacognitive domains into a unified high-performance learning identity.")}
      ${weekPlanBlock("Week 9", "Full mock exam cycle", [
        "Complete a full mock exam cycle with detailed reflection analysis",
        "Analyze every question: knowledge gap, strategy gap, or time management gap",
        "Create targeted revision plan based on mock exam results",
        "Practice in-exam strategy adjustments for unfamiliar question types",
      ], [
        "Full exam simulations under real conditions",
        "Present one topic per week to family or study group",
        "Maintain awareness journal with weekly pattern analysis",
      ], [
        "Compare mock results to Week 8 practice exam - measure improvement",
        "Identify remaining weak areas and assign daily micro-practice",
        "Discuss exam strategy with mentor and refine approach",
        "Build confidence by reviewing how far you've come since Day 1",
      ])}
      ${weekPlanBlock("Week 10", "Advanced integration practice", [
        "Combine awareness, planning, monitoring, and regulation in every session",
        "Run full study sessions without external prompts - test independence",
        "Create a self-assessment rubric and score yourself weekly",
        "Practice helping a peer with their study plan - Teaching reinforces learning",
      ], [
        "Full exam simulations under real conditions",
        "Retake practice metacognition self-checks and compare to original scores",
        "Record yourself explaining 3 difficult concepts - review for gaps",
      ], [
        "Note which metacognitive skills now feel automatic vs. effortful",
        "Adjust study system based on 10 weeks of data and experience",
        "Begin transitioning from guided habits to self-directed routines",
        "Celebrate reaching the two-thirds mark of your 90-day journey",
      ])}
      ${weekPlanBlock("Week 11", "Shift toward Self-Regulated Learner behaviors", [
        "Operate study sessions with minimal external structure - test self-regulation",
        "Make independent decisions about what, how, and when to study",
        "Use your strategy menu proactively before problems arise",
        "Demonstrate Self-Regulated Learner behaviors in all academic contexts",
      ], [
        "Present one topic per week to class or family without notes",
        "Complete a full week of entirely self-planned study",
        "Conduct a peer study session where you lead the planning",
      ], [
        "Reflect on the shift from Reflective to Self-Regulated Learner",
        "Ask mentor: 'Do you notice changes in how I approach learning?'",
        "Document 5 specific behavior changes since Day 1",
        "Build confidence for the final week self-assessment",
      ])}
    `, 16, TOTAL),

    // PAGE 18 - Week 12
    pageShell("Section 12 (continued)", "90-Day Improvement Plan", "Phase 3 - Week 12: Final assessment, reflection, and next-quarter planning.", `
      ${phaseHeader("Phase 3", "Week 12 · Day 84 - 90", "Final assessment and next-quarter planning - Complete your 90-day transformation.")}
      ${weekPlanBlock("Week 12", "Final assessment and next-quarter planning", [
        "Complete comprehensive self-assessment across all 5 domains",
        "Compare all domain scores to your original assessment baseline",
        "Set next-quarter learning goals based on 90-day progress",
        "Create your personal Learning Intelligence maintenance plan",
      ], [
        "Retake practice metacognition self-checks monthly",
        "Write a full 90-day journey reflection document",
        "Build your next 90-day plan using the same Phase 1-2-3 structure",
      ], [
        "Expected outcome: Overall score potential 130 - 145/200, Awareness ~40%+",
        "Learner profile shifts toward Self-Regulated Learner quadrant",
        "Share your 90-day journey and results with parents and mentors",
        "Celebrate your transformation - you built a system, not just improved a score",
      ])}
      ${highlightBox("90-Day Expected Outcome", "<p>Overall score potential: 130 - 145/200. Awareness ~40%+. Learner profile shifts toward Self-Regulated Learner quadrant. Study sessions feel purposeful, homework quality is consistent, and exam performance shows measurable improvement. You will understand how your brain learns and exactly what to do to keep improving.</p>")}
    `, 17, TOTAL),

    // PAGE 19 - PARENT
    pageShell("Section 13", "Parent Success Dashboard", "A practical guide for parents to support, motivate, and track their child's learning growth at home.", `
      <p class="detail-text">Parents play a critical role in reinforcing the habits and mindsets identified in this report. This dashboard provides actionable guidance for supporting ${name}'s learning journey at home.</p>
      ${sectionDivider("Parent Action Center")}
      ${iconCard("What Parents Should Do", bullets([
        "Focus on study process questions, not just outcomes",
        "Create a consistent, distraction-free study environment",
        "Help build weekly planning rituals on Sundays",
        "Encourage reflection without criticizing mistakes",
        "Model calm problem-solving during stressful periods",
        "Review the awareness journal weekly and discuss insights",
        "Celebrate effort, planning, and growth - not just grades",
      ]), "users", "blue", "primary")}
      ${card("Weekly Checklist", bullets([
        "☐ Review study plan for the week",
        "☐ Check awareness journal entries",
        "☐ Discuss one learning win and one challenge",
        "☐ Ensure error logs are being maintained",
        "☐ Confirm study space is organized and ready",
        "☐ Ask about the 90-day plan progress",
        "☐ Provide encouragement without adding pressure",
      ], "checklist"), "success", "check", "green")}
      <div class="two-col">
        ${card("Home Learning Support", bullets(["Quiet study hours: 5 - 7 PM recommended", "Keep study materials in one dedicated location", "Limit screen time during study blocks", "Provide healthy snacks and breaks", "Ensure adequate sleep for memory consolidation", "Minimize interruptions during focused study time"]), "primary", "compass", "blue")}
        ${card("Communication Tips", bullets(["Use 'How did you plan your study?' instead of 'Why didn't you score higher?'", "Listen before advising", "Acknowledge effort and strategy, not just grades", "Share your own learning experiences", "Ask open-ended questions about what they learned", "Avoid comparing with siblings or other students"]), "purple", "lightbulb", "purple")}
      </div>
      <div class="two-col">
        ${card("Motivation Strategies", bullets(["Celebrate small wins - completed plans, journal entries", "Use growth language: 'not yet' instead of 'can't'", "Set process-based rewards, not just grade-based", "Remind them of progress using this report as a benchmark", "Create a visual progress tracker on the wall", "Share stories of people who improved through consistent effort"]), "success", "star", "green")}
        ${card("Common Mistakes To Avoid", bullets(["Comparing with other students", "Micromanaging every study minute", "Focusing only on marks, ignoring learning process", "Adding stress before exams with last-minute pressure", "Dismissing reflection journals as unimportant", "Expecting overnight transformation - growth takes 90 days"]), "danger", "alert", "red")}
      </div>
    `, 18, TOTAL),

    // PAGE 20 - GROWTH FORECAST
    pageShell("Section 14", "Growth Forecast", "Projected growth trajectory, milestones, and success indicators for the next 90 days and beyond.", `
      <p class="detail-text">Based on your current profile and the 90-day improvement plan, this forecast projects your growth trajectory. These are achievable targets with consistent practice.</p>
      <div class="chart-panel" style="margin-bottom:10px;">
        <h3>Growth Trajectory</h3>
        ${growthTrajectorySvg(overall.percentage, 72)}
      </div>
      <div class="two-col">
        ${card("Current Position", bullets([
          `Overall: ${overall.score}/${overall.maxScore} (${overall.percentage}%)`,
          `Quadrant: ${quadrant.type} at (${quadrant.knowledge}%, ${quadrant.regulation}%)`,
          `Strongest: ${strongest.name} (${strongest.percentage}%)`,
          `Priority: ${weakest.name} (${weakest.percentage}%)`,
          `Regulation exceeds Awareness by ${quadrant.regulation - quadrant.knowledge} percentage points`,
        ]), "primary", "target", "blue")}
        ${card("Potential Growth", bullets([
          "With consistent practice, overall score can reach 130 - 145/200 within 90 days",
          "Awareness has the highest growth potential (+15 - 25 percentage points)",
          "Planning can realistically reach 55 - 65% within 60 days",
          "Reflection can be leveraged as an accelerator for all other domains",
          "Quadrant shift from Reflective to Self-Regulated is achievable by Day 90",
        ]), "success", "trend", "green")}
      </div>
      <div class="two-col">
        ${card("Expected Improvements", bullets(["Clearer study purpose before every session", "Earlier detection of confusion during learning", "More consistent homework and assignment quality", "Higher exam scores through better preparation", "Stronger confidence based on visible progress", "More independent and self-directed learning"]), "primary", "check", "blue")}
        ${card("Key Milestones", bullets(["Day 30: Awareness habits established", "Day 60: Planning and monitoring integrated", "Day 90: Self-Regulated Learner behaviors emerging", "Month 6: Sustained academic performance gains", "Month 12: Independent high-performance learner identity"]), "purple", "calendar", "purple")}
      </div>
      ${card("Success Indicators", bullets([
        "Increased frequency of self-initiated study planning",
        "More questions asked during class",
        "Improved error log quality and consistency",
        "Higher self-rated confidence before assessments",
        "Positive shift in quadrant position toward Self-Regulated Learner",
        "Awareness journal entries becoming more detailed and insightful",
        "Study sessions consistently starting with a written plan",
      ]), "insight", "star", "green")}
    `, 19, TOTAL),

    // PAGE 21 - ROADMAP
    pageShell("Section 15", "Personal Development Roadmap", "Your long-term learning goals, focus areas, and strategic path toward becoming a Self-Regulated Learner.", `
      <p class="detail-text">This roadmap extends beyond the 90-day plan into your long-term learning development. It connects your current position to your future potential as a high-performance, self-directed learner.</p>
      <div class="two-col">
        ${card("Learning Goals", bullets([
          "Raise Awareness from 20% to 40%+ within 90 days",
          "Build consistent daily planning habits",
          "Leverage reflection strength to accelerate all domains",
          "Move toward Self-Regulated Learner quadrant",
          "Develop independent study system requiring minimal external prompts",
          "Achieve overall metacognition score of 130+ within 6 months",
        ]), "primary", "target", "blue")}
        ${card("Focus Areas", bullets([
          "Priority 1: Real-time learning awareness",
          "Priority 2: Structured study planning",
          "Priority 3: Active monitoring during tasks",
          "Maintain: Reflection and regulation strengths",
          "Develop: In-exam strategy adjustment skills",
          "Build: Cross-subject learning transfer ability",
        ]), "purple", "compass", "purple")}
      </div>
      ${sectionDivider("Growth Timeline")}
      ${timelineRoadmap([
        { label: "Month 1 - Foundation", text: "Build awareness and planning habits. Establish journals and routines." },
        { label: "Month 2 - Integration", text: "Connect planning, monitoring, and regulation into daily practice." },
        { label: "Month 3 - Mastery", text: "Operate as a Self-Regulated Learner with minimal external prompting." },
      ])}
      ${card("Future Success Strategy", bullets([
        "Continue quarterly self-assessment to track growth",
        "Build a personal learning toolkit based on what works",
        "Seek leadership roles that leverage reflection strengths",
        "Develop expertise in self-directed learning for lifelong success",
        "Mentor peers using the same metacognitive frameworks",
        "Revisit this report every 90 days to measure and recalibrate",
      ]), "success", "trend", "green")}
    `, 20, TOTAL),

    // PAGE 22 - FINAL
    pageShell("Section 16", "Final Intelligence Summary", "Your complete learning identity, greatest strengths, opportunities, and personalized next steps.", `
      <div class="card-grid-4">
        ${statCard(learnerType, "Learning Identity", "purple")}
        ${statCard(strongest.name, "Greatest Strength", "success")}
        ${statCard(weakest.name, "Greatest Opportunity", "danger")}
        ${statCard("Self-Regulated", "90-Day Goal", "default")}
      </div>
      <p class="detail-text">This final summary consolidates everything in your Learning Intelligence Report into actionable clarity. You now have a complete picture of how your brain learns and a detailed plan for improvement.</p>
      ${highlightBox("Final Recommendation", `<p>${name}, your ${learnerType} profile reveals a learner with exceptional reflection (${domains[4].percentage}%) and regulation (${domains[3].percentage}%) skills. Your greatest growth opportunity is awareness (${domains[0].percentage}%). By building real-time learning awareness and structured planning over the next 90 days, you can transform from a reflective reactor into a proactive, self-regulated learner.</p>`, true)}
      ${card("Next Steps", bullets([
        "Start tomorrow: Write a 3-point plan before your first study session",
        "This week: Begin your awareness journal",
        "This month: Follow the 90-Day Improvement Plan (Pages 13 - 18)",
        "Share this report with your parents for home support",
        "Revisit this report after 90 days to measure your growth",
        "Track your domain scores monthly and celebrate every improvement",
      ]), "primary", "zap", "blue")}
      <div class="divider"></div>
      <div class="card card-executive" style="text-align:center;margin-top:8px;">
        <p style="font-size:10px;line-height:1.8;"><strong>Professional Closing Statement</strong><br><br>This Learning Intelligence Report is a personalized roadmap - not a label. Your scores reflect where you are today, not where you can be. With the strategies in this report, you have everything needed to understand how your brain learns and exactly what to do to improve.<br><br><em>Prepared for ${name} | ${student.school} | Grade ${student.grade} | ${student.assessmentDate}</em></p>
      </div>
    `, 21, TOTAL),
  ];

  return pages.join("\n");
}
