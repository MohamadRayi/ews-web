-- Insert a sample sensor if it doesn't exist
INSERT INTO sensors (id, name, location, sensor_type, installation_date, network_status, battery_level)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Sensor Sukapura',
  'Sukapura',
  'ultrasonic',
  CURRENT_DATE,
  true,
  85
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  sensor_type = EXCLUDED.sensor_type,
  installation_date = EXCLUDED.installation_date,
  network_status = EXCLUDED.network_status,
  battery_level = EXCLUDED.battery_level;

-- Insert sample readings for today using UTC timestamps
WITH hours AS (
  SELECT generate_series(
    date_trunc('day', CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
    date_trunc('day', CURRENT_TIMESTAMP AT TIME ZONE 'UTC') + interval '23 hours',
    interval '1 hour'
  ) AS reading_time
)
INSERT INTO water_level_readings (sensor_id, water_level, status, reading_time)
SELECT 
  '123e4567-e89b-12d3-a456-426614174000' as sensor_id,
  30 + 20 * sin(extract(hour from reading_time)::float * pi() / 12) as water_level,
  CASE 
    WHEN 30 + 20 * sin(extract(hour from reading_time)::float * pi() / 12) >= 70 THEN 'danger'::sensor_status
    WHEN 30 + 20 * sin(extract(hour from reading_time)::float * pi() / 12) >= 50 THEN 'siaga'::sensor_status
    WHEN 30 + 20 * sin(extract(hour from reading_time)::float * pi() / 12) >= 30 THEN 'warning'::sensor_status
    ELSE 'normal'::sensor_status
  END as status,
  reading_time AT TIME ZONE 'UTC'
FROM hours
ON CONFLICT (sensor_id, reading_time) DO UPDATE SET
  water_level = EXCLUDED.water_level,
  status = EXCLUDED.status;

-- Insert a sample alert with UTC timestamp
INSERT INTO alert_history (sensor_id, status, water_level, message, sent_at)
SELECT 
  '123e4567-e89b-12d3-a456-426614174000',
  'warning'::sensor_status,
  35,
  'Water level approaching warning threshold',
  CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
ON CONFLICT DO NOTHING;

-- Get the sensor ID
DO $$ 
DECLARE
    sensor_id UUID;
BEGIN
    SELECT id INTO sensor_id FROM sensors WHERE name = 'Sensor Sukapura' LIMIT 1;

    -- Insert a sample alert
    INSERT INTO alert_history (sensor_id, status, water_level, message, sent_at)
    VALUES (sensor_id, 'warning', 35, 'Water level approaching warning threshold', now());

    -- Update current sensor status
    INSERT INTO current_sensor_status (id, name, location, battery_level, water_level, status, reading_time)
    SELECT 
        s.id,
        s.name,
        s.location,
        s.battery_level,
        w.water_level,
        w.status,
        w.reading_time
    FROM sensors s
    LEFT JOIN LATERAL (
        SELECT water_level, status, reading_time
        FROM water_level_readings
        WHERE sensor_id = s.id
        ORDER BY reading_time DESC
        LIMIT 1
    ) w ON true
    WHERE s.name = 'Sensor Sukapura'
    ON CONFLICT (id) DO UPDATE SET
        water_level = EXCLUDED.water_level,
        status = EXCLUDED.status,
        reading_time = EXCLUDED.reading_time,
        battery_level = EXCLUDED.battery_level;
END $$;
