"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest, getStoredAuth } from "@/lib/api";
import { generatePantheonInvoice } from "@/lib/generateInvoice";

const ASSESSMENT_META: Record<string, { name: string; color: string; bg: string }> = {
  CAREER_COMPASS: { name: "Career Compass", color: "text-emerald-700", bg: "bg-emerald-50" },
  CAREER_DNA:     { name: "Career DNA",     color: "text-purple-700",  bg: "bg-purple-50" },
  JOHARI_WINDOW:  { name: "CLEAR",          color: "text-amber-700",   bg: "bg-amber-50" },
  LITMUS_TEST:    { name: "Litmus Test",    color: "text-blue-700",    bg: "bg-blue-50" },
  METACOGNITION:  { name: "TEST",           color: "text-rose-700",    bg: "bg-rose-50" },
  METACOGNITION_TEST: { name: "TEST", color: "text-rose-700", bg: "bg-rose-50" },
};

type InvoiceUser = { _id: string; firstName: string; lastName: string; email: string; phone?: string; grade?: string; institutionName?: string; city?: string; state?: string; country?: string };
type InvoiceOrg  = { _id: string; name: string; slug: string; contactEmail?: string; companyName?: string };

type Invoice = {
  _id: string;
  invoiceNumber: string;
  user: InvoiceUser | null;
  organization: InvoiceOrg | null;
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
  runningBalance: number;
};

type Summary = { total: number; totalGross: number; totalDiscount: number; totalNet: number };

type LedgerResponse = { invoices: Invoice[]; summary: Summary };

const STATUS_COLORS: Record<string, string> = {
  PAID:  "bg-green-50 text-green-700",
  DRAFT: "bg-yellow-50 text-yellow-700",
  VOID:  "bg-gray-100 text-gray-500",
};

