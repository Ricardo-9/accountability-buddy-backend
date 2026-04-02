/*
  Warnings:

  - A unique constraint covering the columns `[userId,name,deletedAt]` on the table `FinancialCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "FinancialCategory_userId_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "FinancialCategory_userId_name_deletedAt_key" ON "FinancialCategory"("userId", "name", "deletedAt");
