/* eslint-disable */
'use client';

import { useEffect, type CSSProperties } from 'react';
import {
  ALL_TOPICS,
  type AssessmentResult,
  type RoadmapStep,
  type StudentProfile,
  bandFromPercentage,
  bandMeta,
  deriveCareerMatches,
  deriveRoadmap,
  getTopAndBottomTopics,
  scoreToPercentage,
} from '@/lib/studyAbroad/assessmentData';

export const SA_PREMIUM_REPORT_ROOT = 'sa-premium-print-report';

const REPORT_PAGE_PADDING = '68px 68px 53px';

/** Cover overlay positions — same coordinates as RQ report, scaled to 794×1123 capture canvas. */
const SA_COVER_SCALE_X = 794 / 595;
const SA_COVER_SCALE_Y = 1123 / 841;
const SA_COVER_IMAGE = '/study-abroad/cover.jpg';
const SA_BACK_COVER_IMAGE = '/study-abroad/back-cover.jpg';

function saCoverOverlayStyle(
  pdfLeft: number,
  pdfTop: number,
  extra: CSSProperties = {},
): CSSProperties {
  return {
    position: 'absolute',
    left: Math.round(pdfLeft * SA_COVER_SCALE_X),
    top: Math.round(pdfTop * SA_COVER_SCALE_Y),
    ...extra,
  };
}

/** Whole cards per page before continuation (avoids clipped boxes in PDF capture). */
const STRENGTHS_ON_FIRST_PAGE = 2;
const FOCUS_ON_FIRST_PAGE = 2;
/** Max roadmap phase cards per page (phase 5+ continues on following pages). */
const ROADMAP_PHASES_PER_PAGE = 2;

type TopicScoreItem = { t: string; s: number };

