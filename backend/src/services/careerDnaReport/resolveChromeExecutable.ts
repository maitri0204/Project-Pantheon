import { existsSync } from "fs";
import path from "path";

const MAC_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const LINUX_CHROME_CANDIDATES = [
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
];

async function resolveSparticuzChromium(): Promise<string | undefined> {
  if (process.platform !== "linux" && process.platform !== "win32") {
    return undefined;
  }

  try {
    const chromium = await import("@sparticuz/chromium");
    const executablePath = await chromium.default.executablePath();
    return executablePath && existsSync(executablePath) ? executablePath : undefined;
  } catch {
    return undefined;
  }
}

async function resolvePuppeteerCacheChrome(): Promise<string | undefined> {
  try {
    const { Browser, computeExecutablePath, detectBrowserPlatform, resolveBuildId } = await import(
      "@puppeteer/browsers"
    );
    const platform = detectBrowserPlatform();
    if (!platform) {
      return undefined;
    }

    const buildId = await resolveBuildId(Browser.CHROME, platform, "stable");
    const cacheDir = process.env.PUPPETEER_CACHE_DIR || path.join(process.cwd(), ".cache", "puppeteer");
    const executablePath = computeExecutablePath({
      browser: Browser.CHROME,
      buildId,
      cacheDir,
    });

    return existsSync(executablePath) ? executablePath : undefined;
  } catch {
    return undefined;
  }
}

/** Resolve a Chrome/Chromium binary for optional server-side PDF rendering. */
export async function resolveChromeExecutable(): Promise<string | undefined> {
  const configured = process.env.PUPPETEER_EXECUTABLE_PATH?.trim();
  if (configured && existsSync(configured)) {
    return configured;
  }

  if (process.platform === "darwin" && existsSync(MAC_CHROME)) {
    return MAC_CHROME;
  }

  for (const candidate of LINUX_CHROME_CANDIDATES) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  const sparticuz = await resolveSparticuzChromium();
  if (sparticuz) {
    return sparticuz;
  }

  return resolvePuppeteerCacheChrome();
}
