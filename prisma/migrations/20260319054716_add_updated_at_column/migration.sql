/*
  Warnings:

  - A unique constraint covering the columns `[email,organizationId]` on the table `invitations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `invitations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invitations" ADD COLUMN     "invitedById" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "invitations_organizationId_idx" ON "invitations"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_email_organizationId_key" ON "invitations"("email", "organizationId");

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
