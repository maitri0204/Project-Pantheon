import { renderReportBullets } from "../reportBullets";
import {
  careerFitTop10,
  jobRoleExplorer,
  careerGrowthJourney,
  careerMarketInsights,
  roadmapPhases,
  type CareerFit,
  type Rating,
} from "./careerIntelligenceData";

const SECTION7_FOOTER = `
<div style="margin-top:18px;padding:16px 18px;background:#FAFAFC;border:1px solid #E5E7EB;
            border-radius:12px;border-left:4px solid #5B4CF0;">
  <p style="font-size:10px;font-weight:700;color:#5B4CF0;margin:0 0 6px;">Suggested Action :-</p>
  <p style="font-size:10px;color:#374151;line-height:1.65;margin:0;">
    You can connect with "International Education &amp; Career Advisor" at <b>KAREER Studio</b> to plan out
    MICRO DEGREES which can help you building your profile.
  </p>
</div>`;

function sectionHeader(num: string, title: string, subtitle: string): string {
  return `
  <div style="margin-bottom:20px;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">
      <div style="background:#5B4CF0;color:#fff;font-size:11px;font-weight:700;border-radius:6px;
                  width:28px;height:28px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${num}</div>
      <h2 style="font-size:21px;font-weight:800;color:#111827;margin:0;line-height:1.3;">${title} (Suggested)</h2>
    </div>
    <p style="font-size:10px;font-weight:600;letter-spacing:0.1em;color:#6B7280;
              margin:0 0 10px 40px;text-transform:uppercase;">${subtitle}</p>
    <div style="height:2px;background:linear-gradient(90deg,#5B4CF0 0%,#E5E7EB 55%);border-radius:1px;"></div>
  </div>`;
}

function continuedBar(sectionTitle: string): string {
  return `
  <div style="margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid #E5E7EB;">
    <p style="font-size:10px;font-weight:600;color:#6B7280;letter-spacing:0.06em;margin:0;">
      ${sectionTitle} (Suggested) - continued
    </p>
  </div>`;
}

function pageFooter(pageLabel: string): string {
  return `
  <div class="report-page-footer">
    <span>ADMITra / KAREER Studio - Confidential Report</span>
    <span>${pageLabel}</span>
  </div>`;
}

function pageWrap(content: string, pageLabel: string, section7Footer = false): string {
  return `
  <div class="page content-page">
    <div class="page-body">
      ${content}
      ${section7Footer ? SECTION7_FOOTER : ""}
    </div>
    ${pageFooter(pageLabel)}
  </div>`;
}

function bullets(items: string[], max = 5): string {
  return renderReportBullets(items.slice(0, max), {
    color: "#374151",
    bulletColor: "#5B4CF0",
    compact: true,
    fontSize: "10px",
    lineHeight: 1.65,
  });
}

function matchBadge(match: number): string {
  const bg = match >= 85 ? "#DCFCE7" : match >= 75 ? "#EEF2FF" : "#FEF3C7";
  const color = match >= 85 ? "#16A34A" : match >= 75 ? "#5B4CF0" : "#D97706";
  return `<span style="background:${bg};color:${color};font-size:10px;font-weight:700;
    padding:4px 11px;border-radius:999px;white-space:nowrap;">${match}% Match</span>`;
}

function ratingBadge(rating: Rating): string {
  const map: Record<Rating, { bg: string; color: string }> = {
    High: { bg: "#DCFCE7", color: "#16A34A" },
    Medium: { bg: "#FEF3C7", color: "#D97706" },
    Low: { bg: "#FEE2E2", color: "#DC2626" },
  };
  const { bg, color } = map[rating];
  return `<span style="background:${bg};color:${color};font-size:9px;font-weight:700;
    padding:3px 9px;border-radius:999px;">${rating}</span>`;
}

