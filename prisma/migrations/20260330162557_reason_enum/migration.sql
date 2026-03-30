/*
  Warnings:

  - The values [GOAL] on the enum `BalanceChangeType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BalanceChangeType_new" AS ENUM ('INITIAL_BALANCE', 'INCOME', 'EXPENSE', 'GOAL_CREATE', 'GOAL_UPDATE');
ALTER TABLE "FinanceBalanceHistory" ALTER COLUMN "type" TYPE "BalanceChangeType_new" USING ("type"::text::"BalanceChangeType_new");
ALTER TYPE "BalanceChangeType" RENAME TO "BalanceChangeType_old";
ALTER TYPE "BalanceChangeType_new" RENAME TO "BalanceChangeType";
DROP TYPE "public"."BalanceChangeType_old";
COMMIT;
