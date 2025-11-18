import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

const Auth = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-hero-from to-hero-to flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
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
            <form className="space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" className="rounded-full" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" className="rounded-full" />
              </div>
              <Button type="submit" className="w-full rounded-full">
                Login
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" className="rounded-full" />
              </div>
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" placeholder="your@email.com" className="rounded-full" />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" type="password" placeholder="••••••••" className="rounded-full" />
              </div>
              <div>
                <Label htmlFor="branch">Branch</Label>
                <Input id="branch" placeholder="Computer Science" className="rounded-full" />
              </div>
              <div>
                <Label htmlFor="college">College</Label>
                <Input id="college" placeholder="Newton School of Tech" className="rounded-full" />
              </div>
              <Button type="submit" className="w-full rounded-full">
                Sign Up
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
