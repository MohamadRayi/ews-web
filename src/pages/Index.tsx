import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-ews-blue-light via-white to-ews-blue-light">
      <div className="max-w-3xl w-full px-4 py-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold mb-2 text-ews-blue-dark">Early Warning System</h1>
        <p className="text-xl text-gray-600 mb-6">
          Sistem pemantauan ketinggian air real-time untuk pencegahan banjir
        </p>
        
        <div className="space-y-6 mb-8">
          <div className="p-6 rounded-lg bg-blue-50 shadow-sm">
            <h2 className="text-2xl font-semibold mb-3 text-ews-blue">Pemantauan Tinggi Muka Air</h2>
            <p className="mb-4">
              Dapatkan informasi ketinggian air dari berbagai sensor yang tersebar di lokasi-lokasi strategis secara real-time.
            </p>
            <Link to="/dashboard">
              <Button className="bg-ews-blue hover:bg-ews-blue-dark">
                Kunjungi Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-lg bg-blue-50 shadow-sm">
              <h2 className="text-xl font-semibold mb-2 text-ews-blue">Notifikasi Telegram</h2>
              <p className="mb-3 text-sm">Terima peringatan dini melalui grup Telegram saat level air mencapai ambang berbahaya.</p>
              <Link to="/telegram">
                <Button variant="outline" className="text-ews-blue border-ews-blue hover:bg-ews-blue hover:text-white">
                  Gabung Grup <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="p-5 rounded-lg bg-blue-50 shadow-sm">
              <h2 className="text-xl font-semibold mb-2 text-ews-blue">Riwayat Data</h2>
              <p className="mb-3 text-sm">Akses data historis ketinggian air untuk analisis dan evaluasi.</p>
              <Link to="/history">
                <Button variant="outline" className="text-ews-blue border-ews-blue hover:bg-ews-blue hover:text-white">
                  Lihat Riwayat <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="max-w-md mx-auto p-5 rounded-lg bg-blue-50 shadow-sm">
            <h2 className="text-xl font-semibold mb-2 text-ews-blue">Panduan Pengguna</h2>
            <p className="mb-3 text-sm">Pelajari cara menggunakan sistem EWS dengan panduan lengkap dan dokumentasi.</p>
            <Link to="/user-guide">
              <Button variant="outline" className="text-ews-blue border-ews-blue hover:bg-ews-blue hover:text-white">
                Buka Panduan <BookOpen className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Link to="/specifications">
            <Button variant="link" className="text-ews-blue">
              Informasi Spesifikasi Alat <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
