/*
  Warnings:

  - The primary key for the `Exercise` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `StudentExerciseStatus` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `StudentExerciseStatus` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "StudentExerciseStatus" DROP CONSTRAINT "StudentExerciseStatus_exercise_id_fkey";

-- DropForeignKey
ALTER TABLE "StudentExerciseStatus" DROP CONSTRAINT "StudentExerciseStatus_user_id_fkey";

-- AlterTable
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Exercise_id_seq";

-- AlterTable
ALTER TABLE "StudentExerciseStatus" DROP CONSTRAINT "StudentExerciseStatus_pkey",
DROP COLUMN "id",
ADD COLUMN     "last_code" TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "exercise_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "StudentExerciseStatus_pkey" PRIMARY KEY ("user_id", "exercise_id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'STUDENT',
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AddForeignKey
ALTER TABLE "StudentExerciseStatus" ADD CONSTRAINT "StudentExerciseStatus_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentExerciseStatus" ADD CONSTRAINT "StudentExerciseStatus_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
