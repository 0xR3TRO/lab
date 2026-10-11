/**
 * ProdFlow — Entry Point
 * Bootstraps all modules from mock data and initializes the UI.
 */
(async function bootstrap() {
    try {
        const { orders, inventory, production } = await DataService.getAll();

        OrderManager.load(orders);
        InventoryEngine.load(inventory);
        ProductionAnalytics.load(production);

        UIController.init();
        UIController.navigateTo("dashboard");
    } catch (err) {
        console.error("[ProdFlow] Initialization failed:", err);
        document.querySelector(".page-content").innerHTML =
            '<div class="empty-state" style="margin-top:4rem">' +
            "<h2>Failed to load ProdFlow</h2>" +
            "<p>Make sure you are serving the app from a local server (e.g. <code>npx serve</code>), not opening the HTML file directly.</p>" +
            '<p style="color:var(--text-muted);margin-top:.5rem">' +
            err.message +
            "</p>" +
            "</div>";
    }
})();
