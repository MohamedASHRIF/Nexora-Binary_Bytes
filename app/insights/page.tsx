'use client';

import { DataInsights } from '../../components/DataInsights';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function InsightsPage() {
  const searchParams = useSearchParams();
  const [initialView, setInitialView] = useState<'overview' | 'moodmap' | 'chatmap' | 'sentiment'>('overview');

  useEffect(() => {
    const view = searchParams.get('view') as 'overview' | 'moodmap' | 'chatmap' | 'sentiment';
    if (view && ['overview', 'moodmap', 'chatmap', 'sentiment'].includes(view)) {
      setInitialView(view);
    }
  }, [searchParams]);

  return (
    <div className="w-full h-full flex flex-col mx-auto p-2">
      <DataInsights initialView={initialView} />
    </div>
  );
} 