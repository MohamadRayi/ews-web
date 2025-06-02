import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

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

    if (sensorError) {
      console.error('Error creating sensor:', sensorError);
      throw sensorError;
    }
    console.log('Created sensor:', sensor);

    // Generate readings for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const readings = Array.from({ length: 24 }).map((_, i) => {
      const time = new Date(today.getTime() + i * 60 * 60 * 1000);
      const waterLevel = 30 + Math.sin(i * Math.PI / 12) * 20;
      const status = waterLevel >= 70 ? 'danger' 
        : waterLevel >= 50 ? 'siaga'
        : waterLevel >= 30 ? 'warning'
        : 'normal';

      return {
        sensor_id: sensor.id,
        water_level: waterLevel,
        status,
        reading_time: time.toISOString()
      };
    });

    const { error: readingsError } = await supabase
      .from('water_level_readings')
      .upsert(readings);

    if (readingsError) {
      console.error('Error inserting readings:', readingsError);
      throw readingsError;
    }
    console.log('Inserted readings:', readings.length);

    // Insert a sample alert
    const { error: alertError } = await supabase
      .from('alert_history')
      .insert({
        sensor_id: sensor.id,
        status: 'warning',
        water_level: 35,
        message: 'Water level approaching warning threshold',
        sent_at: new Date().toISOString()
      });

    if (alertError) {
      console.error('Error creating alert:', alertError);
      throw alertError;
    }
    console.log('Created sample alert');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedData();
