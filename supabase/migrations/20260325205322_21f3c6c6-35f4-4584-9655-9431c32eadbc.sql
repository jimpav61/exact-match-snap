-- Create function for auto-updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'team')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. PROJECTS TABLE
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform_type TEXT NOT NULL DEFAULT 'web' CHECK (platform_type IN ('web', 'ios', 'android', 'cross_platform', 'web_and_mobile')),
  current_phase INT NOT NULL DEFAULT 1 CHECK (current_phase IN (1, 2, 3)),
  current_module TEXT DEFAULT '1A',
  design_dna JSONB DEFAULT '{}'::jsonb,
  mobile_config JSONB,
  router_selection TEXT CHECK (router_selection IN ('idea', 'plan', 'app')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_projects_user_id ON public.projects(user_id);

-- 3. MODULE RESPONSES TABLE
CREATE TABLE public.module_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  form_data JSONB DEFAULT '{}'::jsonb,
  generated_prompt_web TEXT,
  generated_prompt_mobile TEXT,
  is_finalized BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.module_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own module responses"
  ON public.module_responses FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = module_responses.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create module responses for their projects"
  ON public.module_responses FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = module_responses.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update their own module responses"
  ON public.module_responses FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = module_responses.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete their own module responses"
  ON public.module_responses FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = module_responses.project_id AND projects.user_id = auth.uid()));

CREATE TRIGGER update_module_responses_updated_at
  BEFORE UPDATE ON public.module_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_module_responses_project_id ON public.module_responses(project_id);

-- 4. DESIGN PRESETS TABLE
CREATE TABLE public.design_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform_type TEXT NOT NULL DEFAULT 'web' CHECK (platform_type IN ('web', 'mobile', 'both')),
  design_dna JSONB DEFAULT '{}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.design_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own presets"
  ON public.design_presets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own presets"
  ON public.design_presets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own presets"
  ON public.design_presets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own presets"
  ON public.design_presets FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_design_presets_user_id ON public.design_presets(user_id);