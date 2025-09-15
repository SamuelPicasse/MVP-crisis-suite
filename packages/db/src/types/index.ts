export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface ResponsibilityCard {
  id: string;
  role: string;
  duties: string[];
  description?: string;
  created_at: Date;
}

export interface CrisisDocument {
  id: string;
  title: string;
  description?: string;
  type: 'CrisisPlan' | 'Procedure' | 'Reference';
  content?: string;
  file_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BobEntry {
  id: string;
  crisis_id?: string;
  user_id: string;
  type: 'assessment' | 'judgment' | 'decision';
  content: string;
  created_at: Date;
  updated_at: Date;
  linked_to?: string[];
}

export interface BobLink {
  id: string;
  from_entry_id: string;
  to_entry_id: string;
  created_by: string;
  created_at: Date;
}

export interface Activity {
  id: string;
  crisis_id?: string;
  timestamp: string;
  description: string;
  created_at?: Date;
}

export * from './database.types';