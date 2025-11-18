import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Github, Linkedin, Instagram } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Profile Header */}
        <Card className="p-8 mb-8">
          <div className="flex items-start gap-8">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">NS</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-primary mb-1">Nishant Sharma</h1>
              <p className="text-muted-foreground mb-4">@nishant</p>
              <div className="flex items-center gap-6 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Projects Contribution</p>
                  <p className="text-2xl font-bold text-primary">10</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Startups Contribution</p>
                  <p className="text-2xl font-bold text-primary">10</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upvotes</p>
                  <p className="text-2xl font-bold text-primary">245</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Organization */}
        <Card className="p-8 mb-6">
          <h2 className="text-xl font-bold text-primary mb-2">Organization Name: Newton School of Tech</h2>
          <p className="text-muted-foreground">Course Name: BTECH in AI/ML</p>
        </Card>

        {/* Education */}
        <Card className="p-8 mb-6">
          <h2 className="text-xl font-bold text-primary mb-4">Education</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>- Primary</li>
            <li>- Secondary</li>
            <li>- Grade and school name</li>
          </ul>
        </Card>

        {/* Skills */}
        <Card className="p-8 mb-6">
          <h2 className="text-xl font-bold text-primary mb-4">Skills</h2>
          <p className="text-muted-foreground mb-3">- Technical and Non-technical</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full">
              React
            </Badge>
            <Badge variant="secondary" className="rounded-full">
              TypeScript
            </Badge>
            <Badge variant="secondary" className="rounded-full">
              Node.js
            </Badge>
            <Badge variant="secondary" className="rounded-full">
              Leadership
            </Badge>
          </div>
        </Card>

        {/* Experience */}
        <Card className="p-8 mb-6">
          <h2 className="text-xl font-bold text-primary mb-4">Experience</h2>
          <p className="text-muted-foreground">Cracked GSOC</p>
        </Card>

        {/* Achievements */}
        <Card className="p-8 mb-6">
          <h2 className="text-xl font-bold text-primary mb-4">Achievements</h2>
          <p className="text-muted-foreground">Add your achievements here...</p>
        </Card>

        {/* Socials */}
        <Card className="p-8">
          <h2 className="text-xl font-bold text-primary mb-4">Socials</h2>
          <div className="flex items-center gap-4">
            <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Linkedin className="h-5 w-5" />
              <span>LinkedIn</span>
            </a>
            <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Github className="h-5 w-5" />
              <span>GitHub</span>
            </a>
            <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="h-5 w-5" />
              <span>Instagram</span>
            </a>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
