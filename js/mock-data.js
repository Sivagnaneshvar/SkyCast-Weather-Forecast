/**
 * SkyCast Weather Forecast - Realistic Demo Data
 * NOTE: This is mock sample data used for UI prototyping and development.
 * API integration will be implemented in future phases.
 */

const DEMO_LOCATIONS = {
  coimbatore: {
    id: "coimbatore",
    city: "Coimbatore",
    region: "Tamil Nadu",
    country: "India",
    landmark: "Marudhamalai Temple, Coimbatore",
    tempC: 28,
    feelsLikeC: 29,
    highC: 29,
    lowC: 24,
    condition: "Partly Cloudy",
    description: "Warm and partly cloudy with light breeze. No rain expected for the next few hours.",
    wind: "15 km/h",
    windDirection: "ENE",
    humidity: "62%",
    pressure: "1012 hPa",
    uvIndex: 6,
    uvStatus: "Moderate",
    visibility: "10 km",
    cloudCover: "40%",
    dewPointC: 21,
    precipProbability: "45%",
    icon: "partly-cloudy-day",
    airQuality: {
      aqi: 42,
      status: "Good",
      badgeClass: "badge-good",
      message: "Clean air, great for outdoor activities."
    },
    sunSchedule: {
      sunrise: "6:14 AM",
      sunset: "5:59 PM",
      progress: 0.78
    },
    lastUpdated: "Today, 6:42 PM",
    activeAlert: {
      title: "Light Rain Expected",
      time: "8:00 PM – 11:00 PM",
      message: "Chance of light rain between 8:00 PM – 11:00 PM.",
      type: "warning"
    },
    // 24-Hour Temperature Trend for Interactive Line Chart
    tempTrend24h: [
      { time: "6 AM", tempC: 24 },
      { time: "9 AM", tempC: 26 },
      { time: "12 PM", tempC: 29 },
      { time: "3 PM", tempC: 30 },
      { time: "6 PM", tempC: 28, active: true },
      { time: "9 PM", tempC: 25 },
      { time: "12 AM", tempC: 24 },
      { time: "3 AM", tempC: 23 }
    ],
    // Precipitation Probability for Bar Chart
    precipitationTrend: [
      { time: "6 PM", pop: 20 },
      { time: "7 PM", pop: 45 },
      { time: "8 PM", pop: 70 },
      { time: "9 PM", pop: 65 },
      { time: "10 PM", pop: 40 },
      { time: "11 PM", pop: 25 }
    ],
    hourly: [
      { time: "Now", tempC: 28, icon: "partly-cloudy-day", pop: "20%", active: true },
      { time: "7 PM", tempC: 27, icon: "cloudy", pop: "45%" },
      { time: "8 PM", tempC: 26, icon: "cloudy-night", pop: "70%" },
      { time: "9 PM", tempC: 25, icon: "cloudy-night", pop: "65%" },
      { time: "10 PM", tempC: 25, icon: "cloudy-night", pop: "40%" },
      { time: "11 PM", tempC: 24, icon: "cloudy-night", pop: "25%" },
      { time: "12 AM", tempC: 24, icon: "night", pop: "15%" },
      { time: "1 AM", tempC: 24, icon: "night", pop: "10%" }
    ],
    daily: [
      { day: "Tue", date: "Nov 04", condition: "Partly Cloudy", highC: 28, lowC: 24, icon: "partly-cloudy-day", pop: "25%" },
      { day: "Wed", date: "Nov 05", condition: "Sunny", highC: 29, lowC: 24, icon: "sunny", pop: "10%" },
      { day: "Thu", date: "Nov 06", condition: "Cloudy", highC: 28, lowC: 23, icon: "cloudy", pop: "35%" },
      { day: "Fri", date: "Nov 07", condition: "Rain Showers", highC: 27, lowC: 23, icon: "rain", pop: "75%" },
      { day: "Sat", date: "Nov 08", condition: "Heavy Rain", highC: 26, lowC: 22, icon: "heavy-rain", pop: "85%" },
      { day: "Sun", date: "Nov 09", condition: "Partly Cloudy", highC: 27, lowC: 22, icon: "partly-cloudy-day", pop: "30%" },
      { day: "Mon", date: "Nov 10", condition: "Sunny", highC: 28, lowC: 23, icon: "sunny", pop: "10%" }
    ]
  },
  chennai: {
    id: "chennai",
    city: "Chennai",
    region: "Tamil Nadu",
    country: "India",
    landmark: "Marina Beach, Chennai",
    tempC: 31,
    feelsLikeC: 35,
    highC: 32,
    lowC: 26,
    condition: "Mostly Sunny",
    description: "Humid coastal weather with sunny spells and gentle sea breeze.",
    wind: "22 km/h",
    windDirection: "SE",
    humidity: "65%",
    pressure: "1010 hPa",
    uvIndex: 8,
    uvStatus: "Very High",
    visibility: "9 km",
    cloudCover: "25%",
    dewPointC: 24,
    precipProbability: "15%",
    icon: "sunny",
    airQuality: {
      aqi: 68,
      status: "Moderate",
      badgeClass: "badge-moderate",
      message: "Air quality is acceptable for most individuals."
    },
    sunSchedule: {
      sunrise: "6:05 AM",
      sunset: "5:50 PM",
      progress: 0.82
    },
    lastUpdated: "Today, 6:42 PM",
    activeAlert: {
      title: "Coastal Wind Advisory",
      time: "6:00 PM – 10:00 PM",
      message: "Gusty coastal winds up to 35 km/h along the shoreline.",
      type: "advisory"
    },
    tempTrend24h: [
      { time: "6 AM", tempC: 26 },
      { time: "9 AM", tempC: 29 },
      { time: "12 PM", tempC: 32 },
      { time: "3 PM", tempC: 33 },
      { time: "6 PM", tempC: 31, active: true },
      { time: "9 PM", tempC: 28 },
      { time: "12 AM", tempC: 27 },
      { time: "3 AM", tempC: 26 }
    ],
    precipitationTrend: [
      { time: "6 PM", pop: 10 },
      { time: "7 PM", pop: 15 },
      { time: "8 PM", pop: 20 },
      { time: "9 PM", pop: 15 },
      { time: "10 PM", pop: 10 },
      { time: "11 PM", pop: 5 }
    ],
    hourly: [
      { time: "Now", tempC: 31, icon: "sunny", pop: "10%", active: true },
      { time: "7 PM", tempC: 30, icon: "cloudy-night", pop: "15%" },
      { time: "8 PM", tempC: 29, icon: "cloudy-night", pop: "20%" },
      { time: "9 PM", tempC: 28, icon: "night", pop: "15%" },
      { time: "10 PM", tempC: 28, icon: "night", pop: "10%" },
      { time: "11 PM", tempC: 27, icon: "night", pop: "5%" },
      { time: "12 AM", tempC: 27, icon: "night", pop: "5%" },
      { time: "1 AM", tempC: 26, icon: "night", pop: "5%" }
    ],
    daily: [
      { day: "Tue", date: "Nov 04", condition: "Sunny", highC: 31, lowC: 26, icon: "sunny", pop: "10%" },
      { day: "Wed", date: "Nov 05", condition: "Sunny", highC: 32, lowC: 26, icon: "sunny", pop: "5%" },
      { day: "Thu", date: "Nov 06", condition: "Partly Cloudy", highC: 31, lowC: 25, icon: "partly-cloudy-day", pop: "20%" },
      { day: "Fri", date: "Nov 07", condition: "Cloudy", highC: 30, lowC: 25, icon: "cloudy", pop: "35%" },
      { day: "Sat", date: "Nov 08", condition: "Light Rain", highC: 30, lowC: 24, icon: "rain", pop: "50%" },
      { day: "Sun", date: "Nov 09", condition: "Partly Cloudy", highC: 31, lowC: 25, icon: "partly-cloudy-day", pop: "20%" },
      { day: "Mon", date: "Nov 10", condition: "Sunny", highC: 32, lowC: 26, icon: "sunny", pop: "10%" }
    ]
  },
  ooty: {
    id: "ooty",
    city: "Ooty",
    region: "Tamil Nadu",
    country: "India",
    landmark: "Nilgiri Hills, Ooty",
    tempC: 18,
    feelsLikeC: 17,
    highC: 19,
    lowC: 10,
    condition: "Mist & Cool",
    description: "Crisp mountain air with light mist rolling across tea plantations.",
    wind: "10 km/h",
    windDirection: "N",
    humidity: "88%",
    pressure: "1016 hPa",
    uvIndex: 4,
    uvStatus: "Moderate",
    visibility: "5 km",
    cloudCover: "80%",
    dewPointC: 16,
    precipProbability: "40%",
    icon: "fog",
    airQuality: {
      aqi: 22,
      status: "Excellent",
      badgeClass: "badge-good",
      message: "Crisp mountain air, ideal for hiking and outdoors."
    },
    sunSchedule: {
      sunrise: "6:18 AM",
      sunset: "6:02 PM",
      progress: 0.77
    },
    lastUpdated: "Today, 6:42 PM",
    activeAlert: {
      title: "Dense Fog Watch",
      time: "9:00 PM – 7:00 AM",
      message: "Visibility may reduce below 500m on ghat roads tonight.",
      type: "advisory"
    },
    tempTrend24h: [
      { time: "6 AM", tempC: 11 },
      { time: "9 AM", tempC: 15 },
      { time: "12 PM", tempC: 19 },
      { time: "3 PM", tempC: 18 },
      { time: "6 PM", tempC: 16, active: true },
      { time: "9 PM", tempC: 14 },
      { time: "12 AM", tempC: 12 },
      { time: "3 AM", tempC: 10 }
    ],
    precipitationTrend: [
      { time: "6 PM", pop: 30 },
      { time: "7 PM", pop: 40 },
      { time: "8 PM", pop: 45 },
      { time: "9 PM", pop: 35 },
      { time: "10 PM", pop: 25 },
      { time: "11 PM", pop: 20 }
    ],
    hourly: [
      { time: "Now", tempC: 18, icon: "fog", pop: "25%", active: true },
      { time: "7 PM", tempC: 16, icon: "fog", pop: "40%" },
      { time: "8 PM", tempC: 15, icon: "night", pop: "45%" },
      { time: "9 PM", tempC: 14, icon: "night", pop: "35%" },
      { time: "10 PM", tempC: 13, icon: "night", pop: "25%" },
      { time: "11 PM", tempC: 12, icon: "night", pop: "20%" },
      { time: "12 AM", tempC: 11, icon: "night", pop: "15%" },
      { time: "1 AM", tempC: 11, icon: "night", pop: "10%" }
    ],
    daily: [
      { day: "Tue", date: "Nov 04", condition: "Fog & Mist", highC: 18, lowC: 10, icon: "fog", pop: "30%" },
      { day: "Wed", date: "Nov 05", condition: "Partly Cloudy", highC: 19, lowC: 11, icon: "partly-cloudy-day", pop: "20%" },
      { day: "Thu", date: "Nov 06", condition: "Showers", highC: 17, lowC: 10, icon: "rain", pop: "65%" },
      { day: "Fri", date: "Nov 07", condition: "Heavy Rain", highC: 16, lowC: 9, icon: "heavy-rain", pop: "80%" },
      { day: "Sat", date: "Nov 08", condition: "Cloudy", highC: 17, lowC: 10, icon: "cloudy", pop: "45%" },
      { day: "Sun", date: "Nov 09", condition: "Partly Cloudy", highC: 18, lowC: 11, icon: "partly-cloudy-day", pop: "25%" },
      { day: "Mon", date: "Nov 10", condition: "Sunny", highC: 19, lowC: 12, icon: "sunny", pop: "10%" }
    ]
  },
  madurai: {
    id: "madurai",
    city: "Madurai",
    region: "Tamil Nadu",
    country: "India",
    landmark: "Meenakshi Amman Temple, Madurai",
    tempC: 30,
    feelsLikeC: 33,
    highC: 31,
    lowC: 25,
    condition: "Partly Cloudy",
    description: "Warm evening with pleasant city breezes and high cloud coverage.",
    wind: "18 km/h",
    windDirection: "NE",
    humidity: "58%",
    pressure: "1011 hPa",
    uvIndex: 7,
    uvStatus: "High",
    visibility: "10 km",
    cloudCover: "35%",
    dewPointC: 22,
    precipProbability: "20%",
    icon: "partly-cloudy-day",
    airQuality: {
      aqi: 55,
      status: "Moderate",
      badgeClass: "badge-moderate",
      message: "Moderate air quality index. Safe for outdoor activities."
    },
    sunSchedule: {
      sunrise: "6:11 AM",
      sunset: "5:57 PM",
      progress: 0.80
    },
    lastUpdated: "Today, 6:42 PM",
    activeAlert: {
      title: "Warm Night Alert",
      time: "Tonight",
      message: "Overnight temperatures will remain around 25°C.",
      type: "advisory"
    },
    tempTrend24h: [
      { time: "6 AM", tempC: 25 },
      { time: "9 AM", tempC: 28 },
      { time: "12 PM", tempC: 31 },
      { time: "3 PM", tempC: 32 },
      { time: "6 PM", tempC: 30, active: true },
      { time: "9 PM", tempC: 27 },
      { time: "12 AM", tempC: 26 },
      { time: "3 AM", tempC: 25 }
    ],
    precipitationTrend: [
      { time: "6 PM", pop: 15 },
      { time: "7 PM", pop: 20 },
      { time: "8 PM", pop: 25 },
      { time: "9 PM", pop: 20 },
      { time: "10 PM", pop: 15 },
      { time: "11 PM", pop: 10 }
    ],
    hourly: [
      { time: "Now", tempC: 30, icon: "partly-cloudy-day", pop: "15%", active: true },
      { time: "7 PM", tempC: 29, icon: "cloudy-night", pop: "20%" },
      { time: "8 PM", tempC: 28, icon: "cloudy-night", pop: "25%" },
      { time: "9 PM", tempC: 27, icon: "night", pop: "20%" },
      { time: "10 PM", tempC: 26, icon: "night", pop: "15%" },
      { time: "11 PM", tempC: 26, icon: "night", pop: "15%" },
      { time: "12 AM", tempC: 25, icon: "night", pop: "10%" },
      { time: "1 AM", tempC: 25, icon: "night", pop: "10%" }
    ],
    daily: [
      { day: "Tue", date: "Nov 04", condition: "Partly Cloudy", highC: 30, lowC: 24, icon: "partly-cloudy-day", pop: "20%" },
      { day: "Wed", date: "Nov 05", condition: "Sunny", highC: 31, lowC: 25, icon: "sunny", pop: "10%" },
      { day: "Thu", date: "Nov 06", condition: "Cloudy", highC: 30, lowC: 24, icon: "cloudy", pop: "30%" },
      { day: "Fri", date: "Nov 07", condition: "Rain Showers", highC: 29, lowC: 23, icon: "rain", pop: "60%" },
      { day: "Sat", date: "Nov 08", condition: "Rain Showers", highC: 28, lowC: 23, icon: "rain", pop: "55%" },
      { day: "Sun", date: "Nov 09", condition: "Partly Cloudy", highC: 30, lowC: 24, icon: "partly-cloudy-day", pop: "25%" },
      { day: "Mon", date: "Nov 10", condition: "Sunny", highC: 31, lowC: 25, icon: "sunny", pop: "10%" }
    ]
  },
  bengaluru: {
    id: "bengaluru",
    city: "Bengaluru",
    region: "Karnataka",
    country: "India",
    landmark: "Vidhana Soudha, Bengaluru",
    tempC: 24,
    feelsLikeC: 24,
    highC: 26,
    lowC: 19,
    condition: "Pleasant & Breezy",
    description: "Cool garden city breeze with intermittent scattered clouds and mild sunlight.",
    wind: "14 km/h",
    windDirection: "E",
    humidity: "65%",
    pressure: "1014 hPa",
    uvIndex: 6,
    uvStatus: "Moderate",
    visibility: "10 km",
    cloudCover: "45%",
    dewPointC: 17,
    precipProbability: "20%",
    icon: "partly-cloudy-day",
    airQuality: {
      aqi: 38,
      status: "Good",
      badgeClass: "badge-good",
      message: "Satisfactory air quality, ideal for walking outdoors."
    },
    sunSchedule: {
      sunrise: "6:13 AM",
      sunset: "5:56 PM",
      progress: 0.79
    },
    lastUpdated: "Today, 6:42 PM",
    activeAlert: {
      title: "Pleasant Evening",
      time: "Evening",
      message: "Clear skies and comfortable temperatures throughout the night.",
      type: "advisory"
    },
    tempTrend24h: [
      { time: "6 AM", tempC: 20 },
      { time: "9 AM", tempC: 23 },
      { time: "12 PM", tempC: 26 },
      { time: "3 PM", tempC: 25 },
      { time: "6 PM", tempC: 24, active: true },
      { time: "9 PM", tempC: 21 },
      { time: "12 AM", tempC: 20 },
      { time: "3 AM", tempC: 19 }
    ],
    precipitationTrend: [
      { time: "6 PM", pop: 10 },
      { time: "7 PM", pop: 15 },
      { time: "8 PM", pop: 20 },
      { time: "9 PM", pop: 10 },
      { time: "10 PM", pop: 5 },
      { time: "11 PM", pop: 5 }
    ],
    hourly: [
      { time: "Now", tempC: 24, icon: "partly-cloudy-day", pop: "10%", active: true },
      { time: "7 PM", tempC: 23, icon: "cloudy-night", pop: "15%" },
      { time: "8 PM", tempC: 22, icon: "cloudy-night", pop: "20%" },
      { time: "9 PM", tempC: 21, icon: "night", pop: "10%" },
      { time: "10 PM", tempC: 20, icon: "night", pop: "5%" },
      { time: "11 PM", tempC: 20, icon: "night", pop: "5%" },
      { time: "12 AM", tempC: 19, icon: "night", pop: "5%" },
      { time: "1 AM", tempC: 19, icon: "night", pop: "5%" }
    ],
    daily: [
      { day: "Tue", date: "Nov 04", condition: "Partly Cloudy", highC: 26, lowC: 19, icon: "partly-cloudy-day", pop: "20%" },
      { day: "Wed", date: "Nov 05", condition: "Sunny", highC: 27, lowC: 19, icon: "sunny", pop: "10%" },
      { day: "Thu", date: "Nov 06", condition: "Partly Cloudy", highC: 26, lowC: 18, icon: "partly-cloudy-day", pop: "15%" },
      { day: "Fri", date: "Nov 07", condition: "Light Rain", highC: 25, lowC: 18, icon: "rain", pop: "40%" },
      { day: "Sat", date: "Nov 08", condition: "Cloudy", highC: 24, lowC: 17, icon: "cloudy", pop: "30%" },
      { day: "Sun", date: "Nov 09", condition: "Sunny", highC: 26, lowC: 18, icon: "sunny", pop: "10%" },
      { day: "Mon", date: "Nov 10", condition: "Sunny", highC: 27, lowC: 19, icon: "sunny", pop: "5%" }
    ]
  },
  salem: {
    id: "salem",
    city: "Salem",
    region: "Tamil Nadu",
    country: "India",
    landmark: "Yercaud Lake & Shevaroy Hills, Salem",
    tempC: 28,
    feelsLikeC: 30,
    highC: 31,
    lowC: 22,
    condition: "Partly Cloudy",
    description: "Gentle hill breezes with scattered clouds over the Shevaroy ranges.",
    wind: "11 km/h",
    windDirection: "NE",
    humidity: "62%",
    pressure: "1012 hPa",
    uvIndex: 6,
    uvStatus: "Moderate",
    visibility: "10 km",
    cloudCover: "40%",
    dewPointC: 19,
    precipProbability: "15%",
    icon: "partly-cloudy-day",
    airQuality: {
      aqi: 42,
      status: "Good",
      badgeClass: "badge-good",
      message: "Air quality is good and suitable for outdoor activities."
    },
    sunSchedule: {
      sunrise: "6:14 AM",
      sunset: "5:58 PM",
      progress: 0.81
    },
    lastUpdated: "Today, 6:40 PM",
    activeAlert: null,
    tempTrend24h: [
      { time: "6 AM", tempC: 22 },
      { time: "9 AM", tempC: 25 },
      { time: "12 PM", tempC: 29 },
      { time: "3 PM", tempC: 31 },
      { time: "6 PM", tempC: 28, active: true },
      { time: "9 PM", tempC: 25 },
      { time: "12 AM", tempC: 23 },
      { time: "3 AM", tempC: 22 }
    ],
    precipitationTrend: [
      { time: "6 PM", pop: 15 },
      { time: "7 PM", pop: 10 },
      { time: "8 PM", pop: 5 },
      { time: "9 PM", pop: 5 },
      { time: "10 PM", pop: 0 },
      { time: "11 PM", pop: 0 }
    ],
    hourly: [
      { time: "Now", tempC: 28, icon: "partly-cloudy-day", pop: "15%", active: true },
      { time: "7 PM", tempC: 27, icon: "cloudy-night", pop: "10%" },
      { time: "8 PM", tempC: 26, icon: "cloudy-night", pop: "5%" },
      { time: "9 PM", tempC: 25, icon: "night", pop: "5%" },
      { time: "10 PM", tempC: 24, icon: "night", pop: "0%" },
      { time: "11 PM", tempC: 23, icon: "night", pop: "0%" },
      { time: "12 AM", tempC: 23, icon: "night", pop: "0%" },
      { time: "1 AM", tempC: 22, icon: "night", pop: "0%" }
    ],
    daily: [
      { day: "Tue", date: "Nov 04", condition: "Partly Cloudy", highC: 31, lowC: 22, icon: "partly-cloudy-day", pop: "15%" },
      { day: "Wed", date: "Nov 05", condition: "Sunny", highC: 32, lowC: 22, icon: "sunny", pop: "10%" },
      { day: "Thu", date: "Nov 06", condition: "Partly Cloudy", highC: 31, lowC: 21, icon: "partly-cloudy-day", pop: "20%" },
      { day: "Fri", date: "Nov 07", condition: "Rain Showers", highC: 29, lowC: 21, icon: "rain", pop: "45%" },
      { day: "Sat", date: "Nov 08", condition: "Cloudy", highC: 28, lowC: 20, icon: "cloudy", pop: "30%" },
      { day: "Sun", date: "Nov 09", condition: "Sunny", highC: 30, lowC: 21, icon: "sunny", pop: "10%" },
      { day: "Mon", date: "Nov 10", condition: "Sunny", highC: 31, lowC: 22, icon: "sunny", pop: "5%" }
    ]
  },
  kochi: {
    id: "kochi",
    city: "Kochi",
    region: "Kerala",
    country: "India",
    landmark: "Fort Kochi Coast, Kochi",
    tempC: 29,
    feelsLikeC: 33,
    highC: 30,
    lowC: 25,
    condition: "Tropical Breeze",
    description: "Tropical coastal humidity with cooling Arabian Sea breezes and passing rain clouds.",
    wind: "18 km/h",
    windDirection: "W",
    humidity: "82%",
    pressure: "1009 hPa",
    uvIndex: 5,
    uvStatus: "Moderate",
    visibility: "8 km",
    cloudCover: "60%",
    dewPointC: 24,
    precipProbability: "55%",
    icon: "rain",
    airQuality: {
      aqi: 28,
      status: "Good",
      badgeClass: "badge-good",
      message: "Pure coastal air with sea salt aroma."
    },
    sunSchedule: {
      sunrise: "6:18 AM",
      sunset: "6:04 PM",
      progress: 0.77
    },
    lastUpdated: "Today, 6:42 PM",
    activeAlert: {
      title: "Passing Showers",
      time: "Night",
      message: "Brief passing showers possible along coastal sectors.",
      type: "advisory"
    },
    tempTrend24h: [
      { time: "6 AM", tempC: 26 },
      { time: "9 AM", tempC: 28 },
      { time: "12 PM", tempC: 30 },
      { time: "3 PM", tempC: 30 },
      { time: "6 PM", tempC: 29, active: true },
      { time: "9 PM", tempC: 27 },
      { time: "12 AM", tempC: 26 },
      { time: "3 AM", tempC: 25 }
    ],
    precipitationTrend: [
      { time: "6 PM", pop: 35 },
      { time: "7 PM", pop: 55 },
      { time: "8 PM", pop: 60 },
      { time: "9 PM", pop: 40 },
      { time: "10 PM", pop: 25 },
      { time: "11 PM", pop: 20 }
    ],
    hourly: [
      { time: "Now", tempC: 29, icon: "rain", pop: "35%", active: true },
      { time: "7 PM", tempC: 28, icon: "rain", pop: "55%" },
      { time: "8 PM", tempC: 27, icon: "cloudy-night", pop: "60%" },
      { time: "9 PM", tempC: 27, icon: "cloudy-night", pop: "40%" },
      { time: "10 PM", tempC: 26, icon: "night", pop: "25%" },
      { time: "11 PM", tempC: 26, icon: "night", pop: "20%" },
      { time: "12 AM", tempC: 25, icon: "night", pop: "15%" },
      { time: "1 AM", tempC: 25, icon: "night", pop: "10%" }
    ],
    daily: [
      { day: "Tue", date: "Nov 04", condition: "Light Rain", highC: 30, lowC: 25, icon: "rain", pop: "55%" },
      { day: "Wed", date: "Nov 05", condition: "Rain Showers", highC: 29, lowC: 25, icon: "rain", pop: "65%" },
      { day: "Thu", date: "Nov 06", condition: "Partly Cloudy", highC: 30, lowC: 24, icon: "partly-cloudy-day", pop: "30%" },
      { day: "Fri", date: "Nov 07", condition: "Heavy Rain", highC: 28, lowC: 24, icon: "heavy-rain", pop: "80%" },
      { day: "Sat", date: "Nov 08", condition: "Cloudy", highC: 29, lowC: 24, icon: "cloudy", pop: "40%" },
      { day: "Sun", date: "Nov 09", condition: "Sunny", highC: 31, lowC: 25, icon: "sunny", pop: "15%" },
      { day: "Mon", date: "Nov 10", condition: "Sunny", highC: 31, lowC: 25, icon: "sunny", pop: "10%" }
    ]
  },
  mumbai: {
    id: "mumbai",
    city: "Mumbai",
    region: "Maharashtra",
    country: "India",
    landmark: "Gateway of India, Mumbai",
    tempC: 32,
    feelsLikeC: 36,
    highC: 33,
    lowC: 26,
    condition: "Sunny & Warm",
    description: "Warm coastal sunshine with sea breeze setting in along the promenade.",
    wind: "16 km/h",
    windDirection: "WNW",
    humidity: "70%",
    pressure: "1011 hPa",
    uvIndex: 8,
    uvStatus: "Very High",
    visibility: "7 km",
    cloudCover: "20%",
    dewPointC: 25,
    precipProbability: "10%",
    icon: "sunny",
    airQuality: {
      aqi: 72,
      status: "Moderate",
      badgeClass: "badge-moderate",
      message: "Air quality acceptable; sensitive groups should limit exertion."
    },
    sunSchedule: {
      sunrise: "6:38 AM",
      sunset: "6:01 PM",
      progress: 0.81
    },
    lastUpdated: "Today, 6:42 PM",
    activeAlert: {
      title: "Warm Weather Advisory",
      time: "Afternoon",
      message: "Stay hydrated during peak sun hours.",
      type: "advisory"
    },
    tempTrend24h: [
      { time: "6 AM", tempC: 26 },
      { time: "9 AM", tempC: 29 },
      { time: "12 PM", tempC: 33 },
      { time: "3 PM", tempC: 33 },
      { time: "6 PM", tempC: 32, active: true },
      { time: "9 PM", tempC: 29 },
      { time: "12 AM", tempC: 27 },
      { time: "3 AM", tempC: 26 }
    ],
    precipitationTrend: [
      { time: "6 PM", pop: 5 },
      { time: "7 PM", pop: 5 },
      { time: "8 PM", pop: 10 },
      { time: "9 PM", pop: 10 },
      { time: "10 PM", pop: 5 },
      { time: "11 PM", pop: 5 }
    ],
    hourly: [
      { time: "Now", tempC: 32, icon: "sunny", pop: "5%", active: true },
      { time: "7 PM", tempC: 31, icon: "sunny", pop: "5%" },
      { time: "8 PM", tempC: 29, icon: "night", pop: "10%" },
      { time: "9 PM", tempC: 28, icon: "night", pop: "10%" },
      { time: "10 PM", tempC: 28, icon: "night", pop: "5%" },
      { time: "11 PM", tempC: 27, icon: "night", pop: "5%" },
      { time: "12 AM", tempC: 27, icon: "night", pop: "5%" },
      { time: "1 AM", tempC: 26, icon: "night", pop: "5%" }
    ],
    daily: [
      { day: "Tue", date: "Nov 04", condition: "Sunny", highC: 33, lowC: 26, icon: "sunny", pop: "5%" },
      { day: "Wed", date: "Nov 05", condition: "Sunny", highC: 33, lowC: 25, icon: "sunny", pop: "5%" },
      { day: "Thu", date: "Nov 06", condition: "Partly Cloudy", highC: 32, lowC: 25, icon: "partly-cloudy-day", pop: "10%" },
      { day: "Fri", date: "Nov 07", condition: "Sunny", highC: 33, lowC: 26, icon: "sunny", pop: "5%" },
      { day: "Sat", date: "Nov 08", condition: "Sunny", highC: 34, lowC: 26, icon: "sunny", pop: "5%" },
      { day: "Sun", date: "Nov 09", condition: "Partly Cloudy", highC: 33, lowC: 25, icon: "partly-cloudy-day", pop: "10%" },
      { day: "Mon", date: "Nov 10", condition: "Sunny", highC: 33, lowC: 26, icon: "sunny", pop: "5%" }
    ]
  },
  delhi: {
    id: "delhi",
    city: "Delhi",
    region: "NCR",
    country: "India",
    landmark: "India Gate, New Delhi",
    tempC: 26,
    feelsLikeC: 26,
    highC: 28,
    lowC: 17,
    condition: "Hazy Sunshine",
    description: "Mild autumn afternoon with dry atmosphere and haze setting into the twilight.",
    wind: "11 km/h",
    windDirection: "NW",
    humidity: "55%",
    pressure: "1015 hPa",
    uvIndex: 5,
    uvStatus: "Moderate",
    visibility: "4 km",
    cloudCover: "15%",
    dewPointC: 15,
    precipProbability: "5%",
    icon: "fog",
    airQuality: {
      aqi: 145,
      status: "Unhealthy",
      badgeClass: "badge-moderate",
      message: "High PM2.5 levels. Outdoor exercise should be reduced."
    },
    sunSchedule: {
      sunrise: "6:35 AM",
      sunset: "5:32 PM",
      progress: 0.85
    },
    lastUpdated: "Today, 6:42 PM",
    activeAlert: {
      title: "Haze & Dust Advisory",
      time: "Tonight",
      message: "Reduced visibility overnight due to seasonal haze.",
      type: "advisory"
    },
    tempTrend24h: [
      { time: "6 AM", tempC: 18 },
      { time: "9 AM", tempC: 22 },
      { time: "12 PM", tempC: 27 },
      { time: "3 PM", tempC: 28 },
      { time: "6 PM", tempC: 26, active: true },
      { time: "9 PM", tempC: 22 },
      { time: "12 AM", tempC: 19 },
      { time: "3 AM", tempC: 17 }
    ],
    precipitationTrend: [
      { time: "6 PM", pop: 0 },
      { time: "7 PM", pop: 0 },
      { time: "8 PM", pop: 0 },
      { time: "9 PM", pop: 0 },
      { time: "10 PM", pop: 0 },
      { time: "11 PM", pop: 0 }
    ],
    hourly: [
      { time: "Now", tempC: 26, icon: "fog", pop: "0%", active: true },
      { time: "7 PM", tempC: 24, icon: "fog", pop: "0%" },
      { time: "8 PM", tempC: 22, icon: "night", pop: "0%" },
      { time: "9 PM", tempC: 21, icon: "night", pop: "0%" },
      { time: "10 PM", tempC: 20, icon: "night", pop: "0%" },
      { time: "11 PM", tempC: 19, icon: "night", pop: "0%" },
      { time: "12 AM", tempC: 18, icon: "night", pop: "0%" },
      { time: "1 AM", tempC: 18, icon: "night", pop: "0%" }
    ],
    daily: [
      { day: "Tue", date: "Nov 04", condition: "Hazy", highC: 28, lowC: 17, icon: "fog", pop: "0%" },
      { day: "Wed", date: "Nov 05", condition: "Hazy", highC: 28, lowC: 17, icon: "fog", pop: "0%" },
      { day: "Thu", date: "Nov 06", condition: "Sunny", highC: 29, lowC: 16, icon: "sunny", pop: "0%" },
      { day: "Fri", date: "Nov 07", condition: "Partly Cloudy", highC: 28, lowC: 16, icon: "partly-cloudy-day", pop: "5%" },
      { day: "Sat", date: "Nov 08", condition: "Hazy", highC: 27, lowC: 16, icon: "fog", pop: "0%" },
      { day: "Sun", date: "Nov 09", condition: "Sunny", highC: 28, lowC: 15, icon: "sunny", pop: "0%" },
      { day: "Mon", date: "Nov 10", condition: "Sunny", highC: 28, lowC: 16, icon: "sunny", pop: "0%" }
    ]
  },
  hyderabad: {
    id: "hyderabad",
    city: "Hyderabad",
    region: "Telangana",
    country: "India",
    landmark: "Charminar, Hyderabad",
    tempC: 29,
    feelsLikeC: 30,
    highC: 31,
    lowC: 20,
    condition: "Mostly Clear",
    description: "Dry pleasant evening with clear skies and slight breezy winds from the east.",
    wind: "16 km/h",
    windDirection: "ENE",
    humidity: "48%",
    pressure: "1012 hPa",
    uvIndex: 7,
    uvStatus: "High",
    visibility: "10 km",
    cloudCover: "15%",
    dewPointC: 17,
    precipProbability: "5%",
    icon: "sunny",
    airQuality: {
      aqi: 58,
      status: "Moderate",
      badgeClass: "badge-moderate",
      message: "Moderate air quality. Safe for normal outdoor activities."
    },
    sunSchedule: {
      sunrise: "6:16 AM",
      sunset: "5:47 PM",
      progress: 0.82
    },
    lastUpdated: "Today, 6:42 PM",
    activeAlert: {
      title: "Clear Skies",
      time: "Tonight",
      message: "Stargazing conditions optimal with minimal cloud cover.",
      type: "advisory"
    },
    tempTrend24h: [
      { time: "6 AM", tempC: 21 },
      { time: "9 AM", tempC: 25 },
      { time: "12 PM", tempC: 30 },
      { time: "3 PM", tempC: 31 },
      { time: "6 PM", tempC: 29, active: true },
      { time: "9 PM", tempC: 25 },
      { time: "12 AM", tempC: 23 },
      { time: "3 AM", tempC: 21 }
    ],
    precipitationTrend: [
      { time: "6 PM", pop: 5 },
      { time: "7 PM", pop: 5 },
      { time: "8 PM", pop: 5 },
      { time: "9 PM", pop: 5 },
      { time: "10 PM", pop: 0 },
      { time: "11 PM", pop: 0 }
    ],
    hourly: [
      { time: "Now", tempC: 29, icon: "sunny", pop: "5%", active: true },
      { time: "7 PM", tempC: 27, icon: "sunny", pop: "5%" },
      { time: "8 PM", tempC: 26, icon: "night", pop: "5%" },
      { time: "9 PM", tempC: 25, icon: "night", pop: "5%" },
      { time: "10 PM", tempC: 24, icon: "night", pop: "0%" },
      { time: "11 PM", tempC: 23, icon: "night", pop: "0%" },
      { time: "12 AM", tempC: 22, icon: "night", pop: "0%" },
      { time: "1 AM", tempC: 21, icon: "night", pop: "0%" }
    ],
    daily: [
      { day: "Tue", date: "Nov 04", condition: "Sunny", highC: 31, lowC: 20, icon: "sunny", pop: "5%" },
      { day: "Wed", date: "Nov 05", condition: "Sunny", highC: 31, lowC: 20, icon: "sunny", pop: "5%" },
      { day: "Thu", date: "Nov 06", condition: "Partly Cloudy", highC: 30, lowC: 19, icon: "partly-cloudy-day", pop: "10%" },
      { day: "Fri", date: "Nov 07", condition: "Sunny", highC: 30, lowC: 19, icon: "sunny", pop: "5%" },
      { day: "Sat", date: "Nov 08", condition: "Sunny", highC: 31, lowC: 20, icon: "sunny", pop: "5%" },
      { day: "Sun", date: "Nov 09", condition: "Sunny", highC: 32, lowC: 20, icon: "sunny", pop: "5%" },
      { day: "Mon", date: "Nov 10", condition: "Sunny", highC: 31, lowC: 20, icon: "sunny", pop: "5%" }
    ]
  },
  kodaikanal: {
    id: "kodaikanal",
    city: "Kodaikanal",
    region: "Tamil Nadu",
    country: "India",
    landmark: "Kodai Lake, Kodaikanal",
    tempC: 16,
    feelsLikeC: 15,
    highC: 18,
    lowC: 9,
    condition: "Chilly & Foggy",
    description: "Cold mountain mist rolling over pine forests with cool evening chill.",
    wind: "8 km/h",
    windDirection: "NE",
    humidity: "92%",
    pressure: "1018 hPa",
    uvIndex: 4,
    uvStatus: "Moderate",
    visibility: "3 km",
    cloudCover: "85%",
    dewPointC: 14,
    precipProbability: "45%",
    icon: "fog",
    airQuality: {
      aqi: 18,
      status: "Excellent",
      badgeClass: "badge-good",
      message: "Pristine mountain air, high elevation freshness."
    },
    sunSchedule: {
      sunrise: "6:16 AM",
      sunset: "6:01 PM",
      progress: 0.78
    },
    lastUpdated: "Today, 6:42 PM",
    activeAlert: {
      title: "Chilly Night Warning",
      time: "Tonight",
      message: "Temperatures expected to drop to 9°C. Warm clothing advised.",
      type: "advisory"
    },
    tempTrend24h: [
      { time: "6 AM", tempC: 10 },
      { time: "9 AM", tempC: 14 },
      { time: "12 PM", tempC: 17 },
      { time: "3 PM", tempC: 16 },
      { time: "6 PM", tempC: 15, active: true },
      { time: "9 PM", tempC: 13 },
      { time: "12 AM", tempC: 11 },
      { time: "3 AM", tempC: 9 }
    ],
    precipitationTrend: [
      { time: "6 PM", pop: 30 },
      { time: "7 PM", pop: 45 },
      { time: "8 PM", pop: 40 },
      { time: "9 PM", pop: 30 },
      { time: "10 PM", pop: 20 },
      { time: "11 PM", pop: 15 }
    ],
    hourly: [
      { time: "Now", tempC: 16, icon: "fog", pop: "30%", active: true },
      { time: "7 PM", tempC: 15, icon: "fog", pop: "45%" },
      { time: "8 PM", tempC: 14, icon: "night", pop: "40%" },
      { time: "9 PM", tempC: 13, icon: "night", pop: "30%" },
      { time: "10 PM", tempC: 12, icon: "night", pop: "20%" },
      { time: "11 PM", tempC: 11, icon: "night", pop: "15%" },
      { time: "12 AM", tempC: 10, icon: "night", pop: "10%" },
      { time: "1 AM", tempC: 9, icon: "night", pop: "10%" }
    ],
    daily: [
      { day: "Tue", date: "Nov 04", condition: "Fog & Mist", highC: 17, lowC: 9, icon: "fog", pop: "45%" },
      { day: "Wed", date: "Nov 05", condition: "Partly Cloudy", highC: 18, lowC: 10, icon: "partly-cloudy-day", pop: "20%" },
      { day: "Thu", date: "Nov 06", condition: "Showers", highC: 16, lowC: 9, icon: "rain", pop: "50%" },
      { day: "Fri", date: "Nov 07", condition: "Foggy", highC: 15, lowC: 8, icon: "fog", pop: "60%" },
      { day: "Sat", date: "Nov 08", condition: "Partly Cloudy", highC: 17, lowC: 9, icon: "partly-cloudy-day", pop: "30%" },
      { day: "Sun", date: "Nov 09", condition: "Sunny", highC: 18, lowC: 10, icon: "sunny", pop: "15%" },
      { day: "Mon", date: "Nov 10", condition: "Sunny", highC: 18, lowC: 10, icon: "sunny", pop: "10%" }
    ]
  }
};

