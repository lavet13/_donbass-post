/*
  Warnings:

  - You are about to drop the `manager_notification_preferences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `managers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "manager_notification_preferences" DROP CONSTRAINT "manager_notification_preferences_manager_id_fkey";

-- DropForeignKey
ALTER TABLE "manager_notification_preferences" DROP CONSTRAINT "manager_notification_preferences_notification_type_id_fkey";

-- DropForeignKey
ALTER TABLE "managers" DROP CONSTRAINT "managers_telegram_user_id_fkey";

-- DropTable
DROP TABLE "manager_notification_preferences";

-- DropTable
DROP TABLE "managers";
