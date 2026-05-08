"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest, getStoredAuth } from "@/lib/api";
import { generatePantheonInvoice } from "@/lib/generateInvoice";

const ASSESSMENT_META: Record<string, { name: string; color: string; bg: string }> = {
  CAREER_COMPASS: { name: "Career Compass", color: "text-emerald-700", bg: "bg-emerald-50" },
  CAREER_DNA:     { name: "Career DNA",     color: "text-purple-700",  bg: "bg-purple-50" },
  JOHARI_WINDOW:  { name: "CLEAR",          color: "text-amber-700",   bg: "bg-amber-50" },
  LITMUS_TEST:    { name: "Litmus Test",    color: "text-blue-700",    bg: "bg-blue-50" },
  METACOGNITION:  { name: "TEST",           color: "text-rose-700",    bg: "bg-rose-50" },
  METACOGNITION_TEST: { name: "TEST",       color: "text-rose-700",    bg: "bg-rose-50" },
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
    firstName: string; lastName: string; email: string;
    phone?: string; grade?: string; institutionName?: string;
    city?: string; state?: string; country?: string;
  };
  organization?: { name?: string; contactEmail?: string; companyName?: string };
};

type Summary = { total: number; totalGross: number; totalDiscount: number; totalNet: number };

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function OrgLedgerPage() {
  const params = useParams();
  const slug = params?.slug as string;
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
    return invoices.filter((inv) =>
      inv.invoiceNumber.toLowerCase().includes(q) ||
      `${inv.user.firstName} ${inv.user.lastName}`.toLowerCase().includes(q) ||
      inv.user.email.toLowerCase().includes(q)
    );
  }, [invoices, search]);

  const summary = useMemo(() => ({
    gross:    filtered.reduce((s, i) => s + i.amount, 0),
    discount: filtered.reduce((s, i) => s + i.discountAmount, 0),
    net:      filtered.reduce((s, i) => s + i.finalAmount, 0),
  }), [filtered]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Payment Ledger</h1>
      <p className="text-sm text-gray-500 mb-6">All completed payments in your organization.</p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Transactions", value: filtered.length.toString(), color: "text-gray-900" },
          { label: "Gross Revenue",      value: fmt(summary.gross),         color: "text-gray-900" },
          { label: "Net Revenue",        value: fmt(summary.net),           color: "text-indigo-700" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or invoice #..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="px-5 py-12 text-base text-black/70 text-center">
            {invoices.length === 0 ? "No transactions recorded yet." : "No results match your search."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-medium text-black/70 uppercase tracking-wide">
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
                  const userName = `${inv.user.firstName} ${inv.user.lastName}`;
                  const dateStr = new Date(inv.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric",
                  });
                  return (
                    <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-900 font-semibold whitespace-nowrap">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{dateStr}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta ? `${meta.bg} ${meta.color}` : "bg-gray-100 text-gray-600"}`}>
                          {meta?.name ?? inv.assessmentCode}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-gray-900 whitespace-nowrap">{userName}</p>
                        <p className="text-[11px] text-gray-400">{inv.user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-700 whitespace-nowrap">{fmt(inv.amount)}</td>
                      <td className="px-4 py-3 text-right text-xs text-green-700 whitespace-nowrap">
                        {inv.discountAmount > 0 ? `- ${fmt(inv.discountAmount)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold text-gray-900 whitespace-nowrap">{fmt(inv.finalAmount)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{inv.couponCode ?? "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => generatePantheonInvoice({
                              invoice: {
                                invoiceNo: inv.invoiceNumber,
                                invoiceDate: new Date(inv.createdAt).toLocaleDateString("en-IN"),
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
                                ? { name: inv.organization.name ?? "", companyName: inv.organization.companyName, contactEmail: inv.organization.contactEmail }
                                : undefined,
                          })}
                          className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium transition-colors"
                        >
                          ↓ PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold text-xs border-t-2 border-gray-200">
                  <td colSpan={5} className="px-4 py-3 text-gray-700">Totals ({filtered.length} records)</td>
                  <td className="px-4 py-3 text-right text-gray-900">{fmt(summary.gross)}</td>
                  <td className="px-4 py-3 text-right text-green-700">{summary.discount > 0 ? `- ${fmt(summary.discount)}` : "—"}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{fmt(summary.net)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
