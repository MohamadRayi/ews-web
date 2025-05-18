import { supabase } from '../lib/supabase';

const insertSampleData = async () => {
  try {
    // Insert a sample sensor
    const { data: sensor, error: sensorError } = await supabase
      .from('sensors')
      .insert({
        name: 'Ultrasonic Water Level Sensor',
        location: 'Sukapura',
        sensor_type: 'ultrasonic',
        installation_date: new Date().toISOString(),
        network_status: true,
        battery_level: 85
      })
      .select()
      .single();

    if (sensorError) throw sensorError;
    console.log('Created sensor:', sensor);

    // Insert sample water readings
    const now = new Date();
    const readings = Array.from({ length: 24 }).map((_, i) => {
      const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const waterLevel = 250 + Math.sin(i * Math.PI / 12) * 20; // Simulated sine wave pattern
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
      .insert(readings);

    if (readingsError) throw readingsError;
    console.log('Inserted', readings.length, 'water level readings');

    // Insert sample alert
    const { error: alertError } = await supabase
      .from('alert_history')
      .insert({
        sensor_id: sensor.id,
        status: 'warning',
        water_level: 35,
        message: 'Water level approaching warning threshold'
      });

    if (alertError) throw alertError;
    console.log('Inserted sample alert');

  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
};

insertSampleData();
