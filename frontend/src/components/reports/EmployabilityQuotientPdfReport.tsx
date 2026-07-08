/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * EmployabilityQuotientPdfReport.tsx - Premium Employability Quotient (EQ) PDF
 * Rendered with @react-pdf/renderer v4
 *
 * Font system: Inter (jsDelivr @fontsource CDN)
 *   - All text uses fontFamily: 'Inter' + fontWeight 400 | 600 | 700
 *   - No italic variant is used (Inter italic is not registered)
 */
import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Svg,
  Path,
  Rect,
  Circle,
  Line,
  Polygon,
  Font,
  Image,
} from '@react-pdf/renderer';

import { REPORT_BACK_COVER_IMAGE } from '@/lib/reports/reportCoverAssets';

/* ─────────────────────────── Font Registration ───────────────────────────── */

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.0/files/inter-latin-400-normal.woff', fontWeight: 400, fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.0/files/inter-latin-500-normal.woff', fontWeight: 500, fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.0/files/inter-latin-600-normal.woff', fontWeight: 600, fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.0/files/inter-latin-700-normal.woff', fontWeight: 700, fontStyle: 'normal' },
  ],
});
Font.registerHyphenationCallback((word) => [word]);

/* ─────────────────────────── Public Data Type ─────────────────────────────── */

export interface EQReportData {
  studentName: string;
  email?: string;
  generatedDate: string;
  overallScore: number;                 // 0 - 50
  overallPercentage: number;            // 0 - 100
  tier: string;
  dimensionScores: Record<string, number>; // 10 dimensions, each 0 - 5
  answeredCount?: number;
  totalQuestions?: number;
  /** Data URL or absolute URL for back cover */
  backCoverImageSrc?: string;
}

/* ─────────────────────────── Constants ───────────────────────────────────── */

const C = {
  teal:     '#0d9488',
  tealDark: '#0f766e',
  tealBg:   '#f0fdfa',
  emerald:  '#10b981',
  emeraldBg:'#d1fae5',
  emeraldTx:'#065f46',
  sky:      '#0ea5e9',
  skyBg:    '#e0f2fe',
  skyTx:    '#0c4a6e',
  indigo:   '#6366f1',
  purple:   '#8b5cf6',
  amber:    '#f59e0b',
  amberBg:  '#fef3c7',
  amberTx:  '#92400e',
  rose:     '#f43f5e',
  roseBg:   '#ffe4e6',
  roseTx:   '#9f1239',
  dark:     '#0f172a',
  navy:     '#1e293b',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate300: '#cbd5e1',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  slate50:  '#f8fafc',
  white:    '#ffffff',
} as const;

const MAX_SCORE = 50;

const DIMENSIONS = [
  'Analytical Thinking',
  'Resilience, Flexibility, and Agility',
  'Leadership and Social Influence',
  'Creative Thinking',
  'Motivation and Self-Awareness',
  'Technological Literacy',
  'Empathy and Active Listening',
  'Curiosity and Lifelong Learning',
  'Talent Management',
  'Service Orientation and Customer Service',
] as const;

const DIM_SHORT: Record<string, string> = {
  'Analytical Thinking': 'Analytical Thinking',
  'Resilience, Flexibility, and Agility': 'Resilience & Agility',
  'Leadership and Social Influence': 'Leadership & Influence',
  'Creative Thinking': 'Creative Thinking',
  'Motivation and Self-Awareness': 'Motivation & Self-Awareness',
  'Technological Literacy': 'Technological Literacy',
  'Empathy and Active Listening': 'Empathy & Listening',
  'Curiosity and Lifelong Learning': 'Curiosity & Learning',
  'Talent Management': 'Talent Management',
  'Service Orientation and Customer Service': 'Service & Customer Focus',
};

const DIM_TINY: Record<string, string> = {
  'Analytical Thinking': 'Analytical',
  'Resilience, Flexibility, and Agility': 'Resilience',
  'Leadership and Social Influence': 'Leadership',
  'Creative Thinking': 'Creative',
  'Motivation and Self-Awareness': 'Motivation',
  'Technological Literacy': 'Technology',
  'Empathy and Active Listening': 'Empathy',
  'Curiosity and Lifelong Learning': 'Curiosity',
  'Talent Management': 'Talent Mgmt',
  'Service Orientation and Customer Service': 'Service',
};

/* ── Career role benchmarks (score out of 5 per skill) ── */

const ROLES = ['Entry-Level Executive', 'Manager', 'Senior Manager', 'CEO'] as const;
type RoleName = (typeof ROLES)[number];

const ROLE_BENCHMARKS: Record<string, Record<RoleName, number>> = {
  'Analytical Thinking':                        { 'Entry-Level Executive': 3.0, Manager: 4.0, 'Senior Manager': 4.5, CEO: 5.0 },
  'Resilience, Flexibility, and Agility':       { 'Entry-Level Executive': 3.5, Manager: 4.0, 'Senior Manager': 4.5, CEO: 5.0 },
  'Leadership and Social Influence':            { 'Entry-Level Executive': 2.5, Manager: 4.0, 'Senior Manager': 4.5, CEO: 5.0 },
  'Creative Thinking':                          { 'Entry-Level Executive': 3.0, Manager: 3.5, 'Senior Manager': 4.0, CEO: 5.0 },
  'Motivation and Self-Awareness':              { 'Entry-Level Executive': 3.5, Manager: 4.0, 'Senior Manager': 4.5, CEO: 5.0 },
  'Technological Literacy':                     { 'Entry-Level Executive': 3.5, Manager: 3.5, 'Senior Manager': 4.0, CEO: 4.5 },
  'Empathy and Active Listening':               { 'Entry-Level Executive': 3.0, Manager: 4.0, 'Senior Manager': 4.5, CEO: 5.0 },
  'Curiosity and Lifelong Learning':            { 'Entry-Level Executive': 3.5, Manager: 4.0, 'Senior Manager': 4.5, CEO: 5.0 },
  'Talent Management':                          { 'Entry-Level Executive': 2.0, Manager: 4.0, 'Senior Manager': 4.5, CEO: 5.0 },
  'Service Orientation and Customer Service':   { 'Entry-Level Executive': 3.5, Manager: 3.5, 'Senior Manager': 4.0, CEO: 4.5 },
};

const ROLE_DESC: Record<RoleName, string> = {
  'Entry-Level Executive': 'Individual contributor executing defined tasks. Needs solid fundamentals: dependable analysis, adaptability, digital fluency, and a learning mindset.',
  Manager: 'Leads a team and owns outcomes. Requires strong people skills - leadership, empathy, and talent development - layered on top of execution ability.',
  'Senior Manager': 'Leads managers and cross-functional initiatives. Demands near-mastery across all ten skills, with high resilience and influence at organizational scale.',
  CEO: 'Sets direction for the entire organization. Requires the highest levels of analytical, creative, and people leadership - full-spectrum skill mastery.',
};

const ROLE_COLOR: Record<RoleName, string> = {
  'Entry-Level Executive': C.sky,
  Manager: C.indigo,
  'Senior Manager': C.purple,
  CEO: C.teal,
};

const ROLE_CHART_LABEL: Record<RoleName, string> = {
  'Entry-Level Executive': 'Entry-Level',
  Manager: 'Manager',
  'Senior Manager': 'Sr. Manager',
  CEO: 'CEO',
};

/* ── Tier metadata ── */

const TIERS = [
  { name: 'Future-Ready Leader Tier', range: '45 - 50', min: 45, color: C.emerald, bg: C.emeraldBg, tx: C.emeraldTx,
    desc: 'Top-tier employability. Workplace-ready across nearly every dimension employers value most.' },
  { name: 'Adaptive Professional Tier', range: '35 - 44', min: 35, color: C.sky, bg: C.skyBg, tx: C.skyTx,
    desc: 'Strong professional foundation with specific, clearly identified skills to sharpen.' },
  { name: 'Emerging Contender Tier', range: '0 - 34', min: 0, color: C.amber, bg: C.amberBg, tx: C.amberTx,
    desc: 'Early-stage employability profile with significant, achievable growth potential.' },
] as const;

function tierInfo(tier: string) {
  return TIERS.find(t => tier.includes(t.name.split(' ')[0])) ?? TIERS[2];
}

const TIER_NARRATIVE: Record<string, { title: string; body: string; interpretation: string; conclusion: string; outlook: string; motivation: string }> = {
  'Future-Ready Leader Tier': {
    title: 'Future-Ready Leader',
    body: 'Your Employability Quotient places you in the highest tier. You demonstrate the analytical rigor, adaptability, people skills, and learning velocity that modern employers prize most. You are positioned not just to secure opportunities, but to lead in them.',
    interpretation: 'Your EQ profile reveals workplace readiness across nearly all ten skills that the World Economic Forum identifies as most critical for the future of work. You combine thinking skills with people skills - a rare and valuable pairing.',
    conclusion: 'You are well-positioned for competitive roles and fast-track responsibility. Your growth edge now is depth: converting broad capability into demonstrated, real-world impact.',
    outlook: 'Seek stretch assignments, leadership opportunities, and visible projects. Your skill base supports management-track roles earlier than most peers.',
    motivation: 'Employability is not a destination - it is a compounding asset. Keep investing in it, and opportunities will keep compounding for you.',
  },
  'Adaptive Professional Tier': {
    title: 'Adaptive Professional',
    body: 'Your Employability Quotient shows a strong, dependable professional profile. You handle most workplace demands well, and the gap between you and the top tier is narrow, specific, and closeable with focused practice.',
    interpretation: 'Your EQ profile demonstrates genuine strength in several dimensions while a few present clear development opportunities. This is the most common profile among high-potential early-career professionals.',
    conclusion: 'You have a solid foundation to build on. The difference between Adaptive and Future-Ready is targeted work on your two or three lowest-scoring skills.',
    outlook: 'With consistent practice on your focus areas, you can realistically reach the Future-Ready Leader tier within 60-90 days of deliberate effort.',
    motivation: 'You are closer to the top than you think. Every focused hour on your gap skills moves you measurably up the employability curve.',
  },
  'Emerging Contender Tier': {
    title: 'Emerging Contender',
    body: 'Your Employability Quotient indicates that your professional skill set is still taking shape. This is not a verdict - it is a starting line. Every skill measured in this assessment is learnable, and this report gives you a precise map of where to begin.',
    interpretation: 'Your EQ profile shows early-stage development across several key workplace skills. The most important insight is specificity: you now know exactly which skills to build first for the biggest employability gains.',
    conclusion: 'Choosing to measure your employability already puts you ahead of most peers. The roadmap in this report converts your results into a concrete development plan.',
    outlook: 'Focus on your three lowest dimensions first. Small, consistent practice compounds - most candidates see measurable movement within 30-60 days.',
    motivation: 'Every expert was once a beginner who refused to stay one. Your growth starts with the first skill you decide to build this week.',
  },
};

function tierNarrative(tier: string) {
  return TIER_NARRATIVE[tierInfo(tier).name] ?? TIER_NARRATIVE['Emerging Contender Tier'];
}

/* ── Per-dimension metadata: description + banded insights + action ── */

