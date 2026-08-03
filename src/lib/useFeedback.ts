import { useCallback, useState } from 'react';
import { useToast } from '../components/ui/Toast';

export function useFeedback() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const success = useCallback(
    (message: string) => {
      toast.success(message);
    },
    [toast],
  );

  const error = useCallback(
    (message: string) => {
      toast.error(message);
    },
    [toast],
  );

  const info = useCallback(
    (message: string) => {
      toast.info(message);
    },
    [toast],
  );

  const run = useCallback(
    async <T,>(
      fn: () => Promise<T>,
      opts: {
        successMessage?: string;
        errorMessage?: string;
        onSuccess?: (result: T) => void;
        onError?: (err: unknown) => void;
      } = {},
    ) => {
      setLoading(true);
      try {
        const result = await fn();
        if (opts.successMessage) toast.success(opts.successMessage);
        opts.onSuccess?.(result);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : opts.errorMessage;
        if (msg) toast.error(msg);
        opts.onError?.(err);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  return { success, error, info, loading, setLoading, run };
}