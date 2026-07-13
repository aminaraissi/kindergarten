-- Migration: Registration requests workflow
-- Base de donnees : `fadaa_al_tifl`
-- A executer apres les migrations precedentes (n'ecrase aucune table existante)
--
-- Idee : l'inscription publique (signup "parent") n'ecrit plus directement
-- dans `students`. Elle cree une ligne dans `registration_requests` (status
-- 'pending'). Ce n'est qu'apres validation par l'administration que les
-- donnees sont copiees vers `students` / `student_parents` /
-- `student_guardians`, et l'enfant devient un eleve officiel.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------

--
-- Structure de la table `registration_requests`
--

CREATE TABLE IF NOT EXISTS `registration_requests` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int UNSIGNED NOT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dob` date NOT NULL,
  `pob` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `health` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `photo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_email` varchar(190) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewed_by` int UNSIGNED DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `student_id` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_regreq_user` (`user_id`),
  KEY `idx_regreq_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `registration_request_parents`
--

CREATE TABLE IF NOT EXISTS `registration_request_parents` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `request_id` int UNSIGNED NOT NULL,
  `type` enum('mother','father') COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lastname` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `pob` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_regreqparent_type` (`request_id`,`type`),
  KEY `fk_reqparent_request` (`request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `registration_request_guardians`
--

CREATE TABLE IF NOT EXISTS `registration_request_guardians` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `request_id` int UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dob` date DEFAULT NULL,
  `pob` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_reqguardian_request` (`request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- `users` : lien temporaire vers la demande, en attendant l'approbation
--

ALTER TABLE `users`
  ADD COLUMN `request_id` int UNSIGNED DEFAULT NULL AFTER `student_id`;

-- --------------------------------------------------------

--
-- Extension de `admin_activity_log` pour référencer les demandes
--

ALTER TABLE `admin_activity_log`
  MODIFY `target_ref_type` enum('student','teacher','class','message','pricing_plan','event','job_listing','job_application','registration_request') COLLATE utf8mb4_unicode_ci DEFAULT NULL;

-- --------------------------------------------------------

--
-- Contraintes
--

ALTER TABLE `registration_requests`
  ADD CONSTRAINT `fk_regreq_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_regreq_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL;

ALTER TABLE `registration_request_parents`
  ADD CONSTRAINT `fk_reqparent_request` FOREIGN KEY (`request_id`) REFERENCES `registration_requests` (`id`) ON DELETE CASCADE;

ALTER TABLE `registration_request_guardians`
  ADD CONSTRAINT `fk_reqguardian_request` FOREIGN KEY (`request_id`) REFERENCES `registration_requests` (`id`) ON DELETE CASCADE;

ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_request` FOREIGN KEY (`request_id`) REFERENCES `registration_requests` (`id`) ON DELETE SET NULL;

COMMIT;