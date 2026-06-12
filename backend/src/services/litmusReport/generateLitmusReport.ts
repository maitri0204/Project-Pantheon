import PDFDocument from "pdfkit";
import {
  STYLE_COLORS,
  leastStyle,
  overallPercent,
  stylePercent,
} from "./templateAssessmentData";
import { mergeLitmusReportPdf } from "./mergeLitmusPdf";
import type { LitmusAssessmentData } from "./types";
import { C, CONTENT_W, MARGIN, PAGE, SP } from "./theme";
import {
  academicRow,
  balanceRow,
  bodyText,
  bulletCard,
  bullets,
  contentBand,
  conversationShift,
  drawCard,
  drawFooter,
  drawRadarInCard,
  experienceTile,
  insightCard,
  measureBullets,
  metricCard,
  monthPlanBlock,
  newPage,
  numberedItem,
  phaseHeader,
  progressBar,
  scenarioCard,
  sectionTitle,
  splitPanel,
  subTitle,
  textCard,
  timelineRow,
} from "./drawUtils";

type Doc = PDFKit.PDFDocument;

function page2Executive(doc: Doc, data: LitmusAssessmentData): void {
  let y = sectionTitle(doc, "Executive Summary", MARGIN.top + 4, "A connected view of your parenting profile");

  const cardW = (CONTENT_W - 24) / 3;
  const cards: [string, string, string, string][] = [
    ["Overall Score", `${data.overallScore}/${data.maxScore}`, C.gold, C.goldSoft],
    ["Primary Style", data.primaryStyle, STYLE_COLORS[data.primaryStyle], C.blueSoft],
    ["Secondary Style", data.secondaryStyle, STYLE_COLORS[data.secondaryStyle], C.dangerSoft],
  ];
  cards.forEach(([l, v, a, s], i) => metricCard(doc, MARGIN.left + 10 + i * (cardW + 12), y, cardW, 64, l, v, a, s));
  y += 76 + SP.md;

  y = splitPanel(
    doc, MARGIN.left + 10, y, CONTENT_W - 20,
    "Top Parenting Strengths",
    [
      "You actively invest in your child's growth - classes, skills, and future readiness rank among your highest priorities.",
      "You provide clear direction when decisions stall, giving your child structure during uncertain moments.",
      "Your child likely feels that success matters and that you believe in their potential.",
    ],
    "Growth Opportunities",
    [
      "Reduce performance pressure by celebrating effort before outcomes.",
      "Invite your child's voice earlier in decisions - not only after plans are set.",
      "Strengthen emotional check-ins; your lowest Servant score suggests nurturing moments may be underused.",
    ],
    C.sage, C.coral, C.sageSoft, C.coralSoft
  );

  y = subTitle(doc, "Key Parenting Insights", MARGIN.left + 10, y, CONTENT_W - 20, C.gold);
  const iw = (CONTENT_W - 32) / 2;
  const insightY = y;
  const yLeft = insightCard(doc, MARGIN.left + 10, insightY, iw, "Dominant Identity",
    `Your ${data.primaryStyle} score (${data.scores[data.primaryStyle]}/${data.maxStyleScore}) shows you parent as a builder - creating pathways for achievement. Your child experiences you as someone preparing them for a bigger future.`, C.blue, C.blueSoft);
  const yRight = insightCard(doc, MARGIN.left + 22 + iw, insightY, iw, "Secondary Influence",
    `Your ${data.secondaryStyle} score (${data.scores[data.secondaryStyle]}/${data.maxStyleScore}) adds authority and decisiveness. This helps during chaos but may feel controlling when overused during everyday choices.`, STYLE_COLORS[data.secondaryStyle], C.dangerSoft);
  y = Math.max(yLeft, yRight) + SP.sm;

  contentBand(doc, MARGIN.left + 10, y, CONTENT_W - 20, "Executive Summary",
    `At ${overallPercent(data)}% overall, your parenting is purposeful and forward-focused. The Prince-King combination produces ambitious, directed children - but may reduce spontaneous joy and self-directed exploration. Your next priority: pair high expectations with emotional safety and shared decision-making.`,
    C.goldSoft);
}

