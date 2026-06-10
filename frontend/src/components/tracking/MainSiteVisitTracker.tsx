"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { trackMainSiteVisit, type MainSiteVisitPage } from "@/lib/siteVisitTracking";

const TRACKED_PATHS: Record<string, MainSiteVisitPage> = {
  "/": "home",
  "/login": "login",
};

export default function MainSiteVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const page = TRACKED_PATHS[pathname];
    if (page) {
      trackMainSiteVisit(page);
    }
  }, [pathname]);

  return null;
}
