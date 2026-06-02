import { grade8Questions } from "./grade8Questions";

export interface RawGrade10Question {
  questionNumber: number;
  grade: "Grade 10";
  situation: string;
  questionText: string;
  options: Array<{
    optionKey: "A" | "B" | "C" | "D" | "E";
    optionText: string;
    interestCode: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";
  }>;
}

const GRADE_10_Q_TEXT = "Before choosing your stream, you would be more interested to:";

const grade10Situations: string[] = [
  "While thinking about Grade 11 subjects, your school announces an inter-school exhibition and asks students to choose one project area.",
  "Before selecting a stream, your class teacher gives you a choice of how to complete a holiday assignment.",
  "During a career counseling activity, a group project is struggling because everyone has different ideas.",
  "When comparing future pathways, your school invites students to join a year-long club activity.",
  "In a stream-selection workshop, you are asked to prepare a presentation for the morning assembly.",
  "For a career-linked portfolio task, your friend is confused about which subject activity to join.",
  "During a parent-student discussion, the school library asks you to recommend a section for new books.",
  "When evaluating subject combinations, your teacher asks you to select a topic for an independent study project.",
  "In a future-readiness project, a community event needs student volunteers for different roles.",
  "During a counseling interview, your class is planning a field visit and you can vote for the destination.",
  "While thinking about Grade 11 subjects, you get one free weekend workshop sponsored by the school.",
  "Before selecting a stream, your school asks students to create a solution for a local problem.",
  "During a career counseling activity, you are asked to interview a professional for a school assignment.",
  "When comparing future pathways, your annual day team needs help in different departments.",
  "In a stream-selection workshop, your teacher gives you a choice of competition to represent the school.",
  "For a career-linked portfolio task, you are asked to select a magazine article topic for the school newsletter.",
  "During a parent-student discussion, your parent asks what type of learning activity you would enjoy most during vacation.",
  "When evaluating subject combinations, your class has to design a model to explain an idea to younger students.",
  "In a future-readiness project, the school wants student feedback on new optional subjects or clubs.",
  "During a counseling interview, your group is asked to solve a case study based on real life.",
  "While thinking about Grade 11 subjects, your school announces an inter-school exhibition and asks students to choose one project area.",
  "Before selecting a stream, your class teacher gives you a choice of how to complete a holiday assignment.",
  "During a career counseling activity, a group project is struggling because everyone has different ideas.",
  "When comparing future pathways, your school invites students to join a year-long club activity.",
  "In a stream-selection workshop, you are asked to prepare a presentation for the morning assembly.",
  "For a career-linked portfolio task, your friend is confused about which subject activity to join.",
  "During a parent-student discussion, the school library asks you to recommend a section for new books.",
  "When evaluating subject combinations, your teacher asks you to select a topic for an independent study project.",
  "In a future-readiness project, a community event needs student volunteers for different roles.",
  "During a counseling interview, your class is planning a field visit and you can vote for the destination.",
  "While thinking about Grade 11 subjects, you get one free weekend workshop sponsored by the school.",
  "Before selecting a stream, your school asks students to create a solution for a local problem.",
  "During a career counseling activity, you are asked to interview a professional for a school assignment.",
  "When comparing future pathways, your annual day team needs help in different departments.",
  "In a stream-selection workshop, your teacher gives you a choice of competition to represent the school.",
  "For a career-linked portfolio task, you are asked to select a magazine article topic for the school newsletter.",
  "During a parent-student discussion, your parent asks what type of learning activity you would enjoy most during vacation.",
  "When evaluating subject combinations, your class has to design a model to explain an idea to younger students.",
  "In a future-readiness project, the school wants student feedback on new optional subjects or clubs.",
  "During a counseling interview, your group is asked to solve a case study based on real life.",
  "While thinking about Grade 11 subjects, your school announces an inter-school exhibition and asks students to choose one project area.",
  "Before selecting a stream, your class teacher gives you a choice of how to complete a holiday assignment.",
  "During a career counseling activity, a group project is struggling because everyone has different ideas.",
  "When comparing future pathways, your school invites students to join a year-long club activity.",
  "In a stream-selection workshop, you are asked to prepare a presentation for the morning assembly.",
  "For a career-linked portfolio task, your friend is confused about which subject activity to join.",
  "During a parent-student discussion, the school library asks you to recommend a section for new books.",
  "When evaluating subject combinations, your teacher asks you to select a topic for an independent study project.",
  "In a future-readiness project, a community event needs student volunteers for different roles.",
  "During a counseling interview, your class is planning a field visit and you can vote for the destination.",
  "While thinking about Grade 11 subjects, you get one free weekend workshop sponsored by the school.",
  "Before selecting a stream, your school asks students to create a solution for a local problem.",
  "During a career counseling activity, you are asked to interview a professional for a school assignment.",
  "When comparing future pathways, your annual day team needs help in different departments.",
  "In a stream-selection workshop, your teacher gives you a choice of competition to represent the school.",
  "For a career-linked portfolio task, you are asked to select a magazine article topic for the school newsletter.",
  "During a parent-student discussion, your parent asks what type of learning activity you would enjoy most during vacation.",
  "When evaluating subject combinations, your class has to design a model to explain an idea to younger students.",
  "In a future-readiness project, the school wants student feedback on new optional subjects or clubs.",
  "During a counseling interview, your group is asked to solve a case study based on real life.",
];

if (grade10Situations.length !== grade8Questions.length) {
  throw new Error(
    `Grade 10 situations count (${grade10Situations.length}) does not match template question count (${grade8Questions.length})`
  );
}

export const grade10Questions: RawGrade10Question[] = grade8Questions.map((q, idx) => ({
  questionNumber: q.questionNumber,
  grade: "Grade 10",
  situation: grade10Situations[idx],
  questionText: GRADE_10_Q_TEXT,
  options: q.options.map((option) => ({ ...option })),
}));
