import { jsPDF } from "jspdf";

import {
  addCanvasToPdfPage,
  captureElementToCanvas,
  STUDY_ABROAD_A4,
  waitForReportRender,
} from "@/lib/reports/studyAbroadPdfCapture";
import { applyReportCaptureSandbox } from "@/lib/reports/reportCaptureSandbox";

const IFRAME_STYLE: Partial<CSSStyleDeclaration> = {
  position: "fixed",
  left: "-10000px",
  top: "0",
  width: `${STUDY_ABROAD_A4.widthPx}px`,
  height: `${STUDY_ABROAD_A4.heightPx}px`,
  border: "0",
  opacity: "1",
  pointerEvents: "none",
};

function waitForIframeLoad(iframe: HTMLIFrameElement): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("Career DNA report HTML failed to load")), 30_000);
    iframe.addEventListener(
      "load",
      () => {
        window.clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });
}

/** Render executive report HTML in a hidden iframe and capture each `.page` to a multi-page A4 PDF. */
export async function captureCareerDnaHtmlToPdf(html: string): Promise<Blob> {
  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, IFRAME_STYLE);
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("tabindex", "-1");
  applyReportCaptureSandbox(iframe);
  document.body.appendChild(iframe);

  try {
    iframe.srcdoc = html;
    await waitForIframeLoad(iframe);

    const doc = iframe.contentDocument;
    if (!doc?.body) {
      throw new Error("Career DNA report document is unavailable");
    }

    await waitForReportRender(doc.body);

    const pages = Array.from(doc.querySelectorAll<HTMLElement>(".page"));
    if (pages.length === 0) {
      throw new Error("Career DNA report pages failed to render");
    }

    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
      compress: true,
    });

    for (let index = 0; index < pages.length; index += 1) {
      const page = pages[index];
      page.style.margin = "0";
      page.style.boxShadow = "none";
      const canvas = await captureElementToCanvas(page);
      addCanvasToPdfPage(pdf, canvas, index);
    }

    return pdf.output("blob");
  } finally {
    iframe.remove();
  }
}
