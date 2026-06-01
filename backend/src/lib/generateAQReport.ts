/**
 * AQ Report Generation Service for Project Pantheon
 *
 * Generates comprehensive Adversity Quotient (AQ) assessment reports
 * including subscale breakdowns, interpretations, and recommendations.
 */

import { IStudentAssessmentAttempt } from "../models/StudentAssessmentAttempt";
import {
  evaluateAQAnswers,
  getAQLevelDescription,
  getDimensionInterpretation,
  AQEvaluationResult,
} from "../services/aqScoring.service";

export interface AQReportData {
  studentName: string;
  assessmentName: string;
  completedAt: Date;
  durationSeconds: number;
  totalScore: number;
  aqLevel: string;
  aqLevelDescription: string;
  subscales: Array<{
    dimension: string;
    rawScore: number;
    maxScore: number;
    percentage: number;
    interpretation: string;
  }>;
  recommendations: string[];
  strengths: string[];
  areasForGrowth: string[];
}

/**
 * Generate comprehensive AQ report data
 */
export async function generateAQReportData(
  attempt: IStudentAssessmentAttempt,
  studentFirstName: string,
  studentLastName: string
): Promise<AQReportData> {
  const evaluation = await evaluateAQAnswers(attempt);

  const studentName = `${studentFirstName} ${studentLastName}`;
  const aqLevelDescription = getAQLevelDescription(evaluation.aqLevel);

  // Build subscale interpretations
  const subscales = evaluation.subscales.map((sub: any) => ({
    dimension: sub.dimension,
    rawScore: sub.rawScore,
    maxScore: sub.maxScore,
    percentage: sub.percentage,
    interpretation: getDimensionInterpretation(sub.dimension, sub.percentage),
  }));

  // Identify strengths and areas for growth
  const strengths: string[] = [];
  const areasForGrowth: string[] = [];

  for (const sub of subscales) {
    if (sub.percentage >= 70) {
      strengths.push(`Strong ${sub.dimension}: ${sub.percentage}% mastery`);
    } else if (sub.percentage < 50) {
      areasForGrowth.push(`Developing ${sub.dimension}: ${sub.percentage}% (focus area)`);
    }
  }

  // Generate personalized recommendations
  const recommendations = generateRecommendations(evaluation, subscales);

  return {
    studentName,
    assessmentName: attempt.assessmentName,
    completedAt: attempt.completedAt || new Date(),
    durationSeconds: Math.round((new Date().getTime() - attempt.startedAt.getTime()) / 1000),
    totalScore: evaluation.totalScore,
    aqLevel: evaluation.aqLevel,
    aqLevelDescription,
    subscales,
    recommendations,
    strengths,
    areasForGrowth,
  };
}

/**
 * Generate personalized recommendations based on AQ evaluation
 */
function generateRecommendations(
  evaluation: AQEvaluationResult,
  subscales: Array<{
    dimension: string;
    rawScore: number;
    maxScore: number;
    percentage: number;
    interpretation: string;
  }>
): string[] {
  const recommendations: string[] = [];

  // Overall level recommendations
  if (evaluation.aqLevel === "Exceptional") {
    recommendations.push("Mentor others in developing their resilience and coping strategies.");
    recommendations.push("Consider taking on leadership roles that involve managing organizational change.");
  } else if (evaluation.aqLevel === "Strong") {
    recommendations.push("Continue building on your resilience foundation with leadership development.");
    recommendations.push("Help colleagues navigate challenges by sharing your adaptive strategies.");
  } else if (evaluation.aqLevel === "Moderate") {
    recommendations.push("Focus on developing your problem-solving and coping strategies.");
    recommendations.push("Practice taking ownership of challenges rather than externalizing blame.");
  } else {
    recommendations.push("Work with a mentor or coach to develop resilience and adaptive thinking.");
    recommendations.push("Practice breaking down large problems into manageable parts.");
  }

  // Dimension-specific recommendations
  const controlScore = subscales.find((s) => s.dimension === "Control");
  if (controlScore && controlScore.percentage < 50) {
    recommendations.push("Control: Identify what you can influence in difficult situations and focus your energy there.");
  }

  const ownershipScore = subscales.find((s) => s.dimension === "Ownership");
  if (ownershipScore && ownershipScore.percentage < 50) {
    recommendations.push("Ownership: Take responsibility for your role in challenges and solutions.");
  }

  const reachScore = subscales.find((s) => s.dimension === "Reach");
  if (reachScore && reachScore.percentage < 50) {
    recommendations.push("Reach: Practice compartmentalizing setbacks to prevent them from affecting other areas.");
  }

  const enduranceScore = subscales.find((s) => s.dimension === "Endurance");
  if (enduranceScore && enduranceScore.percentage < 50) {
    recommendations.push("Endurance: Remind yourself that challenges are typically temporary and surmountable.");
  }

  return recommendations;
}

/**
 * Format AQ report as HTML for email or web display
 */
export function formatAQReportAsHTML(reportData: AQReportData): string {
  const subscaleHTML = reportData.subscales
    .map(
      (sub) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${sub.dimension}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">${sub.rawScore}/${sub.maxScore}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">
        <strong>${sub.percentage}%</strong>
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563eb; text-align: center;">Adversity Quotient (AQ) Assessment Report</h1>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Student:</strong> ${reportData.studentName}</p>
        <p><strong>Assessment:</strong> ${reportData.assessmentName}</p>
        <p><strong>Date Completed:</strong> ${reportData.completedAt.toLocaleDateString()}</p>
        <p><strong>Duration:</strong> ${Math.round(reportData.durationSeconds / 60)} minutes</p>
      </div>

      <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h2 style="color: #2563eb; margin: 0;">Overall AQ Score: ${reportData.totalScore}/100</h2>
        <h3 style="color: #1976d2; margin: 10px 0;">Level: ${reportData.aqLevel}</h3>
        <p style="color: #555; line-height: 1.6;">${reportData.aqLevelDescription}</p>
      </div>

      <h3 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Dimension Breakdown</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 12px; text-align: left;">Dimension</th>
            <th style="padding: 12px; text-align: center;">Score</th>
            <th style="padding: 12px; text-align: center;">Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${subscaleHTML}
        </tbody>
      </table>

      ${reportData.strengths.length > 0 ? `
        <h3 style="color: #388e3c; border-bottom: 2px solid #388e3c; padding-bottom: 10px;">Strengths</h3>
        <ul style="line-height: 1.8;">
          ${reportData.strengths.map((s) => `<li>${s}</li>`).join("")}
        </ul>
      ` : ""}

      ${reportData.areasForGrowth.length > 0 ? `
        <h3 style="color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;">Areas for Growth</h3>
        <ul style="line-height: 1.8;">
          ${reportData.areasForGrowth.map((a) => `<li>${a}</li>`).join("")}
        </ul>
      ` : ""}

      <h3 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Recommendations</h3>
      <ol style="line-height: 1.8;">
        ${reportData.recommendations.map((r) => `<li>${r}</li>`).join("")}
      </ol>

      <p style="color: #999; text-align: center; margin-top: 30px; font-size: 12px;">
        © 2026 Assessment Centre. All rights reserved.
      </p>
    </div>
  `;
}
