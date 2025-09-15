# **Crisis Suite Product Requirements Document (PRD)**

## **Goals and Background Context**

### **Goals**

* Decrease the time from incident report to the first decisive action.  
* Centralize all critical crisis data (assessments, decisions, tasks) into a single system.  
* Enable a user to identify their personal responsibilities within 5 seconds of viewing the dashboard.  
* Provide the entire crisis team with a clear, shared operational picture in real-time.

### **Background Context**

The current process for crisis management relies on fragmented, ad-hoc tools like emails, phone calls, and whiteboards. This leads to communication delays, conflicting information, and a lack of accountability, which introduces significant operational risk. This document outlines the requirements for a Minimum Viable Product (MVP) of the Crisis Suite, designed to solve these challenges by creating an integrated, single source of truth for crisis response.

### **Change Log**

| Date | Version | Description | Author |
| :---- | :---- | :---- | :---- |
| 2025-09-12 | 1.0 | Initial PRD Draft | John, PM |

## **Requirements**

### **Functional**

* **FR1:** The main dashboard must display a "Crisis Summary" widget containing the Crisis Name, current Status, Start Time, and running Duration.  
* **FR2:** The dashboard must display a "My Tasks" widget showing a list of tasks assigned specifically to the currently logged-in user.  
* **FR3:** The dashboard must feature a real-time "Activity Log" that aggregates key events from other modules (BOB, Tasks, Communication).  
* **FR4:** The system must provide a three-column interface for the BOB model (Situation Assessment, Judgments, Decisions) where users can add text-based entries.  
* **FR5:** Users must be able to visually and logically link entries between the columns of the BOB model.  
* **FR6:** Users must have the ability to create a new task and assign it to a specific user.  
* **FR7:** The application must provide a central view where all created tasks are listed.  
* **FR8:** The system will include a Communication module where users can post official, view-only announcements to a log.  
* **FR9:** A view-only section for "Responsibility Cards" must be available, displaying pre-defined roles and their duties.  
* **FR10:** A view-only "Documents" section must be available to display pre-loaded crisis management plans and other relevant documents.

### **Non-Functional**

* **NFR1:** The application must be accessible via modern web browsers on desktop and tablet devices.  
* **NFR2:** The main dashboard view must load completely within 3 seconds on a standard internet connection.  
* **NFR3:** The UI must be clean, intuitive, and designed for high-stress usability, minimizing cognitive load.  
* **NFR4:** All data entered into the system (BOB entries, tasks, communications) must have high data integrity and be accurately logged.

## **User Interface Design Goals**

* **Overall UX Vision:** The user experience will be defined by clarity, speed, and focus. The design will be minimalist and utilitarian, prioritizing information hierarchy and reducing cognitive load for users operating under pressure.  
* **Key Interaction Paradigms:** The interface will rely on standard point-and-click interactions. Linking items in the BOB model may be achieved via a simple "link" button that allows the user to select the target item.  
* **Core Screens and Views:**  
  * Main Dashboard  
  * BOB Model Interface  
  * All Tasks List View  
  * Communication Log View  
  * Responsibility Cards View  
  * Document Viewer  
* **Branding:** The visual style will be clean and professional, mirroring the reference images provided. It will use a light theme with clear fonts. Status indicators (e.g., for tasks, crisis status) should use a simple color code (e.g., green, yellow, red) for at-a-glance understanding.  
* **Target Device and Platforms:** The application will be a responsive web app, designed primarily for use on desktop and tablet screens.

## **Technical Assumptions**

* **Repository Structure:** A **Monorepo** structure is assumed. This will simplify sharing of types and logic between the frontend and backend applications.  
* **Service Architecture:** A **Serverless** architecture (e.g., using AWS Lambda or Google Cloud Functions) is assumed for the backend. This provides scalability and cost-efficiency.  
* **Testing Requirements:** The project requires both **unit and integration tests**. The testing strategy will be detailed in the Architecture Document.

## **Epic List**

* **Epic 1: Core Crisis Management MVP:** Establish the foundational platform including user authentication, the dashboard, the BOB model, tasking, communication, and document modules to provide a centralized and actionable operational picture for the Crisis Management Team.

## **Epic 1: Core Crisis Management MVP**

**Epic Goal:** To deliver a functional, integrated suite that allows a crisis team to manage a crisis from a central dashboard, follow a structured decision-making process using the BOB model, and track associated tasks and communications effectively.

### **Story 1.1: Project Foundation & User Authentication**

* **As a** developer,  
* **I want** to set up the project structure and a basic user authentication system,  
* **so that** we have a secure and stable foundation to build the application's features upon.  
* **Acceptance Criteria:**  
  1. A monorepo with separate packages for the frontend and backend is created.  
  2. A basic user login and logout flow is functional.  
  3. Authenticated users are directed to a placeholder dashboard page.  
  4. The project includes basic configuration for unit testing.

### **Story 1.2: Display Crisis Summary & Activity Log**

* **As a** CMT member,  
* **I want** to see a summary of the current crisis and a log of all major events on the dashboard,  
* **so that** I have immediate situational awareness upon logging in.  
* **Acceptance Criteria:**  
  1. The dashboard displays a "Crisis Summary" widget with fields for Crisis Name, Status, Start Time, and Duration (initially populated with static data).  
  2. The dashboard displays an "Activity Log" widget that can render a list of events.  
  3. Backend API endpoints exist to provide the data for these widgets.

### **Story 1.3: Implement View-Only Reference Sections**

* **As a** CMT member,  
* **I want** to view my responsibility card and access pre-loaded crisis documents,  
* **so that** I can quickly reference key procedural information.  
* **Acceptance Criteria:**  
  1. A "Responsibility Cards" page is created and accessible from the main navigation.  
  2. The page displays a list of roles; the logged-in user's role is highlighted.  
  3. A "Documents" page is created and accessible from the main navigation.  
  4. The page displays a list of pre-loaded documents.  
  5. Data for both sections is sourced from the backend.

### **Story 1.4: Implement Core BOB Model Interface**

* **As a** CMT member,  
* **I want** to add and link entries for Situation Assessment, Judgments, and Decisions,  
* **so that** we can track our decision-making process in a structured way.  
* **Acceptance Criteria:**  
  1. A dedicated page for the BOB model is created with three distinct columns.  
  2. Users can add a new text-based entry to any of the three columns.  
  3. Users can select an entry and link it to an existing entry in an adjacent column.  
  4. All BOB model data is persisted to the database.  
  5. Creating a new BOB entry generates a new event in the Activity Log on the dashboard.

### **Story 1.5: Implement Core Task Management**

* **As a** CMT member,  
* **I want** to create tasks from decisions and assign them to users,  
* **so that** we can manage our response actions effectively.  
* **Acceptance Criteria:**  
  1. From a "Decision" entry in the BOB model, a user has an option to "Create Task".  
  2. The task creation form allows for a description and assignment to another system user.  
  3. A central "All Tasks" page is created that displays a list of all tasks, their assignees, and status.  
  4. Creating a task generates a new event in the Activity Log.

### **Story 1.6: Implement "My Tasks" Widget & Communication Log**

* **As a** CMT member,  
* **I want** to see my assigned tasks on the dashboard and post formal updates,  
* **so that** I can focus on my work and keep the team informed.  
* **Acceptance Criteria:**  
  1. The "My Tasks" widget on the dashboard is populated with tasks assigned only to the logged-in user.  
  2. A "Communication" page is created with a form to submit new announcements.  
  3. Submitted announcements are displayed in a chronological, view-only log.  
  4. Posting a new communication generates a new event in the Activity Log.