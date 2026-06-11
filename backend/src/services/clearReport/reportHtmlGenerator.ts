import { REPORT_BULLET_CSS, renderReportBullets } from "../reportBullets";
import { buildBackCoverPage, buildCoverPage } from "./coverPages";
import { buildJohariSvg } from "./johariSvg";
import type { ClearAssessmentData, ClearPlanMonth } from "./types";

const bullets = (items: string[], color = "#2563EB") =>
  renderReportBullets(items, {
    color: "#334155",
    bulletColor: color,
    className: "report-bullets--clear",
    fontSize: "12px",
    lineHeight: 1.6,
  });

const pageHeader = (num: number, title: string, subtitle?: string) => `
  <div class="ph">
    <span class="ph-num">${String(num).padStart(2, "0")}</span>
    <div class="ph-text"><h2>${title}</h2>${subtitle ? `<p class="ph-sub">${subtitle}</p>` : ""}</div>
  </div><div class="ph-rule"></div>`;

const pageFooter = `<div class="pf">CLEAR Assessment</div>`;

const card = (title: string, content: string, accent = "#2563EB") =>
  `<div class="card" style="border-left-color:${accent}"><h3>${title}</h3>${content}</div>`;

const sub = (title: string, content: string) =>
  `<div class="sub"><p class="lbl">${title}</p>${content}</div>`;

const kpi = (label: string, value: string, accent: string) =>
  `<div class="kpi"><p class="kpi-l">${label}</p><p class="kpi-v">${value}</p><div class="kpi-bar" style="background:${accent}"></div></div>`;

const zoneBar = (value: number, color: string) =>
  `<div class="prog"><div class="prog-track"><div class="prog-fill" style="width:${value}%;background:${color}"></div></div></div>`;

const monthPlanHtml = (month: ClearPlanMonth, accent = "#2563EB") => `
  <div class="plan" style="border-top-color:${accent}">
    <div class="plan-head" style="background:linear-gradient(135deg,${accent}14,#F8FAFC)"><span class="plan-label" style="color:${accent}">${month.label}</span><h4>${month.theme}</h4><p class="plan-range">${month.weekRange}</p></div>
    <div class="plan-goals"><p class="lbl">Monthly Goals</p>${bullets(month.goals)}</div>
    <div class="week-grid">${month.weeks.map((w) => `
      <div class="week" style="border-left-color:${accent}"><div class="week-h"><span class="week-badge" style="background:${accent}">Week ${w.week}</span><strong>${w.focus}</strong></div>
      ${bullets(w.tasks, "#7C3AED")}<p class="week-g"><strong>Guidance:</strong> ${w.guidance}</p></div>`).join("")}
    </div>
    <div class="plan-foot">
      <div class="plan-mentor" style="border-top-color:${accent}">
        <div class="plan-mentor-head" style="background:linear-gradient(135deg,${accent}18,#F8FAFC)">
          <span class="mentor-badge" style="background:${accent}">Mentorship</span>
        </div>
        <div class="mentor-sessions">${month.mentorship.map((s, i) => `
          <div class="mentor-session" style="border-left-color:${accent}">
            <span class="mentor-num" style="background:${accent}">${i + 1}</span>
            <p class="prose">${s}</p>
          </div>`).join("")}
        </div>
      </div>
      <div class="plan-box plan-out" style="border-left-color:${accent}"><p class="lbl">Expected Outcome</p><p class="prose">${month.expectedOutcome}</p></div>
    </div>
  </div>`;

