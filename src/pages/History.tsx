import { useEffect, useState } from "react";
import { format, startOfDay, endOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusIndicator from "@/components/dashboard/StatusIndicator";
import { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ZoomableWaterLevelChart from "@/components/dashboard/ZoomableWaterLevelChart";

type Tables = Database['public']['Tables'];
type WaterReading = Tables['water_level_readings']['Row'];
type Sensor = Tables['sensors']['Row'];
type WaterStatus = "normal" | "warning" | "siaga" | "danger";

interface ReadingWithSensor extends WaterReading {
  sensors: Sensor | null;
  status: WaterStatus;
}

const getStatus = (waterLevel: number): WaterStatus => {
  if (waterLevel >= 70) return "danger";
  if (waterLevel >= 50) return "siaga";
  if (waterLevel >= 30) return "warning";
  return "normal";
};

interface ChartDataPoint {
  date: string;
  value: number;
  time?: string; // For compatibility with sensor detail view
}

const History = () => {
  const [selectedTab, setSelectedTab] = useState("harian");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [location, setLocation] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readings, setReadings] = useState<ReadingWithSensor[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<{ status: WaterStatus; count: number }[]>([]);
  const [locationDistribution, setLocationDistribution] = useState<{ location: string; readings: number }[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  // Fetch locations when component mounts
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('sensors')
          .select('location')
          .eq('network_status', true);

        if (error) throw error;
        
        // Get unique locations with proper typing
        const uniqueLocations = [...new Set(data.map(item => item.location as string))].sort();
        setLocations(uniqueLocations);
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    const processChartData = (readings: ReadingWithSensor[]) => {
      // Group readings by hour and calculate average
      const hourlyData = readings.reduce((acc, reading) => {
        const hour = format(new Date(reading.reading_time), 'HH:00');
        if (!acc[hour]) {
          acc[hour] = { sum: reading.water_level, count: 1 };
        } else {
          acc[hour].sum += reading.water_level;
          acc[hour].count += 1;
        }
        return acc;
      }, {} as Record<string, { sum: number; count: number }>);

      // Convert to chart data format
      const chartData = Object.entries(hourlyData).map(([hour, data]) => ({
        date: hour,
        value: Math.round(data.sum / data.count)
      })).sort((a, b) => a.date.localeCompare(b.date));

      setChartData(chartData);
    };

    const processDistributions = (readings: ReadingWithSensor[]) => {
      // Calculate status distribution
      const statusCounts = readings.reduce((acc, reading) => {
        acc[reading.status] = (acc[reading.status] || 0) + 1;
        return acc;
      }, {} as Record<WaterStatus, number>);

      setStatusDistribution([
        { status: "normal", count: statusCounts.normal || 0 },
        { status: "warning", count: statusCounts.warning || 0 },
        { status: "siaga", count: statusCounts.siaga || 0 },
        { status: "danger", count: statusCounts.danger || 0 }
      ]);

      // Calculate location distribution
      const locationCounts = readings.reduce((acc, reading) => {
        const location = reading.sensors?.location || "Unknown";
        acc[location] = (acc[location] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setLocationDistribution(
        Object.entries(locationCounts)
          .map(([location, count]) => ({ location, readings: count }))
          .sort((a, b) => b.readings - a.readings)
      );
    };

    const fetchReadings = async () => {
      try {
        setLoading(true);
        const start = startOfDay(selectedDate);
        const end = endOfDay(selectedDate);
        
        let query = supabase
          .from('water_level_readings')
          .select('*, sensors(name, location)')
          .gte('reading_time', start.toISOString())
          .lte('reading_time', end.toISOString())
          .order('reading_time', { ascending: true });

        if (location && location !== 'all') {
          query = query.like('sensors.location', `%${location}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        
        const readingsWithStatus = (data as ReadingWithSensor[]).map(reading => ({
          ...reading,
          status: getStatus(reading.water_level)
        }));

        // Process data for all visualizations
        processChartData(readingsWithStatus);
        processDistributions(readingsWithStatus);

        if (status && status !== 'all') {
          setReadings(readingsWithStatus.filter(r => r.status === status));
        } else {
          setReadings(readingsWithStatus);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch readings');
      } finally {
        setLoading(false);
      }
    };

    fetchReadings();
  }, [selectedDate, location, status]);

  const handleResetFilters = () => {
    setLocation("all");
    setStatus("all");
  };

  if (loading) return <div className="p-4">Loading readings...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  
  const totalReadings = readings.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Riwayat</h1>
        <div className="w-[240px]">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pilih tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Tabs defaultValue="harian" className="space-y-4" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="harian">Harian</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="tabel">Tabel Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="harian" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rata-rata Ketinggian Air Harian</CardTitle>
              <CardDescription>
                Data rata-rata ketinggian air dalam centimeter per jam pada {format(selectedDate, "dd MMMM yyyy")}
              </CardDescription>
            </CardHeader>            <CardContent>
              <div className="h-[300px]">
                <ZoomableWaterLevelChart 
                  data={chartData}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Status Air</CardTitle>
              <CardDescription>
                Persentase waktu pada setiap status ketinggian air
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution.map(({ status, count }) => ({
                          name: status === 'warning' ? 'Waspada' : 
                                status === 'siaga' ? 'Siaga' :
                                status === 'danger' ? 'Bahaya' : 'Normal',
                          value: count,
                          label: `${status === 'warning' ? 'Waspada' : 
                                  status === 'siaga' ? 'Siaga' :
                                  status === 'danger' ? 'Bahaya' : 'Normal'} ${totalReadings > 0 ? Math.round((count / totalReadings) * 100) : 0}%`
                        }))}
                        cx="50%"
                        cy="50%"
                        startAngle={90}
                        endAngle={-270}
                        outerRadius={80}
                        dataKey="value"
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, value, label }) => {
                          const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
                          const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                          const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                          return (
                            <text x={x} y={y} fill="#666" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                              {label}
                            </text>
                          );
                        }}
                      >
                        {statusDistribution.map((entry) => (
                          <Cell 
                            key={entry.status}
                            fill={entry.status === 'normal' ? '#10B981' :
                                  entry.status === 'warning' ? '#FBBF24' :
                                  entry.status === 'siaga' ? '#F97316' :
                                  '#EF4444'} 
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {statusDistribution.map(({ status, count }) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusIndicator status={status} pulseAnimation={false} />
                        <span className="font-medium">{count} kejadian</span>
                      </div>
                      <span className="text-muted-foreground">
                        {totalReadings > 0 ? Math.round((count / totalReadings) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tabel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Ketinggian Air</CardTitle>
              <CardDescription>
                Data ketinggian air per sensor pada {format(selectedDate, "dd MMMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih lokasi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Lokasi</SelectLabel>
                          <SelectItem value="all">Semua Lokasi</SelectItem>
                          {locations.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Status</SelectLabel>
                          <SelectItem value="all">Semua Status</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="warning">Waspada</SelectItem>
                          <SelectItem value="siaga">Siaga</SelectItem>
                          <SelectItem value="danger">Bahaya</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end lg:col-span-1">
                    <Button onClick={handleResetFilters} variant="outline" className="w-full">
                      Reset Filter
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Alat</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Waktu</TableHead>
                        <TableHead className="text-right">Ketinggian (cm)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {readings.length > 0 ? (
                        readings.map((reading) => (
                          <TableRow key={reading.id}>
                            <TableCell>{reading.sensors?.name}</TableCell>
                            <TableCell>
                              <StatusIndicator status={reading.status} pulseAnimation={false} />
                            </TableCell>
                            <TableCell>{reading.sensors?.location}</TableCell>
                            <TableCell>{format(new Date(reading.reading_time), 'yyyy-MM-dd')}</TableCell>
                            <TableCell>{format(new Date(reading.reading_time), 'HH:mm:ss')}</TableCell>
                            <TableCell className="text-right font-medium">{reading.water_level}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6">
                            Tidak ada data yang sesuai dengan filter.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;
