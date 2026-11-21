/**
 * SkyCast – Theme & Visual Effects Engine
 * Handles Light / Dark / System theme switching, Glassmorphism toggle,
 * and Weather-Based / Manual Background selection across all five screens.
 *
 * Usage:
 *   SkyCastTheme.apply()               – re-read localStorage and apply theme
 *   SkyCastTheme.apply('light')        – apply a specific mode ('light'|'dark'|'system')
 *   SkyCastTheme.applyGlass()          – re-read localStorage and apply glass effect
 *   SkyCastTheme.applyGlass(bool)      – toggle glassmorphism (true|false)
 *   SkyCastTheme.applyBackground()     – re-read settings and apply appropriate background
 *   SkyCastTheme.applyBackground(data) – apply weather background using provided data/city
 *   SkyCastTheme.setWeatherBg(bool)    – enable/disable weather-based background
 *   SkyCastTheme.setManualBg(key)      – select manual background ('hills'|'mountains'|'snow'|'beach'|'city')
 *   SkyCastTheme.getSetting()          – returns stored mode ('light'|'dark'|'system')
 *   SkyCastTheme.getEffective()        – returns active rendered theme ('light'|'dark')
 *   SkyCastTheme.getGlassSetting()     – returns boolean glass effect preference
 *   SkyCastTheme.getWeatherBgSetting() – returns boolean weather background preference
 *   SkyCastTheme.getManualBgSetting()  – returns manual background selection key
 *   SkyCastTheme.getActiveBg()         – returns active data-bg attribute value
 *
 * Attributes on <html>:
 *   data-theme="light" | "dark"
 *   data-glass="true"  | "false"
 *   data-bg="hills" | "mountains" | "snow" | "beach" | "city" | "weather-sunny" | ...
 *
 * Loaded in <head> so styles are applied before first paint (zero flash).
 */

