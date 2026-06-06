import React from "react";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type AcademicCareerPdfReport = {
  resultId: string;
  grade: string;
  completedAt: string;
  attemptNumber: number;
  totalAttempts: number;
  totalQuestions: number;
  strongestDomain: string;
  streamRecommendation: string;
  streamRecommendationDetailed?: string;
  student: {
    fullName: string;
  };
  scores: Array<{
    code: string;
    name: string;
    score: number;
    percentage: number;
    level: string;
    color?: string;
  }>;
  topInterests: Array<{
    code: string;
    name: string;
    careers: string[];
    streams: string[];
    color?: string;
    icon?: string;
  }>;
  /** Data URL or absolute URL for back cover (3.jpg) */
  backCoverImageSrc?: string;
};

type InterestMeta = {
  subjects: string;
  activities: string[];
  careers: string[];
  note: string;
};

type PdfScore = {
  code: string;
  name: string;
  score: number;
  percentage: number;
  level: string;
};

type PdfTopInterest = {
  code: string;
  name: string;
  careers: string[];
  streams: string[];
  note: string;
};

type PdfAnalysis = {
  streamName: string;
  streamConfidence: string;
  strongestDomain: string;
  weakestDomain: string;
  behavioralPatterns: string[];
  learningTendencies: string[];
  suggestedActivities: string[];
  growthAreas: string[];
  parentGuidance: string[];
  counselorNotes: string[];
  actionRoadmap: string[];
  streamCautionAreas: string[];
  streamGuidance: string[];
  streamFutureOpportunities: string[];
  streamLearningCompatibility: string;
  streamSupportingDomains: string[];
  suggestedSubjects: string[];
  careerRecommendations: string[];
};

const INTEREST_MAP: Record<string, InterestMeta> = {
  A: {
    subjects: "Science, Maths, Research, Engineering basics",
    activities: ["Science fair or olympiad participation", "Lab-based experiments at school", "STEM workshop or science club", "Research-based mini project", "Science documentary study and review"],
    careers: ["Scientist", "Engineer", "Researcher", "Data Analyst"],
    note: "Science interest must be matched with consistency in Mathematics and Science subjects. Explore the gap between interest and marks before stream decisions are made.",
  },
  B: {
    subjects: "Maths, Accountancy, Economics, Business Studies",
    activities: ["Budgeting or personal finance simulation", "Stock market observation project", "Mock business or entrepreneurship fair", "Business case study analysis", "CA foundation awareness session"],
    careers: ["CA", "CFA", "Banker", "Financial Analyst", "Consultant"],
    note: "Commerce interest is strongest when the student also shows comfort with numbers and logical thinking. Verify Mathematics performance before committing to Commerce stream.",
  },
  C: {
    subjects: "History, Civics, Political Science, Sociology",
    activities: ["Debate or mock parliament", "Constitution or law case reading", "Civic issue research project", "Model United Nations", "Interview with a civil servant or lawyer"],
    careers: ["Lawyer", "Civil Services", "Policy Analyst", "Researcher"],
    note: "Law and public policy interest requires strong language, reasoning, and analytical ability. Performance in Social Science and English is important for stream-readiness.",
  },
  D: {
    subjects: "Art, Design, Literature, Media, Visual Communication",
    activities: ["Poster or logo design project", "Storytelling or short film task", "Photography or illustration portfolio", "School magazine or content creation", "Video editing and digital media project"],
    careers: ["Designer", "Architect", "Content Creator", "Filmmaker", "UX/UI Designer"],
    note: "Creative interest is best validated through a portfolio of actual work. Assess whether the student has created or attempted any creative output.",
  },
  E: {
    subjects: "Computer Science, Maths, Physics, AI / Robotics",
    activities: ["Coding challenge", "Robotics workshop or coding club", "App idea project or prototype", "AI tools exploration session", "Technology documentary or career interview study"],
    careers: ["Software Developer", "AI Engineer", "Cybersecurity Analyst", "Product Manager", "Data Scientist"],
    note: "Technology interest must be supported by logical thinking and comfort with Mathematics.",
  },
  F: {
    subjects: "Biology, Chemistry, Psychology, Physical Education",
    activities: ["Hospital or clinic observation visit", "Biology model or dissection project", "Nutrition and health awareness project", "Psychology awareness or introductory session", "Sports science observation or experiment"],
    careers: ["Doctor", "Psychologist", "Physiotherapist", "Sports Scientist", "Nutritionist"],
    note: "Medical and health careers are demanding both academically and in long-term commitment. Biology and Chemistry marks should be reviewed carefully.",
  },
  G: {
    subjects: "Languages, Communication Studies, Education, Public Speaking",
    activities: ["Public speaking or debate contest", "Peer teaching or tutoring younger students", "Writing a blog, article, or school newspaper", "School anchoring or event management role", "Interview or presentation skills workshop"],
    careers: ["Teacher", "Journalist", "Trainer", "Communications Manager", "Counselor"],
    note: "Communication interest is a powerful cross-career skill that pairs well with any other interest area.",
  },
  H: {
    subjects: "Business Studies, Economics, Marketing, Leadership Studies",
    activities: ["Business plan or product pitch challenge", "Marketing campaign project", "Leadership role in school event or club", "Startup idea workshop or competition", "Interview with an entrepreneur or business leader"],
    careers: ["Entrepreneur", "Manager", "Marketing Strategist", "Operations Manager", "Business Development Executive"],
    note: "Entrepreneurship interest is meaningful only when combined with initiative and execution ability.",
  },
  I: {
    subjects: "Environmental Science, Geography, Biology, Sustainability Studies",
    activities: ["Sustainability audit of school or home", "Plantation or green campus project", "Waste management or recycling initiative", "Environmental documentary review and presentation", "Field visit to a farm, forest, or nature centre"],
    careers: ["Environmental Scientist", "Urban Planner", "Agri-Tech Professional", "Climate Researcher", "Sustainability Consultant"],
    note: "Environment interest is growing in career relevance. Verify whether the interest is curiosity-based or backed by performance.",
  },
  J: {
    subjects: "Psychology, Social Work, Ethics, Community Studies, Sociology",
    activities: ["NGO visit or community volunteering", "Peer counseling or peer-support activity", "Social issue awareness campaign or project", "Reflective journal on community needs", "Interview with a social worker or NGO leader"],
    careers: ["Social Worker", "Counselor", "NGO Leader", "Community Development Officer", "Human Rights Activist"],
    note: "Social impact interest is values-driven and should be matched with formal training and emotional resilience.",
  },
};

