'use client';

import { useState, useCallback } from 'react';
import StatusOverview from "@/components/status-overview"
import StatusMetrics from "@/components/status-metrics"
import StatusEndpoints from "@/components/status-endpoints"
import BackgroundMonitor from "@/components/background-monitor"
import { StatusCheck, DailyMetrics } from '@/lib/supabase';

interface StatusData {
  statusChecks: StatusCheck[];
  metrics: DailyMetrics[];
}

interface StatusPageClientProps {
  initialData?: StatusData;
}

export default function StatusPageClient({ initialData }: StatusPageClientProps) {
  const [currentData, setCurrentData] = useState<StatusData | undefined>(initialData);

  const handleBackgroundUpdate = useCallback((newData: StatusData) => {
    setCurrentData(newData);
  }, []);

  return (
    <>
      {/* Background monitoring - invisible component */}
      <BackgroundMonitor onUpdate={handleBackgroundUpdate} />
      
      {/* UI components that will be updated when background monitoring completes */}
      <div className="space-y-8">
        {/* System Status Section */}
        <section id="overview" className="bg-card rounded-lg shadow-lg">
          <StatusOverview key={currentData ? 'updated' : 'initial'} />
        </section>

        {/* Metrics and Endpoints Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div id="metrics" className="bg-card rounded-lg shadow-lg">
            <StatusMetrics key={currentData ? 'updated' : 'initial'} />
          </div>
          <div id="endpoints" className="bg-card rounded-lg shadow-lg">
            <StatusEndpoints key={currentData ? 'updated' : 'initial'} />
          </div>
        </section>
      </div>
    </>
  );
} 