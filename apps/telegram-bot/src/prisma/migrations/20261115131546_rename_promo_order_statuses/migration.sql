/*
  Warnings:

  - The values [READY_TO_SHIP,AWAITING_DELIVERY,NEEDS_CLARIFICATION] on the enum `promo_order_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "promo_order_status_new" AS ENUM ('ORDER_PLACED', 'SHIPPED_BY_STORE', 'PROCESSED_IN_ROSTOV', 'DELIVERED', 'CANCELLED');
ALTER TABLE "promo_orders" ALTER COLUMN "status" TYPE "promo_order_status_new" USING ("status"::text::"promo_order_status_new");
ALTER TYPE "promo_order_status" RENAME TO "promo_order_status_old";
ALTER TYPE "promo_order_status_new" RENAME TO "promo_order_status";
DROP TYPE "public"."promo_order_status_old";
COMMIT;
