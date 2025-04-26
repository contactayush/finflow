import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FileText,
  DollarSign,
  CreditCard,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
};

const NavItem = ({ to, icon, label, expanded }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
        expanded ? "justify-start" : "justify-center",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
      )}
    >
      <div className="flex-shrink-0">{icon}</div>
      {expanded && <span className="truncate">{label}</span>}
    </Link>
  );
};

export function Sidebar({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const [expanded, setExpanded] = useState(true);
  const { signOut } = useAuth();
  
  const handleToggleExpand = () => {
    console.log("Toggle sidebar expand clicked");
    setExpanded(!expanded);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div
      className={cn(
        "h-screen bg-sidebar flex flex-col border-r border-sidebar-border",
        expanded ? "w-64" : "w-16"
      )}
    >
      <div className="flex items-center justify-between p-4">
        {expanded && (
          <div className="text-xl font-bold text-primary">FinFlow</div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleExpand}
          className="ml-auto"
        >
          {expanded ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-2 px-2">
        <NavItem
          to="/"
          icon={<LayoutDashboard className="h-5 w-5" />}
          label="Dashboard"
          expanded={expanded}
        />
        <NavItem
          to="/cheques"
          icon={<FileText className="h-5 w-5" />}
          label="Cheques"
          expanded={expanded}
        />
        <NavItem
          to="/cash"
          icon={<DollarSign className="h-5 w-5" />}
          label="Cash"
          expanded={expanded}
        />
        <NavItem
          to="/digital"
          icon={<CreditCard className="h-5 w-5" />}
          label="Digital"
          expanded={expanded}
        />
        <NavItem
          to="/reports"
          icon={<BarChart2 className="h-5 w-5" />}
          label="Reports"
          expanded={expanded}
        />
        <NavItem
          to="/settings"
          icon={<Settings className="h-5 w-5" />}
          label="Settings"
          expanded={expanded}
        />
      </div>

      <div className="p-4 border-t border-sidebar-border flex items-center justify-between">
        <ThemeToggle />
        {expanded && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        )}
      </div>
    </div>
  );
}
