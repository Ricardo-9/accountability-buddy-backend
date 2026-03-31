/*
  Warnings:

  - You are about to drop the column `depositDate` on the `GoalDeposit` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "GoalDeposit_goalId_depositDate_idx";

-- AlterTable
ALTER TABLE "GoalDeposit" DROP COLUMN "depositDate";

-- CreateIndex
CREATE INDEX "GoalDeposit_goalId_idx" ON "GoalDeposit"("goalId");
