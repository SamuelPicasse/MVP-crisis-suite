export interface Crisis {
  id: string;
  name: string;
  status: 'Active' | 'Monitoring' | 'Closed';
  start_time: string; // ISO timestamp
  duration?: string; // Duration in human readable format
}

export interface Activity {
  id: string;
  crisis_id: string;
  timestamp: string; // ISO timestamp
  description: string;
}

export interface CrisisWithDuration extends Crisis {
  duration: string;
}

export interface ActivityLogResponse {
  activities: Activity[];
  total: number;
}

export interface ResponsibilityCard {
  id: string;
  title: string;
  description: string;
  duties: string[];
  assigned_user_id?: string;
  assigned_user?: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  file_url: string;
  category: string;
}

export interface Database {
  public: {
    Tables: {
      crises: {
        Row: Crisis;
      };
      activities: {
        Row: Activity;
      };
      responsibility_cards: {
        Row: ResponsibilityCard;
      };
      documents: {
        Row: Document;
      };
    };
    Functions: {
      get_current_crisis: {
        Returns: CrisisWithDuration;
      };
      get_activity_log: {
        Args: {
          p_crisis_id?: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: Activity[];
      };
      get_responsibility_cards: {
        Returns: ResponsibilityCard[];
      };
      get_documents: {
        Returns: Document[];
      };
    };
  };
}