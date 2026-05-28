"use client";

import { useParams } from "next/navigation";

type ContentBlock = { title: string; body?: string; bullets?: string[] };

type AssessmentPageContent = {
  theme: {
    badge: string;
    badgeClass: string;
    gradient: string;
    supportCardClass: string;
    calloutClass: string;
    glanceTextClass: string;
  };
  hero: {
    title: string;
    subtitle: string;
    supportingLine: string;
    sidePoints: string[];
  };
  sections: Array<{
    title: string;
    subtitle?: string;
    blocks?: ContentBlock[];
    cards?: Array<{ title: string; body: string; hint?: string }>;
    bullets?: string[];
    callout?: string;
    grid?: Array<{ title: string; body: string }>;
  }>;
  faq?: Array<{ q: string; a: string }>;
};

const content: Record<string, AssessmentPageContent> = {
  CAREER_COMPASS: {
    theme: {
      badge: "Career Compass & Personality Profiler",
      badgeClass: "bg-indigo-50 text-indigo-800",
      gradient: "from-indigo-50 via-white to-slate-50",
      supportCardClass: "bg-indigo-50 text-slate-900",
      calloutClass: "border-indigo-200 bg-indigo-50 text-slate-800",
      glanceTextClass: "text-indigo-200",
    },
        hero: {
          title: "Discover Your True Potential. Choose the Right Career Path.",
          subtitle:
            "A scientifically designed student assessment that helps students understand their personality, strengths, interests, and natural working style.",
          supportingLine:
            "Used by students, parents, and schools to guide academic stream selection, subject choices, and future career direction.",
          sidePoints: [
            "For Grade 8–12 students",
            "Career awareness and self-discovery",
            "Personality-pattern based insights",
          ],
        },
        sections: [
          {
            title: "Who should take this?",
            subtitle: "Built for students, useful for parents and schools.",
            cards: [
              { title: "For Students", body: "Want to explore streams, subjects, and future careers with more confidence." },
              { title: "For Parents", body: "Want to support informed career decisions and understand their child better." },
              { title: "For Schools", body: "Want a structured career guidance program that improves student awareness." },
            ],
          },
          {
            title: "Why students need Career Compass",
            subtitle: "Many students choose careers without understanding their own strengths.",
            bullets: [
              "Wrong stream selection in Class 11",
              "Lack of motivation in studies",
              "Poor academic performance",
              "Career confusion later in life",
            ],
            callout: "Career Compass helps students understand themselves before they choose a path.",
          },
          {
            title: "What the assessment evaluates",
            cards: [
              { title: "Energy source", body: "How students interact with people and the world around them." },
              { title: "Information processing", body: "How they learn new concepts and approach new ideas." },
              { title: "Decision-making style", body: "How they evaluate choices and solve problems." },
              { title: "Lifestyle and work style", body: "How they plan, structure, and manage tasks." },
            ],
            callout: "These dimensions combine into a unique personality profile that forms the foundation for career recommendations.",
          },
          {
            title: "How the assessment helps students",
            grid: [
              { title: "Self-awareness", body: "Students discover their natural strengths, learning style, emotional tendencies, and communication style." },
              { title: "Stream guidance", body: "Supports choices for Science, Commerce, Arts, and interdisciplinary paths aligned to personality and interest." },
              { title: "Subject selection", body: "Helps students choose subjects that match the way they think and work best." },
              { title: "Career direction", body: "Suggests career domains that fit the student’s personality profile and strengths." },
            ],
          },
          {
            title: "What students receive",
            cards: [
              { title: "Personality profile", body: "A clear summary of the student’s core pattern." },
              { title: "Strength analysis", body: "Highlights talents, strengths, and learning preferences." },
              { title: "Academic roadmap", body: "Suggests streams, subjects, and career domains." },
            ],
          },
          {
            title: "Why this is different",
            subtitle: "Unlike traditional aptitude tests, Career Compass focuses on personality, mindset, and natural tendencies.",
            callout: "The result is a more personalized and sustainable career path.",
          },
        ],
      },

      CAREER_DNA: {
        theme: {
          badge: "Career DNA Profiler",
          badgeClass: "bg-violet-50 text-violet-800",
          gradient: "from-violet-50 via-white to-slate-50",
          supportCardClass: "bg-violet-50 text-slate-900",
          calloutClass: "border-violet-200 bg-violet-50 text-slate-800",
          glanceTextClass: "text-violet-200",
        },
        hero: {
          title: "Go Beyond One Test. Build Your Complete Career DNA.",
          subtitle:
            "A multi-section profiler that measures how students think, decide, learn, adapt, and perform across academic and real-world contexts.",
          supportingLine:
            "Career DNA combines cognitive, aptitude, personality, interest, emotional, behavioral, learning, and resilience insights into one integrated profile.",
          sidePoints: ["8 capability domains", "Integrated profile", "Career-aligned direction"],
        },
        sections: [
          {
            title: "Who should take Career DNA",
            subtitle: "Built for students planning their academic and career journey.",
            cards: [
              { title: "For Students", body: "Who want clear direction based on strengths, interests, learning style, and real capability." },
              { title: "For Parents", body: "Who need a complete understanding of how their child learns, handles pressure, and makes decisions." },
              { title: "For Schools", body: "Who want deeper profiling beyond marks to support stream guidance and mentoring." },
            ],
          },
          {
            title: "What Career DNA evaluates",
            subtitle: "Eight connected assessments in one journey.",
            cards: [
              { title: "Cognitive Ability", body: "Verbal, numerical, spatial reasoning, and memory speed." },
              { title: "Aptitude", body: "Logical, verbal, numerical, mechanical, and creativity potential." },
              { title: "Personality", body: "Social style, thinking style, decision style, and working style." },
              { title: "Career Interest (RIASEC)", body: "Realistic, Investigative, Artistic, Social, Enterprising, Conventional preferences." },
              { title: "Emotional Intelligence", body: "Self-awareness, regulation, empathy, and social skills." },
              { title: "Learning Style", body: "Visual, auditory, reading-writing, kinesthetic, logical, social, solitary, musical." },
              { title: "Behavioral & Social", body: "Adaptability, teamwork, leadership, and communication skills." },
              { title: "Stress & Resilience", body: "Stress awareness, coping, self-talk, and bounce-back ability." },
            ],
          },
          {
            title: "Why students need this now",
            bullets: [
              "Marks alone do not reveal complete potential",
              "Career decisions need both aptitude and behavior insight",
              "Students require stronger self-awareness for long-term success",
              "Families need practical guidance, not generic suggestions",
            ],
            callout: "Career DNA creates a deeper profile by combining performance, preference, and personality signals.",
          },
          {
            title: "How this helps in real decisions",
            grid: [
              { title: "Stream and subject selection", body: "Align choices with capability, interest, and working style." },
              { title: "Learning strategy", body: "Use dominant learning preferences to improve outcomes." },
              { title: "Career direction", body: "Explore domains that match strengths and RIASEC trends." },
              { title: "Personal growth", body: "Build emotional and behavioral skills required for higher education and careers." },
            ],
          },
          {
            title: "What students and parents receive",
            cards: [
              { title: "Section-wise capability scores", body: "Clear breakdown for all eight domains." },
              { title: "Dominant patterns", body: "Top traits, styles, and interest codes with interpretation." },
              { title: "Actionable guidance", body: "Practical next steps for study, skill-building, and career planning." },
            ],
          },
          {
            title: "What makes Career DNA different",
            bullets: [
              "It is a multi-assessment profiler, not a single-score test",
              "It connects capability, personality, and interest in one model",
              "It supports both academic planning and long-term career readiness",
            ],
            callout: "Career DNA helps students choose with clarity, confidence, and evidence.",
          },
        ],
      },

      CLEAR: {
        theme: {
          badge: "CLEAR",
          badgeClass: "bg-emerald-50 text-emerald-800",
          gradient: "from-emerald-50 via-white to-slate-50",
          supportCardClass: "bg-emerald-50 text-slate-900",
          calloutClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
          glanceTextClass: "text-emerald-200",
        },
        hero: {
          title: "Know Yourself. Express Better. Connect Better.",
          subtitle:
            "A structured self-awareness and communication assessment tool designed for students to build confidence, express clearly, and handle feedback effectively.",
          supportingLine: "Used by students, parents, and schools to develop real-life communication and emotional awareness skills.",
          sidePoints: ["Self-awareness", "Communication clarity", "Feedback handling"],
        },
        sections: [
          {
            title: "Who needs this?",
            subtitle: "Built for students, useful for parents and schools.",
            cards: [
              { title: "For Students", body: "Want to speak confidently, express clearly, and improve relationships." },
              { title: "For Parents", body: "Want their child to open up, communicate at home, and gain confidence beyond marks." },
              { title: "For Schools", body: "Want better classroom participation, stronger peer relationships, and structured growth." },
            ],
          },
          {
            title: "Why do students need this?",
            subtitle: "Students are struggling - not with intelligence, but with expression.",
            bullets: [
              "Don’t express what they actually think",
              "Avoid difficult conversations",
              "Get uncomfortable with feedback",
              "Feel misunderstood in friendships and group work",
            ],
            callout: "The problem is not capability. The problem is lack of self-awareness and communication clarity.",
          },
          {
            title: "What CLEAR helps students do",
            bullets: [
              "Understand how they see themselves vs how others see them",
              "Identify gaps in communication and behavior",
              "Improve openness, confidence, and feedback handling",
              "Build stronger relationships in school and college",
            ],
            callout: "This is not a personality test. This is a behavior-based self-awareness system.",
          },
          {
            title: "How it works",
            cards: [
              { title: "Take the assessment", body: "Answer questions based on real-life situations." },
              { title: "Understand your pattern", body: "Discover how you communicate, handle feedback, and hold back." },
              { title: "Get your personalized report", body: "See your strengths, blind spots, and what needs improvement." },
              { title: "Follow a 30-day plan", body: "Daily small actions to speak better, accept feedback, and build confidence." },
            ],
          },
          {
            title: "The CLEAR model",
            subtitle: "Understand your behavior through 4 simple zones.",
            cards: [
              { title: "Open zone", body: "I express myself and people understand me.", hint: "You communicate clearly. You are open and confident." },
              { title: "Blind zone", body: "Others notice things in me which I don’t.", hint: "You may not realize how others experience you." },
              { title: "Hidden zone", body: "I think a lot but don’t express fully.", hint: "You think a lot but hold back yourself." },
              { title: "Unknown zone", body: "I haven’t explored myself enough.", hint: "You haven’t tried enough to discover yourself." },
            ],
            callout: "The goal is simple: Identify and expand your Open Zone.",
          },
          {
            title: "What students will gain",
            grid: [
              { title: "Communication", body: "Speak clearly and share thoughts." },
              { title: "Emotional awareness", body: "Understand feelings and respond better." },
              { title: "Feedback handling", body: "Accept feedback without reacting and improve faster." },
              { title: "Relationships", body: "Build better friendships and stronger teamwork." },
              { title: "Confidence", body: "Speak up and take initiative." },
            ],
          },
          {
            title: "For parents",
            subtitle: "Help your child become more confident and self-aware.",
            bullets: [
              "Express thoughts without hesitation",
              "Handle feedback maturely",
              "Build healthy relationships",
              "Improve confidence in school and social situations",
            ],
            callout: "You receive a detailed assessment report, communication profile, and improvement roadmap.",
          },
          {
            title: "FAQs",
            cards: [
              { title: "Is this a personality test?", body: "No. It helps you understand how you behave, communicate, and handle feedback." },
              { title: "How long does it take?", body: "About 15-20 minutes, followed by your report and a 30-day improvement program." },
              { title: "Will this improve confidence?", body: "Yes - by improving self-expression, feedback handling, and self-understanding." },
            ],
          },
        ],
      },

      LITMUS: {
        theme: {
          badge: "Litmus Test",
          badgeClass: "bg-amber-100 text-amber-800",
          gradient: "from-amber-50 via-white to-slate-50",
          supportCardClass: "bg-amber-50 text-slate-900",
          calloutClass: "border-amber-200 bg-amber-50 text-amber-800",
          glanceTextClass: "text-amber-200",
        },
        hero: {
          title: "The First Step to Confident Parenting",
          subtitle: "Understand your parenting style and how it shapes your child’s future.",
          supportingLine: "This Litmus Test helps you identify how you guide, support, and influence your child’s decisions.",
          sidePoints: ["Primary style", "Secondary style", "Parenting score"],
        },
        sections: [
          {
            title: "Most parents don’t know this",
            subtitle: "Every parent wants the best for their child, but few understand how their behavior shapes confidence and decisions.",
            bullets: ["Some parents control too much.", "Some give too much freedom.", "Some push too hard.", "Some avoid direction completely."],
            callout: "The result? Confused children. Low confidence. Wrong career choices. This is where clarity begins.",
          },
          {
            title: "What is the Litmus Test?",
            bullets: [
              "Your Primary Parenting Style",
              "Your Secondary Parenting Style",
              "How your behavior impacts your child",
            ],
            callout: "The report identifies where you stand across five parenting styles: King, Servant, Elder, Prince, and Joker.",
          },
          {
            title: "How the test works",
            cards: [
              { title: "1. Observe real-life situations", body: "Notice how your child behaves in everyday moments." },
              { title: "2. Select behaviors", body: "Choose what fits different scenarios." },
              { title: "3. Identify patterns", body: "Focus on repeated behavior, not one-time actions." },
              { title: "4. Get your style score", body: "The focus is pattern recognition, not perfection." },
            ],
          },
          {
            title: "What you will observe",
            bullets: [
              "How your child reacts to failure",
              "How they behave in a group",
              "How they respond to authority",
              "What motivates them",
              "How they communicate",
            ],
            callout: "These observations help identify deeper behavioral patterns.",
          },
          {
            title: "The 5 parenting styles",
            cards: [
              { title: "King style", body: "Control-oriented. You lead everything; the child follows.", hint: "Good for discipline and direction, but can reduce independence." },
              { title: "Servant style", body: "Support-oriented. You support; the child decides.", hint: "Good for confidence, but may lack direction." },
              { title: "Elder style", body: "Wisdom-oriented. You guide; the child learns and decides.", hint: "Good thinking and better decisions, but avoid over-lecturing." },
              { title: "Prince style", body: "Growth-oriented. You invest; the child grows.", hint: "Great for exposure and opportunities, but avoid pressure." },
              { title: "Joker style", body: "Fun-oriented. You make learning fun.", hint: "Great bonding and creativity, but keep structure too." },
            ],
            callout: "There is no perfect parenting style — the goal is to balance them based on your child.",
          },
          {
            title: "Why this test is important",
            bullets: [
              "Your child’s confidence",
              "Decision-making ability",
              "Career choices",
              "Emotional strength",
            ],
            callout: "If you don’t understand your approach, you may unknowingly create long-term problems.",
          },
          {
            title: "What you will get",
            cards: [
              { title: "Primary style", body: "Your dominant parenting style." },
              { title: "Secondary style", body: "Your secondary influence." },
              { title: "Strengths and risks", body: "A clear picture of your approach." },
              { title: "Improvement suggestions", body: "Practical ways to improve." },
              { title: "Personalized report", body: "A report tailored to your responses." },
            ],
          },
          {
            title: "FAQs",
            cards: [
              { title: "Is this a personality test?", body: "No. It identifies parenting behavior patterns and their effect on children." },
              { title: "How long does it take?", body: "About 15–20 minutes, followed by your score and report." },
              { title: "Will this help confidence?", body: "Yes, when the insights are used to guide real behavior change." },
            ],
          },
        ],
      },

      TEST: {
        theme: {
          badge: "Thinking & Expression Skills Test",
          badgeClass: "bg-sky-50 text-sky-800",
          gradient: "from-sky-50 via-white to-slate-50",
          supportCardClass: "bg-sky-50 text-slate-900",
          calloutClass: "border-sky-200 bg-sky-50 text-slate-800",
          glanceTextClass: "text-sky-200",
        },
        hero: {
          title: "Every Child Thinks Differently. Discover the Beautiful Way Your Child’s Mind Works.",
          subtitle: "A powerful assessment designed to develop confident thinkers and independent learners.",
          supportingLine: "The Thinking & Expression Skills Test evaluates how students think, learn, reflect, and express ideas - beyond memory alone.",
          sidePoints: ["Thinking awareness", "Learning strategy", "Self-monitoring"],
        },
        sections: [
          {
            title: "Why Students Struggle Today",
            subtitle: "Many Students Study Hard… But Still Struggle",
            bullets: [
              "Memorize without understanding",
              "Struggle to express answers clearly",
              "Feel exam pressure and anxiety",
              "Do not know how to study effectively",
            ],
            callout: "Most traditional exams only check what students remember, not how well they understand or think.",
          },
          {
            title: "Problem - Students & Parents",
            subtitle: "Common learning pain points",
            blocks: [
              { title: "Students", body: "Memorize without understanding; struggle to explain answers; fear during exams; lack confidence in thinking and problem-solving; unsure how to study effectively." },
              { title: "Parents", body: "Cannot understand their child’s learning style; see inconsistent performance; want to help but don’t know how." },
            ],
          },
          {
            title: "What the Thinking & Expression Skills Test Measures",
            bullets: [
              "Thinking Awareness: How students understand questions and plan solutions",
              "Learning Strategy: How students plan and organize study",
              "Self-Monitoring: How students notice gaps and adjust learning",
              "Expression & Reflection: How clearly students communicate ideas and reflect on learning",
            ],
          },
          {
            title: "Why This Test Matters Today",
            bullets: [
              "Develop critical thinking ability",
              "Improve problem-solving skills",
              "Build clear communication style",
              "Foster self-awareness in learning",
              "Increase confidence in expression",
            ],
            callout: "The Thinking & Expression Skills Test bridges the gap between rote learning and deeper understanding.",
          },
          {
            title: "What Makes This Test Different",
            bullets: [
              "Asks how students think, not just what they remember",
              "Focuses on metacognition and expression",
              "Produces actionable insights and study strategies",
            ],
          },
          {
            title: "Benefits for Students",
            bullets: [
              "Better understanding of how they learn",
              "Stronger critical thinking skills",
              "Improved problem-solving ability",
              "Greater confidence in expressing ideas",
              "Reduced exam anxiety",
            ],
          },
          {
            title: "Benefits for Parents",
            bullets: [
              "Clear insights into thinking patterns and learning habits",
              "Understand cognitive strengths and areas to support",
              "Practical guidance to help the child improve",
            ],
          },
          {
            title: "Ideal For",
            bullets: [
              "School students (Grades 5–12)",
              "Students preparing for competitive learning environments",
              "Parents who want deeper insights into learning styles",
              "Schools promoting thinking-based education",
            ],
          },
          {
            title: "Help Your Child Become a Confident Thinker",
            callout: "The Thinking & Expression Skills Test creates strong thinkers - not just good test-takers.",
          },
        ],
      },
    };

    const FALLBACK_CODE_MAP: Record<string, keyof typeof content> = {
      CAREER_COMPASS_TEST: "CAREER_COMPASS",
      CAREER_COMPASS: "CAREER_COMPASS",
      CAREER_DNA: "CAREER_DNA",
      CAREERDNA: "CAREER_DNA",
      DNA: "CAREER_DNA",
      CLEAR: "CLEAR",
      JOHARI: "CLEAR",
      JOHARI_WINDOW: "CLEAR",
      LITMUS: "LITMUS",
      LITMUS_TEST: "LITMUS",
      METACOGNITION: "TEST",
      METACOGNITION_TEST: "TEST",
      "METACOGNITION-TEST": "TEST",
      THINKING_EXPRESSION_TEST: "TEST",
      "THINKING-EXPRESSION-TEST": "TEST",
      TEST: "TEST",
    };

    function normalizeAssessmentCode(code: string): keyof typeof content | null {
      const raw = String(code || "").toUpperCase();

      // 1) Direct exact key match
      if (Object.prototype.hasOwnProperty.call(content, raw)) return raw as keyof typeof content;

      // 2) Known fallbacks
      if (FALLBACK_CODE_MAP[raw]) return FALLBACK_CODE_MAP[raw];

      // 3) Try a relaxed match: strip non-alphanumerics and compare normalized forms
      const normalize = (s: string) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      const target = normalize(raw);
      if (!target) return null;

      for (const k of Object.keys(content)) {
        if (normalize(k) === target) return k as keyof typeof content;
      }

      return null;
    }

    function renderCards(cards?: Array<{ title: string; body: string; hint?: string }>) {
      if (!cards?.length) return null;
      return (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <div key={card.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.body}</p>
              {card.hint && <p className="mt-3 text-sm font-medium text-slate-500">{card.hint}</p>}
            </div>
          ))}
        </div>
      );
    }

    function renderBullets(bullets?: string[]) {
      if (!bullets?.length) return null;
      return (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {bullets.map((item) => (
            <div key={item} className="rounded-2xl bg-slate-50 p-5 text-sm font-medium leading-6 text-slate-700">
              {item}
            </div>
          ))}
        </div>
      );
    }

    function renderGrid(grid?: Array<{ title: string; body: string }>) {
      if (!grid?.length) return null;
      return (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {grid.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      );
    }

    function renderSections(theme: AssessmentPageContent["theme"], sections: AssessmentPageContent["sections"]) {
      return sections.map((section) => (
        <section key={section.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">{section.title}</h2>
            {section.subtitle && <p className="mt-3 text-base leading-7 text-slate-600">{section.subtitle}</p>}
          </div>

          {renderCards(section.cards)}
          {renderBullets(section.bullets)}
          {renderGrid(section.grid)}

          {section.callout && (
            <div className={`mt-6 rounded-3xl border border-dashed p-5 text-sm font-semibold leading-7 ${theme.calloutClass}`}>
              {section.callout}
            </div>
          )}
        </section>
      ));
    }

    function renderHero(normalizedCode: keyof typeof content, page: AssessmentPageContent) {
      const heroBadgeItems =
        normalizedCode === "CAREER_COMPASS"
          ? [
              { title: "Explore", desc: "Streams and subjects", icon: "🔭" },
              { title: "Align", desc: "Strengths with careers", icon: "🎯" },
              { title: "Plan", desc: "A clearer roadmap", icon: "📘" },
            ]
          : normalizedCode === "CAREER_DNA"
          ? [
              { title: "Measure", desc: "8 capability domains", icon: "🧩" },
              { title: "Map", desc: "Patterns and strengths", icon: "🗺️" },
              { title: "Match", desc: "Career-aligned direction", icon: "🎯" },
            ]
          : normalizedCode === "CLEAR"
          ? [
              { title: "See yourself", desc: "Understand how you show up", icon: "🪞" },
              { title: "Express better", desc: "Communicate with clarity", icon: "🗣️" },
              { title: "Handle feedback", desc: "Respond without shutdown", icon: "⚡" },
              { title: "Connect better", desc: "Build stronger relationships", icon: "🤝" },
            ]
          : normalizedCode === "TEST"
          ? [
              { title: "Think", desc: "Understand approach to problems", icon: "🧠" },
              { title: "Learn", desc: "Plan and monitor learning", icon: "📚" },
              { title: "Express", desc: "Communicate ideas clearly", icon: "🗣️" },
            ]
          : [
              { title: "King", desc: "Control and structure", icon: "👑" },
              { title: "Servant", desc: "Support and independence", icon: "🤝" },
              { title: "Elder", desc: "Wisdom and logic", icon: "🧠" },
              { title: "Prince", desc: "Growth and opportunities", icon: "✨" },
              { title: "Joker", desc: "Fun and bonding", icon: "🎭" },
            ];

      const heroSidePoints =
        normalizedCode === "CAREER_COMPASS"
          ? [
              { title: "Grade 8–12 guidance", desc: "Career awareness and self-discovery", icon: "🧭" },
              { title: "Personality patterns", desc: "Understand natural tendencies", icon: "🧠" },
              { title: "Actionable direction", desc: "Suggested academic and career paths", icon: "📈" },
            ]
          : normalizedCode === "CAREER_DNA"
          ? [
              { title: "Multi-assessment", desc: "Eight sections, one integrated profile", icon: "🧩" },
              { title: "Capability insight", desc: "Performance + preference + behavior", icon: "📊" },
              { title: "Practical roadmap", desc: "Actionable next steps for growth", icon: "🛣️" },
            ]
          : normalizedCode === "CLEAR"
          ? [
              { title: "Self-awareness", desc: "Know how you show up in real conversations", icon: "🪞" },
              { title: "Communication clarity", desc: "Build clarity in feedback and behavior", icon: "🗣️" },
              { title: "Feedback handling", desc: "Improve confidence through action", icon: "⚡" },
            ]
          : normalizedCode === "TEST"
          ? [
              { title: "Thinking Awareness", desc: "Approach and problem-solving methods", icon: "🧠" },
              { title: "Learning Strategy", desc: "Plan and organize study", icon: "🗂️" },
              { title: "Self-Monitoring", desc: "Recognize gaps and adjust", icon: "🔍" },
            ]
          : [
              { title: "Confidence", desc: "Your child’s confidence", icon: "🌱" },
              { title: "Decisions", desc: "Decision-making ability", icon: "🧭" },
              { title: "Career", desc: "Career choices", icon: "🎓" },
            ];

      if (normalizedCode === "CAREER_COMPASS") {
        return (
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <div className="p-8 sm:p-10 lg:p-12">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${page.theme.badgeClass}`}>{page.theme.badge}</span>
                <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">{page.hero.title}</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">{page.hero.subtitle}</p>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{page.hero.supportingLine}</p>

                <div className="mt-8 rounded-3xl bg-indigo-50 p-6 shadow-lg">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-700">Career snapshot</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">Stream fit, subject fit, and career fit in one clean view.</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {heroBadgeItems.map((item) => (
                      <div key={item.title} className="rounded-2xl bg-white/75 p-4 shadow-sm">
                        <div className="text-2xl">{item.icon}</div>
                        <p className="mt-2 text-sm font-bold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden bg-[linear-gradient(160deg,#0f172a,#111827)] p-8 text-white sm:p-10 lg:p-12">
                <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl" />
                <div className="absolute -left-6 bottom-4 h-28 w-28 rounded-full bg-indigo-400/10 blur-3xl" />
                <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">At a glance</p>
                  <div className="mt-5 space-y-3">
                    {heroSidePoints.map((point) => (
                      <div key={point.title} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xl">{point.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-white">{point.title}</p>
                          <p className="text-xs text-slate-300">{point.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                      <p className="text-sm font-semibold text-white">16 patterns</p>
                      <p className="mt-1 text-xs leading-5 text-slate-300">Personality mapping for career fit</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                      <p className="text-sm font-semibold text-white">Stream fit</p>
                      <p className="mt-1 text-xs leading-5 text-slate-300">Subject and domain recommendations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }

      if (normalizedCode === "CLEAR") {
        return (
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <div className="p-8 sm:p-10 lg:p-12">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${page.theme.badgeClass}`}>{page.theme.badge}</span>
                <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">{page.hero.title}</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">{page.hero.subtitle}</p>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{page.hero.supportingLine}</p>

                <div className="mt-8 rounded-3xl bg-emerald-50 p-6 shadow-lg">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Behavior map</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">Know how you show up, communicate, and respond in real situations.</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {heroBadgeItems.map((item) => (
                      <div key={item.title} className="rounded-2xl bg-white/75 p-4 shadow-sm">
                        <div className="text-2xl">{item.icon}</div>
                        <p className="mt-2 text-sm font-bold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden bg-[linear-gradient(160deg,#0b1220,#111827)] p-8 text-white sm:p-10 lg:p-12">
                <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-emerald-400/10 blur-3xl" />
                <div className="absolute -left-6 bottom-4 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />
                <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">At a glance</p>
                  <div className="mt-5 space-y-3">
                    {heroSidePoints.map((point) => (
                      <div key={point.title} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xl">{point.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-white">{point.title}</p>
                          <p className="text-xs text-slate-300">{point.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }

      if (normalizedCode === "CAREER_DNA") {
        return (
          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <div className="p-8 sm:p-10 lg:p-12">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${page.theme.badgeClass}`}>{page.theme.badge}</span>
                <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">{page.hero.title}</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">{page.hero.subtitle}</p>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{page.hero.supportingLine}</p>

                <div className="mt-8 rounded-3xl bg-violet-50 p-6 shadow-lg">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-700">Capability map</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">One profile across cognitive, aptitude, personality, interests, learning, and resilience.</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {heroBadgeItems.map((item) => (
                      <div key={item.title} className="rounded-2xl bg-white/75 p-4 shadow-sm">
                        <div className="text-2xl">{item.icon}</div>
                        <p className="mt-2 text-sm font-bold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden bg-[linear-gradient(160deg,#1f1239,#111827)] p-8 text-white sm:p-10 lg:p-12">
                <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-violet-400/15 blur-3xl" />
                <div className="absolute -left-6 bottom-4 h-28 w-28 rounded-full bg-fuchsia-400/10 blur-3xl" />
                <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">At a glance</p>
                  <div className="mt-5 space-y-3">
                    {heroSidePoints.map((point) => (
                      <div key={point.title} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xl">{point.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-white">{point.title}</p>
                          <p className="text-xs text-slate-300">{point.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                      <p className="text-sm font-semibold text-white">8 domains</p>
                      <p className="mt-1 text-xs leading-5 text-slate-300">Capability sections in one profile</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                      <p className="text-sm font-semibold text-white">Holistic fit</p>
                      <p className="mt-1 text-xs leading-5 text-slate-300">Learning + behavior + career alignment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }

      return (
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-8 sm:p-10 lg:p-12">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${page.theme.badgeClass}`}>{page.theme.badge}</span>
              <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">{page.hero.title}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">{page.hero.subtitle}</p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{page.hero.supportingLine}</p>

              <div className="mt-8 rounded-3xl bg-amber-50 p-6 shadow-lg">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Parenting style map</p>
                <p className="mt-2 text-sm leading-7 text-slate-700">Understand how your choices affect confidence, decision-making, and growth.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {heroBadgeItems.map((item) => (
                    <div key={item.title} className="rounded-2xl bg-white/75 p-4 shadow-sm">
                      <div className="text-2xl">{item.icon}</div>
                      <p className="mt-2 text-sm font-bold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-[linear-gradient(160deg,#111827,#0b1220)] p-8 text-white sm:p-10 lg:p-12">
              <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-amber-400/10 blur-3xl" />
              <div className="absolute -left-6 bottom-4 h-28 w-28 rounded-full bg-rose-400/10 blur-3xl" />
              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">At a glance</p>
                <div className="mt-5 space-y-3">
                  {heroSidePoints.map((point) => (
                    <div key={point.title} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xl">{point.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{point.title}</p>
                        <p className="text-xs text-slate-300">{point.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {heroBadgeItems.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-transform duration-200 hover:-translate-y-1 hover:bg-white/10">
                      <div className="text-2xl">{item.icon}</div>
                      <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs leading-5 text-slate-300">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    export default function AssessmentInfoPage() {
      const params = useParams<{ code: string }>();
      const code = String(params?.code || "").toUpperCase();
      const normalized = normalizeAssessmentCode(code);

      if (!normalized) {
        return (
          <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h1 className="text-3xl font-black text-slate-900">Assessment Overview</h1>
              <p className="mt-3 text-slate-600">Information for this assessment is not available yet.</p>
            </div>
          </div>
        );
      }

      const page = content[normalized];

      return (
        <div className={`min-h-[calc(100vh-4rem)] bg-gradient-to-b ${page.theme.gradient} py-8`}>
          <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
            {renderHero(normalized, page)}

            {renderSections(page.theme, page.sections)}
          </div>
        </div>
      );
    }
