import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeProps<T> {
  table: string;
  onData: (payload: {
    new: T;
    old: T | null;
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  }) => void;
  filter?: string;
  filterValue?: string;
}

export function useRealtime<T>({
  table,
  onData,
  filter,
  filterValue,
}: UseRealtimeProps<T>) {
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      // Create a channel with a unique name
      channel = supabase.channel(`${table}-changes-${Date.now()}`);

      // Configure the subscription
      const config = {
        event: '*',
        schema: 'public',
        table: table,
      } as const;

      // Add filter if provided
      if (filter && filterValue) {
        Object.assign(config, {
          filter: `${filter}=eq.${filterValue}`,
        });
      }

      // Subscribe to changes
      channel
        .on('postgres_changes', config, (payload) => {
          const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
          onData({
            new: payload.new as T,
            old: payload.old as T | null,
            eventType,
          });
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Subscribed to ${table} changes`);
          }
        });
    };

    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [table, onData, filter, filterValue]);
}
