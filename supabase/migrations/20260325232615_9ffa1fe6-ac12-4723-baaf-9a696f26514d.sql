
CREATE TABLE public.prompt_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  form_data jsonb DEFAULT '{}'::jsonb,
  generated_prompt text NOT NULL,
  platform_type text NOT NULL DEFAULT 'web',
  version_number integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own prompt history"
  ON public.prompt_history FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = prompt_history.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can insert their own prompt history"
  ON public.prompt_history FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = prompt_history.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Users can delete their own prompt history"
  ON public.prompt_history FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = prompt_history.project_id AND projects.user_id = auth.uid()));
