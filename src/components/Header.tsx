import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "../lib/supabaseClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function Header({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState<string[]>([]);

  const handleMenuToggle = () => {
    if (toggleSidebar) toggleSidebar();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      const category = location.pathname.split("/").pop();
      navigate(`/search?query=${encodeURIComponent(search.trim())}&category=${category}`);
    }
  };

  useEffect(() => {
    const channel = supabase.channel('notifications')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        const action = payload.eventType; // INSERT / UPDATE / DELETE
        const table = payload.table;
        const description = `New ${action} in ${table}`;
        setNotifications((prev) => [description, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth/login"); // redirect to login page after logout
  };

  return (
    <header className="sticky top-0 z-10 w-full border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left side (Menu button, Search bar) */}
        <div className="flex flex-1 items-center gap-4 md:gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={handleMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex-1 md:flex max-w-sm"
          >
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background pl-8 md:w-[300px] lg:w-[360px]"
              />
            </div>
          </form>
        </div>

        {/* Right side (Actions like notifications, user menu) */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
              ) : (
                <>
                  {notifications.slice(0, 5).map((note, index) => (
                    <DropdownMenuItem key={index} className="text-wrap break-words">
                      {note}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clearNotifications} className="text-center text-red-500 cursor-pointer">
                    Clear All Notifications
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

           {/* User Menu */}
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

