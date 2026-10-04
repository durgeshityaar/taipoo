import { z } from "zod";
import type { PublishIssue } from "./base";
import { blankEmail, emailAnswer, emailQuestion } from "./email";
import { blankLongText, longTextAnswer, longTextQuestion } from "./long-text";
import {
  blankMultipleChoice,
  multipleChoiceAnswer,
  multipleChoicePublishIssues,
  multipleChoiceQuestion,
} from "./multiple-choice";
import { blankShortText, shortTextAnswer, shortTextQuestion } from "./short-text";

// One file per question type: its schema, its type, a blank draft of it, and its answer validator
// (what a non-empty answer must look like; required/blank handling is shared, in answers.ts).
//
// Adding a type:
//   1. create questions/<type>.ts exporting `<type>Question`, `<Type>Question`, `blank<Type>`, `<type>Answer`
//      (and `<type>PublishIssues` if it has publish rules beyond a title)
//   2. add the schema to `question` below
//   3. add it to `blankQuestions` and `answerValidators` below (TypeScript errors until you do),
//      and to `publishChecks` if it has publish rules
//   4. re-export the file at the bottom
//   5. add its editor to `questionKinds` in apps/web/src/lib/components/questions/index.ts

export const question = z.discriminatedUnion("type", [
  shortTextQuestion,
  longTextQuestion,
  emailQuestion,
  multipleChoiceQuestion,
]);

export type Question = z.infer<typeof question>;
export type QuestionType = Question["type"];
type QuestionOf<T extends QuestionType> = Extract<Question, { type: T }>;

// What a newly inserted block starts as: a valid draft question, not yet publishable.
export const blankQuestions: { [T in QuestionType]: (id: string) => QuestionOf<T> } = {
  short_text: blankShortText,
  long_text: blankLongText,
  email: blankEmail,
  multiple_choice: blankMultipleChoice,
};

// Per-type publish rules on top of the shared ones (title set), checked by formDefinition.
export const publishChecks: { [T in QuestionType]?: (q: QuestionOf<T>) => PublishIssue[] } = {
  multiple_choice: multipleChoicePublishIssues,
};

// A validator yields the stored value for a non-empty answer, so it must produce a string or string[] (see Answers).
export const answerValidators: {
  [T in QuestionType]: (q: QuestionOf<T>) => z.ZodType<string | string[]>;
} = {
  short_text: shortTextAnswer,
  long_text: longTextAnswer,
  email: emailAnswer,
  multiple_choice: multipleChoiceAnswer,
};

export { newId, type PublishIssue } from "./base";
export * from "./email";
export * from "./long-text";
export * from "./multiple-choice";
export * from "./short-text";
