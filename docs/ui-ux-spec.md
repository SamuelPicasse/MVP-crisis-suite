# **Crisis Suite MVP UI/UX Specification**

### **Introduction**

This document defines the user experience goals, information architecture, user flows, and visual design specifications for the **Crisis Suite MVP**'s user interface. It serves as the foundation for visual design and frontend development, ensuring a cohesive and user-centered experience.

### **Overall UX Goals & Principles**

#### **Target User Personas**

* **The Decisive Operator:** A member of the Crisis Management Team who is time-compressed and task-saturated. Their primary goal is to filter out noise, instantly grasp the operational picture, understand their immediate responsibilities, and execute decisions with confidence. They are not browsing; they are acting.

#### **Usability Goals**

* **One-Glance Situational Awareness:** The dashboard must present the overall crisis status, key metrics from the "Crisis Summary," and personal tasks in a layout that is fully comprehensible in under 5 seconds.  
* **Frictionless Decision Logging:** The BOB model interface must be so intuitive that logging assessments, judgments, and decisions feels like a natural extension of the team's conversation, not a data-entry chore.  
* **Confident Action:** Users must receive unambiguous confirmation for every critical action (e.g., creating a task, posting a communication), eliminating the uncertainty that breeds hesitation in a crisis.

#### **Design Principles**

1. **Signal Over Noise:** Every element on the screen must fight for its place. We will aggressively prioritize scannable data and clear calls-to-action over dense, informational displays.  
2. **Actionable Information First:** The interface will be structured to present the most urgent, action-oriented information (especially the "My Tasks" widget) in the most prominent positions.  
3. **Ruthless Consistency:** Identical patterns will be used for similar actions across the entire suite. A button to "add" something will look and behave the same way everywhere, eliminating guesswork.

### **Information Architecture (IA)**

#### **Site Map / Screen Inventory**

This diagram shows the primary screens of the application and their relationships. The Dashboard serves as the central hub.

graph TD  
    A\[Login\] \--\> B(Dashboard)  
    B \--\> C(BOB Model)  
    B \--\> D(All Tasks)  
    B \--\> E(Communication)  
    B \--\> F(Responsibility Cards)  
    B \--\> G(Documents)

    subgraph Main Navigation  
        direction LR  
        C  
        D  
        E  
        F  
        G  
    end

#### **Navigation Structure**

* **Primary Navigation:** A persistent top navigation bar will be visible on all screens (except Login) and will contain direct links to:  
  * Dashboard  
  * BOB Model  
  * All Tasks  
  * Communication  
  * Responsibility Cards  
  * Documents

### **User Flows**

#### **Log a Decision and Create a Task (Flexible Linking)**

* **User Goal:** To log the first assessment, build a chain of reasoning (potentially from multiple sources), and create an actionable task.  
* **Flow Diagram:**  
  graph TD  
      subgraph "Situation Assessment"  
          A\["(+) Add New Assessment"\]  
      end

      subgraph "Judgments"  
          B\["(+) Add New Judgment"\]  
      end

      subgraph "Decisions"  
          C\["(+) Add New Decision"\]  
      end

      A \--\> D{User adds 'Fire reported'};  
      D \--\> E\[Selects 'Fire reported'\];  
      E \--\> B;  
      B \--\> F\["User adds Judgment 'Building unsafe'\<br/\>(links to 'Fire reported')"\];

      subgraph "Another Assessment Thread"  
       G\["(+) Add New Assessment"\] \--\> H{User adds 'Smoke alarms silent'};  
       H \--\> I\[Selects 'Smoke alarms silent'\];  
      end

      I \--\> B;  
      B \--\> J\["User adds Judgment 'Alarm system failed'\<br/\>(links to 'Smoke alarms silent')"\];

      F \--\> C;  
      J \--\> C;  
      C \--\> K\["User adds Decision 'Evacuate immediately'\<br/\>(links to 'Building unsafe' AND 'Alarm system failed')"\];

      K \--\> L\["Click 'Create Task'"\];  
      L \--\> M\[Task Created & Logged\];  
      M \--\> N\[End\];

      style N fill:\#90EE90

* **Interaction Note:** When a user adds a new Judgment or Decision, the creation form will include a checklist of all available items from the previous column, allowing the user to select one or more parent items to link to.

