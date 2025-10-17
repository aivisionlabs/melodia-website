ALTER TABLE "song_categories" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "songs" ADD COLUMN "likes_count" integer DEFAULT 0;