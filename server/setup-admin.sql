-- ============================================================
-- PREPX IQ – Admin User Seed
-- Run this ONCE after setup.sql to create the first admin user
-- ============================================================

-- Password: admin123  (change this immediately after first login!)
-- Generate your own hash with:
--   const bcrypt = require('bcrypt');
--   const hash = bcrypt.hashSync('your-password', 10);
--   console.log(hash);

INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2b$10$rQ7jZ9kX5vT3wQr4sH1eXeY9Z7K8mL0hPw2vBn1gHsD0cV5fG6hJ8')
ON CONFLICT (username) DO NOTHING;
