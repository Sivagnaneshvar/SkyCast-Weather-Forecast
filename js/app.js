/**
 * SkyCast Weather Forecast - Home Dashboard Application Logic
 * Pure Vanilla JavaScript (Clean, Modular & Production-Ready)
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- State Management ---
  const state = {
    currentUnit: localStorage.getItem("skycast_temp_unit") || "C", // 'C' or 'F'
    currentLocationId: localStorage.getItem("skycast_selected_city") || "coimbatore",
    isSearchOpen: false,
    isNotificationsOpen: false,
    unreadNotifications: 2
  };

  // --- DOM Elements ---
  const elements = {
    // Top Header & Controls
    unitButtons: document.querySelectorAll(".unit-btn"),
    bellBtn: document.getElementById("bellBtn"),
    bellBadge: document.getElementById("bellBadge"),
    notificationsDropdown: document.getElementById("notificationsDropdown"),
    markAllReadBtn: document.getElementById("markAllReadBtn"),
    searchInput: document.getElementById("searchInput"),
    searchResults: document.getElementById("searchResults"),
    mobileMenuBtn: document.getElementById("mobileMenuBtn"),
    sidebar: document.getElementById("sidebar"),
    sidebarCloseBtn: document.getElementById("sidebarCloseBtn"),
    sidebarBackdrop: document.getElementById("sidebarBackdrop"),
    next24HoursLink: document.getElementById("next24HoursLink"),

    // Weather Hero Elements
    locationName: document.getElementById("locationName"),
    mainTemp: document.getElementById("mainTemp"),
    conditionTitle: document.getElementById("conditionTitle"),
    conditionDesc: document.getElementById("conditionDesc"),
    weatherIconHero: document.getElementById("weatherIconHero"),
    landmarkTag: document.getElementById("landmarkTag"),

    // 4 Metrics
    windVal: document.getElementById("windVal"),
    humidityVal: document.getElementById("humidityVal"),
    pressureVal: document.getElementById("pressureVal"),
    uvVal: document.getElementById("uvVal"),

    // Forecast Containers
    hourlyTrack: document.getElementById("hourlyTrack"),
    dailyGrid: document.getElementById("dailyGrid"),

    // Right Column Cards
    todayHeaderDate: document.querySelector(".today-header-date"),
    sunArcPath: document.getElementById("sunArcPath"),
    sunArcPositionDot: document.getElementById("sunArcPositionDot"),
    sunriseVal: document.getElementById("sunriseVal"),
    sunsetVal: document.getElementById("sunsetVal"),
    aqiBadge: document.getElementById("aqiBadge"),
    aqiDesc: document.getElementById("aqiDesc"),
    lastUpdatedTime: document.getElementById("lastUpdatedTime"),
    refreshBtn: document.getElementById("refreshBtn"),
    alertTitle: document.getElementById("alertTitle"),
    alertBody: document.getElementById("alertBody"),

    // Locations List
    locationButtons: document.querySelectorAll(".location-item-btn"),

    // Loading Overlay
    loadingOverlay: document.getElementById("loadingOverlay"),
    loadingSubtext: document.getElementById("loadingSubtext")
  };

  // --- SVG Icon Library & Formatters via SkyCastUtils ---
  const weatherIcons = SkyCastUtils.icons;
  const formatTemp = (celsius) => SkyCastUtils.formatTemp(celsius, state.currentUnit);
  const formatTempNum = (celsius) => SkyCastUtils.formatTempNum(celsius, state.currentUnit);

  // --- Render Dashboard UI with Location Data ---
  function renderDashboard(locationId) {
    const data = WeatherService.getCityWeather(locationId);
    state.currentLocationId = locationId;

    // 1. Hero Weather Card
    elements.locationName.textContent = `${data.city}, ${data.region}`;
    elements.mainTemp.textContent = formatTemp(data.tempC);
    elements.conditionTitle.textContent = data.condition;
    elements.conditionDesc.textContent = data.description;
    elements.landmarkTag.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
      </svg>
      ${data.landmark}
    `;

    // Weather Icon
    elements.weatherIconHero.innerHTML = weatherIcons[data.icon] || weatherIcons["partly-cloudy-day"];

    // 2. Metrics Bar
    elements.windVal.textContent = data.wind;
    elements.humidityVal.textContent = data.humidity;
    elements.pressureVal.textContent = data.pressure;
    elements.uvVal.textContent = data.uvIndex;

    // 3. Hourly Forecast
    elements.hourlyTrack.innerHTML = data.hourly.map(item => `
      <div class="hourly-card ${item.active ? 'active' : ''}">
        <span class="hourly-time">${item.time}</span>
        <div class="hourly-icon">
          ${weatherIcons[item.icon] || weatherIcons["cloudy"]}
        </div>
        <span class="hourly-temp">${formatTempNum(item.tempC)}</span>
      </div>
    `).join("");

    // 4. 7-Day Forecast
    elements.dailyGrid.innerHTML = data.daily.map(item => `
      <div class="daily-card">
        <span class="daily-day">${item.day}</span>
        <span class="daily-date">${item.date}</span>
        <div class="daily-icon">
          ${weatherIcons[item.icon] || weatherIcons["sunny"]}
        </div>
        <div class="daily-temps">
          <span class="temp-high">${formatTempNum(item.highC)}</span>
          <span class="temp-low">${formatTempNum(item.lowC)}</span>
        </div>
      </div>
    `).join("");

    // 5. Sun Schedule Card & Dynamic Today Date
    if (elements.todayHeaderDate) {
      if (data.currentDateFormatted) {
        elements.todayHeaderDate.textContent = data.currentDateFormatted;
      } else if (data.daily && data.daily.length > 0) {
        const d0 = data.daily[0];
        const dayLabel = d0.day === "Today" ? new Date().toLocaleDateString("en-US", { weekday: "short" }) : d0.day;
        elements.todayHeaderDate.textContent = `${dayLabel}, ${d0.date}`;
      } else {
        elements.todayHeaderDate.textContent = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit" });
      }
    }
    elements.sunriseVal.textContent = data.sunSchedule.sunrise;
    elements.sunsetVal.textContent = data.sunSchedule.sunset;
    updateSunArc(data.sunSchedule.progress);

    // 6. Air Quality Card
    elements.aqiBadge.className = `badge-aqi ${data.airQuality.badgeClass}`;
    elements.aqiBadge.textContent = `${data.airQuality.aqi} ${data.airQuality.status}`;
    elements.aqiDesc.textContent = data.airQuality.message;

    // 7. Last Updated & Source Indicator (Strict Synchronization)
    const demoChip = document.querySelector(".demo-mode-chip");
    if (data.source === "live") {
      elements.lastUpdatedTime.textContent = data.lastUpdated || "Live, Just now";
      if (demoChip) {
        demoChip.innerHTML = '<span class="demo-dot" style="background:#22c55e;box-shadow:0 0 6px #22c55e;"></span><span>Live API</span>';
        demoChip.style.borderColor = "rgba(34, 197, 94, 0.4)";
      }
    } else if (data.source === "cache") {
      elements.lastUpdatedTime.textContent = data.lastUpdated || "Cached, Recently";
      if (demoChip) {
        demoChip.innerHTML = '<span class="demo-dot" style="background:#38bdf8;box-shadow:0 0 6px #38bdf8;"></span><span>Cached</span>';
        demoChip.style.borderColor = "rgba(56, 189, 248, 0.4)";
      }
    } else {
      elements.lastUpdatedTime.textContent = data.lastUpdated || "Demo Fallback";
      if (demoChip) {
        demoChip.innerHTML = '<span class="demo-dot" style="background:#94a3b8;"></span><span>Demo Fallback</span>';
        demoChip.style.borderColor = "rgba(255, 255, 255, 0.1)";
      }
    }

    // 8. Alerts Card
    if (data.activeAlert) {
      elements.alertTitle.textContent = data.activeAlert.title;
      elements.alertBody.textContent = data.activeAlert.message;
    }

    // 9. Update Sidebar Location Active State & Live Temperatures
    elements.locationButtons.forEach(btn => {
      const loc = btn.dataset.location;
      if (loc === locationId) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }
      // Update quick temp list via WeatherService (live if fetched, fallback mock if not yet fetched)
      const tempSpan = btn.querySelector(".location-item-temp");
      const locData = WeatherService.getCityWeather(loc);
      if (tempSpan && locData) {
        tempSpan.textContent = formatTemp(locData.tempC);
      }
    });
  }

  // Helper: Position the Sun dot along the visual arc
  function updateSunArc(progress) {
    // Arc path is approximately an ellipse top half
    // x varies from ~20 to ~220, y peaks at ~15
    const cx = 120;
    const rx = 90;
    const ry = 55;
    const cy = 70;

    // Angle theta from PI to 0
    const theta = Math.PI - (progress * Math.PI);
    const x = cx + rx * Math.cos(theta);
    const y = cy - ry * Math.sin(theta);

    if (elements.sunArcPositionDot) {
      elements.sunArcPositionDot.setAttribute("cx", x);
      elements.sunArcPositionDot.setAttribute("cy", y);
    }
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

      // Re-render UI with new unit conversion
      renderDashboard(state.currentLocationId);
    });
  });

  // Set initial unit toggle state
  elements.unitButtons.forEach(b => {
    b.classList.toggle("active", b.dataset.unit === state.currentUnit);
  });

  // --- My Locations Quick Switcher ---
  elements.locationButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const locationId = btn.dataset.location;
      localStorage.setItem("skycast_selected_city", locationId);
      renderDashboard(locationId);

      // Close mobile menu if open
      if (elements.sidebar.classList.contains("mobile-open")) {
        closeMobileSidebar();
      }
    });
  });

  // --- Notification Popover Toggle ---
  elements.bellBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    state.isNotificationsOpen = !state.isNotificationsOpen;
    elements.notificationsDropdown.classList.toggle("active", state.isNotificationsOpen);
  });

  elements.markAllReadBtn.addEventListener("click", () => {
    state.unreadNotifications = 0;
    if (elements.bellBadge) {
      elements.bellBadge.style.display = "none";
    }
    const notifItems = document.querySelectorAll(".notification-item");
    notifItems.forEach(item => {
      item.style.opacity = "0.65";
    });
  });

  // Close notifications when clicking outside
  document.addEventListener("click", (e) => {
    if (state.isNotificationsOpen && !elements.notificationsDropdown.contains(e.target) && !elements.bellBtn.contains(e.target)) {
      state.isNotificationsOpen = false;
      elements.notificationsDropdown.classList.remove("active");
    }
  });

  // --- Search Autocomplete via WeatherService ---
  const searchableCities = WeatherService.searchableCities;

  elements.searchInput.addEventListener("focus", () => {
    showSearchSuggestions(elements.searchInput.value);
  });

  elements.searchInput.addEventListener("input", (e) => {
    showSearchSuggestions(e.target.value);
  });

  function showSearchSuggestions(query) {
    const matches = WeatherService.searchCities(query);

    if (matches.length > 0) {
      elements.searchResults.innerHTML = matches.map(m => `
        <div class="search-result-item" data-key="${m.key}">
          <span>${m.city}, ${m.region}</span>
          <span style="font-size: 11px; color: #94a3b8;">Select</span>
        </div>
      `).join("");
      elements.searchResults.classList.add("visible");
    } else {
      elements.searchResults.classList.remove("visible");
    }
  }

  // Handle clicking search result
  elements.searchResults.addEventListener("click", (e) => {
    const item = e.target.closest(".search-result-item");
    if (item) {
      const key = item.dataset.key;
      elements.searchInput.value = item.querySelector("span").textContent;
      elements.searchResults.classList.remove("visible");
      renderDashboard(key);
    }
  });

  // Close search results when clicking outside
  document.addEventListener("click", (e) => {
    if (!elements.searchInput.contains(e.target) && !elements.searchResults.contains(e.target)) {
      elements.searchResults.classList.remove("visible");
    }
  });

  // Global Keyboard shortcut: '/' to focus search
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== elements.searchInput) {
      e.preventDefault();
      elements.searchInput.focus();
    }
  });

  // --- Last Updated Refresh Button Interaction ---
  let isRefreshing = false;
  elements.refreshBtn.addEventListener("click", async () => {
    if (isRefreshing) return; // Prevent duplicate concurrent refresh calls
    isRefreshing = true;
    elements.refreshBtn.classList.add("spinning");

    try {
      await WeatherService.fetchLiveCityWeather(state.currentLocationId, undefined, undefined, true);
      renderDashboard(state.currentLocationId);
    } catch (err) {
      console.warn("Manual refresh failed, using cached data:", err);
    } finally {
      elements.refreshBtn.classList.remove("spinning");
      isRefreshing = false;
    }
  });

  // --- Horizontal Drag-to-Scroll for Hourly Forecast ---
  let isDown = false;
  let startX;
  let scrollLeft;

  elements.hourlyTrack.addEventListener("mousedown", (e) => {
    isDown = true;
    elements.hourlyTrack.style.cursor = "grabbing";
    startX = e.pageX - elements.hourlyTrack.offsetLeft;
    scrollLeft = elements.hourlyTrack.scrollLeft;
  });

  elements.hourlyTrack.addEventListener("mouseleave", () => {
    isDown = false;
    elements.hourlyTrack.style.cursor = "grab";
  });

  elements.hourlyTrack.addEventListener("mouseup", () => {
    isDown = false;
    elements.hourlyTrack.style.cursor = "grab";
  });

  elements.hourlyTrack.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - elements.hourlyTrack.offsetLeft;
    const walk = (x - startX) * 1.5;
    elements.hourlyTrack.scrollLeft = scrollLeft - walk;
  });

  // Enable mouse wheel horizontal scrolling
  elements.hourlyTrack.addEventListener("wheel", (e) => {
    if (e.deltaY !== 0) {
      e.preventDefault();
      elements.hourlyTrack.scrollLeft += e.deltaY;
    }
  });

  // --- Next 24 Hours Smooth Scroll ---
  if (elements.next24HoursLink) {
    elements.next24HoursLink.addEventListener("click", (e) => {
      e.preventDefault();
      elements.hourlyTrack.scrollBy({ left: 240, behavior: "smooth" });
    });
  }

  // --- Mobile Hamburger Navigation ---
  function openMobileSidebar() {
    elements.sidebar.classList.add("mobile-open");
    elements.sidebarBackdrop.classList.add("visible");
  }

  function closeMobileSidebar() {
    elements.sidebar.classList.remove("mobile-open");
    elements.sidebarBackdrop.classList.remove("visible");
  }

  if (elements.mobileMenuBtn) {
    elements.mobileMenuBtn.addEventListener("click", openMobileSidebar);
  }

  if (elements.sidebarCloseBtn) {
    elements.sidebarCloseBtn.addEventListener("click", closeMobileSidebar);
  }

  if (elements.sidebarBackdrop) {
    elements.sidebarBackdrop.addEventListener("click", closeMobileSidebar);
  }

  // --- SkyCast Loading Overlay API for Future State Reusability ---
  window.SkyCast = {
    showLoading: (message = "Fetching live weather data...") => {
      if (elements.loadingSubtext) elements.loadingSubtext.textContent = message;
      if (elements.loadingOverlay) elements.loadingOverlay.classList.add("active");
    },
    hideLoading: () => {
      if (elements.loadingOverlay) elements.loadingOverlay.classList.remove("active");
    },
    switchCity: (cityId) => {
      renderDashboard(cityId);
    }
  };

  // Initial Render (Synchronous initial paint for instant load)
  renderDashboard(state.currentLocationId);

  // Asynchronous Live Weather Fetch (enhances page with real Open-Meteo metrics)
  WeatherService.fetchLiveCityWeather(state.currentLocationId).then(liveData => {
    if (liveData) {
      renderDashboard(state.currentLocationId);
    }
  });

  // Listen for live weather updates across the app
  window.addEventListener("skycast:weatherUpdated", (e) => {
    if (e.detail && (e.detail.cityId === state.currentLocationId || e.detail.data.id === state.currentLocationId)) {
      renderDashboard(state.currentLocationId);
    }
  });
});