function careerFitCard(c: CareerFit): string {
  return `
  <div style="background:#FAFAFC;border:1px solid #E5E7EB;border-radius:12px;padding:14px 16px;
              margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04);page-break-inside:avoid;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:10px;">
      <p style="font-size:11px;font-weight:800;color:#111827;margin:0;">${c.career}</p>
      ${matchBadge(c.match)}
    </div>
    <div style="display:flex;gap:16px;">
      <div style="flex:1;min-width:0;">
        <p style="font-size:9px;font-weight:700;color:#5B4CF0;letter-spacing:0.06em;
                  text-transform:uppercase;margin:0 0 6px;">Supported by</p>
        ${bullets(c.supportedBy, 4)}
      </div>
      <div style="flex:1.1;min-width:0;">
        <p style="font-size:9px;font-weight:700;color:#111827;margin:0 0 4px;">Why it fits</p>
        <p style="font-size:10px;color:#374151;line-height:1.6;margin:0 0 8px;">${c.whyItFits}</p>
        <p style="font-size:9px;font-weight:700;color:#22C55E;margin:0 0 4px;">Suggested Action</p>
        <p style="font-size:10px;color:#374151;line-height:1.55;margin:0;">${c.recommendedAction}</p>
      </div>
    </div>
  </div>`;
}

function roleExplorerCard(r: (typeof jobRoleExplorer)[0]): string {
  const col = (title: string, roles: string[], color: string) => `
    <div style="flex:1;min-width:0;background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:11px 12px;">
      <p style="font-size:9px;font-weight:700;color:${color};letter-spacing:0.06em;
                text-transform:uppercase;margin:0 0 6px;">${title}</p>
      ${bullets(roles, 4)}
    </div>`;
  return `
  <div style="background:#FAFAFC;border:1px solid #E5E7EB;border-radius:12px;padding:14px 16px;
              margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,0.04);page-break-inside:avoid;">
    <p style="font-size:11px;font-weight:800;color:#111827;margin:0 0 10px;">${r.careerPath}</p>
    <div style="display:flex;gap:10px;">
      ${col("Entry level", r.entryLevel, "#5B4CF0")}
      ${col("Mid level", r.midLevel, "#8B7CF8")}
      ${col("Senior level", r.seniorLevel, "#22C55E")}
    </div>
  </div>`;
}

function growthCard(g: (typeof careerGrowthJourney)[0]): string {
  const block = (label: string, items: string[]) => `
    <div>
      <p style="font-size:9px;font-weight:700;color:#5B4CF0;letter-spacing:0.05em;
                text-transform:uppercase;margin:0 0 4px;">${label}</p>
      ${bullets(items, 4)}
    </div>`;
  return `
  <div style="background:#FAFAFC;border:1px solid #E5E7EB;border-radius:12px;padding:12px 14px;
              margin-bottom:9px;box-shadow:0 1px 3px rgba(0,0,0,0.04);page-break-inside:avoid;">
    <p style="font-size:11px;font-weight:800;color:#111827;margin:0 0 8px;padding-bottom:5px;
              border-bottom:1px solid #E5E7EB;">${g.careerPath} Career Path</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 12px;">
      ${block("Technical skills", g.technicalSkills)}
      ${block("Soft skills", g.softSkills)}
      ${block("Certifications", g.certifications)}
      ${block("Suggested courses", g.courses)}
      ${block("Portfolio projects", g.projects)}
      ${block("Networking", g.networking)}
    </div>
  </div>`;
}

function marketInsightCard(m: (typeof careerMarketInsights)[0]): string {
  const row = (label: string, value: Rating) => `
    <div style="display:flex;justify-content:space-between;align-items:center;
                padding:6px 0;border-bottom:1px solid #F3F4F6;">
      <span style="font-size:10px;color:#374151;">${label}</span>
      ${ratingBadge(value)}
    </div>`;
  return `
  <div style="background:#FAFAFC;border:1px solid #E5E7EB;border-radius:12px;padding:13px 15px;
              box-shadow:0 1px 3px rgba(0,0,0,0.04);page-break-inside:avoid;height:100%;">
    <p style="font-size:11px;font-weight:800;color:#111827;margin:0 0 4px;">${m.careerPath}</p>
    <p style="font-size:9px;color:#6B7280;margin:0 0 8px;line-height:1.45;">${m.topIndustries.join(", ")}</p>
    ${row("Future demand", m.futureDemand)}
    ${row("Growth potential", m.growthPotential)}
    ${row("Remote work", m.remoteWork)}
    ${row("Leadership potential", m.leadershipPotential)}
    ${row("Work-life balance", m.workLifeBalance)}
    ${row("Career stability", m.careerStability)}
    <p style="font-size:9px;font-weight:700;color:#5B4CF0;margin:12px 0 4px;">Industry trends</p>
    <p style="font-size:9.5px;color:#6B7280;line-height:1.55;margin:0;">${m.industryTrends}</p>
  </div>`;
}

