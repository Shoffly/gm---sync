# Analytics Setup Guide

This Next.js project is configured with Mixpanel and Google Analytics.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Mixpanel Configuration
# Get your token from https://mixpanel.com/project/settings
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token_here

# Google Analytics Configuration
# Get your Measurement ID from https://analytics.google.com/
# Format: G-XXXXXXXXXX
NEXT_PUBLIC_GA_ID=your_google_analytics_id_here
```

## How to Use

### Mixpanel

Import and use Mixpanel in any client component:

```tsx
'use client';

import mixpanel from '@/lib/mixpanel';

// Track an event
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

### Google Analytics

Google Analytics is automatically initialized when `NEXT_PUBLIC_GA_ID` is set. It will track page views automatically.

For custom events, you can use the `gtag` function:

```tsx
'use client';

declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

// Track an event
window.gtag('event', 'button_click', {
  button_name: 'Deploy Now',
});
```

## Running the Project

```bash
npm run dev
```

The project will be available at http://localhost:3000

