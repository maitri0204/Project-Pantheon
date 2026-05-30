import Link from "next/link";
import { ArrowUpRight, BadgeInfo, Mail, PhoneCall, ShieldCheck, Sparkles } from "lucide-react";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register Organization" },
];

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/refund-policy", label: "Refund Policy" },
];

// platformLinks removed per design — toolbar keeps quick links and legal links only

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 left-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="content-wrap relative mx-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-5">
            <div className="space-y-4">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-16 w-auto brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.22)]"
              />
              <div>
                <h2 className="max-w-xl text-3xl font-black tracking-tight text-white sm:text-4xl">
                  A comprehensive assessment platform for organizations.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">
                  Streamline assessments, manage organizations, track performance, and deliver secure role-based experiences
                  with detailed analytics and customizable portals.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Secure by design
                </div>
                <p className="mt-2 text-sm text-slate-400">Role-scoped access, validation, rate limits, and anti-cheat checks.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-white">
                  <BadgeInfo className="h-4 w-4 text-cyan-300" />
                  Whitelabel ready
                </div>
                <p className="mt-2 text-sm text-slate-400">Branded dashboards for each organization and slug-based portals.</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Quick Links</h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group inline-flex items-center gap-2 transition hover:text-white">
                    <span className="h-0.5 w-4 bg-cyan-400/70 transition-all group-hover:w-6" />
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform section removed as requested */}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Legal & Support</h3>
            <ul className="mt-5 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group inline-flex items-center gap-2 transition hover:text-white">
                    <span className="h-0.5 w-4 bg-purple-400/70 transition-all group-hover:w-6" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                <span className="text-sm text-slate-300">hello@admitra.io</span>
              </div>
              <div className="flex items-start gap-3">
                <PhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                <span className="text-sm text-slate-300">Mon - Sat: 10:00 AM - 7:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex sm:items-center sm:justify-between">
          <p>© {currentYear} Assessment Center. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built for secure assessments, reporting, and whitelabel operations.</p>
        </div>
      </div>
    </footer>
  );
}