
import { useState, useEffect } from "react";
import StatCard from "@/components/dashboard/StatCard";
import WaterLevelChart from "@/components/dashboard/WaterLevelChart";
import { Users, Droplet, Gauge } from "lucide-react";
import SensorCard from "@/components/sensors/SensorCard";

// Mock data - in a real app, this would come from your API
const waterLevelHistoryData = [
  { time: "00:00", sensor1: 30, sensor2: 45 },
  { time: "01:00", sensor1: 32, sensor2: 43 },
  { time: "02:00", sensor1: 31, sensor2: 48 },
  { time: "03:00", sensor1: 34, sensor2: 50 },
  { time: "04:00", sensor1: 36, sensor2: 52 },
  { time: "05:00", sensor1: 40, sensor2: 55 },
  { time: "06:00", sensor1: 45, sensor2: 59 },
  { time: "07:00", sensor1: 42, sensor2: 64 },
  { time: "08:00", sensor1: 40, sensor2: 62 },
  { time: "09:00", sensor1: 38, sensor2: 58 },
  { time: "10:00", sensor1: 37, sensor2: 56 },
  { time: "11:00", sensor1: 36, sensor2: 54 },
  { time: "12:00", sensor1: 36, sensor2: 53 },
];

const sensorData = [
  {
    id: "sensor1",
    name: "Sensor Jembatan Merah",
    location: "Sungai Ciliwung, Jakarta Barat",
    status: "normal" as const,
    waterLevel: 36,
    batteryLevel: 85,
  },
  {
    id: "sensor2",
    name: "Sensor Kampung Pulo",
    location: "Sungai Ciliwung, Jakarta Timur",
    status: "warning" as const,
    waterLevel: 53,
    batteryLevel: 62,
  },
];

const Dashboard = () => {
  const [userCount, setUserCount] = useState(0);

  // Simulate user count increasing for demo purposes
  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount(prevCount => {
        if (prevCount < 215) {
          return prevCount + 1;
        }
        clearInterval(interval);
        return prevCount;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Monitoring</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Users" 
          value={userCount}
          description="Total pengguna yang tergabung dalam grup Telegram" 
          icon={<Users className="h-5 w-5 text-gray-500" />} 
        />
        <StatCard 
          title="Status Ketinggian" 
          value="Normal" 
          description="Status ketinggian air saat ini"
          icon={<Droplet className="h-5 w-5 text-ews-blue" />} 
        />
        <StatCard 
          title="Sensor Aktif" 
          value="2/2" 
          description="Jumlah sensor yang aktif dan berfungsi"
          icon={<Gauge className="h-5 w-5 text-ews-green" />} 
        />
      </div>
      
      <WaterLevelChart 
        data={waterLevelHistoryData} 
        title="Riwayat Ketinggian Air" 
        description="Data ketinggian air dalam 12 jam terakhir"
      />
      
      <h2 className="text-xl font-semibold mt-8 mb-4">Sensor Terpasang</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensorData.map(sensor => (
          <SensorCard
            key={sensor.id}
            id={sensor.id}
            name={sensor.name}
            location={sensor.location}
            status={sensor.status}
            waterLevel={sensor.waterLevel}
            batteryLevel={sensor.batteryLevel}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
