
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    console.log("Toggling sidebar:", !sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar by default on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className={cn(
        "fixed inset-y-0 z-20 transition-all duration-300",
        sidebarOpen ? "left-0" : "-left-64",
        isMobile && sidebarOpen && "fixed inset-0 bg-background/80 backdrop-blur-sm"
      )}>
        <Sidebar toggleSidebar={toggleSidebar} />
      </div>
      
      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300",
        sidebarOpen ? (isMobile ? "ml-0" : "ml-64") : "ml-16"
      )}>
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
