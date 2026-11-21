"""
SkyCast Weather Forecast - Backend Configuration
"""
import os

class Config:
    # Server port & host
    PORT = int(os.environ.get("SKYCAST_PORT", 5000))
    HOST = os.environ.get("SKYCAST_HOST", "127.0.0.1")
    DEBUG = os.environ.get("SKYCAST_DEBUG", "False").lower() in ("true", "1", "t")

    # Open-Meteo Endpoints
    OPEN_METEO_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
    OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
    OPEN_METEO_AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"

    # Timeouts (seconds)
    REQUEST_TIMEOUT = 5.0

    # Cache TTLs (seconds)
    WEATHER_CACHE_TTL = 600      # 10 minutes
    GEOCODING_CACHE_TTL = 86400  # 24 hours
