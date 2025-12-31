(function (global) {
  "use strict";

  const { Vector2 } = global.SystemUtils;
  const { Node, Line, ParticleText } = global.SystemComponents;

  function createIntroController({ introScreen, introCanvas, introHint, onComplete }) {
    const ctx = introCanvas.getContext("2d");

    let introNodes = [];
    let introLines = [];
    let introText = null;
    let introPhase = "idle";
    let mouseMoved = false;
    let isFinished = false;
    const mousePos = new Vector2();

    let lastTs = 0;
    let lastIntroUpdate = 0;
    const INTRO_UPDATE_INTERVAL = 1000 / 30;
    const INTRO_DELAY = 600;
    const FINISH_DELAY = 800;
    const MAX_NODES = 8;
    const NETWORK_GROWTH_CHANCE = 0.85;

    function init() {
      introCanvas.width = window.innerWidth;
      introCanvas.height = window.innerHeight;

      introNodes = [];
      introLines = [];
      introText = null;
      introPhase = "idle";

      const centerNode = new Node(introCanvas.width / 2, introCanvas.height / 2);
      introNodes.push(centerNode);

      const skipIntro = () => {
        if (introPhase !== "complete" && !isFinished) {
          introPhase = "complete";
          finish();
        }
      };

      document.addEventListener("click", skipIntro, { once: true });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") skipIntro();
      }, { once: true });
    }

    // Создаёт новые узлы по кругу вокруг центра
    function growNetwork() {
      if (introNodes.length >= MAX_NODES) return;

      const lastNode = introNodes[introNodes.length - 1];
      const angle = (Math.PI * 2 * introNodes.length) / MAX_NODES;
      const radius = 150 + Math.random() * 50;
      const x = lastNode.originalPos.x + Math.cos(angle) * radius;
      const y = lastNode.originalPos.y + Math.sin(angle) * radius;

      const newNode = new Node(x, y);
      introNodes.push(newNode);
      introLines.push(new Line(newNode, introNodes[0]));
    }

    function tick(ts = 0) {
      if (introPhase === "complete") return;

      if (ts - lastIntroUpdate < INTRO_UPDATE_INTERVAL) {
        requestAnimationFrame(tick);
        return;
      }
      lastIntroUpdate = ts;

      // Вычисляем delta time, нормированное под 60fps
      const rawDt = lastTs ? (ts - lastTs) / (1000 / 60) : 1;
      const dt = Math.min(2, Math.max(0.5, rawDt));
      lastTs = ts;

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, introCanvas.width, introCanvas.height);

      if (introPhase === "idle" && mouseMoved) {
        introPhase = "nodes";
        if (introHint) introHint.style.opacity = "0";
      }

      if (introPhase === "nodes") {
        if (introNodes.length < MAX_NODES) {
          if (Math.random() > NETWORK_GROWTH_CHANCE) {
            growNetwork();
          }
        } else {
          introPhase = "text";
          introText = new ParticleText(
            global.SystemI18n?.t?.("intro_particle_text") ?? "Code as interface",
            introCanvas.width / 2,
            introCanvas.height / 2
          );
          introText.formFromNodes(introNodes);
        }
      }

      if (introPhase === "nodes" || introPhase === "text") {
        for (const node of introNodes) {
          node.repelFrom(mousePos, 100);
          node.update();
        }
      }

      for (const line of introLines) line.draw(ctx);
      for (const node of introNodes) node.draw(ctx);

      if (introPhase === "text") {
        introText.update(dt);
        introText.draw(ctx);

        if (introText.isFormed() && introPhase !== "complete" && !isFinished) {
          introPhase = "complete";
          setTimeout(() => finish(), INTRO_DELAY);
        }
      }

      requestAnimationFrame(tick);
    }

    function finish() {
      if (isFinished) return;
      isFinished = true;

      introScreen.classList.add("is-complete");
      setTimeout(() => {
        introScreen.remove();
        onComplete?.();
      }, FINISH_DELAY);
    }

    function onMouseMove(e) {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      mouseMoved = true;
    }

    function onResize() {
      introCanvas.width = window.innerWidth;
      introCanvas.height = window.innerHeight;
    }

    init();
    return { tick, onMouseMove, onResize };
  }

  global.SystemAnimation = Object.freeze({
    createIntroController,
  });
})(window);
