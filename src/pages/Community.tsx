import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Lock, Globe, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Community = () => {
  const [publicCommunities, setPublicCommunities] = useState<any[]>([]);
  const [userCommunities, setUserCommunities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [newCom, setNewCom] = useState({ name: "", desc: "", isPublic: true });

  useEffect(() => {
    fetchCommunities();
    if (user) fetchUserCommunities();
  }, [user]);

  const fetchCommunities = async () => {
    const { data } = await supabase
      .from('communities')
      .select('*, community_members(count)')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    if (data) setPublicCommunities(data);
  };

  const fetchUserCommunities = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('community_members')
      .select('communities(*, community_members(count))')
      .eq('user_id', user.id);
    
    if (data) setUserCommunities(data.map(d => d.communities).filter(Boolean));
  };

  const requireLogin = () => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please login to create or join communities.", variant: "destructive" });
      navigate('/auth');
      return false;
    }
    return true;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireLogin()) return;

    const { data: code } = await supabase.rpc('generate_invite_code');
    
    const { data: community, error } = await supabase.from('communities').insert({
      name: newCom.name,
      description: newCom.desc,
      is_public: newCom.isPublic,
      creator_id: user!.id,
      invite_code: code
    }).select().single();

    if (error) {
      return toast({ title: "Error", description: error.message, variant: "destructive" });
    }

    // Auto-join the creator
    await supabase.from('community_members').insert({
      community_id: community.id,
      user_id: user!.id
    });

    toast({ title: "Success!", description: "Community created." });
    setCreateOpen(false);
    setNewCom({ name: "", desc: "", isPublic: true });
    
    // Redirect to the new chat page
    navigate(`/community/${community.id}`);
  };

  const handleJoinByCode = async () => {
    if (!requireLogin()) return;

    const { data: community } = await supabase.from('communities').select('id').eq('invite_code', inviteCode).single();
    
    if (!community) {
      return toast({ title: "Invalid Code", description: "No community found with this code.", variant: "destructive" });
    }

    const { error } = await supabase.from('community_members').insert({
      community_id: community.id,
      user_id: user!.id
    });

    if (!error) toast({ title: "Joined!", description: "Welcome to the community." });
    
    // Redirect to chat (even if already joined)
    navigate(`/community/${community.id}`);
  };

  const handleJoinPublic = async (communityId: string) => {
    if (!requireLogin()) return;

    await supabase.from('community_members').insert({
      community_id: communityId,
      user_id: user!.id
    }); 

    navigate(`/community/${communityId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-4xl font-bold text-primary">Communities</h1>
          
          <div className="flex gap-3">
            {/* CREATE BUTTON */}
            <Dialog open={createOpen} onOpenChange={(open) => {
              if (open && !requireLogin()) return;
              setCreateOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button className="rounded-full shadow-md"><Plus className="mr-2 h-4 w-4"/> Create Community</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create New Community</DialogTitle></DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 pt-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={newCom.name} onChange={e => setNewCom({...newCom, name: e.target.value})} required placeholder="e.g. React Developers" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={newCom.desc} onChange={e => setNewCom({...newCom, desc: e.target.value})} placeholder="What is this community about?" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="public" 
                      checked={newCom.isPublic} 
                      onCheckedChange={(c) => setNewCom({...newCom, isPublic: c as boolean})} 
                    />
                    <Label htmlFor="public" className="cursor-pointer">Public Community (Anyone can see)</Label>
                  </div>
                  <Button type="submit" className="w-full">Create & Open Chat</Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* JOIN CODE BUTTON */}
            <Dialog>
              <DialogTrigger asChild onClick={(e) => { if(!user) { e.preventDefault(); requireLogin(); } }}>
                <Button variant="outline" className="rounded-full"><Lock className="mr-2 h-4 w-4"/> Join via Code</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Enter Invite Code</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input placeholder="Enter 8-character code" value={inviteCode} onChange={e => setInviteCode(e.target.value)} />
                  <Button onClick={handleJoinByCode} className="w-full">Join Community</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="your" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="your">Your Communities</TabsTrigger>
            <TabsTrigger value="explore">Explore</TabsTrigger>
          </TabsList>

          {/* YOUR COMMUNITIES */}
          <TabsContent value="your">
            {!user ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                <p className="mb-4">Please login to view your communities.</p>
                <Button onClick={() => navigate('/auth')}>Login Now</Button>
              </div>
            ) : userCommunities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                You haven't joined any communities yet. Check the "Explore" tab!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {userCommunities.map(c => (
                  <Card 
                    key={c.id} 
                    onClick={() => navigate(`/community/${c.id}`)} 
                    className="p-6 hover:shadow-lg transition cursor-pointer border-2 hover:border-primary/50 group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-primary group-hover:underline">{c.name}</h3>
                      {c.is_public ? <Globe className="h-4 w-4 text-muted-foreground"/> : <Lock className="h-4 w-4 text-muted-foreground"/>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">{c.description || "No description provided."}</p>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" /> {c.community_members?.[0]?.count || 1} members
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* EXPLORE */}
          <TabsContent value="explore">
            <div className="relative max-w-md mx-auto mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-10 rounded-full" 
                placeholder="Search communities..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {publicCommunities
                .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(c => (
                  <Card key={c.id} className="p-6 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-primary">{c.name}</h3>
                        <Globe className="h-4 w-4 text-muted-foreground"/>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 h-10">{c.description || "No description."}</p>
                      <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                        <Users className="h-3 w-3" /> {c.community_members?.[0]?.count || 0} members
                      </div>
                    </div>
                    <Button onClick={() => handleJoinPublic(c.id)} className="w-full rounded-full" variant="secondary">
                      Join & Chat
                    </Button>
                  </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Community;
