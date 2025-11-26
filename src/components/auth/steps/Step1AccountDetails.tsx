import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { SignupData } from "../SignupFlow";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface Step1Props {
  data: SignupData;
  updateData: (data: Partial<SignupData>) => void;
  onNext: () => void;
}

export const Step1AccountDetails = ({ data, updateData, onNext }: Step1Props) => {
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Debounce username check
  useEffect(() => {
    if (!data.username) {
      setUsernameStatus("idle");
      return;
    }

    // Validate format first
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(data.username)) {
      setUsernameStatus("idle");
      setUsernameError("Username must be 3-30 characters (letters, numbers, _, -)");
      return;
    }

    setUsernameError("");
    setUsernameStatus("checking");

    const timer = setTimeout(async () => {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', data.username)
        .maybeSingle();

      setUsernameStatus(existingUser ? "taken" : "available");
    }, 500);

    return () => clearTimeout(timer);
  }, [data.username]);

  // Debounce email check
  useEffect(() => {
    if (!data.email) {
      setEmailStatus("idle");
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setEmailStatus("idle");
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError("");
    setEmailStatus("checking");

    const timer = setTimeout(async () => {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', data.email)
        .maybeSingle();

      setEmailStatus(existingUser ? "taken" : "available");
    }, 500);

    return () => clearTimeout(timer);
  }, [data.email]);

  // Validate password
  useEffect(() => {
    if (!data.password) {
      setPasswordError("");
      return;
    }

    if (data.password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
    } else {
      setPasswordError("");
    }
  }, [data.password]);

  const handleNext = () => {
    if (!data.username || !data.email || !data.password) {
      return;
    }

    if (usernameStatus !== "available") {
      return;
    }

    if (emailStatus !== "available") {
      return;
    }

    if (data.password.length < 8) {
      return;
    }

    onNext();
  };

  const isValid = 
    data.username &&
    data.email &&
    data.password &&
    usernameStatus === "available" &&
    emailStatus === "available" &&
    data.password.length >= 8;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl rounded-3xl bg-white">
        <Link to="/" className="text-4xl font-bold text-primary text-center block mb-2">
          Twindle
        </Link>
        <p className="text-center text-muted-foreground mb-2">Create your account</p>
        <p className="text-center text-sm text-muted-foreground mb-8">Step 1 of 5</p>

        <div className="space-y-6">
          <div>
            <Label htmlFor="username" className="text-sm font-medium">
              Username *
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a unique username"
              className="rounded-xl h-12 mt-2 border-gray-200"
              value={data.username}
              onChange={(e) => updateData({ username: e.target.value.toLowerCase() })}
              required
            />
            {usernameStatus === "checking" && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking availability...</span>
              </div>
            )}
            {usernameStatus === "available" && (
              <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Username available!</span>
              </div>
            )}
            {usernameStatus === "taken" && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <XCircle className="w-4 h-4" />
                <span>This username is already taken.</span>
              </div>
            )}
            {usernameError && (
              <p className="text-sm text-red-600 mt-2">{usernameError}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="rounded-xl h-12 mt-2 border-gray-200"
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
              required
            />
            {emailStatus === "checking" && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking availability...</span>
              </div>
            )}
            {emailStatus === "available" && (
              <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Email available!</span>
              </div>
            )}
            {emailStatus === "taken" && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <XCircle className="w-4 h-4" />
                <span>This email is already registered.</span>
              </div>
            )}
            {emailError && (
              <p className="text-sm text-red-600 mt-2">{emailError}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium">
              Password *
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 8 characters"
              className="rounded-xl h-12 mt-2 border-gray-200"
              value={data.password}
              onChange={(e) => updateData({ password: e.target.value })}
              required
            />
            {passwordError && (
              <p className="text-sm text-red-600 mt-2">{passwordError}</p>
            )}
            {data.password && !passwordError && (
              <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Strong password</span>
              </div>
            )}
          </div>

          <Button
            onClick={handleNext}
            disabled={!isValid}
            className="w-full rounded-xl h-12 bg-gradient-to-r from-[#4A77FF] to-[#5DA8FF] hover:opacity-90 transition-opacity text-white font-medium disabled:opacity-50"
          >
            Next
          </Button>
        </div>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth" className="text-primary font-medium hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
};