function roadmapWeekCard(phase: (typeof roadmapPhases)[0], compact = false): string {
  const pad = compact ? "10px 12px" : "14px 16px";
  const mb = compact ? "margin-bottom:10px;" : "";
  return `
  <div style="background:#FAFAFC;border:1px solid #E5E7EB;border-radius:12px;padding:${pad};
              box-shadow:0 1px 3px rgba(0,0,0,0.04);page-break-inside:avoid;${mb}">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:10px;">
      <p style="font-size:12px;font-weight:800;color:#111827;margin:0;">${phase.phase} - ${phase.title}</p>
      <span style="background:#EEF2FF;color:#5B4CF0;font-size:8px;font-weight:700;
                   padding:3px 9px;border-radius:999px;white-space:nowrap;">${phase.priority}</span>
    </div>
    <p style="font-size:10px;font-weight:700;color:#111827;line-height:1.45;margin:0 0 4px;">${phase.goal}</p>
    <p style="font-size:9.5px;color:#374151;line-height:1.55;margin:0 0 10px;">${phase.goalDetail}</p>
    <p style="font-size:9px;font-weight:700;color:#5B4CF0;letter-spacing:0.06em;
              text-transform:uppercase;margin:0 0 5px;">Key tasks</p>
    ${bullets(phase.tasks, 5)}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
      <div>
        <p style="font-size:9px;font-weight:700;color:#374151;margin:0 0 3px;">Mentorship</p>
        <p style="font-size:9px;color:#374151;line-height:1.45;margin:0;">${phase.mentorType.join(" · ")}</p>
      </div>
      <div>
        <p style="font-size:9px;font-weight:700;color:#374151;margin:0 0 3px;">Platforms</p>
        <p style="font-size:9px;color:#374151;line-height:1.45;margin:0;">${phase.platforms.join(" · ")}</p>
      </div>
    </div>
    <p style="font-size:9px;font-weight:700;color:#374151;margin:10px 0 4px;">Resources</p>
    ${bullets(phase.resources, 3)}
    <div style="background:#EEF2FF;border:1px solid #C7D2FE;border-radius:8px;padding:10px 12px;margin-top:10px;">
      <p style="font-size:8px;font-weight:700;color:#5B4CF0;letter-spacing:0.06em;
                text-transform:uppercase;margin:0 0 3px;">Expected outcome</p>
      <p style="font-size:9.5px;color:#3730A3;line-height:1.5;margin:0;">${phase.expectedOutcome}</p>
    </div>
  </div>`;
}

function roadmapTimeline(): string {
  return `
  <div style="display:flex;gap:12px;margin-bottom:18px;">
    <div style="flex:1;background:#FAFAFC;border:1px solid #E5E7EB;border-radius:10px;padding:14px;text-align:center;">
      <p style="font-size:20px;font-weight:800;color:#5B4CF0;margin:0;">30</p>
      <p style="font-size:9px;color:#6B7280;margin:5px 0 0;">Days - Foundation</p>
    </div>
    <div style="flex:1;background:#FAFAFC;border:1px solid #E5E7EB;border-radius:10px;padding:14px;text-align:center;">
      <p style="font-size:20px;font-weight:800;color:#5B4CF0;margin:0;">60</p>
      <p style="font-size:9px;color:#6B7280;margin:5px 0 0;">Days - Skills</p>
    </div>
    <div style="flex:1;background:#FAFAFC;border:1px solid #E5E7EB;border-radius:10px;padding:14px;text-align:center;">
      <p style="font-size:20px;font-weight:800;color:#5B4CF0;margin:0;">90</p>
      <p style="font-size:9px;color:#6B7280;margin:5px 0 0;">Days - Launch</p>
    </div>
  </div>`;
}

