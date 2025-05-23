const teamColors = ['#FF4136', '#FF851B', '#2ECC40', '#0074D9', '#B10DC9'];

fetch("/data")
  .then(res => res.json())
  .then(data => {
    const teamPoints = {};
    const orgPoints = {};
    const teamOrgs = {};

// Initialize team points and org points
    data.forEach(entry => {
      const team = `Team ${entry.team}`;
      const org = entry.organisation;
      const points = parseInt(entry.points) || 0;

      teamPoints[team] = (teamPoints[team] || 0) + points;
      orgPoints[org] = (orgPoints[org] || 0) + points;
      teamOrgs[team] = org;
    });

    // Sort teams by points and get top 5
    const topTeams = Object.entries(teamPoints)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const grouped = {};
    const orgSet = new Set();

    topTeams.forEach(([team, points]) => {
      const org = teamOrgs[team];
      orgSet.add(org);
      if (!grouped[org]) grouped[org] = { teams: [], total: orgPoints[org] };
      grouped[org].teams.push({ team, points });
    });

    const categories = Array.from(orgSet);
    const series = [];
    let colorIndex = 0;

    // Add org series
    topTeams.forEach(([team, points]) => {
      const org = teamOrgs[team];
      const dataArray = categories.map(cat => (cat === org ? points : 0));
      series.push({
        name: team,
        data: dataArray,
        color: teamColors[colorIndex++ % teamColors.length]
      });
    });
// Add org total series
    series.push({
      name: "Org Total",
      data: categories.map(org => orgPoints[org] || 0),
      color: '#FFD700'
    });

    const options = {
      series: series,
      chart: {
        type: 'bar',
        background: 'transparent',
        height: 600,
        stacked: false
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 4,
          borderRadiusApplication: 'end'
        }
      },
      dataLabels: {
        enabled: false
      },
      theme: {
        mode: 'dark'
      },
      xaxis: {
        categories: categories
      },
      yaxis: {
        title: {
          text: 'Points'
        }
      },
      tooltip: {
        y: {
          formatter: val => val + ' pts'
        }
      },
      legend: {
        show: true
      }
    };

    const chart = new ApexCharts(document.querySelector("#BarGraph"), options);
    chart.render();
  })
  .catch(err => console.error("Chart data fetch failed:", err));
