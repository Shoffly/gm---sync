'use client';

import { useEffect } from 'react';
import mixpanel from '@/lib/mixpanel';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    originalGtag?: (...args: any[]) => void;
  }
}

// Extract Google Analytics cookies and IDs
function getGoogleAnalyticsIds() {
  if (typeof document === 'undefined') return {
    ga_client_id: null,
    ga_cookie: null,
    ga_session_id: null,
    gclid: null,
    ga_cookies: {},
  };
  
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return {
    // GA Client ID from _ga cookie (format: GA1.1.xxxxx.xxxxx)
    ga_client_id: cookies['_ga']?.split('.').slice(2).join('.') || null,
    ga_cookie: cookies['_ga'] || null,
    
    // GA Session ID
    ga_session_id: cookies['_ga_6XGH4BVL74'] || null,
    
    // Google Ads User ID (if available)
    gclid: cookies['_gcl_au'] || null,
    
    // All GA-related cookies
    ga_cookies: Object.keys(cookies)
      .filter(key => key.startsWith('_ga') || key.startsWith('_gcl'))
      .reduce((acc, key) => {
        acc[key] = cookies[key];
        return acc;
      }, {} as Record<string, string>),
  };
}

// Get comprehensive device and browser properties
function getEnhancedProperties() {
  if (typeof window === 'undefined') return {
    ga_client_id: null,
    ga_cookie: null,
    ga_session_id: null,
    gclid: null,
    ga_cookies: {},
    ga_measurement_id: 'G-6XGH4BVL74',
    screen_width: 0,
    screen_height: 0,
    viewport_width: 0,
    viewport_height: 0,
    pixel_ratio: 1,
    color_depth: 24,
    user_agent: '',
    language: '',
    languages: '',
    platform: '',
    vendor: '',
    connection_type: null,
    connection_downlink: null,
    connection_rtt: null,
    connection_save_data: null,
    device_memory: null,
    hardware_concurrency: 0,
    timezone: '',
    timezone_offset: 0,
    timestamp: Date.now(),
    page_url: '',
    page_path: '',
    page_search: '',
    page_hash: '',
    page_host: '',
    page_protocol: '',
    page_title: '',
    referrer: '',
    touch_support: false,
    max_touch_points: 0,
    cookies_enabled: false,
    local_storage_available: false,
    session_storage_available: false,
    online: false,
    random_id: 0,
  };
  
  const gaIds = getGoogleAnalyticsIds();
  
  return {
    // Google Analytics IDs - THE IMPORTANT ONES YOU REQUESTED
    ...gaIds,
    ga_measurement_id: 'G-6XGH4BVL74',
    
    // Screen & Viewport
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    pixel_ratio: window.devicePixelRatio,
    color_depth: window.screen.colorDepth,
    
    // Browser Info
    user_agent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages?.join(','),
    platform: navigator.platform,
    vendor: navigator.vendor,
    
    // Connection Info (if available)
    connection_type: (navigator as any).connection?.effectiveType,
    connection_downlink: (navigator as any).connection?.downlink,
    connection_rtt: (navigator as any).connection?.rtt,
    connection_save_data: (navigator as any).connection?.saveData,
    
    // Device Memory & CPU (if available)
    device_memory: (navigator as any).deviceMemory,
    hardware_concurrency: navigator.hardwareConcurrency,
    
    // Time & Timezone
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezone_offset: new Date().getTimezoneOffset(),
    timestamp: Date.now(),
    
    // Page Info
    page_url: window.location.href,
    page_path: window.location.pathname,
    page_search: window.location.search,
    page_hash: window.location.hash,
    page_host: window.location.host,
    page_protocol: window.location.protocol,
    page_title: document.title,
    referrer: document.referrer,
    
    // Touch Support
    touch_support: 'ontouchstart' in window,
    max_touch_points: navigator.maxTouchPoints,
    
    // Storage
    cookies_enabled: navigator.cookieEnabled,
    local_storage_available: (() => {
      try {
        return typeof localStorage !== 'undefined';
      } catch { return false; }
    })(),
    session_storage_available: (() => {
      try {
        return typeof sessionStorage !== 'undefined';
      } catch { return false; }
    })(),
    
    // Online Status
    online: navigator.onLine,
    
    // Random ID (like GA's random parameter)
    random_id: Math.floor(Math.random() * 2147483647),
  };
}

export default function AnalyticsSync() {
  useEffect(() => {
    // Get and register enhanced properties on load
    const enhancedProps = getEnhancedProperties();
    
    // Register as super properties (sent with every event)
    mixpanel.register(enhancedProps);
    
    // Update user profile with persistent properties
    mixpanel.people.set({
      $browser: navigator.userAgent,
      $browser_language: navigator.language,
      $screen_height: window.screen.height,
      $screen_width: window.screen.width,
      $timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ga_client_id: enhancedProps.ga_client_id,
      ga_measurement_id: enhancedProps.ga_measurement_id,
      last_seen: new Date().toISOString(),
    });
    
    console.log('📊 Enhanced properties registered with Mixpanel:', enhancedProps);
    
    // Setup gtag interceptor
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
            const currentProps = getEnhancedProperties(); // Get fresh props including updated cookies

            if (command === 'event') {
              // Track Google Analytics events in Mixpanel
              const eventName = eventNameOrConfig;
              const properties = eventParams || {};
              
              mixpanel.track(`GA: ${eventName}`, {
                ...currentProps, // Include ALL enhanced properties
                ...properties,
                source: 'google_analytics',
              });
              
              console.log('✅ Synced GA event to Mixpanel:', eventName, {
                ga_ids: currentProps.ga_cookies,
                properties
              });
            } else if (command === 'config') {
              // Track page views
              const config = eventParams || {};
              mixpanel.track('Page View', {
                ...currentProps, // Include ALL enhanced properties
                page_path: config.page_path,
                page_location: config.page_location,
                page_title: config.page_title,
                ...config,
                source: 'google_analytics',
              });
              
              console.log('✅ Synced GA page view to Mixpanel:', {
                ga_ids: currentProps.ga_cookies,
                config
              });
            } else if (command === 'set') {
              // Track user properties
              const properties = eventNameOrConfig || {};
              if (properties.user_id) {
                mixpanel.identify(properties.user_id);
              }
              if (Object.keys(properties).length > 0) {
                mixpanel.people.set({
                  ...properties,
                  ...currentProps.ga_cookies, // Include GA IDs in user profile
                });
                console.log('✅ Synced GA user properties to Mixpanel:', properties);
              }
            }
          } catch (error) {
            console.error('❌ Error syncing to Mixpanel:', error);
          }
        };

        console.log('🔄 Google Analytics -> Mixpanel sync enabled');
      }
    };

    // Try to setup immediately
    setupGtagInterceptor();

    // Also try after a short delay in case gtag loads later
    const timeout = setTimeout(setupGtagInterceptor, 1000);
    
    // Refresh GA IDs periodically (they might update)
    const intervalId = setInterval(() => {
      const freshProps = getEnhancedProperties();
      mixpanel.register(freshProps);
    }, 10000); // Every 10 seconds

    return () => {
      clearTimeout(timeout);
      clearInterval(intervalId);
      // Restore original gtag on cleanup
      if (window.originalGtag) {
        window.gtag = window.originalGtag;
      }
    };
  }, []);

  return null;
}

