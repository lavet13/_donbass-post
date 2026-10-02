-- AlterTable
ALTER TABLE `orders_fromabroad` MODIFY `name_Otpravitelya` varchar(255) NOT NULL,
    MODIFY `TK` varchar(255) NOT NULL,
    MODIFY `citi_otprav` varchar(255) NOT NULL,
    MODIFY `phone_otprav` varchar(255) NOT NULL,
    MODIFY `kto_oplachivaet` varchar(255) NOT NULL,
    MODIFY `opisanie` varchar(1500) NOT NULL;

