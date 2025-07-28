-- Create admin user: garrett.horvath@gmail.com
-- Password: adminDimenti0nals! (hashed with bcrypt)

-- First, let's insert the user (replace the hash below with the actual bcrypt hash)
INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
VALUES (
  'Garrett Horvath',
  'garrett.horvath@gmail.com', 
  '$2a$12$LQv3c1yqBwEHFl5TA1fcfe.fQNgNJOqg3/y1XNg.d4/7JW6w.5sYq', -- adminDimenti0nals!
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'admin',
  updated_at = NOW();

-- Create a team for the admin user
INSERT INTO teams (name, created_at, updated_at)
VALUES ('Garrett Horvath''s Team', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Add user to team as owner
INSERT INTO team_members (user_id, team_id, role, created_at, updated_at)
SELECT 
  u.id,
  t.id,
  'owner',
  NOW(),
  NOW()
FROM users u, teams t
WHERE u.email = 'garrett.horvath@gmail.com'
  AND t.name = 'Garrett Horvath''s Team'
ON CONFLICT (user_id, team_id) DO NOTHING;