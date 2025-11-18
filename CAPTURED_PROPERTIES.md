# All Captured Properties in Mixpanel

This document lists ALL properties that are now being sent to Mixpanel with every event.

## 🔑 Google Analytics IDs (The Important Ones!)

These are the Google Analytics tracking IDs that you specifically requested:

| Property | Description | Example |
|----------|-------------|---------|
| `ga_client_id` | **GA Client ID** - Unique user identifier from `_ga` cookie | `1234567890.9876543210` |
| `ga_cookie` | Full `_ga` cookie value | `GA1.1.1234567890.9876543210` |
| `ga_session_id` | GA4 session identifier from `_ga_MEASUREMENT_ID` cookie | `GS1.1.1763456400` |
| `gclid` | **Google Ads Click ID** from `_gcl_au` cookie (equivalent to `auid`) | `1.1.1957503899.1756996546` |
| `ga_cookies` | Object containing ALL GA-related cookies (`_ga`, `_ga_*`, `_gcl_*`) | `{_ga: "...", _gcl_au: "..."}` |
| `ga_measurement_id` | Your GA4 Measurement ID | `G-6XGH4BVL74` |

### Mapping to Your Requested Properties:
- ✅ **cid** (Client ID) → `ga_client_id`
- ✅ **auid** (Ads User ID) → `gclid` 
- ✅ **gauid** → `ga_client_id` + `ga_session_id`
- ✅ **cv** (Cookie Version) → Extracted from `ga_cookie`
- ✅ **gtm** (GTM Container ID) → Captured in `ga_measurement_id`

## 📱 Device & Screen Properties

| Property | Description | Example |
|----------|-------------|---------|
| `screen_width` | Screen width in pixels (like GA's `u_w`) | `1920` |
| `screen_height` | Screen height in pixels (like GA's `u_h`) | `1080` |
| `viewport_width` | Browser viewport width | `1200` |
| `viewport_height` | Browser viewport height | `800` |
| `pixel_ratio` | Device pixel ratio (retina displays = 2) | `2` |
| `color_depth` | Screen color depth in bits | `24` |
| `device_memory` | Device RAM in GB (if available) | `8` |
| `hardware_concurrency` | Number of CPU cores | `8` |
| `touch_support` | Whether device supports touch | `false` |
| `max_touch_points` | Maximum simultaneous touch points | `0` |

## 🌐 Browser & Platform

| Property | Description | Example |
|----------|-------------|---------|
| `user_agent` | Full user agent string (like GA's `uaa`) | `Mozilla/5.0...` |
| `language` | Browser language | `en-US` |
| `languages` | All supported languages | `en-US,en,ar` |
| `platform` | Operating system (like GA's `uap`) | `MacIntel` / `Android` |
| `vendor` | Browser vendor | `Google Inc.` |
| `cookies_enabled` | Whether cookies are enabled | `true` |
| `online` | Whether browser is online | `true` |

## 🌍 Location & Time

| Property | Description | Example |
|----------|-------------|---------|
| `timezone` | User's timezone | `Africa/Cairo` |
| `timezone_offset` | Offset from UTC in minutes | `-120` |
| `timestamp` | Current timestamp in milliseconds | `1763458094322` |
| `random_id` | Random identifier (like GA's `random`) | `1529950305` |

## 📄 Page Information

| Property | Description | Example |
|----------|-------------|---------|
| `page_url` | Full page URL (like GA's `url`) | `http://localhost:3001/` |
| `page_path` | URL path | `/` |
| `page_search` | Query string | `?utm_source=google` |
| `page_hash` | URL hash | `#section` |
| `page_host` | Hostname | `localhost:3001` |
| `page_protocol` | Protocol | `http:` |
| `page_title` | Page title (like GA's `tiba`) | `Create Next App` |
| `referrer` | Previous page URL | `https://google.com` |

## 🌐 Connection Quality

| Property | Description | Example |
|----------|-------------|---------|
| `connection_type` | Network type | `4g` |
| `connection_downlink` | Download speed in Mbps | `10` |
| `connection_rtt` | Round-trip time in ms | `50` |
| `connection_save_data` | Data saver mode enabled | `false` |

## 💾 Storage Availability

| Property | Description | Example |
|----------|-------------|---------|
| `local_storage_available` | Can use localStorage | `true` |
| `session_storage_available` | Can use sessionStorage | `true` |

## 🎯 Tracking Metadata

| Property | Description | Example |
|----------|-------------|---------|
| `source` | Where the event came from | `google_analytics` |

## 📊 How Properties Are Used

### 1. **Super Properties** (Sent with Every Event)
All properties above are registered as "super properties" and automatically included with every Mixpanel event.

### 2. **User Profile Properties**
These are also saved to the user's Mixpanel profile:
- `$browser` → User agent
- `$browser_language` → Browser language
- `$screen_height` / `$screen_width` → Screen dimensions
- `$timezone` → User timezone
- `ga_client_id` → Google Analytics Client ID
- `ga_measurement_id` → GA4 Measurement ID
- `last_seen` → Last activity timestamp

### 3. **Auto-Refresh**
GA cookies are refreshed every 10 seconds to capture any updates.

## 🔍 How to View in Mixpanel

1. Go to your Mixpanel dashboard
2. Select any event (e.g., "Page View" or "GA: button_click")
3. Click on "Properties"
4. You'll see ALL these properties for each event!

## 🧪 Testing

Open browser console and run:

```javascript
// See all properties that will be sent
console.log(mixpanel.get_property());

// Track a test event with all properties
window.gtag('event', 'test_event', { test_param: 'hello' });

// Check Mixpanel - you'll see the event with ALL properties above!
```

## 📝 Notes

- Properties marked with ⚠️ may be `null` or `undefined` if not available on the device/browser
- All GA cookie IDs are automatically extracted and synced
- Connection quality properties require a modern browser
- Device memory/CPU info may not be available on all devices

