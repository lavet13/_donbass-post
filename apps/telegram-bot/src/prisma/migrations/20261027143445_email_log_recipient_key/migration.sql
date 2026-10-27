-- AlterTable
ALTER TABLE "email_logs" ADD COLUMN "recipient_key" TEXT;                -- nullable first, so existing rows are allowed
UPDATE "email_logs" SET "recipient_key" = lower("recipient");            -- fill old rows (they're past the hour anyway)
ALTER TABLE "email_logs" ALTER COLUMN "recipient_key" SET NOT NULL;      -- now enforce it

-- CreateIndex
CREATE INDEX "email_logs_recipient_key_sent_at_idx" ON "email_logs"("recipient_key", "sent_at");
