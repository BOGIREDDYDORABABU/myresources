-- Run this once after the app has started (so Hibernate has created the `users` table),
-- e.g.  mysql -u root -p my_resources < seed_admin.sql
--
-- Creates a default admin you can log in with at POST /api/auth/login:
--   identifier: admin@myresources.local
--   password:   Babu@240311
-- (the hash below was generated for that exact password)
--
-- If you already have an admin row from a previous run, this INSERT will fail
-- with a duplicate-key error - that's fine, it just means you don't need this
-- script again. Use the UPDATE statement further down instead if you need to
-- change the password on an existing admin row.

INSERT INTO users (name, email, phone, password, location, role, identity_verified, email_verified, phone_verified, blocked, active, created_at, updated_at)
VALUES (
  'Platform Admin',
  'admin@myresources.local',
  NULL,
  '$2b$10$I76HqaE0SEOZ1oXg8F5SgucqAgUieJAHmUDcMZh4JKrPszv6glCqW',
  'HQ',
  'ADMIN',
  1, 1, 0, 0, 1, NOW(), NOW()
);

-- To change the password on an EXISTING admin row instead of inserting a new one:
-- UPDATE users SET password = '$2b$10$I76HqaE0SEOZ1oXg8F5SgucqAgUieJAHmUDcMZh4JKrPszv6glCqW' WHERE role = 'ADMIN';
