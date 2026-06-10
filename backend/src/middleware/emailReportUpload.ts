import multer from "multer";

const maxEmailPdfBytes = 15 * 1024 * 1024;

export const emailReportUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxEmailPdfBytes },
});
