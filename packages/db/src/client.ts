import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';
import type { ResponsibilityCard, CrisisDocument, BobEntry } from './types/index';

export const createSupabaseClient = (
  supabaseUrl: string,
  supabaseAnonKey: string,
  options = {}
) => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, options);
};

export const createReferenceApiClient = (client: SupabaseClient<Database>) => {
  return {
    async getResponsibilityCards(): Promise<ResponsibilityCard[]> {
      const { data, error } = await client.rpc('get_responsibility_cards');
      
      if (error) {
        throw new Error(`Failed to fetch responsibility cards: ${error.message}`);
      }
      
      return (data || []).map((item: any) => ({
        id: item.id,
        role: item.role,
        duties: item.duties || [],
        description: item.description,
        created_at: item.created_at
      }));
    },

    async getDocuments(): Promise<CrisisDocument[]> {
      const { data, error } = await client.rpc('get_documents');
      
      if (error) {
        throw new Error(`Failed to fetch documents: ${error.message}`);
      }
      
      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type as 'CrisisPlan' | 'Procedure' | 'Reference',
        content: item.content,
        file_url: item.file_url,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    }
  };
};

export const createBobApiClient = (client: SupabaseClient<Database>) => {
  return {
    async getBobEntries(crisisId?: string): Promise<BobEntry[]> {
      const { data, error } = await client.rpc('get_bob_entries', { 
        p_crisis_id: crisisId || null 
      });
      
      if (error) {
        throw new Error(`Failed to fetch BOB entries: ${error.message}`);
      }
      
      return (data || []).map((item: any) => ({
        id: item.id,
        crisis_id: item.crisis_id,
        user_id: item.user_id,
        type: item.type as 'assessment' | 'judgment' | 'decision',
        content: item.content,
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at),
        linked_to: item.linked_to || []
      }));
    },

    async createBobEntry(entry: {
      crisis_id?: string;
      type: 'assessment' | 'judgment' | 'decision';
      content: string;
      linked_to?: string[];
    }): Promise<string> {
      const { data, error } = await client.rpc('create_bob_entry_with_links', {
        p_crisis_id: entry.crisis_id || null,
        p_type: entry.type,
        p_content: entry.content,
        p_linked_to: entry.linked_to || []
      });
      
      if (error) {
        throw new Error(`Failed to create BOB entry: ${error.message}`);
      }
      
      return data;
    },

    async updateBobEntry(id: string, updates: {
      content?: string;
    }): Promise<void> {
      const { error } = await client
        .from('bob_entries')
        .update(updates)
        .eq('id', id);
      
      if (error) {
        throw new Error(`Failed to update BOB entry: ${error.message}`);
      }
    },

    async deleteBobEntry(id: string): Promise<void> {
      const { error } = await client
        .from('bob_entries')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(`Failed to delete BOB entry: ${error.message}`);
      }
    },

    async createBobLink(fromEntryId: string, toEntryId: string): Promise<void> {
      // RLS requires created_by = auth.uid(), so set it explicitly
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError) {
        throw new Error(`Failed to resolve current user: ${userError.message}`);
      }
      const userId = userData?.user?.id;
      if (!userId) {
        throw new Error('Not authenticated: cannot create BOB link');
      }

      const { error } = await client
        .from('bob_links')
        .upsert(
          {
            from_entry_id: fromEntryId,
            to_entry_id: toEntryId,
            created_by: userId
          },
          { onConflict: 'from_entry_id,to_entry_id', ignoreDuplicates: true }
        );
      
      if (error) {
        throw new Error(`Failed to create BOB link: ${error.message}`);
      }
    },

    async deleteBobLink(fromEntryId: string, toEntryId: string): Promise<void> {
      const { error } = await client
        .from('bob_links')
        .delete()
        .match({
          from_entry_id: fromEntryId,
          to_entry_id: toEntryId
        });
      
      if (error) {
        throw new Error(`Failed to delete BOB link: ${error.message}`);
      }
    }
  };
};

export const createActivityApiClient = (client: SupabaseClient<Database>) => {
  return {
    async createActivity(data: {
      crisis_id?: string;
      description: string;
      timestamp?: Date;
    }): Promise<void> {
      const { error } = await client
        .from('activities')
        .insert({
          crisis_id: data.crisis_id || null,
          description: data.description,
          timestamp: data.timestamp || new Date()
        });
      
      if (error) {
        throw new Error(`Failed to create activity: ${error.message}`);
      }
    },

    async getActivityLog(crisisId?: string, limit: number = 50, offset: number = 0): Promise<any[]> {
      const { data, error } = await client.rpc('get_activity_log', {
        p_crisis_id: crisisId || null,
        p_limit: limit,
        p_offset: offset
      });
      
      if (error) {
        throw new Error(`Failed to get activity log: ${error.message}`);
      }
      
      return data || [];
    },

    async getCurrentCrisis(): Promise<any | null> {
      const { data, error } = await client.rpc('get_current_crisis');
      
      if (error) {
        throw new Error(`Failed to get current crisis: ${error.message}`);
      }
      
      return data && data.length > 0 ? data[0] : null;
    }
  };
};
