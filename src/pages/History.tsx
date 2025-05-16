
import { useState } from "react";
import ZoomableWaterLevelChart from "@/components/dashboard/ZoomableWaterLevelChart";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

// Updated 10-minute data for when zoomed in (instead of minutely data)
const tenMinuteWaterData = [
  { time: "10:00", sensor1: 43.0, sensor2: 48.0 },
  { time: "10:10", sensor1: 43.2, sensor2: 48.1 },
  { time: "10:20", sensor1: 43.4, sensor2: 48.2 },
  { time: "10:30", sensor1: 43.6, sensor2: 48.4 },
  { time: "10:40", sensor1: 43.8, sensor2: 48.6 },
  { time: "10:50", sensor1: 44.0, sensor2: 48.8 },
  { time: "11:00", sensor1: 44.2, sensor2: 49.0 },
  { time: "11:10", sensor1: 44.3, sensor2: 49.1 },
  { time: "11:20", sensor1: 44.4, sensor2: 49.2 },
  { time: "11:30", sensor1: 44.5, sensor2: 49.3 },
  { time: "11:40", sensor1: 44.6, sensor2: 49.4 },
  { time: "11:50", sensor1: 44.7, sensor2: 49.5 },
  { time: "12:00", sensor1: 45.0, sensor2: 50.0 }
];

// Simplified location data with explanatory labels for non-technical users
const locationData = [
  { 
    name: "Jembatan Merah", 
    keadaanNormal: 200, 
    perluPerhatian: 10, 
    kondisiSiaga: 5, 
    kondisiBahaya: 1 
  },
  { 
    name: "Kampung Pulo", 
    keadaanNormal: 180, 
    perluPerhatian: 25, 
    kondisiSiaga: 10, 
    kondisiBahaya: 5 
  },
];

const History = () => {
  const [activeTab, setActiveTab] = useState("chart");
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Riwayat Data</h1>
      </div>
      
      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <button 
            onClick={() => setActiveTab("chart")}
            className={`px-4 py-2 rounded-lg ${activeTab === "chart" ? "bg-ews-blue text-white" : "bg-gray-100"}`}
          >
            Grafik Ketinggian Air
          </button>
          <button 
            onClick={() => setActiveTab("location")}
            className={`px-4 py-2 rounded-lg ${activeTab === "location" ? "bg-ews-blue text-white" : "bg-gray-100"}`}
          >
            Kondisi Per Lokasi
          </button>
        </div>

        {activeTab === "chart" && (
          <ZoomableWaterLevelChart
            hourlyData={hourlyWaterData}
            tenMinuteData={tenMinuteWaterData}
            title="Riwayat Ketinggian Air"
            description="Data ketinggian air per jam/10 menit"
            sensors={[
              { id: "sensor1", name: "Sensor Jembatan Merah", color: "#0EA5E9" },
              { id: "sensor2", name: "Sensor Kampung Pulo", color: "#10B981" }
            ]}
            scrollable={true}
          />
        )}

        {activeTab === "location" && (
          <Card>
            <CardHeader>
              <CardTitle>Kondisi Air Berdasarkan Lokasi</CardTitle>
              <CardDescription>
                Jumlah jam dalam setiap kondisi ketinggian air di setiap lokasi pantauan
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
                      <Tooltip formatter={(value, name) => {
                        const labels = {
                          keadaanNormal: "Keadaan Normal",
                          perluPerhatian: "Perlu Perhatian",
                          kondisiSiaga: "Kondisi Siaga",
                          kondisiBahaya: "Kondisi Bahaya"
                        };
                        return [`${value} jam`, labels[name as keyof typeof labels]];
                      }} />
                      <Legend 
                        formatter={(value) => {
                          const labels = {
                            keadaanNormal: "Keadaan Normal",
                            perluPerhatian: "Perlu Perhatian",
                            kondisiSiaga: "Kondisi Siaga",
                            kondisiBahaya: "Kondisi Bahaya"
                          };
                          return labels[value as keyof typeof labels];
                        }} 
                      />
                      <Bar dataKey="keadaanNormal" name="keadaanNormal" stackId="a" fill="#10B981" />
                      <Bar dataKey="perluPerhatian" name="perluPerhatian" stackId="a" fill="#FBBF24" />
                      <Bar dataKey="kondisiSiaga" name="kondisiSiaga" stackId="a" fill="#F97316" />
                      <Bar dataKey="kondisiBahaya" name="kondisiBahaya" stackId="a" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Penjelasan Kondisi Air:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded bg-[#10B981] mt-0.5 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">Keadaan Normal</span>
                        <p className="text-sm text-gray-600">Air berada pada ketinggian aman, tidak ada risiko banjir</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded bg-[#FBBF24] mt-0.5 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">Perlu Perhatian</span>
                        <p className="text-sm text-gray-600">Air mulai naik, warga diharapkan waspada dan memantau situasi</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded bg-[#F97316] mt-0.5 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">Kondisi Siaga</span>
                        <p className="text-sm text-gray-600">Air sudah mencapai batas siaga, warga diharapkan bersiap mengungsi</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded bg-[#EF4444] mt-0.5 mr-3 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">Kondisi Bahaya</span>
                        <p className="text-sm text-gray-600">Air mencapai level berbahaya, warga diharapkan segera mengungsi</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Tentang Data:</h3>
                  <p className="text-sm text-blue-700">
                    Grafik di atas menunjukkan berapa lama (dalam jam) setiap lokasi berada dalam kondisi tertentu. 
                    Semakin tinggi bagian warna merah, semakin sering lokasi tersebut berada dalam kondisi bahaya.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default History;
