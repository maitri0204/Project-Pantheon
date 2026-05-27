"use client";

import { useParams } from "next/navigation";

const bullet = (items: string[]) => items.map((item) => item);

const styleCards = [
  {
    emoji: "👑",
    title: "KING STYLE",
    tag: "Control-Oriented",
    meaning: "You take control and make decisions for your child.",
    good: ["Discipline", "Clear direction", "Strong structure"],
    risk: ["Child becomes dependent", "Stops thinking independently", "May lose confidence"],
    rightWay: "Guide, but involve the child in decisions.",
    oneLine: "You lead everything. Child follows.",
  },
  {
    emoji: "🤝",
    title: "SERVANT STYLE",
    tag: "Support-Oriented",
    meaning: "You support your child and let them decide.",
    good: ["Builds confidence", "Encourages independence"],
    risk: ["Lack of direction", "Child may avoid challenges"],
    rightWay: "Support, but don’t over-protect.",
    oneLine: "You support. Child decides.",
  },
  {
    emoji: "🧠",
    title: "ELDER STYLE",
    tag: "Wisdom-Oriented",
    meaning: "You guide using experience and logic.",
    good: ["Strong thinking ability", "Better decisions over time"],
    risk: ["Too much advice", "Slow decisions"],
    rightWay: "Guide, don’t lecture.",
    oneLine: "You guide. Child learns and decides.",
  },
  {
    emoji: "✨",
    title: "PRINCE STYLE",
    tag: "Growth-Oriented",
    meaning: "You actively build your child’s future.",
    good: ["High exposure", "Faster skill development", "Better opportunities"],
    risk: ["Pressure to perform", "Fear of failure"],
    rightWay: "Invest, but don’t pressure.",
    oneLine: "You invest. Child grows.",
  },
  {
    emoji: "🎭",
    title: "JOKER STYLE",
    tag: "Fun-Oriented",
    meaning: "You make learning fun and engaging.",
    good: ["Creativity", "Strong bonding", "Less stress"],
    risk: ["Lack of discipline", "No seriousness"],
    rightWay: "Balance fun with structure.",
    oneLine: "You make learning fun.",
  },
];

const faqItems = [
  {
    q: "Is this a personality test?",
    a: "No. This doesn’t label you or put you into a type. It helps you understand how you actually behave — how you communicate, how you handle feedback, and where you can improve.",
  },
  {
    q: "How long does it take?",
    a: "The assessment takes about 15–20 minutes. After that, you get your report and access to a 30-day improvement program.",
  },
  {
    q: "Is this useful for all students?",
    a: "Yes. Whether a student is quiet and reserved, confident but misunderstood, or somewhere in between, this helps them become more aware and communicate better.",
  },
  {
    q: "What will I get after the assessment?",
    a: "A clear report showing your strengths, blind spots, how others may see you, what you need to improve, and a step-by-step action plan.",
  },
  {
    q: "How is this different from other assessments?",
    a: "Most assessments only tell you about yourself. CLEAR goes one step further — it helps you change your behavior. You don’t just get insights; you get a plan to improve.",
  },
  {
    q: "Will this really help improve confidence?",
    a: "Yes — but not by motivation. Confidence improves when you express yourself clearly, handle feedback better, and understand yourself.",
  },
  {
    q: "Do parents or schools get involved?",
    a: "They can, if needed. Parents can see progress and understand their child better. Schools can use it as a structured development program.",
  },
  {
    q: "What if I don’t take action after the assessment?",
    a: "Then nothing changes. This only works if you follow the small daily actions, reflect honestly, and try new behavior. It’s not just about knowing yourself — it’s about improving yourself.",
  },
];

