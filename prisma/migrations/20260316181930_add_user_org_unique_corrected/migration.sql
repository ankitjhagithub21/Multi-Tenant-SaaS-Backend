/*
  Warnings:

  - A unique constraint covering the columns `[id,organizationId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_id_organizationId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "users_id_organizationId_key" ON "users"("id", "organizationId");
