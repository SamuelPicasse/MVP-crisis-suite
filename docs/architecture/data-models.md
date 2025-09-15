# **Data Models**

*These TypeScript interfaces will be located in a shared package within the monorepo to ensure type safety across the frontend and backend.*

## **User**

interface User {  
  id: string; // UUID  
  email: string;  
  fullName: string;  
  role: string;  
}

## **Crisis**

interface Crisis {  
  id: string;  
  name: string;  
  status: 'Active' | 'Monitoring' | 'Closed';  
  startTime: Date;  
}

## **BobEntry**

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

## **Task**

interface Task {  
  id: string;  
  crisisId: string;  
  assigneeId: string;  
  sourceDecisionId?: string;  
  description: string;  
  status: 'Todo' | 'InProgress' | 'Completed';  
  createdAt: Date;  
}

## **Communication**

interface Communication {  
  id: string;  
  crisisId: string;  
  authorId: string;  
  content: string;  
  createdAt: Date;  
}

## **Activity**

interface Activity {  
  id: string;  
  crisisId: string;  
  timestamp: Date;  
  description: string;  
}
