import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

import {
  ALL_TOPICS,
  bandFromScore,
  getTopAndBottomTopics,
  scoreToPercentage,
  type Topic,
} from "@/lib/studyAbroad/assessmentData";

export type StudyAbroadPdfReport = {
  studentName: string;
  submittedAt: string;
  overallScore: number;
  band: string;
  topicScores: Record<Topic, number>;
};

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#0f172a" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 8, color: "#0369a1" },
  subtitle: { fontSize: 11, color: "#64748b", marginBottom: 20 },
  h2: { fontSize: 14, fontWeight: "bold", marginTop: 16, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  barBg: { height: 6, backgroundColor: "#e2e8f0", borderRadius: 3, marginTop: 2, marginBottom: 8 },
  barFill: { height: 6, backgroundColor: "#818cf8", borderRadius: 3 },
  badge: { fontSize: 12, fontWeight: "bold", color: "#4338ca", marginTop: 4 },
});

export function StudyAbroadResultPdfDocument({ report }: { report: StudyAbroadPdfReport }) {
  const pct = scoreToPercentage(report.overallScore);
  const resultLike = {
    id: "pdf",
    submittedAt: report.submittedAt,
    overallScore: report.overallScore,
    answeredCount: 50,
    totalQuestions: 50,
    band: report.band,
    topicScores: report.topicScores,
    topicAnswered: {} as Record<Topic, number>,
  };
  const { top, bottom } = getTopAndBottomTopics(resultLike, 4);

  const sortedTopics = ALL_TOPICS.map((t) => ({ topic: t, score: report.topicScores[t] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Study Abroad Readiness Report</Text>
        <Text style={styles.subtitle}>
          {report.studentName} · {report.submittedAt}
        </Text>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 36, fontWeight: "bold" }}>{report.overallScore} / 150</Text>
          <Text style={styles.badge}>{report.band || bandFromScore(report.overallScore)}</Text>
          <Text style={{ marginTop: 6, color: "#475569" }}>Readiness: {pct}%</Text>
        </View>
        <Text style={styles.h2}>Dimension Scores</Text>
        {sortedTopics.map(({ topic, score }) => (
          <View key={topic}>
            <View style={styles.row}>
              <Text>{topic.replace(" Readiness", "")}</Text>
              <Text>{score}%</Text>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${score}%` }]} />
            </View>
          </View>
        ))}
      </Page>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Key Strengths</Text>
        {top.map(({ label, score }) => (
          <Text key={label} style={{ marginBottom: 6 }}>
            • {label}: {score}%
          </Text>
        ))}
        <Text style={styles.h2}>Focus Areas</Text>
        {bottom.map(({ label, score }) => (
          <Text key={label} style={{ marginBottom: 6 }}>
            • {label}: {score}%
          </Text>
        ))}
        <Text style={[styles.h2, { marginTop: 24 }]}>Readiness Bands</Text>
        <Text>91–100% — Completely Ready</Text>
        <Text>76–90% — Almost Ready</Text>
        <Text>51–75% — Moderately Ready</Text>
        <Text>26–50% — Partially Ready</Text>
        <Text>0–25% — At Risk</Text>
      </Page>
    </Document>
  );
}
