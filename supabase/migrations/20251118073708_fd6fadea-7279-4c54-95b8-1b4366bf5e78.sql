-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create enum for project participation type
CREATE TYPE public.participation_type AS ENUM ('host', 'participant');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  branch TEXT NOT NULL,
  college TEXT NOT NULL,
  year INTEGER,
  sleep_schedule TEXT,
  avatar_url TEXT,
  bio TEXT,
  coins INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create skills table
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interests table
CREATE TABLE public.interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  interest_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communities table
CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  branch_category TEXT,
  invite_code TEXT UNIQUE,
  creator_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_members table
CREATE TABLE public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (community_id, user_id)
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skills_required TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_members table
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  participation_type participation_type NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);

-- Create startups table
CREATE TABLE public.startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  founder_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  looking_for TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create startup_members table
CREATE TABLE public.startup_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (startup_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_members ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "User roles are viewable by everyone"
  ON public.user_roles FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for skills
CREATE POLICY "Skills are viewable by everyone"
  ON public.skills FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own skills"
  ON public.skills FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for interests
CREATE POLICY "Interests are viewable by everyone"
  ON public.interests FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own interests"
  ON public.interests FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for communities
CREATE POLICY "Public communities are viewable by everyone"
  ON public.communities FOR SELECT
  USING (is_public = true OR EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_id = id AND user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can create communities"
  ON public.communities FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own communities"
  ON public.communities FOR UPDATE
  USING (auth.uid() = creator_id);

-- RLS Policies for community_members
CREATE POLICY "Community members are viewable by community members"
  ON public.community_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.community_members cm
    WHERE cm.community_id = community_id AND cm.user_id = auth.uid()
  ));

CREATE POLICY "Users can join communities"
  ON public.community_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities"
  ON public.community_members FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for projects
CREATE POLICY "Projects are viewable by everyone"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = host_id);

-- RLS Policies for project_members
CREATE POLICY "Project members are viewable by everyone"
  ON public.project_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join projects"
  ON public.project_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave projects"
  ON public.project_members FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for startups
CREATE POLICY "Startups are viewable by everyone"
  ON public.startups FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create startups"
  ON public.startups FOR INSERT
  WITH CHECK (auth.uid() = founder_id);

CREATE POLICY "Founders can update own startups"
  ON public.startups FOR UPDATE
  USING (auth.uid() = founder_id);

-- RLS Policies for startup_members
CREATE POLICY "Startup members are viewable by everyone"
  ON public.startup_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join startups"
  ON public.startup_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave startups"
  ON public.startup_members FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, branch, college)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'branch', 'General'),
    COALESCE(NEW.raw_user_meta_data->>'college', 'Not specified')
  );
  RETURN NEW;
END;
$$;

-- Trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate unique invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM public.communities WHERE invite_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$;

-- Insert default communities for all branches
INSERT INTO public.communities (name, description, is_public, is_default, branch_category) VALUES
-- Technology & Computing
('Computer Science Community', 'Connect with CS students worldwide', true, true, 'Computer Science'),
('AI/ML Enthusiasts', 'Machine Learning and AI discussions', true, true, 'AI/ML'),
('Data Science Hub', 'Data analysis and visualization', true, true, 'Data Science'),
('Software Engineering', 'Software development best practices', true, true, 'Software Engineering'),
('Cybersecurity Circle', 'Security and ethical hacking', true, true, 'Cybersecurity'),

-- Engineering
('Mechanical Engineering', 'Mechanical design and manufacturing', true, true, 'Mechanical'),
('Electrical Engineering', 'Circuits, power systems, and electronics', true, true, 'Electrical'),
('Civil Engineering', 'Construction and infrastructure', true, true, 'Civil'),
('Chemical Engineering', 'Process engineering and chemistry', true, true, 'Chemical'),

-- Design & Creative
('UI/UX Designers', 'User experience and interface design', true, true, 'UI/UX'),
('Graphic Design Studio', 'Visual design and branding', true, true, 'Graphic Design'),
('Architecture Students', 'Architectural design and planning', true, true, 'Architecture'),

-- Business & Entrepreneurship
('Startup Founders Circle', 'Build your startup with peers', true, true, 'Entrepreneurship'),
('Business Strategy', 'Business planning and growth', true, true, 'Business'),
('Marketing Innovators', 'Digital and traditional marketing', true, true, 'Marketing'),

-- Science & Research
('Biotechnology Research', 'Life sciences and biotech', true, true, 'Biotechnology'),
('Physics Research Lab', 'Theoretical and applied physics', true, true, 'Physics'),
('Chemistry Circle', 'Chemical research and experiments', true, true, 'Chemistry'),

-- Medical & Healthcare
('Medical Students Unite', 'MBBS and medical education', true, true, 'Medicine'),
('Nursing Community', 'Healthcare and patient care', true, true, 'Nursing'),

-- Law & Policy
('Law Students Forum', 'Legal discussions and case studies', true, true, 'Law'),
('Public Policy Thinkers', 'Policy analysis and governance', true, true, 'Public Policy');

-- Function to auto-join user to default community based on branch
CREATE OR REPLACE FUNCTION public.auto_join_default_community()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  community_id_var UUID;
BEGIN
  -- Find matching default community based on branch
  SELECT id INTO community_id_var
  FROM public.communities
  WHERE is_default = true
    AND (branch_category = NEW.branch OR branch_category ILIKE '%' || NEW.branch || '%')
  LIMIT 1;
  
  -- If found, auto-join the user
  IF community_id_var IS NOT NULL THEN
    INSERT INTO public.community_members (community_id, user_id)
    VALUES (community_id_var, NEW.id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-join default community on profile creation
CREATE TRIGGER auto_join_community_on_signup
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.auto_join_default_community();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_startups_updated_at
  BEFORE UPDATE ON public.startups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();