export default function AssessmentInfoPage() {
  const params = useParams<{ code: string }>();
  const code = String(params?.code || "").toUpperCase();

  if (code !== "LITMUS_TEST" && code !== "LITMUS") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">Assessment Overview</h1>
          <p className="mt-3 text-slate-600">Information for this assessment is not available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-amber-50 via-white to-slate-50 py-8">
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-amber-200 bg-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-8 sm:p-10 lg:p-12">
              <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-800">
                Litmus Test
              </span>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
                The First Step to Confident Parenting
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
                Understand your parenting style and how it shapes your child’s future.
              </p>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                This Litmus Test helps you identify how you guide, support, and influence your child’s decisions.
              </p>

              <div className="mt-8 rounded-3xl bg-slate-900 p-6 text-white shadow-lg">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">Supporting line</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  Used by students, parents, and schools to develop real-life communication and emotional awareness skills.
                </p>
              </div>
            </div>

            <div className="bg-[linear-gradient(160deg,#111827,#0b1220)] p-8 text-white sm:p-10 lg:p-12">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">At a glance</p>
                <div className="mt-5 space-y-4 text-sm leading-7 text-slate-200">
                  <p>Understand your parenting style.</p>
                  <p>See how it shapes confidence, decision-making, and future choices.</p>
                  <p>Recognize how you guide, support, and influence your child.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  ["Clarity", "See your style clearly"],
                  ["Impact", "Understand your influence"],
                  ["Growth", "Improve your approach"],
                ].map(([title, desc]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Most Parents Don’t Know This</h2>
          <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
            Every parent wants the best for their child. But very few understand how their own behavior is shaping the child’s thinking, confidence, and decisions.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              "Some parents control too much.",
              "Some give too much freedom.",
              "Some push too hard.",
              "Some avoid direction completely.",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-amber-50 p-5 text-sm font-medium text-slate-700">{item}</div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-7 text-slate-800">
            The result? Confused children. Low confidence. Wrong career choices. This is where clarity begins.
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">What is the Litmus Test?</h2>
          <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
            The Litmus Test is a simple but powerful tool that helps you understand your primary parenting style, your secondary parenting style, and how your behavior impacts your child.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["Primary Parenting Style", "See your dominant pattern."],
              ["Secondary Parenting Style", "Understand your second influence."],
              ["Parenting Score", "Identify where you stand across five styles."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-900">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {["King", "Servant", "Elder", "Prince", "Joker"].map((style) => (
              <span key={style} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                {style}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">How the Test Works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["1", "You observe your child in real-life situations", "Focus on real behavior, not assumptions."],
              ["2", "You select behaviors from different scenarios", "Choose patterns across situations."],
              ["3", "You identify patterns, not one-time actions", "The goal is consistent behavior, not single events."],
              ["4", "You get your parenting style score", "The focus is not perfection. It is pattern recognition."],
            ].map(([step, title, desc]) => (
              <div key={title} className="rounded-3xl bg-slate-50 p-5">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-black text-amber-800">
                  {step}
                </div>
                <p className="mt-4 text-lg font-bold text-slate-900">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">What You Will Observe</h2>
          <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
            You will answer simple situations like how your child reacts to failure, behaves in a group, responds to authority, what motivates them, and how they communicate.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {bullet([
              "How your child reacts to failure",
              "How they behave in a group",
              "How they respond to authority",
              "What motivates them",
              "How they communicate",
            ]).map((item) => (
              <div key={item} className="rounded-2xl bg-amber-50 p-5 text-sm font-medium text-slate-700">
                {item}
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-700">These observations help identify deeper behavioral patterns.</p>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">The 5 Parenting Styles</h2>
          <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
            Keep it clean and structured. Every style has strengths. Every style has risks.
          </p>

          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {styleCards.map((style) => (
              <article key={style.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-2xl">{style.emoji}</p>
                    <h3 className="mt-2 text-2xl font-black text-slate-900">{style.title}</h3>
                    <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">{style.tag}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                    {style.oneLine}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-700">What it means: {style.meaning}</p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-bold text-emerald-700">What’s good</p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                      {style.good.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-bold text-rose-700">What can go wrong</p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                      {style.risk.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-slate-900 p-4 text-white">
                  <p className="text-sm font-semibold text-amber-200">Right way</p>
                  <p className="mt-1 text-sm leading-6">{style.rightWay}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-sm font-semibold leading-7 text-slate-800">
            There is no perfect parenting style. The goal is not to choose one. The goal is to balance them based on your child.
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Why This Test is Important</h2>
          <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
            Your parenting style directly affects your child’s confidence, decision-making ability, career choices, and emotional strength.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              "Your child’s confidence",
              "Decision-making ability",
              "Career choices",
              "Emotional strength",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-amber-50 p-5 text-sm font-semibold text-slate-700">
                {item}
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-800">
            If you don’t understand your approach, you may unknowingly create long-term problems.
          </p>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">What You Will Get</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              "Your Primary Parenting Style",
              "Your Secondary Style",
              "Strengths and risks of your approach",
              "Clear improvement suggestions",
              "Personalized report",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-medium text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-slate-900 p-6 text-white shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">CTA section</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Start Your Parenting Clarity Journey</h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-200">
            Don’t guess. Don’t assume. Understand your impact.
          </p>
          <p className="mt-2 text-sm font-semibold text-amber-200">Take the Litmus Test now and get your personalized report.</p>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">FAQs for Litmus</h2>
          <div className="mt-6 grid gap-4">
            {faqItems.map((faq) => (
              <details key={faq.q} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">{faq.q}</summary>
                <p className="mt-3 text-sm leading-7 text-slate-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
