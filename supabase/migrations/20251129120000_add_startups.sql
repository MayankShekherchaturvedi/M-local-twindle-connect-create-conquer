-- 1. UPGRADE STARTUPS TABLE
-- Ensure the startups table has all the necessary fields for the new UI
ALTER TABLE public.startups 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Tech',
ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'Idea', -- e.g., Idea, MVP, Growth
ADD COLUMN IF NOT EXISTS team_size INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- 2. CREATE STARTUP ROLES TABLE
-- Stores specific roles (e.g. "Co-Founder", "Marketing Lead")
CREATE TABLE IF NOT EXISTS public.startup_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  role_type TEXT DEFAULT 'Member', -- Founder, Partner, Employee, Intern
  openings INTEGER DEFAULT 1,
  skills_required TEXT[] DEFAULT '{}',
  equity_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE STARTUP APPLICATIONS
-- Tracks users applying to specific roles
CREATE TABLE IF NOT EXISTS public.startup_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES public.startup_roles(id) ON DELETE SET NULL,
  applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  message TEXT,
  resume_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE STARTUP DISCUSSIONS
-- Internal discussions for the startup team
CREATE TABLE IF NOT EXISTS public.startup_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE STARTUP RESOURCES
-- Files/Links shared within the startup
CREATE TABLE IF NOT EXISTS public.startup_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  uploader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  resource_type TEXT DEFAULT 'file',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CREATE STARTUP UPDATES
-- Public or internal updates posted by founders
CREATE TABLE IF NOT EXISTS public.startup_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CREATE STARTUP BOOKMARKS
-- Users saving startups
CREATE TABLE IF NOT EXISTS public.bookmarks_startups (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, startup_id)
);

-- 8. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.startup_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks_startups ENABLE ROW LEVEL SECURITY;

-- 9. POLICIES

-- Read Policies (Public/Member)
CREATE POLICY "Public read startup roles" ON public.startup_roles FOR SELECT USING (true);
CREATE POLICY "Public read startup discussions" ON public.startup_discussions FOR SELECT USING (true);
CREATE POLICY "Public read startup updates" ON public.startup_updates FOR SELECT USING (true);
CREATE POLICY "Public read startup resources" ON public.startup_resources FOR SELECT USING (true);

-- Write Policies (Founders & Authorized Users)
-- Note: 'founder_id' exists on the 'startups' table from the master script

CREATE POLICY "Founder edit roles" ON public.startup_roles FOR ALL 
USING (auth.uid() IN (SELECT founder_id FROM public.startups WHERE id = startup_id));

CREATE POLICY "Users manage applications" ON public.startup_applications FOR ALL 
USING (auth.uid() = applicant_id OR auth.uid() IN (SELECT founder_id FROM public.startups WHERE id = startup_id));

CREATE POLICY "Auth create discussions" ON public.startup_discussions FOR INSERT 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Founder manage resources" ON public.startup_resources FOR ALL 
USING (auth.uid() IN (SELECT founder_id FROM public.startups WHERE id = startup_id));

CREATE POLICY "Founder manage updates" ON public.startup_updates FOR ALL 
USING (auth.uid() IN (SELECT founder_id FROM public.startups WHERE id = startup_id));

CREATE POLICY "Users manage bookmarks" ON public.bookmarks_startups FOR ALL 
USING (auth.uid() = user_id);