function page3Dna(doc: Doc, data: LitmusAssessmentData): void {
  let y = sectionTitle(doc, "Your Parenting DNA", MARGIN.top + 4, "Who you are and how your child experiences you");

  y = textCard(doc, MARGIN.left + 10, y, CONTENT_W - 20,
    "Who You Are as a Parent",
    "You are a Development Architect. You see parenting as preparing a capable, successful human - not merely managing daily behavior. You move quickly from identifying potential to creating structured opportunities around it.",
    C.blueSoft, C.blue);

  y = splitPanel(
    doc, MARGIN.left + 10, y, CONTENT_W - 20,
    "What Drives Your Parenting Decisions",
    [
      "Future outcomes - you evaluate choices by where they lead, not how they feel today.",
      "Visible progress - milestones, grades, and skill mastery confirm your approach is working.",
      "Efficiency - when something works, you scale it; when it fails, you redirect firmly.",
    ],
    "How Your Child Likely Experiences You",
    [
      "Motivating and demanding - your belief in them feels real, but sometimes heavy.",
      "Decisive - you often know the answer before they finish the question.",
      "Invested - they sense time, money, and energy placed behind their development.",
    ],
    C.teal, C.coral, C.tealSoft, C.coralSoft
  );

  const tw = (CONTENT_W - 36) / 3;
  const traitCards: [string, string[], string, string][] = [
    ["Strengths", ["High ambition transfer", "Clear standards", "Strong resource mobilization"], C.success, C.successSoft],
    ["Risks", ["Pressure to perform", "Reduced autonomy", "Conditional confidence"], C.danger, C.dangerSoft],
    ["Key Traits", ["Goal-oriented", "Structured", "Results-focused"], C.blue, C.blueSoft],
  ];
  const traitY = y;
  let maxTraitBottom = traitY;
  traitCards.forEach((c, i) => {
    const x = MARGIN.left + 10 + i * (tw + 8);
    const bottom = bulletCard(doc, x, traitY, tw, c[0], c[1], c[3], c[2]);
    maxTraitBottom = Math.max(maxTraitBottom, bottom);
  });

  textCard(doc, MARGIN.left + 10, maxTraitBottom, CONTENT_W - 20, "Parenting Identity Insight",
    "Your Prince-King DNA means you naturally design your child's future with conviction. The opportunity ahead is not to parent less intentionally - but to parent more relationally. When investment meets emotional partnership, your child inherits both ambition and inner security.",
    C.warm, C.gold);
}

function page4Dashboard(doc: Doc, data: LitmusAssessmentData): void {
  let y = sectionTitle(doc, "Parenting Style Dashboard", MARGIN.top + 4, "Visual comparison across all five archetypes");

  y = drawRadarInCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, 195, "Radar Graph", data.scores, data.maxStyleScore, STYLE_COLORS);

  const barSectionH = 108;
  drawCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, barSectionH);
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.navy);
  doc.text("Score Comparison", MARGIN.left + 22, y + 12);
  const by = y + 30;
  const barW = (CONTENT_W - 72) / 5;
  (["Prince", "King", "Joker", "Elder", "Servant"] as const).forEach((s, i) => {
    const bx = MARGIN.left + 22 + i * (barW + 6);
    drawCard(doc, bx, by, barW, 68, { fill: C.warm, shadow: false });
    doc.font("Helvetica-Bold").fontSize(7).fillColor(STYLE_COLORS[s]);
    doc.text(s, bx + 4, by + 6, { width: barW - 8, align: "center" });
    progressBar(doc, bx + 6, by + 20, barW - 12, "", stylePercent(data, s), STYLE_COLORS[s], false);
    doc.font("Helvetica").fontSize(6.5).fillColor(C.textMuted);
    doc.text(`${data.scores[s]}/30`, bx + 4, by + 48, { width: barW - 8, align: "center" });
  });
  y += barSectionH + SP.lg;

  y = subTitle(doc, "Parenting Mix Analysis", MARGIN.left + 10, y, CONTENT_W - 20, C.gold);
  y += SP.xs;
  const tw = (CONTENT_W - 36) / 3;
  [
    ["Dominant Style", data.primaryStyle, `${data.scores[data.primaryStyle]}/${data.maxStyleScore} - You lead with investment and growth design.`],
    ["Secondary Style", data.secondaryStyle, `${data.scores[data.secondaryStyle]}/${data.maxStyleScore} - You reinforce with authority and direction.`],
    ["Least Expressed", leastStyle(data), `${data.scores[leastStyle(data)]}/${data.maxStyleScore} - Nurturing support appears least in your pattern.`],
  ].forEach(([title, style, desc], i) => {
    const x = MARGIN.left + 10 + i * (tw + 8);
    doc.font("Helvetica").fontSize(7.8);
    const descH = doc.heightOfString(desc as string, { width: tw - 20, lineGap: 1.5 });
    const cardH = Math.max(88, descH + 54);
    drawCard(doc, x, y, tw, cardH);
    doc.roundedRect(x, y, tw, 22, 6).fill(STYLE_COLORS[style as string] || C.navy);
    doc.font("Helvetica").fontSize(7).fillColor(C.white);
    doc.text((title as string).toUpperCase(), x + 10, y + 6, { width: tw - 20 });
    doc.font("Helvetica-Bold").fontSize(12).fillColor(C.navy);
    doc.text(style as string, x + 10, y + 30);
    doc.font("Helvetica").fontSize(7.8).fillColor(C.text);
    doc.text(desc as string, x + 10, y + 48, { width: tw - 20, lineGap: 1.5 });
  });
}

