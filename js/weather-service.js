/**
 * SkyCast Weather Forecast - Unified Weather Service Interface
 * Synchronous backward-compatible client with Asynchronous Live API support & Mock Fallback.
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.WeatherService = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const DEFAULT_CITY_ID = "coimbatore";
  const API_BASE_URL = "http://127.0.0.1:5000/api";

  // Pre-configured fallback search list
  const SEARCHABLE_CITIES = [
    { city: "Coimbatore", region: "Tamil Nadu", key: "coimbatore" },
    { city: "Chennai",    region: "Tamil Nadu", key: "chennai" },
    { city: "Ooty",       region: "Tamil Nadu", key: "ooty" },
    { city: "Madurai",    region: "Tamil Nadu", key: "madurai" },
    { city: "Bengaluru",  region: "Karnataka",  key: "bengaluru" },
    { city: "Salem",      region: "Tamil Nadu", key: "salem" },
    { city: "Kochi",      region: "Kerala",     key: "kochi" },
    { city: "Mumbai",     region: "Maharashtra",key: "mumbai" },
    { city: "Delhi",      region: "NCR",        key: "delhi" },
    { city: "Hyderabad",  region: "Telangana",  key: "hyderabad" },
    { city: "Kodaikanal", region: "Tamil Nadu", key: "kodaikanal" }
  ];

  // In-memory live response cache
  const _liveCache = {};
  let _currentDataSource = "mock"; // 'live', 'cache', or 'mock'

  function _getRepo() {
    if (typeof DEMO_LOCATIONS !== "undefined" && DEMO_LOCATIONS) {
      return DEMO_LOCATIONS;
    }
    return {};
  }

  /**
   * Synchronous accessor for immediate render (ensures zero regression).
   * Returns live cached data if available; otherwise falls back to mock-data.js.
   */
  function getCityWeather(cityId) {
    const key = (cityId || "").toLowerCase().trim();
    if (_liveCache[key]) {
      return _liveCache[key];
    }
    const repo = _getRepo();
    if (repo[key]) {
      return repo[key];
    }
    return repo[DEFAULT_CITY_ID] || Object.values(repo)[0] || null;
  }

  /**
   * Asynchronous fetcher querying the Flask REST API.
   * If Flask or Open-Meteo is unreachable, catches the error and provides safe fallback.
   * @param {string} cityId - City name, ID or coordinates
   * @param {number} [lat] - Optional latitude
   * @param {number} [lon] - Optional longitude
   * @param {boolean} [forceRefresh=false] - If true, bypasses server-side cache
   * @returns {Promise<Object>} Formatted weather object with source indicator
   */
  async function fetchLiveCityWeather(cityId, lat, lon, forceRefresh = false) {
    const key = (cityId || DEFAULT_CITY_ID).toLowerCase().trim();
    let url = `${API_BASE_URL}/weather/complete?city=${encodeURIComponent(cityId || DEFAULT_CITY_ID)}`;
    if (typeof lat === "number" && typeof lon === "number") {
      url += `&lat=${lat}&lon=${lon}`;
    }
    if (forceRefresh) {
      url += `&refresh=true`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const payload = await res.json();
        if (payload.success && payload.data) {
          const liveData = payload.data;
          _currentDataSource = payload.source || "live";
          liveData.source = _currentDataSource;
          _liveCache[key] = liveData;
          _liveCache[liveData.id] = liveData;

          // Dispatch event so any listening screen can reactively update
          if (typeof window !== "undefined" && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent("skycast:weatherUpdated", {
              detail: { cityId: key, data: liveData, source: _currentDataSource }
            }));
          }
          return liveData;
        }
      }
    } catch (err) {
      // Flask or Open-Meteo offline: Graceful fallback
      console.warn("[WeatherService] Live API unavailable. Using mock repository fallback:", err.message);
    }

    _currentDataSource = "mock";
    const fallbackData = getCityWeather(key);
    if (fallbackData) {
      fallbackData.source = "mock";
    }
    return fallbackData;
  }

  /**
   * Search cities using live geocoding API with immediate local fallback
   */
  async function searchCitiesAsync(query) {
    const filter = (query || "").trim();
    if (!filter) return SEARCHABLE_CITIES.slice(0, 5);

    try {
      const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(filter)}`);
      if (res.ok) {
        const payload = await res.json();
        if (payload.success && Array.isArray(payload.data) && payload.data.length > 0) {
          return payload.data;
        }
      }
    } catch (e) {
      // Fallback
    }
    return searchCities(filter);
  }

  /**
   * Synchronous substring search across canonical list
   */
  function searchCities(query) {
    const filter = (query || "").toLowerCase().trim();
    if (!filter) return SEARCHABLE_CITIES.slice(0, 5);

    return SEARCHABLE_CITIES.filter(c =>
      c.city.toLowerCase().includes(filter) ||
      c.region.toLowerCase().includes(filter)
    );
  }

  function getCitiesWeather(cityIds = []) {
    return cityIds.map(id => getCityWeather(id)).filter(Boolean);
  }

  function getWeatherAlerts(cityId) {
    if (typeof DEMO_WEATHER_ALERTS !== "undefined" && Array.isArray(DEMO_WEATHER_ALERTS)) {
      return DEMO_WEATHER_ALERTS;
    }
    const cityData = getCityWeather(cityId);
    if (cityData && cityData.activeAlert) {
      return [cityData.activeAlert];
    }
    return [];
  }

  function getNotificationHistory() {
    if (typeof DEMO_NOTIFICATION_HISTORY !== "undefined" && Array.isArray(DEMO_NOTIFICATION_HISTORY)) {
      return DEMO_NOTIFICATION_HISTORY;
    }
    return [];
  }

  function getCurrentDataSource() {
    return _currentDataSource;
  }

  // ─── Shared Auto-Refresh Scheduler ───────────────────────────────────
  const REFRESH_STORAGE_KEY = "skycast_refresh_interval";
  const DEFAULT_REFRESH_MINUTES = "30";
  let _autoRefreshTimer = null;
  let _isAutoRefreshing = false;
  let _lastAutoRefreshTime = 0;
  let _nextAutoRefreshTime = 0;
  let _activeIntervalMs = 0;
  let _isTabHidden = false;
  let _testIntervalMs = null; // When set, overrides production interval for testing without altering localStorage

  function _parseIntervalMinutes(val) {
    if (val === "off" || val === "0" || val === 0 || val === false || val === "false") {
      return 0;
    }
    const parsed = parseInt(val, 10);
    return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
  }

  function _getEffectiveIntervalMs() {
    if (_testIntervalMs !== null && _testIntervalMs > 0) {
      return _testIntervalMs;
    }
    const stored = (typeof localStorage !== "undefined" && localStorage.getItem(REFRESH_STORAGE_KEY)) ?? DEFAULT_REFRESH_MINUTES;
    const minutes = _parseIntervalMinutes(stored);
    if (minutes <= 0) return 0;
    return minutes * 60 * 1000;
  }

  async function _executeAutoRefresh() {
    if (_isAutoRefreshing) return null;
    _isAutoRefreshing = true;

    try {
      const activeCity = (typeof localStorage !== "undefined" && localStorage.getItem("skycast_selected_city")) || DEFAULT_CITY_ID;
      // Normal auto-refresh respects backend cache (forceRefresh = false)
      const data = await fetchLiveCityWeather(activeCity, undefined, undefined, false);
      _lastAutoRefreshTime = Date.now();
      return data;
    } catch (err) {
      console.warn("[WeatherService] Auto-refresh tick failed:", err);
      return null;
    } finally {
      _isAutoRefreshing = false;
    }
  }

  function _scheduleNextTick(delayMs) {
    if (_autoRefreshTimer) {
      clearTimeout(_autoRefreshTimer);
      _autoRefreshTimer = null;
    }

    const intervalMs = _getEffectiveIntervalMs();
    if (intervalMs <= 0) {
      _activeIntervalMs = 0;
      _nextAutoRefreshTime = 0;
      return;
    }

    _activeIntervalMs = intervalMs;
    const waitTime = typeof delayMs === "number" && delayMs >= 0 ? delayMs : intervalMs;
    _nextAutoRefreshTime = Date.now() + waitTime;

    _autoRefreshTimer = setTimeout(async () => {
      _autoRefreshTimer = null;
      if (!_isTabHidden) {
        await _executeAutoRefresh();
      }
      // Re-schedule subsequent tick
      _scheduleNextTick();
    }, waitTime);
  }

  function startAutoRefresh(customDelayMs) {
    _scheduleNextTick(customDelayMs);
  }

  function stopAutoRefresh() {
    if (_autoRefreshTimer) {
      clearTimeout(_autoRefreshTimer);
      _autoRefreshTimer = null;
    }
    _nextAutoRefreshTime = 0;
    _activeIntervalMs = 0;
  }

  function restartAutoRefresh(customDelayMs) {
    stopAutoRefresh();
    startAutoRefresh(customDelayMs);
  }

  async function triggerAutoRefresh(forceRefresh = false) {
    if (_isAutoRefreshing) return null;
    _isAutoRefreshing = true;
    try {
      const activeCity = (typeof localStorage !== "undefined" && localStorage.getItem("skycast_selected_city")) || DEFAULT_CITY_ID;
      const data = await fetchLiveCityWeather(activeCity, undefined, undefined, Boolean(forceRefresh));
      _lastAutoRefreshTime = Date.now();
      return data;
    } finally {
      _isAutoRefreshing = false;
      _scheduleNextTick();
    }
  }

  function getAutoRefreshStatus() {
    const rawVal = (typeof localStorage !== "undefined" && localStorage.getItem(REFRESH_STORAGE_KEY)) ?? DEFAULT_REFRESH_MINUTES;
    const intervalMinutes = rawVal === "off" || rawVal === "0" ? "off" : _parseIntervalMinutes(rawVal);
    const hasTimer = Boolean(_autoRefreshTimer);
    return {
      running: hasTimer || (_activeIntervalMs > 0 && !_isTabHidden),
      timerActive: hasTimer,
      intervalMinutes: intervalMinutes,
      intervalMs: _activeIntervalMs,
      lastRefreshTime: _lastAutoRefreshTime,
      nextRefreshTime: _nextAutoRefreshTime,
      isRefreshing: _isAutoRefreshing,
      isPaused: _isTabHidden,
      isTestMode: _testIntervalMs !== null,
      activeCity: (typeof localStorage !== "undefined" && localStorage.getItem("skycast_selected_city")) || DEFAULT_CITY_ID
    };
  }

  function setTestInterval(ms) {
    _testIntervalMs = typeof ms === "number" && ms > 0 ? ms : null;
    restartAutoRefresh();
  }

  // ─── Browser Visibility Change Listener ──────────────────────────────
  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("visibilitychange", () => {
      _isTabHidden = document.hidden;
      if (_isTabHidden) {
        // Pause timer while hidden to prevent background wakeups
        if (_autoRefreshTimer) {
          clearTimeout(_autoRefreshTimer);
          _autoRefreshTimer = null;
        }
      } else {
        // Tab became visible again
        const intervalMs = _getEffectiveIntervalMs();
        if (intervalMs > 0) {
          const now = Date.now();
          const elapsed = _lastAutoRefreshTime > 0 ? (now - _lastAutoRefreshTime) : 0;
          if (_lastAutoRefreshTime > 0 && elapsed >= intervalMs) {
            // Data is stale: trigger a single refresh immediately, then resume schedule
            _executeAutoRefresh().then(() => _scheduleNextTick());
          } else {
            // Data is still fresh: schedule remaining time
            const remaining = Math.max(100, intervalMs - elapsed);
            _scheduleNextTick(remaining);
          }
        }
      }
    });
  }

  // ─── Storage Change Listener (Cross-Tab & Dynamic Interval Sync) ─────
  if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("storage", (e) => {
      if (e.key === REFRESH_STORAGE_KEY || e.key === "skycast_selected_city") {
        restartAutoRefresh();
      }
    });
  }

  const autoRefreshAPI = {
    start: startAutoRefresh,
    stop: stopAutoRefresh,
    restart: restartAutoRefresh,
    triggerNow: triggerAutoRefresh,
    getStatus: getAutoRefreshStatus,
    setTestInterval: setTestInterval
  };

  // ─── Auto-Start on Load ──────────────────────────────────────────────
  if (typeof window !== "undefined") {
    window.SkyCastAutoRefresh = autoRefreshAPI;
    setTimeout(() => {
      startAutoRefresh();
    }, 0);
  }

  return {
    DEFAULT_CITY_ID,
    searchableCities: SEARCHABLE_CITIES,
    getCityWeather,
    fetchLiveCityWeather,
    searchCities,
    searchCitiesAsync,
    getCitiesWeather,
    getWeatherAlerts,
    getNotificationHistory,
    getCurrentDataSource,
    autoRefresh: autoRefreshAPI
  };
});
