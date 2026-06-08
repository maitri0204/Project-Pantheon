import puppeteer, { type Browser } from "puppeteer-core";

import { buildReportHtml } from "./htmlBuilder";
import { mergeCareerCompassReportPdf } from "./mergeCareerCompassPdf";
import type { CareerCompassAssessmentData } from "./types";
import { resolveChromeExecutable } from "../careerDnaReport/resolveChromeExecutable";

const PUPPETEER_LAUNCH_ARGS = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"];

async function launchPuppeteerBrowser(): Promise<Browser> {
  const executablePath = await resolveChromeExecutable();
  if (!executablePath) {
    throw new Error(
      "Server-side Career Compass PDF rendering is unavailable. Chrome is required on the backend host.",
    );
  }

  try {
    const chromium = await import("@sparticuz/chromium").catch(() => null);
    const args = process.platform === "linux" && chromium?.default?.args
      ? chromium.default.args
      : PUPPETEER_LAUNCH_ARGS;

    return await puppeteer.launch({
      executablePath,
      headless: true,
      args,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to launch Chrome for Career Compass PDF rendering. (${detail})`);
  }
}

export async function generateCareerCompassReportPdf(data: CareerCompassAssessmentData): Promise<Buffer> {
  const html = buildReportHtml(data);
  const browser = await launchPuppeteerBrowser();

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load", timeout: 120_000 });

    const contentBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    return mergeCareerCompassReportPdf(Buffer.from(contentBuffer));
  } finally {
    await browser.close();
  }
}