function page5Primary(doc: Doc, data: LitmusAssessmentData): void {
  let y = sectionTitle(doc, `Primary Style Deep Dive - ${data.primaryStyle}`, MARGIN.top + 4);

  y = insightCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "What Your Prince Dominance Means",
    `A score of ${data.scores[data.primaryStyle]}/${data.maxStyleScore} places ${data.primaryStyle} far above your other styles. You parent by building capability - identifying talent, funding development, and pushing toward excellence. Your child learns that growth is expected and supported.`, STYLE_COLORS[data.primaryStyle], C.blueSoft);

  y = textCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "Prince Parenting Mentorship Note",
    "Your greatest gift is believing in your child's potential before they believe in themselves. The refinement: ensure they feel loved during the climb, not only celebrated at the summit. Ask weekly - 'Are we building something you want, or something I want for you?'",
    C.blueSoft, STYLE_COLORS.Prince);

  y = splitPanel(
    doc, MARGIN.left + 10, y, CONTENT_W - 20,
    "Parenting Advantages",
    [
      "Accelerated skill development through deliberate practice.",
      "Strong goal orientation transferred to academics and activities.",
      "Child feels backed by a parent who actively removes obstacles.",
    ],
    "Potential Blind Spots",
    [
      "Child may pursue goals to please you rather than from internal passion.",
      "Rest and play can be undervalued in favor of productive time.",
      "Setbacks may feel like failures rather than learning data.",
    ],
    C.success, C.warning, C.successSoft, C.warningSoft
  );

  y = bulletCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "Impact on Your Child", [
    "Short-term: higher engagement in structured activities and measurable targets.",
    "Mid-term: improved performance when support matches the child's natural strengths.",
    "Long-term: strong achievement orientation - if balanced with autonomy, produces confident self-starters.",
  ], C.white, STYLE_COLORS.Prince);

  textCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "Long-Term Effect Forecast",
    "If maintained without balance, your child may excel externally while feeling internally measured. If refined with emotional space, this style produces leaders who combine ambition with self-awareness.",
    C.navySoft, C.gold, true);
}

function page6Secondary(doc: Doc, data: LitmusAssessmentData): void {
  let y = sectionTitle(doc, `Secondary Style Deep Dive - ${data.secondaryStyle}`, MARGIN.top + 4);

  y = textCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "",
    `Your ${data.secondaryStyle} score (${data.scores[data.secondaryStyle]}/${data.maxStyleScore}) activates when ${data.primaryStyle}'s growth plans need enforcement. You step in with decisions, rules, and non-negotiables. This secondary style gives your parenting backbone - but can override collaboration when stakes feel high.`,
    C.dangerSoft, STYLE_COLORS.King);

  y = textCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "King-Prince Synergy Guidance",
    "Use King energy for boundaries and deadlines - not for every daily choice. When your child proposes an alternative plan, resist the urge to override immediately. A powerful phrase: 'Convince me.' This keeps standards high while building their reasoning muscle.",
    C.dangerSoft, STYLE_COLORS.King);

  y = splitPanel(
    doc, MARGIN.left + 10, y, CONTENT_W - 20,
    "How It Complements Prince",
    [
      "Turns vision into rules - practice schedules, study hours, commitments stick.",
      "Prevents drift when motivation drops.",
      "Creates household clarity about expectations.",
    ],
    "Risks When Combined",
    [
      "Child may hear 'my way' more than 'let's figure this out.'",
      "Questions can be interpreted as resistance rather than curiosity.",
      "Emotional needs may wait until performance goals are met.",
    ],
    STYLE_COLORS.King, C.danger, C.blueSoft, C.dangerSoft
  );

  y = bulletCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "Impact on Communication", [
    "Strength: clear, efficient directives during busy or stressful periods.",
    "Gap: fewer open-ended conversations that build independent reasoning.",
    "Adjustment: after giving direction, ask 'What part of this plan would you change?'",
  ], C.white, C.teal);

  insightCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "Decision-Making Interaction",
    "Prince chooses the destination; King builds the road. Together they move fast - but your child needs rest stops where their preferences reshape the route. Without this, compliance replaces conviction.", STYLE_COLORS.King, C.dangerSoft);
}

