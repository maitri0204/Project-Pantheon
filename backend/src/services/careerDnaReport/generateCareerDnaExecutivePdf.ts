import puppeteer, { type Browser } from "puppeteer";

import { buildReportHtml } from "./reportTemplate";
import type { ReportData } from "./buildCareerDnaReportData";

const PUPPETEER_LAUNCH_ARGS = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"];

async function launchPuppeteerBrowser(): Promise<Browser> {
  const baseOptions = {
    headless: true,
    args: PUPPETEER_LAUNCH_ARGS,
  } as const;

  try {
    return await puppeteer.launch(baseOptions);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("Could not find Chrome")) {
      throw error;
    }
    return puppeteer.launch({
      ...baseOptions,
      channel: "chrome",
    });
  }
}

export async function generateCareerDnaExecutivePdf(data: ReportData): Promise<Buffer> {
  const html = buildReportHtml(data);

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
