"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/site/Footer";

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f0f6fc] to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <div className="h-5 w-px bg-gray-300" />
          <div className="inline-block bg-white rounded-lg px-2 py-1">
            <img
              src="/logo.png"
              alt="Thinking & Expression Skills Test"
              className="h-15 w-auto object-contain"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#0e5080] mb-3">
            Legal Disclaimer
          </h1>
          <div className="w-20 h-1 bg-[#0876b8] mx-auto rounded-full" />
        </div>

        {/* Disclaimer Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 lg:p-12 space-y-6 text-gray-700 leading-relaxed text-[15px]">
            <p>
            Assessment Center is designed as an educational and developmental assessment that aims to provide meaningful insights into a student&apos;s thinking patterns, learning strategies, and ability to express ideas. As outlined in the assessment report, the platform focuses on helping students and organizations understand how they plan, monitor, and reflect on learning processes, with the ultimate goal of supporting academic and personal growth.
          </p>

          <p>
            It is important to understand that this assessment is intended purely for guidance and
            developmental purposes. The results presented in the report reflect the student&apos;s
            responses at a specific point in time and indicate current learning behaviors and
            tendencies. These results should not be interpreted as fixed traits, permanent abilities,
            or a definitive measure of intelligence, academic capability, or future success.
          </p>

          <p>
            While the report provides actionable suggestions and improvement strategies - such as
            enhancing thinking awareness, planning, monitoring, and reflection skills - the outcomes
            of applying these recommendations may vary from student to student. Academic improvement
            and personal growth depend on multiple factors, including the student&apos;s effort,
            consistency, learning environment, and support from parents and educators. Therefore, the
            assessment does not guarantee specific academic or performance outcomes.
          </p>

          <p>
            The Thinking &amp; Expression Test is not a diagnostic or psychological instrument, which
            identify or evaluate learning disabilities, mental health conditions, or cognitive
            disorders. For any concerns related to such areas, it is strongly recommended that
            parents or guardians seek guidance from qualified educational or mental health
            professionals.
          </p>

          <p>
            Students are encouraged to approach the test with honesty and sincerity, as the accuracy
            and usefulness of the report depend significantly on the authenticity of their responses.
            The report should be viewed as a tool for self-improvement rather than judgment or
            labeling. Similarly, parents and educators are advised to use the insights provided as a
            supportive guide to understand the student better and encourage a growth-oriented
            mindset, rather than drawing limiting conclusions.
          </p>

          <p>
            KAREER Studio, ADMITra, and associated entities shall not be held responsible for
            decisions made based on the test results or for any academic or personal outcomes arising
            from their interpretation. The responsibility for applying the insights and
            recommendations lies with the student, along with the guidance of parents and educators.
          </p>

          <p>
            Furthermore, the Thinking &amp; Expression Test is part of an evolving educational
            framework. The assessment methodology, interpretation models, and recommendations may be
            updated over time to improve accuracy and effectiveness. The results provided are based
            on the current version of the assessment at the time of testing.
          </p>

          <p>
            By choosing to take this assessment, students and their parents or guardians acknowledge
            that they understand the purpose and limitations of the test and agree to use the results
            responsibly for learning and development purposes only.
          </p>
        </div>

        {/* Footer note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} All Rights Reserved by ADMITra &mdash; {" "}
            <Link href="/" className="text-blue-600 hover:underline">
              Back to Home
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </main>
  );
}