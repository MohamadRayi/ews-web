import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SensorCard from "@/components/sensors/SensorCard";
import { sensorService } from "@/lib/sensorService";
import { useRealtime } from "@/hooks/use-realtime";
import type { Database } from "@/lib/database.types";

type SensorStatus = Database['public']['Tables']['current_sensor_status']['Row'];

const Specifications = () => {
  const [sensors, setSensors] = useState<SensorStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle real-time updates
  const handleStatusUpdate = (payload: { 
    new: SensorStatus; 
    old: SensorStatus | null;
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  }) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      setSensors(prev => {
        const index = prev.findIndex(s => s.id === payload.new.id);
        if (index >= 0) {
          const newSensors = [...prev];
          newSensors[index] = payload.new;
          return newSensors;
        }
        return [...prev, payload.new];
      });
    } else if (payload.eventType === 'DELETE' && payload.old) {
      setSensors(prev => prev.filter(s => s.id !== payload.old?.id));
    }
  };

  // Use real-time subscription
  useRealtime<SensorStatus>({
    table: 'current_sensor_status',
    onData: handleStatusUpdate
  });

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const data = await sensorService.getAllSensors();
        setSensors(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sensors');
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();
  }, []);

  if (loading) return <div className="p-4">Loading specifications...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium">Sensor Ketinggian Air</h4>
                <p className="text-sm text-gray-600">Sensor Ultrasonik A02YYUW yang sudah bersertifikasi IP67 (waterproof) dengan jangkauan deteksi 3cm - 450cm.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium">Mikrokontroler</h4>
                <p className="text-sm text-gray-600">ESP32 dengan WiFi dan Bluetooth terintegrasi untuk pengiriman data.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium">Casing</h4>
                <p className="text-sm text-gray-600">Box Panel Outdoor 20 x 30 x 12 cm Tahan air.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium">Panel Surya</h4>
                <p className="text-sm text-gray-600">Panel surya dengan tegangan kerja 9V yang digunakan sebagai sumber daya untuk pengisian baterai.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium">Baterai</h4>
                <p className="text-sm text-gray-600">2 buah Baterai Li-ion 18650 dengan kapasitas 2000mAh dan tegangan kerja 3.7V untuk setiap baterai nya.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">Sensor Terpasang</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map(sensor => (
          <SensorCard key={sensor.id} {...sensor} />
        ))}
        {sensors.length === 0 && (
          <p className="text-center text-muted-foreground col-span-3">Belum ada sensor terpasang</p>
        )}
      </div>
    </div>
  );
};

export default Specifications;
