/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AQReport.tsx — Premium 10-page AQ Behavioral Analytics PDF
 * Rendered with @react-pdf/renderer v4
 *
 * Font system: Inter (jsDelivr @fontsource CDN)
 *   — Eliminates "Could not resolve font for Helvetica-Bold, fontWeight 400, fontStyle italic"
 *   — All text uses fontFamily: 'Inter' + fontWeight: 400 | 600 | 700
 *   — No fontFamily: 'Helvetica-Bold' (root cause of the error)
 *   — No fontStyle: 'italic' (Inter has no italic variant)
 */
import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Svg,
  G,
  Path,
  Rect,
  Circle,
  Line,
  Polygon,
  Font,
} from '@react-pdf/renderer';

/* ─────────────────────────── Font Registration ───────────────────────────── */

Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.0/files/inter-latin-400-normal.woff',
      fontWeight: 400,
      fontStyle: 'normal',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.0/files/inter-latin-500-normal.woff',
      fontWeight: 500,
      fontStyle: 'normal',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.0/files/inter-latin-600-normal.woff',
      fontWeight: 600,
      fontStyle: 'normal',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.0/files/inter-latin-700-normal.woff',
      fontWeight: 700,
      fontStyle: 'normal',
    },
  ],
});

// Disable hyphenation to prevent layout issues
Font.registerHyphenationCallback((word) => [word]);
/* ─────────────────────────── Inlined Types (react-pdf context) ─────────────── */

interface AQTrendPoint {
  attempt: number;
  score: number;
  level: string;
  date: string;
  assessmentTitle: string;
  durationSeconds?: number;
  difficulty?: string;
}

interface SubscaleAverage {
  dimension: string;
  avgPercentage: number;
}

interface AQHistoryResponse {
  totalAttempts: number;
  bestScore: number;
  avgScore: number;
  latestScore: number | null;
  latestLevel: string | null;
  trend: AQTrendPoint[];
  subscaleAverages: SubscaleAverage[];
}

/* ─────────────────────────── Public Data Type ─────────────────────────────── */

export interface AQReportData {
  studentName: string;
  email?: string;
  generatedDate: string;
  aqHistory: AQHistoryResponse;
}

/* ─────────────────────────── Constants ───────────────────────────────────── */

const C = {
  sky:      '#0ea5e9',
  skyDark:  '#0284c7',
  indigo:   '#6366f1',
  purple:   '#8b5cf6',
  dark:     '#000000',
  navy:     '#1e293b',
  slate700: '#000000',
  slate600: '#000000',
  slate500: '#000000',
  slate400: '#000000',
  slate300: '#cbd5e1',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  slate50:  '#f8fafc',
  white:    '#ffffff',
  emerald:  '#10b981',
  amber:    '#f59e0b',
  rose:     '#f43f5e',
} as const;

const LEVEL_COLOR: Record<string, string> = {
  Exceptional: C.emerald,
  Strong:      C.sky,
  Moderate:    C.amber,
  Developing:  C.rose,
};
const LEVEL_BG: Record<string, string> = {
  Exceptional: '#d1fae5',
  Strong:      '#e0f2fe',
  Moderate:    '#fef3c7',
  Developing:  '#ffe4e6',
};
const LEVEL_TEXT: Record<string, string> = {
  Exceptional: '#065f46',
  Strong:      '#0c4a6e',
  Moderate:    '#92400e',
  Developing:  '#9f1239',
};
const LEVEL_DESC: Record<string, { title: string; body: string }> = {
  Exceptional: {
    title: 'Exceptional Resilience',
    body:  'You operate in the highest tier of adversity intelligence. Your CORE profile — Control, Ownership, Reach, Endurance — is firing on all dimensions, enabling you to navigate challenges with agency, accountability, and psychological strength.',
  },
  Strong: {
    title: 'Strong Resilience',
    body:  'Your AQ profile demonstrates above-average behavioral resilience. You handle most adversities with skill and composure. Targeted development in your lower dimensions will move you into the Exceptional tier.',
  },
  Moderate: {
    title: 'Moderate Resilience',
    body:  'Your AQ profile reveals developing resilience patterns. You show genuine strength in some dimensions while others present clear growth opportunities. This report provides a precise roadmap for your development.',
  },
  Developing: {
    title: 'Developing Resilience',
    body:  'Your resilience capacity is in an early stage of development — this is not a limitation, it is a starting point with tremendous upside. Many high-AQ individuals began exactly where you are now.',
  },
};

const DIM_INFO: Record<string, { desc: string; angle: number; high: string; low: string }> = {
  Control: {
    desc:  'Perceived ability to influence adversity outcomes',
    angle: -Math.PI / 2,
    high:  'You exhibit a strong internal locus of control. You approach adversity believing you can shape outcomes through intentional action, which is a foundational trait of high-AQ individuals.',
    low:   'You may feel that adversities are largely beyond your control. Practising daily "sphere of influence" exercises — identifying 3 actions within your power — will steadily build this dimension.',
  },
  Ownership: {
    desc:  'Tendency to take accountability rather than assign blame',
    angle: 0,
    high:  'Exceptional accountability mindset. You hold yourself responsible for both successes and learning outcomes, signaling psychological maturity and a growth-oriented identity.',
    low:   'You tend toward external attribution when facing challenges. Developing a "what could I own?" practice will shift this pattern and unlock higher performance.',
  },
  Reach: {
    desc:  'Ability to prevent adversity from spreading across life domains',
    angle: Math.PI / 2,
    high:  'You effectively compartmentalize adversity. Challenges stay contained in their domain rather than bleeding into your academic performance, relationships, or mental well-being.',
    low:   'Adversity tends to spread across multiple life areas for you. Creating clear mental and behavioral boundaries between domains will improve your ability to contain challenges.',
  },
  Endurance: {
    desc:  'Perception of how long adversity will persist',
    angle: Math.PI,
    high:  'Strong temporal resilience. You naturally view adversities as temporary states — "this too shall pass" — which enables rapid psychological bounce-back and sustained performance.',
    low:   'You may perceive adversities as long-lasting or even permanent. Evidence-based journaling about past challenges you have overcome will rewire this temporal narrative.',
  },
};

/* ─────────────────────────── Helpers ─────────────────────────────────────── */

function getDim(avgs: SubscaleAverage[], dim: string): number {
  return avgs.find(s => s.dimension === dim)?.avgPercentage ?? 0;
}

function levelOf(score: number): string {
  if (score >= 80) return 'Exceptional';
  if (score >= 65) return 'Strong';
  if (score >= 50) return 'Moderate';
  return 'Developing';
}

function fmtDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

function fmtDuration(secs: number): string {
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m}m ${s}s`;
}

interface BehaviorPattern { title: string; body: string; color: string; }
interface Recommendation  { title: string; body: string; }

function behaviorPatterns(d: AQHistoryResponse): BehaviorPattern[] {
  const ctrl  = getDim(d.subscaleAverages, 'Control');
  const own   = getDim(d.subscaleAverages, 'Ownership');
  const reach = getDim(d.subscaleAverages, 'Reach');
  const end   = getDim(d.subscaleAverages, 'Endurance');

  return [
    {
      title: 'Stress Response Style',
      body:  (ctrl + reach) > 130
        ? 'Solution-focused: You actively seek actionable steps when adversity strikes. You move toward problems, not away from them. In practical situations, this usually means you recover quicker after poor results and can return to productive work without losing multiple days to overthinking. Keep this strength by doing a brief post-challenge review: what happened, what can be improved, and what action starts now.'
        : (ctrl + reach) > 90
        ? 'Balanced: You shift between solution-oriented and emotion-processing modes. Increasing action bias will elevate your AQ. You already have the emotional awareness needed for resilience; the next step is speed of execution. A simple rule helps: after 10 minutes of reflection, commit to one concrete action, even if it is small.'
        : 'Emotion-focused: Your first response to adversity is processing rather than acting. Building action-oriented coping habits will shift this pattern. This pattern is common and reversible with routine. Start with a 3-step micro protocol: name the challenge, choose one immediate response, and complete it within 15 minutes.',
      color: (ctrl + reach) > 130 ? C.emerald : (ctrl + reach) > 90 ? C.amber : C.rose,
    },
    {
      title: 'Resilience Mechanism',
      body:  end > 70
        ? 'High temporal resilience: You view obstacles as temporary states, enabling fast bounce-back and maintained performance under pressure. This time perspective protects motivation and reduces panic during uncertain phases. Continue strengthening this by keeping a short record of tough periods that ended well, so your brain stays anchored to evidence.'
        : end > 50
        ? 'Moderate temporal resilience: You generally recover from setbacks but may benefit from intentional "past-wins" anchoring techniques. Your growth edge is reducing the time you stay stuck after setbacks. Create a recovery ritual: pause, reframe the setback as temporary, and define the next checkpoint within 24 hours.'
        : 'Persistent adversity perception: Adversities feel long-lasting to you. Evidence journaling about overcome challenges rewires this narrative. When the mind predicts "this will never improve," productivity drops sharply. Daily temporal reframing can change this pattern within a few weeks when practiced consistently.',
      color: end > 70 ? C.emerald : end > 50 ? C.amber : C.rose,
    },
    {
      title: 'Accountability Orientation',
      body:  own > 70
        ? 'Growth mindset ownership: You hold yourself accountable for outcomes, demonstrating psychological maturity and high growth potential. Ownership helps you learn faster because feedback becomes useful instead of threatening. Maintain this advantage by ending each day with one sentence: "What did I do well, and what will I improve tomorrow?"'
        : own > 50
        ? 'Balanced accountability: You alternate between internal and external attribution. A consistent ownership practice will elevate this. This is a workable middle state: you are not avoiding responsibility, but consistency is missing under stress. Use the "1% ownership" rule to build reliability in difficult moments.'
        : 'External attribution tendency: You tend to attribute challenges to outside factors. Daily "ownership wins" journaling will shift this. This does not indicate low capability; it usually indicates a protective habit. As ownership rises, confidence and performance tend to rise together because actions become more intentional.',
      color: own > 70 ? C.emerald : own > 50 ? C.amber : C.rose,
    },
    {
      title: 'Adversity Compartmentalization',
      body:  reach > 70
        ? 'High containment: You prevent challenges from bleeding into other life areas — a hallmark of high-performing, high-AQ individuals. This containment is a major performance asset because it protects study quality, sleep, and relationships during difficult periods. Preserve this strength by keeping clear start-stop boundaries between domains.'
        : reach > 50
        ? 'Moderate containment: Some adversities temporarily affect other life domains. Domain-boundary practices will strengthen this. Your profile suggests you can contain challenges, but not always under pressure. Structured transitions between tasks can significantly reduce spillover.'
        : 'Adversity spread: Challenges tend to affect multiple life areas. Clear mental separation and "parking lot" techniques will help. This pattern can make one bad event feel like a bad day overall. The fastest correction is explicit labeling: define which area the issue belongs to and park unrelated worries for scheduled review.',
      color: reach > 70 ? C.emerald : reach > 50 ? C.amber : C.rose,
    },
    {
      title: 'Pressure Response Style',
      body:  (ctrl > 65 && own > 65)
        ? 'Commanding under pressure: You maintain both agency and accountability even in high-stress, high-stakes situations. This combination predicts reliable execution when deadlines are tight or outcomes matter most. Continue using pre-performance routines so this strength stays repeatable, not accidental.'
        : (ctrl > 65 || own > 65)
        ? 'Adaptive under pressure: You leverage either control-orientation or ownership to navigate difficult situations. You have at least one strong pressure lever; now the goal is to build both. Pair planning (control) with reflection (ownership) to stabilize performance under uncertainty.'
        : 'Reactive under pressure: Building proactive pressure-response habits through stress inoculation practice will raise your AQ. Under pressure, your system shifts to immediate survival mode, which is normal. Repeated low-stakes exposure and response drills can quickly improve calm decision-making.',
      color: (ctrl > 65 && own > 65) ? C.emerald : (ctrl > 65 || own > 65) ? C.sky : C.rose,
    },
    {
      title: 'Learning & Growth Orientation',
      body:  d.totalAttempts >= 3
        ? `Active learner: ${d.totalAttempts} assessment attempts demonstrate genuine commitment to self-awareness and behavioral growth. Repeated measurement is one of the strongest predictors of long-term improvement because it creates a feedback loop between effort and outcome. Keep reassessing at fixed intervals to track trends, not just single scores.`
        : d.totalAttempts === 2
        ? 'Developing commitment: You have taken your second step in tracking your AQ journey. Regular assessment builds powerful growth loops. With just a few more attempts, your profile will start showing clearer pattern stability and stronger personal insights.'
        : 'Beginning the journey: This is your first AQ measurement. Each subsequent attempt will reveal your growth trajectory. The value of this first score is that it gives you a baseline for measurable progress over the next 30 to 90 days.',
      color: d.totalAttempts >= 3 ? C.emerald : C.sky,
    },
  ];
}

function recommendations(d: AQHistoryResponse): Recommendation[] {
  const recs: Recommendation[] = [];
  const ctrl  = getDim(d.subscaleAverages, 'Control');
  const own   = getDim(d.subscaleAverages, 'Ownership');
  const reach = getDim(d.subscaleAverages, 'Reach');
  const end   = getDim(d.subscaleAverages, 'Endurance');
  const aq    = d.latestScore ?? d.avgScore ?? 50;

  if (ctrl < 60) recs.push({
    title: 'Build Your Internal Locus of Control',
    body:  'Each morning, identify 3 specific actions within your control for the day ahead. This "sphere of influence" daily practice builds neural pathways associated with agency and steadily reduces learned helplessness. Track completion rate for 30 days; once this exceeds 80%, students typically report higher confidence and lower anxiety before difficult tasks.',
  });
  if (own < 60) recs.push({
    title: 'Develop an Accountability Practice',
    body:  'Keep a "what did I contribute?" journal for 30 days. After each challenge, write what you could have done differently. This reframes adversity as information rather than an external punishment. Include one next-step commitment in every entry so reflection translates into visible behavioral change.',
  });
  if (reach < 60) recs.push({
    title: 'Practice Adversity Compartmentalization',
    body:  'Create clear mental and behavioral boundaries between life domains. When facing a work or academic challenge, use a "parking lot" — write worries down to address at a designated later time, keeping other domains protected. This method reduces cognitive spillover and helps preserve focus quality during study and revision blocks.',
  });
  if (end < 60) recs.push({
    title: 'Build Temporal Resilience Narratives',
    body:  'Develop a personal "evidence log" of adversities you have successfully overcome. Reading this regularly trains your brain to recognize that challenges are temporary, finite states — not permanent conditions. Add dates and outcomes to each entry so your brain sees clear proof that distress phases end.',
  });
  if (aq < 65) {
    recs.push({
      title: 'Establish a Daily Resilience Routine',
      body:  'Implement a 10-minute morning protocol: 5 minutes of stress inoculation visualization (imagine handling a coming challenge calmly and effectively), followed by 5 minutes of gratitude priming. Twenty-one days of consistency creates measurable behavioral shifts. Keep the routine at the same time each day to reduce friction and increase retention.',
    });
    recs.push({
      title: 'Pursue Structured Adversity Exposure',
      body:  'Voluntarily embrace small, controlled discomforts — a difficult conversation, a challenging goal, cold exposure. Controlled adversity trains your nervous system to maintain function under pressure, raising your AQ baseline. Keep exposures brief, intentional, and safe; consistency matters more than intensity.',
    });
  }
  if (d.totalAttempts > 1 && (d.bestScore ?? 0) - (d.avgScore ?? 0) > 10) recs.push({
    title: 'Replicate Your Peak Performance State',
    body:  `Your best score (${d.bestScore}) significantly exceeds your average (${d.avgScore?.toFixed(0)}). Analyze what factors were present in your highest-score attempt — sleep, mindset, time of day — and actively replicate those conditions. Create a short checklist and use it before every important study or assessment session.`,
  });
  recs.push({
    title: 'Track Your AQ Journey Consistently',
    body:  'Re-assess your AQ every 4–6 weeks. Regular measurement creates awareness loops that accelerate behavioral change. Watch your dimension scores over time — targeted practice yields compound improvement. Focus on trend direction across attempts rather than reacting to one isolated score.',
  });
  recs.push({
    title: 'Build a Resilience Support System',
    body:  'Share your AQ results with a mentor, coach, or accountability partner. External perspective on your adversity patterns reveals blind spots that self-assessment cannot capture, dramatically accelerating growth. A short weekly check-in can significantly improve consistency and follow-through.',
  });
  return recs.slice(0, 8);
}

const CORE_ORDER: Record<string, number> = {
  Control: 0,
  Ownership: 1,
  Reach: 2,
  Endurance: 3,
};

function finalSummary(d: AQHistoryResponse) {
  const level = d.latestLevel ?? levelOf(d.latestScore ?? d.avgScore ?? 50);
  const items: Record<string, { interpretation: string; conclusion: string; outlook: string; motivation: string }> = {
    Exceptional: {
      interpretation: 'Your AQ profile reveals exceptional psychological resilience across all four CORE dimensions. You approach adversity with agency, accountability, compartmentalization, and temporal wisdom that places you in the top tier of behavioral resilience.',
      conclusion:     'Your CORE framework is operating at a high level. You are well-positioned to lead, perform, and thrive under significant pressure — and to help others develop their AQ.',
      outlook:        'Maintain your resilience practices and continue to challenge yourself with increasingly complex adversity. Your next growth edge is translating your own resilience into leadership that builds resilience in others.',
      motivation:     'Your AQ is not just a number — it is proof that you have chosen to face challenges with growth instead of retreat. Keep leading by example.',
    },
    Strong: {
      interpretation: 'Your AQ profile demonstrates strong behavioral resilience. You navigate most adversities effectively with clear, targeted opportunities to reach the Exceptional tier.',
      conclusion:     'You have built a solid resilience foundation. The gap between Strong and Exceptional is intentional practice on your specific lower-scoring dimensions.',
      outlook:        'With focused development on 1–2 dimensions, you have clear potential to reach Exceptional within 60–90 days of consistent practice.',
      motivation:     'Every adversity you navigate is data for your growth. You are already strong — the extraordinary is within your reach.',
    },
    Moderate: {
      interpretation: 'Your AQ profile shows developing resilience patterns. You demonstrate genuine capacity in some dimensions while others present valuable, actionable growth opportunities.',
      conclusion:     'This is an important inflection point. The insights in this report give you a precise roadmap for which behaviors to develop. Targeted practice will yield measurable improvement.',
      outlook:        'With consistent application of the recommendations in this report, expect meaningful AQ improvement within 60 days.',
      motivation:     'Awareness of where you are is the most powerful first step. You are already ahead of those who have never measured their resilience at all.',
    },
    Developing: {
      interpretation: 'Your AQ profile indicates that your resilience capacity is still developing. This is not a limitation — it is a starting point with tremendous growth potential.',
      conclusion:     'Many individuals who begin with developing-level AQ go on to achieve exceptional resilience through intentional, consistent practice. Your commitment to self-assessment already sets you apart.',
      outlook:        'Focus on one dimension at a time, starting with your lowest-scoring area. Small, consistent improvements compound into significant behavioral change over 30–60 days.',
      motivation:     'The willingness to measure and understand your adversity response is itself a sign of high potential. The AQ journey begins with awareness. You have taken that step.',
    },
  };
  return items[level] ?? items.Moderate;
}

/* ─────────────────────────── SVG Charts ──────────────────────────────────── */

/* ─── Internal SVG for the line chart ───────────────────────────────────────
   PL/PR are derived from N so each data-point lands at the horizontal
   centre of a "cell" of width W/N — making flex:1 X-axis labels align. */
function LineChartSVG({
  trend, W, H, PT, PB,
}: { trend: AQTrendPoint[]; W: number; H: number; PT: number; PB: number }) {
  if (trend.length < 2) return null;
  const N = trend.length;
  const CELL_W = W / N;
  const PL = CELL_W / 2;          // left pad = half-cell → point 0 at cell-0 centre
  const cW = W - CELL_W;          // = W * (N-1)/N
  const cH = H - PT - PB;

  // x of point i = CELL_W*(i+0.5)  ← centre of cell i
  const xP = (i: number) => PL + (N <= 1 ? 0 : (i / (N - 1)) * cW);
  const yP = (s: number) => PT + cH - (Math.min(100, Math.max(0, s)) / 100) * cH;

  const linePts = trend.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${xP(i).toFixed(1)},${yP(p.score).toFixed(1)}`
  ).join(' ');
  const areaPts = `${linePts} L${xP(N - 1).toFixed(1)},${(PT + cH).toFixed(1)} L${PL.toFixed(1)},${(PT + cH).toFixed(1)} Z`;

  return (
    <Svg width={W} height={H}>
      {/* Horizontal grid lines at 0 / 25 / 50 / 75 / 100 */}
      {[0, 25, 50, 75, 100].map(s => (
        <Line key={s}
          x1={PL} y1={yP(s)} x2={PL + cW} y2={yP(s)}
          stroke={s === 0 || s === 100 ? C.slate300 : C.slate200}
          strokeWidth={s === 0 || s === 100 ? 0.8 : 0.5}
          strokeDasharray={s > 0 && s < 100 ? '4,3' : 'none'} />
      ))}
      {/* X-axis ticks below each data point */}
      {trend.map((_, i) => (
        <Line key={`xt${i}`} x1={xP(i)} y1={PT + cH} x2={xP(i)} y2={PT + cH + 4}
          stroke={C.slate300} strokeWidth={0.8} />
      ))}
      {/* Area fill */}
      <Path d={areaPts} fill={C.sky} fillOpacity={0.08} />
      {/* Trend line */}
      <Path d={linePts} stroke={C.sky} strokeWidth={2} fill="none" />
      {/* Vertical drop lines from dot to x-axis */}
      {trend.map((p, i) => (
        <Line key={`vl${i}`}
          x1={xP(i)} y1={yP(p.score)} x2={xP(i)} y2={PT + cH}
          stroke={LEVEL_COLOR[p.level] ?? C.sky}
          strokeWidth={0.5} strokeDasharray="2,3" strokeOpacity={0.45} />
      ))}
      {/* Data-point dots — colour = scale (resilience level) */}
      {trend.map((p, i) => (
        <Circle key={i}
          cx={xP(i)} cy={yP(p.score)} r={5}
          fill={LEVEL_COLOR[p.level] ?? C.sky} stroke={C.white} strokeWidth={1.5} />
      ))}
    </Svg>
  );
}

