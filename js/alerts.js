/**
 * SkyCast Weather Forecast - Weather Alerts Screen Application Logic
 * Vanilla JavaScript (Clean, Reactive & Modular)
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- State Management with LocalStorage Persistence ---
  const state = {
    selectedCity: localStorage.getItem("skycast_selected_city") || "coimbatore",
    currentUnit: localStorage.getItem("skycast_temp_unit") || "C",
    savedLocations: loadSavedLocations(),
    activeFilter: "all", // 'all' | 'warning' | 'watch' | 'advisory'
    notifications: loadNotificationHistory(),
    preferences: loadAlertPreferences(),
    isRadarExpanded: false,
    isHeaderNotifsOpen: false
  };

  function loadSavedLocations() {
    try {
      const stored = localStorage.getItem("skycast_saved_locations");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not read saved locations", e);
    }
    return ["coimbatore", "chennai", "ooty", "madurai"];
  }

  function loadNotificationHistory() {
    try {
      const stored = localStorage.getItem("skycast_notifications_history");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Could not read notification history", e);
    }
    return typeof DEMO_NOTIFICATION_HISTORY !== "undefined" ? [...DEMO_NOTIFICATION_HISTORY] : [];
  }

  function saveNotificationHistory() {
    localStorage.setItem("skycast_notifications_history", JSON.stringify(state.notifications));
  }

  function loadAlertPreferences() {
    const defaults = {
      inApp: true,
      browser: false,
      email: false,
      rain: true,
      thunderstorm: true,
      temp: true,
      severe: true,
      aqi: false
    };
    try {
      const stored = localStorage.getItem("skycast_alert_preferences");
      if (stored) {
        return Object.assign(defaults, JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not read alert preferences", e);
    }
    return defaults;
  }

  function saveAlertPreferences() {
    localStorage.setItem("skycast_alert_preferences", JSON.stringify(state.preferences));
  }

  // --- DOM Elements ---
  const elements = {
    // Header & Global Controls
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
    headerNotificationsList: document.getElementById("headerNotificationsList"),

    // Filters & Title
    filterPills: document.querySelectorAll(".alert-filter-pill"),
    countAll: document.getElementById("countAll"),
    countWarnings: document.getElementById("countWarnings"),
    countWatches: document.getElementById("countWatches"),
    countAdvisories: document.getElementById("countAdvisories"),
    activeAlertsTitle: document.getElementById("activeAlertsTitle"),
    activeCityLabel: document.getElementById("activeCityLabel"),
    alertsCardList: document.getElementById("alertsCardList"),

    // Live Radar Elements
    btnRadarExpand: document.getElementById("btnRadarExpand"),
    radarMapWrapper: document.getElementById("radarMapWrapper"),
    radarCityName: document.getElementById("radarCityName"),
    radarLocationPin: document.getElementById("radarLocationPin"),

    // Preferences Inputs
    prefInApp: document.getElementById("prefInApp"),
    prefBrowser: document.getElementById("prefBrowser"),
    prefEmail: document.getElementById("prefEmail"),
    typeRain: document.getElementById("typeRain"),
    typeThunderstorm: document.getElementById("typeThunderstorm"),
    typeTemp: document.getElementById("typeTemp"),
    typeSevere: document.getElementById("typeSevere"),
    typeAqi: document.getElementById("typeAqi"),

    // Notifications History
    notifHistoryList: document.getElementById("notifHistoryList"),
    btnMarkAllNotifsRead: document.getElementById("btnMarkAllNotifsRead"),
    btnClearNotifs: document.getElementById("btnClearNotifs"),

    // Modal
    alertModalBackdrop: document.getElementById("alertModalBackdrop"),
    btnModalClose: document.getElementById("btnModalClose"),
    modalIconBox: document.getElementById("modalIconBox"),
    modalAlertTitle: document.getElementById("modalAlertTitle"),
    modalSeverityBadge: document.getElementById("modalSeverityBadge"),
    modalLocation: document.getElementById("modalLocation"),
    modalIssuedTime: document.getElementById("modalIssuedTime"),
    modalDuration: document.getElementById("modalDuration"),
    modalSeverityVal: document.getElementById("modalSeverityVal"),
    modalBodyText: document.getElementById("modalBodyText"),
    modalSafetyAdvice: document.getElementById("modalSafetyAdvice"),

    // Toast
    skycastToast: document.getElementById("skycastToast"),
    toastIcon: document.getElementById("toastIcon"),
    toastText: document.getElementById("toastText")
  };

  // --- SVG Icons Library ---
  const alertIcons = {
    rain: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
        <path d="M8 19v2M12 19v2M16 19v2"/>
      </svg>
    `,
    thunderstorm: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    `,
    temperature: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
      </svg>
    `,
    wind: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
      </svg>
    `,
    uv: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
      </svg>
    `,
    fog: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12h14M3 8h18M7 16h10M9 20h6"/>
      </svg>
    `
  };

  // --- Helper Functions via SkyCastUtils ---
  function formatTemp(celsius) {
    return SkyCastUtils.formatTemp(celsius, state.currentUnit);
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

  // --- Live Data Source Indicator ---
  function updateSourceIndicator() {
    const chip = document.querySelector(".demo-mode-chip");
    if (!chip) return;
    const src = WeatherService.getCurrentDataSource();
    if (src === "live" || src === "cache") {
      const isLive = src === "live";
      chip.innerHTML = isLive
        ? '<span class="demo-dot" style="background:#10b981;box-shadow:0 0 8px rgba(16,185,129,0.7);"></span><span>Demo Alerts · Live Weather Data</span>'
        : '<span class="demo-dot" style="background:#38bdf8;box-shadow:0 0 8px rgba(56,189,248,0.7);"></span><span>Demo Alerts · Live Weather Data</span>';
      chip.style.borderColor = isLive ? "rgba(16, 185, 129, 0.4)" : "rgba(56, 189, 248, 0.4)";
      chip.title = "Weather alerts are simulated demo data. Sidebar city temperatures are retrieved from live Open-Meteo forecasts.";
    } else {
      chip.innerHTML = '<span class="demo-dot" style="background:#94a3b8;"></span><span>Demo Alerts · Demo Fallback</span>';
      chip.style.borderColor = "rgba(255, 255, 255, 0.1)";
      chip.title = "Weather alerts and weather temperatures are in demo fallback mode.";
    }
  }

  // --- Filter and Retrieve Alerts ---
  function getCityAlerts() {
    const alerts = typeof DEMO_WEATHER_ALERTS !== "undefined" ? DEMO_WEATHER_ALERTS : [];
    
    // First find alerts specific to current city
    const cityMatches = alerts.filter(a => a.cityId === state.selectedCity);

    // If current city has alerts, return them; otherwise provide default simulated alerts for preview
    if (cityMatches.length > 0) {
      return cityMatches;
    }

    // Fallback: return default regional alerts for general preview
    return alerts.slice(0, 3);
  }

  function getFilteredAlerts() {
    const cityAlerts = getCityAlerts();
    if (state.activeFilter === "all") return cityAlerts;
    return cityAlerts.filter(a => a.severity.toLowerCase() === state.activeFilter.toLowerCase());
  }

  // --- Update Badge Counts ---
  function updateFilterCounts() {
    const cityAlerts = getCityAlerts();
    const warnings = cityAlerts.filter(a => a.severity === "warning").length;
    const watches = cityAlerts.filter(a => a.severity === "watch").length;
    const advisories = cityAlerts.filter(a => a.severity === "advisory").length;

    if (elements.countAll) elements.countAll.textContent = cityAlerts.length;
    if (elements.countWarnings) elements.countWarnings.textContent = warnings;
    if (elements.countWatches) elements.countWatches.textContent = watches;
    if (elements.countAdvisories) elements.countAdvisories.textContent = advisories;
  }

  // --- Render Active Weather Alerts ---
  function renderActiveAlerts() {
    if (!elements.alertsCardList) return;

    const cityData = WeatherService.getCityWeather(state.selectedCity);
    if (!cityData) return;

    if (elements.activeCityLabel) {
      elements.activeCityLabel.textContent = `${cityData.city}, ${cityData.region}`;
    }
    if (elements.radarCityName) {
      elements.radarCityName.textContent = cityData.city;
    }

    const filtered = getFilteredAlerts();
    if (elements.activeAlertsTitle) {
      elements.activeAlertsTitle.textContent = `Active Alerts (${filtered.length})`;
    }

    if (filtered.length === 0) {
      elements.alertsCardList.innerHTML = `
        <div class="alerts-empty-state">
          <div class="alerts-empty-icon">
            <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h4 class="alerts-empty-title">All Clear for ${cityData.city}</h4>
          <p class="alerts-empty-desc">No active ${state.activeFilter !== 'all' ? state.activeFilter + 's' : 'weather warnings'} reported at this time.</p>
        </div>
      `;
      return;
    }

    elements.alertsCardList.innerHTML = filtered.map(alert => {
      const iconSvg = alertIcons[alert.icon] || alertIcons.rain;
      return `
        <article class="alert-card-item ${alert.severity}" data-alert-id="${alert.id}">
          <div class="alert-icon-square">
            ${iconSvg}
          </div>

          <div class="alert-card-text">
            <h4 class="alert-card-title">${alert.title}</h4>
            <p class="alert-card-desc">${alert.description}</p>
            <div class="alert-card-meta">
              <span class="alert-meta-tag">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                ${alert.duration || alert.issuedTime}
              </span>
              <span>•</span>
              <span>${alert.location}</span>
            </div>
          </div>

          <div class="alert-right-actions">
            <span class="alert-badge-capsule">${alert.severityLabel}</span>
            <svg class="alert-chevron-icon" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </article>
      `;
    }).join("");
  }

  // --- Open Alert Details Modal ---
  function openAlertModal(alertId) {
    const alerts = typeof DEMO_WEATHER_ALERTS !== "undefined" ? DEMO_WEATHER_ALERTS : [];
    const alert = alerts.find(a => a.id === alertId);
    if (!alert || !elements.alertModalBackdrop) return;

    elements.modalAlertTitle.textContent = alert.title;
    elements.modalSeverityBadge.textContent = alert.severityLabel;
    elements.modalSeverityBadge.className = `alert-badge-capsule`;

    // Icon
    elements.modalIconBox.innerHTML = alertIcons[alert.icon] || alertIcons.rain;
    elements.modalIconBox.style.background = 
      alert.severity === "warning" ? "rgba(239, 68, 68, 0.25)" :
      alert.severity === "watch" ? "rgba(245, 158, 11, 0.25)" : "rgba(2, 132, 199, 0.25)";

    elements.modalLocation.textContent = alert.location;
    elements.modalIssuedTime.textContent = alert.issuedTime;
    elements.modalDuration.textContent = alert.duration;
    elements.modalSeverityVal.textContent = alert.severityLabel + " Level";
    elements.modalBodyText.textContent = alert.details;
    elements.modalSafetyAdvice.textContent = alert.safetyAdvice;

    elements.alertModalBackdrop.classList.add("active");
  }

  function closeAlertModal() {
    if (elements.alertModalBackdrop) {
      elements.alertModalBackdrop.classList.remove("active");
    }
  }

  if (elements.btnModalClose) {
    elements.btnModalClose.addEventListener("click", closeAlertModal);
  }

  if (elements.alertModalBackdrop) {
    elements.alertModalBackdrop.addEventListener("click", (e) => {
      if (e.target === elements.alertModalBackdrop) closeAlertModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && elements.alertModalBackdrop?.classList.contains("active")) {
      closeAlertModal();
    }
  });

  // Click handler on Alert Cards
  if (elements.alertsCardList) {
    elements.alertsCardList.addEventListener("click", (e) => {
      const card = e.target.closest(".alert-card-item");
      if (card) {
        const alertId = card.dataset.alertId;
        openAlertModal(alertId);
      }
    });
  }

  // --- Render Recent Notifications History ---
  function renderNotificationHistory() {
    if (!elements.notifHistoryList) return;

    const unreadCount = state.notifications.filter(n => !n.read).length;
    if (elements.bellBadge) {
      elements.bellBadge.style.display = unreadCount > 0 ? "block" : "none";
    }

    if (state.notifications.length === 0) {
      elements.notifHistoryList.innerHTML = `
        <li style="text-align: center; color: var(--text-muted); font-size: 12.5px; padding: 18px 8px;">
          No recent notifications.
        </li>
      `;
      return;
    }

    elements.notifHistoryList.innerHTML = state.notifications.map(item => {
      const iconSvg = alertIcons[item.type] || alertIcons.rain;
      return `
        <li class="notif-history-item ${item.read ? 'read' : 'unread'}" data-notif-id="${item.id}">
          <span class="notif-history-dot"></span>
          <div class="notif-hist-icon-box">
            ${iconSvg}
          </div>
          <div class="notif-hist-content">
            <div class="notif-hist-header">
              <span class="notif-hist-title">${item.title}</span>
              <span class="notif-hist-time">${item.time}</span>
            </div>
            <p class="notif-hist-body">${item.description}</p>
          </div>
        </li>
      `;
    }).join("");

    // Also populate top header notifications dropdown
    if (elements.headerNotificationsList) {
      elements.headerNotificationsList.innerHTML = state.notifications.slice(0, 3).map(n => `
        <li class="notification-item" style="opacity: ${n.read ? '0.65' : '1'}">
          <div class="notif-icon-box">
            ${alertIcons[n.type] || alertIcons.rain}
          </div>
          <div class="notif-content">
            <div class="notif-top-line">
              <span>${n.title}</span>
              <span class="notif-time">${n.time}</span>
            </div>
            <p class="notif-desc">${n.description}</p>
          </div>
        </li>
      `).join("");
    }
  }

  // Toggle Read on Click
  if (elements.notifHistoryList) {
    elements.notifHistoryList.addEventListener("click", (e) => {
      const item = e.target.closest(".notif-history-item");
      if (item) {
        const id = item.dataset.notifId;
        const target = state.notifications.find(n => n.id === id);
        if (target) {
          target.read = !target.read;
          saveNotificationHistory();
          renderNotificationHistory();
          showToast(target.read ? "Marked notification as read" : "Marked notification as unread");
        }
      }
    });
  }

  // Mark All Notifications Read
  if (elements.btnMarkAllNotifsRead) {
    elements.btnMarkAllNotifsRead.addEventListener("click", () => {
      state.notifications.forEach(n => { n.read = true; });
      saveNotificationHistory();
      renderNotificationHistory();
      showToast("All notifications marked as read");
    });
  }

  // Clear Notifications
  if (elements.btnClearNotifs) {
    elements.btnClearNotifs.addEventListener("click", () => {
      state.notifications = [];
      saveNotificationHistory();
      renderNotificationHistory();
      showToast("Notification history cleared");
    });
  }

  // Top Header Mark All Read button
  if (elements.markAllReadBtn) {
    elements.markAllReadBtn.addEventListener("click", () => {
      state.notifications.forEach(n => { n.read = true; });
      saveNotificationHistory();
      renderNotificationHistory();
      showToast("All notifications marked as read");
    });
  }

  // --- Render Sidebar Locations List ---
  function renderSidebarLocations() {
    if (!elements.sidebarLocationsList) return;

    elements.sidebarLocationsList.innerHTML = state.savedLocations.map(cityId => {
      const data = WeatherService.getCityWeather(cityId);
      if (!data) return "";

      const isSelected = state.selectedCity === cityId;

      return `
        <li>
          <button class="location-item-btn ${isSelected ? 'selected' : ''}" data-location="${cityId}">
            <div class="location-item-left">
              <svg viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>${data.city}</span>
            </div>
            <span class="location-item-temp">${formatTemp(data.tempC)}</span>
          </button>
        </li>
      `;
    }).join("");

    elements.sidebarLocationsList.querySelectorAll(".location-item-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const cityId = btn.dataset.location;
        selectActiveCity(cityId);
      });
    });
  }

  // --- Select Active City Action ---
  async function selectActiveCity(cityId) {
    const data = WeatherService.getCityWeather(cityId);
    if (!data) return;
    state.selectedCity = cityId;
    localStorage.setItem("skycast_selected_city", cityId);

    // Update active highlight in sidebar
    document.querySelectorAll("#sidebarLocationsList .location-item-btn").forEach(btn => {
      btn.classList.toggle("selected", btn.dataset.location === cityId);
    });

    updateFilterCounts();
    renderActiveAlerts();
    showToast(`Viewing weather alerts for ${data.city}`);

    if (elements.sidebar?.classList.contains("mobile-open")) {
      closeMobileSidebar();
    }

    try {
      await WeatherService.fetchLiveCityWeather(cityId);
      renderSidebarLocations();
      renderActiveAlerts();
      updateSourceIndicator();
    } catch (e) {
      // safe fallback
    }
  }

  // --- Alert Filters Switching ---
  elements.filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      const filter = pill.dataset.filter;
      if (filter === state.activeFilter) return;

      elements.filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      state.activeFilter = filter;

      renderActiveAlerts();
    });
  });

  // --- Radar Fullscreen / Expand Toggle ---
  if (elements.btnRadarExpand && elements.radarMapWrapper) {
    elements.btnRadarExpand.addEventListener("click", () => {
      state.isRadarExpanded = !state.isRadarExpanded;
      if (state.isRadarExpanded) {
        elements.radarMapWrapper.style.height = "340px";
        elements.btnRadarExpand.style.background = "rgba(56, 189, 248, 0.25)";
        showToast("Radar view expanded");
      } else {
        elements.radarMapWrapper.style.height = "200px";
        elements.btnRadarExpand.style.background = "";
      }
    });
  }

  // --- Notification Preferences Binding & Persistence ---
  function initPreferences() {
    if (elements.prefInApp) elements.prefInApp.checked = state.preferences.inApp;
    if (elements.prefBrowser) elements.prefBrowser.checked = state.preferences.browser;
    if (elements.prefEmail) elements.prefEmail.checked = state.preferences.email;
    if (elements.typeRain) elements.typeRain.checked = state.preferences.rain;
    if (elements.typeThunderstorm) elements.typeThunderstorm.checked = state.preferences.thunderstorm;
    if (elements.typeTemp) elements.typeTemp.checked = state.preferences.temp;
    if (elements.typeSevere) elements.typeSevere.checked = state.preferences.severe;
    if (elements.typeAqi) elements.typeAqi.checked = state.preferences.aqi;

    // Attach listeners
    elements.prefInApp?.addEventListener("change", (e) => {
      state.preferences.inApp = e.target.checked;
      saveAlertPreferences();
      showToast(`In-App notifications ${e.target.checked ? 'enabled' : 'disabled'}`);
    });

    elements.prefBrowser?.addEventListener("change", async (e) => {
      if (e.target.checked) {
        // Safe interactive prompt for Notification permission
        if ("Notification" in window) {
          try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
              state.preferences.browser = true;
              showToast("Browser notifications permission granted! 🔔");
            } else {
              state.preferences.browser = false;
              e.target.checked = false;
              showToast("Browser notification permission denied or dismissed.", "warning");
            }
          } catch (err) {
            console.warn(err);
            state.preferences.browser = true;
            showToast("Browser alerts enabled.");
          }
        } else {
          showToast("Browser notifications not supported in this client.", "warning");
        }
      } else {
        state.preferences.browser = false;
        showToast("Browser notifications disabled.");
      }
      saveAlertPreferences();
    });

    elements.prefEmail?.addEventListener("change", (e) => {
      state.preferences.email = e.target.checked;
      saveAlertPreferences();
      showToast(`Email alerts ${e.target.checked ? 'enabled' : 'disabled'}`);
    });

    [
      { el: elements.typeRain, key: "rain", label: "Rain alerts" },
      { el: elements.typeThunderstorm, key: "thunderstorm", label: "Thunderstorm alerts" },
      { el: elements.typeTemp, key: "temp", label: "Temperature alerts" },
      { el: elements.typeSevere, key: "severe", label: "Severe weather alerts" },
      { el: elements.typeAqi, key: "aqi", label: "Air quality alerts" }
    ].forEach(item => {
      if (item.el) {
        item.el.addEventListener("change", (e) => {
          state.preferences[item.key] = e.target.checked;
          saveAlertPreferences();
          showToast(`${item.label} ${e.target.checked ? 'subscribed' : 'unsubscribed'}`);
        });
      }
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

      renderSidebarLocations();
      showToast(`Temperature unit set to °${unit}`);
    });
  });

  // Activate matching unit button
  elements.unitButtons.forEach(b => {
    b.classList.toggle("active", b.dataset.unit === state.currentUnit);
  });

  // --- Top Header Search Autocomplete ---
  if (elements.topSearchInput && elements.topSearchResults) {
    function getSearchMatches(query) {
      return WeatherService.searchCities(query);
    }

    elements.topSearchInput.addEventListener("focus", () => {
      showTopSearchSuggestions(elements.topSearchInput.value);
    });

    elements.topSearchInput.addEventListener("input", (e) => {
      showTopSearchSuggestions(e.target.value);
    });

    function showTopSearchSuggestions(query) {
      const matches = getSearchMatches(query);
      if (matches.length > 0) {
        elements.topSearchResults.innerHTML = matches.map(m => {
          const mId = m.id || m.city.toLowerCase().replace(/[^a-z0-9]/g, "");
          return `
            <div class="search-result-item" data-key="${mId}">
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
        elements.topSearchInput.value = item.querySelector("span").textContent;
        elements.topSearchResults.classList.remove("visible");
        selectActiveCity(key);
      }
    });

    document.addEventListener("click", (e) => {
      if (!elements.topSearchInput.contains(e.target) && !elements.topSearchResults.contains(e.target)) {
        elements.topSearchResults.classList.remove("visible");
      }
    });
  }

  // Global '/' keyboard shortcut
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== elements.topSearchInput) {
      e.preventDefault();
      elements.topSearchInput?.focus();
    }
  });

  // --- Header Notifications Dropdown Toggle ---
  if (elements.bellBtn) {
    elements.bellBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      state.isHeaderNotifsOpen = !state.isHeaderNotifsOpen;
      elements.notificationsDropdown?.classList.toggle("active", state.isHeaderNotifsOpen);
    });
  }

  document.addEventListener("click", (e) => {
    if (state.isHeaderNotifsOpen && elements.notificationsDropdown && !elements.notificationsDropdown.contains(e.target) && !elements.bellBtn.contains(e.target)) {
      state.isHeaderNotifsOpen = false;
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

  // --- Master Initialization ---
  updateFilterCounts();
  renderActiveAlerts();
  renderNotificationHistory();
  renderSidebarLocations();
  initPreferences();
  updateSourceIndicator();

  // Async load live weather for active city
  WeatherService.fetchLiveCityWeather(state.selectedCity).then(() => {
    renderSidebarLocations();
    renderActiveAlerts();
    updateSourceIndicator();
  }).catch(() => {
    // Keep fallback
  });

  window.addEventListener("skycast:weatherUpdated", () => {
    renderSidebarLocations();
    renderActiveAlerts();
    updateSourceIndicator();
  });

  console.log("SkyCast Weather Alerts screen initialized successfully.");
});
