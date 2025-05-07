
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md px-4 py-8 bg-white rounded-lg shadow-md">
        <h1 className="text-6xl font-bold text-ews-blue mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Halaman tidak ditemukan</p>
        <p className="mb-8 text-gray-500">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link to="/">
          <Button className="bg-ews-blue hover:bg-ews-blue-dark">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