export function generateReportHTML(d: ClearAssessmentData): string {
  const johariSvg = () => buildJohariSvg(d, "hero");
  const styles = `
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',system-ui,sans-serif;color:#0F172A;background:#F8FAFC;font-size:12px;line-height:1.65}
    .page{page-break-after:always;padding:28px 32px;height:100vh;max-height:100vh;min-height:100vh;background:#fff;display:flex;flex-direction:column;overflow:hidden}
    .page:last-child{page-break-after:auto}
    .cover-template-page{padding:0!important;overflow:hidden;position:relative;background:#0f172a}
    .ph{display:flex;align-items:flex-start;gap:14px;margin-bottom:10px}
    .ph-num{font-size:28px;font-weight:800;color:#0F172A;line-height:1;width:40px}
    .ph h2{font-size:22px;font-weight:800;letter-spacing:-0.02em;color:#0F172A}
    .ph-sub{font-size:11px;color:#64748B;margin-top:3px}
    .ph-rule{height:2px;background:linear-gradient(90deg,#2563EB 0%,#2563EB 60px,#E2E8F0 60px);margin-bottom:16px}
    .pf{margin-top:auto;flex-shrink:0;padding-top:10px;border-top:1px solid #E2E8F0;text-align:right;font-size:8px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#64748B}
    .body{flex:1}
    .body-fill{flex:1;display:flex;flex-direction:column;gap:10px}
    .sub{margin-top:8px}
    .sub:first-child{margin-top:0}
    .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
    .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
    .gap{margin-top:10px}
    .card{background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:12px 14px;border-left:3px solid #2563EB;box-shadow:0 1px 3px rgba(15,23,42,0.05)}
    .card h3{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#64748B;margin-bottom:8px}
    .prose{font-size:12px;line-height:1.7;color:#334155}
    .lbl{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#64748B;margin-bottom:6px}
    ${REPORT_BULLET_CSS}
    .parent-compact .report-bullets--clear{font-size:10px;line-height:1.45}
    .parent-compact .report-bullets--clear > li{margin-bottom:3px}
    .kpi{background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:10px 12px;position:relative;overflow:hidden}
    .kpi-l{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748B}
    .kpi-v{font-size:22px;font-weight:800;margin-top:4px;color:#0F172A}
    .kpi-bar{position:absolute;bottom:0;left:0;right:0;height:3px}
    .prog{margin-bottom:8px}
    .prog-top{display:flex;justify-content:space-between;font-size:10px;margin-bottom:3px}
    .prog-track{height:5px;background:#F1F5F9;border-radius:3px;overflow:hidden}
    .prog-fill{height:100%;border-radius:3px}
    .insight{background:#F8FAFC;border:1px solid #E2E8F0;border-left:3px solid #2563EB;border-radius:0 10px 10px 0;padding:12px 14px}
    .split{display:grid;grid-template-columns:1fr 1px 1fr;border:1px solid #E2E8F0;border-radius:10px;overflow:hidden}
    .split-h{padding:12px 14px;border-top:3px solid}
    .split-h h4{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px}
    .split-d{background:#E2E8F0}
    .narr{background:#F8FAFC;border:1px solid #E2E8F0;border-left:3px solid #2563EB;border-radius:10px;padding:12px 14px}
    .narr h3{font-size:11px;font-weight:700;margin-bottom:6px;color:#0F172A}
    .challenge{background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:12px;margin-bottom:8px}
    .challenge-h{display:flex;align-items:center;gap:10px;margin-bottom:8px}
    .challenge-n{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;flex-shrink:0;background:#0F172A}
    .challenge-h h3{font-size:12px;font-weight:700}
    .challenge-g{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
    .challenge-c{border-radius:7px;padding:8px;border-left:3px solid}
    .challenge-impact{background:#FEF2F2;border-left-color:#EF4444}
    .challenge-action{background:#EFF6FF;border-left-color:#2563EB}
    .challenge-result{background:#ECFDF5;border-left-color:#10B981}
    .challenge-c label{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94A3B8;display:block;margin-bottom:3px}
    .challenge-c p{font-size:10px;line-height:1.5;color:#334155}
    .cover{background:linear-gradient(145deg,#0F172A,#1E293B,#0F172A);color:#fff;border-radius:14px;padding:32px;min-height:92vh;display:flex;flex-direction:column}
    .cover-tag{font-size:9px;font-weight:700;letter-spacing:0.15em;color:#D4A853;text-transform:uppercase;padding:5px 12px;border:1px solid rgba(212,168,83,0.3);border-radius:20px;background:rgba(212,168,83,0.15);display:inline-block}
    .cover-line{width:50px;height:3px;background:linear-gradient(90deg,#D4A853,#2563EB);border-radius:2px;margin:12px 0}
    .cover h1{font-size:26px;font-weight:800;line-height:1.15;letter-spacing:-0.02em;color:#fff;max-width:480px}
    .cover-sub{font-size:13px;color:#94A3B8;margin-top:8px}
    .cover-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;flex:1}
    .cover-card{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px}
    .cover-lbl{font-size:8px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#D4A853;margin-bottom:10px}
    .cover-field{margin-bottom:10px}
    .cover-field label{font-size:8px;text-transform:uppercase;letter-spacing:0.1em;color:#64748B;display:block}
    .cover-field p{font-size:13px;font-weight:600;color:#F1F5F9;margin-top:2px}
    .cover-kpis{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}
    .cover-kpi{padding:8px;border:1px solid rgba(37,99,235,0.3);border-radius:8px;background:rgba(255,255,255,0.03)}
    .cover-kpi span{font-size:8px;text-transform:uppercase;color:#94A3B8;display:block}
    .cover-kpi strong{font-size:18px;font-weight:800;display:block;margin-top:3px}
    .cover-johari{background:#fff;border-radius:8px;padding:8px}
    .gp-badge{margin-top:12px;display:flex;justify-content:space-between;padding:8px 12px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:8px;font-size:10px;color:#94A3B8}
    .gp-badge strong{font-size:16px;color:#10B981}
    .cover-foot{text-align:center;font-size:9px;color:#475569;margin-top:14px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06)}
    .cover .pf{color:#64748B;border-top-color:rgba(255,255,255,0.1)}
    .johari-lay{display:grid;grid-template-columns:1.4fr 1fr;gap:14px}
    .johari-chart{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px;display:flex;align-items:center;justify-content:center}
    .zone{background:#fff;border:1px solid #E2E8F0;border-left:3px solid;border-radius:8px;padding:8px 10px;margin-bottom:6px}
    .zone-h{display:flex;justify-content:space-between;font-weight:700;font-size:11px;margin-bottom:4px}
    .zone-pct{font-weight:800}
    .workflow{display:flex;gap:0}
    .wf-step{flex:1;text-align:center;position:relative}
    .wf-node{width:24px;height:24px;border-radius:50%;background:#2563EB;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto}
    .wf-label{font-size:9px;margin-top:5px;color:#475569;line-height:1.4}
    .plan{border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;border-top:4px solid #2563EB;box-shadow:0 4px 16px rgba(15,23,42,0.06)}
    .plan-head{padding:12px 14px;border-bottom:1px solid #E2E8F0}
    .plan-label{font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:0.14em}
    .plan-head h4{font-size:15px;font-weight:800;margin-top:3px}
    .plan-range{font-size:10px;color:#64748B;margin-top:2px}
    .plan-goals{padding:10px 14px;border-bottom:1px solid #F1F5F9}
    .week-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px 14px}
    .week{background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:8px 10px;border-left:3px solid #2563EB;box-shadow:0 1px 3px rgba(15,23,42,0.05)}
    .week-h{display:flex;align-items:center;gap:6px;margin-bottom:5px}
    .week-badge{color:#fff;font-size:8px;font-weight:700;padding:2px 6px;border-radius:3px}
    .week-g{margin-top:5px;padding-top:5px;border-top:1px solid #E2E8F0;font-size:9px;color:#64748B;font-style:italic}
    .plan-foot{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px 14px;background:#FAFBFC;border-top:1px solid #E2E8F0}
    .plan-box{background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:10px}
    .plan-mentor{background:#fff;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;border-top:3px solid;box-shadow:0 1px 3px rgba(15,23,42,0.05)}
    .plan-mentor-head{display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid #E2E8F0}
    .mentor-badge{color:#fff;font-size:7px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;padding:3px 7px;border-radius:3px}
    .mentor-title{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748B}
    .mentor-sessions{display:flex;flex-direction:column;gap:5px;padding:8px}
    .mentor-session{display:flex;align-items:flex-start;gap:8px;padding:6px 8px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;border-left:3px solid}
    .mentor-num{width:20px;height:20px;border-radius:5px;color:#fff;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .mentor-session .prose{font-size:10px;flex:1}
    .impact-stack{display:flex;flex-direction:column;gap:10px}
    .vstack{display:flex;flex-direction:column;gap:10px;flex:1}
    .plan-out{border-left:3px solid #10B981}
    .parent-card{background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:12px;border-top:3px solid;margin-bottom:8px}
    .parent-card h4{font-size:11px;font-weight:700;margin-bottom:6px}
    .final-card{background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:12px;border-left:4px solid #2563EB;margin-bottom:8px;box-shadow:0 2px 8px rgba(15,23,42,0.05)}
    .parent-card{background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:12px;border-top:4px solid;margin-bottom:8px;box-shadow:0 2px 8px rgba(15,23,42,0.05)}
    .parent-card h4{font-size:11px;font-weight:700;margin-bottom:6px}
    .parent-compact .parent-card{padding:8px 10px}
    .parent-compact .parent-card h4{font-size:10px;margin-bottom:4px}
    .parent-compact .insight{padding:10px 12px}
    .flow-gap{display:flex;flex-direction:column;gap:12px}
    .final-lbl{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#64748B;margin-bottom:4px}
    .closing{background:#0F172A;border-radius:10px;padding:24px 32px;text-align:center;margin-top:12px}
    .closing p{font-size:12px;line-height:1.75;color:#F1F5F9}
    .closing .sign{margin-top:10px;font-size:9px;color:#64748B}
    .mt-zone{margin-top:8px;padding-top:8px;border-top:1px solid #F1F5F9}
    .johari-svg{width:100%;max-width:100%;height:auto;display:block}
  `;

  const johariZones = [
    { zone: "Open Self", pct: d.johariAreas.open, desc: "What you and others both understand - your foundation of trust and recognition.", color: "#1B7A3D" },
    { zone: "Blind Self", pct: d.johariAreas.blind, desc: "What others see that you don't - your largest growth lever through active feedback.", color: "#C45C00" },
    { zone: "Hidden Self", pct: d.johariAreas.hidden, desc: "What you know but don't share - reducing this unlocks your true potential.", color: "#1A5FA8" },
    { zone: "Unknown Self", pct: d.johariAreas.unknown, desc: "Undiscovered talents - your greatest long-term opportunity.", color: "#6C3483" },
  ];

  const challengeHtml = d.growthChallenges.map((c, i) => `
    <div class="challenge"><div class="challenge-h"><div class="challenge-n">${i + 1}</div><h3>${c.issue}</h3></div>
      <div class="challenge-g">
        <div class="challenge-c challenge-impact"><label>Impact</label><p>${c.impact}</p></div>
        <div class="challenge-c challenge-action"><label>Recommended Action</label><p>${c.action}</p></div>
        <div class="challenge-c challenge-result"><label>Expected Result</label><p>${c.result}</p></div>
      </div></div>`).join("");

  const workflowHtml = (steps: string[]) =>
    `<div class="workflow">${steps.map((s, i) => `<div class="wf-step"><div class="wf-node">${i + 1}</div><p class="wf-label">${s}</p></div>`).join("")}</div>`;

  const contentPages = [
    `<div class="page">${pageHeader(2, "Executive Summary", "Your personal impact at a glance")}
      <div class="body body-fill">
        <div class="grid-4">${kpi("Feedback Seeking", `${d.scores.feedbackSeeking}/50`, "#2563EB")}${kpi("Self Disclosure", `${d.scores.selfDisclosure}/50`, "#7C3AED")}${kpi("Johari Position", `(${d.scores.johariPosition.x}, ${d.scores.johariPosition.y})`, "#8B5CF6")}${kpi("Growth Potential", d.indices.growthPotential, "#10B981")}</div>
        ${card("Assessment Context", `<div class="grid-2">${sub("Current Johari Position", `<p class="prose">${d.indices.currentJohariPosition}</p>`)}${sub("Questions Answered", `<p class="prose">${d.assessment.questionsAnswered}</p>`)}${sub("Submitted", `<p class="prose">${d.assessment.submittedAt}</p>`)}${sub("Zone Breakdown", `<p class="prose">Open ${d.johariAreas.open}% · Blind ${d.johariAreas.blind}% · Hidden ${d.johariAreas.hidden}% · Unknown ${d.johariAreas.unknown}%</p>`)}</div>`, "#8B5CF6")}
        ${card("Personal Impact Summary", `<p class="prose">${d.executiveSummary.personalImpactSummary}</p>`, "#0F172A")}
        <div class="grid-2">${card("Top Strengths", bullets(d.executiveSummary.topStrengths, "#10B981"), "#10B981")}${card("Development Areas", bullets(d.executiveSummary.developmentAreas, "#F59E0B"), "#F59E0B")}</div>
        <div class="insight" style="border-left-color:#2563EB"><p class="lbl">Key Takeaways</p>${bullets(d.executiveSummary.keyTakeaways)}</div>
      </div>${pageFooter}</div>`,

    `<div class="page">${pageHeader(3, "Your Self-Awareness Profile", "How you understand and express yourself")}
      <div class="body body-fill">
        <div class="grid-2">
          <div class="narr"><h3>How You Understand Yourself</h3><p class="prose">${d.selfAwarenessProfile.selfUnderstanding}</p></div>
          <div class="narr"><h3>How Openly You Communicate</h3><p class="prose">${d.selfAwarenessProfile.communicationOpenness}</p></div>
          <div class="narr"><h3>How You Receive Feedback</h3><p class="prose">${d.selfAwarenessProfile.feedbackReception}</p></div>
          <div class="narr"><h3>How Others May Experience You</h3><p class="prose">${d.selfAwarenessProfile.othersExperience}</p></div>
        </div>
        <div class="grid-3 gap">${card("Strengths", bullets(d.selfAwarenessProfile.strengths, "#10B981"), "#10B981")}${card("Growth Areas", bullets(d.selfAwarenessProfile.growthAreas, "#F59E0B"), "#F59E0B")}${card("Key Insights", bullets(d.selfAwarenessProfile.keyInsights), "#2563EB")}</div>
      </div>${pageFooter}</div>`,

    `<div class="page">${pageHeader(4, "Johari Window Analysis", "Where you are known, hidden, and undiscovered")}
      <div class="body"><div class="johari-lay">
        <div class="johari-chart">${johariSvg()}</div>
        <div>${johariZones.map((z) => `
          <div class="zone" style="border-left-color:${z.color}"><div class="zone-h"><span>${z.zone}</span><span class="zone-pct" style="color:${z.color}">${z.pct}%</span></div>
          ${zoneBar(z.pct, z.color)}<p class="prose" style="font-size:10px;margin-top:4px">${z.desc}</p></div>`).join("")}
        </div>
      </div></div>${pageFooter}</div>`,

    `<div class="page">${pageHeader(5, "Growth Zones Analysis", "Open, blind, hidden, and unknown potential")}
      <div class="body body-fill"><div class="vstack">
        ${card("Open Self - What Is Working", bullets([...d.openSelf.visibleStrengths, ...d.openSelf.workingWell.slice(0, 2)], "#10B981") + `<p class="prose mt-zone">${d.openSelf.leadershipPotential}</p>`, "#1B7A3D")}
        ${card("Blind Self - What Others See", bullets(d.blindSpot.unnoticedBehaviors.slice(0, 4), "#EF4444") + `<p class="prose mt-zone">${d.blindSpot.othersPerception}</p>`, "#C45C00")}
        ${card("Hidden Self - Unexpressed Strengths", bullets(d.hiddenPotential.unexpressedStrengths, "#7C3AED") + `<p class="prose mt-zone">${d.hiddenPotential.growthStrategy}</p>`, "#1A5FA8")}
        ${card("Unknown Self - Untapped Potential", bullets(d.unknownPotential.untappedCapabilities, "#8B5CF6") + `<p class="prose mt-zone">${d.unknownPotential.futureAnalysis}</p>`, "#6C3483")}
      </div></div>${pageFooter}</div>`,

    `<div class="page">${pageHeader(6, "Communication & Feedback Intelligence", "How you connect and grow through input")}
      <div class="body body-fill"><div class="vstack">
        ${card("Communication Style", `<p class="prose">${d.communication.style}</p>`, "#7C3AED")}
        ${card("Communication Strengths", bullets(d.communication.strengths, "#10B981"), "#10B981")}
        ${card("Communication Barriers", bullets(d.communication.barriers, "#EF4444"), "#EF4444")}
        ${card("Feedback Behavior", `<p class="prose">${d.feedback.currentBehavior}</p><p class="prose mt-zone">${d.feedback.growthAcceleration}</p>`, "#2563EB")}
        ${card("Feedback Framework", workflowHtml(d.feedback.framework), "#0F172A")}
        ${card("Improvement Recommendations", bullets(d.communication.recommendations, "#F59E0B"), "#F59E0B")}
      </div></div>${pageFooter}</div>`,

    `<div class="page">${pageHeader(7, "Personal Impact Profile", "Relationships, brand, and confidence")}
      <div class="body body-fill"><div class="vstack">
        ${card("How Others Experience You", `<p class="prose">${d.relationships.interactionStyle}</p><p class="prose mt-zone">${d.personalBrand.currentPerception}</p>`, "#2563EB")}
        ${card("Social Visibility", `<p class="prose">${d.relationships.socialVisibility}</p>`, "#14B8A6")}
        ${card("Confidence & Expression", bullets(d.confidence.indicators, "#10B981") + `<p class="prose mt-zone">${d.confidence.leadershipReadiness}</p>`, "#F59E0B")}
        ${card("Growth Opportunities", bullets([...d.relationships.growthOpportunities, ...d.personalBrand.reputationPlan.slice(0, 2)], "#10B981"), "#10B981")}
      </div></div>${pageFooter}</div>`,

    `<div class="page">${pageHeader(8, "Growth Challenges", "Top 5 development priorities with action plans")}
      <div class="body body-fill">${challengeHtml}</div>${pageFooter}</div>`,

    `<div class="page">${pageHeader(9, "90-Day Growth Plan", d.plan90Days.overview)}
      <div class="body body-fill">${monthPlanHtml(d.plan90Days.months[0], "#2563EB")}</div>${pageFooter}</div>`,

    `<div class="page">${pageHeader(10, "90-Day Growth Plan", "Month 2 - visibility and confidence building")}
      <div class="body body-fill">${monthPlanHtml(d.plan90Days.months[1], "#7C3AED")}</div>${pageFooter}</div>`,

    `<div class="page">${pageHeader(11, "90-Day Growth Plan", "Month 3 - leadership and personal impact")}
      <div class="body body-fill">${monthPlanHtml(d.plan90Days.months[2], "#10B981")}</div>${pageFooter}</div>`,

    `<div class="page">${pageHeader(12, "Parent / Mentor Guidance", "How to support this growth journey")}
      <div class="body parent-compact">
        <div class="insight" style="border-left-color:#D4A853"><p class="lbl">Overview</p><p class="prose">${d.parentGuidance.intro}</p></div>
        <div class="grid-2" style="margin-top:8px;gap:8px">
          <div class="parent-card" style="border-top-color:#10B981"><h4>How to Support Growth</h4>${bullets(d.parentGuidance.supportGrowth, "#10B981")}</div>
          <div class="parent-card" style="border-top-color:#7C3AED"><h4>How to Encourage Expression</h4>${bullets(d.parentGuidance.encourageExpression, "#7C3AED")}</div>
          <div class="parent-card" style="border-top-color:#2563EB"><h4>How to Give Effective Feedback</h4>${bullets(d.parentGuidance.effectiveFeedback)}</div>
          <div class="parent-card" style="border-top-color:#F59E0B"><h4>How to Build Confidence</h4>${bullets(d.parentGuidance.buildConfidence, "#F59E0B")}</div>
          <div class="parent-card" style="border-top-color:#8B5CF6"><h4>How to Develop Self-Awareness</h4>${bullets(d.parentGuidance.developSelfAwareness, "#8B5CF6")}</div>
          <div class="parent-card" style="border-top-color:#0F172A"><h4>Mentor Role & Coordination</h4>${bullets(d.parentGuidance.mentorRole, "#0F172A")}</div>
        </div>
        <div style="margin-top:8px">${card("What to Avoid", bullets(d.parentGuidance.whatToAvoid, "#EF4444"), "#EF4444")}</div>
      </div>${pageFooter}</div>`,

    `<div class="page">${pageHeader(13, "Final Growth Summary", "Your path forward")}
      <div class="body body-fill"><div class="grid-2">
        ${[["Current Position", d.finalSummary.currentPosition, "#2563EB"], ["Growth Potential", d.finalSummary.growthPotential, "#10B981"], ["Biggest Strength", d.finalSummary.biggestStrength, "#10B981"], ["Biggest Opportunity", d.finalSummary.biggestOpportunity, "#F59E0B"], ["90-Day Goal", d.finalSummary.ninetyDayGoal, "#7C3AED"], ["Final Recommendation", d.finalSummary.finalRecommendation, "#0F172A"]].map(([t, txt, col]) =>
          `<div class="final-card" style="border-left-color:${col}"><p class="final-lbl">${t}</p><p class="prose">${txt}</p></div>`).join("")}
      </div>
      <div class="closing"><p>${d.finalSummary.closingStatement}</p><p class="sign">- CLEAR Assessment · Mind Ripple · ${d.student.assessmentDate}</p></div>
      </div>${pageFooter}</div>`,
  ];

  const pages = [
    buildCoverPage(d),
    ...contentPages,
    buildBackCoverPage(),
  ];

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>${styles}</style></head><body>${pages.join("")}</body></html>`;
}
