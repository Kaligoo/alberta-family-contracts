CREATE TABLE "family_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"user_full_name" varchar(255),
	"partner_full_name" varchar(255),
	"user_job_title" varchar(255),
	"partner_job_title" varchar(255),
	"user_income" numeric(12, 2),
	"partner_income" numeric(12, 2),
	"children" json,
	"contract_type" varchar(50) DEFAULT 'cohabitation' NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"residence_address" text,
	"residence_ownership" varchar(50),
	"expense_split_type" varchar(50),
	"custom_expense_split" json,
	"additional_clauses" text,
	"notes" text,
	"document_generated" timestamp,
	"document_path" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "family_contracts" ADD CONSTRAINT "family_contracts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_contracts" ADD CONSTRAINT "family_contracts_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;