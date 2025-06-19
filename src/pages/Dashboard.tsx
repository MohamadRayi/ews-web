import { useEffect, useState, useCallback, useMemo } from "react";
import { sensorService } from "@/lib/sensorService";
import { Database } from "@/lib/database.types";
import { useRealtime } from "@/hooks/use-realtime";
import StatCard from "@/components/dashboard/StatCard";
import ZoomableWaterLevelChart from "@/components/dashboard/ZoomableWaterLevelChart";
import SensorCard from "@/components/sensors/SensorCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Droplet, Signal } from "lucide-react";
import { format, startOfDay, endOfDay, isSameDay } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { toUTCDate } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type Tables = Database['public']['Tables'];
type SensorStatus = Tables['current_sensor_status']['Row'];
type WaterReading = Tables['water_level_readings']['Row'];

const Dashboard = () => {
  const isMobile = useIsMobile();
  const [sensors, setSensors] = useState<SensorStatus[]>([]);
  const [waterReadings, setWaterReadings] = useState<WaterReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [currentDate] = useState<Date>(new Date()); // Always use today's date

  // Handle real-time sensor status updates
  const handleSensorUpdate = useCallback((payload: {
    new: SensorStatus;
    old: SensorStatus | null;
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  }) => {
    console.log('[Sensor Update]', {
      type: payload.eventType,
      newData: payload.new,
      oldData: payload.old
    });
    
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
  }, []);

  // Handle real-time water reading updates
  const handleWaterReadingUpdate = useCallback((payload: {
    new: WaterReading;
    old: WaterReading | null;
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  }) => {
    console.log('[Water Reading Update]', {
      type: payload.eventType,
      sensorId: payload.new.sensor_id,
      selectedSensorId,
      waterLevel: payload.new.water_level,
      timestamp: payload.new.reading_time
    });

    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      // Check if the new reading is from today using isSameDay
      const readingDate = new Date(payload.new.reading_time);
      const now = new Date();
      const readingDayUTC = Date.UTC(readingDate.getUTCFullYear(), readingDate.getUTCMonth(), readingDate.getUTCDate());
      const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
      
      if (readingDayUTC === todayUTC) {
        setWaterReadings(prev => {
          const newReadings = [...prev, payload.new];
          return newReadings
            .sort((a, b) => new Date(a.reading_time).getTime() - new Date(b.reading_time).getTime());
        });
      }
    }
  }, []);

  // Use real-time subscriptions
  useRealtime<SensorStatus>({
    table: 'current_sensor_status',
    onData: handleSensorUpdate
  });

  useRealtime<WaterReading>({
    table: 'water_level_readings',
    onData: handleWaterReadingUpdate,
    filter: selectedSensorId ? 'sensor_id' : undefined,
    filterValue: selectedSensorId || undefined
  });

  // Initial data fetch
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current sensor status for average water level
        const { data: sensorData, error: sensorError } = await supabase
          .from('current_sensor_status')
          .select('*');

        if (sensorError) {
          console.error('[Sensor Error]', sensorError);
          throw sensorError;
        }

        setSensors(sensorData || []);
        
        // Get today's water level readings using UTC
        const now = new Date();
        const dayStartUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
        const dayEndUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

        console.log('[Fetching today readings]', {
          from: dayStartUTC.toISOString(),
          to: dayEndUTC.toISOString()
        });

        const { data: readings, error: readingsError } = await supabase
          .from('water_level_readings')
          .select('id, sensor_id, water_level, status, reading_time, created_at')
          .gte('reading_time', dayStartUTC.toISOString())
          .lte('reading_time', dayEndUTC.toISOString())
          .order('reading_time', { ascending: true });

        if (readingsError) {
          console.error('[Readings Error]', readingsError);
          throw readingsError;
        }

        setWaterReadings(readings || []);

      } catch (err) {
        console.error('[Error]', err);
        setError(err instanceof Error ? err.message : 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate average water level from current sensor status
  const averageWaterLevel = useMemo(() => {
    const validSensors = sensors.filter(s => s.water_level !== null && s.water_level !== undefined);
    
    console.log('[Average Calculation]', {
      totalSensors: sensors.length,
      validSensors: validSensors.length,
      waterLevels: validSensors.map(s => s.water_level)
    });

    if (validSensors.length === 0) return 0;
    
    const sum = validSensors.reduce((acc, sensor) => acc + sensor.water_level, 0);
    return sum / validSensors.length;
  }, [sensors]);

  // Process chart data with better time window
  const chartData = useMemo(() => {
    if (!waterReadings.length) {
      console.log('[Chart Data] No water readings available');
      return [];
    }

    console.log('[Processing Chart Data]', {
      totalReadings: waterReadings.length,
      firstReading: waterReadings[0],
      lastReading: waterReadings[waterReadings.length - 1]
    });

    const processed = waterReadings
      .filter(reading => {
        const isValid = reading && typeof reading.water_level === 'number';
        if (!isValid) {
          console.log('[Invalid Reading]', reading);
        }
        return isValid;
      })
      .map(reading => {
        const readingDate = new Date(reading.reading_time);
        // Format the time as HH:mm using UTC time
        const hours = readingDate.getUTCHours().toString().padStart(2, '0');
        const minutes = readingDate.getUTCMinutes().toString().padStart(2, '0');
        return {
          date: `${hours}:${minutes}`,
          value: Math.round(reading.water_level)
        };
      })
      // Make sure data is sorted by time
      .sort((a, b) => {
        const [aHours, aMinutes] = a.date.split(':').map(Number);
        const [bHours, bMinutes] = b.date.split(':').map(Number);
        return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
      });

    return processed;
  }, [waterReadings]);

  // Debug: Log when chart data changes
  useEffect(() => {
    console.log('[Chart Data Updated]', {
      hasData: chartData.length > 0,
      points: chartData.length
    });
  }, [chartData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6 bg-red-50 rounded-lg">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-gray-600">
            Silakan coba lagi nanti atau hubungi administrator sistem.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Rata-rata Ketinggian Air"
          value={averageWaterLevel > 0 ? `${averageWaterLevel.toFixed(1)} cm` : 'Tidak ada data'}
          icon={<Droplet className="h-4 w-4" />}
          description={sensors.length > 0 ? "Rata-rata semua sensor aktif" : "Belum ada sensor aktif"}
        />
        <StatCard
          title="Sensor Aktif"
          value={sensors.length.toString()}
          icon={<Signal className="h-4 w-4" />}
          description={sensors.length > 0 ? "Total sensor terhubung" : "Tidak ada sensor aktif"}
        />
      </div>

      {/* Water Level Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Grafik Ketinggian Air</CardTitle>
          <CardDescription>
            Data ketinggian air {isMobile ? '(geser untuk melihat lebih detail)' : ''} pada {format(currentDate, "EEEE, d MMMM yyyy", { locale: idLocale })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ZoomableWaterLevelChart
            data={chartData}
            scrollable={isMobile}
          />
        </CardContent>
      </Card>

      {/* Sensor Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sensors.map((sensor) => (
          <SensorCard key={sensor.id} {...sensor} />
        ))}
        {sensors.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            Tidak ada sensor yang aktif
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
