(function (global) {
  "use strict";

  const { Vector2 } = global.SystemUtils;
  const { Node, Line, AvatarParticles } = global.SystemComponents;
  const t = (key) => global.SystemI18n?.t?.(key) ?? key;
  const modeForSection = (sectionId) =>
    global.SystemI18n?.modeForSection?.(sectionId) ?? String(sectionId || "").toUpperCase();

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
      skillsCanvas,
      skillDetailTitle,
      skillDetailDesc,
      projectNodes,
      revealItems,
    } = opts;

    const mousePos = new Vector2();
    let currentSection = "about";
    let isStarted = false;
    let aboutAvatar = null;
    let avatarStarted = false;

    const bgCtx = bgCanvas.getContext("2d");
    let bgNodes = [];
    let bgLines = [];
    let lastBgUpdate = 0;
    const BG_UPDATE_INTERVAL = 1000 / 20;

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

      // Reduced vertical lines for performance
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

      // If we leave the details page while hovering a card, mouseleave may not fire.
      // Reset any background/hover side-effects so animations don't "stick" across pages.
      if (prevSection === "projects" && name !== "projects") {
        resetDetailsHoverState();
      }
      if ((prevSection === "payment" || prevSection === "contact") && prevSection !== name) {
        resetCardsHoverState();
      }

      if (prevSection !== name) stopReveal();
      if (name === "contact" || name === "payment" || name === "projects") {
        if (!hasRevealedOnce[name]) {
          hasRevealedOnce[name] = true;
          startReveal(name);
        } else {
          showAllRevealed(name);
        }
      }
    }

    let revealTimer = null;
    const hasRevealedOnce = {
      projects: false,
      payment: false,
      contact: false,
    };

    function stopReveal() {
      if (revealTimer) {
        clearInterval(revealTimer);
        revealTimer = null;
      }
    }

    function showAllRevealed(sectionId) {
      const sectionEl = document.getElementById(sectionId);
      if (!sectionEl) return;
      const items = Array.from(sectionEl.querySelectorAll(".reveal-item"));
      items.forEach((el) => el.classList.add("revealed"));
    }

    function resetDetailsHoverState() {
      bgLines.forEach((line) => (line.opacity = 0.2));
      projectNodes.forEach((n) => n.classList.remove("active"));
    }

    function resetCardsHoverState() {
      bgLines.forEach((line) => (line.opacity = 0.2));
    }

    function startReveal(sectionId) {
      stopReveal();

      const sectionEl = document.getElementById(sectionId);
      if (!sectionEl) return;

      const items = Array.from(sectionEl.querySelectorAll(".reveal-item"));
      items.forEach((el) => el.classList.remove("revealed"));

      // Reveal in visual order (top-to-bottom, left-to-right) so 2-column layouts animate 1-2-3-4-5-6.
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
        if (currentSection !== sectionId) {
          stopReveal();
          return;
        }

        if (idx < items.length) {
          items[idx].classList.add("revealed");
          idx++;
        } else {
          stopReveal();
        }
      };

      step();
      revealTimer = setInterval(step, STEP_MS);
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

        aboutAvatar = new AvatarParticles(aboutAvatarCanvas, 'src/converted_image.png', {
          particleSize: 1.9,
          samplingRate: 3,
          targetSize: 280,
        });

        try {
          await aboutAvatar.load();
          showSection("about");
        } catch (err) {
          // Avatar image failed to load
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

    function setupSkills() {
      if (!skillsCanvas) return;
      
      const ctx = skillsCanvas.getContext("2d");
      skillsCanvas.width = window.innerWidth;
      skillsCanvas.height = window.innerHeight;

      const skills = [
        { label: "JavaScript", x: 0.3, y: 0.4 },
        { label: "React", x: 0.5, y: 0.3 },
        { label: "WebGL", x: 0.7, y: 0.45 },
        { label: "Node.js", x: 0.4, y: 0.6 },
        { label: "Architecture", x: 0.6, y: 0.65 },
        { label: "Performance", x: 0.5, y: 0.5 },
      ];

      const skillNodes = skills.map((s) => 
        new Node(skillsCanvas.width * s.x, skillsCanvas.height * s.y, s.label)
      );
      
      // Create connections between nearby nodes
      const skillLines = [];
      for (let i = 0; i < skillNodes.length; i++) {
        for (let j = i + 1; j < skillNodes.length; j++) {
          if (skillNodes[i].pos.dist(skillNodes[j].pos) < 300) {
            skillLines.push(new Line(skillNodes[i], skillNodes[j]));
          }
        }
      }

      let hoveredSkill = null;
      let lastSkillsUpdate = 0;
      const SKILLS_UPDATE_INTERVAL = 1000 / 30;

      function tickSkills(ts = 0) {
        if (currentSection !== "skills") {
          requestAnimationFrame(tickSkills);
          return;
        }
        
        if (ts - lastSkillsUpdate < SKILLS_UPDATE_INTERVAL) {
          requestAnimationFrame(tickSkills);
          return;
        }
        lastSkillsUpdate = ts;

        ctx.clearRect(0, 0, skillsCanvas.width, skillsCanvas.height);
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, skillsCanvas.width, skillsCanvas.height);

        for (const node of skillNodes) {
          node.repelFrom(mousePos, 120);
          node.update();
        }

        hoveredSkill = null;
        for (const node of skillNodes) {
          if (node.pos.dist(mousePos) < 50) {
            hoveredSkill = node;
            break;
          }
        }

        for (const line of skillLines) {
          const highlight = hoveredSkill && (line.nodeA === hoveredSkill || line.nodeB === hoveredSkill);
          line.draw(ctx, highlight);
        }
        
        for (const node of skillNodes) {
          node.draw(ctx, node === hoveredSkill);
        }

        if (hoveredSkill) {
          if (skillDetailTitle) skillDetailTitle.textContent = hoveredSkill.label;
          if (skillDetailDesc) skillDetailDesc.textContent = t("skills_adapted");
          if (activeNodeEl) activeNodeEl.textContent = hoveredSkill.label.toUpperCase();
        } else {
          if (skillDetailTitle) skillDetailTitle.textContent = "—";
          if (skillDetailDesc) skillDetailDesc.textContent = t("skills_hint");
          if (activeNodeEl) activeNodeEl.textContent = "—";
        }

        requestAnimationFrame(tickSkills);
      }

      requestAnimationFrame(tickSkills);
    }

    function setupProjects() {
      projectNodes.forEach((node) => {
        const getProjectId = () => node.querySelector(".project-id")?.textContent?.trim();

        node.addEventListener("mouseenter", () => {
          const HOVER_BG_OPACITY = 0.1;
          bgLines.forEach((line) => (line.opacity = HOVER_BG_OPACITY));
          if (systemModeEl) {
            const projectId = node.querySelector(".project-id")?.textContent?.trim();
            systemModeEl.textContent = projectId || currentSection.toUpperCase();
          }
        });
        
        node.addEventListener("mouseleave", () => {
          bgLines.forEach((line) => (line.opacity = 0.2));
          if (systemModeEl) systemModeEl.textContent = modeForSection(currentSection);
        });
      });
    }

    function setupContact() {
      // reveal is handled on section switch (see showSection)
      const paymentCards = Array.from(document.querySelectorAll("#payment .payment-card"));
      const contactCards = Array.from(document.querySelectorAll("#contact .contact-card"));
      const hoverTargets = [
        ...paymentCards.map((el) => ({ el, section: "payment" })),
        ...contactCards.map((el) => ({ el, section: "contact" })),
      ];

      for (const { el, section } of hoverTargets) {
        const getId = () => el.querySelector(".project-id")?.textContent?.trim();

        el.addEventListener("pointerenter", (e) => {
          if (currentSection !== section) return;
          bgLines.forEach((line) => (line.opacity = 0.1));
          if (systemModeEl) {
            systemModeEl.textContent = getId() || modeForSection(currentSection);
          }
        });

        el.addEventListener("pointerleave", (e) => {
          if (currentSection !== section) return;
          bgLines.forEach((line) => (line.opacity = 0.2));
          if (systemModeEl) systemModeEl.textContent = modeForSection(currentSection);
        });
      }
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
      
      if (skillsCanvas) {
        skillsCanvas.width = window.innerWidth;
        skillsCanvas.height = window.innerHeight;
      }
      
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
      setupSkills();
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
