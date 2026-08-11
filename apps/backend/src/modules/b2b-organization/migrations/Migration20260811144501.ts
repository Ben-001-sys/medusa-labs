import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260811144501 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "b2b_cart_context" drop constraint if exists "b2b_cart_context_cart_id_unique";`);
    this.addSql(`alter table if exists "b2b_organization_member" drop constraint if exists "b2b_organization_member_organization_id_customer_id_unique";`);
    this.addSql(`alter table if exists "b2b_organization" drop constraint if exists "b2b_organization_handle_unique";`);
    this.addSql(`create table if not exists "b2b_organization" ("id" text not null, "legal_name" text not null, "display_name" text not null, "handle" text not null, "status" text check ("status" in ('pending', 'active', 'suspended', 'archived')) not null default 'pending', "sales_channel_id" text not null, "customer_group_id" text null, "default_region_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_organization_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b2b_organization_handle_unique" ON "b2b_organization" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_organization_sales_channel_id" ON "b2b_organization" ("sales_channel_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_organization_customer_group_id" ON "b2b_organization" ("customer_group_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_organization_default_region_id" ON "b2b_organization" ("default_region_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_organization_deleted_at" ON "b2b_organization" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_organization_sales_channel_id_status" ON "b2b_organization" ("sales_channel_id", "status") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "b2b_organization_member" ("id" text not null, "customer_id" text not null, "role" text check ("role" in ('owner', 'buyer', 'approver', 'finance', 'viewer')) not null default 'buyer', "status" text check ("status" in ('invited', 'active', 'suspended', 'removed')) not null default 'invited', "organization_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_organization_member_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_organization_member_customer_id" ON "b2b_organization_member" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_organization_member_organization_id" ON "b2b_organization_member" ("organization_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_organization_member_deleted_at" ON "b2b_organization_member" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b2b_organization_member_organization_id_customer_id_unique" ON "b2b_organization_member" ("organization_id", "customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_organization_member_customer_id_status" ON "b2b_organization_member" ("customer_id", "status") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "b2b_cart_context" ("id" text not null, "cart_id" text not null, "customer_id" text not null, "organization_id" text not null, "member_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_cart_context_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b2b_cart_context_cart_id_unique" ON "b2b_cart_context" ("cart_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_cart_context_customer_id" ON "b2b_cart_context" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_cart_context_organization_id" ON "b2b_cart_context" ("organization_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_cart_context_member_id" ON "b2b_cart_context" ("member_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_cart_context_deleted_at" ON "b2b_cart_context" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_cart_context_organization_id_customer_id" ON "b2b_cart_context" ("organization_id", "customer_id") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "b2b_organization_member" add constraint "b2b_organization_member_organization_id_foreign" foreign key ("organization_id") references "b2b_organization" ("id") on update cascade;`);

    this.addSql(`alter table if exists "b2b_cart_context" add constraint "b2b_cart_context_organization_id_foreign" foreign key ("organization_id") references "b2b_organization" ("id") on update cascade;`);
    this.addSql(`alter table if exists "b2b_cart_context" add constraint "b2b_cart_context_member_id_foreign" foreign key ("member_id") references "b2b_organization_member" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "b2b_organization_member" drop constraint if exists "b2b_organization_member_organization_id_foreign";`);

    this.addSql(`alter table if exists "b2b_cart_context" drop constraint if exists "b2b_cart_context_organization_id_foreign";`);

    this.addSql(`alter table if exists "b2b_cart_context" drop constraint if exists "b2b_cart_context_member_id_foreign";`);

    this.addSql(`drop table if exists "b2b_organization" cascade;`);

    this.addSql(`drop table if exists "b2b_organization_member" cascade;`);

    this.addSql(`drop table if exists "b2b_cart_context" cascade;`);
  }

}