function page7ChildExperience(doc: Doc, data: LitmusAssessmentData): void {
  let y = sectionTitle(doc, "Child Experience Report", MARGIN.top + 4);
  y = textCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "",
    "Based on your score pattern, here is how your child likely experiences daily parenting:",
    C.tealSoft, C.teal);

  const areas: [string, string, string][] = [
    ["Discipline", "Structured and outcome-linked. Rules exist to protect progress. May feel firm during setbacks.", C.blue],
    ["Communication", "Efficient and goal-oriented. Deep emotional talks may happen less unless scheduled.", C.teal],
    ["Support", "Strong practical support - resources, planning, problem-solving. Emotional mirroring may be lighter.", C.sage],
    ["Freedom", "Freedom within defined lanes. Exploration is welcomed when it aligns with growth plans.", C.gold],
    ["Expectations", "High and visible. Your child knows what 'good' looks like and works to match it.", C.coral],
    ["Motivation", "Driven by achievement, approval, and forward momentum. May struggle when results are slow.", STYLE_COLORS.Prince],
    ["Recognition", "Praise often follows performance. Effort-based recognition will land more deeply.", C.purple],
    ["Feedback", "Direct and improvement-focused. Softer delivery helps sensitive moments land better.", STYLE_COLORS.King],
  ];

  const cw = (CONTENT_W - 30) / 2;
  let rowY = y;
  for (let row = 0; row < 4; row++) {
    let rowH = 0;
    for (let col = 0; col < 2; col++) {
      const i = row * 2 + col;
      const tileH = experienceTile(doc, MARGIN.left + 10 + col * (cw + 10), rowY, cw, areas[i][0], areas[i][1], areas[i][2]);
      rowH = Math.max(rowH, tileH);
    }
    rowY += rowH;
  }

  textCard(doc, MARGIN.left + 10, rowY + SP.sm, CONTENT_W - 20, "Child Experience Summary",
    "Your child likely feels deeply supported in achievement but may hesitate to share struggles that could disappoint you. Create explicit permission for honesty: 'I want to hear hard things too - that is how we grow together.' This single shift can transform how safe they feel in your presence.",
    C.tealSoft, C.teal);
}

function page8Emotional(doc: Doc, data: LitmusAssessmentData): void {
  let y = sectionTitle(doc, "Emotional Impact Report", MARGIN.top + 4, "How your parenting shapes your child's inner world");

  const impacts: [string, string][] = [
    ["Confidence", "Builds when wins are visible. Fragile when effort doesn't produce quick results."],
    ["Self-Esteem", "Tied to achievement signals. Needs unconditional affirmation separate from outcomes."],
    ["Resilience", "Developing - your structure helps recovery, but fear of disappointing you may linger."],
    ["Emotional Security", "Moderate - practical reliability is strong; emotional predictability can improve."],
    ["Independence", "Functional independence rises; emotional self-direction needs more space."],
    ["Decision-Making", "Capable within your framework. Hesitates when choices conflict with your vision."],
  ];

  const accents = [C.blue, C.coral, C.teal, C.purple, C.gold, C.sage];
  const cw = (CONTENT_W - 36) / 3;
  let gridY = y;
  for (let row = 0; row < 2; row++) {
    let rowH = 0;
    for (let col = 0; col < 3; col++) {
      const i = row * 3 + col;
      const x = MARGIN.left + 10 + col * (cw + 8);
      doc.font("Helvetica").fontSize(8);
      const descH = doc.heightOfString(impacts[i][1], { width: cw - 20, lineGap: 1.5 });
      const cardH = Math.max(96, descH + 40);
      rowH = Math.max(rowH, cardH + SP.sm);
      drawCard(doc, x, gridY, cw, cardH, { fill: C.white });
      doc.roundedRect(x, gridY, cw, 24, 6).fill(accents[i]);
      doc.font("Helvetica-Bold").fontSize(9).fillColor(C.white);
      doc.text(impacts[i][0], x + 10, gridY + 7, { width: cw - 20 });
      doc.font("Helvetica").fontSize(8).fillColor(C.text);
      doc.text(impacts[i][1], x + 10, gridY + 34, { width: cw - 20, lineGap: 1.5 });
    }
    gridY += rowH;
  }
  y = gridY + SP.sm;

  y = bulletCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "What To Improve vs. Maintain", [
    "Maintain: consistent investment and belief in your child's capability.",
    "Improve: separate 'I love you' from 'I'm proud of your results' - say both, at different times.",
    "Stop: rescuing too quickly before they struggle - let manageable difficulty build emotional muscle.",
  ], C.warm, C.gold);

  textCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "Emotional Mentorship Guidance",
    "Children with Prince-King parents often develop strong outer confidence before inner confidence. Your role as emotional mentor is to name feelings without fixing them immediately. Try: 'That sounds frustrating - tell me more before we solve it.' Over time, this builds emotional literacy that matches their achievement drive.",
    C.purpleSoft, C.purple);
}

