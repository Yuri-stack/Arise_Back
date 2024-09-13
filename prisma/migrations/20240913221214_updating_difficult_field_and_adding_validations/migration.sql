/*
  Warnings:

  - You are about to alter the column `name` on the `tasks` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `description` on the `tasks` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `difficult` on the `tasks` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `tasks` MODIFY `name` VARCHAR(50) NOT NULL,
    MODIFY `description` VARCHAR(100) NOT NULL,
    MODIFY `difficult` INTEGER NULL,
    MODIFY `status` VARCHAR(191) NULL;
