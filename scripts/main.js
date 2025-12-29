(function () {
  "use strict";

  window.SystemI18n?.init?.();

  const introScreen = document.getElementById("introScreen");
  const introCanvas = document.getElementById("introCanvas");
  const introHint = document.getElementById("introHint");
  const systemInterface = document.getElementById("systemInterface");
  const bgCanvas = document.getElementById("bgCanvas");
  const systemModeEl = document.getElementById("systemMode");
  const activeNodeEl = document.getElementById("activeNode");
  const systemTimeEl = document.getElementById("systemTime");

  const navButtons = Array.from(document.querySelectorAll(".nav-node"));
  const sections = Array.from(document.querySelectorAll(".system-section"));
  const logLines = Array.from(document.querySelectorAll(".log-line"));
  const aboutAvatarCanvas = document.getElementById("aboutAvatarCanvas");
  const avatarName = document.querySelector(".avatar-name");
  const skillsCanvas = document.getElementById("skillsCanvas");
  const skillDetailTitle = document.querySelector("#skillDetail .detail-title");
  const skillDetailDesc = document.querySelector("#skillDetail .detail-desc");
  const projectNodes = Array.from(document.querySelectorAll(".project-node"));
  const revealItems = Array.from(document.querySelectorAll(".reveal-item"));

  function setupCursorStyles() {
    if (!document.getElementById("cursorVarStyle")) {
      const style = document.createElement("style");
      style.id = "cursorVarStyle";
      style.textContent = `
        body.cursor-ready::before {
          left: var(--cursor-x, 0);
          top: var(--cursor-y, 0);
        }
      `;
      document.head.appendChild(style);
    }
  }

  function initSystem() {
    return window.SystemNodes.createSystemController({
      systemInterface,
      bgCanvas,
      systemModeEl,
      activeNodeEl,
      systemTimeEl,
      navButtons,
      sections,
      logLines,
      aboutAvatarCanvas,
      avatarName,
      skillsCanvas,
      skillDetailTitle,
      skillDetailDesc,
      projectNodes,
      revealItems,
    });
  }

  function initIntro(system) {
    return window.SystemAnimation.createIntroController({
      introScreen,
      introCanvas,
      introHint,
      onComplete: () => system.start(),
    });
  }

  function setupEventListeners(intro, system) {
    document.addEventListener("mousemove", (e) => {
      intro.onMouseMove(e);
      system.onMouseMove(e);
    });

    window.addEventListener("resize", () => {
      intro.onResize();
      system.onResize();
    });
  }

  setupCursorStyles();
  const system = initSystem();
  const intro = initIntro(system);
  setupEventListeners(intro, system);

  requestAnimationFrame(intro.tick);
})();
