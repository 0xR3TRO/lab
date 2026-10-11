/**
 * ProdFlow — UI Controller
 * Manages navigation, view rendering, theme toggling, and dashboard composition.
 */
const UIController = (() => {
    const views = ["dashboard", "orders", "inventory", "forecast", "analytics"];
    let currentView = "dashboard";

    function init() {
        initTheme();
        bindNav();
        bindThemeToggle();
        bindSearch();
    }

    /* ── Theme ── */
    function initTheme() {
        const saved = localStorage.getItem("pf-theme") || "light";
        document.documentElement.setAttribute("data-theme", saved);
        updateThemeIcon(saved);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("pf-theme", next);
        updateThemeIcon(next);
    }

    function updateThemeIcon(theme) {
        const btn = document.getElementById("theme-toggle");
        if (btn)
            btn.setAttribute(
                "aria-label",
                theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode",
            );
        const icon = document.getElementById("theme-icon");
        if (icon) icon.textContent = theme === "dark" ? "\u2600" : "\u263E";
    }

    function bindThemeToggle() {
        const btn = document.getElementById("theme-toggle");
        if (btn) btn.addEventListener("click", toggleTheme);
    }

    /* ── Navigation ── */
    function bindNav() {
        document.querySelectorAll("[data-view]").forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                navigateTo(link.dataset.view);
            });
        });
    }

    function navigateTo(view) {
        if (!views.includes(view)) return;
        currentView = view;

        // update active nav
        document.querySelectorAll("[data-view]").forEach((el) => {
            el.classList.toggle("nav-active", el.dataset.view === view);
        });

        // hide all sections, show target
        views.forEach((v) => {
            const sec = document.getElementById(`view-${v}`);
            if (sec) sec.classList.toggle("view-hidden", v !== view);
        });

        // close mobile nav
        const sidebar = document.getElementById("sidebar");
        if (sidebar) sidebar.classList.remove("sidebar-open");

        renderView(view);
    }

    /* ── Search ── */
    function bindSearch() {
        const input = document.getElementById("global-search");
        if (!input) return;
        input.addEventListener(
            "input",
            Utils.debounce(() => {
                if (currentView === "orders") renderOrders(input.value);
            }, 250),
        );
    }

    /* ── View Rendering ── */
    async function renderView(view) {
        switch (view) {
            case "dashboard":
                return renderDashboard();
            case "orders":
                return renderOrders();
            case "inventory":
                return renderInventory();
            case "forecast":
                return renderForecast();
            case "analytics":
                return renderAnalytics();
        }
    }

    async function renderDashboard() {
        const oKpi = OrderManager.kpis();
        const iKpi = InventoryEngine.kpis();
        const pKpi = ProductionAnalytics.kpis();

        const el = document.getElementById("dashboard-kpis");
        if (el) {
            el.innerHTML = `
        <div class="kpi-card kpi-primary">
          <div class="kpi-icon"><img src="assets/orders.svg" alt=""></div>
          <div class="kpi-value">${oKpi.total}</div>
          <div class="kpi-label">Total Orders</div>
          <div class="kpi-sub">${oKpi.inProduction} in production</div>
        </div>
        <div class="kpi-card kpi-success">
          <div class="kpi-icon"><img src="assets/check.svg" alt=""></div>
          <div class="kpi-value">${oKpi.completed}</div>
          <div class="kpi-label">Completed</div>
          <div class="kpi-sub">${oKpi.avgProgress}% avg progress</div>
        </div>
        <div class="kpi-card kpi-warning">
          <div class="kpi-icon"><img src="assets/inventory.svg" alt=""></div>
          <div class="kpi-value">${iKpi.lowStockCount}</div>
          <div class="kpi-label">Low Stock Alerts</div>
          <div class="kpi-sub">${Utils.formatCurrency(iKpi.totalValue)} inventory value</div>
        </div>
        <div class="kpi-card kpi-info">
          <div class="kpi-icon"><img src="assets/analytics.svg" alt=""></div>
          <div class="kpi-value">${pKpi.avgEfficiency}%</div>
          <div class="kpi-label">Avg Efficiency</div>
          <div class="kpi-sub">${Utils.formatNumber(pKpi.totalOutput)} total output</div>
        </div>`;
        }

        // mini alerts
        const alertsEl = document.getElementById("dashboard-alerts");
        if (alertsEl) InventoryEngine.renderAlerts(alertsEl);

        // mini chart
        const chartEl = document.getElementById("dashboard-chart");
        if (chartEl) {
            const prod = ProductionAnalytics.getAll();
            const fc = Forecasting.buildProductionForecast(prod);
            Forecasting.renderChart(chartEl, fc.labels, fc.datasets);
        }

        // recent orders
        const recentEl = document.getElementById("dashboard-recent");
        if (recentEl) {
            const recent = OrderManager.getAll().slice(0, 5);
            OrderManager.renderTable(recent, recentEl);
        }
    }

    function renderOrders(search) {
        const searchVal =
            search || document.getElementById("global-search")?.value || "";
        const statusFilter =
            document.getElementById("order-status-filter")?.value || "";
        const priorityFilter =
            document.getElementById("order-priority-filter")?.value || "";

        const filtered = OrderManager.filter({
            status: statusFilter || undefined,
            priority: priorityFilter || undefined,
            search: searchVal || undefined,
        });

        const container = document.getElementById("orders-table");
        if (container) OrderManager.renderTable(filtered, container);

        // summary strip
        const kpi = OrderManager.kpis();
        const strip = document.getElementById("orders-summary");
        if (strip) {
            strip.innerHTML = `
        <span><strong>${kpi.total}</strong> total</span>
        <span class="status-pending"><strong>${kpi.pending}</strong> pending</span>
        <span class="status-progress"><strong>${kpi.inProduction}</strong> in production</span>
        <span class="status-completed"><strong>${kpi.completed}</strong> completed/shipped</span>
        <span class="priority-high"><strong>${kpi.highPriority}</strong> high priority</span>`;
        }
    }

    function renderInventory() {
        const catFilter =
            document.getElementById("inv-category-filter")?.value || "";
        let items;
        if (catFilter === "raw_material")
            items = InventoryEngine.getRawMaterials();
        else if (catFilter === "finished_product")
            items = InventoryEngine.getFinishedProducts();
        else items = InventoryEngine.getAll();

        const container = document.getElementById("inventory-table");
        if (container) InventoryEngine.renderTable(items, container);

        const alertsEl = document.getElementById("inventory-alerts");
        if (alertsEl) InventoryEngine.renderAlerts(alertsEl);

        const kpi = InventoryEngine.kpis();
        const strip = document.getElementById("inventory-summary");
        if (strip) {
            strip.innerHTML = `
        <span><strong>${kpi.totalItems}</strong> items</span>
        <span><strong>${kpi.rawCount}</strong> raw materials</span>
        <span><strong>${kpi.finishedCount}</strong> finished products</span>
        <span><strong>${Utils.formatCurrency(kpi.totalValue)}</strong> total value</span>`;
        }
    }

    function renderForecast() {
        const prod = ProductionAnalytics.getAll();
        const fc = Forecasting.buildProductionForecast(prod);

        const chartEl = document.getElementById("forecast-chart");
        if (chartEl) Forecasting.renderChart(chartEl, fc.labels, fc.datasets);

        const infoEl = document.getElementById("forecast-info");
        if (infoEl) {
            const trendLabel =
                fc.trend === "up"
                    ? "Upward"
                    : fc.trend === "down"
                      ? "Downward"
                      : "Stable";
            const trendClass =
                fc.trend === "up"
                    ? "trend-up"
                    : fc.trend === "down"
                      ? "trend-down"
                      : "trend-flat";
            infoEl.innerHTML = `
        <div class="forecast-meta">
          <div class="forecast-stat">
            <span class="forecast-stat-label">Trend</span>
            <span class="forecast-stat-value ${trendClass}">${trendLabel}</span>
          </div>
          <div class="forecast-stat">
            <span class="forecast-stat-label">Next Period Forecast</span>
            <span class="forecast-stat-value">${Utils.formatNumber(fc.nextPeriod)} units</span>
          </div>
          <div class="forecast-stat">
            <span class="forecast-stat-label">Model</span>
            <span class="forecast-stat-value">Linear Regression + 3-pt MA</span>
          </div>
        </div>`;
        }
    }

    function renderAnalytics() {
        const kpiEl = document.getElementById("analytics-kpis");
        if (kpiEl) ProductionAnalytics.renderKPICards(kpiEl);

        const effEl = document.getElementById("analytics-efficiency-chart");
        if (effEl) ProductionAnalytics.renderEfficiencyChart(effEl);

        const outEl = document.getElementById("analytics-output-chart");
        if (outEl) ProductionAnalytics.renderOutputChart(outEl);

        const tableEl = document.getElementById("analytics-table");
        if (tableEl) ProductionAnalytics.renderTable(tableEl);
    }

    /* ── Mobile sidebar ── */
    function toggleSidebar() {
        const sb = document.getElementById("sidebar");
        if (sb) sb.classList.toggle("sidebar-open");
    }

    return {
        init,
        navigateTo,
        renderView,
        toggleSidebar,
        renderOrders,
        renderInventory,
    };
})();
