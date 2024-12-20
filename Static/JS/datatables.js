function initializeDataTables() {

    if (!$.fn.DataTable.isDataTable('#data-table')) {
      $('#data-table').DataTable({
        "lengthChange": false

      });
    }
  }

  // detect table changes (more dynamic)
  function observeTableUpdates() {
    const config = { childList: true, subtree: true };
    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.addedNodes.length > 0) {
          initializeDataTables();
          observer.disconnect(); // Stop observing once initialized
        }
      }
    });
    observer.observe(document.getElementById('data-table'), config);
  }

  $(document).ready(function () {
    // Delay initialization for dynamically loaded tables
    setTimeout(initializeDataTables, 1000);

    observeTableUpdates();
  });