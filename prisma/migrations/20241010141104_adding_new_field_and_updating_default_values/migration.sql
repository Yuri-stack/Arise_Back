-- AlterTable
ALTER TABLE `user` ADD COLUMN `rank` VARCHAR(191) NULL DEFAULT 'Iniciante',
    MODIFY `role` VARCHAR(191) NULL DEFAULT 'Player';
