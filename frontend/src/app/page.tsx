import Footer from "@/components/site/Footer";
import SiteHeader from "@/components/site/SiteHeader";
import HeroArea from "@/components/site/HeroArea";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpenText,
  CheckCircle,
  ChevronRight,
  FileText,
  Globe,
  LayoutDashboard,
  LightbulbIcon,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";

const ribbonItems = [
  "Student assessments",
  "Parent Litmus tests",
  "Whitelabel portals",
  "Superadmin control",
  "Organization dashboards",
  "Reports & invoices",
  "Coupon management",
  "Secure access",
];

const highlights = [
  {
    title: "Student assessments",
    description: "Track attempts, reports, invoices, and progress with role-based access for schools and organizations.",
    icon: BookOpenText,
  },
  {
    title: "Parent access",
    description: "Parents can register and take Litmus tests, with dedicated dashboard views for admins.",
    icon: Users,
  },
  {
    title: "Whitelabel portals",
    description: "Deliver a branded experience for each organization with slug-based dashboards and login flows.",
    icon: LayoutDashboard,
  },
  {
    title: "Secure operations",
    description: "Built with validation, anti-cheat checks, rate limits, and scoped admin permissions.",
    icon: ShieldCheck,
  },
];

const metrics = [
  { value: "4+", label: "Assessment journeys", icon: BarChart3 },
  { value: "1", label: "Unified platform", icon: BadgeCheck },
];

const pillars = [
  "Superadmin oversight",
  "Organization dashboard",
  "Student and parent access",
  "Assessment reports",
  "Invoices and coupons",
  "Whitelabel branding",
];

const experienceCards = [
  {
    title: "Student journey",
    body: "Assessments, instant reports, invoices, and completion tracking in one place.",
    icon: BookOpenText,
  },
  {
    title: "Parent journey",
    body: "Litmus tests and parent-specific access with clear visibility for admins.",
    icon: Users,
  },
  {
    title: "Organization journey",
    body: "A branded control center with users, questions, coupons, and ledger views.",
    icon: LayoutDashboard,
  },
];

const capabilityBlocks = [
  {
    title: "Assessment intelligence",
    body: "Clear reports, attempt tracking, and instant visibility for every assessment run.",
    icon: BarChart3,
  },
  {
    title: "Elegant access layers",
    body: "Separate dashboards for superadmins, organization admins, students, and parents.",
    icon: Globe,
  },
  {
    title: "Fast user experience",
    body: "A responsive, polished interface with quick navigation and simple action flows.",
    icon: MonitorSmartphone,
  },
];

