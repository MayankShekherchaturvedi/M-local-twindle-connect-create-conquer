import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowLeft, Share2, Bookmark, Users, Briefcase, 
  MessageSquare, FileText, Bell, Plus, CheckCircle2, Download, Trash2 
} from "lucide-react";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [project, setProject] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Form States
  const [applicationMsg, setApplicationMsg] = useState("");
  const [newThread, setNewThread] = useState({ title: "", content: "" });
  const [newUpdate, setNewUpdate] = useState({ title: "", content: "" });
  const [newResource, setNewResource] = useState({ title: "", url: "" });

  useEffect(() => {
    if (projectId) fetchProjectData();
  }, [projectId, user]);

  const fetchProjectData = async () => {
    const { data: proj } = await supabase
      .from('projects')
      .select('*, host:profiles!projects_host_id_fkey(*)')
      .eq('id', projectId)
      .single();
    
    if (proj) {
      setProject(proj);
      setIsHost(user?.id === proj.host_id);
    }

    // Fetch sub-data...
    const { data: rolesData } = await supabase.from('project_roles').select('*').eq('project_id', projectId);
    if (rolesData) setRoles(rolesData);

    const { data: membersData } = await supabase.from('project_members').select('*, profile:profiles(*)').eq('project_id', projectId);
    if (membersData) setMembers(membersData);

    const { data: discData } = await supabase.from('project_discussions').select('*, author:profiles(full_name)').eq('project_id', projectId).order('created_at', { ascending: false });
    if (discData) setDiscussions(discData);

    const { data: updatesData } = await supabase.from('project_updates').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
    if (updatesData) setUpdates(updatesData);

    const { data: resData } = await supabase.from('project_resources').select('*').eq('project_id', projectId);
    if (resData) setResources(resData);

    if (user) {
      // Check application
      const { data: app } = await supabase.from('project_applications').select('id').eq('project_id', projectId).eq('applicant_id', user.id).single();
      setHasApplied(!!app);
      
      // Check bookmark
      const { data: book } = await supabase.from('bookmarks_projects').select('*').eq('project_id', projectId).eq('user_id', user.id).single();
      setIsBookmarked(!!book);
    }
  };

  // --- ACTIONS ---

  const handleApply = async (roleId: string) => {
    if (!user) return navigate('/auth');
    const { error } = await supabase.from('project_applications').insert({
      project_id: projectId, role_id: roleId, applicant_id: user.id, message: applicationMsg
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Applied!", description: "Your application has been sent." });
      setHasApplied(true);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied", description: "Project link copied to clipboard." });
  };

  const handleBookmark = async () => {
    if (!user) return navigate('/auth');
    if (isBookmarked) {
      await supabase.from('bookmarks_projects').delete().eq('project_id', projectId).eq('user_id', user.id);
      setIsBookmarked(false);
      toast({ title: "Removed", description: "Removed from saved projects." });
    } else {
      await supabase.from('bookmarks_projects').insert({ project_id: projectId, user_id: user.id });
      setIsBookmarked(true);
      toast({ title: "Saved", description: "Project saved to bookmarks." });
    }
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase.from('project_members').delete().eq('id', memberId);
    if (error) toast({ title: "Error", description: "Failed to remove member", variant: "destructive" });
    else {
      toast({ title: "Removed", description: "Member removed from project." });
      fetchProjectData();
    }
  };

  // ... (Keep existing createDiscussion, postUpdate, addResource logic)
  const createDiscussion = async () => { if (!user) return; await supabase.from('project_discussions').insert({ project_id: projectId, author_id: user.id, title: newThread.title, content: newThread.content }); toast({ title: "Posted" }); setNewThread({title:'', content:''}); fetchProjectData(); };
  const postUpdate = async () => { if (!isHost) return; await supabase.from('project_updates').insert({ project_id: projectId, author_id: user?.id, title: newUpdate.title, content: newUpdate.content }); toast({ title: "Posted" }); setNewUpdate({title:'', content:''}); fetchProjectData(); };
  const addResource = async () => { if (!isHost) return; await supabase.from('project_resources').insert({ project_id: projectId, uploader_id: user?.id, title: newResource.title, file_url: newResource.url, resource_type: 'link' }); toast({ title: "Added" }); setNewResource({title:'', url:''}); fetchProjectData(); };

  if (!project) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      {/* HEADER SECTION */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-6 py-8">
          <Button variant="ghost" onClick={() => navigate('/connect')} className="mb-4 pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Discover
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-primary">{project.title}</h1>
                {project.status === 'open' && <Badge className="bg-green-500">Hiring</Badge>}
              </div>
              <div className="flex flex-wrap gap-4 items-center text-sm text-muted-foreground">
                <Badge variant="outline">{project.category}</Badge>
                <span className="flex items-center gap-1"><Users className="h-4 w-4"/> {members.length} / {project.team_size} Team Size</span>
                <span className="flex items-center gap-1"><Briefcase className="h-4 w-4"/> {project.duration}</span>
                <span>• Hosted by {project.host?.full_name}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBookmark}>
                <Bookmark className={`mr-2 h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : ""}`}/> 
                {isBookmarked ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" onClick={handleShare}><Share2 className="mr-2 h-4 w-4"/> Share</Button>
              
              {/* Feature #2: Manage Applicants Link */}
              {isHost ? (
                <Button onClick={() => navigate(`/connect/projects/${projectId}/applications`)}>Manage Applicants</Button>
              ) : hasApplied ? (
                <Button disabled variant="secondary"><CheckCircle2 className="mr-2 h-4 w-4"/> Applied</Button>
              ) : (
                <Button disabled>Select a Role below</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABS SECTION */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8 overflow-x-auto">
            {["Overview", "Roles", "Discussions", "Members", "Resources", "Updates"].map(tab => (
              <TabsTrigger key={tab} value={tab.toLowerCase()} className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-0 py-3">{tab}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <Card><CardHeader><CardTitle>Description</CardTitle></CardHeader><CardContent><p className="whitespace-pre-wrap text-muted-foreground">{project.description}</p></CardContent></Card>
          </TabsContent>

          <TabsContent value="roles" className="mt-8">
            <div className="grid gap-4">
              {roles.map(role => (
                <Card key={role.id}>
                  <CardHeader><div className="flex justify-between"><CardTitle className="text-xl">{role.title}</CardTitle><Dialog><DialogTrigger asChild><Button disabled={hasApplied || isHost}>{hasApplied ? "Applied" : "Apply"}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Apply for {role.title}</DialogTitle></DialogHeader><div className="space-y-4 pt-4"><Textarea placeholder="Why fit?" onChange={(e) => setApplicationMsg(e.target.value)} /><Button className="w-full" onClick={() => handleApply(role.id)}>Submit</Button></div></DialogContent></Dialog></div></CardHeader>
                  <CardContent><p className="text-muted-foreground">{role.description}</p><div className="mt-2 flex gap-2"><Badge variant="secondary">{role.experience_level}</Badge><span>{role.openings} Openings</span></div></CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Feature #3: Manage Members */}
          <TabsContent value="members" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {members.map(member => (
                <Card key={member.id}>
                  <CardContent className="flex items-center justify-between pt-6">
                    <div className="flex items-center gap-4">
                      <Avatar><AvatarFallback>{member.profile?.full_name?.[0]}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-bold">{member.profile?.full_name}</p>
                        <Badge variant="outline" className="mt-1 capitalize">{member.participation_type}</Badge>
                      </div>
                    </div>
                    {/* Only Host can remove others (and not themselves) */}
                    {isHost && member.user_id !== user?.id && (
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeMember(member.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ... Keep Discussions, Updates, Resources simple for brevity (same as previous) ... */}
          <TabsContent value="discussions" className="mt-8"><div className="flex justify-between mb-6"><h2 className="text-2xl font-bold">Discussions</h2><Dialog><DialogTrigger asChild><Button>New Thread</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>New Thread</DialogTitle></DialogHeader><div className="space-y-4 pt-4"><Input placeholder="Title" value={newThread.title} onChange={e=>setNewThread({...newThread, title:e.target.value})}/><Textarea placeholder="Content" value={newThread.content} onChange={e=>setNewThread({...newThread, content:e.target.value})}/><Button onClick={createDiscussion}>Post</Button></div></DialogContent></Dialog></div><div className="space-y-4">{discussions.map(d=><Card key={d.id}><CardHeader><CardTitle>{d.title}</CardTitle><p className="text-xs text-muted-foreground">by {d.author?.full_name}</p></CardHeader><CardContent>{d.content}</CardContent></Card>)}</div></TabsContent>
          <TabsContent value="updates" className="mt-8">{isHost && <Card className="mb-8"><CardHeader><CardTitle>Post Update</CardTitle></CardHeader><CardContent className="space-y-4"><Input placeholder="Title" value={newUpdate.title} onChange={e=>setNewUpdate({...newUpdate, title:e.target.value})}/><Textarea placeholder="Content" value={newUpdate.content} onChange={e=>setNewUpdate({...newUpdate, content:e.target.value})}/><Button onClick={postUpdate}>Publish</Button></CardContent></Card>}<div className="space-y-6">{updates.map(u=><div key={u.id} className="border-l-2 pl-4"><h3 className="font-bold">{u.title}</h3><p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</p><p className="mt-2">{u.content}</p></div>)}</div></TabsContent>
          <TabsContent value="resources" className="mt-8">{isHost && <div className="flex gap-2 mb-4"><Input placeholder="Title" value={newResource.title} onChange={e=>setNewResource({...newResource, title:e.target.value})}/><Input placeholder="URL" value={newResource.url} onChange={e=>setNewResource({...newResource, url:e.target.value})}/><Button onClick={addResource}>Add</Button></div>}<div className="grid gap-4">{resources.map(r=><Card key={r.id} className="p-4 flex justify-between items-center"><div className="flex items-center gap-4"><FileText className="h-5 w-5 text-primary"/><p className="font-medium">{r.title}</p></div><Button variant="ghost" onClick={()=>window.open(r.file_url)}>Open</Button></Card>)}</div></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetails;
