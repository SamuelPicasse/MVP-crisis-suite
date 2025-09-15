-- Create responsibility_cards table
CREATE TABLE responsibility_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL UNIQUE,
    duties TEXT[] NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE responsibility_cards ENABLE ROW LEVEL SECURITY;

-- Create policy for read access (authenticated users can read all)
CREATE POLICY "Users can read all responsibility cards" ON responsibility_cards
    FOR SELECT USING (auth.role() = 'authenticated');

-- Insert seed data for CMT roles
INSERT INTO responsibility_cards (role, duties, description) VALUES
(
    'Crisis Manager',
    ARRAY[
        'Overall incident command and control',
        'Coordinate response activities across all teams',
        'Make strategic decisions and resource allocations',
        'Communicate with senior leadership and external agencies',
        'Authorize major operational changes',
        'Monitor overall response effectiveness'
    ],
    'Primary leadership role responsible for overall crisis management strategy and coordination.'
),
(
    'Operations Lead',
    ARRAY[
        'Manage operational response activities',
        'Coordinate with field teams and first responders',
        'Implement tactical decisions made by Crisis Manager',
        'Monitor safety protocols and procedures',
        'Report operational status to Crisis Manager',
        'Manage resource deployment and logistics'
    ],
    'Responsible for executing tactical operations and coordinating field response activities.'
),
(
    'Communications Lead',
    ARRAY[
        'Develop and manage all crisis communications',
        'Coordinate with media and public relations',
        'Manage internal communications to stakeholders',
        'Monitor social media and public sentiment',
        'Prepare press releases and public statements',
        'Maintain crisis communication timeline'
    ],
    'Manages all internal and external communications during the crisis.'
),
(
    'Safety Officer',
    ARRAY[
        'Monitor and ensure responder safety',
        'Assess hazards and safety conditions',
        'Recommend safety measures and protocols',
        'Coordinate with health and safety teams',
        'Investigate safety incidents during response',
        'Maintain safety documentation and reports'
    ],
    'Responsible for ensuring the safety of all response personnel and operations.'
),
(
    'Information Manager',
    ARRAY[
        'Collect, analyze, and distribute critical information',
        'Maintain situational awareness documentation',
        'Coordinate intelligence gathering activities',
        'Prepare situation reports and briefings',
        'Manage information sharing with partner agencies',
        'Monitor and report on incident progress'
    ],
    'Manages information flow and maintains comprehensive situational awareness.'
),
(
    'Planning Lead',
    ARRAY[
        'Develop and maintain incident action plans',
        'Forecast future operational requirements',
        'Coordinate planning activities across teams',
        'Track resource status and availability',
        'Plan for demobilization and recovery',
        'Maintain planning documentation'
    ],
    'Responsible for strategic planning and resource management throughout the incident.'
);

-- Create RPC function to get all responsibility cards
CREATE OR REPLACE FUNCTION get_responsibility_cards()
RETURNS TABLE (
    id UUID,
    role TEXT,
    duties TEXT[],
    description TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        responsibility_cards.id,
        responsibility_cards.role,
        responsibility_cards.duties,
        responsibility_cards.description,
        responsibility_cards.created_at
    FROM responsibility_cards
    ORDER BY responsibility_cards.role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_responsibility_cards() TO authenticated;