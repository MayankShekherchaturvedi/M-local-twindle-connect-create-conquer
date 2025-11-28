import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Share2, Bookmark, CheckCircle2, Trash2, FileText, Bell, Plus, MessageSquare } from "lucide-react";

const StartupDetails = () => {
  const { startupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [startup, setStartup] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [isFounder, setIsFounder] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Forms
  const [applicationMsg, setApplicationMsg] = useState("");
  const [newThread, setNewThread] = useState({ title: "", content: "" });
  const [newUpdate, setNewUpdate] = useState({ title: "", content: "" });
  const [newResource, setNewResource] = useState({ title: "", url: "" });

  useEffect(() => {
    if (startupId) fetchStartupData();
  }, [startupId, user]);

  const fetchStartupData = async () => {
    // 1. Startup
    const { data: st } = await supabase.from('startups').select('*, founder:profiles!startups_founder_id_fkey(*)').eq('id', startupId).single();
    if (st) {
      setStartup(st);
      setIsFounder(user?.id === st.founder_id);
    }

    // 2. Roles
    const { data: r } = await supabase.from('startup_roles').select('*').eq('startup_id', startupId);
    if (r) setRoles(r);

    // 3. Members
    const { data: m } = await supabase.from('startup_members').select('*, profile:profiles(*)').eq('startup_id', startupId);
    if (m) setMembers(m);

    // 4. Content
    const { data: d } = await supabase.from('startup_discussions').select('*, author:profiles(full_name)').eq('startup_id', startupId).order('created_at', { ascending: false });
    if (d) setDiscussions(d);

    const { data: u } = await supabase.from('startup_updates').select('*').eq('startup_id', startupId).order('created_at', { ascending: false });
    if (u) setUpdates(u);

    const { data: res } = await supabase.from('startup_resources').select('*').eq('startup_id', startupId);
    if (res) setResources(res);

    // 5. User Status
    if (user) {
      const { data: app } = await supabase.from('startup_applications').select('id').eq('startup_id', startupId).eq('applicant_id', user.id).single();
      setHasApplied(!!app);

      const { data: book } = await supabase.from('bookmarks_startups').select('*').eq('startup_id', startupId).eq('user_id', user.id).single();
      setIsBookmarked(!!book);
    }
  };

  const handleApply = async (roleId: string) => {
    if (!user) return navigate('/auth');
    const { error } = await supabase.from('startup_applications').insert({
      startup_id: startupId, role_id: roleId, applicant_id: user.id, message: applicationMsg
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Applied!", description: "Application sent." });
      setHasApplied(true);
    }
  };

  const handleBookmark = async () => {
    if (!user) return navigate('/auth');
    if (isBookmarked) {
      await supabase.from('bookmarks_startups').delete().eq('startup_id', startupId).eq('user_id', user.id);
      setIsBookmarked(false);
      toast({ title: "Removed from Saved" });
    } else {
      await supabase.from('bookmarks_startups').insert({ startup_id: startupId, user_id: user.id });
      setIsBookmarked(true);
      toast({ title: "Saved to Bookmarks" });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied" });
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase.from('startup_members').delete().eq('id', memberId);
    if (error) toast({ title: "Error", description: "Failed to remove member", variant: "destructive" });
    else {
      toast({ title: "Member Removed" });
      fetchStartupData();
    }
  };

  // Content Creation
  const createDiscussion = async () => { if (!user) return; await supabase.from('startup_discussions').insert({ startup_id: startupId, author_id: user.id, title: newThread.title, content: newThread.content }); toast({ title: "Posted" }); setNewThread({title:'',content:''}); fetchStartupData(); };
  const postUpdate = async () => { if (!isFounder) return; await supabase.from('startup_updates').insert({ startup_id: startupId, author_id: user?.id, title: newUpdate.title, content: newUpdate.content }); toast({ title: "Published" }); setNewUpdate({title:'',content:''}); fetchStartupData(); };
  const addResource = async () => { if (!isFounder) return; await supabase.from('startup_resources').insert({ startup_id: startupId, uploader_id: user?.id, title: newResource.title, file_url: newResource.url, resource_type: 'link' }); toast({ title: "Added" }); setNewResource({title:'',url:''}); fetchStartupData(); };

  if (!startup) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      {/* HEADER */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-6 py-8">
          <Button variant="ghost" onClick={() => navigate('/connect')} className="mb-4 pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Connect
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
                {startup.name} <Badge variant="outline">{startup.stage}</Badge>
              </h1>
              <p className="text-muted-foreground max-w-2xl">{startup.description}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBookmark}>
                <Bookmark className={`mr-2 h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : ""}`}/> 
                {isBookmarked ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" onClick={handleShare}><Share2 className="mr-2 h-4 w-4"/> Share</Button>
              
              {isFounder ? (
                <Button onClick={() => navigate(`/connect/startups/${startupId}/applications`)}>Manage Applicants</Button>
              ) : hasApplied ? (
                <Button disabled variant="secondary"><CheckCircle2 className="mr-2 h-4 w-4"/> Applied</Button>
              ) : (
                <Button disabled>Select Role to Apply</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8 overflow-x-auto">
            {["Overview", "Roles", "Team", "Discussions", "Updates", "Resources"].map(tab => (
              <TabsTrigger key={tab} value={tab.toLowerCase()} className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-0 py-3">{tab}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <Card><CardHeader><CardTitle>Mission</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{startup.description}</p></CardContent></Card>
          </TabsContent>

          <TabsContent value="roles" className="mt-8">
            <div className="grid gap-4">
              {roles.map(role => (
                <Card key={role.id}>
                  <CardHeader><div className="flex justify-between"><div><CardTitle>{role.title}</CardTitle><Badge className="mt-2">{role.role_type}</Badge></div><Dialog><DialogTrigger asChild><Button disabled={hasApplied}>{hasApplied ? "Applied" : "Apply"}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Apply for {role.title}</DialogTitle></DialogHeader><div className="space-y-4 pt-4"><Textarea placeholder="Motivation?" onChange={(e) => setApplicationMsg(e.target.value)} /><Button className="w-full" onClick={() => handleApply(role.id)}>Send Application</Button></div></DialogContent></Dialog></div></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{role.description}</p><p className="text-xs font-mono bg-muted p-2 rounded inline-block mt-2">Equity: {role.equity_range || "Negotiable"}</p></CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {members.map(m => (
                <Card key={m.id}>
                  <CardContent className="flex items-center justify-between pt-6">
                    <div className="flex items-center gap-4">
                      <Avatar><AvatarFallback>{m.profile?.full_name?.[0]}</AvatarFallback></Avatar>
                      <div><p className="font-bold">{m.profile?.full_name}</p><p className="text-xs text-muted-foreground">{m.role}</p></div>
                    </div>
                    {isFounder && m.user_id !== user?.id && <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeMember(m.id)}><Trash2 className="h-4 w-4"/></Button>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ... Discussions, Updates, Resources (Identical logic) ... */}
          <TabsContent value="discussions" className="mt-8"><div className="flex justify-between mb-6"><h2 className="text-2xl font-bold">Discussions</h2><Dialog><DialogTrigger asChild><Button>New Thread</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>New Thread</DialogTitle></DialogHeader><div className="space-y-4 pt-4"><Input placeholder="Title" value={newThread.title} onChange={e=>setNewThread({...newThread, title:e.target.value})}/><Textarea placeholder="Content" value={newThread.content} onChange={e=>setNewThread({...newThread, content:e.target.value})}/><Button onClick={createDiscussion}>Post</Button></div></DialogContent></Dialog></div><div className="space-y-4">{discussions.map(d=><Card key={d.id}><CardHeader><CardTitle>{d.title}</CardTitle><p className="text-xs text-muted-foreground">by {d.author?.full_name}</p></CardHeader><CardContent>{d.content}</CardContent></Card>)}</div></TabsContent>
          <TabsContent value="updates" className="mt-8">{isFounder && <Card className="mb-8"><CardHeader><CardTitle>Post Update</CardTitle></CardHeader><CardContent className="space-y-4"><Input placeholder="Title" value={newUpdate.title} onChange={e=>setNewUpdate({...newUpdate, title:e.target.value})}/><Textarea placeholder="Content" value={newUpdate.content} onChange={e=>setNewUpdate({...newUpdate, content:e.target.value})}/><Button onClick={postUpdate}>Publish</Button></CardContent></Card>}<div className="space-y-6">{updates.map(u=><div key={u.id} className="border-l-2 pl-4"><h3 className="font-bold">{u.title}</h3><p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</p><p className="mt-2">{u.content}</p></div>)}</div></TabsContent>
          <TabsContent value="resources" className="mt-8">{isFounder && <div className="flex gap-2 mb-4"><Input placeholder="Title" value={newResource.title} onChange={e=>setNewResource({...newResource, title:e.target.value})}/><Input placeholder="URL" value={newResource.url} onChange={e=>setNewResource({...newResource, url:e.target.value})}/><Button onClick={addResource}>Add</Button></div>}<div className="grid gap-4">{resources.map(r=><Card key={r.id} className="p-4 flex justify-between items-center"><div className="flex items-center gap-4"><FileText className="h-5 w-5 text-primary"/><p className="font-medium">{r.title}</p></div><Button variant="ghost" onClick={()=>window.open(r.file_url)}>Open</Button></Card>)}</div></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StartupDetails;