const STYLES = `
  .${SA_PREMIUM_REPORT_ROOT},
  .${SA_PREMIUM_REPORT_ROOT} * {
    box-sizing: border-box;
  }
  .${SA_PREMIUM_REPORT_ROOT} {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Arial, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
    background: #f1f5f9;
    margin: 0;
    padding: 0;
  }
  .${SA_PREMIUM_REPORT_ROOT}.${SA_PREMIUM_REPORT_ROOT}--toolbar {
    padding-top: 64px;
  }
  @page { size: A4; margin: 0; }
  @media print {
    .${SA_PREMIUM_REPORT_ROOT} { background: white !important; }
    .${SA_PREMIUM_REPORT_ROOT} .no-print { display: none !important; }
    .${SA_PREMIUM_REPORT_ROOT} .page-break { page-break-before: always; break-before: page; }
    .${SA_PREMIUM_REPORT_ROOT} * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
  @keyframes sa-report-spin { to { transform: rotate(360deg); } }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pctBar(score: number, color = 'linear-gradient(90deg,#c4b5fd,#e879f9)', h = 8) {
  return (
    <div style={{ height: h, background: '#f1f5f9', borderRadius: h / 2, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: h / 2 }} />
    </div>
  );
}

function badge(label: string, bg: string, color: string) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: bg, color, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
      {label}
    </span>
  );
}

function topicLabel(score: number) {
  if (score >= 70) return badge('Strong', '#ede9fe', '#6d28d9');
  if (score >= 45) return badge('Developing', '#e0f2fe', '#0369a1');
  return badge('Focus', '#fee2e2', '#b91c1c');
}

function bandColors(pct: number): { bg: string; accent: string; text: string } {
  if (pct > 90) return { bg: '#f0fdf4', accent: '#22c55e', text: '#15803d' };
  if (pct >= 76) return { bg: '#ecfdf5', accent: '#0ea5e9', text: '#0369a1' };
  if (pct >= 51) return { bg: '#eef2ff', accent: '#818cf8', text: '#4338ca' };
  if (pct >= 26) return { bg: '#fffbeb', accent: '#f59e0b', text: '#b45309' };
  return { bg: '#fff1f2', accent: '#fb7185', text: '#be123c' };
}

function strengthNarrative(topic: string) {
  const copy: Record<string, string> = {
    'Language Readiness': 'Your language readiness is a powerful strategic advantage because it improves far more than test performance. It strengthens SOP quality, interview confidence, classroom participation, networking, and internship communication in international environments. To maximise this edge, convert your current fluency into outcome evidence: maintain a score-target plan for IELTS/TOEFL, build a speaking and writing portfolio, and track measurable monthly progress that can be clearly presented in applications.',
    'Scholastic Readiness': 'Your scholastic readiness reflects disciplined habits, consistency, and dependable academic execution over time. This is especially valuable in global universities where performance depends on self-management, planning, and sustained output rather than last-minute effort. Protect this advantage by maintaining a weekly review structure, documenting grade trends, and showcasing how your study systems help you meet deadlines, absorb complex content, and deliver strong results under real academic pressure.',
    'Academic Readiness': 'Your academic readiness indicates strong subject fundamentals and the ability to engage with higher-level coursework confidently. This creates admission credibility because universities evaluate whether students can thrive in rigorous academic environments after enrolment. Strengthen this profile by mapping your core subjects to target program expectations, adding projects that demonstrate depth, and presenting concrete examples of analytical thinking, research orientation, and academic maturity in your application narrative.',
    'Career & Employability Readiness': 'Your career and employability readiness shows that your education goals are linked to clear professional outcomes, not just degree completion. This significantly improves profile quality because admissions teams value applicants who understand industry direction, role pathways, and long-term relevance of the chosen course. Build on this by curating role-aligned projects, practical certifications, internship evidence, and a focused CV narrative that connects your current capability to employability outcomes after graduation.',
    'Financial Readiness': 'Your financial readiness demonstrates practical awareness and planning maturity, which reduces one of the biggest risk factors in the study abroad journey. Strong budgeting and funding clarity support confident decisions on country choice, application sequencing, and long-term sustainability after arrival. Keep this strength visible by maintaining a destination-wise cost model, documenting funding sources and timelines, and presenting a realistic contingency plan that shows stability, responsibility, and decision preparedness.',
    'Visa & Compliance Readiness': 'Your visa and compliance readiness reflects operational discipline, detail orientation, and process awareness that many students develop too late. This is a critical strength because even strong academic profiles can fail due to missed documents, poor sequencing, or policy misunderstanding. Preserve this advantage through structured checklists, document audits, deadline calendars, and country-specific compliance tracking so your application and visa pipeline remains accurate, timely, and low-risk from start to finish.',
    'Psychological Readiness': 'Your psychological readiness indicates emotional stability, self-awareness, and the capacity to stay functional during uncertainty and transition. These qualities are essential for international education, where students often face isolation, adaptation pressure, and fluctuating confidence before they settle into a new environment. Strengthen this asset with intentional routines for stress regulation, reflection, and support-seeking, while continuing to demonstrate composure, perspective, and balanced decision-making in high-pressure situations.',
    'Social & Cultural Readiness': 'Your social and cultural readiness is a meaningful advantage because it enables faster integration into new communities, classrooms, and multicultural teams. Students with this strength build support systems sooner, communicate across differences more effectively, and unlock more opportunities through collaboration. Expand this edge by increasing cross-cultural interactions, documenting global exposure experiences, and showing how your adaptability, empathy, and communication style can contribute positively to international campus life.',
    'Parental Expectation Readiness': 'Your parental expectation readiness reflects healthy family alignment, which is often an overlooked but decisive stabiliser in study abroad execution. When goals, budgets, and timelines are mutually understood, decisions become faster, conflict reduces, and long-term commitment improves during difficult phases of the journey. Maintain this strength through regular structured discussions, transparent milestone updates, and shared planning decisions so family support remains proactive, informed, and consistently aligned with your academic direction.',
    'Physical & Lifestyle Readiness': 'Your physical and lifestyle readiness gives you a strong performance foundation for the realities of independent life abroad. Good sleep discipline, energy management, and sustainable routines directly influence academic focus, emotional regulation, and productivity during demanding transitions. Convert this strength into long-term success by preserving healthy weekly habits, building resilience-friendly schedules, and demonstrating that your lifestyle systems are practical, repeatable, and suitable for a new country environment.',
    'Resilience Readiness': 'Your resilience readiness demonstrates the ability to recover from setbacks, regulate responses, and continue making progress despite uncertainty. This is one of the most important predictors of success in international education, where rejection, delays, and adaptation challenges are common. Strengthen this differentiator by documenting recovery examples, tracking response strategies that worked, and showing a pattern of persistence, learning, and constructive adaptation in both academic and personal decision contexts.',
    'Decision Readiness': 'Your decision readiness shows strategic clarity, timely judgment, and confidence in evaluating options against long-term goals. This helps you avoid common student traps such as delayed applications, inconsistent priorities, and reactive choices driven by external noise. Leverage this advantage by maintaining explicit decision criteria, timeline gates, and trade-off notes so every major choice-country, course, intake, and budget path-remains coherent, defensible, and aligned with your desired outcomes.',
  };
  return copy[topic] ?? 'This dimension is a clear strength. Continue demonstrating consistent evidence to make it visible in your applications.';
}

function focusNarrative(topic: string) {
  const copy: Record<string, string> = {
    'Language Readiness': 'Prioritise language improvement through weekly speaking drills, writing feedback, and test-focused preparation to raise confidence in academic communication.',
    'Scholastic Readiness': 'Improve scholastic consistency with a weekly study timetable, active revision methods, and milestone tracking to close routine performance gaps.',
    'Academic Readiness': 'Strengthen academic readiness by building subject fundamentals, solving past papers, and producing coursework evidence relevant to your target program.',
    'Career & Employability Readiness': 'Develop career clarity through mentorship, domain exploration, and practical exposure so your course choice translates into long-term outcomes.',
    'Financial Readiness': 'Close financial gaps by building a destination-wise budget, exploring scholarships and loans, and planning monthly savings with family accountability.',
    'Visa & Compliance Readiness': 'Reduce visa risk with early document collection, timeline planning, and regular policy checks for your shortlisted countries.',
    'Psychological Readiness': 'Build emotional readiness through stress-management routines, reflective journaling, and counselor support to improve stability during transitions.',
    'Social & Cultural Readiness': 'Increase social and cultural confidence by engaging in diverse communities, communication practice, and destination-specific cultural preparation.',
    'Parental Expectation Readiness': 'Improve family alignment with structured conversations on priorities, budget boundaries, and realistic timelines to avoid last-minute friction.',
    'Physical & Lifestyle Readiness': 'Raise lifestyle readiness by establishing routines for sleep, nutrition, and physical activity that you can sustain in an independent setting.',
    'Resilience Readiness': 'Build resilience with small weekly stretch goals, setback reviews, and coping strategies that strengthen persistence under pressure.',
    'Decision Readiness': 'Improve decision readiness by defining clear selection criteria, comparing options objectively, and setting non-negotiable deadlines for key choices.',
  };
  return copy[topic] ?? 'This dimension needs focused, measurable weekly action with regular mentor review to produce visible improvement.';
}

function focusActionPlan(topic: string, score: number) {
  const urgency = score < 30 ? 'Start with very small weekly targets and close mentor monitoring.' : 'Use structured weekly targets and fortnightly mentor reviews.';
  const plan: Record<string, string> = {
    'Language Readiness': `${urgency} Build a 6-week cycle covering speaking drills, writing feedback, and mock-test analysis so measurable score gains are visible by month-end.`,
    'Scholastic Readiness': `${urgency} Create a fixed study calendar with daily deep-work blocks, revision checkpoints, and completion tracking to improve consistency.`,
    'Academic Readiness': `${urgency} Prioritise concept reinforcement, past-paper practice, and subject-specific coaching to raise academic confidence before applications.`,
    'Career & Employability Readiness': `${urgency} Map target roles, complete guided project work, and document outcomes in a portfolio aligned to your intended course.`,
    'Financial Readiness': `${urgency} Build a destination-wise budget, define funding mix (savings/loan/scholarship), and review affordability assumptions with family each month.`,
    'Visa & Compliance Readiness': `${urgency} Build a documentation tracker, timeline checklist, and weekly status audit to reduce compliance errors and delays.`,
    'Psychological Readiness': `${urgency} Introduce resilience routines, counseling checkpoints, and stress-management practices to stabilise transition readiness.`,
    'Social & Cultural Readiness': `${urgency} Increase cross-cultural exposure, communication practice, and destination orientation activities to improve adaptability confidence.`,
    'Parental Expectation Readiness': `${urgency} Schedule structured family alignment discussions on goals, budget, and timelines to reduce decision friction.`,
    'Physical & Lifestyle Readiness': `${urgency} Establish sustainable routines for sleep, nutrition, and activity that can be maintained independently abroad.`,
    'Resilience Readiness': `${urgency} Track setbacks and recovery actions weekly to strengthen persistence and improve response under pressure.`,
    'Decision Readiness': `${urgency} Define non-negotiable selection criteria and timeline gates to accelerate high-quality, low-regret choices.`,
  };
  return plan[topic] ?? `${urgency} Break this dimension into weekly milestones and review progress regularly with counselor feedback.`;
}

function strengthExtension(topic: string, score: number) {
  const highConfidence: Record<string, string> = {
    'Language Readiness': 'Because this is already high-confidence, move from preparation to proof: archive mock test trends, polished writing samples, and interview simulations so your communication capability is explicitly visible in SOPs, CV bullet points, and scholarship conversations.',
    'Scholastic Readiness': 'At this confidence level, the priority is academic reliability at scale: maintain a performance tracker, show consistency across terms, and highlight disciplined execution patterns that prove you can handle rigorous coursework from day one.',
    'Academic Readiness': 'With this level of strength, your next step is depth positioning: curate strong subject-linked evidence, show advanced coursework intent, and clearly connect your academic track record to the curriculum demands of your shortlisted programs.',
    'Career & Employability Readiness': 'This is now a strategic asset; make it market-facing: convert clarity into internship outcomes, role-aligned projects, and quantified impact statements that directly reinforce your post-study employability narrative.',
    'Financial Readiness': 'At this level, your advantage is financial confidence plus control: maintain transparent budget sheets, timeline-based fund readiness, and documented fallback pathways so your plan appears stable, realistic, and low-risk to all stakeholders.',
    'Visa & Compliance Readiness': 'This strength should now be operationalised as execution discipline: keep an auditable checklist flow, document milestone completion, and maintain policy-aware timelines that reduce avoidable delays and compliance surprises.',
    'Psychological Readiness': 'With high psychological readiness, focus on repeatable emotional performance: continue routines that protect concentration, decision quality, and stress control, and document coping systems that you can sustain during transition-heavy phases.',
    'Social & Cultural Readiness': 'Your next milestone is contribution, not just adaptation: show examples of collaboration across diverse groups, communication flexibility, and inclusive participation that indicate strong campus and community integration potential.',
    'Parental Expectation Readiness': 'At this strength level, preserve family alignment through structured communication: maintain shared milestone reviews, budget transparency, and role clarity so support remains coordinated during every critical decision stage.',
    'Physical & Lifestyle Readiness': 'Your edge now is consistency under pressure: retain habits that sustain energy, focus, and wellbeing during demanding cycles, and show that your routine is robust enough for independent international living.',
    'Resilience Readiness': 'With resilience already strong, demonstrate recovery intelligence: capture specific setbacks, response actions, and learning outcomes to prove you can adapt quickly without losing momentum in high-uncertainty contexts.',
    'Decision Readiness': 'This level of clarity should translate into faster, higher-quality choices: maintain criteria-based comparisons, deadline discipline, and rationale logs so your pathway remains focused, coherent, and execution-ready.',
  };

  const developingStrong: Record<string, string> = {
    'Language Readiness': 'This is a strong base that can become a signature differentiator if you sustain weekly speaking, writing, and test simulation routines while building a visible portfolio of communication outcomes.',
    'Scholastic Readiness': 'This strength is solid and growing; reinforce it through consistent study systems, measurable monthly targets, and evidence of academic discipline across subjects and assessment formats.',
    'Academic Readiness': 'This is a meaningful advantage; strengthen it by improving subject depth, aligning projects with intended courses, and presenting stronger evidence of analytical and academic maturity.',
    'Career & Employability Readiness': 'You already have useful direction; convert it into stronger outcomes through practical exposure, role-focused projects, and clearly articulated links between course selection and career trajectory.',
    'Financial Readiness': 'This is a dependable foundation; make it decision-ready by tightening destination budgets, validating funding assumptions, and tracking affordability milestones with family-level clarity.',
    'Visa & Compliance Readiness': 'You have a strong process baseline; elevate it with stricter documentation quality checks, deadline discipline, and country-specific policy tracking to minimise execution risk.',
    'Psychological Readiness': 'This is a healthy emotional foundation; make it more robust by maintaining stress-regulation routines, reflective practices, and support structures for high-pressure transition periods.',
    'Social & Cultural Readiness': 'You already show adaptability; deepen it through intentional multicultural interactions, communication practice, and examples of collaboration in diverse settings.',
    'Parental Expectation Readiness': 'This is a stabilising strength; sustain it with regular family planning checkpoints, transparent expectations, and timely updates on applications, costs, and milestones.',
    'Physical & Lifestyle Readiness': 'This is a good performance foundation; strengthen it through disciplined sleep, nutrition, and productivity routines that remain realistic even in demanding academic phases.',
    'Resilience Readiness': 'You have visible resilience potential; build it further by tracking setbacks, documenting response patterns, and consistently applying recovery strategies that protect progress.',
    'Decision Readiness': 'This is a promising strategic base; sharpen it with clearer decision criteria, structured comparison frameworks, and stronger timeline commitment for major choices.',
  };

  if (score >= 85) return highConfidence[topic] ?? 'This is a high-confidence strength. Keep evidence visible and maintain consistent performance.';
  return developingStrong[topic] ?? 'This strength is solid and can become a signature advantage with consistent effort and measurable outcomes.';
}

function focusExtension(score: number) {
  if (score < 30) {
    return 'Because this score is currently in the lower band, start with simple weekly habits and short milestones, then review progress with a counselor every 2-3 weeks for faster correction.';
  }
  return 'This area is improvable with disciplined weekly execution: set measurable 30-day targets, review outcomes regularly, and adjust strategy quickly wherever progress slows down.';
}

function ensureSentence(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return '';
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function ReportBulletList({ items, color }: { items: string[]; color: string }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 18, listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: 7 }}>
      {items.map((item, idx) => (
        <li key={idx} style={{ fontSize: 11.5, color, lineHeight: 1.65 }}>
          {ensureSentence(item)}
        </li>
      ))}
    </ul>
  );
}

function CounselorTopicBlock({ title, body }: { title: string; body: string }) {
  return (
    <li style={{ fontSize: 11.5, color: '#0f172a', lineHeight: 1.65, marginBottom: 2 }}>
      <span style={{ fontWeight: 800, color: '#0f172a' }}>{title}: </span>
      <span>{ensureSentence(body)}</span>
    </li>
  );
}

// ─── Radar Chart (print-safe SVG) ────────────────────────────────────────────
function ReportRadar({ scores }: { scores: Record<string, number> }) {
  const n = ALL_TOPICS.length;
  const S = 460, cx = 230, cy = 230, R = 136;

  // percentage-based: r = (pct/100) * R pixels from center
  const toXY = (pct: number, i: number) => {
    const a = (i * 2 * Math.PI) / n - Math.PI / 2;
    const r = (pct / 100) * R;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  // absolute pixel radius - used for label placement only
  const labelXY = (px: number, i: number) => {
    const a = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x: cx + px * Math.cos(a), y: cy + px * Math.sin(a) };
  };

  const ring = (p: number) => ALL_TOPICS.map((_, i) => `${toXY(p, i).x},${toXY(p, i).y}`).join(' ');
  const pts = ALL_TOPICS.map((t, i) => `${toXY(scores[t] ?? 0, i).x},${toXY(scores[t] ?? 0, i).y}`).join(' ');

  const LONG: Record<string, string> = {
    'Language Readiness': 'Language',
    'Scholastic Readiness': 'Scholastic',
    'Academic Readiness': 'Academic',
    'Career & Employability Readiness': 'Career &\nEmployability',
    'Financial Readiness': 'Financial',
    'Visa & Compliance Readiness': 'Visa &\nCompliance',
    'Psychological Readiness': 'Psychological',
    'Social & Cultural Readiness': 'Social &\nCultural',
    'Parental Expectation Readiness': 'Parental\nExpectation',
    'Physical & Lifestyle Readiness': 'Physical &\nLifestyle',
    'Resilience Readiness': 'Resilience',
    'Decision Readiness': 'Decision',
  };

  return (
    <svg
      width={S}
      height={S}
      viewBox={`0 0 ${S} ${S}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: `${S}px`, height: `${S}px`, display: 'block', margin: '0 auto', flexShrink: 0 }}
    >
      {[20, 40, 60, 80, 100].map(p => (
        <polygon key={p} points={ring(p)} fill={p === 100 ? 'rgba(248,250,252,0.5)' : 'none'} stroke={p % 40 === 0 ? '#cbd5e1' : '#e2e8f0'} strokeWidth="0.8" />
      ))}
      {ALL_TOPICS.map((_, i) => {
        const e = toXY(100, i);
        return <line key={i} x1={cx} y1={cy} x2={e.x} y2={e.y} stroke="#e2e8f0" strokeWidth="0.8" />;
      })}
      <polygon points={pts} fill="rgba(165,180,252,0.22)" stroke="#818cf8" strokeWidth="2.5" strokeLinejoin="round" />
      {ALL_TOPICS.map((t, i) => {
        const pt = toXY(scores[t] ?? 0, i);
        return <circle key={i} cx={pt.x} cy={pt.y} r={4.5} fill="#818cf8" stroke="white" strokeWidth="2" />;
      })}
      {ALL_TOPICS.map((t, i) => {
        // Place labels at 158px from center - 22px outside the outer ring (R=136)
        const pos = labelXY(158, i);
        const raw = LONG[t] ?? t;
        const lines = raw.split('\n');
        const lineH = 9.5;
        return (
          <text key={i} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#0f172a" fontWeight="700">
            {lines.map((ln, li) => (
              <tspan key={li} x={pos.x} dy={li === 0 ? `${-(lines.length - 1) * lineH / 2}` : lineH}>{ln}</tspan>
            ))}
          </text>
        );
      })}
      {[20, 40, 60, 80, 100].map(p => {
        const pos = toXY(p, 0);
        return <text key={p} x={pos.x + 5} y={pos.y} fontSize="8" fill="#64748b" dominantBaseline="middle">{p}%</text>;
      })}
    </svg>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SH({ n, title, sub }: { n: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#818cf8,#c084fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{n}</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{title}</h2>
      </div>
      {sub && <p style={{ fontSize: 11, color: '#94a3b8', marginLeft: 38, letterSpacing: '0.03em', textTransform: 'uppercase', fontWeight: 600 }}>{sub}</p>}
      <div style={{ height: 1.5, background: 'linear-gradient(90deg,#818cf8 0%,#c084fc 40%,transparent 100%)', marginTop: 10 }} />
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPI({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  return (
    <div style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: accent }} />
      <p style={{ fontSize: 9.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.15 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#1e293b', marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
function Page({ children, noPadding, pageIndex }: { children: React.ReactNode; noPadding?: boolean; pageIndex: number }) {
  return (
    <div
      data-report-page={pageIndex}
      className="page-break"
      style={{
        width: '794px',
        height: '1123px',
        background: 'white',
        margin: '0 auto',
        padding: noPadding ? 0 : REPORT_PAGE_PADDING,
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

function StrengthsFocusGrid({
  strengths,
  focusAreas,
  strengthNumberOffset = 0,
  focusNumberOffset = 0,
}: {
  strengths: TopicScoreItem[];
  focusAreas: TopicScoreItem[];
  strengthNumberOffset?: number;
  focusNumberOffset?: number;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <div style={{ width: 6, height: 24, borderRadius: 3, background: 'linear-gradient(180deg,#86efac,#4ade80)' }} />
          <h3 style={{ fontSize: 13, fontWeight: 800, color: '#166534' }}>Core Strengths</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {strengths.length === 0 && strengthNumberOffset === 0 && (
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 11, padding: '12px 14px' }}>
              <p style={{ fontSize: 11, color: '#334155', lineHeight: 1.6 }}>
                No dimensions are currently at or above 80%. Continue improving current strengths to move into the core-strength zone.
              </p>
            </div>
          )}
          {strengths.map(({ t, s }, i) => (
            <div key={t} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 11, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>#{strengthNumberOffset + i + 1} {t}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#15803d' }}>{s}%</span>
              </div>
              <div style={{ height: 5, background: '#dcfce7', borderRadius: 2.5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s}%`, background: 'linear-gradient(90deg,#86efac,#4ade80)', borderRadius: 2.5 }} />
              </div>
              <ul style={{ marginTop: 7, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4, listStyleType: 'disc' }}>
                <li style={{ fontSize: 10.5, color: '#166534', lineHeight: 1.55 }}>{ensureSentence(strengthNarrative(t))}</li>
                <li style={{ fontSize: 10.5, color: '#166534', lineHeight: 1.55 }}>{ensureSentence(strengthExtension(t, s))}</li>
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <div style={{ width: 6, height: 24, borderRadius: 3, background: 'linear-gradient(180deg,#fda4af,#f43f5e)' }} />
          <h3 style={{ fontSize: 13, fontWeight: 800, color: '#9f1239' }}>Priority Focus Areas</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {focusAreas.length === 0 && focusNumberOffset === 0 && (
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 11, padding: '12px 14px' }}>
              <p style={{ fontSize: 11, color: '#334155', lineHeight: 1.6 }}>
                No dimensions are currently below 50%. Maintain consistency and continue targeted improvement to sustain readiness momentum.
              </p>
            </div>
          )}
          {focusAreas.map(({ t, s }, i) => (
            <div key={t} style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 11, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#be123c' }}>#{focusNumberOffset + i + 1} {t}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#be123c' }}>{s}%</span>
              </div>
              <div style={{ height: 5, background: '#ffe4e6', borderRadius: 2.5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s}%`, background: 'linear-gradient(90deg,#fda4af,#f43f5e)', borderRadius: 2.5 }} />
              </div>
              <ul style={{ marginTop: 7, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4, listStyleType: 'disc' }}>
                <li style={{ fontSize: 10.5, color: '#9f1239', lineHeight: 1.55 }}>{ensureSentence(focusNarrative(t))}</li>
                <li style={{ fontSize: 10.5, color: '#9f1239', lineHeight: 1.55 }}>{ensureSentence(focusActionPlan(t, s))}</li>
                <li style={{ fontSize: 10.5, color: '#9f1239', lineHeight: 1.55 }}>{ensureSentence(focusExtension(s))}</li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoadmapPhaseList({ steps, totalPhases }: { steps: RoadmapStep[]; totalPhases: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      {steps.map((step, i) => {
        const priorityColors = {
          high: { bg: '#fff1f2', border: '#fecdd3', text: '#be123c' },
          medium: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
          low: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
        };
        const pc = priorityColors[step.priority];
        const showConnector = i < steps.length - 1 || step.phase < totalPhases;
        return (
          <div key={step.phase} style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#818cf8,#c084fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 800 }}>{step.phase}</div>
              {showConnector && <div style={{ width: 1.5, flex: 1, background: '#e2e8f0', marginTop: 4 }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{step.title}</p>
                  <p style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{step.timeframe}</p>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: pc.bg, color: pc.text, border: `1px solid ${pc.border}`, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0, lineHeight: 1.3 }}>{step.priority} priority</span>
              </div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Goal</p>
              <p style={{ fontSize: 11, color: '#1e293b', lineHeight: 1.55, marginBottom: 8 }}>{step.summary}</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Key Tasks</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {step.actions.slice(0, 3).map((a, j) => (
                  <div key={j} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#818cf8', marginTop: 4, flexShrink: 0 }} />
                    <p style={{ fontSize: 10.5, color: '#1e293b', lineHeight: 1.5, margin: 0 }}>{a}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 7, marginBottom: 3 }}>Guidance & Mentorship</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {step.resources.slice(0, 2).map((r, j) => (
                  <div key={j} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#4338ca', marginTop: 4, flexShrink: 0 }} />
                    <p style={{ fontSize: 10.5, color: '#1e293b', lineHeight: 1.5, margin: 0 }}>{r}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 6, padding: '5px 10px', background: '#f8faff', borderRadius: 6, border: '1px solid #e0e7ff', display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                <span style={{ fontSize: 9, color: '#6366f1' }}>🎯</span>
                <span style={{ fontSize: 9.5, color: '#4338ca', fontWeight: 600 }}>{step.milestone}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Small page footer ────────────────────────────────────────────────────────
function PFooter({ page, total }: { page: number; total: number }) {
  return (
    <div style={{ position: 'absolute', bottom: '8mm', left: '18mm', right: '18mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: 9, color: '#0f172a', letterSpacing: '0.04em', fontWeight: 600 }}>ADMITra × KAREER Studio - Confidential Student Report</span>
      <span style={{ fontSize: 9, color: '#0f172a', fontWeight: 600 }}>Page {page} / {total}</span>
    </div>
  );
}

export type StudyAbroadPremiumPrintReportProps = {
  result: AssessmentResult;
  history?: AssessmentResult[];
  studentName: string;
  profile?: StudentProfile | null;
  showToolbar?: boolean;
  backHref?: string;
  autoPrint?: boolean;
};

export default function StudyAbroadPremiumPrintReport({
  result,
  history = [],
  studentName,
  profile = null,
  showToolbar = true,
  backHref,
  autoPrint = false,
}: StudyAbroadPremiumPrintReportProps) {
  useEffect(() => {
    if (!autoPrint) return;
    const timer = window.setTimeout(() => window.print(), 600);
    return () => window.clearTimeout(timer);
  }, [autoPrint]);

  const pct = scoreToPercentage(result.overallScore);
  const band = bandFromPercentage(pct);
  const bandLabel = band === 'At Risk' ? 'At Risk' : band;
  const bc = bandColors(pct);
  const { top, bottom } = getTopAndBottomTopics(result, 4);
  const careers = deriveCareerMatches(result);
  const roadmap = deriveRoadmap(result);
  const sortedTopics = ALL_TOPICS.map(t => ({ t, s: result.topicScores[t] })).sort((a, b) => b.s - a.s);
  const coreStrengths = sortedTopics.filter(({ s }) => s >= 80).slice(0, 4);
  const priorityFocusAreas = [...sortedTopics].reverse().filter(({ s }) => s < 50).slice(0, 4);
  const assessDate = new Date(result.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const displayName = studentName || profile?.fullName || 'Student';

  const aiSummary =
    `${displayName} has completed the Study Abroad Readiness Assessment, achieving ${result.overallScore}/150 (${pct}%), placing them in the "${bandLabel}" category. ` +
    (pct >= 76
      ? 'This performance reflects strong foundational readiness across most dimensions - the student is well-positioned to pursue international education opportunities.'
      : pct >= 51
      ? 'This score reflects a solid foundation with specific dimensions requiring focused development. Structured preparation over 3–6 months could significantly elevate readiness.'
      : pct >= 26
      ? 'Meaningful readiness exists in several areas, yet significant gaps remain across key dimensions. A comprehensive 6–12 month preparation plan is strongly recommended.'
      : 'Foundational readiness challenges are present across multiple dimensions. Systematic, guided preparation is essential before initiating any study abroad applications.') +
    ` The strongest performance area is ${top[0]?.label ?? 'N/A'} (${top[0]?.score ?? 0}%), which should be prominently featured in applications. The primary development opportunity is ${bottom[0]?.label ?? 'N/A'} (${bottom[0]?.score ?? 0}%), where targeted intervention will yield the greatest readiness gains.`;
  const summaryPoints = aiSummary.split('.').map(s => s.trim()).filter(Boolean).map(s => `${s}.`);

  const adaptabilityScore = Math.round(
    (result.topicScores['Psychological Readiness'] + result.topicScores['Resilience Readiness']) / 2,
  );
  const practicalScore = Math.round(
    (result.topicScores['Financial Readiness'] + result.topicScores['Visa & Compliance Readiness']) / 2,
  );

  const counselorIntro = `Based on a holistic review of ${displayName}'s assessment profile, the following professional observations are highlighted:`;
  const counselorTopics = [
    {
      title: 'Academic & Career Direction',
      body: careers[0]?.reason ?? 'Career alignment should be reviewed with a counselor to connect course choice with long-term outcomes.',
    },
    {
      title: 'Adaptability Index',
      body:
        `Combined Psychological + Resilience score of ${adaptabilityScore}% ` +
        (adaptabilityScore >= 60
          ? 'indicates robust emotional preparedness for international transition.'
          : 'suggests that resilience-building and mental preparation activities should be prioritised before departure.'),
    },
    {
      title: 'Practical Preparedness',
      body:
        `Financial Readiness (${result.topicScores['Financial Readiness']}%) and Visa & Compliance (${result.topicScores['Visa & Compliance Readiness']}%) ` +
        (practicalScore >= 60
          ? 'demonstrate strong awareness of international study logistics.'
          : 'require dedicated attention — financial planning sessions and immigration orientation workshops are recommended.'),
    },
  ];

  const parentGreeting = `Dear Parents/Guardians of ${displayName},`;
  const parentIntroParagraphs = [
    'Thank you for supporting your child\'s international education aspirations. This report provides a comprehensive snapshot of their current readiness profile.',
    `${displayName} has scored ${pct}% (${result.overallScore}/150), classified as "${bandLabel}". ` +
      (pct >= 76
        ? 'The results indicate strong preparation — your child is approaching readiness for international study. Continue reinforcing their strengths and addressing the highlighted focus areas.'
        : pct >= 51
        ? 'Meaningful progress is evident. With structured 3–6 month preparation focusing on the identified weaker areas, significant readiness improvement is achievable.'
        : 'There is room to grow. Your active involvement — particularly in financial planning, emotional support, and awareness-building — will be critical to their success.'),
  ];
  const parentActionItems = [
    'Discuss realistic financial commitments including tuition, accommodation, insurance, and living costs for your target destination.',
    'Engage in open conversations about the emotional and social challenges of studying abroad.',
    'Explore education loans, scholarships, and government schemes early.',
  ];
  const parentClosing =
    'We recommend scheduling a comprehensive counselling session with ADMITra / KAREER Studio for a personalised roadmap aligned with your family\'s goals.';

  const strengthsFirstPage = coreStrengths.slice(0, STRENGTHS_ON_FIRST_PAGE);
  const strengthsContinued = coreStrengths.slice(STRENGTHS_ON_FIRST_PAGE);
  const focusFirstPage = priorityFocusAreas.slice(0, FOCUS_ON_FIRST_PAGE);
  const focusContinued = priorityFocusAreas.slice(FOCUS_ON_FIRST_PAGE);
  const hasStrengthFocusContinuation = strengthsContinued.length > 0 || focusContinued.length > 0;

  const roadmapChunks: RoadmapStep[][] = [];
  for (let i = 0; i < roadmap.length; i += ROADMAP_PHASES_PER_PAGE) {
    roadmapChunks.push(roadmap.slice(i, i + ROADMAP_PHASES_PER_PAGE));
  }

  const strengthFocusPageCount = hasStrengthFocusContinuation ? 2 : 1;
  const roadmapPageCount = roadmapChunks.length;
  const strengthFocusStartIndex = 3;
  const roadmapStartIndex = strengthFocusStartIndex + strengthFocusPageCount;
  const finalPageIndex = roadmapStartIndex + roadmapPageCount;
  const counselorPageIndex = finalPageIndex + 1;
  const backCoverPageIndex = counselorPageIndex + 1;
  const totalPages = backCoverPageIndex + 1;

  const rootClassName = showToolbar
    ? `${SA_PREMIUM_REPORT_ROOT} ${SA_PREMIUM_REPORT_ROOT}--toolbar`
    : SA_PREMIUM_REPORT_ROOT;

  return (
    <div className={rootClassName}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {showToolbar ? (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'linear-gradient(135deg,#6366f1,#9333ea)', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 24px rgba(99,102,241,0.35)' }}>
          <div style={{ color: 'white' }}>
            <p style={{ fontWeight: 700, fontSize: 14 }}>Premium Readiness Report - {displayName}</p>
            <p style={{ fontSize: 11, opacity: 0.75 }}>Scroll to preview all pages · Use Print to save as PDF</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {backHref ? (
              <button type="button" onClick={() => { window.location.href = backHref; }} style={{ padding: '8px 18px', borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>← Back</button>
            ) : null}
            <button type="button" onClick={() => window.print()} style={{ padding: '8px 22px', borderRadius: 9, border: 'none', background: 'white', color: '#6366f1', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.18)', letterSpacing: '-0.01em' }}>🖨 Print / Save as PDF</button>
          </div>
        </div>
      ) : null}

      <div style={{ background: '#f1f5f9' }}>

        {/* ═══════════════════════════════════════════════════════════════
            PAGE 1 - COVER (template + dynamic overlays, same layout as RQ)
        ════════════════════════════════════════════════════════════════ */}
        <div
          data-report-page={0}
          style={{
            width: '794px',
            height: '1123px',
            margin: '0 auto',
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          <img
            src={SA_COVER_IMAGE}
            alt=""
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />

          <p
            style={saCoverOverlayStyle(58, 455, {
              fontSize: Math.round(26 * SA_COVER_SCALE_X),
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
              fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
            })}
          >
            {displayName}
          </p>

          <p
            style={saCoverOverlayStyle(52, 536, {
              width: Math.round(98 * SA_COVER_SCALE_X),
              textAlign: 'center',
              fontSize: Math.round(30 * SA_COVER_SCALE_X),
              fontWeight: 700,
              color: '#0ea5e9',
              margin: 0,
              fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
            })}
          >
            {result.overallScore}
          </p>
          <p
            style={saCoverOverlayStyle(52, 566, {
              width: Math.round(98 * SA_COVER_SCALE_X),
              textAlign: 'center',
              fontSize: Math.round(7.5 * SA_COVER_SCALE_X),
              fontWeight: 400,
              color: '#94a3b8',
              margin: 0,
              letterSpacing: '0.06em',
              fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
            })}
          >
            SCORE
          </p>

          <p
            style={saCoverOverlayStyle(168, 536, {
              width: Math.round(178 * SA_COVER_SCALE_X),
              textAlign: 'center',
              fontSize: Math.round(18 * SA_COVER_SCALE_X),
              fontWeight: 700,
              color: bc.text,
              margin: 0,
              fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
            })}
          >
            {bandLabel}
          </p>
          <p
            style={saCoverOverlayStyle(168, 566, {
              width: Math.round(178 * SA_COVER_SCALE_X),
              textAlign: 'center',
              fontSize: Math.round(7.5 * SA_COVER_SCALE_X),
              fontWeight: 400,
              color: bc.text,
              margin: 0,
              letterSpacing: '0.06em',
              fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
            })}
          >
            READINESS LEVEL
          </p>

          <p
            style={{
              position: 'absolute',
              left: Math.round(110 * SA_COVER_SCALE_X),
              bottom: Math.round(44 * SA_COVER_SCALE_Y),
              fontSize: Math.round(8 * SA_COVER_SCALE_X),
              fontWeight: 400,
              color: '#cbd5e1',
              margin: 0,
              fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
            }}
          >
            {assessDate}
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            PAGE 2 - EXECUTIVE SUMMARY
        ════════════════════════════════════════════════════════════════ */}
        <Page pageIndex={1}>
          <SH n="01" title="Executive Summary" sub="Intelligence Snapshot" />

          {/* KPI grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            <KPI label="Overall Score" value={`${result.overallScore} / 150`} sub={`${pct}% readiness`} accent="linear-gradient(90deg,#818cf8,#c084fc)" />
            <KPI label="Readiness Band" value={bandLabel} sub={pct >= 76 ? 'Well positioned' : pct >= 51 ? 'Good foundation' : pct >= 26 ? 'Developing' : 'Needs work'} accent={bc.accent} />
            <KPI label="Assessment Attempts" value={`${history.length}`} sub={history.length > 1 ? `${history.length - 1} prior attempt${history.length > 2 ? 's' : ''}` : 'First attempt'} accent="#67e8f9" />
            <KPI label="Top Strength" value={top[0]?.label ?? '-'} sub={`${top[0]?.score ?? 0}% score`} accent="#86efac" />
            <KPI label="Priority Focus" value={bottom[0]?.label ?? '-'} sub={`${bottom[0]?.score ?? 0}% - highest impact`} accent="#fda4af" />

          </div>

          {/* Summary */}
          <div style={{ background: '#f8faff', border: '1px solid #e0e7ff', borderRadius: 14, padding: '22px 24px', marginBottom: 18, minHeight: 178 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Summary</p>
            <ul style={{ margin: 0, paddingLeft: 0, listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {summaryPoints.map((point, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13.5, color: '#0f172a', lineHeight: 1.65, fontWeight: 600 }}>
                  <span style={{ color: '#6366f1', lineHeight: 1.7 }}>•</span>
                  <span style={{ flex: 1 }}>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* readiness progress */}
          <div style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Overall Readiness</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#818cf8' }}>{pct}%</p>
            </div>
            <div style={{ height: 14, background: '#f1f5f9', borderRadius: 7, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#818cf8,#c084fc,#e879f9)', borderRadius: 7, transition: 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {['At Risk', 'Partially Ready', 'Moderately Ready', 'Almost Ready', 'Completely Ready'].map((l, i) => (
                <span key={i} style={{ fontSize: 9.5, color: '#0f172a', fontWeight: i === (pct > 90 ? 4 : pct >= 76 ? 3 : pct >= 51 ? 2 : pct >= 26 ? 1 : 0) ? 800 : 500 }}>{l}</span>
              ))}
            </div>
          </div>

          <PFooter page={2} total={totalPages} />
        </Page>

        {/* ═══════════════════════════════════════════════════════════════
            PAGE 3 - READINESS DIMENSION ANALYSIS
        ════════════════════════════════════════════════════════════════ */}
        <Page pageIndex={2}>
          <SH n="02" title="Readiness Dimension Analysis" sub="12-Axis Psychometric Radar" />

          <div>
            {/* Radar */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
              <ReportRadar scores={result.topicScores as unknown as Record<string, number>} />
            </div>

            {/* Overview below graph */}
            <div>
              <p style={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Dimension Overview</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {sortedTopics.map(({ t, s }) => (
                  <div key={t} style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 8px', background: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: '#0f172a', fontWeight: 700 }}>{t.replace(' Readiness', '')}</span>
                      <span style={{ fontSize: 11, color: '#0f172a', fontWeight: 800 }}>{s}%</span>
                    </div>
                    <div style={{ height: 5, background: '#f1f5f9', borderRadius: 2.5, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s}%`, background: s >= 70 ? '#818cf8' : s >= 45 ? '#67e8f9' : '#fda4af', borderRadius: 2.5 }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14, background: bc.bg, borderRadius: 10, padding: '12px 14px', border: `1px solid ${bc.accent}30` }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: bc.text, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Band Interpretation</p>
                <p style={{ fontSize: 11.5, color: '#1e293b', lineHeight: 1.65 }}>
                  {band === 'Completely Ready' && 'Exceptional readiness across all dimensions. You are fully equipped for international study - focus on top-tier applications and maximising scholarship opportunities.'}
                  {band === 'Almost Ready' && 'Strong foundation in place. A few targeted improvements in weaker areas will complete your readiness profile. Ideal time to begin serious university applications.'}
                  {band === 'Moderately Ready' && 'Core readiness is developing well. A structured 3–6 month preparation program focusing on identified weak dimensions will significantly boost your profile.'}
                  {band === 'Partially Ready' && 'Meaningful readiness exists but substantial preparation is required. Prioritise the bottom three dimensions and track monthly progress against clear milestones.'}
                  {band === 'At Risk' && 'Significant gaps identified across multiple dimensions. A comprehensive foundation-building program over 6–12 months is strongly recommended before applying.'}
                </p>
              </div>
            </div>
          </div>

          <PFooter page={3} total={totalPages} />
        </Page>

        {/* ═══════════════════════════════════════════════════════════════
            STRENGTHS & FOCUS — page 1 (whole cards only; overflow continues)
        ════════════════════════════════════════════════════════════════ */}
        <Page pageIndex={strengthFocusStartIndex}>
          <SH n="03" title="Strengths & Priority Focus Areas" sub="Personalised Intelligence Analysis" />
          <StrengthsFocusGrid
            strengths={strengthsFirstPage}
            focusAreas={focusFirstPage}
          />
          {!hasStrengthFocusContinuation && (
            <div style={{ marginTop: 18, background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Recommended Action</p>
              <p style={{ fontSize: 11.5, color: '#78350f', lineHeight: 1.65 }}>
                Prioritise all dimensions below 50% first, while sustaining dimensions above 80% through weekly maintenance. Schedule a counselling session with ADMITra / KAREER Studioto build a customised, score-threshold based action plan.
              </p>
            </div>
          )}
          <PFooter page={strengthFocusStartIndex + 1} total={totalPages} />
        </Page>

        {hasStrengthFocusContinuation && (
          <Page pageIndex={strengthFocusStartIndex + 1}>
            <SH n="03" title="Strengths & Priority Focus Areas" sub="Continued" />
            <StrengthsFocusGrid
              strengths={strengthsContinued}
              focusAreas={focusContinued}
              strengthNumberOffset={strengthsFirstPage.length}
              focusNumberOffset={focusFirstPage.length}
            />
            <div style={{ marginTop: 18, background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Recommended Action</p>
              <p style={{ fontSize: 11.5, color: '#78350f', lineHeight: 1.65 }}>
                Prioritise all dimensions below 50% first, while sustaining dimensions above 80% through weekly maintenance. Schedule a counselling session with ADMITra / KAREER Studioto build a customised, score-threshold based action plan.
              </p>
            </div>
            <PFooter page={strengthFocusStartIndex + 2} total={totalPages} />
          </Page>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            ROADMAP — 2 phases per page (whole boxes; phase 5+ on later pages)
        ════════════════════════════════════════════════════════════════ */}
        {roadmapChunks.map((chunk, chunkIdx) => (
          <Page key={`roadmap-${chunkIdx}`} pageIndex={roadmapStartIndex + chunkIdx}>
            <SH
              n="04"
              title="Personalised Study Abroad Roadmap"
              sub={chunkIdx === 0 ? '6-Phase Preparation Framework' : 'Continued'}
            />
            <RoadmapPhaseList steps={chunk} totalPhases={roadmap.length} />
            <PFooter page={roadmapStartIndex + chunkIdx + 1} total={totalPages} />
          </Page>
        ))}

        {/* ═══════════════════════════════════════════════════════════════
            FINAL RECOMMENDATION & APPENDIX
        ════════════════════════════════════════════════════════════════ */}
        <Page pageIndex={finalPageIndex}>
          <SH n="05" title="Final Recommendations & Appendix" sub="Action Summary & Reference Guide" />

          {/* Final recommendation box */}
          <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius: 16, padding: '22px 24px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(139,92,246,0.2)' }} />
            <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Final Recommendation</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: 'white', marginBottom: 12, lineHeight: 1.4 }}>
              {bandLabel} - {pct}% Ready for Study Abroad
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
              {pct >= 76
                ? `${displayName} demonstrates strong readiness for international education. We recommend proceeding with university shortlisting and application preparation. Focus on strengthening the bottom 2–3 dimensions while building a compelling application narrative around your strongest areas.`
                : pct >= 51
                ? `${displayName} has a solid foundation but requires 3–6 months of structured preparation before applications. Prioritise the identified weak dimensions, complete language proficiency tests, and begin financial planning immediately.`
                : pct >= 26
                ? `${displayName} needs comprehensive preparation before pursuing study abroad. A 6–12 month preparation program covering academic strengthening, financial planning, psychological readiness, and administrative preparedness is strongly recommended.`
                : `${displayName} requires foundational preparation across multiple readiness dimensions. A systematic 12+ month program with counselor-guided milestones is essential. Begin with the highest-priority dimensions and reassess quarterly.`}
            </p>
          </div>

          {/* Next Steps */}
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Recommended Next Steps</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { icon: '📋', title: 'Book Counselling Session', desc: 'Schedule a 1-on-1 with ADMITra / KAREER Studio  for personalised planning' },
                { icon: '📚', title: 'Begin Preparation Plan', desc: `Start with ${bottom[0]?.label ?? 'your weakest dimension'} Readiness - It's highest readiness ROI` },
                { icon: '🎯', title: 'Set 30-Day Milestones', desc: 'Track weekly progress against the 6-phase roadmap goals' },
                { icon: '🔄', title: 'Retake in 60 Days', desc: 'Measure improvement and update your readiness profile' },
              ].map(step => (
                <div key={step.title} style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{step.icon}</span>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{step.title}</p>
                    <p style={{ fontSize: 10.5, color: '#334155', marginTop: 2, lineHeight: 1.5 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Band Reference Table */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Score Band Reference</p>
            <div style={{ border: '1px solid #f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
              {[
                { range: '91–100%', band: 'Completely Ready', color: '#22c55e', desc: 'Exceptional readiness - ideal for top-tier applications' },
                { range: '76–90%', band: 'Almost Ready', color: '#0ea5e9', desc: 'Strong foundation - minor refinements needed' },
                { range: '51–75%', band: 'Moderately Ready', color: '#818cf8', desc: 'Good base - structured 3-6 month prep required' },
                { range: '26–50%', band: 'Partially Ready', color: '#f59e0b', desc: 'Development gaps - 6-12 month prep plan essential' },
                { range: '0–25%', band: 'At Risk', color: '#f43f5e', desc: 'Foundational work needed - systematic approach required' },
              ].map((row, i) => (
                <div key={row.band} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 14px', background: i % 2 === 0 ? 'white' : '#fafafa', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: '#0f172a', width: 60 }}>{row.range}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: row.color, width: 110 }}>{row.band}</span>
                  <span style={{ fontSize: 10.5, color: '#334155' }}>{row.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <PFooter page={finalPageIndex + 1} total={totalPages} />
        </Page>

        {/* ═══════════════════════════════════════════════════════════════
            COUNSELOR & PARENT NOTES
        ════════════════════════════════════════════════════════════════ */}
        <Page pageIndex={counselorPageIndex}>
          <SH n="06" title="Counselor Notes & Parent Guidance" sub="Professional Analysis & Family Action Plan" />

          {/* Counselor notes */}
          <div style={{ background: '#f8faff', border: '1px solid #c7d2fe', borderRadius: 14, padding: '18px 20px', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#818cf8,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 14 }}>👨‍🏫</span>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#3730a3' }}>Counselor Observations</p>
                <p style={{ fontSize: 10, color: '#6366f1', opacity: 0.75 }}>ADMITra / KAREER Studio Professional Analysis</p>
              </div>
            </div>
            <p style={{ fontSize: 11.5, color: '#0f172a', lineHeight: 1.65, fontWeight: 800, marginBottom: 12 }}>
              {counselorIntro}
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {counselorTopics.map((topic) => (
                <CounselorTopicBlock key={topic.title} title={topic.title} body={topic.body} />
              ))}
            </ul>
          </div>

          {/* Parent guidance */}
          <div style={{ background: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#c084fc,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 14 }}>👨‍👩‍👧</span>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#7e22ce' }}>Parent & Guardian Guidance</p>
                <p style={{ fontSize: 10, color: '#a855f7', opacity: 0.75 }}>Family Support Framework</p>
              </div>
            </div>

            <p style={{ fontSize: 11.5, color: '#0f172a', lineHeight: 1.65, fontWeight: 800, marginBottom: 10 }}>
              {parentGreeting}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
              {parentIntroParagraphs.map((para, i) => (
                <p key={i} style={{ fontSize: 11.5, color: '#0f172a', lineHeight: 1.65, margin: 0 }}>
                  {ensureSentence(para)}
                </p>
              ))}
            </div>

            <p style={{ fontSize: 10.5, fontWeight: 800, color: '#7e22ce', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Key Parent Action Items
            </p>
            <ReportBulletList items={parentActionItems} color="#0f172a" />

            <p style={{ fontSize: 11.5, color: '#0f172a', lineHeight: 1.65, marginTop: 12, marginBottom: 0 }}>
              {ensureSentence(parentClosing)}
            </p>
          </div>

          {/* Footer branding */}
          <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>ADMITra × KAREER Studio</p>
              <p style={{ fontSize: 10, color: '#94a3b8' }}>Study Abroad Readiness Platform</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 10, color: '#94a3b8' }}>This report is confidential and intended solely for {displayName}.</p>
            </div>
          </div>

          <PFooter page={counselorPageIndex + 1} total={totalPages} />
        </Page>

        {/* ═══════════════════════════════════════════════════════════════
            BACK COVER
        ════════════════════════════════════════════════════════════════ */}
        <div
          data-report-page={backCoverPageIndex}
          className="page-break"
          style={{
            width: '794px',
            height: '1123px',
            margin: '0 auto',
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          <img
            src={SA_BACK_COVER_IMAGE}
            alt=""
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

      </div>
    </div>
  );
}
