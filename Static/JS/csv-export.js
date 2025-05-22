document.addEventListener("DOMContentLoaded", function () {
    const exportDataButton = document.getElementById("export-data-button");

    exportDataButton.addEventListener("click", function () {
        fetch("/data")
            .then((response) => response.json())
            .then((data) => {
                // === Sheet 1: Scores per Stand ===
                const standSheetData = [
                    ["Stand", "Organisation", "Team", "Points", "Date"],
                    ...data.map(item => [
                        item.stand,
                        item.organisation,
                        item.team,
                        item.points,
                        item.date,
                    ]),
                ];

                // === Sheet 2: Total Points per Team ===
                const teamScores = {};
                data.forEach(item => {
                    if (!teamScores[item.team]) {
                        teamScores[item.team] = {
                            team: item.team,
                            organisation: item.organisation,
                            points: 0,
                        };
                    }
                    teamScores[item.team].points += item.points;
                });

                const totalScoresSheetData = [
                    ["Team", "Organisation", "Total Points"],
                    ...Object.values(teamScores).map(team => [
                        team.team,
                        team.organisation,
                        team.points,
                    ]),
                ];

                // === Sheet 3: Awards (Top Team) ===
                let topTeam = null;
                let maxPoints = -1;
                Object.entries(teamScores).forEach(([team, data]) => {
                    if (data.points > maxPoints) {
                        maxPoints = data.points;
                        topTeam = team;
                    }
                });

                const awardsSheetData = [
                    ["Award", "Winner", "Points"],
                    ["Top Team", topTeam, maxPoints],
                ];

                // === Create Workbook and Append Sheets ===
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(standSheetData), "Scores per Stand");
                XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(totalScoresSheetData), "Total Scores");
                XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(awardsSheetData), "Awards");

                // === File Name Generation ===
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, "0");
                const day = String(now.getDate()).padStart(2, "0");
                const hour = String(now.getHours()).padStart(2, "0");
                const minute = String(now.getMinutes()).padStart(2, "0");
                const second = String(now.getSeconds()).padStart(2, "0");
                const filename = `${year}${month}${day}-${hour}${minute}${second}_Scoreboard.xlsx`;

                // this is the time format used in the filename
                XLSX.writeFile(wb, filename);
            })
    });
});
