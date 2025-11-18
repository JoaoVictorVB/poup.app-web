/*
Warnings:

- You are about to drop the column `price` on the `products` table. All the data in the column will be lost.
- You are about to drop the column `quantity` on the `products` table. All the data in the column will be lost.
- Added the required column `installment_value` to the `products` table without a default value. This is not possible if the table is not empty.
- Added the required column `total_price` to the `products` table without a default value. This is not possible if the table is not empty.

 */
-- AlterTable
ALTER TABLE `products`
ADD COLUMN `installment_value` DOUBLE NOT NULL DEFAULT 0,
ADD COLUMN `installments` INTEGER NOT NULL DEFAULT 1,
ADD COLUMN `next_payment` DATETIME (3) NULL,
ADD COLUMN `paid_installments` INTEGER NOT NULL DEFAULT 0,
ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
ADD COLUMN `total_price` DOUBLE NOT NULL DEFAULT 0;

-- Migrar dados existentes
UPDATE `products`
SET
  `total_price` = `price`,
  `installment_value` = `price`
WHERE
  `total_price` = 0;

-- Remover colunas antigas
ALTER TABLE `products`
DROP COLUMN `price`,
DROP COLUMN `quantity`;

-- AlterTable
ALTER TABLE `subscriptions`
ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending';