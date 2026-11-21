/**
 * SkyCast Weather Forecast - Shared Utility Functions
 * Centralized formatting, unit conversions, and weather icon mappings.
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SkyCastUtils = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // --- Canonical SVG Weather Icon Dictionary ---
  const WEATHER_ICONS = {
    "sunny": `
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="10" fill="#FACC15" />
        <g stroke="#FACC15" stroke-width="3" stroke-linecap="round">
          <line x1="24" y1="4" x2="24" y2="8" />
          <line x1="24" y1="40" x2="24" y2="44" />
          <line x1="4" y1="24" x2="8" y2="24" />
          <line x1="40" y1="24" x2="44" y2="24" />
          <line x1="9.8" y1="9.8" x2="12.6" y2="12.6" />
          <line x1="35.4" y1="35.4" x2="38.2" y2="38.2" />
          <line x1="9.8" y1="38.2" x2="12.6" y2="35.4" />
          <line x1="35.4" y1="12.6" x2="38.2" y2="9.8" />
        </g>
      </svg>
    `,
    "partly-cloudy-day": `
      <svg viewBox="0 0 54 54" fill="none">
        <circle cx="36" cy="18" r="9" fill="#FACC15" />
        <g stroke="#FACC15" stroke-width="2.5" stroke-linecap="round">
          <line x1="36" y1="4" x2="36" y2="7" />
          <line x1="48" y1="18" x2="51" y2="18" />
          <line x1="45" y1="9" x2="47" y2="7" />
          <line x1="45" y1="27" x2="47" y2="29" />
        </g>
        <path d="M14 40C10.7 40 8 37.3 8 34C8 31 10.2 28.5 13.1 28.1C14 22.9 18.5 19 24 19C30.1 19 35 23.9 35 30C38.3 30 41 32.7 41 36C41 39.3 38.3 42 35 42L14 42C14 40 14 40 14 40Z"
              fill="rgba(255, 255, 255, 0.95)" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.25))" />
      </svg>
    `,
    "cloudy": `
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M12 36C9.2 36 7 33.8 7 31C7 28.5 8.9 26.4 11.3 26.1C12.1 21.6 16 18 20.8 18C26 18 30.3 22.2 30.3 27.4C33.2 27.5 35.5 29.8 35.5 32.7C35.5 35.6 33.2 38 30.3 38L12 38C12 36 12 36 12 36Z"
              fill="rgba(226, 232, 240, 0.88)" />
      </svg>
    `,
    "cloudy-night": `
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M28 8C23.6 8 20 11.6 20 16C20 17.6 20.5 19 21.3 20.2C15.8 21.4 12 26.2 12 32C12 38.6 17.4 44 24 44C27.9 44 31.4 42.1 33.5 39.1C34.3 39.2 35.1 39.3 36 39.3C40.4 39.3 44 35.7 44 31.3C44 27.8 41.7 24.8 38.5 23.8C38.8 22.6 39 21.3 39 20C39 13.4 33.6 8 28 8Z"
              fill="rgba(203, 213, 225, 0.9)" />
      </svg>
    `,
    "night": `
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M32 10C24 11 18 17.5 18 25.5C18 34 25 41 33.5 41C36.5 41 39.2 40.1 41.5 38.6C30.5 39.2 22 30.5 22.5 19.5C22.7 15.8 24.5 12.5 27.2 10.2C25.5 10 23.7 10 22 10C25 10 29 10 32 10Z"
              fill="#E2E8F0" />
      </svg>
    `,
    "rain": `
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M12 28C9.8 28 8 26.2 8 24C8 22 9.5 20.3 11.5 20.1C12.2 16.5 15.3 13.5 19.2 13.5C23.5 13.5 27 17 27 21.3C29.3 21.4 31.2 23.3 31.2 25.7C31.2 28.1 29.3 30 27 30L12 30Z"
              fill="rgba(203, 213, 225, 0.9)" />
        <g stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round">
          <line x1="14" y1="34" x2="12" y2="39" />
          <line x1="20" y1="34" x2="18" y2="39" />
          <line x1="26" y1="34" x2="24" y2="39" />
        </g>
      </svg>
    `,
    "heavy-rain": `
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M12 26C9.8 26 8 24.2 8 22C8 20 9.5 18.3 11.5 18.1C12.2 14.5 15.3 11.5 19.2 11.5C23.5 11.5 27 15 27 19.3C29.3 19.4 31.2 21.3 31.2 23.7C31.2 26.1 29.3 28 27 28L12 28Z"
              fill="#94A3B8" />
        <g stroke="#0284C7" stroke-width="2.8" stroke-linecap="round">
          <line x1="12" y1="32" x2="9" y2="38" />
          <line x1="18" y1="32" x2="15" y2="38" />
          <line x1="24" y1="32" x2="21" y2="38" />
          <line x1="15" y1="41" x2="12" y2="47" />
          <line x1="21" y1="41" x2="18" y2="47" />
        </g>
      </svg>
    `,
    "fog": `
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M12 22C9.8 22 8 20.2 8 18C8 16 9.5 14.3 11.5 14.1C12.2 10.5 15.3 7.5 19.2 7.5C23.5 7.5 27 11 27 15.3C29.3 15.4 31.2 17.3 31.2 19.7C31.2 22.1 29.3 24 27 24L12 24Z"
              fill="rgba(203, 213, 225, 0.6)" />
        <g stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round">
          <line x1="8" y1="28" x2="34" y2="28" />
          <line x1="12" y1="34" x2="30" y2="34" />
          <line x1="10" y1="40" x2="26" y2="40" />
        </g>
      </svg>
    `
  };

  /**
   * Convert Celsius to Fahrenheit
   * @param {number} celsius
   * @returns {number}
   */
  function celsiusToFahrenheit(celsius) {
    return (celsius * 9) / 5 + 32;
  }

  /**
   * Convert Fahrenheit to Celsius
   * @param {number} fahrenheit
   * @returns {number}
   */
  function fahrenheitToCelsius(fahrenheit) {
    return ((fahrenheit - 32) * 5) / 9;
  }

  /**
   * Format temperature value with degree unit label (e.g. "28°C" or "82°F")
   * @param {number} celsius - Temperature in Celsius
   * @param {string} unit - "C" or "F"
   * @returns {string}
   */
  function formatTemp(celsius, unit = "C") {
    if (typeof celsius !== "number" || isNaN(celsius)) return "--";
    if (unit === "F") {
      return `${Math.round(celsiusToFahrenheit(celsius))}°F`;
    }
    return `${Math.round(celsius)}°C`;
  }

  /**
   * Format temperature number with degree symbol only (e.g. "28°" or "82°")
   * @param {number} celsius - Temperature in Celsius
   * @param {string} unit - "C" or "F"
   * @returns {string}
   */
  function formatTempNum(celsius, unit = "C") {
    if (typeof celsius !== "number" || isNaN(celsius)) return "--";
    if (unit === "F") {
      return `${Math.round(celsiusToFahrenheit(celsius))}°`;
    }
    return `${Math.round(celsius)}°`;
  }

  /**
   * Retrieve weather SVG icon markup by key
   * @param {string} iconKey - e.g. "sunny", "rain", etc.
   * @param {string} fallbackKey - fallback if iconKey is not found
   * @returns {string} SVG HTML markup
   */
  function getWeatherIcon(iconKey, fallbackKey = "partly-cloudy-day") {
    return WEATHER_ICONS[iconKey] || WEATHER_ICONS[fallbackKey] || WEATHER_ICONS["sunny"];
  }

  /**
   * Escape HTML to guard against unsafe interpolation
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    if (typeof str !== "string") return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  return {
    icons: WEATHER_ICONS,
    celsiusToFahrenheit,
    fahrenheitToCelsius,
    formatTemp,
    formatTempNum,
    getWeatherIcon,
    escapeHtml
  };
});
