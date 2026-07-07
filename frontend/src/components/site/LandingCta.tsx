import type { CSSProperties } from "react";

import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react";

import { STUDENT_REGISTER_URL } from "@/lib/studentRegisterUrl";

const perks = [
  "OTP verification - no password needed",
  "Access all 9 assessments",
  "Premium PDF reports included",
];

export default function LandingCta() {
  return (
    <section className="content-wrap mx-auto px-4 pb-16 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-blue-200/60 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 px-6 py-14 shadow-[0_30px_80px_rgba(37,99,235,0.35)] sm:px-10 sm:py-16">

        {/* Decorative 3D shapes */}
        <div className="shape-sphere float-1 -left-10 -top-10 h-36 w-36 opacity-50" />
        <div className="shape-ring spin-slower right-[8%] top-8 hidden h-20 w-20 opacity-60 lg:block" style={{ "--ring-w": "12px" } as CSSProperties} />
        <div className="shape-sphere shape-sphere--cyan float-2 -bottom-8 right-[20%] h-24 w-24 opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.18),transparent_45%)]" />

        <div className="relative mx-auto max-w-4xl">
          {/* Top badge */}

          {/* Headline */}
          <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to discover your{" "}
            <span className="bg-gradient-to-r from-cyan-100 to-white bg-clip-text text-transparent">
              strengths &amp; direction?
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-8 text-blue-50 sm:text-lg">
            Join thousands of students and parents who use Assessment Center to make confident
            decisions about careers, streams, and education - backed by science, not guesswork.
          </p>

          {/* Perks */}
          <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
            {perks.map((p) => (
              <div key={p} className="flex items-center gap-2 text-sm font-semibold text-white">
                <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-300" />
                {p}
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={STUDENT_REGISTER_URL}
              className="shine inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-blue-700 shadow-xl shadow-blue-800/30 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-2xl"
            >
              Register &amp; start your first test
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Already have an account? Login
            </a>
          </div>

          {/* Micro-copy */}
          <p className="mt-5 text-center text-xs text-blue-100">
            No credit card required to register. Assessments are available via your school portal or individual purchase.
          </p>
        </div>
      </div>
    </section>
  );
}
