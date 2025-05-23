let chartTotal;
let fullData = [];
let lastDataHash = null;
let debounceTimeout = null;
let overviewInterval = null;

const FETCH_INTERVAL = 5 * 60 * 1;
const DEBOUNCE_DELAY = 5 * 60 * 1;

document.addEventListener("DOMContentLoaded", () => {
    debounceFetchAndDrawOverviewChart();
    if (!document.hidden) startOverviewInterval();
});
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        stopOverviewInterval();
    } else {
        startOverviewInterval();
        debounceFetchAndDrawOverviewChart();
    }
});
function startOverviewInterval() {
    if (!overviewInterval) {
        overviewInterval = setInterval(() => {
            debounceFetchAndDrawOverviewChart();
        }, FETCH_INTERVAL);
    }
}

function stopOverviewInterval() {
    if (overviewInterval) {
        clearInterval(overviewInterval);
        overviewInterval = null;
    }
}

function debounceFetchAndDrawOverviewChart() {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(fetchAndDrawOverviewChart, DEBOUNCE_DELAY);
}

function simpleHash(data) {
    // Sort by data_id to keep consistency
    const sortedData = [...data].sort((a, b) => a.data_id - b.data_id);
    const json = JSON.stringify(sortedData);
    let hash = 0;
    for (let i = 0; i < json.length; i++) {
        const chr = json.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
}

async function fetchAndDrawOverviewChart() {
    try {
        const response = await fetch("/data");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();

        const currentHash = simpleHash(data);
        if (currentHash === lastDataHash) return; // no changes skip
        lastDataHash = currentHash;

        fullData = data;
        renderOverviewChart(fullData);
    } catch (error) {
        console.error("Error fetching data for overview chart:", error);
    }
}

function renderOverviewChart(data) {
    const { seriesData, sortedDates } = buildCumulativeSeriesPerTeam(data);
    const uniqueColors = generateDistinctColors(seriesData.length);

    seriesData.forEach((series, idx) => {
        series.color = uniqueColors[idx];
    });

    const options = buildChartOptions(seriesData, sortedDates);
    const container = document.querySelector("#ChartTotal");

    if (container) {
        if (chartTotal) chartTotal.destroy();
        chartTotal = new ApexCharts(container, options);
        chartTotal.render();
    }
}

function buildCumulativeSeriesPerTeam(data) {
    const teamDataMap = {};
    const uniqueDates = new Set();

    data.forEach(({ team, organisation, date, points }) => {
        const key = `${team} (${organisation})`;
        const pts = parseInt(points, 10) || 0;

        if (!teamDataMap[key]) teamDataMap[key] = {};
        if (!teamDataMap[key][date]) teamDataMap[key][date] = 0;
        teamDataMap[key][date] += pts;

        uniqueDates.add(date);
    });

    const sortedDates = Array.from(uniqueDates).sort((a, b) => new Date(a) - new Date(b));

    const seriesData = Object.entries(teamDataMap).map(([teamKey, datePoints]) => {
        let cumulative = 0;
        const series = sortedDates.map(date => {
            cumulative += (datePoints[date] || 0);
            return cumulative;
        });
        return {
            name: teamKey,
            data: series
        };
    });

    return { seriesData, sortedDates };
}

function generateDistinctColors(count) {
    const goldenAngle = 137.508;
    const colors = [];

    for (let i = 0; i < count; i++) {
        const hue = (i * goldenAngle) % 360;
        colors.push(`hsl(${hue}, 70%, 50%)`);
    }

    return colors;
}

function buildChartOptions(seriesData, sortedDates) {
    return {
        chart: {
            height: 560,
            type: "area",
            background: 'transparent',
            zoom: {
                enabled: true,
                type: 'x',
                autoScaleYaxis: true
            },
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true
                },
                autoSelected: 'zoom'
            }
        },
        theme: {
            mode: 'dark'
        },
        dataLabels: { enabled: false },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 0.2,
                opacityFrom: 0.1,
                opacityTo: 0,
                stops: [0, 90, 100]
            }
        },
        xaxis: {
            type: 'datetime',
            categories: sortedDates
        },
        yaxis: {
            title: { text: 'Cumulative Points' }
        },
        tooltip: {
            shared: true,
            x: { format: "yyyy-MM-dd HH:mm" }
        },
        legend: {
            show: true,
            position: 'top'
        },
        series: seriesData
    };
}
