/*
  Warnings:

  - Made the column `manager_chat_id` on table `notifications_logs` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "notifications_logs" ALTER COLUMN "manager_chat_id" SET NOT NULL;
