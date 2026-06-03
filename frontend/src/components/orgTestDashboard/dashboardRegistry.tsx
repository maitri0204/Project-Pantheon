"use client";

import type { ComponentType } from "react";

import type { OrgDashboardProps } from "@/components/orgTestDashboard/shared/OrgDashboardLayout";
import StudyAbroadOrgDashboard from "@/components/orgTestDashboard/dashboards/StudyAbroadOrgDashboard";
import CareerCompassOrgDashboard from "@/components/orgTestDashboard/dashboards/CareerCompassOrgDashboard";
import JohariOrgDashboard from "@/components/orgTestDashboard/dashboards/JohariOrgDashboard";
import LitmusOrgDashboard from "@/components/orgTestDashboard/dashboards/LitmusOrgDashboard";
import MetacognitionOrgDashboard from "@/components/orgTestDashboard/dashboards/MetacognitionOrgDashboard";
import CareerDnaOrgDashboard from "@/components/orgTestDashboard/dashboards/CareerDnaOrgDashboard";

export type OrgDashboardConfig = {
  component: ComponentType<OrgDashboardProps>;
  emptyTitle: string;
  emptySubtitle: string;
  accentClass: string;
};

export const ORG_DASHBOARD_REGISTRY: Record<string, OrgDashboardConfig> = {
  STUDY_ABROAD: {
    component: StudyAbroadOrgDashboard,
    emptyTitle: "Study Abroad Readiness — Organization Overview",
    emptySubtitle: "Track 12-dimension readiness when students complete the assessment.",
    accentClass: "from-sky-600 to-indigo-600",
  },
  CAREER_COMPASS: {
    component: CareerCompassOrgDashboard,
    emptyTitle: "Career Compass — Personality Type Analytics",
    emptySubtitle: "MBTI-style type distribution will appear when students complete Career Compass.",
    accentClass: "from-emerald-600 to-teal-600",
  },
  JOHARI_WINDOW: {
    component: JohariOrgDashboard,
    emptyTitle: "CLEAR — Johari Window Self-Awareness Map",
    emptySubtitle: "Quadrant analytics appear after students complete the CLEAR assessment.",
    accentClass: "from-indigo-600 to-blue-600",
  },
  LITMUS_TEST: {
    component: LitmusOrgDashboard,
    emptyTitle: "Litmus Test — Parenting Style Profile",
    emptySubtitle: "Parenting style analytics appear when parents complete Litmus.",
    accentClass: "from-rose-600 to-pink-600",
  },
  METACOGNITION_TEST: {
    component: MetacognitionOrgDashboard,
    emptyTitle: "Thinking & Expression Skills — Domain Analytics",
    emptySubtitle: "Domain score patterns appear after students complete the test.",
    accentClass: "from-cyan-600 to-blue-600",
  },
  CAREER_DNA: {
    component: CareerDnaOrgDashboard,
    emptyTitle: "Career DNA Profiler — Multi-Section Overview",
    emptySubtitle: "Multi-section profile analytics appear after students complete Career DNA.",
    accentClass: "from-fuchsia-600 to-violet-600",
  },
};

export function getOrgDashboardConfig(code: string): OrgDashboardConfig | null {
  return ORG_DASHBOARD_REGISTRY[code] ?? null;
}