function page9Academic(doc: Doc, data: LitmusAssessmentData): void {
  let y = sectionTitle(doc, "Academic Impact Report", MARGIN.top + 4, "How your parenting influences school performance");

  const items: [string, string][] = [
    ["Learning", "Strong when goals are clear. Your child engages with structured subjects and measurable progress."],
    ["Discipline", "Study routines likely exist. Risk: rigidity during creative or open-ended assignments."],
    ["Homework", "Completion is expected. Quality improves when you review process, not only correctness."],
    ["Motivation", "High when linked to future outcomes. Drops when tasks feel disconnected from purpose."],
    ["Goal Setting", "Natural strength - your child likely thinks in targets. Help them set their own, not only yours."],
    ["Exam Readiness", "Preparation-oriented. Manage anxiety by normalizing 'unprepared moments' as data."],
    ["Performance", "Above average potential when support matches strengths. Watch for burnout in peak seasons."],
  ];

  items.forEach(([title, desc], i) => {
    y = academicRow(doc, MARGIN.left + 10, y, CONTENT_W - 20, title, desc, STYLE_COLORS[data.primaryStyle], i % 2 === 0);
  });
  y += SP.sm;

  insightCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "Academic Action Priority",
    "Shift weekly check-ins from 'What marks did you get?' to 'What did you learn that surprised you?' This preserves your high standards while building intrinsic curiosity.", C.gold, C.goldSoft);
}

function page10Communication(doc: Doc, data: LitmusAssessmentData): void {
  let y = sectionTitle(doc, "Communication Profile", MARGIN.top + 4);

  y = textCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "",
    "Your communication runs through a results lens - efficient, directive, and solution-forward. This works during deadlines; it narrows connection during emotional moments.",
    C.blueSoft, C.blue);

  y = splitPanel(
    doc, MARGIN.left + 10, y, CONTENT_W - 20,
    "Communication Strengths",
    ["Clarity - your child always knows the priority.", "Decisiveness reduces paralysis.", "Honest feedback accelerates improvement."],
    "Communication Gaps",
    ["Feelings may be rushed past.", "Child may share less to avoid debate.", "Listening can become waiting-to-respond."],
    C.sage, C.coral, C.sageSoft, C.coralSoft
  );

  y = bulletCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "Conflict & Listening Patterns", [
    "Conflict pattern: issue identified → solution proposed → execution expected.",
    "Listening pattern: strong when gathering facts; weaker when emotions are the message.",
    "Improvement: use the 3-step loop - Reflect feeling → Ask one question → Co-create next step.",
  ], C.white, C.teal);

  y = textCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "Communication Mentorship",
    "Strong communicators adapt their tone to the moment. During emotional conversations, slow your pace by 30%. During planning conversations, your natural directness is an asset. Teach your child this distinction - they will mirror how you switch between coach and commander.",
    C.sageSoft, C.sage);

  conversationShift(doc, MARGIN.left + 10, y, CONTENT_W - 20);
}

function page11BlindSpots(doc: Doc, data: LitmusAssessmentData): void {
  let y = sectionTitle(doc, "Parenting Blind Spots", MARGIN.top + 4, "Areas requiring awareness and balance");

  doc.save();
  doc.roundedRect(MARGIN.left + 10, y, CONTENT_W - 20, 20, 4).fill(C.danger);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(C.white);
  doc.text("AREAS REQUIRING IMMEDIATE AWARENESS", MARGIN.left + 20, y + 6);
  doc.restore();
  y += 28;

  const spots: [string, string, string][] = [
    ["Top Risk", "Over-investment pressure - your child may feel their worth is tied to continuous improvement.", C.danger],
    ["Unintended Consequence", "They comply outwardly while hiding doubts, mistakes, or changing interests.", C.warning],
    ["Overused Strength", "Direction. Not every moment needs a plan - some moments need presence.", C.gold],
    ["Hidden Weakness", "Low Servant expression (9/30) - emotional nurturing may be under-scheduled.", C.purple],
    ["Balance Needed", "Add Elder-style reflection: pause, ask, and let wisdom emerge from the child.", C.teal],
  ];

  spots.forEach(([title, desc, accent], i) => {
    y = numberedItem(doc, i + 1, MARGIN.left + 10, y, CONTENT_W - 20, title, desc, accent);
  });

  bulletCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "Corrective Action", [
    "Weekly 15-minute 'no agenda' conversation - no advice, only listening.",
    "Replace one directive per day with a question: 'What do you think we should do?'",
  ], C.successSoft, C.success);
}

