# Midway Backend - Setup Guide

## Prerequisites

Before running the application, ensure you have the following installed:

1. **Python 3.10+**
2. **python3-venv** (for virtual environments)
3. **PostgreSQL** (or use SQLite for development)

## Step 1: Install System Dependencies

On Ubuntu/Debian systems:

```bash
sudo apt update
sudo apt install python3-venv python3-pip
```

## Step 2: Create Virtual Environment

```bash
cd /home/ajvkam/Documents/MeetUpIO/MeetUpIO
python3 -m venv venv
```

## Step 3: Activate Virtual Environment

```bash
source venv/bin/activate
```

## Step 4: Install Python Dependencies

```bash
pip install -r requirements.txt
```

## Step 5: Configure Environment Variables

Create a `.env` file (already created) or copy from `.env.example`:

```bash
cp .env.example .env
```

For development with SQLite (no PostgreSQL needed):
- The `.env` file is already configured with SQLite
- Database file will be created automatically as `midway.db`

For production with PostgreSQL:
- Update `DATABASE_URL` in `.env` to:
  ```
  DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/midway
  ```

## Step 6: Run the Application

```bash
uvicorn main:app --reload --port 8000
```

The server will start on `http://localhost:8000`

## Step 7: Access API Documentation

Open your browser and navigate to:
- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Testing the API

### 1. Create an Event

```bash
curl -X POST http://localhost:8000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Friday Dinner",
    "window_start": "2026-01-17T18:00:00",
    "window_end": "2026-01-17T22:00:00"
  }'
```

Save the `slug` from the response!

### 2. Add First Participant

```bash
curl -X POST http://localhost:8000/api/events/{slug}/join \
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
  }'
```

### 3. Add Second Participant

```bash
curl -X POST http://localhost:8000/api/events/{slug}/join \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob",
    "location_name": "Indiranagar",
    "availabilities": [
      {
        "start_time": "2026-01-17T19:30:00",
        "end_time": "2026-01-17T21:30:00"
      }
    ]
  }'
```

### 4. Get Results (The Magic!)

```bash
curl http://localhost:8000/api/events/{slug}/results
```

You should see:
- **Suggested Time**: 19:30 - 21:00 (overlap window)
- **Suggested Location**: Centroid between Whitefield and Indiranagar
- **Venue Recommendations**: 3 restaurants

## Project Structure

```
MeetUpIO/
├── app/
│   ├── core/           # Configuration & database
│   │   ├── config.py   # Settings management
│   │   └── db.py       # Async database connection
│   ├── models/         # SQLModel database tables
│   │   ├── event.py
│   │   ├── participant.py
│   │   └── availability.py
│   ├── schemas/        # Pydantic request/response models
│   │   ├── event.py
│   │   ├── participant.py
│   │   └── results.py
│   ├── routers/        # API endpoints
│   │   └── events.py
│   └── services/       # Business logic
│       ├── algorithm_service.py    # Centroid & time overlap
│       └── mock_geo_service.py     # Geocoding (Bengaluru)
├── main.py             # Application entry point
├── requirements.txt    # Python dependencies
├── .env               # Environment variables
└── .env.example       # Environment template

## Supported Bengaluru Locations (Mock Geocoding)

The mock geocoding service supports these locations:
- Whitefield, Indiranagar, Koramangala
- MG Road, JP Nagar, HSR Layout
- Malleshwaram, Electronic City, Jayanagar
- BTM Layout, Yeshwanthpur, Hebbal
- Banashankari, Rajajinagar, Majestic
- Yelahanka, Marathahalli, KR Puram

## Next Steps (Future Enhancements)

1. **Database Migrations**: Set up Alembic for schema versioning
2. **Real Geocoding**: Integrate Google Maps or Mapbox API
3. **Venue API**: Integrate Google Places for real restaurant recommendations
4. **Authentication**: Add optional user accounts
5. **Frontend**: Build a React/Next.js frontend
6. **Deployment**: Deploy to production (Railway, Render, or AWS)

## Troubleshooting

**Issue**: `ModuleNotFoundError: No module named 'fastapi'`
- **Solution**: Make sure virtual environment is activated and dependencies are installed

**Issue**: Database connection errors
- **Solution**: Check DATABASE_URL in .env file. For development, use SQLite (default)

**Issue**: Port 8000 already in use
- **Solution**: Use a different port: `uvicorn main:app --reload --port 8001`
