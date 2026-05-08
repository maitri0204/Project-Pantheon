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
  const params = useParams();
  const slug = params?.slug as string;
  const auth = useMemo(() => getStoredAuth(), []);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth) return;
    apiRequest<{ invoices: InvoiceItem[] }>("/platform/student/invoices", {}, auth.token)
      .then((res) => setInvoices(res.invoices))
      .catch(() => setError("Failed to load invoices."))
      .finally(() => setLoading(false));
  }, [auth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Invoices</h1>
      <p className="text-sm text-gray-500 mb-6">Download proforma invoices for your completed payments.</p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          No paid invoices found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-medium text-black/70 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Invoice No.</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Assessment</th>
                  <th className="px-4 py-3 text-right">Amount Paid</th>
                  <th className="px-4 py-3 text-left">Coupon</th>
                  <th className="px-4 py-3 text-center">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map((inv, idx) => {
                  const meta = ASSESSMENT_META[inv.assessmentCode];
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
                      <td className="px-4 py-3 text-right text-xs font-semibold text-gray-900 whitespace-nowrap">
                        {fmt(inv.finalAmount)}
                      </td>
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
                                }
                                : undefined,
                          })}
                          className="text-xs px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium transition-colors"
                        >
                          ↓ PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
