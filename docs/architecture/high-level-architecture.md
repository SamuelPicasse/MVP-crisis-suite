# **High Level Architecture**

## **Technical Summary**

The Crisis Suite will be a modern web application built within a monorepo structure, leveraging the Vercel and Supabase platforms. The frontend will be a responsive React-based application (using Next.js) hosted on Vercel's global CDN for optimal performance. The backend will be powered by Supabase, which provides a managed PostgreSQL database, user authentication, and serverless Edge Functions. This integrated architecture is designed for high availability, a seamless developer experience, and the real-time capabilities required for the application.

## **Platform and Infrastructure Choice**

* **Platform:** **Vercel** (Frontend) \+ **Supabase** (Backend-as-a-Service).  
* **Key Services:**  
  * **Vercel:** Frontend Hosting & CI/CD.  
  * **Supabase PostgreSQL:** A full-featured, managed relational database.  
  * **Supabase Auth:** Built-in user authentication and management.  
  * **Supabase Edge Functions:** For serverless backend logic.

## **Repository Structure**

* **Structure:** A **Monorepo**.  
* **Monorepo Tool:** We will use **Turborepo** to manage the monorepo.

## **High Level Architecture Diagram**

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

## **Architectural Principles**

* **Abstraction Layer:** A Data Access Layer (Repository Pattern) will be implemented to decouple business logic from Supabase-specific code. This ensures long-term flexibility and allows for easier migration to a self-hosted or alternative backend in the future if required.
