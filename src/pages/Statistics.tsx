import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ZoomableWaterLevelChart from "@/components/dashboard/ZoomableWaterLevelChart";

// Mock data for statistics
const dailyData = [
  { date: "01", level: 32 },
  { date: "02", level: 38 },
  { date: "03", level: 45 },
  { date: "04", level: 50 },
  { date: "05", level: 42 },
  { date: "06", level: 30 },
  { date: "07", level: 25 },
  { date: "08", level: 22 },
  { date: "09", level: 35 },
  { date: "10", level: 40 },
  { date: "11", level: 48 },
  { date: "12", level: 52 },
  { date: "13", level: 45 },
  { date: "14", level: 40 },
  { date: "15", level: 38 },
  { date: "16", level: 42 },
  { date: "17", level: 46 },
  { date: "18", level: 50 },
  { date: "19", level: 48 },
  { date: "20", level: 45 },
  { date: "21", level: 40 },
  { date: "22", level: 35 },
  { date: "23", level: 30 },
  { date: "24", level: 28 },
  { date: "25", level: 32 },
  { date: "26", level: 36 },
  { date: "27", level: 40 },
  { date: "28", level: 44 },
  { date: "29", level: 46 },
  { date: "30", level: 48 },
];

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
const hourlyWaterData = [
  { time: "00:00", sensor1: 32, sensor2: 38 },
  { time: "01:00", sensor1: 35, sensor2: 40 },
  { time: "02:00", sensor1: 34, sensor2: 39 },
  { time: "03:00", sensor1: 31, sensor2: 37 },
  { time: "04:00", sensor1: 30, sensor2: 36 },
  { time: "05:00", sensor1: 32, sensor2: 38 },
  { time: "06:00", sensor1: 35, sensor2: 40 },
  { time: "07:00", sensor1: 38, sensor2: 42 },
  { time: "08:00", sensor1: 40, sensor2: 45 },
  { time: "09:00", sensor1: 42, sensor2: 47 },
  { time: "10:00", sensor1: 43, sensor2: 48 },
  { time: "11:00", sensor1: 44, sensor2: 49 },
  { time: "12:00", sensor1: 45, sensor2: 50 },
  { time: "13:00", sensor1: 44, sensor2: 49 },
  { time: "14:00", sensor1: 43, sensor2: 48 },
  { time: "15:00", sensor1: 42, sensor2: 47 },
  { time: "16:00", sensor1: 41, sensor2: 46 },
  { time: "17:00", sensor1: 40, sensor2: 45 },
  { time: "18:00", sensor1: 39, sensor2: 44 },
  { time: "19:00", sensor1: 38, sensor2: 43 },
  { time: "20:00", sensor1: 37, sensor2: 42 },
  { time: "21:00", sensor1: 36, sensor2: 41 },
  { time: "22:00", sensor1: 35, sensor2: 40 },
  { time: "23:00", sensor1: 34, sensor2: 39 }
];

// Mock minutely data for when zoomed in
const minutelyWaterData = [
  { time: "10:00", sensor1: 43, sensor2: 48 },
  { time: "10:05", sensor1: 43.2, sensor2: 48.1 },
  { time: "10:10", sensor1: 43.4, sensor2: 48.2 },
  { time: "10:15", sensor1: 43.5, sensor2: 48.3 },
  { time: "10:20", sensor1: 43.6, sensor2: 48.4 },
  { time: "10:25", sensor1: 43.7, sensor2: 48.5 },
  { time: "10:30", sensor1: 43.8, sensor2: 48.6 },
  { time: "10:35", sensor1: 43.9, sensor2: 48.7 },
  { time: "10:40", sensor1: 44, sensor2: 48.8 },
  { time: "10:45", sensor1: 44.1, sensor2: 48.9 },
  { time: "10:50", sensor1: 44.2, sensor2: 49 },
  { time: "10:55", sensor1: 44.3, sensor2: 49.1 },
  { time: "11:00", sensor1: 44, sensor2: 49 }
];

const COLORS = ["#10B981", "#FBBF24", "#F97316", "#EF4444"];

const Statistics = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Statistik</h1>
      
      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Harian</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="location">Lokasi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rata-rata Ketinggian Air Harian</CardTitle>
              <CardDescription>
                Data rata-rata ketinggian air dalam centimeter per hari selama bulan Mei 2023
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
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
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="level" stroke="#0EA5E9" activeDot={{ r: 8 }} name="Tinggi Air (cm)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <ZoomableWaterLevelChart
              hourlyData={hourlyWaterData}
              minutelyData={minutelyWaterData}
              title="Riwayat Ketinggian Air"
              description="Data ketinggian air per jam/menit pada tanggal 06 Mei 2023"
              sensors={[
                { id: "sensor1", name: "Sensor Jembatan Merah", color: "#0EA5E9" },
                { id: "sensor2", name: "Sensor Kampung Pulo", color: "#10B981" }
              ]}
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
                <div className="h-80 w-full">
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
              <div className="h-80 w-full">
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Statistics;
