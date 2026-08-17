import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260817100347 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "b2b_payment_terms_obligation" drop constraint if exists "b2b_payment_terms_obligation_external_invoice_id_unique";`);
    this.addSql(`alter table if exists "b2b_payment_terms_obligation" drop constraint if exists "b2b_payment_terms_obligation_order_id_unique";`);
    this.addSql(`alter table if exists "b2b_order_release" drop constraint if exists "b2b_order_release_release_idempotency_key_unique";`);
    this.addSql(`alter table if exists "b2b_order_release" drop constraint if exists "b2b_order_release_order_id_unique";`);
    this.addSql(`alter table if exists "b2b_order_finance_review" drop constraint if exists "b2b_order_finance_review_purchase_request_id_unique";`);
    this.addSql(`alter table if exists "b2b_order_finance_review" drop constraint if exists "b2b_order_finance_review_order_id_unique";`);
    this.addSql(`alter table if exists "b2b_finance_operator" drop constraint if exists "b2b_finance_operator_admin_user_id_unique";`);
    this.addSql(`alter table if exists "b2b_finance_account" drop constraint if exists "b2b_finance_account_organization_id_currency_code_unique";`);
    this.addSql(`create table if not exists "b2b_finance_account" ("id" text not null, "organization_id" text not null, "currency_code" text not null, "status" text check ("status" in ('pending', 'active', 'suspended', 'expired')) not null default 'pending', "payment_terms_code" text null, "approved_credit_limit" numeric null, "credit_reviewed_at" timestamptz null, "credit_valid_until" timestamptz null, "requires_manual_review" boolean not null default true, "external_finance_account_id" text null, "finance_source" text null, "raw_approved_credit_limit" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_finance_account_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_finance_account_organization_id" ON "b2b_finance_account" ("organization_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_finance_account_deleted_at" ON "b2b_finance_account" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b2b_finance_account_organization_id_currency_code_unique" ON "b2b_finance_account" ("organization_id", "currency_code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_finance_account_status_credit_valid_until" ON "b2b_finance_account" ("status", "credit_valid_until") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "b2b_finance_operator" ("id" text not null, "admin_user_id" text not null, "role" text check ("role" in ('viewer', 'approver', 'release_override')) not null, "active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_finance_operator_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b2b_finance_operator_admin_user_id_unique" ON "b2b_finance_operator" ("admin_user_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_finance_operator_deleted_at" ON "b2b_finance_operator" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_finance_operator_active_role" ON "b2b_finance_operator" ("active", "role") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "b2b_order_finance_review" ("id" text not null, "order_id" text not null, "purchase_request_id" text null, "organization_id" text not null, "finance_account_id" text null, "currency_code" text not null, "order_total" numeric not null, "status" text check ("status" in ('pending', 'approved_on_account', 'prepayment_required', 'rejected', 'manual_review', 'cancelled')) not null default 'pending', "payment_terms_code" text null, "external_credit_hold_id" text null, "external_invoice_id" text null, "decision_by_admin_user_id" text null, "decision_reason_code" text null, "decision_note" text null, "decision_snapshot" jsonb null, "reviewed_at" timestamptz null, "valid_until" timestamptz null, "raw_order_total" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_order_finance_review_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b2b_order_finance_review_order_id_unique" ON "b2b_order_finance_review" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b2b_order_finance_review_purchase_request_id_unique" ON "b2b_order_finance_review" ("purchase_request_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_order_finance_review_organization_id" ON "b2b_order_finance_review" ("organization_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_order_finance_review_finance_account_id" ON "b2b_order_finance_review" ("finance_account_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_order_finance_review_external_credit_hold_id" ON "b2b_order_finance_review" ("external_credit_hold_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_order_finance_review_external_invoice_id" ON "b2b_order_finance_review" ("external_invoice_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_order_finance_review_decision_by_admin_user_id" ON "b2b_order_finance_review" ("decision_by_admin_user_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_order_finance_review_valid_until" ON "b2b_order_finance_review" ("valid_until") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_order_finance_review_deleted_at" ON "b2b_order_finance_review" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_order_finance_review_organization_id_status" ON "b2b_order_finance_review" ("organization_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_order_finance_review_status_valid_until" ON "b2b_order_finance_review" ("status", "valid_until") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "b2b_order_release" ("id" text not null, "order_id" text not null, "finance_review_id" text not null, "status" text check ("status" in ('finance_pending', 'prepayment_required', 'eligible_for_release', 'released', 'blocked', 'cancelled')) not null default 'finance_pending', "release_idempotency_key" text not null, "released_by_admin_user_id" text null, "released_at" timestamptz null, "blocked_at" timestamptz null, "blocked_reason_code" text null, "blocked_reason_note" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_order_release_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b2b_order_release_order_id_unique" ON "b2b_order_release" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_order_release_finance_review_id" ON "b2b_order_release" ("finance_review_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b2b_order_release_release_idempotency_key_unique" ON "b2b_order_release" ("release_idempotency_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_order_release_deleted_at" ON "b2b_order_release" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_order_release_status" ON "b2b_order_release" ("status") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "b2b_payment_terms_obligation" ("id" text not null, "order_id" text not null, "finance_review_id" text not null, "currency_code" text not null, "amount_due" numeric not null, "payment_terms_code" text not null, "due_at" timestamptz not null, "status" text check ("status" in ('pending_invoice', 'open', 'partially_paid', 'paid', 'overdue', 'void')) not null default 'pending_invoice', "external_invoice_id" text null, "external_ledger_reference" text null, "opened_at" timestamptz null, "settled_at" timestamptz null, "raw_amount_due" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_payment_terms_obligation_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b2b_payment_terms_obligation_order_id_unique" ON "b2b_payment_terms_obligation" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_payment_terms_obligation_finance_review_id" ON "b2b_payment_terms_obligation" ("finance_review_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_payment_terms_obligation_due_at" ON "b2b_payment_terms_obligation" ("due_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b2b_payment_terms_obligation_external_invoice_id_unique" ON "b2b_payment_terms_obligation" ("external_invoice_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_payment_terms_obligation_deleted_at" ON "b2b_payment_terms_obligation" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_payment_terms_obligation_status_due_at" ON "b2b_payment_terms_obligation" ("status", "due_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "b2b_finance_account" cascade;`);

    this.addSql(`drop table if exists "b2b_finance_operator" cascade;`);

    this.addSql(`drop table if exists "b2b_order_finance_review" cascade;`);

    this.addSql(`drop table if exists "b2b_order_release" cascade;`);

    this.addSql(`drop table if exists "b2b_payment_terms_obligation" cascade;`);
  }

}
