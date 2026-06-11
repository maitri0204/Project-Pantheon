import type { CSSProperties } from "react";
import Image from "next/image";

import Footer from "@/components/site/Footer";
import HeroArea from "@/components/site/HeroArea";
import LandingAssessments from "@/components/site/LandingAssessments";
import LandingCta from "@/components/site/LandingCta";
import LandingMarquee from "@/components/site/LandingMarquee";
import SiteHeader from "@/components/site/SiteHeader";
import { LANDING_STATS } from "@/lib/landingAssessments";
import { STUDENT_REGISTER_URL } from "@/lib/studentRegisterUrl";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpenText,
  CheckCircle,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Mail,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";

const howItWorks = [
  {
    step: "01",
    title: "Register in minutes",
    body: "Sign up with your email, verify via OTP, and join the Kareer Studio assessment portal instantly - completely free.",
    icon: ClipboardCheck,
    color: "bg-blue-100 text-blue-600",
  },
  {
    step: "02",
    title: "Pick your assessment",
    body: "Choose from career, resilience, academic-interest, study-abroad, and parent-focused tests tailored for you.",
    icon: Target,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    step: "03",
    title: "Get your report",
    body: "Receive a detailed, branded PDF report with scores, insights, and actionable next steps - delivered to your inbox.",
    icon: FileText,
    color: "bg-cyan-100 text-cyan-600",
  },
];

const personas = [
  {
    icon: GraduationCap,
    title: "Students",
    sub: "Grades 6–12 & college",
    color: "from-blue-500 to-indigo-600",
    text: "text-blue-700",
    tests: [
      "Career Compass - personality & direction",
      "Career DNA - deep aptitude profiler",
      "CLEAR - self-awareness & blind spots",
      "RQ - resilience quotient",
      "TEST - thinking & expression skills",
      "Academic Career & Interest Test (Grades 8-10)",
      "Study Abroad Readiness (Grades 10+)",
    ],
  },
  {
    icon: Users,
    title: "Parents",
    sub: "Actively supporting their child",
    color: "from-sky-500 to-blue-600",
    text: "text-sky-700",
    tests: [
      "Litmus Test - understand your parenting style",
      "K·S·E·P·J scoring across 5 dimensions",
      "Family guidance report with action plan",
      "Insights to support your child's growth",
    ],
  },
];

