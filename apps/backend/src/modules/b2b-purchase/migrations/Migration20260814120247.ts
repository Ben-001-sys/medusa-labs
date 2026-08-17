import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260814120247 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "b2b_purchase_approval" drop constraint if exists "b2b_purchase_approval_purchase_request_id_approver_member_id_unique";`);
    this.addSql(`alter table if exists "b2b_purchase_request" drop constraint if exists "b2b_purchase_request_expires_at_unique";`);
    this.addSql(`alter table if exists "b2b_purchase_request" drop constraint if exists "b2b_purchase_request_order_id_unique";`);
    this.addSql(`alter table if exists "b2b_purchase_request" drop constraint if exists "b2b_purchase_request_order_change_id_unique";`);
    this.addSql(`alter table if exists "b2b_purchase_request" drop constraint if exists "b2b_purchase_request_draft_order_id_unique";`);
    this.addSql(`alter table if exists "b2b_purchase_request" drop constraint if exists "b2b_purchase_request_reference_unique";`);
    this.addSql(`create table if not exists "b2b_purchase_request" ("id" text not null, "reference" text not null, "organization_id" text not null, "requester_member_id" text not null, "customer_id" text not null, "cart_id" text not null, "draft_order_id" text null, "order_change_id" text null, "order_id" text null, "status" text check ("status" in ('pending_internal_approval', 'pending_merchant_quote', 'pending_buyer_acceptance', 'rejected', 'cancelled', 'expired', 'converted')) not null default 'pending_internal_approval', "currency_code" text not null, "requested_total" numeric not null, "purchase_order_number" text null, "cart_snapshot" jsonb not null, "policy_snapshot" jsonb not null, "submitted_at" timestamptz not null, "expires_at" timestamptz null, "approved_at" timestamptz null, "quoted_at" timestamptz null, "accepted_at" timestamptz null, "rejected_at" timestamptz null, "cancelled_at" timestamptz null, "raw_requested_total" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_purchase_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b2b_purchase_request_reference_unique" ON "b2b_purchase_request" ("reference") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_purchase_request_organization_id" ON "b2b_purchase_request" ("organization_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_purchase_request_requester_member_id" ON "b2b_purchase_request" ("requester_member_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_purchase_request_customer_id" ON "b2b_purchase_request" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_purchase_request_cart_id" ON "b2b_purchase_request" ("cart_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b2b_purchase_request_draft_order_id_unique" ON "b2b_purchase_request" ("draft_order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b2b_purchase_request_order_change_id_unique" ON "b2b_purchase_request" ("order_change_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b2b_purchase_request_order_id_unique" ON "b2b_purchase_request" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_purchase_request_submitted_at" ON "b2b_purchase_request" ("submitted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b2b_purchase_request_expires_at_unique" ON "b2b_purchase_request" ("expires_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_purchase_request_deleted_at" ON "b2b_purchase_request" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_purchase_request_organization_id_status" ON "b2b_purchase_request" ("organization_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_purchase_request_customer_id_status" ON "b2b_purchase_request" ("customer_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_purchase_request_status_expires_at" ON "b2b_purchase_request" ("status", "expires_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "b2b_purchase_approval" ("id" text not null, "approver_member_id" text not null, "decision" text check ("decision" in ('approved', 'rejected')) not null, "note" text null, "decided_at" timestamptz not null, "purchase_request_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_purchase_approval_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_purchase_approval_approver_member_id" ON "b2b_purchase_approval" ("approver_member_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_purchase_approval_decided_at" ON "b2b_purchase_approval" ("decided_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_purchase_approval_purchase_request_id" ON "b2b_purchase_approval" ("purchase_request_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_purchase_approval_deleted_at" ON "b2b_purchase_approval" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b2b_purchase_approval_purchase_request_id_approver_member_id_unique" ON "b2b_purchase_approval" ("purchase_request_id", "approver_member_id") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "b2b_purchase_approval" add constraint "b2b_purchase_approval_purchase_request_id_foreign" foreign key ("purchase_request_id") references "b2b_purchase_request" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "b2b_purchase_approval" drop constraint if exists "b2b_purchase_approval_purchase_request_id_foreign";`);

    this.addSql(`drop table if exists "b2b_purchase_request" cascade;`);

    this.addSql(`drop table if exists "b2b_purchase_approval" cascade;`);
  }

}
