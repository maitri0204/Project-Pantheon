"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getStoredAuth } from "@/lib/api";
import { getDashboardLoginPath } from "@/lib/dashboardAuth";

const ASSESSMENT_META: Record<string, { name: string; color: string; bg: string }> = {
  CAREER_COMPASS: { name: "Career Compass", color: "text-emerald-700", bg: "bg-emerald-50" },
  CAREER_DNA: { name: "Career DNA", color: "text-purple-700", bg: "bg-purple-50" },
  JOHARI_WINDOW: { name: "CLEAR", color: "text-amber-700", bg: "bg-amber-50" },
  LITMUS_TEST: { name: "Litmus Test", color: "text-blue-700", bg: "bg-blue-50" },
  METACOGNITION: { name: "TEST", color: "text-rose-700", bg: "bg-rose-50" },
  METACOGNITION_TEST: { name: "TEST", color: "text-rose-700", bg: "bg-rose-50" },
  RESILIENCE_TEST: { name: "RQ", color: "text-orange-700", bg: "bg-orange-50" },
  STUDY_ABROAD: { name: "Study Abroad", color: "text-indigo-700", bg: "bg-indigo-50" },
  EMPLOYABILITY_QUOTIENT: { name: "Employability Quotient", color: "text-teal-700", bg: "bg-teal-50" },
  ACADEMIC_CAREER: { name: "Academic Career", color: "text-teal-700", bg: "bg-teal-50" },
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
  } | null;
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
  const router = useRouter();
  const auth = useMemo(() => getStoredAuth(), []);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!auth) {
      router.replace(getDashboardLoginPath());
      setLoading(false);
      return;
    }

    apiRequest<{ invoices: InvoiceItem[]; summary: Summary }>("/platform/organization/invoices", {}, auth.token)
      .then((res) => setInvoices(res.invoices))
      .catch(() => setError("Failed to load invoices."))
      .finally(() => setLoading(false));
  }, [auth]);

  const filtered = useMemo(() => {
    if (!search.trim()) return invoices;
    const q = search.toLowerCase();

    return invoices.filter((inv) => {
      const name = inv.user ? `${inv.user.firstName} ${inv.user.lastName}`.toLowerCase() : "";
      const email = inv.user?.email.toLowerCase() ?? "";

      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        name.includes(q) ||
        email.includes(q)
      );
    });
  }, [invoices, search]);

  const summary = useMemo(
    () => ({
      gross: filtered.reduce((sum, item) => sum + item.amount, 0),
      discount: filtered.reduce((sum, item) => sum + item.discountAmount, 0),
      net: filtered.reduce((sum, item) => sum + item.finalAmount, 0),
    }),
    [filtered]
  );

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
        <h1 className="text-2xl font-bold text-black sm:text-3xl">Payment Ledger</h1>
        <p className="mt-1 text-sm text-black">All completed payments in your organization.</p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {[
          { label: "Total Transactions", value: filtered.length.toString(), colorCls: "text-black" },
          { label: "Gross Revenue", value: fmt(summary.gross), colorCls: "text-black" },
          { label: "Net Revenue", value: fmt(summary.net), colorCls: "text-indigo-700" },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="mb-1 text-xs text-black">{card.label}</p>
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
        <div className="rounded-2xl border border-gray-100 bg-white px-5 py-12 text-center text-base text-black">
          {invoices.length === 0 ? "No transactions recorded yet." : "No results match your search."}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:hidden">
            {filtered.map((inv) => {
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
                      <p className="font-mono text-xs font-semibold text-black">{inv.invoiceNumber}</p>
                      <p className="mt-0.5 text-[11px] text-black">{dateStr}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${meta ? `${meta.bg} ${meta.color}` : "bg-gray-100 text-black"}`}
                  >
                    {meta?.name ?? inv.assessmentCode}
                  </span>

                  <div>
                    <p className="text-xs font-medium text-black">{userName}</p>
                    <p className="text-[11px] text-black">{inv.user?.email ?? "—"}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-gray-50 pt-2">
                    <div>
                      <p className="text-[10px] uppercase text-black">Gross</p>
                      <p className="mt-0.5 text-xs font-medium text-black">{fmt(inv.amount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-black">Discount</p>
                      <p className="mt-0.5 text-xs font-medium text-green-700">
                        {inv.discountAmount > 0 ? `- ${fmt(inv.discountAmount)}` : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-black">Net</p>
                      <p className="mt-0.5 text-xs font-bold text-black">{fmt(inv.finalAmount)}</p>
                    </div>
                  </div>

                  {inv.couponCode && <p className="font-mono text-[11px] text-black">Coupon: {inv.couponCode}</p>}
                </div>
              );
            })}

            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div>
                <p className="mb-0.5 text-[10px] uppercase text-black">Gross</p>
                <p className="text-xs font-bold text-black">{fmt(summary.gross)}</p>
              </div>
              <div>
                <p className="mb-0.5 text-[10px] uppercase text-black">Discount</p>
                <p className="text-xs font-bold text-green-700">
                  {summary.discount > 0 ? `- ${fmt(summary.discount)}` : "-"}
                </p>
              </div>
              <div>
                <p className="mb-0.5 text-[10px] uppercase text-black">Net</p>
                <p className="text-xs font-bold text-indigo-700">{fmt(summary.net)}</p>
              </div>
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-black">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Invoice</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Assessment</th>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-right">Gross</th>
                    <th className="px-4 py-3 text-right">Discount</th>
                    <th className="px-4 py-3 text-right">Net</th>
                    <th className="px-4 py-3 text-left">Coupon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((inv, idx) => {
                    const meta = ASSESSMENT_META[inv.assessmentCode];
                    const userName = inv.user ? `${inv.user.firstName} ${inv.user.lastName}` : "Unknown";
                    const dateStr = new Date(inv.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <tr key={inv._id} className="transition-colors hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-black">{idx + 1}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-black">
                          {inv.invoiceNumber}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-black">{dateStr}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta ? `${meta.bg} ${meta.color}` : "bg-gray-100 text-black"}`}
                          >
                            {meta?.name ?? inv.assessmentCode}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="whitespace-nowrap text-xs font-medium text-black">{userName}</p>
                          <p className="text-[11px] text-black">{inv.user?.email ?? "—"}</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-black">{fmt(inv.amount)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-green-700">
                          {inv.discountAmount > 0 ? `- ${fmt(inv.discountAmount)}` : "-"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-black">
                          {fmt(inv.finalAmount)}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-black">{inv.couponCode ?? "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50 text-xs font-semibold">
                    <td colSpan={5} className="px-4 py-3 text-black">
                      Totals ({filtered.length} records)
                    </td>
                    <td className="px-4 py-3 text-right text-black">{fmt(summary.gross)}</td>
                    <td className="px-4 py-3 text-right text-green-700">
                      {summary.discount > 0 ? `- ${fmt(summary.discount)}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-black">{fmt(summary.net)}</td>
                    <td colSpan={1} />
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
