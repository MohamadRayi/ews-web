import { useEffect, useState, useCallback } from "react";
import { sensorService } from "@/lib/sensorService";
import { Database } from "@/lib/database.types";
import { useRealtime } from "@/hooks/use-realtime";
import StatCard from "@/components/dashboard/StatCard";
import WaterLevelChart from "@/components/dashboard/WaterLevelChart";
import SensorCard from "@/components/sensors/SensorCard";
import { Card } from "@/components/ui/card";
import { Droplet, Signal } from "lucide-react";

type SensorStatus = Database['public']['Views']['current_sensor_status']['Row'];
type WaterReading = Database['public']['Tables']['water_level_readings']['Row'];

const Dashboard = () => {
  const [sensors, setSensors] = useState<SensorStatus[]>([]);
  const [waterReadings, setWaterReadings] = useState<WaterReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handleNewReading = useCallback((payload: {
    new: WaterReading;
    old: WaterReading | null;
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  }) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      setWaterReadings(prev => [...prev, payload.new].slice(-100));
    } else if (payload.eventType === 'DELETE' && payload.old) {
      setWaterReadings(prev => prev.filter(r => r.id !== payload.old?.id));
    }
  }, []);

  // Use the realtime hook for water level readings
  useRealtime<WaterReading>({
    table: 'water_level_readings',
    onData: handleNewReading
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get all sensors with their current status
        const sensorsData = await sensorService.getAllSensors();
        setSensors(sensorsData);

        // Get latest water readings for the chart
        if (sensorsData.length > 0) {
          const endTime = new Date();
          const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
          const readings = await sensorService.getSensorReadings(
            sensorsData[0].id,
            startTime,
            endTime
          );
          setWaterReadings(readings);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate statistics
  const averageWaterLevel = sensors.reduce((acc, s) => acc + (s.water_level || 0), 0) / sensors.length;

  if (loading) return <div className="p-4">Loading dashboard data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Average Water Level"
          value={`${averageWaterLevel.toFixed(1)} cm`}
          icon={<Droplet className="h-4 w-4" />}
          description="Across all sensors"
        />
        <StatCard
          title="Active Sensors"
          value={sensors.length}
          icon={<Signal className="h-4 w-4" />}
          description="Total connected sensors"
        />
      </div>

      {/* Water Level Chart */}
      <Card className="p-4">
        <WaterLevelChart
          data={waterReadings.map(reading => ({
            time: new Date(reading.reading_time).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            sensor1: reading.water_level
          }))}
          title="Water Level Trends (Last 24 Hours)"
        />
      </Card>

      {/* Sensor Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sensors.map((sensor) => (
          <SensorCard key={sensor.id} {...sensor} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
