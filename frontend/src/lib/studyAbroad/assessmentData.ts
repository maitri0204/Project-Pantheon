export type Topic =
  | 'Language Readiness'
  | 'Scholastic Readiness'
  | 'Academic Readiness'
  | 'Career & Employability Readiness'
  | 'Financial Readiness'
  | 'Visa & Compliance Readiness'
  | 'Psychological Readiness'
  | 'Social & Cultural Readiness'
  | 'Parental Expectation Readiness'
  | 'Physical & Lifestyle Readiness'
  | 'Resilience Readiness'
  | 'Decision Readiness';

export type TopicScoreMap = Record<Topic, number>;
export type TopicAnsweredMap = Record<Topic, number>;

export interface AssessmentResult {
  id: string;
  submittedAt: string;
  overallScore: number;
  answeredCount: number;
  totalQuestions: number;
  band: string;
  topicScores: TopicScoreMap;
  topicAnswered: TopicAnsweredMap;
}

export interface StudentProfile {
  fullName: string;
  email: string;
  mobile: string;
  country: string;
  state: string;
  city: string;
  photo?: string; // base64 data URL
}

export const MAX_ASSESSMENT_SCORE = 150;

export interface CareerMatch {
  title: string;
  fit: number;
  reason: string;
  skills: string[];
  paths: string[];
}

export interface UniversityRecommendation {
  tier: 'Dream' | 'Target' | 'Safe';
  suitability: number;
  guidance: string;
}

export interface RoadmapStep {
  phase: number;
  title: string;
  timeframe: string;
  summary: string;
  actions: string[];
  resources: string[];
  milestone: string;
  priority: 'high' | 'medium' | 'low';
}

export const RESULT_HISTORY_KEY = 'ks_result_history_v1';
export const PROFILE_KEY = 'ks_profile_v1';
const USED_IDS_KEY = 'ks_used_q_ids_v1';
const STUDENT_STORAGE_PREFIX = 'ks_student';

interface StoredSessionUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

function normalizeStorageSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'guest';
}

function readStoredSessionUser(): StoredSessionUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw) as StoredSessionUser;
  } catch {
    return null;
  }
}

export function getStudentStorageScope(): string {
  const user = readStoredSessionUser();
  const identifier = user?._id ?? user?.id ?? user?.email ?? 'guest';
  return normalizeStorageSegment(identifier);
}

export function getScopedStorageKey(baseKey: string): string {
  return `${STUDENT_STORAGE_PREFIX}:${baseKey}:${getStudentStorageScope()}`;
}

function removeStorageKey(key: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}

function clearCurrentStudentStorage() {
  removeStorageKey(getScopedStorageKey(RESULT_HISTORY_KEY));
  removeStorageKey(getScopedStorageKey(PROFILE_KEY));
  removeStorageKey(getScopedStorageKey(USED_IDS_KEY));
}

function clearLegacyStudentStorage() {
  removeStorageKey(RESULT_HISTORY_KEY);
  removeStorageKey(PROFILE_KEY);
  removeStorageKey(USED_IDS_KEY);
}

export const ALL_TOPICS: Topic[] = [
  'Language Readiness',
  'Scholastic Readiness',
  'Academic Readiness',
  'Career & Employability Readiness',
  'Financial Readiness',
  'Visa & Compliance Readiness',
  'Psychological Readiness',
  'Social & Cultural Readiness',
  'Parental Expectation Readiness',
  'Physical & Lifestyle Readiness',
  'Resilience Readiness',
  'Decision Readiness',
];

const TOPIC_LABELS: Record<Topic, string> = {
  'Language Readiness': 'Language Readiness',
  'Scholastic Readiness': 'Scholastic Readiness',
  'Academic Readiness': 'Academic Readiness',
  'Career & Employability Readiness': 'Career & Employability',
  'Financial Readiness': 'Financial Readiness',
  'Visa & Compliance Readiness': 'Visa & Compliance',
  'Psychological Readiness': 'Psychological Readiness',
  'Social & Cultural Readiness': 'Social & Cultural',
  'Parental Expectation Readiness': 'Parental Readiness',
  'Physical & Lifestyle Readiness': 'Physical & Lifestyle',
  'Resilience Readiness': 'Resilience',
  'Decision Readiness': 'Decision Readiness',
};

function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocalStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function createEmptyTopicMap<TValue>(initial: TValue): Record<Topic, TValue> {
  return ALL_TOPICS.reduce((acc, topic) => {
    acc[topic] = initial;
    return acc;
  }, {} as Record<Topic, TValue>);
}

