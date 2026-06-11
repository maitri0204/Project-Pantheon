import {
  STUDY_ABROAD_TOPICS,
  type StudyAbroadTopic,
} from "../studyAbroadQuestionSelection.service";
import type { StudyAbroadEvaluationResult } from "../studyAbroadScoring.service";

const escapeHtml = (value: string): string => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const topicStatus = (score: number): { label: string; color: string } => {
  if (score >= 70) {
    return { label: "Strong", color: "#6d28d9" };
  }
  if (score >= 45) {
    return { label: "Developing", color: "#0369a1" };
  }
  return { label: "Focus Area", color: "#be123c" };
};

export function buildStudyAbroadReportHtml(input: {
  studentName: string;
  submittedAt?: Date | string | null;
  evaluation: StudyAbroadEvaluationResult;
}): string {
  const { studentName, submittedAt, evaluation } = input;
  const completedLabel = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  const topicRows = STUDY_ABROAD_TOPICS.map((topic) => {
    const score = evaluation.topicScores?.[topic as StudyAbroadTopic] ?? 0;
    const answered = evaluation.topicAnswered?.[topic as StudyAbroadTopic] ?? 0;
    const status = topicStatus(score);
    return `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${escapeHtml(topic)}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:700;">${score}%</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;">${answered}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;color:${status.color};font-weight:700;">${status.label}</td>
      </tr>
    `;
  }).join("");

  const rankedTopics = STUDY_ABROAD_TOPICS
    .map((topic) => ({
      topic,
      score: evaluation.topicScores?.[topic as StudyAbroadTopic] ?? 0,
    }))
    .sort((a, b) => b.score - a.score);

  const strengths = rankedTopics.filter((item) => item.score >= 70).slice(0, 4);
  const focusAreas = [...rankedTopics].reverse().filter((item) => item.score < 45).slice(0, 4);

  const strengthList = strengths.length
    ? strengths.map((item) => `<li>${escapeHtml(item.topic)} - ${item.score}%</li>`).join("")
    : "<li>No topic reached the strong readiness threshold yet.</li>";

  const focusList = focusAreas.length
    ? focusAreas.map((item) => `<li>${escapeHtml(item.topic)} - ${item.score}%</li>`).join("")
    : "<li>No major focus areas identified. Continue building balanced readiness.</li>";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Study Abroad Readiness Report</title>
</head>
<body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
  <div style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
    <div style="text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#7c3aed;">Study Abroad Readiness Assessment</p>
      <h1 style="margin:0;font-size:30px;color:#0f172a;">Readiness Report</h1>
      <p style="margin:12px 0 0;color:#475569;">Prepared for <strong>${escapeHtml(studentName)}</strong></p>
      <p style="margin:8px 0 0;color:#64748b;">Completed on ${escapeHtml(completedLabel)}</p>
    </div>

    <div style="background:linear-gradient(135deg,#6d28d9,#7c3aed);color:#ffffff;border-radius:14px;padding:24px;text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 8px;font-size:14px;opacity:0.9;">Overall Readiness</p>
      <div style="font-size:48px;font-weight:800;line-height:1;">${evaluation.overallPercentage}%</div>
      <p style="margin:12px 0 0;font-size:20px;font-weight:700;">${escapeHtml(evaluation.band)}</p>
      <p style="margin:8px 0 0;opacity:0.9;">Raw score: ${evaluation.overallScore}</p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-bottom:28px;">
      <div style="border:1px solid #ddd6fe;border-radius:12px;padding:16px;background:#faf5ff;">
        <h3 style="margin:0 0 10px;color:#6d28d9;">Top Strengths</h3>
        <ul style="margin:0;padding-left:20px;line-height:1.7;">${strengthList}</ul>
      </div>
      <div style="border:1px solid #fecdd3;border-radius:12px;padding:16px;background:#fff1f2;">
        <h3 style="margin:0 0 10px;color:#be123c;">Focus Areas</h3>
        <ul style="margin:0;padding-left:20px;line-height:1.7;">${focusList}</ul>
      </div>
    </div>

    <h2 style="margin:0 0 12px;font-size:20px;color:#6d28d9;">Topic Readiness Breakdown</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#f5f3ff;">
          <th style="padding:10px;text-align:left;">Topic</th>
          <th style="padding:10px;text-align:center;">Score</th>
          <th style="padding:10px;text-align:center;">Answered</th>
          <th style="padding:10px;text-align:center;">Status</th>
        </tr>
      </thead>
      <tbody>${topicRows}</tbody>
    </table>
  </div>
</body>
</html>`;
}
