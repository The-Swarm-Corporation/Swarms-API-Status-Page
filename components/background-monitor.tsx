'use client';

import { useEffect, useState } from 'react';
import { StatusCheck, DailyMetrics } from '@/lib/supabase';

interface StatusData {
  statusChecks: StatusCheck[];
  metrics: DailyMetrics[];
}
import { supabase } from '@/lib/supabase';

interface BackgroundMonitorProps {
  onUpdate?: (data: StatusData) => void;
}

export default function BackgroundMonitor({ onUpdate }: BackgroundMonitorProps) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let intervalId: NodeJS.Timeout;

    const runMonitoring = async () => {
      try {
        // Trigger monitoring endpoint
        await fetch('/api/monitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        // Wait a moment for monitoring to complete
        setTimeout(async () => {
          if (!supabase) return;
          
          // Fetch updated data from Supabase
          const { data: statusChecks } = await supabase
            .from('status_checks')
            .select('*')
            .order('checked_at', { ascending: false })
            .limit(8);

          const { data: metrics } = await supabase
            .from('daily_metrics')
            .select('*')
            .gte('date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            .order('date', { ascending: false });

          if (statusChecks && onUpdate) {
            onUpdate({
              statusChecks: statusChecks || [],
              metrics: metrics || []
            });
          }
        }, 3000); // Wait 3 seconds for monitoring to complete
      } catch (error) {
        // Silent fail - no error display needed
        console.log('Background monitoring failed');
      }
    };

    // Initial monitoring when component mounts
    const startMonitoring = () => {
      setIsActive(true);
      runMonitoring();
      
      // Set up interval for every 5 minutes
      intervalId = setInterval(runMonitoring, 5 * 60 * 1000);
    };

    // Start immediately
    startMonitoring();

    // Cleanup on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      setIsActive(false);
    };
  }, [onUpdate]);

  // This component renders nothing - it's invisible
  return null;
} 