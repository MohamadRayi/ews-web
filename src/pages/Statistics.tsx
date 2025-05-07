import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import ZoomableWaterLevelChart from "@/components/dashboard/ZoomableWaterLevelChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusIndicator from "@/components/dashboard/StatusIndicator";

// Mock history data
const initialHistoryData = [
  {
    id: "1",
    sensorName: "Sensor Jembatan Merah",
    status: "normal" as const,
    location: "Sungai Ciliwung, Jakarta Barat",
    date: "2023-05-06",
    time: "08:30:15",
    waterLevel: 35,
  },
  {
    id: "2",
    sensorName: "Sensor Kampung Pulo",
    status: "normal" as const,
    location: "Sungai Ciliwung, Jakarta Timur",
    date: "2023-05-06",
    time: "08:30:20",
    waterLevel: 42,
  },
  {
    id: "3",
    sensorName: "Sensor Jembatan Merah",
    status: "normal" as const,
    location: "Sungai Ciliwung, Jakarta Barat",
    date: "2023-05-06",
    time: "09:30:15",
    waterLevel: 38,
  },
  {
    id: "4",
    sensorName: "Sensor Kampung Pulo",
    status: "warning" as const,
    location: "Sungai Ciliwung, Jakarta Timur",
    date: "2023-05-06",
    time: "09:30:20",
    waterLevel: 50,
  },
  {
    id: "5",
    sensorName: "Sensor Jembatan Merah",
    status: "normal" as const,
    location: "Sungai Ciliwung, Jakarta Barat",
    date: "2023-05-06",
    time: "10:30:15",
    waterLevel: 36,
  },
  {
    id: "6",
    sensorName: "Sensor Kampung Pulo",
    status: "siaga" as const,
    location: "Sungai Ciliwung, Jakarta Timur",
    date: "2023-05-06",
    time: "10:30:20",
    waterLevel: 53,
  },
  {
    id: "7",
    sensorName: "Sensor Jembatan Merah",
    status: "danger" as const,
    location: "Sungai Ciliwung, Jakarta Barat",
    date: "2023-05-05",
    time: "22:15:10",
    waterLevel: 32,
  },
  {
    id: "8",
    sensorName: "Sensor Kampung Pulo",
    status: "normal" as const,
    location: "Sungai Ciliwung, Jakarta Timur",
    date: "2023-05-05",
    time: "22:15:05",
    waterLevel: 45,
  },
];

// Mock data for statistics
const generateDailyData = (date: Date) => {
  // Generate mock data based on the selected date
  const day = date.getDate();
  const baseLevel = 30 + (day % 10); // Use the day to vary the base level
  
  return [
    { time: "00:00", level: baseLevel },
    { time: "01:00", level: baseLevel + 2 },
    { time: "02:00", level: baseLevel + 4 },
    { time: "03:00", level: baseLevel + 6 },
    { time: "04:00", level: baseLevel + 5 },
    { time: "05:00", level: baseLevel + 3 },
    { time: "06:00", level: baseLevel + 2 },
    { time: "07:00", level: baseLevel + 5 },
    { time: "08:00", level: baseLevel + 8 },
    { time: "09:00", level: baseLevel + 10 },
    { time: "10:00", level: baseLevel + 13 },
    { time: "11:00", level: baseLevel + 15 },
    { time: "12:00", level: baseLevel + 14 },
    { time: "13:00", level: baseLevel + 12 },
    { time: "14:00", level: baseLevel + 10 },
    { time: "15:00", level: baseLevel + 12 },
    { time: "16:00", level: baseLevel + 14 },
    { time: "17:00", level: baseLevel + 16 },
    { time: "18:00", level: baseLevel + 15 },
    { time: "19:00", level: baseLevel + 13 },
    { time: "20:00", level: baseLevel + 10 },
    { time: "21:00", level: baseLevel + 8 },
    { time: "22:00", level: baseLevel + 5 },
    { time: "23:00", level: baseLevel + 3 }
  ];
};

// Generate data for entire month
const generateMonthlyData = () => {
  const today = new Date();
  const data = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i);
    const day = date.getDate().toString().padStart(2, '0');
    const baseLevel = 30 + Math.sin(i * 0.3) * 10; // Create some variety
    
    data.push({
      date: day,
      level: Math.round(baseLevel + Math.random() * 5) // Add some randomness
    });
  }
  
  return data;
};

const monthlyData = generateMonthlyData();

const statusData = [
  { name: "Normal", value: 68 },
  { name: "Waspada", value: 18 },
  { name: "Siaga", value: 7 },
  { name: "Bahaya", value: 7 },
];

