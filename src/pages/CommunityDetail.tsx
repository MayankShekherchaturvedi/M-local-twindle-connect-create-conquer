import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, ArrowLeft, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    username: string;
  };
}

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth(); // Check loading state
  const { toast } = useToast();
  
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent redirecting while auth is still loading
    if (loading) return;

    if (!user) {
        toast({ title: "Access Denied", description: "Please login to view this community.", variant: "destructive" });
        navigate("/auth");
        return;
    }

    if (!id) return;

    // Fetch Community Info
    supabase.from('communities').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error) {
          toast({ title: "Error", description: "Community not found", variant: "destructive" });
          navigate("/community");
        } else {
          setCommunity(data);
        }
      });

    // Fetch messages
    fetchPosts();

    // Subscribe to Realtime messages
    const channel = supabase
      .channel('public:community_posts')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'community_posts', 
        filter: `community_id=eq.${id}` 
      }, (payload) => {
        fetchPosts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, user, loading, navigate]);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('community_posts')
      .select(`
        *,
        profiles (full_name, username)
      `)
      .eq('community_id', id)
      .order('created_at', { ascending: true });
    
    if (data) {
      setPosts(data);
      // Auto-scroll to bottom
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const { error } = await supabase.from('community_posts').insert({
      community_id: id,
      user_id: user.id,
      content: newMessage
    });

    if (error) {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    } else {
      setNewMessage("");
      fetchPosts(); // Instant update
    }
  };

  // Show loading screen while checking session or data
  if (loading || !community) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  return (
    // FIX: Use h-screen to lock the page height
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />
      
      {/* Main Content Area - Grows to fill space */}
      <div className="flex-1 container mx-auto px-4 py-4 flex flex-col max-w-4xl min-h-0">
        
        {/* Header */}
        <div className="flex-none flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/community")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-primary truncate">{community.name}</h1>
              <p className="text-xs text-muted-foreground line-clamp-1">{community.description}</p>
            </div>
          </div>
          {community.invite_code && (
            <div className="hidden sm:block bg-muted px-3 py-1 rounded text-xs font-mono text-muted-foreground">
              Code: {community.invite_code}
            </div>
          )}
        </div>

        {/* Chat Card - Fills remaining height */}
        <Card className="flex-1 flex flex-col overflow-hidden border-2 shadow-sm min-h-0">
          <div className="flex-none p-3 border-b bg-muted/30 flex items-center gap-2 text-sm font-medium text-primary">
            <MessageSquare className="h-4 w-4" /> Community Forum
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 text-sm">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                posts.map((post) => (
                  <div 
                    key={post.id} 
                    className={`flex gap-3 ${post.user_id === user?.id ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {post.profiles?.full_name?.substring(0, 2).toUpperCase() || "CN"}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col max-w-[75%] ${post.user_id === user?.id ? "items-end" : "items-start"}`}>
                      <span className="text-[10px] text-muted-foreground mb-1 px-1">
                        {post.profiles?.full_name}
                      </span>
                      <div 
                        className={`p-3 rounded-lg text-sm shadow-sm break-words ${
                          post.user_id === user?.id 
                            ? "bg-primary text-primary-foreground rounded-tr-none" 
                            : "bg-muted text-foreground rounded-tl-none"
                        }`}
                      >
                        {post.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="flex-none p-4 border-t bg-background">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder="Type a message..." 
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CommunityDetail;
