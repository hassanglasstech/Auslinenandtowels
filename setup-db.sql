-- ============================================================
-- Australian Linen & Towels — Newsletter Subscribers Table
-- Run ONCE in Hostinger hPanel > phpMyAdmin
-- ============================================================

CREATE TABLE IF NOT EXISTS `subscribers` (
  `id`             INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  `name`           VARCHAR(100)    NOT NULL,
  `email`          VARCHAR(255)    NOT NULL,
  `subscribed_at`  DATETIME        DEFAULT CURRENT_TIMESTAMP,
  `source`         VARCHAR(80)     DEFAULT 'website-newsletter',
  `status`         ENUM('active','unsubscribed') DEFAULT 'active',
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
