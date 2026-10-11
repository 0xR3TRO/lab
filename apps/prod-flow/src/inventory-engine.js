/**
 * ProdFlow — Inventory Engine
 * Stock level tracking, low-stock alerts, and inventory KPIs.
 */
const InventoryEngine = (() => {
    let items = [];

    function load(data) {
        items = data.map((i) => ({ ...i }));
    }

    function getAll() {
        return items;
    }

    function getById(id) {
        return items.find((i) => i.id === id) || null;
    }

    function getRawMaterials() {
        return items.filter((i) => i.category === "raw_material");
    }

    function getFinishedProducts() {
        return items.filter((i) => i.category === "finished_product");
    }

    function getLowStock() {
        return items.filter((i) => i.quantity <= i.minThreshold);
    }

    function stockLevel(item) {
        if (item.quantity <= item.minThreshold * 0.5) return "critical";
        if (item.quantity <= item.minThreshold) return "low";
        if (item.quantity <= item.minThreshold * 1.5) return "moderate";
        return "healthy";
    }

    function kpis() {
        const totalItems = items.length;
        const lowStockCount = getLowStock().length;
        const totalValue = items.reduce(
            (s, i) => s + i.quantity * i.unitCost,
            0,
        );
        const rawCount = getRawMaterials().length;
        const finishedCount = getFinishedProducts().length;
        return {
            totalItems,
            lowStockCount,
            totalValue,
            rawCount,
            finishedCount,
        };
    }

    function renderTable(list, container) {
        if (!list.length) {
            container.innerHTML =
                '<p class="empty-state">No inventory items found.</p>';
            return;
        }
        const rows = list
            .map((i) => {
                const level = stockLevel(i);
                return `
        <tr class="stock-${level}">
          <td class="cell-id">${Utils.escapeHtml(i.id)}</td>
          <td>${Utils.escapeHtml(i.name)}</td>
          <td>${i.category === "raw_material" ? "Raw Material" : "Finished Product"}</td>
          <td>${Utils.formatNumber(i.quantity)} ${Utils.escapeHtml(i.unit)}</td>
          <td>${Utils.formatNumber(i.minThreshold)} ${Utils.escapeHtml(i.unit)}</td>
          <td><span class="badge stock-badge-${level}">${level}</span></td>
          <td>${Utils.formatCurrency(i.unitCost)}</td>
          <td>${Utils.formatCurrency(i.quantity * i.unitCost)}</td>
        </tr>`;
            })
            .join("");

        container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Category</th><th>Qty</th>
            <th>Min Threshold</th><th>Status</th><th>Unit Cost</th><th>Total Value</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
    }

    function renderAlerts(container) {
        const low = getLowStock();
        if (!low.length) {
            container.innerHTML =
                '<p class="alert-ok">All stock levels are healthy.</p>';
            return;
        }
        const html = low
            .map((i) => {
                const level = stockLevel(i);
                return `
        <div class="alert-card alert-${level}">
          <div class="alert-icon">${level === "critical" ? "!!" : "!"}</div>
          <div class="alert-body">
            <strong>${Utils.escapeHtml(i.name)}</strong>
            <span>${Utils.formatNumber(i.quantity)} ${Utils.escapeHtml(i.unit)} remaining
              (min: ${Utils.formatNumber(i.minThreshold)})</span>
          </div>
        </div>`;
            })
            .join("");
        container.innerHTML = html;
    }

    return {
        load,
        getAll,
        getById,
        getRawMaterials,
        getFinishedProducts,
        getLowStock,
        stockLevel,
        kpis,
        renderTable,
        renderAlerts,
    };
})();
