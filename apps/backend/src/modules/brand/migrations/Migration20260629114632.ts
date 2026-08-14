import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260629114632 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "brand" drop constraint if exists "brand_handle_unique";`);
    this.addSql(`alter table if exists "brand" add column if not exists "handle" text null;`);
    this.addSql(`
      update "brand"
      set "handle" = trim(both '-' from regexp_replace(lower("name"), '[^a-z0-9]+', '-', 'g'))
      where "handle" is null;
    `);
    this.addSql(`
      update "brand"
      set "handle" = concat("handle", '-', substr("id", 1, 8))
      where "id" in (
        select "id"
        from (
          select "id", row_number() over (partition by "handle" order by "created_at") as row_num
          from "brand"
          where "deleted_at" is null
        ) as duplicates
        where row_num > 1
      );
    `);
    this.addSql(`alter table if exists "brand" alter column "handle" set not null;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_brand_handle_unique" ON "brand" ("handle") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_brand_handle_unique";`);
    this.addSql(`alter table if exists "brand" drop column if exists "handle";`);
  }

}
