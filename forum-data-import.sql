-- ByTheWey Forum Data Import
-- This SQL script populates the forum with conversation data
-- Run this in your Supabase SQL Editor

-- Step 1: Clear existing forum data
DELETE FROM forum_replies;
DELETE FROM forum_threads;

-- Step 2: Ensure we have a generic author for the imported posts
-- (Replace with actual user IDs if you want to attribute to real users)
-- For now, we'll use the first user in the system or create a generic one
DO $$
DECLARE
  generic_user_id UUID;
BEGIN
  -- Try to get an existing user, or we'll need to handle this differently
  -- You may want to replace this with a specific user ID from your profiles table
  SELECT id INTO generic_user_id FROM profiles LIMIT 1;

  -- Store it for later use (you'll need to replace the placeholder below)
  -- For this import, you should replace 'AUTHOR_ID_HERE' with actual UUIDs
END $$;

-- Step 3: Insert forum threads
-- Each INSERT creates one thread with its metadata

-- Example structure (replace with your actual data):
-- INSERT INTO forum_threads (board, title, content, author_id, created_at) VALUES
-- ('general', 'Thread Title', 'Thread content...', 'USER_UUID', '2024-01-15T10:30:00Z');

-- Thread 1: [Replace with your data]
INSERT INTO forum_threads (board, title, content, author_id, created_at) VALUES
('general', 'Example Thread Title 1', 'Example thread content...', (SELECT id FROM profiles LIMIT 1), NOW() - INTERVAL '7 days');

-- Get the thread ID for replies (in a real script, you'd do this for each thread)
DO $$
DECLARE
  thread_1_id UUID;
BEGIN
  SELECT id INTO thread_1_id FROM forum_threads WHERE title = 'Example Thread Title 1';

  -- Insert replies for this thread
  -- Example structure:
  -- INSERT INTO forum_replies (thread_id, content, author_id, author_username, created_at) VALUES
  -- (thread_1_id, 'Reply content', 'USER_UUID', 'username', '2024-01-15T11:00:00Z');
END $$;


-- =============================================================================
-- INSTRUCTIONS FOR COMPLETING THIS SCRIPT:
-- =============================================================================
--
-- 1. Replace the example thread above with your 14 actual threads
-- 2. For each thread, use this pattern:
--
--    INSERT INTO forum_threads (board, title, content, author_id, created_at)
--    VALUES ('general', 'Title', 'Content', (SELECT id FROM profiles LIMIT 1), 'TIMESTAMP');
--
-- 3. After each thread insert, add a DO block to insert its replies:
--
--    DO $$
--    DECLARE thread_id UUID;
--    BEGIN
--      SELECT id INTO thread_id FROM forum_threads WHERE title = 'Your Thread Title';
--
--      INSERT INTO forum_replies (thread_id, content, author_id, author_username, created_at)
--      VALUES
--        (thread_id, 'Reply 1', (SELECT id FROM profiles LIMIT 1), 'username', 'TIMESTAMP'),
--        (thread_id, 'Reply 2', (SELECT id FROM profiles LIMIT 1), 'username', 'TIMESTAMP');
--    END $$;
--
-- 4. For the board field, use one of: 'general', 'local', 'events', etc.
-- 5. For timestamps, use ISO format: '2024-01-15T10:30:00Z'
-- 6. For author_id, you can use (SELECT id FROM profiles LIMIT 1) or specific UUIDs
-- =============================================================================
