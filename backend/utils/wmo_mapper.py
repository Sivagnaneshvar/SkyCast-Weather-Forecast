"""
WMO (World Meteorological Organization) Code Translator for SkyCast.
Maps numerical codes to condition names, descriptions, and SkyCast SVG icon identifiers.
"""
from typing import Dict, Any

WMO_CODE_TABLE: Dict[int, Dict[str, Any]] = {
    0: {
        "condition": "Clear Sky",
        "icon": "sunny",
        "night_icon": "night",
        "description": "Clear skies with calm, pleasant conditions."
    },
    1: {
        "condition": "Mainly Clear",
        "icon": "partly-cloudy-day",
        "night_icon": "cloudy-night",
        "description": "Mostly clear with occasional light clouds."
    },
    2: {
        "condition": "Partly Cloudy",
        "icon": "partly-cloudy-day",
        "night_icon": "cloudy-night",
        "description": "Warm and partly cloudy with gentle breezes."
    },
    3: {
        "condition": "Overcast",
        "icon": "cloudy",
        "night_icon": "cloudy",
        "description": "Dense cloud cover across the area."
    },
    45: {
        "condition": "Fog",
        "icon": "fog",
        "night_icon": "fog",
        "description": "Reduced visibility due to morning fog and haze."
    },
    48: {
        "condition": "Depositing Rime Fog",
        "icon": "fog",
        "night_icon": "fog",
        "description": "Cold dense rime fog with icy mist."
    },
    51: {
        "condition": "Light Drizzle",
        "icon": "rain",
        "night_icon": "rain",
        "description": "Intermittent light drizzle. Humidity is high."
    },
    53: {
        "condition": "Moderate Drizzle",
        "icon": "rain",
        "night_icon": "rain",
        "description": "Steady drizzle with damp conditions."
    },
    55: {
        "condition": "Dense Drizzle",
        "icon": "rain",
        "night_icon": "rain",
        "description": "Heavy persistent drizzle. Roads may be slick."
    },
    56: {
        "condition": "Freezing Drizzle",
        "icon": "rain",
        "night_icon": "rain",
        "description": "Freezing drizzle causing icy surface hazards."
    },
    57: {
        "condition": "Dense Freezing Drizzle",
        "icon": "rain",
        "night_icon": "rain",
        "description": "Heavy freezing drizzle with significant icing."
    },
    61: {
        "condition": "Slight Rain",
        "icon": "rain",
        "night_icon": "rain",
        "description": "Light passing showers with wet roads."
    },
    63: {
        "condition": "Moderate Rain",
        "icon": "rain",
        "night_icon": "rain",
        "description": "Steady rainfall. Keep an umbrella ready."
    },
    65: {
        "condition": "Heavy Rain",
        "icon": "heavy-rain",
        "night_icon": "heavy-rain",
        "description": "Intense downpours with reduced visibility."
    },
    66: {
        "condition": "Freezing Rain",
        "icon": "heavy-rain",
        "night_icon": "heavy-rain",
        "description": "Freezing rainfall with dangerous icy conditions."
    },
    67: {
        "condition": "Heavy Freezing Rain",
        "icon": "heavy-rain",
        "night_icon": "heavy-rain",
        "description": "Severe freezing rain warning in effect."
    },
    71: {
        "condition": "Slight Snow Fall",
        "icon": "cloudy",
        "night_icon": "cloudy-night",
        "description": "Light snow flurries with low accumulation."
    },
    73: {
        "condition": "Moderate Snow Fall",
        "icon": "cloudy",
        "night_icon": "cloudy",
        "description": "Steady snowfall with cold mountain temperatures."
    },
    75: {
        "condition": "Heavy Snow Fall",
        "icon": "cloudy",
        "night_icon": "cloudy",
        "description": "Heavy snow squalls with severe drifting."
    },
    77: {
        "condition": "Snow Grains",
        "icon": "cloudy",
        "night_icon": "cloudy",
        "description": "Scattered granular snow particles falling."
    },
    80: {
        "condition": "Slight Rain Showers",
        "icon": "rain",
        "night_icon": "rain",
        "description": "Scattered rain showers with brief clear spells."
    },
    81: {
        "condition": "Moderate Rain Showers",
        "icon": "rain",
        "night_icon": "rain",
        "description": "Brisk rain showers with gusty winds."
    },
    82: {
        "condition": "Violent Rain Showers",
        "icon": "heavy-rain",
        "night_icon": "heavy-rain",
        "description": "Torrential showers with possible localized flooding."
    },
    85: {
        "condition": "Slight Snow Showers",
        "icon": "cloudy",
        "night_icon": "cloudy-night",
        "description": "Brisk snow showers in elevated areas."
    },
    86: {
        "condition": "Heavy Snow Showers",
        "icon": "cloudy",
        "night_icon": "cloudy",
        "description": "Heavy winter snow showers with low visibility."
    },
    95: {
        "condition": "Thunderstorm",
        "icon": "heavy-rain",
        "night_icon": "heavy-rain",
        "description": "Thunderstorms with lightning activity and gusts."
    },
    96: {
        "condition": "Thunderstorm with Slight Hail",
        "icon": "heavy-rain",
        "night_icon": "heavy-rain",
        "description": "Severe storm with lightning and small hail."
    },
    99: {
        "condition": "Thunderstorm with Heavy Hail",
        "icon": "heavy-rain",
        "night_icon": "heavy-rain",
        "description": "Severe storm alert: damaging hail and gale force winds."
    }
}

DEFAULT_WEATHER = {
    "condition": "Partly Cloudy",
    "icon": "partly-cloudy-day",
    "night_icon": "cloudy-night",
    "description": "Typical meteorological conditions."
}

def map_wmo_code(code: int, is_day: bool = True) -> Dict[str, str]:
    entry = WMO_CODE_TABLE.get(code, DEFAULT_WEATHER)
    icon = entry["icon"] if is_day else entry["night_icon"]
    return {
        "condition": entry["condition"],
        "icon": icon,
        "description": entry["description"]
    }
