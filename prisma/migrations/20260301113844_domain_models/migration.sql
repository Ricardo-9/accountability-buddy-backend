/*
  Warnings:

  - Made the column `birthDate` on table `UserProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Domain" AS ENUM ('WORK', 'HOBBIES', 'SLEEP', 'LEASURE');

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "phone" TEXT,
ALTER COLUMN "birthDate" SET NOT NULL,
ALTER COLUMN "birthDate" SET DATA TYPE DATE;

-- CreateTable
CREATE TABLE "NutritionProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "goal" TEXT,
    "heightCm" INTEGER,
    "weightKg" DECIMAL(5,2),
    "preference" TEXT,
    "allergies" TEXT,
    "waterGoalLiters" DECIMAL(4,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diet" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "structure" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Diet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "ingredients" TEXT NOT NULL,
    "preparation" TEXT NOT NULL,
    "notes" TEXT,
    "source" "RecipeSource" NOT NULL,
    "editedByUser" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "amountMl" INTEGER NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaterLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceAccount" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "balance" DECIMAL(14,2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialGoal" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "durationValue" INTEGER NOT NULL,
    "durationUnit" "DurationUnit" NOT NULL,
    "style" "InvestorStyle" NOT NULL,
    "initialAmount" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedExpense" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyAmount" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixedExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariableExpense" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "expenseDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VariableExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalDeposit" (
    "id" UUID NOT NULL,
    "goalId" UUID NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "depositDate" DATE NOT NULL,

    CONSTRAINT "GoalDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "domain" "Domain" NOT NULL,
    "scheduledDate" DATE NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutPlan" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutPlanDay" (
    "id" UUID NOT NULL,
    "workoutPlanId" UUID NOT NULL,
    "weekDay" "WeekDay" NOT NULL,

    CONSTRAINT "WorkoutPlanDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutExercise" (
    "id" UUID NOT NULL,
    "workoutPlanDayId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "repsMin" INTEGER NOT NULL,
    "repsMax" INTEGER NOT NULL,
    "restSeconds" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "WorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutTracking" (
    "id" UUID NOT NULL,
    "workoutPlanDayId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutTrackingExercise" (
    "id" UUID NOT NULL,
    "workoutTrackingId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "maxWeight" DECIMAL(6,2),
    "maxSets" INTEGER,
    "maxReps" INTEGER,
    "restSeconds" INTEGER,
    "notes" TEXT,

    CONSTRAINT "WorkoutTrackingExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NutritionProfile_userId_key" ON "NutritionProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceAccount_userId_key" ON "FinanceAccount"("userId");

-- AddForeignKey
ALTER TABLE "GoalDeposit" ADD CONSTRAINT "GoalDeposit_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "FinancialGoal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanDay" ADD CONSTRAINT "WorkoutPlanDay_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_workoutPlanDayId_fkey" FOREIGN KEY ("workoutPlanDayId") REFERENCES "WorkoutPlanDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutTracking" ADD CONSTRAINT "WorkoutTracking_workoutPlanDayId_fkey" FOREIGN KEY ("workoutPlanDayId") REFERENCES "WorkoutPlanDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutTrackingExercise" ADD CONSTRAINT "WorkoutTrackingExercise_workoutTrackingId_fkey" FOREIGN KEY ("workoutTrackingId") REFERENCES "WorkoutTracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
