-- ============================================================
-- Australian Linen & Towels — Newsletter Subscribers Table
-- Run ONCE in Hostinger hPanel > phpMyAdmin
-- ============================================================

CREATE TABLE IF NOT EXISTS `subscribers` (
  `id`                INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  `name`              VARCHAR(100)    NOT NULL,
  `email`             VARCHAR(255)    NOT NULL,
  `subscribed_at`     DATETIME        DEFAULT CURRENT_TIMESTAMP,
  `source`            VARCHAR(80)     DEFAULT 'website-newsletter',
  `status`            ENUM('active','unsubscribed') DEFAULT 'active',
  `unsubscribe_token` CHAR(32)        DEFAULT NULL,
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- If the subscribers table already exists, add the token column once:
--   ALTER TABLE `subscribers` ADD COLUMN `unsubscribe_token` CHAR(32) DEFAULT NULL;

-- ============================================================
-- Enquiries — every contact / trade / lead-capture submission.
-- Guarantees no lead is lost if the email notification fails.
-- ============================================================
CREATE TABLE IF NOT EXISTS `enquiries` (
  `id`            INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  `received_at`   DATETIME        DEFAULT CURRENT_TIMESTAMP,
  `name`          VARCHAR(120)    NOT NULL,
  `email`         VARCHAR(255)    NOT NULL,
  `phone`         VARCHAR(40)     DEFAULT NULL,
  `company`       VARCHAR(160)    DEFAULT NULL,
  `enquiry_type`  VARCHAR(80)     DEFAULT NULL,
  `message`       TEXT            NOT NULL,
  `source_ip`     VARCHAR(45)     DEFAULT NULL,
  `email_sent`    TINYINT(1)      DEFAULT 0,
  KEY `idx_received` (`received_at`),
  KEY `idx_type` (`enquiry_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
