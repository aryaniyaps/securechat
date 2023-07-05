-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailChange" TEXT,
ADD COLUMN     "emailChangeSentAt" TIMESTAMP(3),
ADD COLUMN     "emailChangeToken" TEXT;
