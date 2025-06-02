import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const UserGuide = () => {
  const pdfUrl = "https://drive.google.com/file/d/1B82qtU4prtSFA7T1qtT16mjKWqblmd1z/preview";
  const downloadUrl = "https://drive.google.com/uc?export=download&id=1B82qtU4prtSFA7T1qtT16mjKWqblmd1z";
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Panduan Pengguna</h1>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manual Penggunaan Sistem EWS</CardTitle>
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Unduh PDF
            </Button>
          </a>
        </CardHeader>
        <CardContent>
          <div className="aspect-[16/9] w-full">
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded-lg border"
              allow="autoplay"
              loading="lazy"
            ></iframe>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Petunjuk Penggunaan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. Melihat Dashboard</h3>
            <p className="text-gray-600">
              Dashboard menampilkan informasi real-time tentang ketinggian air dari semua sensor yang terpasang.
              Anda dapat melihat grafik perubahan ketinggian air dan status setiap sensor.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">2. Mengakses Data Historis</h3>
            <p className="text-gray-600">
              Halaman Riwayat menyediakan data historis ketinggian air. Anda dapat memfilter data berdasarkan
              tanggal dan mengunduh laporan dalam format yang diinginkan.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">3. Integrasi Telegram</h3>
            <p className="text-gray-600">
              Sistem dilengkapi dengan bot Telegram untuk notifikasi real-time. Ikuti panduan di halaman
              Telegram untuk bergabung dengan grup dan menerima notifikasi.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">4. Pemeliharaan Sensor</h3>
            <p className="text-gray-600">
              Halaman Spesifikasi Alat berisi informasi teknis tentang sensor dan panduan pemeliharaan.
              Pastikan untuk memeriksa status sensor secara berkala.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserGuide; 