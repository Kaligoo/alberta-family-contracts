CREATE TABLE "affiliate_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"commission_rate" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"total_clicks" integer DEFAULT 0 NOT NULL,
	"total_signups" integer DEFAULT 0 NOT NULL,
	"total_purchases" integer DEFAULT 0 NOT NULL,
	"total_commission" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"is_active" varchar(10) DEFAULT 'true' NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "affiliate_links_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "affiliate_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"affiliate_link_id" integer NOT NULL,
	"user_id" integer,
	"team_id" integer,
	"contract_id" integer,
	"action" varchar(20) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"referrer" text,
	"commission_amount" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupon_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"discount_type" varchar(20) NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"minimum_amount" numeric(10, 2),
	"usage_limit" integer,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"valid_from" timestamp DEFAULT now() NOT NULL,
	"valid_to" timestamp,
	"is_active" varchar(10) DEFAULT 'true' NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupon_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "coupon_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"coupon_code_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"contract_id" integer NOT NULL,
	"discount_amount" numeric(10, 2) NOT NULL,
	"original_amount" numeric(10, 2) NOT NULL,
	"final_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lawyers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"firm" varchar(255) NOT NULL,
	"phone" varchar(50),
	"address" text,
	"website" varchar(255),
	"party" varchar(20) NOT NULL,
	"is_active" varchar(10) DEFAULT 'true' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "user_pronouns" varchar(50);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "partner_pronouns" varchar(50);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "proposed_marriage_date" timestamp;--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "is_current_contract" varchar(10) DEFAULT 'false';--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "is_paid" varchar(10) DEFAULT 'false';--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "terms_accepted" varchar(10) DEFAULT 'false';--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "terms_accepted_at" timestamp;--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "affiliate_link_id" integer;--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "coupon_code_id" integer;--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "original_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "discount_amount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "final_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "schedule_income_employment" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "schedule_income_ei" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "schedule_income_workers_comp" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "schedule_income_investment" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "schedule_income_pension" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "schedule_income_government_assistance" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "schedule_income_self_employment" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "schedule_income_other" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "schedule_income_total_tax_return" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "schedule_assets_real_estate" json;--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "schedule_assets_vehicles" json;--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "schedule_assets_financial" json;--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "schedule_assets_pensions" json;--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "schedule_assets_business" json;--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "schedule_assets_other" json;--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "schedule_debts_secured" json;--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "schedule_debts_unsecured" json;--> statement-breakpoint
ALTER TABLE "family_contracts" ADD COLUMN "schedule_debts_other" json;--> statement-breakpoint
ALTER TABLE "affiliate_links" ADD CONSTRAINT "affiliate_links_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_tracking" ADD CONSTRAINT "affiliate_tracking_affiliate_link_id_affiliate_links_id_fk" FOREIGN KEY ("affiliate_link_id") REFERENCES "public"."affiliate_links"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_tracking" ADD CONSTRAINT "affiliate_tracking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_tracking" ADD CONSTRAINT "affiliate_tracking_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_tracking" ADD CONSTRAINT "affiliate_tracking_contract_id_family_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."family_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_codes" ADD CONSTRAINT "coupon_codes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_usage" ADD CONSTRAINT "coupon_usage_coupon_code_id_coupon_codes_id_fk" FOREIGN KEY ("coupon_code_id") REFERENCES "public"."coupon_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_usage" ADD CONSTRAINT "coupon_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_usage" ADD CONSTRAINT "coupon_usage_contract_id_family_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."family_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_contracts" ADD CONSTRAINT "family_contracts_affiliate_link_id_affiliate_links_id_fk" FOREIGN KEY ("affiliate_link_id") REFERENCES "public"."affiliate_links"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_contracts" ADD CONSTRAINT "family_contracts_coupon_code_id_coupon_codes_id_fk" FOREIGN KEY ("coupon_code_id") REFERENCES "public"."coupon_codes"("id") ON DELETE no action ON UPDATE no action;