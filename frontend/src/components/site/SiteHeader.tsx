"use client";

import NavAuth from "./NavAuth";

export default function SiteHeader() {
  return (
    <header className="app-panel flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="Logo" className="h-16 w-auto sm:h-20" />
      </div>
      <NavAuth />
    </header>
  );
}
