let chartTotal;
let fullData = [];

document.addEventListener("DOMContentLoaded", fetchAndDrawOverviewChart);

async function fetchAndDrawOverviewChart() {
    try {
        const response = await fetch("/data");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        fullData = await response.json();

        renderOverviewChart(fullData);
    } catch (error) {
        console.error("Error fetching data for overview chart:", error);
    }
}

// Main chart render logic
function renderOverviewChart(data) {
    const { seriesData, sortedDates } = buildCumulativeSeriesPerTeam(data);
    const uniqueColors = generateDistinctColors(seriesData.length);

    // Assign unique color to each team line
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

// Build cumulative points per team
function buildCumulativeSeriesPerTeam(data) {
    const teamDataMap = {};
    const uniqueDates = new Set();

    // Group and sum by team/date
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

// Generate distinct HSL-based colors
function generateDistinctColors(count) {
    const goldenAngle = 137.508;
    const colors = [];

    for (let i = 0; i < count; i++) {
        const hue = (i * goldenAngle) % 360;
        colors.push(`hsl(${hue}, 70%, 50%)`);
    }

    return colors;
}

// Chart configuration with full interaction tools
function buildChartOptions(seriesData, sortedDates) {
    return {
        chart: {
            height: 560,
            type: "area",
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
        theme: { mode: 'dark' },
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
