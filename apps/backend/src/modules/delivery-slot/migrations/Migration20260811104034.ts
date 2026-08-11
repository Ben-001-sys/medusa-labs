import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260811104034 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "delivery_slot_reservation" drop constraint if exists "delivery_slot_reservation_status_check";`);

    this.addSql(`alter table if exists "delivery_slot_reservation" add column if not exists "order_id" text null, add column if not exists "checkout_started_at" timestamptz null, add column if not exists "checkout_expires_at" timestamptz null, add column if not exists "confirmed_at" timestamptz null;`);
    this.addSql(`alter table if exists "delivery_slot_reservation" add constraint "delivery_slot_reservation_status_check" check("status" in ('active', 'checkout_pending', 'confirmed', 'released', 'expired'));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_slot_reservation_order_id" ON "delivery_slot_reservation" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_slot_reservation_checkout_expires_at" ON "delivery_slot_reservation" ("checkout_expires_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "delivery_slot_reservation" drop constraint if exists "delivery_slot_reservation_status_check";`);

    this.addSql(`drop index if exists "IDX_delivery_slot_reservation_order_id";`);
    this.addSql(`drop index if exists "IDX_delivery_slot_reservation_checkout_expires_at";`);
    this.addSql(`alter table if exists "delivery_slot_reservation" drop column if exists "order_id", drop column if exists "checkout_started_at", drop column if exists "checkout_expires_at", drop column if exists "confirmed_at";`);

    this.addSql(`alter table if exists "delivery_slot_reservation" add constraint "delivery_slot_reservation_status_check" check("status" in ('active', 'released', 'expired'));`);
  }

}
