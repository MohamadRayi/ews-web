
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for statistics
const monthlyData = [
  { name: "Jan", level: 32 },
  { name: "Feb", level: 38 },
  { name: "Mar", level: 45 },
  { name: "Apr", level: 50 },
  { name: "May", level: 42 },
  { name: "Jun", level: 30 },
  { name: "Jul", level: 25 },
  { name: "Aug", level: 22 },
  { name: "Sep", level: 35 },
  { name: "Oct", level: 40 },
  { name: "Nov", level: 48 },
  { name: "Dec", level: 52 },
];

const statusData = [
  { name: "Normal", value: 68 },
  { name: "Waspada", value: 25 },
  { name: "Bahaya", value: 7 },
];

const locationData = [
  { name: "Jembatan Merah", normalHours: 200, warningHours: 15, dangerHours: 1 },
  { name: "Kampung Pulo", normalHours: 180, warningHours: 35, dangerHours: 5 },
];

const COLORS = ["#10B981", "#FBBF24", "#EF4444"];

const Statistics = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Statistik</h1>
      
      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="monthly">Bulanan</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="location">Lokasi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rata-rata Ketinggian Air Bulanan</CardTitle>
              <CardDescription>
                Data rata-rata ketinggian air dalam centimeter per bulan selama tahun 2023
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyData}
                    margin={{
                      top: 5,
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
                    <Line type="monotone" dataKey="level" stroke="#0EA5E9" activeDot={{ r: 8 }} name="Tinggi Air (cm)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
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
                    <span className="font-bold">78 kejadian</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-ews-yellow h-2.5 rounded-full" style={{ width: "25%" }}></div>
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
