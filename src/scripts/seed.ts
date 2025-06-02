import { createClient } from '@supabase/supabase-js';
import { toUTCDate } from '../lib/utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
  try {
    console.log('Starting database seeding...');

    // Insert a sensor
    const { data: sensor, error: sensorError } = await supabase
      .from('sensors')
      .upsert({
        name: 'Sensor Sukapura',
        location: 'Sukapura',
        sensor_type: 'ultrasonic',
        installation_date: new Date().toISOString().split('T')[0],
        network_status: true,
        battery_level: 85
      })
      .select()
      .single();

    if (sensorError) throw sensorError;
    console.log('Created sensor:', sensor);

    // Generate readings for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const readings = Array.from({ length: 24 }).map((_, i) => {
      const localTime = new Date(today.getTime() + i * 60 * 60 * 1000);
      const utcTime = toUTCDate(localTime);
      const waterLevel = 30 + Math.sin(i * Math.PI / 12) * 20;
      const status = waterLevel >= 70 ? 'danger' 
        : waterLevel >= 50 ? 'siaga'
        : waterLevel >= 30 ? 'warning'
        : 'normal';

      return {
        sensor_id: sensor.id,
        water_level: waterLevel,
        status,
        reading_time: utcTime.toISOString()
      };
    });

    const { error: readingsError } = await supabase
      .from('water_level_readings')
      .upsert(readings);

    if (readingsError) throw readingsError;
    console.log('Inserted readings:', readings.length);

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedData();
