-- AlterTable
ALTER TABLE `coupon` ADD COLUMN `status` ENUM('ACTIVE', 'INACTIVE') NULL DEFAULT 'ACTIVE';