export default function Home() {
  return (
    <main className="app-surface min-h-screen text-slate-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.20),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.35),transparent_35%)]" />
        <div className="hero-orb hero-orb-left" />
        <div className="hero-orb hero-orb-right" />

        <div className="content-wrap relative mx-auto px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <SiteHeader />

          <div className="grid items-center gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
            <div className="space-y-7">

              <div className="space-y-5">
                <h2 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                  Streamlined assessments made simple.
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                  Assessment Center provides a unified platform for students, parents, and administrators with secure assessment flows, detailed analytics, invoicing, and complete whitelabel customization.
                </p>
              </div>

              <HeroArea />

              <div className="grid gap-4 pt-4 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="neo-card p-5">
                    <div className="inline-flex rounded-2xl bg-blue-50 p-2 text-blue-700">
                      <metric.icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-3xl font-black text-slate-950">{metric.value}</p>
                    <p className="mt-1 text-sm text-slate-600">{metric.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-6">
                <p className="text-sm font-semibold text-slate-700">Key Features:</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {ribbonItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-lg bg-blue-50/40 px-3 py-2 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="glass-card relative overflow-hidden p-6 sm:p-7">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(37,99,235,0.88),rgba(6,182,212,0.78))]" />
                <div className="relative space-y-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">Live platform snapshot</p>
                      <h3 className="mt-1 text-2xl font-black">Beautifully organized control.</h3>
                    </div>
                    <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-50 backdrop-blur">
                      Secure + whitelabel
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                      <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">Today&apos;s activity</p>
                      <p className="mt-2 text-3xl font-black">128</p>
                      <p className="mt-1 text-sm text-cyan-100/90">Assessments in progress</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                      <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">Completion rate</p>
                      <p className="mt-2 text-3xl font-black">94%</p>
                      <p className="mt-1 text-sm text-cyan-100/90">Reports generated instantly</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                        <BadgeCheck className="h-6 w-6 text-emerald-300" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-cyan-50">Role-aware workflow</p>
                        <p className="text-sm text-cyan-100/85">Students, parents, admins, and superadmins see only what they need.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ["Students", "Assessments, results"],
                      ["Parents", "Litmus test access"],
                      ["Admins", "Reports, coupons, ledger"],
                    ].map(([label, detail]) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-3 text-center backdrop-blur-md">
                        <p className="text-sm font-semibold text-white">{label}</p>
                        <p className="mt-1 text-xs text-cyan-100/85">{detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-4 hidden w-56 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10 lg:block float-slow">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Reports on demand</p>
                    <p className="text-xs text-slate-500">Clear performance visibility</p>
                  </div>
                </div>
              </div>
            </div>
           </div>
         </div>
       </section>
 
       <section className="content-wrap mx-auto px-4 pb-12 sm:px-6 lg:px-8">
         <h2 className="mb-8 text-center text-3xl font-black text-slate-950 sm:text-4xl">Platform Highlights</h2>
         <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 max-w-7xl mx-auto">
           {highlights.map((item) => (
             <article key={item.title} className="neo-card group p-6 transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
               <div className="mb-4 inline-flex rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-3 text-blue-700 transition group-hover:scale-105">
                 <item.icon className="h-6 w-6" />
               </div>
               <h3 className="text-xl font-bold text-slate-950">{item.title}</h3>
               <p className="mt-2 text-slate-600">{item.description}</p>
             </article>
           ))}
         </div>
       </section>
 
       <section className="content-wrap mx-auto px-4 pb-12 sm:px-6 lg:px-8">
         <div className="app-panel p-6 sm:p-8">
           <h2 className="mb-8 text-center text-3xl font-black text-slate-950 sm:text-4xl">Built for Every User</h2>
           <div className="mt-6 grid gap-4 md:grid-cols-3 max-w-5xl mx-auto">
             {experienceCards.map((card) => (
               <div key={card.title} className="neo-card p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                 <div className="inline-flex rounded-2xl bg-slate-100 p-3 text-slate-900">
                   <card.icon className="h-5 w-5" />
                 </div>
                 <h3 className="mt-4 text-xl font-bold text-slate-950">{card.title}</h3>
                 <p className="mt-2 text-slate-600">{card.body}</p>
               </div>
             ))}
           </div>
         </div>
       </section>

       <section className="content-wrap mx-auto px-4 pb-12 sm:px-6 lg:px-8">
         <h2 className="mb-8 text-center text-3xl font-black text-slate-950 sm:text-4xl">Our Capabilities</h2>
         <div className="grid gap-4 md:grid-cols-3 max-w-5xl mx-auto">
           {capabilityBlocks.map((block) => (
             <div key={block.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
               <div className="inline-flex rounded-2xl bg-blue-50 p-3 text-blue-700">
                 <block.icon className="h-5 w-5" />
               </div>
               <h3 className="mt-4 text-lg font-bold text-slate-950">{block.title}</h3>
               <p className="mt-2 text-slate-600">{block.body}</p>
             </div>
           ))}
         </div>
       </section>

       <section className="content-wrap mx-auto px-4 pb-12 sm:px-6 lg:px-8">
         <h2 className="mb-8 text-center text-3xl font-black text-slate-950 sm:text-4xl">Core Features</h2>
         <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 max-w-7xl mx-auto">
           {[
             {
               title: "Assessment reports",
               body: "Students and parents get instant, detailed reports after completing assessments.",
             },
             {
               title: "Invoice management",
               body: "Track, generate, and manage invoices seamlessly within the platform.",
             },
             {
               title: "Coupon control",
               body: "Admins can create, manage, and track coupons with dedicated organization control.",
             },
             {
               title: "Whitelabel branding",
               body: "Each organization gets a branded, slug-based portal with custom theming.",
             },
           ].map((item) => (
             <article key={item.title} className="neo-card p-6 transition hover:-translate-y-1 hover:shadow-xl">
               <div className="inline-flex rounded-2xl bg-gradient-to-br from-slate-900 to-blue-700 p-3 text-white">
                 <FileText className="h-6 w-6" />
               </div>
               <h3 className="mt-4 text-xl font-bold text-slate-950">{item.title}</h3>
               <p className="mt-2 text-slate-600">{item.body}</p>
             </article>
           ))}
         </div>
       </section>
 
       <Footer />
     </main>
   );
 }
