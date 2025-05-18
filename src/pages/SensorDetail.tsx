import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sensorService } from "@/lib/sensorService";
import { useRealtime } from "@/hooks/use-realtime";
import { Database } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusIndicator from "@/components/dashboard/StatusIndicator";
import ZoomableWaterLevelChart from "@/components/dashboard/ZoomableWaterLevelChart";
import { Clock, Bell, Droplet, Battery, Signal } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Tables = Database['public']['Tables'];
type SensorStatus = Tables['current_sensor_status']['Row'];
type WaterReading = Tables['water_level_readings']['Row'] & {
  sensors: Tables['sensors']['Row'] | null;
};
type AlertHistory = Tables['alert_history']['Row'];
type Sensor = Tables['sensors']['Row'];

export default function SensorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sensor, setSensor] = useState<SensorStatus | null>(null);
  const [sensorDetails, setSensorDetails] = useState<Sensor | null>(null);
  const [alerts, setAlerts] = useState<AlertHistory[]>([]);
  const [waterReadings, setWaterReadings] = useState<WaterReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const fetchSensorData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [sensorStatus, sensorData] = await Promise.all([
          sensorService.getSensorById(id),
          sensorService.getSensorDetails(id)
        ]);

        if (!sensorStatus || !sensorData) {
          setError('Sensor tidak ditemukan');
          return;
        }

        setSensor(sensorStatus);
        setSensorDetails(sensorData);

        // Perbaiki: Gunakan waktu UTC untuk range query
        const now = new Date();
        const endTime = new Date(Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          now.getUTCHours(),
          now.getUTCMinutes(),
          now.getUTCSeconds()
        ));
        const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

        const [readings, alertData] = await Promise.all([
          sensorService.getSensorReadings(id, startTime, endTime),
          sensorService.getAlertHistory(id)
        ]);

        setWaterReadings(readings);
        setAlerts(alertData);

        // Fallback: jika readings kosong, masukkan data dari sensorStatus
        if ((!readings || readings.length === 0) && sensorStatus?.water_level && sensorStatus?.reading_time) {
          setWaterReadings([{
            id: sensorStatus.id,
            sensor_id: sensorStatus.id,
            water_level: sensorStatus.water_level,
            status: sensorStatus.status || 'normal',
            reading_time: sensorStatus.reading_time,
            created_at: sensorStatus.reading_time,
            sensors: null
          }]);
        }

      } catch (err) {
        console.error("Error fetching sensor data:", err);
        setError(err instanceof Error ? err.message : 'Gagal memuat data sensor');
      } finally {
        setLoading(false);
      }
    };

    fetchSensorData();
  }, [id, navigate]);

  // Handle real-time sensor status updates
  useRealtime<SensorStatus>({
    table: 'current_sensor_status',
    onData: (payload) => {
      if (payload.new.id === id) {
        setSensor(payload.new);
      }
    },
    filter: 'id',
    filterValue: id
  });

  // Handle real-time water reading updates
  useRealtime<WaterReading>({
    table: 'water_level_readings',
    onData: (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        setWaterReadings(prev => {
          const newReadings = [...prev, payload.new];
          // Keep last 24 hours of data
          const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return newReadings
            .filter(r => new Date(r.reading_time) > cutoff)
            .sort((a, b) => new Date(a.reading_time).getTime() - new Date(b.reading_time).getTime());
        });
      }
    },
    filter: 'sensor_id',
    filterValue: id
  });

  // Handle real-time alert updates
  useRealtime<AlertHistory>({
    table: 'alert_history',
    onData: (payload) => {
      if (payload.eventType === 'INSERT') {
        setAlerts(prev => [payload.new, ...prev]);
      }
    },
    filter: 'sensor_id',
    filterValue: id
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Memuat data sensor...</p>
        </div>
      </div>
    );
  }

  if (error || !sensor || !sensorDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6 bg-red-50 rounded-lg">
          <p className="text-red-600 mb-4">{error || 'Sensor tidak ditemukan'}</p>
          <p className="text-sm text-gray-600 mb-4">
            Silakan periksa kembali ID sensor atau hubungi administrator sistem.
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Process readings into chart data
  const chartData = waterReadings
    .filter(r => r && typeof r.water_level === 'number')
    .sort((a, b) => new Date(a.reading_time).getTime() - new Date(b.reading_time).getTime())
    .map(r => {
      const utc = new Date(r.reading_time);
      const hours = utc.getUTCHours().toString().padStart(2, '0');
      const minutes = utc.getUTCMinutes().toString().padStart(2, '0');
      return {
        date: `${hours}:${minutes}`,
        value: Math.round(r.water_level)
      };
    });

  return (
    <div className="space-y-6 p-6">
      {/* Sensor Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{sensor.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{sensor.location}</p>
            </div>
            {sensor.status && <StatusIndicator status={sensor.status} />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Ketinggian Air</p>
                <p className="text-2xl font-bold">
                  {sensor.water_level ? `${sensor.water_level} cm` : '-'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Signal className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Status Koneksi</p>
                <p className="text-2xl font-bold">
                  {sensorDetails.network_status ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Pembaruan Terakhir</p>
                <p className="text-sm">
                  {sensor.reading_time ? format(new Date(sensor.reading_time), "dd MMMM yyyy HH:mm:ss", { locale: idLocale }) : '-'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="readings">
        <TabsList>
          <TabsTrigger value="readings">Riwayat Ketinggian Air</TabsTrigger>
          <TabsTrigger value="alerts">Riwayat Peringatan</TabsTrigger>
        </TabsList>

        <TabsContent value="readings">
          <Card>
            <CardHeader>
              <CardTitle>Grafik Ketinggian Air</CardTitle>
              <CardDescription>
                Data ketinggian air {sensor.name} dalam 24 jam terakhir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ZoomableWaterLevelChart
                  data={chartData}
                  scrollable={true}
                  description={
                    chartData.length === 0 
                      ? "Belum ada data pembacaan dalam 24 jam terakhir"
                      : `Data ketinggian air per 10 menit dalam 24 jam terakhir (${chartData.length} data)`
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {alerts.length > 0 ? (
                  alerts.map(alert => (
                    <div key={alert.id} className="flex items-start gap-4 border-b pb-4">
                      <Bell className="h-5 w-5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <StatusIndicator status={alert.status} pulseAnimation={false} />
                          <p className="font-medium">Ketinggian Air: {alert.water_level} cm</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(alert.sent_at), "dd MMMM yyyy HH:mm:ss", { locale: idLocale })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-muted-foreground">Belum ada riwayat peringatan</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
