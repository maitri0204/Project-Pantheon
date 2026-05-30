import ReviewerPaymentFlow from "@/components/reviewer/ReviewerPaymentFlow";
import Link from "next/link";

export const metadata = {
  title: "Reviewer Payment",
};

export default function ReviewerPaymentPage() {
  return (
    <main className="min-h-screen content-wrap mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Reviewer Payment</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">Back to home</Link>
        </div>

        <div className="neo-card p-6">
          <ReviewerPaymentFlow />
        </div>
      </div>
    </main>
  );
}
