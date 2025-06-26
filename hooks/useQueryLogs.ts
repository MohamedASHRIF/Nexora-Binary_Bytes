import { useState, useEffect } from 'react';

export const useQueryLogs = () => {
  const [queryLogs, setQueryLogs] = useState<any[]>([]);

  useEffect(() => {
    // Example: Replace with real fetch
    fetch('/api/query-logs')
      .then(res => res.json())
      .then(data => setQueryLogs(data))
      .catch(console.error);
  }, []);

  return { queryLogs };
};
