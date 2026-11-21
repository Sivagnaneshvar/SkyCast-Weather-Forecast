/**
 * SkyCast Weather Forecast - Settings Screen Application Logic
 * Pure Vanilla JavaScript (Clean, Modular & Production-Ready)
 *
 * NOTE: Some preferences are demo-only and clearly labelled.
 * They persist in localStorage but do not alter live behaviour
 * until a real API or service is connected.
 */

document.addEventListener("DOMContentLoaded", () => {

  // ─── Default Settings Map ─────────────────────────────────────────────
  const DEFAULTS = {
    skycast_temp_unit:           "C",
    skycast_selected_city:       "coimbatore",
    skycast_language:            "en",
    skycast_theme:               "dark",
    skycast_bg_image:            "hills",
    skycast_weather_bg:          "false",
    skycast_glass_effect:        "true",
    skycast_auto_location:       "false",
    skycast_notif_inapp:         "true",
    skycast_notif_browser:       "false",
    skycast_notif_daily:         "true",
    skycast_notif_rain:          "true",
    skycast_notif_thunder:       "true",
    skycast_notif_severe:        "true",
    skycast_notif_temp_change:   "false",
    skycast_refresh_interval:    "30",
    skycast_offline:             "false",
  };

  // ─── Read stored value or fall back to default ────────────────────────
  const getSetting = (key) => localStorage.getItem(key) ?? DEFAULTS[key];
  const setBool    = (key, el) => { el.checked = getSetting(key) === "true"; };

  // ─── DOM References ───────────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const els = {
    // Header unit toggle (shared with global header)
    headerUnitBtns:   $$(".temp-toggle-capsule .unit-btn"),

    // Settings-specific controls
    unitBtns:         $$("#settingsTempUnit .setting-unit-btn"),
    locationSelect:   $("#settingsDefaultLocation"),
    languageSelect:   $("#settingsLanguage"),
    themeBtns:        $$("#settingsThemeToggle .theme-btn"),
    bgThumbs:         $$("#bgGallery .bg-thumb"),
    weatherBgToggle:  $("#settingsWeatherBg"),
    glassToggle:      $("#settingsGlassEffect"),
    autoLocToggle:    $("#settingsAutoLocation"),
    inAppNotif:       $("#settingsInAppNotif"),
    browserNotif:     $("#settingsBrowserNotif"),
    dailySummary:     $("#settingsDailySummary"),
    rainAlert:        $("#settingsRainAlert"),
    thunderAlert:     $("#settingsThunderAlert"),
    severeAlert:      $("#settingsSevereAlert"),
    tempChangeAlert:  $("#settingsTempChangeAlert"),
    refreshSelect:    $("#settingsRefreshInterval"),
    offlineToggle:    $("#settingsOffline"),
    clearCacheBtn:    $("#settingsClearCache"),
    lastUpdated:      $("#settingsLastUpdated"),
    resetBtn:         $("#settingsResetBtn"),
    toast:            $("#settingsToast"),
    toastMsg:         $("#settingsToastMsg"),

    // About link cards
    aboutHelp:        $("#aboutHelp"),
    aboutPrivacy:     $("#aboutPrivacy"),
    aboutTerms:       $("#aboutTerms"),
    aboutRate:        $("#aboutRate"),
    aboutUpdates:     $("#aboutUpdates"),

    // Mobile sidebar
    mobileMenuBtn:    $("#mobileMenuBtn"),
    sidebar:          $("#sidebar"),
    sidebarCloseBtn:  $("#sidebarCloseBtn"),
    sidebarBackdrop:  $("#sidebarBackdrop"),
    sidebarLocList:   $("#sidebarLocationsList"),

    // Header search
    searchInput:      $("#topSearchInput"),
    searchResults:    $("#topSearchResults"),
  };

  // ─── Toast Helper ─────────────────────────────────────────────────────
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    els.toastMsg.textContent = msg;
    els.toast.classList.add("show");
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), 3200);
  }

  // ─── Populate Sidebar Locations ───────────────────────────────────────
  function populateSidebarLocations() {
    if (!els.sidebarLocList) return;
    const currentUnit = getSetting("skycast_temp_unit");
    const currentCity = getSetting("skycast_selected_city");
    let cities = ["coimbatore", "chennai", "ooty", "madurai"];
    try {
      const stored = localStorage.getItem("skycast_saved_locations");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) cities = parsed;
      }
    } catch (e) {}

    els.sidebarLocList.innerHTML = cities.map(key => {
      const d = WeatherService.getCityWeather(key);
      if (!d) return "";
      const temp = SkyCastUtils.formatTemp(d.tempC, currentUnit);
      const sel = key === currentCity ? " selected" : "";
      return `
        <li>
          <button class="location-item-btn${sel}" data-location="${key}">
            <div class="location-item-left">
              <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${d.city}</span>
            </div>
            <span class="location-item-temp">${temp}</span>
          </button>
        </li>`;
    }).join("");

    // Click handler for sidebar cities
    els.sidebarLocList.querySelectorAll(".location-item-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.location;
        localStorage.setItem("skycast_selected_city", key);
        els.locationSelect.value = key;
        populateSidebarLocations();
        const d = WeatherService.getCityWeather(key);
        showToast(`Location switched to ${d ? d.city : key}`);
      });
    });
  }

  // ─── Initialize UI from localStorage ──────────────────────────────────
  function initUI() {
    const unit = getSetting("skycast_temp_unit");
    els.unitBtns.forEach(b => b.classList.toggle("active", b.dataset.unit === unit));
    els.headerUnitBtns.forEach(b => b.classList.toggle("active", b.dataset.unit === unit));

    els.locationSelect.value  = getSetting("skycast_selected_city");
    els.languageSelect.value  = getSetting("skycast_language");
    els.refreshSelect.value   = getSetting("skycast_refresh_interval");

    // Theme
    const theme = getSetting("skycast_theme");
    els.themeBtns.forEach(b => b.classList.toggle("active", b.dataset.theme === theme));

    // Background gallery
    const bg = getSetting("skycast_bg_image");
    els.bgThumbs.forEach(t => t.classList.toggle("active", t.dataset.bg === bg));

    // Toggle switches
    setBool("skycast_weather_bg",        els.weatherBgToggle);
    setBool("skycast_glass_effect",      els.glassToggle);
    setBool("skycast_auto_location",     els.autoLocToggle);
    setBool("skycast_notif_inapp",       els.inAppNotif);
    setBool("skycast_notif_browser",     els.browserNotif);
    setBool("skycast_notif_daily",       els.dailySummary);
    setBool("skycast_notif_rain",        els.rainAlert);
    setBool("skycast_notif_thunder",     els.thunderAlert);
    setBool("skycast_notif_severe",      els.severeAlert);
    setBool("skycast_notif_temp_change", els.tempChangeAlert);
    setBool("skycast_offline",           els.offlineToggle);

    // Last updated
    els.lastUpdated.textContent = `Last updated: ${new Date().toLocaleString()}`;

    populateSidebarLocations();
  }

  initUI();

  // ─── Temperature Unit ─────────────────────────────────────────────────
  els.unitBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("active")) return;
      localStorage.setItem("skycast_temp_unit", btn.dataset.unit);
      els.unitBtns.forEach(b => b.classList.toggle("active", b.dataset.unit === btn.dataset.unit));
      els.headerUnitBtns.forEach(b => b.classList.toggle("active", b.dataset.unit === btn.dataset.unit));
      populateSidebarLocations();
      showToast(`Temperature unit set to °${btn.dataset.unit}`);
    });
  });

  // Keep header toggle in sync too
  els.headerUnitBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("active")) return;
      localStorage.setItem("skycast_temp_unit", btn.dataset.unit);
      els.unitBtns.forEach(b => b.classList.toggle("active", b.dataset.unit === btn.dataset.unit));
      els.headerUnitBtns.forEach(b => b.classList.toggle("active", b.dataset.unit === btn.dataset.unit));
      populateSidebarLocations();
      showToast(`Temperature unit set to °${btn.dataset.unit}`);
    });
  });

  // ─── Default Location ─────────────────────────────────────────────────
  els.locationSelect.addEventListener("change", () => {
    localStorage.setItem("skycast_selected_city", els.locationSelect.value);
    populateSidebarLocations();
    const d = WeatherService.getCityWeather(els.locationSelect.value);
    const city = d ? d.city : els.locationSelect.value;
    showToast(`Default location set to ${city}`);
  });

  // ─── Language ─────────────────────────────────────────────────────────
  els.languageSelect.addEventListener("change", () => {
    localStorage.setItem("skycast_language", els.languageSelect.value);
    showToast("Language preference saved (demo)");
  });

  // ─── Theme Toggle ─────────────────────────────────────────────────────
  els.themeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("active")) return;
      const theme = btn.dataset.theme;
      localStorage.setItem("skycast_theme", theme);
      els.themeBtns.forEach(b => b.classList.toggle("active", b.dataset.theme === theme));
      if (window.SkyCastTheme) {
        window.SkyCastTheme.apply(theme);
      }
      showToast(`Theme set to ${theme.charAt(0).toUpperCase() + theme.slice(1)}`);
    });
  });

  // ─── Background Gallery ───────────────────────────────────────────────
  els.bgThumbs.forEach(thumb => {
    thumb.addEventListener("click", () => {
      if (thumb.classList.contains("active")) return;
      const bg = thumb.dataset.bg;
      localStorage.setItem("skycast_bg_image", bg);
      els.bgThumbs.forEach(t => t.classList.toggle("active", t.dataset.bg === bg));
      if (window.SkyCastTheme) {
        window.SkyCastTheme.setManualBg(bg);
      }
      const label = bg.charAt(0).toUpperCase() + bg.slice(1);
      const isWeatherBg = window.SkyCastTheme && window.SkyCastTheme.getWeatherBgSetting();
      if (isWeatherBg) {
        showToast(`Manual background set to ${label} (will apply when Weather-Based Background is OFF)`);
      } else {
        showToast(`Background set to ${label}`);
      }
    });
  });

  // ─── Weather-Based Background Toggle ─────────────────────────────────
  els.weatherBgToggle.addEventListener("change", () => {
    const enabled = els.weatherBgToggle.checked;
    if (window.SkyCastTheme) {
      window.SkyCastTheme.setWeatherBg(enabled);
    } else {
      localStorage.setItem("skycast_weather_bg", enabled.toString());
    }
    showToast(`Weather-based background ${enabled ? "enabled" : "disabled"}`);
  });

  // ─── Simple Toggle Handlers ───────────────────────────────────────────
  const toggleMap = [
    { el: els.glassToggle,      key: "skycast_glass_effect",      label: "Glassmorphism effect" },
    { el: els.autoLocToggle,    key: "skycast_auto_location",     label: "Automatic location detection" },
    { el: els.inAppNotif,       key: "skycast_notif_inapp",       label: "In-app notifications" },
    { el: els.dailySummary,     key: "skycast_notif_daily",       label: "Daily weather summary" },
    { el: els.rainAlert,        key: "skycast_notif_rain",        label: "Rain alerts" },
    { el: els.thunderAlert,     key: "skycast_notif_thunder",     label: "Thunderstorm alerts" },
    { el: els.severeAlert,      key: "skycast_notif_severe",      label: "Severe weather alerts" },
    { el: els.tempChangeAlert,  key: "skycast_notif_temp_change", label: "Temperature change alerts" },
    { el: els.offlineToggle,    key: "skycast_offline",           label: "Offline support" },
  ];

  toggleMap.forEach(({ el, key, label }) => {
    el.addEventListener("change", () => {
      localStorage.setItem(key, el.checked.toString());
      if (key === "skycast_glass_effect" && window.SkyCastTheme) {
        window.SkyCastTheme.applyGlass(el.checked);
      }
      showToast(`${label} ${el.checked ? "enabled" : "disabled"}`);
    });
  });

  // ─── Browser Notifications (requires permission on user action) ──────
  els.browserNotif.addEventListener("change", () => {
    if (els.browserNotif.checked) {
      if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission().then(perm => {
          if (perm === "granted") {
            localStorage.setItem("skycast_notif_browser", "true");
            showToast("Browser notifications enabled");
          } else {
            els.browserNotif.checked = false;
            localStorage.setItem("skycast_notif_browser", "false");
            showToast("Browser notification permission denied");
          }
        });
      } else {
        localStorage.setItem("skycast_notif_browser", "true");
        showToast("Browser notifications enabled");
      }
    } else {
      localStorage.setItem("skycast_notif_browser", "false");
      showToast("Browser notifications disabled");
    }
  });

  // ─── Auto Refresh Interval ────────────────────────────────────────────
  els.refreshSelect.addEventListener("change", () => {
    const val = els.refreshSelect.value;
    localStorage.setItem("skycast_refresh_interval", val);
    if (window.WeatherService && window.WeatherService.autoRefresh) {
      window.WeatherService.autoRefresh.restart();
    }
    const label = els.refreshSelect.options[els.refreshSelect.selectedIndex].text;
    showToast(`Auto refresh set to ${label}`);
  });

  // ─── Clear Cache ──────────────────────────────────────────────────────
  els.clearCacheBtn.addEventListener("click", () => {
    if (!confirm("Clear all cached demo data?\n\nThis will remove saved preferences and refresh the page.")) return;
    const keys = Object.keys(localStorage).filter(k => k.startsWith("skycast_"));
    keys.forEach(k => localStorage.removeItem(k));
    showToast("Cache cleared – reloading…");
    setTimeout(() => location.reload(), 1200);
  });

  // ─── Reset to Defaults ────────────────────────────────────────────────
  els.resetBtn.addEventListener("click", () => {
    if (!confirm("Reset all settings to factory defaults?\n\nThis will overwrite your current preferences.")) return;
    Object.entries(DEFAULTS).forEach(([k, v]) => localStorage.setItem(k, v));
    showToast("Settings restored to defaults – reloading…");
    setTimeout(() => location.reload(), 1200);
  });

  // ─── About Link Cards ────────────────────────────────────────────────
  [els.aboutHelp, els.aboutPrivacy, els.aboutTerms, els.aboutRate, els.aboutUpdates].forEach(card => {
    if (!card) return;
    card.addEventListener("click", (e) => {
      e.preventDefault();
      showToast(`${card.querySelector(".about-link-title").textContent} – coming soon`);
    });
  });

  // ─── Mobile Sidebar Toggle ────────────────────────────────────────────
  function openMobileSidebar()  {
    els.sidebar.classList.add("mobile-open");
    els.sidebarBackdrop.classList.add("visible");
  }
  function closeMobileSidebar() {
    els.sidebar.classList.remove("mobile-open");
    els.sidebarBackdrop.classList.remove("visible");
  }
  if (els.mobileMenuBtn)    els.mobileMenuBtn.addEventListener("click", openMobileSidebar);
  if (els.sidebarCloseBtn)  els.sidebarCloseBtn.addEventListener("click", closeMobileSidebar);
  if (els.sidebarBackdrop)  els.sidebarBackdrop.addEventListener("click", closeMobileSidebar);

  // ─── Header Search Autocomplete via WeatherService ───────
  const searchableCities = WeatherService.searchableCities;

  if (els.searchInput) {
    els.searchInput.addEventListener("focus", () => showSearchSuggestions(els.searchInput.value));
    els.searchInput.addEventListener("input", (e) => showSearchSuggestions(e.target.value));

    function showSearchSuggestions(query) {
      const matches = WeatherService.searchCities(query);
      if (matches.length > 0) {
        els.searchResults.innerHTML = matches.map(m => `
          <div class="search-result-item" data-key="${m.key}">
            <span>${m.city}, ${m.region}</span>
            <span style="font-size:11px;color:#94a3b8;">Select</span>
          </div>
        `).join("");
        els.searchResults.classList.add("visible");
      } else {
        els.searchResults.classList.remove("visible");
      }
    }

    els.searchResults.addEventListener("click", (e) => {
      const item = e.target.closest(".search-result-item");
      if (item) {
        const key = item.dataset.key;
        localStorage.setItem("skycast_selected_city", key);
        els.searchInput.value = item.querySelector("span").textContent;
        els.searchResults.classList.remove("visible");
        els.locationSelect.value = key;
        populateSidebarLocations();
        const d = WeatherService.getCityWeather(key);
        showToast(`Location switched to ${d ? d.city : key}`);
      }
    });

    document.addEventListener("click", (e) => {
      if (!els.searchInput.contains(e.target) && !els.searchResults.contains(e.target)) {
        els.searchResults.classList.remove("visible");
      }
    });

    // Keyboard shortcut: / to focus search
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== els.searchInput) {
        e.preventDefault();
        els.searchInput.focus();
      }
    });
  }

  // ─── Live Weather Update Listener ────────────────────────────────────
  window.addEventListener("skycast:weatherUpdated", () => {
    populateSidebarLocations();
    if (els.lastUpdated) {
      els.lastUpdated.textContent = `Last updated: ${new Date().toLocaleString()}`;
    }
  });

  // ─── Cross-tab Sync via storage event ─────────────────────────────────
  window.addEventListener("storage", (e) => {
    if (e.key === "skycast_temp_unit" || e.key === "skycast_selected_city" || e.key === "skycast_theme" || e.key === "skycast_glass_effect" || e.key === "skycast_weather_bg" || e.key === "skycast_bg_image" || e.key === "skycast_refresh_interval") {
      initUI(); // re-render all controls
    }
  });

});
