import {
  INTEREST_META,
  type AcademicCareerEvaluation,
  type InterestCode,
} from "../academicCareerScoring.service";

const escapeHtml = (value: string): string => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const renderList = (items: string[]): string => {
  if (!items.length) {
    return "<p style=\"color:#64748b;\">No items available.</p>";
  }
  return `<ul style="margin:0;padding-left:20px;line-height:1.7;">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
};

export function buildAcademicCareerReportHtml(input: {
  studentName: string;
  grade?: string;
  school?: string;
  submittedAt?: Date | string | null;
  evaluation: AcademicCareerEvaluation;
}): string {
  const { studentName, grade, school, submittedAt, evaluation } = input;
  const completedLabel = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  const sortedScores = [...(evaluation.interestScores || [])].sort((a, b) => b.score - a.score);
  const scoreRows = sortedScores.map((score) => {
    const meta = INTEREST_META[score.code as InterestCode];
    return `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:600;">${escapeHtml(meta?.name || score.code)}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;">${score.score}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;">${score.percentage}%</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;">${escapeHtml(score.level)}</td>
      </tr>
    `;
  }).join("");

  const topCodes = (evaluation.topInterests || []).slice(0, 3);
  const topInterestCards = topCodes.map((code, index) => {
    const meta = INTEREST_META[code];
    const score = sortedScores.find((item) => item.code === code);
    return `
      <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;background:#f8fafc;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">Rank ${index + 1}</p>
        <h3 style="margin:0 0 8px;color:#0f172a;font-size:18px;">${escapeHtml(meta?.name || code)}</h3>
        <p style="margin:0 0 10px;color:#475569;">Score: <strong>${score?.score ?? 0}</strong> · ${score?.percentage ?? 0}%</p>
        <p style="margin:0 0 6px;font-size:13px;color:#334155;font-weight:600;">Suggested careers</p>
        <p style="margin:0;color:#475569;line-height:1.6;">${escapeHtml((meta?.careers || []).slice(0, 3).join(", "))}</p>
      </div>
    `;
  }).join("");

  const stream = evaluation.streamAnalysis;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Academic Career Report</title>
</head>
<body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
  <div style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
    <div style="text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#2563eb;">Academic Career &amp; Interest Assessment</p>
      <h1 style="margin:0;font-size:30px;color:#0f172a;">Career Pathway Report</h1>
      <p style="margin:12px 0 0;color:#475569;">Prepared for <strong>${escapeHtml(studentName)}</strong></p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:28px;">
      <div style="background:#eff6ff;border-radius:12px;padding:14px;">
        <p style="margin:0 0 4px;font-size:12px;color:#64748b;">Grade</p>
        <p style="margin:0;font-weight:700;">${escapeHtml(grade || "—")}</p>
      </div>
      <div style="background:#eff6ff;border-radius:12px;padding:14px;">
        <p style="margin:0 0 4px;font-size:12px;color:#64748b;">Institution</p>
        <p style="margin:0;font-weight:700;">${escapeHtml(school || "—")}</p>
      </div>
      <div style="background:#eff6ff;border-radius:12px;padding:14px;">
        <p style="margin:0 0 4px;font-size:12px;color:#64748b;">Completed</p>
        <p style="margin:0;font-weight:700;">${escapeHtml(completedLabel)}</p>
      </div>
    </div>

    <h2 style="margin:0 0 12px;font-size:20px;color:#1d4ed8;">Top Interest Areas</h2>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:28px;">
      ${topInterestCards}
    </div>

    <h2 style="margin:0 0 12px;font-size:20px;color:#1d4ed8;">Recommended Stream</h2>
    <div style="background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#ffffff;border-radius:14px;padding:20px;margin-bottom:20px;">
      <p style="margin:0 0 8px;font-size:13px;opacity:0.9;">${escapeHtml(stream?.confidence || "Fit Analysis")}</p>
      <h3 style="margin:0 0 10px;font-size:22px;">${escapeHtml(stream?.recommendedStream || "Exploratory Stream")}</h3>
      <p style="margin:0;line-height:1.7;opacity:0.95;">${escapeHtml(stream?.streamReasoning || "")}</p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-bottom:28px;">
      <div>
        <h3 style="margin:0 0 8px;font-size:16px;color:#0f766e;">Guidance Points</h3>
        ${renderList(stream?.guidancePoints || [])}
      </div>
      <div>
        <h3 style="margin:0 0 8px;font-size:16px;color:#b45309;">Caution Areas</h3>
        ${renderList(stream?.cautionAreas || [])}
      </div>
    </div>

    <h3 style="margin:0 0 8px;font-size:16px;color:#1d4ed8;">Future Opportunities</h3>
    ${renderList(stream?.futureOpportunities || [])}

    <h2 style="margin:28px 0 12px;font-size:20px;color:#1d4ed8;">Interest Profile Breakdown</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#f1f5f9;">
          <th style="padding:10px;text-align:left;">Domain</th>
          <th style="padding:10px;text-align:center;">Score</th>
          <th style="padding:10px;text-align:center;">%</th>
          <th style="padding:10px;text-align:center;">Level</th>
        </tr>
      </thead>
      <tbody>${scoreRows}</tbody>
    </table>

  </div>
</body>
</html>`;
}
