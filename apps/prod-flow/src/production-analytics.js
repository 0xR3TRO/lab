/**
 * ProdFlow — Production Analytics
 * Efficiency KPIs, trend analysis, and analytics rendering.
 */
const ProductionAnalytics = (() => {
    let records = [];

    function load(data) {
        records = data.map((r) => ({ ...r }));
    }

    function getAll() {
        return records;
    }

    function kpis() {
        if (!records.length)
            return {
                avgEfficiency: 0,
                avgDefect: 0,
                totalOutput: 0,
                totalOrders: 0,
                avgDowntime: 0,
                avgWaste: 0,
            };

        const n = records.length;
        const sum = (key) => records.reduce((s, r) => s + r[key], 0);

        const avgEfficiency = +(sum("efficiency") / n).toFixed(1);
        const avgDefect = +(sum("defectRate") / n).toFixed(2);
        const totalOutput = sum("totalOutput");
        const totalOrders = sum("ordersCompleted");
        const avgDowntime = +(sum("downtime") / n).toFixed(1);
        const avgWaste = +(sum("materialWaste") / n).toFixed(1);
        const totalEnergy = sum("energyConsumption");
        const totalLabor = sum("laborHours");

        // week-over-week comparison (last vs previous)
        let efficiencyTrend = 0;
        if (n >= 2) {
            efficiencyTrend = Utils.percentChange(
                records[n - 1].efficiency,
                records[n - 2].efficiency,
            );
        }

        return {
            avgEfficiency,
            avgDefect,
            totalOutput,
            totalOrders,
            avgDowntime,
            avgWaste,
            totalEnergy,
            totalLabor,
            efficiencyTrend,
        };
    }

    function renderKPICards(container) {
        const k = kpis();
        const trendIcon =
            k.efficiencyTrend > 0
                ? "trending-up"
                : k.efficiencyTrend < 0
                  ? "trending-down"
                  : "trending-flat";
        const trendClass =
            k.efficiencyTrend > 0
                ? "trend-up"
                : k.efficiencyTrend < 0
                  ? "trend-down"
                  : "trend-flat";

        container.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-value">${k.avgEfficiency}%</div>
          <div class="kpi-label">Avg Efficiency</div>
          <div class="kpi-trend ${trendClass}">${k.efficiencyTrend > 0 ? "+" : ""}${k.efficiencyTrend.toFixed(1)}%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${Utils.formatNumber(k.totalOutput)}</div>
          <div class="kpi-label">Total Output</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${k.avgDefect}%</div>
          <div class="kpi-label">Avg Defect Rate</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${k.avgDowntime}h</div>
          <div class="kpi-label">Avg Downtime</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${k.avgWaste}%</div>
          <div class="kpi-label">Material Waste</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${Utils.formatNumber(k.totalOrders)}</div>
          <div class="kpi-label">Orders Completed</div>
        </div>
      </div>`;
    }

    function renderEfficiencyChart(container) {
        const labels = records.map((r) => {
            const d = new Date(r.date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
        });

        Forecasting.renderChart(container, labels, [
            { label: "Efficiency %", values: records.map((r) => r.efficiency) },
            {
                label: "Defect Rate % (x10)",
                values: records.map((r) => r.defectRate * 10),
            },
        ]);
    }

    function renderOutputChart(container) {
        const labels = records.map((r) => {
            const d = new Date(r.date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
        });

        Forecasting.renderChart(container, labels, [
            {
                label: "Actual Output",
                values: records.map((r) => r.totalOutput),
            },
            {
                label: "Target Output",
                values: records.map((r) => r.targetOutput),
            },
        ]);
    }

    function renderTable(container) {
        if (!records.length) {
            container.innerHTML =
                '<p class="empty-state">No production data available.</p>';
            return;
        }

        const rows = records
            .map(
                (r) => `
      <tr>
        <td>${Utils.formatDate(r.date)}</td>
        <td>${Utils.formatNumber(r.totalOutput)}</td>
        <td>${Utils.formatNumber(r.targetOutput)}</td>
        <td class="${r.efficiency >= 100 ? "text-success" : r.efficiency < 90 ? "text-danger" : ""}">${r.efficiency}%</td>
        <td>${r.defectRate}%</td>
        <td>${r.downtime}h</td>
        <td>${r.materialWaste}%</td>
        <td>${Utils.formatNumber(r.ordersCompleted)}</td>
      </tr>`,
            )
            .join("");

        container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Week</th><th>Output</th><th>Target</th><th>Efficiency</th>
            <th>Defects</th><th>Downtime</th><th>Waste</th><th>Orders</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
    }

    return {
        load,
        getAll,
        kpis,
        renderKPICards,
        renderEfficiencyChart,
        renderOutputChart,
        renderTable,
    };
})();
