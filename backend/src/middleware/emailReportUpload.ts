import multer from "multer";

const maxEmailPdfBytes = 25 * 1024 * 1024;

export const emailReportUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxEmailPdfBytes },
  fileFilter: (_req, file, callback) => {
    const mimeType = file.mimetype.toLowerCase();
    const fileName = file.originalname.toLowerCase();

    if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
      callback(null, true);
      return;
    }

    callback(new Error("Only PDF files are allowed"));
  },
});
