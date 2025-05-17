import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { sensorService } from "@/lib/sensorService";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusIndicator from "@/components/dashboard/StatusIndicator";
import ZoomableWaterLevelChart from "@/components/dashboard/ZoomableWaterLevelChart";
import { Clock, Bell, Droplet } from "lucide-react";

type Sensor = Database['public']['Tables']['sensors']['Row'];
type WaterReading = Database['public']['Tables']['water_level_readings']['Row'];
type AlertHistory = Database['public']['Tables']['alert_history']['Row'];

export default function SensorDetail() {
  const { id } = useParams<{ id: string }>();
  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [alerts, setAlerts] = useState<AlertHistory[]>([]);
  const [waterReadings, setWaterReadings] = useState<WaterReading[]>([]);

  // Process readings into hourly and 10-minute data
  const processReadings = (data: WaterReading[]) => {
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Sort data by time first
    data.sort((a, b) => new Date(a.reading_time).getTime() - new Date(b.reading_time).getTime());

    const tenMinData = data.map(r => ({
      time: formatTime(new Date(r.reading_time)),
      [sensor?.id || 'sensor']: r.water_level
    }));

    // Group by hour for hourly data
    const hourlyData = data.reduce((acc: any[], r) => {
      const readingTime = new Date(r.reading_time);
      const hour = readingTime.setMinutes(0, 0, 0);
      const timeStr = formatTime(new Date(hour));
      const existing = acc.find(d => d.time === timeStr);

      if (existing) {
        existing[sensor?.id || 'sensor'] = 
          (existing[sensor?.id || 'sensor'] * existing.count + r.water_level) / (existing.count + 1);
        existing.count += 1;
      } else {
        acc.push({
          time: timeStr,
          [sensor?.id || 'sensor']: r.water_level,
          count: 1
        });
      }
      return acc;
    }, [])
    .map(({ count, ...rest }) => rest); // Remove count from final data

    return { 
      hourlyData: hourlyData.sort((a, b) => a.time.localeCompare(b.time)),
      tenMinData: tenMinData.sort((a, b) => a.time.localeCompare(b.time))
    };
  };

  useEffect(() => {
    if (!id) return;

    const fetchSensorData = async () => {
      try {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

        const [sensorData, waterData, alertData] = await Promise.all([
          sensorService.getSensor(id),
          sensorService.getWaterLevelStatistics(id, startDate, endDate),
          sensorService.getSensorAlerts(id)
        ]);

        setSensor(sensorData);
        setWaterReadings(waterData);
        setAlerts(alertData);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };

    fetchSensorData();

    // Set up real-time subscriptions
    const waterChannel = supabase
      .channel('water-readings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'water_level_readings',
          filter: `sensor_id=eq.${id}`
        },
        (payload) => {
          setWaterReadings(prev => {
            const newData = [...prev, payload.new as WaterReading];
            // Keep only last 24 hours of data
            const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return newData.filter(r => new Date(r.reading_time) > cutoff);
          });
        }
      )
      .subscribe();

    const alertChannel = supabase
      .channel('alert-history')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alert_history',
          filter: `sensor_id=eq.${id}`
        },
        (payload) => {
          setAlerts(prev => [...prev, payload.new as AlertHistory]);
        }
      )
      .subscribe();

    return () => {
      waterChannel.unsubscribe();
      alertChannel.unsubscribe();
    };
  }, [id]);

  if (!sensor) return <div className="p-4">Loading sensor details...</div>;

  const latestReading = waterReadings[waterReadings.length - 1];
  const { hourlyData, tenMinData } = processReadings(waterReadings);

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
            {latestReading && <StatusIndicator status={latestReading.status} />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Ketinggian Air</p>
                <p className="text-2xl font-bold">{latestReading?.water_level || 'N/A'} cm</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Pembaruan Terakhir</p>
                <p className="text-sm">
                  {latestReading ? new Date(latestReading.reading_time).toLocaleString() : 'N/A'}
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
            <CardContent className="pt-6">
              <ZoomableWaterLevelChart
                hourlyData={hourlyData}
                tenMinuteData={tenMinData}
                title="Riwayat Ketinggian Air"
                description="Data ketinggian air per jam dan per 10 menit dalam 24 jam terakhir"
                scrollable
                sensors={[{
                  id: sensor.id,
                  name: sensor.name,
                  color: "#2563eb"
                }]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {alerts.map(alert => (
                  <div key={alert.id} className="flex items-start gap-4 border-b pb-4">
                    <Bell className="h-5 w-5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusIndicator status={alert.status} />
                        <p className="font-medium">Ketinggian Air: {alert.water_level} cm</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(alert.sent_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
