"use client";

import { Briefcase, GraduationCap, BookOpen, TrendingUp } from "lucide-react";
import React from "react";

type InterestCode = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";

interface InterestScore {
  code: InterestCode;
  score: number;
  level: string;
  percentage: number;
}

interface StreamAnalysis {
  recommendedStream: string;
  confidence: string;
  streamReasoning: string;
  guidancePoints: string[];
  cautionAreas: string[];
  futureOpportunities: string[];
  suggestedCareers: string[];
  supportingDomains: string[];
}

interface AcademicCareerEvaluation {
  interestScores: InterestScore[];
  topInterests: InterestCode[];
  streamAnalysis: StreamAnalysis;
  completedAt: Date;
}

const INTEREST_META: Record<
  InterestCode,
  { name: string; color: string; icon: string }
> = {
  A: { name: "Science & Research", color: "#6366f1", icon: "🔬" },
  B: { name: "Commerce & Financial", color: "#f59e0b", icon: "💰" },
  C: { name: "Social Science, Law & Public Policy", color: "#ef4444", icon: "⚖️" },
  D: { name: "Creative Arts, Design & Media", color: "#ec4899", icon: "🎨" },
  E: { name: "Technology & Digital Systems", color: "#0ea5e9", icon: "💻" },
  F: { name: "Health, Biology & Human Performance", color: "#10b981", icon: "🏥" },
  G: { name: "Communication, Language & Education", color: "#8b5cf6", icon: "📚" },
  H: {
    name: "Entrepreneurship, Leadership & Management",
    color: "#f97316",
    icon: "🚀",
  },
  I: { name: "Environment, Sustainability & Agriculture", color: "#14b8a6", icon: "🌱" },
  J: { name: "Social Impact, Community & Helping", color: "#a855f7", icon: "🤝" },
};

const getLevelColor = (level: string) => {
  if (level === "Very Strong") return "#10b981";
  if (level === "Strong") return "#3b82f6";
  if (level === "Moderate") return "#f59e0b";
  if (level === "Low") return "#ef4444";
  return "#6b7280";
};

const getConfidenceBadge = (confidence: string) => {
  if (confidence === "Strong Fit") return "bg-green-100 text-green-800 border-green-200";
  if (confidence === "Good Fit") return "bg-blue-100 text-blue-800 border-blue-200";
  return "bg-yellow-100 text-yellow-800 border-yellow-200";
};

interface AcademicCareerReportProps {
  evaluation: AcademicCareerEvaluation;
  submittedAt?: string;
}