const locationData = [
  { name: "Jembatan Merah", normalHours: 200, warningHours: 10, siagaHours: 5, dangerHours: 1 },
  { name: "Kampung Pulo", normalHours: 180, warningHours: 25, siagaHours: 10, dangerHours: 5 },
];

// Mock hourly data for the zoomable chart
const generateHourlyWaterData = (date: Date) => {
  const day = date.getDate();
  const baseLevel1 = 30 + (day % 8); // Different base level for sensor 1
  const baseLevel2 = 36 + (day % 10); // Different base level for sensor 2
  
  return [
    { time: "00:00", sensor1: baseLevel1, sensor2: baseLevel2 },
    { time: "01:00", sensor1: baseLevel1 + 3, sensor2: baseLevel2 + 2 },
    { time: "02:00", sensor1: baseLevel1 + 2, sensor2: baseLevel2 + 1 },
    { time: "03:00", sensor1: baseLevel1 - 1, sensor2: baseLevel2 - 1 },
    { time: "04:00", sensor1: baseLevel1 - 2, sensor2: baseLevel2 - 2 },
    { time: "05:00", sensor1: baseLevel1, sensor2: baseLevel2 },
    { time: "06:00", sensor1: baseLevel1 + 3, sensor2: baseLevel2 + 2 },
    { time: "07:00", sensor1: baseLevel1 + 6, sensor2: baseLevel2 + 4 },
    { time: "08:00", sensor1: baseLevel1 + 8, sensor2: baseLevel2 + 7 },
    { time: "09:00", sensor1: baseLevel1 + 10, sensor2: baseLevel2 + 9 },
    { time: "10:00", sensor1: baseLevel1 + 11, sensor2: baseLevel2 + 10 },
    { time: "11:00", sensor1: baseLevel1 + 12, sensor2: baseLevel2 + 11 },
    { time: "12:00", sensor1: baseLevel1 + 13, sensor2: baseLevel2 + 12 },
    { time: "13:00", sensor1: baseLevel1 + 12, sensor2: baseLevel2 + 11 },
    { time: "14:00", sensor1: baseLevel1 + 11, sensor2: baseLevel2 + 10 },
    { time: "15:00", sensor1: baseLevel1 + 10, sensor2: baseLevel2 + 9 },
    { time: "16:00", sensor1: baseLevel1 + 9, sensor2: baseLevel2 + 8 },
    { time: "17:00", sensor1: baseLevel1 + 8, sensor2: baseLevel2 + 7 },
    { time: "18:00", sensor1: baseLevel1 + 7, sensor2: baseLevel2 + 6 },
    { time: "19:00", sensor1: baseLevel1 + 6, sensor2: baseLevel2 + 5 },
    { time: "20:00", sensor1: baseLevel1 + 5, sensor2: baseLevel2 + 4 },
    { time: "21:00", sensor1: baseLevel1 + 4, sensor2: baseLevel2 + 3 },
    { time: "22:00", sensor1: baseLevel1 + 3, sensor2: baseLevel2 + 2 },
    { time: "23:00", sensor1: baseLevel1 + 2, sensor2: baseLevel2 + 1 }
  ];
};

// Generate 10-minute interval data for 24 hours (full day)
const generateTenMinuteWaterData = (date: Date) => {
  const day = date.getDate();
  const baseLevel1 = 40 + (day % 8); // Base level for sensor 1
  const baseLevel2 = 45 + (day % 10); // Base level for sensor 2
  
  const data = [];
  
  // Generate data for all 24 hours
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 10) {
      const timeOfDay = hour / 24; // 0-1 representing time of day
      
      // Create some realistic variations throughout the day
      const timeVariation = Math.sin(timeOfDay * Math.PI * 2) * 5;
      
      // Small random variations for each 10 minute interval
      const variation1 = Math.sin(minute * 0.1) * 1.5 + timeVariation;
      const variation2 = Math.cos(minute * 0.1) * 1.5 + timeVariation;
      
      const hourString = hour.toString().padStart(2, '0');
      const minuteString = minute.toString().padStart(2, '0');
      
      data.push({
        time: `${hourString}:${minuteString}`,
        sensor1: +(baseLevel1 + variation1).toFixed(1),
        sensor2: +(baseLevel2 + variation2).toFixed(1)
      });
    }
  }
  
  return data;
};

const COLORS = ["#10B981", "#FBBF24", "#F97316", "#EF4444"];