const DIM_META: Record<string, { desc: string; why: string; high: string; mid: string; low: string; action: { title: string; body: string } }> = {
  'Analytical Thinking': {
    desc: 'Breaking down complex problems, evaluating evidence, and making sound, data-informed decisions.',
    why: 'Ranked the #1 core skill by employers worldwide. Every role - from analyst to CEO - is ultimately paid to make good decisions.',
    high: 'You demonstrate strong logical reasoning. You break problems into parts, weigh evidence objectively, and reach defensible conclusions - the exact capability that senior decision-making roles are built on.',
    mid: 'You reason well in familiar situations, but speed and consistency drop under ambiguity. Practicing structured frameworks (root-cause analysis, decision matrices) will make your thinking reliable under pressure.',
    low: 'Structured problem-solving is currently a gap. Start small: practice case questions, interpret one chart or dataset daily, and always ask "what evidence supports this?" before concluding.',
    action: { title: 'Build a Structured Thinking Habit', body: 'Solve two case-style problems per week using a fixed framework: define the problem, list hypotheses, gather evidence, decide. Review business or data-driven articles and summarize the core argument in three bullet points. Within 30 days, structured reasoning becomes your default under pressure.' },
  },
  'Resilience, Flexibility, and Agility': {
    desc: 'Staying productive through change, pressure, and setbacks - and adapting quickly when plans shift.',
    why: 'Job roles now change faster than job titles. Employers consistently rank adaptability among their top three hiring criteria.',
    high: 'You absorb change and pressure without losing output quality. Setbacks are treated as information, not threats - a trait that makes you dependable in fast-moving teams and uncertain markets.',
    mid: 'You recover from most setbacks but may lose momentum when several changes stack up. A simple reset ritual - pause, reframe, pick the next action - will shorten your recovery time significantly.',
    low: 'Change and pressure currently cost you significant energy and focus. Build tolerance deliberately: volunteer for small unfamiliar tasks weekly and keep a log of challenges you successfully navigated.',
    action: { title: 'Train Your Change Response', body: 'Once a week, deliberately take on one task outside your comfort zone. After every setback, write three lines: what happened, what you control, and your next concrete step. This trains your brain to move toward problems instead of away from them.' },
  },
  'Leadership and Social Influence': {
    desc: 'Inspiring, persuading, and mobilizing others toward a shared goal - with or without formal authority.',
    why: 'The single biggest differentiator between individual contributor and management-track roles. Influence compounds every other skill you have.',
    high: 'People listen when you speak and follow when you act. You influence outcomes beyond your own tasks - the strongest predictor of early promotion into leadership roles.',
    mid: 'You lead capably in familiar groups but hold back in larger or higher-stakes settings. Volunteering to present, coordinate, or represent your team will convert quiet capability into visible influence.',
    low: 'Influencing others is currently a growth edge. Start with low-stakes reps: speak once in every meeting, take ownership of one small group task, and practice stating recommendations - not just observations.',
    action: { title: 'Take Visible Ownership', body: 'Lead one small initiative per month - a study group, event, project workstream, or team task. Prepare one clear recommendation before every group discussion and voice it. Influence is built through repetitions of visible, useful contribution.' },
  },
  'Creative Thinking': {
    desc: 'Generating original ideas, connecting unrelated concepts, and finding better ways to do things.',
    why: 'As routine work automates, idea generation and novel problem-solving become the human premium employers pay for.',
    high: 'You generate options where others see dead ends. This divergent-thinking strength is exactly what employers need for innovation, strategy, and product work.',
    mid: 'You produce good ideas when prompted but rarely push past the first workable answer. Adopting a "three options minimum" rule before deciding will systematically deepen your creative range.',
    low: 'You currently default to established approaches. Creativity is trainable: practice brainstorming without judging, combine ideas from unrelated fields, and ask "what would this look like if it were easy?"',
    action: { title: 'Practice Divergent Thinking Daily', body: 'Before solving any problem, force yourself to write three genuinely different approaches - even impractical ones. Consume ideas outside your field weekly (a talk, article, or documentary) and note one concept you could borrow. Creative range grows through deliberate cross-pollination.' },
  },
  'Motivation and Self-Awareness': {
    desc: 'Internal drive, ownership of outcomes, and an accurate understanding of your own strengths and limits.',
    why: 'Employers can teach skills; they cannot teach drive. Self-aware, self-motivated candidates need less management and grow faster.',
    high: 'You bring your own fuel. You set goals without being told, own your results, and know where you are strong and where you need support - the profile of a low-maintenance, high-growth hire.',
    mid: 'Your drive is real but inconsistent - strong on interesting work, weaker on routine or ambiguous tasks. Tying daily tasks to a clear personal goal will stabilize your motivation curve.',
    low: 'Your engine currently depends on external pressure. Build internal drive with visible goals: define one 30-day target, break it into weekly checkpoints, and review progress every Sunday.',
    action: { title: 'Run a Weekly Self-Review', body: 'Every week, answer three questions in writing: What did I do well? Where did I fall short and why? What is my single priority next week? This 10-minute ritual builds both self-awareness and sustained motivation - the two traits interviewers probe hardest.' },
  },
  'Technological Literacy': {
    desc: 'Comfort with digital tools, data, and emerging technologies like AI - and the ability to learn new ones fast.',
    why: 'Technology now underpins every function. Digital fluency is no longer an IT skill - it is a baseline employability requirement.',
    high: 'You adopt new tools quickly and use technology to multiply your output. In any team, you will be the person who finds the faster, smarter, more automated way to work.',
    mid: 'You handle everyday tools confidently but hesitate with unfamiliar or advanced ones. Committing to learning one new tool or feature per month will keep you ahead of the fluency curve.',
    low: 'Digital tools currently slow you down rather than speed you up. Prioritize this gap: master spreadsheets and one AI assistant first - these two alone transform your workplace productivity.',
    action: { title: 'Adopt One New Tool Monthly', body: 'Each month, learn one tool that automates part of your work - advanced spreadsheets, an AI assistant, a no-code automation, or a data-visualization tool. Use it on a real task within a week of learning it. Fluency comes from application, not tutorials.' },
  },
  'Empathy and Active Listening': {
    desc: 'Understanding what others think, feel, and need - and making them feel genuinely heard.',
    why: 'Teamwork quality predicts project success more than individual talent. Empathy is the skill that makes teams work.',
    high: 'You read rooms and people accurately. Colleagues trust you with problems early, which gives you information and influence that pure technical skill never earns.',
    mid: 'You listen well when focused but sometimes move to solutions before people feel heard. Practicing "summarize before you respond" will noticeably deepen your working relationships.',
    low: 'Conversations currently run through your perspective more than others\'. Practice one habit: in every discussion, ask one genuine question and paraphrase the answer before giving your view.',
    action: { title: 'Master the Listen-First Habit', body: 'In every meaningful conversation this month, do three things: let the other person finish completely, paraphrase their point back ("So what you\'re saying is..."), and ask one follow-up question before sharing your view. Trust - and influence - follow people who listen this way.' },
  },
  'Curiosity and Lifelong Learning': {
    desc: 'The habit of continuously acquiring new knowledge and skills - your personal rate of growth.',
    why: 'Half of all workplace skills change within five years. Employers hire learning velocity, not just current knowledge.',
    high: 'You learn faster than your environment changes - the ultimate career insurance. Your habit of exploring, questioning, and upskilling means your value rises every year automatically.',
    mid: 'You learn when needed but not always proactively. Converting learning from reactive to scheduled - even 30 minutes weekly - will compound dramatically over a career.',
    low: 'Your learning currently happens only under requirement. Start a minimal habit: 20 minutes, twice a week, on one skill you chose yourself. Consistency matters far more than volume.',
    action: { title: 'Schedule Deliberate Learning', body: 'Block two 30-minute learning sessions per week for one skill you selected deliberately (not one assigned to you). Track a simple streak. After 8 weeks, add a second skill. A visible learning habit is also one of the strongest signals you can show any interviewer.' },
  },
  'Talent Management': {
    desc: 'Bringing out the best in other people - delegating, developing, giving feedback, and building teams.',
    why: 'The defining skill of every management role. Individual output has a ceiling; developing others does not.',
    high: 'You naturally develop the people around you - teaching, delegating, and giving usable feedback. This is the rarest skill in this assessment and the fastest route to leadership roles.',
    mid: 'You support teammates well but rarely take deliberate responsibility for someone else\'s growth. Mentoring one junior or peer formally would convert instinct into demonstrated capability.',
    low: 'Developing others is not yet part of your toolkit - which is normal early in a career. Begin with peer teaching: explain concepts to classmates or colleagues and practice giving specific, kind feedback.',
    action: { title: 'Mentor One Person', body: 'Choose one junior peer, classmate, or teammate and deliberately help them grow for 60 days: share what you know, review their work, give one specific piece of feedback weekly. Teaching others is also the fastest way to deepen your own mastery.' },
  },
  'Service Orientation and Customer Service': {
    desc: 'Anticipating what users, customers, and colleagues need - and delivering beyond expectation.',
    why: 'Every organization exists to serve someone. People who think customer-first become the people organizations cannot afford to lose.',
    high: 'You instinctively think from the other side of the table - what the user, customer, or colleague actually needs. This mindset makes your work consistently more valuable than the task description.',
    mid: 'You deliver what is asked reliably, but less often what was needed beyond the ask. Before finishing any task, asking "what would make this genuinely useful to the receiver?" will lift your work a tier.',
    low: 'Your focus currently ends at task completion rather than receiver satisfaction. Practice the extra step: after every deliverable, ask the receiver one question about what would have made it better.',
    action: { title: 'Adopt the Receiver-First Check', body: 'Before submitting any piece of work, spend two minutes answering: Who receives this? What do they need it for? What one improvement would help them most? Then make that improvement. This tiny habit is what separates service-oriented professionals from task-completers.' },
  },
};

/* ─────────────────────────── Helpers ─────────────────────────────────────── */

function clampScore(v: number): number {
  return Math.max(0, Math.min(5, Number.isFinite(v) ? v : 0));
}

function dimStatus(score: number): { label: string; color: string; bg: string; tx: string } {
  if (score >= 4) return { label: 'Strong', color: C.emerald, bg: C.emeraldBg, tx: C.emeraldTx };
  if (score >= 3) return { label: 'Developing', color: C.sky, bg: C.skyBg, tx: C.skyTx };
  return { label: 'Focus Area', color: C.amber, bg: C.amberBg, tx: C.amberTx };
}

function dimInsight(dim: string, score: number): string {
  const meta = DIM_META[dim];
  if (!meta) return '';
  if (score >= 4) return meta.high;
  if (score >= 3) return meta.mid;
  return meta.low;
}

type RankedDim = { dim: string; score: number; pct: number };

function rankedDimensions(scores: Record<string, number>): RankedDim[] {
  return DIMENSIONS.map(dim => {
    const score = clampScore(Number(scores[dim] ?? 0));
    return { dim, score, pct: Math.round((score / 5) * 100) };
  }).sort((a, b) => b.score - a.score);
}

type RoleFit = {
  role: RoleName;
  fitPct: number;          // 0-100 average of min(score/benchmark, 1)
  meets: number;           // dimensions meeting the benchmark
  gaps: { dim: string; score: number; benchmark: number; gap: number }[];
};

function roleFitAnalysis(scores: Record<string, number>): { fits: RoleFit[]; recommended: RoleFit; nextTarget: RoleFit | null } {
  const fits: RoleFit[] = ROLES.map(role => {
    let sum = 0;
    let meets = 0;
    const gaps: RoleFit['gaps'] = [];
    for (const dim of DIMENSIONS) {
      const score = clampScore(Number(scores[dim] ?? 0));
      const benchmark = ROLE_BENCHMARKS[dim][role];
      sum += Math.min(score / benchmark, 1);
      if (score >= benchmark) {
        meets += 1;
      } else {
        gaps.push({ dim, score, benchmark, gap: Number((benchmark - score).toFixed(1)) });
      }
    }
    gaps.sort((a, b) => b.gap - a.gap);
    return { role, fitPct: Math.round((sum / DIMENSIONS.length) * 100), meets, gaps };
  });

  // Recommended role: the most senior role where the candidate meets at least 7
  // of 10 benchmarks and overall fit is >= 90%. Falls back down the ladder.
  let recommended = fits[0];
  for (let i = fits.length - 1; i >= 0; i--) {
    if (fits[i].meets >= 7 && fits[i].fitPct >= 90) { recommended = fits[i]; break; }
  }

  const recIdx = ROLES.indexOf(recommended.role);
  const nextTarget = recIdx < ROLES.length - 1 ? fits[recIdx + 1] : null;
  return { fits, recommended, nextTarget };
}

function fitBadge(fitPct: number, meets: number): { label: string; color: string; bg: string; tx: string } {
  if (meets >= 8 && fitPct >= 95) return { label: 'Ready Now', color: C.emerald, bg: C.emeraldBg, tx: C.emeraldTx };
  if (fitPct >= 85) return { label: 'Nearly Ready', color: C.sky, bg: C.skyBg, tx: C.skyTx };
  if (fitPct >= 70) return { label: 'Developing', color: C.amber, bg: C.amberBg, tx: C.amberTx };
  return { label: 'Future Goal', color: C.rose, bg: C.roseBg, tx: C.roseTx };
}

function buildRecommendations(scores: Record<string, number>): { title: string; body: string }[] {
  const ranked = rankedDimensions(scores);
  const weakestFirst = [...ranked].reverse();
  const recs: { title: string; body: string }[] = [];

  for (const item of weakestFirst) {
    if (item.score <= 3 && DIM_META[item.dim]) recs.push(DIM_META[item.dim].action);
    if (recs.length >= 5) break;
  }
  // Pad with the strongest-leverage general practices if few gaps exist
  const general: { title: string; body: string }[] = [
    { title: 'Build Evidence of Your Skills', body: 'Employability is proven, not claimed. For each of your strongest three dimensions, create one piece of evidence this quarter: a project, a certificate, a portfolio artifact, or a measurable result you can describe in one sentence in an interview.' },
    { title: 'Re-assess Every 8 Weeks', body: 'Retake the Employability Quotient assessment every 8 weeks. Regular measurement creates a feedback loop between effort and outcome, and your dimension trend line becomes powerful evidence of growth mindset for any recruiter.' },
    { title: 'Find a Skills Accountability Partner', body: 'Share this report with a mentor, teacher, or peer and agree on a monthly 20-minute check-in. External accountability roughly doubles follow-through on development plans, and their perspective will reveal blind spots self-assessment cannot.' },
    { title: 'Practice Interview Storytelling', body: 'Convert your top strengths into STAR stories (Situation, Task, Action, Result). Employers do not experience your skills directly - they experience your stories about them. Two polished stories per strength dimension is the target.' },
  ];
  for (const g of general) {
    if (recs.length >= 8) break;
    recs.push(g);
  }
  return recs.slice(0, 8);
}

