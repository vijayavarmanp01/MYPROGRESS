-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `bio` TEXT NULL,
    `avatarInitial` VARCHAR(10) NULL,
    `avatarGradient` VARCHAR(100) NULL,
    `githubUrl` VARCHAR(255) NULL,
    `linkedinUrl` VARCHAR(255) NULL,
    `leetcodeUrl` VARCHAR(255) NULL,
    `targetRole` VARCHAR(150) NULL,
    `targetCompanies` JSON NULL,
    `provider` ENUM('EMAIL', 'GOOGLE', 'GITHUB') NOT NULL DEFAULT 'EMAIL',
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_username_key`(`username`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_username_idx`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `topics` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `icon` VARCHAR(50) NULL,
    `category` ENUM('DSA', 'SQL', 'LEETCODE', 'CORE_CS', 'SYSTEM_DESIGN', 'INTERVIEW_SKILLS') NOT NULL DEFAULT 'DSA',
    `order` INTEGER NOT NULL DEFAULT 0,
    `totalProblemsPlanned` INTEGER NOT NULL DEFAULT 0,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `topics_slug_key`(`slug`),
    INDEX `topics_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `problems` (
    `id` VARCHAR(191) NOT NULL,
    `topicId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(200) NULL,
    `platform` VARCHAR(50) NOT NULL DEFAULT 'LeetCode',
    `problemNumber` INTEGER NULL,
    `difficulty` ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'MEDIUM',
    `url` VARCHAR(500) NULL,
    `patternTags` JSON NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `problems_topicId_idx`(`topicId`),
    INDEX `problems_difficulty_idx`(`difficulty`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_problems` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `problemId` VARCHAR(191) NOT NULL,
    `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'SOLVED', 'REVISED') NOT NULL DEFAULT 'NOT_STARTED',
    `solvedAt` DATETIME(3) NULL,
    `timeTakenMinutes` INTEGER NULL,
    `notes` TEXT NULL,
    `codeSnippet` TEXT NULL,
    `revisionStatus` ENUM('IMPORTANT', 'NEEDS_REVISION', 'MASTERED') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `user_problems_userId_status_idx`(`userId`, `status`),
    INDEX `user_problems_problemId_idx`(`problemId`),
    UNIQUE INDEX `user_problems_userId_problemId_key`(`userId`, `problemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_tasks` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `topicId` VARCHAR(191) NULL,
    `date` DATE NOT NULL,
    `title` VARCHAR(255) NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `problemsSolved` INTEGER NOT NULL DEFAULT 0,
    `problemsTarget` INTEGER NOT NULL DEFAULT 2,
    `timeSpentMinutes` INTEGER NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `daily_tasks_userId_date_idx`(`userId`, `date`),
    INDEX `daily_tasks_topicId_idx`(`topicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `progress` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `currentStreak` INTEGER NOT NULL DEFAULT 0,
    `longestStreak` INTEGER NOT NULL DEFAULT 0,
    `lastActiveDate` DATE NULL,
    `totalProblemsSolved` INTEGER NOT NULL DEFAULT 0,
    `totalTimeSpentMinutes` INTEGER NOT NULL DEFAULT 0,
    `problemsMastered` INTEGER NOT NULL DEFAULT 0,
    `dailyGoalMinutes` INTEGER NOT NULL DEFAULT 60,
    `dailyGoalProblems` INTEGER NOT NULL DEFAULT 3,
    `weeklyGoalProblems` INTEGER NOT NULL DEFAULT 15,
    `overallReadinessPct` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `progress_userId_key`(`userId`),
    INDEX `progress_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `revisions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `problemId` VARCHAR(191) NOT NULL,
    `interval` ENUM('TOMORROW', 'THREE_DAYS', 'ONE_WEEK', 'TWO_WEEKS', 'ONE_MONTH') NOT NULL DEFAULT 'ONE_WEEK',
    `revisionDate` DATE NOT NULL,
    `status` ENUM('IMPORTANT', 'NEEDS_REVISION', 'MASTERED') NOT NULL DEFAULT 'NEEDS_REVISION',
    `revisionCount` INTEGER NOT NULL DEFAULT 0,
    `lastRevisedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `revisions_userId_revisionDate_idx`(`userId`, `revisionDate`),
    INDEX `revisions_status_idx`(`status`),
    UNIQUE INDEX `revisions_userId_problemId_key`(`userId`, `problemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `achievements` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `icon` VARCHAR(50) NOT NULL,
    `tier` ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'MYTHIC') NOT NULL DEFAULT 'BRONZE',
    `targetValue` INTEGER NOT NULL DEFAULT 1,
    `category` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `achievements_slug_key`(`slug`),
    INDEX `achievements_slug_idx`(`slug`),
    INDEX `achievements_tier_idx`(`tier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_achievements` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `achievementId` VARCHAR(191) NOT NULL,
    `currentProgress` INTEGER NOT NULL DEFAULT 0,
    `unlocked` BOOLEAN NOT NULL DEFAULT false,
    `unlockedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `user_achievements_userId_unlocked_idx`(`userId`, `unlocked`),
    INDEX `user_achievements_achievementId_idx`(`achievementId`),
    UNIQUE INDEX `user_achievements_userId_achievementId_key`(`userId`, `achievementId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `problems` ADD CONSTRAINT `problems_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `topics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_problems` ADD CONSTRAINT `user_problems_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_problems` ADD CONSTRAINT `user_problems_problemId_fkey` FOREIGN KEY (`problemId`) REFERENCES `problems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_tasks` ADD CONSTRAINT `daily_tasks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_tasks` ADD CONSTRAINT `daily_tasks_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `topics`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progress` ADD CONSTRAINT `progress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `revisions` ADD CONSTRAINT `revisions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `revisions` ADD CONSTRAINT `revisions_problemId_fkey` FOREIGN KEY (`problemId`) REFERENCES `problems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_achievements` ADD CONSTRAINT `user_achievements_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_achievements` ADD CONSTRAINT `user_achievements_achievementId_fkey` FOREIGN KEY (`achievementId`) REFERENCES `achievements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
