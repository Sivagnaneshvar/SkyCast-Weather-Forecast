"""
Open-Meteo Integration Service
Fetches Weather Forecast, Hourly, Daily and Air Quality data from Open-Meteo APIs,
and transforms them into the exact JSON contract expected by the SkyCast frontend.
"""
import logging
import datetime
import requests
from typing import Dict, Any, Optional
from backend.config import Config
from backend.services.cache_service import weather_cache
from backend.utils.wmo_mapper import map_wmo_code

logger = logging.getLogger(__name__)

# Direction helper
def degree_to_compass(degree: Optional[float]) -> str:
    if degree is None:
        return "N"
    val = int((degree / 22.5) + .5)
    directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    return directions[(val % 16)]

def format_hour_label(iso_time_str: str) -> str:
    """Format ISO timestamp '2026-11-07T14:00' to '2 PM'"""
    try:
        dt = datetime.datetime.fromisoformat(iso_time_str)
        hour = dt.hour
        if hour == 0:
            return "12 AM"
        elif hour < 12:
            return f"{hour} AM"
        elif hour == 12:
            return "12 PM"
        else:
            return f"{hour - 12} PM"
    except Exception:
        return iso_time_str

def format_day_label(iso_date_str: str, index: int) -> Dict[str, str]:
    """Format ISO date '2026-11-07' to { 'day': 'Today' / 'Sun', 'date': 'Nov 7' }"""
    try:
        dt = datetime.date.fromisoformat(iso_date_str)
        day_name = "Today" if index == 0 else dt.strftime("%a")
        date_str = dt.strftime("%b %d").replace(" 0", " ")
        return {"day": day_name, "date": date_str, "weekday": dt.strftime("%a")}
    except Exception:
        return {"day": f"Day {index+1}", "date": iso_date_str, "weekday": "Day"}

def format_sun_time(iso_time_str: Optional[str]) -> str:
    """Format ISO sunrise/sunset '2026-11-07T06:14' to '6:14 AM'"""
    if not iso_time_str:
        return "6:00 AM"
    try:
        dt = datetime.datetime.fromisoformat(iso_time_str)
        return dt.strftime("%I:%M %p").lstrip("0")
    except Exception:
        return "6:00 AM"

