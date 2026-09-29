-- CreateTable
CREATE TABLE `City` (
    `City` VARCHAR(14) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TZ` (
    `Country3` VARCHAR(9) NULL,
    `City` VARCHAR(14) NULL,
    `Country` VARCHAR(9) NULL,
    `Country2` VARCHAR(9) NULL,
    `City2` VARCHAR(14) NULL,
    `TZ` VARCHAR(3) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categoriya` (
    `categoriya` VARCHAR(33) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dostbezgr` (
    `Country` VARCHAR(9) NULL,
    `Country2` VARCHAR(9) NULL,
    `TZ` INTEGER NULL,
    `pismo` INTEGER NULL,
    `Doc` INTEGER NULL,
    `Doc2` INTEGER NULL,
    `1` INTEGER NULL,
    `2` INTEGER NULL,
    `3` INTEGER NULL,
    `4` INTEGER NULL,
    `5` INTEGER NULL,
    `6` INTEGER NULL,
    `7` INTEGER NULL,
    `8` INTEGER NULL,
    `9` INTEGER NULL,
    `10` INTEGER NULL,
    `11` INTEGER NULL,
    `12` INTEGER NULL,
    `13` INTEGER NULL,
    `14` INTEGER NULL,
    `15` INTEGER NULL,
    `16` VARCHAR(5) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ds` (
    `"Country2` VARCHAR(10) NULL,
    `TZ` INTEGER NULL,
    `1000` INTEGER NULL,
    `2000` INTEGER NULL,
    `3000` INTEGER NULL,
    `4000` INTEGER NULL,
    `5000` INTEGER NULL,
    `7500` INTEGER NULL,
    `10000` INTEGER NULL,
    `15000` INTEGER NULL,
    `20000` INTEGER NULL,
    `25000` INTEGER NULL,
    `27500` INTEGER NULL,
    `30000` INTEGER NULL,
    `35000` INTEGER NULL,
    `40000` INTEGER NULL,
    `45000` INTEGER NULL,
    `50000` INTEGER NULL,
    `55000` INTEGER NULL,
    `60000` INTEGER NULL,
    `70000` INTEGER NULL,
    `80000` INTEGER NULL,
    `90000` INTEGER NULL,
    `100000` INTEGER NULL,
    `"` VARCHAR(1) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ekspgr` (
    `id` INTEGER NULL,
    `opisanie` VARCHAR(131) NULL,
    `priznak` VARCHAR(8) NULL,
    `sht` VARCHAR(2) NULL,
    `fact` VARCHAR(3) NULL,
    `obiem` VARCHAR(3) NULL,
    `1` INTEGER NULL,
    `2` INTEGER NULL,
    `3` VARCHAR(6) NULL,
    `4` VARCHAR(6) NULL,
    `5` VARCHAR(6) NULL,
    `6` VARCHAR(6) NULL,
    `7` VARCHAR(6) NULL,
    `8` VARCHAR(6) NULL,
    `9` VARCHAR(6) NULL,
    `10` VARCHAR(6) NULL,
    `11` VARCHAR(6) NULL,
    `12` VARCHAR(6) NULL,
    `13` VARCHAR(6) NULL,
    `14` VARCHAR(6) NULL,
    `15` VARCHAR(6) NULL,
    `16` VARCHAR(6) NULL,
    `17` VARCHAR(6) NULL,
    `18` VARCHAR(6) NULL,
    `19` VARCHAR(6) NULL,
    `20` VARCHAR(6) NULL,
    `21` VARCHAR(6) NULL,
    `22` VARCHAR(6) NULL,
    `23` VARCHAR(6) NULL,
    `24` VARCHAR(6) NULL,
    `25` VARCHAR(6) NULL,
    `26` VARCHAR(6) NULL,
    `27` VARCHAR(6) NULL,
    `28` VARCHAR(6) NULL,
    `29` VARCHAR(6) NULL,
    `30` VARCHAR(6) NULL,
    `31` VARCHAR(6) NULL,
    `32` VARCHAR(6) NULL,
    `33` VARCHAR(6) NULL,
    `34` VARCHAR(6) NULL,
    `35` VARCHAR(6) NULL,
    `36` VARCHAR(6) NULL,
    `37` VARCHAR(6) NULL,
    `38` VARCHAR(6) NULL,
    `39` VARCHAR(7) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mobile_office` (
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `departament` VARCHAR(255) NOT NULL,
    `opisanie` VARCHAR(255) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mobile_office_krym` (
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `departament` VARCHAR(255) NOT NULL,
    `opisanie` VARCHAR(255) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mobile_office_lnr` (
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `departament` VARCHAR(255) NOT NULL,
    `opisanie` VARCHAR(255) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mobile_phone` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `city` VARCHAR(30) NOT NULL,
    `adress` VARCHAR(255) NOT NULL,
    `number` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_aist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `tip_gruza` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `mail` VARCHAR(255) NOT NULL,
    `departament` VARCHAR(255) NOT NULL,
    `gruz` VARCHAR(255) NOT NULL,
    `ves` VARCHAR(255) NOT NULL,
    `trek` VARCHAR(255) NOT NULL,
    `platej` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_aliexpress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `passport` VARCHAR(12) NOT NULL,
    `vidan` VARCHAR(255) NOT NULL,
    `kogda` VARCHAR(10) NOT NULL,
    `pasldnr` VARCHAR(99) NOT NULL,
    `departament` VARCHAR(255) NOT NULL,
    `links` VARCHAR(2500) NOT NULL,
    `amount` VARCHAR(255) NOT NULL,
    `name_Otpravitelya` VARCHAR(20) NOT NULL,
    `TK` VARCHAR(20) NOT NULL,
    `track_number` VARCHAR(255) NOT NULL,
    `mail` VARCHAR(255) NOT NULL,
    `citi_otprav` VARCHAR(20) NOT NULL,
    `phone_otprav` VARCHAR(20) NOT NULL,
    `kto_oplachivaet` VARCHAR(20) NOT NULL,
    `opisanie` VARCHAR(20) NOT NULL,
    `VIP` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_aliexpress_krym` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `passport` VARCHAR(20) NOT NULL,
    `vidan` VARCHAR(20) NOT NULL,
    `kogda` VARCHAR(20) NOT NULL,
    `pasldnr` VARCHAR(20) NOT NULL,
    `departament` VARCHAR(255) NOT NULL,
    `links` VARCHAR(2500) NOT NULL,
    `amount` VARCHAR(255) NOT NULL,
    `name_Otpravitelya` VARCHAR(20) NOT NULL,
    `TK` VARCHAR(20) NOT NULL,
    `track_number` VARCHAR(255) NOT NULL,
    `mail` VARCHAR(255) NOT NULL,
    `citi_otprav` VARCHAR(20) NOT NULL,
    `phone_otprav` VARCHAR(20) NOT NULL,
    `kto_oplachivaet` VARCHAR(20) NOT NULL,
    `opisanie` VARCHAR(20) NOT NULL,
    `VIP` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_banki-rf` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `timechek` VARCHAR(255) NOT NULL,
    `amount` VARCHAR(255) NOT NULL,
    `metod` VARCHAR(255) NOT NULL,
    `dkarta` VARCHAR(255) NOT NULL,
    `nameP` VARCHAR(255) NOT NULL,
    `phoneP` VARCHAR(255) NOT NULL,
    `departament` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_call-back` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_call-backDO` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_call-backGO` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_cart` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `birth` VARCHAR(255) NOT NULL,
    `pass` VARCHAR(255) NOT NULL,
    `mail` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `departament` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_commers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `mail` VARCHAR(255) NOT NULL,
    `links` VARCHAR(2550) NOT NULL,
    `amount` VARCHAR(255) NOT NULL,
    `weight` VARCHAR(10) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_doski` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `TK` VARCHAR(255) NOT NULL,
    `trek` VARCHAR(255) NOT NULL,
    `opisanie` VARCHAR(255) NOT NULL,
    `nomer_karti` VARCHAR(255) NOT NULL,
    `FIO_karti` VARCHAR(255) NOT NULL,
    `summa` VARCHAR(255) NOT NULL,
    `name_poluch` VARCHAR(255) NOT NULL,
    `phone_poluch` VARCHAR(255) NOT NULL,
    `departament` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_dostavka-ali` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `mail` VARCHAR(255) NOT NULL,
    `departament` VARCHAR(255) NOT NULL,
    `links` VARCHAR(2500) NOT NULL,
    `opisanie` VARCHAR(2500) NOT NULL,
    `razmer` VARCHAR(255) NOT NULL,
    `color` VARCHAR(255) NOT NULL,
    `colvo` VARCHAR(255) NOT NULL,
    `amount` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_dostavka-rus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `mail` VARCHAR(255) NOT NULL,
    `departament` VARCHAR(255) NOT NULL,
    `links` VARCHAR(2500) NOT NULL,
    `opisanie` VARCHAR(2500) NOT NULL,
    `amount` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_fromabroad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `passport` VARCHAR(12) NOT NULL,
    `vidan` VARCHAR(255) NOT NULL,
    `kogda` VARCHAR(10) NOT NULL,
    `pasldnr` VARCHAR(99) NOT NULL,
    `departament` VARCHAR(255) NOT NULL,
    `links` VARCHAR(2500) NOT NULL,
    `amount` VARCHAR(255) NOT NULL,
    `name_Otpravitelya` VARCHAR(20) NOT NULL,
    `TK` VARCHAR(20) NOT NULL,
    `track_number` VARCHAR(255) NOT NULL,
    `mail` VARCHAR(255) NOT NULL,
    `citi_otprav` VARCHAR(20) NOT NULL,
    `phone_otprav` VARCHAR(20) NOT NULL,
    `kto_oplachivaet` VARCHAR(20) NOT NULL,
    `opisanie` VARCHAR(20) NOT NULL,
    `VIP` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_hotline` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `mail` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `complaint` VARCHAR(750) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_iz-rf` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `passport` VARCHAR(12) NOT NULL,
    `vidan` VARCHAR(255) NOT NULL,
    `kogda` VARCHAR(10) NOT NULL,
    `pasldnr` VARCHAR(99) NOT NULL,
    `departament` VARCHAR(255) NOT NULL,
    `links` VARCHAR(20) NOT NULL,
    `amount` VARCHAR(20) NOT NULL,
    `name_Otpravitelya` VARCHAR(255) NOT NULL,
    `TK` VARCHAR(255) NOT NULL,
    `track_number` VARCHAR(255) NOT NULL,
    `mail` VARCHAR(20) NOT NULL,
    `citi_otprav` VARCHAR(255) NOT NULL,
    `phone_otprav` VARCHAR(255) NOT NULL,
    `kto_oplachivaet` VARCHAR(255) NOT NULL,
    `opisanie` VARCHAR(1500) NOT NULL,
    `VIP` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_iz-rf-test` (
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `passport` VARCHAR(12) NOT NULL,
    `vidan` VARCHAR(255) NOT NULL,
    `kogda` VARCHAR(10) NOT NULL,
    `pasldnr` VARCHAR(99) NOT NULL,
    `departament` VARCHAR(255) NOT NULL,
    `links` VARCHAR(20) NOT NULL,
    `amount` VARCHAR(20) NOT NULL,
    `name_Otpravitelya` VARCHAR(255) NOT NULL,
    `TK` VARCHAR(255) NOT NULL,
    `track_number` VARCHAR(255) NOT NULL,
    `mail` VARCHAR(20) NOT NULL,
    `citi_otprav` VARCHAR(255) NOT NULL,
    `phone_otprav` VARCHAR(255) NOT NULL,
    `kto_oplachivaet` VARCHAR(255) NOT NULL,
    `opisanie` VARCHAR(1500) NOT NULL,
    `VIP` VARCHAR(255) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_iz_krim_ldnr` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `passport` VARCHAR(12) NOT NULL,
    `vidan` VARCHAR(255) NOT NULL,
    `kogda` VARCHAR(10) NOT NULL,
    `pasldnr` VARCHAR(99) NOT NULL,
    `departament` VARCHAR(255) NOT NULL,
    `name_Otpravitelya` VARCHAR(255) NOT NULL,
    `TK` VARCHAR(255) NOT NULL,
    `trek` VARCHAR(255) NOT NULL,
    `citi_otprav` VARCHAR(255) NOT NULL,
    `phone_otprav` VARCHAR(255) NOT NULL,
    `kto_oplachivaet` VARCHAR(255) NOT NULL,
    `opisanie` VARCHAR(1500) NOT NULL,
    `VIP` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_sadovod` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `mail` VARCHAR(50) NOT NULL,
    `departament` VARCHAR(20) NOT NULL,
    `links` VARCHAR(2500) NOT NULL,
    `opisanie` VARCHAR(2500) NOT NULL,
    `amount` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `id`(`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_temernik` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `mail` VARCHAR(50) NOT NULL,
    `departament` VARCHAR(50) NOT NULL,
    `links` VARCHAR(2500) NOT NULL,
    `opisanie` VARCHAR(2500) NOT NULL,
    `amount` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `id`(`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `podcategoriyaEksp` (
    `id` INTEGER NULL,
    `categoriya` VARCHAR(33) NULL,
    `opisanie` VARCHAR(132) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `termgr` (
    `id` INTEGER NULL,
    `opisanie` VARCHAR(131) NULL,
    `priznak` VARCHAR(8) NULL,
    `sht` INTEGER NULL,
    `fact` VARCHAR(3) NULL,
    `obiem` VARCHAR(3) NULL,
    `1` INTEGER NULL,
    `2` INTEGER NULL,
    `3` VARCHAR(6) NULL,
    `4` VARCHAR(6) NULL,
    `5` VARCHAR(6) NULL,
    `6` VARCHAR(6) NULL,
    `7` VARCHAR(6) NULL,
    `8` VARCHAR(6) NULL,
    `9` VARCHAR(6) NULL,
    `10` VARCHAR(6) NULL,
    `11` VARCHAR(6) NULL,
    `12` VARCHAR(6) NULL,
    `13` VARCHAR(6) NULL,
    `14` VARCHAR(6) NULL,
    `15` VARCHAR(6) NULL,
    `16` VARCHAR(6) NULL,
    `17` VARCHAR(6) NULL,
    `18` VARCHAR(6) NULL,
    `19` VARCHAR(6) NULL,
    `20` VARCHAR(6) NULL,
    `21` VARCHAR(6) NULL,
    `22` VARCHAR(6) NULL,
    `23` VARCHAR(6) NULL,
    `24` VARCHAR(6) NULL,
    `25` VARCHAR(6) NULL,
    `26` VARCHAR(6) NULL,
    `27` VARCHAR(6) NULL,
    `28` VARCHAR(6) NULL,
    `29` VARCHAR(6) NULL,
    `30` VARCHAR(6) NULL,
    `31` VARCHAR(6) NULL,
    `32` VARCHAR(6) NULL,
    `33` VARCHAR(6) NULL,
    `34` VARCHAR(6) NULL,
    `35` VARCHAR(6) NULL,
    `36` VARCHAR(6) NULL,
    `37` VARCHAR(6) NULL,
    `38` VARCHAR(6) NULL,
    `39` VARCHAR(7) NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `zabor_commerc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `trek` VARCHAR(255) NOT NULL,
    `tkadress` VARCHAR(255) NOT NULL,
    `name` VARCHAR(2500) NOT NULL,
    `naznachenie` VARCHAR(2500) NOT NULL,
    `colvo` VARCHAR(255) NOT NULL,
    `amount` VARCHAR(255) NOT NULL,
    `kuda` VARCHAR(255) NOT NULL,
    `tel` VARCHAR(255) NOT NULL,
    `mail` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `zabor_gruza` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name_Otpravitelya` VARCHAR(255) NOT NULL,
    `town_otprav` VARCHAR(255) NOT NULL,
    `citi_otprav` VARCHAR(255) NOT NULL,
    `time_otprav` VARCHAR(255) NOT NULL,
    `phone_otprav` VARCHAR(255) NOT NULL,
    `kto_oplachivaet` VARCHAR(255) NOT NULL,
    `kol_vo` VARCHAR(255) NOT NULL,
    `ves` VARCHAR(255) NOT NULL,
    `obyem` VARCHAR(255) NOT NULL,
    `stoimost` VARCHAR(255) NOT NULL,
    `ves_gruza` VARCHAR(255) NOT NULL,
    `name_gruz` VARCHAR(255) NOT NULL,
    `gabariti` VARCHAR(255) NOT NULL,
    `khrupkiy_gruz` VARCHAR(255) NOT NULL,
    `name_otprav` VARCHAR(255) NOT NULL,
    `citi_poluch` VARCHAR(270) NOT NULL,
    `phone_poluch` VARCHAR(255) NOT NULL,
    `departament` VARCHAR(255) NOT NULL,
    `name_zakaz` VARCHAR(255) NOT NULL,
    `mail` VARCHAR(255) NOT NULL,
    `phone_zakaz` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `zabor_gruzaDNR` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name_Otpravitelya` VARCHAR(255) NOT NULL,
    `town_otprav` VARCHAR(255) NOT NULL,
    `citi_otprav` VARCHAR(255) NOT NULL,
    `time_otprav` VARCHAR(255) NOT NULL,
    `phone_otprav` VARCHAR(255) NOT NULL,
    `kto_oplachivaet` VARCHAR(255) NOT NULL,
    `kol_vo` VARCHAR(255) NOT NULL,
    `ves` VARCHAR(255) NOT NULL,
    `obyem` VARCHAR(255) NOT NULL,
    `stoimost` VARCHAR(255) NOT NULL,
    `ves_gruza` VARCHAR(255) NOT NULL,
    `name_gruz` VARCHAR(255) NOT NULL,
    `gabariti` VARCHAR(255) NOT NULL,
    `khrupkiy_gruz` VARCHAR(255) NOT NULL,
    `name_otprav` VARCHAR(255) NOT NULL,
    `citi_poluch` VARCHAR(270) NOT NULL,
    `phone_poluch` VARCHAR(255) NOT NULL,
    `departament` VARCHAR(255) NOT NULL,
    `name_zakaz` VARCHAR(255) NOT NULL,
    `mail` VARCHAR(255) NOT NULL,
    `phone_zakaz` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `zabor_gruzaKrym` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name_Otpravitelya` VARCHAR(255) NOT NULL,
    `town_otprav` VARCHAR(255) NOT NULL,
    `citi_otprav` VARCHAR(255) NOT NULL,
    `time_otprav` VARCHAR(255) NOT NULL,
    `phone_otprav` VARCHAR(255) NOT NULL,
    `kto_oplachivaet` VARCHAR(255) NOT NULL,
    `kol_vo` VARCHAR(255) NOT NULL,
    `ves` VARCHAR(255) NOT NULL,
    `obyem` VARCHAR(255) NOT NULL,
    `stoimost` VARCHAR(255) NOT NULL,
    `ves_gruza` VARCHAR(255) NOT NULL,
    `name_gruz` VARCHAR(255) NOT NULL,
    `gabariti` VARCHAR(255) NOT NULL,
    `khrupkiy_gruz` VARCHAR(255) NOT NULL,
    `name_otprav` VARCHAR(255) NOT NULL,
    `citi_poluch` VARCHAR(270) NOT NULL,
    `phone_poluch` VARCHAR(255) NOT NULL,
    `departament` VARCHAR(255) NOT NULL,
    `name_zakaz` VARCHAR(255) NOT NULL,
    `mail` VARCHAR(255) NOT NULL,
    `phone_zakaz` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `zabor_gruzaLNR` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name_Otpravitelya` VARCHAR(255) NOT NULL,
    `town_otprav` VARCHAR(255) NOT NULL,
    `citi_otprav` VARCHAR(255) NOT NULL,
    `time_otprav` VARCHAR(255) NOT NULL,
    `phone_otprav` VARCHAR(255) NOT NULL,
    `kto_oplachivaet` VARCHAR(255) NOT NULL,
    `kol_vo` VARCHAR(255) NOT NULL,
    `ves` VARCHAR(255) NOT NULL,
    `obyem` VARCHAR(255) NOT NULL,
    `stoimost` VARCHAR(255) NOT NULL,
    `ves_gruza` VARCHAR(255) NOT NULL,
    `name_gruz` VARCHAR(255) NOT NULL,
    `gabariti` VARCHAR(255) NOT NULL,
    `khrupkiy_gruz` VARCHAR(255) NOT NULL,
    `name_otprav` VARCHAR(255) NOT NULL,
    `citi_poluch` VARCHAR(270) NOT NULL,
    `phone_poluch` VARCHAR(255) NOT NULL,
    `departament` VARCHAR(255) NOT NULL,
    `name_zakaz` VARCHAR(255) NOT NULL,
    `mail` VARCHAR(255) NOT NULL,
    `phone_zakaz` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `zayvka_form` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(255) NOT NULL,
    `mail` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

