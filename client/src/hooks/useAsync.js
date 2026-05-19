import { useState, useEffect, useCallback } from 'react';

/**
 * Generic async data-fetching hook with loading/error states
 */
export function useAsync(asyncFn, deps = [], immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute, setData };
}
