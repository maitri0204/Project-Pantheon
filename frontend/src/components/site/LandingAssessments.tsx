"use client";

import { useState, type CSSProperties } from "react";
import { ArrowRight, Clock3, LayoutGrid, Users } from "lucide-react";

import { LANDING_ASSESSMENTS } from "@/lib/landingAssessments";
import { STUDENT_REGISTER_URL } from "@/lib/studentRegisterUrl";

type FilterKey = "All" | "Students" | "Parents" | "Grades 8–10";

const FILTERS: FilterKey[] = ["All", "Students", "Parents", "Grades 8–10"];

function matchesFilter(audience: string, filter: FilterKey): boolean {
  if (filter === "All") return true;
  if (filter === "Grades 8–10") return audience === "Grades 8–10";
  if (filter === "Parents") return audience.includes("Parent");
  if (filter === "Students")
    return audience.includes("Student") || audience === "Grades 8–10";
  return true;
}

export default function LandingAssessments() {
  const [active, setActive] = useState<FilterKey>("All");

  const visible = LANDING_ASSESSMENTS.filter((a) =>
    matchesFilter(a.audience, active),
  );

  return (
    <section id="assessments" className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/50 to-white py-16 sm:py-24">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.18),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(147,197,253,0.15),transparent_50%)]" />
      <div className="shape-sphere float-2 -left-10 top-24 hidden h-24 w-24 opacity-50 lg:block" />
      <div className="shape-cube float-4 right-[3%] top-1/2 hidden h-14 w-14 opacity-60 lg:block" />

      <div className="content-wrap relative mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
            <LayoutGrid className="h-4 w-4" />
            Assessment Catalog
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Every test you need —{" "}
            <span className="gradient-text-animated">in one place</span>
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Scientifically designed assessments for students, parents, and schools. Register once
            and access the complete suite — all with detailed premium PDF reports.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActive(f)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                active === f
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-200"
                  : "border border-blue-100 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {f}
            </button>
          ))}
          <span className="ml-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-500">
            {visible.length} test{visible.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Cards grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((assessment, idx) => (
            <article
              key={assessment.code}
              className="group tilt-card flex flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_10px_30px_rgba(59,130,246,0.08)]"
            >
              {/* Gradient banner */}
              <div
                className={`relative flex min-h-[130px] flex-col items-center justify-center bg-gradient-to-br ${assessment.accentClass} px-6 py-7 text-white`}
              >
                {/* Number tag */}
                <span className="absolute right-4 top-4 text-3xl font-black leading-none opacity-20 select-none">
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <span className="text-5xl drop-shadow-lg">{assessment.emoji}</span>
                <h3 className="mt-3 text-center text-lg font-black leading-tight tracking-tight drop-shadow">
                  {assessment.name}
                </h3>
              </div>

              {/* Card body */}
              <div className="flex flex-1 flex-col p-5">
                {/* Badges row */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    <Users className="h-3 w-3" />
                    {assessment.audience}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    <Clock3 className="h-3 w-3" />
                    {assessment.duration}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {assessment.description}
                </p>

                {/* Highlight chips */}
                <ul className="mt-4 flex flex-wrap gap-2">
                  {assessment.highlights.map((h) => (
                    <li
                      key={h}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                    >
                      ✓ {h}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={STUDENT_REGISTER_URL}
                  className="mt-5 inline-flex items-center gap-2 self-start rounded-xl border border-blue-100 px-4 py-2 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 group-hover:gap-3"
                >
                  Register to take this test
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div className="relative mt-12 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-sky-50 p-6 text-center shadow-[0_14px_40px_rgba(59,130,246,0.10)] sm:p-8">
          <div className="shape-ring spin-slower right-4 top-4 hidden h-16 w-16 opacity-50 sm:block" style={{ "--ring-w": "10px" } as CSSProperties} />
          <p className="text-lg font-bold text-slate-900">
            All 8 assessments are available after a single free registration.
          </p>
          <p className="mt-1 text-sm text-slate-600">
            No payment required to register. Assessments are purchased individually or through your school/organization.
          </p>
          <a
            href={STUDENT_REGISTER_URL}
            className="shine mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-3 text-base font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5"
          >
            Create your free account
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
