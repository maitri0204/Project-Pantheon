import { publicAssetToDataUrl } from "./resolvePublicReportAsset";

const PUBLIC_ASSET_SRC_PATTERN = /src="(\/(?:career-dna|metacognition-test|clear-report)\/[^"]+)"/g;

/** Inline cover/back-cover images so Puppeteer can render them without a browser origin. */
export function embedPublicAssetsInHtml(html: string): string {
  return html.replace(PUBLIC_ASSET_SRC_PATTERN, (_match, webPath: string) => {
    const dataUrl = publicAssetToDataUrl(webPath);
    return `src="${dataUrl}"`;
  });
}
