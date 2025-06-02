import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart, FileText, Home, List, Settings, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
}

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: <Home className="h-5 w-5" />
  },
  {
    title: "Spesifikasi Alat",
    path: "/specifications",
    icon: <Settings className="h-5 w-5" />
  },
  {
    title: "Telegram",
    path: "/telegram",
    icon: <FileText className="h-5 w-5" />
  },
  {
    title: "Riwayat",
    path: "/history",
    icon: <List className="h-5 w-5" />
  },
  {
    title: "Panduan Pengguna",
    path: "/user-guide",
    icon: <BookOpen className="h-5 w-5" />
  }
];

const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  const [isCurrentPath, setIsCurrentPath] = useState("");
  
  useEffect(() => {
    setIsCurrentPath(location.pathname);
  }, [location]);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen pt-16 transition-all duration-300 bg-white border-r border-gray-200",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path}>
                <Button 
                  variant={isCurrentPath === item.path ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start", 
                    isCurrentPath === item.path ? "bg-ews-blue text-white" : "hover:bg-gray-100",
                    !isOpen && "justify-center px-2"
                  )}
                >
                  {item.icon}
                  {isOpen && <span className="ml-3">{item.title}</span>}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
