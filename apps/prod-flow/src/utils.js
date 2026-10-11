/**
 * ProdFlow — Utility helpers
 */
const Utils = (() => {
    function formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    function formatNumber(n, decimals = 0) {
        return Number(n).toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    }

    function formatCurrency(n) {
        return "$" + formatNumber(n, 2);
    }

    function percentChange(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function generateId(prefix = "ID") {
        return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    }

    function debounce(fn, ms = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), ms);
        };
    }

    function daysBetween(a, b) {
        const msPerDay = 86400000;
        return Math.round((new Date(b) - new Date(a)) / msPerDay);
    }

    function statusLabel(status) {
        const map = {
            pending: "Pending",
            in_production: "In Production",
            completed: "Completed",
            shipped: "Shipped",
            cancelled: "Cancelled",
        };
        return map[status] || status;
    }

    function statusClass(status) {
        const map = {
            pending: "status-pending",
            in_production: "status-progress",
            completed: "status-completed",
            shipped: "status-shipped",
            cancelled: "status-cancelled",
        };
        return map[status] || "";
    }

    function priorityClass(priority) {
        const map = {
            high: "priority-high",
            medium: "priority-medium",
            low: "priority-low",
        };
        return map[priority] || "";
    }

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    return {
        formatDate,
        formatNumber,
        formatCurrency,
        percentChange,
        clamp,
        generateId,
        debounce,
        daysBetween,
        statusLabel,
        statusClass,
        priorityClass,
        escapeHtml,
    };
})();
