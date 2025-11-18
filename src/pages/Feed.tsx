import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Trophy, Lightbulb } from "lucide-react";

const Feed = () => {
  const feedItems = [
    {
      type: "trend",
      icon: TrendingUp,
      title: "React 19 Released",
      description: "New compiler optimizations and features. 5000+ students exploring this.",
      badge: "Trending",
    },
    {
      type: "opportunity",
      icon: Lightbulb,
      title: "Google Summer of Code 2025",
      description: "Applications open! 200+ organizations looking for contributors.",
      badge: "Opportunity",
    },
    {
      type: "achievement",
      icon: Trophy,
      title: "Community Milestone",
      description: "Computer Science community reached 10,000 members!",
      badge: "Achievement",
    },
    {
      type: "insight",
      icon: Sparkles,
      title: "AI Insight",
      description: "Students in your branch are learning: Next.js, TypeScript, AWS",
      badge: "AI Insight",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">AI Personalized Feed</h1>
          <p className="text-muted-foreground text-lg">
            Curated insights based on your interests, communities, and trending tech
          </p>
        </div>

        <div className="space-y-6">
          {feedItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-muted rounded-2xl">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold text-primary">{item.title}</h3>
                      <Badge variant="secondary" className="rounded-full">
                        {item.badge}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Card className="p-8 bg-gradient-to-br from-hero-from to-hero-to">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold text-primary mb-2">More insights coming soon!</h3>
            <p className="text-muted-foreground">
              Our AI is analyzing community trends and opportunities for you.
            </p>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Feed;
