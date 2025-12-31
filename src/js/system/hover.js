(function (global) {
  "use strict";

  function createHoverController({
    bgLines,
    systemModeEl,
    modeForSection,
    getCurrentSection,
    projectNodes,
  }) {
    const HOVER_BG_OPACITY = 0.1;
    const DEFAULT_BG_OPACITY = 0.2;

    function setBgOpacity(value) {
      bgLines.forEach((line) => (line.opacity = value));
    }

    function resetDetailsHoverState() {
      setBgOpacity(DEFAULT_BG_OPACITY);
      projectNodes.forEach((n) => n.classList.remove("active"));
    }

    function resetCardsHoverState() {
      setBgOpacity(DEFAULT_BG_OPACITY);
    }

    function bindProjectHover() {
      projectNodes.forEach((node) => {
        const getProjectId = () => node.querySelector(".project-id")?.textContent?.trim();

        node.addEventListener("mouseenter", () => {
          setBgOpacity(HOVER_BG_OPACITY);
          if (systemModeEl) systemModeEl.textContent = getProjectId() || getCurrentSection().toUpperCase();
        });

        node.addEventListener("mouseleave", () => {
          setBgOpacity(DEFAULT_BG_OPACITY);
          if (systemModeEl) systemModeEl.textContent = modeForSection(getCurrentSection());
        });
      });
    }

    function bindCardHover({ selector, sectionId }) {
      const cards = Array.from(document.querySelectorAll(selector));

      for (const el of cards) {
        const getId = () => el.querySelector(".project-id")?.textContent?.trim();

        el.addEventListener("pointerenter", () => {
          if (getCurrentSection() !== sectionId) return;
          setBgOpacity(HOVER_BG_OPACITY);
          if (systemModeEl) systemModeEl.textContent = getId() || modeForSection(getCurrentSection());
        });

        el.addEventListener("pointerleave", () => {
          if (getCurrentSection() !== sectionId) return;
          setBgOpacity(DEFAULT_BG_OPACITY);
          if (systemModeEl) systemModeEl.textContent = modeForSection(getCurrentSection());
        });
      }
    }

    return Object.freeze({
      bindProjectHover,
      bindCardHover,
      resetDetailsHoverState,
      resetCardsHoverState,
    });
  }

  global.SystemUI = global.SystemUI || {};
  global.SystemUI.createHoverController = createHoverController;
})(window);


