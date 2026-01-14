document.addEventListener('DOMContentLoaded', function () {
  const tabElements = document.querySelectorAll('.tabs');
  const instances = M.Tabs.init(tabElements, { swipeable: true });

  requestAnimationFrame(() => {
    tabElements.forEach((tabEl, index) => {
      const tabs = tabEl.querySelectorAll('.tab');
      const visibleTabLink = Array.from(tabs)
        .find(tab => {
          return (
            !tab.classList.contains('desktop-only') ||
            getComputedStyle(tab).display !== 'none'
          );
        })?.querySelector('a');

      const activeTab = tabEl.querySelector('.tab a.active');

      if (
        activeTab &&
        activeTab.parentElement.classList.contains('desktop-only') &&
        getComputedStyle(activeTab.parentElement).display === 'none'
      ) {
        if (visibleTabLink) {
          const tabId = visibleTabLink.getAttribute('href').substring(1);
          instances[index].select(tabId);
        }
      }
    });
  });
});
