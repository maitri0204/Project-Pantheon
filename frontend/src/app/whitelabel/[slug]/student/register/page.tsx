"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Country, State, City } from "country-state-city";
import { apiRequest, setStoredAuth } from "@/lib/api";

type OrgBranding = { companyName: string; logoUrl?: string; primaryColor: string; accentColor?: string };
type PortalPublic = { organization: { id: string; name: string; slug: string; branding: OrgBranding } };

const PHONE_CODES = [
  { code: "+91", flag: "🇮🇳" }, { code: "+1", flag: "🇺🇸" }, { code: "+44", flag: "🇬🇧" },
  { code: "+61", flag: "🇦🇺" }, { code: "+971", flag: "🇦🇪" }, { code: "+65", flag: "🇸🇬" },
  { code: "+60", flag: "🇲🇾" }, { code: "+27", flag: "🇿🇦" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" }, { value: "female", label: "Female" },
  { value: "other", label: "Other" }, { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const GRADE_OPTIONS = [
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "Other",
];

const OTHER_GRADE_VALUE = "Other";

const LEARNER_ROLE_OPTIONS = [
  { value: "STUDENT", label: "Student" },
  { value: "PARENT", label: "Parent" },
] as const;

type FormState = {
  firstName: string; middleName: string; lastName: string;
  role: "STUDENT" | "PARENT";
  gender: string; email: string; phoneCode: string; phone: string;
  institutionName: string; grade: string; division: string; country: string; state: string; city: string;
};
type Step = "form" | "otp" | "success";

/* ─── FieldWrap / Divider ─── */
function FieldWrap({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-700">
        {label}{required && <span className="ml-0.5 text-rose-400">*</span>}
      </label>
      {children}
    </div>
  );
}
function SectionDivider({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-slate-100" />
      <span className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold uppercase tracking-widest text-slate-600">{icon} {label}</span>
      <div className="h-px flex-1 bg-slate-100" />
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-offset-1";
const selectCls = `${inputCls} cursor-pointer appearance-none bg-no-repeat bg-right bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2716%27%20height=%2716%27%20fill=%22none%22%20stroke=%22%23666%22%20viewBox=%220%200%2024%2024%22%3E%3Cpath%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%20stroke-width=%222%22%20d=%22M19%209l-7%207-7-7%22/%3E%3C/svg%3E')] pr-10`;

/* ─── MAIN PAGE ─── */
export default function StudentRegisterPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug ?? "";

  const [portal, setPortal] = useState<PortalPublic | null>(null);
  const [portalLoading, setPortalLoading] = useState(true);
  const [step, setStep] = useState<Step>("form");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const [form, setForm] = useState<FormState>({
    firstName:"", middleName:"", lastName:"", role:"STUDENT", gender:"", email:"",
    phoneCode:"+91", phone:"", institutionName:"", grade:"",
    division:"",
    country:"", state:"", city:"",
  });
  const [otherGrade, setOtherGrade] = useState("");

  const countries = Country.getAllCountries();
  const states = form.country ? State.getStatesOfCountry(form.country) : [];
  const cities = form.country && form.state ? City.getCitiesOfState(form.country, form.state) : [];

  useEffect(() => {
    if (!slug) return;
    apiRequest<PortalPublic>(`/platform/whitelabel/${slug}`)
      .then((res) => { setPortal(res); })
      .catch(() => {})
      .finally(() => setPortalLoading(false));
  }, [slug]);

  useEffect(() => {
    if (step !== "success") return;
    let p = 0;
    const id = setInterval(() => { p += 2; setProgress(p); if (p >= 100) clearInterval(id); }, 60);
    return () => clearInterval(id);
  }, [step]);

  const setField = (f: keyof FormState, v: string) =>
    setForm((p) => {
      const n = { ...p, [f]: v };
      if (f === "country") {
        n.state = "";
        n.city = "";
      }
      if (f === "state") {
        n.city = "";
      }
      if (f === "role" && v === "PARENT") {
        n.grade = "";
        n.division = "";
      }
      return n;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSubmitting(true);
    try {
      const isParentRegistration = form.role === "PARENT";
      const resolvedGrade = form.grade === OTHER_GRADE_VALUE ? otherGrade.trim() : form.grade;
      if (form.grade === OTHER_GRADE_VALUE && !resolvedGrade) {
        setError("Please enter your grade.");
        setSubmitting(false);
        return;
      }

      const payload = {
        organizationSlug: slug,
        ...form,
        grade: isParentRegistration ? undefined : resolvedGrade || undefined,
        division: isParentRegistration ? undefined : form.division || undefined,
      };

      await apiRequest("/auth/student-register", {
        method:"POST",
        body: JSON.stringify(payload),
      });
      setRegisteredEmail(form.email); setStep("otp");
    } catch (err) { setError(err instanceof Error ? err.message : "Registration failed"); }
    finally { setSubmitting(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSubmitting(true);
    try {
      const res = await apiRequest<{
        token: string;
        user: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          role: "SUPERADMIN" | "ORG_ADMIN" | "STUDENT" | "PARENT";
          organizationId: string | null;
          isVerified: boolean;
        };
        organizationSlug?: string;
      }>("/auth/student-register/verify-otp", {
        method:"POST", body: JSON.stringify({ email: registeredEmail, otp }),
      });
      setStoredAuth({
        token: res.token,
        user: res.user,
        orgCompanyName: organization.branding.companyName,
        orgSlug: res.organizationSlug || slug,
        orgLogoUrl: organization.branding.logoUrl,
      });
      setStep("success");
      setTimeout(() => router.push(`/whitelabel/${res.organizationSlug || slug}/student/dashboard`), 1200);
    } catch (err) { setError(err instanceof Error ? err.message : "Verification failed"); }
    finally { setSubmitting(false); }
  };

  if (portalLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
    </div>
  );
  if (!portal) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">Organization portal not found.</p>
    </div>
  );

  const { organization } = portal;
  const primary = organization.branding.primaryColor || "#2563eb";
  const accent = organization.branding.accentColor || "#7c3aed";
  const ringStyle = { "--tw-ring-color": primary } as React.CSSProperties;
  const isParent = form.role === "PARENT";

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-start justify-center px-4 py-10 sm:px-6">
        <div className="w-full">
          {step === "success" && (
            <div className="overflow-hidden rounded-3xl border border-white bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]" style={{ animation: "fadeUp 0.5s ease both" }}>
              <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${primary}, ${accent})` }} />
              <div className="p-10 text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full shadow-xl" style={{ background: `linear-gradient(135deg,${primary},${accent})` }}>
                  <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-black text-slate-900">You&apos;re in! 🎉</h2>
                <p className="mt-3 text-slate-600">Your account has been verified successfully. Redirecting to your dashboard…</p>
                <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full transition-all duration-75" style={{ width: `${progress}%`, background: `linear-gradient(90deg,${primary},${accent})` }} />
                </div>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="overflow-hidden rounded-3xl border border-white bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]" style={{ animation: "fadeUp 0.5s ease both" }}>
              <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${primary}, ${accent})` }} />
              <div className="p-8 sm:p-10">
                <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg" style={{ background: `linear-gradient(135deg,${primary}20,${accent}20)` }}>
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: primary }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="mt-4 text-2xl font-black text-slate-900">Check your inbox</h2>
                <p className="mt-2 text-sm text-slate-600">We sent a 6-digit OTP to <strong className="text-slate-900">{registeredEmail}</strong>.</p>
                {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                <form onSubmit={handleVerifyOtp} className="mt-6 space-y-5">
                  <FieldWrap label="OTP Code" required>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className={`${inputCls} text-center text-2xl tracking-[0.4em] font-mono`}
                      style={ringStyle}
                      placeholder="······"
                      required
                    />
                  </FieldWrap>
                  <button
                    type="submit"
                    disabled={submitting || otp.length < 6}
                    className="w-full rounded-2xl py-3.5 font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg,${primary},${accent})` }}
                  >
                    {submitting ? "Verifying…" : "Verify & Complete ✓"}
                  </button>
                  <p className="text-center text-sm text-slate-500">
                    Already registered?{" "}
                    <Link href={`/whitelabel/${slug}/login`} className="font-semibold hover:underline" style={{ color: primary }}>Log in</Link>
                  </p>
                </form>
              </div>
            </div>
          )}

          {step === "form" && (
            <div className="overflow-hidden rounded-3xl border border-white bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]" style={{ animation: "fadeUp 0.5s ease both" }}>
              <div className="relative overflow-hidden px-8 py-8 text-center sm:px-10" style={{ background: `linear-gradient(135deg,${primary}18 0%,${accent}0a 100%)` }}>
                <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full blur-3xl opacity-30" style={{ background: accent }} />
                <div className="relative flex flex-col items-center gap-5">
                  <div className="flex h-32 w-36 items-center justify-center overflow-hidden">
                    {organization.branding.logoUrl
                      ? <img src={organization.branding.logoUrl} alt="logo" className="h-full w-full object-contain" />
                      : <span className="text-5xl font-black text-slate-900">{organization.branding.companyName.charAt(0)}</span>}
                  </div>
                  <h1 className="text-2xl font-black leading-tight text-slate-900 sm:text-3xl">Create your account</h1>
                  <p className="text-sm text-slate-500">
                    Join <span className="font-semibold text-slate-800">{organization.branding.companyName}</span> and unlock your assessments.
                  </p>
                  <div className="mt-1">
                    <Link href={`/whitelabel/${slug}/login`} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:-translate-y-0.5 transition">
                      Already have an account? <span style={{ color: primary }}>Login →</span>
                    </Link>
                  </div>
                </div>
              </div>

              {error && <div className="mx-8 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-10">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-5 p-8 sm:p-10">
                <SectionDivider icon="👤" label="Personal Info" />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <FieldWrap label="First Name" required>
                    <input type="text" value={form.firstName} onChange={(e)=>setField("firstName",e.target.value)} className={inputCls} style={ringStyle} placeholder="First" required />
                  </FieldWrap>
                  <FieldWrap label="Middle Name">
                    <input type="text" value={form.middleName} onChange={(e)=>setField("middleName",e.target.value)} className={inputCls} style={ringStyle} placeholder="Middle" />
                  </FieldWrap>
                  <FieldWrap label="Last Name" required>
                    <input type="text" value={form.lastName} onChange={(e)=>setField("lastName",e.target.value)} className={inputCls} style={ringStyle} placeholder="Last" required />
                  </FieldWrap>
                  <FieldWrap label="Gender">
                    <select value={form.gender} onChange={(e)=>setField("gender",e.target.value)} className={selectCls} style={ringStyle}>
                      <option value="">Select gender</option>
                      {GENDER_OPTIONS.map((g)=><option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </FieldWrap>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FieldWrap label="Registering As" required>
                    <select
                      value={form.role}
                      onChange={(e)=>setField("role", e.target.value as "STUDENT" | "PARENT")}
                      className={selectCls}
                      style={ringStyle}
                      required
                    >
                      {LEARNER_ROLE_OPTIONS.map((roleOption)=><option key={roleOption.value} value={roleOption.value}>{roleOption.label}</option>)}
                    </select>
                  </FieldWrap>
                </div>

                <SectionDivider icon="📬" label="Contact" />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FieldWrap label="Email Address" required>
                    <input type="email" value={form.email} onChange={(e)=>setField("email",e.target.value)} className={inputCls} style={ringStyle} placeholder="you@example.com" required />
                  </FieldWrap>
                  <FieldWrap label="Phone Number" required>
                    <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-2">
                      <select value={form.phoneCode} onChange={(e)=>setField("phoneCode",e.target.value)} className={`${selectCls} min-w-0`} style={ringStyle}>
                        {PHONE_CODES.map((pc)=><option key={pc.code} value={pc.code}>{pc.flag} {pc.code}</option>)}
                      </select>
                      <input type="tel" value={form.phone} onChange={(e)=>setField("phone",e.target.value.replace(/\D/g,"").slice(0,10))} className={`${inputCls} min-w-0`} style={ringStyle} placeholder="10-digit number" maxLength={10} required />
                    </div>
                  </FieldWrap>
                </div>

                <SectionDivider icon="🎓" label="Academic" />

                <div className={isParent ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 gap-4 md:grid-cols-3"}>
                  <FieldWrap label="Institution Name">
                    <input type="text" value={form.institutionName} onChange={(e) => setField("institutionName", e.target.value)} className={inputCls} placeholder="Enter your institution name" required />
                  </FieldWrap>

                  {!isParent && (
                    <FieldWrap label="Grade / Level">
                      <select
                        value={form.grade}
                        onChange={(e) => {
                          const value = e.target.value;
                          setField("grade", value);
                          if (value !== OTHER_GRADE_VALUE) {
                            setOtherGrade("");
                          }
                        }}
                        className={selectCls}
                        style={ringStyle}
                      >
                        <option value="">Select grade</option>
                        {GRADE_OPTIONS.map((g)=><option key={g} value={g}>{g}</option>)}
                      </select>
                    </FieldWrap>
                  )}

                  {!isParent && (
                    <FieldWrap label="Division">
                      <input
                        type="text"
                        value={form.division}
                        onChange={(e)=>setField("division",e.target.value.toUpperCase().slice(0,3))}
                        className={inputCls}
                        style={ringStyle}
                        placeholder="A"
                      />
                    </FieldWrap>
                  )}

                  {!isParent && form.grade === OTHER_GRADE_VALUE && (
                    <FieldWrap label="Enter Grade" required>
                      <input
                        type="text"
                        value={otherGrade}
                        onChange={(e) => setOtherGrade(e.target.value)}
                        className={inputCls}
                        style={ringStyle}
                        placeholder="Type your grade"
                        required
                      />
                    </FieldWrap>
                  )}
                </div>

                <SectionDivider icon="🌍" label="Location" />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FieldWrap label="Country">
                    <select value={form.country} onChange={(e)=>setField("country",e.target.value)} className={selectCls} style={ringStyle}>
                      <option value="">Country</option>
                      {countries.map((c)=><option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                    </select>
                  </FieldWrap>
                  <FieldWrap label="State">
                    <select value={form.state} onChange={(e)=>setField("state",e.target.value)} disabled={!form.country} className={`${selectCls} disabled:opacity-50`} style={ringStyle}>
                      <option value="">State</option>
                      {states.map((s)=><option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                    </select>
                  </FieldWrap>
                  <FieldWrap label="City">
                    <select value={form.city} onChange={(e)=>setField("city",e.target.value)} disabled={!form.state} className={`${selectCls} disabled:opacity-50`} style={ringStyle}>
                      <option value="">City</option>
                      {cities.map((c)=><option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </FieldWrap>
                </div>

                <button type="submit" disabled={submitting} className="mt-2 w-full rounded-2xl py-4 text-base font-black text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl disabled:opacity-60" style={{ background: `linear-gradient(135deg,${primary},${accent})` }}>
                  {submitting ? "Submitting…" : "Register & Get OTP →"}
                </button>

                <p className="text-center text-sm text-slate-500">
                  Already have an account?{" "}
                  <Link href={`/whitelabel/${slug}/login`} className="font-semibold hover:underline" style={{ color: primary }}>Log in</Link>
                </p>
              </form>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-slate-400">© 2026 {organization.branding.companyName}</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
