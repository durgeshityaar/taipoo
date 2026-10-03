import { z } from "zod";
import { emailAnswer, emailQuestion } from "./email";
import { longTextAnswer, longTextQuestion } from "./long-text";
import { multipleChoiceAnswer, multipleChoiceQuestion } from "./multiple-choice";
import { shortTextAnswer, shortTextQuestion } from "./short-text";

// One file per question type: its schema, its type, and its answer validator (what a
// non-empty answer must look like; required/blank handling is shared, in answers.ts).
//
// Adding a type:
//   1. create questions/<type>.ts exporting `<type>Question`, `<Type>Question`, `<type>Answer`
//   2. add the schema to `question` below
//   3. add the validator to `answerValidators` below (TypeScript errors until you do)
//   4. re-export the file at the bottom

export const question = z.discriminatedUnion("type", [
  shortTextQuestion,
  longTextQuestion,
  emailQuestion,
  multipleChoiceQuestion,
]);

export type Question = z.infer<typeof question>;
export type QuestionType = Question["type"];

// A validator yields the stored value for a non-empty answer, so it must produce a string or string[] (see Answers).
export const answerValidators: {
  [T in QuestionType]: (q: Extract<Question, { type: T }>) => z.ZodType<string | string[]>;
} = {
  short_text: shortTextAnswer,
  long_text: longTextAnswer,
  email: emailAnswer,
  multiple_choice: multipleChoiceAnswer,
};

export * from "./email";
export * from "./long-text";
export * from "./multiple-choice";
export * from "./short-text";
