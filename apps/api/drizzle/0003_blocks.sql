-- A form's `questions` list became `blocks` (questions plus layout blocks like page breaks).
UPDATE "forms" SET "draft" = ("draft" - 'questions') || jsonb_build_object('blocks', "draft"->'questions') WHERE "draft" ? 'questions';--> statement-breakpoint
UPDATE "form_versions" SET "definition" = ("definition" - 'questions') || jsonb_build_object('blocks', "definition"->'questions') WHERE "definition" ? 'questions';
