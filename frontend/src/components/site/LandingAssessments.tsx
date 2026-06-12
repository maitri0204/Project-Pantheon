import { ArrowRight, CheckCircle, Users } from "lucide-react";

import { LANDING_ASSESSMENT_CATALOG } from "@/lib/landingAssessmentCatalog";
import { STUDENT_REGISTER_URL } from "@/lib/studentRegisterUrl";

export default function LandingAssessments() {
  return (
    <section
      id="assessments"
      className="section-glow content-wrap relative mx-auto scroll-mt-10 px-4 pb-16 pt-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto mb-12 max-w-3xl space-y-4 text-center">
        <h2 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          Explore Our <span className="gradient-title">8 Assessments</span>
        </h2>
        <p className="text-lg leading-8 text-slate-600">
          Each assessment is built around a proven psychological model, and everyone ends with an instant,
          personalized report. Find the test that answers your biggest question.
        </p>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
        {LANDING_ASSESSMENT_CATALOG.map((test) => (
          <article key={test.name} className="test-card p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-sky-600 via-cyan-400 to-sky-600" />

            <div className="relative space-y-5 pt-2">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg">
                  <test.icon className="h-7 w-7" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <h3 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{test.name}</h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600 sm:text-[15px]">{test.tagline}</p>
                </div>
              </div>

              <p className="text-base leading-7 text-slate-600">{test.definition}</p>

              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <Users className="h-3.5 w-3.5" />
                  Best for
                </div>
                <p className="mt-1 text-sm font-bold text-slate-900">{test.audience}</p>
              </div>

              <div>
                <p className="mb-2.5 text-sm font-bold uppercase tracking-wide text-slate-500">
                  What it measures
                </p>
                <ul className="space-y-2">
                  {test.measures.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-[15px] leading-6 text-slate-700">
                      <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-sky-600" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-1">
                <a
                  href={STUDENT_REGISTER_URL}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:gap-3 hover:brightness-110"
                >
                  Register to take this test
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
