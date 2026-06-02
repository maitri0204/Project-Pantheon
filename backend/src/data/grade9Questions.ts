import { grade8Questions } from "./grade8Questions";

export interface RawGrade9Question {
  questionNumber: number;
  grade: "Grade 9";
  situation: string;
  questionText: string;
  options: Array<{
    optionKey: "A" | "B" | "C" | "D" | "E";
    optionText: string;
    interestCode: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";
  }>;
}

const GRADE_9_Q_TEXT = "At this stage, you would prefer to:";

const grade9Situations: string[] = [
  "While exploring future subjects, your school announces an inter-school exhibition and asks students to choose one project area.",
  "During a career awareness activity, your class teacher gives you a choice of how to complete a holiday assignment.",
  "In a subject-linked project, a group project is struggling because everyone has different ideas.",
  "When choosing a school competition, your school invites students to join a year-long club activity.",
  "During a skill-building workshop, you are asked to prepare a presentation for the morning assembly.",
  "For a real-world case study, your friend is confused about which subject activity to join.",
  "During a class research activity, the school library asks you to recommend a section for new books.",
  "When planning your portfolio, your teacher asks you to select a topic for an independent study project.",
  "In a school innovation challenge, a community event needs student volunteers for different roles.",
  "During a stream awareness session, your class is planning a field visit and you can vote for the destination.",
  "While exploring future subjects, you get one free weekend workshop sponsored by the school.",
  "During a career awareness activity, your school asks students to create a solution for a local problem.",
  "In a subject-linked project, you are asked to interview a professional for a school assignment.",
  "When choosing a school competition, your annual day team needs help in different departments.",
  "During a skill-building workshop, your teacher gives you a choice of competition to represent the school.",
  "For a real-world case study, you are asked to select a magazine article topic for the school newsletter.",
  "During a class research activity, your parent asks what type of learning activity you would enjoy most during vacation.",
  "When planning your portfolio, your class has to design a model to explain an idea to younger students.",
  "In a school innovation challenge, the school wants student feedback on new optional subjects or clubs.",
  "During a stream awareness session, your group is asked to solve a case study based on real life.",
  "While exploring future subjects, your school announces an inter-school exhibition and asks students to choose one project area.",
  "During a career awareness activity, your class teacher gives you a choice of how to complete a holiday assignment.",
  "In a subject-linked project, a group project is struggling because everyone has different ideas.",
  "When choosing a school competition, your school invites students to join a year-long club activity.",
  "During a skill-building workshop, you are asked to prepare a presentation for the morning assembly.",
  "For a real-world case study, your friend is confused about which subject activity to join.",
  "During a class research activity, the school library asks you to recommend a section for new books.",
  "When planning your portfolio, your teacher asks you to select a topic for an independent study project.",
  "In a school innovation challenge, a community event needs student volunteers for different roles.",
  "During a stream awareness session, your class is planning a field visit and you can vote for the destination.",
  "While exploring future subjects, you get one free weekend workshop sponsored by the school.",
  "During a career awareness activity, your school asks students to create a solution for a local problem.",
  "In a subject-linked project, you are asked to interview a professional for a school assignment.",
  "When choosing a school competition, your annual day team needs help in different departments.",
  "During a skill-building workshop, your teacher gives you a choice of competition to represent the school.",
  "For a real-world case study, you are asked to select a magazine article topic for the school newsletter.",
  "During a class research activity, your parent asks what type of learning activity you would enjoy most during vacation.",
  "When planning your portfolio, your class has to design a model to explain an idea to younger students.",
  "In a school innovation challenge, the school wants student feedback on new optional subjects or clubs.",
  "During a stream awareness session, your group is asked to solve a case study based on real life.",
  "While exploring future subjects, your school announces an inter-school exhibition and asks students to choose one project area.",
  "During a career awareness activity, your class teacher gives you a choice of how to complete a holiday assignment.",
  "In a subject-linked project, a group project is struggling because everyone has different ideas.",
  "When choosing a school competition, your school invites students to join a year-long club activity.",
  "During a skill-building workshop, you are asked to prepare a presentation for the morning assembly.",
  "For a real-world case study, your friend is confused about which subject activity to join.",
  "During a class research activity, the school library asks you to recommend a section for new books.",
  "When planning your portfolio, your teacher asks you to select a topic for an independent study project.",
  "In a school innovation challenge, a community event needs student volunteers for different roles.",
  "During a stream awareness session, your class is planning a field visit and you can vote for the destination.",
  "While exploring future subjects, you get one free weekend workshop sponsored by the school.",
  "During a career awareness activity, your school asks students to create a solution for a local problem.",
  "In a subject-linked project, you are asked to interview a professional for a school assignment.",
  "When choosing a school competition, your annual day team needs help in different departments.",
  "During a skill-building workshop, your teacher gives you a choice of competition to represent the school.",
  "For a real-world case study, you are asked to select a magazine article topic for the school newsletter.",
  "During a class research activity, your parent asks what type of learning activity you would enjoy most during vacation.",
  "When planning your portfolio, your class has to design a model to explain an idea to younger students.",
  "In a school innovation challenge, the school wants student feedback on new optional subjects or clubs.",
  "During a stream awareness session, your group is asked to solve a case study based on real life.",
];

if (grade9Situations.length !== grade8Questions.length) {
  throw new Error(
    `Grade 9 situations count (${grade9Situations.length}) does not match template question count (${grade8Questions.length})`
  );
}

export const grade9Questions: RawGrade9Question[] = grade8Questions.map((q, idx) => ({
  questionNumber: q.questionNumber,
  grade: "Grade 9",
  situation: grade9Situations[idx],
  questionText: GRADE_9_Q_TEXT,
  options: q.options.map((option) => ({ ...option })),
}));
