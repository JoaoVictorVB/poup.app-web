-- AlterTable
ALTER TABLE `users` ADD COLUMN `locked_until` DATETIME(3) NULL,
    ADD COLUMN `login_attempts` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `password_history` TEXT NULL;
