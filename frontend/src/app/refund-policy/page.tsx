import Link from "next/link";
import Footer from "@/components/site/Footer";

export const metadata = { title: "Refund Policy – Assessment Center" };

export default function RefundPolicyPage() {
  return (
    <main className="app-surface min-h-screen text-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm mb-6">
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h1>
        <p className="text-sm text-gray-500 mb-1">Assessment Center / ADMITra</p>
        <p className="text-sm text-gray-500 mb-8">Effective Date: 15.04.2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-[15px] leading-relaxed text-gray-700">
          <p>
            This Refund Policy applies to all services, products, programs, assessments, consulting engagements,
            platform access, and business opportunities offered by KAREER Studio and ADMITra (collectively referred to
            as “Company”, “we”, “us”, “our”). By making any payment to the Company, the user (“Client”) agrees to this
            Refund Policy.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">1. STRICT NO-REFUND POLICY</h2>
            <p>All fees paid to KAREER Studio / ADMITra are non-refundable under all circumstances.</p>
            <p>This includes, but is not limited to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Consultation fees</li>
              <li>Education &amp; career planning fees</li>
              <li>Study abroad consulting fees</li>
              <li>IVY League admissions consulting fees</li>
              <li>Application processing fees</li>
              <li>Assessment fees (psychometric, Brainography, tests, reports)</li>
              <li>Coaching fees (IELTS, GRE, scholastic, language)</li>
              <li>Platform access fees (CORE or any system)</li>
              <li>Franchise sign-up fees</li>
              <li>Advisor / counselor onboarding fees</li>
              <li>Business opportunity or partnership fees</li>
              <li>Any other service fee paid for services procured or intended to be procured</li>
            </ul>
            <p>No refund shall be provided once payment is made, irrespective of usage, non-usage, or partial usage of services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. NO REFUND ON CHANGE OF INTENT</h2>
            <p>Refunds will not be granted in cases where the Client:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Changes their mind after payment</li>
              <li>Decides not to proceed with services</li>
              <li>Chooses a different country, course, or career path</li>
              <li>Withdraws from the process voluntarily</li>
              <li>Fails to participate in scheduled activities</li>
              <li>Does not utilize services after enrollment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. NO REFUND BASED ON OUTCOMES</h2>
            <p>Refunds will not be provided based on:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Admission rejection by universities</li>
              <li>Failure to secure IVY League admission</li>
              <li>Scholarship or financial aid outcomes</li>
              <li>Visa rejection or delay</li>
              <li>Academic performance</li>
              <li>External institutional decisions</li>
            </ul>
            <p>All such outcomes are beyond the control of the Company.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. NO REFUND FOR DELAYS OR THIRD-PARTY FACTORS</h2>
            <p>The Company shall not be liable for delays caused by:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Universities or educational institutions</li>
              <li>Embassies or visa authorities</li>
              <li>Third-party service providers</li>
              <li>Government regulations or policy changes</li>
              <li>Technical disruptions beyond reasonable control</li>
            </ul>
            <p>Such delays shall not qualify for refunds.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. NON-TRANSFERABILITY</h2>
            <p>Fees paid:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Cannot be transferred to another individual</li>
              <li>Cannot be adjusted against other services unless explicitly approved in writing</li>
              <li>Cannot be carried forward beyond the agreed service period</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">6. EXCEPTION (IF ANY)</h2>
            <p>Any exception to this Refund Policy:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Must be explicitly documented in a written agreement</li>
              <li>Must be signed by an authorized representative of KAREER Studio / ADMITra</li>
            </ul>
            <p>Verbal assurances or informal communication shall not be considered valid.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">7. FRAUD OR MISREPRESENTATION</h2>
            <p>If the Client is found to have:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Submitted false information</li>
              <li>Provided forged documents</li>
              <li>Misrepresented credentials</li>
            </ul>
            <p>Services may be terminated immediately without refund.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">8. PAYMENT DISPUTES</h2>
            <p>Clients agree not to initiate:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Chargebacks</li>
              <li>Payment reversals</li>
              <li>Payment disputes through banks or payment gateways</li>
            </ul>
            <p>without first attempting resolution through the Company.</p>
            <p>Any wrongful dispute may result in:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Legal action</li>
              <li>Recovery proceedings</li>
              <li>Blacklisting from future services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">9. SERVICE AVAILABILITY</h2>
            <p>The Company commits to providing services as per defined scope and timelines.</p>
            <p>However, non-utilization of services by the Client does not qualify for any refund.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">10. MODIFICATION OF POLICY</h2>
            <p>KAREER Studio / ADMITra reserves the right to modify this Refund Policy at any time.</p>
            <p>Updated versions will be published on official platforms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">11. GOVERNING LAW</h2>
            <p>This Refund Policy shall be governed by the laws of India.</p>
            <p>Any disputes shall be subject to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Arbitration as per applicable laws</li>
              <li>Jurisdiction: Ahmedabad / Vadodara</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">12. CONTACT</h2>
            <p>Entity: ADMITra and its associates</p>
            <p>Email: hello@admitra.io</p>
            <p>
              Website: <a href="https://core.admitra.io" className="text-blue-600 hover:underline">https://core.admitra.io</a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}