function page12Balance(doc: Doc, data: LitmusAssessmentData): void {
  let y = sectionTitle(doc, "The Ideal Balance Model", MARGIN.top + 4);

  y = textCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "",
    "Effective parents flex between all five styles. Your current profile is Prince-dominant with King support. The goal is strategic balance - not equal scores.",
    C.tealSoft, C.teal);

  const styles: [string, string, string][] = [
    ["King", "Use when safety, deadlines, or non-negotiable boundaries are required.", "Bedtime on school nights; safety rules; exam week structure."],
    ["Servant", "Use when your child needs emotional validation before problem-solving.", "After a bad day; friendship hurt; performance disappointment."],
    ["Elder", "Use when decisions carry long-term weight and need thoughtful dialogue.", "Subject selection; activity commitment; major purchases."],
    ["Prince", "Use when talent emerges and structured growth will accelerate it.", "Skill building; competition prep; portfolio development."],
    ["Joker", "Use when stress is high and connection needs lightness to restore trust.", "Study breaks; family meals; tension after conflict."],
  ];

  styles.forEach(([style, when, scenario]) => {
    y = balanceRow(doc, MARGIN.left + 10, y, CONTENT_W - 20, style, when, scenario, STYLE_COLORS[style]);
  });

  textCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "Balance Mentorship Guidance",
    "Think of the five styles as tools in a toolkit - not personality labels. Your child benefits most when you consciously choose the right tool for the moment. Start each week by asking: 'Where did I overuse Prince this week? Where could I have used more Servant?' This reflection accelerates balance faster than any score change.",
    C.goldSoft, C.gold);
}

function page13Scenarios(doc: Doc, data: LitmusAssessmentData): void {
  let y = sectionTitle(doc, "Real-Life Parenting Scenarios", MARGIN.top + 4, "Recommended responses for common family situations");

  y = textCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "",
    "These scenarios translate your Prince-King profile into practical responses. The goal is not perfect reactions - but intentional ones. Before each situation, pause and ask: 'Which style does my child need right now - structure, empathy, wisdom, investment, or lightness?'",
    C.warm, C.blue);

  const scenarios: [string, string][] = [
    ["Academic Struggles", "Ask what feels confusing before offering solutions. Co-build a 2-week recovery plan with one small daily win."],
    ["Career Decisions", "Share your perspective as Elder wisdom, not King decree. Require a research task before final family decision."],
    ["Friendship Conflicts", "Lead with Servant empathy. Help them name feelings before strategizing responses."],
    ["Screen Time", "Set King boundaries on hours; use Joker for earned leisure. Explain the 'why' behind limits."],
    ["Discipline", "Correct behavior, not identity. End with a Prince forward-look: 'Tomorrow we try again differently.'"],
    ["Motivation Drop", "Pause the push. Use one Joker activity to reconnect, then revisit goals together."],
  ];

  const cw = (CONTENT_W - 30) / 2;
  const accents = [C.blue, C.purple, C.coral, STYLE_COLORS.King, STYLE_COLORS.Prince, C.gold];
  let scenY = y + SP.sm;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      const i = row * 2 + col;
      scenarioCard(doc, MARGIN.left + 10 + col * (cw + 10), scenY + row * 94, cw, i + 1, scenarios[i][0], scenarios[i][1], accents[i]);
    }
  }
}

function page14Roadmap(doc: Doc, data: LitmusAssessmentData): void {
  let y = sectionTitle(doc, "Child Development Roadmap", MARGIN.top + 4, "Current impact through expected outcomes");

  const sections: [string, string, string][] = [
    ["Current Impact", "Ambitious, directed, resource-supported child who thrives with structure but may under-share struggles.", C.blue],
    ["Future Impact", "With balance: self-driven achiever with emotional intelligence. Without: high performer with hidden stress.", C.teal],
    ["Development Priorities", "Emotional expression, autonomous goal-setting, stress recovery skills.", C.gold],
    ["Parenting Goals", "Increase Servant and Elder moments by 30%. Reduce unsolicited directives by half.", C.coral],
    ["Expected Outcomes", "Stronger trust, more honest communication, sustained performance without burnout.", C.sage],
  ];

  sections.forEach(([title, desc, accent], i) => {
    y = timelineRow(doc, MARGIN.left + 10, y, CONTENT_W - 20, title, desc, accent, i === sections.length - 1);
  });

  textCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "Roadmap Mentorship Note",
    "Development is not linear - expect setbacks in weeks where stress is high. Your Prince instinct will push for rapid correction; your growth edge is to stay patient through plateaus. Review this roadmap monthly with your child and let them mark what feels true from their perspective.",
    C.sageSoft, C.sage);
}

