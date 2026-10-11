/**
 * ProdFlow — Order Manager
 * Handles order listing, filtering, status updates, and KPI aggregation.
 */
const OrderManager = (() => {
    let orders = [];

    function load(data) {
        orders = data.map((o) => ({ ...o }));
    }

    function getAll() {
        return orders;
    }

    function getById(id) {
        return orders.find((o) => o.id === id) || null;
    }

    function filter({ status, priority, search } = {}) {
        return orders.filter((o) => {
            if (status && o.status !== status) return false;
            if (priority && o.priority !== priority) return false;
            if (search) {
                const q = search.toLowerCase();
                const haystack =
                    `${o.id} ${o.customer} ${o.product}`.toLowerCase();
                if (!haystack.includes(q)) return false;
            }
            return true;
        });
    }

    function updateStatus(id, newStatus) {
        const order = getById(id);
        if (order) order.status = newStatus;
        return order;
    }

    function updateProgress(id, pct) {
        const order = getById(id);
        if (order) order.progress = Utils.clamp(pct, 0, 100);
        return order;
    }

    function kpis() {
        const total = orders.length;
        const pending = orders.filter((o) => o.status === "pending").length;
        const inProduction = orders.filter(
            (o) => o.status === "in_production",
        ).length;
        const completed = orders.filter(
            (o) => o.status === "completed" || o.status === "shipped",
        ).length;
        const highPriority = orders.filter((o) => o.priority === "high").length;

        const avgProgress = total
            ? Math.round(orders.reduce((s, o) => s + o.progress, 0) / total)
            : 0;

        return {
            total,
            pending,
            inProduction,
            completed,
            highPriority,
            avgProgress,
        };
    }

    function renderTable(list, container) {
        if (!list.length) {
            container.innerHTML = '<p class="empty-state">No orders found.</p>';
            return;
        }
        const rows = list
            .map(
                (o) => `
      <tr>
        <td class="cell-id">${Utils.escapeHtml(o.id)}</td>
        <td>${Utils.escapeHtml(o.customer)}</td>
        <td>${Utils.escapeHtml(o.product)}</td>
        <td>${Utils.formatNumber(o.quantity)} ${Utils.escapeHtml(o.unit)}</td>
        <td><span class="badge ${Utils.statusClass(o.status)}">${Utils.statusLabel(o.status)}</span></td>
        <td><span class="badge ${Utils.priorityClass(o.priority)}">${o.priority}</span></td>
        <td>
          <div class="progress-bar-wrap">
            <div class="progress-bar" style="width:${o.progress}%"></div>
            <span class="progress-label">${o.progress}%</span>
          </div>
        </td>
        <td>${Utils.formatDate(o.dueDate)}</td>
      </tr>
    `,
            )
            .join("");

        container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Order ID</th><th>Customer</th><th>Product</th><th>Qty</th>
            <th>Status</th><th>Priority</th><th>Progress</th><th>Due Date</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
    }

    return {
        load,
        getAll,
        getById,
        filter,
        updateStatus,
        updateProgress,
        kpis,
        renderTable,
    };
})();
