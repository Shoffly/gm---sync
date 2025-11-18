'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import mixpanel from "@/lib/mixpanel";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    originalGtag?: (...args: any[]) => void;
  }
}

interface EventLog {
  id: string;
  event: string;
  source: 'mixpanel' | 'ga' | 'synced';
  timestamp: Date;
  properties?: any;
}

export default function Home() {
  const [mixpanelId, setMixpanelId] = useState<string>('Loading...');
  const [gaClientId, setGaClientId] = useState<string>('Not detected');
  const [gaSessionId, setGaSessionId] = useState<string>('Not detected');
  const [sessionData, setSessionData] = useState<any>(null);
  const [events, setEvents] = useState<EventLog[]>([]);
  const [stats, setStats] = useState({
    mixpanel: 0,
    ga: 0,
    synced: 0,
  });

  // Get GA IDs from cookies
  const getGAIds = () => {
    if (typeof document === 'undefined') return { clientId: null, sessionId: null };
    
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const gaCookie = cookies['_ga'];
    const clientId = gaCookie ? gaCookie.split('.').slice(2).join('.') : null;
    const sessionId = cookies['_ga_6XGH4BVL74'] || null;
    
    return { clientId, sessionId };
  };

  // Get session data
  const getSessionData = () => {
    if (typeof window === 'undefined') return null;
    
    return {
      screen: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      browser: navigator.userAgent.split(' ').slice(-2).join(' '),
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: navigator.platform,
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
    };
  };

  useEffect(() => {
    // Get Mixpanel distinct_id
    const distinctId = mixpanel.get_distinct_id();
    setMixpanelId(distinctId || 'Not set');

    // Get GA IDs
    const updateGAIds = () => {
      const { clientId, sessionId } = getGAIds();
      setGaClientId(clientId || 'Not detected');
      setGaSessionId(sessionId || 'Not detected');
    };
    updateGAIds();

    // Get session data
    setSessionData(getSessionData());

    // Monitor GA events being synced
    const originalGtag = window.originalGtag || window.gtag;
    if (originalGtag) {
      window.gtag = function (...args: any[]) {
        // Call original
        if (window.originalGtag) {
          window.originalGtag(...args);
        } else if (originalGtag) {
          originalGtag(...args);
        }

        // Track GA events
        const [command, eventNameOrConfig, eventParams] = args;
        if (command === 'event') {
          const eventName = eventNameOrConfig;
          const properties = eventParams || {};
          
          const newEvent: EventLog = {
            id: Date.now().toString(),
            event: eventName,
            source: 'ga',
            timestamp: new Date(),
            properties,
          };
          
          setEvents(prev => [newEvent, ...prev].slice(0, 10));
          setStats(prev => ({ ...prev, ga: prev.ga + 1 }));
        }
      };
    }

    // Monitor Mixpanel events
    const originalTrack = mixpanel.track;
    mixpanel.track = function (eventName: string, properties?: any) {
      const result = originalTrack.call(this, eventName, properties);
      
      // Check if this is a synced GA event
      if (eventName.startsWith('GA: ')) {
        const newEvent: EventLog = {
          id: Date.now().toString(),
          event: eventName,
          source: 'synced',
          timestamp: new Date(),
          properties,
        };
        
        setEvents(prev => [newEvent, ...prev].slice(0, 10));
        setStats(prev => ({ ...prev, synced: prev.synced + 1 }));
      } else {
        // Direct Mixpanel event
        const newEvent: EventLog = {
          id: Date.now().toString(),
          event: eventName,
          source: 'mixpanel',
          timestamp: new Date(),
          properties,
        };
        
        setEvents(prev => [newEvent, ...prev].slice(0, 10));
        setStats(prev => ({ ...prev, mixpanel: prev.mixpanel + 1 }));
      }
      
      return result;
    };

    // Update GA IDs periodically
    const interval = setInterval(() => {
      updateGAIds();
      setSessionData(getSessionData());
    }, 2000);

    return () => {
      clearInterval(interval);
      if (window.originalGtag) {
        window.gtag = window.originalGtag;
      }
    };
  }, []);

  const handleButtonClick = () => {
    // Example: Track with Google Analytics (will auto-sync to Mixpanel)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'button_click', {
        button_name: 'Deploy Now',
        page: 'home',
        value: 1,
      });
    }
    
    // You can also track directly to Mixpanel if needed
    mixpanel.track('Button Clicked', {
      button_name: 'Deploy Now',
      page: 'home',
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-5xl flex-col gap-8 py-16 px-8 bg-white dark:bg-black">
        <div className="flex items-center justify-between">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 mb-4">
              Analytics Sync Test
            </h1>
            <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Real-time tracking of Mixpanel and Google Analytics events
            </p>
          </div>

          {/* User IDs Section */}
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">Your IDs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Mixpanel ID</p>
                <p className="text-sm font-mono text-black dark:text-zinc-50 break-all bg-white dark:bg-zinc-800 p-2 rounded">
                  {mixpanelId}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">GA Client ID</p>
                <p className="text-sm font-mono text-black dark:text-zinc-50 break-all bg-white dark:bg-zinc-800 p-2 rounded">
                  {gaClientId}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">GA Session ID</p>
                <p className="text-sm font-mono text-black dark:text-zinc-50 break-all bg-white dark:bg-zinc-800 p-2 rounded">
                  {gaSessionId}
                </p>
              </div>
            </div>
          </div>

          {/* Session Data Section */}
          {sessionData && (
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">Session Data</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Screen</p>
                  <p className="text-sm font-semibold text-black dark:text-zinc-50">{sessionData.screen}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Viewport</p>
                  <p className="text-sm font-semibold text-black dark:text-zinc-50">{sessionData.viewport}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Language</p>
                  <p className="text-sm font-semibold text-black dark:text-zinc-50">{sessionData.language}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Timezone</p>
                  <p className="text-sm font-semibold text-black dark:text-zinc-50">{sessionData.timezone}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Platform</p>
                  <p className="text-sm font-semibold text-black dark:text-zinc-50">{sessionData.platform}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Online</p>
                  <p className="text-sm font-semibold text-black dark:text-zinc-50">{sessionData.online ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Cookies</p>
                  <p className="text-sm font-semibold text-black dark:text-zinc-50">{sessionData.cookieEnabled ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Section */}
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">Event Statistics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.mixpanel}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Mixpanel Captured</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.ga}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">GA Captured</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.synced}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Synced Both</p>
              </div>
            </div>
          </div>

          {/* Recent Events Section */}
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">Recent Events</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">No events captured yet. Click the button below to generate events.</p>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded border ${
                      event.source === 'mixpanel'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : event.source === 'ga'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            event.source === 'mixpanel'
                              ? 'bg-blue-600 text-white'
                              : event.source === 'ga'
                              ? 'bg-green-600 text-white'
                              : 'bg-purple-600 text-white'
                          }`}
                        >
                          {event.source === 'mixpanel' ? 'MP' : event.source === 'ga' ? 'GA' : 'SYNCED'}
                        </span>
                        <span className="text-sm font-medium text-black dark:text-zinc-50">{event.event}</span>
                      </div>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    {event.properties && Object.keys(event.properties).length > 0 && (
                      <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                        {JSON.stringify(event.properties, null, 2)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col gap-4 text-base font-medium">
            <button
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
              onClick={handleButtonClick}
            >
              <Image
                className="dark:invert"
                src="/vercel.svg"
                alt="Vercel logomark"
                width={16}
                height={16}
              />
              Trigger Event (GA + Mixpanel)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
