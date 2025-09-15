-- Create documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'Reference',
    content TEXT,
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy for read access (authenticated users can read all)
CREATE POLICY "Users can read all documents" ON documents
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create trigger to update updated_at on changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert seed data for crisis management documents
INSERT INTO documents (title, description, type, content) VALUES
(
    'Crisis Response Plan',
    'Comprehensive plan outlining response procedures for various crisis scenarios.',
    'CrisisPlan',
    'This document contains the master crisis response plan including escalation procedures, contact information, and response protocols for different types of emergencies.'
),
(
    'Emergency Contact Directory',
    'Directory of all key contacts for crisis response including internal teams and external agencies.',
    'Reference',
    'Complete contact directory including: Crisis Management Team members, Department heads, External agencies (Fire, Police, EMS), Vendor contacts, Media contacts, and Executive leadership.'
),
(
    'Evacuation Procedures',
    'Detailed evacuation procedures for different building areas and emergency scenarios.',
    'Procedure',
    'Step-by-step evacuation procedures including: Primary and secondary evacuation routes, Assembly points, Special procedures for disabled persons, Floor warden responsibilities, and Post-evacuation accountability.'
),
(
    'Communication Templates',
    'Pre-approved templates for various crisis communications.',
    'Reference',
    'Templates include: Initial incident notification, Employee alerts, Media statements, Customer notifications, Vendor communications, and Recovery status updates.'
),
(
    'Resource Inventory',
    'Inventory of available resources and equipment for crisis response.',
    'Reference',
    'Complete inventory including: Emergency supplies locations, Equipment availability, Personnel resources, Backup facility information, and Vendor resource contacts.'
),
(
    'Business Continuity Plan',
    'Plan for maintaining critical business operations during and after a crisis.',
    'CrisisPlan',
    'Business continuity procedures including: Critical system backup procedures, Alternative work arrangements, Supply chain contingencies, Customer service continuity, and Recovery prioritization.'
),
(
    'Incident Command System Guide',
    'Guide to implementing Incident Command System structure during crisis response.',
    'Procedure',
    'ICS implementation guide covering: Command structure setup, Role assignments, Communication protocols, Resource management, and Documentation requirements.'
),
(
    'Post-Incident Review Process',
    'Process for conducting after-action reviews and capturing lessons learned.',
    'Procedure',
    'After-action review process including: Timeline reconstruction, Response evaluation criteria, Stakeholder interview process, Improvement recommendation development, and Plan update procedures.'
);

-- Create RPC function to get all documents
CREATE OR REPLACE FUNCTION get_documents()
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    type TEXT,
    content TEXT,
    file_url TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        documents.id,
        documents.title,
        documents.description,
        documents.type,
        documents.content,
        documents.file_url,
        documents.created_at,
        documents.updated_at
    FROM documents
    ORDER BY documents.type, documents.title;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_documents() TO authenticated;