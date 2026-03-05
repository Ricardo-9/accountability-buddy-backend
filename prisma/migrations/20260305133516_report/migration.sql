/*
  Warnings:

  - The values [LEASURE] on the enum `Domain` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ingredients` on the `Recipe` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[workoutPlanId,weekDay]` on the table `WorkoutPlanDay` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `target` to the `FinancialGoal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Recipe` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('WEEKLY', 'MONTHLY');

-- AlterEnum
BEGIN;
CREATE TYPE "Domain_new" AS ENUM ('WORK', 'HOBBIES', 'SLEEP', 'LEISURE');
ALTER TABLE "Task" ALTER COLUMN "domain" TYPE "Domain_new" USING ("domain"::text::"Domain_new");
ALTER TYPE "Domain" RENAME TO "Domain_old";
ALTER TYPE "Domain_new" RENAME TO "Domain";
DROP TYPE "public"."Domain_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "GoalDeposit" DROP CONSTRAINT "GoalDeposit_goalId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutExercise" DROP CONSTRAINT "WorkoutExercise_workoutPlanDayId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutPlanDay" DROP CONSTRAINT "WorkoutPlanDay_workoutPlanId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutTracking" DROP CONSTRAINT "WorkoutTracking_workoutPlanDayId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutTrackingExercise" DROP CONSTRAINT "WorkoutTrackingExercise_workoutTrackingId_fkey";

-- AlterTable
ALTER TABLE "FinanceAccount" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "FinancialGoal" ADD COLUMN     "categoryId" UUID,
ADD COLUMN     "target" DECIMAL(14,2) NOT NULL;

-- AlterTable
ALTER TABLE "FixedExpense" ADD COLUMN     "categoryId" UUID;

-- AlterTable
ALTER TABLE "GoalDeposit" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "ingredients",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "VariableExpense" ADD COLUMN     "categoryId" UUID;

-- AlterTable
ALTER TABLE "WaterLog" ALTER COLUMN "loggedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" UUID NOT NULL,
    "recipeId" UUID NOT NULL,
    "ingredientId" UUID NOT NULL,
    "quantityGrams" DECIMAL(8,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Income" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalProgressSnapshot" (
    "id" UUID NOT NULL,
    "goalId" UUID NOT NULL,
    "totalDeposited" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalProgressSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceBalanceHistory" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "balance" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinanceBalanceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialCategory" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeightLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "weightKg" DECIMAL(5,2) NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeightLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedReport" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "domain" "AccountabilityArea" NOT NULL,
    "type" "ReportType" NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "metricsJson" JSONB NOT NULL,
    "aiSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ingredient_userId_idx" ON "Ingredient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_userId_name_key" ON "Ingredient"("userId", "name");

-- CreateIndex
CREATE INDEX "RecipeIngredient_recipeId_idx" ON "RecipeIngredient"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeIngredient_recipeId_ingredientId_key" ON "RecipeIngredient"("recipeId", "ingredientId");

-- CreateIndex
CREATE INDEX "GoalProgressSnapshot_goalId_createdAt_idx" ON "GoalProgressSnapshot"("goalId", "createdAt");

-- CreateIndex
CREATE INDEX "FinanceBalanceHistory_userId_createdAt_idx" ON "FinanceBalanceHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "FinancialCategory_userId_idx" ON "FinancialCategory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialCategory_userId_name_key" ON "FinancialCategory"("userId", "name");

-- CreateIndex
CREATE INDEX "WeightLog_userId_loggedAt_idx" ON "WeightLog"("userId", "loggedAt");

-- CreateIndex
CREATE INDEX "GeneratedReport_userId_domain_type_idx" ON "GeneratedReport"("userId", "domain", "type");

-- CreateIndex
CREATE INDEX "GeneratedReport_userId_periodStart_idx" ON "GeneratedReport"("userId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedReport_userId_domain_type_periodStart_periodEnd_key" ON "GeneratedReport"("userId", "domain", "type", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "Diet_userId_idx" ON "Diet"("userId");

-- CreateIndex
CREATE INDEX "FinancialGoal_userId_idx" ON "FinancialGoal"("userId");

-- CreateIndex
CREATE INDEX "FinancialGoal_categoryId_idx" ON "FinancialGoal"("categoryId");

-- CreateIndex
CREATE INDEX "FixedExpense_userId_idx" ON "FixedExpense"("userId");

-- CreateIndex
CREATE INDEX "FixedExpense_categoryId_idx" ON "FixedExpense"("categoryId");

-- CreateIndex
CREATE INDEX "GoalDeposit_goalId_depositDate_idx" ON "GoalDeposit"("goalId", "depositDate");

-- CreateIndex
CREATE INDEX "Recipe_userId_idx" ON "Recipe"("userId");

-- CreateIndex
CREATE INDEX "Task_userId_scheduledDate_idx" ON "Task"("userId", "scheduledDate");

-- CreateIndex
CREATE INDEX "VariableExpense_userId_expenseDate_idx" ON "VariableExpense"("userId", "expenseDate");

-- CreateIndex
CREATE INDEX "VariableExpense_categoryId_idx" ON "VariableExpense"("categoryId");

-- CreateIndex
CREATE INDEX "WaterLog_userId_loggedAt_idx" ON "WaterLog"("userId", "loggedAt");

-- CreateIndex
CREATE INDEX "WorkoutExercise_workoutPlanDayId_idx" ON "WorkoutExercise"("workoutPlanDayId");

-- CreateIndex
CREATE INDEX "WorkoutPlan_userId_idx" ON "WorkoutPlan"("userId");

-- CreateIndex
CREATE INDEX "WorkoutPlanDay_workoutPlanId_idx" ON "WorkoutPlanDay"("workoutPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutPlanDay_workoutPlanId_weekDay_key" ON "WorkoutPlanDay"("workoutPlanId", "weekDay");

-- CreateIndex
CREATE INDEX "WorkoutTracking_workoutPlanDayId_createdAt_idx" ON "WorkoutTracking"("workoutPlanDayId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkoutTrackingExercise_workoutTrackingId_idx" ON "WorkoutTrackingExercise"("workoutTrackingId");

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialGoal" ADD CONSTRAINT "FinancialGoal_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinancialCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedExpense" ADD CONSTRAINT "FixedExpense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinancialCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariableExpense" ADD CONSTRAINT "VariableExpense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinancialCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalDeposit" ADD CONSTRAINT "GoalDeposit_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "FinancialGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalProgressSnapshot" ADD CONSTRAINT "GoalProgressSnapshot_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "FinancialGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanDay" ADD CONSTRAINT "WorkoutPlanDay_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_workoutPlanDayId_fkey" FOREIGN KEY ("workoutPlanDayId") REFERENCES "WorkoutPlanDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutTracking" ADD CONSTRAINT "WorkoutTracking_workoutPlanDayId_fkey" FOREIGN KEY ("workoutPlanDayId") REFERENCES "WorkoutPlanDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutTrackingExercise" ADD CONSTRAINT "WorkoutTrackingExercise_workoutTrackingId_fkey" FOREIGN KEY ("workoutTrackingId") REFERENCES "WorkoutTracking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
