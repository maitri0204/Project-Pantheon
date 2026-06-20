import type { jsPDF } from "jspdf";
import { jsPDF as JsPDFConstructor } from "jspdf";

import {
  STUDY_ABROAD_A4,
  waitForReportRender,
} from "@/lib/reports/studyAbroadPdfCapture";
import { applyReportCaptureSandbox } from "@/lib/reports/reportCaptureSandbox";

/** Lower scale + JPEG keeps the 22-page TEST report under ~3 MB. */
const METACOGNITION_CAPTURE_SCALE = 1.25;
const METACOGNITION_JPEG_QUALITY = 0.84;
const CHART_SVG_RASTER_SCALE = 3;
const DEFAULT_SVG_RASTER_SCALE = 1;

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
    const timeout = window.setTimeout(() => reject(new Error("TEST report HTML failed to load")), 30_000);
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

async function rasterizeSvgsInPage(page: HTMLElement): Promise<void> {
  const svgs = Array.from(page.querySelectorAll("svg"));
  await Promise.all(svgs.map((svg) => rasterizeSvgElement(svg)));
}

function isChartSvg(svg: SVGSVGElement): boolean {
  return svg.classList.contains("report-chart-svg");
}

function rasterizeSvgElement(svg: SVGSVGElement): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const isChart = isChartSvg(svg);
    const rasterScale = isChart ? CHART_SVG_RASTER_SCALE : DEFAULT_SVG_RASTER_SCALE;
    const bounds = svg.getBoundingClientRect();
    const attrWidth = Number.parseInt(svg.getAttribute("width") || "", 10);
    const attrHeight = Number.parseInt(svg.getAttribute("height") || "", 10);
    const width = Math.max(Math.round(bounds.width) || attrWidth || 420, 1);
    const height = Math.max(Math.round(bounds.height) || attrHeight || 420, 1);

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));
    if (!clone.getAttribute("viewBox") && svg.viewBox?.baseVal) {
      const vb = svg.viewBox.baseVal;
      clone.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.width} ${vb.height}`);
    }

    const serialized = new XMLSerializer().serializeToString(clone);
    const url = URL.createObjectURL(new Blob([serialized], { type: "image/svg+xml;charset=utf-8" }));

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * rasterScale;
      canvas.height = height * rasterScale;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      URL.revokeObjectURL(url);

      const replacement = document.createElement("img");
      replacement.src = isChart
        ? canvas.toDataURL("image/png")
        : canvas.toDataURL("image/jpeg", METACOGNITION_JPEG_QUALITY);
      replacement.alt = "";
      replacement.width = width;
      replacement.height = height;
      replacement.style.width = `${width}px`;
      replacement.style.height = `${height}px`;
      replacement.style.display = "block";
      replacement.style.margin = svg.style.margin || "0 auto";
      replacement.style.maxWidth = svg.style.maxWidth || "none";
      svg.replaceWith(replacement);
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to rasterize SVG for TEST report"));
    };
    img.src = url;
  });
}

async function captureMetacognitionPageToCanvas(page: HTMLElement): Promise<HTMLCanvasElement> {
  page.style.width = `${STUDY_ABROAD_A4.widthPx}px`;
  page.style.height = `${STUDY_ABROAD_A4.heightPx}px`;
  page.style.minHeight = `${STUDY_ABROAD_A4.heightPx}px`;
  page.style.maxHeight = `${STUDY_ABROAD_A4.heightPx}px`;
  page.style.overflow = "hidden";

  await rasterizeSvgsInPage(page);

  const { default: html2canvas } = await import("html2canvas");

  return html2canvas(page, {
    scale: METACOGNITION_CAPTURE_SCALE,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: "#ffffff",
    width: STUDY_ABROAD_A4.widthPx,
    height: STUDY_ABROAD_A4.heightPx,
    onclone: (_doc, clonedPage) => {
      clonedPage.style.width = `${STUDY_ABROAD_A4.widthPx}px`;
      clonedPage.style.height = `${STUDY_ABROAD_A4.heightPx}px`;
      clonedPage.style.minHeight = `${STUDY_ABROAD_A4.heightPx}px`;
      clonedPage.style.maxHeight = `${STUDY_ABROAD_A4.heightPx}px`;
      clonedPage.style.boxSizing = "border-box";
      clonedPage.style.overflow = "hidden";
    },
  });
}

function addMetacognitionCanvasToPdf(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  pageIndex: number,
): void {
  if (pageIndex > 0) {
    pdf.addPage();
  }

  const imgData = canvas.toDataURL("image/jpeg", METACOGNITION_JPEG_QUALITY);
  pdf.addImage(
    imgData,
    "JPEG",
    0,
    0,
    STUDY_ABROAD_A4.widthMm,
    STUDY_ABROAD_A4.heightMm,
    undefined,
    "FAST",
  );
}

/** Render TEST report HTML in a hidden iframe and capture each `.page` to a multi-page A4 PDF. */
export async function captureMetacognitionHtmlToPdf(html: string): Promise<Blob> {
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
      throw new Error("TEST report document is unavailable");
    }

    await waitForReportRender(doc.body);

    const pages = Array.from(doc.querySelectorAll<HTMLElement>(".page"));
    if (pages.length === 0) {
      throw new Error("TEST report pages failed to render");
    }

    const pdf = new JsPDFConstructor({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
      compress: true,
    });

    for (let index = 0; index < pages.length; index += 1) {
      const page = pages[index];
      page.style.margin = "0";
      page.style.boxShadow = "none";
      const canvas = await captureMetacognitionPageToCanvas(page);
      addMetacognitionCanvasToPdf(pdf, canvas, index);
    }

    return pdf.output("blob");
  } finally {
    iframe.remove();
  }
}
