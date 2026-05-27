"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

const SECTION_CARDS = [
  {
    title: "Why this matters",
    points: [
      "Helps students understand their personality, strengths, interests, and natural working style.",
      "Supports better stream, subject, and future career decisions.",
      "Designed for Grade 8–12 students at a key stage of self-discovery.",
    ],
  },
  {
    title: "What the test explores",
    points: [
      "How you gain energy and interact with people.",
      "How you process information and learn new concepts.",
      "How you make decisions and solve problems.",
      "How you prefer to plan, structure, and work.",
    ],
  },
  {
    title: "What you receive",
    points: [
      "Personality profile",
      "Strength and talent analysis",
      "Learning style insights",
      "Recommended academic streams and subjects",
      "Career domain suggestions",
      "Personal development guidance",
    ],
  },
];

const HIGHLIGHTS = [
  { label: "Audience", value: "Grade 8–12 students" },
  { label: "Focus", value: "Personality + career orientation" },
  { label: "Outcome", value: "Clearer academic and career direction" },
];

const STREAM_EXAMPLES = ["Science", "Commerce", "Arts / Humanities", "Interdisciplinary fields"];

const CAREER_EXAMPLES = ["Finance & Investment", "Technology & Data Science", "Creative Industries", "Management & Entrepreneurship", "Social Impact Careers"];

export default function AssessmentInfoPage() {
  const params = useParams<{ slug: string; code: string }>();
  const code = String(params?.code || "").toUpperCase();

  const assessmentTitle = useMemo(() => {
    if (code === "CAREER_COMPASS") return "Career Compass & Personality Profiler";
    return "Assessment Overview";
  }, [code]);

  const subtitle =
    code === "CAREER_COMPASS"
      ? "Discover your true potential and choose the right career path with a thoughtful, student-friendly assessment."
      : "Explore the assessment details below.";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-slate-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative p-8 sm:p-10 lg:p-12">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.10),transparent_35%)]" />
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Career guidance assessment
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
                {assessmentTitle}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                {subtitle}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {HIGHLIGHTS.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-lg">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Discover your direction today</p>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200 sm:text-base">
                  Every student has unique talents and strengths waiting to be discovered. Career Compass helps you understand yourself, choose the right academic path, and explore meaningful careers with confidence.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 p-8 text-white sm:p-10 lg:p-12">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">At a glance</p>
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-300">Ideal for</p>
                    <p className="mt-1 text-lg font-semibold">Students, parents, and schools</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-300">Assessment style</p>
                    <p className="mt-1 text-lg font-semibold">Personality-driven and career-oriented</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-300">Value</p>
                    <p className="mt-1 text-lg font-semibold">Clarity before stream and career selection</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-cyan-400/10 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Why students love it</p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  It turns confusing career choices into a clear, personalized roadmap that feels practical, modern, and easy to understand.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {SECTION_CARDS.map((section) => (
            <div key={section.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">How the assessment helps</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Self-awareness</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Students understand their strengths, communication style, learning preferences, and emotional tendencies.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Stream selection</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">The result supports more informed choices for Science, Commerce, Arts, or interdisciplinary paths.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Subject fit</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">It highlights subjects that better match a student’s way of thinking and working.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Career direction</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Students receive career domains aligned with their personality and natural tendencies.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Possible stream matches</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {STREAM_EXAMPLES.map((item) => (
                <span key={item} className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                  {item}
                </span>
              ))}
            </div>

            <h2 className="mt-8 text-xl font-bold text-slate-900">Potential career domains</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {CAREER_EXAMPLES.map((item) => (
                <span key={item} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">What makes it different?</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Unlike traditional aptitude tests, this assessment focuses on personality, mindset, and natural tendencies, helping students choose a path that feels aligned and sustainable.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Who should consider this assessment?</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              ["Grade 8–10 students", "Exploring streams and subjects."],
              ["Grade 11–12 students", "Seeking clarity on careers and college majors."],
              ["Parents and schools", "Supporting informed career decisions."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