(function () {
  'use strict';

  var THEME_KEY           = 'skycast_theme';
  var THEME_DEFAULT       = 'dark';
  var GLASS_KEY           = 'skycast_glass_effect';
  var GLASS_DEFAULT       = 'true';
  var WEATHER_BG_KEY      = 'skycast_weather_bg';
  var WEATHER_BG_DEFAULT  = 'false';
  var MANUAL_BG_KEY       = 'skycast_bg_image';
  var MANUAL_BG_DEFAULT   = 'hills';
  var SELECTED_CITY_KEY   = 'skycast_selected_city';
  var SELECTED_CITY_DEF   = 'coimbatore';
  var DEFAULT_SCENIC_BG   = 'assets/images/background.jpg';

  /**
   * Resolve a relative image path to an absolute URL path safe for CSS url() injection.
   * When set via JS, CSS custom properties are resolved from the CSS file's directory.
   * Using an absolute path (starting with '/') avoids cross-directory resolution errors.
   */
  function toAbsoluteUrl(relativePath) {
    if (!relativePath) return '';
    if (relativePath.startsWith('/') || relativePath.startsWith('http')) return relativePath;
    // Strip any leading './' 
    var clean = relativePath.replace(/^\.\//, '');
    // Return with leading slash to make it absolute from the server root
    return '/' + clean;
  }

  // ── City Landmark Registry ────────────────────────────────────────────────
  // Authentic locally stored photographs of famous city landmarks and scenic attractions.
  var CITY_LANDMARKS = {
    coimbatore: {
      city: 'Coimbatore',
      landmark: 'Marudhamalai Temple',
      image: 'assets/images/cities/coimbatore.jpg',
      alt: 'Marudhamalai Murugan Temple, Coimbatore'
    },
    chennai: {
      city: 'Chennai',
      landmark: 'Marina Beach',
      image: 'assets/images/cities/chennai.jpg',
      alt: 'Marina Beach Coastline, Chennai'
    },
    ooty: {
      city: 'Ooty',
      landmark: 'Nilgiri Hills',
      image: 'assets/images/cities/ooty.jpg',
      alt: 'Nilgiri Hills Landscape, Ooty'
    },
    madurai: {
      city: 'Madurai',
      landmark: 'Meenakshi Amman Temple',
      image: 'assets/images/cities/madurai.jpg',
      alt: 'Meenakshi Amman Temple & Golden Lotus Tank, Madurai'
    },
    bengaluru: {
      city: 'Bengaluru',
      landmark: 'Vidhana Soudha',
      image: 'assets/images/cities/bengaluru.jpg',
      alt: 'Vidhana Soudha, Bengaluru'
    },
    salem: {
      city: 'Salem',
      landmark: 'Yercaud Lake & Shevaroy Hills',
      image: 'assets/images/cities/salem.jpg',
      alt: 'Yercaud Lake & Shevaroy Hills, Salem'
    }
  };

  var CITY_ALIASES = {
    'bangalore': 'bengaluru',
    'bengaluru': 'bengaluru',
    'covai': 'coimbatore',
    'kovai': 'coimbatore',
    'coimbatore': 'coimbatore',
    'madras': 'chennai',
    'chennai': 'chennai',
    'ooty': 'ooty',
    'udhagai': 'ooty',
    'udhagamandalam': 'ooty',
    'ootacamund': 'ooty',
    'madurai': 'madurai',
    'salem': 'salem'
  };

  /** Normalize city key for robust landmark lookup */
  function normalizeCityKey(name) {
    if (!name || typeof name !== 'string') return '';
    var raw = name.toLowerCase().trim();
    var clean = raw.replace(/[^a-z0-9]/g, '');
    if (CITY_ALIASES[clean]) return CITY_ALIASES[clean];
    for (var k in CITY_LANDMARKS) {
      if (k === clean || clean.indexOf(k) !== -1 || k.indexOf(clean) !== -1) {
        return k;
      }
    }
    return clean;
  }

  /** Retrieve city landmark information */
  function getCityLandmark(cityNameOrId) {
    var key = normalizeCityKey(cityNameOrId);
    if (CITY_LANDMARKS[key]) {
      var item = CITY_LANDMARKS[key];
      return {
        key: key,
        city: item.city,
        landmark: item.landmark,
        image: item.image,
        alt: item.alt
      };
    }
    return null;
  }

  /** Register or update a city landmark definition dynamically */
  function registerCityLandmark(cityKey, info) {
    if (!cityKey || !info || !info.image) return false;
    var normKey = normalizeCityKey(cityKey) || cityKey.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    CITY_LANDMARKS[normKey] = {
      city: info.city || cityKey,
      landmark: info.landmark || 'City Landmark',
      image: info.image,
      alt: info.alt || ((info.city || cityKey) + ' Landmark')
    };
    return true;
  }

  /**
   * Apply city landmark background image via CSS custom property:
   * --skycast-city-background: url('assets/images/cities/<city>.jpg')
   * Also sets data-city and data-landmark on <html>.
   * If city is unmapped or image fails to load, gracefully falls back to default scenic background.
   */
  function applyCityBackground(cityNameOrId) {
    var cityKey = cityNameOrId;
    if (!cityKey || typeof cityKey !== 'string') {
      cityKey = localStorage.getItem(SELECTED_CITY_KEY) || SELECTED_CITY_DEF;
    }

    var landmark = getCityLandmark(cityKey);
    var targetUrl = toAbsoluteUrl(DEFAULT_SCENIC_BG);
    var activeCityAttr = 'default';

    if (landmark && landmark.image) {
      targetUrl = toAbsoluteUrl(landmark.image);
      activeCityAttr = landmark.key;
    }

    if (document.documentElement) {
      document.documentElement.style.setProperty('--skycast-city-background', "url('" + targetUrl + "')");
      document.documentElement.style.setProperty('--skycast-city-bg', "url('" + targetUrl + "')");
      document.documentElement.setAttribute('data-city', activeCityAttr);
      if (landmark) {
        document.documentElement.setAttribute('data-landmark', landmark.landmark);
      } else {
        document.documentElement.removeAttribute('data-landmark');
      }
    }

    // Graceful fallback on load error
    var fallbackUrl = toAbsoluteUrl(DEFAULT_SCENIC_BG);
    if (targetUrl !== fallbackUrl) {
      var probe = new Image();
      probe.onerror = function () {
        console.warn('SkyCast: Failed to load city landmark image (' + targetUrl + '). Falling back to default scenic background.');
        if (document.documentElement) {
          document.documentElement.style.setProperty('--skycast-city-background', "url('" + fallbackUrl + "')");
          document.documentElement.style.setProperty('--skycast-city-bg', "url('" + fallbackUrl + "')");
          document.documentElement.setAttribute('data-city', 'fallback');
        }
      };
      probe.src = targetUrl;
    }

    return {
      city: cityKey,
      landmark: landmark ? landmark.landmark : null,
      image: targetUrl,
      isMapped: Boolean(landmark)
    };
  }

  /** Return the effective theme ('light' or 'dark') for a given mode string */
  function resolveMode(mode) {
    if (mode === 'light') return 'light';
    if (mode === 'dark')  return 'dark';
    // 'system' or anything else – follow OS preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  /** Apply a theme mode. If mode is omitted, reads localStorage. */
  function apply(mode) {
    if (mode === undefined) {
      mode = localStorage.getItem(THEME_KEY) || THEME_DEFAULT;
    }
    var effective = resolveMode(mode);
    if (document.documentElement) {
      document.documentElement.setAttribute('data-theme', effective);
    }
  }

  /** Apply glassmorphism setting. If enabled is omitted, reads localStorage. */
  function applyGlass(enabled) {
    if (enabled === undefined) {
      var stored = localStorage.getItem(GLASS_KEY);
      enabled = stored !== 'false'; // default is true
    } else if (typeof enabled === 'string') {
      enabled = enabled !== 'false';
    } else {
      enabled = Boolean(enabled);
    }
    if (document.documentElement) {
      document.documentElement.setAttribute('data-glass', enabled ? 'true' : 'false');
    }
  }

  /**
   * Translate a weather object into one of the 8 canonical weather background keys:
   *   - weather-sunny          (Clear sky daytime)
   *   - weather-partly-cloudy   (Partly cloudy / scattered / mainly clear)
   *   - weather-cloudy         (Overcast / dense clouds)
   *   - weather-rainy          (Rain / drizzle / showers)
   *   - weather-stormy         (Thunderstorm)
   *   - weather-snowy          (Snow / sleet / ice / hail)
   *   - weather-night          (Clear sky nighttime)
   *   - weather-foggy          (Fog / mist / haze)
   */
  function resolveWeatherBgKey(weather) {
    if (!weather) return 'weather-sunny';

    var cond = (weather.condition || '').toLowerCase();
    var icon = (weather.icon || '').toLowerCase();

    // Determine day vs night
    var isNight = false;
    if (weather.is_day !== undefined && weather.is_day !== null) {
      isNight = Number(weather.is_day) === 0 || weather.is_day === false;
    } else if (icon === 'night' || icon === 'cloudy-night') {
      isNight = true;
    } else if (weather.sunSchedule && typeof weather.sunSchedule.progress === 'number') {
      isNight = weather.sunSchedule.progress <= 0 || weather.sunSchedule.progress >= 1;
    } else {
      var hour = new Date().getHours();
      isNight = hour < 6 || hour >= 18;
    }

    // 1. Thunderstorm / Storm
    if (cond.includes('thunder') || cond.includes('storm') || cond.includes('squall') || icon.includes('thunder')) {
      return 'weather-stormy';
    }

    // 2. Snow / Ice / Hail / Sleet / Blizzards
    if (cond.includes('snow') || cond.includes('blizzard') || cond.includes('sleet') || cond.includes('flurr') || cond.includes('ice') || cond.includes('hail')) {
      return 'weather-snowy';
    }

    // 3. Fog / Mist / Haze / Smoke / Rime Fog
    if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze') || cond.includes('smoke') || cond.includes('rime') || icon.includes('fog')) {
      return 'weather-foggy';
    }

    // 4. Rain / Drizzle / Showers
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower') || icon.includes('rain')) {
      return 'weather-rainy';
    }

    // 5. Overcast / Dense Clouds (without "partly" or "mostly")
    if (cond.includes('overcast') || (cond.includes('cloudy') && !cond.includes('partly') && !cond.includes('mainly') && !cond.includes('scattered'))) {
      return 'weather-cloudy';
    }

    // 6. Partly Cloudy / Scattered / Mainly Clear
    if (cond.includes('partly') || cond.includes('mainly') || cond.includes('scatter') || icon.includes('partly-cloudy') || (cond.includes('cloud') && !cond.includes('overcast'))) {
      return 'weather-partly-cloudy';
    }

    // 7 & 8. Clear / Sunny
    if (isNight) {
      return 'weather-night';
    }
    return 'weather-sunny';
  }

  /**
   * Apply background according to settings:
   * If skycast_weather_bg is "true", maps current weather to a weather-based background.
   * If skycast_weather_bg is "false", applies the manual gallery background (default: "hills").
   */
  function applyBackground(dataOrCity) {
    var isWeatherBg = localStorage.getItem(WEATHER_BG_KEY) === 'true';
    var bgKey = MANUAL_BG_DEFAULT;

    var cityKey = null;
    if (typeof dataOrCity === 'string' && dataOrCity) {
      cityKey = dataOrCity;
    } else {
      cityKey = localStorage.getItem(SELECTED_CITY_KEY) || SELECTED_CITY_DEF;
    }

    // Keep city landmark background in sync with the active city
    applyCityBackground(cityKey);

    if (isWeatherBg) {
      var weather = null;
      if (dataOrCity && typeof dataOrCity === 'object' && (dataOrCity.condition || dataOrCity.icon)) {
        weather = dataOrCity;
      } else {
        var normCity = (cityKey || SELECTED_CITY_DEF).toLowerCase().trim();

        if (window.WeatherService && typeof window.WeatherService.getCityWeather === 'function') {
          weather = window.WeatherService.getCityWeather(normCity);
        } else if (typeof DEMO_LOCATIONS !== 'undefined' && DEMO_LOCATIONS) {
          weather = DEMO_LOCATIONS[normCity] || DEMO_LOCATIONS[SELECTED_CITY_DEF];
        }
      }
      bgKey = resolveWeatherBgKey(weather);
    } else {
      bgKey = localStorage.getItem(MANUAL_BG_KEY) || MANUAL_BG_DEFAULT;
    }

    if (document.documentElement) {
      document.documentElement.setAttribute('data-bg', bgKey);
    }
    return bgKey;
  }

  /** Set Weather-Based Background enabled state */
  function setWeatherBg(enabled) {
    var val = Boolean(enabled).toString();
    localStorage.setItem(WEATHER_BG_KEY, val);
    return applyBackground();
  }

  /** Set Manual Gallery Background (does NOT overwrite weather bg toggle) */
  function setManualBg(bgKey) {
    if (bgKey) {
      localStorage.setItem(MANUAL_BG_KEY, bgKey);
    }
    if (localStorage.getItem(WEATHER_BG_KEY) !== 'true') {
      applyBackground();
    }
    return (document.documentElement && document.documentElement.getAttribute('data-bg')) || bgKey;
  }

  // ── OS preference change listener (System mode responds in real-time) ──────
  if (window.matchMedia) {
    var mql = window.matchMedia('(prefers-color-scheme: light)');
    var handleSchemeChange = function () {
      var stored = localStorage.getItem(THEME_KEY) || THEME_DEFAULT;
      if (stored === 'system') {
        apply('system');
      }
    };
    if (mql.addEventListener) {
      mql.addEventListener('change', handleSchemeChange);
    } else if (mql.addListener) {
      mql.addListener(handleSchemeChange);
    }
  }

  // ── Cross-tab sync via storage event ──────────────────────────────────────
  window.addEventListener('storage', function (e) {
    if (e.key === THEME_KEY) {
      apply(e.newValue || THEME_DEFAULT);
    } else if (e.key === GLASS_KEY) {
      applyGlass(e.newValue !== 'false');
    } else if (e.key === WEATHER_BG_KEY || e.key === MANUAL_BG_KEY) {
      applyBackground();
    } else if (e.key === SELECTED_CITY_KEY) {
      applyCityBackground(e.newValue || SELECTED_CITY_DEF);
      applyBackground(e.newValue || SELECTED_CITY_DEF);
    }
  });

  // ── Local window storage hook for instant reactive updates ───────────────
  try {
    var rawSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
      rawSetItem.apply(this, arguments);
      if (key === WEATHER_BG_KEY || key === MANUAL_BG_KEY) {
        applyBackground();
      } else if (key === SELECTED_CITY_KEY) {
        applyCityBackground(value || SELECTED_CITY_DEF);
        applyBackground(value || SELECTED_CITY_DEF);
      }
      if (key === 'skycast_refresh_interval') {
        if (window.WeatherService && window.WeatherService.autoRefresh) {
          window.WeatherService.autoRefresh.restart();
        }
      }
    };
  } catch (e) {
    // Fail gracefully in restricted storage environments
  }

  // ── Reactive listener for live weather updates dispatched by WeatherService ──
  window.addEventListener('skycast:weatherUpdated', function (e) {
    if (localStorage.getItem(WEATHER_BG_KEY) === 'true') {
      var currentCity = (localStorage.getItem(SELECTED_CITY_KEY) || SELECTED_CITY_DEF).toLowerCase();
      if (!e.detail || !e.detail.cityId || e.detail.cityId.toLowerCase() === currentCity) {
        applyBackground(e.detail && e.detail.data);
      }
    }
  });

  // Re-evaluate on DOMContentLoaded once scripts/services are ready
  document.addEventListener('DOMContentLoaded', function () {
    applyCityBackground();
    applyBackground();
  });

  // Expose city background manager
  var SkyCastCityBackground = {
    apply: applyCityBackground,
    getLandmark: getCityLandmark,
    register: registerCityLandmark,
    getRegistry: function () {
      return Object.assign({}, CITY_LANDMARKS);
    },
    normalizeKey: normalizeCityKey
  };

  window.SkyCastCityBackground = SkyCastCityBackground;

  // Expose public API
  window.SkyCastTheme = {
    apply: apply,
    applyGlass: applyGlass,
    applyBackground: applyBackground,
    applyCityBackground: applyCityBackground,
    cityBackground: SkyCastCityBackground,
    resolveWeatherBg: resolveWeatherBgKey,
    setWeatherBg: setWeatherBg,
    setManualBg: setManualBg,
    getSetting: function () {
      return localStorage.getItem(THEME_KEY) || THEME_DEFAULT;
    },
    getEffective: function () {
      return (document.documentElement && document.documentElement.getAttribute('data-theme')) || 'dark';
    },
    getGlassSetting: function () {
      return localStorage.getItem(GLASS_KEY) !== 'false';
    },
    getWeatherBgSetting: function () {
      return localStorage.getItem(WEATHER_BG_KEY) === 'true';
    },
    getManualBgSetting: function () {
      return localStorage.getItem(MANUAL_BG_KEY) || MANUAL_BG_DEFAULT;
    },
    getActiveBg: function () {
      return (document.documentElement && document.documentElement.getAttribute('data-bg')) || MANUAL_BG_DEFAULT;
    },
    getActiveCity: function () {
      return (document.documentElement && document.documentElement.getAttribute('data-city')) || 'default';
    },
    getActiveLandmark: function () {
      return (document.documentElement && document.documentElement.getAttribute('data-landmark')) || null;
    }
  };

  // Apply immediately on parse (zero-flash)
  apply();
  applyGlass();
  applyCityBackground();
  applyBackground();
})();
