import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260629142954 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "delivery_slot" drop constraint if exists "delivery_slot_code_unique";`);
    this.addSql(`create table if not exists "delivery_slot" ("id" text not null, "code" text not null, "region_id" text not null, "stock_location_id" text null, "start_at" timestamptz not null, "end_at" timestamptz not null, "capacity" integer not null, "status" text check ("status" in ('active', 'disabled')) not null default 'active', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "delivery_slot_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_delivery_slot_code_unique" ON "delivery_slot" ("code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_slot_region_id" ON "delivery_slot" ("region_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_slot_start_at" ON "delivery_slot" ("start_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_slot_end_at" ON "delivery_slot" ("end_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_slot_deleted_at" ON "delivery_slot" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "delivery_slot_reservation" ("id" text not null, "cart_id" text not null, "customer_id" text not null, "status" text check ("status" in ('active', 'released', 'expired')) not null default 'active', "expires_at" timestamptz not null, "slot_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "delivery_slot_reservation_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_slot_reservation_cart_id" ON "delivery_slot_reservation" ("cart_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_slot_reservation_customer_id" ON "delivery_slot_reservation" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_slot_reservation_expires_at" ON "delivery_slot_reservation" ("expires_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_slot_reservation_slot_id" ON "delivery_slot_reservation" ("slot_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_slot_reservation_deleted_at" ON "delivery_slot_reservation" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_slot_reservation_slot_id_status" ON "delivery_slot_reservation" ("slot_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_slot_reservation_cart_id_status" ON "delivery_slot_reservation" ("cart_id", "status") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "delivery_slot_reservation" add constraint "delivery_slot_reservation_slot_id_foreign" foreign key ("slot_id") references "delivery_slot" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "delivery_slot_reservation" drop constraint if exists "delivery_slot_reservation_slot_id_foreign";`);

    this.addSql(`drop table if exists "delivery_slot" cascade;`);

    this.addSql(`drop table if exists "delivery_slot_reservation" cascade;`);
  }

}
