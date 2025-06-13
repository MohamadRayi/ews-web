import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceLine
} from "recharts";

interface ChartData {
  date: string;
  value: number;
  sma?: number;
}

interface ZoomableWaterLevelChartProps {
  data: ChartData[];
  title?: string;
  description?: string;
  scrollable?: boolean;
}

// Definisi level ketinggian air
const waterLevels = {
  bahaya: { threshold: 400, color: "#ef4444", label: "Bahaya" },  // Merah
  siaga: { threshold: 300, color: "#f97316", label: "Siaga" },    // Oranye
  waspada: { threshold: 200, color: "#eab308", label: "Waspada" }, // Kuning
  normal: { threshold: 100, color: "#3b82f6", label: "Normal" }    // Biru
};

// Fungsi untuk mendapatkan status dan warna berdasarkan ketinggian
const getWaterStatus = (value: number) => {
  if (value >= waterLevels.bahaya.threshold) return waterLevels.bahaya;
  if (value >= waterLevels.siaga.threshold) return waterLevels.siaga;
  if (value >= waterLevels.waspada.threshold) return waterLevels.waspada;
  return waterLevels.normal; // Semua nilai di bawah level waspada adalah normal
};

const ZoomableWaterLevelChart = ({
  data,
  title,
  description,
  scrollable = false,
}: ZoomableWaterLevelChartProps) => {
  // Mengurangi jumlah data point dan menghitung SMA
  const chartData = useMemo(() => {
    const samplingRate = data.length > 100 ? Math.floor(data.length / 100) : 1;
    const period = 5;

    return data
      .filter((_, index) => index % samplingRate === 0)
      .map((point, index, filteredData) => {
        const start = Math.max(0, index - period + 1);
        const windowSlice = filteredData.slice(start, index + 1);
        const sum = windowSlice.reduce((acc, curr) => acc + curr.value, 0);
        const sma = windowSlice.length > 0 ? sum / windowSlice.length : point.value;

        const timeStr = point.date;
        const [hours, minutes] = timeStr.split(':');
        const status = getWaterStatus(point.value);

        return {
          ...point,
          sma: Number(sma.toFixed(1)),
          formattedTime: `${hours}:${minutes}`,
          value: Number(point.value.toFixed(1)),
          color: status.color,
          status: status.label
        };
      });
  }, [data]);

  // Menghitung domain Y dengan padding yang lebih baik
  const { yDomain } = useMemo(() => {
    if (data.length === 0) {
      return { yDomain: [0, waterLevels.bahaya.threshold + 50] };
    }

    let min = Math.min(...data.map(d => d.value));
    let max = Math.max(
      Math.max(...data.map(d => d.value)),
      waterLevels.bahaya.threshold + 50
    );

    // Bulatkan ke puluhan terdekat
    min = Math.floor(min / 10) * 10;
    max = Math.ceil(max / 10) * 10;

    // Tambahkan padding
    const padding = Math.max(10, (max - min) * 0.1);
    return {
      yDomain: [
        Math.max(0, min - padding),
        max + padding
      ]
    };
  }, [data]);

  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Tidak ada data untuk ditampilkan</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 110, left: 10, bottom: 20 }}
      >
        <CartesianGrid 
          strokeDasharray="2 2" 
          stroke="#cbd5e1"
          strokeWidth={1}
          vertical={true}
          horizontal={true}
          opacity={0.8} 
        />
        
        {/* Reference lines untuk setiap level status */}
        <ReferenceLine 
          y={waterLevels.bahaya.threshold} 
          stroke={waterLevels.bahaya.color}
          strokeDasharray="3 3"
          label={{ 
            value: `${waterLevels.bahaya.label} (${waterLevels.bahaya.threshold}cm)`,
            position: 'right',
            fill: waterLevels.bahaya.color,
            fontSize: 12,
            offset: 10
          }}
        />
        <ReferenceLine 
          y={waterLevels.siaga.threshold}
          stroke={waterLevels.siaga.color}
          strokeDasharray="3 3"
          label={{ 
            value: `${waterLevels.siaga.label} (${waterLevels.siaga.threshold}cm)`,
            position: 'right',
            fill: waterLevels.siaga.color,
            fontSize: 12,
            offset: 10
          }}
        />
        <ReferenceLine 
          y={waterLevels.waspada.threshold}
          stroke={waterLevels.waspada.color}
          strokeDasharray="3 3"
          label={{ 
            value: `${waterLevels.waspada.label} (${waterLevels.waspada.threshold}cm)`,
            position: 'right',
            fill: waterLevels.waspada.color,
            fontSize: 12,
            offset: 10
          }}
        />
        <ReferenceLine 
          y={waterLevels.normal.threshold}
          stroke={waterLevels.normal.color}
          strokeDasharray="3 3"
          label={{ 
            value: `${waterLevels.normal.label} (${waterLevels.normal.threshold}cm)`,
            position: 'right',
            fill: waterLevels.normal.color,
            fontSize: 12,
            offset: 10
          }}
        />
        
        <XAxis
          dataKey="formattedTime"
          stroke="#94a3b8"
          fontSize={11}
          tickLine={false}
          axisLine={true}
          tickMargin={12}
          minTickGap={50}
          label={{ 
            value: 'Waktu (WIB)', 
            position: 'bottom',
            offset: 0,
            style: { 
              fontSize: '12px',
              fill: '#64748b',
              fontFamily: '"Inter", system-ui, sans-serif'
            }
          }}
          style={{
            fontSize: '10px',
            fontFamily: '"Inter", system-ui, sans-serif'
          }}
        />
        
        <YAxis
          domain={yDomain}
          tickCount={8}
          tickFormatter={(value) => `${value}`}
          stroke="#94a3b8"
          fontSize={11}
          tickLine={false}
          axisLine={true}
          width={50}
          label={{ 
            value: 'Ketinggian Air (cm)', 
            angle: -90, 
            position: 'insideLeft',
            offset: 0,
            style: { 
              fontSize: '12px',
              fill: '#64748b',
              fontFamily: '"Inter", system-ui, sans-serif'
            }
          }}
          style={{
            fontSize: '10px',
            fontFamily: '"Inter", system-ui, sans-serif'
          }}
        />
        
        <Tooltip
          formatter={(value: number, name: string) => {
            const formattedValue = Number(value).toFixed(1);
            if (name === 'value') {
              const status = getWaterStatus(value);
              return [`${formattedValue} cm (${status.label})`, 'Ketinggian Air'];
            }
            if (name === 'sma') return [`${formattedValue} cm`, 'Rata-rata 5 Menit'];
            return [value, name];
          }}
          labelFormatter={(label) => `Pukul ${label}`}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
          cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
        />

        {/* Area di bawah garis dengan gradient sesuai status */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={waterLevels.waspada.color} stopOpacity={0.1}/>
            <stop offset="100%" stopColor={waterLevels.normal.color} stopOpacity={0.1}/>
          </linearGradient>
        </defs>

        <Area
          type="monotone"
          dataKey="value"
          stroke="none"
          fill="url(#areaGradient)"
          isAnimationActive={false}
        />

        {/* Garis utama (ketinggian air) dengan style putus-putus */}
        <Line
          type="monotone"
          dataKey="value"
          name="value"
          stroke="#94a3b8"
          strokeWidth={1.5}
          strokeDasharray="5 5"
          dot={false}
          isAnimationActive={false}
          connectNulls
        />

        {/* Garis rata-rata bergerak dengan style solid dan tebal */}
        <Line
          type="monotone"
          dataKey="sma"
          name="sma"
          stroke={waterLevels.normal.color}
          strokeWidth={2.5}
          dot={(props) => {
            if (!props?.payload?.value) return null;
            // Tetap menggunakan value (bukan sma) untuk menentukan status
            const status = getWaterStatus(props.payload.value);
            return (
              <circle
                cx={props.cx}
                cy={props.cy}
                r={3}
                fill={status.color}
                stroke="white"
                strokeWidth={1}
              />
            );
          }}
          activeDot={(props) => {
            if (!props?.payload?.value) return null;
            // Tetap menggunakan value (bukan sma) untuk menentukan status
            const status = getWaterStatus(props.payload.value);
            return (
              <circle
                cx={props.cx}
                cy={props.cy}
                r={5}
                fill="white"
                stroke={status.color}
                strokeWidth={2}
              />
            );
          }}
          isAnimationActive={false}
        />

        {/* Status terakhir ditampilkan melalui titik data aktif */}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ZoomableWaterLevelChart;
