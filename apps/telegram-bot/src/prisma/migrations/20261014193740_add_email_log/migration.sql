-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "message_id" TEXT,
    "error_message" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_logs_sent_at_idx" ON "email_logs"("sent_at");

-- CreateIndex
CREATE INDEX "email_logs_recipient_idx" ON "email_logs"("recipient");
