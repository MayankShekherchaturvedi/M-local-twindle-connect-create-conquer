import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onForgotPassword: () => void;
}

export const LoginForm = ({ onForgotPassword }: LoginFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.usernameOrEmail || !formData.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    // Check if input is email or username
    const isEmail = formData.usernameOrEmail.includes('@');
    let email = formData.usernameOrEmail;

    // If username provided, fetch email from profiles
    if (!isEmail) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', formData.usernameOrEmail)
        .single();

      if (profileError || !profile) {
        setLoading(false);
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive"
        });
        return;
      }
      email = profile.email;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: formData.password
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl rounded-3xl bg-white">
        <Link to="/" className="text-4xl font-bold text-primary text-center block mb-2">
          Twindle
        </Link>
        <p className="text-center text-muted-foreground mb-8">Welcome back! Login to continue</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="usernameOrEmail" className="text-sm font-medium">
              Username or Email
            </Label>
            <Input
              id="usernameOrEmail"
              type="text"
              placeholder="Enter your username or email"
              className="rounded-xl h-12 mt-2 border-gray-200"
              value={formData.usernameOrEmail}
              onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="rounded-xl h-12 mt-2 border-gray-200"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-primary hover:underline"
          >
            Forgot Password?
          </button>

          <Button
            type="submit"
            className="w-full rounded-xl h-12 bg-gradient-to-r from-[#4A77FF] to-[#5DA8FF] hover:opacity-90 transition-opacity text-white font-medium"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/auth/signup" className="text-primary font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </Card>
    </div>
  );
};