/* ─────────────────────────── Chart Components ────────────────────────────── */

/** 270° donut gauge showing overall score out of 50 */
function DonutGauge({ score, color }: { score: number; color: string }) {
  const CX = 52, CY = 52, R = 38, SW = 9, W = 104, H = 104;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const start = toRad(135);
  const filled = toRad(135 + (Math.max(0, Math.min(MAX_SCORE, score)) / MAX_SCORE) * 270);
  const bgEnd = toRad(405);
  const arc = (a1: number, a2: number) => {
    const x1 = CX + R * Math.cos(a1), y1 = CY + R * Math.sin(a1);
    const x2 = CX + R * Math.cos(a2), y2 = CY + R * Math.sin(a2);
    const lg = a2 - a1 > Math.PI ? 1 : 0;
    return `M${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R},0,${lg},1,${x2.toFixed(2)},${y2.toFixed(2)}`;
  };
  return (
    <View style={{ width: W, height: H, alignItems: 'center', justifyContent: 'center', position: 'relative' } as any}>
      <Svg width={W} height={H}>
        <Path d={arc(start, bgEnd)} fill="none" stroke={C.slate200} strokeWidth={SW} strokeLinecap="round" />
        {score > 0 && <Path d={arc(start, filled)} fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round" />}
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', top: 32 } as any}>
        <Text style={{ fontSize: 19, fontWeight: 700, color, fontFamily: 'Inter', lineHeight: 1 }}>{score}</Text>
        <Text style={{ fontSize: 7, fontWeight: 400, color: C.slate400, fontFamily: 'Inter' }}>/ {MAX_SCORE}</Text>
      </View>
    </View>
  );
}

/** Horizontal score bar (0-5 scale) */
function ScoreBar({ score, color, height = 7 }: { score: number; color: string; height?: number }) {
  const pct = Math.max(0, Math.min(100, (score / 5) * 100));
  return (
    <View style={{ height, backgroundColor: C.slate100, borderRadius: height / 2, overflow: 'hidden' }}>
      <View style={{ height, width: `${pct}%`, backgroundColor: color, borderRadius: height / 2 }} />
    </View>
  );
}

/** 10-axis radar chart with labels around the perimeter */
function SkillRadar({ scores, compact = false }: { scores: Record<string, number>; compact?: boolean }) {
  const W = compact ? 248 : 320;
  const H = compact ? 196 : 252;
  const CX = W / 2;
  const CY = H / 2;
  const R = compact ? 58 : 78;
  const labelOffset = compact ? 18 : 24;
  const labelTop = compact ? 16 : 20;
  const labelW = compact ? 56 : 68;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / DIMENSIONS.length;

  const gridPoly = (frac: number) =>
    DIMENSIONS.map((_, i) => {
      const a = angle(i);
      return `${(CX + Math.cos(a) * R * frac).toFixed(1)},${(CY + Math.sin(a) * R * frac).toFixed(1)}`;
    }).join(' ');

  const dataPoly = DIMENSIONS.map((dim, i) => {
    const a = angle(i);
    const frac = clampScore(Number(scores[dim] ?? 0)) / 5;
    return `${(CX + Math.cos(a) * R * frac).toFixed(1)},${(CY + Math.sin(a) * R * frac).toFixed(1)}`;
  }).join(' ');

  return (
    <View style={{ width: W, height: H, position: 'relative', alignSelf: 'center' } as any}>
      <Svg width={W} height={H}>
        {[0.25, 0.5, 0.75, 1].map(f => (
          <Polygon key={f} points={gridPoly(f)} fill="none" stroke={f === 1 ? C.slate300 : C.slate200} strokeWidth={f === 1 ? 1 : 0.5} />
        ))}
        {DIMENSIONS.map((_, i) => {
          const a = angle(i);
          return <Line key={i} x1={CX} y1={CY} x2={CX + Math.cos(a) * R} y2={CY + Math.sin(a) * R} stroke={C.slate300} strokeWidth={0.6} />;
        })}
        <Polygon points={dataPoly} fill={C.teal} fillOpacity={0.18} stroke={C.teal} strokeWidth={1.8} />
        {DIMENSIONS.map((dim, i) => {
          const a = angle(i);
          const frac = clampScore(Number(scores[dim] ?? 0)) / 5;
          const status = dimStatus(clampScore(Number(scores[dim] ?? 0)));
          return (
            <Circle key={dim} cx={CX + Math.cos(a) * R * frac} cy={CY + Math.sin(a) * R * frac} r={3.4}
              fill={status.color} stroke={C.white} strokeWidth={1} />
          );
        })}
        <Circle cx={CX} cy={CY} r={2} fill={C.slate300} />
      </Svg>
      {/* Perimeter labels */}
      {DIMENSIONS.map((dim, i) => {
        const a = angle(i);
        const lx = CX + Math.cos(a) * (R + labelOffset);
        const ly = CY + Math.sin(a) * (R + labelTop);
        const score = clampScore(Number(scores[dim] ?? 0));
        return (
          <View key={dim} style={{ position: 'absolute', left: lx - labelW / 2, top: ly - 9, width: labelW, alignItems: 'center' } as any}>
            <Text style={{ fontSize: compact ? 5.8 : 6.4, fontWeight: 700, color: C.slate700, fontFamily: 'Inter', textAlign: 'center' }}>{DIM_TINY[dim]}</Text>
            <Text style={{ fontSize: compact ? 5.6 : 6.2, fontWeight: 700, color: dimStatus(score).color, fontFamily: 'Inter' }}>{score}/5</Text>
          </View>
        );
      })}
    </View>
  );
}

/** Vertical grouped bars: your fit % for each of the four roles */
function RoleFitChart({ fits }: { fits: RoleFit[] }) {
  const W = 456, H = 118, AXIS_W = 24, PT = 6, PB = 2;
  const CHART_W = W - AXIS_W;
  const cH = H - PT - PB;
  const GAP = 18;
  const barW = (CHART_W - GAP * (fits.length - 1)) / fits.length;
  const axisY = PT + cH;
  return (
    <View style={{ width: W, alignSelf: 'center' }}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: AXIS_W, height: H, paddingTop: PT - 3, paddingBottom: PB - 2, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 4 }}>
          {[100, 75, 50, 25, 0].map(v => (
            <Text key={v} style={{ fontSize: 5.6, color: C.slate400, fontFamily: 'Inter', fontWeight: 400 }}>{v}%</Text>
          ))}
        </View>
        <Svg width={CHART_W} height={H}>
          {[100, 75, 50, 25, 0].map(tick => {
            const y = PT + cH - (tick / 100) * cH;
            return <Line key={tick} x1={0} y1={y} x2={CHART_W} y2={y} stroke={tick === 0 ? C.slate400 : C.slate200} strokeWidth={tick === 0 ? 1.2 : 0.5} />;
          })}
          {fits.map((f, i) => {
            const h = (f.fitPct / 100) * cH;
            const x = i * (barW + GAP);
            return <Rect key={f.role} x={x} y={axisY - h} width={barW} height={h} fill={ROLE_COLOR[f.role]} rx={3} />;
          })}
        </Svg>
      </View>
      <View style={{ flexDirection: 'row', marginLeft: AXIS_W, marginTop: 5 }}>
        {fits.map((f, i) => (
          <View key={f.role} style={{ width: barW, alignItems: 'center', marginRight: i < fits.length - 1 ? GAP : 0 }}>
            <Text style={{ fontSize: 7.6, fontWeight: 700, color: ROLE_COLOR[f.role], fontFamily: 'Inter' }}>{f.fitPct}%</Text>
            <Text style={{ fontSize: 6.4, fontWeight: 600, color: C.slate600, fontFamily: 'Inter', textAlign: 'center', marginTop: 1 }}>{ROLE_CHART_LABEL[f.role]}</Text>
            <Text style={{ fontSize: 5.8, fontWeight: 400, color: C.slate400, fontFamily: 'Inter', textAlign: 'center', marginTop: 1 }}>{f.meets}/10 met</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ─────────────────────────── Layout Parts ────────────────────────────────── */

function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={S.header}>
      <View>
        <Text style={S.headerTitle}>{title}</Text>
        {subtitle ? <Text style={S.headerSub}>{subtitle}</Text> : null}
      </View>
      <View style={S.headerRight}>
        <Text style={S.headerBrand}>EMPLOYABILITY QUOTIENT (EQ)</Text>
        <Text style={S.headerPg} render={({ pageNumber }) => `Page ${pageNumber}`} />
      </View>
    </View>
  );
}

function SectionBand({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={S.sectionBand}>
      <Text style={S.sectionBandTitle}>{title}</Text>
      {sub ? <Text style={S.sectionBandSub}>{sub}</Text> : null}
    </View>
  );
}

function StatusPill({ status, style }: { status: { label: string; bg: string; tx: string }; style?: any }) {
  return (
    <View style={[S.pill, { backgroundColor: status.bg }, style]}>
      <Text style={[S.pillText, { color: status.tx }]}>{status.label}</Text>
    </View>
  );
}

function PageFooter({ name, date }: { name: string; date: string }) {
  return (
    <View style={[S.footer, S.footerFixed]} fixed>
      <Text style={S.footerL}>Employability Quotient (EQ) Report · {name}</Text>
      <Text style={S.footerR}>Generated on {date} · Confidential</Text>
    </View>
  );
}

/* ─────────────────────────── StyleSheet ──────────────────────────────────── */

const S = StyleSheet.create({
  contentPage: { position: 'relative', backgroundColor: C.white, paddingHorizontal: 40, paddingTop: 32, paddingBottom: 74, fontFamily: 'Inter', fontWeight: 400 },
  coverPage:   { backgroundColor: C.dark, padding: 0, fontFamily: 'Inter', fontWeight: 400 },
  backCoverPage: { padding: 0, fontFamily: 'Inter', fontWeight: 400 },
  backCoverBg: { width: 595, height: 841, position: 'absolute', top: 0, left: 0 },
  finalPage:   { position: 'relative', backgroundColor: C.dark, padding: 0, fontFamily: 'Inter', fontWeight: 400 },
  finalInner:  { flex: 1, flexDirection: 'column', paddingHorizontal: 48, paddingTop: 44, paddingBottom: 44 },

  // Cover
  coverInner: { flex: 1, paddingHorizontal: 56, paddingVertical: 52, flexDirection: 'column', justifyContent: 'space-between' },
  coverTopRow: { flexDirection: 'row', alignItems: 'center' },
  coverLogoCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.teal, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  coverLogoText: { fontSize: 15, fontWeight: 700, color: C.white },
  coverBrandName: { fontSize: 14, fontWeight: 700, color: C.white, letterSpacing: 1 },
  coverBrandSub: { fontSize: 8, fontWeight: 400, color: C.slate400, marginTop: 2 },
  coverCenter: { flex: 1, justifyContent: 'center', paddingVertical: 32 },
  coverEyebrow: { fontSize: 8, fontWeight: 700, color: '#2dd4bf', letterSpacing: 2, marginBottom: 10 },
  coverMainTitle: { fontSize: 33, fontWeight: 700, color: C.white, lineHeight: 1.2, marginBottom: 6 },
  coverSubtitle: { fontSize: 12.5, fontWeight: 400, color: C.slate400, marginBottom: 26 },
  coverDivider: { height: 2, width: 52, backgroundColor: C.teal, marginBottom: 26 },
  coverStudentName: { fontSize: 25, fontWeight: 700, color: C.white, marginBottom: 4 },
  coverStudentLabel: { fontSize: 10, fontWeight: 400, color: C.slate500, marginBottom: 20 },
  coverBadgeRow: { flexDirection: 'row', marginTop: 4 },
  coverScoreBadge: { borderRadius: 10, backgroundColor: C.navy, paddingHorizontal: 18, paddingVertical: 12, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  coverScoreNum: { fontSize: 28, fontWeight: 700, color: '#2dd4bf' },
  coverScoreLabel: { fontSize: 7.5, fontWeight: 400, color: C.slate400, textAlign: 'center', marginTop: 2 },
  coverTierBadge: { borderRadius: 10, paddingHorizontal: 18, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  coverTierText: { fontSize: 15, fontWeight: 700 },
  coverTierLabel: { fontSize: 7.5, fontWeight: 400, textAlign: 'center', marginTop: 2 },
  coverBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: C.navy, paddingTop: 14 },
  coverBottomText: { fontSize: 8, fontWeight: 400, color: C.slate500 },
  coverConfidential: { fontSize: 8, fontWeight: 700, color: C.slate400, borderWidth: 1, borderColor: C.navy, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },

  // Header / footer
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: C.slate200, paddingBottom: 10, marginBottom: 16 },
  headerTitle: { fontSize: 16, fontWeight: 700, color: C.dark },
  headerSub: { fontSize: 8.5, fontWeight: 400, color: C.slate500, marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  headerBrand: { fontSize: 8.5, fontWeight: 700, color: C.teal, letterSpacing: 1 },
  headerPg: { fontSize: 7.5, fontWeight: 400, color: C.slate400, marginTop: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.slate200, paddingTop: 8 },
  footerFixed: { position: 'absolute', left: 40, right: 40, bottom: 28 },
  footerL: { fontSize: 7.5, fontWeight: 400, color: C.slate400 },
  footerR: { fontSize: 7.5, fontWeight: 400, color: C.slate400 },

  // Section band
  sectionBand: { backgroundColor: C.tealBg, borderLeftWidth: 3, borderLeftColor: C.teal, paddingHorizontal: 12, paddingVertical: 7, marginBottom: 12, borderRadius: 4 },
  sectionBandTitle: { fontSize: 10, fontWeight: 700, color: C.dark },
  sectionBandSub: { fontSize: 8, fontWeight: 400, color: C.slate500, marginTop: 2 },

  // KPI row
  kpiRow: { flexDirection: 'row', marginBottom: 14 },
  kpiCard: { flex: 1, backgroundColor: C.slate50, borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 12, marginRight: 10 },
  kpiCardLast: { flex: 1, backgroundColor: C.slate50, borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 12 },
  kpiVal: { fontSize: 22, fontWeight: 700, color: C.dark, marginBottom: 2 },
  kpiLabel: { fontSize: 7.5, fontWeight: 700, color: C.slate500, letterSpacing: 0.5 },
  kpiSub: { fontSize: 7.5, fontWeight: 400, color: C.slate400, marginTop: 2 },

  // Tier card
  tierCard: { borderRadius: 10, borderWidth: 1, borderColor: C.slate200, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  tierCardRight: { flex: 1 },
  tierCardTitle: { fontSize: 13, fontWeight: 700, color: C.dark, marginBottom: 4 },
  tierCardBody: { fontSize: 8.5, fontWeight: 400, color: C.slate600, lineHeight: 1.55 },

  // Pills
  pill: { borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2.5, alignSelf: 'flex-start' },
  pillText: { fontSize: 7.5, fontWeight: 700 },

  // Tables
  tableHead: { flexDirection: 'row', backgroundColor: C.slate100, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 4, marginBottom: 2, alignItems: 'center' },
  tableRow: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 5.5, borderBottomWidth: 1, borderBottomColor: C.slate100, alignItems: 'center' },
  tableRowAlt: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 5.5, backgroundColor: C.slate50, borderBottomWidth: 1, borderBottomColor: C.slate100, alignItems: 'center' },
  th: { fontSize: 7.3, fontWeight: 700, color: C.slate500 },
  td: { fontSize: 7.8, fontWeight: 400, color: C.slate700 },

  // Cards
  card: { borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 10, marginBottom: 8 },
  cardTitle: { fontSize: 9.5, fontWeight: 700, color: C.dark, marginBottom: 3 },
  cardBody: { fontSize: 8, fontWeight: 400, color: C.slate600, lineHeight: 1.55 },

  // Skill framework grid
  skillCell: { width: '48.6%', borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 9, marginBottom: 8 },
  skillCellTitle: { fontSize: 8.6, fontWeight: 700, color: C.dark, marginBottom: 2.5 },
  skillCellBody: { fontSize: 7.2, fontWeight: 400, color: C.slate600, lineHeight: 1.45 },
  skillCellWhy: { fontSize: 6.8, fontWeight: 600, color: C.tealDark, lineHeight: 1.4, marginTop: 4 },

  // Dimension overview rows
  dimRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8.5 },
  dimRowLabel: { width: 128, fontSize: 8, fontWeight: 600, color: C.slate700, paddingRight: 6 },
  dimRowBar: { flex: 1, marginHorizontal: 6 },
  dimRowScore: { width: 30, fontSize: 8.5, fontWeight: 700, color: C.slate700, textAlign: 'right' },

  // Deep dive card
  deepCard: { borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 10, marginBottom: 9 },
  deepHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  deepTitle: { fontSize: 10, fontWeight: 700, color: C.dark },
  deepDesc: { fontSize: 7.3, fontWeight: 400, color: C.slate500, marginBottom: 5 },
  deepInsight: { fontSize: 8, fontWeight: 400, color: C.slate700, lineHeight: 1.55, marginTop: 6 },

  // Recommendation cards
  recCard: { borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'flex-start' },
  recNum: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.teal, alignItems: 'center', justifyContent: 'center', marginRight: 10, flexShrink: 0 },
  recNumText: { fontSize: 8.5, fontWeight: 700, color: C.white },
  recTitle: { fontSize: 9.5, fontWeight: 700, color: C.dark, marginBottom: 3 },
  recBody: { fontSize: 7.8, fontWeight: 400, color: C.slate600, lineHeight: 1.55 },

  // Roadmap
  phaseCard: { borderRadius: 8, borderWidth: 1, borderColor: C.slate200, marginBottom: 10, overflow: 'hidden' },
  phaseHead: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 7 },
  phaseTitle: { fontSize: 9.5, fontWeight: 700, color: C.white },
  phaseSub: { fontSize: 7, fontWeight: 400, color: 'rgba(255,255,255,0.85)', marginTop: 1 },
  phaseBody: { padding: 10 },
  phaseFocus: { fontSize: 7.6, fontWeight: 400, color: C.slate600, lineHeight: 1.5, marginBottom: 8 },
  phaseColTitle: { fontSize: 7, fontWeight: 700, marginBottom: 4, fontFamily: 'Inter' },
  phaseHabitBox: { backgroundColor: C.slate50, borderRadius: 5, padding: 6, marginTop: 8, flexDirection: 'row', alignItems: 'flex-start' },
  phaseHabitLabel: { fontSize: 7, fontWeight: 700, color: C.tealDark, marginRight: 6, flexShrink: 0, fontFamily: 'Inter' },
  phaseHabitText: { fontSize: 7, fontWeight: 400, color: C.slate600, flex: 1, lineHeight: 1.45, fontFamily: 'Inter' },
  guidanceCard: { borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 10, marginBottom: 9 },
  guidanceHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  guidanceDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  guidanceTitle: { fontSize: 10, fontWeight: 700, color: C.dark, fontFamily: 'Inter' },
  guidancePoint: { flexDirection: 'row', paddingLeft: 4, marginBottom: 4.5 },
  guidanceBullet: { fontSize: 8, fontWeight: 700, marginRight: 6, width: 10, textAlign: 'center', fontFamily: 'Inter' },
  guidanceText: { fontSize: 7.8, fontWeight: 400, color: C.slate700, flex: 1, lineHeight: 1.55, fontFamily: 'Inter' },
  faqCard: { borderRadius: 8, backgroundColor: C.slate50, padding: 10, marginBottom: 7, borderLeftWidth: 3 },
  faqQuestion: { fontSize: 9.2, fontWeight: 700, color: C.dark, marginBottom: 4, fontFamily: 'Inter' },
  faqAnswer: { fontSize: 7.9, fontWeight: 400, color: C.slate600, lineHeight: 1.55, fontFamily: 'Inter' },
  bulletRow: { flexDirection: 'row', marginBottom: 4.5 },
  bulletDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.teal, marginTop: 4, marginRight: 7, flexShrink: 0 },
  bulletText: { flex: 1, fontSize: 7.8, fontWeight: 400, color: C.slate700, lineHeight: 1.5 },

  // Final page
  finalHeaderBadge: { alignSelf: 'flex-start', borderRadius: 99, backgroundColor: C.navy, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 16 },
  finalHeaderBadgeText: { fontSize: 8, fontWeight: 700, color: '#2dd4bf', letterSpacing: 1 },
  finalTitle: { fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 3 },
  finalSub: { fontSize: 8.5, fontWeight: 400, color: C.slate400, marginBottom: 14 },
  finalCard: { backgroundColor: C.navy, borderRadius: 8, padding: 10, borderLeftWidth: 3, borderLeftColor: C.teal },
  finalCardTitle: { fontSize: 8.8, fontWeight: 700, color: C.white, marginBottom: 3 },
  finalCardBody: { fontSize: 7.4, fontWeight: 400, color: C.slate400, lineHeight: 1.5 },
  finalMotivationBox: { borderRadius: 8, padding: 14, marginTop: 12, backgroundColor: C.navy, alignItems: 'center' },
  finalMotivationText: { fontSize: 10.5, fontWeight: 700, color: C.white, textAlign: 'center', lineHeight: 1.5, marginBottom: 5 },
  finalMotivationSub: { fontSize: 7, fontWeight: 400, color: C.slate400, textAlign: 'center' },
  finalBranding: { marginTop: 'auto', paddingTop: 10, borderTopWidth: 1, borderTopColor: C.navy, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  finalBrandingText: { fontSize: 8, fontWeight: 400, color: C.slate500 },

  // Layout helpers
  twoCol: { flexDirection: 'row' },
  colL: { flex: 1, marginRight: 12 },
  colR: { flex: 1 },
});

