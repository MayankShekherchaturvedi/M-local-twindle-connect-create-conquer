import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, School, BookOpen, Briefcase, MapPin, Edit, Loader2 } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Edit Form State
  const [formData, setFormData] = useState({
    full_name: "",
    branch: "",
    college: "",
    bio: "",
    skills: "", // Stored as comma-separated string for editing
    interests: "",
    linkedin_url: "",
    github_url: ""
  });

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        // Pre-fill form
        setFormData({
          full_name: data.full_name || "",
          branch: data.branch || "",
          college: data.college || "",
          bio: data.bio || "",
          skills: data.specialization || "", // Using 'specialization' column for skills/tags
          interests: data.interests || "",
          linkedin_url: "", // Add these columns to DB if you want them specifically
          github_url: ""
        });
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          branch: formData.branch,
          college: formData.college,
          bio: formData.bio,
          specialization: formData.skills, // Saving skills to 'specialization' column
          interests: formData.interests
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({ title: "Success", description: "Profile updated successfully!" });
      setIsEditing(false);
      fetchProfile(); // Refresh UI
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: User Info Card */}
          <div className="lg:col-span-1">
            <Card className="text-center h-full">
              <CardHeader className="flex flex-col items-center pb-2">
                <Avatar className="h-32 w-32 mb-4 border-4 border-muted">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                    {profile.full_name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl font-bold">{profile.full_name}</CardTitle>
                <p className="text-muted-foreground">@{profile.username || "username"}</p>
                
                {/* Edit Button */}
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mt-4 rounded-full" size="sm">
                      <Edit className="h-4 w-4 mr-2" /> Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Full Name</Label>
                          <Input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                        </div>
                        <div>
                          <Label>Branch/Major</Label>
                          <Input value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} />
                        </div>
                      </div>
                      <div>
                        <Label>College/University</Label>
                        <Input value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} />
                      </div>
                      <div>
                        <Label>Bio</Label>
                        <Textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Tell us about yourself..." />
                      </div>
                      <div>
                        <Label>Skills (comma separated)</Label>
                        <Input value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="React, Python, Design..." />
                      </div>
                      <Button className="w-full" onClick={handleUpdate}>Save Changes</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              
              <CardContent className="mt-4 space-y-4 text-left">
                <div className="flex items-center text-sm text-muted-foreground">
                  <School className="h-4 w-4 mr-3 text-primary" />
                  <span>{profile.college || "No college added"}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4 mr-3 text-primary" />
                  <span>{profile.branch || "No branch added"}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-3 text-primary" />
                  <span>{profile.email}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* About Me */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> About Me
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {profile.bio || "This user hasn't written a bio yet."}
                </p>
              </CardContent>
            </Card>

            {/* Skills & Interests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" /> Skills & Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialization ? (
                      profile.specialization.split(',').map((skill: string, i: number) => (
                        <Badge key={i} variant="secondary" className="px-3 py-1">{skill.trim()}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No skills listed</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-3">Interests</h4>
                  <p className="text-sm text-muted-foreground">{profile.interests || "No interests listed"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Stats (Optional Gamification) */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <span className="text-3xl font-bold text-primary">{profile.coins || 0}</span>
                  <span className="text-sm text-muted-foreground">Coins Earned</span>
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <span className="text-3xl font-bold text-primary">{profile.upvotes || 0}</span>
                  <span className="text-sm text-muted-foreground">Community Upvotes</span>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