function fmt(n: number) { return "\u20b9" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function LedgerPage() {
  const auth = useMemo(() => getStoredAuth(), []);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [filterAssessment, setFilterAssessment] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  useEffect(() => {
    if (!auth) return;
    apiRequest<LedgerResponse>("/superadmin/ledger", {}, auth.token)
      .then((res) => { setInvoices(res.invoices); setSummary(res.summary); })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return invoices.filter((inv) => {
      if (filterAssessment !== "ALL" && inv.assessmentCode !== filterAssessment) return false;
      if (filterStatus !== "ALL" && inv.status !== filterStatus) return false;
      if (filterFrom && new Date(inv.createdAt) < new Date(filterFrom)) return false;
      if (filterTo && new Date(inv.createdAt) > new Date(filterTo + "T23:59:59")) return false;
      if (q) {
        const name = inv.user ? `${inv.user.firstName} ${inv.user.lastName}`.toLowerCase() : "";
        const email = inv.user?.email.toLowerCase() ?? "";
        const inv_no = inv.invoiceNumber.toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !inv_no.includes(q)) return false;
      }
      return true;
    });
  }, [invoices, search, filterAssessment, filterStatus, filterFrom, filterTo]);

  // Recompute running balance for filtered set
  const filteredWithBalance = useMemo(() => {
    let running = 0;
    return filtered.map((inv) => { running += inv.finalAmount; return { ...inv, runningBalance: running }; });
  }, [filtered]);

  const filteredSummary = useMemo(() => ({
    gross: filtered.reduce((s, i) => s + i.amount, 0),
    discount: filtered.reduce((s, i) => s + i.discountAmount, 0),
    net: filtered.reduce((s, i) => s + i.finalAmount, 0),
  }), [filtered]);

  function clearFilters() { setSearch(""); setFilterAssessment("ALL"); setFilterStatus("ALL"); setFilterFrom(""); setFilterTo(""); }

  const hasFilters = search || filterAssessment !== "ALL" || filterStatus !== "ALL" || filterFrom || filterTo;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-black">Payment Ledger</h1>
        <p className="text-base text-black/80 mt-1">All transactions across every assessment on this platform.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Transactions", value: String(summary?.total ?? 0), color: "blue" },
          { label: "Gross Revenue",      value: fmt(summary?.totalGross ?? 0),    color: "green" },
          { label: "Total Discounts",    value: fmt(summary?.totalDiscount ?? 0), color: "yellow" },
          { label: "Net Revenue",        value: fmt(summary?.totalNet ?? 0),      color: "indigo" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5`}>
            <p className="text-sm text-black/80 mb-1">{label}</p>
            <p className={`text-xl font-bold ${color === "blue" ? "text-blue-700" : color === "green" ? "text-green-700" : color === "yellow" ? "text-yellow-700" : "text-indigo-700"}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-black/80 mb-1">Search</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email, invoice #..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black/80 mb-1">Assessment</label>
            <select value={filterAssessment} onChange={(e) => setFilterAssessment(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="ALL">All Assessments</option>
              {Object.entries(ASSESSMENT_META).map(([code, { name }]) => <option key={code} value={code}>{name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black/80 mb-1">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="DRAFT">Draft</option>
              <option value="VOID">Void</option>
            </select>
          </div>
          <div className="flex flex-col justify-end">
            {hasFilters && (
              <button onClick={clearFilters} className="w-full border border-gray-200 text-black/80 text-base py-2.5 rounded-xl hover:bg-gray-50">
                Clear Filters
              </button>
            )}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-black/80 mb-1">From Date</label>
            <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black/80 mb-1">To Date</label>
            <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-black">
            Transactions {hasFilters ? `(${filtered.length} filtered)` : `(${invoices.length})`}
          </h2>
        </div>

        {filteredWithBalance.length === 0 ? (
          <p className="px-5 py-12 text-base text-black/70 text-center">
            {invoices.length === 0 ? "No transactions recorded yet." : "No results match your filters."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="bg-gray-50 text-sm font-medium text-black/80 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Invoice</th>
                  <th className="px-4 py-3 text-left">Date &amp; Time</th>
                  <th className="px-4 py-3 text-left">Assessment</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-right">Gross</th>
                  <th className="px-4 py-3 text-right">Discount</th>
                  <th className="px-4 py-3 text-right">Net</th>
                  <th className="px-4 py-3 text-right">Running</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Coupon</th>
                  <th className="px-4 py-3 text-center">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredWithBalance.map((inv, idx) => {
                  const meta = ASSESSMENT_META[inv.assessmentCode];
                  const userName = inv.user ? `${inv.user.firstName} ${inv.user.lastName}` : "Unknown";
                  const userEmail = inv.user?.email ?? "";
                  const dateStr = new Date(inv.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                  const timeStr = new Date(inv.createdAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-900 font-semibold whitespace-nowrap">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        <span className="block">{dateStr}</span>
                        <span className="text-gray-400">{timeStr}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta ? `${meta.bg} ${meta.color}` : "bg-gray-100 text-gray-600"}`}>
                          {meta?.name ?? inv.assessmentCode}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-gray-900 whitespace-nowrap">{userName}</p>
                        <p className="text-[11px] text-gray-400">{userEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-700 whitespace-nowrap">{fmt(inv.amount)}</td>
                      <td className="px-4 py-3 text-right text-xs text-green-700 whitespace-nowrap">{inv.discountAmount > 0 ? `- ${fmt(inv.discountAmount)}` : "—"}</td>
                      <td className="px-4 py-3 text-right text-xs font-semibold text-gray-900 whitespace-nowrap">{fmt(inv.finalAmount)}</td>
                      <td className="px-4 py-3 text-right text-xs text-indigo-700 font-medium whitespace-nowrap">{fmt(inv.runningBalance)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[inv.status] ?? "bg-gray-100 text-gray-500"}`}>{inv.status}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{inv.couponCode ?? "—"}</td>
                      <td className="px-4 py-3 text-center">
                        {inv.status === "PAID" && inv.user && (
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
                              organization: inv.organization ? { name: inv.organization.name, contactEmail: inv.organization.contactEmail, companyName: inv.organization.companyName } : undefined,
                            })}
                            className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium transition-colors"
                          >
                            ↓ PDF
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Footer totals */}
              <tfoot>
                <tr className="bg-gray-50 font-semibold text-sm border-t-2 border-gray-200">
                  <td colSpan={5} className="px-4 py-3 text-gray-700">Totals ({filtered.length} records)</td>
                  <td className="px-4 py-3 text-right text-gray-900">{fmt(filteredSummary.gross)}</td>
                  <td className="px-4 py-3 text-right text-green-700">{filteredSummary.discount > 0 ? `- ${fmt(filteredSummary.discount)}` : "—"}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{fmt(filteredSummary.net)}</td>
                  <td className="px-4 py-3 text-right text-indigo-700">{fmt(filteredWithBalance.at(-1)?.runningBalance ?? 0)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
