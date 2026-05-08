"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest, getStoredAuth } from "@/lib/api";
import { generatePantheonInvoice } from "@/lib/generateInvoice";

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

type Summary = {
  total: number;
  totalGross: number;
  totalDiscount: number;
  totalNet: number;
};

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function OrgLedgerPage() {
  const auth = useMemo(() => getStoredAuth(), []);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!auth) return;

    apiRequest<{ invoices: InvoiceItem[]; summary: Summary }>("/platform/organization/invoices", {}, auth.token)
      .then((res) => setInvoices(res.invoices))
      .catch(() => setError("Failed to load invoices."))
      .finally(() => setLoading(false));
  }, [auth]);

  const filtered = useMemo(() => {
    if (!search.trim()) return invoices;
    const q = search.toLowerCase();

    return invoices.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        `${inv.user.firstName} ${inv.user.lastName}`.toLowerCase().includes(q) ||
        inv.user.email.toLowerCase().includes(q)
    );
  }, [invoices, search]);

  const summary = useMemo(
    () => ({
      gross: filtered.reduce((sum, item) => sum + item.amount, 0),
      discount: filtered.reduce((sum, item) => sum + item.discountAmount, 0),
      net: filtered.reduce((sum, item) => sum + item.finalAmount, 0),
    }),
    [filtered]
  );

  function handlePdf(inv: InvoiceItem) {
    generatePantheonInvoice({
      invoice: {
        invoiceNo: inv.invoiceNumber,
        invoiceDate: inv.createdAt,
        description: ASSESSMENT_META[inv.assessmentCode]?.name ?? inv.assessmentCode,
        amount: inv.amount,
        discountAmount: inv.discountAmount,
        gstAmount: inv.gstAmount ?? 0,
        finalAmount: inv.finalAmount,
        paymentMethod: inv.paymentMethod,
        paymentReference: inv.paymentReference,
      },
      user: {
        name: `${inv.user.firstName} ${inv.user.lastName}`,
        email: inv.user.email,
        mobile: inv.user.phone,
        phone: inv.user.phone,
        institutionName: inv.user.institutionName,
        city: inv.user.city,
        state: inv.user.state,
        country: inv.user.country,
      },
      organization: inv.organization
        ? {
            name: inv.organization.name ?? "",
            companyName: inv.organization.companyName || inv.organization.branding?.companyName,
            contactEmail: inv.organization.contactEmail,
            logoUrl: inv.organization.branding?.logoUrl,
            officeAddress: inv.organization.officeAddress,
            state: inv.organization.state,
            country: inv.organization.country,
            phone: inv.organization.phone,
            panNumber: inv.organization.panNumber,
            gstNumber: inv.organization.gstNumber,
            signatoryFirstName: inv.organization.signatoryFirstName,
            signatoryLastName: inv.organization.signatoryLastName,
            signatureUrl: inv.organization.signatureUrl,
          }
        : undefined,
    });
  }

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
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Payment Ledger</h1>
        <p className="mt-1 text-sm text-gray-500">All completed payments in your organization.</p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {[
          { label: "Total Transactions", value: filtered.length.toString(), colorCls: "text-gray-900" },
          { label: "Gross Revenue", value: fmt(summary.gross), colorCls: "text-gray-900" },
          { label: "Net Revenue", value: fmt(summary.net), colorCls: "text-indigo-700" },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="mb-1 text-xs text-gray-500">{card.label}</p>
            <p className={`text-xl font-bold ${card.colorCls}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email or invoice #..."
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white px-5 py-12 text-center text-base text-black/70">
          {invoices.length === 0 ? "No transactions recorded yet." : "No results match your search."}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:hidden">
            {filtered.map((inv) => {
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
                    <button
                      onClick={() => handlePdf(inv)}
                      className="flex-shrink-0 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                    >
                      ↓ PDF
                    </button>
                  </div>

                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${meta ? `${meta.bg} ${meta.color}` : "bg-gray-100 text-gray-600"}`}
                  >
                    {meta?.name ?? inv.assessmentCode}
                  </span>

                  <div>
                    <p className="text-xs font-medium text-gray-900">
                      {inv.user.firstName} {inv.user.lastName}
                    </p>
                    <p className="text-[11px] text-gray-400">{inv.user.email}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-gray-50 pt-2">
                    <div>
                      <p className="text-[10px] uppercase text-gray-400">Gross</p>
                      <p className="mt-0.5 text-xs font-medium text-gray-700">{fmt(inv.amount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-400">Discount</p>
                      <p className="mt-0.5 text-xs font-medium text-green-700">
                        {inv.discountAmount > 0 ? `- ${fmt(inv.discountAmount)}` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-400">Net</p>
                      <p className="mt-0.5 text-xs font-bold text-gray-900">{fmt(inv.finalAmount)}</p>
                    </div>
                  </div>

                  {inv.couponCode && <p className="font-mono text-[11px] text-gray-400">Coupon: {inv.couponCode}</p>}
                </div>
              );
            })}

            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div>
                <p className="mb-0.5 text-[10px] uppercase text-gray-400">Gross</p>
                <p className="text-xs font-bold text-gray-900">{fmt(summary.gross)}</p>
              </div>
              <div>
                <p className="mb-0.5 text-[10px] uppercase text-gray-400">Discount</p>
                <p className="text-xs font-bold text-green-700">
                  {summary.discount > 0 ? `- ${fmt(summary.discount)}` : "—"}
                </p>
              </div>
              <div>
                <p className="mb-0.5 text-[10px] uppercase text-gray-400">Net</p>
                <p className="text-xs font-bold text-indigo-700">{fmt(summary.net)}</p>
              </div>
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-black/70">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Invoice</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Assessment</th>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-right">Gross</th>
                    <th className="px-4 py-3 text-right">Discount</th>
                    <th className="px-4 py-3 text-right">Net</th>
                    <th className="px-4 py-3 text-left">Coupon</th>
                    <th className="px-4 py-3 text-center">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((inv, idx) => {
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
                        <td className="px-4 py-3">
                          <p className="whitespace-nowrap text-xs font-medium text-gray-900">
                            {inv.user.firstName} {inv.user.lastName}
                          </p>
                          <p className="text-[11px] text-gray-400">{inv.user.email}</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-gray-700">{fmt(inv.amount)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-green-700">
                          {inv.discountAmount > 0 ? `- ${fmt(inv.discountAmount)}` : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-gray-900">
                          {fmt(inv.finalAmount)}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{inv.couponCode ?? "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handlePdf(inv)}
                            className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
                          >
                            ↓ PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50 text-xs font-semibold">
                    <td colSpan={5} className="px-4 py-3 text-gray-700">
                      Totals ({filtered.length} records)
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">{fmt(summary.gross)}</td>
                    <td className="px-4 py-3 text-right text-green-700">
                      {summary.discount > 0 ? `- ${fmt(summary.discount)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">{fmt(summary.net)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
