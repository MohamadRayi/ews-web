import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeOptions<T> {
  table: string;
  event?: RealtimeEvent;
  schema?: string;
  filter?: string;
  onData: (payload: {
    new: T;
    old: T | null;
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  }) => void;
}

export function useRealtime<T>({
  table,
  event = '*',
  schema = 'public',
  filter,
  onData,
}: UseRealtimeOptions<T>) {
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = () => {
      channel = supabase.channel(`${schema}:${table}`);
      
      const config = {
        event,
        schema,
        table,
        ...(filter ? { filter } : {})
      };

      channel
        .on('postgres_changes' as 'system', config, (payload: RealtimePostgresChangesPayload<T>) => {
          onData({
            new: payload.new as T,
            old: payload.old as T | null,
            eventType: payload.eventType
          });
        })
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [table, event, schema, filter, onData]);
}
