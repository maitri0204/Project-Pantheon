// Personality content extracted from career guidance word files
// Each personality type has detailed sections covering all aspects

export interface PersonalitySection {
  title: string;
  bullets: string[];
}

export interface PersonalityProfile {
  overview: string;
  sections: PersonalitySection[];
}

export const PERSONALITY_CONTENT: Record<string, PersonalityProfile> = {
  ISTJ: {
    overview:
      "You are responsible, reliable, practical, and disciplined. You believe in hard work, duty, honesty, and following rules. You do what you say, take commitments seriously, and build strong, stable careers.",
    sections: [
      {
        title: "1. The Way You Direct and Receive Energy (Reflective Orientation)",
        bullets: [
          "Gain energy from being alone or in calm, controlled environments",
          "Prefer working independently rather than in large groups",
          "Feel drained after too much socializing",
          "Think before speaking",
          "Enjoy deep focus and quiet productivity",
          "Recharge through reading, planning, reflecting, and working on structured tasks",
        ],
      },
      {
        title: "2. The Way You Take in Information (Practical Observation)",
        bullets: [
          "Focus on facts, details, and real-world information",
          "Prefer practical knowledge over theories",
          "Pay attention to details and accuracy",
          "Learn best through experience and examples",
          "Focus on \"what is\" rather than \"what could be\"",
          "Excellent at remembering facts, following procedures, and working with data and numbers",
        ],
      },
      {
        title: "3. The Way You Decide and Come to Conclusions (Logical Decision Style)",
        bullets: [
          "Decisions are made using logic, objectivity, and analysis",
          "Make decisions based on facts, not emotions",
          "Value fairness and consistency",
          "Analyze pros and cons before acting",
          "Prefer clear rules and structured reasoning",
          "Strong in problem-solving, logical analysis, and rational decision-making",
        ],
      },
      {
        title: "4. The Way You Approach the Outside World (Structured Working Style)",
        bullets: [
          "Prefer a planned, organized, and structured lifestyle",
          "Like schedules and routines",
          "Prefer clarity and predictability",
          "Finish tasks before deadlines",
          "Dislike last-minute changes",
          "Feel comfortable when plans are clear, goals are defined, and systems are organized",
        ],
      },
      {
        title: "5. Type Description (Overall Personality)",
        bullets: [
          "Responsible, reliable, practical, and disciplined",
          "Believe in hard work, duty, honesty, and following rules",
          "Do what they say and take commitments seriously",
          "Build strong, stable careers through consistency",
        ],
      },
      {
        title: "6. Key Characteristics",
        bullets: [
          "Highly organized",
          "Strong sense of duty",
          "Detail-oriented",
          "Logical and analytical",
          "Reliable and dependable",
          "Focused and disciplined",
          "Prefer structure over chaos",
        ],
      },
      {
        title: "7. How You Behave with Others",
        bullets: [
          "Honest and trustworthy",
          "Keep promises and offer practical help",
          "Support through actions rather than words",
          "Few but deep relationships",
          "Value loyalty over popularity",
          "May seem emotionally distant at times",
          "Prefer logic over emotional discussions",
        ],
      },
      {
        title: "8. How You Behave at Work",
        bullets: [
          "Prefer structured environments with clear hierarchy",
          "Follow rules and procedures carefully",
          "Focus on accuracy and quality",
          "Work consistently without shortcuts",
          "Excellent planners with strong attention to detail",
          "Reliable under pressure and meet deadlines consistently",
          "Ideal environment: clear hierarchy, defined roles, stable systems",
        ],
      },
      {
        title: "9. Potential Blind Spots",
        bullets: [
          "Resistance to Change - May struggle with new or unconventional ideas",
          "Over-Reliance on Logic - May ignore emotions (their own and others')",
          "Perfectionism - High standards may lead to stress and difficulty delegating",
          "Difficulty Expressing Emotions - May struggle to communicate feelings",
          "Risk Aversion - Avoid taking bold or innovative risks",
        ],
      },
    ],
  },

  ISFJ: {
    overview:
      "You are loyal, responsible, caring, and practical. Your core motivation is to help others, maintain stability, and create a secure environment. You fear letting people down or failing responsibilities.",
    sections: [
      {
        title: "1. The Way You Direct and Receive Energy (Reflective Orientation)",
        bullets: [
          "Gain energy from being alone or in small, familiar groups",
          "Prefer deep conversations over large social gatherings",
          "Think before speaking and avoid unnecessary attention",
          "May feel drained after too much social interaction",
          "Prefer meaningful relationships over many friendships",
          "Are reflective and internally focused",
        ],
      },
      {
        title: "2. The Way You Take in Information (Practical Observation)",
        bullets: [
          "Focus on facts, details, and practical reality",
          "Trust real experiences over theories",
          "Notice small details others miss",
          "Prefer step-by-step learning",
          "Strong memory of past experiences",
          "Preference for practical subjects (finance, healthcare, etc.)",
        ],
      },
      {
        title: "3. The Way You Decide and Come to Conclusions (Value-Based Decision Style)",
        bullets: [
          "Decisions are guided by values and emotions",
          "Consider how decisions affect others",
          "Value harmony and relationships",
          "Avoid conflict when possible",
          "Are empathetic and caring",
          "Prioritize people over profits",
          "May struggle with tough decisions that hurt others",
        ],
      },
      {
        title: "4. The Way You Approach the Outside World (Structured Working Style)",
        bullets: [
          "Prefer a structured and organized lifestyle",
          "Like planning and routines",
          "Prefer clear goals and deadlines",
          "Feel uncomfortable with chaos or uncertainty",
          "Strong sense of responsibility",
          "Preference for stability and discipline",
        ],
      },
      {
        title: "5. Type Description (Overall Personality)",
        bullets: [
          "Known as \"The Protective Supporter\"",
          "Loyal, responsible, caring, and practical",
          "Core motivation: Help others and maintain stability",
          "Create a secure environment for those around them",
        ],
      },
      {
        title: "6. Key Characteristics",
        bullets: [
          "Highly responsible and detail-oriented",
          "Loyal and dependable",
          "Strong work ethic",
          "Empathetic and supportive",
          "May overthink situations",
          "Difficulty saying \"no\" and avoiding conflict",
          "May take criticism personally",
        ],
      },
      {
        title: "7. How You Behave with Others",
        bullets: [
          "Warm but reserved",
          "Loyal and caring in relationships",
          "Show love through actions not words",
          "Good listeners and supportive friends",
          "Polite and respectful; avoid drama and conflict",
          "Prefer small close circles over large social groups",
        ],
      },
      {
        title: "8. How You Behave at Work",
        bullets: [
          "Among the most reliable employees in any organization",
          "Organized and systematic; follow rules and processes",
          "Complete tasks on time with attention to detail",
          "Prefer stable and structured environments",
          "Clear expectations and respectful cooperative teams",
          "Excel in finance, healthcare, education, and administration",
        ],
      },
      {
        title: "9. Potential Blind Spots",
        bullets: [
          "Over-commitment - Saying yes to too many responsibilities; risk of burnout",
          "Difficulty with change - Preferring comfort zones; avoiding new opportunities",
          "People-pleasing tendency - Putting others' needs before your own",
          "Avoiding conflict - Not expressing disagreement; suppressing opinions",
          "Underestimating yourself - Not recognizing your own value",
        ],
      },
    ],
  },

  INFJ: {
    overview:
      "You seek purpose and meaning in everything you do. You want to help people and improve the world, combining deep thinking with strong empathy. Your core desire is to live a meaningful life and make a positive difference.",
    sections: [
      {
        title: "1. The Way You Direct and Receive Energy (Reflective Orientation)",
        bullets: [
          "Gain energy from being alone or in small, meaningful groups",
          "Prefer deep conversations over small talk",
          "Socializing for long periods can feel mentally draining",
          "Often need quiet time to recharge and reflect",
          "Enjoy journaling, reading, or introspection",
          "Value quality relationships over quantity",
        ],
      },
      {
        title: "2. The Way You Take in Information (Conceptual Thinking)",
        bullets: [
          "Focus on patterns, meanings, and future possibilities",
          "Think in terms of \"what could be\" rather than \"what is\"",
          "Enjoy abstract ideas, concepts, and big-picture thinking",
          "Often \"just know\" things without needing full data",
          "Connect ideas easily and are imaginative and visionary",
          "Understand the meaning behind information, not just facts",
        ],
      },
      {
        title: "3. The Way You Decide and Come to Conclusions (Value-Based Decision Style)",
        bullets: [
          "Prioritize values, emotions, and impact on people",
          "Aim for harmony and fairness",
          "Consider how decisions affect others emotionally",
          "Are empathetic and compassionate",
          "Often act based on what feels right",
          "Balance logic with human impact",
        ],
      },
      {
        title: "4. The Way You Approach the Outside World (Structured Working Style)",
        bullets: [
          "Like structure, planning, and organization",
          "Prefer clear goals and decisions",
          "Feel comfortable when things are decided and settled",
          "Plan ahead rather than act spontaneously",
          "Like to complete tasks before deadlines",
          "Prefer order over chaos with clarity and direction",
        ],
      },
      {
        title: "5. Type Description (Overall Personality)",
        bullets: [
          "Known as \"The Purpose Driven Guide\"",
          "Seek purpose and meaning in everything",
          "Combine deep thinking with strong empathy",
          "Want to help people and improve the world",
          "Private but caring, thoughtful and reflective",
        ],
      },
      {
        title: "6. Key Characteristics",
        bullets: [
          "Highly empathetic and insightful",
          "Strong moral values",
          "Creative and imaginative",
          "Good at understanding people deeply",
          "Strong focus and determination",
          "Purpose-driven with perfectionist tendencies",
          "Sensitive to criticism",
        ],
      },
      {
        title: "7. How You Behave with Others",
        bullets: [
          "Prefer deep, meaningful connections",
          "Loyal and supportive friends",
          "Often act as the \"therapist friend\"",
          "Avoid fake or superficial interactions",
          "Warm but reserved; good listeners",
          "May avoid conflict to maintain harmony",
          "Can become emotionally drained by helping too much",
        ],
      },
      {
        title: "8. How You Behave at Work",
        bullets: [
          "Best in roles that have meaning, purpose, and help people",
          "Focused and dedicated; prefer working quietly",
          "Think deeply before acting",
          "Value ethical and meaningful work",
          "Strengths: strategic thinking, understanding people, creativity",
          "Excel as psychologists, writers, teachers, consultants, researchers",
        ],
      },
      {
        title: "9. Potential Blind Spots",
        bullets: [
          "Overthinking - May analyze situations too deeply, leading to stress",
          "Emotional burnout - Helping others too much without boundaries",
          "Perfectionism - Setting unrealistically high standards",
          "Avoiding conflict - Not expressing true feelings",
          "Idealism vs reality gap - Feeling disappointed when reality doesn't match",
          "Difficulty saying \"No\" - Taking on too much responsibility",
        ],
      },
    ],
  },

  INTJ: {
    overview:
      "You are a visionary thinker who combines deep thinking, long-term vision, and logical decision-making. Your core identity: \"I want to understand how things work-and make them better.\"",
    sections: [
      {
        title: "1. The Way You Direct and Receive Energy (Reflective Orientation)",
        bullets: [
          "Energy comes from within rather than external stimulation",
          "Recharge by spending time alone, thinking, reading, or working independently",
          "Social interaction is selective and purposeful",
          "Prefer deep conversations over small talk",
          "Large crowds or constant social engagement feels draining",
          "Gain energy from ideas, reflection, and solitude",
        ],
      },
      {
        title: "2. The Way You Take in Information (Conceptual Thinking)",
        bullets: [
          "Focus on patterns, possibilities, and future outcomes",
          "Look beyond facts to understand \"what could happen\"",
          "Interested in concepts, systems, and theories",
          "Naturally good at connecting dots and spotting trends",
          "Prefer big-picture thinking over step-by-step instructions",
          "Ask \"How does this system work and where can it lead?\"",
        ],
      },
      {
        title: "3. The Way You Decide and Come to Conclusions (Logical Decision Style)",
        bullets: [
          "Rely on logic and objective reasoning",
          "Decisions based on efficiency, logic, and results",
          "Prioritize truth over emotions",
          "Strong ability to analyze problems critically",
          "Can appear direct or blunt because they value honesty",
          "Key mindset: \"What makes the most logical sense?\"",
        ],
      },
      {
        title: "4. The Way You Approach the Outside World (Structured Working Style)",
        bullets: [
          "Prefer a structured and organized approach to life",
          "Like planning, scheduling, and clear goals",
          "Prefer closure and decisions rather than uncertainty",
          "Often think in long-term strategies",
          "Dislike chaos, inefficiency, and last-minute changes",
          "Don't just react to life-they design it",
        ],
      },
      {
        title: "5. Type Description (Overall Personality)",
        bullets: [
          "Known as \"The Master Strategist\"",
          "Visionary thinker and master strategist",
          "Combine deep thinking with long-term vision",
          "Independent, self-driven, and highly analytical",
        ],
      },
      {
        title: "6. Key Characteristics",
        bullets: [
          "Strategic and long-term thinker",
          "Highly analytical and independent",
          "Strong problem-solving ability",
          "Focused, disciplined, and ambitious",
          "Natural talent in system design and optimization",
          "Excellent at research, analysis, and innovation",
        ],
      },
      {
        title: "7. How You Behave with Others",
        bullets: [
          "Selective but loyal in relationships",
          "Prefer small, meaningful circles over large groups",
          "Value intelligence, honesty, and depth in people",
          "May seem reserved or distant initially",
          "Extremely loyal and supportive once trust is built",
          "More comfortable discussing ideas than feelings",
        ],
      },
      {
        title: "8. How You Behave at Work",
        bullets: [
          "Prefer independent work with deep focus on tasks",
          "Driven by efficiency and improvement",
          "Naturally take on strategic or leadership roles",
          "Thrive in complex problem-solving and analytical careers",
          "Question inefficient systems and suggest better methods",
          "Ideal: freedom + intellectual challenge + growth",
        ],
      },
      {
        title: "9. Potential Blind Spots",
        bullets: [
          "Over-critical thinking - May judge others too harshly for inefficiency",
          "Emotional disconnect - Can overlook emotions (their own and others')",
          "Perfectionism - High standards can lead to stress or delay",
          "Difficulty with teamwork - Prefer independence, may struggle with groups",
          "Overconfidence in logic - May ignore emotional or human factors",
          "Impatience - Get frustrated when others don't think as quickly",
        ],
      },
    ],
  },

  ISTP: {
    overview:
      "You are a practical problem-solver who is calm under pressure, independently-minded, and technically skilled. You can walk into chaos and quietly fix things.",
    sections: [
      {
        title: "1. The Way You Direct and Receive Energy (Reflective Orientation)",
        bullets: [
          "Focus inward rather than outward",
          "Prefer thinking before speaking",
          "Recharge by spending time alone",
          "Enjoy quiet environments, independent work, and solo problem-solving",
          "Don't dislike people-just get drained by too much social interaction",
        ],
      },
      {
        title: "2. The Way You Take in Information (Practical Observation)",
        bullets: [
          "Focus on facts, details, and real-world data",
          "Prefer practical, hands-on learning",
          "Trust what you can see, test, or experience",
          "Learn by doing, not just reading",
          "Grounded in reality; prefer \"what works\" over \"what could be\"",
        ],
      },
      {
        title: "3. The Way You Decide and Come to Conclusions (Logical Decision Style)",
        bullets: [
          "Logical and objective decision-making",
          "Based on analysis, not emotions",
          "Focus on efficiency and results",
          "Break problems into parts and evaluate pros and cons",
          "Choose the most rational solution",
          "Value truth and logic over feelings, even in difficult situations",
        ],
      },
      {
        title: "4. The Way You Approach the Outside World (Flexible Working Style)",
        bullets: [
          "Flexible and spontaneous approach to life",
          "Prefer keeping options open",
          "Adapt quickly to change",
          "Don't like rigid schedules",
          "Prefer freedom and autonomy",
          "Work best when responding to situations in real-time",
        ],
      },
      {
        title: "5. Type Description (Overall Personality)",
        bullets: [
          "Known as \"The Practical Problem Solver\"",
          "Practical problem-solver who is calm under pressure",
          "Independent thinker with strong technical skills",
          "Can walk into chaos and quietly fix things",
        ],
      },
      {
        title: "6. Key Characteristics",
        bullets: [
          "Highly analytical and hands-on",
          "Independent and calm under pressure",
          "Quick decision-makers with strong technical skills",
          "Quiet but observant",
          "Action-oriented and curious about how things work",
          "Prefer results over discussions",
        ],
      },
      {
        title: "7. How You Behave with Others",
        bullets: [
          "Reserved at first; loyal to close people",
          "Show care through actions, not words",
          "Prefer small groups over large crowds",
          "Value honesty and direct communication",
          "Straightforward and practical in interactions",
          "Deeply observant and thoughtful despite quiet demeanor",
        ],
      },
      {
        title: "8. How You Behave at Work",
        bullets: [
          "Excellent problem solver who thrives in crisis situations",
          "Work best independently with focus on efficiency and results",
          "Prefer flexible, hands-on environments with minimal micromanagement",
          "Excel in technical, analytical, and data-driven careers",
          "Ideal in roles where you can fix, build, analyze, or optimize systems",
          "Strong in engineering, finance & trading, and data-driven careers",
        ],
      },
      {
        title: "9. Potential Blind Spots",
        bullets: [
          "Avoiding emotions - May ignore feelings; can appear cold or detached",
          "Impatience with theory - Prefer action over planning; may skip strategy",
          "Difficulty with routine - Get bored with repetitive tasks",
          "Limited communication - May not express thoughts clearly",
          "Risk-taking tendency - Sometimes act quickly without full planning",
        ],
      },
    ],
  },

  ISFP: {
    overview:
      "You are creative, sensitive, independent, and quietly expressive. You express yourself through art, design, music, or actions, live in the present moment, and value freedom and authenticity.",
    sections: [
      {
        title: "1. The Way You Direct and Receive Energy (Reflective Orientation)",
        bullets: [
          "Gain energy from alone time or quiet environments",
          "Social interactions can be enjoyable but too much drains you",
          "Prefer deep one-on-one conversations over large groups",
          "Often reflect internally before expressing thoughts",
          "Recharge by listening to music, spending time in nature, or doing something creative",
        ],
      },
      {
        title: "2. The Way You Take in Information (Practical Observation)",
        bullets: [
          "Focus on real, practical, present-moment details",
          "Learn best through hands-on experience",
          "Trust what you can see, feel, and experience",
          "Notice aesthetic details (colors, design, atmosphere)",
          "Prefer practical demonstrations and real-world examples over lectures",
        ],
      },
      {
        title: "3. The Way You Decide and Come to Conclusions (Value-Based Decision Style)",
        bullets: [
          "Decisions based on values, emotions, and personal beliefs",
          "Prioritize people and harmony over logic alone",
          "Naturally empathetic and compassionate",
          "Ask: \"Is this right for me and others?\"",
          "When choosing a career, focus on meaning, satisfaction, and helping others",
        ],
      },
      {
        title: "4. The Way You Approach the Outside World (Flexible Working Style)",
        bullets: [
          "Prefer flexibility over strict planning",
          "Like to keep options open and adapt easily to changes",
          "May avoid rigid schedules",
          "Explore different interests before deciding",
          "Work better under inspiration rather than strict deadlines",
        ],
      },
      {
        title: "5. Type Description (Overall Personality)",
        bullets: [
          "Known as \"The Artist\"",
          "Creative, sensitive, independent, and quietly expressive",
          "Express themselves through art, design, music, or actions",
          "Value freedom and authenticity; live in the present moment",
        ],
      },
      {
        title: "6. Key Characteristics",
        bullets: [
          "Highly creative with strong sense of aesthetics",
          "Empathetic and kind",
          "Practical and observant",
          "Loyal, supportive, calm, and adaptable",
          "Soft-spoken but expressive through actions",
          "Private but emotionally deep; independent thinkers",
        ],
      },
      {
        title: "7. How You Behave with Others",
        bullets: [
          "Warm and caring but not overly expressive verbally",
          "Show love through actions rather than words",
          "Prefer small, meaningful circles",
          "Avoid conflict and confrontation",
          "Loyal and supportive friends; good listeners",
          "May withdraw when overwhelmed",
        ],
      },
      {
        title: "8. How You Behave at Work",
        bullets: [
          "Prefer freedom and flexibility; dislike micromanagement",
          "Work best in creative or practical roles",
          "Strengths: attention to detail, aesthetic sense, deep focus",
          "Calm under pressure",
          "Ideal: creative industries, hands-on work, supportive culture",
          "Perform best when work feels meaningful with creative control",
        ],
      },
      {
        title: "9. Potential Blind Spots",
        bullets: [
          "Avoiding long-term planning - Focus too much on the present",
          "Difficulty with criticism - May take feedback personally",
          "Struggling with structure - Deadlines and routines feel restrictive",
          "Conflict avoidance - Avoiding difficult conversations",
          "Undervaluing your potential - May not push into leadership roles",
          "Emotional decision bias - Decisions overly influenced by feelings",
        ],
      },
    ],
  },

  INFP: {
    overview:
      "You are a deep thinker, value-driven individual, creative and imaginative, with strong emotional intelligence. Your core motivation: \"I want to live a meaningful life and make a difference.\"",
    sections: [
      {
        title: "1. The Way You Direct and Receive Energy (Reflective Orientation)",
        bullets: [
          "Gain energy from being alone or in small, meaningful interactions",
          "Large social gatherings can feel draining over time",
          "Prefer deep conversations over small talk",
          "Need quiet time to recharge and reflect",
          "Enjoy journaling, reading, or creative hobbies",
          "Perform best in roles allowing independent work and deep focus",
        ],
      },
      {
        title: "2. The Way You Take in Information (Conceptual Thinking)",
        bullets: [
          "Focus on ideas, possibilities, and future potential",
          "Enjoy abstract thinking and imagination",
          "Look for meaning behind information, not just data",
          "Prefer \"why\" and \"what if\" questions",
          "Enjoy creative thinking and brainstorming",
          "Thrive in fields involving creativity, strategy, and innovation",
        ],
      },
      {
        title: "3. The Way You Decide and Come to Conclusions (Value-Based Decision Style)",
        bullets: [
          "Make decisions based on values and emotions, not just logic",
          "Ask: \"Is this right?\" instead of \"Is this efficient?\"",
          "Care about fairness, ethics, and impact on people",
          "Guided by internal value system",
          "Empathetic and consider others' feelings",
          "Do best in roles where work feels meaningful and aligned with values",
        ],
      },
      {
        title: "4. The Way You Approach the Outside World (Flexible Working Style)",
        bullets: [
          "Flexible and open-ended; prefer freedom over strict structure",
          "Like to keep options open",
          "Work best in a less rigid environment",
          "May procrastinate but perform well under inspiration",
          "Dislike strict routines or micromanagement",
          "Thrive in careers with flexibility, creativity, and autonomy",
        ],
      },
      {
        title: "5. Type Description (Overall Personality)",
        bullets: [
          "Known as \"The Value Creator\"",
          "Deep thinker with strong values and creativity",
          "Driven by purpose, personal growth, and helping others",
          "Emotionally intelligent and imaginative",
        ],
      },
      {
        title: "6. Key Characteristics",
        bullets: [
          "Highly creative and empathetic",
          "Strong moral values and deep thinking ability",
          "Good listeners; imaginative and innovative",
          "May overthink with emotional sensitivity",
          "Difficulty with criticism and procrastination",
          "Idealism vs reality conflict at times",
        ],
      },
      {
        title: "7. How You Behave with Others",
        bullets: [
          "Warm, caring, and supportive",
          "Prefer deep emotional connections",
          "Loyal to close friends; avoid superficial relationships",
          "Quiet at first, but expressive with trusted people",
          "Good at understanding others' emotions",
          "May avoid confrontation and feel misunderstood",
        ],
      },
      {
        title: "8. How You Behave at Work",
        bullets: [
          "Ideal environment: flexible, creative, and purpose-driven",
          "Independent worker who focuses deeply on meaningful tasks",
          "Bring creativity and new ideas to projects",
          "Strengths: creative problem solving, understanding people, storytelling",
          "Struggle with strict deadlines, repetitive tasks, and competitive environments",
          "Excel in writing, psychology, UX design, HR, and counseling",
        ],
      },
      {
        title: "9. Potential Blind Spots",
        bullets: [
          "Over-Idealism - Expecting perfection from people or careers",
          "Procrastination - Waiting for \"perfect mood\" to start",
          "Avoiding Conflict - Not speaking up when needed",
          "Emotional Decision-Making - Choosing based only on feelings",
          "Difficulty with Structure - Struggling with deadlines or consistency",
          "Self-Doubt - Underestimating your abilities",
        ],
      },
    ],
  },

  INTP: {
    overview:
      "You are a deep thinker, independent problem-solver, and curious explorer of ideas. You are driven by understanding how things work, solving complex problems, and building logical systems. You live in ideas, question everything, and seek truth through logic.",
    sections: [
      {
        title: "1. The Way You Direct and Receive Energy (Reflective Orientation)",
        bullets: [
          "Gain energy from solitude and independent thinking",
          "Prefer deep conversations over social gatherings",
          "Feel mentally drained after too much social interaction",
          "Spend time reflecting, analyzing ideas, or exploring concepts",
          "Need personal space to recharge and think clearly",
          "Appear quiet, but have very active inner thoughts",
        ],
      },
      {
        title: "2. The Way You Take in Information (Conceptual Thinking)",
        bullets: [
          "Focus on patterns, theories, and possibilities",
          "Prefer abstract ideas over concrete details",
          "Naturally connect unrelated concepts",
          "Ask \"Why?\" and \"What if?\" frequently",
          "Think about future possibilities rather than present realities",
          "Don't just see what is - explore what could be",
        ],
      },
      {
        title: "3. The Way You Decide and Come to Conclusions (Logical Decision Style)",
        bullets: [
          "Decisions based on logic, reason, and analysis",
          "Prioritize truth over emotions",
          "Enjoy breaking problems into systems",
          "Analyze pros and cons deeply",
          "Question assumptions thoroughly",
          "Aim for accuracy and truth, not emotional comfort",
        ],
      },
      {
        title: "4. The Way You Approach the Outside World (Flexible Working Style)",
        bullets: [
          "Prefer flexibility over strict planning",
          "Like to keep options open",
          "Often work in bursts of energy rather than fixed routines",
          "Delay decisions until they have enough information",
          "Struggle with rigid deadlines or structures",
          "Prefer freedom and adaptability over control and structure",
        ],
      },
      {
        title: "5. Type Description (Overall Personality)",
        bullets: [
          "Known as \"The Curious\"",
          "Deep thinker and independent problem-solver",
          "Driven by curiosity and quest for understanding",
          "Live in ideas, question everything, seek truth through logic",
        ],
      },
      {
        title: "6. Key Characteristics",
        bullets: [
          "Highly analytical and creative problem-solver",
          "Independent thinker with strong curiosity",
          "Objective and rational in approach",
          "May overthink and procrastinate",
          "Difficulty expressing emotions",
          "Dislike routine tasks; can appear detached",
        ],
      },
      {
        title: "7. How You Behave with Others",
        bullets: [
          "Honest and straightforward",
          "Value deep, meaningful conversations",
          "Loyal to a small circle",
          "May seem emotionally distant",
          "Avoid small talk; prefer intellectual discussions",
          "Few people, but deep connections",
        ],
      },
      {
        title: "8. How You Behave at Work",
        bullets: [
          "Solve complex problems efficiently and think outside the box",
          "Work well independently; excel in research and analysis",
          "Prefer flexible structure with freedom to explore ideas",
          "Minimal micromanagement for best performance",
          "May delay execution or lose interest once problem is solved",
          "Best roles: analyst, researcher, developer, strategist, data scientist",
        ],
      },
      {
        title: "9. Potential Blind Spots",
        bullets: [
          "Overthinking Without Action - Spending too much time analyzing",
          "Procrastination - Waiting for \"perfect understanding\" before starting",
          "Emotional Disconnect - Ignoring emotional aspects in decisions",
          "Poor Routine Discipline - Inconsistent work habits",
          "Difficulty Communicating Ideas - Complex ideas hard to explain",
          "Loss of Interest - Jumping between ideas without finishing",
        ],
      },
    ],
  },

  ESTP: {
    overview:
      "You are an energetic, action-oriented individual who loves challenges, excitement, and hands-on experiences. You are a natural problem-solver who prefers learning by doing and excels in environments requiring quick thinking and adaptability.",
    sections: [
      {
        title: "1. The Way You Direct and Receive Energy (Social Orientation)",
        bullets: [
          "Gain energy from the external world of people and activity",
          "Enjoy interacting with people and being in dynamic environments",
          "Social settings, teamwork, and real-world action energize you",
          "Long periods of isolation may feel draining",
          "Thrive in active, fast-paced settings",
        ],
      },
      {
        title: "2. The Way You Take in Information (Practical Observation)",
        bullets: [
          "Focus on practical, real-time, and concrete information",
          "Prefer learning through experience rather than theory",
          "Highly observant of surroundings",
          "Trust facts, details, and what can be directly experienced",
          "Grounded in the here and now",
        ],
      },
      {
        title: "3. The Way You Decide and Come to Conclusions (Logical Decision Style)",
        bullets: [
          "Logical, objective, and rational decision-making",
          "Evaluate situations based on facts and efficiency",
          "Decisions are often quick and practical",
          "Especially effective in high-pressure situations",
          "Focus on results over emotions",
        ],
      },
      {
        title: "4. The Way You Approach the Outside World (Flexible Working Style)",
        bullets: [
          "Flexible, spontaneous, and adaptable",
          "Prefer to keep options open rather than follow rigid plans",
          "Enjoy responding to situations in the moment",
          "Thrive in fast-changing environments",
          "Action-oriented and results-driven",
        ],
      },
      {
        title: "5. Type Description (Overall Personality)",
        bullets: [
          "Known as \"The Action Taker\"",
          "Energetic, bold, and action-oriented",
          "Natural problem-solver who learns by doing",
          "Competitive and driven by results",
        ],
      },
      {
        title: "6. Key Characteristics",
        bullets: [
          "Energetic and enthusiastic",
          "Practical and realistic; bold and risk-taking",
          "Observant and detail-aware",
          "Competitive and action-driven",
          "Excellent problem-solving skills",
          "Strong communication and persuasion abilities",
          "Confident in decision-making; calm under pressure",
        ],
      },
      {
        title: "7. How You Behave with Others",
        bullets: [
          "Outgoing, friendly, and engaging",
          "Enjoy meeting new people and building networks",
          "Take the lead in social situations",
          "Communicate directly and honestly",
          "Use humor and charm to connect with others",
          "Prefer action-based bonding (sports, activities, events)",
          "May sometimes come across as too blunt",
        ],
      },
      {
        title: "8. How You Behave at Work",
        bullets: [
          "Action-oriented and results-driven",
          "Comfortable taking risks and making quick decisions",
          "Highly effective in fast-paced environments",
          "Skilled in negotiation, sales, and leadership roles",
          "Prefer hands-on tasks and dynamic roles over routine",
          "Excel in finance & trading, entrepreneurship, sales & marketing",
        ],
      },
      {
        title: "9. Potential Blind Spots",
        bullets: [
          "Impulsiveness - Acting too quickly without full analysis",
          "Risk-taking - Sometimes taking unnecessary risks",
          "Lack of long-term planning - Focusing too much on the present",
          "Impatience - Getting bored with slow or repetitive tasks",
          "Insensitive communication - Being overly blunt in conversations",
        ],
      },
    ],
  },

  ESFP: {
    overview:
      "You live in the present, bring energy into any environment, connect easily with people, and create experiences rather than just ideas. You are built to engage, influence, and energize people in real time.",
    sections: [
      {
        title: "1. The Way You Direct and Receive Energy (Social Orientation)",
        bullets: [
          "Externally energized - gain energy from people, conversations, and action",
          "Sitting alone for long periods drains you quickly",
          "Think better out loud than in your head",
          "Prefer doing over planning",
          "Seek stimulation, variety, and interaction",
          "If daily life becomes too isolated or repetitive, motivation drops sharply",
        ],
      },
      {
        title: "2. The Way You Take in Information (Practical Observation)",
        bullets: [
          "Focus on what is real, practical, and happening now",
          "Notice details others miss in the present moment",
          "Learn best through experience, not theory",
          "Trust what you can see and feel, not abstract ideas",
          "Prefer step-by-step clarity over conceptual frameworks",
          "May ignore long-term implications due to focus on immediate reality",
        ],
      },
      {
        title: "3. The Way You Decide and Come to Conclusions (Value-Based Decision Style)",
        bullets: [
          "Make decisions based on people and impact, not just logic",
          "Value relationships, harmony, and emotional outcomes",
          "Naturally read people well",
          "Often ask: \"How will this affect others?\"",
          "Prioritize connection over cold efficiency",
          "May avoid tough decisions to maintain harmony",
        ],
      },
      {
        title: "4. The Way You Approach the Outside World (Flexible Working Style)",
        bullets: [
          "Prefer flexibility over structure",
          "Like to keep options open and adapt quickly",
          "Dislike rigid plans and strict routines",
          "Perform best under dynamic, fast-moving conditions",
          "May struggle with consistency and long-term discipline",
        ],
      },
      {
        title: "5. Type Description (Overall Personality)",
        bullets: [
          "Known as \"The Joyful Performer\"",
          "Lives in the present and brings energy everywhere",
          "Connects easily with people and creates experiences",
          "Built to engage, influence, and energize others",
        ],
      },
      {
        title: "6. Key Characteristics",
        bullets: [
          "Highly social and approachable",
          "Strong communication skills; natural entertainer",
          "Action-oriented and observant",
          "High adaptability",
          "May be easily distracted and impulsive",
          "Struggles with long-term planning and structure",
          "May prioritize fun over responsibility",
        ],
      },
      {
        title: "7. How You Behave with Others",
        bullets: [
          "Usually warm, friendly, and easy to talk to",
          "People feel comfortable around you quickly",
          "Bring energy into groups and dislike conflict",
          "Try to keep things positive",
          "May seek approval too much",
          "May avoid difficult conversations",
        ],
      },
      {
        title: "8. How You Behave at Work",
        bullets: [
          "Perform best with people interaction, variety, and immediate feedback",
          "Struggle with long-term solitary focus and repetitive processes",
          "At your best: motivate teams, close deals, manage clients",
          "Create engaging environments",
          "May procrastinate or lose interest midway",
          "Excel in hospitality, media, PR, events, and entertainment",
        ],
      },
      {
        title: "9. Potential Blind Spots",
        bullets: [
          "Lack of long-term vision - Focus on now, but success requires future planning",
          "Weak discipline systems - Talent without structure = wasted potential",
          "Avoidance of discomfort - May avoid hard decisions or tough work",
          "Over-reliance on personality - Charm helps, but skills and consistency matter",
          "Financial inconsistency - Need structured income sources for stability",
        ],
      },
    ],
  },

  ENFP: {
    overview:
      "You are vision-driven, people-focused, an idea generator, and a natural motivator. You thrive in environments where you can explore, influence, create, and inspire. You are not just a thinker - you are a possibility creator.",
    sections: [
      {
        title: "1. The Way You Direct and Receive Energy (Social Orientation)",
        bullets: [
          "Gain energy from people, conversations, new environments, and idea exchange",
          "Process thoughts by talking, not by sitting quietly",
          "Feel drained in isolation or repetitive solo work",
          "Seek stimulation, variety, and interaction",
          "Think out loud through people",
          "May confuse social activity with productivity - being busy ≠ being effective",
        ],
      },
      {
        title: "2. The Way You Take in Information (Conceptual Thinking)",
        bullets: [
          "Focus on possibilities, patterns, and future potential",
          "Connect unrelated ideas quickly",
          "Get excited by new concepts; get bored with details and routine",
          "Strength: spot opportunities others don't see",
          "May ignore practical constraints and execution realities",
          "Think in terms of \"what could be\" instead of \"what is\"",
        ],
      },
      {
        title: "3. The Way You Decide and Come to Conclusions (Value-Based Decision Style)",
        bullets: [
          "Decide based on values, emotions, and impact on people",
          "Prioritize meaning over logic",
          "Want your work to \"feel right\"",
          "Empathetic and people-focused",
          "Strong relationship builder",
          "May avoid tough decisions because they feel uncomfortable",
        ],
      },
      {
        title: "4. The Way You Approach the Outside World (Flexible Working Style)",
        bullets: [
          "Prefer flexibility, open options, and spontaneity",
          "Don't like rigid plans; prefer to \"figure it out as you go\"",
          "Adapt quickly to change",
          "High adaptability is a strength",
          "May struggle with deadlines, consistency, and finishing what you start",
        ],
      },
      {
        title: "5. Type Description (Overall Personality)",
        bullets: [
          "Known as \"The Visionary\"",
          "Vision-driven, people-focused, and creative",
          "Natural motivator and possibility creator",
          "Thrive when exploring, influencing, and inspiring others",
        ],
      },
      {
        title: "6. Key Characteristics",
        bullets: [
          "Highly creative with excellent communication",
          "Strong intuition about people",
          "Enthusiastic, energetic, and big-picture thinker",
          "May have poor follow-through and get easily distracted",
          "Tend toward overcommitment",
          "Emotional decision-making and inconsistent discipline",
        ],
      },
      {
        title: "7. How You Behave with Others",
        bullets: [
          "Warm, expressive, and engaging",
          "Good at understanding emotions",
          "Naturally supportive; build connections quickly",
          "Enjoy deep conversations; dislike superficial interactions",
          "May overpromise or lose interest over time",
          "Struggle to maintain long-term consistency in relationships",
        ],
      },
      {
        title: "8. How You Behave at Work",
        bullets: [
          "Perform best with creativity, autonomy, interaction, and problem-solving",
          "Ideal roles: strategy, marketing, innovation, leadership, communication",
          "Start strong with energy and generate multiple ideas",
          "May struggle with execution and completion",
          "Hard truth: don't fail from lack of talent, but from lack of structure",
          "Excel in marketing, brand strategy, startups, and content creation",
        ],
      },
      {
        title: "9. Potential Blind Spots",
        bullets: [
          "Idea addiction - Chase new ideas instead of executing existing ones",
          "Lack of consistency - Rely on motivation, not systems",
          "Avoiding structure - See structure as restriction, not as a tool",
          "Emotional decision bias - Choose what feels right instead of what works",
          "Overconfidence in potential - Assume \"I can do it anytime\" → delayed action",
        ],
      },
    ],
  },

  ENTP: {
    overview:
      "You are an idea generator, innovator, and challenger of the status quo. You are curious, energetic, a strategic thinker, a natural debater, and an opportunity seeker. You often say: \"There must be a better way to do this.\"",
    sections: [
      {
        title: "1. The Way You Direct and Receive Energy (Social Orientation)",
        bullets: [
          "Gain energy from the external world of people, ideas, and discussions",
          "Feel energized after conversations, debates, and brainstorming sessions",
          "Enjoy interacting with different types of people",
          "Think better out loud rather than silently",
          "Get bored when alone for too long or doing repetitive tasks",
          "Recharge by engaging with the world, not withdrawing from it",
        ],
      },
      {
        title: "2. The Way You Take in Information (Conceptual Thinking)",
        bullets: [
          "Focus on possibilities, patterns, and big ideas rather than details",
          "Think about \"what could be\" rather than \"what is\"",
          "Connect unrelated ideas quickly",
          "Enjoy innovation, theories, and future trends",
          "Big-picture thinker who sees opportunities others miss",
          "May ignore small details or routine facts",
        ],
      },
      {
        title: "3. The Way You Decide and Come to Conclusions (Logical Decision Style)",
        bullets: [
          "Decisions based on logic, reasoning, and objective analysis",
          "Prioritize facts over emotions",
          "Enjoy debates and logical arguments",
          "Question everything before accepting it",
          "May unintentionally appear blunt or critical",
          "Decide with your head, not your heart",
        ],
      },
      {
        title: "4. The Way You Approach the Outside World (Flexible Working Style)",
        bullets: [
          "Prefer flexibility, spontaneity, and openness over strict planning",
          "Like keeping options open and adapt quickly to change",
          "May procrastinate or delay decisions",
          "Dislike rigid schedules and rules",
          "Explore life rather than control it",
        ],
      },
      {
        title: "5. Type Description (Overall Personality)",
        bullets: [
          "Known as \"The Entrepreneur\"",
          "Idea generator, innovator, and challenger of the status quo",
          "Curious, energetic, strategic thinker, and natural debater",
          "Opportunity seeker who believes there's always a better way",
        ],
      },
      {
        title: "6. Key Characteristics",
        bullets: [
          "Highly creative and innovative",
          "Excellent communication and persuasion skills",
          "Quick learners; adaptable and flexible",
          "Strong problem-solving ability",
          "Natural talent for brainstorming and connecting dots across fields",
          "Skilled at challenging conventional thinking",
        ],
      },
      {
        title: "7. How You Behave with Others",
        bullets: [
          "Friendly, engaging, and fun to talk to",
          "Great at storytelling and explaining ideas",
          "Inspire others with vision",
          "May argue just for fun or dominate conversations",
          "May overlook others' emotions",
          "Connect through ideas and conversations, not emotions first",
        ],
      },
      {
        title: "8. How You Behave at Work",
        bullets: [
          "Love innovation, strategy, freedom, and leadership roles",
          "Dislike routine work, micromanagement, and repetitive tasks",
          "Thrive in dynamic environments (startups, consulting, finance, tech)",
          "Excel in roles involving strategy, communication, and decision-making",
          "Think creatively and influence outcomes",
          "Best in product management, consulting, and entrepreneurship",
        ],
      },
      {
        title: "9. Potential Blind Spots",
        bullets: [
          "Lack of Follow-Through - Start many ideas, finish few",
          "Overconfidence in Ideas - Believe your ideas are always right",
          "Ignoring Details - Miss small but critical information",
          "Argumentative Nature - Debate unnecessarily or challenge too much",
          "Difficulty with Routine - Struggle with consistency",
          "Impatience - Want quick results; need long-term growth mindset",
        ],
      },
    ],
  },

  ESTJ: {
    overview:
      "You are a natural leader and organizer who is practical, responsible, goal-oriented, and a strong decision-maker. You excel in environments where systems and structure exist, leadership and accountability are required, and results and efficiency matter.",
    sections: [
      {
        title: "1. The Way You Direct and Receive Energy (Social Orientation)",
        bullets: [
          "Gain energy from being around people",
          "Enjoy leading teams and discussions",
          "Thrive on taking action and staying engaged",
          "Outgoing, confident, and expressive",
          "Prefer group activities over working alone",
          "Take initiative in social and professional settings",
        ],
      },
      {
        title: "2. The Way You Take in Information (Practical Observation)",
        bullets: [
          "Focus on practical, real-world information",
          "Trust facts, details, and proven methods",
          "Learn best through experience and observation",
          "Prefer step-by-step processes",
          "Focus on what is real and useful now, rather than abstract ideas",
        ],
      },
      {
        title: "3. The Way You Decide and Come to Conclusions (Logical Decision Style)",
        bullets: [
          "Decisions based on logic and objective analysis",
          "Fair, rational, and direct decision-making",
          "Value efficiency and results",
          "Solve problems with a structured approach",
          "Facts over emotions in all situations",
        ],
      },
      {
        title: "4. The Way You Approach the Outside World (Structured Working Style)",
        bullets: [
          "Prefer structure, planning, and organization",
          "Clear goals and timelines are essential",
          "Disciplined and responsible",
          "Like finishing tasks on time",
          "Feel uncomfortable with uncertainty or last-minute changes",
        ],
      },
      {
        title: "5. Type Description (Overall Personality)",
        bullets: [
          "Known as \"The Strategic Leader\"",
          "Natural leader and organizer",
          "Practical, responsible, and goal-oriented",
          "Excel where systems, structure, and accountability exist",
        ],
      },
      {
        title: "6. Key Characteristics",
        bullets: [
          "Strong leadership ability",
          "Highly organized and disciplined",
          "Logical and objective thinker",
          "Reliable and dependable",
          "Focused on efficiency and results",
          "Respect rules, systems, and authority",
          "Excellent at planning and execution",
        ],
      },
      {
        title: "7. How You Behave with Others",
        bullets: [
          "Take charge in group situations",
          "Communicate clearly and directly",
          "Value honesty and responsibility",
          "Expect others to be disciplined and committed",
          "Loyal, dependable, and supportive in practical ways",
          "May seem strict, controlling, or overly critical at times",
          "May struggle with emotional sensitivity",
        ],
      },
      {
        title: "8. How You Behave at Work",
        bullets: [
          "Task-oriented, efficient, and comfortable in leadership roles",
          "Focused on achieving goals and managing teams",
          "Make decisions quickly and create systems and processes",
          "Ensure deadlines are met consistently",
          "Prefer clear structure, hierarchy, and defined roles",
          "Ideal: business, finance, management, government, corporate leadership",
        ],
      },
      {
        title: "9. Potential Blind Spots",
        bullets: [
          "Over-control - Try to control everything; struggle to delegate",
          "Low tolerance for inefficiency - Frustrated with slower people",
          "Ignoring emotions - Focus too much on logic; ignore feelings",
          "Resistance to change - Prefer traditional methods; resist innovation",
          "Being overly critical - Expect high standards from everyone",
        ],
      },
    ],
  },

  ESFJ: {
    overview:
      "You are warm, responsible, and cooperative. You are strong at managing people and relationships, highly organized, and dependable. Your aim: help others, maintain harmony, and build stable and successful environments.",
    sections: [
      {
        title: "1. The Way You Direct and Receive Energy (Social Orientation)",
        bullets: [
          "Gain energy from interacting with people and engaging with the world",
          "Feel energized when talking to others and working in teams",
          "Enjoy participating in group activities",
          "May feel drained when spending too much time alone",
          "Naturally enjoy social environments and collaboration",
        ],
      },
      {
        title: "2. The Way You Take in Information (Practical Observation)",
        bullets: [
          "Focus on practical, real-world information rather than abstract ideas",
          "Prefer facts over theories and practical examples over concepts",
          "Learn best through real-life applications and hands-on experience",
          "Prefer structured education and step-by-step learning",
          "Excellent in finance, management, healthcare, and operations",
        ],
      },
      {
        title: "3. The Way You Decide and Come to Conclusions (Value-Based Decision Style)",
        bullets: [
          "Consider people, emotions, and values in decisions",
          "Make decisions based on how they affect others",
          "Value harmony and relationships",
          "Show empathy and understanding",
          "Strong in conflict resolution, team support, and building trust",
          "Natural fit for leadership, HR, counseling, and client-facing roles",
        ],
      },
      {
        title: "4. The Way You Approach the Outside World (Structured Working Style)",
        bullets: [
          "Like structure, planning, and organization",
          "Prefer clear schedules, defined goals, and organized environments",
          "Dislike last-minute changes, uncertainty, and disorganization",
          "Succeed in corporate, finance, and management roles",
          "Reliable and systematic in approach",
        ],
      },
      {
        title: "5. Type Description (Overall Personality)",
        bullets: [
          "Known as \"The Community Builder\"",
          "Warm, responsible, and cooperative",
          "Strong at managing people and relationships",
          "Aim to help others, maintain harmony, and build stable environments",
        ],
      },
      {
        title: "6. Key Characteristics",
        bullets: [
          "Strong communication skills and high emotional intelligence",
          "Responsible and disciplined",
          "Team-oriented with practical and detail-focused approach",
          "Loyal and supportive with strong sense of duty",
          "Combine people skills + structure - a rare and valuable combination",
        ],
      },
      {
        title: "7. How You Behave with Others",
        bullets: [
          "Naturally friendly, supportive, and relationship-driven",
          "Caring and attentive; remember small details about people",
          "Outgoing, approachable, and enjoy helping others",
          "Easily build connections and prioritize harmony",
          "People see you as trustworthy, reliable, and emotionally supportive",
        ],
      },
      {
        title: "8. How You Behave at Work",
        bullets: [
          "Organized, responsible, and people-focused professional",
          "Strengths: team coordination, leadership, client management",
          "Prefer structured environments with clear systems and processes",
          "Take responsibility seriously and execute plans effectively",
          "Ideal: corporate offices, banks, schools, hospitals, consulting",
          "Perform best where you can lead, organize, and interact with people",
        ],
      },
      {
        title: "9. Potential Blind Spots",
        bullets: [
          "Over-dependence on approval - May seek validation; feel hurt by criticism",
          "Difficulty with change - Prefer stability; may resist new situations",
          "Over-commitment - Tend to say \"yes\" too often; take on too much",
          "Avoiding conflict - Prefer harmony; may avoid necessary conversations",
          "Emotional decision bias - Sometimes prioritize emotions over logic",
        ],
      },
    ],
  },

  ENFJ: {
    overview:
      "You are a natural leader and motivator who is visionary, people-focused, and action-oriented. You are a guide who helps others grow, a leader who inspires change, and a connector who builds strong relationships.",
    sections: [
      {
        title: "1. The Way You Direct and Receive Energy (Social Orientation)",
        bullets: [
          "Externally energized - focus on people, conversations, and social environments",
          "Enjoy leading discussions, guiding groups, and influencing others",
          "Express ideas openly and confidently",
          "Feel energized when interacting with people, helping, or mentoring others",
          "Long isolation drains you; perform best when connected and engaged",
        ],
      },
      {
        title: "2. The Way You Take in Information (Conceptual Thinking)",
        bullets: [
          "Prefer big-picture thinking over details",
          "Focus on future possibilities and patterns",
          "Think in terms of \"What can this become?\" and \"What does this mean long-term?\"",
          "Prefer concepts, ideas, and vision over memorization",
          "Enjoy strategy, innovation, and abstract thinking",
          "More interested in meaning and purpose than raw facts",
        ],
      },
      {
        title: "3. The Way You Decide and Come to Conclusions (Value-Based Decision Style)",
        bullets: [
          "People-centered decision makers",
          "Prioritize values, emotions, and impact on others",
          "Ask: \"How will this affect people?\" and \"Is this ethically right?\"",
          "High emotional intelligence and strong empathy",
          "May sometimes ignore logic to avoid hurting others",
          "Aim for harmony and positive impact",
        ],
      },
      {
        title: "4. The Way You Approach the Outside World (Structured Working Style)",
        bullets: [
          "Prefer structure, planning, and organization",
          "Like clear plans, schedules, and finishing tasks early",
          "Set goals and follow through consistently",
          "Organized and reliable with good time management",
          "Thrive in environments with clarity, direction, and goals",
        ],
      },
      {
        title: "5. Type Description (Overall Personality)",
        bullets: [
          "Known as \"The Mentor Leader\"",
          "Natural leader and motivator",
          "Visionary, people-focused, and action-oriented",
          "Help others grow and inspire meaningful change",
        ],
      },
      {
        title: "6. Key Characteristics",
        bullets: [
          "Excellent communication skills; charismatic and influential",
          "Empathetic and understanding",
          "Strong leadership ability",
          "Organized and goal-oriented",
          "Warm, approachable, responsible, and dependable",
          "Highly motivated to improve others' lives",
        ],
      },
      {
        title: "7. How You Behave with Others",
        bullets: [
          "Supportive and caring; often take the role of mentor or motivator",
          "Easily connect with people and good at reading emotions",
          "Build deep and meaningful relationships",
          "Expressive and persuasive; encourage and uplift others",
          "People often feel understood and inspired around you",
        ],
      },
      {
        title: "8. How You Behave at Work",
        bullets: [
          "Thrive in team environments, leadership roles, and people-centric jobs",
          "Strengths: team management, conflict resolution, motivation, coaching",
          "Strategic thinking combined with people skills",
          "Ideal roles: manager, consultant, teacher, HR leader, entrepreneur",
          "Perform best where you can lead, communicate, and create impact",
          "Excel in education, HR, NGO leadership, and corporate coaching",
        ],
      },
      {
        title: "9. Potential Blind Spots",
        bullets: [
          "Over-pleasing others - Prioritize others too much; risk of burnout",
          "Difficulty handling criticism - May take feedback personally",
          "Avoiding conflict - Ignore problems to maintain harmony",
          "Overconfidence in people - Trust others too quickly",
          "Neglecting logic in decisions - Emotional bias can affect choices",
          "Taking too much responsibility - Try to \"fix everything\"",
        ],
      },
    ],
  },

  ENTJ: {
    overview:
      "You are characterized by strong leadership ability, strategic thinking, confidence and assertiveness, and high ambition. You are a natural leader and visionary who builds systems, leads organizations, and drives growth and innovation. Your core identity: \"I organize people and systems to achieve big goals.\"",
    sections: [
      {
        title: "1. The Way You Direct and Receive Energy (Social Orientation)",
        bullets: [
          "Externally oriented - gain energy from interacting with the outside world",
          "Feel energized when leading teams, engaging in discussions and debates",
          "Prefer action over reflection; social environments over isolation",
          "Speak first, think while speaking",
          "Take charge in group situations and naturally step into leadership roles",
          "Gain energy by doing, leading, and interacting, not by staying alone",
        ],
      },
      {
        title: "2. The Way You Take in Information (Conceptual Thinking)",
        bullets: [
          "Focus on big-picture thinking and future possibilities",
          "Prefer ideas over facts; concepts over details",
          "Naturally spot patterns, trends, and strategic opportunities",
          "Think strategically and connect different ideas quickly",
          "May ignore small details or get impatient with routine",
          "Focus on \"what could happen\" rather than \"what is happening\"",
        ],
      },
      {
        title: "3. The Way You Decide and Come to Conclusions (Logical Decision Style)",
        bullets: [
          "Decisions based on logic, efficiency, and objective analysis",
          "Prioritize rational thinking, facts, and data",
          "Direct and honest; value competence over emotions",
          "Make quick, firm decisions",
          "Rely on logic instead of feelings in difficult situations",
          "Focus on solving problems efficiently",
        ],
      },
      {
        title: "4. The Way You Approach the Outside World (Structured Working Style)",
        bullets: [
          "Prefer structure, planning, and organization",
          "Like clear goals, timelines, and organized systems",
          "Plan ahead and work systematically",
          "Avoid last-minute chaos and disorganization",
          "Like planning, structure, and control over environment",
        ],
      },
      {
        title: "5. Type Description (Overall Personality)",
        bullets: [
          "Known as \"The Visionary Director\"",
          "Strong leadership with strategic thinking",
          "Confident, assertive, and highly ambitious",
          "Build systems, lead organizations, and drive innovation",
        ],
      },
      {
        title: "6. Key Characteristics",
        bullets: [
          "Highly confident and decisive",
          "Excellent leadership and communication skills",
          "Strategic and future-focused",
          "Result-oriented and efficient",
          "Can be impatient and appear blunt",
          "May struggle with emotional sensitivity",
          "May dominate conversations or be difficult accepting slower pace",
        ],
      },
      {
        title: "7. How You Behave with Others",
        bullets: [
          "Take leadership roles in groups",
          "Offer advice and solutions; be direct and honest",
          "Value competence, intelligence, and efficiency",
          "Others may see you as confident and inspiring, or dominant",
          "Prefer meaningful, goal-oriented conversations",
          "Respect people who challenge you intellectually",
        ],
      },
      {
        title: "8. How You Behave at Work",
        bullets: [
          "Thrive in structured, goal-driven environments",
          "Strategic, organized, and highly productive",
          "Strong in leadership, decision-making, problem-solving, and planning",
          "Ideal: corporate leadership, finance, consulting, startups",
          "Prefer authority, responsibility, and challenging tasks",
          "Perform best when leading, building, or optimizing systems",
        ],
      },
      {
        title: "9. Potential Blind Spots",
        bullets: [
          "Overconfidence - Assume your way is the best; may overlook others' perspectives",
          "Lack of emotional awareness - May unintentionally hurt others",
          "Impatience - Frustration with slow learners or processes",
          "Controlling behavior - Desire to control outcomes; difficulty delegating",
          "Work-life imbalance - Over-focus on success; neglect personal relationships",
        ],
      },
    ],
  },
};
