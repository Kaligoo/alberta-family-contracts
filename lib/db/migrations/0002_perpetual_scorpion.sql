ALTER TABLE "family_contracts" ADD COLUMN "user_first_name" varchar(100);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "partner_first_name" varchar(100);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "user_age" integer;--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "partner_age" integer;--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "cohab_date" timestamp;--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "user_email" varchar(255);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "user_phone" varchar(50);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "user_address" text;--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "partner_email" varchar(255);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "partner_phone" varchar(50);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "partner_address" text;