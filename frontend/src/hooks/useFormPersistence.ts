import { useEffect, useRef } from "react";
import { useLocalStorage } from "./useLocalStorage";

/**
 * Saves form values to localStorage on every change and restores them on mount.
 * Clears saved data after successful submission.
 *
 * @param key - unique key for this form
 * @param values - current form values
 * @param enabled - whether persistence is enabled
 * @returns an object with clearSaved and restoreSaved functions
 */
export function useFormPersistence<T extends Record<string, any>>(
  key: string,
  values: T,
  enabled: boolean = true,
) {
  const [savedData, setSavedData] = useLocalStorage<T | null>(
    `form_${key}`,
    null,
  );
  const isInitialMount = useRef(true);

  // Restore saved values on first mount
  const restoreSaved = (): T | null => {
    if (savedData && enabled) {
      return savedData;
    }
    return null;
  };

  // Save form values whenever they change (but not on initial mount)
  useEffect(() => {
    if (!enabled) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setSavedData(values);
  }, [values, enabled, setSavedData]);

  // Clear saved data
  const clearSaved = () => {
    setSavedData(null);
  };

  return { savedData, restoreSaved, clearSaved };
}

export default useFormPersistence;
