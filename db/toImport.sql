

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


CREATE TABLE `apiKeys` (
  `id` int NOT NULL,
  `keyCode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user` int NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `settings` (
  `id` int NOT NULL,
  `name` text NOT NULL,
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `lastUpdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `settings` (`id`, `name`, `value`, `lastUpdate`) VALUES
(1, 'siteName', 'Ticket System', '2025-05-13 14:26:04'),
(3, 'smtpServer', 'smtp.pl', '2025-05-13 14:25:30'),
(4, 'smtpUser', 'email@email.pl', '2025-05-13 14:25:36'),
(5, 'smtpPass', 'PASS', '2025-05-13 14:25:41'),
(6, 'smtpSendAs', 'TicketPlease', '2025-05-13 14:25:47'),
(7, 'smtpPort', '465', '2025-04-09 16:08:37'),
(8, 'smtpTls', '1', '2025-04-09 16:04:35'),
(9, 'smtpBcc', NULL, '2025-04-09 19:56:52'),
(10, 'smtpSubject', 'Your ticket', '2025-04-09 16:04:31'),
(11, 'smtpFromEmail', 'mail@send.pl', '2025-05-13 14:25:57'),
(12, 'smtpReplyTo', 'mail@send.pl', '2025-05-13 14:26:00');

CREATE TABLE `ticketCheck` (
  `id` int NOT NULL,
  `ticketId` int NOT NULL,
  `userId` int NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `tickets` (
  `id` int NOT NULL,
  `type` int NOT NULL,
  `name` text NOT NULL,
  `pass` text NOT NULL,
  `addedBy` int NOT NULL,
  `email` text NOT NULL,
  `emailSended` timestamp NULL DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `ticketTypes` (
  `id` int NOT NULL,
  `name` varchar(200) NOT NULL,
  `onTicket` text NOT NULL,
  `numberOfLines` int NOT NULL,
  `date` text NOT NULL,
  `img` text NOT NULL,
  `config` text NOT NULL,
  `emailTitle` varchar(255) NOT NULL DEFAULT 'Your ticket',
  `emailMessage` text NOT NULL,
  `whoAdded` int NOT NULL,
  `lastEdit` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `active` int NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `user` (
  `id` int NOT NULL,
  `login` char(200) NOT NULL,
  `email` text NOT NULL,
  `name` char(200) NOT NULL,
  `pass` text NOT NULL,
  `admin` int NOT NULL DEFAULT '0',
  `lastLogin` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


INSERT INTO `user` (`id`, `login`, `email`, `name`, `pass`, `admin`, `lastLogin`, `active`) VALUES
(1, 'admin', 'admin@mail.pl', 'admin', 'd033e22ae348aeb5660fc2140aec35850c4da997', 1, '2025-05-13 14:27:27', 1);

ALTER TABLE `apiKeys`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user` (`user`);

ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `ticketCheck`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticketId` (`ticketId`),
  ADD KEY `userId` (`userId`);

ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `addedBy` (`addedBy`),
  ADD KEY `type` (`type`);

ALTER TABLE `ticketTypes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `whoAdded` (`whoAdded`);

ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `apiKeys`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

ALTER TABLE `settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

ALTER TABLE `ticketCheck`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

ALTER TABLE `tickets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

ALTER TABLE `ticketTypes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `apiKeys`
  ADD CONSTRAINT `apiKeys_ibfk_1` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `ticketCheck`
  ADD CONSTRAINT `ticketCheck_ibfk_1` FOREIGN KEY (`ticketId`) REFERENCES `tickets` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `ticketCheck_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`addedBy`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`type`) REFERENCES `ticketTypes` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `ticketTypes`
  ADD CONSTRAINT `ticketTypes_ibfk_1` FOREIGN KEY (`whoAdded`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;