const EXPOSURE_TABLE = [
  { area: "Science & Research", examples: "Science fair, lab visit, STEM workshops, research mini-projects, olympiad" },
  { area: "Commerce & Finance", examples: "Budgeting simulation, mock business setup, stock market observation project" },
  { area: "Law & Public Policy", examples: "Debate, MUN, constitution reading, civic issue project, mock court" },
  { area: "Creative Arts & Design", examples: "Portfolio creation, poster design, video editing, storytelling, illustration" },
  { area: "Technology & Digital", examples: "Coding challenge, app idea project, robotics workshop, AI tools exploration" },
  { area: "Health & Biology", examples: "Hospital visit, nutrition project, biology model, psychology awareness session" },
  { area: "Communication & Education", examples: "Public speaking, peer teaching, blog writing, event anchoring, debate" },
  { area: "Entrepreneurship & Leadership", examples: "Business pitch, product campaign, leadership role, startup idea workshop" },
  { area: "Environment & Sustainability", examples: "Sustainability audit, plantation drive, waste management or recycling project" },
  { area: "Social Impact & Helping", examples: "NGO visit, community volunteering, peer counseling, social issue campaign" },
];

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    paddingTop: 50,
    paddingBottom: 42,
    paddingHorizontal: 40,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  coverPage: {
    backgroundColor: "#0c1e3c",
  },
  coverBar: {
    height: 7,
    backgroundColor: "#1d6eb0",
  },
  coverBody: {
    flex: 1,
    paddingHorizontal: 48,
    paddingTop: 56,
    paddingBottom: 22,
  },
  coverBadge: { fontSize: 9, color: "#7eb8d9", letterSpacing: 2, marginBottom: 22 },
  coverTitle: { fontSize: 26, fontFamily: "Helvetica-Bold", color: "#ffffff", lineHeight: 1.35, marginBottom: 8 },
  coverSubtitle: { fontSize: 11.5, color: "#92c5e0", marginBottom: 34, lineHeight: 1.5 },
  coverDivider: { height: 1, backgroundColor: "#1d4e70", marginBottom: 26 },
  coverFieldLabel: { fontSize: 7.5, color: "#5a95b8", letterSpacing: 1, marginBottom: 3 },
  coverFieldValue: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#ffffff", marginBottom: 16 },
  coverStatement: { fontSize: 9, color: "#7eb8d9", lineHeight: 1.7 },
  coverFooter: { borderTopWidth: 1, borderTopColor: "#1d4e70", paddingTop: 10, marginHorizontal: 48, marginBottom: 24 },
  coverFooterText: { fontSize: 8, color: "#4a7a99", textAlign: "center" },
  runHead: { position: "absolute", top: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: "#d1d9e6", paddingBottom: 6 },
  runHeadText: { fontSize: 7.5, color: "#8899aa" },
  pgFooter: { position: "absolute", bottom: 15, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 0.5, borderTopColor: "#d1d9e6", paddingTop: 5 },
  pgFooterText: { fontSize: 7, color: "#aab3be" },
  sectionWrap: { backgroundColor: "#0c1e3c", paddingHorizontal: 12, paddingVertical: 9, marginBottom: 14, borderRadius: 3 },
  sectionNum: { fontSize: 7.5, color: "#7eb8d9", marginBottom: 2 },
  sectionTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  subHead: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: "#0c1e3c", borderLeftWidth: 3, borderLeftColor: "#1d6eb0", paddingLeft: 8, marginBottom: 8, marginTop: 12 },
  body: { fontSize: 9.5, fontFamily: "Helvetica", color: "#111111", lineHeight: 1.65, marginBottom: 7 },
  bodyBold: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: "#111111", lineHeight: 1.65, marginBottom: 7 },
  bullet: { fontSize: 9.5, fontFamily: "Helvetica", color: "#111111", lineHeight: 1.65, marginBottom: 4, paddingLeft: 14 },
  note: { fontSize: 9, fontFamily: "Helvetica", color: "#333333", lineHeight: 1.6, marginBottom: 6 },
  table: { borderWidth: 1, borderColor: "#c8d4e0", borderRadius: 3, marginBottom: 14, overflow: "hidden" },
  thr: { flexDirection: "row", backgroundColor: "#0c1e3c" },
  tr: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#dce6f0" },
  trAlt: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#dce6f0", backgroundColor: "#f4f7fb" },
  th: { fontSize: 8.4, fontFamily: "Helvetica-Bold", color: "#ffffff", padding: 7 },
  td: { fontSize: 8.8, fontFamily: "Helvetica", color: "#111111", padding: 7, lineHeight: 1.45 },
  tdB: { fontSize: 8.8, fontFamily: "Helvetica-Bold", color: "#111111", padding: 7 },
  infoBox: { borderWidth: 1, borderColor: "#c8d4e0", borderRadius: 4, padding: 12, marginBottom: 12, backgroundColor: "#f4f7fb" },
  warnBox: { borderWidth: 1, borderColor: "#c8a060", borderRadius: 4, padding: 11, marginBottom: 12, backgroundColor: "#fffbf0" },
  warnTitle: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: "#7a4800", marginBottom: 5 },
  warnText: { fontSize: 9, fontFamily: "Helvetica", color: "#5a3000", lineHeight: 1.6 },
  intCard: { borderWidth: 1, borderColor: "#c8d4e0", borderRadius: 4, padding: 12, marginBottom: 14 },
  intCardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 7 },
  intCardRank: { fontSize: 8, color: "#4a7a99", backgroundColor: "#e4eef8", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, fontFamily: "Helvetica-Bold" },
  intCardTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#0c1e3c", marginBottom: 4 },
  intCardMeta: { fontSize: 9, fontFamily: "Helvetica", color: "#333333", marginBottom: 7 },
  scoreBarTrack: { height: 8, backgroundColor: "#e2e8f0", borderRadius: 999, overflow: "hidden", flex: 1 },
  scoreBarFill: { height: 8, borderRadius: 999 },
  scoreRow: { flexDirection: "row", alignItems: "center", marginBottom: 9 },
  scoreLabel: { width: 82, fontSize: 8.6, fontFamily: "Helvetica", color: "#334155", paddingRight: 6 },
  scorePct: { width: 24, fontSize: 8.6, fontFamily: "Helvetica", color: "#334155", textAlign: "right", paddingLeft: 6 },
  chartGrid: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 165, marginTop: 12, marginBottom: 8 },
  chartWrap: { flex: 1, alignItems: "center" },
  chartBar: { width: 18, backgroundColor: "#0c1e3c", borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  chartCode: { marginTop: 7, fontSize: 8, fontFamily: "Helvetica", color: "#1e293b" },
  chartPct: { fontSize: 7, fontFamily: "Helvetica", color: "#64748b" },
  backCoverPage: { padding: 0, fontFamily: "Helvetica" },
  backCoverBg: { width: 595, height: 841, position: "absolute", top: 0, left: 0 },
});

function pdfDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function stripGrade(grade: string) {
  return grade.replace(/^Grade\s*/i, "").trim();
}

function normalizeStream(stream: string) {
  return stream.includes("Commerce") ? "Commerce - Economics, Business Studies, Mathematics" : stream;
}

function sectionHeader(student: string, section: string) {
  return (
    <View style={styles.runHead} fixed>
      <Text style={styles.runHeadText}>Academic & Career Interest Assessment  |  Student Report</Text>
      <Text style={styles.runHeadText}>{student}  -  {section}</Text>
    </View>
  );
}

