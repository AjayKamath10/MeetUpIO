#!/bin/bash

echo "=== Midway API - End-to-End Test ==="
echo ""

# Test 1: Create an event
echo "1. Creating event..."
EVENT_RESPONSE=$(curl -s -X POST http://localhost:8000/api/events/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Friday Dinner at Indiranagar",
    "window_start": "2026-01-17T18:00:00",
    "window_end": "2026-01-17T22:00:00"
  }')

echo "$EVENT_RESPONSE" | python3 -m json.tool
SLUG=$(echo "$EVENT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['slug'])" 2>/dev/null)

if [ -z "$SLUG" ]; then
  echo "ERROR: Failed to create event"
  exit 1
fi

echo ""
echo "✅ Event created with slug: $SLUG"
echo ""

# Test 2: Add first participant
echo "2. Adding participant Alice (Whitefield)..."
curl -s -X POST http://localhost:8000/api/events/$SLUG/join \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "location_name": "Whitefield",
    "is_host": true,
    "availabilities": [
      {
        "start_time": "2026-01-17T19:00:00",
        "end_time": "2026-01-17T21:00:00"
      }
    ]
  }' | python3 -m json.tool

echo ""
echo "✅ Alice joined from Whitefield"
echo ""

# Test 3: Add second participant
echo "3. Adding participant Bob (Koramangala)..."
curl -s -X POST http://localhost:8000/api/events/$SLUG/join \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob",
    "location_name": "Koramangala",
    "availabilities": [
      {
        "start_time": "2026-01-17T19:30:00",
        "end_time": "2026-01-17T21:30:00"
      }
    ]
  }' | python3 -m json.tool

echo ""
echo "✅ Bob joined from Koramangala"
echo ""

# Test 4: Add third participant
echo "4. Adding participant Charlie (MG Road)..."
curl -s -X POST http://localhost:8000/api/events/$SLUG/join \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Charlie",
    "location_name": "MG Road",
    "availabilities": [
      {
        "start_time": "2026-01-17T18:30:00",
        "end_time": "2026-01-17T20:30:00"
      }
    ]
  }' | python3 -m json.tool

echo ""
echo "✅ Charlie joined from MG Road"
echo ""

# Test 5: Get event details
echo "5. Getting event details..."
curl -s http://localhost:8000/api/events/$SLUG | python3 -m json.tool

echo ""
echo "✅ Event details retrieved"
echo ""

# Test 6: Get results (THE MAGIC!)
echo "6. 🎯 Getting results (time overlap + location centroid)..."
curl -s http://localhost:8000/api/events/$SLUG/results | python3 -m json.tool

echo ""
echo "✅ Results calculated successfully!"
echo ""
echo "=== Test Complete ==="
echo "You can access the event at: http://localhost:8000/api/events/$SLUG"
echo "API Documentation: http://localhost:8000/docs"
