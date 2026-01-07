# Rail Data Marketplace API Integration Guide

## Overview

This guide documents how to integrate with the Rail Data Marketplace API for live UK train departure information, based on our ByTheWey "Next Train" feature implementation.

## API Setup

### 1. Get Your API Key

1. Sign up at [Rail Data Marketplace](https://raildata.org.uk)
2. Subscribe to the **Live Departure Boards Web Service (LDBWS)**
3. Get your API key from your account dashboard

### 2. Authentication

The API uses a simple header-based authentication:

```typescript
headers: {
  'x-apikey': 'YOUR_API_KEY_HERE',
  'Accept': 'application/json'
}
```

**Important:** Never expose this key in client-side code. Use a backend proxy (like Supabase Edge Functions).

## API Endpoint

```
GET https://api1.raildata.org.uk/1010-live-departure-board-dep1_2/LDBWS/api/20220120/GetDepBoardWithDetails/{CRS_CODE}
```

### Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `CRS_CODE` | string | Station CRS code (path param) | `WYB` (Weybridge) |
| `numRows` | number | Max number of services to return | `9` |
| `filterCrs` | string | Filter by destination CRS code | `WAT` (Waterloo) |
| `filterType` | string | Filter type: `to` or `from` | `to` |
| `timeOffset` | number | Minutes from now to start search | `0` |
| `timeWindow` | number | Time window in minutes | `120` |

### Example Request

```typescript
const params = new URLSearchParams({
  numRows: '9',
  filterCrs: 'WAT',
  filterType: 'to',
  timeOffset: '0',
  timeWindow: '120'
});

const response = await fetch(
  `https://api1.raildata.org.uk/1010-live-departure-board-dep1_2/LDBWS/api/20220120/GetDepBoardWithDetails/WYB?${params}`,
  {
    headers: {
      'x-apikey': apiKey,
      'Accept': 'application/json'
    }
  }
);
```

## Response Structure

### Key Properties

```typescript
{
  "trainServices": [
    {
      "std": "22:43",                    // Scheduled departure time
      "etd": "On time",                  // Expected departure (or time)
      "platform": "2",
      "operator": "South Western Railway",
      "operatorCode": "SW",
      "isCancelled": false,
      "serviceID": "unique_id",

      "destination": [
        {
          "locationName": "London Waterloo",
          "crs": "WAT"
        }
      ],

      "subsequentCallingPoints": [       // ⚠️ Direct array, not .service!
        {
          "callingPoint": [               // ⚠️ Can be single object or array!
            {
              "locationName": "Surbiton",
              "crs": "SUR",
              "st": "22:56",             // Scheduled arrival time
              "et": "On time",           // Expected arrival
              "at": null                 // Actual arrival (when arrived)
            },
            {
              "locationName": "London Waterloo",
              "crs": "WAT",
              "st": "23:22",
              "et": "On time"
            }
          ]
        }
      ]
    }
  ],
  "generatedAt": "2026-01-07T22:29:05.4544373+00:00",
  "locationName": "Weybridge",
  "crs": "WYB",
  "platformAvailable": true,
  "areServicesAvailable": true
}
```

## Critical Data Structure Quirks

### ⚠️ Issue #1: `trainServices` is a Direct Array

**Wrong assumption:**
```typescript
const services = payload.trainServices.service;  // ❌ .service doesn't exist!
```

**Correct approach:**
```typescript
const services = payload.trainServices;  // ✅ It's already an array
```

**Solution:** Always add fallbacks:
```typescript
const getServices = (payload) => {
  const root = payload?.GetStationBoardResult;
  const services = root?.trainServices?.service
    ?? payload?.trainServices?.service
    ?? payload?.trainServices;  // ✅ Fallback to direct array

  return Array.isArray(services) ? services : [services];
};
```

### ⚠️ Issue #2: `subsequentCallingPoints` has no `.callingPointList`

**Wrong assumption:**
```typescript
const callingPoints = service.subsequentCallingPoints.callingPointList;  // ❌
```

**Correct approach:**
```typescript
const callingPoints = service.subsequentCallingPoints;  // ✅ Direct access
```

### ⚠️ Issue #3: Nested Arrays Can Be Single Objects

The API sometimes returns single objects instead of arrays:

```typescript
// Could be an array:
"callingPoint": [{ ... }, { ... }]

// Or a single object:
"callingPoint": { ... }
```

**Solution:** Always normalize to arrays:
```typescript
const toArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};
```

## Finding Destination Arrival Times

To calculate journey duration, you need to find the destination station in `subsequentCallingPoints`:

```typescript
const findCallingPoint = (callingPointLists, destinationCRS) => {
  // Normalize to array
  const lists = Array.isArray(callingPointLists)
    ? callingPointLists
    : [callingPointLists];

  for (const list of lists) {
    // Normalize callingPoint to array
    const points = Array.isArray(list?.callingPoint)
      ? list.callingPoint
      : [list?.callingPoint];

    // Find matching CRS code
    const match = points.find(point => point?.crs === destinationCRS);
    if (match) return match;
  }

  return null;
};

// Usage:
const destination = findCallingPoint(
  service.subsequentCallingPoints,
  'WAT'
);

