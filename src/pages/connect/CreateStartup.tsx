import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // <--- THIS WAS MISSING

const CreateStartup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Tech",
    stage: "Idea", // Idea, MVP, Growth
    teamSize: "",
    bannerUrl: "",
    websiteUrl: "",
    isPublic: true
  });

  const [roles, setRoles] = useState([
    { title: "", description: "", roleType: "Partner", openings: 1, skills: "", equity: "" }
  ]);

  const addRole = () => {
    setRoles([...roles, { title: "", description: "", roleType: "Member", openings: 1, skills: "", equity: "" }]);
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
      // 1. Create Startup
      const { data: startup, error: startError } = await supabase.from('startups').insert({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        stage: formData.stage,
        team_size: parseInt(formData.teamSize) || 1,
        founder_id: user.id,
        banner_url: formData.bannerUrl,
        website_url: formData.websiteUrl,
        is_public: formData.isPublic,
        status: 'active'
      }).select().single();

      if (startError) throw startError;

      // 2. Create Roles
      if (roles.length > 0) {
        const rolesToInsert = roles.map(r => ({
          startup_id: startup.id,
          title: r.title,
          description: r.description,
          role_type: r.roleType, // Founder/Partner Toggle logic
          openings: r.openings,
          skills_required: r.skills.split(',').map(s => s.trim()),
          equity_range: r.equity
        }));
        
        const { error: rolesError } = await supabase.from('startup_roles').insert(rolesToInsert);
        if (rolesError) throw rolesError;
      }

      // 3. Add Founder as Member
      await supabase.from('startup_members').insert({
        startup_id: startup.id,
        user_id: user.id,
        role: 'Founder'
      });

      toast({ title: "Success!", description: "Startup registered successfully." });
      navigate(`/connect/startups/${startup.id}`);

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
          <h1 className="text-3xl font-bold mb-2">Register New Startup</h1>
          <p className="text-muted-foreground mb-8">Step {step} of 3</p>

          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label>Startup Name</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. NextGen AI" />
              </div>
              <div>
                <Label>Mission / Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="What problem are you solving?" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select onValueChange={(val) => setFormData({...formData, category: val})} defaultValue={formData.category}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tech">Tech</SelectItem>
                      <SelectItem value="EdTech">EdTech</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="FinTech">FinTech</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stage</Label>
                  <Select onValueChange={(val) => setFormData({...formData, stage: val})} defaultValue={formData.stage}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Idea">Idea Phase</SelectItem>
                      <SelectItem value="MVP">MVP / Prototype</SelectItem>
                      <SelectItem value="Growth">Growth / Revenue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full mt-4" onClick={() => setStep(2)} disabled={!formData.name}>Next: Roles</Button>
            </div>
          )}

          {/* STEP 2: ROLES */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Who are you looking for?</h3>
                <Button variant="outline" size="sm" onClick={addRole}><Plus className="mr-2 h-4 w-4" /> Add Role</Button>
              </div>
              
              {roles.map((role, idx) => (
                <Card key={idx} className="p-4 bg-muted/30 relative">
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeRole(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 md:col-span-1">
                        <Label className="text-xs mb-1 block">Role Title</Label>
                        <Input placeholder="e.g. CTO / Marketing Lead" value={role.title} onChange={e => updateRole(idx, 'title', e.target.value)} />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <Label className="text-xs mb-1 block">Role Type (Toggle)</Label>
                        <Select value={role.roleType} onValueChange={(val) => updateRole(idx, 'roleType', val)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Founder">Co-Founder</SelectItem>
                            <SelectItem value="Partner">Partner</SelectItem>
                            <SelectItem value="Member">Core Team Member</SelectItem>
                            <SelectItem value="Intern">Intern</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Input placeholder="Required Skills (comma separated)" value={role.skills} onChange={e => updateRole(idx, 'skills', e.target.value)} />
                    <Input placeholder="Equity / Compensation (Optional)" value={role.equity} onChange={e => updateRole(idx, 'equity', e.target.value)} />
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
                <h2 className="font-bold text-xl">{formData.name}</h2>
                <Badge className="mt-2">{formData.stage}</Badge>
                <p className="text-sm text-muted-foreground mt-2">{formData.description}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Open Positions:</h3>
                <ul className="space-y-2">
                  {roles.map((r, i) => (
                    <li key={i} className="text-sm p-2 border rounded bg-background">
                      <span className="font-bold text-primary">{r.roleType}:</span> {r.title}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Registering..." : "Launch Startup"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CreateStartup;
