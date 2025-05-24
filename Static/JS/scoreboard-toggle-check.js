function checkScoreboardState() {
  fetch("/scoreboard_state")
    .then(res => res.json())
    .then(data => {
      const isOpen = data?.scoreboard_open;
      const chart = document.querySelector("#ChartTotal");
      const table = document.querySelector("#Table");
      const overlay = document.querySelector("#scoreboard-closed-overlay");

      if (!isOpen) {
        // chart.style.display = "none";
        table.style.display = "none";
        overlay.style.display = "inline-block";
        chart.style.opacity = 0
        table.style.opacity = 0
      } else {
        // chart.style.display = "";
        // table.style.display = "";
        overlay.style.display = "none";
        chart.style.opacity = 1
        table.style.opacity = 1

      }
    });
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    checkScoreboardState();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  checkScoreboardState();
  setInterval(checkScoreboardState, 5000);
});
