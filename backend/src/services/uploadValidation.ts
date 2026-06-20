export const MAX_BASE64_IMAGE_BYTES = 500 * 1024;

export const getBase64PayloadByteLength = (dataUrl: string): number | null => {
  if (!dataUrl.startsWith("data:")) {
    return null;
  }

  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) {
    return null;
  }

  const base64Part = dataUrl.slice(commaIndex + 1);
  return Buffer.byteLength(base64Part, "base64");
};

export const isBase64ImageWithinLimit = (
  dataUrl: string,
  maxBytes = MAX_BASE64_IMAGE_BYTES,
): boolean => {
  const byteLength = getBase64PayloadByteLength(dataUrl);
  if (byteLength === null) {
    return true;
  }
  return byteLength <= maxBytes;
};

export const sanitizeAttachmentFileName = (fileName: string, fallback = "report.pdf"): string => {
  const trimmed = fileName.trim();
  if (!trimmed) {
    return fallback;
  }

  const baseName = trimmed.split(/[/\\]/).pop() || fallback;
  const sanitized = baseName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return sanitized.toLowerCase().endsWith(".pdf") ? sanitized : `${sanitized}.pdf`;
};

export const isPdfBuffer = (buffer: Buffer): boolean => {
  return buffer.length >= 4 && buffer.subarray(0, 4).toString("utf8") === "%PDF";
};
