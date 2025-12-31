(function (global) {
  "use strict";

  const { Vector2 } = global.SystemUtils;
  const { Node, Line, AvatarParticles } = global.SystemComponents;
  const t = (key) => global.SystemI18n?.t?.(key) ?? key;
  const modeForSection = (sectionId) =>
    global.SystemI18n?.modeForSection?.(sectionId) ?? String(sectionId || "").toUpperCase();
  const createRevealer = global.SystemUI?.createRevealer;
  const createHoverController = global.SystemUI?.createHoverController;

  function createSystemController(opts) {
    const {
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
      projectNodes,
      revealItems,
    } = opts;

    const mousePos = new Vector2();
    let currentSection = "about";
    let isStarted = false;
    let aboutAvatar = null;
    let avatarStarted = false;
    const getCurrentSection = () => currentSection;

    const bgCtx = bgCanvas.getContext("2d");
    let bgNodes = [];
    let bgLines = [];
    let lastBgUpdate = 0;
    const BG_UPDATE_INTERVAL = 1000 / 20;

    const revealer = createRevealer ? createRevealer({ getCurrentSection }) : null;
    const hoverCtrl = createHoverController
      ? createHoverController({
          bgLines,
          systemModeEl,
          modeForSection,
          getCurrentSection,
          projectNodes,
        })
      : null;

    function initBackground() {
      bgCanvas.width = window.innerWidth;
      bgCanvas.height = window.innerHeight;
      bgNodes = [];
      bgLines = [];

      const cols = 8;
      const rows = 6;
      const spacingX = bgCanvas.width / (cols + 1);
      const spacingY = bgCanvas.height / (rows + 1);

      for (let i = 1; i <= rows; i++) {
        for (let j = 1; j <= cols; j++) {
          bgNodes.push(new Node(spacingX * j, spacingY * i));
        }
      }

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols - 1; j++) {
          const idx = i * cols + j;
          bgLines.push(new Line(bgNodes[idx], bgNodes[idx + 1]));
        }
      }

      // Меньше вертикальных линий для производительности
      for (let i = 0; i < rows - 1; i += 2) {
        for (let j = 0; j < cols; j += 2) {
          const idx = i * cols + j;
          bgLines.push(new Line(bgNodes[idx], bgNodes[idx + cols]));
        }
      }
    }

    function tickBackground(ts = 0) {
      if (ts - lastBgUpdate < BG_UPDATE_INTERVAL) {
        requestAnimationFrame(tickBackground);
        return;
      }
      lastBgUpdate = ts;

      bgCtx.fillStyle = "#0a0a0a";
      bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

      for (const node of bgNodes) {
        node.repelFrom(mousePos, 80);
        node.update();
      }

      for (const line of bgLines) line.draw(bgCtx);

      requestAnimationFrame(tickBackground);
    }

    function showSection(name) {
      const prevSection = currentSection;
      currentSection = name;
      
      sections.forEach((s) => s.classList.remove("active"));
      document.getElementById(name)?.classList.add("active");

      navButtons.forEach((b) => b.classList.remove("active"));
      document.querySelector(`.nav-node[data-section="${name}"]`)?.classList.add("active");

      if (name === "about" && aboutAvatar && aboutAvatar.isLoaded && !aboutAvatar.startTime) {
        avatarStarted = true;
        aboutAvatar.startTime = Date.now();
        document.body.classList.add("lang-ready");
      }

      if (systemModeEl) systemModeEl.textContent = modeForSection(name);

      // Если уйти со страницы, пока курсор на карточке, событие mouseleave может не сработать.
      // Сбрасываем сайд-эффекты ховера/фона, чтобы состояние не “залипало” между вкладками.
      if (prevSection === "projects" && name !== "projects") {
        hoverCtrl?.resetDetailsHoverState?.();
      }
      if ((prevSection === "payment" || prevSection === "contact") && prevSection !== name) {
        hoverCtrl?.resetCardsHoverState?.();
      }

      if (prevSection !== name) revealer?.stop?.();
      revealer?.onEnter?.(name);
    }

    function setupNav() {
      navButtons.forEach((btn) => {
        btn.addEventListener("click", () => showSection(btn.dataset.section));
      });
    }

    async function setupAbout() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const SPEED_MULTIPLIER = 1.5;
          const delay = Math.round((parseInt(entry.target.dataset.delay) || 0) / SPEED_MULTIPLIER);
          setTimeout(() => entry.target.classList.add("visible"), delay);
          observer.unobserve(entry.target);
        });
      });
      logLines.forEach((l) => observer.observe(l));
      if (avatarName) observer.observe(avatarName);

      let lastMouseX = 0;
      document.addEventListener("mousemove", (e) => {
        const speed = Math.abs(e.clientX - lastMouseX);
        if (speed > 50 && currentSection === "about") {
          const randomLine = logLines[Math.floor(Math.random() * logLines.length)];
          randomLine.classList.add("glitch");
          setTimeout(() => randomLine.classList.remove("glitch"), 200);
        }
        lastMouseX = e.clientX;
      });

      if (aboutAvatarCanvas) {
        aboutAvatarCanvas.width = 300;
        aboutAvatarCanvas.height = 300;

        aboutAvatar = new AvatarParticles(aboutAvatarCanvas, "src/assets/converted_image.png", {
          particleSize: 1.9,
          samplingRate: 3,
          targetSize: 280,
        });

        try {
          await aboutAvatar.load();
          showSection("about");
        } catch (err) {
          // Не удалось загрузить изображение аватара
        }
      }
    }

    let lastAvatarUpdate = 0;
    const AVATAR_UPDATE_INTERVAL = 1000 / 30;

    function tickAvatar(ts = 0) {
      if (!aboutAvatar || !aboutAvatarCanvas) {
        requestAnimationFrame(tickAvatar);
        return;
      }

      if (!aboutAvatar.isLoaded) {
        requestAnimationFrame(tickAvatar);
        return;
      }

      if (ts - lastAvatarUpdate < AVATAR_UPDATE_INTERVAL) {
        requestAnimationFrame(tickAvatar);
        return;
      }
      lastAvatarUpdate = ts;

      const shouldAnimate = avatarStarted && aboutAvatar && aboutAvatar.isLoaded && !!aboutAvatar.startTime;

      if (shouldAnimate) {
        const ctx = aboutAvatarCanvas.getContext("2d");
        ctx.clearRect(0, 0, aboutAvatarCanvas.width, aboutAvatarCanvas.height);
        aboutAvatar.update();
        aboutAvatar.draw();
      }

      requestAnimationFrame(tickAvatar);
    }

    function setupProjects() {
      hoverCtrl?.bindProjectHover?.();
    }

    function setupContact() {
      // reveal запускается при переключении секции (см. showSection)
      hoverCtrl?.bindCardHover?.({ selector: "#payment .payment-card", sectionId: "payment" });
      hoverCtrl?.bindCardHover?.({ selector: "#contact .contact-card", sectionId: "contact" });
    }

    function setupTime() {
      function updateTime() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, "0");
        const m = String(now.getMinutes()).padStart(2, "0");
        if (systemTimeEl) systemTimeEl.textContent = `${h}:${m}`;
      }
      
      updateTime();
      setInterval(updateTime, 10000);
    }

    function onMouseMove(e) {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      document.body.style.setProperty("--cursor-x", `${e.clientX}px`);
      document.body.style.setProperty("--cursor-y", `${e.clientY}px`);
    }

    function onResize() {
      bgCanvas.width = window.innerWidth;
      bgCanvas.height = window.innerHeight;
      initBackground();
    }

    function start() {
      if (isStarted) return;
      isStarted = true;

      systemInterface.hidden = false;
      document.body.classList.add("cursor-ready");
      
      initBackground();
      requestAnimationFrame(tickBackground);
      
      setupNav();
      setupAbout();
      setupProjects();
      setupContact();
      setupTime();
      
      requestAnimationFrame(tickAvatar);
    }

    return { start, onMouseMove, onResize, showSection };
  }

  global.SystemNodes = Object.freeze({
    createSystemController: createSystemController
  });
})(window);
