import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260814115559 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "b2b_organization" add column if not exists "approval_threshold" numeric null, add column if not exists "approval_currency_code" text null, add column if not exists "requires_merchant_quote" boolean not null default false, add column if not exists "quote_validity_days" integer not null default 7, add column if not exists "approval_policy_version" integer not null default 1, add column if not exists "raw_approval_threshold" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "b2b_organization" drop column if exists "approval_threshold", drop column if exists "approval_currency_code", drop column if exists "requires_merchant_quote", drop column if exists "quote_validity_days", drop column if exists "approval_policy_version", drop column if exists "raw_approval_threshold";`);
  }

}
