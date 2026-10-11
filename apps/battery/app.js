/* Battery Detector — web-lab. Original code, MIT License. */
(() => {
    const $ = (id) => document.getElementById(id);

    function duration(seconds) {
        if (!Number.isFinite(seconds) || seconds <= 0) return "—";
        const h = Math.floor(seconds / 3600);
        const m = Math.round((seconds % 3600) / 60);
        return h ? `${h} h ${m} min` : `${m} min`;
    }

    function render(battery) {
        const pct = Math.round(battery.level * 100);
        const fill = $("fill");
        fill.style.width = `${pct}%`;
        fill.classList.toggle("mid", pct <= 50 && pct > 20);
        fill.classList.toggle("low", pct <= 20);
        $("battery").classList.toggle("charging", battery.charging);
        $("level").textContent = `${pct}%`;

        let state;
        if (battery.charging && pct >= 100) state = "Fully charged";
        else if (battery.charging) state = "Charging";
        else if (pct <= 20) state = "Low battery — plug in soon";
        else state = "On battery";
        $("state").textContent = state;
        $("m-status").textContent = battery.charging ? "Plugged in" : "Discharging";
        $("m-full").textContent = battery.charging ? duration(battery.chargingTime) : "—";
        $("m-left").textContent = battery.charging ? "—" : duration(battery.dischargingTime);
        $("m-updated").textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        document.title = `${pct}% · Battery Detector`;
    }

    function unsupported(message) {
        $("level").textContent = "N/A";
        $("state").textContent = message;
        $("support-note").classList.add("error");
    }

    if (!("getBattery" in navigator)) {
        unsupported("This browser does not share battery information.");
        return;
    }

    navigator
        .getBattery()
        .then((battery) => {
            render(battery);
            ["levelchange", "chargingchange", "chargingtimechange", "dischargingtimechange"].forEach((ev) =>
                battery.addEventListener(ev, () => render(battery)),
            );
        })
        .catch(() => unsupported("Battery information is blocked in this context."));
})();
