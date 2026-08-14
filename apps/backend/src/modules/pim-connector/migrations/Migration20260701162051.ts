import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260701162051 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "pim_product_sync" drop constraint if exists "pim_product_sync_source_external_product_id_unique";`);
    this.addSql(`alter table if exists "pim_event_receipt" drop constraint if exists "pim_event_receipt_source_event_id_unique";`);
    this.addSql(`create table if not exists "pim_event_receipt" ("id" text not null, "source" text not null, "event_id" text not null, "event_type" text not null, "external_product_id" text not null, "revision" integer not null, "payload_hash" text not null, "status" text check ("status" in ('received', 'applied', 'ignored', 'failed', 'manual_review')) not null default 'received', "attempt_count" integer not null default 0, "received_at" timestamptz not null, "processed_at" timestamptz null, "last_attempted_at" timestamptz null, "error_code" text null, "error_message" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pim_event_receipt_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pim_event_receipt_external_product_id" ON "pim_event_receipt" ("external_product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pim_event_receipt_revision" ON "pim_event_receipt" ("revision") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pim_event_receipt_received_at" ON "pim_event_receipt" ("received_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pim_event_receipt_deleted_at" ON "pim_event_receipt" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pim_event_receipt_source_event_id_unique" ON "pim_event_receipt" ("source", "event_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pim_event_receipt_source_external_product_id_revision" ON "pim_event_receipt" ("source", "external_product_id", "revision") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "pim_product_sync" ("id" text not null, "source" text not null, "external_product_id" text not null, "medusa_product_id" text null, "last_received_revision" integer not null default 0, "last_applied_revision" integer not null default 0, "last_payload_hash" text null, "latest_payload" jsonb not null, "status" text check ("status" in ('pending', 'applied', 'failed', 'manual_review')) not null default 'pending', "last_received_at" timestamptz null, "last_applied_at" timestamptz null, "last_error_code" text null, "last_error_message" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pim_product_sync_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pim_product_sync_medusa_product_id" ON "pim_product_sync" ("medusa_product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pim_product_sync_deleted_at" ON "pim_product_sync" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pim_product_sync_source_external_product_id_unique" ON "pim_product_sync" ("source", "external_product_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pim_event_receipt" cascade;`);

    this.addSql(`drop table if exists "pim_product_sync" cascade;`);
  }

}
