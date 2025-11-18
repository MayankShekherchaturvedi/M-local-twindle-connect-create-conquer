import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const BRANCHES = [
  "Computer Science", "AI/ML", "Data Science", "Software Engineering", "Cybersecurity",
  "Mechanical", "Electrical", "Civil", "Chemical", "Mechatronics",
  "UI/UX", "Graphic Design", "Architecture", "Animation",
  "Entrepreneurship", "Business", "Marketing", "Finance",
  "Biotechnology", "Physics", "Chemistry", "Medicine", "Nursing",
  "Law", "Public Policy"
];

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    branch: "",
    college: "",
    year: "",
    sleepSchedule: "",
    skills: "",
    interests: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in."
      });
      navigate("/");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: signupData.fullName,
          branch: signupData.branch,
          college: signupData.college,
          age: signupData.age,
          gender: signupData.gender,
          year: signupData.year,
          sleep_schedule: signupData.sleepSchedule
        }
      }
    });

    if (signUpError) {
      setLoading(false);
      toast({
        title: "Signup failed",
        description: signUpError.message,
        variant: "destructive"
      });
      return;
    }

    // Get the user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Add skills
      if (signupData.skills) {
        const skillsArray = signupData.skills.split(',').map(s => s.trim());
        for (const skill of skillsArray) {
          await supabase.from('skills').insert({
            user_id: session.user.id,
            skill_name: skill
          });
        }
      }

      // Add interests
      if (signupData.interests) {
        const interestsArray = signupData.interests.split(',').map(i => i.trim());
        for (const interest of interestsArray) {
          await supabase.from('interests').insert({
            user_id: session.user.id,
            interest_name: interest
          });
        }
      }

      setLoading(false);
      toast({
        title: "Account created!",
        description: `You've been automatically joined to your ${signupData.branch} community.`
      });
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--hero-gradient-start))] to-[hsl(var(--hero-gradient-end))] flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl p-8 shadow-2xl">
        <Link to="/" className="text-3xl font-bold text-primary text-center block mb-8">
          Twindle
        </Link>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login" className="rounded-full">
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-full">
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="rounded-full"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="rounded-full"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    className="rounded-full"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="20"
                    className="rounded-full"
                    value={signupData.age}
                    onChange={(e) => setSignupData({ ...signupData, age: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-email">Email *</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  className="rounded-full"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="signup-password">Password *</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  className="rounded-full"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={signupData.gender} onValueChange={(value) => setSignupData({ ...signupData, gender: value })}>
                    <SelectTrigger className="rounded-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="2"
                    className="rounded-full"
                    value={signupData.year}
                    onChange={(e) => setSignupData({ ...signupData, year: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="branch">Branch *</Label>
                <Select value={signupData.branch} onValueChange={(value) => setSignupData({ ...signupData, branch: value })} required>
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="Select your branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((branch) => (
                      <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="college">College *</Label>
                <Input
                  id="college"
                  placeholder="Newton School of Technology"
                  className="rounded-full"
                  value={signupData.college}
                  onChange={(e) => setSignupData({ ...signupData, college: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="sleepSchedule">Sleep Schedule</Label>
                <Input
                  id="sleepSchedule"
                  placeholder="10 PM - 6 AM"
                  className="rounded-full"
                  value={signupData.sleepSchedule}
                  onChange={(e) => setSignupData({ ...signupData, sleepSchedule: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  placeholder="React, Python, Machine Learning"
                  className="rounded-full"
                  value={signupData.skills}
                  onChange={(e) => setSignupData({ ...signupData, skills: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="interests">Interests (comma-separated)</Label>
                <Input
                  id="interests"
                  placeholder="AI, Web Dev, Startups"
                  className="rounded-full"
                  value={signupData.interests}
                  onChange={(e) => setSignupData({ ...signupData, interests: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full rounded-full" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
