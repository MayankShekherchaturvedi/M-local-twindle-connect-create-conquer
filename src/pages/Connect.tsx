import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Filter, Users, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";

const Connect = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    fetchProjects();
  }, [category, sort]);

  const fetchProjects = async () => {
    setLoading(true);
    
    // Build query based on filters
    let query = supabase
      .from('projects')
      .select(`
        *,
        host:profiles!projects_host_id_fkey(full_name, avatar_url),
        project_roles(count),
        project_members(count)
      `);

    // Apply Category Filter
    if (category !== 'all') {
      query = query.eq('category', category);
    }

    // Apply Sorting
    if (sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching projects:', error);
    } else if (data) {
      setProjects(data);
    }
    
    setLoading(false);
  };

  // Client-side search filtering (for responsiveness)
  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* (A) Hero Header */}
      <div className="bg-primary/5 py-16 px-6 text-center border-b">
        <h1 className="text-4xl font-bold text-primary mb-4">Discover & Join Student Projects</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Find projects that match your skills, collaborate with peers, and build your portfolio.
        </p>
        
        <div className="max-w-2xl mx-auto flex gap-4 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by project name, skill, or keyword..." 
              className="pl-10 h-12 rounded-full shadow-sm bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button size="lg" className="rounded-full h-12 px-8" onClick={() => navigate('/connect/create-project')}>
            <Plus className="mr-2 h-5 w-5" /> Create Project
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* (B) Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" disabled>
              <Filter className="h-4 w-4" /> Filters:
            </Button>
            {["All", "Tech", "Business", "Research", "Design", "Social Impact"].map(cat => (
              <Badge 
                key={cat} 
                variant={category === (cat === "All" ? "all" : cat) ? "default" : "secondary"}
                className="cursor-pointer px-4 py-2 rounded-full whitespace-nowrap hover:opacity-80 transition-opacity"
                onClick={() => setCategory(cat === "All" ? "all" : cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
          
          {/* Sorting */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full md:w-[180px] rounded-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* (C) Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-20 text-muted-foreground">Loading opportunities...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-muted/30 rounded-xl">
              <h3 className="text-lg font-semibold text-primary">No projects found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <Card 
                key={project.id} 
                className="hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full border-muted" 
                onClick={() => navigate(`/connect/projects/${project.id}`)}
              >
                {/* Banner Image Placeholder or Real Image */}
                <div className="h-48 w-full overflow-hidden rounded-t-lg bg-secondary relative">
                  {project.banner_url ? (
                    <img src={project.banner_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                      No Image
                    </div>
                  )}
                  <Badge className="absolute top-3 right-3 bg-white/90 text-primary hover:bg-white shadow-sm backdrop-blur-sm">
                    {project.status === 'open' ? 'Hiring' : 'Closed'}
                  </Badge>
                </div>

                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="font-normal text-xs">
                      {project.category || 'General'}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">
                    {project.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1">
                  <p className="text-muted-foreground line-clamp-3 text-sm mb-6">
                    {project.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                      <Users className="h-3.5 w-3.5" />
                      <span>{project.project_members?.[0]?.count || 1} Members</span>
                    </div>
                    {project.duration && (
                      <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{project.duration}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="border-t pt-4 bg-muted/10">
                  <Button className="w-full rounded-full group-hover:bg-primary group-hover:text-white transition-colors" variant="outline">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Connect;
