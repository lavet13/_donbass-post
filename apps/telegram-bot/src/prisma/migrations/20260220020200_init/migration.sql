-- CreateTable
CREATE TABLE "telegram_users" (
    "id" TEXT NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "username" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "managers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "telegram_user_id" TEXT NOT NULL,

    CONSTRAINT "managers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "delivery_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "telegram_user_id" TEXT NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_types" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_notification_preferences" (
    "id" TEXT NOT NULL,
    "manager_id" TEXT NOT NULL,
    "notification_type_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manager_notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications_logs" (
    "id" TEXT NOT NULL,
    "manager_chat_id" BIGINT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "payload" JSONB,
    "success" BOOLEAN NOT NULL,
    "error_message" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_users_chat_id_key" ON "telegram_users"("chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "managers_telegram_user_id_key" ON "managers"("telegram_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "clients_telegram_user_id_key" ON "clients"("telegram_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_types_slug_key" ON "notification_types"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "manager_notification_preferences_manager_id_notification_ty_key" ON "manager_notification_preferences"("manager_id", "notification_type_id");

-- CreateIndex
CREATE INDEX "notifications_logs_manager_chat_id_idx" ON "notifications_logs"("manager_chat_id");

-- CreateIndex
CREATE INDEX "notifications_logs_notification_type_idx" ON "notifications_logs"("notification_type");

-- CreateIndex
CREATE INDEX "notifications_logs_sent_at_idx" ON "notifications_logs"("sent_at");

-- AddForeignKey
ALTER TABLE "managers" ADD CONSTRAINT "managers_telegram_user_id_fkey" FOREIGN KEY ("telegram_user_id") REFERENCES "telegram_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_telegram_user_id_fkey" FOREIGN KEY ("telegram_user_id") REFERENCES "telegram_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_notification_preferences" ADD CONSTRAINT "manager_notification_preferences_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "managers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_notification_preferences" ADD CONSTRAINT "manager_notification_preferences_notification_type_id_fkey" FOREIGN KEY ("notification_type_id") REFERENCES "notification_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
