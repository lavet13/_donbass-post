-- CreateTable
CREATE TABLE "cargo_shipments" (
    "id" SERIAL NOT NULL,
    "reception_date" TEXT,
    "departure_city" TEXT,
    "destination_city" TEXT,
    "waybill_number" TEXT NOT NULL,
    "track_number" TEXT,
    "departure_date" TEXT,

    CONSTRAINT "cargo_shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargo_warehouse_movements" (
    "id" SERIAL NOT NULL,
    "waybill_number" TEXT NOT NULL,
    "departure_city" TEXT,
    "destination_city" TEXT,
    "arrival_date" TEXT,
    "departure_date" TEXT,
    "warehouse_point" TEXT,

    CONSTRAINT "cargo_warehouse_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargo_delivery_records" (
    "id" SERIAL NOT NULL,
    "arrival_date" TEXT,
    "waybill_number" TEXT NOT NULL,
    "delivery_date" TEXT,
    "delivery_city" TEXT,

    CONSTRAINT "cargo_delivery_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cargo_shipments_waybill_number_idx" ON "cargo_shipments"("waybill_number");

-- CreateIndex
CREATE INDEX "cargo_warehouse_movements_waybill_number_idx" ON "cargo_warehouse_movements"("waybill_number");

-- CreateIndex
CREATE INDEX "cargo_delivery_records_waybill_number_idx" ON "cargo_delivery_records"("waybill_number");
