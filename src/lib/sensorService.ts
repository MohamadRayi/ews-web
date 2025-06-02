import { supabase } from './supabase';
import type { Database } from './database.types';
import { PostgrestError } from '@supabase/supabase-js';

type Tables = Database['public']['Tables'];
type SensorStatus = Tables['current_sensor_status']['Row'];
type WaterReading = Tables['water_level_readings']['Row'] & {
  sensors: Tables['sensors']['Row'] | null;
};
type Sensor = Tables['sensors']['Row'];

class ApiError extends Error {
  constructor(public error: PostgrestError | Error, public status: number = 500) {
    super(error.message);
    this.name = 'ApiError';
  }
}

export const sensorService = {
  async checkTables() {
    console.log('Checking water_level_readings table...');
    const { count: readingsCount, error: readingsError } = await supabase
      .from('water_level_readings')
      .select('*', { count: 'exact', head: true });

    if (readingsError) {
      console.error('Error checking water_level_readings:', readingsError);
    } else {
      console.log('Total water readings:', readingsCount);
    }

    console.log('Checking current_sensor_status table...');
    const { count: sensorsCount, error: sensorsError } = await supabase
      .from('current_sensor_status')
      .select('*', { count: 'exact', head: true });

    if (sensorsError) {
      console.error('Error checking current_sensor_status:', sensorsError);
    } else {
      console.log('Total sensors:', sensorsCount);
    }

    // Get the latest reading
    console.log('Checking latest water reading...');
    const { data: latestReading, error: latestError } = await supabase
      .from('water_level_readings')
      .select('*')
      .order('reading_time', { ascending: false })
      .limit(1)
      .single();

    if (latestError) {
      console.error('Error checking latest reading:', latestError);
    } else {
      console.log('Latest reading:', latestReading);
    }
  },

  async getAllSensors(): Promise<SensorStatus[]> {
    console.log('Fetching all sensors...');
    const { data, error } = await supabase
      .from('current_sensor_status')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching sensors:', error);
      throw error;
    }
    console.log('Fetched sensors:', data);
    return data;
  },

  async getSensorById(id: string): Promise<SensorStatus | null> {
    const { data, error } = await supabase
      .from('current_sensor_status')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getSensorReadings(
    sensorId: string,
    startTime: Date,
    endTime: Date
  ): Promise<WaterReading[]> {
    console.log('[getSensorReadings] Starting...', {
      sensorId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    });
    
    try {
      // First check if the sensor exists
      const { data: sensor, error: sensorError } = await supabase
        .from('current_sensor_status')
        .select('*')
        .eq('id', sensorId)
        .single();

      if (sensorError) {
        console.error('[getSensorReadings] Error checking sensor:', sensorError);
        throw sensorError;
      }

      if (!sensor) {
        console.error('[getSensorReadings] Sensor not found:', sensorId);
        return [];
      }

      console.log('[getSensorReadings] Found sensor:', sensor);

      // Get readings for the sensor (tanpa filter waktu)
      const { data, error } = await supabase
        .from('water_level_readings')
        .select('*, sensors(*)')
        .eq('sensor_id', sensorId)
        .order('reading_time', { ascending: true });

      if (error) {
        console.error('[getSensorReadings] Error fetching readings:', error);
        throw error;
      }

      console.log('[getSensorReadings] Success', {
        readingsCount: data?.length || 0,
        firstReading: data?.[0],
        lastReading: data?.[data.length - 1]
      });

      return data || [];
    } catch (err) {
      console.error('[getSensorReadings] Unexpected error:', err);
      throw err;
    }
  },

  async getReadingsByDateRange(
    startTime: Date,
    endTime: Date,
    location: string = 'all',
    status: string = 'all'
  ): Promise<WaterReading[]> {
    let query = supabase
      .from('water_level_readings')
      .select('*, sensors(*)')
      .gte('reading_time', startTime.toISOString())
      .lte('reading_time', endTime.toISOString());

    if (location !== 'all') {
      query = query.eq('sensors.location', location);
    }

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('reading_time', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getLocations(): Promise<string[]> {
    const { data, error } = await supabase
      .from('sensors')
      .select('location')
      .eq('network_status', true);

    if (error) throw error;
    return [...new Set(data.map(item => item.location))].sort();
  },

  async getSensorDetails(id: string): Promise<Sensor | null> {
    const { data, error } = await supabase
      .from('sensors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
};
