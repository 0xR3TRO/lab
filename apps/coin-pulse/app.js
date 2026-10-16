/* CoinPulse — R3TRO Lab. Original code, MIT License. Price data: CoinGecko public API (attribution required). */
(() => {
    const COINS = [
        { id: "bitcoin", name: "Bitcoin", symbol: "BTC", tint: "#f2a900" },
        { id: "ethereum", name: "Ethereum", symbol: "ETH", tint: "#627eea" },
        { id: "tether", name: "Tether", symbol: "USDT", tint: "#26a17b" },
        { id: "solana", name: "Solana", symbol: "SOL", tint: "#9945ff" },
        { id: "cardano", name: "Cardano", symbol: "ADA", tint: "#2a71d0" },
        { id: "dogecoin", name: "Dogecoin", symbol: "DOGE", tint: "#c2a633" },
        { id: "litecoin", name: "Litecoin", symbol: "LTC", tint: "#345d9d" },
    ];
    const CURRENCIES = ["usd", "eur", "pln", "gbp"];
    const REFRESH_MS = 60000;
    const STORAGE_KEY = "coinpulse:currency";

    const list = document.getElementById("coins");
    const currencyEl = document.getElementById("currency");
    const updatedEl = document.getElementById("updated");
    const refreshBtn = document.getElementById("refresh");
    let data = null;
    let timer;

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (CURRENCIES.includes(saved)) currencyEl.value = saved;
    } catch {
        /* storage unavailable */
    }

    function priceFormat(value, currency) {
        const digits = value < 1 ? 4 : value < 100 ? 2 : 0;
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currency.toUpperCase(),
            maximumFractionDigits: digits,
            minimumFractionDigits: Math.min(2, digits),
        }).format(value);
    }

    function render() {
        if (!data) return;
        const cur = currencyEl.value;
        list.innerHTML = COINS.map((c) => {
            const row = data[c.id];
            if (!row || row[cur] === undefined) return "";
            const change = row[`${cur}_24h_change`] ?? 0;
            const dir = change >= 0 ? "up" : "down";
            return `
            <li class="coin">
                <span class="badge" style="--tint:${c.tint}" aria-hidden="true">${c.symbol.slice(0, 4)}</span>
                <span class="coin-name"><b>${c.name}</b><small>${c.symbol}</small></span>
                <span class="price">${priceFormat(row[cur], cur)}</span>
                <span class="change ${dir}" aria-label="24 hour change">${change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(2)}%</span>
            </li>`;
        }).join("");
        const ts = Math.max(...COINS.map((c) => data[c.id]?.last_updated_at || 0));
        updatedEl.textContent = ts ? `Updated ${new Date(ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "";
    }

    async function load() {
        refreshBtn.disabled = true;
        updatedEl.textContent = "Loading…";
        const url =
            "https://api.coingecko.com/api/v3/simple/price?" +
            new URLSearchParams({
                ids: COINS.map((c) => c.id).join(","),
                vs_currencies: CURRENCIES.join(","),
                include_24hr_change: "true",
                include_last_updated_at: "true",
            });
        try {
            const res = await fetch(url);
            if (res.status === 429) throw new Error("Too many requests — try again in a minute.");
            if (!res.ok) throw new Error(`The price service answered ${res.status}.`);
            data = await res.json();
            render();
        } catch (err) {
            updatedEl.textContent = err instanceof TypeError ? "Could not reach the price service." : err.message;
        } finally {
            refreshBtn.disabled = false;
            clearTimeout(timer);
            timer = setTimeout(load, REFRESH_MS);
        }
    }

    currencyEl.addEventListener("change", () => {
        try {
            localStorage.setItem(STORAGE_KEY, currencyEl.value);
        } catch {
            /* storage unavailable */
        }
        render();
    });
    refreshBtn.addEventListener("click", load);
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden && data) load();
    });

    load();
})();
