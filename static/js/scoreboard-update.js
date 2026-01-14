document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("scoreboard-toggle");
  const button = document.getElementById("update-scoreboard-btn");

  if (!toggle || !button) return;

  fetch("/toggle_scoreboard")
    .then(res => res.json())
    .then(data => {
      toggle.checked = data?.scoreboard_open === 1;
    });

  // When clicking the update button
  button.addEventListener("click", () => {
    const isOpen = toggle.checked;

    fetch("/toggle_scoreboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_open: isOpen ? 1 : 0 })
    })
    .then(res => res.json())
    .then(data => {
      M.toast({ html: `Scoreboard ${isOpen ? "opened" : "closed"}`, displayLength: 2000 });
    })
    .catch(err => {
      console.error("Failed to update scoreboard state", err);
      M.toast({ html: "Update failed", classes: "red darken-2" });
    });
  });
});
