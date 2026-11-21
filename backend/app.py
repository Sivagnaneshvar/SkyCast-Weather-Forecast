"""
SkyCast Weather Forecast - Flask REST API Application
"""
import os
import sys

# Ensure backend package can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from backend.config import Config
from backend.services.geocoding_service import search_cities_online, resolve_city_coordinates
from backend.services.open_meteo_service import fetch_weather_and_air_quality

app = Flask(__name__, static_folder="../", static_url_path="")
CORS(app)  # Enable Cross-Origin Resource Sharing

# --- Health check endpoint ---
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "success": True,
        "status": "healthy",
        "service": "SkyCast Weather API",
        "version": "1.0.0"
    })

# --- City search & autocomplete endpoint ---
@app.route("/api/search", methods=["GET"])
def search_cities():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({
            "success": True,
            "data": search_cities_online(""),
            "count": 5
        })

    results = search_cities_online(query)
    return jsonify({
        "success": True,
        "data": results,
        "count": len(results)
    })

# --- Comprehensive weather endpoint ---
@app.route("/api/weather/complete", methods=["GET"])
def get_complete_weather():
    city_param = request.args.get("city", "").strip()
    lat_param = request.args.get("lat")
    lon_param = request.args.get("lon")

    latitude = None
    longitude = None
    city_info = {}

    # 1. Coordinate resolution
    if lat_param and lon_param:
        try:
            latitude = float(lat_param)
            longitude = float(lon_param)
            city_info = {
                "id": city_param.lower().replace(" ", "_") if city_param else f"coord_{latitude:.2f}_{longitude:.2f}",
                "city": city_param or f"Location ({latitude:.2f}, {longitude:.2f})",
                "region": request.args.get("region", ""),
                "country": request.args.get("country", ""),
                "landmark": request.args.get("landmark", city_param)
            }
        except ValueError:
            return jsonify({
                "success": False,
                "error": "Invalid latitude or longitude coordinates provided."
            }), 400
    elif city_param:
        coords = resolve_city_coordinates(city_param)
        if coords:
            latitude = coords["latitude"]
            longitude = coords["longitude"]
            city_info = {
                "id": coords.get("id") or city_param.lower().replace(" ", "_"),
                "city": coords["name"] if "name" in coords else coords.get("city", city_param),
                "region": coords.get("region", ""),
                "country": coords.get("country", ""),
                "landmark": coords.get("landmark", city_param)
            }

    # Fallback to default city (Coimbatore) if resolution fails
    if latitude is None or longitude is None:
        latitude = 11.0168
        longitude = 76.9558
        city_info = {
            "id": "coimbatore",
            "city": "Coimbatore",
            "region": "Tamil Nadu",
            "country": "India",
            "landmark": "Marudhamalai Temple, Coimbatore"
        }

    # 2. Query Open-Meteo
    refresh_param = request.args.get("refresh", "").lower() in ("true", "1", "yes")
    force_param = request.args.get("force", "").lower() in ("true", "1", "yes")
    force_refresh = refresh_param or force_param

    weather_data = fetch_weather_and_air_quality(city_info, latitude, longitude, force_refresh=force_refresh)

    if not weather_data:
        return jsonify({
            "success": False,
            "error": "Unable to fetch live meteorological data from Open-Meteo."
        }), 502

    return jsonify({
        "success": True,
        "data": weather_data,
        "source": weather_data.get("source", "live")
    })

# --- Serve static frontend files (enables seamless single-server hosting) ---
@app.route("/", methods=["GET"])
def index():
    return send_from_directory("../", "index.html")

@app.route("/<path:path>", methods=["GET"])
def static_proxy(path):
    return send_from_directory("../", path)

if __name__ == "__main__":
    print(f"SkyCast Flask Server running on http://{Config.HOST}:{Config.PORT}")
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
