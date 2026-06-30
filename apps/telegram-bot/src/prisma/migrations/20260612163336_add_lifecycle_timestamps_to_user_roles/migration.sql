-- DropIndex
DROP INDEX "user_roles_user_id_idx";

-- AlterTable
ALTER TABLE "user_roles" ADD COLUMN     "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "revoked_at" TIMESTAMP(3);
