
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import StatusIndicator from "@/components/dashboard/StatusIndicator";
import ZoomableWaterLevelChart from "@/components/dashboard/ZoomableWaterLevelChart";

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
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [location, setLocation] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [historyData, setHistoryData] = useState(initialHistoryData);

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
        <h1 className="text-3xl font-bold">Riwayat Data</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleResetFilters}>Reset Filter</Button>
        </div>
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
    </div>
  );
};

export default History;