const Statistics = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailyData, setDailyData] = useState(generateDailyData(selectedDate));
  const [hourlyWaterData, setHourlyWaterData] = useState(generateHourlyWaterData(selectedDate));
  const [tenMinuteWaterData, setTenMinuteWaterData] = useState(generateTenMinuteWaterData(selectedDate));
  
  // Table filter state
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [location, setLocation] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [historyData, setHistoryData] = useState(initialHistoryData);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setDailyData(generateDailyData(date));
      setHourlyWaterData(generateHourlyWaterData(date));
      setTenMinuteWaterData(generateTenMinuteWaterData(date));
    }
  };
  
  const handleFilter = () => {
    let filteredData = [...initialHistoryData];

    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      filteredData = filteredData.filter((item) => item.date === formattedDate);
    }

    if (location) {
      filteredData = filteredData.filter((item) => item.location.includes(location));
    }

    if (status) {
      filteredData = filteredData.filter((item) => item.status === status);
    }

    setHistoryData(filteredData);
  };

  const handleResetFilters = () => {
    setDate(new Date());
    setLocation("");
    setStatus("");
    setHistoryData(initialHistoryData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Riwayat</h1>
        <div className="w-[240px]">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  "border-dashed bg-background"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Harian</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="location">Lokasi</TabsTrigger>
          <TabsTrigger value="history">Tabel Riwayat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rata-rata Ketinggian Air Harian</CardTitle>
              <CardDescription>
                Data rata-rata ketinggian air dalam centimeter per jam pada {format(selectedDate, "dd MMMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="h-80 min-w-[700px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dailyData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="level" 
                        stroke="#0EA5E9" 
                        activeDot={{ r: 8 }} 
                        name="Tinggi Air (cm)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <ZoomableWaterLevelChart
              hourlyData={hourlyWaterData}
              tenMinuteData={tenMinuteWaterData}
              title="Riwayat Ketinggian Air"
              description={`Data ketinggian air per jam/10 menit pada ${format(selectedDate, "dd MMMM yyyy")}`}
              sensors={[
                { id: "sensor1", name: "Sensor Jembatan Merah", color: "#0EA5E9" },
                { id: "sensor2", name: "Sensor Kampung Pulo", color: "#10B981" }
              ]}
              scrollable={true}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="status" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Status Air</CardTitle>
                <CardDescription>
                  Persentase waktu pada setiap status ketinggian air
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="h-80 min-w-[700px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Jumlah Kejadian Status</CardTitle>
                <CardDescription>
                  Distribusi kejadian berdasarkan status ketinggian air
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center">
                      <div className="h-3 w-3 rounded-full bg-ews-green mr-2"></div>
                      Normal
                    </span>
                    <span className="font-bold">215 kejadian</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-ews-green h-2.5 rounded-full" style={{ width: "68%" }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center">
                      <div className="h-3 w-3 rounded-full bg-ews-yellow mr-2"></div>
                      Waspada
                    </span>
                    <span className="font-bold">58 kejadian</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-ews-yellow h-2.5 rounded-full" style={{ width: "18%" }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center">
                      <div className="h-3 w-3 rounded-full bg-orange-500 mr-2"></div>
                      Siaga
                    </span>
                    <span className="font-bold">20 kejadian</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: "7%" }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center">
                      <div className="h-3 w-3 rounded-full bg-ews-red mr-2"></div>
                      Bahaya
                    </span>
                    <span className="font-bold">22 kejadian</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-ews-red h-2.5 rounded-full" style={{ width: "7%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="location" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Perbandingan Status Berdasarkan Lokasi</CardTitle>
              <CardDescription>
                Jumlah jam dalam setiap status ketinggian air per lokasi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="h-80 min-w-[700px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={locationData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="normalHours" name="Normal (jam)" stackId="a" fill="#10B981" />
                      <Bar dataKey="warningHours" name="Waspada (jam)" stackId="a" fill="#FBBF24" />
                      <Bar dataKey="siagaHours" name="Siaga (jam)" stackId="a" fill="#F97316" />
                      <Bar dataKey="dangerHours" name="Bahaya (jam)" stackId="a" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="pt-4">
          <div className="bg-white p-6 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium mb-1 block">Tanggal</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Lokasi</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih lokasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Lokasi</SelectItem>
                    <SelectItem value="Jakarta Barat">Jakarta Barat</SelectItem>
                    <SelectItem value="Jakarta Timur">Jakarta Timur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="warning">Waspada</SelectItem>
                    <SelectItem value="siaga">Siaga</SelectItem>
                    <SelectItem value="danger">Bahaya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end mb-6">
              <Button className="mr-2" variant="outline" onClick={handleResetFilters}>Reset Filter</Button>
              <Button onClick={handleFilter}>Terapkan Filter</Button>
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
                  {historyData.length > 0 ? (
                    historyData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.sensorName}</TableCell>
                        <TableCell>
                          <StatusIndicator status={item.status} pulseAnimation={false} />
                        </TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.time}</TableCell>
                        <TableCell className="text-right font-medium">{item.waterLevel}</TableCell>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Statistics;
