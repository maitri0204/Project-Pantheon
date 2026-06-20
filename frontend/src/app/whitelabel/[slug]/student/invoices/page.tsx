"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest, getStoredAuth } from "@/lib/api";
// invoice PDF generation kept in lib; UI button removed per request

const ASSESSMENT_META: Record<string, { name: string; color: string; bg: string }> = {
  CAREER_COMPASS: { name: "Career Compass", color: "text-emerald-700", bg: "bg-emerald-50" },
  CAREER_DNA: { name: "Career DNA", color: "text-purple-700", bg: "bg-purple-50" },
  JOHARI_WINDOW: { name: "CLEAR", color: "text-amber-700", bg: "bg-amber-50" },
  LITMUS_TEST: { name: "Litmus Test", color: "text-blue-700", bg: "bg-blue-50" },
  METACOGNITION: { name: "TEST", color: "text-rose-700", bg: "bg-rose-50" },
  METACOGNITION_TEST: { name: "TEST", color: "text-rose-700", bg: "bg-rose-50" },
};

type InvoiceItem = {
  _id: string;
  invoiceNumber: string;
  assessmentCode: string;
  amount: number;
  discountAmount: number;
  gstAmount: number;
  finalAmount: number;
  currency: string;
  couponCode?: string;
  paymentMethod: "RAZORPAY" | "FREE";
  paymentReference?: string;
  status: "DRAFT" | "PAID" | "VOID";
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    grade?: string;
    institutionName?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  organization?: {
    name?: string;
    contactEmail?: string;
    companyName?: string;
    phone?: string;
    officeAddress?: string;
    state?: string;
    country?: string;
    panNumber?: string;
    gstNumber?: string;
    signatoryFirstName?: string;
    signatoryLastName?: string;
    signatureUrl?: string;
    branding?: {
      companyName?: string;
      logoUrl?: string;
    };
  };
};

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StudentInvoicesPage() {
  const auth = useMemo(() => getStoredAuth(), []);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth) return;

    apiRequest<{ invoices: InvoiceItem[] }>("/platform/student/invoices", {})
      .then((res) => setInvoices(res.invoices))
      .catch(() => setError("Failed to load invoices."))
      .finally(() => setLoading(false));
  }, [auth]);

  // PDF generation handled by library but we are hiding the download button on student layout

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Invoices</h1>
        <p className="mt-1 text-sm text-gray-500">Download proforma invoices for your completed payments.</p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {invoices.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-sm text-gray-400">
          No paid invoices found.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:hidden">
            {invoices.map((inv) => {
              const meta = ASSESSMENT_META[inv.assessmentCode];
              const dateStr = new Date(inv.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });

              return (
                <div key={inv._id} className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs font-semibold text-gray-900">{inv.invoiceNumber}</p>
                      <p className="mt-0.5 text-[11px] text-gray-400">{dateStr}</p>
                    </div>
                    {/* PDF download button removed for student layout */}
                  </div>

                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${meta ? `${meta.bg} ${meta.color}` : "bg-gray-100 text-gray-600"}`}
                  >
                    {meta?.name ?? inv.assessmentCode}
                  </span>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Amount Paid</span>
                    <span className="text-sm font-bold text-gray-900">{fmt(inv.finalAmount)}</span>
                  </div>

                  {inv.couponCode && <p className="font-mono text-[11px] text-gray-400">Coupon: {inv.couponCode}</p>}
                </div>
              );
            })}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-black/70">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Invoice No.</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Assessment</th>
                    <th className="px-4 py-3 text-right">Amount Paid</th>
                    <th className="px-4 py-3 text-left">Coupon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices.map((inv, idx) => {
                    const meta = ASSESSMENT_META[inv.assessmentCode];
                    const dateStr = new Date(inv.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <tr key={inv._id} className="transition-colors hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-gray-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{dateStr}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta ? `${meta.bg} ${meta.color}` : "bg-gray-100 text-gray-600"}`}
                          >
                            {meta?.name ?? inv.assessmentCode}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-gray-900">
                          {fmt(inv.finalAmount)}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{inv.couponCode ?? "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
