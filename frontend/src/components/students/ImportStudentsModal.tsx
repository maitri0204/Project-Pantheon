"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  downloadStudentImportSample,
  parseStudentImportFile,
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

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50">
      <div className="flex min-h-full items-start justify-center p-4 sm:p-6">
        <div className="my-4 flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:my-8">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="min-w-0 pr-4">
              <h2 className="text-xl font-bold text-slate-900">Import Students from Excel</h2>
              <p className="mt-1 text-sm text-slate-600">Upload multiple students under Kareer Studio using the sample format.</p>
            </div>
            <button type="button" onClick={onClose} className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
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

            {fileName ? (
              <p className="text-sm font-medium text-slate-700">Loaded file: {fileName} ({rows.length} row(s))</p>
            ) : null}

            {rows.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="max-h-[min(50vh,28rem)] overflow-y-auto overscroll-contain">
                  <table className="w-full table-fixed text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-600 shadow-[0_1px_0_0_rgb(226,232,240)]">
                      <tr>
                        <th className="w-[10%] px-3 py-2">Row</th>
                        <th className="w-[18%] px-3 py-2">Name</th>
                        <th className="w-[24%] px-3 py-2">Email</th>
                        <th className="w-[22%] px-3 py-2">Phone</th>
                        <th className="w-[13%] px-3 py-2">Grade</th>
                        <th className="w-[13%] px-3 py-2">Division</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={`${row.rowNumber}-${row.email}`} className="border-t border-slate-100">
                          <td className="px-3 py-2">{row.rowNumber}</td>
                          <td className="truncate px-3 py-2" title={`${row.firstName} ${row.lastName}`}>{row.firstName} {row.lastName}</td>
                          <td className="truncate px-3 py-2" title={row.email}>{row.email}</td>
                          <td className="truncate px-3 py-2">{row.phoneCode} {row.phone}</td>
                          <td className="px-3 py-2">{row.grade || "-"}</td>
                          <td className="px-3 py-2">{row.division || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
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
