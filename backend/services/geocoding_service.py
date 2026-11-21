"""
Geocoding service to search cities and resolve geographic coordinates via Open-Meteo.
"""
import logging
import requests
from typing import List, Dict, Any, Optional
from backend.config import Config
from backend.services.cache_service import geocoding_cache

logger = logging.getLogger(__name__)

# Predefined canonical coordinates for well-known mock cities
CANONICAL_COORDINATES: Dict[str, Dict[str, Any]] = {
    "coimbatore": {"name": "Coimbatore", "region": "Tamil Nadu", "country": "India", "latitude": 11.0168, "longitude": 76.9558, "landmark": "Marudhamalai Temple, Coimbatore"},
    "chennai": {"name": "Chennai", "region": "Tamil Nadu", "country": "India", "latitude": 13.0827, "longitude": 80.2707, "landmark": "Marina Beach, Chennai"},
    "ooty": {"name": "Ooty", "region": "Tamil Nadu", "country": "India", "latitude": 11.4102, "longitude": 76.6950, "landmark": "Nilgiri Hills, Ooty"},
    "madurai": {"name": "Madurai", "region": "Tamil Nadu", "country": "India", "latitude": 9.9252, "longitude": 78.1198, "landmark": "Meenakshi Amman Temple, Madurai"},
    "bengaluru": {"name": "Bengaluru", "region": "Karnataka", "country": "India", "latitude": 12.9716, "longitude": 77.5946, "landmark": "Vidhana Soudha, Bengaluru"},
    "salem": {"name": "Salem", "region": "Tamil Nadu", "country": "India", "latitude": 11.6643, "longitude": 78.1460, "landmark": "Yercaud Lake & Shevaroy Hills, Salem"},
    "kochi": {"name": "Kochi", "region": "Kerala", "country": "India", "latitude": 9.9312, "longitude": 76.2673, "landmark": "Chinese Fishing Nets, Kochi"},
    "mumbai": {"name": "Mumbai", "region": "Maharashtra", "country": "India", "latitude": 19.0760, "longitude": 72.8777, "landmark": "Gateway of India, Mumbai"},
    "delhi": {"name": "Delhi", "region": "NCR", "country": "India", "latitude": 28.6139, "longitude": 77.2090, "landmark": "India Gate, Delhi"},
    "hyderabad": {"name": "Hyderabad", "region": "Telangana", "country": "India", "latitude": 17.3850, "longitude": 78.4867, "landmark": "Charminar, Hyderabad"},
    "kodaikanal": {"name": "Kodaikanal", "region": "Tamil Nadu", "country": "India", "latitude": 10.2381, "longitude": 77.4892, "landmark": "Kodaikanal Lake, Kodaikanal"}
}

def resolve_city_coordinates(city_query: str) -> Optional[Dict[str, Any]]:
    """
    Given a city name or key, resolve to canonical coordinates (checking pre-definitions first, then geocoding API).
    """
    clean_key = city_query.lower().strip()
    if clean_key in CANONICAL_COORDINATES:
        return CANONICAL_COORDINATES[clean_key]

    # Check cache
    cache_key = f"geo_res_{clean_key}"
    cached = geocoding_cache.get(cache_key)
    if cached:
        return cached

    # Search via Open-Meteo Geocoding
    results = search_cities_online(city_query)
    if results:
        top_match = results[0]
        geocoding_cache.set(cache_key, top_match, ttl=Config.GEOCODING_CACHE_TTL)
        return top_match

    return None

def search_cities_online(query: str) -> List[Dict[str, Any]]:
    """
    Search cities using Open-Meteo Geocoding API with fallback to predefined coordinates.
    """
    clean_query = (query or "").strip().lower()
    if not clean_query:
        return list(CANONICAL_COORDINATES.values())[:5]

    cache_key = f"geo_search_{clean_query}"
    cached = geocoding_cache.get(cache_key)
    if cached:
        return cached

    results = []
    # 1. Match local canonical coordinates first
    for key, city_data in CANONICAL_COORDINATES.items():
        if clean_query in city_data["name"].lower() or clean_query in city_data["region"].lower():
            results.append({
                "id": key,
                "city": city_data["name"],
                "region": city_data["region"],
                "country": city_data["country"],
                "latitude": city_data["latitude"],
                "longitude": city_data["longitude"],
                "landmark": city_data.get("landmark", f"{city_data['name']}, {city_data['region']}")
            })

    # 2. Query Open-Meteo Geocoding
    try:
        resp = requests.get(
            Config.OPEN_METEO_GEOCODING_URL,
            params={"name": query, "count": 10, "language": "en", "format": "json"},
            timeout=Config.REQUEST_TIMEOUT
        )
        if resp.status_code == 200:
            data = resp.json()
            api_results = data.get("results") or []
            for item in api_results:
                city_name = item.get("name", "Unknown")
                region = item.get("admin1") or item.get("country", "")
                country = item.get("country", "")
                lat = item.get("latitude")
                lon = item.get("longitude")
                # Generate unique ID from city & country
                item_id = f"{city_name.lower().replace(' ', '_')}_{country.lower().replace(' ', '_')}"

                # Avoid duplicate if already matched locally
                if not any(r["city"].lower() == city_name.lower() and r["region"].lower() == region.lower() for r in results):
                    results.append({
                        "id": item_id,
                        "city": city_name,
                        "region": region,
                        "country": country,
                        "latitude": lat,
                        "longitude": lon,
                        "landmark": f"{city_name}, {country}"
                    })
    except Exception as e:
        logger.warning(f"Open-Meteo geocoding search failed: {e}. Falling back to canonical list.")

    geocoding_cache.set(cache_key, results, ttl=Config.GEOCODING_CACHE_TTL)
    return results