export function normalizeTopicScores(
  raw?: Record<string, number | string> | null,
): TopicScoreMap {
  const source = raw && typeof raw === 'object' ? raw : {};
  return ALL_TOPICS.reduce((acc, topic) => {
    acc[topic] = Number(source[topic] ?? 0);
    return acc;
  }, createEmptyTopicMap(0) as TopicScoreMap);
}

export function normalizeTopicAnswered(
  raw?: Record<string, number | string> | null,
): TopicAnsweredMap {
  const source = raw && typeof raw === 'object' ? raw : {};
  return ALL_TOPICS.reduce((acc, topic) => {
    acc[topic] = Number(source[topic] ?? 0);
    return acc;
  }, createEmptyTopicMap(0) as TopicAnsweredMap);
}

export function getResultHistory(): AssessmentResult[] {
  const history = readLocalStorage<AssessmentResult[]>(getScopedStorageKey(RESULT_HISTORY_KEY), []);
  if (!Array.isArray(history)) return [];
  return history;
}

export function getLatestResult(): AssessmentResult | null {
  const history = getResultHistory();
  return history.length ? history[0] : null;
}

export function saveResultHistory(history: AssessmentResult[]) {
  writeLocalStorage(getScopedStorageKey(RESULT_HISTORY_KEY), history);
}

export function prependAssessmentResult(result: AssessmentResult) {
  const history = getResultHistory();
  history.unshift(result);
  saveResultHistory(history);
}

export function scoreToPercentage(score: number): number {
  return Math.max(0, Math.min(100, Math.round((score / MAX_ASSESSMENT_SCORE) * 100)));
}

export function bandFromPercentage(percentage: number): string {
  if (percentage > 90) return 'Completely Ready';
  if (percentage >= 76) return 'Almost Ready';
  if (percentage >= 51) return 'Moderately Ready';
  if (percentage >= 26) return 'Partially Ready';
  return 'At Risk';
}

export function bandFromScore(score: number): string {
  return bandFromPercentage(scoreToPercentage(score));
}

export function mapStudyAbroadEvaluationToResult(
  attemptId: string,
  submittedAt: string,
  evaluation: {
    overallScore: number;
    band?: string;
    topicScores?: Record<string, number> | null;
    topicAnswered?: Record<string, number> | null;
    answeredCount?: number;
    totalQuestions?: number;
  },
): AssessmentResult {
  const topicScores = normalizeTopicScores(evaluation.topicScores);
  const topicAnswered = normalizeTopicAnswered(evaluation.topicAnswered);

  const pct = scoreToPercentage(evaluation.overallScore);

  return {
    id: attemptId,
    submittedAt,
    overallScore: evaluation.overallScore,
    answeredCount: evaluation.answeredCount ?? 50,
    totalQuestions: evaluation.totalQuestions ?? 50,
    band: evaluation.band ?? bandFromPercentage(pct),
    topicScores,
    topicAnswered,
  };
}

