# Analytics Setup Guide

This Next.js project is configured with **Mixpanel** and **Google Analytics 4** with **automatic event syncing**.

## 🔄 Automatic Sync Feature

All Google Analytics events are **automatically forwarded to Mixpanel**! When you track an event with `gtag()`, it will be sent to both platforms:

- **Google Analytics**: Original event tracking
- **Mixpanel**: Same event with `GA:` prefix and `source: 'google_analytics'` property

## Configuration

Your analytics are already configured with:
- **Mixpanel Token**: `b6171b0def7259325e6f2d3181df6d96`
- **Google Analytics ID**: `G-6XGH4BVL74`

No additional environment variables needed!

## How to Use

### Option 1: Track with Google Analytics (Recommended - Auto-syncs to Mixpanel!)

```tsx
'use client';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Track an event - goes to BOTH GA and Mixpanel automatically!
window.gtag('event', 'button_click', {
  button_name: 'Deploy Now',
  page: 'home',
  value: 1,
});

// Track page view
window.gtag('config', 'G-6XGH4BVL74', {
  page_path: '/custom-page',
  page_title: 'Custom Page',
});

// Set user ID
window.gtag('set', {
  user_id: 'user-123',
  user_type: 'premium',
});
```

### Option 2: Track Directly to Mixpanel Only

```tsx
'use client';

import mixpanel from '@/lib/mixpanel';

// Track an event (Mixpanel only)
mixpanel.track('Event Name', {
  property1: 'value1',
  property2: 'value2',
});

// Identify a user
mixpanel.identify('user-id-123');

// Set user properties
mixpanel.people.set({
  name: 'John Doe',
  email: 'john@example.com',
});
```

## What Gets Synced to Mixpanel?

When you use Google Analytics `gtag()`, the following are automatically synced:

1. **Custom Events** (`gtag('event', ...)`)
   - Synced as: `GA: {event_name}`
   - All event parameters are included
   - Added property: `source: 'google_analytics'`

2. **Page Views** (`gtag('config', ...)`)
   - Synced as: `Page View`
   - Includes: `page_path`, `page_location`, `page_title`

3. **User Properties** (`gtag('set', ...)`)
   - Synced to Mixpanel user profile
   - Automatically identifies user if `user_id` is set

## Running the Project

```bash
npm run dev
```

The project will be available at http://localhost:3000

