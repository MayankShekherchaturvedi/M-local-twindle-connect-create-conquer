import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";

const Community = () => {
  const publicCommunities = [
    { id: 1, name: "Computer Science" },
    { id: 2, name: "AI/ML Enthusiasts" },
    { id: 3, name: "Web Development" },
    { id: 4, name: "Design & Creativity" },
  ];

  const privateCommunities = [
    { id: 1, name: "Newton School AI Batch" },
    { id: 2, name: "Project X Team" },
    { id: 3, name: "Startup Founders Circle" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-6 py-12">
        <Tabs defaultValue="your" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="your" className="rounded-full">
              Your Communities
            </TabsTrigger>
            <TabsTrigger value="explore" className="rounded-full">
              Explore New Communities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="your">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Public */}
              <div>
                <h2 className="text-3xl font-bold text-primary mb-6">Public</h2>
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Search bar" className="pl-12 rounded-full" />
                </div>
                <div className="space-y-4">
                  {publicCommunities.map((community) => (
                    <Card key={community.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      <h3 className="text-xl font-semibold text-primary">{community.name}</h3>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Private */}
              <div>
                <h2 className="text-3xl font-bold text-primary mb-6">Private</h2>
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Search bar" className="pl-12 rounded-full" />
                </div>
                <div className="space-y-4">
                  {privateCommunities.map((community) => (
                    <Card key={community.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      <h3 className="text-xl font-semibold text-primary">{community.name}</h3>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="explore">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Public */}
              <div>
                <h2 className="text-3xl font-bold text-primary mb-6">Public</h2>
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Search bar" className="pl-12 rounded-full" />
                </div>
                <div className="space-y-4">
                  {[...publicCommunities, { id: 5, name: "Robotics Club" }].map((community) => (
                    <Card key={community.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      <h3 className="text-xl font-semibold text-primary">{community.name}</h3>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Private */}
              <div>
                <h2 className="text-3xl font-bold text-primary mb-6">Private</h2>
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Search bar" className="pl-12 rounded-full" />
                </div>
                <div className="space-y-4">
                  <Card className="p-6 text-center text-muted-foreground">
                    Private communities require an invitation or access code
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Community;
