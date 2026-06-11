import Link from "next/link";
import Footer from "@/components/site/Footer";

export const metadata = { title: "Privacy Policy – Assessment Center" };

export default function PrivacyPolicyPage() {
  return (
    <main className="app-surface min-h-screen text-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm mb-6">
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Effective Date: 15.04.2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-[15px] leading-relaxed text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">1. Introduction</h2>
            <p>Assessment Center is an assessment platform designed to help students and organizations understand thinking patterns, learning strategies, and progress tracking, offered by KAREER Studio, ADMITra, and associated entities ("we", "us", "our").</p>
            <p>We respect your privacy and are committed to protecting the personal information of students, parents, educators, and institutions using our services.</p>
            <p>This Privacy Policy explains:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>what information we collect</li>
              <li>how we use it</li>
              <li>how we protect it</li>
              <li>your rights and choices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. Who This Policy Applies To</h2>
            <p>This policy applies to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Students using the Assessment Center</li>
              <li>Parents or guardians providing consent</li>
              <li>Schools and institutions using the Assessment Center</li>
              <li>Users accessing our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. Information We Collect</h2>
            <p>We collect only what is necessary to provide the service.</p>
            <h3 className="text-lg font-medium text-gray-800 mt-3">a. Personal Information</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name</li>
              <li>DOB / Age / Grade / Board</li>
              <li>Contact details (email, phone, if provided)</li>
              <li>City / Country</li>
              <li>School or institution (if applicable)</li>
              <li>Your Role</li>
            </ul>
            <h3 className="text-lg font-medium text-gray-800 mt-3">b. Assessment Data</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Responses to assessment questions</li>
              <li>Scores, patterns, and generated insights</li>
              <li>Progress data from improvement programs</li>
            </ul>
            <h3 className="text-lg font-medium text-gray-800 mt-3">c. Usage Data</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Login and activity data</li>
              <li>Device/browser information</li>
              <li>Interaction with the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Generate assessment reports and insights</li>
              <li>Provide personalized recommendations and programs</li>
              <li>Track progress and improvement over time</li>
              <li>Improve our assessment models and platform</li>
              <li>Communicate important updates (if contact details are provided)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. How We Share Information</h2>
            <p>We do not sell or rent personal data. We may share information only in the following cases:</p>
            <h3 className="text-lg font-medium text-gray-800 mt-3">a. With Parents or Guardians</h3>
            <p>For student reports and progress tracking.</p>
            <h3 className="text-lg font-medium text-gray-800 mt-3">b. With Schools or Institutions</h3>
            <p>If the assessment is conducted through a school program.</p>
            <h3 className="text-lg font-medium text-gray-800 mt-3">c. With Service Providers</h3>
            <p>Trusted technology partners (hosting, analytics, etc.) - only to the extent necessary to run the platform.</p>
            <h3 className="text-lg font-medium text-gray-800 mt-3">d. Legal Requirements</h3>
            <p>If required by law or regulatory authorities.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">6. Data Protection and Security</h2>
            <p>We take reasonable steps to protect your data, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Secure servers and encrypted storage</li>
              <li>Restricted access to authorized personnel only</li>
              <li>Regular monitoring and system updates</li>
            </ul>
            <p>However, no system is completely risk-free, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">7. Data Retention</h2>
            <p>We retain data only as long as necessary for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Providing the assessment and reports</li>
              <li>Tracking progress over time</li>
              <li>Meeting legal or compliance requirements</li>
            </ul>
            <p>Users may request deletion of their data (see Section 9).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">8. Children&apos;s Privacy</h2>
            <p>Since the Assessment Center is designed for students:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>For minors, parental or school consent may be asked</li>
              <li>We do not knowingly collect data without appropriate authorization</li>
            </ul>
            <p>Parents and guardians may review or request deletion of their child&apos;s data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">9. Your Rights</h2>
            <p>Depending on your role, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access your data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent (where applicable)</li>
            </ul>
            <p>To make a request, contact us at: <a href="mailto:hello@admitra.io" className="text-blue-600 hover:underline">hello@admitra.io</a></p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">10. Cookies and Tracking</h2>
            <p>We may use basic cookies or similar technologies to improve user experience and analyze platform usage. You can control cookie preferences through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">11. Third-Party Links</h2>
            <p>Our platform may contain links to third-party websites. We are not responsible for their privacy practices.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">12. Updates to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Any changes will be reflected with an updated "Effective Date." Users are encouraged to review this policy periodically.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">13. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy, contact:</p>
            <p>ADMITra<br />Email: <a href="mailto:hello@admitra.io" className="text-blue-600 hover:underline">hello@admitra.io</a><br />Website: <a href="https://admitra.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">admitra.io</a></p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}