import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';

const Telegram = () => {
  // In a real app, this would be dynamically fetched
  const telegramLink = "https://t.me/+TlGdohNJUvplNmI1";
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Integrasi Telegram</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <div className="bg-blue-500 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                Bot EWS Monitoring
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Bergabunglah dengan grup Telegram EWS Monitoring untuk menerima notifikasi real-time 
              tentang perubahan ketinggian air dan peringatan dini bencana banjir.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-ews-blue mb-2">Fitur Bot Telegram:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Notifikasi perubahan status (normal, waspada, siaga, bahaya)</li>
                <li>Laporan harian ketinggian air</li>
                <li>Peringatan dini saat level air mencapai ambang batas</li>
                <li>Informasi cuaca terkini di lokasi pemantauan</li>
                <li>Kemampuan query data ketinggian air melalui perintah</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <a 
              href={telegramLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full"
            >
              <Button className="w-full bg-[#0088cc] hover:bg-[#0077b5]">
                Gabung Grup Telegram
              </Button>
            </a>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Panduan Penggunaan Bot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Perintah Dasar:</h3>
                <div className="bg-gray-100 p-3 rounded mt-2 font-mono text-sm">
                  <p>/help - Menampilkan bantuan</p>
                  <p>/status - Melihat status terkini dari ketinggian air</p>
                  <p>/report - Melihat laporan hari ini dari ketinggian air</p>
                  <p>/history - Melihat Riwayat 24 jam terakhir dari ketinggian air</p>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <h3 className="font-semibold text-yellow-800">Perhatian:</h3>
                <p className="text-sm text-yellow-700">
                  Bot akan mengirim notifikasi secara otomatis saat terjadi perubahan status. 
                  Pastikan notifikasi untuk grup diaktifkan di pengaturan Telegram Anda.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>QR Code Telegram</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="bg-white p-4 border rounded-lg">
            <QRCodeSVG
              value={telegramLink}
              size={192}
              bgColor="#ffffff"
              fgColor="#000000"
              level="L"
              includeMargin={false}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Scan QR code di atas atau klik tombol "Gabung Grup Telegram" untuk bergabung
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Telegram;
