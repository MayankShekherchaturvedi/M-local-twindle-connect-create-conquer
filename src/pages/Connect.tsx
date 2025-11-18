import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const Connect = () => {
  const projects = [
    { id: 1, name: "AI Chatbot", skills: ["Python", "TensorFlow"], role: "Host", members: 3 },
    { id: 2, name: "E-commerce App", skills: ["React", "Node.js"], role: "Participant", members: 5 },
    { id: 3, name: "Mobile Game", skills: ["Unity", "C#"], role: "Participant", members: 4 },
    { id: 4, name: "Weather Dashboard", skills: ["Vue.js", "API"], role: "Host", members: 2 },
  ];

  const startups = [
    { id: 1, name: "TechStart", looking: "Full-stack Developer", founder: "Maya Patel" },
    { id: 2, name: "EduVenture", looking: "UI/UX Designer", founder: "Shreya Singh" },
    { id: 3, name: "HealthTech", looking: "Backend Engineer", founder: "Rohan Kumar" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-6 py-12">
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="projects" className="rounded-full">
              Projects
            </TabsTrigger>
            <TabsTrigger value="startups" className="rounded-full">
              Startups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-primary mb-4">My Role: Host & Participant</h1>
              <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search in My Projects..." className="pl-12 rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-primary mb-2">{project.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        My Role: <span className="font-semibold">{project.role}</span>
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-full">
                      Edit Project
                    </Button>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    A collaborative project for students. Looking for more contributors!
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-muted rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{project.members} members</p>
                    <Link to={`/connect/projects/${project.id}`}>
                      <Button variant="secondary" className="rounded-full">
                        View Project
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Button className="rounded-full px-8">+ Create New Project</Button>
            </div>
          </TabsContent>

          <TabsContent value="startups">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-primary mb-4">My Role: Participant</h1>
              <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search in My Startups..." className="pl-12 rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {startups.map((startup) => (
                <Card key={startup.id} className="p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-2xl font-bold text-primary mb-2">{startup.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">Founded by {startup.founder}</p>
                  <p className="text-muted-foreground mb-4">Looking for: {startup.looking}</p>
                  <Link to={`/connect/startups/${startup.id}`}>
                    <Button variant="secondary" className="w-full rounded-full">
                      View Startup
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Button className="rounded-full px-8">+ Register Startup</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Connect;
