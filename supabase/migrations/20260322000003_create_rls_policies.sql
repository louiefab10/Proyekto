-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "projects_select" ON projects FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "projects_insert" ON projects FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "projects_update" ON projects FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "projects_delete" ON projects FOR DELETE USING (user_id = auth.uid());

-- Tasks policies
CREATE POLICY "tasks_select" ON tasks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "tasks_insert" ON tasks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "tasks_update" ON tasks FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "tasks_delete" ON tasks FOR DELETE USING (user_id = auth.uid());

-- Notes policies
CREATE POLICY "notes_select" ON notes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notes_insert" ON notes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "notes_update" ON notes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notes_delete" ON notes FOR DELETE USING (user_id = auth.uid());

-- Tags policies
CREATE POLICY "tags_select" ON tags FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "tags_insert" ON tags FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "tags_update" ON tags FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "tags_delete" ON tags FOR DELETE USING (user_id = auth.uid());

-- Project tags policies
CREATE POLICY "project_tags_select" ON project_tags FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "project_tags_insert" ON project_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "project_tags_delete" ON project_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
);

-- Task tags policies
CREATE POLICY "task_tags_select" ON task_tags FOR SELECT USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND user_id = auth.uid())
);
CREATE POLICY "task_tags_insert" ON task_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND user_id = auth.uid())
);
CREATE POLICY "task_tags_delete" ON task_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND user_id = auth.uid())
);