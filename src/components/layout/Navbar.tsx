
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 fixed left-0 right-0 top-0 z-50">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center justify-start">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="mr-2"
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
          <Link to="/" className="flex items-center">
            <span className="self-center text-xl font-semibold whitespace-nowrap text-ews-blue">EWS Dashboard</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
