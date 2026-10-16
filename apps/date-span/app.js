/* DateSpan — R3TRO Lab. Original code, MIT License. */
(() => {
    const $ = (id) => document.getElementById(id);
    const DAY = 86400000;
    // timeZone UTC matches how dates are stored below (UTC midnights)
    const fmt = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
    const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" });
    const num = new Intl.NumberFormat("en-GB");

    // All dates are handled as UTC midnights so daylight-saving changes never shift a day.
    const parse = (value) => {
        if (!value) return null;
        const [y, m, d] = value.split("-").map(Number);
        return new Date(Date.UTC(y, m - 1, d));
    };
    const toInput = (date) => date.toISOString().slice(0, 10);
    const today = () => {
        const now = new Date();
        return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    };
    const daysIn = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const plural = (n, word) => `${num.format(n)} ${word}${Math.abs(n) === 1 ? "" : "s"}`;

    /** Calendar difference a → b (a <= b) as years, months, days. */
    function ymd(a, b) {
        let y = b.getUTCFullYear() - a.getUTCFullYear();
        let m = b.getUTCMonth() - a.getUTCMonth();
        let d = b.getUTCDate() - a.getUTCDate();
        if (d < 0) {
            m -= 1;
            const prevMonth = (b.getUTCMonth() + 11) % 12;
            const prevYear = b.getUTCMonth() === 0 ? b.getUTCFullYear() - 1 : b.getUTCFullYear();
            d += daysIn(prevYear, prevMonth);
        }
        if (m < 0) {
            y -= 1;
            m += 12;
        }
        return { y, m, d };
    }

    function addMonths(date, months) {
        const y = date.getUTCFullYear();
        const m = date.getUTCMonth() + months;
        const ty = y + Math.floor(m / 12);
        const tm = ((m % 12) + 12) % 12;
        const d = Math.min(date.getUTCDate(), daysIn(ty, tm));
        return new Date(Date.UTC(ty, tm, d));
    }

    function addWorkdays(date, n) {
        const step = n < 0 ? -1 : 1;
        let left = Math.abs(n);
        let cur = new Date(date);
        while (left > 0) {
            cur = new Date(cur.getTime() + step * DAY);
            const wd = cur.getUTCDay();
            if (wd !== 0 && wd !== 6) left--;
        }
        return cur;
    }

    function countWorkdays(a, b) {
        // weekdays in [a, b)
        const total = Math.round((b - a) / DAY);
        const fullWeeks = Math.floor(total / 7);
        let count = fullWeeks * 5;
        for (let i = fullWeeks * 7; i < total; i++) {
            const wd = new Date(a.getTime() + i * DAY).getUTCDay();
            if (wd !== 0 && wd !== 6) count++;
        }
        return count;
    }

    const metric = (label, value) => `<div class="metric"><small>${label}</small><b>${value}</b></div>`;

    function renderBetween() {
        let a = parse($("from").value);
        let b = parse($("to").value);
        if (!a || !b) return;
        const sign = b < a ? -1 : 1;
        if (sign < 0) [a, b] = [b, a];
        const end = $("include-end").checked ? new Date(b.getTime() + DAY) : b;
        const days = Math.round((end - a) / DAY);
        const { y, m, d } = ymd(a, end);
        const parts = [y && plural(y, "year"), m && plural(m, "month"), (d || (!y && !m)) && plural(d, "day")].filter(Boolean);
        $("between-headline").textContent = `${sign < 0 ? "−" : ""}${parts.join(", ")}`;
        $("between-metrics").innerHTML = [
            metric("Days", num.format(days)),
            metric("Weeks", `${num.format(Math.floor(days / 7))} + ${days % 7} d`),
            metric("Working days", num.format(countWorkdays(a, end))),
            metric("Hours", num.format(days * 24)),
            metric("Months (approx.)", (days / 30.436875).toFixed(1)),
        ].join("");
    }

    function renderAge() {
        const birth = parse($("birth").value);
        const on = parse($("age-on").value) || today();
        if (!birth) {
            $("age-headline").textContent = "Enter a date of birth.";
            $("age-metrics").innerHTML = "";
            return;
        }
        if (birth > on) {
            $("age-headline").textContent = "The date of birth is after the chosen day.";
            $("age-metrics").innerHTML = "";
            return;
        }
        const { y, m, d } = ymd(birth, on);
        const days = Math.round((on - birth) / DAY);
        let next = new Date(Date.UTC(on.getUTCFullYear(), birth.getUTCMonth(), Math.min(birth.getUTCDate(), daysIn(on.getUTCFullYear(), birth.getUTCMonth()))));
        if (next < on) next = addMonths(next, 12);
        const untilNext = Math.round((next - on) / DAY);
        $("age-headline").textContent = `${plural(y, "year")}, ${plural(m, "month")}, ${plural(d, "day")}`;
        $("age-metrics").innerHTML = [
            metric("Days lived", num.format(days)),
            metric("Weeks lived", num.format(Math.floor(days / 7))),
            metric("Born on a", weekday.format(birth)),
            metric("Next birthday", untilNext === 0 ? "Today! 🎉" : `in ${plural(untilNext, "day")}`),
        ].join("");
    }

    function renderAdd() {
        const base = parse($("base").value);
        const amount = Math.trunc(Number($("amount").value) || 0);
        if (!base) return;
        let result;
        switch ($("unit").value) {
            case "weeks":
                result = new Date(base.getTime() + amount * 7 * DAY);
                break;
            case "months":
                result = addMonths(base, amount);
                break;
            case "years":
                result = addMonths(base, amount * 12);
                break;
            case "workdays":
                result = addWorkdays(base, amount);
                break;
            default:
                result = new Date(base.getTime() + amount * DAY);
        }
        $("add-headline").textContent = fmt.format(result);
    }

    // defaults: today → New Year, age with empty birth date, today + 30 days
    const t = today();
    $("from").value = toInput(t);
    $("to").value = toInput(new Date(Date.UTC(t.getUTCFullYear() + 1, 0, 1)));
    $("age-on").value = toInput(t);
    $("base").value = toInput(t);

    ["from", "to", "include-end"].forEach((id) => $(id).addEventListener("input", renderBetween));
    ["birth", "age-on"].forEach((id) => $(id).addEventListener("input", renderAge));
    ["base", "amount", "unit"].forEach((id) => $(id).addEventListener("input", renderAdd));
    $("swap").addEventListener("click", () => {
        [$("from").value, $("to").value] = [$("to").value, $("from").value];
        renderBetween();
    });

    renderBetween();
    renderAge();
    renderAdd();
})();
