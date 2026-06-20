"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { apiRequest, clearStoredAuth, getStoredAuth, setStoredAuth } from "@/lib/api";
import { STUDENT_REGISTER_URL } from "@/lib/studentRegisterUrl";

type Step = "email" | "otp";

type CaptchaResponse = { data: { token: string; question: string } };
type AuthResponse = {
  token: string;
  orgSlug?: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "SUPERADMIN" | "ORG_ADMIN" | "STUDENT" | "PARENT" | "REVIEWER";
    organizationId: string | null;
    isVerified: boolean;
  };
};

const isLearnerRole = (role: AuthResponse["user"]["role"]): boolean => role === "STUDENT" || role === "PARENT";

type OrganizationBranding = {
  slug?: string;
  companyName: string;
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
};

type LoginPageContentProps = {
  forcedOrganizationSlug?: string;
};

export default function LoginPageContent({ forcedOrganizationSlug }: LoginPageContentProps) {
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
  const [orgBranding, setOrgBranding] = useState<OrganizationBranding | null>(null);
  const [organizationSlug, setOrganizationSlug] = useState<string>("");
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const appHost = (process.env.NEXT_PUBLIC_APP_HOST || "assessments.admitra.io").toLowerCase().trim();

  useEffect(() => {
    if (!error) return;
    const t = window.setTimeout(() => setError(null), 4000);
    return () => window.clearTimeout(t);
  }, [error]);

  const portalOrganizationSlug = useMemo(() => {
    const forcedSlug = forcedOrganizationSlug?.toLowerCase().trim();
    return forcedSlug || organizationSlug;
  }, [forcedOrganizationSlug, organizationSlug]);

  useEffect(() => {
    let cancelled = false;

    const validateAndRedirect = async () => {
      const auth = getStoredAuth();
      if (!auth) {
        return;
      }

      const validationPath = isLearnerRole(auth.user.role)
        ? "/platform/student/dashboard"
        : "/platform/dashboard";

      try {
        await apiRequest(validationPath, {}, auth.token);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("validateAndRedirect: token validation failed", err);
        if (!cancelled) {
          clearStoredAuth();
        }
        return;
      }

      if (cancelled) {
        return;
      }

      if (auth.user.role === "ORG_ADMIN" && (portalOrganizationSlug || auth.orgSlug)) {
        router.replace(`/whitelabel/${portalOrganizationSlug || auth.orgSlug}/dashboard`);
        return;
      }

      if (isLearnerRole(auth.user.role) && (portalOrganizationSlug || auth.orgSlug)) {
        router.replace(`/whitelabel/${portalOrganizationSlug || auth.orgSlug}/student/dashboard`);
        return;
      }

      if (auth.user.role === "REVIEWER") {
        router.replace("/reviewer/payment");
        return;
      }

      if (auth.user.role === "SUPERADMIN") {
        router.replace("/dashboard");
        return;
      }

      clearStoredAuth();
      setError("Please sign in through your organization's portal link.");
    };

    void validateAndRedirect();

    return () => {
      cancelled = true;
    };
  }, [portalOrganizationSlug, router]);

  useEffect(() => {
    const loadOrgBranding = async () => {
      if (typeof window === "undefined") return;

      const forcedSlug = forcedOrganizationSlug?.toLowerCase().trim();
      const requestedSlug = forcedSlug;

      if (requestedSlug) {
        setOrganizationSlug(requestedSlug);
        try {
          const response = await apiRequest<{
            organization: { slug: string; branding: OrganizationBranding };
          }>(`/platform/whitelabel/${requestedSlug}`);
          if (response.organization?.branding) {
            setOrgBranding({
              ...response.organization.branding,
              slug: response.organization.slug,
            });
          }
        } catch (err) {
          // Fallback to default branding; log for diagnostics
          // eslint-disable-next-line no-console
          console.warn("loadOrgBranding: failed to load branding for slug", requestedSlug, err);
        }
        return;
      }

      const hostname = window.location.hostname.toLowerCase().trim();
      const isMainAppHost = ["localhost", "127.0.0.1", appHost, "assessments.admitra.io", "www.assessments.admitra.io"].includes(hostname);

      if (isMainAppHost) {
        // Main platform login should never inherit whitelabel branding
        setOrganizationSlug("");
        setOrgBranding(null);
        return;
      }

      if (!["localhost", "127.0.0.1"].includes(hostname)) {
        try {
          const response = await apiRequest<{
            organization: { slug: string; branding: OrganizationBranding };
          }>(`/platform/whitelabel-by-host?host=${encodeURIComponent(hostname)}`);
          if (response.organization?.branding) {
            setOrganizationSlug(response.organization.slug);
            setOrgBranding({
              ...response.organization.branding,
              slug: response.organization.slug,
            });
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn("loadOrgBranding: failed to load branding by host", hostname, err);
          const parts = hostname.split(".");
          if (parts.length > 2 && parts[0] !== "www") {
            const slug = parts[0];
            setOrganizationSlug(slug);
            try {
              const response = await apiRequest<{
                organization: { slug: string; branding: OrganizationBranding };
              }>(`/platform/whitelabel/${slug}`);
              if (response.organization?.branding) {
                setOrgBranding({
                  ...response.organization.branding,
                  slug: response.organization.slug,
                });
              }
            } catch (err) {
              // eslint-disable-next-line no-console
              console.debug("Failed to load organization branding", err);
            }
          }
        }
      }
    };

    void loadOrgBranding();
  }, [forcedOrganizationSlug]);

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
        body: JSON.stringify({
          email,
          captchaToken,
          captchaAnswer,
          organizationSlug: portalOrganizationSlug || undefined,
        }),
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
        body: JSON.stringify({
          email,
          captchaToken,
          captchaAnswer,
          organizationSlug: portalOrganizationSlug || undefined,
        }),
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
        body: JSON.stringify({
          email,
          otp: otpValue,
          organizationSlug: portalOrganizationSlug || undefined,
        }),
      });
      const resolvedOrgSlug = (portalOrganizationSlug || response.orgSlug || "").toLowerCase().trim() || undefined;
      const { orgSlug: _responseOrgSlug, ...authPayload } = response;

      // Determine branding to persist in stored auth
      let finalOrgCompanyName: string | undefined = undefined;
      let finalOrgLogoUrl: string | undefined = undefined;
      const finalOrgSlug = resolvedOrgSlug || portalOrganizationSlug || undefined;

      if (portalOrganizationSlug && response.user.role !== "SUPERADMIN" && orgBranding) {
        finalOrgCompanyName = orgBranding.companyName;
        finalOrgLogoUrl = orgBranding.logoUrl;
      } else if (finalOrgSlug && response.user.role !== "SUPERADMIN") {
        // If we have an org slug but no branding loaded from host, try to fetch branding
        try {
          const brandingRes = await apiRequest<{ organization: { branding?: OrganizationBranding } }>(
            `/platform/whitelabel/${finalOrgSlug}`
          );
          if (brandingRes.organization?.branding) {
            finalOrgCompanyName = brandingRes.organization.branding.companyName;
            finalOrgLogoUrl = brandingRes.organization.branding.logoUrl;
          }
        } catch (err) {
          // ignore; UI will fallback to initials
        }
      }

      setStoredAuth({
        ...authPayload,
        ...(finalOrgSlug && response.user.role !== "SUPERADMIN"
          ? { orgSlug: finalOrgSlug, organizationSlug: finalOrgSlug }
          : {}),
        ...(finalOrgCompanyName ? { orgCompanyName: finalOrgCompanyName } : {}),
        ...(finalOrgLogoUrl ? { orgLogoUrl: finalOrgLogoUrl } : {}),
      });
      if (response.user.role === "REVIEWER") {
        router.push("/reviewer/payment");
        return;
      }
      if (response.user.role === "ORG_ADMIN" && resolvedOrgSlug) {
        router.push(`/whitelabel/${resolvedOrgSlug}/dashboard`);
        return;
      }
      if (isLearnerRole(response.user.role) && resolvedOrgSlug) {
        router.push(`/whitelabel/${resolvedOrgSlug}/student/dashboard`);
        return;
      }
      if (response.user.role === "SUPERADMIN") {
        router.push("/dashboard");
        return;
      }

      if (portalOrganizationSlug) {
        router.push(
          response.user.role === "ORG_ADMIN"
            ? `/whitelabel/${portalOrganizationSlug}/dashboard`
            : isLearnerRole(response.user.role)
              ? `/whitelabel/${portalOrganizationSlug}/student/dashboard`
              : `/whitelabel/${portalOrganizationSlug}`
        );
        return;
      }

      clearStoredAuth();
      setError("Your account is not linked to a portal. Please use your organization's login link.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden px-4 py-12 text-slate-900"
      style={{
        background: orgBranding
          ? `linear-gradient(135deg, ${orgBranding.primaryColor}10 0%, ${orgBranding.accentColor}10 100%)`
          : "linear-gradient(to bottom right, rgb(240, 249, 255) 0%, rgb(255, 255, 255) 50%, rgb(240, 248, 255) 100%)"
      }}
    >
      {/* Top panel removed to keep login focused; logo will be centered above the form */}

      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-10 top-16 h-72 w-72 rounded-full blur-3xl"
          style={{
            backgroundColor: orgBranding ? `${orgBranding.primaryColor}40` : "rgb(96, 165, 250, 0.2)"
          }}
        />
        <div
          className="absolute bottom-10 right-10 h-96 w-96 rounded-full blur-3xl"
          style={{
            backgroundColor: orgBranding ? `${orgBranding.accentColor}40` : "rgb(34, 211, 238, 0.2)"
          }}
        />
      </div>

      <div className="relative mx-auto max-w-md">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Assessment Center logo" className="h-20 w-auto" />
        </div>
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900">Welcome</h1>
          <p className="mt-2 text-slate-600">
            {orgBranding ? orgBranding.companyName : "Assessment Centre Platform"}
          </p>
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
                className="w-full rounded-2xl px-4 py-3 font-semibold text-white shadow-lg transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: orgBranding
                    ? `linear-gradient(to right, ${orgBranding.primaryColor}, ${orgBranding.accentColor})`
                    : "linear-gradient(to right, rgb(37, 99, 235), rgb(6, 182, 212))",
                  boxShadow: orgBranding ? `0 10px 15px -3px ${orgBranding.primaryColor}20` : undefined
                }}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <p className="text-center text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <a
                  href={STUDENT_REGISTER_URL}
                  className="font-semibold hover:opacity-80"
                  style={{ color: orgBranding?.primaryColor || "#2563eb" }}
                >
                  Register
                </a>
              </p>

              {portalOrganizationSlug ? (
                <p className="text-center text-xs text-slate-500">
                  This login is restricted to users of this organization portal.
                </p>
              ) : null}

              {/* Registering a whitelabel organization? Start here
              {!portalOrganizationSlug ? (
                <p className="text-center text-sm text-slate-600">
                  Registering a whitelabel organization?{" "}
                  <Link href="/register" className="font-semibold hover:opacity-80" style={{ color: orgBranding?.primaryColor || "#2563eb" }}>
                    Start here
                  </Link>
                </p>
              ) : null}
              */}
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
                className="w-full rounded-2xl px-4 py-3 font-semibold text-white shadow-lg transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: orgBranding
                    ? `linear-gradient(to right, ${orgBranding.primaryColor}, ${orgBranding.accentColor})`
                    : "linear-gradient(to right, rgb(37, 99, 235), rgb(6, 182, 212))",
                  boxShadow: orgBranding ? `0 10px 15px -3px ${orgBranding.primaryColor}20` : undefined
                }}
              >
                {loading ? "Verifying..." : "Verify and continue"}
              </button>

              <div className="text-center text-sm text-slate-600">
                {cooldown > 0 ? (
                  <span>Resend OTP in {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    className="font-semibold hover:opacity-80"
                    style={{ color: orgBranding?.primaryColor || "#2563eb" }}
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

        <p className="mt-6 text-center text-xs text-slate-400">© {new Date().getFullYear()} {orgBranding?.companyName || "Assessment Centre"}</p>
      </div>
    </div>
  );
}
