import { supabase } from '../lib/supabase';

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // First, insert a sensor
    const { data: sensor, error: sensorError } = await supabase
      .from('sensors')
      .upsert({
        name: 'Ultrasonic Water Level Sensor',
        location: 'Sukapura',
        sensor_type: 'ultrasonic',
        installation_date: new Date().toISOString().split('T')[0],
        network_status: true,
        battery_level: 85
      }, { onConflict: 'name' })
      .select()
      .single();

    if (sensorError) {
      throw sensorError;
    }

    console.log('Created/Updated sensor:', sensor);

    // Generate 24 hours of sample readings
    const now = new Date();
    const readings = Array.from({ length: 24 }).map((_, i) => {
      const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const waterLevel = 30 + Math.sin(i * Math.PI / 12) * 20; // Simulated sine wave pattern
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

    // Insert readings
    const { error: readingsError } = await supabase
      .from('water_level_readings')
      .upsert(readings);

    if (readingsError) {
      throw readingsError;
    }

    console.log('Inserted water readings:', readings.length);

    // Create a sample alert
    const { error: alertError } = await supabase
      .from('alert_history')
      .upsert({
        sensor_id: sensor.id,
        status: 'warning',
        water_level: 35,
        message: 'Water level approaching warning threshold',
        sent_at: new Date().toISOString()
      });

    if (alertError) {
      throw alertError;
    }

    console.log('Database seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();
