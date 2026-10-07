import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../services/api';

/**
 * Runs an async loader and tracks loading / error / data.
 * `deps` re-run the loader; `reload()` runs it again on demand.
 */
export default function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const alive = useRef(true);
  const counter = useRef(0);

  const run = useCallback(async () => {
    const id = (counter.current += 1);
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await loader();
      if (alive.current && id === counter.current) setState({ data, loading: false, error: null });
    } catch (err) {
      if (alive.current && id === counter.current) setState({ data: null, loading: false, error: getErrorMessage(err), status: err?.response?.status });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    alive.current = true;
    run();
    return () => {
      alive.current = false;
    };
  }, [run]);

  return { ...state, reload: run, setData: (data) => setState((s) => ({ ...s, data })) };
}
