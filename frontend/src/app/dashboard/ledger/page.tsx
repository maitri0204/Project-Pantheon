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

type InvoiceUser = {
  _id: string;
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

type InvoiceOrg = {
  _id: string;
  name: string;
  slug: string;
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

type Summary = {
  total: number;
  totalGross: number;
  totalDiscount: number;
  totalNet: number;
};

type LedgerResponse = {
  invoices: Invoice[];
  summary: Summary;
};

const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-green-50 text-green-700",
  DRAFT: "bg-yellow-50 text-yellow-700",
  VOID: "bg-gray-100 text-gray-500",
};

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function LedgerPage() {
  const auth = useMemo(() => getStoredAuth(), []);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAssessment, setFilterAssessment] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  useEffect(() => {
    if (!auth) return;

    apiRequest<LedgerResponse>("/superadmin/ledger", {}, auth.token)
      .then((res) => {
        setInvoices(res.invoices);
        setSummary(res.summary);
      })
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
        const invoiceNo = inv.invoiceNumber.toLowerCase();

        if (!name.includes(q) && !email.includes(q) && !invoiceNo.includes(q)) return false;
      }

      return true;
    });
  }, [invoices, search, filterAssessment, filterStatus, filterFrom, filterTo]);

  const filteredWithBalance = useMemo(() => {
    let running = 0;
    return filtered.map((inv) => {
      running += inv.finalAmount;
      return { ...inv, runningBalance: running };
    });
  }, [filtered]);

  const filteredSummary = useMemo(
    () => ({
      gross: filtered.reduce((sum, item) => sum + item.amount, 0),
      discount: filtered.reduce((sum, item) => sum + item.discountAmount, 0),
      net: filtered.reduce((sum, item) => sum + item.finalAmount, 0),
    }),
    [filtered]
  );

  const hasFilters =
    !!search ||
    filterAssessment !== "ALL" ||
    filterStatus !== "ALL" ||
    !!filterFrom ||
    !!filterTo;

  function clearFilters() {
    setSearch("");
    setFilterAssessment("ALL");
    setFilterStatus("ALL");
    setFilterFrom("");
    setFilterTo("");
  }

  function handlePdf(inv: Invoice) {
    const userName = inv.user ? `${inv.user.firstName} ${inv.user.lastName}` : "Unknown";
    const userEmail = inv.user?.email ?? "";

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
        name: userName,
        email: userEmail,
        mobile: inv.user?.phone,
        phone: inv.user?.phone,
        institutionName: inv.user?.institutionName,
        city: inv.user?.city,
        state: inv.user?.state,
        country: inv.user?.country,
      },
      organization: inv.organization
        ? {
            name: inv.organization.name,
            contactEmail: inv.organization.contactEmail,
            companyName: inv.organization.companyName || inv.organization.branding?.companyName,
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
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-black sm:text-3xl">Payment Ledger</h1>
        <p className="mt-1 text-sm text-black/70">All transactions across every assessment on this platform.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {[
          { label: "Total Transactions", value: String(summary?.total ?? 0), colorCls: "text-blue-700" },
          { label: "Gross Revenue", value: fmt(summary?.totalGross ?? 0), colorCls: "text-green-700" },
          { label: "Total Discounts", value: fmt(summary?.totalDiscount ?? 0), colorCls: "text-yellow-700" },
          { label: "Net Revenue", value: fmt(summary?.totalNet ?? 0), colorCls: "text-indigo-700" },
        ].map(({ label, value, colorCls }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <p className="mb-1 text-xs text-black/70 sm:text-sm">{label}</p>
            <p className={`text-base font-bold sm:text-xl ${colorCls}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="mb-1 block text-xs font-medium text-black/70 sm:text-sm">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, email, invoice #..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-black/70 sm:text-sm">Assessment</label>
            <select
              value={filterAssessment}
              onChange={(e) => setFilterAssessment(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="ALL">All Assessments</option>
              {Object.entries(ASSESSMENT_META).map(([code, { name }]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-black/70 sm:text-sm">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="DRAFT">Draft</option>
              <option value="VOID">Void</option>
            </select>
          </div>
          <div className="flex flex-col justify-end">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="w-full rounded-xl border border-gray-200 py-2 text-sm text-black/70 hover:bg-gray-50"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-black/70 sm:text-sm">From Date</label>
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-black/70 sm:text-sm">To Date</label>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-black">
          Transactions {hasFilters ? `(${filtered.length} filtered)` : `(${invoices.length})`}
        </h2>
      </div>

      {filteredWithBalance.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white px-5 py-12 text-center text-sm text-black/60 shadow-sm">
          {invoices.length === 0 ? "No transactions recorded yet." : "No results match your filters."}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:hidden">
            {filteredWithBalance.map((inv) => {
              const meta = ASSESSMENT_META[inv.assessmentCode];
              const userName = inv.user ? `${inv.user.firstName} ${inv.user.lastName}` : "Unknown";
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
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[inv.status] ?? "bg-gray-100 text-gray-500"}`}
                      >
                        {inv.status}
                      </span>
                      {inv.status === "PAID" && (
                        <button
                          onClick={() => handlePdf(inv)}
                          className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                        >
                          ↓ PDF
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta ? `${meta.bg} ${meta.color}` : "bg-gray-100 text-gray-600"}`}
                    >
                      {meta?.name ?? inv.assessmentCode}
                    </span>
                    {inv.couponCode && <span className="font-mono text-xs text-gray-400">{inv.couponCode}</span>}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-900">{userName}</p>
                    <p className="text-[11px] text-gray-400">{inv.user?.email ?? ""}</p>
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

                  <p className="text-[11px] font-medium text-indigo-600">Running: {fmt(inv.runningBalance)}</p>
                </div>
              );
            })}

            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div>
                <p className="mb-0.5 text-[10px] uppercase text-gray-400">Gross</p>
                <p className="text-xs font-bold text-gray-900">{fmt(filteredSummary.gross)}</p>
              </div>
              <div>
                <p className="mb-0.5 text-[10px] uppercase text-gray-400">Discount</p>
                <p className="text-xs font-bold text-green-700">
                  {filteredSummary.discount > 0 ? `- ${fmt(filteredSummary.discount)}` : "—"}
                </p>
              </div>
              <div>
                <p className="mb-0.5 text-[10px] uppercase text-gray-400">Net</p>
                <p className="text-xs font-bold text-indigo-700">{fmt(filteredSummary.net)}</p>
              </div>
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-black/70">
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
                    const dateStr = new Date(inv.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    const timeStr = new Date(inv.createdAt).toLocaleString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={inv._id} className="transition-colors hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-gray-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                          <span className="block">{dateStr}</span>
                          <span className="text-gray-400">{timeStr}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta ? `${meta.bg} ${meta.color}` : "bg-gray-100 text-gray-600"}`}
                          >
                            {meta?.name ?? inv.assessmentCode}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="whitespace-nowrap text-xs font-medium text-gray-900">{userName}</p>
                          <p className="text-[11px] text-gray-400">{userEmail}</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-gray-700">{fmt(inv.amount)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-green-700">
                          {inv.discountAmount > 0 ? `- ${fmt(inv.discountAmount)}` : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-gray-900">
                          {fmt(inv.finalAmount)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium text-indigo-700">
                          {fmt(inv.runningBalance)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[inv.status] ?? "bg-gray-100 text-gray-500"}`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{inv.couponCode ?? "—"}</td>
                        <td className="px-4 py-3 text-center">
                          {inv.status === "PAID" && (
                            <button
                              onClick={() => handlePdf(inv)}
                              className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
                            >
                              ↓ PDF
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50 text-sm font-semibold">
                    <td colSpan={5} className="px-4 py-3 text-gray-700">
                      Totals ({filtered.length} records)
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">{fmt(filteredSummary.gross)}</td>
                    <td className="px-4 py-3 text-right text-green-700">
                      {filteredSummary.discount > 0 ? `- ${fmt(filteredSummary.discount)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">{fmt(filteredSummary.net)}</td>
                    <td className="px-4 py-3 text-right text-indigo-700">
                      {fmt(filteredWithBalance.at(-1)?.runningBalance ?? 0)}
                    </td>
                    <td colSpan={3} />
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
