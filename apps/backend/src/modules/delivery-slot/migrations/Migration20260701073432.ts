import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260701073432 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "delivery_slot_reservation" add column if not exists "expired_at" timestamptz null;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_slot_reservation_expired_at" ON "delivery_slot_reservation" ("expired_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_delivery_slot_reservation_expired_at";`);
    this.addSql(`alter table if exists "delivery_slot_reservation" drop column if exists "expired_at";`);
  }

}
