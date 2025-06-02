import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sensorService } from "@/lib/sensorService";
import { useRealtime } from "@/hooks/use-realtime";
import { Database } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import StatusIndicator from "@/components/dashboard/StatusIndicator";
import ZoomableWaterLevelChart from "@/components/dashboard/ZoomableWaterLevelChart";
import { Clock, Droplet, Signal, AlertCircle } from "lucide-react";
import { format, startOfDay, endOfDay, isToday, isSameDay, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { supabase } from "@/lib/supabase";

type Tables = Database['public']['Tables'];
type SensorStatus = Tables['current_sensor_status']['Row'];
type WaterReading = Tables['water_level_readings']['Row'] & {
  sensors: Tables['sensors']['Row'] | null;
};
type Sensor = Tables['sensors']['Row'];

export default function SensorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sensor, setSensor] = useState<SensorStatus | null>(null);
  const [sensorDetails, setSensorDetails] = useState<Sensor | null>(null);
  const [waterReadings, setWaterReadings] = useState<WaterReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastActiveDate, setLastActiveDate] = useState<Date>(new Date());
  const [isCurrentDate, setIsCurrentDate] = useState<boolean>(true);

  // Function to fetch readings for a specific date
  const fetchReadingsForDate = useCallback(async (date: Date, isToday: boolean, currentSensor?: SensorStatus | null) => {
    if (!id) return;
    
    try {
      // Get data for the specific date
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      console.log('[Fetching readings]', {
        sensorId: id,
        date: date.toISOString(),
        start: dayStart.toISOString(),
        end: dayEnd.toISOString(),
        isToday
      });
      
      const { data: readings, error } = await supabase
        .from('water_level_readings')
        .select('*, sensors(*)')
        .eq('sensor_id', id)
        .gte('reading_time', dayStart.toISOString())
        .lte('reading_time', dayEnd.toISOString())
        .order('reading_time', { ascending: true });

      if (error) throw error;
      
      console.log('[Readings fetched]', {
        count: readings?.length,
        firstReading: readings?.[0],
        lastReading: readings?.[readings?.length - 1]
      });
      
      setWaterReadings(readings || []);
      setIsCurrentDate(isToday(date));
    } catch (err) {
      console.error("Error fetching readings:", err);
    }
  }, [id]);

  useEffect(() => {
    let mounted = true;

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

        if (!mounted) return;

        if (!sensorStatus || !sensorData) {
          setError('Sensor tidak ditemukan');
          return;
        }

        setSensor(sensorStatus);
        setSensorDetails(sensorData);
        
        // Always fetch current data
        await fetchReadingsForDate(new Date(), true, sensorStatus);
        
        if (!mounted) return;
      } catch (err) {
        if (mounted) {
          console.error("Error fetching sensor data:", err);
          setError(err instanceof Error ? err.message : 'Gagal memuat data sensor');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchSensorData();

    return () => {
      mounted = false;
    };
  }, [id, navigate, fetchReadingsForDate]);

  // Process readings into chart data
  const chartData = useMemo(() => {
    if (!waterReadings.length) return [];

    return waterReadings
      .filter(r => r && typeof r.water_level === 'number')
      .map(r => {
        const utc = new Date(r.reading_time);
        const hours = utc.getUTCHours().toString().padStart(2, '0');
        const minutes = utc.getUTCMinutes().toString().padStart(2, '0');
        return {
          date: `${hours}:${minutes}`,
          value: Math.round(r.water_level)
        };
      });
  }, [waterReadings]);

  // Handle real-time water reading updates
  const handleWaterReadingUpdate = useCallback((payload: {
    new: WaterReading;
    old: WaterReading | null;
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  }) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const readingDate = new Date(payload.new.reading_time);
      const today = new Date();
      
      // Only add readings if they are from the same day we're currently viewing
      if (isSameDay(readingDate, isCurrentDate ? today : lastActiveDate)) {
        setWaterReadings(prev => {
          const newReadings = [...prev, payload.new];
          return newReadings
            .sort((a, b) => new Date(a.reading_time).getTime() - new Date(b.reading_time).getTime());
        });
      }
    }
  }, [isCurrentDate, lastActiveDate]);

  // Handle real-time sensor status updates
  useRealtime<SensorStatus>({
    table: 'current_sensor_status',
    onData: useCallback((payload) => {
      if (payload.new.id === id) {
        const newSensor = payload.new;
        setSensor(newSensor);
        
        if (newSensor.reading_time) {
          const newReadingDate = new Date(newSensor.reading_time);
          
          // Only update the sensor status, don't add readings
          // Readings will come through the water_level_readings subscription
        }
      }
    }, [id, isCurrentDate, fetchReadingsForDate]),
    filter: 'id',
    filterValue: id
  });

  // Hook up real-time updates
  useRealtime<WaterReading>({
    table: 'water_level_readings',
    onData: handleWaterReadingUpdate,
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
                  {sensor.reading_time 
                    ? (() => {
                        const date = new Date(sensor.reading_time);
                        const hours = date.getUTCHours().toString().padStart(2, '0');
                        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                        const seconds = date.getUTCSeconds().toString().padStart(2, '0');
                        return `${format(date, "dd MMMM yyyy", { locale: idLocale })} ${hours}:${minutes}:${seconds} WIB`;
                      })()
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grafik Ketinggian Air</CardTitle>
          <CardDescription>
            Data ketinggian air {sensor.name} pada {format(isCurrentDate ? new Date() : lastActiveDate, "dd MMMM yyyy", { locale: idLocale })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isCurrentDate && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-amber-700">
                Sensor terakhir aktif pada {format(lastActiveDate, "dd MMMM yyyy", { locale: idLocale })}. Data yang ditampilkan adalah dari tanggal tersebut.
              </p>
            </div>
          )}
          
          <div className="h-[400px]">
            {chartData.length > 0 ? (
              <ZoomableWaterLevelChart
                data={chartData}
                scrollable={true}
                description={`Data ketinggian air pada tanggal ${format(isCurrentDate ? new Date() : lastActiveDate, "dd MMMM yyyy", { locale: idLocale })} (${chartData.length} data)`}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <p className="text-lg mb-2">
                  {isCurrentDate 
                    ? "Belum ada data pembacaan hari ini"
                    : `Tidak ada data pembacaan untuk tanggal ${format(lastActiveDate, "dd MMMM yyyy", { locale: idLocale })}`}
                </p>
                <p className="text-sm">
                  {isCurrentDate ? "Menunggu data dari sensor..." : "Sensor tidak aktif pada tanggal tersebut"}
                </p>
                {sensor.reading_time && (
                  <p className="text-xs mt-2 text-gray-400">
                    Sensor terakhir aktif {format(new Date(sensor.reading_time), "dd MMMM yyyy HH:mm:ss", { locale: idLocale })}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
