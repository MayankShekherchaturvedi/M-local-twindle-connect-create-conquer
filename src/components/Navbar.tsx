import { Link } from "react-router-dom";
import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-nav border-b border-border shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary">
            Twindle
          </Link>

          {/* Center Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link to="/connect" className="text-foreground hover:text-primary transition-colors font-medium">
              Connect
            </Link>
            <Link to="/community" className="text-foreground hover:text-primary transition-colors font-medium">
              Community
            </Link>
            <Link to="/feed" className="text-foreground hover:text-primary transition-colors font-medium">
              AI Feed
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Bell className="h-5 w-5" />
                </Button>
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button onClick={signOut} variant="ghost" size="sm" className="gap-2 rounded-full">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button className="rounded-full">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
