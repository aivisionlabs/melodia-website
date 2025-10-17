-- Add song_description column to songs if not exists
ALTER TABLE "songs" ADD COLUMN IF NOT EXISTS "song_description" text;

-- Create categories table if not exists
CREATE TABLE IF NOT EXISTS "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sequence" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_unique" ON "categories" ("name");
CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_unique" ON "categories" ("slug");

-- Create song_categories table if not exists
CREATE TABLE IF NOT EXISTS "song_categories" (
	"song_id" integer NOT NULL,
	"category_id" integer NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "song_categories_song_id_category_id_unique" ON "song_categories" ("song_id","category_id");