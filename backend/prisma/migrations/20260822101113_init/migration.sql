-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `emailVerifiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `educationLevel` VARCHAR(191) NULL,
    `degrees` TEXT NULL,
    `state` VARCHAR(191) NULL,
    `district` VARCHAR(191) NULL,
    `languages` TEXT NULL,
    `category` ENUM('GEN', 'OBC', 'SC', 'ST', 'EWS') NULL,
    `dob` DATETIME(3) NULL,
    `gender` VARCHAR(191) NULL,
    `examFamilies` TEXT NULL,
    `keywords` TEXT NULL,
    `notifyInstant` BOOLEAN NOT NULL DEFAULT true,
    `notifyDigest` BOOLEAN NOT NULL DEFAULT true,
    `digestTime` VARCHAR(191) NOT NULL DEFAULT '09:00',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sources` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('NCS_API', 'RSS', 'HTML', 'PDF') NOT NULL,
    `baseUrl` VARCHAR(191) NOT NULL,
    `schedule` VARCHAR(191) NOT NULL DEFAULT '*/6 * * * *',
    `lastRunAt` DATETIME(3) NULL,
    `lastRunStatus` VARCHAR(191) NULL,
    `itemsPerRun` INTEGER NOT NULL DEFAULT 0,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `configJson` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobs` (
    `id` VARCHAR(191) NOT NULL,
    `fingerprint` VARCHAR(191) NOT NULL,
    `sourceId` VARCHAR(191) NULL,
    `sourceUrl` VARCHAR(191) NULL,
    `org` VARCHAR(191) NOT NULL,
    `advtNo` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `postNames` TEXT NULL,
    `totalVacancies` INTEGER NULL,
    `state` VARCHAR(191) NOT NULL DEFAULT 'ALL_IN',
    `examFamily` VARCHAR(191) NULL,
    `qualificationText` TEXT NULL,
    `qualificationLevels` TEXT NULL,
    `ageMin` INTEGER NULL,
    `ageMax` INTEGER NULL,
    `categoryFeesJson` TEXT NULL,
    `applyStart` DATETIME(3) NULL,
    `applyEnd` DATETIME(3) NULL,
    `feeEnd` DATETIME(3) NULL,
    `examDate` DATETIME(3) NULL,
    `admitCardDate` DATETIME(3) NULL,
    `resultDate` DATETIME(3) NULL,
    `status` ENUM('OPEN', 'CLOSED', 'REVIEW') NOT NULL DEFAULT 'OPEN',
    `notificationPdfUrl` VARCHAR(191) NULL,
    `applyUrl` VARCHAR(191) NULL,
    `officialUrls` TEXT NULL,
    `rawHash` VARCHAR(191) NULL,
    `firstSeenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastSeenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `jobs_fingerprint_key`(`fingerprint`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_changes` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `type` ENUM('EXAM_DATE', 'VENUE', 'DEADLINE', 'CORRIGENDUM', 'RESULT', 'ADMIT_CARD') NOT NULL,
    `field` VARCHAR(191) NOT NULL,
    `before` TEXT NULL,
    `after` TEXT NULL,
    `detectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_jobs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `applied` BOOLEAN NOT NULL DEFAULT false,
    `appliedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `stage` ENUM('APPLIED', 'EXAM', 'ADMIT_CARD', 'RESULT', 'REJECTED', 'SELECTED') NULL,
    `examCity` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_jobs_userId_jobId_key`(`userId`, `jobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NULL,
    `changeId` VARCHAR(191) NULL,
    `type` ENUM('DIGEST', 'INSTANT', 'WELCOME') NOT NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'sent',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `plan` VARCHAR(191) NOT NULL DEFAULT 'FREE',
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `razorpayOrderId` VARCHAR(191) NULL,
    `startsAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endsAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_sourceId_fkey` FOREIGN KEY (`sourceId`) REFERENCES `sources`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_changes` ADD CONSTRAINT `job_changes_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_jobs` ADD CONSTRAINT `user_jobs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_jobs` ADD CONSTRAINT `user_jobs_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_logs` ADD CONSTRAINT `notification_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_logs` ADD CONSTRAINT `notification_logs_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
