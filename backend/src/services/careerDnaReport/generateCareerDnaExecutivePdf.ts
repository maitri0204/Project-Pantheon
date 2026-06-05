import puppeteer, { type Browser } from "puppeteer-core";

import { buildCareerDnaExecutiveHtml } from "./buildCareerDnaExecutiveHtml";
import type { ReportData } from "./buildCareerDnaReportData";
import { resolveChromeExecutable } from "./resolveChromeExecutable";

const PUPPETEER_LAUNCH_ARGS = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"];

async function launchPuppeteerBrowser(): Promise<Browser> {
  const executablePath = await resolveChromeExecutable();
  if (!executablePath) {
    throw new Error(
      "Server-side Career DNA PDF rendering is unavailable. Use the HTML report endpoint and client-side PDF capture instead.",
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
    throw new Error(`Failed to launch Chrome for Career DNA PDF rendering. (${detail})`);
  }
}

/** Optional server-side PDF (requires Chrome). Prefer client-side capture via career-dna-report-html. */
export async function generateCareerDnaExecutivePdf(data: ReportData): Promise<Buffer> {
  const html = buildCareerDnaExecutiveHtml(data);
  const browser = await launchPuppeteerBrowser();

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load", timeout: 120_000 });

    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    return Buffer.from(buffer);
  } finally {
    await browser.close();
  }
}
