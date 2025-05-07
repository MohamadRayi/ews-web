
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SensorCard from "@/components/sensors/SensorCard";

// Mock data for sensors
const sensorData = [
  {
    id: "sensor1",
    name: "Sensor Jembatan Merah",
    location: "Sungai Ciliwung, Jakarta Barat",
    status: "normal" as const,
    waterLevel: 36,
    batteryLevel: 85,
  },
  {
    id: "sensor2",
    name: "Sensor Kampung Pulo",
    location: "Sungai Ciliwung, Jakarta Timur",
    status: "warning" as const,
    waterLevel: 53,
    batteryLevel: 62,
  },
];

const Specifications = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Spesifikasi Alat</h1>
      
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Informasi Sistem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Deskripsi Sistem</h3>
            <p className="text-gray-600">
              Early Warning System (EWS) adalah sistem peringatan dini untuk memantau ketinggian air sungai secara real-time. 
              Sistem ini menggunakan sensor ultrasonik yang terhubung dengan modul komunikasi untuk mengirimkan data 
              ke server pusat dan memberikan notifikasi saat ketinggian air mencapai level tertentu.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Komponen Utama</h3>
            <Tabs defaultValue="hardware">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="hardware">Hardware</TabsTrigger>
                <TabsTrigger value="software">Software</TabsTrigger>
                <TabsTrigger value="communication">Komunikasi</TabsTrigger>
              </TabsList>
              <TabsContent value="hardware" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium">Sensor Ketinggian Air</h4>
                    <p className="text-sm text-gray-600">Sensor ultrasonik waterproof HC-SR04 dengan jangkauan deteksi 2cm - 400cm.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium">Mikrokontroler</h4>
                    <p className="text-sm text-gray-600">ESP32 dengan WiFi dan Bluetooth terintegrasi untuk pengiriman data.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium">Sumber Daya</h4>
                    <p className="text-sm text-gray-600">Baterai 18650 3.7V dengan panel surya 5W untuk pengisian ulang.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium">Casing</h4>
                    <p className="text-sm text-gray-600">Casing waterproof IP67 tahan terhadap kondisi cuaca ekstrem.</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="software" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium">Sistem Operasi</h4>
                    <p className="text-sm text-gray-600">FreeRTOS untuk manajemen tugas pada mikrokontroler.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium">Backend Server</h4>
                    <p className="text-sm text-gray-600">Node.js dengan Express untuk REST API dan pengolahan data.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium">Database</h4>
                    <p className="text-sm text-gray-600">MongoDB untuk penyimpanan data deret waktu.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium">Antarmuka</h4>
                    <p className="text-sm text-gray-600">React.js dashboard dengan visualisasi data real-time.</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="communication" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium">Protokol Komunikasi</h4>
                    <p className="text-sm text-gray-600">MQTT untuk komunikasi real-time dengan bandwidth rendah.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium">Konektivitas</h4>
                    <p className="text-sm text-gray-600">WiFi dan GSM (backup) untuk pengiriman data.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium">Integrasi Telegram</h4>
                    <p className="text-sm text-gray-600">Bot Telegram API untuk pengiriman notifikasi langsung ke grup.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium">Keamanan</h4>
                    <p className="text-sm text-gray-600">Enkripsi SSL/TLS untuk komunikasi data aman.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">Sensor Terpasang</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensorData.map(sensor => (
          <SensorCard
            key={sensor.id}
            id={sensor.id}
            name={sensor.name}
            location={sensor.location}
            status={sensor.status}
            waterLevel={sensor.waterLevel}
            batteryLevel={sensor.batteryLevel}
          />
        ))}
      </div>
    </div>
  );
};

export default Specifications;
