# **Database Schema (PostgreSQL)**

\-- Users Table  
CREATE TABLE users (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    email TEXT UNIQUE NOT NULL,  
    full\_name TEXT,  
    role TEXT  
);

\-- Crises Table  
CREATE TABLE crises (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    name TEXT NOT NULL,  
    status TEXT NOT NULL DEFAULT 'Active',  
    start\_time TIMESTAMPTZ NOT NULL DEFAULT now()  
);

\-- BOB Entries Table  
CREATE TABLE bob\_entries (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    crisis\_id UUID REFERENCES crises(id) ON DELETE CASCADE,  
    author\_id UUID REFERENCES users(id),  
    type TEXT NOT NULL, \-- 'Assessment', 'Judgment', or 'Decision'  
    content TEXT NOT NULL,  
    created\_at TIMESTAMPTZ NOT NULL DEFAULT now(),  
    linked\_from\_ids UUID\[\]  
);

\-- Tasks Table  
CREATE TABLE tasks (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    crisis\_id UUID REFERENCES crises(id) ON DELETE CASCADE,  
    assignee\_id UUID REFERENCES users(id),  
    source\_decision\_id UUID REFERENCES bob\_entries(id),  
    description TEXT NOT NULL,  
    status TEXT NOT NULL DEFAULT 'Todo',  
    created\_at TIMESTAMPTZ NOT NULL DEFAULT now()  
);

\-- Communications Table  
CREATE TABLE communications (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    crisis\_id UUID REFERENCES crises(id) ON DELETE CASCADE,  
    author\_id UUID REFERENCES users(id),  
    content TEXT NOT NULL,  
    created\_at TIMESTAMPTZ NOT NULL DEFAULT now()  
);

\-- Activity Log Table  
CREATE TABLE activities (  
    id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    crisis\_id UUID REFERENCES crises(id) ON DELETE CASCADE,  
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),  
    description TEXT NOT NULL  
);  
