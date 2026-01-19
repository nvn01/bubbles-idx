/*
  Warnings:

  - You are about to drop the column `change` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `changePercent` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `high` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `low` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `open` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `prevClose` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `volume` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the `StockHistory` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `name` on table `Stock` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "change",
DROP COLUMN "changePercent",
DROP COLUMN "high",
DROP COLUMN "low",
DROP COLUMN "open",
DROP COLUMN "prevClose",
DROP COLUMN "price",
DROP COLUMN "volume",
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "StockHistory";

-- CreateTable
CREATE TABLE "stock_history" (
    "id" TEXT NOT NULL,
    "stock_id" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "volume" BIGINT,

    CONSTRAINT "stock_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stock_history_stock_id_ts_idx" ON "stock_history"("stock_id", "ts");

-- CreateIndex
CREATE INDEX "stock_history_ts_idx" ON "stock_history"("ts");

-- CreateIndex
CREATE UNIQUE INDEX "stock_history_stock_id_ts_key" ON "stock_history"("stock_id", "ts");

-- AddForeignKey
ALTER TABLE "stock_history" ADD CONSTRAINT "stock_history_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
