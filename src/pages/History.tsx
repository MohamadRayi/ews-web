
import { useState } from "react";
import ZoomableWaterLevelChart from "@/components/dashboard/ZoomableWaterLevelChart";

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

const History = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Riwayat Data</h1>
      </div>
      
      <div className="mb-6">
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
      </div>
    </div>
  );
};

export default History;
