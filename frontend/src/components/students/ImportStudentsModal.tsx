"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  downloadStudentImportSample,
  parseStudentImportFile,
  STUDENT_IMPORT_HEADERS,
  type StudentImportRow,
} from "@/lib/students/studentImport";

type ImportStudentsModalProps = {
  open: boolean;
  token: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

type BulkImportResponse = {
  message: string;
  createdCount: number;
  failedCount: number;
  failed: Array<{ rowNumber?: number; email?: string; message: string }>;
};

export default function ImportStudentsModal({ open, token, onClose, onSuccess }: ImportStudentsModalProps) {
  const [rows, setRows] = useState<StudentImportRow[]>([]);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (!open) {
      setRows([]);
      setError("");
      setFileName("");
    }
  }, [open]);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    setError("");
    setImporting(true);
    try {
      const parsed = await parseStudentImportFile(file);
      setRows(parsed);
      setFileName(file.name);
      if (parsed.length === 0) {
        setError("No student rows found in the uploaded file.");
      }
    } catch (err) {
      setRows([]);
      setFileName("");
      setError(err instanceof Error ? err.message : "Failed to read Excel file");
    } finally {
      setImporting(false);
    }
  };

  const handleImport = async () => {
    if (rows.length === 0) {
      setError("Upload an Excel file with at least one student row.");
      return;
    }

    setImporting(true);
    setError("");
    try {
      const response = await apiRequest<BulkImportResponse>("/superadmin/students/bulk", {
        method: "POST",
        body: JSON.stringify({ students: rows }),
      }, token);

      onSuccess(response.message);
      if (response.failedCount > 0) {
        const preview = response.failed
          .slice(0, 3)
          .map((item) => `Row ${item.rowNumber ?? "-"}: ${item.message}`)
          .join(" | ");
        setError(response.failedCount > 3 ? `${preview} | ...` : preview);
        if (response.createdCount > 0) {
          onClose();
        }
        return;
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import students");
    } finally {
      setImporting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Import Students from Excel</h2>
            <p className="mt-1 text-sm text-slate-600">Upload multiple students under Kareer Studio using the sample format.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            Close
          </button>
        </div>

        <div className="space-y-5 p-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={downloadStudentImportSample}
              className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              Download Sample Excel
            </button>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              {importing ? "Reading..." : "Upload Excel File"}
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => void handleFileChange(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Required columns</p>
            <p className="mt-2 break-words">{STUDENT_IMPORT_HEADERS.join(", ")}</p>
            <p className="mt-2 text-slate-600">Use country and state ISO codes (example: IN, GJ). Gender values: male, female, other, prefer_not_to_say.</p>
          </div>

          {fileName ? (
            <p className="text-sm font-medium text-slate-700">Loaded file: {fileName} ({rows.length} row(s))</p>
          ) : null}

          {rows.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">Grade</th>
                    <th className="px-3 py-2">Division</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 10).map((row) => (
                    <tr key={`${row.rowNumber}-${row.email}`} className="border-t border-slate-100">
                      <td className="px-3 py-2">{row.rowNumber}</td>
                      <td className="px-3 py-2">{row.firstName} {row.lastName}</td>
                      <td className="px-3 py-2">{row.email}</td>
                      <td className="px-3 py-2">{row.phoneCode} {row.phone}</td>
                      <td className="px-3 py-2">{row.grade || "-"}</td>
                      <td className="px-3 py-2">{row.division || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 10 ? (
                <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
                  Showing first 10 of {rows.length} rows.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleImport()}
              disabled={importing || rows.length === 0}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {importing ? "Importing..." : `Import ${rows.length} Student(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
