-- Create crises table
CREATE TABLE IF NOT EXISTS crises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Monitoring', 'Closed')),
    start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crisis_id UUID REFERENCES crises(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_activities_crisis_id ON activities(crisis_id);
CREATE INDEX idx_activities_timestamp ON activities(timestamp DESC);
CREATE INDEX idx_crises_status ON crises(status);

-- Enable Row Level Security
ALTER TABLE crises ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for crises table
CREATE POLICY "Users can view all crises" ON crises
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert crises" ON crises
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update crises" ON crises
    FOR UPDATE
    USING (true);

-- Create RLS policies for activities table
CREATE POLICY "Users can view all activities" ON activities
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert activities" ON activities
    FOR INSERT
    WITH CHECK (true);

-- Create function to get current crisis with duration
CREATE OR REPLACE FUNCTION get_current_crisis()
RETURNS TABLE (
    id UUID,
    name TEXT,
    status TEXT,
    start_time TIMESTAMPTZ,
    duration INTERVAL
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.status,
        c.start_time,
        (now() - c.start_time) as duration
    FROM crises c
    WHERE c.status IN ('Active', 'Monitoring')
    ORDER BY c.start_time DESC
    LIMIT 1;
END;
$$;

-- Create function to get activity log entries
CREATE OR REPLACE FUNCTION get_activity_log(
    p_crisis_id UUID DEFAULT NULL,
    p_limit INT DEFAULT 50,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    crisis_id UUID,
    "timestamp" TIMESTAMPTZ,
    description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.crisis_id,
        a.timestamp,
        a.description
    FROM activities a
    WHERE (p_crisis_id IS NULL OR a.crisis_id = p_crisis_id)
    ORDER BY a.timestamp DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Insert seed data for testing
INSERT INTO crises (name, status, start_time) 
VALUES ('System Outage - Production', 'Active', now() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;

-- Get the crisis ID for seed activities
DO $$
DECLARE
    v_crisis_id UUID;
BEGIN
    SELECT id INTO v_crisis_id FROM crises WHERE name = 'System Outage - Production' LIMIT 1;
    
    IF v_crisis_id IS NOT NULL THEN
        INSERT INTO activities (crisis_id, timestamp, description) VALUES
            (v_crisis_id, now() - INTERVAL '2 hours', 'Crisis initiated: System Outage detected in production environment'),
            (v_crisis_id, now() - INTERVAL '1 hour 45 minutes', 'Incident Commander assigned: John Smith'),
            (v_crisis_id, now() - INTERVAL '1 hour 30 minutes', 'Initial assessment complete: Database connection issues identified'),
            (v_crisis_id, now() - INTERVAL '1 hour', 'Engineering team deployed fix to staging environment'),
            (v_crisis_id, now() - INTERVAL '30 minutes', 'Partial service restoration achieved'),
            (v_crisis_id, now() - INTERVAL '15 minutes', 'Monitoring ongoing system stability')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