const arrivalTime = destination?.st;  // e.g., "23:22"
```

## Calculating Journey Duration

```typescript
const parseTimeToMinutes = (timeString) => {
  if (!timeString || !/^\d{1,2}:\d{2}$/.test(timeString)) return null;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

const calculateDuration = (departureTime, arrivalTime) => {
  const depMins = parseTimeToMinutes(departureTime);
  const arrMins = parseTimeToMinutes(arrivalTime);

  if (depMins === null || arrMins === null) return null;

  let diff = arrMins - depMins;
  if (diff < 0) diff += 24 * 60;  // Handle overnight journeys

  return diff;
};

// Example:
const duration = calculateDuration("22:43", "23:22");  // 39 minutes
```

## Time Values: Expected vs Actual

```typescript
// For departures:
service.std  // Scheduled departure time (always present)
service.etd  // Expected departure: "On time", "Delayed", or time like "22:45"

// For arrivals at calling points:
callingPoint.st  // Scheduled time
callingPoint.et  // Expected time or "On time"
callingPoint.at  // Actual time (only when train has arrived)

// Best practice: Use expected if available, fall back to actual:
const bestArrivalTime = callingPoint.et ?? callingPoint.at ?? callingPoint.st;
```

## Filtering Fast Trains

```typescript
const filterFastTrains = (services, maxDurationMinutes = 40) => {
  return services
    .map(service => {
      const departure = service.std;
      const destination = findCallingPoint(service.subsequentCallingPoints, 'WAT');
      const arrival = destination?.st;
      const duration = calculateDuration(departure, arrival);

      return { ...service, duration, arrival };
    })
    .filter(service => service.duration !== null && service.duration <= maxDurationMinutes)
    .sort((a, b) => a.duration - b.duration);
};
```

## Handling "On time" Text

The API returns `"On time"` as a string for `etd` and `et` fields:

```typescript
const formatExpectedTime = (scheduled, expected) => {
  if (!expected || expected === 'On time') {
    return scheduled;
  }
  // Could also be "Delayed", "Cancelled", or actual time
  return expected;
};
```

## Common CRS Codes

- `WYB` - Weybridge
- `WAT` - London Waterloo
- `SUR` - Surbiton
- `WIM` - Wimbledon
- `CLJ` - Clapham Junction
- `VXH` - Vauxhall

Find more at: [National Rail CRS Codes](https://www.nationalrail.co.uk/stations_destinations/48541.aspx)

## Supabase Edge Function Setup

### 1. Create Edge Function

```bash
supabase functions new next-train
```

### 2. Set API Key Secret

```bash
supabase secrets set RAILDATA_X_APIKEY="your-key-here"
```

Or via Supabase Dashboard:
**Project Settings → Edge Functions → Secrets**

### 3. Deploy

```bash
supabase functions deploy next-train
```

### 4. Call from Client

```typescript
const { data, error } = await supabase.functions.invoke('next-train', {
  body: {
    origin: 'WYB',
    destination: 'WAT',
    maxDurationMins: 40,
    timeWindowMins: 120
  }
});
```

## Example: Notification System

For your notification project, here's a basic structure:

```typescript
// Check every 5 minutes for next fast train
setInterval(async () => {
  const { data } = await supabase.functions.invoke('next-train', {
    body: {
      origin: 'WYB',
      destination: 'WAT',
      maxDurationMins: 30,  // Only "fast" trains
      timeWindowMins: 60     // Check next hour
    }
  });

  if (data?.next) {
    const train = data.next;
    const departureIn = calculateMinutesUntil(train.std);

    if (departureIn <= 10 && departureIn > 0) {
      // Send notification
      sendNotification({
        title: `Fast train in ${departureIn} mins`,
        body: `${train.std} from Platform ${train.platform} (${train.scheduledDurationMins}min journey)`
      });
    }
  }
}, 5 * 60 * 1000);

function calculateMinutesUntil(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const targetMinutes = hours * 60 + minutes;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  let diff = targetMinutes - nowMinutes;
  if (diff < 0) diff += 24 * 60;  // Next day

  return diff;
}
```

## Testing

Use Postman or curl to test the raw API:

```bash
curl -X GET \
  'https://api1.raildata.org.uk/1010-live-departure-board-dep1_2/LDBWS/api/20220120/GetDepBoardWithDetails/WYB?numRows=9&filterCrs=WAT&filterType=to&timeOffset=0&timeWindow=120' \
  -H 'x-apikey: YOUR_KEY' \
  -H 'Accept: application/json'
```

## Debugging Tips

1. **Check Supabase function logs:** Dashboard → Functions → Logs
2. **Add console.log statements** to see parsed data
3. **Verify API key is set:** Check edge function secrets
4. **Test during peak hours:** Late night services may be limited
5. **Watch for data structure changes:** Always use optional chaining (`?.`)

## Rate Limits

- **Free tier:** Check your Rail Data Marketplace plan
- **Recommendation:** Cache responses for 30-60 seconds
- **Best practice:** Don't poll faster than every 20 seconds

## Gotchas & Lessons Learned

1. ✅ **Always normalize arrays** - API returns single objects OR arrays
2. ✅ **Use optional chaining everywhere** - Data can be missing
3. ✅ **Handle "On time" text** - It's a string, not a time
4. ✅ **Secure API keys server-side** - Never expose in client code
5. ✅ **Test with real data** - Response structure varies by time of day
6. ✅ **Handle overnight journeys** - Duration calculation needs modulo 24h

## Reference Implementation

See the complete working code in this repository:
- Edge Function: `/supabase/functions/next-train/index.ts`
- React Component: `/src/pages/NextTrain.jsx`

## Support

- [Rail Data Marketplace Documentation](https://raildata.org.uk/docs)
- [National Rail Enquiries](https://www.nationalrail.co.uk/)
- [CRS Code Lookup](https://www.nationalrail.co.uk/stations_destinations/48541.aspx)
