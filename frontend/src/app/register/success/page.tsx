"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function RegistrationSuccessPageInner() {
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "your registered email";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl md:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg className="h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-center text-3xl font-bold text-slate-900">Registration Completed Successfully</h1>
        <p className="mt-4 text-center text-base text-slate-700">
          Your whitelabel organization registration is complete.
        </p>
        <p className="mt-2 text-center text-base text-slate-700">
          Please check <span className="font-semibold text-slate-900">{email}</span> for your portal login link and credentials.
        </p>

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          You will receive an email containing:
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Your organization portal login link</li>
            <li>Your login email</li>
            <li>Next steps for accessing the dashboard</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="w-full rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
          >
            Go to Main Login
          </Link>
          <Link
            href="/"
            className="w-full rounded-xl border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <Suspense>
      <RegistrationSuccessPageInner />
    </Suspense>
  );
}
