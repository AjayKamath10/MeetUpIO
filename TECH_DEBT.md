# MeetUpIO — Tech Debt & Future Upgrades

A living document tracking known limitations, shortcuts, and planned improvements.

---

## 🗓️ Recommended Venues

### Current State (V3 — Google Places API)
Venue recommendations are fetched live from Google Places Nearby Search using the computed geographic centroid of all participants. Fields returned: `name`, `type`, `description`, `estimated_price`, `address`, `rating`, `maps_url`.

---

### 🔵 V4 — Event-Context-Aware Recommendations

**What it is:**  
Factor in *what kind of event it is* (birthday, team outing, casual catch-up) and participant preferences (price range, vibe) when selecting venues, rather than just geography.

**How to implement:**
1. Add `event_type` (enum: `social`, `work`, `celebration`, `date`, `casual`) to `EventCreate` schema and `Event` model.
2. Map `event_type` → Google Places `type` filter (e.g., `social` → `bar`, `work` → `cafe`, `celebration` → `restaurant`).
3. Optionally pass `event_type` as a keyword to Places Text Search for richer filtering.
4. Add a `price_range` preference (1–4) to the join form so the centroid query respects group budget.

**Context already available:**
- Centroid `(lat, lng)` is already computed in `get_results` in `app/routers/events.py`
- `VenueRecommendation` schema is extendable
- The `Event` model is in `app/models/event.py`

**Files to change:**
- `app/models/event.py` — add `event_type`, `price_range` fields
- `app/schemas/event.py` — update `EventCreate` and `EventResponse`
- `app/routers/events.py` — pass type/price to `places_service`
- `app/services/places_service.py` — add type/price params to Places call
- `frontend/app/page.tsx` (create event form) — add event type selector

---

### 🔴 V5 — LLM-Curated Venue Summaries

**What it is:**  
Use Gemini (or another LLM) to generate a short, contextual summary for each venue — e.g., *"Perfect for a casual birthday — loud music and shareable platters make this a crowd favourite."*

**How to implement:**
1. After fetching venues from Places API, send venue details + `event_type` to Gemini API.
2. Prompt: `"Given this JSON of venues and event type '{event_type}', write a 1-sentence recommendation for each venue in the context of the event."`
3. Replace or augment `description` field with the AI-generated summary.

**Files to change:**
- `app/services/places_service.py` — add a `enrich_with_llm()` step post-fetch
- `.env.example` — add `GEMINI_API_KEY`

---

## 📍 Suggested Location (Centroid)

### Current State
Uses a **simple arithmetic mean** of participant coordinates (`calculate_centroid` in `app/services/algorithm_service.py`). The label shown is the location name of the *closest participant* to the centroid — not a real area/neighborhood name.

### Known Limitations
- Arithmetic mean is skewed by geographic outliers (one person far away pulls the point significantly)
- The neighborhood label is a participant's area name, not the actual neighborhood at the centroid point

### Future Upgrade: Geometric Median + Reverse Geocoding
1. Replace arithmetic mean with **Weiszfeld's algorithm** (geometric median) — minimizes total travel distance, fairer for outliers.
2. Call **Google Geocoding API** (reverse geocode) on the centroid `(lat, lng)` to get the actual neighborhood/area name.
3. Optionally render a **Google Maps embed** centered on the centroid.

**Files to change:**
- `app/services/algorithm_service.py` — replace `calculate_centroid` with geometric median
- `app/routers/events.py` — call reverse geocode for `neighborhood` label
- `app/services/places_service.py` — add reverse geocoding helper

---

## 🕐 Availability Algorithm

### Current State
`find_overlap` in `app/services/algorithm_service.py` finds the time window where the **maximum number** of participants overlap. Returns the single best window.

### Future Upgrades
- **Multiple windows:** Return ranked top-3 time slots instead of just 1
- **Minimum quorum:** Only suggest a time if ≥ 50% (or configurable %) of participants are free
- **Timezone awareness:** Currently assumes all participants share a timezone; add `timezone` field to `Participant`

**Files to change:**
- `app/services/algorithm_service.py`
- `app/schemas/results.py` — `suggested_time` → `suggested_times: List[SuggestedTime]`

---

## 🧱 Infrastructure / General

| Item | Detail |
|---|---|
| **No auth** | Any user can join any event by slug. Add optional PIN/passcode to event creation |
| **No event expiry** | Events live forever in DB. Add `expires_at` field and a cleanup cron job |
| **No rate limiting** | Results endpoint calls Places API on every request. Add Redis caching keyed on `(slug, centroid)` |
| **Static location data** | `Location` table seeded from a JSON file. Consider integrating a live geocoding API for coverage beyond seeded cities |
| **Frontend error handling** | `alert()` still used in share fallback (`results/page.tsx:55`). Replace with toast notification |
