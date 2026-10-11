/**
 * ProdFlow — Forecasting Module
 * Simple linear regression & moving-average forecasts for production output and inventory.
 */
const Forecasting = (() => {
    function movingAverage(values, windowSize = 3) {
        const result = [];
        for (let i = 0; i < values.length; i++) {
            const start = Math.max(0, i - windowSize + 1);
            const window = values.slice(start, i + 1);
            result.push(window.reduce((a, b) => a + b, 0) / window.length);
        }
        return result;
    }

    function linearRegression(values) {
        const n = values.length;
        if (n < 2) return { slope: 0, intercept: values[0] || 0 };
        let sumX = 0,
            sumY = 0,
            sumXY = 0,
            sumX2 = 0;
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += values[i];
            sumXY += i * values[i];
            sumX2 += i * i;
        }
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        return { slope, intercept };
    }

    function forecast(values, periods = 4) {
        const { slope, intercept } = linearRegression(values);
        const n = values.length;
        const predictions = [];
        for (let i = 0; i < periods; i++) {
            predictions.push(Math.round(slope * (n + i) + intercept));
        }
        return predictions;
    }

    function trendDirection(values) {
        if (values.length < 2) return "stable";
        const { slope } = linearRegression(values);
        if (slope > 10) return "up";
        if (slope < -10) return "down";
        return "stable";
    }

    function renderChart(container, labels, datasets) {
        const width = 700;
        const height = 300;
        const padding = { top: 30, right: 20, bottom: 50, left: 60 };
        const chartW = width - padding.left - padding.right;
        const chartH = height - padding.top - padding.bottom;

        const allValues = datasets.flatMap((ds) => ds.values);
        const maxVal = Math.max(...allValues) * 1.1 || 1;
        const minVal = Math.min(0, Math.min(...allValues));

        const stepX = chartW / Math.max(labels.length - 1, 1);

        function yPos(v) {
            return (
                padding.top +
                chartH -
                ((v - minVal) / (maxVal - minVal)) * chartH
            );
        }

        let svg = `<svg viewBox="0 0 ${width} ${height}" class="forecast-chart">`;

        // grid lines
        for (let i = 0; i <= 5; i++) {
            const val = minVal + ((maxVal - minVal) / 5) * i;
            const y = yPos(val);
            svg += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" class="grid-line"/>`;
            svg += `<text x="${padding.left - 8}" y="${y + 4}" class="axis-label" text-anchor="end">${Math.round(val)}</text>`;
        }

        // x-axis labels
        labels.forEach((lbl, idx) => {
            const x = padding.left + idx * stepX;
            svg += `<text x="${x}" y="${height - 8}" class="axis-label" text-anchor="middle">${lbl}</text>`;
        });

        // datasets
        const colors = [
            "var(--color-primary)",
            "var(--color-accent)",
            "var(--color-warning)",
        ];
        datasets.forEach((ds, di) => {
            const color = colors[di % colors.length];
            const points = ds.values.map(
                (v, i) => `${padding.left + i * stepX},${yPos(v)}`,
            );

            if (ds.dashed) {
                svg += `<polyline points="${points.join(" ")}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="6 4"/>`;
            } else {
                svg += `<polyline points="${points.join(" ")}" fill="none" stroke="${color}" stroke-width="2.5"/>`;
            }

            ds.values.forEach((v, i) => {
                const cx = padding.left + i * stepX;
                const cy = yPos(v);
                svg += `<circle cx="${cx}" cy="${cy}" r="4" fill="${color}"/>`;
                svg += `<title>${ds.label}: ${Utils.formatNumber(v)}</title>`;
            });

            // legend
            const ly = 14;
            const lx = padding.left + di * 180;
            svg += `<rect x="${lx}" y="${ly - 8}" width="12" height="12" rx="2" fill="${color}"/>`;
            svg += `<text x="${lx + 16}" y="${ly + 2}" class="legend-label">${ds.label}</text>`;
        });

        svg += `</svg>`;
        container.innerHTML = svg;
    }

    function buildProductionForecast(productionData) {
        const outputs = productionData.map((p) => p.totalOutput);
        const labels = productionData.map((p) => {
            const d = new Date(p.date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
        });

        const predicted = forecast(outputs, 4);
        const ma = movingAverage(outputs);

        // extend labels for forecast periods
        const lastDate = new Date(
            productionData[productionData.length - 1].date,
        );
        for (let i = 1; i <= 4; i++) {
            const d = new Date(lastDate);
            d.setDate(d.getDate() + 7 * i);
            labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
        }

        // pad actual data with nulls for forecast length
        const actualPadded = [...outputs, ...Array(4).fill(null)];
        const forecastLine = [
            ...Array(outputs.length).fill(null),
            ...predicted,
        ];
        const maPadded = [...ma, ...Array(4).fill(null)];

        return {
            labels,
            datasets: [
                {
                    label: "Actual Output",
                    values: actualPadded.map((v) => v ?? 0),
                },
                {
                    label: "Forecast",
                    values: forecastLine.map((v) => v ?? 0),
                    dashed: true,
                },
                { label: "Moving Avg", values: maPadded.map((v) => v ?? 0) },
            ],
            trend: trendDirection(outputs),
            nextPeriod: predicted[0] || 0,
        };
    }

    return {
        movingAverage,
        linearRegression,
        forecast,
        trendDirection,
        renderChart,
        buildProductionForecast,
    };
})();