/* ─── Full chart with aligned Y-axis labels, score bubbles, X-axis ────────── */
function LineChartWithAxes({ trend }: { trend: AQTrendPoint[] }) {
  if (trend.length < 2) return null;

  const N = trend.length;
  const W = 420, H = 130, PT = 22, PB = 8;
  const CELL_W = W / N;
  const PL = CELL_W / 2;
  const cH = H - PT - PB;
  const diffColor: Record<string, string> = { Easy: C.emerald, Medium: C.amber, Hard: C.rose };

  // Mirror the same xP / yP used in the SVG for bubble placement
  const xP = (i: number) => PL + (N <= 1 ? 0 : (i / (N - 1)) * (W - CELL_W));
  const yP = (s: number) => PT + cH - (Math.min(100, Math.max(0, s)) / 100) * cH;

  return (
    <View>
      {/* ── Row: Y-axis labels | SVG chart + score bubbles ── */}
      <View style={{ flexDirection: 'row' }}>
        {/* Y-axis: height matches SVG, paddings match PT/PB so labels sit on grid lines */}
        <View style={{
          width: 26, height: H,
          paddingTop: PT - 5,   // offset by ~half text height so label centres on grid line
          paddingBottom: PB - 3,
          justifyContent: 'space-between',
          alignItems: 'flex-end', paddingRight: 4,
        }}>
          {[100, 75, 50, 25, 0].map(v => (
            <Text key={v} style={{ fontSize: 6, color: C.slate400, fontFamily: 'Inter', fontWeight: 400 }}>{v}</Text>
          ))}
        </View>

        {/* Chart area — position:relative so score bubbles can be absolutely placed */}
        <View style={{ width: W, height: H, position: 'relative' } as any}>
          <LineChartSVG trend={trend} W={W} H={H} PT={PT} PB={PB} />

          {/* Score bubble — appears above (or below if too near top) each dot */}
          {trend.map((p, i) => {
            const cx = xP(i);
            const cy = yP(p.score);
            const above = cy > PT + 18; // enough room above dot?
            return (
              <View key={i} style={{
                position: 'absolute',
                left: cx - 11,
                top: above ? cy - 18 : cy + 8,
                width: 22,
                backgroundColor: LEVEL_COLOR[p.level] ?? C.sky,
                borderRadius: 3,
                paddingVertical: 1,
                alignItems: 'center',
              } as any}>
                <Text style={{ fontSize: 6, fontWeight: 700, color: C.white, fontFamily: 'Inter' }}>{p.score}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── X-axis labels — each cell is exactly CELL_W wide, centred on data point ── */}
      <View style={{ flexDirection: 'row', marginLeft: 26 }}>
        {trend.map((p, i) => (
          <View key={i} style={{ width: CELL_W, alignItems: 'center', paddingTop: 3 }}>
            <Text style={{ fontSize: 6.5, color: C.slate700, fontWeight: 700, fontFamily: 'Inter' }}>#{p.attempt}</Text>
            {p.difficulty && p.difficulty !== 'Mixed' && (
              <Text style={{ fontSize: 5.5, color: diffColor[p.difficulty] ?? C.slate400, fontFamily: 'Inter', fontWeight: 400 }}>{p.difficulty}</Text>
            )}
          </View>
        ))}
      </View>

      {/* ── Scale legend ── */}
      <View style={{ flexDirection: 'row', marginLeft: 26, marginTop: 6, justifyContent: 'flex-end' }}>
        {(['Exceptional', 'Strong', 'Moderate', 'Developing'] as const).map(l => (
          <View key={l} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: LEVEL_COLOR[l], marginRight: 3 }} />
            <Text style={{ fontSize: 6, color: C.slate500, fontFamily: 'Inter', fontWeight: 400 }}>{l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function RadarChartSVG({ avgs }: { avgs: SubscaleAverage[] }) {
  const CX = 100, CY = 100, R = 72, W = 200, H = 200;
  const dims = ['Control', 'Ownership', 'Reach', 'Endurance'];
  const dataMap = Object.fromEntries(avgs.map(a => [a.dimension, a.avgPercentage]));

  const ptFor = (dim: string, pct: number) => {
    const a = DIM_INFO[dim]?.angle ?? 0;
    const r = (pct / 100) * R;
    return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r };
  };
  const axisEnd = (dim: string) => {
    const a = DIM_INFO[dim]?.angle ?? 0;
    return { x: CX + Math.cos(a) * R, y: CY + Math.sin(a) * R };
  };

  const grid = (pct: number) => dims.map(d => {
    const a = DIM_INFO[d]?.angle ?? 0;
    const r = (pct / 100) * R;
    return `${(CX + Math.cos(a) * r).toFixed(1)},${(CY + Math.sin(a) * r).toFixed(1)}`;
  }).join(' ');

  const dataPoly = dims.map(d => {
    const p = ptFor(d, dataMap[d] ?? 0);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ');

  /* Grid % labels along Control axis (top) */
  const gridLevels = [25, 50, 75, 100];

  return (
    <Svg width={W} height={H}>
      {/* Grid polygons */}
      {[25, 50, 75, 100].map(pct => (
        <Polygon key={pct} points={grid(pct)} fill="none" stroke={pct === 100 ? C.slate300 : C.slate200} strokeWidth={pct === 100 ? 1 : 0.5} />
      ))}
      {/* Axis lines */}
      {dims.map(dim => { const e = axisEnd(dim); return (
        <Line key={dim} x1={CX} y1={CY} x2={e.x} y2={e.y} stroke={C.slate300} strokeWidth={0.8} />
      ); })}
      {/* Grid level marks on Control axis (top) */}
      {gridLevels.map(pct => {
        const a = DIM_INFO['Control']?.angle ?? -Math.PI / 2;
        const r = (pct / 100) * R;
        const x = CX + Math.cos(a) * r;
        const y = CY + Math.sin(a) * r;
        return <Circle key={`gm${pct}`} cx={x} cy={y} r={1.5} fill={C.slate300} />;
      })}
      {/* Data polygon */}
      <Polygon points={dataPoly} fill={C.sky} fillOpacity={0.18} stroke={C.sky} strokeWidth={1.8} />
      {/* Data points */}
      {dims.map(dim => { const p = ptFor(dim, dataMap[dim] ?? 0); return (
        <Circle key={dim} cx={p.x} cy={p.y} r={4} fill={LEVEL_COLOR[levelOf(dataMap[dim] ?? 0)] ?? C.sky} stroke={C.white} strokeWidth={1.2} />
      ); })}
      {/* Center dot */}
      <Circle cx={CX} cy={CY} r={2.5} fill={C.slate300} />
    </Svg>
  );
}

/* Radar chart with dimension labels and scores positioned inside/around the chart */
function RadarChartWithLabels({ avgs }: { avgs: SubscaleAverage[] }) {
  const W = 200, H = 200;
  const CX = 100, CY = 100;
  const dimColors: Record<string, string> = {
    Control:   C.sky,
    Ownership: C.indigo,
    Reach:     C.purple,
    Endurance: C.emerald,
  };
  return (
    <View style={{ width: W, height: H, position: 'relative' } as any}>
      <RadarChartSVG avgs={avgs} />
      {/* Control — top */}
      <View style={{ position: 'absolute', top: 2, left: 0, right: 0, alignItems: 'center' } as any}>
        <Text style={{ fontSize: 7, fontWeight: 700, color: dimColors['Control'], fontFamily: 'Inter' }}>Control</Text>
        <Text style={{ fontSize: 6.5, fontWeight: 700, color: LEVEL_COLOR[levelOf(getDim(avgs, 'Control'))] ?? C.sky, fontFamily: 'Inter' }}>{getDim(avgs, 'Control').toFixed(0)}%</Text>
      </View>
      {/* Ownership — right */}
      <View style={{ position: 'absolute', right: 0, top: CY - 14 } as any}>
        <Text style={{ fontSize: 7, fontWeight: 700, color: dimColors['Ownership'], fontFamily: 'Inter' }}>Ownership</Text>
        <Text style={{ fontSize: 6.5, fontWeight: 700, color: LEVEL_COLOR[levelOf(getDim(avgs, 'Ownership'))] ?? C.sky, fontFamily: 'Inter' }}>{getDim(avgs, 'Ownership').toFixed(0)}%</Text>
      </View>
      {/* Reach — bottom */}
      <View style={{ position: 'absolute', bottom: 2, left: 0, right: 0, alignItems: 'center' } as any}>
        <Text style={{ fontSize: 7, fontWeight: 700, color: dimColors['Reach'], fontFamily: 'Inter' }}>Reach</Text>
        <Text style={{ fontSize: 6.5, fontWeight: 700, color: LEVEL_COLOR[levelOf(getDim(avgs, 'Reach'))] ?? C.sky, fontFamily: 'Inter' }}>{getDim(avgs, 'Reach').toFixed(0)}%</Text>
      </View>
      {/* Endurance — left */}
      <View style={{ position: 'absolute', left: 0, top: CY - 14 } as any}>
        <Text style={{ fontSize: 7, fontWeight: 700, color: dimColors['Endurance'], fontFamily: 'Inter' }}>Endurance</Text>
        <Text style={{ fontSize: 6.5, fontWeight: 700, color: LEVEL_COLOR[levelOf(getDim(avgs, 'Endurance'))] ?? C.sky, fontFamily: 'Inter' }}>{getDim(avgs, 'Endurance').toFixed(0)}%</Text>
      </View>
      {/* Grid scale labels (25/50/75/100 along top axis) */}
      <View style={{ position: 'absolute', left: CX - 4, top: CY - 72 - 8 } as any}>
        <Text style={{ fontSize: 5, color: C.slate400, fontFamily: 'Inter', fontWeight: 400 }}>100</Text>
      </View>
      <View style={{ position: 'absolute', left: CX - 3, top: CY - 54 - 4 } as any}>
        <Text style={{ fontSize: 5, color: C.slate400, fontFamily: 'Inter', fontWeight: 400 }}>75</Text>
      </View>
      <View style={{ position: 'absolute', left: CX - 3, top: CY - 36 - 4 } as any}>
        <Text style={{ fontSize: 5, color: C.slate400, fontFamily: 'Inter', fontWeight: 400 }}>50</Text>
      </View>
      <View style={{ position: 'absolute', left: CX - 3, top: CY - 18 - 4 } as any}>
        <Text style={{ fontSize: 5, color: C.slate400, fontFamily: 'Inter', fontWeight: 400 }}>25</Text>
      </View>
    </View>
  );
}

function DonutSVG({ score, level }: { score: number; level: string }) {
  const CX = 52, CY = 52, R = 38, SW = 9, W = 104, H = 104;
  const toRad = (d: number) => d * Math.PI / 180;
  const start = toRad(135);
  const filled = toRad(135 + (score / 100) * 270);
  const bgEnd  = toRad(405);

  const arc = (a1: number, a2: number) => {
    const x1 = CX + R * Math.cos(a1), y1 = CY + R * Math.sin(a1);
    const x2 = CX + R * Math.cos(a2), y2 = CY + R * Math.sin(a2);
    const lg = a2 - a1 > Math.PI ? 1 : 0;
    return `M${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R},0,${lg},1,${x2.toFixed(2)},${y2.toFixed(2)}`;
  };

  const color = LEVEL_COLOR[level] ?? C.sky;
  return (
    <Svg width={W} height={H}>
      <Path d={arc(start, bgEnd)} fill="none" stroke={C.slate200} strokeWidth={SW} strokeLinecap="round" />
      {score > 0 && (
        <Path d={arc(start, filled)} fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round" />
      )}
    </Svg>
  );
}

/* Donut with score overlay */
function DonutWithScore({ score, level }: { score: number; level: string }) {
  const color = LEVEL_COLOR[level] ?? C.sky;
  return (
    <View style={{ width: 104, height: 104, alignItems: 'center', justifyContent: 'center', position: 'relative' } as any}>
      <DonutSVG score={score} level={level} />
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', top: 28 } as any}>
        <Text style={{ fontSize: 18, fontWeight: 700, color, fontFamily: 'Inter', lineHeight: 1 }}>{score}</Text>
        <Text style={{ fontSize: 7, fontWeight: 400, color: C.slate400, fontFamily: 'Inter' }}>/100</Text>
      </View>
    </View>
  );
}

/* ─────────────────────────── Common Layout Parts ─────────────────────────── */

function PageHeader({ title, subtitle, pg }: { title: string; subtitle?: string; pg: string }) {
  return (
    <View style={S.header}>
      <View>
        <Text style={S.headerTitle}>{title}</Text>
        {subtitle ? <Text style={S.headerSub}>{subtitle}</Text> : null}
      </View>
      <View style={S.headerRight}>
        <Text style={S.headerBrand}>ADVERSITY</Text>
        <Text style={S.headerPg}>Page {pg}</Text>
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

function LevelPill({ level, style }: { level: string; style?: any }) {
  return (
    <View style={[S.pill, { backgroundColor: LEVEL_BG[level] ?? C.slate100 }, style]}>
      <Text style={[S.pillText, { color: LEVEL_TEXT[level] ?? C.slate700 }]}>{level}</Text>
    </View>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  const safe = Math.min(100, Math.max(0, pct));
  return (
    <View style={S.barTrack}>
      <View style={[S.barFill, { width: `${safe}%`, backgroundColor: color }]} />
    </View>
  );
}

function PageFooter({ name, date }: { name: string; date: string }) {
  return (
    <View style={S.footer}>
      <Text style={S.footerL}>Adversity AQ Analytics Report · {name}</Text>
      <Text style={S.footerR}>Generated {date} · Confidential</Text>
    </View>
  );
}

/* ─────────────────────────── StyleSheet ──────────────────────────────────── */

/**
 * ALL text styles use fontFamily: 'Inter'.
 * Bold text uses fontWeight: 700 (never fontFamily: 'Helvetica-Bold').
 * SemiBold uses fontWeight: 600.
 * No fontStyle: 'italic' — Inter has no italic variant.
 */
const S = StyleSheet.create({
  // ── Pages — fontFamily + fontWeight set at page level so every Text inherits
  coverPage:   { backgroundColor: C.dark, padding: 0, fontFamily: 'Inter', fontWeight: 400 },
  contentPage: { backgroundColor: C.white, paddingHorizontal: 40, paddingTop: 32, paddingBottom: 40, fontFamily: 'Inter', fontWeight: 400 },
  finalPage:   { backgroundColor: C.dark, paddingHorizontal: 56, paddingTop: 52, paddingBottom: 40, fontFamily: 'Inter', fontWeight: 400 },

  // ── Content wrapper (flex grow for footer push-down)
  contentWrapper: { flex: 1, display: 'flex', flexDirection: 'column' },
  contentBody: { flex: 1 },

  // ── Cover
  coverInner: { flex: 1, paddingHorizontal: 56, paddingVertical: 52, flexDirection: 'column', justifyContent: 'space-between' },
  coverTopRow: { flexDirection: 'row', alignItems: 'center' },
  coverLogoCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.sky, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  coverLogoText: { fontSize: 16, fontWeight: 700, color: C.white },
  coverBrandName: { fontSize: 14, fontWeight: 700, color: C.white, letterSpacing: 1 },
  coverBrandSub: { fontSize: 8, fontWeight: 400, color: '#94a3b8', marginTop: 2 },
  coverCenter: { flex: 1, justifyContent: 'center', paddingVertical: 32 },
  coverEyebrow: { fontSize: 8, fontWeight: 700, color: C.sky, letterSpacing: 2, marginBottom: 10 },
  coverMainTitle: { fontSize: 34, fontWeight: 700, color: C.white, lineHeight: 1.2, marginBottom: 6 },
  coverSubtitle: { fontSize: 13, fontWeight: 400, color: '#94a3b8', marginBottom: 28 },
  coverDivider: { height: 2, width: 52, backgroundColor: C.sky, marginBottom: 28 },
  coverStudentName: { fontSize: 26, fontWeight: 700, color: C.white, marginBottom: 4 },
  coverStudentLabel: { fontSize: 10, fontWeight: 400, color: '#64748b', marginBottom: 22 },
  coverBadgeRow: { flexDirection: 'row', marginTop: 4 },
  coverScoreBadge: { borderRadius: 10, backgroundColor: '#1e293b', paddingHorizontal: 18, paddingVertical: 12, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  coverScoreNum: { fontSize: 30, fontWeight: 700, color: C.sky },
  coverScoreLabel: { fontSize: 7.5, fontWeight: 400, color: '#94a3b8', textAlign: 'center', marginTop: 2 },
  coverLevelBadge: { borderRadius: 10, paddingHorizontal: 18, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  coverLevelText: { fontSize: 18, fontWeight: 700, color: C.dark },
  coverLevelLabel: { fontSize: 7.5, fontWeight: 400, color: C.slate600, textAlign: 'center', marginTop: 2 },
  coverBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 14 },
  coverBottomText: { fontSize: 8, fontWeight: 400, color: '#64748b' },
  coverConfidential: { fontSize: 8, fontWeight: 700, color: '#94a3b8', borderWidth: 1, borderColor: C.navy, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },

  // ── Page header / footer
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: C.slate200, paddingBottom: 10, marginBottom: 18 },
  headerTitle: { fontSize: 16, fontWeight: 700, color: C.dark },
  headerSub: { fontSize: 8.5, fontWeight: 400, color: C.slate500, marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  headerBrand: { fontSize: 9, fontWeight: 700, color: C.sky, letterSpacing: 1 },
  headerPg: { fontSize: 7.5, fontWeight: 400, color: C.slate400, marginTop: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.slate200, paddingTop: 8, paddingBottom: 28, marginTop: 12 },
  footerL: { fontSize: 7.5, fontWeight: 400, color: C.slate400 },
  footerR: { fontSize: 7.5, fontWeight: 400, color: C.slate400 },

  // ── Section band
  sectionBand: { backgroundColor: C.slate50, borderLeftWidth: 3, borderLeftColor: C.sky, paddingHorizontal: 12, paddingVertical: 7, marginBottom: 14, borderRadius: 4 },
  sectionBandTitle: { fontSize: 10, fontWeight: 700, color: C.dark },
  sectionBandSub: { fontSize: 8, fontWeight: 400, color: C.slate500, marginTop: 2 },

  // ── KPI row
  kpiRow: { flexDirection: 'row', marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: C.slate50, borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 12, marginRight: 10 },
  kpiCardLast: { flex: 1, backgroundColor: C.slate50, borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 12 },
  kpiVal: { fontSize: 24, fontWeight: 700, color: C.dark, marginBottom: 2 },
  kpiLabel: { fontSize: 7.5, fontWeight: 700, color: C.slate500, letterSpacing: 0.5 },
  kpiSub: { fontSize: 7.5, fontWeight: 400, color: C.slate400, marginTop: 2 },

  // ── Level card (exec summary)
  levelCard: { borderRadius: 10, borderWidth: 1, borderColor: C.slate200, padding: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'flex-start' },
  levelCardRight: { flex: 1 },
  levelCardTitle: { fontSize: 13, fontWeight: 700, color: C.dark, marginBottom: 4 },
  levelCardBody: { fontSize: 8.5, fontWeight: 400, color: C.slate600, lineHeight: 1.55 },

  // ── Pill / badge
  pill: { borderRadius: 99, paddingHorizontal: 7, paddingVertical: 2.5, alignSelf: 'flex-start' },
  pillText: { fontSize: 7.5, fontWeight: 700 },

  // ── Progress bar
  barTrack: { height: 6, backgroundColor: C.slate100, borderRadius: 3, marginTop: 4, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },

  // ── Table
  tableHead: { flexDirection: 'row', backgroundColor: C.slate100, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 4, marginBottom: 2 },
  tableRow: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: C.slate100 },
  tableRowAlt: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 5, backgroundColor: C.slate50, borderBottomWidth: 1, borderBottomColor: C.slate100 },
  th: { fontSize: 7.5, fontWeight: 700, color: C.slate500 },
  td: { fontSize: 8, fontWeight: 400, color: C.slate700 },

  // ── Dimension card (page 4)
  dimCard: { borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 12, marginBottom: 10 },
  dimHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  dimTitle: { fontSize: 11, fontWeight: 700, color: C.dark },
  dimPct: { fontSize: 13, fontWeight: 700, color: C.sky },
  dimDesc: { fontSize: 7.5, fontWeight: 400, color: C.slate500, marginBottom: 6 },
  dimInterp: { fontSize: 8, fontWeight: 400, color: C.slate700, lineHeight: 1.5 },

  // ── Behavioral / insight cards (pages 5, 6)
  insightCard: { borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 10, marginBottom: 8, flexDirection: 'row' },
  insightDot: { width: 8, height: 8, borderRadius: 4, marginTop: 1.5, marginRight: 9, flexShrink: 0 },
  insightTitle: { fontSize: 9.5, fontWeight: 700, color: C.dark, marginBottom: 3 },
  insightBody: { fontSize: 8, fontWeight: 400, color: C.slate600, lineHeight: 1.55 },

  // ── Strengths / Weaknesses (page 7)
  swCard: { borderRadius: 8, padding: 10, marginBottom: 6, flexDirection: 'row', alignItems: 'flex-start' },
  swDot: { width: 10, height: 10, borderRadius: 5, marginTop: 1.5, marginRight: 8, flexShrink: 0 },
  swTitle: { fontSize: 9.5, fontWeight: 700, color: C.dark, marginBottom: 2 },
  swBody: { fontSize: 7.5, fontWeight: 400, color: C.slate600, lineHeight: 1.5 },
  swColTitle: { fontSize: 11, fontWeight: 700, color: C.dark, marginBottom: 10 },

  // ── Recommendations (page 8)
  recCard: { borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 10, marginBottom: 7, flexDirection: 'row', alignItems: 'flex-start' },
  recNum: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.sky, alignItems: 'center', justifyContent: 'center', marginRight: 10, flexShrink: 0 },
  recNumText: { fontSize: 8.5, fontWeight: 700, color: C.white },
  recTitle: { fontSize: 9.5, fontWeight: 700, color: C.dark, marginBottom: 3 },
  recBody: { fontSize: 7.5, fontWeight: 400, color: C.slate600, lineHeight: 1.5 },

  // ── Progress analytics (page 9)
  analyticsCard: { borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 12, marginBottom: 12 },
  analyticsTitle: { fontSize: 10, fontWeight: 700, color: C.dark, marginBottom: 8 },
  dimRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  dimRowLabel: { width: 74, fontSize: 8.5, fontWeight: 400, color: C.slate700 },
  dimRowBar: { flex: 1, marginHorizontal: 8 },
  dimRowPct: { width: 28, fontSize: 8, fontWeight: 700, color: C.slate700, textAlign: 'right' },

  // ── Final summary page
  finalHeaderBadge: { alignSelf: 'flex-start', borderRadius: 99, backgroundColor: '#1e293b', paddingHorizontal: 10, paddingVertical: 4, marginBottom: 16 },
  finalHeaderBadgeText: { fontSize: 8, fontWeight: 700, color: C.sky, letterSpacing: 1 },
  finalTitle: { fontSize: 22, fontWeight: 700, color: C.white, marginBottom: 4 },
  finalSub: { fontSize: 9, fontWeight: 400, color: '#94a3b8', marginBottom: 28 },
  finalCard: { backgroundColor: C.navy, borderRadius: 10, padding: 14, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: C.sky },
  finalCardTitle: { fontSize: 9.5, fontWeight: 700, color: C.white, marginBottom: 4 },
  finalCardBody: { fontSize: 8, fontWeight: 400, color: '#94a3b8', lineHeight: 1.6 },
  finalMotivationBox: { borderRadius: 10, padding: 18, marginTop: 18, backgroundColor: '#1e293b', alignItems: 'center' },
  finalMotivationText: { fontSize: 12, fontWeight: 700, color: C.white, textAlign: 'center', lineHeight: 1.6, marginBottom: 8 },
  finalMotivationSub: { fontSize: 7.5, fontWeight: 400, color: '#94a3b8', textAlign: 'center' },
  finalBranding: { marginTop: 'auto', paddingTop: 14, borderTopWidth: 1, borderTopColor: C.navy, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  finalBrandingText: { fontSize: 8, fontWeight: 400, color: '#64748b' },

  // ── Two-column layout
  twoCol: { flexDirection: 'row' },
  col: { flex: 1 },
  colL: { flex: 1, marginRight: 14 },
  colR: { flex: 1 },

  // ── Misc
  spacer8: { height: 8 },
  spacer12: { height: 12 },
  // note: no fontStyle italic — Inter has no italic; use color + weight for visual distinction
  note: { fontSize: 7.5, fontWeight: 400, color: C.slate400 },
});

/* ─────────────────────────── Page 1 — Cover ──────────────────────────────── */

function CoverPage({ d }: { d: AQReportData }) {
  const aq    = d.aqHistory.latestScore ?? d.aqHistory.avgScore ?? 0;
  const level = d.aqHistory.latestLevel ?? levelOf(aq);
  const lvlBg = LEVEL_BG[level] ?? C.slate100;

  return (
    <Page size="A4" style={S.coverPage}>
      {/* Decorative background circles via SVG */}
      <Svg width={595} height={841} style={{ position: 'absolute', top: 0, left: 0 } as any}>
        <Circle cx={520} cy={80}  r={160} fill={C.sky}    fillOpacity={0.06} />
        <Circle cx={80}  cy={750} r={200} fill={C.purple} fillOpacity={0.05} />
        <Circle cx={500} cy={650} r={120} fill={C.indigo} fillOpacity={0.04} />
        <Rect x={0} y={0} width={3} height={841} fill={C.sky} fillOpacity={0.6} />
      </Svg>

      <View style={S.coverInner}>
        {/* Top brand row */}
        <View style={S.coverTopRow}>
          <View style={S.coverLogoCircle}>
            <Text style={S.coverLogoText}>A</Text>
          </View>
          <View>
            <Text style={S.coverBrandName}>ADVERSITY</Text>
            <Text style={S.coverBrandSub}>AQ Analytics Platform</Text>
          </View>
        </View>

        {/* Center content */}
        <View style={S.coverCenter}>
          <Text style={S.coverEyebrow}>PREMIUM REPORT</Text>
          <Text style={S.coverMainTitle}>{'Adversity Quotient\nBehavioral Analytics'}</Text>
          <Text style={S.coverSubtitle}>Psychometric Intelligence Report</Text>
          <View style={S.coverDivider} />
          <Text style={S.coverStudentName}>{d.studentName}</Text>
          <Text style={S.coverStudentLabel}>Prepared exclusively for</Text>

          {/* Score + Level badges */}
          <View style={S.coverBadgeRow}>
            <View style={S.coverScoreBadge}>
              <Text style={S.coverScoreNum}>{aq}</Text>
              <Text style={S.coverScoreLabel}>AQ SCORE</Text>
            </View>
            <View style={[S.coverLevelBadge, { backgroundColor: lvlBg }]}>
              <Text style={[S.coverLevelText, { color: LEVEL_TEXT[level] ?? C.dark }]}>{level}</Text>
              <Text style={[S.coverLevelLabel, { color: LEVEL_TEXT[level] ?? C.slate700 }]}>AQ LEVEL</Text>
            </View>
          </View>
        </View>

        {/* Bottom row */}
        <View style={S.coverBottom}>
          <View>
            <Text style={S.coverBottomText}>Report Date: {d.generatedDate}</Text>
            {d.email ? <Text style={S.coverBottomText}>{d.email}</Text> : null}
            <Text style={S.coverBottomText}>Total Attempts: {d.aqHistory.totalAttempts}</Text>
          </View>
          <Text style={S.coverConfidential}>CONFIDENTIAL</Text>
        </View>
      </View>
    </Page>
  );
}

/* ─────────────────────────── Page 2 — Executive Summary ─────────────────── */

function ExecutiveSummaryPage({ d }: { d: AQReportData }) {
  const aq    = d.aqHistory.latestScore ?? d.aqHistory.avgScore ?? 0;
  const level = d.aqHistory.latestLevel ?? levelOf(aq);
  const { title: lvlTitle, body: lvlBody } = LEVEL_DESC[level] ?? LEVEL_DESC.Moderate;

  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title="Executive Summary" subtitle="AQ Score Overview & Resilience Profile" pg="2" />

      {/* KPI row */}
      <View style={S.kpiRow}>
        <View style={S.kpiCard}>
          <Text style={[S.kpiVal, { color: LEVEL_COLOR[level] ?? C.sky }]}>{aq}</Text>
          <Text style={S.kpiLabel}>LATEST AQ SCORE</Text>
          <Text style={S.kpiSub}>out of 100</Text>
        </View>
        <View style={S.kpiCard}>
          <Text style={[S.kpiVal, { color: C.emerald }]}>{d.aqHistory.bestScore ?? aq}</Text>
          <Text style={S.kpiLabel}>BEST AQ SCORE</Text>
          <Text style={S.kpiSub}>all-time highest</Text>
        </View>
        <View style={S.kpiCard}>
          <Text style={[S.kpiVal, { color: C.indigo }]}>{d.aqHistory.avgScore?.toFixed(1) ?? aq}</Text>
          <Text style={S.kpiLabel}>AVERAGE SCORE</Text>
          <Text style={S.kpiSub}>across attempts</Text>
        </View>
        <View style={S.kpiCardLast}>
          <Text style={[S.kpiVal, { color: C.slate700 }]}>{d.aqHistory.totalAttempts}</Text>
          <Text style={S.kpiLabel}>TOTAL ATTEMPTS</Text>
          <Text style={S.kpiSub}>cumulative</Text>
        </View>
      </View>

      {/* Level card */}
      <View style={S.levelCard}>
        <View style={{ marginRight: 16 }}>
          <DonutWithScore score={aq} level={level} />
        </View>
        <View style={S.levelCardRight}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Text style={[S.levelCardTitle, { marginRight: 8 }]}>{lvlTitle}</Text>
            <LevelPill level={level} />
          </View>
          <Text style={S.levelCardBody}>{lvlBody}</Text>
        </View>
      </View>

      {/* AQ Scale reference */}
      <SectionBand title="AQ Score Scale Reference" sub="Understanding where your score sits on the behavioral resilience spectrum" />
      {[
        { range: '80 – 100', lvl: 'Exceptional', desc: 'Top-tier resilience. Operates under extreme adversity with full agency.', marks: '80/100 – 100/100' },
        { range: '65 – 79',  lvl: 'Strong',      desc: 'Above-average resilience. Handles most challenges effectively.',          marks: '65/100 – 79/100' },
        { range: '50 – 64',  lvl: 'Moderate',    desc: 'Developing resilience. Strong in some dimensions, with clear growth areas.', marks: '50/100 – 64/100' },
        { range: '0 – 49',   lvl: 'Developing',  desc: 'Foundational stage. Significant growth potential through targeted practice.', marks: '0/100 – 49/100' },
      ].map(r => (
        <View key={r.lvl} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: C.slate100 }}>
          <View style={[S.pill, { backgroundColor: LEVEL_BG[r.lvl] ?? C.slate100, marginRight: 10, width: 70 }]}>
            <Text style={[S.pillText, { color: LEVEL_TEXT[r.lvl] ?? C.dark }]}>{r.lvl}</Text>
          </View>
          <Text style={[S.td, { width: 52, fontWeight: 700, color: LEVEL_COLOR[r.lvl] ?? C.dark }]}>{r.range}</Text>
          <Text style={[S.td, { width: 90, fontSize: 7.5, color: C.slate500 }]}>{r.marks}</Text>
          <Text style={[S.td, { flex: 1 }]}>{r.desc}</Text>
          {r.lvl === level && (
            <View style={{ backgroundColor: LEVEL_BG[level] ?? C.slate100, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8 }}>
              <Text style={{ fontSize: 7, fontWeight: 700, color: LEVEL_TEXT[level] ?? C.dark, fontFamily: 'Inter' }}>YOU: {aq}/100</Text>
            </View>
          )}
        </View>
      ))}

      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────────────── Page 3 — AQ History ────────────────────────── */

function HistoryPage({ d }: { d: AQReportData }) {
  const trend = d.aqHistory.trend ?? [];

  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title="AQ History & Attempts" subtitle="All assessment attempts, scores, and growth trajectory" pg="3" />

      <SectionBand title="AQ Growth Trend" sub="Score progression across all attempts — Y-axis: Score (0–100) · X-axis: Assessment Attempts" />
      {trend.length >= 2 ? (
        <View style={S.analyticsCard}>
          <Text style={S.analyticsTitle}>Score Trajectory</Text>
          <LineChartWithAxes trend={trend} />
        </View>
      ) : (
        <View style={[S.analyticsCard, { paddingVertical: 20, alignItems: 'center' }]}>
          <Text style={S.note}>Complete at least 2 assessments to see your growth trend chart.</Text>
        </View>
      )}

      <SectionBand title="Attempt History" sub="Detailed record of all assessment attempts — Level: test difficulty · Scale: resilience band" />
      {/* Table header */}
      <View style={S.tableHead}>
        <Text style={[S.th, { width: 20 }]}>#</Text>
        <Text style={[S.th, { flex: 2 }]}>DATE</Text>
        <Text style={[S.th, { flex: 1, textAlign: 'center' }]}>SCORE</Text>
        <Text style={[S.th, { flex: 1.4, textAlign: 'center' }]}>LEVEL</Text>
        <Text style={[S.th, { flex: 2.2, textAlign: 'center' }]}>SCALE</Text>
      </View>
      {trend.length === 0 ? (
        <View style={[S.tableRow, { justifyContent: 'center' }]}>
          <Text style={[S.td, { color: C.slate400 }]}>No attempts recorded yet.</Text>
        </View>
      ) : trend.map((p, i) => {
        const diffColor: Record<string, string> = { Easy: C.emerald, Medium: C.amber, Hard: C.rose };
        const diff = p.difficulty && p.difficulty !== 'Mixed' ? p.difficulty : null;
        return (
          <View key={p.attempt} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
            <Text style={[S.td, { width: 20 }]}>{p.attempt}</Text>
            <Text style={[S.td, { flex: 2 }]}>{fmtDate(p.date)}</Text>
            <Text style={[S.td, { flex: 1, textAlign: 'center', fontWeight: 700, color: LEVEL_COLOR[p.level] ?? C.sky }]}>{p.score}/100</Text>
            {/* LEVEL column — Easy / Medium / Hard */}
            <View style={{ flex: 1.4, alignItems: 'center', justifyContent: 'center' }}>
              {diff ? (
                <View style={{ backgroundColor: diffColor[diff] + '22', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 7, fontWeight: 700, color: diffColor[diff], fontFamily: 'Inter' }}>{diff}</Text>
                </View>
              ) : (
                <Text style={[S.td, { color: C.slate400 }]}>—</Text>
              )}
            </View>
            {/* SCALE column — Developing / Moderate / Strong / Exceptional */}
            <View style={{ flex: 2.2, alignItems: 'center', justifyContent: 'center' }}>
              <LevelPill level={p.level} style={{ alignSelf: 'center' }} />
            </View>
          </View>
        );
      })}

      {trend.length > 1 && (
        <View style={{ marginTop: 12, flexDirection: 'row', backgroundColor: C.slate50, borderRadius: 8, padding: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={[S.td, { fontWeight: 700 }]}>Best Score</Text>
            <Text style={[S.kpiVal, { fontSize: 16, color: C.emerald }]}>{d.aqHistory.bestScore}/100</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[S.td, { fontWeight: 700 }]}>Average Score</Text>
            <Text style={[S.kpiVal, { fontSize: 16, color: C.indigo }]}>{d.aqHistory.avgScore?.toFixed(1)}/100</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[S.td, { fontWeight: 700 }]}>Total Attempts</Text>
            <Text style={[S.kpiVal, { fontSize: 16, color: C.purple }]}>{trend.length}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[S.td, { fontWeight: 700 }]}>Improvement</Text>
            {trend.length >= 2 ? (() => {
              const delta = (trend[trend.length - 1]?.score ?? 0) - (trend[0]?.score ?? 0);
              const color = delta >= 0 ? C.emerald : C.rose;
              return <Text style={[S.kpiVal, { fontSize: 16, color }]}>{delta >= 0 ? '+' : ''}{delta.toFixed(0)} pts</Text>;
            })() : <Text style={[S.kpiVal, { fontSize: 16, color: C.slate400 }]}>—</Text>}
          </View>
        </View>
      )}

      {/* Level-wise performance breakdown */}
      {(() => {
        const levelColors: Record<string, string> = { Easy: C.emerald, Medium: C.amber, Hard: C.rose };
        const groups = ['Easy', 'Medium', 'Hard'].map(lvl => ({
          lvl, color: levelColors[lvl]!,
          items: trend.filter(p => p.difficulty === lvl),
        }));
        const hasDiffData = groups.some(g => g.items.length > 0);
        if (!hasDiffData) return null;
        return (
          <View style={{ marginTop: 10 }}>
            <SectionBand title="Level-wise Performance" sub="Avg score grouped by test level: Assessment 1 (Easy) · Assessment 2 (Medium) · Assessment 3 (Hard)" />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {groups.map(({ lvl, color, items }) => {
                const avgScore = items.length ? Math.round(items.reduce((s, p) => s + p.score, 0) / items.length) : null;
                const best  = items.length ? Math.max(...items.map(p => p.score)) : null;
                const worst = items.length ? Math.min(...items.map(p => p.score)) : null;
                const label = lvl === 'Easy' ? 'Assessment 1' : lvl === 'Medium' ? 'Assessment 2' : 'Assessment 3';
                return (
                  <View key={lvl} style={[S.kpiCard, { flex: 1, borderLeftWidth: 3, borderLeftColor: color, paddingVertical: 8 }]}>
                    <Text style={[S.kpiLabel, { color, fontSize: 7.5 }]}>{lvl.toUpperCase()} — {label}</Text>
                    <Text style={[S.kpiVal, { fontSize: 20, color }]}>{avgScore !== null ? `${avgScore}/100` : '—'}</Text>
                    <Text style={[S.kpiSub, { fontSize: 7 }]}>{items.length} attempt{items.length !== 1 ? 's' : ''}</Text>
                    {best !== null && <Text style={[S.kpiSub, { fontSize: 7 }]}>Best: {best}/100 · Lowest: {worst}/100</Text>}
                  </View>
                );
              })}
            </View>
          </View>
        );
      })()}

      {/* Scale-wise distribution (Developing / Moderate / Strong / Exceptional) */}
      {trend.length > 0 && (
        <View style={{ marginTop: 10 }}>
          <SectionBand title="Scale Distribution" sub="Attempts distributed across the 4 resilience bands (scale ≠ level — scale measures behavioural response, not test difficulty)" />
          <View style={{ marginBottom: 6 }}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: C.dark, fontFamily: 'Inter' }}>
              Total attempts: {trend.length}
            </Text>
            <Text style={{ fontSize: 7.2, fontWeight: 400, color: C.dark, fontFamily: 'Inter', marginTop: 2 }}>
              Reading tip: each bar shows count and percentage for that scale in plain language.
            </Text>
          </View>
          {/* Bar chart area */}
          <View style={{ backgroundColor: C.slate50, borderRadius: 10, padding: 14 }}>
            {/* Y-axis grid lines */}
            <View style={{ position: 'absolute' as any, top: 14, left: 14, right: 14, bottom: 40 }}>
              {[100, 75, 50, 25, 0].map((tick) => (
                <View key={tick} style={{
                  position: 'absolute' as any,
                  bottom: `${tick}%` as any,
                  left: 0, right: 0,
                  borderTopWidth: tick === 0 ? 1.5 : 0.5,
                  borderTopColor: tick === 0 ? C.slate400 : C.slate200,
                  flexDirection: 'row', alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 5.5, color: C.slate400, fontFamily: 'Inter', fontWeight: 400, marginTop: -4, width: 16 }}>{tick}%</Text>
                </View>
              ))}
            </View>
            {/* Bars + labels */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, paddingLeft: 18, gap: 6 }}>
              {(['Exceptional', 'Strong', 'Moderate', 'Developing'] as const).map(lvl => {
                const count = trend.filter(p => p.level === lvl).length;
                const pct = trend.length > 0 ? Math.round((count / trend.length) * 100) : 0;
                const barH = count > 0 ? Math.max(6, pct) : 0;
                return (
                  <View key={lvl} style={{ flex: 1, alignItems: 'center', height: 100, justifyContent: 'flex-end' }}>
                    {/* Count + pct label above bar in simple format */}
                    <View style={{ alignItems: 'center', marginBottom: 3 }}>
                      <Text style={{ fontSize: 6.7, fontWeight: 700, color: C.dark, fontFamily: 'Inter' }}>{lvl}</Text>
                      <Text style={{ fontSize: 6.7, fontWeight: 700, color: C.dark, fontFamily: 'Inter' }}>Count: {count}</Text>
                      <Text style={{ fontSize: 6.7, fontWeight: 700, color: C.dark, fontFamily: 'Inter' }}>Percent: {pct}%</Text>
                    </View>
                    {/* Bar */}
                    <View style={{ width: '72%', height: `${barH}%` as any, backgroundColor: LEVEL_COLOR[lvl], borderRadius: 4, opacity: count > 0 ? 1 : 0.15 }} />
                  </View>
                );
              })}
            </View>
            {/* X-axis labels */}
            <View style={{ flexDirection: 'row', paddingLeft: 18, gap: 6, marginTop: 6 }}>
              {(['Exceptional', 'Strong', 'Moderate', 'Developing'] as const).map(lvl => (
                <View key={lvl} style={{ flex: 1, alignItems: 'center', gap: 3 }}>
                  <View style={[S.pill, { backgroundColor: LEVEL_BG[lvl] ?? C.slate100 }]}>
                    <Text style={[S.pillText, { color: LEVEL_TEXT[lvl] ?? C.dark, fontSize: 6.5 }]}>{lvl}</Text>
                  </View>
                  <Text style={{ fontSize: 6, color: C.slate400, fontFamily: 'Inter', fontWeight: 400 }}>
                    {lvl === 'Exceptional' ? '80–100' : lvl === 'Strong' ? '65–79' : lvl === 'Moderate' ? '50–64' : '0–49'}
                  </Text>
                </View>
              ))}
            </View>
            {/* Total attempts footnote */}
            <Text style={{ fontSize: 6.5, color: C.slate400, fontFamily: 'Inter', fontWeight: 400, marginTop: 8, textAlign: 'center' }}>
              Based on {trend.length} attempt{trend.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      )}

      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────────────── Page 4 — Dimension Analysis ────────────────── */

function DimensionPage({ d }: { d: AQReportData }) {
  const avgs = d.aqHistory.subscaleAverages ?? [];

  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title="Dimension Analysis" subtitle="CORE framework — Control, Ownership, Reach, Endurance" pg="4" />

      <View style={{ backgroundColor: C.slate50, borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 10, marginBottom: 10 }}>
        <Text style={{ fontSize: 9, fontWeight: 700, color: C.dark, marginBottom: 4 }}>CORE Interpretation Guide</Text>
        <Text style={{ fontSize: 7.6, fontWeight: 400, color: C.dark, lineHeight: 1.55, marginBottom: 4 }}>
          CORE is the behavioral engine behind your AQ score. Control shows whether you move into action when difficulty appears. Ownership shows whether you use setbacks as feedback for growth or as proof of failure. Reach shows whether one problem stays in one area or spreads into everything else. Endurance shows whether you interpret adversity as temporary and manageable or as long and permanent.
        </Text>
        <Text style={{ fontSize: 7.6, fontWeight: 400, color: C.dark, lineHeight: 1.55, marginBottom: 5 }}>
          In high performers, these dimensions work together, not separately. For example, strong Control without Ownership can lead to activity without learning. Strong Ownership without Reach can still result in emotional spillover. The goal is not perfection in one dimension; the goal is balanced strength across all four so your response remains stable in real-life pressure situations.
        </Text>
        <View style={{ marginLeft: 4 }}>
          {[
            'Control: Converts stress into structured action.',
            'Ownership: Converts mistakes into learning loops.',
            'Reach: Protects focus by containing spillover.',
            'Endurance: Maintains hope and persistence over time.',
          ].map((line, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
              <Text style={{ fontSize: 7.2, fontWeight: 700, color: C.dark, marginRight: 5 }}>•</Text>
              <Text style={{ fontSize: 7.2, fontWeight: 400, color: C.dark, lineHeight: 1.4, flex: 1 }}>{line}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={S.twoCol}>
        {/* Left: Radar + score table */}
        <View style={[S.colL, { maxWidth: 210 }]}>
          <SectionBand title="CORE Radar" />
          <View style={{ alignItems: 'center', marginBottom: 10 }}>
            <RadarChartWithLabels avgs={avgs} />
          </View>
          {/* Mini score table */}
          <View style={S.tableHead}>
            <Text style={[S.th, { flex: 2 }]}>DIMENSION</Text>
            <Text style={[S.th, { flex: 1, textAlign: 'right' }]}>AVG %</Text>
          </View>
          {(['Control', 'Ownership', 'Reach', 'Endurance'] as const).map(dim => {
            const pct = getDim(avgs, dim);
            return (
              <View key={dim} style={S.tableRow}>
                <Text style={[S.td, { flex: 2 }]}>{dim}</Text>
                <Text style={[S.td, { flex: 1, textAlign: 'right', fontWeight: 700, color: LEVEL_COLOR[levelOf(pct)] ?? C.sky }]}>{pct.toFixed(0)}%</Text>
              </View>
            );
          })}
        </View>

        {/* Right: Dimension cards */}
        <View style={S.colR}>
          <SectionBand title="Dimension Breakdown" />
          {(['Control', 'Ownership', 'Reach', 'Endurance'] as const).map(dim => {
            const pct   = getDim(avgs, dim);
            const info  = DIM_INFO[dim];
            const color = LEVEL_COLOR[levelOf(pct)] ?? C.sky;
            return (
              <View key={dim} style={S.dimCard}>
                <View style={S.dimHeader}>
                  <Text style={S.dimTitle}>{dim}</Text>
                  <Text style={[S.dimPct, { color }]}>{pct.toFixed(0)}%</Text>
                </View>
                <Text style={S.dimDesc}>{info?.desc}</Text>
                <ProgressBar pct={pct} color={color} />
                <View style={S.spacer8} />
                <Text style={S.dimInterp}>{pct >= 65 ? info?.high : info?.low}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────────────── Page 5 — Behavioral Patterns ───────────────── */

function BehavioralPage({ d }: { d: AQReportData }) {
  const patterns = behaviorPatterns(d.aqHistory);
  const behaviorExtensions: Record<string, string> = {
    'Stress Response Style': 'Coaching note: after each setback, write one quick review of what happened, what helped, and what the next small action will be. This turns stress into practical momentum instead of allowing rumination to take over.',
    'Resilience Mechanism': 'Coaching note: this pattern is trainable through repeated reframing. If you practice short evidence-based reframing daily, emotional recovery speed usually improves first, followed by performance stability.',
    'Accountability Orientation': 'Growth insight: accountability is not self-blame. Healthy ownership is specific, actionable, and future-oriented. It asks, "What can I improve next time?" rather than "What is wrong with me?"',
    'Adversity Compartmentalization': 'Performance impact: better compartmentalization protects deep work quality and sleep quality. Students who contain spillover tend to perform more consistently across exams and project deadlines.',
    'Pressure Response Style': 'Training target: build a default pressure script before high-stakes events. A simple script such as "Pause, prioritize, execute" reduces panic and improves decision quality under time limits.',
    'Learning & Growth Orientation': 'Long-term effect: regular reflection and re-assessment convert stress into growth data. This creates a compounding cycle where each attempt improves your strategy for the next attempt.',
  };

  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title="Behavioral Patterns" subtitle="Derived behavioral insights from your AQ profile" pg="5" />
      <SectionBand title="Pattern Analysis" sub="How your AQ score translates into observable behavioral tendencies" />
      {patterns.map(p => (
        <View key={p.title} style={S.insightCard}>
          <View style={[S.insightDot, { backgroundColor: p.color }]} />
          <View style={{ flex: 1 }}>
            <Text style={S.insightTitle}>{p.title}</Text>
            <Text style={S.insightBody}>{p.body}</Text>
            <Text style={[S.insightBody, { marginTop: 4, fontSize: 7.4 }]}>{behaviorExtensions[p.title]}</Text>
          </View>
        </View>
      ))}
      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────────────── Page 6 — Emotional & Stress Analysis ───────── */

function EmotionalPage({ d }: { d: AQReportData }) {
  const avgs  = d.aqHistory.subscaleAverages ?? [];
  const ctrl  = getDim(avgs, 'Control');
  const end   = getDim(avgs, 'Endurance');
  const reach = getDim(avgs, 'Reach');
  const emoScore = Math.round((ctrl + end) / 2);
  const stressScore = Math.round((ctrl + reach) / 2);

  const emoLevel = levelOf(emoScore);
  const stressLevel = levelOf(stressScore);

  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title="Emotional & Stress Analysis" subtitle="Emotional coping capacity and stress response intelligence" pg="6" />

      {/* Two indicator cards */}
      <View style={[S.twoCol, { marginBottom: 14 }]}>
        <View style={[S.analyticsCard, S.colL]}>
          <Text style={S.analyticsTitle}>Emotional Coping Score</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <DonutSVG score={emoScore} level={emoLevel} />
            <View style={{ marginLeft: 12 }}>
              <Text style={[S.kpiVal, { fontSize: 20, color: LEVEL_COLOR[emoLevel] ?? C.sky }]}>{emoScore}</Text>
              <LevelPill level={emoLevel} />
              <Text style={[S.note, { marginTop: 4 }]}>Control + Endurance avg</Text>
            </View>
          </View>
          <Text style={S.dimInterp}>
            {emoScore >= 70
              ? 'Your emotional coping intelligence is high. You regulate emotions effectively under adversity and bounce back with speed.'
              : emoScore >= 50
              ? 'Moderate emotional coping. You manage most situations but may benefit from mindfulness and regulation practices.'
              : 'Your emotional coping is still developing. Building regulation habits — breathing protocols, journaling — will measurably improve this.'}
          </Text>
        </View>
        <View style={[S.analyticsCard, S.colR]}>
          <Text style={S.analyticsTitle}>Stress Containment Score</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <DonutSVG score={stressScore} level={stressLevel} />
            <View style={{ marginLeft: 12 }}>
              <Text style={[S.kpiVal, { fontSize: 20, color: LEVEL_COLOR[stressLevel] ?? C.sky }]}>{stressScore}</Text>
              <LevelPill level={stressLevel} />
              <Text style={[S.note, { marginTop: 4 }]}>Control + Reach avg</Text>
            </View>
          </View>
          <Text style={S.dimInterp}>
            {stressScore >= 70
              ? 'You demonstrate strong stress containment. You handle pressure without letting it spread to other domains of your life.'
              : stressScore >= 50
              ? 'Moderate stress containment. You manage most stressors but some tend to overflow into other areas.'
              : 'Your stress containment is developing. Compartmentalization and action-oriented coping will improve this significantly.'}
          </Text>
        </View>
      </View>

      {/* Resilience breakdown */}
      <SectionBand title="Resilience Pattern Cards" sub="How each dimension contributes to your emotional resilience profile" />
      {[
        { label: 'Emotional Control',  pct: ctrl,  body: 'Your belief in your ability to influence emotionally charged situations.' },
        { label: 'Stress Endurance',   pct: end,   body: 'Your perception of how long emotional or stress states will last.' },
        { label: 'Stress Containment', pct: reach, body: 'Your ability to prevent stress from leaking into unrelated life areas.' },
      ].map(item => (
        <View key={item.label} style={[S.insightCard, { marginBottom: 6 }]}>
          <View style={[S.insightDot, { backgroundColor: LEVEL_COLOR[levelOf(item.pct)] ?? C.sky }]} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
              <Text style={S.insightTitle}>{item.label}</Text>
              <Text style={[S.insightTitle, { color: LEVEL_COLOR[levelOf(item.pct)] ?? C.sky }]}>{item.pct.toFixed(0)}%</Text>
            </View>
            <ProgressBar pct={item.pct} color={LEVEL_COLOR[levelOf(item.pct)] ?? C.sky} />
            <Text style={[S.insightBody, { marginTop: 5 }]}>{item.body}</Text>
          </View>
        </View>
      ))}

      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────────────── Page 7 — Strengths & Weaknesses ────────────── */

function StrengthsPage({ d }: { d: AQReportData }) {
  const avgs     = d.aqHistory.subscaleAverages ?? [];
  const strengths = avgs.filter(s => s.avgPercentage >= 65).sort((a, b) => b.avgPercentage - a.avgPercentage);
  const weaknesses = avgs.filter(s => s.avgPercentage < 55).sort((a, b) => a.avgPercentage - b.avgPercentage);
  const balanced   = strengths.length === 0 && weaknesses.length === 0;

  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title="Strengths & Weaknesses" subtitle="Dimension-level profile of your AQ assets and growth edges" pg="7" />

      {balanced ? (
        <View style={[S.analyticsCard, { alignItems: 'center', paddingVertical: 24 }]}>
          <Text style={S.analyticsTitle}>Balanced Profile</Text>
          <Text style={S.dimInterp}>All your dimensions fall within the moderate range (55–65%). Complete more assessments to reveal clearer strengths and targeted growth areas.</Text>
        </View>
      ) : (
        <View style={S.twoCol}>
          {/* Strengths column */}
          <View style={S.colL}>
            <Text style={S.swColTitle}>Strengths</Text>
            {strengths.length === 0 ? (
              <Text style={S.note}>No dimensions in the strong tier yet. Keep building your AQ.</Text>
            ) : strengths.map(s => {
              const info = DIM_INFO[s.dimension];
              return (
                <View key={s.dimension} style={[S.swCard, { backgroundColor: '#f0fdf4' }]}>
                  <View style={[S.swDot, { backgroundColor: C.emerald }]} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={S.swTitle}>{s.dimension}</Text>
                      <Text style={[S.swTitle, { color: C.emerald }]}>{s.avgPercentage.toFixed(0)}%</Text>
                    </View>
                    <ProgressBar pct={s.avgPercentage} color={C.emerald} />
                    <Text style={[S.swBody, { marginTop: 5 }]}>{info?.high}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Weaknesses column */}
          <View style={S.colR}>
            <Text style={S.swColTitle}>Growth Areas</Text>
            {weaknesses.length === 0 ? (
              <Text style={S.note}>No dimensions in the growth tier. All dimensions are in moderate or strong range.</Text>
            ) : weaknesses.map(s => {
              const info = DIM_INFO[s.dimension];
              return (
                <View key={s.dimension} style={[S.swCard, { backgroundColor: '#fff1f2' }]}>
                  <View style={[S.swDot, { backgroundColor: C.rose }]} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={S.swTitle}>{s.dimension}</Text>
                      <Text style={[S.swTitle, { color: C.rose }]}>{s.avgPercentage.toFixed(0)}%</Text>
                    </View>
                    <ProgressBar pct={s.avgPercentage} color={C.rose} />
                    <Text style={[S.swBody, { marginTop: 5 }]}>{info?.low}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Behavioral observations */}
      <View style={S.spacer12} />
      <SectionBand title="Behavioral Observations" />
      {[
        strengths.length >= 2 && { title: 'Multi-Dimensional Strength', body: `You are performing strongly in ${strengths.length} dimensions, creating a compounding resilience effect. High-AQ individuals typically have 2–3 strong dimensions that reinforce each other.` },
        weaknesses.length > 0 && { title: 'Targeted Growth Opportunity', body: `Your ${weaknesses.map(w => w.dimension).join(' and ')} dimension${weaknesses.length > 1 ? 's' : ''} ${weaknesses.length > 1 ? 'are' : 'is'} the highest-leverage area for AQ improvement. A 10-point increase in a low dimension typically yields more overall AQ growth than improving an already-strong dimension.` },
        !weaknesses.length && strengths.length > 0 && { title: 'Consolidated Strengths', body: 'Your strong dimensions indicate consistent psychological resilience patterns. Focus on translating these strengths into leadership, academic performance, and sustained high-pressure performance.' },
      ].filter(Boolean).map((obs: any, i) => (
        <View key={i} style={S.insightCard}>
          <View style={[S.insightDot, { backgroundColor: C.sky }]} />
          <View style={{ flex: 1 }}>
            <Text style={S.insightTitle}>{obs.title}</Text>
            <Text style={S.insightBody}>{obs.body}</Text>
          </View>
        </View>
      ))}

      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────────────── Page 8 — Recommendations ───────────────────── */

function RecommendationsPage({ d }: { d: AQReportData }) {
  const recs = recommendations(d.aqHistory);
  const recommendationSteps: Record<string, string[]> = {
    'Build Your Internal Locus of Control': [
      'Daily target: define 3 controllable actions before starting the day.',
      'Weekly check: track completion percentage and remove unrealistic tasks.',
      'Progress marker: lower procrastination and quicker response to setbacks.',
    ],
    'Develop an Accountability Practice': [
      'Use one nightly question: "What did I contribute today?"',
      'Convert each reflection into one next-day action.',
      'Review every Sunday to identify repeated patterns.',
    ],
    'Practice Adversity Compartmentalization': [
      'Label the problem domain clearly: study, social, health, or personal.',
      'Use a parking-lot note for intrusive worries during work blocks.',
      'Return to parked items at one fixed time each day.',
    ],
    'Build Temporal Resilience Narratives': [
      'Write one short evidence entry each evening.',
      'Include dates to prove that difficult phases ended.',
      'Read the log before major academic or emotional stress periods.',
    ],
    'Establish a Daily Resilience Routine': [
      'Keep the routine at the same time for at least 21 days.',
      'Start with short duration and protect consistency over intensity.',
      'Pair the routine with an existing habit to reduce friction.',
    ],
    'Pursue Structured Adversity Exposure': [
      'Choose one controlled challenge each week.',
      'Rate stress before and after to measure adaptation.',
      'Increase difficulty gradually, never abruptly.',
    ],
    'Replicate Your Peak Performance State': [
      'Capture sleep, study timing, and emotional state on peak days.',
      'Build a pre-performance checklist and reuse it.',
      'Compare outcomes after 3 repetitions and refine.',
    ],
    'Track Your AQ Journey Consistently': [
      'Reassess every 4-6 weeks using similar conditions.',
      'Track dimension-level change, not only total score.',
      'Use trend direction to set the next 30-day target.',
    ],
    'Build a Resilience Support System': [
      'Select one mentor/accountability partner and share this report.',
      'Schedule a weekly 15-minute progress conversation.',
      'Ask for one specific adjustment after each check-in.',
    ],
  };

  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title="Recommendations" subtitle="Personalised AQ development strategies for measurable growth" pg="8" />
      <SectionBand title="Your Growth Blueprint" sub="Evidence-based practices tailored to your specific AQ profile" />
      {recs.map((r, i) => (
        <View key={r.title} style={S.recCard}>
          <View style={S.recNum}>
            <Text style={S.recNumText}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={S.recTitle}>{r.title}</Text>
            <Text style={S.recBody}>{r.body}</Text>
            {(recommendationSteps[r.title] ?? [
              'Define one concrete action for this week.',
              'Track completion daily and adjust obstacles quickly.',
              'Review outcomes weekly and iterate the plan.',
            ]).map((step, si) => (
              <View key={si} style={{ flexDirection: 'row', marginTop: 2 }}>
                <Text style={{ fontSize: 7.2, fontWeight: 700, color: C.dark, marginRight: 5 }}>•</Text>
                <Text style={{ fontSize: 7.2, fontWeight: 400, color: C.dark, lineHeight: 1.45, flex: 1 }}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────────────── Page 9 — Progress Analytics ────────────────── */

/* ─────────────────────────── Page 9 — Final Summary ────────────────────── */

function FinalSummaryPage({ d }: { d: AQReportData }) {
  const aq    = d.aqHistory.latestScore ?? d.aqHistory.avgScore ?? 0;
  const level = d.aqHistory.latestLevel ?? levelOf(aq);
  const s     = finalSummary(d.aqHistory);

  return (
    <Page size="A4" style={S.finalPage}>
      {/* Decorative overlay */}
      <Svg width={595} height={841} style={{ position: 'absolute', top: 0, left: 0 } as any}>
        <Circle cx={550} cy={100} r={180} fill={C.sky}    fillOpacity={0.04} />
        <Circle cx={50}  cy={800} r={150} fill={C.purple} fillOpacity={0.04} />
        <Rect x={0} y={0} width={3} height={841} fill={C.sky} fillOpacity={0.5} />
      </Svg>

      <View style={S.finalHeaderBadge}>
        <Text style={S.finalHeaderBadgeText}>PSYCHOLOGICAL INSIGHT SUMMARY</Text>
      </View>
      <Text style={S.finalTitle}>Final AQ Assessment</Text>
      <Text style={S.finalSub}>{d.studentName} · {d.generatedDate} · {level} Level ({aq} / 100) · Page 16</Text>

      {/* Summary cards */}
      <View style={[S.finalCard, { borderLeftColor: C.sky }]}>
        <Text style={S.finalCardTitle}>Overall Interpretation</Text>
        <Text style={S.finalCardBody}>{s.interpretation}</Text>
      </View>
      <View style={[S.finalCard, { borderLeftColor: C.indigo }]}>
        <Text style={S.finalCardTitle}>Behavioral Conclusion</Text>
        <Text style={S.finalCardBody}>{s.conclusion}</Text>
      </View>
      <View style={[S.finalCard, { borderLeftColor: C.emerald }]}>
        <Text style={S.finalCardTitle}>Growth Outlook</Text>
        <Text style={S.finalCardBody}>{s.outlook}</Text>
      </View>
      <View style={[S.finalCard, { borderLeftColor: C.purple }]}>
        <Text style={S.finalCardTitle}>Resilience Potential</Text>
        <Text style={S.finalCardBody}>
          {`Your AQ of ${aq} places you in the ${level} tier. AQ is not fixed — it is a trainable behavioral capacity that responds to intentional practice. Every assessment you complete and every recommendation you act upon compounds your resilience advantage. The data in this report is your roadmap.`}
        </Text>
      </View>

      {/* Motivational box */}
      <View style={S.finalMotivationBox}>
        <Text style={S.finalMotivationText}>{`"${s.motivation}"`}</Text>
        <Text style={S.finalMotivationSub}>— Your Adversity AQ Analytics Report</Text>
      </View>

      {/* Branding footer */}
      <View style={S.finalBranding}>
        <View>
          <Text style={S.finalBrandingText}>Adversity · AQ Analytics Platform</Text>
          <Text style={[S.finalBrandingText, { marginTop: 2 }]}>adversity.app · Confidential & Proprietary</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={S.finalBrandingText}>Generated: {d.generatedDate}</Text>
          <Text style={S.finalBrandingText}>Student: {d.studentName}</Text>
        </View>
      </View>
    </Page>
  );
}

/* ─────────────────────────── Guidance Helper Data ───────────────────────── */

interface RoadmapWeek {
  week: string;
  focus: string;
  goals: string[];
  dailyHabit: string;
}

interface DimSolution {
  dimension: string;
  pct: number;
  why: string;
  effect: string;
  solutions: string[];
  dailyExercise: string;
}

const DIM_SOLUTIONS: Record<string, Omit<DimSolution, 'dimension' | 'pct'>> = {
  Control: {
    why: 'Your Control score reflects a tendency to attribute outcomes to external forces — circumstances, luck, or others — rather than to your own actions. This "external locus" mindset is common and often develops from repeated experiences where effort did not seem to produce results.',
    effect: 'Low Control thinking reduces initiative and increases anxiety. When you feel powerless to influence outcomes, motivation drops, procrastination rises, and stress becomes harder to manage. It can also lead to passive responses during academic pressure.',
    solutions: [
      'Sphere of Influence: Each morning list 3 specific actions WITHIN your direct control for the day. Ignore what is outside it. Focus there daily.',
      'Decision Journal: After each challenge, write "What one action could I take right now?" — this trains your brain to seek agency instead of helplessness.',
      'Micro-wins Practice: Deliberately complete 2-3 small tasks each day that you fully control. Celebrate each win. This rebuilds your belief in your own effectiveness.',
    ],
    dailyExercise: 'Every morning (5 min): Write "3 things I can control today." Every evening (3 min): Write "1 thing I controlled well today." After 21 days, this exercise measurably shifts your internal attribution patterns.',
  },
  Ownership: {
    why: 'Low Ownership reflects a pattern of externalizing blame when things go wrong. This is a natural psychological protection mechanism — blaming outside factors shields us from painful self-criticism. However, it blocks real growth.',
    effect: 'Without ownership, learning from failure becomes impossible. Growth stalls because the cause of problems is always "out there." Relationships with teachers, coaches, and peers also suffer when accountability is absent.',
    solutions: [
      'The 1% Rule: Ask "What is 1% of this outcome that I own?" You do not need to take full blame — just find your smallest contribution and own it completely.',
      'Accountability Partner: Share one area you are working to own with a trusted friend or mentor. External accountability dramatically accelerates this shift.',
      'Response vs. Reaction Journal: After difficult events, write: "My first reaction was ___. A more owned response would be ___." Awareness is the first step to change.',
    ],
    dailyExercise: 'Evening Ownership Audit (3 min): Write one situation from today. Ask "What did I contribute to this outcome, even 1%?" Write your answer honestly. No self-criticism — just honest observation. This builds ownership as a reflex.',
  },
  Reach: {
    why: 'Low Reach means that when adversity strikes in one area, it tends to flood into all other areas of your life — affecting your mood, focus, relationships, and even sleep. Stress hormones amplify this "contamination" effect neurologically.',
    effect: 'One academic setback makes you feel your entire future is threatened. One argument affects your concentration for hours. One failure feels like evidence of total incompetence. This exhausts your coping resources rapidly.',
    solutions: [
      'Domain Separation: When a problem occurs, name it precisely: "This is a MATH challenge." Not "my life is ruined." Contain it to its actual domain.',
      'The Parking Lot Technique: When worries about one area intrude into another, write the worry on paper (your "parking lot") and tell yourself "I will address this at 7pm." This gives your brain permission to stop looping.',
      'Mental Compartments: Practice visualizing each life area (studies, friends, health, goals) as a separate room. When you enter one room, the others are closed. Practice this 2 minutes before studying.',
    ],
    dailyExercise: 'Domain Shield Visualization (2 min, before study sessions): Close your eyes. Picture a transparent shield around your study space. Anything outside — social worries, family concerns, fears — stays outside while you study. Inside is clear, calm, and focused. Open your eyes and begin.',
  },
  Endurance: {
    why: 'Low Endurance reflects a tendency to believe that current adversity will last indefinitely — that bad feelings, hard situations, and painful circumstances are permanent. This is the "forever feeling" that the brain\u2019s negativity bias creates.',
    effect: 'The perceived permanence of adversity creates hopelessness, makes you want to quit before the situation improves, and can lead to catastrophizing. Academic pressure feels unbearable because there is no mental "end date" in sight.',
    solutions: [
      'Evidence Log: Create a list of every past adversity you have overcome. Read it when current challenges feel permanent. Evidence of past recovery trains your brain to expect future recovery.',
      'Temporal Reframing: Ask yourself: "Will this matter in 5 years?" and "Have I survived something like this before?" Both questions interrupt the permanence illusion.',
      'The Weather Metaphor: Train yourself to see adversity like weather — temporary, passing, not a reflection of your permanent state. "This storm is not the sky."',
    ],
    dailyExercise: '"This Too Shall Pass" Journal (5 min, evening): Write one challenge from today. Then write: "Evidence that this is temporary: ___." Then write: "What will likely be different in 2 weeks: ___." Repeat for 21 days to rewire your temporal perception of adversity.',
  },
};

function getDimSolutions(avgs: SubscaleAverage[]): DimSolution[] {
  const dims: Array<'Control' | 'Ownership' | 'Reach' | 'Endurance'> = ['Control', 'Ownership', 'Reach', 'Endurance'];
  return dims
    .map(dim => ({ dimension: dim, pct: getDim(avgs, dim), ...DIM_SOLUTIONS[dim] }))
    .filter(d => d.pct < 65)
    .sort((a, b) => CORE_ORDER[a.dimension] - CORE_ORDER[b.dimension])
    .slice(0, 4);
}

function buildRoadmap(avgs: SubscaleAverage[], level: string): RoadmapWeek[] {
  const weak = getDimSolutions(avgs);
  const w1dim  = weak[0]?.dimension ?? 'Control';
  const w2dim  = weak[1]?.dimension ?? 'Ownership';

  const habitMap: Record<string, string> = {
    Control:   'Write 3 things within my control each morning (5 min)',
    Ownership: 'Evening ownership audit — 1 thing I own today (3 min)',
    Reach:     'Domain Shield visualization before each study session (2 min)',
    Endurance: '"This Too Shall Pass" journal entry each evening (5 min)',
  };

  const goalMap: Record<string, string[]> = {
    Control:   ['Identify your sphere of influence for today', 'Complete 2 self-chosen tasks fully', 'Write 1 decision you made and its result'],
    Ownership: ['Find 1% ownership in one daily event', 'Replace one blame statement with an ownership statement', 'Journal a response vs. reaction reflection'],
    Reach:     ['Name one problem by its exact domain', 'Use the Parking Lot technique once', 'Study for 1 block with full domain separation'],
    Endurance: ['Add 2 entries to your Evidence Log', 'Apply the "5 years" question to one worry', 'Write one temporal reframe for a current challenge'],
  };

  const weeks: RoadmapWeek[] = [
    {
      week: 'Week 1 — Foundation & Awareness',
      focus: `Build self-awareness around your ${w1dim} dimension — the highest-leverage area for your AQ growth.`,
      goals: goalMap[w1dim] ?? [],
      dailyHabit: habitMap[w1dim] ?? '',
    },
    {
      week: 'Week 2 — Building Momentum',
      focus: `Deepen ${w1dim} practice while introducing your ${w2dim} dimension work. Two-dimensional focus accelerates compound growth.`,
      goals: [...(goalMap[w1dim] ?? []).slice(0, 2), ...(goalMap[w2dim] ?? []).slice(0, 1)],
      dailyHabit: `${habitMap[w1dim] ?? ''} + ${habitMap[w2dim] ?? ''}`,
    },
    {
      week: 'Week 3 — Behavioral Integration',
      focus: 'Apply your new resilience patterns in real-world situations: academic pressure, social friction, unexpected setbacks.',
      goals: [
        'Use your Week 1 tool in a real high-pressure situation',
        'Share one AQ insight with a friend or mentor',
        level === 'Developing' ? 'Re-take the AQ assessment to measure early progress' : 'Write your Resilience Story — adversity you have overcome',
      ],
      dailyHabit: 'Combined 10-min morning resilience protocol: control listing + domain shield + evidence log review',
    },
    {
      week: 'Week 4 — Compounding & Consistency',
      focus: 'Lock in your habits, measure your growth, and set your next 30-day AQ goal.',
      goals: [
        'Complete all 4 daily habits without missing a day',
        'Review your journal — identify 3 behavioral shifts you have noticed',
        'Set your next AQ score target and 30-day action plan',
      ],
      dailyHabit: 'Full 12-min protocol: morning (control + shield) + evening (ownership + endurance journal)',
    },
  ];

  return weeks;
}

/* ─────────────────────────── Page 11 — Improvement Roadmap ──────────────── */

function ImprovementRoadmapPage({ d }: { d: AQReportData }) {
  const avgs  = d.aqHistory.subscaleAverages ?? [];
  const level = d.aqHistory.latestLevel ?? levelOf(d.aqHistory.latestScore ?? d.aqHistory.avgScore ?? 50);
  const weeks = buildRoadmap(avgs, level);
  const weak  = getDimSolutions(avgs);
  const w1    = weak[0]?.dimension ?? 'Control';
  const w2    = weak[1]?.dimension ?? 'Ownership';
  const aq    = d.aqHistory.latestScore ?? d.aqHistory.avgScore ?? 50;

  /* Align the 30-day phases with the 4 weeks (index-matched) */
  const phaseMeta = [
    { days: 'Days 1–7',  color: C.sky,     bg: '#f0f9ff',
      tasks: [
        `Begin your ${w1} daily habit (5 min morning practice)`,
        'Start your Evidence Log — list 5 past adversities you have overcome',
        'Identify your top 2 resilience drains — what depletes your AQ most?',
        'Share your commitment to AQ growth with one trusted person',
      ],
    },
    { days: 'Days 8–14', color: C.indigo,  bg: '#eef2ff',
      tasks: [
        `Deepen ${w1} practice — aim 7 consecutive days without missing`,
        `Add ${w2} daily habit to your morning or evening protocol`,
        'Apply domain separation in at least 2 adversity situations this week',
        level === 'Developing' ? 'Celebrate week 2 — acknowledge behavioural shifts, however small' : 'Face one voluntary discomfort this week (hard conversation, tough goal)',
      ],
    },
    { days: 'Days 15–21', color: C.purple, bg: '#f5f3ff',
      tasks: [
        'Use your full resilience toolkit in one high-pressure situation',
        'Teach one resilience concept to a friend (teaching deepens mastery)',
        'Mid-point reflection: what behavioural shifts have you noticed?',
        'Update your Evidence Log with Week 2–3 wins',
      ],
    },
    { days: 'Days 22–30', color: C.emerald, bg: '#f0fdf4',
      tasks: [
        'Complete all 4 dimension habits for 7 consecutive days',
        'Write your "Resilience Story" — how you have grown in 30 days',
        `Re-take the AQ assessment to measure progress`,
        `Next target: ${aq}/100 → aim for ${Math.min(100, aq + 10)}/100`,
      ],
    },
  ];

  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title="30-Day AQ Development Roadmap" subtitle="Combined weekly goals & daily tasks — your complete personalised resilience growth plan" pg="9" />
      <SectionBand title="Weekly Goals + Daily Tasks" sub="Each week shows targeted goals (left) alongside concrete daily actions (right) — work both tracks together" />

      {weeks.map((week, wi) => {
        const phase = phaseMeta[wi]!;
        return (
          <View key={wi} style={{ borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 9, marginBottom: 7 }}>
            {/* ── Week header ── */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: phase.color, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                <Text style={{ fontSize: 8, fontWeight: 700, color: C.white, fontFamily: 'Inter' }}>{wi + 1}</Text>
              </View>
              <Text style={{ fontSize: 9, fontWeight: 700, color: C.dark, flex: 1, fontFamily: 'Inter' }}>{week.week}</Text>
              <View style={{ backgroundColor: phase.color, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 }}>
                <Text style={{ fontSize: 7, fontWeight: 700, color: C.white, fontFamily: 'Inter' }}>{phase.days}</Text>
              </View>
            </View>
            {/* ── Focus text ── */}
            <Text style={{ fontSize: 7.5, color: C.slate500, marginBottom: 6, lineHeight: 1.4, fontFamily: 'Inter', fontWeight: 400 }}>{week.focus}</Text>
            {/* ── Two columns: Goals | Daily Tasks ── */}
            <View style={{ flexDirection: 'row' }}>
              {/* Left: Weekly Goals */}
              <View style={{ flex: 1, marginRight: 6, borderRightWidth: 1, borderRightColor: C.slate100, paddingRight: 6 }}>
                <Text style={{ fontSize: 7, fontWeight: 700, color: C.sky, marginBottom: 3, fontFamily: 'Inter' }}>WEEKLY GOALS</Text>
                {week.goals.map((g, gi) => (
                  <View key={gi} style={{ flexDirection: 'row', marginBottom: 2 }}>
                    <Text style={{ fontSize: 7, color: C.sky, marginRight: 4, fontWeight: 700 }}>•</Text>
                    <Text style={{ fontSize: 7, color: C.slate700, flex: 1, lineHeight: 1.4, fontFamily: 'Inter', fontWeight: 400 }}>{g}</Text>
                  </View>
                ))}
              </View>
              {/* Right: Daily Tasks */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 7, fontWeight: 700, color: phase.color, marginBottom: 3, fontFamily: 'Inter' }}>DAILY TASKS</Text>
                {phase.tasks.map((task, ti) => (
                  <View key={ti} style={{ flexDirection: 'row', marginBottom: 2 }}>
                    <View style={{ width: 9, height: 9, borderRadius: 2, borderWidth: 1, borderColor: phase.color, marginRight: 4, marginTop: 1, flexShrink: 0 }} />
                    <Text style={{ fontSize: 7, color: C.slate700, flex: 1, lineHeight: 1.4, fontFamily: 'Inter', fontWeight: 400 }}>{task}</Text>
                  </View>
                ))}
              </View>
            </View>
            {/* ── Daily habit footer ── */}
            <View style={{ backgroundColor: C.slate50, borderRadius: 5, padding: 5, marginTop: 6, flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 7, fontWeight: 700, color: C.sky, marginRight: 6, flexShrink: 0, fontFamily: 'Inter' }}>DAILY HABIT:</Text>
              <Text style={{ fontSize: 7, color: C.slate600, flex: 1, lineHeight: 1.4, fontFamily: 'Inter', fontWeight: 400 }}>{week.dailyHabit}</Text>
            </View>
          </View>
        );
      })}

      {/* Compound principle note */}
      <View style={{ backgroundColor: C.slate50, borderRadius: 6, padding: 8, marginTop: 2 }}>
        <Text style={{ fontSize: 8, fontWeight: 700, color: C.dark, marginBottom: 2, fontFamily: 'Inter' }}>The Compound Resilience Principle</Text>
        <Text style={{ fontSize: 7, color: C.slate600, lineHeight: 1.55, fontFamily: 'Inter', fontWeight: 400 }}>
          AQ improvement is not linear — it is exponential. The first 7 days are the hardest. By Day 14 habits begin to feel natural. By Day 21 behavioural shifts are visible. By Day 30 your neural pathways have measurably changed. Most people quit before Day 10. You will not.
        </Text>
      </View>

      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────────────── Page 12 — Practical Solutions ──────────────── */

function PracticalSolutionsPage({ d }: { d: AQReportData }) {
  const avgs = d.aqHistory.subscaleAverages ?? [];
  const allSolutions: DimSolution[] = (['Control', 'Ownership', 'Reach', 'Endurance'] as const)
    .map((dim) => ({ dimension: dim, pct: getDim(avgs, dim), ...DIM_SOLUTIONS[dim] }));

  const coSolutions = allSolutions.filter((sol) => sol.dimension === 'Control' || sol.dimension === 'Ownership');
  const reSolutions = allSolutions.filter((sol) => sol.dimension === 'Reach' || sol.dimension === 'Endurance');

  const renderSolutionCard = (sol: DimSolution) => {
    const isGrowth = sol.pct < 65;
    const tone = isGrowth ? C.rose : C.emerald;
    return (
      <View key={sol.dimension} style={{ borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 12, marginBottom: 10 }}>
        {/* Dimension header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 7 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>{sol.dimension}</Text>
            <Text style={{ fontSize: 8, fontWeight: 400, color: C.slate500, marginTop: 1 }}>Current Score: {sol.pct.toFixed(0)}%</Text>
          </View>
          <View style={[S.pill, { backgroundColor: isGrowth ? '#fff1f2' : '#f0fdf4' }]}>
            <Text style={[S.pillText, { color: tone }]}>{isGrowth ? 'Growth Area' : 'Maintenance Area'}</Text>
          </View>
        </View>
        <ProgressBar pct={sol.pct} color={tone} />
        <View style={S.spacer8} />

        {/* Why & Effect */}
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: C.indigo, marginBottom: 3 }}>WHY THIS HAPPENS</Text>
            <Text style={{ fontSize: 7.5, fontWeight: 400, color: C.slate600, lineHeight: 1.5 }}>{sol.why}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: C.rose, marginBottom: 3 }}>HOW IT AFFECTS YOU</Text>
            <Text style={{ fontSize: 7.5, fontWeight: 400, color: C.slate600, lineHeight: 1.5 }}>{sol.effect}</Text>
          </View>
        </View>

        {/* Solutions */}
        <Text style={{ fontSize: 8, fontWeight: 700, color: C.emerald, marginBottom: 4 }}>YOUR ACTION PLAN</Text>
        {sol.solutions.map((s, si) => (
          <View key={si} style={{ flexDirection: 'row', marginBottom: 3 }}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: C.emerald, marginRight: 6 }}>{si + 1}.</Text>
            <Text style={{ fontSize: 7.5, fontWeight: 400, color: C.slate700, flex: 1, lineHeight: 1.5 }}>{s}</Text>
          </View>
        ))}

        {/* Daily exercise */}
        <View style={{ backgroundColor: '#f0fdf4', borderRadius: 6, padding: 8, marginTop: 6 }}>
          <Text style={{ fontSize: 7.5, fontWeight: 700, color: C.emerald, marginBottom: 2 }}>DAILY EXERCISE</Text>
          <Text style={{ fontSize: 7.5, fontWeight: 400, color: C.slate700, lineHeight: 1.5 }}>{sol.dailyExercise}</Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <Page size="A4" style={S.contentPage}>
        <PageHeader title="Practical Solutions for Growth Areas" subtitle="Deep-dive action plans for your lowest-scoring CORE dimensions" pg="10" />
        {coSolutions.map(renderSolutionCard)}
        <PageFooter name={d.studentName} date={d.generatedDate} />
      </Page>

      <Page size="A4" style={S.contentPage}>
        <PageHeader title="Practical Solutions for Growth Areas (Continued)" subtitle="Reach and Endurance deep-dive action plans" pg="11" />
        {reSolutions.map(renderSolutionCard)}
        <PageFooter name={d.studentName} date={d.generatedDate} />
      </Page>
    </>
  );
}

/* ─────────────────────────── Page 13 — Mentorship Guidance ──────────────── */

function MentorshipGuidancePage({ d }: { d: AQReportData }) {
  const aq = d.aqHistory.latestScore ?? d.aqHistory.avgScore ?? 50;

  const sections = [
    {
      title: 'Emotional Balance',
      color: C.indigo,
      bg: '#eef2ff',
      points: [
        'Regulate before you react: When emotions spike, take 4 slow breaths before responding. This activates your prefrontal cortex, the rational decision-making area.',
        'Name your emotion: Research shows that labeling emotions ("I feel anxious") reduces their intensity by activating the language centres rather than the survival centres of the brain.',
        'Energy management: Your emotional capacity is finite. Protect it by reducing unnecessary drama, limiting negative news consumption, and scheduling recovery time between high-stress activities.',
        'Reset protocol: use a 90-second emotional reset after difficult feedback or conflict. Short resets reduce emotional carryover into the next task.',
        'Data point: students who practice short regulation drills 5 days per week usually report better concentration and fewer emotional crashes within 3-4 weeks.',
      ],
    },
    {
      title: 'Exam & Academic Stress Management',
      color: C.sky,
      bg: '#f0f9ff',
      points: [
        'Preparation is the antidote to panic: Structure beats willpower. A clear study timetable eliminates the anxiety of "I do not know if I am doing enough."',
        aq < 60
          ? 'Accept imperfection: Perfectionism amplifies exam stress. Aim for 80% mastery per topic, not 100%. Progress over perfection keeps motivation alive.'
          : 'Use your resilience: Your AQ is an asset in exams. Before each exam, remind yourself of challenges you have already overcome. This primes your nervous system for performance.',
        'Post-exam detachment: After submitting, consciously close that chapter. What is done is done. Ruminating on past performance drains energy needed for the next task.',
        'Pre-exam structure: define a 48-hour routine for sleep, food, and revision format. Predictable routines reduce uncertainty stress significantly.',
        'Data point: simple exam routines often improve perceived control and reduce panic, which protects score consistency across papers.',
      ],
    },
    {
      title: 'Confidence Building',
      color: C.emerald,
      bg: '#f0fdf4',
      points: [
        'Evidence anchoring: Confidence is not a feeling — it is a track record. Keep a "wins log" of every task you complete, problem you solve, and challenge you overcome. Review it before difficult situations.',
        'Competence stacking: Focus on becoming highly competent in 2-3 specific areas rather than average across many. Deep skill in any area transfers confidence to other domains.',
        'Act confident first: Behaviour drives emotion as much as emotion drives behaviour. Stand tall, speak clearly, make decisions. The feeling of confidence follows the actions of confidence.',
        'Micro-challenge ladder: complete one slightly difficult task each day. Confidence grows fastest through repeated evidence, not motivation talks.',
        'Language shift: replace "I cannot do this" with "I cannot do this yet." This small shift improves persistence under challenge.',
      ],
    },
    {
      title: 'Focus & Consistency',
      color: C.amber,
      bg: '#fffbeb',
      points: [
        'Single-tasking: Multitasking reduces performance on all tasks by up to 40%. Commit to one task per session. Close all other tabs and apps. Full focus for a finite time is far more effective than divided focus for a long time.',
        'Environment design: Your environment shapes your behaviour. A clean, dedicated study space significantly outperforms a cluttered, multi-purpose one. Remove distractions before you need willpower to resist them.',
        'Habit stacking: Attach new practices to existing habits. "After I make morning tea, I immediately write my 3 control items." Stacking removes the friction of starting a new behaviour.',
        'Execution window: choose one fixed "no-negotiation" deep-work slot daily. Consistent timing reduces decision fatigue and improves adherence.',
        'Review metric: track focused minutes, not just hours at desk. This gives a more honest productivity baseline and clearer improvement trend.',
      ],
    },
  ];

  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title="Guidance & Mentorship" subtitle="Evidence-based coaching for emotional resilience, focus, and academic performance" pg="12" />
      {sections.map((sec) => (
        <View key={sec.title} style={{ borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 11, marginBottom: 9 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 7 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: sec.color, marginRight: 8 }} />
            <Text style={{ fontSize: 10, fontWeight: 700, color: C.dark }}>{sec.title}</Text>
          </View>
          {sec.points.map((p, pi) => (
            <View key={pi} style={{ flexDirection: 'row', paddingLeft: 4, marginBottom: 5 }}>
              <Text style={{ fontSize: 8, color: sec.color, fontWeight: 700, marginRight: 6 }}>→</Text>
              <Text style={{ fontSize: 8, fontWeight: 400, color: C.slate700, flex: 1, lineHeight: 1.55 }}>{p}</Text>
            </View>
          ))}
        </View>
      ))}
      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────────────── Page 14 — Understanding Your AQ ────────────── */

function AQUnderstandingPage({ d }: { d: AQReportData }) {
  const aq    = d.aqHistory.latestScore ?? d.aqHistory.avgScore ?? 50;
  const level = d.aqHistory.latestLevel ?? levelOf(aq);

  const faqs = [
    {
      q: 'What exactly is AQ?',
      a: 'Adversity Quotient (AQ) is a scientifically-validated measure of how well you respond to adversity — challenges, stress, failure, and pressure. It is distinct from IQ (raw intelligence) and EQ (emotional awareness). AQ specifically measures your resilience capacity: your ability to maintain function and keep moving forward when things go wrong.',
    },
    {
      q: 'Why does AQ matter for students?',
      a: 'Research consistently shows that AQ is a stronger predictor of long-term success than academic grades or IQ alone. Students with high AQ recover faster from exam failures, maintain motivation through difficult courses, manage social pressure more effectively, and are significantly less likely to experience burnout. AQ is the "engine" that determines whether your abilities and intelligence actually get used.',
    },
    {
      q: 'Why do I react differently to stress than my friends?',
      a: 'AQ varies between people based on upbringing, past adversity experiences, learned coping patterns, and neurological baseline stress tolerance. There is no "correct" way to respond to adversity — the goal is not to be unaffected by challenges but to maintain function and recover quickly. Your current AQ reflects your learned patterns, not a fixed personality trait.',
    },
    {
      q: 'Can AQ actually improve? How?',
      a: 'Yes — AQ is one of the most trainable psychological measures available. Unlike IQ, which is largely fixed, AQ responds directly to intentional practice. Neuroplasticity (your brain\'s ability to rewire) means that consistently practising the exercises in this report — the control listing, ownership journaling, domain separation, and endurance reframing — physically changes the neural pathways associated with your adversity response. Measurable improvement typically appears within 21-60 days of consistent practice.',
    },
    {
      q: 'What does my score of ' + aq + ' (' + level + ') really mean?',
      a: level === 'Exceptional'
        ? 'You are operating in the top tier of behavioral resilience. This means you maintain agency, accountability, and psychological stability even under significant adversity. Your challenge is not to build resilience — it is to sustain it and transmit it to others around you.'
        : level === 'Strong'
        ? 'You have built solid resilience foundations. In most adversity situations you respond effectively. Your opportunity is to close the gap to Exceptional by strengthening 1-2 specific dimensions. This is achievable within 60-90 days of focused practice.'
        : level === 'Moderate'
        ? 'You demonstrate genuine resilience in some areas while others present clear growth opportunities. This is the most common starting point — and an excellent inflection point. With the targeted practices in this report, significant improvement is achievable within 60 days.'
        : 'You are at the beginning of your resilience journey. This is not a disadvantage — it is a starting point with the most growth potential. Many exceptional resilience stories begin here. Every practice you do from this baseline has maximum impact.',
    },
    {
      q: 'How long before I see real change?',
      a: 'Initial shifts in perception and self-awareness: 1-7 days. Noticeable behavioural changes: 14-21 days. Measurable AQ score improvement: 30-60 days. Sustainable resilience habit formation: 60-90 days. These are evidence-based timelines. The key variable is consistency of practice, not intensity. Small, daily practices outperform occasional large efforts.',
    },
  ];

  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title="Understanding Your AQ" subtitle="Clear answers to the most important questions about your results and your journey" pg="13" />
      <SectionBand title="Student AQ Clarity Guide" sub="Reduce confusion, increase confidence — know exactly what your results mean and what to do next" />

      {faqs.map((item, i) => (
        <View key={i} style={{ borderRadius: 8, backgroundColor: C.slate50, padding: 10, marginBottom: 7, borderLeftWidth: 3, borderLeftColor: i % 2 === 0 ? C.sky : C.indigo }}>
          <Text style={{ fontSize: 9.5, fontWeight: 700, color: C.dark, marginBottom: 4 }}>{item.q}</Text>
          <Text style={{ fontSize: 8, fontWeight: 400, color: C.slate600, lineHeight: 1.6 }}>{item.a}</Text>
        </View>
      ))}

      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────────────── Page 15 — Study & Productivity ─────────────── */

function StudyProductivityPage({ d }: { d: AQReportData }) {
  const avgs  = d.aqHistory.subscaleAverages ?? [];
  const reach = getDim(avgs, 'Reach');
  const end   = getDim(avgs, 'Endurance');

  const blocks = [
    {
      title: 'Distraction & Phone Management',
      color: C.rose,
      items: [
        'Use timed focus blocks: 45-90 min of full-phone-off study, then a 10-15 min intentional break. This follows your brain\'s natural ultradian rhythm.',
        'App blocking: During study hours, use app-blocking tools (Forest, Cold Turkey, or iPhone Screen Time) to make social media physically inaccessible. Remove willpower from the equation.',
        'Physical separation: Place your phone in another room during study sessions. Even a turned-off phone on your desk reduces cognitive capacity by 10% (research verified).',
        reach < 55 ? 'Social media "parking lot": Check it at scheduled times only (e.g., 12pm, 6pm, 9pm). This is especially important for you given your Reach score — notifications contaminate your focus zone.' : 'Notification audit: Turn off all non-essential notifications permanently. You should choose when to check — not be summoned by your phone.',
      ],
    },
    {
      title: 'Study Routine Structure',
      color: C.indigo,
      items: [
        'Same time, same place: Study at the same time and location daily. Your brain learns to enter focus mode automatically when the environmental cue is consistent.',
        '90-minute cycles: Human peak focus operates in roughly 90-minute blocks. Plan your sessions accordingly — deep work for 90 min, then full break (walk, eat, rest) for 20-30 min.',
        'Hardest task first: Always begin your session with the most cognitively demanding work. Your willpower and focus are highest at the start. Easy tasks fill the end of sessions.',
        'Weekly review: Every Sunday, spend 15 minutes reviewing the week — what worked, what did not, what needs adjusting. This compounding reflection multiplies learning speed.',
      ],
    },
    {
      title: 'Concentration & Deep Work',
      color: C.sky,
      items: [
        'Pre-study ritual: A consistent 2-minute ritual before each session (music off, phone away, notepad open, 3 deep breaths) trains your brain to shift into focus mode on command.',
        'Single-tab rule: During study, have only one browser tab open — the exact resource you need. Every additional open tab creates micro-attentional pulls.',
        'Note-taking by hand: Writing notes by hand (vs. typing) forces processing and summary — significantly improving retention and concentration depth.',
        'Active recall over re-reading: Testing yourself on material is 3-5x more effective for memory than re-reading notes. Use flashcards, write from memory, or teach concepts aloud.',
      ],
    },
    {
      title: 'Burnout Prevention',
      color: C.emerald,
      items: [
        end < 55 ? 'Rest is productive: Your Endurance score suggests you may perceive rest as weakness. Reframe: rest is the recovery that makes the next effort possible. Athletes who do not recover do not improve.' : 'Sustainable load: Even with strong endurance, overloading consistently degrades performance. Build mandatory recovery into your weekly schedule — at least one full recovery day.',
        'Sleep is non-negotiable: Sleep deprivation reduces cognitive performance more than being drunk. Protect 7-9 hours nightly. No exam is worth chronic sleep debt.',
        'Social connection as fuel: Regular positive social interaction — not social media, but real conversation — is a proven cognitive performance enhancer. Schedule it intentionally.',
        'Know your depletion signals: Identify your personal early burnout signs (irritability, motivation loss, persistent fatigue). When 2+ signals appear simultaneously, take a mandatory recovery day.',
      ],
    },
  ];

  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title="Study & Productivity Guidance" subtitle="Science-backed strategies for peak academic performance and sustainable output" pg="14" />
      <SectionBand title="High-Performance Study System" sub="Each section is arranged horizontally: left side = focus area, right side = clear action bullets" />
      {blocks.map((block, bi) => (
        <View key={bi} style={{ borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 10, marginBottom: 7 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ width: 145, paddingRight: 8, borderRightWidth: 1, borderRightColor: C.slate200 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: block.color, marginRight: 6 }} />
                <Text style={{ fontSize: 9, fontWeight: 700, color: C.dark }}>{block.title}</Text>
              </View>
              <Text style={{ fontSize: 7.2, fontWeight: 400, color: C.dark, lineHeight: 1.45 }}>
                Focus target: improve consistency, reduce cognitive waste, and protect sustainable output during high-pressure academic periods.
              </Text>
            </View>
            <View style={{ flex: 1, paddingLeft: 8 }}>
              {block.items.map((item, ii) => (
                <View key={ii} style={{ flexDirection: 'row', marginBottom: 4 }}>
                  <Text style={{ fontSize: 7.4, fontWeight: 700, color: block.color, marginRight: 5 }}>•</Text>
                  <Text style={{ fontSize: 7.4, fontWeight: 400, color: C.dark, flex: 1, lineHeight: 1.5 }}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ))}

      <View style={{ backgroundColor: C.slate50, borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 9, marginTop: 2 }}>
        <Text style={{ fontSize: 8.5, fontWeight: 700, color: C.dark, marginBottom: 3 }}>Suggested Weekly Tracking Metrics</Text>
        {[
          'Focused study minutes completed (target consistency over volume).',
          'Number of distraction-free deep work blocks completed.',
          'Sleep quality score (1-10) and its relation to productivity quality.',
        ].map((line, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
            <Text style={{ fontSize: 7.2, fontWeight: 700, color: C.dark, marginRight: 5 }}>•</Text>
            <Text style={{ fontSize: 7.2, fontWeight: 400, color: C.dark, lineHeight: 1.4, flex: 1 }}>{line}</Text>
          </View>
        ))}
      </View>
      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────────────── Page 16 — 30-Day AQ Plan ───────────────────── */

/* ─────────────────────────── Page 17 — Parent Guidance ──────────────────── */

function ParentGuidancePage({ d }: { d: AQReportData }) {
  const aq    = d.aqHistory.latestScore ?? d.aqHistory.avgScore ?? 50;
  const level = d.aqHistory.latestLevel ?? levelOf(aq);
  const avgs  = d.aqHistory.subscaleAverages ?? [];
  const weak  = getDimSolutions(avgs);

  return (
    <Page size="A4" style={S.contentPage}>
      <PageHeader title="Parent Guidance Section" subtitle="How to support your child&apos;s emotional resilience and AQ development at home" pg="15" />

      <View style={{ backgroundColor: '#f0f9ff', borderRadius: 8, borderWidth: 1, borderColor: C.sky, padding: 12, marginBottom: 12 }}>
        <Text style={{ fontSize: 10, fontWeight: 700, color: C.dark, marginBottom: 4 }}>Understanding Your Child's Result</Text>
        <Text style={{ fontSize: 8.5, fontWeight: 400, color: C.slate700, lineHeight: 1.6 }}>
          {d.studentName} has completed the Adversity Quotient assessment and scored {aq}/100 ({level} level). This report is not a judgement — it is a map. An AQ score shows where a student is today and exactly what needs to grow. {level === 'Developing' || level === 'Moderate' ? 'A lower-to-moderate AQ score does not predict poor outcomes — it reveals specific growth areas that, with the right support, can improve measurably within 30-60 days.' : 'A strong AQ score indicates your child has developed healthy resilience patterns. Your role now is to sustain the conditions that made this possible.'}
        </Text>
      </View>

      <SectionBand title="How Parents Directly Influence AQ" sub="Research shows that parental behaviour is one of the strongest predictors of a student's resilience development" />

      {[
        {
          title: 'Reduce Outcome Pressure — Increase Process Recognition',
          body: 'Constant focus on grades, ranks, and scores inadvertently trains external attribution ("my value = my result"). Instead, regularly notice and comment on your child\'s effort, persistence, and problem-solving approach. "I noticed you kept working on that even when it was difficult" builds internal locus of control far more than "Great score!"',
          color: C.sky,
        },
        {
          title: 'Let Them Struggle (Productively)',
          body: weak.length > 0
            ? `Your child's ${weak[0].dimension} score is currently developing. One of the best things you can do is resist rescuing them from every difficulty. Allow age-appropriate struggle with academic and social challenges. Ask "What are your options?" before offering solutions. Productive struggle is where AQ is built.`
            : 'Your child demonstrates solid resilience. Continue providing appropriate challenges — slightly beyond their comfort zone. AQ is not built in safety; it is built at the edge of manageable difficulty.',
          color: C.indigo,
        },
        {
          title: 'Communicate Belief, Not Just Expectations',
          body: 'There is a critical difference between "You should do better" (expectation-pressure) and "I know you can handle this" (belief-confidence). The first triggers performance anxiety; the second activates resilience. Before exams, before challenges, communicate your genuine belief in their ability to cope — regardless of outcome.',
          color: C.emerald,
        },
        {
          title: 'Model Resilience Openly',
          body: 'Children learn more from watching their parents handle adversity than from any advice. When you face setbacks, handle them visibly and well: "That did not work, so I am going to try this." "I felt frustrated, but I chose to respond this way." Narrating your own resilience response is one of the most powerful AQ education tools available to you.',
          color: C.purple,
        },
        {
          title: 'Create Emotional Safety at Home',
          body: 'High-AQ students consistently report feeling safe to fail at home. If academic failure triggers significant punishment or disappointment, the student\'s psychological resources are spent managing that fear rather than building resilience. Create space where setbacks can be discussed openly, without shame — focus the conversation on learning, not blame.',
          color: C.amber,
        },
      ].map((item, i) => (
        <View key={i} style={{ borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 10, marginBottom: 7, flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.color, marginTop: 2.5, marginRight: 9, flexShrink: 0 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 9.5, fontWeight: 700, color: C.dark, marginBottom: 3 }}>{item.title}</Text>
            <Text style={{ fontSize: 7.5, fontWeight: 400, color: C.slate600, lineHeight: 1.6 }}>{item.body}</Text>
          </View>
        </View>
      ))}

      <View style={{ backgroundColor: C.slate50, borderRadius: 8, padding: 10, marginTop: 4 }}>
        <Text style={{ fontSize: 8.5, fontWeight: 700, color: C.dark, marginBottom: 3 }}>A Note for Parents</Text>
        <Text style={{ fontSize: 8, fontWeight: 400, color: C.slate600, lineHeight: 1.6 }}>
          The fact that {d.studentName} has completed this assessment demonstrates curiosity and self-awareness — qualities that are already high-AQ behaviors. Your support, framed as belief rather than pressure, will be the single greatest accelerator of their growth. You do not need to become a resilience expert — you just need to create the conditions where resilience can grow.
        </Text>
      </View>

      <View style={{ backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: C.slate200, padding: 10, marginTop: 7 }}>
        <Text style={{ fontSize: 8.5, fontWeight: 700, color: C.dark, marginBottom: 4 }}>Parent Action Dashboard (Weekly)</Text>
        {[
          'Weekly 20-minute reflective conversation: ask what challenge was hardest and what was learned from it.',
          'Use process praise at least 3 times a week (effort, strategy, persistence), not only result praise.',
          'Keep one low-pressure family routine that supports emotional safety (walk, meal, or device-free talk time).',
          'Monitor early stress signs: sleep disturbance, irritability, withdrawal, avoidance. Respond with support before escalation.',
        ].map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: 3 }}>
            <Text style={{ fontSize: 7.3, fontWeight: 700, color: C.dark, marginRight: 5 }}>•</Text>
            <Text style={{ fontSize: 7.3, fontWeight: 400, color: C.dark, lineHeight: 1.45, flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>

      <PageFooter name={d.studentName} date={d.generatedDate} />
    </Page>
  );
}

/* ─────────────────────────── Main Document Export ────────────────────────── */

export function AQReport(props: AQReportData) {
  return (
    <Document
      title={`AQ Premium Report — ${props.studentName}`}
      author="Adversity AQ Analytics Platform"
      subject="Adversity Quotient Behavioral Analytics Report"
      keywords="AQ, Resilience, Psychometric, Analytics"
      creator="Adversity"
    >
      <CoverPage              d={props} />
      <ExecutiveSummaryPage   d={props} />
      <HistoryPage            d={props} />
      <DimensionPage          d={props} />
      <BehavioralPage         d={props} />
      <EmotionalPage          d={props} />
      <StrengthsPage          d={props} />
      <RecommendationsPage    d={props} />
      <ImprovementRoadmapPage d={props} />
      <PracticalSolutionsPage d={props} />
      <MentorshipGuidancePage d={props} />
      <AQUnderstandingPage    d={props} />
      <StudyProductivityPage  d={props} />
      <ParentGuidancePage     d={props} />
      <FinalSummaryPage       d={props} />
    </Document>
  );
}