export function bandMeta(band: string): { colorClass: string; bg: string; border: string; desc: string; hex: string } {
  const map: Record<string, { colorClass: string; bg: string; border: string; desc: string; hex: string }> = {
    'Completely Ready': { colorClass: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', desc: 'You are fully prepared to begin your study abroad journey!', hex: '#86efac' },
    'Almost Ready': { colorClass: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200', desc: 'Great progress! A few final preparations needed.', hex: '#7dd3fc' },
    'Moderately Ready': { colorClass: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', desc: 'You are on the right track. Keep building readiness.', hex: '#a5b4fc' },
    'Partially Ready': { colorClass: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', desc: 'Several key areas need attention before you are ready.', hex: '#fcd34d' },
    'At Risk': { colorClass: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', desc: 'Focus on foundational readiness before making applications.', hex: '#fda4af' },
  };
  return map[band] ?? map['Moderately Ready'];
}

export function getTopAndBottomTopics(result: AssessmentResult, count = 3) {
  const ranked = ALL_TOPICS.map((topic) => ({
    topic,
    score: result.topicScores[topic],
    label: TOPIC_LABELS[topic],
  })).sort((a, b) => b.score - a.score);

  return {
    top: ranked.slice(0, count),
    bottom: [...ranked].reverse().slice(0, count),
  };
}

export function deriveCareerMatches(result: AssessmentResult): CareerMatch[] {
  const s = result.topicScores;
  const combos: CareerMatch[] = [
    {
      title: 'Business & Strategy',
      fit: Math.round((s['Career & Employability Readiness'] + s['Scholastic Readiness'] + s['Language Readiness'] + s['Financial Readiness']) / 4),
      reason: 'Your career direction, scholastic discipline, communication, and financial awareness align strongly with business roles.',
      skills: ['Leadership', 'Communication', 'Financial Analysis', 'Strategic Planning'],
      paths: ['MBA', 'Finance', 'Marketing', 'Entrepreneurship'],
    },
    {
      title: 'Technology & Analytics',
      fit: Math.round((s['Academic Readiness'] + s['Decision Readiness'] + s['Career & Employability Readiness'] + s['Scholastic Readiness']) / 4),
      reason: 'Your academic rigor, structured decision-making, and employability strengths fit tech-focused programs well.',
      skills: ['Analytical Thinking', 'Problem Solving', 'Research', 'Data Literacy'],
      paths: ['Computer Science', 'Data Science', 'Engineering', 'AI & ML'],
    },
    {
      title: 'People & Global Services',
      fit: Math.round((s['Social & Cultural Readiness'] + s['Psychological Readiness'] + s['Language Readiness'] + s['Resilience Readiness']) / 4),
      reason: 'Cross-cultural adaptability, communication, and resilience suit global service and people-centric roles.',
      skills: ['Empathy', 'Cross-cultural Communication', 'Conflict Resolution', 'Team Building'],
      paths: ['International Relations', 'Human Resources', 'Social Work', 'Counselling'],
    },
    {
      title: 'Healthcare & Sciences',
      fit: Math.round((s['Academic Readiness'] + s['Physical & Lifestyle Readiness'] + s['Resilience Readiness'] + s['Decision Readiness']) / 4),
      reason: 'Academic discipline, physical resilience, and decisive thinking are key qualities for healthcare and science fields.',
      skills: ['Research', 'Attention to Detail', 'Physical Endurance', 'Critical Thinking'],
      paths: ['Medicine', 'Nursing', 'Biomedical Research', 'Public Health'],
    },
    {
      title: 'Creative & Media',
      fit: Math.round((s['Language Readiness'] + s['Social & Cultural Readiness'] + s['Decision Readiness'] + s['Psychological Readiness']) / 4),
      reason: 'Language skills, cultural awareness, and psychological confidence are the fuel for impactful creative careers.',
      skills: ['Storytelling', 'Visual Communication', 'Content Creation', 'Cultural Sensitivity'],
      paths: ['Journalism', 'Film & Media', 'Advertising', 'UX Design'],
    },
    {
      title: 'Policy & Social Impact',
      fit: Math.round((s['Social & Cultural Readiness'] + s['Visa & Compliance Readiness'] + s['Language Readiness'] + s['Decision Readiness']) / 4),
      reason: 'Your awareness of compliance, cultural dynamics, and communication prepares you for impactful public sector work.',
      skills: ['Policy Analysis', 'Stakeholder Management', 'Legal Awareness', 'Public Speaking'],
      paths: ['Law', 'Public Administration', 'NGO Management', 'Development Studies'],
    },
  ];
  return combos.sort((a, b) => b.fit - a.fit);
}

export function deriveUniversityRecommendations(result: AssessmentResult): UniversityRecommendation[] {
  const s = result.topicScores;
  const readinessCore = Math.round(
    (s['Academic Readiness'] + s['Language Readiness'] + s['Visa & Compliance Readiness'] + s['Financial Readiness']) / 4,
  );

  const dream = Math.min(98, readinessCore + 6);
  const target = readinessCore;
  const safe = Math.max(35, readinessCore - 10);

  return [
    {
      tier: 'Dream',
      suitability: dream,
      guidance: 'Aim for ambitious applications with stronger SOP, profile building, and test prep consistency.',
    },
    {
      tier: 'Target',
      suitability: target,
      guidance: 'Best balance between admission probability and growth opportunities right now.',
    },
    {
      tier: 'Safe',
      suitability: safe,
      guidance: 'Solid backup options to reduce risk while preserving quality outcomes.',
    },
  ];
}

export function deriveRoadmap(result: AssessmentResult): RoadmapStep[] {
  const s = result.topicScores;
  const ranked = ALL_TOPICS.map((t) => ({ t, score: s[t], label: TOPIC_LABELS[t] })).sort((a, b) => a.score - b.score);
  const w = ranked;

  return [
    {
      phase: 1,
      title: 'Diagnostic & Goal Setting',
      timeframe: 'Week 1 - 2',
      summary: `Your readiness score is ${scoreToPercentage(result.overallScore)}%. This phase is about understanding your profile deeply and setting clear, realistic targets.`,
      actions: [
        `Review your weakest area (${w[0]?.label ?? 'focus area'} - ${w[0]?.score ?? 0}%) and list 3 specific goals to improve it.`,
        'Map your full study abroad timeline: application deadlines, test dates, visa processing windows.',
        'Speak with at least one advisor, mentor, or senior student who has studied abroad.',
        'Build a weekly study planner with dedicated readiness-building time blocks (minimum 1 hr/day).',
        'Create a master folder for all documents: transcripts, SOP drafts, financial proofs, recommendations.',
      ],
      resources: [
        'ADMITra/KAREER Studio counsellors for goal-setting and university planning support',
        'Official admission portals (UCAS, Common App, uni-assist) reviewed with the help of ADMITra/KAREER Studio guidance',
        'Notion or Trello planning boards structured with ADMITra/KAREER Studio follow-up support',
      ],
      milestone: 'Complete a written personal roadmap with a 3-month study plan and application deadline calendar.',
      priority: result.overallScore < 75 ? 'high' : 'medium',
    },
    {
      phase: 2,
      title: `Core Skill Building - ${w[0]?.label ?? 'Primary Focus'}`,
      timeframe: 'Week 3 - 5',
      summary: `Your weakest dimension is ${w[0]?.label ?? 'core readiness'} (${w[0]?.score ?? 0}%). Focused effort here creates the highest impact on your readiness score.`,
      actions: [
        `Dedicate 1 hour daily to improving ${w[0]?.label ?? 'this area'} through targeted exercises and practice.`,
        `Find 2-3 online courses or structured resources specifically for ${w[0]?.label ?? 'this area'}.`,
        'Practice with mock scenarios relevant to your weak area (visa interviews, financial planning, etc.).',
        'Join an online community of students preparing for study abroad (Reddit, Facebook groups, Discord).',
        'Track weekly progress on a score journal - aim for at least +10 points by end of week 5.',
      ],
      resources: [
        w[0]?.label.includes('Language') ? 'IELTS/TOEFL official practice tests and Cambridge resources with KAREER Studio mentoring' : 'Coursera, Udemy, or edX courses for your focus area supported by ADMITra/KAREER Studio advisors',
        'YouTube tutorials and expert channels shortlisted with ADMIT/KAREER Studio counsellors',
        'Peer accountability buddy or study group coordinated through ADMITra/KAREER Studio communities',
      ],
      milestone: `Demonstrate measurable improvement in ${w[0]?.label ?? 'your focus area'} through a self-assessment or practice test.`,
      priority: 'high',
    },
    {
      phase: 3,
      title: 'Academic & Language Strengthening',
      timeframe: 'Week 6 - 8',
      summary: 'Academic credentials and language proficiency are the two most critical gatekeepers for study abroad success. Nail these before anything else.',
      actions: [
        'Register for or intensify IELTS/TOEFL preparation - aim for your target score this phase.',
        'Update your CV/resume in the format preferred by universities in your target country.',
        'Begin drafting your Statement of Purpose (SOP) - write 3 different angle versions.',
        'Request recommendation letters from professors or employers at least 6 weeks before deadlines.',
        'Research and shortlist 8-10 scholarships and grants that match your academic profile.',
      ],
      resources: [
        'IELTS/TOEFL prep platforms: ADMITra/KAREER Studio , Magoosh, British Council, ETS Official',
        'SOP writing guides, samples, and professional editing services reviewed by ADMITra/KAREER Studio mentors',
        'Scholarship portals: scholarshipportal.com, DAAD, Chevening, Fulbright, mapped with ADMITra/KAREER Studio support',
      ],
      milestone: 'Complete a polished SOP first draft and reach 80% of your target English proficiency benchmark score.',
      priority: s['Language Readiness'] < 60 || s['Academic Readiness'] < 60 ? 'high' : 'medium',
    },
    {
      phase: 4,
      title: 'Financial & Visa Planning',
      timeframe: 'Week 9 - 11',
      summary: 'Financial preparedness and visa compliance are non-negotiable. Missing documents or underfunding are the #1 reasons students lose their place.',
      actions: [
        'Calculate your total study abroad budget: tuition + accommodation + living + travel + emergency fund.',
        'Prepare your bank account to show 6-12 months of living expenses as proof of funds.',
        'Research the exact visa requirements for your target country (documents, fees, timelines, biometrics).',
        'Begin collecting required documents: birth certificate, police clearance, medical records, transcripts.',
        'Research health insurance requirements and student insurance options in your destination country.',
      ],
      resources: [
        'Official embassy/consulate websites for student visa guides checked with ADMITra/KAREER Studio counsellors',
        'Student finance calculators on national study portals, interpreted with ADMITra/KAREER Studio planning support',
        'Bank education loan portals and government scholarship schemes shortlisted with ADMITra/KAREER Studio help',
      ],
      milestone: 'Complete a financial readiness checklist, open a dedicated bank account, and start the visa documentation folder.',
      priority: s['Financial Readiness'] < 60 || s['Visa & Compliance Readiness'] < 60 ? 'high' : 'medium',
    },
    {
      phase: 5,
      title: 'Psychological & Cultural Preparation',
      timeframe: 'Week 12 - 14',
      summary: 'Mental resilience and cultural adaptability are what separate students who thrive from those who struggle after arrival.',
      actions: [
        'Research the culture, customs, and social norms of your destination country in depth.',
        'Learn about common challenges: homesickness, culture shock, academic pressure, and loneliness.',
        'Connect with alumni or current students from your home country at your target university.',
        'Develop personal coping strategies: exercise routine, journaling, meditation, or regular family calls.',
        'Have a transparent, detailed conversation with your family about your study abroad plan and receive their support.',
      ],
      resources: [
        'Country-specific expat and student community forums, plus ADMITra/KAREER Studio pre-departure communities',
        'Mindfulness apps: Headspace, Calm, Insight Timer, paired with ADMITra/KAREER Studio counsellor check-ins',
        'Book recommendation: "The Culture Map" by Erin Meyer, discussed with ADMITra/KAREER Studio mentors',
      ],
      milestone: 'Hold a family meeting, connect with 2 current international students, and have a personal resilience plan documented.',
      priority: s['Psychological Readiness'] < 60 || s['Social & Cultural Readiness'] < 60 ? 'high' : 'medium',
    },
    {
      phase: 6,
      title: 'Final Sprint & Application Submission',
      timeframe: 'Week 15 - 16',
      summary: 'This is the execution phase. Finalize all applications, confirm logistics, and prepare for the journey ahead.',
      actions: [
        'Finalize and submit all university applications before their deadlines - apply to at least 5 universities.',
        'Submit scholarship applications with all required essays, documents, and endorsements.',
        'Book your English proficiency test if not already completed.',
        'Arrange pre-departure logistics: accommodation booking, airport pickup, university orientation registration.',
        'Re-take the Study Abroad Readiness Assessment to measure your improvement and identify any remaining gaps.',
      ],
      resources: [
        'University application portals: UCAS (UK), Common App (US), uni-assist (Germany), finalized with ADMITra/KAREER Studio review',
        'Pre-departure guides from your target university international office plus ADMITra/KAREER Studio planning support',
        'StudyAbroad Readiness AI retake, followed by a ADMITra/KAREER Studio or admitra readiness review',
      ],
      milestone: 'Submit at least 8-10 complete university applications with all required documents and receive at least 1 acknowledgement.',
      priority: 'high',
    },
  ];
}

export function getStudentProfile(): StudentProfile {
  const fallback = {
    fullName: '',
    email: '',
    mobile: '',
    country: '',
    state: '',
    city: '',
  };

  const profile = readLocalStorage<StudentProfile>(getScopedStorageKey(PROFILE_KEY), fallback);
  const rawUser = readLocalStorage<{ name?: string; email?: string }>('user', {});

  return {
    ...fallback,
    ...profile,
    fullName: profile.fullName || rawUser.name || '',
    email: profile.email || rawUser.email || '',
  };
}

export function saveStudentProfile(profile: StudentProfile) {
  writeLocalStorage(getScopedStorageKey(PROFILE_KEY), profile);

  const rawUser = readLocalStorage<{ name?: string; email?: string }>('user', {});
  writeLocalStorage('user', {
    ...rawUser,
    name: profile.fullName,
    email: profile.email,
  });
}

export function deleteStudentAccountData() {
  if (typeof window === 'undefined') return;
  clearCurrentStudentStorage();
  clearLegacyStudentStorage();
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('user');
  window.sessionStorage.clear();
}
