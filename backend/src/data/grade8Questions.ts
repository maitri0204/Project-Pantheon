// Grade 8 Question Bank - hidden interest codes stored server-side only
// Interest codes: A=Science, B=Commerce, C=Social Science/Law, D=Creative Arts,
// E=Technology, F=Health/Biology, G=Communication/Education, H=Entrepreneurship,
// I=Environment, J=Social Impact

export interface RawQuestion {
  questionNumber: number;
  grade: "Grade 8";
  situation: string;
  questionText: string;
  options: Array<{
    optionKey: "A" | "B" | "C" | "D" | "E";
    optionText: string;
    interestCode: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";
  }>;
}

const Q_TEXT = "At this stage, you would most like to:";

export const grade8Questions: RawQuestion[] = [
  // ── Q1 ──────────────────────────────────────────────────────────────
  {
    questionNumber: 1,
    grade: "Grade 8",
    situation:
      "In a class activity, your school announces an inter-school exhibition and asks students to choose one project area.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "work with formulas, patterns and evidence", interestCode: "A" },
      { optionKey: "B", optionText: "analyse profit, pricing and value", interestCode: "B" },
      { optionKey: "C", optionText: "design visuals, stories or creative material", interestCode: "D" },
      { optionKey: "D", optionText: "use digital tools, apps or automation", interestCode: "E" },
      { optionKey: "E", optionText: "take responsibility for goals and execution", interestCode: "H" },
    ],
  },
  // ── Q2 ──────────────────────────────────────────────────────────────
  {
    questionNumber: 2,
    grade: "Grade 8",
    situation:
      "During a school club period, your class teacher gives you a choice of how to complete a holiday assignment.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "B", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "C", optionText: "debate rights, laws and civic issues", interestCode: "C" },
      { optionKey: "D", optionText: "solve a pollution or conservation problem", interestCode: "I" },
      { optionKey: "E", optionText: "help people facing difficulty", interestCode: "J" },
    ],
  },
  // ── Q3 ──────────────────────────────────────────────────────────────
  {
    questionNumber: 3,
    grade: "Grade 8",
    situation:
      "For a fun project, a group project is struggling because everyone has different ideas.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "test a science idea through experiments", interestCode: "A" },
      { optionKey: "B", optionText: "use digital tools, apps or automation", interestCode: "E" },
      { optionKey: "C", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "D", optionText: "work on nature, climate or sustainability", interestCode: "I" },
      { optionKey: "E", optionText: "debate rights, laws and civic issues", interestCode: "C" },
    ],
  },
  // ── Q4 ──────────────────────────────────────────────────────────────
  {
    questionNumber: 4,
    grade: "Grade 8",
    situation:
      "In a group assignment, your school invites students to join a year-long club activity.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "study how money and businesses work", interestCode: "B" },
      { optionKey: "B", optionText: "take responsibility for goals and execution", interestCode: "H" },
      { optionKey: "C", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "D", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "E", optionText: "work on inclusion, care and social improvement", interestCode: "J" },
    ],
  },
  // ── Q5 ──────────────────────────────────────────────────────────────
  {
    questionNumber: 5,
    grade: "Grade 8",
    situation:
      "During activity week, you are asked to prepare a presentation for the morning assembly.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "find the reason behind how things work", interestCode: "A" },
      { optionKey: "B", optionText: "understand rules, society and decision-making", interestCode: "C" },
      { optionKey: "C", optionText: "write, speak, teach or guide people", interestCode: "G" },
      { optionKey: "D", optionText: "take responsibility for goals and execution", interestCode: "H" },
      { optionKey: "E", optionText: "work on nature, climate or sustainability", interestCode: "I" },
    ],
  },
  // ── Q6 ──────────────────────────────────────────────────────────────
  {
    questionNumber: 6,
    grade: "Grade 8",
    situation:
      "When your teacher gives a choice, your friend is confused about which subject activity to join.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "plan a budget and compare costs", interestCode: "B" },
      { optionKey: "B", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "C", optionText: "solve the task with software or gadgets", interestCode: "E" },
      { optionKey: "D", optionText: "study health, body, mind or biology", interestCode: "F" },
      { optionKey: "E", optionText: "support community needs and emotional wellbeing", interestCode: "J" },
    ],
  },
  // ── Q7 ──────────────────────────────────────────────────────────────
  {
    questionNumber: 7,
    grade: "Grade 8",
    situation:
      "For a school display, the school library asks you to recommend a section for new books.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "work with formulas, patterns and evidence", interestCode: "A" },
      { optionKey: "B", optionText: "analyse profit, pricing and value", interestCode: "B" },
      { optionKey: "C", optionText: "understand rules, society and decision-making", interestCode: "C" },
      { optionKey: "D", optionText: "understand living systems and wellbeing", interestCode: "F" },
      { optionKey: "E", optionText: "prepare content that helps others understand", interestCode: "G" },
    ],
  },
  // ── Q8 ──────────────────────────────────────────────────────────────
  {
    questionNumber: 8,
    grade: "Grade 8",
    situation:
      "During a library task, your teacher asks you to select a topic for an independent study project.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "present ideas through design and imagination", interestCode: "D" },
      { optionKey: "B", optionText: "build something using technology or coding", interestCode: "E" },
      { optionKey: "C", optionText: "create a business or marketing strategy", interestCode: "H" },
      { optionKey: "D", optionText: "solve a pollution or conservation problem", interestCode: "I" },
      { optionKey: "E", optionText: "help people facing difficulty", interestCode: "J" },
    ],
  },
  // ── Q9 ──────────────────────────────────────────────────────────────
  {
    questionNumber: 9,
    grade: "Grade 8",
    situation:
      "In a science-social exhibition, a community event needs student volunteers for different roles.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "test a science idea through experiments", interestCode: "A" },
      { optionKey: "B", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "C", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "D", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "E", optionText: "study environment, resources or farming systems", interestCode: "I" },
    ],
  },
  // ── Q10 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 10,
    grade: "Grade 8",
    situation:
      "For a student fair, your class is planning a field visit and you can vote for the destination.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "study how money and businesses work", interestCode: "B" },
      { optionKey: "B", optionText: "study people, history and governance", interestCode: "C" },
      { optionKey: "C", optionText: "build something using technology or coding", interestCode: "E" },
      { optionKey: "D", optionText: "create a business or marketing strategy", interestCode: "H" },
      { optionKey: "E", optionText: "work on inclusion, care and social improvement", interestCode: "J" },
    ],
  },
  // ── Q11 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 11,
    grade: "Grade 8",
    situation:
      "In a class activity, you get one free weekend workshop sponsored by the school.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "find the reason behind how things work", interestCode: "A" },
      { optionKey: "B", optionText: "plan a budget and compare costs", interestCode: "B" },
      { optionKey: "C", optionText: "use digital tools, apps or automation", interestCode: "E" },
      { optionKey: "D", optionText: "solve a pollution or conservation problem", interestCode: "I" },
      { optionKey: "E", optionText: "help people facing difficulty", interestCode: "J" },
    ],
  },
  // ── Q12 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 12,
    grade: "Grade 8",
    situation:
      "During a school club period, your school asks students to create a solution for a local problem.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "understand rules, society and decision-making", interestCode: "C" },
      { optionKey: "B", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "C", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "D", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "E", optionText: "create a business or marketing strategy", interestCode: "H" },
    ],
  },
  // ── Q13 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 13,
    grade: "Grade 8",
    situation:
      "For a fun project, you are asked to interview a professional for a school assignment.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "work with formulas, patterns and evidence", interestCode: "A" },
      { optionKey: "B", optionText: "analyse profit, pricing and value", interestCode: "B" },
      { optionKey: "C", optionText: "design visuals, stories or creative material", interestCode: "D" },
      { optionKey: "D", optionText: "use digital tools, apps or automation", interestCode: "E" },
      { optionKey: "E", optionText: "take responsibility for goals and execution", interestCode: "H" },
    ],
  },
  // ── Q14 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 14,
    grade: "Grade 8",
    situation:
      "In a group assignment, your annual day team needs help in different departments.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "B", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "C", optionText: "debate rights, laws and civic issues", interestCode: "C" },
      { optionKey: "D", optionText: "solve a pollution or conservation problem", interestCode: "I" },
      { optionKey: "E", optionText: "help people facing difficulty", interestCode: "J" },
    ],
  },
  // ── Q15 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 15,
    grade: "Grade 8",
    situation:
      "During activity week, your teacher gives you a choice of competition to represent the school.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "test a science idea through experiments", interestCode: "A" },
      { optionKey: "B", optionText: "use digital tools, apps or automation", interestCode: "E" },
      { optionKey: "C", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "D", optionText: "work on nature, climate or sustainability", interestCode: "I" },
      { optionKey: "E", optionText: "debate rights, laws and civic issues", interestCode: "C" },
    ],
  },
  // ── Q16 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 16,
    grade: "Grade 8",
    situation:
      "When your teacher gives a choice, you are asked to select a magazine article topic for the school newsletter.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "study how money and businesses work", interestCode: "B" },
      { optionKey: "B", optionText: "take responsibility for goals and execution", interestCode: "H" },
      { optionKey: "C", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "D", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "E", optionText: "work on inclusion, care and social improvement", interestCode: "J" },
    ],
  },
  // ── Q17 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 17,
    grade: "Grade 8",
    situation:
      "For a school display, your parent asks what type of learning activity you would enjoy most during vacation.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "find the reason behind how things work", interestCode: "A" },
      { optionKey: "B", optionText: "understand rules, society and decision-making", interestCode: "C" },
      { optionKey: "C", optionText: "write, speak, teach or guide people", interestCode: "G" },
      { optionKey: "D", optionText: "take responsibility for goals and execution", interestCode: "H" },
      { optionKey: "E", optionText: "work on nature, climate or sustainability", interestCode: "I" },
    ],
  },
  // ── Q18 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 18,
    grade: "Grade 8",
    situation:
      "During a library task, your class has to design a model to explain an idea to younger students.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "plan a budget and compare costs", interestCode: "B" },
      { optionKey: "B", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "C", optionText: "solve the task with software or gadgets", interestCode: "E" },
      { optionKey: "D", optionText: "study health, body, mind or biology", interestCode: "F" },
      { optionKey: "E", optionText: "support community needs and emotional wellbeing", interestCode: "J" },
    ],
  },
  // ── Q19 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 19,
    grade: "Grade 8",
    situation:
      "In a science-social exhibition, the school wants student feedback on new optional subjects or clubs.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "work with formulas, patterns and evidence", interestCode: "A" },
      { optionKey: "B", optionText: "analyse profit, pricing and value", interestCode: "B" },
      { optionKey: "C", optionText: "understand rules, society and decision-making", interestCode: "C" },
      { optionKey: "D", optionText: "understand living systems and wellbeing", interestCode: "F" },
      { optionKey: "E", optionText: "prepare content that helps others understand", interestCode: "G" },
    ],
  },
  // ── Q20 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 20,
    grade: "Grade 8",
    situation:
      "For a student fair, your group is asked to solve a case study based on real life.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "present ideas through design and imagination", interestCode: "D" },
      { optionKey: "B", optionText: "build something using technology or coding", interestCode: "E" },
      { optionKey: "C", optionText: "create a business or marketing strategy", interestCode: "H" },
      { optionKey: "D", optionText: "solve a pollution or conservation problem", interestCode: "I" },
      { optionKey: "E", optionText: "help people facing difficulty", interestCode: "J" },
    ],
  },
  // ── Q21 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 21,
    grade: "Grade 8",
    situation:
      "In a class activity, your school announces an inter-school exhibition and asks students to choose one project area.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "test a science idea through experiments", interestCode: "A" },
      { optionKey: "B", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "C", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "D", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "E", optionText: "study environment, resources or farming systems", interestCode: "I" },
    ],
  },
  // ── Q22 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 22,
    grade: "Grade 8",
    situation:
      "During a school club period, your class teacher gives you a choice of how to complete a holiday assignment.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "study how money and businesses work", interestCode: "B" },
      { optionKey: "B", optionText: "study people, history and governance", interestCode: "C" },
      { optionKey: "C", optionText: "build something using technology or coding", interestCode: "E" },
      { optionKey: "D", optionText: "create a business or marketing strategy", interestCode: "H" },
      { optionKey: "E", optionText: "work on inclusion, care and social improvement", interestCode: "J" },
    ],
  },
  // ── Q23 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 23,
    grade: "Grade 8",
    situation:
      "For a fun project, a group project is struggling because everyone has different ideas.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "find the reason behind how things work", interestCode: "A" },
      { optionKey: "B", optionText: "plan a budget and compare costs", interestCode: "B" },
      { optionKey: "C", optionText: "use digital tools, apps or automation", interestCode: "E" },
      { optionKey: "D", optionText: "solve a pollution or conservation problem", interestCode: "I" },
      { optionKey: "E", optionText: "help people facing difficulty", interestCode: "J" },
    ],
  },
  // ── Q24 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 24,
    grade: "Grade 8",
    situation:
      "In a group assignment, your school invites students to join a year-long club activity.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "understand rules, society and decision-making", interestCode: "C" },
      { optionKey: "B", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "C", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "D", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "E", optionText: "create a business or marketing strategy", interestCode: "H" },
    ],
  },
  // ── Q25 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 25,
    grade: "Grade 8",
    situation:
      "During activity week, you are asked to prepare a presentation for the morning assembly.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "work with formulas, patterns and evidence", interestCode: "A" },
      { optionKey: "B", optionText: "analyse profit, pricing and value", interestCode: "B" },
      { optionKey: "C", optionText: "design visuals, stories or creative material", interestCode: "D" },
      { optionKey: "D", optionText: "use digital tools, apps or automation", interestCode: "E" },
      { optionKey: "E", optionText: "take responsibility for goals and execution", interestCode: "H" },
    ],
  },
  // ── Q26 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 26,
    grade: "Grade 8",
    situation:
      "When your teacher gives a choice, your friend is confused about which subject activity to join.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "B", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "C", optionText: "debate rights, laws and civic issues", interestCode: "C" },
      { optionKey: "D", optionText: "solve a pollution or conservation problem", interestCode: "I" },
      { optionKey: "E", optionText: "help people facing difficulty", interestCode: "J" },
    ],
  },
  // ── Q27 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 27,
    grade: "Grade 8",
    situation:
      "For a school display, the school library asks you to recommend a section for new books.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "test a science idea through experiments", interestCode: "A" },
      { optionKey: "B", optionText: "use digital tools, apps or automation", interestCode: "E" },
      { optionKey: "C", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "D", optionText: "work on nature, climate or sustainability", interestCode: "I" },
      { optionKey: "E", optionText: "debate rights, laws and civic issues", interestCode: "C" },
    ],
  },
  // ── Q28 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 28,
    grade: "Grade 8",
    situation:
      "During a library task, your teacher asks you to select a topic for an independent study project.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "study how money and businesses work", interestCode: "B" },
      { optionKey: "B", optionText: "take responsibility for goals and execution", interestCode: "H" },
      { optionKey: "C", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "D", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "E", optionText: "work on inclusion, care and social improvement", interestCode: "J" },
    ],
  },
  // ── Q29 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 29,
    grade: "Grade 8",
    situation:
      "In a science-social exhibition, a community event needs student volunteers for different roles.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "find the reason behind how things work", interestCode: "A" },
      { optionKey: "B", optionText: "understand rules, society and decision-making", interestCode: "C" },
      { optionKey: "C", optionText: "write, speak, teach or guide people", interestCode: "G" },
      { optionKey: "D", optionText: "take responsibility for goals and execution", interestCode: "H" },
      { optionKey: "E", optionText: "work on nature, climate or sustainability", interestCode: "I" },
    ],
  },
  // ── Q30 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 30,
    grade: "Grade 8",
    situation:
      "For a student fair, your class is planning a field visit and you can vote for the destination.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "plan a budget and compare costs", interestCode: "B" },
      { optionKey: "B", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "C", optionText: "solve the task with software or gadgets", interestCode: "E" },
      { optionKey: "D", optionText: "study health, body, mind or biology", interestCode: "F" },
      { optionKey: "E", optionText: "support community needs and emotional wellbeing", interestCode: "J" },
    ],
  },
  // ── Q31 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 31,
    grade: "Grade 8",
    situation:
      "In a class activity, you get one free weekend workshop sponsored by the school.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "work with formulas, patterns and evidence", interestCode: "A" },
      { optionKey: "B", optionText: "analyse profit, pricing and value", interestCode: "B" },
      { optionKey: "C", optionText: "understand rules, society and decision-making", interestCode: "C" },
      { optionKey: "D", optionText: "understand living systems and wellbeing", interestCode: "F" },
      { optionKey: "E", optionText: "prepare content that helps others understand", interestCode: "G" },
    ],
  },
  // ── Q32 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 32,
    grade: "Grade 8",
    situation:
      "During a school club period, your school asks students to create a solution for a local problem.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "present ideas through design and imagination", interestCode: "D" },
      { optionKey: "B", optionText: "build something using technology or coding", interestCode: "E" },
      { optionKey: "C", optionText: "create a business or marketing strategy", interestCode: "H" },
      { optionKey: "D", optionText: "solve a pollution or conservation problem", interestCode: "I" },
      { optionKey: "E", optionText: "help people facing difficulty", interestCode: "J" },
    ],
  },
  // ── Q33 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 33,
    grade: "Grade 8",
    situation:
      "For a fun project, you are asked to interview a professional for a school assignment.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "test a science idea through experiments", interestCode: "A" },
      { optionKey: "B", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "C", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "D", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "E", optionText: "study environment, resources or farming systems", interestCode: "I" },
    ],
  },
  // ── Q34 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 34,
    grade: "Grade 8",
    situation:
      "In a group assignment, your annual day team needs help in different departments.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "study how money and businesses work", interestCode: "B" },
      { optionKey: "B", optionText: "study people, history and governance", interestCode: "C" },
      { optionKey: "C", optionText: "build something using technology or coding", interestCode: "E" },
      { optionKey: "D", optionText: "create a business or marketing strategy", interestCode: "H" },
      { optionKey: "E", optionText: "work on inclusion, care and social improvement", interestCode: "J" },
    ],
  },
  // ── Q35 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 35,
    grade: "Grade 8",
    situation:
      "During activity week, your teacher gives you a choice of competition to represent the school.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "find the reason behind how things work", interestCode: "A" },
      { optionKey: "B", optionText: "plan a budget and compare costs", interestCode: "B" },
      { optionKey: "C", optionText: "use digital tools, apps or automation", interestCode: "E" },
      { optionKey: "D", optionText: "solve a pollution or conservation problem", interestCode: "I" },
      { optionKey: "E", optionText: "help people facing difficulty", interestCode: "J" },
    ],
  },
  // ── Q36 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 36,
    grade: "Grade 8",
    situation:
      "When your teacher gives a choice, you are asked to select a magazine article topic for the school newsletter.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "understand rules, society and decision-making", interestCode: "C" },
      { optionKey: "B", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "C", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "D", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "E", optionText: "create a business or marketing strategy", interestCode: "H" },
    ],
  },
  // ── Q37 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 37,
    grade: "Grade 8",
    situation:
      "For a school display, your parent asks what type of learning activity you would enjoy most during vacation.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "work with formulas, patterns and evidence", interestCode: "A" },
      { optionKey: "B", optionText: "analyse profit, pricing and value", interestCode: "B" },
      { optionKey: "C", optionText: "design visuals, stories or creative material", interestCode: "D" },
      { optionKey: "D", optionText: "use digital tools, apps or automation", interestCode: "E" },
      { optionKey: "E", optionText: "take responsibility for goals and execution", interestCode: "H" },
    ],
  },
  // ── Q38 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 38,
    grade: "Grade 8",
    situation:
      "During a library task, your class has to design a model to explain an idea to younger students.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "B", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "C", optionText: "debate rights, laws and civic issues", interestCode: "C" },
      { optionKey: "D", optionText: "solve a pollution or conservation problem", interestCode: "I" },
      { optionKey: "E", optionText: "help people facing difficulty", interestCode: "J" },
    ],
  },
  // ── Q39 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 39,
    grade: "Grade 8",
    situation:
      "In a science-social exhibition, the school wants student feedback on new optional subjects or clubs.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "test a science idea through experiments", interestCode: "A" },
      { optionKey: "B", optionText: "use digital tools, apps or automation", interestCode: "E" },
      { optionKey: "C", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "D", optionText: "work on nature, climate or sustainability", interestCode: "I" },
      { optionKey: "E", optionText: "debate rights, laws and civic issues", interestCode: "C" },
    ],
  },
  // ── Q40 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 40,
    grade: "Grade 8",
    situation:
      "For a student fair, your group is asked to solve a case study based on real life.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "study how money and businesses work", interestCode: "B" },
      { optionKey: "B", optionText: "take responsibility for goals and execution", interestCode: "H" },
      { optionKey: "C", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "D", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "E", optionText: "work on inclusion, care and social improvement", interestCode: "J" },
    ],
  },
  // ── Q41 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 41,
    grade: "Grade 8",
    situation:
      "In a class activity, your school announces an inter-school exhibition and asks students to choose one project area.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "find the reason behind how things work", interestCode: "A" },
      { optionKey: "B", optionText: "understand rules, society and decision-making", interestCode: "C" },
      { optionKey: "C", optionText: "write, speak, teach or guide people", interestCode: "G" },
      { optionKey: "D", optionText: "take responsibility for goals and execution", interestCode: "H" },
      { optionKey: "E", optionText: "work on nature, climate or sustainability", interestCode: "I" },
    ],
  },
  // ── Q42 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 42,
    grade: "Grade 8",
    situation:
      "During a school club period, your class teacher gives you a choice of how to complete a holiday assignment.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "plan a budget and compare costs", interestCode: "B" },
      { optionKey: "B", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "C", optionText: "solve the task with software or gadgets", interestCode: "E" },
      { optionKey: "D", optionText: "study health, body, mind or biology", interestCode: "F" },
      { optionKey: "E", optionText: "support community needs and emotional wellbeing", interestCode: "J" },
    ],
  },
  // ── Q43 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 43,
    grade: "Grade 8",
    situation:
      "For a fun project, a group project is struggling because everyone has different ideas.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "work with formulas, patterns and evidence", interestCode: "A" },
      { optionKey: "B", optionText: "analyse profit, pricing and value", interestCode: "B" },
      { optionKey: "C", optionText: "understand rules, society and decision-making", interestCode: "C" },
      { optionKey: "D", optionText: "understand living systems and wellbeing", interestCode: "F" },
      { optionKey: "E", optionText: "prepare content that helps others understand", interestCode: "G" },
    ],
  },
  // ── Q44 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 44,
    grade: "Grade 8",
    situation:
      "In a group assignment, your school invites students to join a year-long club activity.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "present ideas through design and imagination", interestCode: "D" },
      { optionKey: "B", optionText: "build something using technology or coding", interestCode: "E" },
      { optionKey: "C", optionText: "create a business or marketing strategy", interestCode: "H" },
      { optionKey: "D", optionText: "solve a pollution or conservation problem", interestCode: "I" },
      { optionKey: "E", optionText: "help people facing difficulty", interestCode: "J" },
    ],
  },
  // ── Q45 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 45,
    grade: "Grade 8",
    situation:
      "During activity week, you are asked to prepare a presentation for the morning assembly.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "test a science idea through experiments", interestCode: "A" },
      { optionKey: "B", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "C", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "D", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "E", optionText: "study environment, resources or farming systems", interestCode: "I" },
    ],
  },
  // ── Q46 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 46,
    grade: "Grade 8",
    situation:
      "When your teacher gives a choice, your friend is confused about which subject activity to join.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "study how money and businesses work", interestCode: "B" },
      { optionKey: "B", optionText: "study people, history and governance", interestCode: "C" },
      { optionKey: "C", optionText: "build something using technology or coding", interestCode: "E" },
      { optionKey: "D", optionText: "create a business or marketing strategy", interestCode: "H" },
      { optionKey: "E", optionText: "work on inclusion, care and social improvement", interestCode: "J" },
    ],
  },
  // ── Q47 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 47,
    grade: "Grade 8",
    situation:
      "For a school display, the school library asks you to recommend a section for new books.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "find the reason behind how things work", interestCode: "A" },
      { optionKey: "B", optionText: "plan a budget and compare costs", interestCode: "B" },
      { optionKey: "C", optionText: "use digital tools, apps or automation", interestCode: "E" },
      { optionKey: "D", optionText: "solve a pollution or conservation problem", interestCode: "I" },
      { optionKey: "E", optionText: "help people facing difficulty", interestCode: "J" },
    ],
  },
  // ── Q48 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 48,
    grade: "Grade 8",
    situation:
      "During a library task, your teacher asks you to select a topic for an independent study project.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "understand rules, society and decision-making", interestCode: "C" },
      { optionKey: "B", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "C", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "D", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "E", optionText: "create a business or marketing strategy", interestCode: "H" },
    ],
  },
  // ── Q49 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 49,
    grade: "Grade 8",
    situation:
      "In a science-social exhibition, a community event needs student volunteers for different roles.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "work with formulas, patterns and evidence", interestCode: "A" },
      { optionKey: "B", optionText: "analyse profit, pricing and value", interestCode: "B" },
      { optionKey: "C", optionText: "design visuals, stories or creative material", interestCode: "D" },
      { optionKey: "D", optionText: "use digital tools, apps or automation", interestCode: "E" },
      { optionKey: "E", optionText: "take responsibility for goals and execution", interestCode: "H" },
    ],
  },
  // ── Q50 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 50,
    grade: "Grade 8",
    situation:
      "For a student fair, your class is planning a field visit and you can vote for the destination.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "B", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "C", optionText: "debate rights, laws and civic issues", interestCode: "C" },
      { optionKey: "D", optionText: "solve a pollution or conservation problem", interestCode: "I" },
      { optionKey: "E", optionText: "help people facing difficulty", interestCode: "J" },
    ],
  },
  // ── Q51 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 51,
    grade: "Grade 8",
    situation:
      "In a class activity, you get one free weekend workshop sponsored by the school.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "test a science idea through experiments", interestCode: "A" },
      { optionKey: "B", optionText: "use digital tools, apps or automation", interestCode: "E" },
      { optionKey: "C", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "D", optionText: "work on nature, climate or sustainability", interestCode: "I" },
      { optionKey: "E", optionText: "debate rights, laws and civic issues", interestCode: "C" },
    ],
  },
  // ── Q52 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 52,
    grade: "Grade 8",
    situation:
      "During a school club period, your school asks students to create a solution for a local problem.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "study how money and businesses work", interestCode: "B" },
      { optionKey: "B", optionText: "take responsibility for goals and execution", interestCode: "H" },
      { optionKey: "C", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "D", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "E", optionText: "work on inclusion, care and social improvement", interestCode: "J" },
    ],
  },
  // ── Q53 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 53,
    grade: "Grade 8",
    situation:
      "For a fun project, you are asked to interview a professional for a school assignment.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "find the reason behind how things work", interestCode: "A" },
      { optionKey: "B", optionText: "understand rules, society and decision-making", interestCode: "C" },
      { optionKey: "C", optionText: "write, speak, teach or guide people", interestCode: "G" },
      { optionKey: "D", optionText: "take responsibility for goals and execution", interestCode: "H" },
      { optionKey: "E", optionText: "work on nature, climate or sustainability", interestCode: "I" },
    ],
  },
  // ── Q54 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 54,
    grade: "Grade 8",
    situation:
      "In a group assignment, your annual day team needs help in different departments.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "plan a budget and compare costs", interestCode: "B" },
      { optionKey: "B", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "C", optionText: "solve the task with software or gadgets", interestCode: "E" },
      { optionKey: "D", optionText: "study health, body, mind or biology", interestCode: "F" },
      { optionKey: "E", optionText: "support community needs and emotional wellbeing", interestCode: "J" },
    ],
  },
  // ── Q55 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 55,
    grade: "Grade 8",
    situation:
      "During activity week, your teacher gives you a choice of competition to represent the school.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "work with formulas, patterns and evidence", interestCode: "A" },
      { optionKey: "B", optionText: "analyse profit, pricing and value", interestCode: "B" },
      { optionKey: "C", optionText: "understand rules, society and decision-making", interestCode: "C" },
      { optionKey: "D", optionText: "understand living systems and wellbeing", interestCode: "F" },
      { optionKey: "E", optionText: "prepare content that helps others understand", interestCode: "G" },
    ],
  },
  // ── Q56 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 56,
    grade: "Grade 8",
    situation:
      "When your teacher gives a choice, you are asked to select a magazine article topic for the school newsletter.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "present ideas through design and imagination", interestCode: "D" },
      { optionKey: "B", optionText: "build something using technology or coding", interestCode: "E" },
      { optionKey: "C", optionText: "create a business or marketing strategy", interestCode: "H" },
      { optionKey: "D", optionText: "solve a pollution or conservation problem", interestCode: "I" },
      { optionKey: "E", optionText: "help people facing difficulty", interestCode: "J" },
    ],
  },
  // ── Q57 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 57,
    grade: "Grade 8",
    situation:
      "For a school display, your parent asks what type of learning activity you would enjoy most during vacation.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "test a science idea through experiments", interestCode: "A" },
      { optionKey: "B", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "C", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "D", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "E", optionText: "study environment, resources or farming systems", interestCode: "I" },
    ],
  },
  // ── Q58 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 58,
    grade: "Grade 8",
    situation:
      "During a library task, your class has to design a model to explain an idea to younger students.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "study how money and businesses work", interestCode: "B" },
      { optionKey: "B", optionText: "study people, history and governance", interestCode: "C" },
      { optionKey: "C", optionText: "build something using technology or coding", interestCode: "E" },
      { optionKey: "D", optionText: "create a business or marketing strategy", interestCode: "H" },
      { optionKey: "E", optionText: "work on inclusion, care and social improvement", interestCode: "J" },
    ],
  },
  // ── Q59 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 59,
    grade: "Grade 8",
    situation:
      "In a science-social exhibition, the school wants student feedback on new optional subjects or clubs.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "find the reason behind how things work", interestCode: "A" },
      { optionKey: "B", optionText: "plan a budget and compare costs", interestCode: "B" },
      { optionKey: "C", optionText: "use digital tools, apps or automation", interestCode: "E" },
      { optionKey: "D", optionText: "solve a pollution or conservation problem", interestCode: "I" },
      { optionKey: "E", optionText: "help people facing difficulty", interestCode: "J" },
    ],
  },
  // ── Q60 ─────────────────────────────────────────────────────────────
  {
    questionNumber: 60,
    grade: "Grade 8",
    situation:
      "For a student fair, your group is asked to solve a case study based on real life.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "understand rules, society and decision-making", interestCode: "C" },
      { optionKey: "B", optionText: "create posters, layouts, scripts or art", interestCode: "D" },
      { optionKey: "C", optionText: "learn how people stay healthy and perform well", interestCode: "F" },
      { optionKey: "D", optionText: "explain ideas clearly to others", interestCode: "G" },
      { optionKey: "E", optionText: "create a business or marketing strategy", interestCode: "H" },
    ],
  },
];
