"use client";

import NavAuth from "./NavAuth";

export default function SiteHeader() {
  return (
    <header className="app-panel flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">Assessment Center</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Comprehensive assessment platform for organizations</h1>
        </div>
      </div>
      <NavAuth />
    </header>
  );
}
