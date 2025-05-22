document.addEventListener("DOMContentLoaded", function () {
    fetchTeams();
});

async function fetchTeams() {
    try {
        const response = await fetch("/teams");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const teams = await response.json();
        populateTable(teams);
    } catch (error) {
        console.error("Error fetching teams:", error);
    }
}

function populateTable(teams) {
    const tableBody = document.getElementById("teams-table-body");
    tableBody.innerHTML = "";

    teams.forEach(teamObj => {
        const row = document.createElement("tr");

        const teamCell = document.createElement("td");
        teamCell.textContent = teamObj.team || "N/A";
        row.appendChild(teamCell);

        const orgCell = document.createElement("td");
        orgCell.textContent = teamObj.organisation || "N/A";
        row.appendChild(orgCell);

        tableBody.appendChild(row);
    });
}