function page15Plan90(doc: Doc, data: LitmusAssessmentData): void {
  let y = sectionTitle(doc, "90 Days Development Plan", MARGIN.top + 4, "A structured 12-week transformation for Prince-King parents");

  y = textCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "",
    "One unified plan across three months - no separate 30-day or 60-day tracks. Month 1 builds foundation, Month 2 deepens collaboration, Month 3 locks in sustainable balance across all five parenting styles.",
    C.goldSoft, C.gold);

  y = monthPlanBlock(doc, MARGIN.left + 10, y, CONTENT_W - 20,
    "Month 1 · Weeks 1-4  (Foundation Phase)",
    [
      "Establish emotional check-in ritual and daily connection habits.",
      "Introduce child-led decisions twice weekly.",
      "Track one Servant moment daily; build Prince-King awareness.",
      "Create emotional safety before pushing for performance.",
    ],
    [
      "Week 1: 5-minute feeling check-in after school; journal one parenting moment nightly.",
      "Week 2: Replace 3 directives with questions; one praise for effort, not outcome; pause 3 seconds before advice.",
      "Week 3: Child chooses one weekend activity; practice Elder-style open dialogue.",
      "Week 4: Family meeting - review wins and worries; reflect 'Where did I direct vs. listen?'; adjust one rule together.",
    ],
    "Conversation framework - Open: 'What was the best and hardest part of today?' Explore: 'What would help tomorrow feel easier?' Close: 'What do you want me to do differently?' Lead with listening before advising.",
    "You are learning to coach, not command. Expected by end of Month 1: more open sharing, fewer power struggles, your child begins to volunteer thoughts before you ask.",
    C.teal, C.tealSoft);

  monthPlanBlock(doc, MARGIN.left + 10, y, CONTENT_W - 20,
    "Month 2 · Weeks 5-8  (Deepening Phase)",
    [
      "Build collaborative decision-making habits.",
      "Strengthen trust through consistent follow-through.",
      "Develop child's self-evaluation skills.",
      "Integrate Servant and Elder styles deliberately.",
    ],
    [
      "Week 5: Co-create study or activity plan - child presents a written proposal; practice Elder dialogues on medium-stakes choices.",
      "Week 6: Record talk-to-listen ratio in 3 conversations weekly; aim for 40% listening.",
      "Week 7: Monthly adventure day planned 50% by your child - no performance agenda.",
      "Week 8: Child presents a decision proposal to the family - you respond with questions, not verdicts.",
    ],
    "Shift from Director to Guide. Offer wisdom as Elder, not decree as King. When you disagree, say: 'Help me understand your reasoning' before sharing your view.",
    "Respond with curiosity: 'What would success look like to you?' Expected by end of Month 2: your child initiates problem-solving conversations; academic routines feel shared, not imposed.",
    C.blue, C.blueSoft);
}

function page16Plan90Continued(doc: Doc, data: LitmusAssessmentData): void {
  let y = sectionTitle(doc, "90 Days Development Plan", MARGIN.top + 4, "Month 3 · Weeks 9-12");

  y = monthPlanBlock(doc, MARGIN.left + 10, y, CONTENT_W - 20,
    "Month 3 · Weeks 9-12  (Transformation Phase)",
    [
      "Achieve sustainable balance across all five parenting styles.",
      "Build a family culture of growth combined with emotional safety.",
      "Transition to child-owned goals with you as coach and resource partner.",
    ],
    [
      "Week 9: Monthly development review co-led by your child - they set the agenda.",
      "Week 10: Quarterly skill showcase - your child teaches the family something they learned.",
      "Week 11: Map a 12-month growth plan with 3 milestones your child chooses.",
      "Week 12: Full family reflection - celebrate progress; name one habit to carry forward.",
    ],
    "Fund Prince opportunities your child selects, not only those you prefer. Protect space for Joker moments - laughter rebuilds trust faster than any lecture.",
    "Your identity evolves from Architect to Mentor. End week 12 by asking: 'What kind of parent do you need me to be next year?' A child who pursues excellence without fear of disappointing you.",
    C.gold, C.goldSoft);

  insightCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "90-Day Transformation Outcomes",
    "A child who pursues excellence without fear of disappointing you. Family decisions feel collaborative rather than imposed. Your parenting identity expands from architect to mentor - Prince-King strengths balanced by Servant warmth and Elder wisdom.",
    C.success, C.successSoft);
}

function page17Blueprint(doc: Doc, data: LitmusAssessmentData): void {
  let y = sectionTitle(doc, "Parenting Success Blueprint", MARGIN.top + 4);

  y = splitPanel(
    doc, MARGIN.left + 10, y, CONTENT_W - 20,
    "Habits To Continue",
    ["Investing in skill development.", "Setting clear standards.", "Showing belief in their potential."],
    "Habits To Improve",
    ["Listening before advising.", "Praising effort independently.", "Inviting child input earlier."],
    C.success, C.gold, C.successSoft, C.goldSoft
  );

  y = bulletCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "Habits To Avoid", [
    "Rescuing before they attempt.",
    "Comparing to siblings or peers during conflict.",
    "Turning every mistake into a performance review.",
  ], C.dangerSoft, C.danger);

  textCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, "Long-Term Parenting Strategy",
    "Evolve from Director to Coach over 12 months. Keep Prince investment and King clarity, but make Servant warmth and Elder wisdom equal partners in daily parenting.",
    C.navySoft, C.gold, true);
}

