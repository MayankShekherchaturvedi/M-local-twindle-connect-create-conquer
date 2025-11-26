import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ForgotPasswordProps {
  onBack: () => void;
}

export const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setSent(true);
      toast({
        title: "Email sent!",
        description: "Check your email for password reset instructions"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl rounded-3xl bg-white">
        <button
          onClick={onBack}
          className="flex items-center text-primary mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </button>

        <h2 className="text-3xl font-bold text-center mb-2">Forgot Password?</h2>
        <p className="text-center text-muted-foreground mb-8">
          Enter your email and we'll send you reset instructions
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="rounded-xl h-12 mt-2 border-gray-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl h-12 bg-gradient-to-r from-[#4A77FF] to-[#5DA8FF] hover:opacity-90 transition-opacity text-white font-medium"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-green-800">
                Password reset email sent! Check your inbox and spam folder.
              </p>
            </div>
            <Button
              onClick={onBack}
              variant="outline"
              className="rounded-xl"
            >
              Back to Login
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
