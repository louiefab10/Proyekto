-- Prevent duplicate tag names per user
ALTER TABLE tags
ADD CONSTRAINT unique_tag_name_per_user UNIQUE (user_id, name);