const DEMO_NOTIFICATIONS = [
  {
    id: 1,
    title: "Rain Alert",
    time: "10m ago",
    description: "Moderate rain expected in Coimbatore after 8:00 PM.",
    type: "rain",
    unread: true
  },
  {
    id: 2,
    title: "Weather Update",
    time: "45m ago",
    description: "Temperature may drop to 24°C tonight.",
    type: "storm",
    unread: true
  }
];

// Comprehensive Realistic Demo Weather Alerts Dataset
// NOTE: These are simulated sample weather alerts for UI design & development purposes.
const DEMO_WEATHER_ALERTS = [
  {
    id: "alert-1",
    cityId: "coimbatore",
    location: "Coimbatore, Tamil Nadu",
    title: "Light to Moderate Rain Expected",
    severity: "warning",
    severityLabel: "Warning",
    category: "rain",
    icon: "rain",
    description: "Chance of light to moderate rain in Coimbatore between 8:00 PM – 11:00 PM.",
    details: "Convective cloud cluster developing over Western Ghats foothills moving eastward. Rainfall rate between 15–30 mm/h expected with brief spells of reduced visibility.",
    issuedTime: "Today, 5:45 PM",
    duration: "8:00 PM – 11:00 PM (3 hrs)",
    safetyAdvice: "Keep an umbrella handy. Drive cautiously on wet roads and beware of minor water accumulation in low-lying spots.",
    isDemo: true
  },
  {
    id: "alert-2",
    cityId: "coimbatore",
    location: "Coimbatore, Tamil Nadu",
    title: "Thunderstorm Watch",
    severity: "watch",
    severityLabel: "Watch",
    category: "thunderstorm",
    icon: "thunderstorm",
    description: "Possible thunderstorms tomorrow afternoon with gusty winds up to 40 km/h.",
    details: "Atmospheric instability combined with elevated surface humidity may trigger localized squalls and thunder activity across the suburban belts.",
    issuedTime: "Today, 3:30 PM",
    duration: "Tomorrow, 2:00 PM – 6:30 PM",
    safetyAdvice: "Seek indoor shelter when thunder roars. Unplug sensitive electronics and avoid standing under tall trees or metal poles.",
    isDemo: true
  },
  {
    id: "alert-3",
    cityId: "coimbatore",
    location: "Coimbatore, Tamil Nadu",
    title: "Temperature Drop Advisory",
    severity: "advisory",
    severityLabel: "Advisory",
    category: "temperature",
    icon: "temperature",
    description: "Temperature may drop to 24°C tonight (2–3°C lower than today).",
    details: "Post-rain cool breeze front will sweep across the plateau, causing nighttime temperatures to dip pleasantly below seasonal averages.",
    issuedTime: "Today, 6:00 PM",
    duration: "Tonight, 11:00 PM – 6:00 AM",
    safetyAdvice: "Light warm layers recommended for late-night and early-morning two-wheeler commuters.",
    isDemo: true
  },
  {
    id: "alert-4",
    cityId: "chennai",
    location: "Chennai, Tamil Nadu",
    title: "Coastal Strong Wind Advisory",
    severity: "warning",
    severityLabel: "Warning",
    category: "wind",
    icon: "wind",
    description: "Gusty coastal winds reaching 35–45 km/h along Marina and Besant Nagar beaches.",
    details: "Bay of Bengal low pressure gradient creating continuous onshore gusts. High wave action expected near coastal shorelines.",
    issuedTime: "Today, 4:15 PM",
    duration: "6:00 PM – 11:30 PM",
    safetyAdvice: "Fishermen and beach visitors advised to avoid deep water activities. Secure loose rooftop objects.",
    isDemo: true
  },
  {
    id: "alert-5",
    cityId: "chennai",
    location: "Chennai, Tamil Nadu",
    title: "Extreme UV Index Watch",
    severity: "watch",
    severityLabel: "Watch",
    category: "uv",
    icon: "uv",
    description: "UV index peak projected to reach 8–9 (Very High) during midday hours.",
    details: "Unobstructed midday sunlight with high sun angle. Skin damage can occur within 20 minutes without sun protection.",
    issuedTime: "Today, 7:00 AM",
    duration: "Tomorrow, 11:30 AM – 3:00 PM",
    safetyAdvice: "Wear SPF 30+ sunscreen, UV-blocking sunglasses, and wide-brim hats. Stay hydrated.",
    isDemo: true
  },
  {
    id: "alert-6",
    cityId: "ooty",
    location: "Ooty, Tamil Nadu",
    title: "Dense Fog & Mist Watch",
    severity: "advisory",
    severityLabel: "Advisory",
    category: "severe",
    icon: "fog",
    description: "Visibility may reduce below 400m along mountain ghat roads and tea valleys.",
    details: "Rapid nocturnal condensation forming thick valley mist layers across Coonoor and Kotagiri highways.",
    issuedTime: "Today, 6:15 PM",
    duration: "9:00 PM – 7:30 AM",
    safetyAdvice: "Use fog lights and drive at reduced speed. Maintain adequate braking distance on sharp hairpins.",
    isDemo: true
  },
  {
    id: "alert-7",
    cityId: "madurai",
    location: "Madurai, Tamil Nadu",
    title: "Warm Night & High Humidity Advisory",
    severity: "advisory",
    severityLabel: "Advisory",
    category: "temperature",
    icon: "temperature",
    description: "Overnight temperatures will linger around 25–26°C with 70% humidity.",
    details: "Urban heat retention under broken cloud cover causing slow night cooling.",
    issuedTime: "Today, 5:00 PM",
    duration: "Tonight, 9:00 PM – 6:00 AM",
    safetyAdvice: "Ensure adequate indoor ventilation and stay well-hydrated throughout the night.",
    isDemo: true
  },
  {
    id: "alert-8",
    cityId: "bengaluru",
    location: "Bengaluru, Karnataka",
    title: "Sudden Thunderstorm Watch",
    severity: "watch",
    severityLabel: "Watch",
    category: "thunderstorm",
    icon: "thunderstorm",
    description: "Late afternoon lightning strikes and squally wind gusts up to 38 km/h.",
    details: "Localized thermal convection cells forming over city center and eastern suburbs.",
    issuedTime: "Today, 1:30 PM",
    duration: "Tomorrow, 3:30 PM – 7:00 PM",
    safetyAdvice: "Take shelter indoors immediately upon hearing thunder. Avoid parking under old trees.",
    isDemo: true
  }
];

