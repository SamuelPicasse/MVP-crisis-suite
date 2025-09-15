# **Epic 1: Core Crisis Management MVP**

**Epic Goal:** To deliver a functional, integrated suite that allows a crisis team to manage a crisis from a central dashboard, follow a structured decision-making process using the BOB model, and track associated tasks and communications effectively.

## **Story 1.1: Project Foundation & User Authentication**

* **As a** developer,  
* **I want** to set up the project structure and a basic user authentication system,  
* **so that** we have a secure and stable foundation to build the application's features upon.  
* **Acceptance Criteria:**  
  1. A monorepo with separate packages for the frontend and backend is created.  
  2. A basic user login and logout flow is functional.  
  3. Authenticated users are directed to a placeholder dashboard page.  
  4. The project includes basic configuration for unit testing.

## **Story 1.2: Display Crisis Summary & Activity Log**

* **As a** CMT member,  
* **I want** to see a summary of the current crisis and a log of all major events on the dashboard,  
* **so that** I have immediate situational awareness upon logging in.  
* **Acceptance Criteria:**  
  1. The dashboard displays a "Crisis Summary" widget with fields for Crisis Name, Status, Start Time, and Duration (initially populated with static data).  
  2. The dashboard displays an "Activity Log" widget that can render a list of events.  
  3. Backend API endpoints exist to provide the data for these widgets.

## **Story 1.3: Implement View-Only Reference Sections**

* **As a** CMT member,  
* **I want** to view my responsibility card and access pre-loaded crisis documents,  
* **so that** I can quickly reference key procedural information.  
* **Acceptance Criteria:**  
  1. A "Responsibility Cards" page is created and accessible from the main navigation.  
  2. The page displays a list of roles; the logged-in user's role is highlighted.  
  3. A "Documents" page is created and accessible from the main navigation.  
  4. The page displays a list of pre-loaded documents.  
  5. Data for both sections is sourced from the backend.

## **Story 1.4: Implement Core BOB Model Interface**

* **As a** CMT member,  
* **I want** to add and link entries for Situation Assessment, Judgments, and Decisions,  
* **so that** we can track our decision-making process in a structured way.  
* **Acceptance Criteria:**  
  1. A dedicated page for the BOB model is created with three distinct columns.  
  2. Users can add a new text-based entry to any of the three columns.  
  3. Users can select an entry and link it to an existing entry in an adjacent column.  
  4. All BOB model data is persisted to the database.  
  5. Creating a new BOB entry generates a new event in the Activity Log on the dashboard.

## **Story 1.5: Implement Core Task Management**

* **As a** CMT member,  
* **I want** to create tasks from decisions and assign them to users,  
* **so that** we can manage our response actions effectively.  
* **Acceptance Criteria:**  
  1. From a "Decision" entry in the BOB model, a user has an option to "Create Task".  
  2. The task creation form allows for a description and assignment to another system user.  
  3. A central "All Tasks" page is created that displays a list of all tasks, their assignees, and status.  
  4. Creating a task generates a new event in the Activity Log.

## **Story 1.6: Implement "My Tasks" Widget & Communication Log**

* **As a** CMT member,  
* **I want** to see my assigned tasks on the dashboard and post formal updates,  
* **so that** I can focus on my work and keep the team informed.  
* **Acceptance Criteria:**  
  1. The "My Tasks" widget on the dashboard is populated with tasks assigned only to the logged-in user.  
  2. A "Communication" page is created with a form to submit new announcements.  
  3. Submitted announcements are displayed in a chronological, view-only log.  
  4. Posting a new communication generates a new event in the Activity Log.