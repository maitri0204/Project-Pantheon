"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { apiRequest, getStoredAuth, setStoredAuth } from "@/lib/api";

type Step = "form" | "otp";

type CaptchaResponse = { data: { token: string; question: string } };
type AuthResponse = {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "SUPERADMIN" | "ORG_ADMIN" | "STUDENT";
    organizationId: string | null;
    isVerified: boolean;
  };
};

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [organizationSlug, setOrganizationSlug] = useState("project-pantheon");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (getStoredAuth()) {
      router.replace("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const otpValue = useMemo(() => otp.join(""), [otp]);

  const loadCaptcha = async (): Promise<void> => {
    const response = await apiRequest<CaptchaResponse>("/auth/captcha");
    setCaptchaToken(response.data.token);
    setCaptchaQuestion(response.data.question);
    setCaptchaAnswer("");
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCaptcha();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await apiRequest<{ message: string; email: string }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          organizationSlug,
          captchaToken,
          captchaAnswer,
        }),
      });
      setMessage(response.message);
      setStep("otp");
      setCooldown(60);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign up");
      void loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await apiRequest<AuthResponse>("/auth/signup/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp: otpValue }),
      });
      setStoredAuth(response);
      router.push("/dashboard");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.16),_transparent_30%),linear-gradient(180deg,_#f8fbff,_#eef6ff_50%,_#f8fafc)] px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-lg rounded-[28px] border border-white/60 bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg">PP</div>
          <h1 className="text-3xl font-bold">Create your Pantheon account</h1>
          <p className="mt-2 text-sm text-slate-600">OTP and captcha secured signup for students and whitelabel organizations.</p>
        </div>

        {step === "form" ? (
          <form className="space-y-5" onSubmit={handleSignup}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">First name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Last name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Organization slug</label>
              <input
                type="text"
                value={organizationSlug}
                onChange={(event) => setOrganizationSlug(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="project-pantheon"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Captcha</label>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center font-mono text-xl font-bold tracking-wide text-slate-700">
                {captchaQuestion || "Loading..."}
              </div>
              <div className="mt-3 flex gap-3">
                <input
                  type="number"
                  required
                  value={captchaAnswer}
                  onChange={(event) => setCaptchaAnswer(event.target.value)}
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Enter answer"
                />
                <button
                  type="button"
                  onClick={() => void loadCaptcha()}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Refresh
                </button>
              </div>
            </div>

            {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}
            {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account and get OTP"}
            </button>

            <p className="text-center text-sm text-slate-600">
              Already registered?{" "}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                Sign in
              </Link>
            </p>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleVerify}>
            <div className="text-center">
              <h2 className="text-xl font-semibold">Verify OTP</h2>
              <p className="mt-2 text-sm text-slate-600">We sent a 6-digit code to {email}.</p>
            </div>

            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    refs.current[index] = element;
                  }}
                  value={digit}
                  inputMode="numeric"
                  maxLength={1}
                  onChange={(event) => {
                    const value = event.target.value.replace(/\D/g, "").slice(-1);
                    const next = [...otp];
                    next[index] = value;
                    setOtp(next);
                    if (value && index < next.length - 1) {
                      refs.current[index + 1]?.focus();
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace" && !otp[index] && index > 0) {
                      refs.current[index - 1]?.focus();
                    }
                  }}
                  className="h-14 w-12 rounded-2xl border border-slate-200 text-center text-xl font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              ))}
            </div>

            {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading || otpValue.length !== 6}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify and continue"}
            </button>

            <div className="text-center text-sm text-slate-600">
              {cooldown > 0 ? <span>OTP sent. You can request another in {cooldown}s.</span> : <span>Need a new OTP? Go back and sign up again.</span>}
            </div>

            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
