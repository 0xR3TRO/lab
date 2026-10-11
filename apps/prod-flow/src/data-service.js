/**
 * ProdFlow — Data Service
 * Fetches and caches mock JSON data; provides a single data access layer.
 */
const DataService = (() => {
    const cache = {};

    async function fetchJSON(path) {
        if (cache[path]) return cache[path];
        const res = await fetch(path);
        if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
        const data = await res.json();
        cache[path] = data;
        return data;
    }

    async function getOrders() {
        return fetchJSON("data/orders.json");
    }

    async function getInventory() {
        return fetchJSON("data/inventory.json");
    }

    async function getProduction() {
        return fetchJSON("data/production.json");
    }

    async function getAll() {
        const [orders, inventory, production] = await Promise.all([
            getOrders(),
            getInventory(),
            getProduction(),
        ]);
        return { orders, inventory, production };
    }

    function invalidate(path) {
        if (path) {
            delete cache[path];
        } else {
            Object.keys(cache).forEach((k) => delete cache[k]);
        }
    }

    return { getOrders, getInventory, getProduction, getAll, invalidate };
})();