// Demo Notification History Items
const DEMO_NOTIFICATION_HISTORY = [
  {
    id: "notif-1",
    title: "Rain Alert – Coimbatore",
    location: "Coimbatore, Tamil Nadu",
    time: "10m ago",
    description: "Moderate rain expected after 8:00 PM.",
    type: "rain",
    category: "rain",
    severity: "warning",
    read: false
  },
  {
    id: "notif-2",
    title: "Thunderstorm Watch",
    location: "Coimbatore, Tamil Nadu",
    time: "2h ago",
    description: "Possibility of thunderstorms tomorrow afternoon.",
    type: "thunderstorm",
    category: "thunderstorm",
    severity: "watch",
    read: false
  },
  {
    id: "notif-3",
    title: "Temperature Update",
    location: "Coimbatore, Tamil Nadu",
    time: "5h ago",
    description: "Temp may drop to 24°C tonight (2–3°C lower than today).",
    type: "temperature",
    category: "temperature",
    severity: "advisory",
    read: true
  },
  {
    id: "notif-4",
    title: "Coastal Wind Advisory",
    location: "Chennai, Tamil Nadu",
    time: "1d ago",
    description: "Strong sea winds up to 35 km/h along shoreline.",
    type: "wind",
    category: "wind",
    severity: "advisory",
    read: true
  },
  {
    id: "notif-5",
    title: "Air Quality Normalization",
    location: "Bengaluru, Karnataka",
    time: "2d ago",
    description: "AQI improved to Good (38) following evening breeze.",
    type: "severe",
    category: "severe",
    severity: "advisory",
    read: true
  }
];