function footer(student: string) {
  return (
    <View style={styles.pgFooter} fixed>
      <Text style={styles.pgFooterText}>AIM (Academic Interest Mapping)  |  Confidential - For Student & Family Use Only  |  {student}</Text>
      <Text style={styles.pgFooterText} render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
}

function bullet(text: string) {
  return <Text style={styles.bullet}>{"\u2022  "}{text}</Text>;
}

function subHeading(title: string) {
  return <Text style={styles.subHead}>{title}</Text>;
}

function buildAnalysis(report: AcademicCareerPdfReport): PdfAnalysis {
  const top = report.topInterests.slice(0, 3);
  const topNames = top.map((item) => item.name);
  const strongest = top[0]?.name ?? report.strongestDomain;
  const second = top[1]?.name ?? top[0]?.name ?? report.strongestDomain;
  const third = top[2]?.name ?? top[1]?.name ?? report.strongestDomain;
  const streamName = normalizeStream(report.streamRecommendationDetailed || report.streamRecommendation || "Exploratory Stream");

  return {
    streamName,
    streamConfidence: "Strong Fit",
    strongestDomain: report.strongestDomain,
    weakestDomain: report.scores[report.scores.length - 1]?.name ?? report.strongestDomain,
    behavioralPatterns: [
      `Repeated attraction toward ${strongest}-linked learning environments`,
      `Supporting interest in ${second}, indicating a multi-dimensional learning approach`,
      "Engagement with situation-based thinking (evidenced by test completion and response patterns)",
      `Strongest recurring theme: ${report.strongestDomain}`,
    ],
    learningTendencies: [
      `Retains knowledge through examples and scenarios related to ${strongest}`,
      `Absorbs content more easily when activities connect to ${second}`,
      `Responds well to guided exposure in ${third}-linked tasks`,
      "Needs real-world experiences to convert interest into informed subject choices",
    ],
    suggestedActivities: top.flatMap((item) => INTEREST_MAP[item.code]?.activities.slice(0, 2) ?? []).slice(0, 5),
    growthAreas: [
      "Explore beginner-friendly content in Science & Research to broaden perspective",
      "Develop cross-domain awareness through reading and documentaries",
      "Strengthen verbal and written communication skills",
      "Build a consistent study routine with focused daily practice sessions",
    ],
    parentGuidance: [
      `Your child demonstrates primary alignment with ${topNames.slice(0, 3).join(", ")} at this developmental stage.`,
      `${stripGrade(report.grade)} is the optimal phase for broad interest exploration - encourage clubs, workshops, and diverse reading.`,
      "Avoid imposing stream decisions prematurely. Allow interests to evolve through active exposure.",
    ],
    counselorNotes: [
      `Stage recommendation: structured exploration activities; no premature stream commitment required for ${report.grade}.`,
      "Arrange career awareness talks and hands-on exploratory workshops.",
      "Compare interest, academic performance, and study discipline before final stream recommendation.",
    ],
    actionRoadmap: [
      `Now (${stripGrade(report.grade)}): Begin broad exploration in ${strongest}.`,
      "Months 2-4: Try one hands-on activity from the top 2 interest areas.",
      "Next review cycle: Compare academic performance with interest patterns and adjust exploration.",
      `Long-term vision: Build a career path around ${streamName}.`,
    ],
    streamCautionAreas: [
      `${streamName} should not be chosen only because it is popular or socially preferred.`,
      "Interest must be cross-checked with academic marks and long-term study discipline.",
      "A strong interest in one area does not automatically mean the stream is a guaranteed fit.",
    ],
    streamGuidance: [
      `Strong fit with ${streamName}.`,
      `Subject alignment is strongest with ${INTEREST_MAP[top[0]?.code ?? "B"]?.subjects ?? "the reported subject cluster"}.`,
      `Use structured exposure in ${topNames.slice(0, 2).join(" and ")} before making the final choice.`,
    ],
    streamFutureOpportunities: [
      ...(INTEREST_MAP[top[0]?.code ?? "B"]?.careers ?? []),
      ...(INTEREST_MAP[top[1]?.code ?? "F"]?.careers ?? []),
      "MBA / BBA",
      "Entrepreneurship",
      "Professional certification pathway",
    ].filter((item, index, arr) => arr.indexOf(item) === index),
    streamLearningCompatibility: `The student learns best when the work connects to ${topNames.slice(0, 2).join(" and ")}.`,
    streamSupportingDomains: topNames.slice(0, 3),
    careerRecommendations: top
      .flatMap((item) => [...(item.careers ?? []), ...(INTEREST_MAP[item.code]?.careers ?? [])])
      .filter((item, index, arr) => arr.indexOf(item) === index)
      .slice(0, 8),
    suggestedSubjects: [
      INTEREST_MAP[top[0]?.code ?? "B"]?.subjects ?? "Career-linked subjects",
      INTEREST_MAP[top[1]?.code ?? "F"]?.subjects ?? "Supportive subjects",
      INTEREST_MAP[top[2]?.code ?? "J"]?.subjects ?? "Optional exploration subjects",
    ],
  };
}

function scoreBand(score: number) {
  if (score >= 24) return "Very Strong Interest";
  if (score >= 18) return "Strong Interest";
  if (score >= 12) return "Moderate Interest";
  if (score >= 6) return "Low Interest";
  return "Very Low Interest";
}

function sortScores(scores: PdfScore[]) {
  return [...scores].sort((a, b) => b.percentage - a.percentage);
}

type NormalizedInterest = {
  code: string;
  name: string;
  careers: string[];
  streams: string[];
};

function normalizeTop3(report: AcademicCareerPdfReport, scores: PdfScore[]): NormalizedInterest[] {
  const picked: NormalizedInterest[] = [];
  const seen = new Set<string>();
  const defaultStream = normalizeStream(report.streamRecommendationDetailed || report.streamRecommendation || "Exploratory Stream");

  const add = (code: string, name?: string, careers?: string[], streams?: string[]) => {
    const resolvedCode = (code || "B").toUpperCase();
    if (seen.has(resolvedCode)) return;
    const meta = INTEREST_MAP[resolvedCode] ?? INTEREST_MAP["B"];
    seen.add(resolvedCode);
    picked.push({
      code: resolvedCode,
      name: name?.trim() || meta.subjects.split(",")[0] || "Interest Area",
      careers: (careers && careers.length > 0 ? careers : meta.careers).slice(0, 6),
      streams: (streams && streams.length > 0 ? streams : [defaultStream]).slice(0, 3),
    });
  };

  for (const item of report.topInterests ?? []) {
    add(item.code, item.name, item.careers, item.streams);
    if (picked.length >= 3) break;
  }

  for (const score of scores) {
    add(score.code, score.name, INTEREST_MAP[score.code]?.careers);
    if (picked.length >= 3) break;
  }

  for (const fallback of ["B", "F", "J"]) {
    add(fallback, INTEREST_MAP[fallback].subjects.split(",")[0], INTEREST_MAP[fallback].careers);
    if (picked.length >= 3) break;
  }

  return picked.slice(0, 3);
}

function findScore(scores: PdfScore[], code: string): PdfScore {
  return (
    scores.find((item) => item.code === code) ?? {
      code,
      name: INTEREST_MAP[code]?.subjects.split(",")[0] ?? "Interest Area",
      score: 0,
      percentage: 0,
      level: "Very Low",
    }
  );
}

export function AcademicCareerResultPdfDocument({ report }: { report: AcademicCareerPdfReport }) {
  const scores = sortScores(report.scores);
  const top3 = normalizeTop3(report, scores);
  const fallbackInterest: NormalizedInterest = {
    code: "B",
    name: "Commerce & Financial",
    careers: INTEREST_MAP.B.careers,
    streams: [normalizeStream(report.streamRecommendationDetailed || report.streamRecommendation || "Exploratory Stream")],
  };
  const i1 = top3[0] ?? fallbackInterest;
  const i2 = top3[1] ?? i1;
  const i3 = top3[2] ?? i2;
  const s1 = scores[0] ?? findScore(scores, i1.code);
  const s2 = scores[1] ?? findScore(scores, i2.code);
  const s3 = scores[2] ?? findScore(scores, i3.code);
  const sl = scores[scores.length - 1] ?? s3;
  const analysis = buildAnalysis({
    ...report,
    topInterests: [i1, i2, i3].map((item) => ({
      code: item.code,
      name: item.name,
      careers: item.careers,
      streams: item.streams,
      color: "",
      icon: "",
    })),
  });
  const grade = stripGrade(report.grade);
  const gradeStage = grade === "8" ? "Exploration Stage" : grade === "9" ? "Direction-Building Stage" : "Stream-Selection Stage";
  const completedDate = pdfDate(report.completedAt);

  const streamMatrix = [
    { stream: "Science (PCM)", fit: top3.some((item) => ["A", "E"].includes(item.code)) ? "High Suitability" : "Moderate", cond: "Requires strong performance in Mathematics & Physics" },
    { stream: "Science (PCB / Med.)", fit: top3.some((item) => item.code === "F") ? "High Suitability" : "Moderate", cond: "Requires strong Biology & Chemistry performance" },
    { stream: "Commerce", fit: top3.some((item) => ["B", "H"].includes(item.code)) ? "High Suitability" : "Moderate", cond: "Best when comfort with numbers is confirmed" },
    { stream: "Humanities / Arts", fit: top3.some((item) => ["C", "G", "D"].includes(item.code)) ? "High Suitability" : "Moderate", cond: "Best for Social Science, Law, or Communication interest" },
    { stream: "Design / Creative", fit: top3.some((item) => item.code === "D") ? "High Suitability" : "Moderate", cond: "Requires a demonstrated creative portfolio" },
    { stream: "Technology / Voc.", fit: top3.some((item) => item.code === "E") ? "High Suitability" : "Moderate", cond: "Requires logical thinking & Mathematics comfort" },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverBar} />
        <View style={styles.coverBody}>
          <Text style={styles.coverBadge}>ACADEMIC & CAREER INTEREST ASSESSMENT</Text>
          <Text style={styles.coverTitle}>Student Interest{"\n"}Portfolio Report</Text>
          <Text style={styles.coverSubtitle}>A comprehensive analysis of the student's academic interests,{"\n"}career inclinations, and recommended pathways.</Text>
          <View style={styles.coverDivider} />
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <View style={{ width: "50%", marginBottom: 14 }}>
              <Text style={styles.coverFieldLabel}>STUDENT NAME</Text>
              <Text style={styles.coverFieldValue}>{report.student.fullName}</Text>
            </View>
            <View style={{ width: "50%", marginBottom: 14 }}>
              <Text style={styles.coverFieldLabel}>GRADE</Text>
              <Text style={styles.coverFieldValue}>{report.grade} - {gradeStage}</Text>
            </View>
            <View style={{ width: "50%", marginBottom: 14 }}>
              <Text style={styles.coverFieldLabel}>DATE OF ASSESSMENT</Text>
              <Text style={styles.coverFieldValue}>{completedDate}</Text>
            </View>
            <View style={{ width: "50%", marginBottom: 14 }}>
              <Text style={styles.coverFieldLabel}>ASSESSMENT ATTEMPT</Text>
              <Text style={styles.coverFieldValue}>{report.attemptNumber} of {report.totalAttempts}</Text>
            </View>
            <View style={{ width: "100%", marginBottom: 14 }}>
              <Text style={styles.coverFieldLabel}>RECOMMENDED STREAM</Text>
              <Text style={styles.coverFieldValue}>{analysis.streamName}</Text>
            </View>
            <View style={{ width: "100%", marginBottom: 6 }}>
              <Text style={styles.coverFieldLabel}>CONFIDENCE LEVEL</Text>
              <Text style={styles.coverFieldValue}>{analysis.streamConfidence}</Text>
            </View>
          </View>
          <View style={styles.coverDivider} />
          <Text style={styles.coverStatement}>This report provides a structured understanding of the student's current academic interests, subject attraction patterns, and career-linked exploration areas. The result should be used for education planning, stream-readiness discussion, and career exposure planning - not as a final career verdict.</Text>
        </View>
        <View style={styles.coverFooter}>
          <Text style={styles.coverFooterText}>AIM (Academic Interest Mapping)  |  Academic & Career Interest Report  |  Grade {report.grade} - {gradeStage}</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {sectionHeader(report.student.fullName, "Section 1 - Disclaimer")}
        <View style={styles.sectionWrap}><Text style={styles.sectionNum}>Section 1</Text><Text style={styles.sectionTitle}>Important Professional Disclaimer</Text></View>
        <View style={styles.warnBox}><Text style={styles.warnTitle}>Please Read Before Using This Report</Text><Text style={styles.warnText}>This assessment is designed to identify the student's current academic and career interest patterns. It should NOT be treated as a final career decision, psychological diagnosis, aptitude test, intelligence test, or employment selection tool.</Text></View>
        <Text style={styles.body}>The results are based on the student's self-reported choices in situation-based questions. Interests may change with age, exposure, academic performance, family environment, school experience, and personal maturity.</Text>
        <Text style={styles.bodyBold}>Final Guidance Formula</Text>
        <Text style={styles.body}>Final academic or career guidance should always be based on a combination of the following inputs - never on any single assessment alone:</Text>
        {bullet("Test result (this report)")}
        {bullet("Academic performance - subject marks and consistency")}
        {bullet("Student interview - counselor-led conversation")}
        {bullet("Parent observations - home behaviour and stated preferences")}
        {bullet("Counselor judgment - professional educational assessment")}
        {bullet("Aptitude and personality profile, where available")}
        <View style={[styles.infoBox, { marginTop: 12 }]}><Text style={styles.bodyBold}>The AIM Combined Formula:</Text><Text style={[styles.body, { marginBottom: 0 }]}>Final Interest Insight = Test Result + Academic Performance + Student Interview + Parent Observation + Counselor Judgment</Text></View>
        <Text style={styles.bodyBold}>What This Report Is Not</Text>
        {bullet("It is not a prediction of future success in any career.")}
        {bullet("It is not a measure of intelligence, aptitude, or talent.")}
        {bullet("It is not a replacement for a counselor interview or academic review.")}
        {bullet("It is not a permanent label - interests evolve with experience and exposure.")}
        <Text style={styles.body}>This report should be reviewed jointly by the student, parent or guardian, and school counselor before any academic decision is made.</Text>
        {footer(report.student.fullName)}
      </Page>

      <Page size="A4" style={styles.page}>
        {sectionHeader(report.student.fullName, "Section 2 - Purpose")}
        <View style={styles.sectionWrap}><Text style={styles.sectionNum}>Section 2</Text><Text style={styles.sectionTitle}>Purpose of This Assessment</Text></View>
        <Text style={styles.body}>The Academic & Career Interest Assessment is designed to help students, parents, and counselors understand the student's natural academic preferences and connect them with possible subject clusters, future stream choices, and career exposure areas.</Text>
        <Text style={styles.bodyBold}>What This Assessment Identifies</Text>
        {bullet("Which learning areas naturally attract the student at this stage of schooling.")}
        {bullet("Which subject clusters the student may enjoy exploring further.")}
        {bullet("How school subjects connect with future career-linked interest domains.")}
        {bullet("What kinds of activities, projects, competitions, and exposures may suit the student.")}
        {bullet("How parents and counselors can begin a structured academic planning discussion.")}
        <Text style={styles.bodyBold}>Why This Assessment Is Valuable</Text>
        <Text style={styles.body}>Most career assessments test aptitude or personality. This assessment is unique because it connects school-level learning areas directly with future career-linked interest domains - using situation-based questions that reflect real academic and professional choices.</Text>
        <Text style={styles.body}>The test is especially valuable at the Grade 8 to Grade 10 stage because students are at a critical crossroads - exposure decisions taken now directly affect stream selection, subject comfort, and long-term career readiness.</Text>
        <Text style={styles.bodyBold}>Grade-Specific Purpose</Text>
        <View style={styles.table}>
          <View style={styles.thr}><Text style={[styles.th, { width: "18%" }]}>Grade</Text><Text style={[styles.th, { width: "22%" }]}>Stage</Text><Text style={[styles.th, { width: "60%" }]}>Purpose</Text></View>
          {[["Grade 8", "Exploration Stage", "Identify curiosity, comfort, activity interest, and exposure needs. No stream decisions should be made at this stage."], ["Grade 9", "Direction-Building Stage", "Identify stronger patterns and begin stream-readiness discussions. Narrowing interest areas, not finalising them."], ["Grade 10", "Stream-Selection Stage", "Connect interest with Grade 11 subject choices. Use as one major input - never as the sole basis for final decisions."]].map((row, i) => <View key={row[0]} style={i % 2 === 0 ? styles.tr : styles.trAlt}><Text style={[styles.tdB, { width: "18%" }]}>{row[0]}</Text><Text style={[styles.td, { width: "22%" }]}>{row[1]}</Text><Text style={[styles.td, { width: "60%" }]}>{row[2]}</Text></View>)}
        </View>
        <Text style={styles.body}>This student is in {report.grade} ({gradeStage}). All recommendations in this report are calibrated for this stage.</Text>
        {footer(report.student.fullName)}
      </Page>

      <Page size="A4" style={styles.page}>
        {sectionHeader(report.student.fullName, "Section 3 - Interest Areas")}
        <View style={styles.sectionWrap}><Text style={styles.sectionNum}>Section 3</Text><Text style={styles.sectionTitle}>Interest Areas Covered in This Report</Text></View>
        <Text style={styles.body}>The assessment uses 10 interest categories. Each category maps directly to real academic subjects and career-linked exposure areas. Understanding these categories is essential for interpreting the student's score correctly.</Text>
        <View style={styles.table}>
          <View style={styles.thr}><Text style={[styles.th, { width: "34%" }]}>Interest Area</Text><Text style={[styles.th, { width: "33%" }]}>Academic Subjects</Text><Text style={[styles.th, { width: "33%" }]}>Career Indicatives</Text></View>
          {Object.entries(INTEREST_MAP).map(([code, meta], i) => <View key={code} style={i % 2 === 0 ? styles.tr : styles.trAlt}><Text style={[styles.tdB, { width: "34%" }]}>{meta.subjects.split(",")[0]}</Text><Text style={[styles.td, { width: "33%" }]}>{meta.subjects}</Text><Text style={[styles.td, { width: "33%" }]}>{meta.careers.join(", ")}</Text></View>)}
        </View>
        <Text style={styles.body}>These 10 interest areas are referenced consistently throughout this report. Every recommendation, graph, and table uses these areas as the foundation of the analysis.</Text>
        {footer(report.student.fullName)}
      </Page>

      <Page size="A4" style={styles.page}>
        {sectionHeader(report.student.fullName, "Section 4 - Score Summary")}
        <View style={styles.sectionWrap}><Text style={styles.sectionNum}>Section 4</Text><Text style={styles.sectionTitle}>Interest Score Summary</Text></View>
        <Text style={styles.body}>The table below shows {report.student.fullName}'s score for each of the 10 interest domains, ranked highest to lowest. The percentage and interest band indicate the strength of attraction in each area at the time of this assessment.</Text>
        <View style={styles.table}>
          <View style={styles.thr}><Text style={[styles.th, { width: "8%" }]}>Rank</Text><Text style={[styles.th, { width: "38%" }]}>Interest Area</Text><Text style={[styles.th, { width: "18%" }]}>Score</Text><Text style={[styles.th, { width: "18%" }]}>Percentage</Text><Text style={[styles.th, { width: "18%" }]}>Band</Text></View>
          {scores.map((score, index) => <View key={score.code} style={index % 2 === 0 ? styles.tr : styles.trAlt}><Text style={[styles.tdB, { width: "8%" }]}>{index + 1}</Text><Text style={[styles.td, { width: "38%" }]}>{score.name}</Text><Text style={[styles.td, { width: "18%", textAlign: "center" }]}>{score.score}</Text><Text style={[styles.td, { width: "18%", textAlign: "center" }]}>{score.percentage}%</Text><Text style={[styles.td, { width: "18%" }]}>{score.level || scoreBand(score.score)}</Text></View>)}
        </View>
        {subHeading("Top 3 Interest Areas at a Glance")}
        <View style={{ flexDirection: "row" }}>
          {top3.map((item, index) => {
            const sc = findScore(scores, item.code);
            return (
              <View key={item.code} style={[styles.infoBox, { flex: 1, marginRight: index < 2 ? 8 : 0, marginBottom: 0 }]}>
                <Text style={[styles.bodyBold, { fontSize: 8, color: "#4a7a99" }]}>
                  #{index + 1} - {index === 0 ? "Primary" : index === 1 ? "Supporting" : "Secondary"}
                </Text>
                <Text style={[styles.bodyBold, { marginTop: 3, marginBottom: 2 }]}>{item.name}</Text>
                <Text style={styles.note}>{sc.percentage}%  |  {sc.level}</Text>
              </View>
            );
          })}
        </View>
        <View style={[styles.infoBox, { marginTop: 10 }]}>
          <Text style={styles.bodyBold}>
            Profile Type:{" "}
            {s1.percentage - s3.percentage > 40
              ? "Focused Profile - one or two areas clearly dominant"
              : s3.percentage >= 50
              ? "Multi-Interest Profile - several strong areas present"
              : "Exploratory Profile - interest spread across many areas"}
          </Text>
          <Text style={[styles.body, { marginBottom: 0, marginTop: 4 }]}>
            {s1.percentage - s3.percentage > 40
              ? "The student shows clear concentration of interest in one or two domains. Counseling should focus on deepening exploration in these specific areas while maintaining breadth awareness."
              : s3.percentage >= 50
              ? "The student shows strong interest across multiple domains. Counseling should identify which combination aligns best with academic performance and long-term goals."
              : "The student's interest is spread across many areas without a strong concentration. Further structured exposure is recommended before making any stream or career direction decisions."}
          </Text>
        </View>
        {footer(report.student.fullName)}
      </Page>

      <Page size="A4" style={styles.page}>
        {sectionHeader(report.student.fullName, "Section 5 - Visual Score Graph")}
        <View style={styles.sectionWrap}><Text style={styles.sectionNum}>Section 5</Text><Text style={styles.sectionTitle}>Visual Interest Profile Graph</Text></View>
        <Text style={styles.body}>The bar graph below provides a visual representation of {report.student.fullName}'s interest strength across all 10 domains. The horizontal axis shows each interest area and the vertical axis shows the percentage score. Darker bars represent stronger interest.</Text>
        <View style={{ marginTop: 10 }}>
          {scores.map((score) => (
            <View key={score.code} style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>{score.name}</Text>
              <View style={styles.scoreBarTrack}><View style={[styles.scoreBarFill, { width: `${score.percentage * 5.4}%`, backgroundColor: score.percentage >= 15 ? "#0c1e3c" : score.percentage >= 10 ? "#1d6eb0" : "#7eb8d9" }]} /></View>
              <Text style={styles.scorePct}>{score.percentage}%</Text>
            </View>
          ))}
        </View>
        <Text style={styles.bodyBold}>How to Read This Graph</Text>
        {bullet("Bars at 75% and above = Very Strong or Strong interest. These should be prioritised for academic planning and career exploration.")}
        {bullet("Bars between 40%-74% = Moderate interest. Explore through activities before committing.")}
        {bullet("Bars below 40% = Low or Very Low current interest. Do not ignore, but do not force.")}
        {bullet("Two or more bars at similar height = Multi-interest profile requiring careful counseling.")}
        <View style={[styles.infoBox, { marginTop: 8 }]}>
          <Text style={styles.bodyBold}>Profile Summary for {report.student.fullName}</Text>
          <Text style={[styles.body, { marginBottom: 0, marginTop: 4 }]}>
            {"Strongest:  "}{s1.name} ({s1.percentage}% - {s1.level}){"\n"}
            {"Second:     "}{s2.name} ({s2.percentage}% - {s2.level}){"\n"}
            {"Third:      "}{s3.name} ({s3.percentage}% - {s3.level}){"\n"}
            {"Lowest:     "}{sl.name} ({sl.percentage}%)
          </Text>
        </View>
        {footer(report.student.fullName)}
      </Page>

      <Page size="A4" style={styles.page}>
        {sectionHeader(report.student.fullName, "Section 6 - Top 3 Interest Areas")}
        <View style={styles.sectionWrap}><Text style={styles.sectionNum}>Section 6</Text><Text style={styles.sectionTitle}>Top 3 Interest Areas - Overview</Text></View>
        <Text style={styles.body}>The following three interest areas represent {report.student.fullName}'s strongest current academic and career interest patterns. These should form the core of career exploration discussions and subject planning conversations.</Text>
        <View style={styles.table}>
          <View style={styles.thr}>
            <Text style={[styles.th, { width: "8%", textAlign: "center" }]}>Rank</Text>
            <Text style={[styles.th, { width: "44%" }]}>Interest Area</Text>
            <Text style={[styles.th, { width: "14%", textAlign: "center" }]}>Score %</Text>
            <Text style={[styles.th, { width: "18%" }]}>Band</Text>
            <Text style={[styles.th, { width: "16%" }]}>Profile Role</Text>
          </View>
          {top3.map((item, index) => {
            const score = findScore(scores, item.code);
            return (
              <View key={item.code} style={index % 2 === 0 ? styles.tr : styles.trAlt}>
                <Text style={[styles.tdB, { width: "8%", textAlign: "center" }]}>#{index + 1}</Text>
                <Text style={[styles.td, { width: "44%" }]}>{item.name}</Text>
                <Text style={[styles.tdB, { width: "14%", textAlign: "center" }]}>{score.percentage}%</Text>
                <Text style={[styles.td, { width: "18%" }]}>{score.level}</Text>
                <Text style={[styles.td, { width: "16%" }]}>{index === 0 ? "Primary" : index === 1 ? "Supporting" : "Secondary"}</Text>
              </View>
            );
          })}
        </View>
        {subHeading("Overall Profile Statement")}
        <Text style={styles.body}>
          {report.student.fullName}'s current interest profile shows strongest attraction toward {i1.name}, {i2.name}, and {i3.name}. This suggests the student may enjoy learning experiences that involve {i1.careers.slice(0, 2).join(" and ")} at the primary level, supported by {i2.careers.slice(0, 2).join(" and ")}-related exploration.
        </Text>
        <Text style={styles.body}>
          This does not mean the student must choose only these career areas. It means these areas should be explored seriously through subjects, projects, competitions, reading, workshops, and counseling discussions. Detailed analysis of each of the top three areas follows in Sections 8, 9, and 10.
        </Text>
        {footer(report.student.fullName)}
      </Page>

      {analysis.careerRecommendations.length > 0 && (
        <Page size="A4" style={styles.page}>
          {sectionHeader(report.student.fullName, "Section 6 - Top 3 Interest Areas (continued)")}
          <View style={styles.sectionWrap}><Text style={styles.sectionNum}>Section 6</Text><Text style={styles.sectionTitle}>Top 3 Interest Areas - Overview (continued)</Text></View>
          {subHeading("Career Areas Recommended for Exploration")}
          {analysis.careerRecommendations.slice(0, 8).map((career, idx) => (
            <Text key={`career-rec-${idx}`} style={styles.bullet}>{"\u2022  "}{career}</Text>
          ))}
          {footer(report.student.fullName)}
        </Page>
      )}

      {top3.map((item, index) => {
        const meta = INTEREST_MAP[item.code] ?? INTEREST_MAP["B"];
        const score = findScore(scores, item.code);
        const careerExposure = [...(item.careers ?? []), ...meta.careers]
          .filter((value, idx, arr) => arr.indexOf(value) === idx)
          .slice(0, 6);
        const rankLabel = index === 0 ? "Primary Interest" : index === 1 ? "Supporting Interest" : "Secondary Interest";
        return (
          <Page key={item.code} size="A4" style={styles.page}>
            {sectionHeader(report.student.fullName, `Section ${7 + index} - Interest Area ${index + 1}`)}
            <View style={styles.sectionWrap}><Text style={styles.sectionNum}>{`Section ${7 + index}`}</Text><Text style={styles.sectionTitle}>{`Interest Area ${index + 1}: ${item.name}`}</Text></View>
            <View style={styles.intCard}>
              <View style={styles.intCardRow}>
                <Text style={styles.intCardRank}>#{index + 1} - {rankLabel}</Text>
                <Text style={[styles.tdB, { fontSize: 10 }]}>{score.percentage}%  |  {score.level}</Text>
              </View>
              <Text style={styles.intCardTitle}>{item.name}</Text>
              <Text style={styles.intCardMeta}>Score: {score.score}  |  Percentage: {score.percentage}%  |  Band: {score.level}</Text>
            </View>
            {subHeading("What This Interest Suggests")}
            <Text style={styles.body}>
              {report.student.fullName} shows a repeated attraction toward tasks and scenarios connected with {item.name}. A score at the {score.level} level is not casual curiosity - it reflects a genuine current preference that should be explored through structured activities and direct subject engagement.
            </Text>
            {subHeading("Academic Subjects Connected to This Area")}
            <Text style={styles.body}>{meta.subjects}</Text>
            {(item.streams?.length ?? 0) > 0 && (
              <Text style={styles.body}>Stream alignment: {item.streams.join("  |  ")}</Text>
            )}
            {subHeading("Suitable Exploration Activities")}
            {meta.activities.map((activity, idx) => (
              <Text key={`activity-${item.code}-${idx}`} style={styles.bullet}>{"\u2022  "}{activity}</Text>
            ))}
            {subHeading("Possible Career Exposure Areas")}
            {careerExposure.map((career, idx) => (
              <Text key={`career-${item.code}-${idx}`} style={styles.bullet}>{"\u2022  "}{career}</Text>
            ))}
            <View style={[styles.warnBox, { marginTop: 10 }]}>
              <Text style={styles.warnTitle}>{`Counselor Note - ${item.name}`}</Text>
              <Text style={styles.warnText}>{meta.note}</Text>
            </View>
            {footer(report.student.fullName)}
          </Page>
        );
      })}

      <Page size="A4" style={styles.page}>
        {sectionHeader(report.student.fullName, "Section 10 - Academic Alignment")}
        <View style={styles.sectionWrap}><Text style={styles.sectionNum}>Section 10</Text><Text style={styles.sectionTitle}>Academic Alignment</Text></View>
        <Text style={styles.body}>This section compares the student's interest profile with academic subject performance. A strong interest that is not supported by consistent academic performance in related subjects must be investigated before any stream decision is made.</Text>
        <View style={styles.warnBox}><Text style={styles.warnTitle}>Key Principle</Text><Text style={styles.warnText}>Interest without effort, consistency, and subject comfort should be treated as curiosity - not readiness. A student who loves Technology but avoids Mathematics cannot simply become a software engineer through interest alone.</Text></View>
        {subHeading("Subject Performance Table - To Be Completed in Counseling Session")}
        <View style={styles.table}>
          <View style={styles.thr}><Text style={[styles.th, { width: "26%" }]}>Subject</Text><Text style={[styles.th, { width: "20%", textAlign: "center" }]}>Current Marks</Text><Text style={[styles.th, { width: "18%", textAlign: "center" }]}>Performance</Text><Text style={[styles.th, { width: "18%", textAlign: "center" }]}>Interest Link</Text><Text style={[styles.th, { width: "18%", textAlign: "center" }]}>Alignment</Text></View>
          {["Mathematics", "Science", "Social Science", "English / Language", "Computer Science", "Art / Creative", "Physical Education"].map((subject, i) => <View key={subject} style={i % 2 === 0 ? styles.tr : styles.trAlt}><Text style={[styles.tdB, { width: "26%" }]}>{subject}</Text><Text style={[styles.td, { width: "20%", textAlign: "center" }]}>{"-"}</Text><Text style={[styles.td, { width: "18%", textAlign: "center" }]}>{"-"}</Text><Text style={[styles.td, { width: "18%", textAlign: "center" }]}>{"-"}</Text><Text style={[styles.td, { width: "18%", textAlign: "center" }]}>{"-"}</Text></View>)}
        </View>
        {subHeading("Academic Alignment Interpretation")}
        <Text style={styles.body}>{report.student.fullName}'s interest profile shows attraction toward {i1.name} and {i2.name}. Before recommending the {analysis.streamName} stream, the counselor should verify that the student's performance in related academic subjects supports this direction.</Text>
        {analysis.behavioralPatterns.length > 0 && (
          <View>
            {subHeading("Observed Behavioural Patterns")}
            {analysis.behavioralPatterns.slice(0, 4).map((item, i) => <Text key={i} style={styles.bullet}>{"\u2022  "}{item}</Text>)}
          </View>
        )}
        {analysis.learningTendencies.length > 0 && (
          <View>
            {subHeading("Learning Tendencies")}
            {analysis.learningTendencies.slice(0, 4).map((item, i) => <Text key={i} style={styles.bullet}>{"\u2022  "}{item}</Text>)}
          </View>
        )}
        {footer(report.student.fullName)}
      </Page>

      <Page size="A4" style={styles.page}>
        {sectionHeader(report.student.fullName, "Section 11 - Stream Readiness")}
        <View style={styles.sectionWrap}><Text style={styles.sectionNum}>Section 11</Text><Text style={styles.sectionTitle}>Stream Readiness Analysis</Text></View>
        <View style={styles.infoBox}><Text style={styles.bodyBold}>Recommended Stream: {analysis.streamName}  |  Confidence: {analysis.streamConfidence}</Text><Text style={[styles.body, { marginTop: 3, marginBottom: 0 }]}>Grade: {report.grade}  |  Stage: {gradeStage}</Text></View>
        {grade === "8" && <View><Text style={styles.bodyBold}>Grade 8 - Exploration Focus (No Stream Decision Yet)</Text><Text style={styles.body}>For Grade 8, no fixed stream or career recommendation should be made. At this stage the student should be encouraged to explore multiple learning areas through clubs, competitions, reading, hobby projects, field visits, and guided conversations.</Text><View style={styles.warnBox}><Text style={styles.warnTitle}>What NOT to Say to a Grade 8 Student</Text><Text style={styles.warnText}>"You are made for Science." or "You should avoid Commerce." These are premature judgments that can permanently limit a student's self-concept at a formative stage.</Text></View><Text style={styles.body}>Instead, say: "{report.student.fullName} currently shows stronger interest in {i1.name}-linked activities. More exposure through structured activities is recommended before any direction is confirmed."</Text></View>}
        {grade === "9" && <View><Text style={styles.bodyBold}>Grade 9 - Direction Building (Narrowing, Not Finalising)</Text><Text style={styles.body}>For Grade 9, stream-readiness discussions should begin but no final stream commitment should be made. {report.student.fullName} should be exposed to subject workshops, career videos, mini-projects, and professional interviews before taking any final decision.</Text></View>}
        {grade === "10" && <View><Text style={styles.bodyBold}>Grade 10 - Stream Selection (With Conditions)</Text><Text style={styles.body}>For Grade 10, this report can include stream and subject combination suggestions, but with conditions. The final decision must combine interest, aptitude, marks, personality, career goals, and family context - not interest score alone.</Text></View>}
        <Text style={styles.bodyBold}>Stream Suitability Matrix</Text>
        <View style={styles.table}>
          <View style={styles.thr}><Text style={[styles.th, { width: "30%" }]}>Stream Option</Text><Text style={[styles.th, { width: "28%" }]}>Suitability</Text><Text style={[styles.th, { width: "42%" }]}>Key Condition</Text></View>
          {streamMatrix.map((row, i) => <View key={row.stream} style={i % 2 === 0 ? styles.tr : styles.trAlt}><Text style={[styles.tdB, { width: "30%" }]}>{row.stream}</Text><Text style={[styles.td, { width: "28%" }]}>{row.fit}</Text><Text style={[styles.td, { width: "42%" }]}>{row.cond}</Text></View>)}
        </View>
        <Text style={styles.bodyBold}>Stream Guidance</Text>
        {analysis.streamGuidance.map((line, i) => <Text key={i} style={styles.bullet}>{"\u2022  "}{line}</Text>)}
        {footer(report.student.fullName)}
      </Page>

      <Page size="A4" style={styles.page}>
        {sectionHeader(report.student.fullName, "Section 11 - Stream Readiness (continued)")}
        <View style={styles.sectionWrap}><Text style={styles.sectionNum}>Section 11</Text><Text style={styles.sectionTitle}>Stream Readiness Analysis (continued)</Text></View>
        <View style={styles.warnBox}><Text style={styles.warnTitle}>Caution Areas for This Student</Text>{analysis.streamCautionAreas.map((line, i) => <Text key={i} style={[styles.warnText, { marginBottom: 3 }]}>{"\u2022  "}{line}</Text>)}</View>
        {footer(report.student.fullName)}
      </Page>

      <Page size="A4" style={styles.page}>
        {sectionHeader(report.student.fullName, "Section 12 - Career Exposure")}
        <View style={styles.sectionWrap}><Text style={styles.sectionNum}>Section 12</Text><Text style={styles.sectionTitle}>Career Exposure Suggestions</Text></View>
        <Text style={styles.body}>Based on {report.student.fullName}'s top interest areas, the following career clusters and exposure activities are recommended. These are structured exploration steps - not career decisions.</Text>
        <Text style={styles.bodyBold}>Recommended Career Clusters (Personalised)</Text>
        <View style={styles.table}>
          <View style={styles.thr}><Text style={[styles.th, { width: "8%", textAlign: "center" }]}>#</Text><Text style={[styles.th, { width: "30%" }]}>Career Cluster</Text><Text style={[styles.th, { width: "22%" }]}>Interest Basis</Text><Text style={[styles.th, { width: "40%" }]}>Suggested First Step</Text></View>
          {top3.map((item, i) => <View key={item.code} style={i % 2 === 0 ? styles.tr : styles.trAlt}><Text style={[styles.td, { width: "8%", textAlign: "center" }]}>{i + 1}</Text><Text style={[styles.tdB, { width: "30%" }]}>{item.name}</Text><Text style={[styles.td, { width: "22%" }]}>{i === 0 ? "Primary" : i === 1 ? "Supporting" : "Secondary"}</Text><Text style={[styles.td, { width: "40%" }]}>{INTEREST_MAP[item.code]?.activities[0] ?? "Structured exposure activity"}</Text></View>)}
        </View>
        <Text style={styles.bodyBold}>Full Career Exposure Activity Guide - All 10 Areas</Text>
        <View style={styles.table}>
          <View style={styles.thr}><Text style={[styles.th, { width: "35%" }]}>Interest Area</Text><Text style={[styles.th, { width: "65%" }]}>Recommended Activities</Text></View>
          {EXPOSURE_TABLE.map((row, i) => <View key={row.area} style={i % 2 === 0 ? styles.tr : styles.trAlt}><Text style={[styles.tdB, { width: "35%" }]}>{row.area}</Text><Text style={[styles.td, { width: "65%" }]}>{row.examples}</Text></View>)}
        </View>
        <Text style={styles.bodyBold}>Personalised Activity Suggestions</Text>
        {analysis.suggestedActivities.map((line, i) => <Text key={i} style={styles.bullet}>{"\u2022  "}{line}</Text>)}
        {footer(report.student.fullName)}
      </Page>

      <Page size="A4" style={styles.page}>
        {sectionHeader(report.student.fullName, "Section 13 - Strengths & Watch Areas")}
        <View style={styles.sectionWrap}><Text style={styles.sectionNum}>Section 13</Text><Text style={styles.sectionTitle}>Strengths, Watch Areas & Development Needs</Text></View>
        <Text style={styles.bodyBold}>Possible Strengths Based on Profile</Text>
        <Text style={styles.body}>Based on the score pattern and top interest areas, {report.student.fullName} may demonstrate the following strengths:</Text>
        {analysis.behavioralPatterns.slice(0, 3).map((line, i) => <Text key={i} style={styles.bullet}>{"\u2022  "}{line}</Text>)}
        <Text style={styles.bodyBold}>Watch Areas - Honest Observations</Text>
        {bullet("Interest is high, but academic marks in related subjects are not yet supporting it.")}
        {bullet("Student may be influenced by friends, social media, or trend-based career glamour.")}
        {bullet("Student has scattered interests and needs more structured real-world exposure before deciding.")}
        {bullet("Student likes the career outcome but may not understand the full academic demands it requires.")}
        {bullet("Parent expectation and student interest may not be fully aligned.")}
        <Text style={styles.bodyBold}>Growth Areas Identified</Text>
        {analysis.growthAreas.map((line, i) => <Text key={i} style={styles.bullet}>{"\u2022  "}{line}</Text>)}
        <Text style={styles.bodyBold}>Development Needs</Text>
        <View style={styles.table}>
          <View style={styles.thr}><Text style={[styles.th, { width: "32%" }]}>Development Area</Text><Text style={[styles.th, { width: "68%" }]}>Recommended Action</Text></View>
          {[["Subject Clarity", "Attend subject orientation sessions or talk to teachers about career applications."], ["Career Clarity", "Interview 2-3 professionals and watch career pathway videos in areas of interest."], ["Academic Readiness", "Strengthen weak subjects connected to the preferred stream through focused practice."], ["Self-Awareness", "Reflect on which tasks feel naturally engaging and which feel consistently draining."], ["Decision Maturity", "Compare interest, ability, effort, and long-term commitment before deciding."]].map((row, i) => <View key={row[0]} style={i % 2 === 0 ? styles.tr : styles.trAlt}><Text style={[styles.tdB, { width: "32%" }]}>{row[0]}</Text><Text style={[styles.td, { width: "68%" }]}>{row[1]}</Text></View>)}
        </View>
        {footer(report.student.fullName)}
      </Page>

      <Page size="A4" style={styles.page}>
        {sectionHeader(report.student.fullName, "Section 14 - Parent Discussion")}
        <View style={styles.sectionWrap}><Text style={styles.sectionNum}>Section 14</Text><Text style={styles.sectionTitle}>Parent Discussion Notes</Text></View>
        <Text style={styles.body}>This section is designed for parents and guardians to reflect on their child's behaviour, preferences, and patterns at home. These observations are a critical input for the final counseling conversation.</Text>
        <Text style={styles.bodyBold}>Parent Observation Questions - Please Complete Before the Counseling Session</Text>
        {[
          "What activities does your child naturally choose when left free at home?",
          "Which school subjects does your child study without being told or forced?",
          "Which subject consistently creates resistance, stress, or avoidance behaviour?",
          "Does your child show consistent effort in the areas where they claim interest?",
          "Is your child choosing a career idea because of genuine curiosity - or due to external pressure from friends, media, or family expectations?",
          "Are your expectations as a parent aligned with what you actually observe in your child's daily behaviour and choices?",
          "What career or profession has your child repeatedly mentioned or shown curiosity about over the past year?",
          "What exposure experiences has your child already had (workshops, visits, activities, competitions)?",
          "Are there academic or financial constraints that should factor into stream and career planning?",
          "What kind of support does your child need most in the next 6 to 12 months?",
        ].map((q, i) => <View key={q} style={{ marginBottom: 11 }}><Text style={[styles.bodyBold, { marginBottom: 3 }]}>{i + 1}.  {q}</Text><View style={{ borderBottomWidth: 1, borderBottomColor: "#c8d4e0", marginBottom: 4 }} /><View style={{ borderBottomWidth: 1, borderBottomColor: "#c8d4e0" }} /></View>)}
        <View style={[styles.infoBox, { marginTop: 8 }]}><Text style={styles.bodyBold}>Personalised Guidance for Parents of {report.student.fullName}</Text>{analysis.parentGuidance.map((line, i) => <Text key={i} style={[styles.body, { marginBottom: 3 }]}>{"\u2022  "}{line}</Text>)}</View>
        {footer(report.student.fullName)}
      </Page>

      <Page size="A4" style={styles.page}>
        {sectionHeader(report.student.fullName, "Section 15 - Counselor Interpretation")}
        <View style={styles.sectionWrap}><Text style={styles.sectionNum}>Section 15</Text><Text style={styles.sectionTitle}>Counselor Interpretation</Text></View>
        <Text style={styles.bodyBold}>Counselor Summary</Text>
        <Text style={styles.body}>Based on the assessment result, {report.student.fullName} currently shows stronger interest in {i1.name}, {i2.name}, and {i3.name}. These areas indicate possible attraction toward {(i1.careers ?? []).slice(0, 2).join(" and ")}-related career exposure and subject engagement.</Text>
        <Text style={styles.body}>The final recommendation should always consider academic performance, learning behaviour, student confidence, parent observations, and long-term subject demands before any stream or career direction is confirmed.</Text>
        <Text style={styles.bodyBold}>Assessment-Generated Counselor Notes</Text>
        {analysis.counselorNotes.map((line, i) => <Text key={i} style={styles.bullet}>{"\u2022  "}{line}</Text>)}
        <Text style={styles.bodyBold}>Counselor Risk Assessment Checklist</Text>
        <Text style={styles.note}>Review and mark all applicable risk flags before the parent meeting.</Text>
        <View style={styles.table}>
          <View style={styles.thr}><Text style={[styles.th, { width: "55%" }]}>Risk Flag</Text><Text style={[styles.th, { width: "15%", textAlign: "center" }]}>Yes / No</Text><Text style={[styles.th, { width: "30%" }]}>Counselor Action</Text></View>
          {[["Interest and academic marks are mismatched", "Yes / No", "Review subject scores before session"], ["Parent expectations differ from student interest", "Yes / No", "Prepare structured parent alignment discussion"], ["Peer influence or trend-based career choice is visible", "Yes / No", "Ask student to explain WHY certain choices were made"], ["Student interest is scattered - no clear focus", "Yes / No", "Plan 3-4 targeted exposure activities first"], ["Too many areas show high interest (unfocused profile)", "Yes / No", "Narrow down using subject performance cross-check"], ["Strong interest but evidence of low effort in related subjects", "Yes / No", "Discuss effort-readiness gap directly with student"], ["Student is choosing based on salary, status, or peer pressure", "Yes / No", "Reframe career motivation discussion in session"], ["Stream choice pressure from family is evident", "Yes / No", "Schedule separate parent-counselor session"]].map((row, i) => <View key={row[0]} style={i % 2 === 0 ? styles.tr : styles.trAlt}><Text style={[styles.td, { width: "55%" }]}>{row[0]}</Text><Text style={[styles.td, { width: "15%", textAlign: "center" }]}>{row[1]}</Text><Text style={[styles.td, { width: "30%" }]}>{row[2]}</Text></View>)}
        </View>
        {footer(report.student.fullName)}
      </Page>

      <Page size="A4" style={styles.page}>
        {sectionHeader(report.student.fullName, "Parent Counseling Note")}
        <View style={styles.warnBox}><Text style={styles.warnTitle}>Parent Counseling Note</Text><Text style={styles.warnText}>Parents are advised not to treat this report as a final career label for their child. The report should be used as a structured discussion tool. The student's strongest interest areas should be explored through real experiences before making any high-stakes academic decisions.</Text></View>
        {footer(report.student.fullName)}
      </Page>

      <Page size="A4" style={styles.page}>
        {sectionHeader(report.student.fullName, "Section 16 - Next Steps")}
        <View style={styles.sectionWrap}><Text style={styles.sectionNum}>Section 16</Text><Text style={styles.sectionTitle}>Recommended Next Steps</Text></View>
        <Text style={styles.body}>The following action plan is recommended for {report.student.fullName}, parents, and the school counselor to follow after this report has been reviewed. These steps convert interest into structured exploration - not premature decisions.</Text>
        <Text style={styles.bodyBold}>Immediate Action Timeline</Text>
        <View style={styles.table}>
          <View style={styles.thr}><Text style={[styles.th, { width: "26%" }]}>Timeline</Text><Text style={[styles.th, { width: "74%" }]}>Recommended Action</Text></View>
          {[["Next 2 weeks", "Review this report jointly with student and parent. Discuss top 3 interest areas and practical meaning."], ["Next 1 month", "Select 2 to 3 exposure activities from the Career Exposure section. Begin at least one activity."], ["Next 3 months", "Complete one mini-project, competition, or structured task in the top interest area. Document the experience."], ["Next 6 months", "Review academic performance in subjects related to the top interest area and assess alignment."], ["After 12 months", "Reassess using the same assessment (especially for Grade 8 and 9). Compare score patterns for growth."]].map((row, i) => <View key={row[0]} style={i % 2 === 0 ? styles.tr : styles.trAlt}><Text style={[styles.tdB, { width: "26%" }]}>{row[0]}</Text><Text style={[styles.td, { width: "74%" }]}>{row[1]}</Text></View>)}
        </View>
        <Text style={styles.bodyBold}>Grade {grade} - Specific Action Plan</Text>
        {grade === "8" && <View>{bullet("Explore 3 to 5 interest areas through clubs, activities, and school projects.")}{bullet("Join at least one extracurricular activity connected to a top interest area.")}{bullet("Avoid final career decisions - focus on building curiosity, confidence, and exposure.")}{bullet("Schedule one counseling conversation per term to review and update interests.")}</View>}
        {grade === "9" && <View>{bullet("Narrow broad interest clusters to 2 to 3 serious focus areas.")}{bullet("Compare interest areas with current subject comfort and marks.")}{bullet("Begin stream-readiness conversations - do not finalise stream yet.")}{bullet("Attempt at least one mini-project or career exposure activity per term.")}</View>}
        {grade === "10" && <View>{bullet("Connect top interest areas with Grade 11 subject combination options.")}{bullet("Check the academic demands of the preferred stream - do not choose by interest alone.")}{bullet("Discuss backup subject combinations with counselor before final application.")}{bullet("Complete a structured counseling interview before submitting final stream preference.")}</View>}
        <Text style={styles.bodyBold}>Personalised Action Roadmap</Text>
        {analysis.actionRoadmap.map((line, i) => <Text key={i} style={styles.bullet}>{"\u2022  "}{line}</Text>)}
        {footer(report.student.fullName)}
      </Page>

      <Page size="A4" style={styles.page}>
        {sectionHeader(report.student.fullName, "Section 17 - One-Month Roadmap")}
        <View style={styles.sectionWrap}><Text style={styles.sectionNum}>Section 17</Text><Text style={styles.sectionTitle}>Detailed One-Month Weekly Plan</Text></View>
        <Text style={styles.body}>This detailed action plan is designed for {report.student.fullName} to build consistency, clarity, and measurable growth. Each week includes 5 goals, 5 practical tasks, and step-by-step guidance. Primary focus area: {i1.name}. Supporting areas: {i2.name} and {i3.name}.</Text>
        <View style={styles.table}>
          <View style={styles.thr}><Text style={[styles.th, { width: "12%" }]}>Week</Text><Text style={[styles.th, { width: "30%" }]}>5 Goals</Text><Text style={[styles.th, { width: "30%" }]}>5 Weekly Tasks</Text><Text style={[styles.th, { width: "28%" }]}>Detailed Guidance</Text></View>
          {[["Week 1", "1. Understand your top strengths clearly\n2. Set fixed study time daily\n3. Define one priority subject goal\n4. Start reflection journal habit\n5. Build a distraction-control plan", "1. Read full report with parent\n2. Select top 2 focus areas\n3. Do 5 focused sessions (30 min)\n4. Write 1 daily learning summary\n5. Share progress with mentor once", "Focus: Build routine, not perfection.\nExecution: Complete the planned study blocks daily.\nReview: Write one win and one gap every evening.\nAdjustment: If a day is missed, restart the next day without guilt."], ["Week 2", "1. Increase execution speed\n2. Improve weak-topic confidence\n3. Strengthen classroom engagement\n4. Keep daily streak discipline\n5. Build effort before motivation", "1. Complete 2 mini practical activities\n2. Ask 1 teacher for targeted advice\n3. Revise 2 weak concepts deeply\n4. Continue 5 focused sessions\n5. Submit 1 small output (note/model/slides)", "Focus: Build momentum through consistent completion.\nExecution: Do difficult tasks first, then easy tasks.\nReview: Track completion rate instead of mood.\nAdjustment: If consistency drops, reduce scope but keep daily continuity."], ["Week 3", "1. Apply learning under pressure\n2. Improve resilience in difficult topics\n3. Convert knowledge into output\n4. Improve communication confidence\n5. Reduce repeated mistakes", "1. Complete 1 project milestone\n2. Teach 1 concept to a peer\n3. Do 1 timed practice session\n4. Continue daily reflection and review\n5. Identify and correct top 3 recurring errors", "Focus: Stay process-driven under pressure.\nExecution: Follow plan-execute-review-adjust every day.\nReview: Treat mistakes as diagnostic feedback.\nAdjustment: Prioritize steady improvement over emotional ups and downs."], ["Week 4", "1. Measure growth from Week 1 baseline\n2. Consolidate strong study habits\n3. Align effort with long-term stream goals\n4. Build next-month roadmap clearly\n5. Finalize accountability structure", "1. Conduct parent/counselor review meeting\n2. Compare Week 1 vs Week 4 progress\n3. Document strengths and gaps\n4. Write next 30-day action plan\n5. Define 3 new goals with deadlines", "Focus: Consolidate learning and prepare next cycle.\nExecution: Review evidence (sessions, outputs, confidence, alignment).\nReview: Compare Week 1 baseline with Week 4 outcomes.\nAdjustment: Finalize a realistic, time-bound 30-day plan with accountability."]].map((row, i) => <View key={row[0]} style={i % 2 === 0 ? styles.tr : styles.trAlt}><Text style={[styles.tdB, { width: "12%" }]}>{row[0]}</Text><Text style={[styles.td, { width: "30%" }]}>{row[1]}</Text><Text style={[styles.td, { width: "30%" }]}>{row[2]}</Text><Text style={[styles.td, { width: "28%" }]}>{row[3]}</Text></View>)}
        </View>
        {footer(report.student.fullName)}
      </Page>

      <Page size="A4" style={styles.page}>
        {sectionHeader(report.student.fullName, "Section 17 - One-Month Roadmap (continued)")}
        <View style={styles.sectionWrap}><Text style={styles.sectionNum}>Section 17</Text><Text style={styles.sectionTitle}>Detailed One-Month Weekly Plan</Text></View>
        <Text style={styles.bodyBold}>Weekly Completion Check</Text>
        {bullet("At least 5 focused study sessions completed each week")}
        {bullet("At least 1 practical output completed every week")}
        {bullet("At least 1 teacher/mentor feedback interaction every week")}
        {bullet("Weekly review completed on Sunday with written evidence")}
        {footer(report.student.fullName)}
      </Page>

      <Page size="A4" style={styles.page}>
        {sectionHeader(report.student.fullName, "Section 18 - Final Recommendation")}
        <View style={styles.sectionWrap}><Text style={styles.sectionNum}>Section 18</Text><Text style={styles.sectionTitle}>Final Recommendation</Text></View>
        <View style={styles.infoBox}><Text style={styles.bodyBold}>Primary Academic Direction:  {analysis.streamName}</Text><Text style={[styles.body, { marginTop: 3, marginBottom: 3 }]}>Supporting Direction:  {i2.name}-linked exploration</Text><Text style={[styles.body, { marginBottom: 0 }]}>Optional Exploration:  {i3.name}-linked activities</Text></View>
        <Text style={styles.note}>Stream suitability analysis is covered in Section 11 - Stream Readiness. Refer to that section for the full stream matrix.</Text>
        <Text style={styles.bodyBold}>Final Counselor Statement</Text>
        <Text style={styles.body}>At present, {report.student.fullName}'s interest profile suggests that {analysis.streamName}-related learning areas should be explored seriously. The student's primary strength lies in {i1.name} with a supporting interest in {i2.name}.</Text>
        <Text style={styles.body}>However, the final stream or career decision should NOT be made only on the basis of this assessment. {report.student.fullName} should be guided through academic performance review, parent discussion, aptitude analysis, and structured exposure before making a final decision.</Text>
        <View style={styles.warnBox}><Text style={styles.warnTitle}>The Responsible Way to Frame This Recommendation</Text><Text style={styles.warnText}>Do NOT say: "{report.student.fullName} should choose {analysis.streamName}."{"\n\n"}Instead say: "{report.student.fullName} currently shows strong interest in {i1.name} and {i2.name}-linked activities. Before selecting {analysis.streamName} in Grade 11, subject performance, study discipline, and long-term academic commitment must all be reviewed carefully."</Text></View>
        <Text style={styles.bodyBold}>Future Opportunities in Recommended Stream</Text>
        {analysis.streamFutureOpportunities.map((line, i) => <Text key={i} style={styles.bullet}>{"\u2022  "}{line}</Text>)}
        {footer(report.student.fullName)}
      </Page>

      <Page size="A4" style={styles.page}>
        {sectionHeader(report.student.fullName, "Appendix - Score Bands & Interest Areas")}
        <View style={styles.sectionWrap}><Text style={styles.sectionNum}>Appendix</Text><Text style={styles.sectionTitle}>Appendix: Confidentiality & Report Details</Text></View>
        <Text style={styles.body}>Score band interpretation is included in the score summary and profile analysis sections. The complete interest area reference is in Section 3 (Interest Areas).</Text>
        <Text style={styles.bodyBold}>Confidentiality Note</Text>
        <Text style={styles.body}>This report is prepared exclusively for {report.student.fullName} and their family. It is intended for personal academic planning and counseling purposes only. It should not be shared publicly, used for institutional selection, or submitted as a formal qualification document.</Text>
        <View style={[styles.infoBox, { marginTop: 10 }]}><Text style={styles.bodyBold}>Report Details</Text><Text style={[styles.body, { marginBottom: 0, marginTop: 4 }]}>Student: {report.student.fullName}  |  Grade: {report.grade}  |  Date: {completedDate}  |  Attempt: {report.attemptNumber} of {report.totalAttempts}{"\n"}Recommended Stream: {analysis.streamName}  |  Confidence: {analysis.streamConfidence}  |  Platform: AIM (Academic Interest Mapping)</Text></View>
        {footer(report.student.fullName)}
      </Page>

      <Page size="A4" style={styles.backCoverPage}>
        <Image src={report.backCoverImageSrc ?? "/academic-career/back-cover.jpg"} style={styles.backCoverBg} />
      </Page>
    </Document>
  );
}
