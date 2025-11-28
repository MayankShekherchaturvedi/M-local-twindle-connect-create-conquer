import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Check, X, FileText } from "lucide-react";

const ManageApplications = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Determine if we are managing a "project" or "startup" based on URL
  const type = location.pathname.includes("startups") ? "startup" : "project";
  
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [id, type]);

  const fetchApplications = async () => {
    const table = type === "project" ? "project_applications" : "startup_applications";
    const foreignKey = type === "project" ? "project_id" : "startup_id";
    const roleTable = type === "project" ? "project_roles" : "startup_roles";

    const { data, error } = await supabase
      .from(table)
      .select(`
        *,
        applicant:profiles!${table}_applicant_id_fkey(*),
        role:${roleTable}(title)
      `)
      .eq(foreignKey, id)
      .eq("status", "pending"); // Only show pending apps

    if (error) console.error(error);
    else setApplications(data || []);
    setLoading(false);
  };

  const handleDecision = async (appId: string, decision: "accepted" | "rejected", applicantId: string, roleTitle: string) => {
    const appTable = type === "project" ? "project_applications" : "startup_applications";
    const memberTable = type === "project" ? "project_members" : "startup_members";
    const foreignKey = type === "project" ? "project_id" : "startup_id";

    // 1. Update Application Status
    const { error: updateError } = await supabase
      .from(appTable)
      .update({ status: decision })
      .eq("id", appId);

    if (updateError) {
      return toast({ title: "Error", description: "Failed to update application", variant: "destructive" });
    }

    // 2. If Accepted, Add to Members Table
    if (decision === "accepted") {
      const memberData = type === "project" 
        ? { project_id: id, user_id: applicantId, participation_type: 'participant' }
        : { startup_id: id, user_id: applicantId, role: roleTitle }; // Startups use 'role' column

      const { error: memberError } = await supabase
        .from(memberTable)
        .insert(memberData);

      if (memberError) {
        return toast({ title: "Error", description: "Could not add member to team.", variant: "destructive" });
      }
    }

    toast({ 
      title: decision === "accepted" ? "Welcome aboard!" : "Application Rejected", 
      description: `User has been ${decision}.` 
    });
    
    fetchApplications(); // Refresh list
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Details
        </Button>

        <h1 className="text-3xl font-bold mb-6">Manage Applicants</h1>

        {loading ? (
          <div>Loading...</div>
        ) : applications.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            <div className="flex justify-center mb-4"><FileText className="h-12 w-12 opacity-20" /></div>
            <p>No pending applications.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => (
              <Card key={app.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6">
                <div className="flex items-start gap-4 mb-4 md:mb-0">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{app.applicant?.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg">{app.applicant?.full_name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">Applied for: <Badge variant="outline">{app.role?.title}</Badge></p>
                    <p className="text-sm bg-muted p-2 rounded mt-2 max-w-xl">{app.message || "No message provided."}</p>
                    {app.portfolio_link && (
                      <a href={app.portfolio_link} target="_blank" rel="noreferrer" className="text-xs text-primary underline mt-1 block">
                        View Portfolio / Resume
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <Button variant="outline" className="flex-1 border-red-200 hover:bg-red-50 text-red-600" onClick={() => handleDecision(app.id, "rejected", app.applicant_id, app.role?.title)}>
                    <X className="mr-2 h-4 w-4" /> Reject
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleDecision(app.id, "accepted", app.applicant_id, app.role?.title)}>
                    <Check className="mr-2 h-4 w-4" /> Accept
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageApplications;
