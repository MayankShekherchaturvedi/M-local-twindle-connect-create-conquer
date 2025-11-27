import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Filter, Users, Clock, Rocket, Building2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Connect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [projects, setProjects] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Joined Status
  const [joinedProjectIds, setJoinedProjectIds] = useState<Set<string>>(new Set());
  const [joinedStartupIds, setJoinedStartupIds] = useState<Set<string>>(new Set());

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [activeTab, setActiveTab] = useState("projects");

  useEffect(() => {
    fetchData();
    
    // Subscribe to realtime updates
    const projectSub = supabase.channel('public:projects')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'projects' }, fetchData)
      .subscribe();
      
    const startupSub = supabase.channel('public:startups')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'startups' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(projectSub);
      supabase.removeChannel(startupSub);
    };
  }, [sort]); // Re-fetch when sort changes

  // Fetch joined status on login
  useEffect(() => {
    if (user) fetchJoinedStatus();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Projects
    let pQuery = supabase
      .from('projects')
      .select(`*, host:profiles!projects_host_id_fkey(full_name), project_roles(count), project_members(count)`);
    
    if (sort === 'newest') pQuery = pQuery.order('created_at', { ascending: false });
    else pQuery = pQuery.order('created_at', { ascending: true });

    const { data: pData } = await pQuery;
    if (pData) setProjects(pData);

    // Fetch Startups
    let sQuery = supabase
      .from('startups')
      .select(`*, founder:profiles!startups_founder_id_fkey(full_name), startup_members(count)`);

    if (sort === 'newest') sQuery = sQuery.order('created_at', { ascending: false });
    else sQuery = sQuery.order('created_at', { ascending: true });

    const { data: sData } = await sQuery;
    if (sData) setStartups(sData);

    setLoading(false);
  };

  const fetchJoinedStatus = async () => {
    if (!user) return;
    const { data: pMembers } = await supabase.from('project_members').select('project_id').eq('user_id', user.id);
    if (pMembers) setJoinedProjectIds(new Set(pMembers.map(i => i.project_id)));

    const { data: sMembers } = await supabase.from('startup_members').select('startup_id').eq('user_id', user.id);
    if (sMembers) setJoinedStartupIds(new Set(sMembers.map(i => i.startup_id)));
  };

  const requireLogin = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to create or join.", variant: "destructive" });
      navigate('/auth');
      return false;
    }
    return true;
  };

  // Filtering Logic
  const filterList = (list: any[]) => {
    return list.filter(item => {
      const matchesSearch = item.title?.toLowerCase().includes(search.toLowerCase()) || 
                            item.name?.toLowerCase().includes(search.toLowerCase()) ||
                            item.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || item.category === category;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredProjects = filterList(projects);
  const filteredStartups = filterList(startups);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* (A) Hero Header */}
      <div className="bg-primary/5 py-16 px-6 text-center border-b">
        <h1 className="text-4xl font-bold text-primary mb-4">Discover Opportunities</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Collaborate on student projects or join the next big startup.
        </p>
        
        <div className="max-w-2xl mx-auto flex gap-4 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by name, skill, or keyword..." 
              className="pl-10 h-12 rounded-full shadow-sm bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {activeTab === 'projects' ? (
            <Button size="lg" className="rounded-full h-12 px-8" onClick={() => { if(requireLogin()) navigate('/connect/create-project'); }}>
              <Plus className="mr-2 h-5 w-5" /> Host Project
            </Button>
          ) : (
            <Button size="lg" className="rounded-full h-12 px-8" onClick={() => { if(requireLogin()) navigate('/connect/create-startup'); }}>
              <Rocket className="mr-2 h-5 w-5" /> Launch Startup
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <Tabs defaultValue="projects" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            
            {/* Tabs List */}
            <TabsList className="rounded-full p-1 h-auto bg-muted">
              <TabsTrigger value="projects" className="rounded-full px-6 py-2">Projects</TabsTrigger>
              <TabsTrigger value="startups" className="rounded-full px-6 py-2">Startups</TabsTrigger>
            </TabsList>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" disabled>
                  <Filter className="h-4 w-4" /> Filter:
                </Button>
                {["All", "Tech", "Business", "Design", "Social Impact"].map(cat => (
                  <Badge 
                    key={cat} 
                    variant={category === cat ? "default" : "secondary"}
                    className="cursor-pointer px-4 py-2 rounded-full whitespace-nowrap hover:opacity-80 transition-opacity"
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[160px] rounded-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* --- PROJECTS CONTENT --- */}
          <TabsContent value="projects">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-20 text-muted-foreground">Loading projects...</div>
              ) : filteredProjects.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-muted/30 rounded-xl">
                  <h3 className="text-lg font-semibold text-primary">No projects found</h3>
                  <p className="text-muted-foreground">Be the first to create one!</p>
                </div>
              ) : (
                filteredProjects.map((project) => {
                  const isJoined = joinedProjectIds.has(project.id);
                  return (
                    <Card 
                      key={project.id} 
                      className="hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full border-muted" 
                      onClick={() => navigate(`/connect/projects/${project.id}`)}
                    >
                      <div className="h-40 w-full overflow-hidden rounded-t-lg bg-secondary relative">
                        {project.banner_url ? (
                          <img src={project.banner_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                            <Users className="h-10 w-10 opacity-20" />
                          </div>
                        )}
                        {isJoined && <Badge className="absolute top-3 right-3 bg-green-500 text-white">Joined</Badge>}
                      </div>

                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start mb-1">
                          <Badge variant="secondary" className="font-normal text-xs">{project.category}</Badge>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">
                          {project.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="flex-1">
                        <p className="text-muted-foreground line-clamp-3 text-sm mb-4">
                          {project.description || "No description provided."}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {project.project_members?.[0]?.count || 1} Members</span>
                          {project.duration && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {project.duration}</span>}
                        </div>
                      </CardContent>

                      <CardFooter className="border-t pt-4 bg-muted/10">
                        <Button className="w-full rounded-full" variant="secondary">View Details</Button>
                      </CardFooter>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* --- STARTUPS CONTENT --- */}
          <TabsContent value="startups">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-20 text-muted-foreground">Loading startups...</div>
              ) : filteredStartups.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-muted/30 rounded-xl">
                  <h3 className="text-lg font-semibold text-primary">No startups found</h3>
                  <p className="text-muted-foreground">Register your startup today!</p>
                </div>
              ) : (
                filteredStartups.map((startup) => {
                  const isJoined = joinedStartupIds.has(startup.id);
                  return (
                    <Card 
                      key={startup.id} 
                      className="hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full border-muted" 
                      onClick={() => navigate(`/connect/startups/${startup.id}`)}
                    >
                      <div className="h-40 w-full overflow-hidden rounded-t-lg bg-secondary relative">
                        {startup.banner_url ? (
                          <img src={startup.banner_url} alt={startup.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                            <Building2 className="h-10 w-10 opacity-20" />
                          </div>
                        )}
                        <Badge className="absolute top-3 left-3 bg-white/90 text-black backdrop-blur-md">{startup.stage}</Badge>
                        {isJoined && <Badge className="absolute top-3 right-3 bg-green-500 text-white">Member</Badge>}
                      </div>

                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors flex items-center gap-2">
                          {startup.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">Founder: {startup.founder?.full_name}</p>
                      </CardHeader>

                      <CardContent className="flex-1">
                        <p className="text-muted-foreground line-clamp-3 text-sm mb-4">
                          {startup.description || "No mission statement yet."}
                        </p>
                        {startup.looking_for && (
                          <div className="bg-primary/5 p-2 rounded text-xs text-primary font-medium border border-primary/10">
                            Hiring: {startup.looking_for}
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="border-t pt-4 bg-muted/10">
                        <Button className="w-full rounded-full" variant="secondary">View Startup</Button>
                      </CardFooter>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Connect;
