import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    category: "",
    duration: "",
    teamSize: "",
    description: "", // Rich text simplified for now
    bannerUrl: "",
    isPublic: true
  });

  const [roles, setRoles] = useState([
    { title: "", description: "", openings: 1, skills: "" }
  ]);

  const addRole = () => {
    setRoles([...roles, { title: "", description: "", openings: 1, skills: "" }]);
  };

  const removeRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const updateRole = (index: number, field: string, value: any) => {
    const newRoles = [...roles];
    newRoles[index] = { ...newRoles[index], [field]: value };
    setRoles(newRoles);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Create Project
      const { data: project, error: projError } = await supabase.from('projects').insert({
        title: formData.title,
        description: formData.description || formData.summary, // Use description if available
        category: formData.category,
        duration: formData.duration,
        team_size: parseInt(formData.teamSize) || 1,
        host_id: user.id,
        banner_url: formData.bannerUrl,
        is_public: formData.isPublic,
        status: 'open'
      }).select().single();

      if (projError) throw projError;

      // 2. Create Roles
      if (roles.length > 0) {
        const rolesToInsert = roles.map(r => ({
          project_id: project.id,
          title: r.title,
          description: r.description,
          openings: r.openings,
          skills_required: r.skills.split(',').map(s => s.trim())
        }));
        
        const { error: rolesError } = await supabase.from('project_roles').insert(rolesToInsert);
        if (rolesError) throw rolesError;
      }

      // 3. Add Host as Member
      await supabase.from('project_members').insert({
        project_id: project.id,
        user_id: user.id,
        participation_type: 'host'
      });

      toast({ title: "Success!", description: "Project created successfully." });
      navigate(`/connect/projects/${project.id}`);

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate('/connect')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Connect
        </Button>

        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
          <p className="text-muted-foreground mb-8">Step {step} of 3</p>

          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label>Project Title</Label>
                <Input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. AI Study Companion" 
                />
              </div>
              <div>
                <Label>Short Summary</Label>
                <Textarea 
                  value={formData.summary} 
                  onChange={e => setFormData({...formData, summary: e.target.value})} 
                  placeholder="Briefly describe your project..." 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select onValueChange={(val) => setFormData({...formData, category: val})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tech">Tech</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input 
                    value={formData.duration} 
                    onChange={e => setFormData({...formData, duration: e.target.value})} 
                    placeholder="e.g. 2 months" 
                  />
                </div>
              </div>
              <Button className="w-full mt-4" onClick={() => setStep(2)} disabled={!formData.title}>Next: Roles</Button>
            </div>
          )}

          {/* STEP 2: ROLES */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Who do you need?</h3>
                <Button variant="outline" size="sm" onClick={addRole}><Plus className="mr-2 h-4 w-4" /> Add Role</Button>
              </div>
              
              {roles.map((role, idx) => (
                <Card key={idx} className="p-4 bg-muted/30 relative">
                  {roles.length > 1 && (
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeRole(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="space-y-4">
                    <Input 
                      placeholder="Role Title (e.g. Frontend Dev)" 
                      value={role.title} 
                      onChange={e => updateRole(idx, 'title', e.target.value)}
                    />
                    <Input 
                      placeholder="Required Skills (comma separated)" 
                      value={role.skills} 
                      onChange={e => updateRole(idx, 'skills', e.target.value)}
                    />
                    <div className="flex gap-4">
                      <Input 
                        type="number" 
                        placeholder="Openings" 
                        className="w-24"
                        value={role.openings}
                        onChange={e => updateRole(idx, 'openings', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </Card>
              ))}
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" onClick={() => setStep(3)}>Next: Review</Button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h2 className="font-bold text-xl">{formData.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{formData.summary}</p>
                <div className="mt-4 flex gap-4 text-sm">
                  <span>Category: <b>{formData.category}</b></span>
                  <span>Duration: <b>{formData.duration}</b></span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Open Roles:</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {roles.map((r, i) => (
                    <li key={i}>{r.title} ({r.openings} spots)</li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Publishing..." : "Publish Project"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CreateProject;
