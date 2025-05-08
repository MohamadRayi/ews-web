
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WaterLevelChart from "@/components/dashboard/WaterLevelChart";
import StatusIndicator from "@/components/dashboard/StatusIndicator";
import { Droplet, Battery, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// Mock sensor data - in a real app, this would be fetched from API based on ID
const sensorsData = {
  "sensor1": {
    id: "sensor1",
    name: "Sensor Jembatan Merah",
    location: "Sungai Ciliwung, Jakarta Barat",
    status: "normal" as const,
    waterLevel: 36,
    batteryLevel: 85,
    lastUpdate: "2023-05-06 10:30:15",
    chartData: [
      { time: "06:00", sensor1: 32 },
      { time: "07:00", sensor1: 34 },
      { time: "08:00", sensor1: 35 },
      { time: "09:00", sensor1: 36 },
      { time: "10:00", sensor1: 36 },
      { time: "11:00", sensor1: 35 },
      { time: "12:00", sensor1: 38 },
      { time: "13:00", sensor1: 40 },
      { time: "14:00", sensor1: 38 },
      { time: "15:00", sensor1: 37 },
      { time: "16:00", sensor1: 36 },
      { time: "17:00", sensor1: 36 },
    ]
  },
  "sensor2": {
    id: "sensor2",
    name: "Sensor Kampung Pulo",
    location: "Sungai Ciliwung, Jakarta Timur",
    status: "warning" as const,
    waterLevel: 53,
    batteryLevel: 62,
    lastUpdate: "2023-05-06 10:30:20",
    chartData: [
      { time: "06:00", sensor1: 40 },
      { time: "07:00", sensor1: 42 },
      { time: "08:00", sensor1: 45 },
      { time: "09:00", sensor1: 48 },
      { time: "10:00", sensor1: 50 },
      { time: "11:00", sensor1: 52 },
      { time: "12:00", sensor1: 53 },
      { time: "13:00", sensor1: 53 },
      { time: "14:00", sensor1: 54 },
      { time: "15:00", sensor1: 53 },
      { time: "16:00", sensor1: 52 },
      { time: "17:00", sensor1: 53 },
    ]
  }
};

const SensorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const sensorData = id && sensorsData[id as keyof typeof sensorsData];
  
  if (!sensorData) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">Sensor tidak ditemukan</h2>
        <Link to="/dashboard">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // Get status text for water level
  const getStatusText = () => {
    switch (sensorData.status) {
      case "normal":
        return "Normal";
      case "warning":
        return "Waspada";
      case "siaga":
        return "Siaga";
      case "danger":
      default:
        return "Bahaya";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link to="/dashboard">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{sensorData.name}</h1>
          <p className="text-gray-500">{sensorData.location}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Status:</span>
          <StatusIndicator status={sensorData.status} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ketinggian Air</CardTitle>
            <Droplet className="h-4 w-4 text-ews-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sensorData.waterLevel} cm</div>
            <p className="text-xs text-muted-foreground">Update terakhir: {sensorData.lastUpdate}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Baterai</CardTitle>
            <Battery className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{sensorData.batteryLevel}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  sensorData.batteryLevel > 60 ? 'bg-ews-green' : 
                  sensorData.batteryLevel > 20 ? 'bg-ews-yellow' : 'bg-ews-red'
                }`}
                style={{ width: `${sensorData.batteryLevel}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status Ketinggian</CardTitle>
            <Droplet className="h-4 w-4 text-ews-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <StatusIndicator status={sensorData.status} pulseAnimation={true} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {getStatusText()} - Level air saat ini
            </p>
          </CardContent>
        </Card>
      </div>
      
      <WaterLevelChart 
        data={sensorData.chartData} 
        title="Riwayat Ketinggian Air" 
        description="Data ketinggian air dalam 12 jam terakhir"
        multipleSensors={false}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Informasi Teknis Sensor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">ID Sensor</h3>
                <p>{sensorData.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Lokasi GPS</h3>
                <p>-6.2088, 106.8456</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Jenis Sensor</h3>
                <p>Ultrasonik HC-SR04 Waterproof</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Pemasangan</h3>
                <p>2023-01-15</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Kalibrasi Terakhir</h3>
                <p>2023-04-20</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status Jaringan</h3>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-ews-green"></div>
                  <span>Terhubung (4G)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SensorDetail;
