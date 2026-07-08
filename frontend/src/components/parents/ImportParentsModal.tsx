"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  downloadParentImportSample,
  parseParentImportFile,
  type ParentImportRow,
} from "@/lib/parents/parentImport";

type ImportParentsModalProps = {
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

export default function ImportParentsModal({ open, token, onClose, onSuccess }: ImportParentsModalProps) {
  const [rows, setRows] = useState<ParentImportRow[]>([]);
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
      const parsed = await parseParentImportFile(file);
      setRows(parsed);
      setFileName(file.name);
      if (parsed.length === 0) {
        setError("No parent rows found in the uploaded file.");
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
      setError("Upload an Excel file with at least one parent row.");
      return;
    }

    setImporting(true);
    setError("");
    try {
      const response = await apiRequest<BulkImportResponse>("/superadmin/parents/bulk", {
        method: "POST",
        body: JSON.stringify({ parents: rows }),
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
      setError(err instanceof Error ? err.message : "Failed to import parents");
    } finally {
      setImporting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 pt-20 pb-8">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Import Parents from Excel</h2>
            <p className="mt-1 text-sm text-slate-600">Upload multiple parents under Kareer Studio using the sample format.</p>
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
              onClick={downloadParentImportSample}
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
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">Institution</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 10).map((row) => (
                    <tr key={`${row.rowNumber}-${row.email}`} className="border-t border-slate-100">
                      <td className="px-3 py-2">{row.rowNumber}</td>
                      <td className="px-3 py-2">{row.firstName} {row.lastName}</td>
                      <td className="px-3 py-2">{row.email}</td>
                      <td className="px-3 py-2">{row.phoneCode} {row.phone}</td>
                      <td className="px-3 py-2">{row.institutionName || "-"}</td>
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
              {importing ? "Importing..." : `Import ${rows.length} Parent(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
