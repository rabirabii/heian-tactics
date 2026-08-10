import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseSubmitOptions<T = void> {
  action: (data: T) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
  debounceMs?: number;
}

export function useSubmit<T = void>({
  action,
  onSuccess,
  onError,
  successMessage = 'Saved successfully',
  errorMessage = 'Failed to save',
  debounceMs = 500
}: UseSubmitOptions<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const handleSubmit = useCallback(async (data: T) => {
    const now = Date.now();
    if (isSubmitting || (now - lastSubmitTime < debounceMs)) {
      return;
    }

    setIsSubmitting(true);
    setLastSubmitTime(now);

    try {
      await action(data);
      if (successMessage) {
        toast.success(successMessage);
      }
      onSuccess?.();
    } catch (error: any) {
      console.error(error);
      if (errorMessage) {
        toast.error(error.message || errorMessage);
      }
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [action, isSubmitting, lastSubmitTime, debounceMs, onSuccess, onError, successMessage, errorMessage]);

  return { handleSubmit, isSubmitting };
}