const outcomes = [
  {
    icon: FileText,
    title: "Premium PDF Report",
    body: "Multi-page, beautifully designed reports with scores, breakdowns, and next steps - ready to print or share.",
    accent: "bg-blue-100 text-blue-600",
  },
  {
    icon: Mail,
    title: "Email Delivery",
    body: "Reports are emailed directly to your inbox immediately after completion. No waiting, no manual download.",
    accent: "bg-sky-100 text-sky-600",
  },
  {
    icon: BarChart3,
    title: "Dimension Scores",
    body: "Every assessment breaks down your result into multiple scored dimensions - not just a single number.",
    accent: "bg-cyan-100 text-cyan-600",
  },
  {
    icon: CheckCircle,
    title: "Actionable Guidance",
    body: "Each report includes specific action plans, career exposure suggestions, and counselor recommendations.",
    accent: "bg-indigo-100 text-indigo-600",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    body: "OTP-verified access, anti-cheat safeguards, and role-scoped dashboards keep your data safe.",
    accent: "bg-blue-100 text-blue-600",
  },
  {
    icon: BookOpenText,
    title: "Science-Backed",
    body: "RQ, CLEAR, TEST, and AIM frameworks trusted by counselors worldwide.",
    accent: "bg-sky-100 text-sky-600",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50/60 to-white text-slate-900">

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Light blue atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(125,211,252,0.35),transparent_42%),radial-gradient(circle_at_90%_15%,rgba(147,197,253,0.4),transparent_44%),radial-gradient(circle_at_55%_100%,rgba(165,243,252,0.28),transparent_48%)]" />
        <div className="dot-grid absolute inset-x-0 top-24 h-[560px]" />

        {/* Floating 3D objects */}
        <div className="shape-sphere float-1 left-[4%] top-[30%] hidden h-20 w-20 lg:block" style={{ "--shape-rot": "0deg" } as CSSProperties} />
        <div className="shape-cube float-2 right-[5%] top-[16%] hidden h-14 w-14 lg:block" style={{ "--shape-rot": "14deg" } as CSSProperties} />
        <div className="shape-ring spin-slower left-[45%] top-[10%] hidden h-16 w-16 lg:block" style={{ "--ring-w": "10px" } as CSSProperties} />
        <div className="shape-pill float-4 bottom-[12%] left-[2%] hidden h-10 w-24 lg:block" style={{ "--shape-rot": "-24deg" } as CSSProperties} />
        <div className="shape-sphere shape-sphere--cyan float-2 bottom-[20%] right-[3%] hidden h-12 w-12 lg:block" />

        <div className="content-wrap relative mx-auto px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <SiteHeader />

          <div className="grid items-center gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
            {/* Left column */}
            <div className="space-y-7">

              <div className="space-y-5">
                <h1 className="reveal-up max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-[4.4rem] lg:leading-[1.04]" style={{ animationDelay: "0.1s" }}>
                  Know yourself.
                  <br />
                  <span className="gradient-text-animated">Choose smarter.</span>
                </h1>
                <p className="reveal-up max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl" style={{ animationDelay: "0.2s" }}>
                  Career discovery, resilience profiling, academic-interest mapping, and study-abroad
                  readiness - one trusted platform for students and parents.
                </p>
              </div>

              <div className="reveal-up" style={{ animationDelay: "0.3s" }}>
                <HeroArea />
              </div>

              {/* Stats row */}
              <div className="reveal-up grid gap-4 sm:grid-cols-3" style={{ animationDelay: "0.4s" }}>
                {LANDING_STATS.map((metric) => (
                  <div key={metric.label} className="tilt-card rounded-2xl border border-blue-100 bg-white/90 p-4 text-center shadow-[0_8px_24px_rgba(59,130,246,0.08)] backdrop-blur sm:text-left">
                    <p className="text-2xl font-black text-blue-700">{metric.value}</p>
                    <p className="mt-1 text-sm text-slate-600">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column - hero image */}
            <div className="reveal-up relative mx-auto w-full max-w-lg pt-6 lg:max-w-none" style={{ animationDelay: "0.25s" }}>
              <div className="absolute inset-6 rounded-[2.5rem] bg-gradient-to-br from-blue-300/35 via-sky-300/25 to-cyan-300/35 blur-3xl" />
              <div className="shape-ring spin-slower -right-8 -top-2 hidden h-28 w-28 opacity-50 lg:block" style={{ "--ring-w": "12px" } as CSSProperties} />

              <div className="tilt-card relative overflow-hidden rounded-[2rem] border border-blue-100 bg-white/95 shadow-[0_32px_80px_rgba(37,99,235,0.15)]">
                <Image
                  src="/image1.png"
                  alt="Assessment Center - career and readiness assessments for students and parents"
                  width={960}
                  height={720}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>

        </div>

        {/* Wave divider into the next section */}
        <div className="pointer-events-none relative -mb-px">
          <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className="block h-10 w-full sm:h-14" aria-hidden>
            <path d="M0 36 C240 64 480 8 720 20 C960 32 1200 60 1440 24 L1440 64 L0 64 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* ─── EXPLORE CTA + MARQUEE ─────────────────────────────────────────── */}
      <div className="content-wrap mx-auto px-4 pt-2 sm:px-6 lg:px-8">
        <a
          href="#assessments"
          className="shine mx-auto mb-5 flex w-fit items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5"
        >
          Explore all 8 assessments
          <ArrowRight className="h-5 w-5" />
        </a>
      </div>
      <LandingMarquee />

      {/* ─── WHO IS IT FOR ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="shape-ring spin-slower left-[2%] top-16 hidden h-20 w-20 opacity-70 lg:block" style={{ "--ring-w": "12px" } as CSSProperties} />
        <div className="shape-sphere shape-sphere--cyan float-4 right-[4%] bottom-10 hidden h-14 w-14 lg:block" />

        <div className="content-wrap relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mt-4 text-3xl font-black text-slate-950 sm:text-4xl">
              Who should take these assessments?
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Seven assessments are built for students. The Litmus Test is designed for parents.
              Register once and access the tests that fit your role.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            {personas.map((p) => (
              <div key={p.title} className="tilt-card overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_14px_40px_rgba(59,130,246,0.10)]">
                <div className={`bg-gradient-to-br ${p.color} relative flex items-center gap-4 overflow-hidden px-6 py-5 text-white`}>
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-xl" />
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{p.title}</h3>
                    <p className="text-sm text-white/85">{p.sub}</p>
                  </div>
                </div>
                <div className="p-5">
                  <ul className="space-y-2.5">
                    {p.tests.map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-slate-700">
                        <BadgeCheck className={`mt-0.5 h-4 w-4 shrink-0 ${p.text}`} />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={STUDENT_REGISTER_URL}
                    className={`mt-5 inline-flex items-center gap-1.5 text-sm font-bold ${p.text} hover:underline`}
                  >
                    Register now
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ASSESSMENTS CATALOG ──────────────────────────────────────────── */}
      <LandingAssessments />

      {/* ─── WHAT YOU GET ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,197,253,0.25),transparent_45%)]" />
        <div className="shape-cube float-3 left-[3%] top-1/3 hidden h-12 w-12 lg:block" style={{ "--shape-rot": "14deg" } as CSSProperties} />

        <div className="content-wrap relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mt-4 text-3xl font-black text-slate-950 sm:text-4xl">
              More than just a score
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Every assessment delivers a complete, actionable package - not a single number.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {outcomes.map((o) => (
              <div key={o.title} className="tilt-card rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-[0_10px_30px_rgba(59,130,246,0.08)] backdrop-blur">
                <div className={`inline-flex rounded-2xl ${o.accent} p-3`}>
                  <o.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-950">{o.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{o.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="content-wrap mx-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50/70 to-sky-50 p-6 shadow-[0_24px_70px_rgba(59,130,246,0.12)] sm:p-12">
          <div className="shape-sphere float-1 -right-8 -top-8 hidden h-28 w-28 opacity-60 lg:block" />
          <div className="shape-pill float-3 -bottom-3 left-1/4 hidden h-8 w-20 opacity-70 lg:block" style={{ "--shape-rot": "-24deg" } as CSSProperties} />

          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="mt-4 text-3xl font-black text-slate-950 sm:text-4xl">
              From sign-up to report in minutes
            </h2>
          </div>

          <div className="relative mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            {howItWorks.map((item, i) => (
              <article key={item.step} className="tilt-card relative rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
                {i < howItWorks.length - 1 && (
                  <div className="absolute right-0 top-[3.25rem] hidden h-0.5 w-10 translate-x-full bg-gradient-to-r from-blue-300 to-transparent md:block" />
                )}
                <p className="text-6xl font-black text-blue-100">{item.step}</p>
                <div className="relative -mt-7">
                  <div className={`inline-flex rounded-2xl ${item.color} p-3 shadow-sm`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <LandingCta />

      <Footer />
    </main>
  );
}
