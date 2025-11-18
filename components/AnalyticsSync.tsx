'use client';

import { useEffect } from 'react';
import mixpanel from '@/lib/mixpanel';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    originalGtag?: (...args: any[]) => void;
  }
}

export default function AnalyticsSync() {
  useEffect(() => {
    // Wait for gtag to be available
    const setupGtagInterceptor = () => {
      if (typeof window !== 'undefined' && window.gtag) {
        // Store the original gtag function
        if (!window.originalGtag) {
          window.originalGtag = window.gtag;
        }

        // Override gtag to intercept calls
        window.gtag = function (...args: any[]) {
          // Call original gtag first
          if (window.originalGtag) {
            window.originalGtag(...args);
          }

          // Sync to Mixpanel
          try {
            const [command, eventNameOrConfig, eventParams] = args;

            if (command === 'event') {
              // Track Google Analytics events in Mixpanel
              const eventName = eventNameOrConfig;
              const properties = eventParams || {};
              
              mixpanel.track(`GA: ${eventName}`, {
                ...properties,
                source: 'google_analytics',
              });
              
              console.log('Synced GA event to Mixpanel:', eventName, properties);
            } else if (command === 'config') {
              // Track page views
              const config = eventParams || {};
              if (config.page_path || config.page_location) {
                mixpanel.track('Page View', {
                  page_path: config.page_path,
                  page_location: config.page_location,
                  page_title: config.page_title,
                  source: 'google_analytics',
                });
                
                console.log('Synced GA page view to Mixpanel:', config);
              }
            } else if (command === 'set') {
              // Track user properties
              const properties = eventNameOrConfig || {};
              if (properties.user_id) {
                mixpanel.identify(properties.user_id);
              }
              if (Object.keys(properties).length > 0) {
                mixpanel.people.set(properties);
                console.log('Synced GA user properties to Mixpanel:', properties);
              }
            }
          } catch (error) {
            console.error('Error syncing to Mixpanel:', error);
          }
        };

        console.log('Google Analytics -> Mixpanel sync enabled');
      }
    };

    // Try to setup immediately
    setupGtagInterceptor();

    // Also try after a short delay in case gtag loads later
    const timeout = setTimeout(setupGtagInterceptor, 1000);

    return () => {
      clearTimeout(timeout);
      // Restore original gtag on cleanup
      if (window.originalGtag) {
        window.gtag = window.originalGtag;
      }
    };
  }, []);

  return null;
}

