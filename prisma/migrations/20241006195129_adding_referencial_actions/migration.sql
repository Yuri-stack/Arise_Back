-- DropForeignKey
ALTER TABLE `tasks` DROP FOREIGN KEY `Tasks_userId_fkey`;

-- AddForeignKey
ALTER TABLE `Tasks` ADD CONSTRAINT `Tasks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
