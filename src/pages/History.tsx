import { useEffect, useState } from "react";
import { format, startOfDay, endOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatLocalDate, formatLocalTime, toUTCDate } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusIndicator from "@/components/dashboard/StatusIndicator";
import { Database } from "@/lib/database.types";
import { sensorService } from "@/lib/sensorService";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import ZoomableWaterLevelChart from "@/components/dashboard/ZoomableWaterLevelChart";
import { useRealtime } from "@/hooks/use-realtime";

type Tables = Database['public']['Tables'];
type WaterReading = Tables['water_level_readings']['Row'] & {
  sensors: Tables['sensors']['Row'] | null;
};
type WaterStatus = Database['public']['Enums']['sensor_status'];

const History = () => {
  const [activeTab, setActiveTab] = useState("chart");
  const [selectedTab, setSelectedTab] = useState("harian");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [location, setLocation] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readings, setReadings] = useState<WaterReading[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<{ status: WaterStatus; count: number }[]>([]);

  // Handle real-time water reading updates
  useRealtime<WaterReading>({
    table: 'water_level_readings',
    onData: (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const readingDate = startOfDay(new Date(payload.new.reading_time)).getTime();
        const selectedDateStart = startOfDay(selectedDate).getTime();
        
        if (readingDate === selectedDateStart) {
          setReadings(prev => {
            const newReadings = [...prev];
            const index = newReadings.findIndex(r => r.id === payload.new.id);
            if (index >= 0) {
              newReadings[index] = payload.new;
            } else {
              newReadings.push(payload.new);
            }
            return newReadings.sort((a, b) => 
              new Date(a.reading_time).getTime() - new Date(b.reading_time).getTime()
            );
          });
        }
      }
    }
  });

  // Fetch locations and readings when component mounts or filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch locations if not already loaded
        if (locations.length === 0) {
          const locationsData = await sensorService.getLocations();
          setLocations(locationsData);
        }

        // Fetch readings for the selected date
        const start = toUTCDate(startOfDay(selectedDate));
        const end = toUTCDate(endOfDay(selectedDate));
        const readings = await sensorService.getReadingsByDateRange(start, end, location, status);
        
        if (readings.length === 0) {
          setError('Tidak ada data untuk tanggal yang dipilih');
        }

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

        // Sort readings by reading_time in descending order (newest first)
        const sortedReadings = [...readings].sort((a, b) => 
          new Date(b.reading_time).getTime() - new Date(a.reading_time).getTime()
        );

        setReadings(sortedReadings);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, location, status]);

  const handleResetFilters = () => {
    setLocation("all");
    setStatus("all");
  };

  // Process chart data with improved time formatting
  const chartData = readings
    .filter(reading => reading && typeof reading.water_level === 'number')
    .map(reading => {
      const readingDate = new Date(reading.reading_time);
      // Format the time as HH:mm using UTC time again
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Riwayat</h1>
        <div className="w-[240px]">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "dd MMMM yyyy", { locale: id })}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={id}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <button 
            onClick={() => setActiveTab("chart")}
            className={`px-4 py-2 rounded-lg ${activeTab === "chart" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            Grafik Ketinggian Air
          </button>
        </div>
        {activeTab === "chart" && (
          <Tabs defaultValue="harian" className="space-y-4" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="harian">Harian</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="tabel">Tabel Riwayat</TabsTrigger>
            </TabsList>

            <TabsContent value="harian" className="space-y-4">
              <Card className="overflow-hidden">
                <CardHeader className="bg-white">
                  <CardTitle>Grafik Ketinggian Air</CardTitle>
                  <CardDescription>
                    Data ketinggian air pada {format(selectedDate, "dd MMMM yyyy", { locale: id })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[400px] p-4">
                    {chartData.length > 0 ? (
                      <ZoomableWaterLevelChart
                        data={chartData}
                        scrollable={true}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">Tidak ada data untuk ditampilkan pada tanggal ini</p>
                      </div>
                    )}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-[300px]">
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
                                      status === 'danger' ? 'Bahaya' : 'Normal'} ${readings.length > 0 ? Math.round((count / readings.length) * 100) : 0}%`
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
                            {readings.length > 0 ? Math.round((count / readings.length) * 100) : 0}%
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
                    Data ketinggian air pada {format(selectedDate, "dd MMMM yyyy", { locale: id })}
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
                        <Button onClick={handleResetFilters} className="w-full">
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
                                <TableCell>{format(new Date(reading.reading_time), "dd MMMM yyyy", { locale: id })}</TableCell>
                                <TableCell>
                                  {
                                    // Use UTC time format to be consistent with the graph
                                    (() => {
                                      const date = new Date(reading.reading_time);
                                      const hours = date.getUTCHours().toString().padStart(2, '0');
                                      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                                      const seconds = date.getUTCSeconds().toString().padStart(2, '0');
                                      return `${hours}:${minutes}:${seconds}`;
                                    })()
                                  }
                                </TableCell>
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
        )}
      </div>
    </div>
  );
};

export default History;