export function careerIntelligenceModulePages(): { html: string; pageCount: number } {
  let p = 8;
  const pages: string[] = [];

  // Section 07 - 3 pages (3 + 3 + 4): Product Manager on page 2 so page 1 KAREER footer fits
  pages.push(
    pageWrap(
      `${sectionHeader("07", "Career Fit Analysis", "Top 10 Recommended Career Paths")}
      <p style="font-size:10px;color:#6B7280;line-height:1.65;margin:0 0 12px;">
        Each path is scored against your Career DNA profile. Review match %, supporting dimensions, and suggested actions below.
      </p>
      ${careerFitTop10.slice(0, 3).map(careerFitCard).join("")}`,
      `Page ${p++}`,
      true
    )
  );
  pages.push(
    pageWrap(
      `${continuedBar("Career Fit Analysis")}
      ${careerFitTop10.slice(3, 6).map(careerFitCard).join("")}`,
      `Page ${p++}`,
      true
    )
  );
  pages.push(
    pageWrap(
      `${continuedBar("Career Fit Analysis")}
      ${careerFitTop10.slice(6, 10).map(careerFitCard).join("")}`,
      `Page ${p++}`,
      true
    )
  );

  // Section 08 - 2 pages (3 + 3) - readable spacing, not cramped
  pages.push(
    pageWrap(
      `${sectionHeader("08", "Job Role Explorer", "Entry · Mid · Senior Roles")}
      <p style="font-size:10px;color:#6B7280;line-height:1.65;margin:0 0 12px;">
        Job Roles you can explore for various career stages.
      </p>
      ${jobRoleExplorer.slice(0, 3).map(roleExplorerCard).join("")}`,
      `Page ${p++}`
    )
  );
  pages.push(
    pageWrap(
      `${continuedBar("Job Role Explorer")}
      ${jobRoleExplorer.slice(3, 6).map(roleExplorerCard).join("")}`,
      `Page ${p++}`
    )
  );

  // Section 09 - 3 pages (2 + 2 + 2) - no clipping, good fill per page
  pages.push(
    pageWrap(
      `${sectionHeader("09", "Career Growth Journey", "Skills · Certifications · Projects · Networking")}
      <p style="font-size:10px;color:#6B7280;line-height:1.65;margin:0 0 10px;">
        Skills, credentials, and projects to build for each targeted career path.
      </p>
      ${careerGrowthJourney.slice(0, 2).map(growthCard).join("")}`,
      `Page ${p++}`
    )
  );
  pages.push(
    pageWrap(
      `${continuedBar("Career Growth Journey")}
      ${careerGrowthJourney.slice(2, 4).map(growthCard).join("")}`,
      `Page ${p++}`
    )
  );
  pages.push(
    pageWrap(
      `${continuedBar("Career Growth Journey")}
      ${careerGrowthJourney.slice(4, 6).map(growthCard).join("")}`,
      `Page ${p++}`
    )
  );

  // Section 10 - 2 pages (4 + 2): Research Analyst & Financial Analyst on page 2
  pages.push(
    pageWrap(
      `${sectionHeader("10", "Career Market Insights", "Demand · Growth · Remote · Stability")}
      <p style="font-size:10px;color:#6B7280;line-height:1.65;margin:0 0 12px;">
        Compare careers using High / Medium / Low ratings across key market factors.
      </p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:stretch;">
        ${careerMarketInsights.slice(0, 4).map(marketInsightCard).join("")}
      </div>`,
      `Page ${p++}`
    )
  );
  pages.push(
    pageWrap(
      `${continuedBar("Career Market Insights")}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:stretch;">
        ${careerMarketInsights.slice(4, 6).map(marketInsightCard).join("")}
      </div>`,
      `Page ${p++}`
    )
  );

  // Section 11 - 2 pages: overview + weeks 1-4 | weeks 5-8 + 9-12
  pages.push(
    pageWrap(
      `${sectionHeader("11", "90-Day Career Roadmap", "3-Phase Preparation Framework")}
      <p style="font-size:10px;color:#374151;line-height:1.65;margin:0 0 12px;max-width:540px;">
        A structured action plan with measurable outcomes at each phase - designed to turn assessment insights into career momentum.
      </p>
      ${roadmapTimeline()}
      ${roadmapWeekCard(roadmapPhases[0])}`,
      `Page ${p++}`
    )
  );
  pages.push(
    pageWrap(
      `${continuedBar("90-Day Career Roadmap")}
      ${roadmapWeekCard(roadmapPhases[1], true)}
      ${roadmapWeekCard(roadmapPhases[2], true)}`,
      `Page ${p++}`
    )
  );

  return { html: pages.join(""), pageCount: p - 8 };
}
