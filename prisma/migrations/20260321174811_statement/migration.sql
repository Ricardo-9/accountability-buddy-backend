/*
  Warnings:

  - Added the required column `change` to the `FinanceBalanceHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `FinanceBalanceHistory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BalanceChangeType" AS ENUM ('INITIAL_BALANCE', 'INCOME', 'EXPENSE');

-- AlterTable
ALTER TABLE "FinanceBalanceHistory" ADD COLUMN     "change" DECIMAL(14,2) NOT NULL,
ADD COLUMN     "type" "BalanceChangeType" NOT NULL;
