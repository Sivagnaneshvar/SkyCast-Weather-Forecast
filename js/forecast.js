/**
 * SkyCast Weather Forecast - Detailed Forecast Screen Logic
 * Vanilla JavaScript (Clean, Reactive & Modular)
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- State Management ---
  const state = {
    currentUnit: localStorage.getItem("skycast_temp_unit") || "C", // 'C' or 'F'
    currentLocationId: localStorage.getItem("skycast_selected_city") || "coimbatore",
    activeTab: "today",
    isNotificationsOpen: false
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

    // Sub-Navigation & Header
    forecastPageTitle: document.getElementById("forecastPageTitle"),
    subnavPills: document.querySelectorAll(".subnav-pill"),

    // Today's Weather Overview Stats
    overviewCurrentTemp: document.getElementById("overviewCurrentTemp"),
    overviewCondition: document.getElementById("overviewCondition"),
    overviewFeelsLike: document.getElementById("overviewFeelsLike"),
    overviewHighLow: document.getElementById("overviewHighLow"),
    overviewRainChance: document.getElementById("overviewRainChance"),

    // Hourly Forecast Track
    hourlyTrack: document.getElementById("hourlyTrack"),
    next24HoursLink: document.getElementById("next24HoursLink"),

    // 24-Hour Temp Trend Chart
    chartSvg: document.getElementById("chartSvg"),
    chartTooltipBubble: document.getElementById("chartTooltipBubble"),
    chartTooltipVal: document.getElementById("chartTooltipVal"),
    chartTooltipTime: document.getElementById("chartTooltipTime"),

    // Precipitation Bar Chart
    precipBarsContainer: document.getElementById("precipBarsContainer"),

    // Weather Details Grid
    detailFeelsLike: document.getElementById("detailFeelsLike"),
    detailVisibility: document.getElementById("detailVisibility"),
    detailCloudCover: document.getElementById("detailCloudCover"),
    detailDewPoint: document.getElementById("detailDewPoint"),
    detailHumidity: document.getElementById("detailHumidity"),
    detailWind: document.getElementById("detailWind"),
    detailPressure: document.getElementById("detailPressure"),
    detailUvIndex: document.getElementById("detailUvIndex"),

    // 7-Day Detailed Forecast List
    sevenDayDetailedList: document.getElementById("sevenDayDetailedList"),

    // Locations List
    locationButtons: document.querySelectorAll(".location-item-btn")
  };

  // --- Weather Icons SVG Library & Formatters via SkyCastUtils ---
  const weatherIcons = SkyCastUtils.icons;
  const toUnitTemp = (celsius) => state.currentUnit === "C" ? Math.round(celsius) : Math.round(SkyCastUtils.celsiusToFahrenheit(celsius));
  const formatTemp = (celsius) => SkyCastUtils.formatTemp(celsius, state.currentUnit);
  const formatTempNum = (celsius) => SkyCastUtils.formatTempNum(celsius, state.currentUnit);

  // --- Render Entire Forecast Screen ---
  function renderForecastScreen(locationId) {
    const data = WeatherService.getCityWeather(locationId);
    state.currentLocationId = locationId;

    // 1. Header Title
    if (elements.forecastPageTitle) {
      elements.forecastPageTitle.textContent = `Detailed Forecast – ${data.city}`;
    }

    // 2. Today's Weather Overview Stats
    if (elements.overviewCurrentTemp) elements.overviewCurrentTemp.textContent = formatTemp(data.tempC);
    if (elements.overviewCondition) elements.overviewCondition.textContent = data.condition;
    if (elements.overviewFeelsLike) elements.overviewFeelsLike.textContent = formatTemp(data.feelsLikeC);
    if (elements.overviewHighLow) elements.overviewHighLow.textContent = `${formatTempNum(data.highC)} / ${formatTempNum(data.lowC)}`;
    if (elements.overviewRainChance) elements.overviewRainChance.textContent = data.precipProbability;

    // 3. Hourly Forecast Track (Next 24 Hours)
    if (elements.hourlyTrack) {
      const hourlyList = Array.isArray(data.hourly) ? data.hourly : [];
      elements.hourlyTrack.innerHTML = hourlyList.map((item, idx) => {
        const cardTemp = (idx === 0 || item.active || item.time === "Now") && typeof data.tempC === "number"
          ? data.tempC
          : item.tempC;

        return `
          <div class="hourly-card ${item.active ? 'active' : ''}">
            <span class="hourly-time">${item.time}</span>
            <div class="hourly-icon">
              ${weatherIcons[item.icon] || weatherIcons["cloudy"]}
            </div>
            <span class="hourly-temp">${formatTempNum(cardTemp)}</span>
            <span style="font-size: 10.5px; color: #38bdf8; font-weight: 600;">💧 ${item.pop}</span>
          </div>
        `;
      }).join("");
    }

    // 4. Render Temperature Trend (24 Hours) Interactive Line Chart
    renderTempTrendChart(data.tempTrend24h, data.hourly, data.tempC);

    // 5. Render Precipitation Bar Chart
    renderPrecipitationBars(data.precipitationTrend, data.hourly);

    // 6. Weather Details Grid
    if (elements.detailFeelsLike) elements.detailFeelsLike.textContent = formatTemp(data.feelsLikeC);
    if (elements.detailVisibility) elements.detailVisibility.textContent = data.visibility;
    if (elements.detailCloudCover) elements.detailCloudCover.textContent = data.cloudCover;
    if (elements.detailDewPoint) elements.detailDewPoint.textContent = formatTemp(data.dewPointC);
    if (elements.detailHumidity) elements.detailHumidity.textContent = data.humidity;
    if (elements.detailWind) elements.detailWind.textContent = `${data.wind} ${data.windDirection}`;
    if (elements.detailPressure) elements.detailPressure.textContent = data.pressure;
    if (elements.detailUvIndex) elements.detailUvIndex.textContent = `${data.uvIndex} (${data.uvStatus})`;

    // 7. Seven-Day Detailed Forecast List
    if (elements.sevenDayDetailedList) {
      const dailyList = Array.isArray(data.daily) ? data.daily : [];
      // Find overall high and low to scale horizontal temperature bars
      const minDaily = dailyList.length > 0 ? Math.min(...dailyList.map(d => typeof d.lowC === 'number' && !isNaN(d.lowC) ? d.lowC : 20)) : 15;
      const maxDaily = dailyList.length > 0 ? Math.max(...dailyList.map(d => typeof d.highC === 'number' && !isNaN(d.highC) ? d.highC : 30)) : 35;
      const range = Math.max(1, maxDaily - minDaily);

      elements.sevenDayDetailedList.innerHTML = dailyList.map(day => {
        const leftPercent = Math.max(0, ((day.lowC - minDaily) / range) * 80);
        const widthPercent = Math.max(15, ((day.highC - day.lowC) / range) * 80);

        return `
          <div class="daily-detail-row">
            <div class="daily-date-col">
              <span class="daily-day-name">${day.day}</span>
              <span class="daily-subdate">${day.date}</span>
            </div>
            <div class="daily-condition-col">
              <div class="daily-condition-icon">
                ${weatherIcons[day.icon] || weatherIcons["partly-cloudy-day"]}
              </div>
              <span class="daily-condition-text">${day.condition}</span>
            </div>
            <div class="daily-rain-col">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
              </svg>
              <span>${day.pop}</span>
            </div>
            <div class="daily-temp-range-col">
              <span class="temp-min-text">${formatTempNum(day.lowC)}</span>
              <div class="temp-bar-track">
                <div class="temp-bar-gradient" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>
              </div>
              <span class="temp-max-text">${formatTempNum(day.highC)}</span>
            </div>
          </div>
        `;
      }).join("");
    }

    // 8. Update Sidebar Location Items (using WeatherService for live sync)
    elements.locationButtons.forEach(btn => {
      const loc = btn.dataset.location;
      if (loc === locationId) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }
      const tempSpan = btn.querySelector(".location-item-temp");
      if (tempSpan) {
        const cityWeather = WeatherService.getCityWeather(loc);
        if (cityWeather && typeof cityWeather.tempC === "number" && !isNaN(cityWeather.tempC)) {
          tempSpan.textContent = formatTemp(cityWeather.tempC);
        } else if (typeof DEMO_LOCATIONS !== "undefined" && DEMO_LOCATIONS[loc]) {
          tempSpan.textContent = formatTemp(DEMO_LOCATIONS[loc].tempC);
        }
      }
    });

    // 9. Update Data Source Indicator Chip
    const demoChip = document.querySelector(".demo-mode-chip");
    if (demoChip) {
      if (data.source === "live") {
        demoChip.innerHTML = '<span class="demo-dot" style="background:#22c55e;box-shadow:0 0 6px #22c55e;"></span><span>Live API</span>';
        demoChip.style.borderColor = "rgba(34, 197, 94, 0.4)";
      } else if (data.source === "cache") {
        demoChip.innerHTML = '<span class="demo-dot" style="background:#38bdf8;box-shadow:0 0 6px #38bdf8;"></span><span>Cached</span>';
        demoChip.style.borderColor = "rgba(56, 189, 248, 0.4)";
      } else {
        demoChip.innerHTML = '<span class="demo-dot"></span><span>Demo Data Mode</span>';
        demoChip.style.borderColor = "";
      }
    }
  }

  // --- Dynamic SVG Line Chart for 24-Hour Temperature Trend ---
  function renderTempTrendChart(trendData, hourlyFallback, authoritativeCurrentTemp) {
    if (!elements.chartSvg) return;

    // Use trendData if non-empty, otherwise fallback to hourlyFallback
    let sourceData = (Array.isArray(trendData) && trendData.length > 0)
      ? trendData
      : (Array.isArray(hourlyFallback) && hourlyFallback.length > 0 ? hourlyFallback : null);

    if (!sourceData || sourceData.length === 0) {
      elements.chartSvg.innerHTML = `<text x="400" y="110" fill="#64748b" font-size="14" text-anchor="middle" font-family="inherit">No temperature trend data available</text>`;
      return;
    }

    const width = 800;
    const height = 220;
    const paddingLeft = 55;
    const paddingRight = 35;
    const paddingTop = 25;
    const paddingBottom = 40;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    // If sourceData contains more than 12 hourly items (e.g. 24 raw hours), sample 8 evenly spaced points across 24h
    let sampledData = sourceData;
    if (sourceData.length > 12) {
      sampledData = [];
      const step = Math.floor(sourceData.length / 8);
      for (let s = 0; s < 8; s++) {
        const idx = Math.min(s * step, sourceData.length - 1);
        sampledData.push(sourceData[idx]);
      }
    }

    // Convert values to selected unit with robust type and timestamp validation
    const pointsData = sampledData.map((d, index) => {
      const isObj = typeof d === "object" && d !== null;
      let rawTemp = isObj ? d.tempC : d;

      // Authoritative current temperature for the initial point ("Now")
      if (index === 0 && typeof authoritativeCurrentTemp === "number" && !isNaN(authoritativeCurrentTemp)) {
        rawTemp = authoritativeCurrentTemp;
      }

      const tempNum = (typeof rawTemp === "number" && !isNaN(rawTemp)) ? rawTemp : 25;
      const val = toUnitTemp(tempNum);

      // Resolve valid meaningful local time label (e.g. 8 PM, 11 PM, 2 AM) - NEVER use 69h or raw offset strings
      let timeStr = "";
      if (isObj && d.time) {
        timeStr = String(d.time);
      } else if (Array.isArray(hourlyFallback)) {
        const hIdx = sampledData.length <= 8 ? Math.min(index * 3, hourlyFallback.length - 1) : index;
        if (hourlyFallback[hIdx] && hourlyFallback[hIdx].time) {
          timeStr = String(hourlyFallback[hIdx].time);
        }
      }
      if (!timeStr) {
        const hr = (new Date().getHours() + (index * 3)) % 24;
        const ampm = hr >= 12 ? "PM" : "AM";
        const hr12 = hr % 12 === 0 ? 12 : hr % 12;
        timeStr = `${hr12} ${ampm}`;
      }

      const isActive = isObj && typeof d.active === "boolean" ? d.active : (index === 0);
      return { time: timeStr, temp: val, origC: tempNum, index, active: isActive };
    });

    const temps = pointsData.map(p => p.temp);
    const minTemp = Math.floor(Math.min(...temps) - 1);
    const maxTemp = Math.ceil(Math.max(...temps) + 1);
    const tempRange = Math.max(1, maxTemp - minTemp);

    // Coordinate mapping (avoiding divide-by-zero if single point)
    const denominator = Math.max(1, pointsData.length - 1);
    const coords = pointsData.map((p, i) => {
      const x = paddingLeft + (i / denominator) * plotWidth;
      const y = paddingTop + plotHeight - ((p.temp - minTemp) / tempRange) * plotHeight;
      return { ...p, x, y };
    });

    // Generate smooth Bézier spline path
    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const current = coords[i];
      const next = coords[i + 1];
      const cx1 = current.x + (next.x - current.x) * 0.45;
      const cy1 = current.y;
      const cx2 = current.x + (next.x - current.x) * 0.55;
      const cy2 = next.y;
      pathD += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${next.x} ${next.y}`;
    }

    // Area Fill path
    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - paddingBottom} L ${coords[0].x} ${height - paddingBottom} Z`;

    // Horizontal Grid Lines & Y-axis labels
    const gridLines = [];
    const steps = 4;
    for (let s = 0; s <= steps; s++) {
      const gridTemp = Math.round(minTemp + (s / steps) * tempRange);
      const y = paddingTop + plotHeight - ((gridTemp - minTemp) / tempRange) * plotHeight;
      gridLines.push(`
        <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="rgba(255, 255, 255, 0.08)" stroke-dasharray="4 4" />
        <text x="${paddingLeft - 10}" y="${y + 4}" fill="#64748b" font-size="11" text-anchor="end" font-family="inherit">${gridTemp}°</text>
      `);
    }

    // X-axis Time Labels
    const timeLabels = coords.map(c => `
      <text x="${c.x}" y="${height - 12}" fill="#94a3b8" font-size="11.5" font-weight="600" text-anchor="middle" font-family="inherit">${c.time}</text>
    `).join("");

    // Circular Dots
    const dotsHtml = coords.map(c => `
      <g class="chart-point-group" data-time="${c.time}" data-temp="${c.temp}°${state.currentUnit}" data-x="${c.x}" data-y="${c.y}" style="cursor: pointer;">
        <circle cx="${c.x}" cy="${c.y}" r="${c.active ? 6 : 4.5}" fill="${c.active ? '#38bdf8' : '#0284c7'}" stroke="#ffffff" stroke-width="2.5" filter="drop-shadow(0 0 6px rgba(56, 189, 248, 0.7))" />
        ${c.active ? `<circle cx="${c.x}" cy="${c.y}" r="11" fill="none" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1.5" />` : ''}
      </g>
    `).join("");

    elements.chartSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    elements.chartSvg.innerHTML = `
      <defs>
        <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.32" />
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0.0" />
        </linearGradient>
        <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#60a5fa" />
        </linearGradient>
      </defs>
      
      <!-- Grid -->
      ${gridLines.join("")}

      <!-- Shaded Area -->
      <path d="${areaD}" fill="url(#chartAreaGrad)" />

      <!-- Curve Line -->
      <path d="${pathD}" fill="none" stroke="url(#chartLineGrad)" stroke-width="3.5" stroke-linecap="round" filter="drop-shadow(0 4px 10px rgba(56, 189, 248, 0.5))" />

      <!-- Points -->
      ${dotsHtml}

      <!-- X-Axis Labels -->
      ${timeLabels}
    `;

    // Position default active tooltip at active point or first point
    const activePoint = coords.find(c => c.active) || coords[0];
    if (activePoint && elements.chartTooltipBubble) {
      positionTooltip(activePoint.x, activePoint.y, `${activePoint.temp}°${state.currentUnit}`, activePoint.time);
    }

    // Attach interactive hover listener to all chart points
    const pointGroups = elements.chartSvg.querySelectorAll(".chart-point-group");
    pointGroups.forEach(pt => {
      pt.addEventListener("mouseenter", (e) => {
        const x = parseFloat(pt.dataset.x);
        const y = parseFloat(pt.dataset.y);
        const temp = pt.dataset.temp;
        const time = pt.dataset.time;
        positionTooltip(x, y, temp, time);
      });
    });
  }

  function positionTooltip(x, y, tempStr, timeStr) {
    if (!elements.chartTooltipBubble) return;
    const svgRect = elements.chartSvg.getBoundingClientRect();
    const scaleX = svgRect.width / 800;
    const scaleY = svgRect.height / 220;

    elements.chartTooltipBubble.style.left = `${x * scaleX}px`;
    elements.chartTooltipBubble.style.top = `${y * scaleY}px`;
    elements.chartTooltipBubble.style.opacity = "1";

    if (elements.chartTooltipVal) elements.chartTooltipVal.textContent = tempStr;
    if (elements.chartTooltipTime) elements.chartTooltipTime.textContent = timeStr;
  }

  // --- Render Precipitation Probability Bar Chart ---
  function renderPrecipitationBars(precipData, hourlyFallback) {
    if (!elements.precipBarsContainer) return;

    let bars = (Array.isArray(precipData) && precipData.length > 0) ? precipData : null;

    // Connect to live hourly precipitation probability data if precipitationTrend is absent or empty
    if (!bars && Array.isArray(hourlyFallback) && hourlyFallback.length > 0) {
      bars = [];
      const step = Math.max(1, Math.floor(hourlyFallback.length / 8));
      for (let i = 0; i < hourlyFallback.length && bars.length < 8; i += step) {
        const item = hourlyFallback[i];
        let pVal = 0;
        if (typeof item.pop === "number") {
          pVal = item.pop;
        } else if (typeof item.pop === "string") {
          pVal = parseInt(item.pop.replace("%", ""), 10) || 0;
        }
        bars.push({
          time: item.time,
          pop: Math.min(100, Math.max(0, pVal))
        });
      }
    }

    if (!bars || bars.length === 0) {
      elements.precipBarsContainer.innerHTML = `
        <div style="color: #64748b; font-size: 13px; text-align: center; width: 100%; padding: 40px 0;">
          No precipitation forecast available
        </div>
      `;
      return;
    }

    elements.precipBarsContainer.innerHTML = `
      <div class="precip-y-axis">
        <span>100%</span>
        <span>75%</span>
        <span>50%</span>
        <span>25%</span>
        <span>0%</span>
      </div>
      ${bars.map((item, idx) => {
        const isObj = typeof item === "object" && item !== null;
        const rawPop = isObj ? item.pop : item;
        let popNum = 0;
        if (typeof rawPop === "number" && !isNaN(rawPop)) {
          popNum = Math.min(100, Math.max(0, Math.round(rawPop)));
        } else if (typeof rawPop === "string") {
          popNum = Math.min(100, Math.max(0, parseInt(rawPop.replace("%", ""), 10) || 0));
        }
        let timeLabel = isObj && item.time ? String(item.time) : "";
        if (!timeLabel && Array.isArray(hourlyFallback) && hourlyFallback[idx]) {
          timeLabel = String(hourlyFallback[idx].time || "");
        }
        if (!timeLabel) {
          const hr = (new Date().getHours() + (idx * 3)) % 24;
          const ampm = hr >= 12 ? "PM" : "AM";
          const hr12 = hr % 12 === 0 ? 12 : hr % 12;
          timeLabel = `${hr12} ${ampm}`;
        }
        return `
          <div class="precip-bar-col" title="${timeLabel}: ${popNum}% precipitation probability">
            <span class="precip-bar-val">${popNum}%</span>
            <div class="precip-bar-track">
              <div class="precip-bar-fill" style="height: ${popNum}%;"></div>
            </div>
            <span class="precip-bar-label">${timeLabel}</span>
          </div>
        `;
      }).join("")}
    `;
  }

  // --- Sub-Navigation Tabs Switching ---
  elements.subnavPills.forEach(pill => {
    pill.addEventListener("click", () => {
      elements.subnavPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      state.activeTab = pill.dataset.tab;

      // Smooth scroll to relevant section if applicable
      if (state.activeTab === "hourly" && elements.hourlyTrack) {
        elements.hourlyTrack.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (state.activeTab === "daily" && elements.sevenDayDetailedList) {
        elements.sevenDayDetailedList.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });

  // --- Temperature Unit Toggle (°C / °F) ---
  elements.unitButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const unit = btn.dataset.unit;
      if (unit === state.currentUnit) return;

      elements.unitButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.currentUnit = unit;
      localStorage.setItem("skycast_temp_unit", unit);

      // Re-render Forecast screen with converted values
      renderForecastScreen(state.currentLocationId);
    });
  });

  // Set initial active unit toggle
  elements.unitButtons.forEach(b => {
    b.classList.toggle("active", b.dataset.unit === state.currentUnit);
  });

  // --- Location Selection and Live Data Fetch ---
  let activeFetchTarget = null;

  function setLocationAndFetch(locationId) {
    if (!locationId) return;
    state.currentLocationId = locationId;
    localStorage.setItem("skycast_selected_city", locationId);

    // 1. Immediate synchronous render from cached or mock data
    renderForecastScreen(locationId);

    // 2. Asynchronous live fetch to enhance screen with real Open-Meteo metrics
    activeFetchTarget = locationId;
    WeatherService.fetchLiveCityWeather(locationId).then(liveData => {
      if (liveData && activeFetchTarget === locationId) {
        renderForecastScreen(locationId);
      }
    }).catch(err => {
      console.warn("Live weather fetch failed for", locationId, err);
    });
  }

  // --- My Locations Quick Switcher ---
  elements.locationButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const locationId = btn.dataset.location;
      setLocationAndFetch(locationId);

      if (elements.sidebar.classList.contains("mobile-open")) {
        closeMobileSidebar();
      }
    });
  });

  // --- Next 24 Hours Smooth Scroll ---
  if (elements.next24HoursLink && elements.hourlyTrack) {
    elements.next24HoursLink.addEventListener("click", (e) => {
      e.preventDefault();
      elements.hourlyTrack.scrollBy({ left: 240, behavior: "smooth" });
    });
  }

  // --- Notification Popover Toggle ---
  if (elements.bellBtn) {
    elements.bellBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      state.isNotificationsOpen = !state.isNotificationsOpen;
      elements.notificationsDropdown.classList.toggle("active", state.isNotificationsOpen);
    });
  }

  if (elements.markAllReadBtn) {
    elements.markAllReadBtn.addEventListener("click", () => {
      if (elements.bellBadge) elements.bellBadge.style.display = "none";
      const notifItems = document.querySelectorAll(".notification-item");
      notifItems.forEach(item => { item.style.opacity = "0.65"; });
    });
  }

  document.addEventListener("click", (e) => {
    if (state.isNotificationsOpen && !elements.notificationsDropdown.contains(e.target) && !elements.bellBtn.contains(e.target)) {
      state.isNotificationsOpen = false;
      elements.notificationsDropdown.classList.remove("active");
    }
  });

  // --- Search Autocomplete via WeatherService ---
  const searchableCities = WeatherService.searchableCities;

  if (elements.searchInput) {
    elements.searchInput.addEventListener("focus", () => {
      showSearchSuggestions(elements.searchInput.value);
    });

    elements.searchInput.addEventListener("input", (e) => {
      showSearchSuggestions(e.target.value);
    });
  }

  function showSearchSuggestions(query) {
    const matches = WeatherService.searchCities(query);

    if (matches.length > 0 && elements.searchResults) {
      elements.searchResults.innerHTML = matches.map(m => `
        <div class="search-result-item" data-key="${m.key}">
          <span>${m.city}, ${m.region}</span>
          <span style="font-size: 11px; color: #94a3b8;">Select</span>
        </div>
      `).join("");
      elements.searchResults.classList.add("visible");
    } else if (elements.searchResults) {
      elements.searchResults.classList.remove("visible");
    }
  }

  if (elements.searchResults) {
    elements.searchResults.addEventListener("click", (e) => {
      const item = e.target.closest(".search-result-item");
      if (item) {
        const key = item.dataset.key;
        elements.searchInput.value = item.querySelector("span").textContent;
        elements.searchResults.classList.remove("visible");
        setLocationAndFetch(key);
      }
    });
  }

  document.addEventListener("click", (e) => {
    if (elements.searchInput && !elements.searchInput.contains(e.target) && !elements.searchResults.contains(e.target)) {
      elements.searchResults.classList.remove("visible");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== elements.searchInput) {
      e.preventDefault();
      if (elements.searchInput) elements.searchInput.focus();
    }
  });

  // --- Mobile Navigation Drawer Handlers ---
  function openMobileSidebar() {
    elements.sidebar.classList.add("mobile-open");
    elements.sidebarBackdrop.classList.add("visible");
  }

  function closeMobileSidebar() {
    elements.sidebar.classList.remove("mobile-open");
    elements.sidebarBackdrop.classList.remove("visible");
  }

  if (elements.mobileMenuBtn) elements.mobileMenuBtn.addEventListener("click", openMobileSidebar);
  if (elements.sidebarCloseBtn) elements.sidebarCloseBtn.addEventListener("click", closeMobileSidebar);
  if (elements.sidebarBackdrop) elements.sidebarBackdrop.addEventListener("click", closeMobileSidebar);

  // Initial Render (Synchronous initial paint for instant load) + Live Weather Fetch
  setLocationAndFetch(state.currentLocationId);

  // Listen for live weather updates across the app
  window.addEventListener("skycast:weatherUpdated", (e) => {
    if (e.detail && (e.detail.cityId === state.currentLocationId || (e.detail.data && e.detail.data.id === state.currentLocationId))) {
      renderForecastScreen(state.currentLocationId);
    }
  });
});
