(function (global) {
  "use strict";

  function createRevealer({ getCurrentSection }) {
    let revealTimer = null;
    const hasRevealedOnce = Object.create(null);

    function stop() {
      if (revealTimer) {
        clearInterval(revealTimer);
        revealTimer = null;
      }
    }

    function showAll(sectionId) {
      const sectionEl = document.getElementById(sectionId);
      if (!sectionEl) return;
      const items = Array.from(sectionEl.querySelectorAll(".reveal-item"));
      items.forEach((el) => el.classList.add("revealed"));
    }

    function start(sectionId) {
      stop();

      const sectionEl = document.getElementById(sectionId);
      if (!sectionEl) return;

      const items = Array.from(sectionEl.querySelectorAll(".reveal-item"));
      items.forEach((el) => el.classList.remove("revealed"));

      items.sort((a, b) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const topDiff = ra.top - rb.top;
        if (Math.abs(topDiff) > 4) return topDiff;
        return ra.left - rb.left;
      });

      let idx = 0;
      const STEP_MS = 260;

      const step = () => {
        if (getCurrentSection() !== sectionId) {
          stop();
          return;
        }
        if (idx < items.length) {
          items[idx].classList.add("revealed");
          idx += 1;
          return;
        }
        stop();
      };

      step();
      revealTimer = setInterval(step, STEP_MS);
    }

    function onEnter(sectionId) {
      if (sectionId !== "projects" && sectionId !== "payment" && sectionId !== "contact") return;
      if (hasRevealedOnce[sectionId]) {
        showAll(sectionId);
        return;
      }
      hasRevealedOnce[sectionId] = true;
      start(sectionId);
    }

    return Object.freeze({ stop, start, showAll, onEnter });
  }

  global.SystemUI = global.SystemUI || {};
  global.SystemUI.createRevealer = createRevealer;
})(window);