/* ─────────────────────────── Page 1 - Cover ──────────────────────────────── */

function CoverPage({ d }: { d: EQReportData }) {
  const t = tierInfo(d.tier);
  return (
    <Page size="A4" style={S.coverPage}>
      <Svg width={595} height={841} style={{ position: 'absolute', top: 0, left: 0 } as any}>
        <Circle cx={545} cy={90} r={190} fill={C.teal} fillOpacity={0.06} />
        <Circle cx={60} cy={790} r={160} fill={C.emerald} fillOpacity={0.05} />
        <Circle cx={480} cy={700} r={110} fill={C.sky} fillOpacity={0.04} />
        <Rect x={0} y={0} width={3} height={841} fill={C.teal} fillOpacity={0.6} />
      </Svg>
      <View style={S.coverInner}>
        <View style={S.coverTopRow}>
          <View style={S.coverLogoCircle}><Text style={S.coverLogoText}>EQ</Text></View>
          <View>
            <Text style={S.coverBrandName}>EMPLOYABILITY QUOTIENT</Text>
            <Text style={S.coverBrandSub}>Future-of-Work Skills Analytics</Text>
          </View>
        </View>

        <View style={S.coverCenter}>
          <Text style={S.coverEyebrow}>PREMIUM CAREER READINESS REPORT</Text>
          <Text style={S.coverMainTitle}>Employability{'\n'}Quotient Report</Text>
          <Text style={S.coverSubtitle}>A 10-dimension analysis of workplace readiness, role fit, and skill growth priorities</Text>
          <View style={S.coverDivider} />
          <Text style={S.coverStudentName}>{d.studentName}</Text>
          <Text style={S.coverStudentLabel}>Candidate</Text>
          <View style={S.coverBadgeRow}>
            <View style={S.coverScoreBadge}>
              <Text style={S.coverScoreNum}>{d.overallScore}</Text>
              <Text style={S.coverScoreLabel}>EQ SCORE / {MAX_SCORE}</Text>
            </View>
            <View style={[S.coverTierBadge, { backgroundColor: t.bg }]}>
              <Text style={[S.coverTierText, { color: t.tx }]}>{tierNarrative(d.tier).title}</Text>
              <Text style={[S.coverTierLabel, { color: t.tx }]}>EQ TIER · {d.overallPercentage}% READINESS</Text>
            </View>
          </View>
        </View>

        <View style={S.coverBottom}>
          <Text style={S.coverBottomText}>Generated on {d.generatedDate}</Text>
          <Text style={S.coverConfidential}>CONFIDENTIAL</Text>
        </View>
      </View>
    </Page>
  );
}

/* ─────────────────────────── Page 2 - Executive Summary ─────────────────── */

