# How Google Analytics → Mixpanel Sync Works

## Architecture

```
Your Code
   ↓
window.gtag('event', 'button_click', {...})
   ↓
AnalyticsSync Component (Interceptor)
   ├─→ Google Analytics (original gtag)
   └─→ Mixpanel (via mixpanel.track)
```

## The Magic: AnalyticsSync Component

Located at: `components/AnalyticsSync.tsx`

This component:
1. **Intercepts** all `gtag()` calls by wrapping the original function
2. **Forwards** the original call to Google Analytics (no disruption)
3. **Translates** and sends the same data to Mixpanel

## Example Flow

### When you call:
```javascript
window.gtag('event', 'purchase', {
  transaction_id: 'T12345',
  value: 99.99,
  currency: 'USD',
  items: ['Product A']
});
```

### What happens:
1. ✅ **Google Analytics** receives: `purchase` event with all properties
2. ✅ **Mixpanel** receives: `GA: purchase` event with:
   ```javascript
   {
     transaction_id: 'T12345',
     value: 99.99,
     currency: 'USD',
     items: ['Product A'],
     source: 'google_analytics'  // Added automatically
   }
   ```

## Benefits

1. **No Code Duplication**: Write tracking once with `gtag()`, get it in both platforms
2. **Consistent Data**: Same event properties in both systems
3. **Easy Migration**: Already using GA? Get Mixpanel data instantly
4. **Dual Insights**: Use GA for web analytics, Mixpanel for product analytics

## Event Mapping

| Google Analytics | Mixpanel |
|-----------------|----------|
| `gtag('event', 'button_click', {...})` | `GA: button_click` event |
| `gtag('config', 'G-XXX', {page_path: '/home'})` | `Page View` event |
| `gtag('set', {user_id: '123'})` | `mixpanel.identify('123')` |

## Console Logs

Check your browser console for confirmation:
```
✓ Google Analytics -> Mixpanel sync enabled
✓ Synced GA event to Mixpanel: button_click {...}
✓ Synced GA page view to Mixpanel: {...}
```

## Try It Now!

1. Open your browser console
2. Visit http://localhost:3000
3. Click the "Deploy Now" button
4. Watch the console logs showing sync in action
5. Check both GA and Mixpanel dashboards - same events! 🎉

