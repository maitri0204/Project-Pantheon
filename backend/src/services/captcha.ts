import crypto from "crypto";

type Challenge = {
  question: string;
  answer: number;
  expiresAt: number;
};

const store = new Map<string, Challenge>();

setInterval(() => {
  const now = Date.now();
  for (const [token, challenge] of store.entries()) {
    if (challenge.expiresAt <= now) {
      store.delete(token);
    }
  }
}, 5 * 60 * 1000);

export const generateCaptcha = (): { token: string; question: string } => {
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

  const token = crypto.randomBytes(16).toString("hex");
  store.set(token, {
    question: `${left} ${operator} ${right} = ?`,
    answer,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  return { token, question: `${left} ${operator} ${right} = ?` };
};

export const verifyCaptcha = (token: string, answer: number): boolean => {
  const challenge = store.get(token);
  if (!challenge) {
    return false;
  }

  store.delete(token);
  if (challenge.expiresAt <= Date.now()) {
    return false;
  }

  return challenge.answer === answer;
};