export default function AcademicCareerReport({
  evaluation,
  submittedAt,
}: AcademicCareerReportProps) {
  const topThree = evaluation.topInterests.slice(0, 3);
  const otherScores = evaluation.interestScores.filter(
    (s) => !topThree.includes(s.code)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Academic Career & Interest Report
            </h1>
            {submittedAt && (
              <p className="text-gray-500 mt-1">
                Submitted on{" "}
                {new Date(submittedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Recommended Stream</p>
            <p className="text-xl font-bold text-blue-600 mt-1">
              {evaluation.streamAnalysis.recommendedStream}
            </p>
          </div>
        </div>
      </div>

      {/* Top 3 Interests */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Top 3 Interest Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topThree.map((code, idx) => {
            const score = evaluation.interestScores.find((s) => s.code === code)!;
            const meta = INTEREST_META[code];
            return (
              <div
                key={code}
                className="rounded-xl border-2 p-4"
                style={{ borderColor: meta.color + "40", backgroundColor: meta.color + "08" }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Rank #{idx + 1}
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{code}</p>
                  </div>
                  <span className="text-3xl">{meta.icon}</span>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-3">{meta.name}</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Score</span>
                    <span className="font-bold text-gray-900">
                      {score.score}/{(evaluation.interestScores.length * 6)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${score.percentage}%`,
                        backgroundColor: meta.color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Level</span>
                    <span
                      className="text-xs font-bold px-2 py-1 rounded"
                      style={{
                        color: getLevelColor(score.level),
                        backgroundColor: getLevelColor(score.level) + "20",
                      }}
                    >
                      {score.level}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interest Scores - All 10 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">All Interest Area Scores</h2>
        <div className="space-y-3">
          {evaluation.interestScores.map((score) => {
            const meta = INTEREST_META[score.code];
            const isTopThree = topThree.includes(score.code);
            return (
              <div
                key={score.code}
                className={`rounded-lg p-3 border ${isTopThree ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{meta.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{meta.name}</p>
                      <p className="text-xs text-gray-600">(Code {score.code})</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{score.percentage}%</p>
                    <p className="text-xs text-gray-600">
                      {score.score} points
                    </p>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${score.percentage}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stream Recommendation */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-white">
        <div
          className="px-6 py-5 flex items-center justify-between text-white"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
          }}
        >
          <div>
            <h2 className="text-lg font-bold">Your Recommended Stream</h2>
            <p className="text-sm opacity-90 mt-0.5">
              Based on your interest profile
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <GraduationCap size={22} className="text-white" />
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div
              className={`px-3 py-1 rounded-lg border font-semibold text-sm ${getConfidenceBadge(evaluation.streamAnalysis.confidence)}`}
            >
              {evaluation.streamAnalysis.confidence}
            </div>
          </div>

          <div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {evaluation.streamAnalysis.recommendedStream}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {evaluation.streamAnalysis.streamReasoning}
            </p>
          </div>

          {/* Guidance Points */}
          <div>
            <p className="font-semibold text-gray-900 text-sm uppercase tracking-wider mb-2">
              ✓ Why This Stream?
            </p>
            <ul className="space-y-1.5">
              {evaluation.streamAnalysis.guidancePoints.map((point, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Caution Areas */}
          <div>
            <p className="font-semibold text-gray-900 text-sm uppercase tracking-wider mb-2">
              ⚠️ Important Considerations
            </p>
            <ul className="space-y-1.5">
              {evaluation.streamAnalysis.cautionAreas.map((area, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Career Pathways */}
      {evaluation.streamAnalysis.suggestedCareers.length > 0 && (
        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-white">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 flex items-center justify-between text-white">
            <div>
              <h2 className="text-lg font-bold">Career Recommendations</h2>
              <p className="text-sm opacity-90 mt-0.5">
                Top careers aligned with your interests
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Briefcase size={22} className="text-white" />
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {evaluation.streamAnalysis.suggestedCareers.map((career, i) => (
                <div
                  key={career}
                  className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg px-4 py-3 border border-purple-100"
                >
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-gray-800">{career}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Future Opportunities */}
      {evaluation.streamAnalysis.futureOpportunities.length > 0 && (
        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-white">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 flex items-center justify-between text-white">
            <div>
              <h2 className="text-lg font-bold">Future Opportunities</h2>
              <p className="text-sm opacity-90 mt-0.5">
                Potential paths after this stream
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingUp size={22} className="text-white" />
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {evaluation.streamAnalysis.futureOpportunities.map((opp) => (
                <div
                  key={opp}
                  className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg px-4 py-3 border border-green-100"
                >
                  <div className="w-2 h-2 rounded-full bg-green-600" />
                  <span className="font-semibold text-gray-800">{opp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-blue-600" />
          Next Steps
        </h2>
        <ol className="space-y-3">
          <li className="flex gap-3">
            <span className="font-bold text-blue-600 min-w-fit">1. Explore</span>
            <span className="text-gray-700">
              Learn more about the recommended stream through subject descriptions
              and career talks
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-blue-600 min-w-fit">2. Discuss</span>
            <span className="text-gray-700">
              Talk to your teachers, parents, and career counselors about your
              results
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-blue-600 min-w-fit">3. Try</span>
            <span className="text-gray-700">
              Take up projects, workshops, or extracurriculars in your top
              interest areas
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-blue-600 min-w-fit">4. Decide</span>
            <span className="text-gray-700">
              Make an informed stream choice based on sustained interest and
              subject aptitude
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
