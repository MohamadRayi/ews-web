import { supabase } from './supabase';
import type { Database } from './database.types';

type Sensor = Database['public']['Tables']['sensors']['Row'];
type WaterLevelReading = Database['public']['Tables']['water_level_readings']['Row'];
type SensorStatus = Database['public']['Views']['current_sensor_status']['Row'];

interface StatusCount {
  status: 'normal' | 'warning' | 'siaga' | 'danger';
  count: number;
}

interface LocationStats {
  name: string;
  normalHours: number;
  warningHours: number;
  siagaHours: number;
  dangerHours: number;
}

export const sensorService = {
  // Get all sensors with their current status
  async getAllSensors(): Promise<SensorStatus[]> {
    const { data, error } = await supabase
      .from('current_sensor_status')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Get single sensor details
  async getSensor(id: string): Promise<Sensor> {
    const { data, error } = await supabase
      .from('sensors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get sensor readings history
  async getSensorReadings(
    sensorId: string,
    startTime: Date,
    endTime: Date
  ): Promise<WaterLevelReading[]> {
    const { data, error } = await supabase
      .from('water_level_readings')
      .select('*')
      .eq('sensor_id', sensorId)
      .gte('reading_time', startTime.toISOString())
      .lte('reading_time', endTime.toISOString())
      .order('reading_time', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  // Get sensor alerts
  async getSensorAlerts(sensorId: string): Promise<Database['public']['Tables']['alert_history']['Row'][]> {
    const { data, error } = await supabase
      .from('alert_history')
      .select('*')
      .eq('sensor_id', sensorId)
      .order('sent_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get historical readings for multiple sensors
  async getHistoricalReadings(
    sensorIds: string[],
    startTime: Date,
    endTime: Date,
    interval: 'hour' | 'minute' = 'hour'
  ): Promise<WaterLevelReading[]> {
    const { data, error } = await supabase
      .from('water_level_readings')
      .select('*')
      .in('sensor_id', sensorIds)
      .gte('reading_time', startTime.toISOString())
      .lte('reading_time', endTime.toISOString())
      .order('reading_time', { ascending: true });
    
    if (error) throw error;

    // If hourly interval is requested, aggregate the data
    if (interval === 'hour') {
      type AggregatedReading = WaterLevelReading & { readings: number };
      const hourlyData = data.reduce((acc: { [key: string]: AggregatedReading }, reading) => {
        const hour = new Date(reading.reading_time).setMinutes(0, 0, 0);
        const key = `${reading.sensor_id}_${hour}`;
        
        if (!acc[key]) {
          acc[key] = {
            ...reading,
            reading_time: new Date(hour).toISOString(),
            water_level: reading.water_level,
            readings: 1
          };
        } else {
          // Calculate new average
          acc[key].water_level = (acc[key].water_level * acc[key].readings + reading.water_level) / (acc[key].readings + 1);
          acc[key].readings++;
        }
        return acc;
      }, {});

      return Object.values(hourlyData);
    }

    return data;
  },

  // Get active sensors
  async getActiveSensors(): Promise<Sensor[]> {
    const { data, error } = await supabase
      .from('sensors')
      .select('*')
      .eq('network_status', true)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  // Get daily statistics
  async getDailyStatistics(date: Date): Promise<WaterLevelReading[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('water_level_readings')
      .select('*')
      .gte('reading_time', startOfDay.toISOString())
      .lte('reading_time', endOfDay.toISOString())
      .order('reading_time', { ascending: true });

    if (error) throw error;
    return data;
  },
  // Get status distribution
  async getStatusDistribution(startDate: Date, endDate: Date): Promise<StatusCount[]> {
    const { data, error } = await supabase
      .from('water_level_readings')
      .select('status')
      .gte('reading_time', startDate.toISOString())
      .lte('reading_time', endDate.toISOString());

    if (error) throw error;

    // Process data to get status distribution
    const distribution = data.reduce((acc: { [key: string]: number }, reading) => {
      acc[reading.status] = (acc[reading.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution).map(([status, count]) => ({
      status: status as 'normal' | 'warning' | 'siaga' | 'danger',
      count: count as number
    }));
  },

  // Get location statistics
  async getLocationStatistics(startDate: Date, endDate: Date): Promise<LocationStats[]> {
    const { data: readings, error: readingsError } = await supabase
      .from('water_level_readings')
      .select('*, sensors(location)')
      .gte('reading_time', startDate.toISOString())
      .lte('reading_time', endDate.toISOString());

    if (readingsError) throw readingsError;

    // Process data to get statistics by location
    const locationStats = readings.reduce((acc: { [key: string]: LocationStats }, reading: any) => {
      const location = reading.sensors?.location;
      if (!location) return acc;

      if (!acc[location]) {
        acc[location] = {
          name: location,
          normalHours: 0,
          warningHours: 0,
          siagaHours: 0,
          dangerHours: 0
        };
      }

      switch (reading.status) {
        case 'normal':
          acc[location].normalHours++;
          break;
        case 'warning':
          acc[location].warningHours++;
          break;
        case 'siaga':
          acc[location].siagaHours++;
          break;
        case 'danger':
          acc[location].dangerHours++;
          break;
      }

      return acc;
    }, {});

    return Object.values(locationStats);
  },

  // Get filtered history data
  async getFilteredHistory(
    date?: Date,
    location?: string,
    status?: string
  ): Promise<(WaterLevelReading & { sensors: Pick<Sensor, 'location' | 'name'> })[]> {
    let query = supabase
      .from('water_level_readings')
      .select('*, sensors!inner(location, name)')
      .order('reading_time', { ascending: false })
      .limit(100); // Limit to last 100 readings for performance

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query
        .gte('reading_time', startOfDay.toISOString())
        .lte('reading_time', endOfDay.toISOString());
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (location) {
      query = query.ilike('sensors.location', `%${location}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get water level statistics for a specific sensor
  async getWaterLevelStatistics(
    sensorId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WaterLevelReading[]> {
    const { data, error } = await supabase
      .from('water_level_readings')
      .select('*')
      .eq('sensor_id', sensorId)
      .gte('reading_time', startDate.toISOString())
      .lte('reading_time', endDate.toISOString())
      .order('reading_time', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get daily average water levels
  async getDailyAverages(
    sensorId: string,
    date: Date
  ): Promise<{ time: string; level: number }[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('water_level_readings')
      .select('reading_time, water_level')
      .eq('sensor_id', sensorId)
      .gte('reading_time', startOfDay.toISOString())
      .lte('reading_time', endOfDay.toISOString())
      .order('reading_time', { ascending: true });

    if (error) throw error;

    // Group and average by hour
    const hourlyAverages = data.reduce((acc: { [key: string]: number[] }, reading) => {
      const hour = new Date(reading.reading_time).getHours();
      const timeKey = `${hour.toString().padStart(2, '0')}:00`;
      if (!acc[timeKey]) {
        acc[timeKey] = [];
      }
      acc[timeKey].push(reading.water_level);
      return acc;
    }, {});

    // Calculate averages
    return Object.entries(hourlyAverages).map(([time, levels]) => ({
      time,
      level: Math.round((levels.reduce((a, b) => a + b, 0) / levels.length) * 10) / 10
    })).sort((a, b) => a.time.localeCompare(b.time));
  },
};
