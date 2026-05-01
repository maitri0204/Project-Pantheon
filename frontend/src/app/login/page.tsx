"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { apiRequest, getStoredAuth, setStoredAuth } from "@/lib/api";

type Step = "email" | "otp";

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

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
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
    const timer = window.setTimeout(() => {
      void loadCaptcha();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const resendOtp = async (): Promise<void> => {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await apiRequest<{ message: string; email: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, captchaToken, captchaAnswer }),
      });
      setMessage(response.message);
      setCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      window.setTimeout(() => refs.current[0]?.focus(), 100);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to resend OTP");
      void loadCaptcha();
      setStep("email");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await apiRequest<{ message: string; email: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, captchaToken, captchaAnswer }),
      });
      setMessage(response.message);
      setStep("otp");
      setCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      window.setTimeout(() => refs.current[0]?.focus(), 100);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send OTP");
      void loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await apiRequest<AuthResponse>("/auth/login/verify-otp", {
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-12 text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-10 top-16 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-lg font-bold text-white shadow-lg">PP</div>
          <h1 className="text-4xl font-bold text-slate-900">Welcome</h1>
          <p className="mt-2 text-slate-600">Project Pantheon Platform</p>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl">

        {step === "email" ? (
          <form className="space-y-5" onSubmit={handleSendOtp}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Captcha</label>
              <div className="rounded-2xl border-2 border-slate-300 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 px-4 py-3 text-center font-mono text-xl font-bold tracking-wide text-slate-700">
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
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

            <p className="text-center text-sm text-slate-600">
              New here?{" "}
              <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
                Create an account
              </Link>
            </p>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleVerifyOtp}>
            <div className="text-center">
              <h2 className="text-xl font-semibold">Enter OTP</h2>
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
              {cooldown > 0 ? (
                <span>Resend OTP in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  className="font-semibold text-blue-600"
                  onClick={() => void resendOtp()}
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp(["", "", "", "", "", ""]);
              }}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Back
            </button>
          </form>
        )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">© {new Date().getFullYear()} Project Pantheon</p>
      </div>
    </div>
  );
}