### **Wireframes & Mockups**

#### **Design Source of Truth**

* **Primary Design Reference:** The visual design, layout, and component styling will be based on the two reference images provided (image\_e42d6a.jpg and image\_e42cd1.png). These images define the clean, minimalist, and professional aesthetic for the application.

#### **Key Screen Layouts**

**1\. Dashboard**

* **Purpose:** To provide "One-Glance Situational Awareness."  
* **Layout:** A two-column layout.  
  * **Left Column (Wider):** "Crisis Summary" at the top, "Activity Log" at the bottom.  
  * **Right Column (Narrower):** "Incident Location" at the top, "My Tasks" at the bottom.

**2\. BOB Model Interface**

* **Purpose:** To provide a "Frictionless Decision Logging" experience.  
* **Layout:** A three-column, full-width layout for Situation Assessment, Judgments, and Decisions.

### **Component Library / Design System (Final Version)**

#### **Design System Approach**

For the MVP, we will adopt a lean approach. We will create a core set of reusable, styled components directly within the application's codebase.

#### **Core Components**

**1\. Layout & Structure**

* **TopNavigationBar:** The persistent site header.  
* **DashboardGrid:** The two-column grid for the main dashboard.  
* **BobColumn:** A dedicated container for one of the three BOB model sections.

**2\. Data Display**

* **WidgetCard:** The main container for all dashboard widgets.  
  * **States:** Loading, Error, Empty, Default (with data).  
* **EntryCard:** The card for a single entry within a BobColumn.  
* **ActivityLogItem:** A component for a single entry in the activity feed.  
* **TaskList:** A component to display a list of tasks.  
  * **States:** Loading, Error, Empty, Default (with data).  
* **StatusBadge:** A small tag for displaying status.

**3\. Actions & Forms**

* **Button:** A primary component for all actions (Primary, Secondary, Danger variants).  
* **InputField:** A standard text input for forms.  
* **TaskCreationModal:** A specialized modal for creating and assigning a new task.  
* **BobLinkingModal:** A specialized modal used to link BOB entries.

**4\. User Feedback**

* **Toast/Notification:** A non-intrusive pop-up for success messages.  
* **Alert:** An inline message for critical errors or warnings.

### **Branding & Style Guide**

#### **Color Palette**

| Color Type | Hex Code | Usage |
| :---- | :---- | :---- |
| Primary | \#2563EB | Main actions, links, active navigation |
| Secondary | \#F3F4F6 | Backgrounds, borders, subtle containers |
| Success | \#10B981 | Positive feedback, confirmations |
| Warning | \#FBBF24 | Important notices, warnings |
| Error | \#EF4444 | Errors, destructive actions |
| Neutral | \#111827 | Text, borders, backgrounds |

#### **Typography**

* **Font Families:** "Inter", sans-serif.  
* **Base Size:** 14px for body text.

#### **Iconography**

* **Icon Library:** Heroicons.

#### **Spacing & Layout**

* **Grid System:** 8-point grid system.

### **Accessibility Requirements**

* **Standard:** Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.  
* **Key Requirements:** High color contrast, full keyboard navigability, and screen reader support via semantic HTML are mandatory.

### **Responsiveness Strategy**

#### **Primary Target Platform**

The application is designed as **desktop-first**. The primary user experience is optimized for larger screens (laptops and desktops) and tablets. Mobile phone access is a secondary consideration for the MVP.

#### **Breakpoints**

| Breakpoint | Min Width | Target Devices |
| :---- | :---- | :---- |
| **Tablet** | 768px | Tablets (Portrait & Landscape) |
| **Desktop** | 1024px | Laptops and Desktops (Primary) |

#### **Adaptation Patterns**

* **Dashboard & BOB Model:** The multi-column layouts will be maintained on Desktop and Tablet. On narrower screens, horizontal scrolling within complex views is acceptable for the MVP.  
* **Navigation:** The full top navigation bar will be displayed on all target devices. A collapsed menu is not required for the MVP.

### **Next Steps**

1. Review and approve this UI/UX Specification.  
2. Handoff to the Architect to begin creation of the detailed technical Architecture Document.