function ExecutiveSummaryPage({ d }: { d: EQReportData }) {
  const t = tierInfo(d.tier);
  const narrative = tierNarrative(d.tier);
  const ranked = rankedDimensions(d.dimensionScores);
  const strongCount = ranked.filter(r => r.score >= 4).length;
  const focusCount = ranked.filter(r => r.score <= 2).length;

  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title="Executive Summary" subtitle="EQ score overview and employability profile" />

      <View style={S.kpiRow}>
        <View style={S.kpiCard}>
          <Text style={[S.kpiVal, { color: t.color }]}>{d.overallScore}</Text>
          <Text style={S.kpiLabel}>EQ SCORE</Text>
          <Text style={S.kpiSub}>out of {MAX_SCORE}</Text>
        </View>
        <View style={S.kpiCard}>
          <Text style={[S.kpiVal, { color: C.teal }]}>{d.overallPercentage}%</Text>
          <Text style={S.kpiLabel}>READINESS</Text>
          <Text style={S.kpiSub}>overall percentage</Text>
        </View>
        <View style={S.kpiCard}>
          <Text style={[S.kpiVal, { color: C.emerald }]}>{strongCount}</Text>
          <Text style={S.kpiLabel}>STRONG SKILLS</Text>
          <Text style={S.kpiSub}>scored 4+ / 5</Text>
        </View>
        <View style={S.kpiCardLast}>
          <Text style={[S.kpiVal, { color: focusCount > 0 ? C.amber : C.slate700 }]}>{focusCount}</Text>
          <Text style={S.kpiLabel}>FOCUS AREAS</Text>
          <Text style={S.kpiSub}>scored 2 or below</Text>
        </View>
      </View>

      <View style={S.tierCard}>
        <View style={{ marginRight: 16 }}>
          <DonutGauge score={d.overallScore} color={t.color} />
        </View>
        <View style={S.tierCardRight}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Text style={[S.tierCardTitle, { marginRight: 8 }]}>{narrative.title}</Text>
            <StatusPill status={{ label: t.name, bg: t.bg, tx: t.tx }} />
          </View>
          <Text style={S.tierCardBody}>{narrative.body}</Text>
        </View>
      </View>

      <SectionBand title="EQ Tier Scale Reference" sub="Where your score sits on the employability readiness spectrum" />
      {TIERS.map(tier => (
        <View key={tier.name} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.slate100 }}>
          <View style={[S.pill, { backgroundColor: tier.bg, width: 128, marginRight: 10 }]}>
            <Text style={[S.pillText, { color: tier.tx }]}>{tier.name.replace(' Tier', '')}</Text>
          </View>
          <Text style={[S.td, { width: 44, fontWeight: 700, color: tier.color }]}>{tier.range}</Text>
          <Text style={[S.td, { flex: 1 }]}>{tier.desc}</Text>
          {tier.name === t.name && (
            <View style={{ backgroundColor: t.bg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8 }}>
              <Text style={{ fontSize: 7, fontWeight: 700, color: t.tx, fontFamily: 'Inter' }}>YOU: {d.overallScore}/{MAX_SCORE}</Text>
            </View>
          )}
        </View>
      ))}

      <View style={[S.card, { marginTop: 14, backgroundColor: C.tealBg, borderColor: '#99f6e4' }]}>
        <Text style={S.cardTitle}>How to read this report</Text>
        <Text style={S.cardBody}>
          Pages 3-7 analyze your ten skill dimensions in depth. Pages 8-10 map your profile against real career-role benchmarks. Pages 11-13 provide strengths analysis and personalized recommendations. Pages 14-19 deliver your 60-day goals & tasks roadmap, guidance & mentorship, clarity FAQs, and final summary.
        </Text>
      </View>

      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────────────── Page 3 - The EQ Framework ──────────────────── */

