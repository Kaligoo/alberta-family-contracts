CREATE TABLE "templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"size" integer NOT NULL,
	"is_active" varchar(10) DEFAULT 'false' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
