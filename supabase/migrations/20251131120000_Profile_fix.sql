-- ==========================================
-- 1. BASE SETUP (Enums & Profiles)
-- ==========================================

-- Create Enums (safely handles duplicates)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.participation_type AS ENUM ('host', 'participant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Profiles Table (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  age INTEGER,
  gender TEXT,
  branch TEXT,
  college TEXT,
  year INTEGER,
  bio TEXT,
  avatar_url TEXT,
  hobbies TEXT,
  interests TEXT,
  persona TEXT,
  organization TEXT,
  domain TEXT,
  specialization TEXT,
  coins INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  sleep_schedule TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. COMMUNITIES & CHAT
-- ==========================================

CREATE TABLE IF NOT EXISTS public.communities (
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

CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (community_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. PROJECTS (Connect Pillar)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Tech',
  duration TEXT,
  team_size INTEGER DEFAULT 1,
  banner_url TEXT,
  is_public BOOLEAN DEFAULT true,
  allow_direct_join BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skills_required TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  openings INTEGER DEFAULT 1,
  skills_required TEXT[] DEFAULT '{}',
  experience_level TEXT DEFAULT 'Beginner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  participation_type participation_type NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.project_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES public.project_roles(id) ON DELETE SET NULL,
  applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  message TEXT,
  portfolio_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  uploader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  resource_type TEXT DEFAULT 'file',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bookmarks_projects (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, project_id)
);

-- ==========================================
-- 4. STARTUPS (Connect Pillar)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Tech',
  stage TEXT DEFAULT 'Idea',
  team_size INTEGER DEFAULT 1,
  banner_url TEXT,
  website_url TEXT,
  is_public BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  founder_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  looking_for TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.startup_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  role_type TEXT DEFAULT 'Member', -- Founder, Partner, Member, Intern
  openings INTEGER DEFAULT 1,
  skills_required TEXT[] DEFAULT '{}',
  equity_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.startup_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (startup_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.startup_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES public.startup_roles(id) ON DELETE SET NULL,
  applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  message TEXT,
  resume_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.startup_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.startup_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  uploader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  resource_type TEXT DEFAULT 'file',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.startup_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bookmarks_startups (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, startup_id)
);

-- ==========================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable on ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks_projects ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks_startups ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 6. SECURITY POLICIES
-- ==========================================

-- PROFILES
CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- COMMUNITY
CREATE POLICY "Public communities" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Create community" ON public.communities FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "View members" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "Join community" ON public.community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "View posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Create post" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- PROJECTS
CREATE POLICY "View projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Create projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "View roles" ON public.project_roles FOR SELECT USING (true);
CREATE POLICY "Host edit roles" ON public.project_roles FOR ALL USING (auth.uid() IN (SELECT host_id FROM public.projects WHERE id = project_id));
CREATE POLICY "View members" ON public.project_members FOR SELECT USING (true);
CREATE POLICY "Join project" ON public.project_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Manage applications" ON public.project_applications FOR ALL USING (auth.uid() = applicant_id OR auth.uid() IN (SELECT host_id FROM public.projects WHERE id = project_id));
CREATE POLICY "Read discussions" ON public.project_discussions FOR SELECT USING (true);
CREATE POLICY "Create discussions" ON public.project_discussions FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Read resources" ON public.project_resources FOR SELECT USING (true);
CREATE POLICY "Hosts manage resources" ON public.project_resources FOR ALL USING (auth.uid() IN (SELECT host_id FROM public.projects WHERE id = project_id));
CREATE POLICY "Read updates" ON public.project_updates FOR SELECT USING (true);
CREATE POLICY "Hosts manage updates" ON public.project_updates FOR ALL USING (auth.uid() IN (SELECT host_id FROM public.projects WHERE id = project_id));
CREATE POLICY "Manage project bookmarks" ON public.bookmarks_projects FOR ALL USING (auth.uid() = user_id);

-- STARTUPS
CREATE POLICY "View startups" ON public.startups FOR SELECT USING (true);
CREATE POLICY "Create startup" ON public.startups FOR INSERT WITH CHECK (auth.uid() = founder_id);
CREATE POLICY "View startup members" ON public.startup_members FOR SELECT USING (true);
CREATE POLICY "Join startup" ON public.startup_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "View startup roles" ON public.startup_roles FOR SELECT USING (true);
CREATE POLICY "Founder edit roles" ON public.startup_roles FOR ALL USING (auth.uid() IN (SELECT founder_id FROM public.startups WHERE id = startup_id));
CREATE POLICY "Manage startup applications" ON public.startup_applications FOR ALL USING (auth.uid() = applicant_id OR auth.uid() IN (SELECT founder_id FROM public.startups WHERE id = startup_id));
CREATE POLICY "Read startup discussions" ON public.startup_discussions FOR SELECT USING (true);
CREATE POLICY "Create startup discussions" ON public.startup_discussions FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Read startup resources" ON public.startup_resources FOR SELECT USING (true);
CREATE POLICY "Founder manage resources" ON public.startup_resources FOR ALL USING (auth.uid() IN (SELECT founder_id FROM public.startups WHERE id = startup_id));
CREATE POLICY "Read startup updates" ON public.startup_updates FOR SELECT USING (true);
CREATE POLICY "Founder manage updates" ON public.startup_updates FOR ALL USING (auth.uid() IN (SELECT founder_id FROM public.startups WHERE id = startup_id));
CREATE POLICY "Manage startup bookmarks" ON public.bookmarks_startups FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 7. FUNCTIONS & TRIGGERS
-- ==========================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, branch, college, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'branch', 'General'),
    COALESCE(NEW.raw_user_meta_data->>'college', 'Not specified'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(md5(random()::text), 1, 6))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate invite codes
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Enable Realtime for Chat (Crucial for instant messaging)
alter publication supabase_realtime add table public.community_posts;
