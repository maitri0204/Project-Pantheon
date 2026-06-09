import puppeteer, { type Browser } from "puppeteer-core";

import { embedPublicAssetsInHtml } from "./embedPublicAssetsInHtml";
import { resolveChromeExecutable } from "../careerDnaReport/resolveChromeExecutable";

const PUPPETEER_LAUNCH_ARGS = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"];

async function launchPuppeteerBrowser(): Promise<Browser> {
  const executablePath = await resolveChromeExecutable();
  if (!executablePath) {
    throw new Error(
      "Server-side report PDF rendering is unavailable. Chrome is required on the backend host.",
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
    throw new Error(`Failed to launch Chrome for report PDF rendering. (${detail})`);
  }
}

/** Render assessment report HTML to PDF with embedded public cover assets. */
export async function renderHtmlReportPdf(html: string): Promise<Buffer> {
  const embeddedHtml = embedPublicAssetsInHtml(html);
  const browser = await launchPuppeteerBrowser();

  try {
    const page = await browser.newPage();
    await page.setContent(embeddedHtml, { waitUntil: "load", timeout: 120_000 });

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
