import crypto from "crypto";

import CaptchaChallenge from "../models/CaptchaChallenge";

type Challenge = {
  question: string;
  answer: number;
  expiresAt: number;
};

const fallbackStore = new Map<string, Challenge>();

setInterval(() => {
  const now = Date.now();
  for (const [token, challenge] of fallbackStore.entries()) {
    if (challenge.expiresAt <= now) {
      fallbackStore.delete(token);
    }
  }
}, 5 * 60 * 1000);

const buildChallenge = (): { question: string; answer: number } => {
  const operators = ["+", "-", "×"] as const;
  const operator = operators[Math.floor(Math.random() * operators.length)];

  let left = 0;
  let right = 0;
  let answer = 0;

  if (operator === "+") {
    left = Math.floor(Math.random() * 50) + 1;
    right = Math.floor(Math.random() * 50) + 1;
    answer = left + right;
  } else if (operator === "-") {
    left = Math.floor(Math.random() * 50) + 10;
    right = Math.floor(Math.random() * left);
    answer = left - right;
  } else {
    left = Math.floor(Math.random() * 12) + 2;
    right = Math.floor(Math.random() * 12) + 2;
    answer = left * right;
  }

  return {
    question: `${left} ${operator} ${right} = ?`,
    answer,
  };
};

export const generateCaptcha = async (): Promise<{ token: string; question: string }> => {
  const { question, answer } = buildChallenge();
  const token = crypto.randomBytes(16).toString("hex");

  try {
    await CaptchaChallenge.create({ token, answer });
    return { token, question };
  } catch {
    fallbackStore.set(token, {
      question,
      answer,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    return { token, question };
  }
};

export const verifyCaptcha = async (token: string, answer: number): Promise<boolean> => {
  try {
    const challenge = await CaptchaChallenge.findOneAndDelete({ token });
    if (challenge) {
      return challenge.answer === answer;
    }
  } catch {
    // fall through to in-memory store
  }

  const fallback = fallbackStore.get(token);
  if (!fallback) {
    return false;
  }

  fallbackStore.delete(token);
  if (fallback.expiresAt <= Date.now()) {
    return false;
  }

  return fallback.answer === answer;
};
