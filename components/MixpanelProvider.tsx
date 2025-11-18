'use client';

import { useEffect } from 'react';
import mixpanel from '@/lib/mixpanel';

export default function MixpanelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Mixpanel is initialized in lib/mixpanel.ts
    // You can add any additional initialization logic here
    if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      console.log('Mixpanel initialized');
    }
  }, []);

  return <>{children}</>;
}

