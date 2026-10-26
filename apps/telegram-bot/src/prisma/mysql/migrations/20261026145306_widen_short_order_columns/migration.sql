-- AlterTable
ALTER TABLE `mobile_office` MODIFY `opisanie` VARCHAR(1500) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;

-- AlterTable
ALTER TABLE `orders_iz-rf` MODIFY `links` VARCHAR(2500) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    MODIFY `amount` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    MODIFY `mail` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;
