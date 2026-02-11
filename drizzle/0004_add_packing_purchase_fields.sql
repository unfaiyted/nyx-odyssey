ALTER TABLE "packing_items" ADD COLUMN "priority" text DEFAULT 'normal';
ALTER TABLE "packing_items" ADD COLUMN "purchased" boolean DEFAULT false;
ALTER TABLE "packing_items" ADD COLUMN "purchase_url" text;
ALTER TABLE "packing_items" ADD COLUMN "estimated_price" numeric(8, 2);
ALTER TABLE "packing_items" ADD COLUMN "notes" text;