def fetch_weather_and_air_quality(
    city_info: Dict[str, Any],
    latitude: float,
    longitude: float,
    force_refresh: bool = False
) -> Optional[Dict[str, Any]]:
    """
    Query Open-Meteo Forecast and Air Quality endpoints and format into SkyCast schema.
    """
    cache_key = f"weather_{latitude:.4f}_{longitude:.4f}"
    if not force_refresh:
        cached_data = weather_cache.get(cache_key)
        if cached_data:
            response_copy = dict(cached_data)
            response_copy["source"] = "cache"
            fetched_time = cached_data.get("fetchedAt", "Recently")
            response_copy["lastUpdated"] = f"Cached, {fetched_time}"
            return response_copy

    # 1. Fetch Forecast & Current Weather
    forecast_params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover,is_day",
        "hourly": "temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,weather_code,surface_pressure,visibility,wind_speed_10m,wind_direction_10m,uv_index",
        "daily": "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max",
        "timezone": "auto"
    }

    forecast_json = {}
    try:
        f_resp = requests.get(Config.OPEN_METEO_FORECAST_URL, params=forecast_params, timeout=Config.REQUEST_TIMEOUT)
        if f_resp.status_code == 200:
            forecast_json = f_resp.json()
        else:
            logger.error(f"Open-Meteo forecast API error {f_resp.status_code}: {f_resp.text}")
            return None
    except Exception as e:
        logger.error(f"Failed to fetch forecast from Open-Meteo: {e}")
        return None

    # 2. Fetch Air Quality
    aqi_json = {}
    try:
        aq_params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": "european_aqi,us_aqi,pm10,pm2_5",
            "timezone": "auto"
        }
        aq_resp = requests.get(Config.OPEN_METEO_AIR_QUALITY_URL, params=aq_params, timeout=Config.REQUEST_TIMEOUT)
        if aq_resp.status_code == 200:
            aqi_json = aq_resp.json()
    except Exception as e:
        logger.warning(f"Air quality fetch failed: {e}. Using estimated safe values.")

    # 3. Transform API response into SkyCast Schema
    current = forecast_json.get("current") or {}
    hourly = forecast_json.get("hourly") or {}
    daily = forecast_json.get("daily") or {}

    current_wmo = current.get("weather_code", 0)
    is_day = bool(current.get("is_day", 1))
    weather_meta = map_wmo_code(current_wmo, is_day=is_day)

    temp_c = round(current.get("temperature_2m", 25))
    feels_like_c = round(current.get("apparent_temperature", temp_c))

    # Daily highs and lows
    daily_highs = daily.get("temperature_2m_max") or [temp_c + 2]
    daily_lows = daily.get("temperature_2m_min") or [temp_c - 4]
    high_c = round(daily_highs[0]) if daily_highs else temp_c + 2
    low_c = round(daily_lows[0]) if daily_lows else temp_c - 4

    wind_speed = current.get("wind_speed_10m", 12)
    wind_dir = degree_to_compass(current.get("wind_direction_10m", 0))

    humidity = current.get("relative_humidity_2m", 60)
    pressure = current.get("surface_pressure", 1012)
    cloud_cover = current.get("cloud_cover", 30)

    # Hourly array (Extract next 24 hours starting from current hour)
    hourly_times = hourly.get("time") or []
    hourly_temps = hourly.get("temperature_2m") or []
    hourly_wmo = hourly.get("weather_code") or []
    hourly_pops = hourly.get("precipitation_probability") or []

    # Find starting index matching current hour
    now_iso = current.get("time", "")
    start_idx = 0
    if now_iso:
        # Match by hour prefix "YYYY-MM-DDTHH" since Open-Meteo current time has minutes (e.g. 20:15) while hourly is on the hour (:00)
        target_prefix = now_iso[:13]
        for idx, t_str in enumerate(hourly_times):
            if t_str.startswith(target_prefix):
                start_idx = idx
                break

    processed_hourly = []
    for i in range(start_idx, min(start_idx + 24, len(hourly_times))):
        h_time_str = hourly_times[i]
        h_temp = round(hourly_temps[i]) if i < len(hourly_temps) and hourly_temps[i] is not None else temp_c
        h_wmo = hourly_wmo[i] if i < len(hourly_wmo) and hourly_wmo[i] is not None else 0
        h_pop = round(hourly_pops[i]) if i < len(hourly_pops) and hourly_pops[i] is not None else 0

        # Rough hour check for day/night icon
        dt_hr = datetime.datetime.fromisoformat(h_time_str).hour
        h_is_day = 6 <= dt_hr <= 18
        h_meta = map_wmo_code(h_wmo, is_day=h_is_day)
        h_time_label = "Now" if i == start_idx else format_hour_label(h_time_str)

        # Authoritative temperature & condition icon for the current hour ('Now')
        item_temp = temp_c if i == start_idx else h_temp
        item_icon = weather_meta["icon"] if i == start_idx else h_meta["icon"]

        processed_hourly.append({
            "time": h_time_label,
            "tempC": item_temp,
            "icon": item_icon,
            "pop": f"{h_pop}%",
            "active": (i == start_idx)
        })

    # 24-hour temperature trend for SVG chart (8 points spaced every 3 hours across 24h)
    trend_24h = []
    for step in range(8):
        idx = start_idx + (step * 3)
        if idx < len(hourly_times):
            h_time_str = hourly_times[idx]
            h_temp = round(hourly_temps[idx]) if idx < len(hourly_temps) and hourly_temps[idx] is not None else temp_c
            # Authoritative temperature for the first point (Now / Current hour)
            trend_temp = temp_c if step == 0 else h_temp
            trend_24h.append({
                "time": format_hour_label(h_time_str),
                "tempC": trend_temp,
                "active": (step == 0)
            })

    if not trend_24h:
        trend_24h = [{"time": "Now", "tempC": temp_c, "active": True}]

    # Precipitation trend for next 24 hours (8 bars spaced every 3 hours across 24h)
    precip_trend = []
    for step in range(8):
        idx = start_idx + (step * 3)
        if idx < len(hourly_times):
            h_time_str = hourly_times[idx]
            h_pop = round(hourly_pops[idx]) if idx < len(hourly_pops) and hourly_pops[idx] is not None else 0
            precip_trend.append({
                "time": format_hour_label(h_time_str),
                "pop": int(h_pop)
            })

    if not precip_trend:
        precip_trend = [{"time": "Now", "pop": 0}]

    # Daily 7-day forecast array
    daily_times = daily.get("time") or []
    daily_wmos = daily.get("weather_code") or []
    daily_pops = daily.get("precipitation_probability_max") or []

    processed_daily = []
    for d_idx in range(min(7, len(daily_times))):
        labels = format_day_label(daily_times[d_idx], d_idx)
        d_wmo = daily_wmos[d_idx] if d_idx < len(daily_wmos) else 0
        d_meta = map_wmo_code(d_wmo, is_day=True)
        d_high = round(daily_highs[d_idx]) if d_idx < len(daily_highs) else high_c
        d_low = round(daily_lows[d_idx]) if d_idx < len(daily_lows) else low_c
        d_pop = daily_pops[d_idx] if d_idx < len(daily_pops) and daily_pops[d_idx] is not None else 20

        processed_daily.append({
            "day": labels["day"],
            "date": labels["date"],
            "condition": d_meta["condition"],
            "icon": d_meta["icon"],
            "highC": d_high,
            "lowC": d_low,
            "pop": f"{d_pop}%"
        })

    # UV Index (peak for today)
    daily_uvs = daily.get("uv_index_max") or [5]
    uv_val = round(daily_uvs[0]) if daily_uvs and daily_uvs[0] is not None else 5
    uv_status = "Low" if uv_val <= 2 else ("Moderate" if uv_val <= 5 else ("High" if uv_val <= 7 else "Very High"))

    # Visibility & Dew Point (current or fallback)
    hourly_vis = hourly.get("visibility") or [10000]
    hourly_dew = hourly.get("dew_point_2m") or [temp_c - 5]
    vis_km = f"{round(hourly_vis[start_idx] / 1000)} km" if start_idx < len(hourly_vis) and hourly_vis[start_idx] is not None else "10 km"
    dew_c = round(hourly_dew[start_idx]) if start_idx < len(hourly_dew) and hourly_dew[start_idx] is not None else temp_c - 5
    precip_prob = f"{hourly_pops[start_idx]}%" if start_idx < len(hourly_pops) and hourly_pops[start_idx] is not None else "0%"

    # Sun schedule
    sunrises = daily.get("sunrise") or [""]
    sunsets = daily.get("sunset") or [""]
    sunrise_str = format_sun_time(sunrises[0]) if sunrises else "6:14 AM"
    sunset_str = format_sun_time(sunsets[0]) if sunsets else "6:00 PM"

    # Air quality transformation
    aqi_current = aqi_json.get("current") or {}
    aqi_val = aqi_current.get("us_aqi") or aqi_current.get("european_aqi") or 35
    if aqi_val <= 50:
        aqi_status, aqi_badge, aqi_msg = "Good", "badge-good", "Clean air, great for outdoor activities."
    elif aqi_val <= 100:
        aqi_status, aqi_badge, aqi_msg = "Moderate", "badge-moderate", "Air quality is acceptable for most people."
    else:
        aqi_status, aqi_badge, aqi_msg = "Poor", "badge-poor", "Sensitive individuals should reduce heavy exertion."

    now_time_label = datetime.datetime.now().strftime("%I:%M %p").lstrip("0")
    if daily_times:
        try:
            today_dt = datetime.date.fromisoformat(daily_times[0])
            today_formatted = today_dt.strftime("%a, %b %d").replace(" 0", " ")
        except Exception:
            today_formatted = datetime.date.today().strftime("%a, %b %d").replace(" 0", " ")
    else:
        today_formatted = datetime.date.today().strftime("%a, %b %d").replace(" 0", " ")

    result_payload = {
        "id": city_info.get("id") or city_info.get("city", "city").lower().replace(" ", "_"),
        "city": city_info.get("city") or city_info.get("name", "Unknown"),
        "region": city_info.get("region", ""),
        "country": city_info.get("country", ""),
        "latitude": latitude,
        "longitude": longitude,
        "landmark": city_info.get("landmark") or f"{city_info.get('city')}, {city_info.get('country')}",
        "tempC": temp_c,
        "feelsLikeC": feels_like_c,
        "highC": high_c,
        "lowC": low_c,
        "condition": weather_meta["condition"],
        "description": weather_meta["description"],
        "wind": f"{round(wind_speed)} km/h",
        "windDirection": wind_dir,
        "humidity": f"{round(humidity)}%",
        "pressure": f"{round(pressure)} hPa",
        "uvIndex": uv_val,
        "uvStatus": uv_status,
        "visibility": vis_km,
        "cloudCover": f"{round(cloud_cover)}%",
        "dewPointC": dew_c,
        "precipProbability": precip_prob,
        "icon": weather_meta["icon"],
        "airQuality": {
            "aqi": int(aqi_val),
            "status": aqi_status,
            "badgeClass": aqi_badge,
            "message": aqi_msg
        },
        "sunSchedule": {
            "sunrise": sunrise_str,
            "sunset": sunset_str,
            "progress": 0.65
        },
        "fetchedAt": now_time_label,
        "lastUpdated": f"Live, {now_time_label}",
        "currentDateFormatted": today_formatted,
        "activeAlert": {
            "title": f"Conditions in {city_info.get('city')}",
            "time": "Current Status",
            "message": weather_meta["description"],
            "type": "advisory"
        },
        "hourly": processed_hourly,
        "daily": processed_daily,
        "tempTrend24h": trend_24h,
        "precipitationTrend": precip_trend,
        "source": "live"
    }

    # Cache response
    weather_cache.set(cache_key, result_payload, ttl=Config.WEATHER_CACHE_TTL)
    return result_payload
