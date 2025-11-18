import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Lock, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Community = () => {
  const [publicCommunities, setPublicCommunities] = useState<any[]>([]);
  const [privateCommunities, setPrivateCommunities] = useState<any[]>([]);
  const [userCommunities, setUserCommunities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    isPublic: true
  });

  useEffect(() => {
    fetchCommunities();
    if (user) {
      fetchUserCommunities();
    }
  }, [user]);

  const fetchCommunities = async () => {
    const { data, error } = await supabase
      .from('communities')
      .select('*, community_members(count)')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setPublicCommunities(data);
    }
  };

  const fetchUserCommunities = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('community_members')
      .select('communities(*, community_members(count))')
      .eq('user_id', user.id);
    
    if (!error && data) {
      const communities = data.map(d => d.communities).filter(Boolean);
      setUserCommunities(communities);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }

    // Generate invite code
    const { data: codeData } = await supabase.rpc('generate_invite_code');
    
    const { data, error } = await supabase.from('communities').insert({
      name: newCommunity.name,
      description: newCommunity.description,
      is_public: newCommunity.isPublic,
      creator_id: user.id,
      invite_code: codeData
    }).select().single();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      // Auto-join creator
      await supabase.from('community_members').insert({
        community_id: data.id,
        user_id: user.id
      });

      toast({
        title: "Success!",
        description: `Community created! ${!newCommunity.isPublic ? `Invite code: ${codeData}` : ''}`
      });
      setShowCreate(false);
      setNewCommunity({ name: "", description: "", isPublic: true });
      fetchCommunities();
      fetchUserCommunities();
    }
  };

  const handleJoinWithCode = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: community } = await supabase
      .from('communities')
      .select('id')
      .eq('invite_code', inviteCode)
      .single();

    if (!community) {
      toast({
        title: "Invalid code",
        description: "No community found with this invite code.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase.from('community_members').insert({
      community_id: community.id,
      user_id: user.id
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Joined!",
        description: "You've successfully joined the community."
      });
      setInviteCode("");
      fetchUserCommunities();
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const { error } = await supabase.from('community_members').insert({
      community_id: communityId,
      user_id: user.id
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Joined!",
        description: "You've successfully joined the community."
      });
      fetchUserCommunities();
    }
  };

  const filteredPublic = publicCommunities.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Communities</h1>
          <div className="flex gap-4 flex-wrap">
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button className="rounded-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Community
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Community</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateCommunity} className="space-y-4">
                  <div>
                    <Label>Community Name</Label>
                    <Input
                      value={newCommunity.name}
                      onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newCommunity.description}
                      onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={newCommunity.isPublic}
                      onChange={(e) => setNewCommunity({ ...newCommunity, isPublic: e.target.checked })}
                    />
                    <Label htmlFor="isPublic">Public Community</Label>
                  </div>
                  <Button type="submit" className="w-full">Create</Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-full">
                  <Lock className="h-4 w-4 mr-2" />
                  Join with Invite Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Private Community</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Invite Code</Label>
                    <Input
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Enter 8-character code"
                    />
                  </div>
                  <Button onClick={handleJoinWithCode} className="w-full">Join Community</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="your" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="your" className="rounded-full">
              Your Communities
            </TabsTrigger>
            <TabsTrigger value="explore" className="rounded-full">
              Explore Communities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="your">
            <div className="relative mb-6 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search your communities..."
                className="pl-12 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {userCommunities.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <p>You haven't joined any communities yet.</p>
                <p className="mt-2">Explore public communities or create your own!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCommunities.map((community) => (
                  <Card key={community.id} className="p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-primary">{community.name}</h3>
                      {community.is_public ? (
                        <Globe className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {community.description || "No description"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {community.community_members?.[0]?.count || 0} members
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="explore">
            <div className="relative mb-6 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search communities..."
                className="pl-12 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublic.map((community) => (
                <Card key={community.id} className="p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-primary">{community.name}</h3>
                    <Globe className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {community.description || "No description"}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {community.community_members?.[0]?.count || 0} members
                  </p>
                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={() => handleJoinCommunity(community.id)}
                  >
                    Join Community
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
