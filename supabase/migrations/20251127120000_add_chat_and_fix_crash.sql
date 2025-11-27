-- 1. FIX THE "INFINITE RECURSION" CRASH
-- The old policy tried to check membership by reading the membership table, causing a loop.
DROP POLICY IF EXISTS "Community members are viewable by community members" ON public.community_members;

-- New safe policy: Allow everyone to see who is in a community (needed for member counts & lists)
CREATE POLICY "Community members are viewable by everyone" 
ON public.community_members FOR SELECT 
USING (true);

-- 2. CREATE THE MISSING CHAT TABLE
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ENABLE SECURITY FOR THE CHAT
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read chat messages
CREATE POLICY "Posts are viewable by everyone" 
ON public.community_posts FOR SELECT 
USING (true);

-- Policy: Only logged-in users can post messages (and they can only post as themselves)
CREATE POLICY "Authenticated users can create posts" 
ON public.community_posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);
