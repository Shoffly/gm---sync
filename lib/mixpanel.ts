'use client';

import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel
if (typeof window !== 'undefined') {
  mixpanel.init('b6171b0def7259325e6f2d3181df6d96', {
    autocapture: true,
    record_sessions_percent: 100,
    debug: process.env.NODE_ENV === 'development',
  });
}

export default mixpanel;

