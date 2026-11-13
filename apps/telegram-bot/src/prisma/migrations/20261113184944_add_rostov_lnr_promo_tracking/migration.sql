-- CreateEnum
CREATE TYPE "promo_order_status" AS ENUM ('READY_TO_SHIP', 'AWAITING_DELIVERY', 'NEEDS_CLARIFICATION', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "promo_source" AS ENUM ('ALI', 'IM');

-- CreateTable
CREATE TABLE "rostov_shipments" (
    "id" SERIAL NOT NULL,
    "waybill_number" TEXT NOT NULL,
    "arrival_date" DATE NOT NULL,
    "dispatch_date" DATE,
    "carrier" TEXT,
    "carrier_track_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rostov_shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lnr_shipments" (
    "id" SERIAL NOT NULL,
    "waybill_number" TEXT NOT NULL,
    "handover_date" DATE,
    "delivery_address" TEXT,
    "declaration_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lnr_shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_orders" (
    "id" SERIAL NOT NULL,
    "promo_codes" TEXT[],
    "promo_code_raw" TEXT NOT NULL,
    "amount_paid" DECIMAL(12,2),
    "payment_date" DATE,
    "track_number" TEXT,
    "status" "promo_order_status",
    "source" "promo_source" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rostov_shipments_waybill_number_idx" ON "rostov_shipments"("waybill_number");

-- CreateIndex
CREATE INDEX "lnr_shipments_waybill_number_idx" ON "lnr_shipments"("waybill_number");
