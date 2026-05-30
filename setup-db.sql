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

-- ============================================================
-- PRODUCT CATALOGUE — DB is now the single source of truth.
-- Admin edits these tables; api/products.php?action=publish
-- regenerates assets/products-data.js (the static storefront artifact).
-- Replaces the old "hand-edit a JS array + run generate_products.py" workflow.
-- ============================================================

CREATE TABLE IF NOT EXISTS `categories` (
  `id`          VARCHAR(60)   NOT NULL PRIMARY KEY,   -- e.g. 'towels-bath'
  `name`        VARCHAR(120)  NOT NULL,
  `parent`      VARCHAR(80)   DEFAULT NULL,           -- top-level group, e.g. 'Towels'
  `slug`        VARCHAR(120)  DEFAULT NULL,
  `image`       VARCHAR(255)  DEFAULT NULL,
  `sort_order`  INT           DEFAULT 0,
  KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product_parents` (
  `sku`       VARCHAR(40)   NOT NULL PRIMARY KEY,     -- e.g. 'ALU-BT'
  `name`      VARCHAR(160)  NOT NULL,
  `category`  VARCHAR(60)   DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `id`            INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  `sku`           VARCHAR(40)   NOT NULL,
  `name`          VARCHAR(160)  NOT NULL,
  `colour`        VARCHAR(60)   DEFAULT NULL,
  `size`          VARCHAR(60)   DEFAULT NULL,
  `weight`        VARCHAR(40)   DEFAULT NULL,
  `material`      VARCHAR(120)  DEFAULT NULL,
  `category_id`   VARCHAR(60)   DEFAULT NULL,
  `image`         VARCHAR(255)  DEFAULT NULL,
  `gallery`       TEXT          DEFAULT NULL,         -- JSON array of image paths
  `zoom_image`    VARCHAR(255)  DEFAULT NULL,
  `price`         DECIMAL(10,2) DEFAULT 0.00,
  `description`   TEXT          DEFAULT NULL,
  `color_group`   VARCHAR(60)   DEFAULT NULL,
  `parent_sku`    VARCHAR(60)   DEFAULT NULL,
  `variant_name`  VARCHAR(80)   DEFAULT NULL,
  `tag`           VARCHAR(60)   DEFAULT NULL,
  `sort_order`    INT           DEFAULT 0,            -- preserves catalogue order
  `active`        TINYINT(1)    DEFAULT 1,
  `updated_at`    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_sku` (`sku`),
  KEY `idx_category` (`category_id`),
  KEY `idx_sort` (`sort_order`),
  KEY `idx_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
