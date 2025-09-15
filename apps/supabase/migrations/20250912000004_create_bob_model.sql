-- Create BOB (Books of Business) model tables for crisis decision-making
-- This implements the three-column BOB model: Situation Assessment, Judgments, Decisions

-- Create bob_entries table for storing all BOB model entries
CREATE TABLE IF NOT EXISTS public.bob_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crisis_id UUID REFERENCES public.crises(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('assessment', 'judgment', 'decision')),
    content TEXT NOT NULL CHECK (length(content) >= 3 AND length(content) <= 500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bob_entries_crisis_id ON public.bob_entries(crisis_id);
CREATE INDEX IF NOT EXISTS idx_bob_entries_user_id ON public.bob_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_bob_entries_type ON public.bob_entries(type);
CREATE INDEX IF NOT EXISTS idx_bob_entries_created_at ON public.bob_entries(created_at DESC);

-- Create bob_links table for storing relationships between entries
CREATE TABLE IF NOT EXISTS public.bob_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_entry_id UUID NOT NULL REFERENCES public.bob_entries(id) ON DELETE CASCADE,
    to_entry_id UUID NOT NULL REFERENCES public.bob_entries(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(from_entry_id, to_entry_id)
);

-- Create indexes for bob_links
CREATE INDEX IF NOT EXISTS idx_bob_links_from_entry ON public.bob_links(from_entry_id);
CREATE INDEX IF NOT EXISTS idx_bob_links_to_entry ON public.bob_links(to_entry_id);

-- Enable Row Level Security (RLS) for bob_entries
ALTER TABLE public.bob_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bob_entries
-- Users can view BOB entries for crises they have access to
CREATE POLICY "Users can view BOB entries" 
    ON public.bob_entries 
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- Users can insert BOB entries
CREATE POLICY "Users can create BOB entries" 
    ON public.bob_entries 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own BOB entries
CREATE POLICY "Users can update own BOB entries" 
    ON public.bob_entries 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Users can delete their own BOB entries
CREATE POLICY "Users can delete own BOB entries" 
    ON public.bob_entries 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Enable Row Level Security (RLS) for bob_links
ALTER TABLE public.bob_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bob_links
-- Users can view links for entries they can see
CREATE POLICY "Users can view BOB links" 
    ON public.bob_links 
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- Users can create links
CREATE POLICY "Users can create BOB links" 
    ON public.bob_links 
    FOR INSERT 
    WITH CHECK (auth.uid() = created_by);

-- Users can delete links they created
CREATE POLICY "Users can delete own BOB links" 
    ON public.bob_links 
    FOR DELETE 
    USING (auth.uid() = created_by);

-- Add updated_at trigger to bob_entries
CREATE TRIGGER update_bob_entries_updated_at
    BEFORE UPDATE ON public.bob_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get BOB entries with their links
CREATE OR REPLACE FUNCTION public.get_bob_entries(p_crisis_id UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    crisis_id UUID,
    user_id UUID,
    type TEXT,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    linked_to UUID[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        be.id,
        be.crisis_id,
        be.user_id,
        be.type,
        be.content,
        be.created_at,
        be.updated_at,
        COALESCE(
            ARRAY(
                SELECT bl.to_entry_id 
                FROM public.bob_links bl 
                WHERE bl.from_entry_id = be.id
            ), 
            ARRAY[]::UUID[]
        ) as linked_to
    FROM public.bob_entries be
    WHERE (p_crisis_id IS NULL OR be.crisis_id = p_crisis_id)
    ORDER BY be.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create a BOB entry with links
CREATE OR REPLACE FUNCTION public.create_bob_entry_with_links(
    p_crisis_id UUID,
    p_type TEXT,
    p_content TEXT,
    p_linked_to UUID[] DEFAULT ARRAY[]::UUID[]
)
RETURNS UUID AS $$
DECLARE
    v_entry_id UUID;
    v_target_id UUID;
BEGIN
    -- Insert the main entry
    INSERT INTO public.bob_entries (crisis_id, user_id, type, content)
    VALUES (p_crisis_id, auth.uid(), p_type, p_content)
    RETURNING id INTO v_entry_id;
    
    -- Create links if provided
    IF array_length(p_linked_to, 1) > 0 THEN
        FOREACH v_target_id IN ARRAY p_linked_to
        LOOP
            INSERT INTO public.bob_links (from_entry_id, to_entry_id, created_by)
            VALUES (v_entry_id, v_target_id, auth.uid())
            ON CONFLICT (from_entry_id, to_entry_id) DO NOTHING;
        END LOOP;
    END IF;
    
    RETURN v_entry_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log BOB entry activity
CREATE OR REPLACE FUNCTION log_bob_entry_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_user_name TEXT;
    v_crisis_id UUID;
    v_activity_description TEXT;
BEGIN
    -- Get user name from auth metadata (simplified for this example)
    SELECT COALESCE(auth.jwt() ->> 'email', 'Unknown User') INTO v_user_name;
    
    -- Use the crisis_id from the BOB entry, or get current crisis if null
    v_crisis_id := NEW.crisis_id;
    IF v_crisis_id IS NULL THEN
        SELECT id INTO v_crisis_id FROM crises WHERE status IN ('Active', 'Monitoring') ORDER BY start_time DESC LIMIT 1;
    END IF;
    
    -- Create activity description based on entry type
    v_activity_description := 
        CASE NEW.type
            WHEN 'assessment' THEN 'BOB: Situation Assessment added - "' || LEFT(NEW.content, 50) || CASE WHEN LENGTH(NEW.content) > 50 THEN '..."' ELSE '"' END || ' by ' || v_user_name
            WHEN 'judgment' THEN 'BOB: Judgment added - "' || LEFT(NEW.content, 50) || CASE WHEN LENGTH(NEW.content) > 50 THEN '..."' ELSE '"' END || ' by ' || v_user_name
            WHEN 'decision' THEN 'BOB: Decision added - "' || LEFT(NEW.content, 50) || CASE WHEN LENGTH(NEW.content) > 50 THEN '..."' ELSE '"' END || ' by ' || v_user_name
            ELSE 'BOB: Entry added by ' || v_user_name
        END;
    
    -- Insert activity log entry
    INSERT INTO public.activities (crisis_id, description, timestamp)
    VALUES (v_crisis_id, v_activity_description, NEW.created_at);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically log BOB entry creation
CREATE OR REPLACE TRIGGER trigger_log_bob_entry_activity
    AFTER INSERT ON public.bob_entries
    FOR EACH ROW
    EXECUTE FUNCTION log_bob_entry_activity();

-- Create function to log BOB link activity  
CREATE OR REPLACE FUNCTION log_bob_link_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_user_name TEXT;
    v_crisis_id UUID;
    v_from_entry_content TEXT;
    v_to_entry_content TEXT;
    v_from_entry_type TEXT;
    v_to_entry_type TEXT;
    v_activity_description TEXT;
BEGIN
    -- Get user name from auth metadata
    SELECT COALESCE(auth.jwt() ->> 'email', 'Unknown User') INTO v_user_name;
    
    -- Get entry details for the link
    SELECT content, type, crisis_id INTO v_from_entry_content, v_from_entry_type, v_crisis_id
    FROM public.bob_entries WHERE id = NEW.from_entry_id;
    
    SELECT content, type INTO v_to_entry_content, v_to_entry_type
    FROM public.bob_entries WHERE id = NEW.to_entry_id;
    
    -- Use current crisis if no crisis_id found
    IF v_crisis_id IS NULL THEN
        SELECT id INTO v_crisis_id FROM crises WHERE status IN ('Active', 'Monitoring') ORDER BY start_time DESC LIMIT 1;
    END IF;
    
    -- Create activity description
    v_activity_description := 
        'BOB: Linked ' || INITCAP(v_from_entry_type) || ' to ' || INITCAP(v_to_entry_type) || 
        ' - "' || LEFT(v_from_entry_content, 30) || '..." → "' || LEFT(v_to_entry_content, 30) || '..." by ' || v_user_name;
    
    -- Insert activity log entry
    INSERT INTO public.activities (crisis_id, description, timestamp)
    VALUES (v_crisis_id, v_activity_description, NEW.created_at);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically log BOB link creation
CREATE OR REPLACE TRIGGER trigger_log_bob_link_activity
    AFTER INSERT ON public.bob_links
    FOR EACH ROW
    EXECUTE FUNCTION log_bob_link_activity();