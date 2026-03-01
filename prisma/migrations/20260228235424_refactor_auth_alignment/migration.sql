/*
  Warnings:

  - You are about to alter the column `weightKg` on the `FitnessProfile` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.
  - You are about to drop the column `userId` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FitnessProfile" DROP CONSTRAINT "FitnessProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserArea" DROP CONSTRAINT "UserArea_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_userId_fkey";

-- DropIndex
DROP INDEX "UserProfile_userId_key";

-- AlterTable
ALTER TABLE "FitnessProfile" ALTER COLUMN "weightKg" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "userId";

-- DropTable
DROP TABLE "User";
