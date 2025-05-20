-- CreateTable
CREATE TABLE "Exercise" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "example_input" TEXT NOT NULL,
    "example_output" TEXT NOT NULL,
    "problem_description" TEXT NOT NULL,
    "problem_tag" TEXT NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentExerciseStatus" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "exercise_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "submit_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentExerciseStatus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StudentExerciseStatus" ADD CONSTRAINT "StudentExerciseStatus_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentExerciseStatus" ADD CONSTRAINT "StudentExerciseStatus_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
