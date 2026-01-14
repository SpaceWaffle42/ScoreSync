document.addEventListener("DOMContentLoaded", function () {
    initializeTabs();
});

function initializeTabs() {
    const tabs = document.querySelectorAll(".tabs a");
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            const tabId = this.getAttribute("href");
            if (tabId === "#Table") {
                fetchDataTable();
            }
        });
    });
}

async function fetchDataTable() {
    try {
        const response = await fetch("/data");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        aggregateAndPopulateDataTable(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function aggregateAndPopulateDataTable(data) {
    const table = $('#data-table').DataTable();
    table.clear(); // Clear existing rows

    const teamPointsMap = {};

    data.forEach(item => {
        const teamName = item.team;
        const orgName = item.organisation || "Unknown";
        const points = parseInt(item.points, 10) || 0;

        if (!teamPointsMap[teamName]) {
            teamPointsMap[teamName] = {
                total_points: 0,
                team: teamName,
                org: orgName
            };
        }

        teamPointsMap[teamName].total_points += points;
    });

    Object.values(teamPointsMap).forEach(teamData => {
        table.row.add([
            teamData.team,
            teamData.org,
            teamData.total_points
        ]);
    });

    table.draw();
}