function page18Final(doc: Doc, data: LitmusAssessmentData): void {
  doc.rect(0, 0, PAGE.w, 100).fill(C.navyDeep);
  doc.rect(0, 0, PAGE.w, 4).fill(C.gold);
  doc.font("Helvetica-Bold").fontSize(20).fillColor(C.white);
  doc.text("Final Parenting Summary", MARGIN.left + 10, 40);
  doc.font("Helvetica").fontSize(8).fillColor(C.goldSoft);
  doc.text("Your parenting identity, priorities, and path forward", MARGIN.left + 10, 68);

  let y = 112;
  const items: [string, string, string][] = [
    ["Parenting Identity", "Development Architect - Prince primary with King enforcement", C.blue],
    ["Greatest Strength", "You build pathways for your child's success with conviction and resources", C.sage],
    ["Greatest Opportunity", "Deepen emotional partnership - let your child co-own their growth journey", C.coral],
    ["90-Day Goal", "Achieve balanced flex across all five styles with measurable trust gains", C.gold],
  ];

  const hw = (CONTENT_W - 30) / 2;
  items.forEach(([label, value, accent], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MARGIN.left + 10 + col * (hw + 10);
    const cy = y + row * 62;
    drawCard(doc, x, cy, hw, 52);
    doc.roundedRect(x, cy, hw, 3, 1).fill(accent);
    doc.font("Helvetica").fontSize(7).fillColor(C.textMuted);
    doc.text(label.toUpperCase(), x + 12, cy + 10);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(C.navy);
    doc.text(value, x + 12, cy + 26, { width: hw - 24, lineGap: 1.2 });
  });
  y += 136 + SP.md;

  drawCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, 64, { fill: C.goldSoft });
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(C.navy);
  doc.text("Final Recommendation", MARGIN.left + 22, y + 12);
  doc.font("Helvetica").fontSize(8.5).fillColor(C.text);
  doc.text(
    "Your parenting produces momentum. The next level is partnership - where your child feels both challenged and emotionally safe. Start tomorrow with one question before one instruction.",
    MARGIN.left + 22, y + 28, { width: CONTENT_W - 44, lineGap: 2 }
  );
  y += 74 + SP.lg;

  drawCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, 72, { fill: C.navySoft, border: C.navySoft });
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(C.gold);
  doc.text("Professional Closing", MARGIN.left + 22, y + 12);
  doc.font("Helvetica").fontSize(8.5).fillColor(C.white);
  doc.text(
    "This Parenting DNA Report is a confidential development document prepared from your Litmus Test assessment. It is designed for personal family growth - not diagnosis. Revisit quarterly to measure progress.",
    MARGIN.left + 22, y + 28, { width: CONTENT_W - 44, lineGap: 2 }
  );
  y += 82 + SP.lg;

  const nextStepsItems = [
    "Begin the 90-day development plan this week.",
    "Share relevant sections with your parenting partner.",
    "Schedule a 90-day reassessment to track style balance shifts.",
  ];
  doc.font("Helvetica").fontSize(8.5);
  const bulletsH = measureBullets(doc, nextStepsItems, CONTENT_W - 44);
  const nextH = Math.max(88, bulletsH + 44);

  drawCard(doc, MARGIN.left + 10, y, CONTENT_W - 20, nextH, { fill: C.white });
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.navy);
  doc.text("Next Steps", MARGIN.left + 22, y + 14);
  bullets(doc, nextStepsItems, MARGIN.left + 22, y + 34, CONTENT_W - 44, 8.5, C.teal);

  drawFooter(doc, 18);
}

function generateLitmusContentPdf(data: LitmusAssessmentData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pages = [
      page2Executive, page3Dna, page4Dashboard, page5Primary, page6Secondary,
      page7ChildExperience, page8Emotional, page9Academic, page10Communication,
      page11BlindSpots, page12Balance, page13Scenarios, page14Roadmap,
      page15Plan90, page16Plan90Continued, page17Blueprint,
      page18Final,
    ];
    pages.forEach((fn, i) => {
      newPage(doc, i + 2, C.warm, { skipAddPage: i === 0 });
      fn(doc, data);
    });

    doc.end();
  });
}

export async function generateLitmusReportPdf(data: LitmusAssessmentData): Promise<Buffer> {
  const contentBuffer = await generateLitmusContentPdf(data);
  return mergeLitmusReportPdf(data, contentBuffer);
}
