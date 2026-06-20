"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { City, Country, State } from "country-state-city";

type Step = "email" | "otp" | "form";

const LEGAL_ENTITY_TYPES = [
  "Proprietorship",
  "Partnership",
  "LLP (Limited Liability Partnership)",
  "Pvt Ltd (Private Limited Company)",
  "Public Limited Company",
  "Trust",
  "Society",
  "Other",
] as const;

type RegisterCompleteResponse = {
  organization: {
    slug: string;
  };
  pendingApproval?: boolean;
};

type CaptchaResponse = { data: { token: string; question: string } };

const REGISTRATION_SUCCESS_KEY = "pantheon-registration-success";

const COUNTRIES = ["India"];
const STATES = ["Maharashtra", "Gujarat", "Delhi", "Karnataka", "Tamil Nadu", "Rajasthan"];
const CITIES = ["Mumbai", "Pune", "Ahmedabad", "Surat", "New Delhi", "Bengaluru", "Chennai", "Jaipur"];

const COUNTRY_CODES = ["+91", "+1", "+44", "+61", "+65", "+971"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [signaturePreview, setSignaturePreview] = useState<string>("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [primaryCountryCode, setPrimaryCountryCode] = useState("+91");
  const [alternateCountryCode, setAlternateCountryCode] = useState("+91");
  const [selectedCountryIso, setSelectedCountryIso] = useState("IN");
  const [selectedStateIso, setSelectedStateIso] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    designation: "",
    companyName: "",
    primaryMobile: "",
    alternateMobile: "",
    email: "",
    officeAddress: "",
    registeredAddress: "",
    sameAsOfficeAddress: false,
    country: "India",
    state: "",
    city: "",
    pinCode: "",
    legalEntityType: "Trust",
    cin: "",
    llpin: "",
    udyamNumber: "",
    trustRegistrationNumber: "",
    gstNumber: "",
    website: "",
    panIndividual: "",
    panCompany: "",
    tan: "",
    bankAccountName: "",
    accountType: "Current",
    bankAccountNumber: "",
    ifscCode: "",
    logoUrl: "",
    signatureUrl: "",
  });

  const otpValue = useMemo(() => otp.join(""), [otp]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, email }));
  }, [email]);

  useEffect(() => {
    if (!formData.sameAsOfficeAddress) return;
    setFormData((prev) => ({ ...prev, registeredAddress: prev.officeAddress }));
  }, [formData.sameAsOfficeAddress, formData.officeAddress]);

  const loadCaptcha = async (): Promise<void> => {
    try {
      const response = await apiRequest<CaptchaResponse>("/auth/captcha");
      setCaptchaToken(response.data.token);
      setCaptchaQuestion(response.data.question);
      setCaptchaAnswer("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load captcha");
    }
  };

  useEffect(() => {
    void loadCaptcha();
  }, []);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxLogoSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxLogoSizeBytes) {
      setError("Logo file is too large. Please upload an image up to 2MB.");
      event.target.value = "";
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setLogoPreview(dataUrl);
      setFormData((prev) => ({ ...prev, logoUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSignatureSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSignatureSizeBytes) {
      setError("Signature file is too large. Please upload an image up to 2MB.");
      event.target.value = "";
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setSignaturePreview(dataUrl);
      setFormData((prev) => ({ ...prev, signatureUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const requestOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await apiRequest<{ message: string }>("/auth/register/request-otp", {
        method: "POST",
        body: JSON.stringify({ email, captchaToken, captchaAnswer }),
      });
      setMessage(response.message);
      setStep("otp");
      setCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      window.setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send OTP");
      void loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await apiRequest<{ message: string }>("/auth/register/request-otp", {
        method: "POST",
        body: JSON.stringify({ email, captchaToken, captchaAnswer }),
      });
      setMessage(response.message);
      setCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      window.setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to resend OTP");
      void loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await apiRequest<{ message: string }>("/auth/register/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp: otpValue }),
      });
      setMessage(response.message);
      setStep("form");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const payload = {
        ...formData,
        primaryMobile: `${primaryCountryCode}${formData.primaryMobile}`,
        alternateMobile: formData.alternateMobile
          ? `${alternateCountryCode}${formData.alternateMobile}`
          : "",
      };
      const response = await apiRequest<RegisterCompleteResponse>("/auth/register/complete", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      window.sessionStorage.setItem(
        REGISTRATION_SUCCESS_KEY,
        JSON.stringify({
          email,
          slug: response.organization.slug,
          pendingApproval: Boolean(response.pendingApproval),
        }),
      );
      router.push("/register/success");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to complete registration");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (
    key: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const selectCls = `w-full rounded-xl border border-gray-200 bg-white px-4 py-3 cursor-pointer appearance-none transition focus:outline-none focus:ring-2 focus:ring-blue-500 bg-no-repeat bg-right bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2216%27%20height=%2716%27%20fill=%22none%22%20stroke=%22%23666%22%20viewBox=%220%200%2024%2024%22%3E%3Cpath%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%20stroke-width=%222%22%20d=%22M19%209l-7%207-7-7%22/%3E%3C/svg%3E')] pr-10`;

  const steps: Array<{ key: Step; title: string; subtitle: string }> = [
    { key: "email", title: "Verify Email", subtitle: "Start with your official email" },
    { key: "otp", title: "Confirm OTP", subtitle: "Secure verification" },
    { key: "form", title: "Organization Details", subtitle: "Setup your whitelabel portal" },
  ];

  const currentStep = steps.findIndex((item) => item.key === step);

  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(() => {
    if (!selectedCountryIso) return [];
    return State.getStatesOfCountry(selectedCountryIso);
  }, [selectedCountryIso]);
  const cities = useMemo(() => {
    if (!selectedCountryIso || !selectedStateIso) return [];
    return City.getCitiesOfState(selectedCountryIso, selectedStateIso);
  }, [selectedCountryIso, selectedStateIso]);

  useEffect(() => {
    const country = countries.find((item) => item.isoCode === selectedCountryIso);
    setFormData((prev) => ({
      ...prev,
      country: country?.name || "",
      state: "",
      city: "",
    }));
    setSelectedStateIso("");
  }, [selectedCountryIso, countries]);

  useEffect(() => {
    if (!selectedStateIso) return;
    const state = states.find((item) => item.isoCode === selectedStateIso);
    setFormData((prev) => ({
      ...prev,
      state: state?.name || "",
      city: "",
    }));
  }, [selectedStateIso, states]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.28),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.22),_transparent_38%),linear-gradient(145deg,_#ecf5ff_0%,_#f8fbff_45%,_#eef2ff_100%)] px-4 py-10 text-black">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-12 top-12 h-48 w-48 rounded-3xl bg-blue-500/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-8 left-1/4 h-40 w-40 rounded-2xl bg-indigo-400/20 blur-3xl" />

        <div className="absolute right-[10%] top-20 h-16 w-16 rotate-[22deg] rounded-2xl bg-gradient-to-br from-blue-500/70 to-cyan-400/70 shadow-[0_20px_35px_rgba(14,116,255,0.25)]" />
        <div className="absolute right-[7%] top-36 h-10 w-10 -rotate-[16deg] rounded-xl bg-gradient-to-br from-indigo-500/70 to-blue-500/70 shadow-[0_14px_28px_rgba(79,70,229,0.24)]" />
        <div className="absolute left-[8%] bottom-20 h-20 w-20 rounded-full border border-blue-300/60 bg-white/50 shadow-[inset_0_0_0_8px_rgba(59,130,246,0.08)]" />
      </div>

      <div className="relative mx-auto max-w-6xl" style={{ perspective: "1200px" }}>
        <div className="relative rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-8 lg:[transform:rotateX(0.6deg)_rotateY(-0.6deg)] transition-transform duration-500 hover:lg:[transform:rotateX(0deg)_rotateY(0deg)]">
          <div className="pointer-events-none absolute right-7 top-7 hidden h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-400/20 shadow-inner sm:block" />

          <div className="mb-6 text-center">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="Logo" className="h-20 w-auto mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-black">Whitelabel Registration</h1>
            <p className="mt-1 text-base text-black/80">Register your organization, verify email with OTP, and launch a premium assessment portal.</p>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
            {steps.map((item, index) => {
              const active = currentStep === index;
              const done = currentStep > index;
              return (
                <div key={item.key} className={`rounded-2xl border px-3 py-3 sm:px-4 ${active ? "border-blue-300 bg-blue-50" : done ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-white"}`}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${done ? "bg-emerald-500 text-white" : active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>
                      {done ? "✓" : index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-black">{item.title}</p>
                      <p className="truncate text-xs text-black/70">{item.subtitle}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="my-5 h-2 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
          </div>

          {error ? <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p> : null}

          {step === "email" && (
            <form onSubmit={requestOtp} className="mx-auto w-full max-w-xl space-y-5 rounded-2xl border border-blue-100/70 bg-gradient-to-b from-white to-blue-50/30 p-5">
              <div>
                <label className="mb-2 block text-base font-semibold text-black">Email for registration <span className="text-red-600">*</span></label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="name@company.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-base font-semibold text-black">Security check <span className="text-red-600">*</span></label>
                <p className="mb-2 text-sm text-black/70">Solve: {captchaQuestion || "Loading..."}</p>
                <input
                  type="text"
                  required
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter answer"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-60"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={verifyOtp} className="mx-auto w-full max-w-xl space-y-5 rounded-2xl border border-blue-100/70 bg-gradient-to-b from-white to-cyan-50/30 p-5">
              <p className="text-base text-black/80">Enter the OTP sent to <span className="font-semibold text-black">{email}</span>.</p>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      otpRefs.current[index] = element;
                    }}
                    value={digit}
                    inputMode="numeric"
                    maxLength={1}
                    onChange={(event) => {
                      const value = event.target.value.replace(/\D/g, "").slice(-1);
                      const next = [...otp];
                      next[index] = value;
                      setOtp(next);
                      if (value && index < next.length - 1) otpRefs.current[index + 1]?.focus();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Backspace" && !otp[index] && index > 0) {
                        otpRefs.current[index - 1]?.focus();
                      }
                    }}
                    className="h-12 w-11 rounded-xl border border-gray-200 bg-white text-center text-lg font-semibold shadow-sm"
                  />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={loading || otpValue.length !== 6}
                  className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-60"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                {cooldown > 0 ? (
                  <span className="text-sm text-black/70">Resend in {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void resendOtp()}
                    className="text-sm font-semibold text-blue-600"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {step === "form" && (
            <form onSubmit={completeRegistration} className="space-y-8">
              <section className="space-y-4 rounded-2xl border border-blue-100/70 bg-gradient-to-b from-white to-blue-50/25 p-5 md:p-6">
                <h2 className="text-2xl font-bold text-black">Organization Profile</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold">First Name <span className="text-red-600">*</span></label>
                    <input value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} required placeholder="First Name" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Middle Name</label>
                    <input value={formData.middleName} onChange={(e) => updateField("middleName", e.target.value)} placeholder="Middle Name (optional)" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Last Name <span className="text-red-600">*</span></label>
                    <input value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} required placeholder="Last Name" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Designation <span className="text-red-600">*</span></label>
                    <input value={formData.designation} onChange={(e) => updateField("designation", e.target.value)} required maxLength={100} placeholder="e.g. Director, Managing Partner" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Company Name <span className="text-red-600">*</span></label>
                    <input value={formData.companyName} onChange={(e) => updateField("companyName", e.target.value)} required maxLength={200} placeholder="Registered company name" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">Primary Mobile Number <span className="text-red-600">*</span></label>
                    <div className="grid grid-cols-[90px_1fr] gap-2">
                      <select value={primaryCountryCode} onChange={(e) => setPrimaryCountryCode(e.target.value)} className={selectCls}>
                        {COUNTRY_CODES.map((code) => <option key={code} value={code}>{code}</option>)}
                      </select>
                      <input value={formData.primaryMobile} onChange={(e) => updateField("primaryMobile", e.target.value.replace(/\D/g, "").slice(0, 10))} required pattern="^\d{10}$" placeholder="10-digit number" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">Alternate Mobile Number</label>
                    <div className="grid grid-cols-[90px_1fr] gap-2">
                      <select value={alternateCountryCode} onChange={(e) => setAlternateCountryCode(e.target.value)} className={selectCls}>
                        {COUNTRY_CODES.map((code) => <option key={code} value={code}>{code}</option>)}
                      </select>
                      <input value={formData.alternateMobile} onChange={(e) => updateField("alternateMobile", e.target.value.replace(/\D/g, "").slice(0, 10))} pattern="^\d{10}$" placeholder="10-digit number (optional)" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">Email <span className="text-red-600">*</span></label>
                    <input value={formData.email} readOnly required className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold">Website <span className="text-red-600">*</span></label>
                    <input value={formData.website} onChange={(e) => updateField("website", e.target.value)} required placeholder="Website (https://yourdomain.com)" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold">Office Address <span className="text-red-600">*</span></label>
                    <textarea value={formData.officeAddress} onChange={(e) => updateField("officeAddress", e.target.value)} required maxLength={500} placeholder="Complete office address" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold">Registered Address <span className="text-red-600">*</span></label>
                    <textarea value={formData.registeredAddress} onChange={(e) => updateField("registeredAddress", e.target.value)} required maxLength={500} placeholder="Complete registered address" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium text-black md:col-span-2">
                    <input type="checkbox" checked={formData.sameAsOfficeAddress} onChange={(e) => updateField("sameAsOfficeAddress", e.target.checked)} />
                    Same as Office Address
                  </label>

                  <div>
                    <label className="mb-1 block text-sm font-semibold">Country <span className="text-red-600">*</span></label>
                    <select value={selectedCountryIso} onChange={(e) => setSelectedCountryIso(e.target.value)} required className={selectCls}>
                      <option value="">Select Country</option>
                      {countries.map((country) => <option key={country.isoCode} value={country.isoCode}>{country.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">State <span className="text-red-600">*</span></label>
                    <select value={selectedStateIso} onChange={(e) => setSelectedStateIso(e.target.value)} required className={`${selectCls} disabled:opacity-50`} disabled={!selectedCountryIso}>
                      <option value="">Select State</option>
                      {states.map((state) => <option key={state.isoCode} value={state.isoCode}>{state.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">City <span className="text-red-600">*</span></label>
                    <select value={formData.city} onChange={(e) => updateField("city", e.target.value)} required className={`${selectCls} disabled:opacity-50`} disabled={!selectedStateIso}>
                      <option value="">Select City</option>
                      {cities.map((city) => <option key={`${city.stateCode}-${city.name}`} value={city.name}>{city.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">PIN Code <span className="text-red-600">*</span></label>
                    <input value={formData.pinCode} onChange={(e) => updateField("pinCode", e.target.value.replace(/\D/g, "").slice(0, 6))} required pattern="^\d{6}$" placeholder="6-digit PIN Code" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                  </div>
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-cyan-100/70 bg-gradient-to-b from-white to-cyan-50/25 p-5 md:p-6">
                <h2 className="text-2xl font-bold text-black">Business Registration Details</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-semibold">Legal Entity Type <span className="text-red-600">*</span></label>
                    <select value={formData.legalEntityType} disabled className={`${selectCls} disabled:opacity-50 bg-gray-50`}>
                      {LEGAL_ENTITY_TYPES.map((entity) => (
                        <option key={entity} value={entity}>{entity}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Trust Registration Number <span className="text-red-600">*</span></label>
                    <input value={formData.trustRegistrationNumber} onChange={(e) => updateField("trustRegistrationNumber", e.target.value)} required placeholder="Trust Registration Number" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">GST Number <span className="text-red-600">*</span></label>
                    <input value={formData.gstNumber} onChange={(e) => updateField("gstNumber", e.target.value.toUpperCase())} required maxLength={15} placeholder="GST Number" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                  </div>
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-indigo-100/70 bg-gradient-to-b from-white to-indigo-50/25 p-5 md:p-6">
                <h2 className="text-2xl font-bold text-black">Tax & Financial Details</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold">PAN Card (Individual) <span className="text-red-600">*</span></label>
                    <input value={formData.panIndividual} onChange={(e) => updateField("panIndividual", e.target.value.toUpperCase())} required maxLength={10} pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$" placeholder="PAN Card (Individual)" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">PAN Card (Company) <span className="text-red-600">*</span></label>
                    <input value={formData.panCompany} onChange={(e) => updateField("panCompany", e.target.value.toUpperCase())} required maxLength={10} pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$" placeholder="PAN Card (Company)" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">TAN</label>
                    <input value={formData.tan} onChange={(e) => updateField("tan", e.target.value.toUpperCase())} maxLength={10} placeholder="TAN (optional)" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Bank Account Name <span className="text-red-600">*</span></label>
                    <input value={formData.bankAccountName} onChange={(e) => updateField("bankAccountName", e.target.value)} required maxLength={200} placeholder="Bank Account Name" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Account Type <span className="text-red-600">*</span></label>
                    <select value={formData.accountType} onChange={(e) => updateField("accountType", e.target.value)} required className={selectCls}>
                      <option value="">Select Account Type</option>
                      <option value="Saving">Saving</option>
                      <option value="Current">Current</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">Bank Account Number <span className="text-red-600">*</span></label>
                    <input value={formData.bankAccountNumber} onChange={(e) => updateField("bankAccountNumber", e.target.value.replace(/\D/g, "").slice(0, 18))} required maxLength={18} pattern="^\d{9,18}$" placeholder="Bank Account Number" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold">IFSC Code <span className="text-red-600">*</span></label>
                    <input value={formData.ifscCode} onChange={(e) => updateField("ifscCode", e.target.value.toUpperCase())} required maxLength={11} pattern="^[A-Z]{4}0[A-Z0-9]{6}$" placeholder="IFSC Code" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3" />
                  </div>
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-blue-100/70 bg-gradient-to-b from-white to-sky-50/25 p-5 md:p-6">
                <h2 className="text-2xl font-bold text-black">Logo <span className="text-red-600">*</span></h2>
                <div className="space-y-3">
                  <label className="relative inline-block cursor-pointer w-full">
                    <input type="file" accept="image/*" onChange={handleLogoUpload} required className="hidden" />
                    <div className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-center font-medium text-gray-600 hover:border-blue-400 hover:bg-blue-50 transition">
                      Click to select logo
                    </div>
                  </label>
                  {logoPreview ? <img src={logoPreview} alt="Logo preview" className="h-16 w-16 rounded object-cover border border-gray-200" /> : null}
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-blue-100/70 bg-gradient-to-b from-white to-sky-50/25 p-5 md:p-6">
                <h2 className="text-2xl font-bold text-black">Signature <span className="text-red-600">*</span></h2>
                <p className="text-sm text-black/70">Note: Please upload signature with background removed (transparent background preferred).</p>
                <div className="space-y-3">
                  <label className="relative inline-block cursor-pointer w-full">
                    <input type="file" accept="image/*" onChange={handleSignatureUpload} required className="hidden" />
                    <div className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-center font-medium text-gray-600 hover:border-blue-400 hover:bg-blue-50 transition">
                      Click to select signature
                    </div>
                  </label>
                  {signaturePreview ? <img src={signaturePreview} alt="Signature preview" className="h-16 w-32 rounded object-contain border border-gray-200 bg-white" /> : null}
                </div>
              </section>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-60 md:w-auto"
              >
                {loading ? "Submitting..." : "Complete Registration"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}