import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Connect = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  
  // Track which IDs the current user has joined
  const [joinedProjectIds, setJoinedProjectIds] = useState<Set<string>>(new Set());
  const [joinedStartupIds, setJoinedStartupIds] = useState<Set<string>>(new Set());

  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateStartup, setShowCreateStartup] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    skills: ""
  });

  const [newStartup, setNewStartup] = useState({
    name: "",
    description: "",
    lookingFor: ""
  });

  useEffect(() => {
    fetchProjects();
    fetchStartups();

    // Subscribe to realtime updates for new content
    const projectSub = supabase.channel('public:projects')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'projects' }, fetchProjects)
      .subscribe();
      
    const startupSub = supabase.channel('public:startups')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'startups' }, fetchStartups)
      .subscribe();

    return () => {
      supabase.removeChannel(projectSub);
      supabase.removeChannel(startupSub);
    };
  }, []);

  // Fetch joined status whenever user changes
  useEffect(() => {
    if (user) fetchJoinedStatus();
  }, [user]);

  const fetchJoinedStatus = async () => {
    if (!user) return;

    // Get joined projects
    const { data: pData } = await supabase.from('project_members').select('project_id').eq('user_id', user.id);
    if (pData) setJoinedProjectIds(new Set(pData.map(i => i.project_id)));

    // Get joined startups
    const { data: sData } = await supabase.from('startup_members').select('startup_id').eq('user_id', user.id);
    if (sData) setJoinedStartupIds(new Set(sData.map(i => i.startup_id)));
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(`*, host:profiles!projects_host_id_fkey(full_name), project_members(count)`)
      .order('created_at', { ascending: false });
    
    if (!error && data) setProjects(data);
  };

  const fetchStartups = async () => {
    const { data, error } = await supabase
      .from('startups')
      .select(`*, founder:profiles!startups_founder_id_fkey(full_name), startup_members(count)`)
      .order('created_at', { ascending: false });
    
    if (!error && data) setStartups(data);
  };

  // Helper to check login status before actions
  const requireLogin = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to continue.", variant: "destructive" });
      navigate('/auth');
      return false;
    }
    return true;
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireLogin()) return;

    const { data, error } = await supabase.from('projects').insert({
      title: newProject.title,
      description: newProject.description,
      host_id: user!.id,
      skills_required: newProject.skills.split(',').map(s => s.trim())
    }).select().single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Auto-join the creator
      await supabase.from('project_members').insert({ project_id: data.id, user_id: user!.id, participation_type: 'host' });
      
      toast({ title: "Success!", description: "Your project has been created." });
      setShowCreateProject(false);
      setNewProject({ title: "", description: "", skills: "" });
      fetchProjects();
      fetchJoinedStatus();
    }
  };

  const handleCreateStartup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireLogin()) return;

    const { data, error } = await supabase.from('startups').insert({
      name: newStartup.name,
      description: newStartup.description,
      founder_id: user!.id,
      looking_for: newStartup.lookingFor
    }).select().single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Auto-join the founder
      await supabase.from('startup_members').insert({ startup_id: data.id, user_id: user!.id, role: 'founder' });

      toast({ title: "Success!", description: "Your startup has been registered." });
      setShowCreateStartup(false);
      setNewStartup({ name: "", description: "", lookingFor: "" });
      fetchStartups();
      fetchJoinedStatus();
    }
  };

  const handleJoinProject = async (projectId: string) => {
    if (!requireLogin()) return;

    const { error } = await supabase.from('project_members').insert({
      project_id: projectId,
      user_id: user!.id,
      participation_type: 'participant'
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Joined!", description: "You've joined the project." });
      setJoinedProjectIds(prev => new Set(prev).add(projectId));
      fetchProjects(); // Update member count
    }
  };

  const handleJoinStartup = async (startupId: string) => {
    if (!requireLogin()) return;

    const { error } = await supabase.from('startup_members').insert({
      startup_id: startupId,
      user_id: user!.id,
      role: 'member'
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Joined!", description: "You have joined this startup." });
      setJoinedStartupIds(prev => new Set(prev).add(startupId));
      fetchStartups(); // Update member count
    }
  };

  const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredStartups = startups.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-6 py-12">
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="projects" className="rounded-full">Projects</TabsTrigger>
            <TabsTrigger value="startups" className="rounded-full">Startups</TabsTrigger>
          </TabsList>

          {/* --- PROJECTS TAB --- */}
          <TabsContent value="projects">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-primary mb-4">Explore Projects</h1>
              <p className="text-muted-foreground mb-6">Host your own project or join as a participant</p>
              <div className="flex gap-4 flex-wrap items-center">
                <div className="relative flex-1 max-w-2xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    className="pl-12 rounded-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Create Button with Login Check */}
                <Dialog open={showCreateProject} onOpenChange={(open) => {
                  if (open && !requireLogin()) return;
                  setShowCreateProject(open);
                }}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full shadow-lg hover:shadow-xl transition-all">
                      <Plus className="h-4 w-4 mr-2" /> Host a Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
                    <form onSubmit={handleCreateProject} className="space-y-4">
                      <div>
                        <Label>Project Title</Label>
                        <Input value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} placeholder="AI Chatbot" required />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="Project details..." required />
                      </div>
                      <div>
                        <Label>Skills Required (comma-separated)</Label>
                        <Input value={newProject.skills} onChange={(e) => setNewProject({ ...newProject, skills: e.target.value })} placeholder="React, Node.js" />
                      </div>
                      <Button type="submit" className="w-full">Create Project</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const isJoined = joinedProjectIds.has(project.id);
                return (
                  <Card key={project.id} className="p-6 hover:shadow-xl transition-all duration-300 border-2">
                    <h3 className="text-2xl font-bold text-primary mb-2">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">Host: <span className="font-semibold">{project.host?.full_name || "Unknown"}</span></p>
                    <p className="text-muted-foreground mb-4 line-clamp-3 h-12">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4 h-8 overflow-hidden">
                      {project.skills_required?.slice(0, 3).map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">{skill}</span>
                      ))}
                    </div>

                    <Button
                      variant={isJoined ? "secondary" : "default"}
                      className="w-full rounded-full"
                      onClick={() => !isJoined && handleJoinProject(project.id)}
                      disabled={isJoined}
                    >
                      {isJoined ? <><Check className="mr-2 h-4 w-4"/> Joined</> : "Join as Participant"}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* --- STARTUPS TAB --- */}
          <TabsContent value="startups">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-primary mb-4">Explore Startups</h1>
              <p className="text-muted-foreground mb-6">Register your startup or join existing ones</p>
              <div className="flex gap-4 flex-wrap items-center">
                <div className="relative flex-1 max-w-2xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search startups..."
                    className="pl-12 rounded-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Create Button with Login Check */}
                <Dialog open={showCreateStartup} onOpenChange={(open) => {
                  if (open && !requireLogin()) return;
                  setShowCreateStartup(open);
                }}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full shadow-lg hover:shadow-xl transition-all">
                      <Plus className="h-4 w-4 mr-2" /> Register Startup
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Register Your Startup</DialogTitle></DialogHeader>
                    <form onSubmit={handleCreateStartup} className="space-y-4">
                      <div>
                        <Label>Startup Name</Label>
                        <Input value={newStartup.name} onChange={(e) => setNewStartup({ ...newStartup, name: e.target.value })} placeholder="TechStart" required />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea value={newStartup.description} onChange={(e) => setNewStartup({ ...newStartup, description: e.target.value })} placeholder="Mission & Vision..." required />
                      </div>
                      <div>
                        <Label>Looking For</Label>
                        <Input value={newStartup.lookingFor} onChange={(e) => setNewStartup({ ...newStartup, lookingFor: e.target.value })} placeholder="Developers, Designers" />
                      </div>
                      <Button type="submit" className="w-full">Register Startup</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStartups.map((startup) => {
                const isJoined = joinedStartupIds.has(startup.id);
                return (
                  <Card key={startup.id} className="p-6 hover:shadow-xl transition-all duration-300 border-2">
                    <h3 className="text-2xl font-bold text-primary mb-2">{startup.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">Founder: <span className="font-semibold">{startup.founder?.full_name || "Unknown"}</span></p>
                    <p className="text-muted-foreground mb-4 line-clamp-3 h-12">{startup.description}</p>
                    
                    <div className="mb-4 p-3 bg-secondary/50 rounded-lg h-20 overflow-hidden">
                      <p className="text-sm font-semibold text-foreground">Looking for:</p>
                      <p className="text-sm text-secondary-foreground">{startup.looking_for || "Open to all"}</p>
                    </div>

                    <Button
                      variant={isJoined ? "secondary" : "default"}
                      className="w-full rounded-full"
                      onClick={() => !isJoined && handleJoinStartup(startup.id)}
                      disabled={isJoined}
                    >
                      {isJoined ? <><Check className="mr-2 h-4 w-4"/> Joined</> : "Join Startup"}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Connect;