function FrameworkPage({ d }: { d: EQReportData }) {
  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title="The EQ Skill Framework" subtitle="The ten skills that define employability in the modern workplace" />

      <View style={[S.card, { backgroundColor: C.slate50 }]}>
        <Text style={S.cardTitle}>Why these ten skills?</Text>
        <Text style={S.cardBody}>
          The Employability Quotient measures the skill families that global employer research - including the World Economic Forum&apos;s Future of Jobs studies - consistently ranks as the most in-demand for the coming decade. Technical knowledge gets you considered; these ten transferable skills get you hired, promoted, and retained. Each dimension was assessed with five scenario-based questions and is scored out of 5.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 4 }}>
        {DIMENSIONS.map((dim, i) => (
          <View key={dim} style={S.skillCell}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
              <View style={{ width: 15, height: 15, borderRadius: 7.5, backgroundColor: C.tealBg, alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                <Text style={{ fontSize: 7.5, fontWeight: 700, color: C.tealDark, fontFamily: 'Inter' }}>{i + 1}</Text>
              </View>
              <Text style={S.skillCellTitle}>{DIM_SHORT[dim]}</Text>
            </View>
            <Text style={S.skillCellBody}>{DIM_META[dim].desc}</Text>
            <Text style={S.skillCellWhy}>Why it matters: {DIM_META[dim].why}</Text>
          </View>
        ))}
      </View>

      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────────────── Page 4 - Skill Overview & Radar ─────────────── */

function SkillOverviewPage({ d }: { d: EQReportData }) {
  const ranked = rankedDimensions(d.dimensionScores);
  const top = ranked[0];
  const bottom = ranked[ranked.length - 1];
  const balance = top.score - bottom.score;

  const shapeSummary =
    balance <= 1
      ? `Well-balanced profile - strongest (${DIM_SHORT[top.dim]}, ${top.score}/5) and weakest (${DIM_SHORT[bottom.dim]}, ${bottom.score}/5) are close. Focus on raising the whole shape outward.`
      : balance <= 2
      ? `Moderate variation - ${DIM_SHORT[top.dim]} (${top.score}/5) leads while ${DIM_SHORT[bottom.dim]} (${bottom.score}/5) trails. Lean on peaks; practice the trailing dimensions.`
      : `Spiked profile - strong peak in ${DIM_SHORT[top.dim]} (${top.score}/5) with a dip in ${DIM_SHORT[bottom.dim]} (${bottom.score}/5). Closing your largest gap unlocks the biggest employability gain.`;

  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title="Skill Score Overview & Radar" subtitle="Ranked dimension scores and your employability shape at a glance" />

      <SectionBand title="Dimension Scores" sub="Each skill scored out of 5 · bar shows relative strength within the row" />

      <View style={S.tableHead}>
        <Text style={[S.th, { flex: 1.15 }]}>SKILL</Text>
        <Text style={[S.th, { flex: 1 }]}>STRENGTH</Text>
        <Text style={[S.th, { width: 46, textAlign: 'center' }]}>SCORE</Text>
        <Text style={[S.th, { width: 38, textAlign: 'center' }]}>%</Text>
        <Text style={[S.th, { width: 58, textAlign: 'center' }]}>STATUS</Text>
      </View>
      {ranked.map((item, i) => {
        const status = dimStatus(item.score);
        return (
          <View key={item.dim} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
            <Text style={[S.td, { flex: 1.15, fontWeight: 600 }]}>{DIM_SHORT[item.dim]}</Text>
            <View style={{ flex: 1, marginRight: 6, justifyContent: 'center' }}>
              <ScoreBar score={item.score} color={status.color} height={5} />
            </View>
            <Text style={[S.td, { width: 46, textAlign: 'center', fontWeight: 700, color: status.color }]}>{item.score}/5</Text>
            <Text style={[S.td, { width: 38, textAlign: 'center' }]}>{item.pct}%</Text>
            <View style={{ width: 58, alignItems: 'center' }}>
              <StatusPill status={status} />
            </View>
          </View>
        );
      })}

      <View style={{ flexDirection: 'row', marginTop: 8, marginBottom: 10 }}>
        {[
          { label: 'Strong (4-5)', color: C.emerald },
          { label: 'Developing (3)', color: C.sky },
          { label: 'Focus (0-2)', color: C.amber },
        ].map((leg, i) => (
          <View key={leg.label} style={{ flexDirection: 'row', alignItems: 'center', marginRight: i < 2 ? 14 : 0 }}>
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: leg.color, marginRight: 5 }} />
            <Text style={{ fontSize: 7, fontWeight: 600, color: C.slate600, fontFamily: 'Inter' }}>{leg.label}</Text>
          </View>
        ))}
      </View>

      <SectionBand title="10-Dimension Radar" sub="Wider, rounder shape = more balanced employability profile" />

      <View style={S.twoCol}>
        <View style={[S.colL, { alignItems: 'center', justifyContent: 'center' }]}>
          <SkillRadar scores={d.dimensionScores} compact />
        </View>
        <View style={S.colR}>
          <View style={[S.card, { marginBottom: 0 }]}>
            <Text style={S.cardTitle}>What your shape says</Text>
            <Text style={S.cardBody}>{shapeSummary}</Text>
          </View>
          <View style={{ marginTop: 8 }}>
            {[
              'Each spoke = one EQ skill dimension.',
              'Distance from center = score (0 to 5).',
              'Green = Strong · Blue = Developing · Amber = Focus.',
            ].map(line => (
              <View key={line} style={S.bulletRow}>
                <View style={S.bulletDot} />
                <Text style={S.bulletText}>{line}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────────── Pages 6-8 - Dimension Deep Dives ────────────────── */

function DeepDiveCard({ dim, score }: { dim: string; score: number }) {
  const status = dimStatus(score);
  return (
    <View style={S.deepCard}>
      <View style={S.deepHead}>
        <Text style={S.deepTitle}>{DIM_SHORT[dim]}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, fontWeight: 700, color: status.color, fontFamily: 'Inter', marginRight: 8 }}>{score}/5</Text>
          <StatusPill status={status} />
        </View>
      </View>
      <Text style={S.deepDesc}>{DIM_META[dim].desc}</Text>
      <ScoreBar score={score} color={status.color} height={6} />
      <Text style={S.deepInsight}>{dimInsight(dim, score)}</Text>
    </View>
  );
}

function DeepDivePage({ d, dims, part }: { d: EQReportData; dims: readonly string[]; part: string }) {
  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title={`Dimension Deep Dive ${part}`} subtitle="Personalized analysis of each skill based on your exact score" />
      {dims.map(dim => (
        <DeepDiveCard key={dim} dim={dim} score={clampScore(Number(d.dimensionScores[dim] ?? 0))} />
      ))}
      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────── Page 9 - Career Role Benchmark Matrix ───────────────── */

function BenchmarkMatrixPage({ d }: { d: EQReportData }) {
  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title="Career Role Benchmark Matrix" subtitle="Skill levels required at each career stage - and where you stand today" />

      <SectionBand title="Required Skill Levels by Role" sub="Benchmarks are out of 5 · green cells mark benchmarks your current score already meets" />

      <View style={S.tableHead}>
        <Text style={[S.th, { flex: 1.55 }]}>SKILL</Text>
        <Text style={[S.th, { flex: 0.6, textAlign: 'center', color: C.tealDark }]}>YOU</Text>
        <Text style={[S.th, { flex: 0.8, textAlign: 'center' }]}>ENTRY-LEVEL EXECUTIVE</Text>
        <Text style={[S.th, { flex: 0.7, textAlign: 'center' }]}>MANAGER</Text>
        <Text style={[S.th, { flex: 0.75, textAlign: 'center' }]}>SENIOR MANAGER</Text>
        <Text style={[S.th, { flex: 0.6, textAlign: 'center' }]}>CEO</Text>
      </View>
      {DIMENSIONS.map((dim, i) => {
        const score = clampScore(Number(d.dimensionScores[dim] ?? 0));
        return (
          <View key={dim} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
            <Text style={[S.td, { flex: 1.55, fontWeight: 600 }]}>{DIM_SHORT[dim]}</Text>
            <Text style={[S.td, { flex: 0.6, textAlign: 'center', fontWeight: 700, color: C.tealDark }]}>{score.toFixed(1)}</Text>
            {ROLES.map(role => {
              const benchmark = ROLE_BENCHMARKS[dim][role];
              const met = score >= benchmark;
              const flexMap: Record<RoleName, number> = { 'Entry-Level Executive': 0.8, Manager: 0.7, 'Senior Manager': 0.75, CEO: 0.6 };
              return (
                <View key={role} style={{ flex: flexMap[role], alignItems: 'center' }}>
                  <View style={{ backgroundColor: met ? C.emeraldBg : 'transparent', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1.5, minWidth: 28, alignItems: 'center' }}>
                    <Text style={{ fontSize: 7.8, fontWeight: 700, color: met ? C.emeraldTx : C.slate500, fontFamily: 'Inter' }}>{benchmark.toFixed(1)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 12 }}>
        <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: C.emeraldBg, marginRight: 5 }} />
        <Text style={{ fontSize: 7.2, color: C.slate600, fontFamily: 'Inter', marginRight: 16 }}>Benchmark met by your current score</Text>
        <View style={{ width: 10, height: 10, borderRadius: 3, borderWidth: 1, borderColor: C.slate300, marginRight: 5 }} />
        <Text style={{ fontSize: 7.2, color: C.slate600, fontFamily: 'Inter' }}>Benchmark not yet met</Text>
      </View>

      <SectionBand title="What each role demands" sub="How skill expectations rise with seniority" />
      {ROLES.map(role => (
        <View key={role} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 7 }}>
          <View style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: ROLE_COLOR[role], marginTop: 1.5, marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8.5, fontWeight: 700, color: C.dark, fontFamily: 'Inter' }}>{role}</Text>
            <Text style={{ fontSize: 7.6, fontWeight: 400, color: C.slate600, lineHeight: 1.5, fontFamily: 'Inter' }}>{ROLE_DESC[role]}</Text>
          </View>
        </View>
      ))}

      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────────── Page 9 - Role Fit Analysis ─────────────────────── */

function RoleFitPage({ d }: { d: EQReportData }) {
  const { fits, recommended, nextTarget } = roleFitAnalysis(d.dimensionScores);
  const topGap = recommended.gaps[0];
  const bestFitNote = nextTarget
    ? topGap
      ? `To grow toward ${nextTarget.role}, prioritize ${DIM_SHORT[topGap.dim]} first.`
      : `You meet the benchmarks for ${recommended.role}. Next: build visible evidence toward ${nextTarget.role}.`
    : 'Your profile meets the highest career benchmarks — focus on mastery and measurable impact.';

  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title="Role Fit Analysis" subtitle="How closely your profile matches each career stage" />

      <SectionBand title="Your Fit Score by Role" sub="Compare readiness across career stages at a glance" />
      <View style={[S.card, { paddingVertical: 14, paddingHorizontal: 12, marginBottom: 14 }]}>
        <RoleFitChart fits={fits} />
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
          {fits.map((f, i) => (
            <View key={f.role} style={{ flexDirection: 'row', alignItems: 'center', marginRight: i < fits.length - 1 ? 14 : 0 }}>
              <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: ROLE_COLOR[f.role], marginRight: 5 }} />
              <Text style={{ fontSize: 6.8, fontWeight: 600, color: C.slate600, fontFamily: 'Inter' }}>{f.role}</Text>
            </View>
          ))}
        </View>
      </View>

      <SectionBand title="Readiness at a Glance" sub="Status and priority skill for each stage" />

      <View style={[S.card, { padding: 0, overflow: 'hidden', marginBottom: 0 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.tealBg, paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#99f6e4' }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: ROLE_COLOR[recommended.role], marginTop: 2, marginRight: 8, flexShrink: 0 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8.5, fontWeight: 700, color: C.dark, fontFamily: 'Inter' }}>
              Best fit today: {recommended.role}
            </Text>
            <Text style={{ fontSize: 7.5, fontWeight: 400, color: C.slate600, lineHeight: 1.45, fontFamily: 'Inter', marginTop: 2 }}>
              {bestFitNote}
            </Text>
          </View>
        </View>

        <View style={[S.tableHead, { marginBottom: 0, borderRadius: 0 }]}>
          <Text style={[S.th, { flex: 1 }]}>ROLE</Text>
          <Text style={[S.th, { width: 86, textAlign: 'center' }]}>STATUS</Text>
          <Text style={[S.th, { flex: 1, textAlign: 'right' }]}>PRIORITY SKILL TO BUILD</Text>
        </View>
        {fits.map((f, i) => {
          const badge = fitBadge(f.fitPct, f.meets);
          const prioritySkill = f.gaps[0] ? DIM_SHORT[f.gaps[0].dim] : 'All benchmarks met';
          const isLast = i === fits.length - 1;
          return (
            <View
              key={f.role}
              style={[
                i % 2 === 0 ? S.tableRow : S.tableRowAlt,
                { borderBottomWidth: isLast ? 0 : 1 },
              ]}
            >
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 8 }}>
                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: ROLE_COLOR[f.role], marginRight: 6, flexShrink: 0 }} />
                <Text style={[S.td, { flex: 1, fontWeight: 600, color: C.dark }]}>{f.role}</Text>
              </View>
              <View style={{ width: 86, alignItems: 'center', justifyContent: 'center' }}>
                <StatusPill status={badge} style={{ alignSelf: 'center' }} />
              </View>
              <Text style={[S.td, { flex: 1, color: C.slate600, textAlign: 'right' }]}>{prioritySkill}</Text>
            </View>
          );
        })}
      </View>

      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────────── Page 11 - Gap Analysis ──────────────────────────── */

function GapAnalysisPage({ d }: { d: EQReportData }) {
  const { recommended, nextTarget } = roleFitAnalysis(d.dimensionScores);
  const target = nextTarget ?? recommended;
  const isCeoMastery = !nextTarget;

  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title="Gap Analysis: Your Next Role" subtitle={isCeoMastery ? 'Sustaining mastery at the top of the ladder' : `What separates you from ${target.role} readiness`} />

      <View style={[S.card, { backgroundColor: C.slate50 }]}>
        <Text style={S.cardTitle}>{isCeoMastery ? 'You already meet the highest benchmark profile' : `Target: ${target.role}`}</Text>
        <Text style={S.cardBody}>
          {isCeoMastery
            ? 'Your profile meets or nearly meets the benchmarks of every role stage, including CEO-level expectations. Your development focus now shifts from closing gaps to deepening mastery: real-world application, visible leadership, and building a track record that proves these skills at scale.'
            : `Your best-fit role today is ${recommended.role}. The analysis below shows the exact skill gaps between your current profile and ${target.role} requirements - sorted by size, so you know precisely where development effort pays off most.`}
        </Text>
      </View>

      {target.gaps.length > 0 ? (
        <>
          <SectionBand title={`Skill Gaps vs ${target.role} Benchmarks`} sub="Sorted largest to smallest - close the top gaps first" />
          <View style={S.tableHead}>
            <Text style={[S.th, { flex: 1.4 }]}>SKILL</Text>
            <Text style={[S.th, { width: 54, textAlign: 'center' }]}>YOU</Text>
            <Text style={[S.th, { width: 66, textAlign: 'center' }]}>REQUIRED</Text>
            <Text style={[S.th, { width: 50, textAlign: 'center' }]}>GAP</Text>
            <Text style={[S.th, { flex: 1 }]}>PRIORITY</Text>
          </View>
          {target.gaps.map((g, i) => {
            const priority = g.gap >= 2 ? { label: 'High priority', color: C.rose } : g.gap >= 1 ? { label: 'Medium priority', color: C.amber } : { label: 'Fine-tune', color: C.sky };
            return (
              <View key={g.dim} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
                <Text style={[S.td, { flex: 1.4, fontWeight: 600 }]}>{DIM_SHORT[g.dim]}</Text>
                <Text style={[S.td, { width: 54, textAlign: 'center', fontWeight: 700 }]}>{g.score.toFixed(1)}</Text>
                <Text style={[S.td, { width: 66, textAlign: 'center' }]}>{g.benchmark.toFixed(1)}</Text>
                <Text style={[S.td, { width: 50, textAlign: 'center', fontWeight: 700, color: priority.color }]}>-{g.gap.toFixed(1)}</Text>
                <Text style={[S.td, { flex: 1, fontWeight: 600, color: priority.color }]}>{priority.label}</Text>
              </View>
            );
          })}

          <SectionBand title="Fastest Path to Close the Gaps" sub="Concrete first moves for your three largest gaps" />
          {target.gaps.slice(0, 3).map(g => (
            <View key={g.dim} style={S.bulletRow}>
              <View style={S.bulletDot} />
              <Text style={S.bulletText}>
                <Text style={{ fontWeight: 700 }}>{DIM_SHORT[g.dim]}: </Text>
                {DIM_META[g.dim].action.body}
              </Text>
            </View>
          ))}
        </>
      ) : (
        <View style={S.card}>
          <Text style={S.cardTitle}>No skill gaps against this benchmark</Text>
          <Text style={S.cardBody}>Every one of your ten dimension scores meets or exceeds the {target.role} requirement. Focus on demonstrating these skills through real projects, leadership roles, and measurable outcomes.</Text>
        </View>
      )}

      <View style={[S.card, { marginTop: 8, backgroundColor: C.tealBg, borderColor: '#99f6e4' }]}>
        <Text style={S.cardTitle}>Remember: benchmarks are trajectories, not gates</Text>
        <Text style={S.cardBody}>
          Nobody is hired as a CEO out of an assessment. These benchmarks show how skill expectations grow across a career so you can invest early in the dimensions that compound the longest - typically Leadership, Talent Management, and Analytical Thinking.
        </Text>
      </View>

      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────── Page 12 - Strengths & Focus Areas ───────────────────── */

function StrengthsFocusPage({ d }: { d: EQReportData }) {
  const ranked = rankedDimensions(d.dimensionScores);
  const strengths = ranked.filter(r => r.score >= 4).slice(0, 4);
  const focus = [...ranked].reverse().filter(r => r.score <= 3).slice(0, 4);

  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title="Strengths & Focus Areas" subtitle="Your employability assets and highest-leverage growth edges" />

      <View style={S.twoCol}>
        <View style={S.colL}>
          <SectionBand title="Key Strengths" sub="Lead with these in applications and interviews" />
          {strengths.length > 0 ? strengths.map(item => (
            <View key={item.dim} style={[S.card, { borderLeftWidth: 3, borderLeftColor: C.emerald }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <Text style={{ fontSize: 8.8, fontWeight: 700, color: C.dark, fontFamily: 'Inter', flex: 1, paddingRight: 4 }}>{DIM_SHORT[item.dim]}</Text>
                <Text style={{ fontSize: 9.5, fontWeight: 700, color: C.emerald, fontFamily: 'Inter' }}>{item.score}/5</Text>
              </View>
              <Text style={{ fontSize: 7.4, fontWeight: 400, color: C.slate600, lineHeight: 1.5, fontFamily: 'Inter' }}>{DIM_META[item.dim].high}</Text>
            </View>
          )) : (
            <View style={S.card}>
              <Text style={S.cardBody}>No dimension has reached the Strong band (4+/5) yet. That means your first strength is one focused practice cycle away - pick your highest-scoring dimension and push it over 4 first, because near-strengths convert fastest.</Text>
            </View>
          )}
        </View>

        <View style={S.colR}>
          <SectionBand title="Focus Areas" sub="Highest-return targets for the next 60 days" />
          {focus.length > 0 ? focus.map(item => (
            <View key={item.dim} style={[S.card, { borderLeftWidth: 3, borderLeftColor: C.amber }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <Text style={{ fontSize: 8.8, fontWeight: 700, color: C.dark, fontFamily: 'Inter', flex: 1, paddingRight: 4 }}>{DIM_SHORT[item.dim]}</Text>
                <Text style={{ fontSize: 9.5, fontWeight: 700, color: C.amber, fontFamily: 'Inter' }}>{item.score}/5</Text>
              </View>
              <Text style={{ fontSize: 7.4, fontWeight: 400, color: C.slate600, lineHeight: 1.5, fontFamily: 'Inter' }}>{dimInsight(item.dim, item.score)}</Text>
            </View>
          )) : (
            <View style={S.card}>
              <Text style={S.cardBody}>No dimension sits in the focus band - your profile is consistently strong. Your growth strategy shifts from fixing gaps to building depth and visible evidence in your top dimensions.</Text>
            </View>
          )}
        </View>
      </View>

      <View style={[S.card, { marginTop: 6, backgroundColor: C.slate50 }]}>
        <Text style={S.cardTitle}>The 70/30 development rule</Text>
        <Text style={S.cardBody}>
          Spend roughly 70% of your development time on focus areas (where gaps cost you opportunities) and 30% deepening strengths (where distinctiveness wins you opportunities). Fixing a 2/5 to a 3.5/5 changes how employers see your whole profile; polishing a 5/5 changes very little.
        </Text>
      </View>

      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────── Pages 13-14 - Recommendations ───────────────────────── */

function RecommendationsPage({ d, recs, offset, part }: { d: EQReportData; recs: { title: string; body: string }[]; offset: number; part: string }) {
  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title={`Personalized Recommendations ${part}`} subtitle="Evidence-based practices matched to your specific EQ profile" />
      {offset === 0 && (
        <SectionBand title="Your Growth Playbook" sub="Ordered by impact - recommendations for your lowest-scoring dimensions come first" />
      )}
      {recs.map((r, i) => (
        <View key={r.title} style={S.recCard}>
          <View style={S.recNum}><Text style={S.recNumText}>{offset + i + 1}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={S.recTitle}>{r.title}</Text>
            <Text style={S.recBody}>{r.body}</Text>
          </View>
        </View>
      ))}
      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────── Pages 14-15 - 60-Day Roadmap (Goals & Tasks) ─────────── */

type Phase = {
  title: string;
  window: string;
  color: string;
  focus: string;
  goals: string[];
  tasks: string[];
  dailyHabit: string;
};

function buildRoadmap(scores: Record<string, number>): Phase[] {
  const weakest = [...rankedDimensions(scores)].reverse().slice(0, 3);
  const w1 = weakest[0] ? DIM_SHORT[weakest[0].dim] : 'your weakest skill';
  const w2 = weakest[1] ? DIM_SHORT[weakest[1].dim] : 'your second focus skill';
  const w3 = weakest[2] ? DIM_SHORT[weakest[2].dim] : 'your third focus skill';
  const top = rankedDimensions(scores)[0];
  const topSkill = top ? DIM_SHORT[top.dim] : 'your strongest skill';

  return [
    {
      title: 'Phase 1 · Baseline & Awareness',
      window: 'Days 1-15',
      color: C.sky,
      focus: `Establish clarity before intensity. In the first two weeks, your job is not to transform every skill - it is to understand your profile deeply, choose two focus dimensions (${w1} and ${w2}), and build the weekly review habit that makes every later improvement measurable.`,
      goals: [
        `Complete a written self-assessment for ${w1} and ${w2}: one honest paragraph each on current behavior, recent examples, and the single habit you will change.`,
        'Define one measurable 60-day outcome per focus skill (e.g. "lead two team discussions" rather than "improve leadership").',
        'Share your EQ results and 60-day targets with one accountability partner - mentor, teacher, or trusted peer.',
        'Identify one real environment (class, internship, club, project) where you can practice both focus skills weekly.',
      ],
      tasks: [
        'Day 1-3: Re-read your dimension deep-dive pages and highlight three lines that feel most accurate.',
        'Day 4-7: Run one 10-minute weekly review (wins, gaps, next-week priority) every Sunday evening.',
        'Day 8-10: Observe one high-performer and note which EQ skill they demonstrate most visibly.',
        'Day 11-15: Complete one low-stakes practice rep for each focus skill and log the result in a tracker.',
      ],
      dailyHabit: 'Each morning, write one sentence: "Today I will practice ___ by doing ___." Keep it small enough to complete before the day ends.',
    },
    {
      title: 'Phase 2 · Deliberate Practice',
      window: 'Days 16-30',
      color: C.indigo,
      focus: `Convert awareness into repetition. Phase 2 is where employability actually moves - not through motivation bursts, but through scheduled practice on ${w1} and ${w2}. Consistency in this window matters more than intensity.`,
      goals: [
        `Run the recommended action plan for ${w1} at least twice every week without skipping two consecutive weeks.`,
        `Introduce ${w2} practice in week 3 only after ${w1} practice feels automatic - stacking too early weakens both habits.`,
        'Collect one piece of specific, usable feedback from a peer or mentor on your focus skill and implement one change within seven days.',
        'Maintain a visible practice streak tracker - employability growth is easier when progress is seen, not guessed.',
      ],
      tasks: [
        'Mon/Wed/Fri: 20-minute deliberate practice block for your primary focus skill.',
        'Tue/Thu: 15-minute secondary skill block once week-3 begins.',
        'After each practice session, note one thing that improved and one friction point to fix next time.',
        'End of week: send your accountability partner a three-line progress update - done, stuck, next step.',
      ],
      dailyHabit: 'Before your main study or work block, spend 3 minutes reviewing yesterday\'s practice note and naming today\'s one skill rep.',
    },
    {
      title: 'Phase 3 · Application & Evidence',
      window: 'Days 31-45',
      color: C.purple,
      focus: `Skills only become employable when they produce visible outcomes. Phase 3 shifts practice from private reps to public application - projects, presentations, leadership moments, and artifacts you can show a recruiter or manager.`,
      goals: [
        `Apply ${w1} in one real deliverable: a presentation, group project, internship task, or club initiative with a clear outcome.`,
        `Add ${w3} practice only if your first two habits are stable; otherwise deepen ${w1} and ${w2} through harder applications.`,
        'Create at least one tangible proof-point: certificate, portfolio item, measurable result, or documented contribution.',
        `Draft two STAR interview stories - one anchored in ${topSkill} (strength), one in ${w1} (growth).`,
      ],
      tasks: [
        'Week 5: Volunteer for one visible responsibility that requires your focus skill in a real group setting.',
        'Week 6: Turn your best work into a one-page case summary (problem, your action, measurable result).',
        'Week 6: Ask for structured feedback using three questions: What worked? What was unclear? What should I do next?',
        'Week 7: Refine your STAR stories until each fits in 90 seconds and includes a specific number or outcome.',
      ],
      dailyHabit: 'End each day with one line in an "evidence log": what did I do today that proves I am building employability?',
    },
    {
      title: 'Phase 4 · Measure & Compound',
      window: 'Days 46-60',
      color: C.teal,
      focus: 'Close the loop. Phase 4 is about measurement, reflection, and setting the next cycle. Employability compounds when development becomes a rolling 60-day rhythm - not a one-time effort after an assessment.',
      goals: [
        'Retake the Employability Quotient assessment and compare each dimension score against this report.',
        'Identify which practices produced the largest score movement and commit to them for the next cycle.',
        'Update your resume, LinkedIn, or portfolio with new evidence, projects, and skill stories from the last 45 days.',
        'Set your next 60-day targets using the same two-focus-skill method - never try to fix all ten dimensions at once.',
      ],
      tasks: [
        'Day 46-50: Complete the reassessment in a calm, honest mindset - speed does not improve scores; sincerity does.',
        'Day 51-53: Build a before/after table of dimension scores and note top three improvements and remaining gaps.',
        'Day 54-57: Refresh your professional profile with one new bullet per focus skill practiced.',
        'Day 58-60: Plan the next roadmap cycle and book a check-in with your accountability partner.',
      ],
      dailyHabit: 'Each Sunday, rate your week 1-5 on consistency, courage, and evidence-building - then set one priority for the coming week.',
    },
  ];
}

function renderPhaseCard(phase: Phase) {
  return (
    <View key={phase.title} style={S.phaseCard} wrap={false}>
      <View style={[S.phaseHead, { backgroundColor: phase.color }]}>
        <View style={{ flex: 1 }}>
          <Text style={S.phaseTitle}>{phase.title}</Text>
          <Text style={S.phaseSub}>{phase.window}</Text>
        </View>
      </View>
      <View style={S.phaseBody}>
        <Text style={S.phaseFocus}>{phase.focus}</Text>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, marginRight: 8, borderRightWidth: 1, borderRightColor: C.slate100, paddingRight: 8 }}>
            <Text style={[S.phaseColTitle, { color: C.sky }]}>WEEKLY GOALS</Text>
            {phase.goals.map((goal) => (
              <View key={goal} style={{ flexDirection: 'row', marginBottom: 3 }}>
                <Text style={{ fontSize: 7, color: C.sky, marginRight: 4, fontWeight: 700, fontFamily: 'Inter' }}>•</Text>
                <Text style={{ fontSize: 7.2, color: C.slate700, flex: 1, lineHeight: 1.45, fontFamily: 'Inter', fontWeight: 400 }}>{goal}</Text>
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[S.phaseColTitle, { color: phase.color }]}>DAILY TASKS</Text>
            {phase.tasks.map((task) => (
              <View key={task} style={{ flexDirection: 'row', marginBottom: 3 }}>
                <View style={{ width: 9, height: 9, borderRadius: 2, borderWidth: 1, borderColor: phase.color, marginRight: 5, marginTop: 1, flexShrink: 0 }} />
                <Text style={{ fontSize: 7.2, color: C.slate700, flex: 1, lineHeight: 1.45, fontFamily: 'Inter', fontWeight: 400 }}>{task}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={S.phaseHabitBox}>
          <Text style={S.phaseHabitLabel}>DAILY HABIT:</Text>
          <Text style={S.phaseHabitText}>{phase.dailyHabit}</Text>
        </View>
      </View>
    </View>
  );
}

function RoadmapPage({ d, phases, part, sub }: { d: EQReportData; phases: Phase[]; part: string; sub: string }) {
  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title={`60-Day Development Roadmap ${part}`} subtitle={sub} />
      {part === '(I)' && (
        <>
          <SectionBand title="Weekly Goals + Daily Tasks" sub="Each phase pairs strategic weekly goals (left) with concrete daily actions (right) - run both tracks together" />
          <View style={[S.card, { backgroundColor: C.tealBg, borderColor: '#99f6e4', marginBottom: 10 }]}>
            <Text style={S.cardTitle}>How to use this roadmap</Text>
            <Text style={S.cardBody}>
              Treat weekly goals as direction and daily tasks as execution. Missing a day is normal; missing two consecutive weeks breaks momentum. Your accountability partner and evidence log exist to keep you honest when motivation dips. Employability is built in small, repeated reps - not in one heroic weekend.
            </Text>
          </View>
        </>
      )}
      {phases.map(renderPhaseCard)}
      {part === '(II)' && (
        <View style={[S.card, { backgroundColor: C.slate50 }]}>
          <Text style={S.cardTitle}>The compounding principle</Text>
          <Text style={S.cardBody}>
            Sixty days is enough to move two or three dimensions by a full point - and each point compounds. Days 1-14 feel slow because habits are forming. By Day 21, practice feels more natural. By Day 45, you have evidence. By Day 60, your profile tells a different story. Most people quit before Day 12; your report exists so you do not have to.
          </Text>
        </View>
      )}
      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────── Pages 16-17 - Guidance & Mentorship ───────────────────── */

type GuidanceSection = { title: string; color: string; points: string[] };

function buildGuidanceSections(d: EQReportData): GuidanceSection[] {
  const ranked = rankedDimensions(d.dimensionScores);
  const weakest = [...ranked].reverse().slice(0, 2);
  const top = ranked[0];
  const w1 = weakest[0] ? DIM_SHORT[weakest[0].dim] : 'a focus skill';
  const w2 = weakest[1] ? DIM_SHORT[weakest[1].dim] : 'a second focus skill';
  const topSkill = top ? DIM_SHORT[top.dim] : 'your strongest skill';
  const { recommended } = roleFitAnalysis(d.dimensionScores);
  const tier = tierInfo(d.tier).name;

  return [
    {
      title: 'Finding & Using a Mentor',
      color: C.teal,
      points: [
        `Your current tier (${tier.replace(' Tier', '')}) suggests you will benefit most from a mentor who gives honest feedback on ${w1} and ${w2}, not generic career advice.`,
        'Choose mentors one level above your target role - they remember the transition and can spot gaps recruiters also notice.',
        'Come to every mentorship conversation with three prepared questions tied to this report: one strength to leverage, one gap to close, one real situation you faced this week.',
        'Ask for behavioral feedback, not praise: "What did I do well?" and "What should I do differently next time?" are the two questions that accelerate growth.',
        'Send a brief monthly update: skills practiced, evidence created, scores improved. Mentors invest more when they see follow-through.',
      ],
    },
    {
      title: 'Interview & Self-Presentation Readiness',
      color: C.indigo,
      points: [
        `Lead interviews with ${topSkill} - your highest-scoring dimension (${top?.score ?? '-'}/5) is your credibility anchor. Open with a story that proves it.`,
        `Prepare one growth narrative around ${w1}: employers respect self-awareness more than perfection. Show what you are building and how.`,
        'Use the STAR format for every story: Situation (context), Task (your responsibility), Action (what you did), Result (measurable outcome). Practice aloud until each story fits in 90 seconds.',
        'Map your answers to employability language: analytical thinking, adaptability, leadership, learning velocity - not just subject marks.',
        `Align your pitch to your best-fit role (${recommended.role}, ${recommended.fitPct}% fit): explain why your skill profile matches that stage today and what you are building toward next.`,
      ],
    },
    {
      title: 'Building Skill Evidence',
      color: C.emerald,
      points: [
        'Employers hire proof, not potential. For every strength dimension, create one artifact: project output, certificate, presentation recording, or written result.',
        'Keep a living "evidence portfolio" - one folder with your best work samples, feedback screenshots, and practice logs from this 60-day cycle.',
        'Quantify wherever possible: "Improved team presentation clarity" is weak; "Led a 4-person project, reduced revision cycles by 30%" is strong.',
        `Pair ${topSkill} stories with ${w1} growth stories - this combination signals both capability and coachability, which hiring managers value highly.`,
        'Update your resume monthly during the roadmap, not only at the end. Small updates prevent the end-of-cycle rush and keep opportunities visible.',
      ],
    },
    {
      title: 'Workplace Navigation & Professional Communication',
      color: C.sky,
      points: [
        'Professional communication is an employability skill, not a personality trait. Default to clarity: short emails, explicit asks, confirmed deadlines.',
        'In group settings, practice "listen → summarize → contribute": paraphrase someone\'s point before adding yours. This builds empathy and influence simultaneously.',
        'Manage upward proactively: if you are stuck for more than 30 minutes, ask for direction with two options already considered - this signals analytical thinking.',
        'Treat feedback as data, not judgment. Write down corrective feedback within one hour and schedule one improvement action within 48 hours.',
        'Build reputation through reliability: early delivery on small commitments creates trust that later earns you larger responsibilities.',
      ],
    },
    {
      title: 'Focus, Consistency & Skill Practice',
      color: C.amber,
      points: [
        'Skill development fails from fragmentation, not lack of talent. Protect one daily 20-minute "EQ practice block" at the same time each day.',
        'Single-task during practice: one skill, one rep, one log entry. Multitasking during skill-building produces the feeling of effort without the learning.',
        'Design your environment for practice: remove phone friction, prepare materials in advance, and keep your tracker visible on your desk or home screen.',
        'Use the 2-day rule: never skip the same practice habit two days in a row. One miss is human; two misses become a pattern.',
        'Track focused minutes, not vague intentions. A honest log of 15 focused minutes beats an aspirational plan for 2 unfocused hours.',
      ],
    },
    {
      title: 'Accountability & Peer Learning',
      color: C.purple,
      points: [
        'Peer accountability doubles follow-through. Pair with someone also working on employability skills and exchange weekly three-line updates.',
        `Run a monthly "skill swap": teach a peer something you do well (often ${topSkill}) and learn from them in return - teaching deepens mastery.`,
        'Join or form a small practice group (3-5 people) with a fixed agenda: one skill focus, one real scenario, one round of feedback each session.',
        'Celebrate evidence, not effort alone: reward yourself when you produce a tangible outcome, not just when you "studied about" a skill.',
        'Re-assess every 8 weeks with the Employability Quotient test. Shared score comparisons in a peer group create healthy momentum and honest benchmarking.',
      ],
    },
  ];
}

function renderGuidanceSection(section: GuidanceSection) {
  return (
    <View key={section.title} style={S.guidanceCard} wrap={false}>
      <View style={S.guidanceHead}>
        <View style={[S.guidanceDot, { backgroundColor: section.color }]} />
        <Text style={S.guidanceTitle}>{section.title}</Text>
      </View>
      {section.points.map((point, i) => (
        <View key={i} style={S.guidancePoint}>
          <Text style={[S.guidanceBullet, { color: section.color }]}>•</Text>
          <Text style={S.guidanceText}>{point}</Text>
        </View>
      ))}
    </View>
  );
}

function GuidanceMentorshipPage({ d, sections, part, sub }: { d: EQReportData; sections: GuidanceSection[]; part: string; sub: string }) {
  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title={`Guidance & Mentorship ${part}`} subtitle={sub} />
      {part === '(I)' && (
        <SectionBand title="Career Coaching for Your EQ Profile" sub="Practical mentorship, interview, and evidence-building guidance tailored to your results" />
      )}
      {sections.map(renderGuidanceSection)}
      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────── Page 18 - Understanding Your EQ (FAQ) ───────────────── */

function buildFaqs(d: EQReportData) {
  const { recommended } = roleFitAnalysis(d.dimensionScores);
  const ranked = rankedDimensions(d.dimensionScores);
  const bottom = ranked[ranked.length - 1];
  const tier = tierInfo(d.tier);

  return [
    {
      q: 'What exactly does my EQ score measure?',
      a: 'It measures your current readiness across the ten transferable skills employers rank as most critical - from analytical thinking to service orientation. It reflects skill behaviors demonstrated in scenario-based questions, not IQ, academic marks, or personality labels.',
    },
    {
      q: 'Is a low score in a dimension a permanent weakness?',
      a: 'No. Every skill in this assessment is behavioral and trainable. Dimension scores typically move within 30-60 days of deliberate, consistent practice - which is exactly what the goals & tasks roadmap in this report is designed to support.',
    },
    {
      q: `What does my score of ${d.overallScore}/${MAX_SCORE} (${tier.name}) mean in practice?`,
      a: tierNarrative(d.tier).body,
    },
    {
      q: 'How should I use the career role benchmarks?',
      a: 'As a direction-finder, not a gate. Benchmarks show how skill expectations rise from Entry-Level Executive to CEO so you can invest early in long-compounding skills like leadership and talent management. Meeting a benchmark means your profile aligns with that stage today - actual hiring also depends on experience, domain knowledge, and interview performance.',
    },
    {
      q: 'Which dimensions should I improve first?',
      a: `Start with ${bottom ? DIM_SHORT[bottom.dim] : 'your lowest-scoring dimension'} and your next-lowest gaps from the Gap Analysis page. Moving a skill from 2/5 to 3.5/5 improves how employers perceive your whole profile more than polishing an already-strong dimension from 4 to 5.`,
    },
    {
      q: 'How do employers actually see these skills?',
      a: 'Through evidence: projects, stories, roles, and results. This report tells you where you are strong; interviews reward how convincingly you demonstrate it. Build one concrete proof-point per strength dimension and one honest growth narrative per focus dimension.',
    },
    {
      q: `Why was ${recommended.role} identified as my best-fit role today?`,
      a: `Your profile currently meets ${recommended.meets} of 10 skill benchmarks for that role with ${recommended.fitPct}% overall fit. This is a data-based starting point for career conversations - not a ceiling. Use the gap analysis to see what would move you toward the next role level.`,
    },
    {
      q: 'How often should I retake the assessment?',
      a: 'Every 8 weeks is ideal during an active development cycle. It is long enough for practice to move real scores, and short enough to maintain a feedback loop. Your improvement trend across attempts is itself powerful evidence of a growth mindset for recruiters and mentors.',
    },
    {
      q: 'Does my tier limit which jobs I can apply for?',
      a: 'Not at all. Tiers summarize your current overall readiness, not your potential or your right to apply. Candidates in every tier get hired - what changes is preparation strategy. This report exists to make that strategy specific instead of generic.',
    },
    {
      q: 'What is the single most important action I should take this week?',
      a: `Pick one focus skill (${bottom ? DIM_SHORT[bottom.dim] : 'from your gap analysis'}), schedule one 20-minute practice block, tell one accountability partner, and log the result. Employability grows through reps and evidence - start with one rep this week.`,
    },
  ];
}

function FaqPage({ d, items, part }: { d: EQReportData; items: ReturnType<typeof buildFaqs>; part: string }) {
  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title={`Understanding Your EQ ${part}`} subtitle="Clear answers about your results, role fit, and development path" />
      {part === '(I)' && (
        <SectionBand title="Candidate Clarity Guide" sub="Reduce confusion, increase confidence - know exactly what your results mean and what to do next" />
      )}
      {items.map((item, i) => (
        <View key={item.q} style={[S.faqCard, { borderLeftColor: i % 2 === 0 ? C.teal : C.indigo }]}>
          <Text style={S.faqQuestion}>{item.q}</Text>
          <Text style={S.faqAnswer}>{item.a}</Text>
        </View>
      ))}
      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────── Page 18 - Final Summary ─────────────────────────────── */

function FinalSummaryPage({ d }: { d: EQReportData }) {
  const t = tierInfo(d.tier);
  const narrative = tierNarrative(d.tier);
  const { recommended } = roleFitAnalysis(d.dimensionScores);
  const ranked = rankedDimensions(d.dimensionScores);
  const top = ranked[0];
  const bottom = ranked[ranked.length - 1];

  const cards = [
    { title: 'Interpretation', body: narrative.interpretation, color: C.teal },
    { title: 'Conclusion', body: narrative.conclusion, color: C.emerald },
    { title: 'Outlook', body: narrative.outlook, color: C.sky },
    { title: 'Best-Fit Role', body: `${recommended.role} (${recommended.fitPct}% fit, ${recommended.meets}/10 benchmarks met). Your strongest lever: ${DIM_SHORT[top.dim]} (${top.score}/5). Your fastest gain: ${DIM_SHORT[bottom.dim]} (${bottom.score}/5).`, color: C.indigo },
  ];

  return (
    <Page size="A4" style={S.finalPage}>
      <Svg width={595} height={841} style={{ position: 'absolute', top: 0, left: 0 } as any}>
        <Circle cx={550} cy={100} r={180} fill={C.teal} fillOpacity={0.05} />
        <Circle cx={50} cy={800} r={150} fill={C.emerald} fillOpacity={0.04} />
        <Rect x={0} y={0} width={3} height={841} fill={C.teal} fillOpacity={0.5} />
      </Svg>
      <View style={S.finalInner}>
        <View style={S.finalHeaderBadge}><Text style={S.finalHeaderBadgeText}>FINAL SUMMARY</Text></View>
        <Text style={S.finalTitle}>{d.studentName}</Text>
        <Text style={S.finalSub}>Employability Quotient: {d.overallScore}/{MAX_SCORE} ({d.overallPercentage}%) · {t.name}</Text>

        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <View style={[S.finalCard, { flex: 1, marginRight: 8, borderLeftColor: cards[0].color }]}>
            <Text style={S.finalCardTitle}>{cards[0].title}</Text>
            <Text style={S.finalCardBody}>{cards[0].body}</Text>
          </View>
          <View style={[S.finalCard, { flex: 1, borderLeftColor: cards[1].color }]}>
            <Text style={S.finalCardTitle}>{cards[1].title}</Text>
            <Text style={S.finalCardBody}>{cards[1].body}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <View style={[S.finalCard, { flex: 1, marginRight: 8, borderLeftColor: cards[2].color }]}>
            <Text style={S.finalCardTitle}>{cards[2].title}</Text>
            <Text style={S.finalCardBody}>{cards[2].body}</Text>
          </View>
          <View style={[S.finalCard, { flex: 1, borderLeftColor: cards[3].color }]}>
            <Text style={S.finalCardTitle}>{cards[3].title}</Text>
            <Text style={S.finalCardBody}>{cards[3].body}</Text>
          </View>
        </View>

        <View style={S.finalMotivationBox}>
          <Text style={S.finalMotivationText}>&quot;{narrative.motivation}&quot;</Text>
          <Text style={S.finalMotivationSub}>Your 60-day goals & tasks roadmap starts on page 14. Guidance & mentorship begins on page 16.</Text>
        </View>

        <View style={S.finalBranding}>
          <Text style={S.finalBrandingText}>Employability Quotient (EQ) · Future-of-Work Skills Analytics</Text>
          <Text style={S.finalBrandingText}>Generated on {d.generatedDate}</Text>
        </View>
      </View>
    </Page>
  );
}

function BackCoverPage({ d }: { d: EQReportData }) {
  const backSrc = d.backCoverImageSrc ?? REPORT_BACK_COVER_IMAGE;
  return (
    <Page size="A4" style={S.backCoverPage}>
      <Image src={backSrc} style={S.backCoverBg} />
    </Page>
  );
}

/* ─────────────────────────── Document ────────────────────────────────────── */

export function EmployabilityQuotientPdfReport(props: EQReportData) {
  const recs = buildRecommendations(props.dimensionScores);
  const roadmap = buildRoadmap(props.dimensionScores);
  const guidance = buildGuidanceSections(props);
  const faqs = buildFaqs(props);
  const firstRecs = recs.slice(0, 4);
  const restRecs = recs.slice(4);

  return (
    <Document
      title={`Employability Quotient Report - ${props.studentName}`}
      author="Employability Quotient (EQ) Analytics Platform"
      subject="Employability Quotient Career Readiness Report"
      keywords="Employability, Skills, Career Readiness, Role Fit, Analytics"
      creator="Employability Quotient"
    >
      <CoverPage d={props} />
      <ExecutiveSummaryPage d={props} />
      <FrameworkPage d={props} />
      <SkillOverviewPage d={props} />
      <DeepDivePage d={props} dims={DIMENSIONS.slice(0, 4)} part="(I)" />
      <DeepDivePage d={props} dims={DIMENSIONS.slice(4, 7)} part="(II)" />
      <DeepDivePage d={props} dims={DIMENSIONS.slice(7, 10)} part="(III)" />
      <BenchmarkMatrixPage d={props} />
      <RoleFitPage d={props} />
      <GapAnalysisPage d={props} />
      <StrengthsFocusPage d={props} />
      <RecommendationsPage d={props} recs={firstRecs} offset={0} part="(I)" />
      {restRecs.length > 0 && <RecommendationsPage d={props} recs={restRecs} offset={firstRecs.length} part="(II)" />}
      <RoadmapPage d={props} phases={roadmap.slice(0, 2)} part="(I)" sub="Phase 1 & 2 - weekly goals, daily tasks, and habit building" />
      <RoadmapPage d={props} phases={roadmap.slice(2)} part="(II)" sub="Phase 3 & 4 - application, evidence, measurement, and compounding" />
      <GuidanceMentorshipPage d={props} sections={guidance.slice(0, 3)} part="(I)" sub="Mentorship, interview readiness, and skill evidence" />
      <GuidanceMentorshipPage d={props} sections={guidance.slice(3)} part="(II)" sub="Workplace navigation, focus, and peer accountability" />
      <FaqPage d={props} items={faqs.slice(0, 5)} part="(I)" />
      <FaqPage d={props} items={faqs.slice(5)} part="(II)" />
      <FinalSummaryPage d={props} />
      <BackCoverPage d={props} />
    </Document>
  );
}

export default EmployabilityQuotientPdfReport;
