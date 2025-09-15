# **Crisis Suite MVP Fullstack Architecture Document**

## **Introduction**

This document outlines the complete fullstack architecture for the **Crisis Suite MVP**, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

## **High Level Architecture**

### **Technical Summary**

The Crisis Suite will be a modern web application built within a monorepo structure, leveraging the Vercel and Supabase platforms. The frontend will be a responsive React-based application (using Next.js) hosted on Vercel's global CDN for optimal performance. The backend will be powered by Supabase, which provides a managed PostgreSQL database, user authentication, and serverless Edge Functions. This integrated architecture is designed for high availability, a seamless developer experience, and the real-time capabilities required for the application.

### **Platform and Infrastructure Choice**

* **Platform:** **Vercel** (Frontend) \+ **Supabase** (Backend-as-a-Service).  
* **Key Services:**  
  * **Vercel:** Frontend Hosting & CI/CD.  
  * **Supabase PostgreSQL:** A full-featured, managed relational database.  
  * **Supabase Auth:** Built-in user authentication and management.  
  * **Supabase Edge Functions:** For serverless backend logic.

### **Repository Structure**

* **Structure:** A **Monorepo**.  
* **Monorepo Tool:** We will use **Turborepo** to manage the monorepo.

### **High Level Architecture Diagram**

graph TD  
    User\[CMT User\] \--\> Vercel\[Vercel Platform\];  
      
    subgraph Vercel  
        Frontend\[Next.js Frontend App\]  
    end

    Frontend \--\> Supabase\[Supabase Platform\];  
      
    subgraph Supabase  
        direction LR  
        Auth\[Auth\]  
        Functions\[Edge Functions\]  
        Database\[(PostgreSQL DB)\]  
    end  
      
    Functions \--\> Database;

### **Architectural Principles**

* **Abstraction Layer:** A Data Access Layer (Repository Pattern) will be implemented to decouple business logic from Supabase-specific code. This ensures long-term flexibility and allows for easier migration to a self-hosted or alternative backend in the future if required.

## **Tech Stack**

| Category | Technology | Version | Purpose & Rationale |
| :---- | :---- | :---- | :---- |
| **Frontend Language** | TypeScript | \~5.x | Provides strong typing for a robust and maintainable frontend. |
| **Frontend Framework** | Next.js | \~14.x | The premier React framework, offering the best performance on Vercel. |
| **UI Styling** | Tailwind CSS | \~3.x | A utility-first CSS framework for rapid, consistent UI development. |
| **UI Components** | Headless UI | \~2.x | Unstyled, accessible UI components that work perfectly with Tailwind CSS. |
| **State Management** | Zustand | \~4.x | A simple, fast, and scalable state management solution for React. |
| **Backend Language** | TypeScript | \~5.x | Matches the frontend for code consistency and type safety. |
| **Backend Platform** | Supabase | \~2.x | Provides an integrated platform for database, auth, and functions. |
| **API Style** | REST & RPC | N/A | We will use Supabase's auto-generated REST API and RPC for custom logic. |
| **Database** | PostgreSQL | 15.x | A powerful and reliable relational database, managed by Supabase. |
| **Authentication** | Supabase Auth | \~2.x | Built-in, secure, and easy-to-use authentication from Supabase. |
| **Testing** | Vitest & RTL | \~1.x | A modern and fast testing framework for frontend and backend. |
| **E2E Testing** | Playwright | \~1.x | For end-to-end testing of critical user flows. |
| **Monorepo Tool** | Turborepo | \~1.x | For managing the monorepo and optimizing build processes. |
| **CI/CD** | Vercel | N/A | Seamless, Git-based CI/CD for the frontend and serverless functions. |

## **Data Models**

*These TypeScript interfaces will be located in a shared package within the monorepo to ensure type safety across the frontend and backend.*

### **User**

interface User {  
  id: string; // UUID  
  email: string;  
  fullName: string;  
  role: string;  
}

### **Crisis**

interface Crisis {  
  id: string;  
  name: string;  
  status: 'Active' | 'Monitoring' | 'Closed';  
  startTime: Date;  
}

### **BobEntry**

type BobEntryType \= 'Assessment' | 'Judgment' | 'Decision';

interface BobEntry {  
  id: string;  
  crisisId: string;  
  authorId: string;  
  type: BobEntryType;  
  content: string;  
  createdAt: Date;  
  linkedFromIds?: string\[\];  
}

### **Task**

interface Task {  
  id: string;  
  crisisId: string;  
  assigneeId: string;  
  sourceDecisionId?: string;  
  description: string;  
  status: 'Todo' | 'InProgress' | 'Completed';  
  createdAt: Date;  
}

### **Communication**

interface Communication {  
  id: string;  
  crisisId: string;  
  authorId: string;  
  content: string;  
  createdAt: Date;  
}

### **Activity**

interface Activity {  
  id: string;  
  crisisId: string;  
  timestamp: Date;  
  description: string;  
}

## **Unified Project Structure**

/apps  
  /web          // Next.js frontend application  
  /supabase     // Supabase backend (Edge Functions, migrations)  
/packages  
  /db           // Database client and schema definitions (drizzle-kit)  
  /ui           // Shared UI components (using Headless UI & Tailwind)  
  /config       // Shared configurations (ESLint, TypeScript)  
  /eslint-config-custom  
  /tsconfig

## **Database Schema (PostgreSQL)**

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
