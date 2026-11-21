# SkyCast – Weather Forecast Application

A modern, responsive weather forecast web application built using Python Flask, HTML, CSS and JavaScript.

## Features

- Live weather data integration using Open-Meteo API
- Current weather conditions and temperature
- Hourly and 7-day weather forecasts
- Air quality information
- City search and autocomplete
- Saved locations and favourites
- City-based landmark backgrounds
- Weather-based background effects
- Light, Dark and System themes
- Glassmorphism interface
- Automatic weather refresh
- Weather alerts demo interface
- Responsive desktop, tablet and mobile layouts
- Weather data caching and fallback support

## Technology Stack

- Python
- Flask
- HTML5
- CSS3
- JavaScript
- Open-Meteo API
- LocalStorage

## Project Structure

```text
SkyCast/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── services/
│   └── utils/
├── assets/
│   └── images/
├── css/
├── js/
├── index.html
├── forecast.html
├── saved-locations.html
├── alerts.html
└── settings.html
```

## Installation and Setup

1. Clone or download the project.
2. Open the project folder in VS Code.
3. Create and activate a Python virtual environment.
4. Install dependencies:

```bash
pip install -r backend/requirements.txt
```

5. Start the Flask application:

```bash
python backend/app.py
```

6. Open your browser:

```text
http://127.0.0.1:5000
```

## Weather Data Source

Weather information is retrieved from the Open-Meteo API. The application also supports cached data and demo fallback data when the live service is unavailable.

## Note

Weather alerts are simulated demonstration data and are not official emergency warnings.

## Project Purpose

Developed as a Python Development Internship project to demonstrate Python Flask backend development, API integration, frontend development and responsive UI design.
