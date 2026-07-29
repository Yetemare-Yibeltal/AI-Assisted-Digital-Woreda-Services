import { useState, useEffect } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

/**
 * Gets the user's current geolocation position.
 * Updates when the user's position changes (if watch is enabled).
 */
export function useGeolocation(
  options: PositionOptions = {},
  watch: boolean = false,
): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation not supported",
        loading: false,
      }));
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      let message = "Unknown error";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = "Permission denied";
          break;
        case error.POSITION_UNAVAILABLE:
          message = "Position unavailable";
          break;
        case error.TIMEOUT:
          message = "Timeout";
          break;
      }
      setState((prev) => ({ ...prev, error: message, loading: false }));
    };

    let watchId: number;

    if (watch) {
      watchId = navigator.geolocation.watchPosition(
        onSuccess,
        onError,
        options,
      );
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    }

    return () => {
      if (watch && watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watch, options.enableHighAccuracy, options.timeout, options.maximumAge]);

  return state;
}

export default useGeolocation;
