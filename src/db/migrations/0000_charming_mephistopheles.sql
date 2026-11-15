CREATE TABLE "access_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dataset_id" uuid NOT NULL,
	"user_id" uuid,
	"role" varchar(50),
	"can_read" boolean DEFAULT true NOT NULL,
	"can_write" boolean DEFAULT false NOT NULL,
	"can_delete" boolean DEFAULT false NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dataset_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dataset_id" uuid NOT NULL,
	"field_key" varchar(100) NOT NULL,
	"field_label" varchar(150) NOT NULL,
	"field_type" varchar(50) NOT NULL,
	"is_searchable" boolean DEFAULT true NOT NULL,
	"is_filterable" boolean DEFAULT true NOT NULL,
	"is_sortable" boolean DEFAULT true NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dataset_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dataset_id" uuid NOT NULL,
	"record_number" integer NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"contact_email" varchar(255) NOT NULL,
	"status" varchar(50) NOT NULL,
	"country" varchar(100) NOT NULL,
	"industry" varchar(100) NOT NULL,
	"revenue" numeric(14, 2) NOT NULL,
	"risk_score" numeric(5, 2) NOT NULL,
	"department" varchar(100) NOT NULL,
	"contract_tier" varchar(50) NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "datasets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"data_source" varchar(150) NOT NULL,
	"total_records" integer DEFAULT 0 NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "record_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_record_id" uuid NOT NULL,
	"target_record_id" uuid NOT NULL,
	"relationship_type" varchar(100) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"dataset_id" uuid NOT NULL,
	"created_by_id" uuid NOT NULL,
	"search_conditions" jsonb,
	"filters" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sorting_config" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"visible_columns" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_shared" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"dataset_id" uuid NOT NULL,
	"query_text" text DEFAULT '' NOT NULL,
	"filters" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"results_count" integer DEFAULT 0 NOT NULL,
	"execution_time_ms" numeric(8, 2) DEFAULT '0' NOT NULL,
	"search_method" varchar(50) DEFAULT 'FULL_TEXT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"theme" varchar(50) DEFAULT 'dark' NOT NULL,
	"table_density" varchar(50) DEFAULT 'compact' NOT NULL,
	"default_page_size" integer DEFAULT 25 NOT NULL,
	"preferred_view_id" uuid,
	"custom_settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(50) DEFAULT 'DATA_ANALYST' NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "access_permissions" ADD CONSTRAINT "access_permissions_dataset_id_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."datasets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_permissions" ADD CONSTRAINT "access_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dataset_fields" ADD CONSTRAINT "dataset_fields_dataset_id_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."datasets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dataset_records" ADD CONSTRAINT "dataset_records_dataset_id_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."datasets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "record_relationships" ADD CONSTRAINT "record_relationships_source_record_id_dataset_records_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."dataset_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "record_relationships" ADD CONSTRAINT "record_relationships_target_record_id_dataset_records_id_fk" FOREIGN KEY ("target_record_id") REFERENCES "public"."dataset_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_views" ADD CONSTRAINT "saved_views_dataset_id_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."datasets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_views" ADD CONSTRAINT "saved_views_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_dataset_id_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."datasets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_preferred_view_id_saved_views_id_fk" FOREIGN KEY ("preferred_view_id") REFERENCES "public"."saved_views"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "access_perm_dataset_user_idx" ON "access_permissions" USING btree ("dataset_id","user_id");--> statement-breakpoint
CREATE INDEX "access_perm_dataset_role_idx" ON "access_permissions" USING btree ("dataset_id","role");--> statement-breakpoint
CREATE INDEX "dataset_fields_dataset_id_idx" ON "dataset_fields" USING btree ("dataset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dataset_fields_dataset_field_idx" ON "dataset_fields" USING btree ("dataset_id","field_key");--> statement-breakpoint
CREATE INDEX "dataset_records_dataset_id_idx" ON "dataset_records" USING btree ("dataset_id");--> statement-breakpoint
CREATE INDEX "dataset_records_status_idx" ON "dataset_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "dataset_records_country_idx" ON "dataset_records" USING btree ("country");--> statement-breakpoint
CREATE INDEX "dataset_records_industry_idx" ON "dataset_records" USING btree ("industry");--> statement-breakpoint
CREATE INDEX "dataset_records_revenue_idx" ON "dataset_records" USING btree ("revenue");--> statement-breakpoint
CREATE INDEX "dataset_records_created_at_idx" ON "dataset_records" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "dataset_records_composite_filter_idx" ON "dataset_records" USING btree ("dataset_id","status","country");--> statement-breakpoint
CREATE INDEX "dataset_records_dataset_created_idx" ON "dataset_records" USING btree ("dataset_id","created_at");--> statement-breakpoint
CREATE INDEX "dataset_records_dataset_revenue_idx" ON "dataset_records" USING btree ("dataset_id","revenue");--> statement-breakpoint
CREATE INDEX "dataset_records_company_trgm_idx" ON "dataset_records" USING gin (("company_name" gin_trgm_ops));--> statement-breakpoint
CREATE INDEX "datasets_category_idx" ON "datasets" USING btree ("category");--> statement-breakpoint
CREATE INDEX "datasets_created_by_idx" ON "datasets" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "record_rel_source_idx" ON "record_relationships" USING btree ("source_record_id");--> statement-breakpoint
CREATE INDEX "record_rel_target_idx" ON "record_relationships" USING btree ("target_record_id");--> statement-breakpoint
CREATE INDEX "saved_views_dataset_id_idx" ON "saved_views" USING btree ("dataset_id");--> statement-breakpoint
CREATE INDEX "saved_views_created_by_idx" ON "saved_views" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "saved_views_shared_idx" ON "saved_views" USING btree ("is_shared");--> statement-breakpoint
CREATE INDEX "search_history_user_idx" ON "search_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "search_history_dataset_idx" ON "search_history" USING btree ("dataset_id");--> statement-breakpoint
CREATE INDEX "search_history_created_at_idx" ON "search_history" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_preferences_user_id_idx" ON "user_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");