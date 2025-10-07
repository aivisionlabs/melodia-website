ALTER TABLE "pricing_plans" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "pricing_plans" CASCADE;--> statement-breakpoint
ALTER TABLE "song_requests" ALTER COLUMN "languages" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "anonymous_id";