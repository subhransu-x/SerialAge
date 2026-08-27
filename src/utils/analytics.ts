declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, string> }) => void;
  }
}

/**
 * Tracks a custom event using Plausible Analytics.
 * Silently fails if Plausible is blocked or not loaded.
 * 
 * IMPORTANT: NEVER send raw serial numbers in the props to avoid PII tracking.
 */
export function trackEvent(eventName: string, props?: Record<string, string>) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props });
  }
}
