import fs from "fs";
import path from "path";

const PUBLIC_ASSET_ROOTS = [
  path.join(process.cwd(), "..", "frontend", "public"),
  path.join(process.cwd(), "frontend", "public"),
  path.join(__dirname, "..", "..", "..", "..", "frontend", "public"),
  path.join(__dirname, "..", "..", "..", "frontend", "public"),
];

/** Resolve a frontend public asset path (e.g. /career-dna/cover.jpg) on the server filesystem. */
export function resolvePublicReportAsset(webPath: string): string {
  const relative = webPath.replace(/^\//, "");
  for (const root of PUBLIC_ASSET_ROOTS) {
    const candidate = path.join(root, relative);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Report public asset not found: ${webPath}`);
}

export function publicAssetToDataUrl(webPath: string): string {
  const filePath = resolvePublicReportAsset(webPath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  const base64 = fs.readFileSync(filePath).toString("base64");
  return `data:${mime};base64,${base64}`;
}
