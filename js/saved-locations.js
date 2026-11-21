/**
 * SkyCast Weather Forecast - Saved Locations Screen Logic
 * Vanilla JavaScript (Reactive, Modular & Production-Ready)
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- Constants ---
  const MAX_LOCATIONS = 8;
  const DEFAULT_SAVED = ["coimbatore", "chennai", "ooty", "madurai"];
  const DEFAULT_FAVS = ["coimbatore", "chennai", "madurai"];

  // --- State Management with LocalStorage Persistence ---
  const state = {
    currentUnit: localStorage.getItem("skycast_temp_unit") || "C",
    selectedCity: localStorage.getItem("skycast_selected_city") || "coimbatore",
    savedLocations: loadSavedLocations(),
    favouriteLocations: loadFavouriteLocations(),
    isNotificationsOpen: false
  };

  function loadSavedLocations() {
    try {
      const stored = localStorage.getItem("skycast_saved_locations");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not read saved locations from localStorage", e);
    }
    return [...DEFAULT_SAVED];
  }

  function saveSavedLocations() {
    localStorage.setItem("skycast_saved_locations", JSON.stringify(state.savedLocations));
  }

  function loadFavouriteLocations() {
    try {
      const stored = localStorage.getItem("skycast_favourite_locations");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Could not read favourite locations from localStorage", e);
    }
    return [...DEFAULT_FAVS];
  }

  function saveFavouriteLocations() {
    localStorage.setItem("skycast_favourite_locations", JSON.stringify(state.favouriteLocations));
  }

  // --- DOM Elements ---
  const elements = {
    // Top Header & Controls
    unitButtons: document.querySelectorAll(".unit-btn"),
    bellBtn: document.getElementById("bellBtn"),
    bellBadge: document.getElementById("bellBadge"),
    notificationsDropdown: document.getElementById("notificationsDropdown"),
    markAllReadBtn: document.getElementById("markAllReadBtn"),
    topSearchInput: document.getElementById("topSearchInput"),
    topSearchResults: document.getElementById("topSearchResults"),
    mobileMenuBtn: document.getElementById("mobileMenuBtn"),
    sidebar: document.getElementById("sidebar"),
    sidebarCloseBtn: document.getElementById("sidebarCloseBtn"),
    sidebarBackdrop: document.getElementById("sidebarBackdrop"),
    sidebarLocationsList: document.getElementById("sidebarLocationsList"),
    sidebarAddLocationBtn: document.getElementById("sidebarAddLocationBtn"),

    // Screen Search & Add
    savedSearchInput: document.getElementById("savedSearchInput"),
    savedSearchDropdown: document.getElementById("savedSearchDropdown"),
    btnAddLocation: document.getElementById("btnAddLocation"),

    // Stats Bar Elements
    statSavedCount: document.getElementById("statSavedCount"),
    statFavCount: document.getElementById("statFavCount"),
    statUpdatedTitle: document.getElementById("statUpdatedTitle"),
    statUpdatedTime: document.getElementById("statUpdatedTime"),
    statLimitDisplay: document.getElementById("statLimitDisplay"),

    // Content Containers
    savedCardsContainer: document.getElementById("savedCardsContainer"),
    favLocationsList: document.getElementById("favLocationsList"),

    // Action Buttons
    btnRefreshAll: document.getElementById("btnRefreshAll"),
    btnClearAll: document.getElementById("btnClearAll"),

    // Toast
    skycastToast: document.getElementById("skycastToast"),
    toastIcon: document.getElementById("toastIcon"),
    toastText: document.getElementById("toastText")
  };

  // --- SVG Icons Library & Formatters via SkyCastUtils ---
  const weatherIcons = SkyCastUtils.icons;
  const formatTemp = (celsius) => SkyCastUtils.formatTemp(celsius, state.currentUnit);

  // Map to preserve known city metadata (name, region, coordinates, loading/failed status)
  const locationMetadataMap = new Map();

  function getCityMetadata(cityId) {
    if (locationMetadataMap.has(cityId)) {
      return locationMetadataMap.get(cityId);
    }
    const matches = WeatherService.searchCities ? WeatherService.searchCities(cityId) : [];
    const match = matches.find(m => {
      const mId = m.id || (m.city || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      return mId === cityId || (m.city || "").toLowerCase() === cityId.toLowerCase();
    });
    if (match) {
      const meta = {
        city: match.city,
        region: match.region || match.country || "",
        latitude: match.latitude,
        longitude: match.longitude,
        failed: false
      };
      locationMetadataMap.set(cityId, meta);
      return meta;
    }
    const fallbackName = cityId.charAt(0).toUpperCase() + cityId.slice(1);
    const meta = { city: fallbackName, region: "", latitude: undefined, longitude: undefined, failed: false };
    locationMetadataMap.set(cityId, meta);
    return meta;
  }

  function hasActualWeatherData(cityId, data) {
    const d = data !== undefined ? data : WeatherService.getCityWeather(cityId);
    if (!d) return false;
    const key = (cityId || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    const dataId = (d.id || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    const dataCity = (d.city || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    // If cityId is coimbatore or default city, check if d is valid
    if (key === "coimbatore" || key === (WeatherService.DEFAULT_CITY_ID || "coimbatore")) {
      return true;
    }
    return dataId === key || dataCity === key || dataId.startsWith(key) || key.startsWith(dataId);
  }

  let toastTimeout = null;
  function showToast(message, type = "info") {
    if (!elements.skycastToast) return;
    elements.toastText.textContent = message;
    elements.skycastToast.className = `skycast-toast ${type} visible`;

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      elements.skycastToast.classList.remove("visible");
    }, 3200);
  }

  // --- Render All Saved Locations Cards ---
  function renderSavedCards() {
    if (!elements.savedCardsContainer) return;

    if (state.savedLocations.length === 0) {
      elements.savedCardsContainer.innerHTML = `
        <div class="saved-empty-card">
          <div class="empty-icon-circle">
            <svg viewBox="0 0 24 24">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h3 class="empty-title">No Saved Locations Yet</h3>
          <p class="empty-description">
            You haven't saved any locations yet. Search for a city using the bar above or restore the default cities.
          </p>
          <button class="btn-restore-defaults" id="btnRestoreDefaults">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            <span>Restore Default Cities</span>
          </button>
        </div>
      `;

      const restoreBtn = document.getElementById("btnRestoreDefaults");
      if (restoreBtn) {
        restoreBtn.addEventListener("click", () => {
          state.savedLocations = [...DEFAULT_SAVED];
          state.favouriteLocations = [...DEFAULT_FAVS];
          state.selectedCity = "coimbatore";
          saveSavedLocations();
          saveFavouriteLocations();
          localStorage.setItem("skycast_selected_city", "coimbatore");
          renderAll();
          fetchAllSavedWeather();
          showToast("Default cities restored successfully!");
        });
      }
      return;
    }

    elements.savedCardsContainer.innerHTML = state.savedLocations.map(cityId => {
      const data = WeatherService.getCityWeather(cityId);
      const hasData = hasActualWeatherData(cityId, data);
      const meta = getCityMetadata(cityId);
      const isFav = state.favouriteLocations.includes(cityId);
      const isActive = state.selectedCity === cityId;

      const cityName = hasData ? data.city : (meta.city || cityId);
      const regionName = hasData ? (data.region || "") : (meta.region || "");

      // Handle loading placeholder or neutral state without flashing another city's data
      if (!hasData) {
        const isFailed = meta.failed === true;
        return `
        <article class="city-weather-card ${isActive ? 'active' : ''}" data-city-id="${cityId}">
          
          <!-- Card Top Row: Pin, City Name, Region & Favourite Star -->
          <div class="card-top-row">
            <div class="card-location-info">
              <div class="card-pin-circle">
                <svg viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div class="card-city-name-group">
                <h3 class="card-city-title">${cityName}</h3>
                <span class="card-region-subtitle">${regionName}</span>
              </div>
            </div>

            <!-- Favourite Star Toggle -->
            <button class="btn-fav-star ${isFav ? 'active' : ''}" 
                    data-action="toggle-fav" 
                    data-city-id="${cityId}"
                    title="${isFav ? 'Remove from favourites' : 'Add to favourites'}"
                    aria-label="${isFav ? 'Remove from favourites' : 'Add to favourites'}">
              <svg viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
          </div>

          <!-- Card Body: Weather Icon, Temperature, Condition & Metrics -->
          <div class="card-body-content">
            <div class="card-weather-icon-box">
              ${weatherIcons["cloudy"]}
            </div>

            <div class="card-temp-group">
              <div class="card-temperature">--°</div>
              <div class="card-condition-text">${isFailed ? 'Weather Unavailable' : 'Loading weather...'}</div>
            </div>

            <!-- Weather Details Column -->
            <div class="card-metrics-col">
              <div class="card-metric-row" title="Humidity">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                </svg>
                <span>--%</span>
              </div>

              <div class="card-metric-row" title="Wind Speed">
                <svg viewBox="0 0 24 24">
                  <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
                </svg>
                <span>--</span>
              </div>

              <div class="card-metric-row" title="Atmospheric Pressure">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>--</span>
              </div>
            </div>

            <!-- Card Actions Dropdown Trigger -->
            <div class="card-actions-wrapper">
              <button class="btn-card-menu" data-action="open-menu" data-city-id="${cityId}" aria-label="Card options">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="1.5"></circle>
                  <circle cx="12" cy="12" r="1.5"></circle>
                  <circle cx="12" cy="19" r="1.5"></circle>
                </svg>
              </button>

              <div class="card-menu-dropdown" id="menu-${cityId}">
                <button class="card-menu-item" data-action="set-active" data-city-id="${cityId}">
                  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Select Active</span>
                </button>
                <button class="card-menu-item" data-action="goto-dashboard" data-city-id="${cityId}">
                  <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                  <span>Home Dashboard</span>
                </button>
                <button class="card-menu-item" data-action="goto-forecast" data-city-id="${cityId}">
                  <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                  <span>Detailed Forecast</span>
                </button>
                <button class="card-menu-item danger" data-action="remove-city" data-city-id="${cityId}">
                  <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>
                  <span>Remove Location</span>
                </button>
              </div>
            </div>

          </div>

        </article>
        `;
      }

      if (!data) return "";

      const windDisplay = (data.wind || "--") + (data.windDirection && !data.wind.includes(data.windDirection) ? " " + data.windDirection : "");

      return `
        <article class="city-weather-card ${isActive ? 'active' : ''}" data-city-id="${cityId}">
          
          <!-- Card Top Row: Pin, City Name, Region & Favourite Star -->
          <div class="card-top-row">
            <div class="card-location-info">
              <div class="card-pin-circle">
                <svg viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div class="card-city-name-group">
                <h3 class="card-city-title">${cityName}</h3>
                <span class="card-region-subtitle">${regionName}</span>
              </div>
            </div>

            <!-- Favourite Star Toggle -->
            <button class="btn-fav-star ${isFav ? 'active' : ''}" 
                    data-action="toggle-fav" 
                    data-city-id="${cityId}"
                    title="${isFav ? 'Remove from favourites' : 'Add to favourites'}"
                    aria-label="${isFav ? 'Remove from favourites' : 'Add to favourites'}">
              <svg viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
          </div>

          <!-- Card Body: Weather Icon, Temperature, Condition & Metrics -->
          <div class="card-body-content">
            <div class="card-weather-icon-box">
              ${weatherIcons[data.icon] || weatherIcons["partly-cloudy-day"]}
            </div>

            <div class="card-temp-group">
              <div class="card-temperature">${formatTemp(data.tempC)}</div>
              <div class="card-condition-text">${data.condition || 'Clear'}</div>
            </div>

            <!-- Weather Details Column -->
            <div class="card-metrics-col">
              <div class="card-metric-row" title="Humidity">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                </svg>
                <span>${data.humidity}</span>
              </div>

              <div class="card-metric-row" title="Wind Speed">
                <svg viewBox="0 0 24 24">
                  <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
                </svg>
                <span>${windDisplay}</span>
              </div>

              <div class="card-metric-row" title="Atmospheric Pressure">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>${data.pressure}</span>
              </div>
            </div>

            <!-- Card Actions Dropdown Trigger -->
            <div class="card-actions-wrapper">
              <button class="btn-card-menu" data-action="open-menu" data-city-id="${cityId}" aria-label="Card options">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="1.5"></circle>
                  <circle cx="12" cy="12" r="1.5"></circle>
                  <circle cx="12" cy="19" r="1.5"></circle>
                </svg>
              </button>

              <div class="card-menu-dropdown" id="menu-${cityId}">
                <button class="card-menu-item" data-action="set-active" data-city-id="${cityId}">
                  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Select Active</span>
                </button>
                <button class="card-menu-item" data-action="goto-dashboard" data-city-id="${cityId}">
                  <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                  <span>Home Dashboard</span>
                </button>
                <button class="card-menu-item" data-action="goto-forecast" data-city-id="${cityId}">
                  <svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                  <span>Detailed Forecast</span>
                </button>
                <button class="card-menu-item danger" data-action="remove-city" data-city-id="${cityId}">
                  <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>
                  <span>Remove Location</span>
                </button>
              </div>
            </div>

          </div>

        </article>
      `;
    }).join("");
  }

  // --- Render Favourite Locations Right Panel ---
  function renderFavouritePanel() {
    if (!elements.favLocationsList) return;

    if (state.favouriteLocations.length === 0) {
      elements.favLocationsList.innerHTML = `
        <li class="fav-empty-hint">No favourite cities yet. Click the star icon on any card to add.</li>
      `;
      return;
    }

    elements.favLocationsList.innerHTML = state.favouriteLocations.map(cityId => {
      const data = WeatherService.getCityWeather(cityId);
      const hasData = hasActualWeatherData(cityId, data);
      const meta = getCityMetadata(cityId);
      const cityName = hasData ? data.city : (meta.city || cityId);
      const tempDisplay = hasData ? formatTemp(data.tempC) : "--";
      const iconKey = hasData ? (data.icon || "partly-cloudy-day") : "cloudy";

      return `
        <li class="fav-item-row" data-city-id="${cityId}">
          <div class="fav-item-left">
            <svg viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span class="fav-item-name">${cityName}</span>
          </div>
          <div class="fav-item-right">
            <span class="fav-item-temp">${tempDisplay}</span>
            <div class="fav-item-icon">
              ${weatherIcons[iconKey] || weatherIcons["partly-cloudy-day"]}
            </div>
          </div>
        </li>
      `;
    }).join("");
  }

  // --- Render Sidebar Locations List ---
  function renderSidebarLocations() {
    if (!elements.sidebarLocationsList) return;

    elements.sidebarLocationsList.innerHTML = state.savedLocations.map(cityId => {
      const data = WeatherService.getCityWeather(cityId);
      const hasData = hasActualWeatherData(cityId, data);
      const meta = getCityMetadata(cityId);
      const cityName = hasData ? data.city : (meta.city || cityId);
      const tempDisplay = hasData ? formatTemp(data.tempC) : "--";

      const isSelected = state.selectedCity === cityId;

      return `
        <li>
          <button class="location-item-btn ${isSelected ? 'selected' : ''}" data-location="${cityId}">
            <div class="location-item-left">
              <svg viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>${cityName}</span>
            </div>
            <span class="location-item-temp">${tempDisplay}</span>
          </button>
        </li>
      `;
    }).join("");

    // Attach listeners to sidebar items
    elements.sidebarLocationsList.querySelectorAll(".location-item-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const cityId = btn.dataset.location;
        selectActiveCity(cityId);
      });
    });
  }

  // --- Update Stats Summary Bar ---
  function updateStats() {
    if (elements.statSavedCount) {
      elements.statSavedCount.textContent = state.savedLocations.length;
    }
    if (elements.statFavCount) {
      elements.statFavCount.textContent = state.favouriteLocations.length;
    }
    if (elements.statLimitDisplay) {
      elements.statLimitDisplay.textContent = `${state.savedLocations.length} / ${MAX_LOCATIONS}`;
    }

    // Dynamic Last Updated Timestamp
    if (elements.statUpdatedTime) {
      let latestTimestamp = null;
      let hasLive = false;
      let hasCached = false;

      for (const cityId of state.savedLocations) {
        const d = WeatherService.getCityWeather(cityId);
        if (d && hasActualWeatherData(cityId, d)) {
          if (d.source === "live") hasLive = true;
          if (d.source === "cache") hasCached = true;
          if (d.fetchedAt) {
            latestTimestamp = d.fetchedAt;
          } else if (d.lastUpdated) {
            latestTimestamp = d.lastUpdated.replace(/^(Live,\s*|Cached,\s*)/i, "");
          }
        }
      }

      if (latestTimestamp) {
        const timeDisplay = latestTimestamp.toLowerCase().includes("today")
          ? latestTimestamp
          : `Today, ${latestTimestamp}`;
        elements.statUpdatedTime.textContent = timeDisplay;
        if (elements.statUpdatedTitle) {
          elements.statUpdatedTitle.textContent = hasLive ? "Just Updated" : (hasCached ? "Cached Update" : "Last Updated");
        }
      } else {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        elements.statUpdatedTime.textContent = `Today, ${hours}:${minutes} ${ampm}`;
        if (elements.statUpdatedTitle) {
          elements.statUpdatedTitle.textContent = "Last Updated";
        }
      }
    }
  }

  // --- Master Render Function ---
  function renderAll() {
    renderSavedCards();
    renderFavouritePanel();
    renderSidebarLocations();
    updateStats();
  }

  // --- Select Active City Action ---
  function selectActiveCity(cityId) {
    const data = WeatherService.getCityWeather(cityId);
    const hasData = hasActualWeatherData(cityId, data);
    const meta = getCityMetadata(cityId);
    const cityName = hasData ? data.city : (meta.city || cityId);

    state.selectedCity = cityId;
    localStorage.setItem("skycast_selected_city", cityId);

    // Update active class on cards without full reload
    document.querySelectorAll(".city-weather-card").forEach(card => {
      if (card.dataset.cityId === cityId) {
        card.classList.add("active");
        card.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        card.classList.remove("active");
      }
    });

    // Update sidebar
    document.querySelectorAll("#sidebarLocationsList .location-item-btn").forEach(btn => {
      btn.classList.toggle("selected", btn.dataset.location === cityId);
    });

    showToast(`Switched active city to ${cityName}`);
  }

  // --- Toggle Favourite City Action ---
  function toggleFavourite(cityId) {
    const data = WeatherService.getCityWeather(cityId);
    const hasData = hasActualWeatherData(cityId, data);
    const meta = getCityMetadata(cityId);
    const cityName = hasData ? data.city : (meta.city || cityId);

    const idx = state.favouriteLocations.indexOf(cityId);
    if (idx >= 0) {
      state.favouriteLocations.splice(idx, 1);
      showToast(`Removed ${cityName} from favourites`);
    } else {
      state.favouriteLocations.push(cityId);
      showToast(`Added ${cityName} to favourites ⭐`);
    }
    saveFavouriteLocations();
    renderAll();
  }

  // --- Remove Location Action ---
  function removeLocation(cityId) {
    const data = WeatherService.getCityWeather(cityId);
    const hasData = hasActualWeatherData(cityId, data);
    const meta = getCityMetadata(cityId);
    const cityName = hasData ? data.city : (meta.city || cityId);

    state.savedLocations = state.savedLocations.filter(id => id !== cityId);
    state.favouriteLocations = state.favouriteLocations.filter(id => id !== cityId);
    locationMetadataMap.delete(cityId);

    if (state.selectedCity === cityId) {
      state.selectedCity = state.savedLocations[0] || "coimbatore";
      localStorage.setItem("skycast_selected_city", state.selectedCity);
    }

    saveSavedLocations();
    saveFavouriteLocations();
    renderAll();
    showToast(`Removed ${cityName} from saved locations`, "info");
  }

  // --- Add Location Action ---
  async function addLocation(cityId, lat, lon, cityName, regionName) {
    const existing = WeatherService.getCityWeather(cityId);
    const hasData = hasActualWeatherData(cityId, existing);
    const meta = getCityMetadata(cityId);
    const resolvedName = cityName || (hasData ? existing.city : (meta.city || cityId));
    const resolvedRegion = regionName || (hasData ? (existing.region || "") : (meta.region || ""));

    if (state.savedLocations.includes(cityId)) {
      showToast(`${resolvedName} is already in your saved locations!`, "warning");
      selectActiveCity(cityId);
      return;
    }

    if (state.savedLocations.length >= MAX_LOCATIONS) {
      showToast(`Location limit reached (${MAX_LOCATIONS}/${MAX_LOCATIONS})! Please remove a city first.`, "warning");
      return;
    }

    // Register metadata immediately to guarantee loading card displays proper title
    locationMetadataMap.set(cityId, {
      city: resolvedName,
      region: resolvedRegion,
      latitude: lat,
      longitude: lon,
      failed: false
    });

    state.savedLocations.push(cityId);
    state.selectedCity = cityId;
    saveSavedLocations();
    localStorage.setItem("skycast_selected_city", cityId);
    renderAll();
    showToast(`Added ${resolvedName} to saved locations! ✨`);

    // Clear search inputs
    if (elements.savedSearchInput) elements.savedSearchInput.value = "";
    if (elements.savedSearchDropdown) elements.savedSearchDropdown.classList.remove("visible");

    // Fetch live weather asynchronously for this newly added city
    try {
      const liveRes = await WeatherService.fetchLiveCityWeather(cityId, lat, lon);
      if (liveRes) {
        locationMetadataMap.delete(cityId);
      } else {
        const m = locationMetadataMap.get(cityId) || {};
        m.failed = true;
        locationMetadataMap.set(cityId, m);
      }
      renderAll();
      updateSourceIndicator();
    } catch (e) {
      console.warn("Could not fetch live weather for added city:", e);
      const m = locationMetadataMap.get(cityId) || {};
      m.failed = true;
      locationMetadataMap.set(cityId, m);
      renderAll();
      updateSourceIndicator();
    }
  }

  // --- Event Delegation on Cards Container ---
  elements.savedCardsContainer.addEventListener("click", (e) => {
    // 1. Favourite star button
    const favBtn = e.target.closest('[data-action="toggle-fav"]');
    if (favBtn) {
      e.stopPropagation();
      const cityId = favBtn.dataset.cityId;
      toggleFavourite(cityId);
      return;
    }

    // 2. Open card menu dropdown
    const menuBtn = e.target.closest('[data-action="open-menu"]');
    if (menuBtn) {
      e.stopPropagation();
      const cityId = menuBtn.dataset.cityId;
      const dropdown = document.getElementById(`menu-${cityId}`);
      // Close other open menus
      document.querySelectorAll(".card-menu-dropdown").forEach(d => {
        if (d !== dropdown) d.classList.remove("active");
      });
      if (dropdown) dropdown.classList.toggle("active");
      return;
    }

    // 3. Menu items
    const menuItem = e.target.closest(".card-menu-item");
    if (menuItem) {
      e.stopPropagation();
      const action = menuItem.dataset.action;
      const cityId = menuItem.dataset.cityId;

      // Close all menus
      document.querySelectorAll(".card-menu-dropdown").forEach(d => d.classList.remove("active"));

      if (action === "set-active") {
        selectActiveCity(cityId);
      } else if (action === "goto-dashboard") {
        localStorage.setItem("skycast_selected_city", cityId);
        window.location.href = "index.html";
      } else if (action === "goto-forecast") {
        localStorage.setItem("skycast_selected_city", cityId);
        window.location.href = "forecast.html";
      } else if (action === "remove-city") {
        removeLocation(cityId);
      }
      return;
    }

    // 4. Clicking the card itself
    const card = e.target.closest(".city-weather-card");
    if (card) {
      const cityId = card.dataset.cityId;
      selectActiveCity(cityId);
    }
  });

  // Close card menus when clicking anywhere outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".card-actions-wrapper")) {
      document.querySelectorAll(".card-menu-dropdown").forEach(d => d.classList.remove("active"));
    }
  });

  // --- Event Delegation for Favourite List in Right Panel ---
  elements.favLocationsList.addEventListener("click", (e) => {
    const item = e.target.closest(".fav-item-row");
    if (item) {
      const cityId = item.dataset.cityId;
      selectActiveCity(cityId);
    }
  });

  // --- Live Data Source Indicator ---
  function updateSourceIndicator() {
    const chip = document.querySelector(".demo-mode-chip");
    if (!chip) return;
    const src = WeatherService.getCurrentDataSource();
    if (src === "live") {
      chip.innerHTML = '<span class="demo-dot" style="background:#10b981;box-shadow:0 0 8px rgba(16,185,129,0.7);"></span><span>Live Open-Meteo API</span>';
      chip.style.borderColor = "rgba(16, 185, 129, 0.4)";
    } else if (src === "cache") {
      chip.innerHTML = '<span class="demo-dot" style="background:#38bdf8;box-shadow:0 0 8px rgba(56,189,248,0.7);"></span><span>Cached Live Weather</span>';
      chip.style.borderColor = "rgba(56, 189, 248, 0.4)";
    } else {
      chip.innerHTML = '<span class="demo-dot" style="background:#94a3b8;"></span><span>Demo Fallback Mode</span>';
      chip.style.borderColor = "rgba(255, 255, 255, 0.1)";
    }
  }

  // --- Saved Locations Search and Autocomplete ---
  function getSearchMatches(query) {
    return WeatherService.searchCities(query);
  }

  let _searchDebounceTimer = null;
  function renderSavedSearchDropdown(query) {
    if (!elements.savedSearchDropdown) return;
    const filter = (query || "").trim();

    // Instant local matches
    const localMatches = getSearchMatches(filter);
    populateSavedSearchDropdown(localMatches);

    // Asynchronous live search when query has 2+ characters
    if (filter.length >= 2) {
      clearTimeout(_searchDebounceTimer);
      _searchDebounceTimer = setTimeout(async () => {
        try {
          const liveMatches = await WeatherService.searchCitiesAsync(filter);
          if (liveMatches && liveMatches.length > 0) {
            populateSavedSearchDropdown(liveMatches);
          }
        } catch (e) {
          // ignore error
        }
      }, 250);
    }
  }

  function populateSavedSearchDropdown(matches) {
    if (!elements.savedSearchDropdown) return;

    if (!matches || matches.length === 0) {
      elements.savedSearchDropdown.innerHTML = `
        <div style="padding: 12px; font-size: 13px; color: var(--text-muted); text-align: center;">
          No matching cities found.
        </div>
      `;
      elements.savedSearchDropdown.classList.add("visible");
      return;
    }

    elements.savedSearchDropdown.innerHTML = matches.map(loc => {
      const cityId = (loc.city || "").toLowerCase().replace(/[^a-z0-9]/g, "") || loc.id;
      const isSaved = state.savedLocations.includes(cityId);
      const lat = loc.latitude || "";
      const lon = loc.longitude || "";
      return `
        <div class="saved-search-item" data-city-id="${cityId}" data-city-name="${loc.city}" data-region-name="${loc.region || ''}" data-lat="${lat}" data-lon="${lon}">
          <div class="saved-search-item-info">
            <svg viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <div>
              <strong>${loc.city}</strong>, <span style="color: var(--text-muted);">${loc.region || loc.country || ''}</span>
            </div>
          </div>
          <div>
            ${isSaved 
              ? `<span class="saved-search-item-badge" style="background: rgba(255,255,255,0.08); color: var(--text-muted);">Saved</span>` 
              : `<span class="saved-search-item-badge">+ Add</span>`}
          </div>
        </div>
      `;
    }).join("");

    elements.savedSearchDropdown.classList.add("visible");
  }

  if (elements.savedSearchInput) {
    elements.savedSearchInput.addEventListener("focus", () => {
      renderSavedSearchDropdown(elements.savedSearchInput.value);
    });

    elements.savedSearchInput.addEventListener("input", (e) => {
      renderSavedSearchDropdown(e.target.value);
    });

    elements.savedSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const matches = getSearchMatches(elements.savedSearchInput.value);
        if (matches.length > 0) {
          const m = matches[0];
          const mId = m.id || m.city.toLowerCase().replace(/[^a-z0-9]/g, "");
          addLocation(mId, m.latitude, m.longitude, m.city, m.region);
        }
      }
    });
  }

  if (elements.savedSearchDropdown) {
    elements.savedSearchDropdown.addEventListener("click", (e) => {
      const item = e.target.closest(".saved-search-item");
      if (item) {
        const cityId = item.dataset.cityId;
        const cityName = item.dataset.cityName;
        const regionName = item.dataset.regionName;
        const lat = item.dataset.lat ? parseFloat(item.dataset.lat) : undefined;
        const lon = item.dataset.lon ? parseFloat(item.dataset.lon) : undefined;
        addLocation(cityId, lat, lon, cityName, regionName);
      }
    });
  }

  // Close search dropdown on click outside
  document.addEventListener("click", (e) => {
    if (elements.savedSearchInput && elements.savedSearchDropdown) {
      if (!elements.savedSearchInput.contains(e.target) && !elements.savedSearchDropdown.contains(e.target)) {
        elements.savedSearchDropdown.classList.remove("visible");
      }
    }
  });

  // Add Location Button Click
  if (elements.btnAddLocation) {
    elements.btnAddLocation.addEventListener("click", () => {
      const query = (elements.savedSearchInput?.value || "").trim();
      if (!query) {
        elements.savedSearchInput?.focus();
        renderSavedSearchDropdown("");
        return;
      }
      const matches = getSearchMatches(query);
      if (matches.length > 0) {
        const m = matches[0];
        const mId = m.id || m.city.toLowerCase().replace(/[^a-z0-9]/g, "");
        addLocation(mId, m.latitude, m.longitude, m.city, m.region);
      } else {
        showToast("City not found in catalog.", "warning");
      }
    });
  }

  // Sidebar "+" button focuses the search input
  if (elements.sidebarAddLocationBtn) {
    elements.sidebarAddLocationBtn.addEventListener("click", () => {
      elements.savedSearchInput?.focus();
      renderSavedSearchDropdown("");
      if (elements.sidebar.classList.contains("mobile-open")) {
        closeMobileSidebar();
      }
    });
  }

  // --- Quick Actions ---
  // 1. Refresh All Locations (Bypasses cache with forceRefresh = true and parallel fetches)
  if (elements.btnRefreshAll) {
    elements.btnRefreshAll.addEventListener("click", async () => {
      elements.btnRefreshAll.classList.add("spinning");

      try {
        await Promise.allSettled(
          state.savedLocations.map(cityId => {
            const meta = getCityMetadata(cityId);
            return WeatherService.fetchLiveCityWeather(cityId, meta.latitude, meta.longitude, true);
          })
        );
      } catch (err) {
        console.warn("Refresh error:", err);
      } finally {
        elements.btnRefreshAll.classList.remove("spinning");
      }

      renderAll();
      updateSourceIndicator();
      showToast(`Refreshed all ${state.savedLocations.length} locations data (Just now)`);
    });
  }

  // 2. Clear All Locations
  if (elements.btnClearAll) {
    elements.btnClearAll.addEventListener("click", () => {
      if (state.savedLocations.length === 0) return;
      
      const previousLocations = [...state.savedLocations];
      const previousFavs = [...state.favouriteLocations];

      state.savedLocations = [];
      state.favouriteLocations = [];
      saveSavedLocations();
      saveFavouriteLocations();
      renderAll();

      showToast("Cleared all saved locations.", "info");
    });
  }

  // --- Temperature Unit Toggle (°C / °F) ---
  elements.unitButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const unit = btn.dataset.unit;
      if (unit === state.currentUnit) return;

      elements.unitButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.currentUnit = unit;
      localStorage.setItem("skycast_temp_unit", unit);

      renderAll();
      showToast(`Temperature unit set to °${unit}`);
    });
  });

  // Set initial unit toggle state
  elements.unitButtons.forEach(b => {
    b.classList.toggle("active", b.dataset.unit === state.currentUnit);
  });

  // --- Top Header Search Autocomplete ---
  if (elements.topSearchInput && elements.topSearchResults) {
    elements.topSearchInput.addEventListener("focus", () => {
      showTopSearchSuggestions(elements.topSearchInput.value);
    });

    elements.topSearchInput.addEventListener("input", (e) => {
      showTopSearchSuggestions(e.target.value);
    });

    function showTopSearchSuggestions(query) {
      const filter = (query || "").trim();
      const matches = getSearchMatches(filter);
      if (matches.length > 0) {
        elements.topSearchResults.innerHTML = matches.map(m => {
          const mId = m.id || m.city.toLowerCase().replace(/[^a-z0-9]/g, "");
          const lat = m.latitude || "";
          const lon = m.longitude || "";
          return `
            <div class="search-result-item" data-key="${mId}" data-city-name="${m.city}" data-lat="${lat}" data-lon="${lon}">
              <span>${m.city}, ${m.region || m.country || ''}</span>
              <span style="font-size: 11px; color: #94a3b8;">Select</span>
            </div>
          `;
        }).join("");
        elements.topSearchResults.classList.add("visible");
      } else {
        elements.topSearchResults.classList.remove("visible");
      }
    }

    elements.topSearchResults.addEventListener("click", (e) => {
      const item = e.target.closest(".search-result-item");
      if (item) {
        const key = item.dataset.key;
        const cityName = item.dataset.cityName;
        const lat = item.dataset.lat ? parseFloat(item.dataset.lat) : undefined;
        const lon = item.dataset.lon ? parseFloat(item.dataset.lon) : undefined;
        elements.topSearchInput.value = item.querySelector("span").textContent;
        elements.topSearchResults.classList.remove("visible");
        addLocation(key, lat, lon, cityName);
      }
    });

    document.addEventListener("click", (e) => {
      if (!elements.topSearchInput.contains(e.target) && !elements.topSearchResults.contains(e.target)) {
        elements.topSearchResults.classList.remove("visible");
      }
    });
  }

  // Global '/' shortcut to focus search
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== elements.savedSearchInput && document.activeElement !== elements.topSearchInput) {
      e.preventDefault();
      elements.savedSearchInput ? elements.savedSearchInput.focus() : elements.topSearchInput?.focus();
    }
  });

  // --- Notifications Bell Popover Toggle ---
  if (elements.bellBtn) {
    elements.bellBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      state.isNotificationsOpen = !state.isNotificationsOpen;
      elements.notificationsDropdown?.classList.toggle("active", state.isNotificationsOpen);
    });
  }

  if (elements.markAllReadBtn) {
    elements.markAllReadBtn.addEventListener("click", () => {
      if (elements.bellBadge) elements.bellBadge.style.display = "none";
      document.querySelectorAll(".notification-item").forEach(item => {
        item.style.opacity = "0.65";
      });
      showToast("All notifications marked as read");
    });
  }

  document.addEventListener("click", (e) => {
    if (state.isNotificationsOpen && elements.notificationsDropdown && !elements.notificationsDropdown.contains(e.target) && !elements.bellBtn.contains(e.target)) {
      state.isNotificationsOpen = false;
      elements.notificationsDropdown.classList.remove("active");
    }
  });

  // --- Mobile Sidebar Controls ---
  function openMobileSidebar() {
    elements.sidebar?.classList.add("mobile-open");
    elements.sidebarBackdrop?.classList.add("visible");
  }

  function closeMobileSidebar() {
    elements.sidebar?.classList.remove("mobile-open");
    elements.sidebarBackdrop?.classList.remove("visible");
  }

  if (elements.mobileMenuBtn) elements.mobileMenuBtn.addEventListener("click", openMobileSidebar);
  if (elements.sidebarCloseBtn) elements.sidebarCloseBtn.addEventListener("click", closeMobileSidebar);
  if (elements.sidebarBackdrop) elements.sidebarBackdrop.addEventListener("click", closeMobileSidebar);

  // --- Live Weather Fetch for all saved locations (Parallel) ---
  async function fetchAllSavedWeather() {
    try {
      await Promise.allSettled(
        state.savedLocations.map(cityId => {
          const meta = getCityMetadata(cityId);
          return WeatherService.fetchLiveCityWeather(cityId, meta.latitude, meta.longitude, false);
        })
      );
    } catch (e) {
      // Fallback safely retained
    }
    renderAll();
    updateSourceIndicator();
  }

  window.addEventListener("skycast:weatherUpdated", () => {
    renderAll();
    updateSourceIndicator();
  });

  // --- Initial Render ---
  renderAll();
  updateSourceIndicator();
  fetchAllSavedWeather();
  console.log("SkyCast Saved Locations screen initialized successfully with localStorage and live API support.");
});
