-- Create Enums
CREATE TYPE sensor_status AS ENUM ('normal', 'warning', 'siaga', 'danger');

-- Base Tables
CREATE TABLE sensors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    gps_location POINT,
    installation_date DATE NOT NULL,
    sensor_type VARCHAR(100) NOT NULL,
    last_calibration DATE,
    battery_level INTEGER CHECK (battery_level BETWEEN 0 AND 100),
    network_status BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE water_level_readings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
    water_level DECIMAL(6,2) NOT NULL,
    status sensor_status NOT NULL,
    reading_time TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE telegram_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(100),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE alert_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
    status sensor_status NOT NULL,
    water_level DECIMAL(6,2) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE maintenance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100) NOT NULL,
    description TEXT,
    performed_by VARCHAR(100),
    maintenance_date TIMESTAMPTZ DEFAULT NOW(),
    next_maintenance_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create current_sensor_status as a regular table
CREATE TABLE current_sensor_status (
    id UUID PRIMARY KEY REFERENCES sensors(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    battery_level INTEGER CHECK (battery_level BETWEEN 0 AND 100),
    water_level DECIMAL(6,2),
    status sensor_status,
    reading_time TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create view for current sensor status
CREATE OR REPLACE VIEW current_sensor_status AS
SELECT 
    s.id,
    s.name,
    s.location,
    s.network_status,
    s.updated_at,
    COALESCE(wr.water_level, 0) as water_level,
    COALESCE(wr.status, 'normal'::sensor_status) as status,
    COALESCE(wr.reading_time, NOW()) as reading_time
FROM sensors s
LEFT JOIN LATERAL (
    SELECT water_level, status, reading_time 
    FROM water_level_readings 
    WHERE sensor_id = s.id 
    ORDER BY reading_time DESC 
    LIMIT 1
) wr ON true;

-- Indexes
CREATE INDEX idx_water_level_readings_sensor_time ON water_level_readings(sensor_id, reading_time);
CREATE INDEX idx_water_level_readings_status ON water_level_readings(status);
CREATE INDEX idx_alert_history_sensor ON alert_history(sensor_id);
CREATE INDEX idx_maintenance_logs_sensor ON maintenance_logs(sensor_id);
CREATE INDEX idx_current_sensor_status_status ON current_sensor_status(status);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sensors_updated_at
    BEFORE UPDATE ON sensors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_current_sensor_status_updated_at
    BEFORE UPDATE ON current_sensor_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Helper function to update current_sensor_status
CREATE OR REPLACE FUNCTION update_current_sensor_status()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO current_sensor_status (
        id, name, location, battery_level, water_level, status, reading_time
    )
    VALUES (
        NEW.sensor_id,
        (SELECT name FROM sensors WHERE id = NEW.sensor_id),
        (SELECT location FROM sensors WHERE id = NEW.sensor_id),
        (SELECT battery_level FROM sensors WHERE id = NEW.sensor_id),
        NEW.water_level,
        NEW.status,
        NEW.reading_time
    )
    ON CONFLICT (id) DO UPDATE SET
        water_level = EXCLUDED.water_level,
        status = EXCLUDED.status,
        reading_time = EXCLUDED.reading_time,
        battery_level = EXCLUDED.battery_level;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update current_sensor_status when new readings come in
CREATE TRIGGER update_current_status_on_reading
    AFTER INSERT OR UPDATE ON water_level_readings
    FOR EACH ROW
    EXECUTE FUNCTION update_current_sensor_status();
