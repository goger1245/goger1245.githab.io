(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  class Vector2 {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }

    add(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    }

    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    }

    mult(n) {
      this.x *= n;
      this.y *= n;
      return this;
    }

    mag() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
      const m = this.mag();
      if (m > 0) this.mult(1 / m);
      return this;
    }

    limit(max) {
      if (this.mag() > max) {
        this.normalize().mult(max);
      }
      return this;
    }

    dist(v) {
      const dx = this.x - v.x;
      const dy = this.y - v.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    clone() {
      return new Vector2(this.x, this.y);
    }
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function map(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  class Node {
    constructor(x, y, label = '') {
      this.pos = new Vector2(x, y);
      this.originalPos = this.pos.clone();
      this.vel = new Vector2();
      this.acc = new Vector2();
      this.label = label;
      this.radius = 4;
      this.mass = 1;
      this.maxSpeed = 2;
      this.active = false;
    }

    applyForce(force) {
      const f = force.clone().mult(1 / this.mass);
      this.acc.add(f);
    }

    attractTo(target, strength = 0.05) {
      const force = target.clone().sub(this.pos);
      const dist = force.mag();
      force.normalize().mult(strength * dist);
      this.applyForce(force);
    }

    repelFrom(target, strength = 50) {
      const force = this.pos.clone().sub(target);
      const dist = force.mag();
      if (dist < strength && dist > 0) {
        force.normalize().mult((strength - dist) * 0.1);
        this.applyForce(force);
      }
    }

    update() {
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.mult(0);
      this.vel.mult(0.95);
      this.attractTo(this.originalPos, 0.02);
    }

    draw(ctx, highlight = false) {
      ctx.save();
      ctx.fillStyle = highlight ? 'rgba(74, 222, 128, 0.9)' : 'rgba(232, 232, 232, 0.8)';
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      if (highlight) {
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (this.label && highlight) {
        ctx.font = '11px Space Mono';
        ctx.fillStyle = '#e8e8e8';
        ctx.textAlign = 'center';
        ctx.fillText(this.label, this.pos.x, this.pos.y - 20);
      }
      ctx.restore();
    }
  }

  class Line {
    constructor(nodeA, nodeB) {
      this.nodeA = nodeA;
      this.nodeB = nodeB;
      this.opacity = 0.2;
    }

    draw(ctx, highlight = false) {
      ctx.save();
      ctx.strokeStyle = highlight 
        ? `rgba(74, 222, 128, ${this.opacity * 0.6})` 
        : `rgba(232, 232, 232, ${this.opacity})`;
      ctx.lineWidth = highlight ? 1.5 : 0.5;
      ctx.beginPath();
      ctx.moveTo(this.nodeA.pos.x, this.nodeA.pos.y);
      ctx.lineTo(this.nodeB.pos.x, this.nodeB.pos.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  class ParticleText {
    constructor(text, x, y) {
      this.text = text;
      this.x = x;
      this.y = y;
      this.particles = [];
      this.formed = false;
    }

    formFromNodes(nodes) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 800;
      canvas.height = 100;
      ctx.font = '32px Space Mono';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(this.text, 400, 60);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let y = 0; y < canvas.height; y += 6) {
        for (let x = 0; x < canvas.width; x += 6) {
          const i = (y * canvas.width + x) * 4;
          if (data[i + 3] > 128) {
            this.particles.push({
              target: new Vector2(
                this.x + (x - 400) * 0.8,
                this.y + (y - 50)
              ),
              current: nodes[this.particles.length % nodes.length].pos.clone(),
              vel: new Vector2(),
            });
          }
        }
      }
    }

    update() {
      if (Math.random() > 0.5) {
        for (let i = 0; i < this.particles.length; i += 2) {
          const p = this.particles[i];
          const force = p.target.clone().sub(p.current);
          force.mult(0.12);
          p.vel.add(force);
          p.vel.mult(0.85);
          p.current.add(p.vel);
        }
      } else {
        for (let i = 1; i < this.particles.length; i += 2) {
          const p = this.particles[i];
          const force = p.target.clone().sub(p.current);
          force.mult(0.12);
          p.vel.add(force);
          p.vel.mult(0.85);
          p.current.add(p.vel);
        }
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.fillStyle = 'rgba(232, 232, 232, 0.9)';
      for (const p of this.particles) {
        ctx.fillRect(p.current.x, p.current.y, 2, 2);
      }
      ctx.restore();
    }

    isFormed() {
      return this.particles.every(p => p.current.dist(p.target) < 2);
    }
  }

  const introScreen = $('#introScreen');
  const introCanvas = $('#introCanvas');
  const introHint = $('#introHint');
  const introCtx = introCanvas.getContext('2d');

  let introNodes = [];
  let introLines = [];
  let introText = null;
  let introPhase = 'idle';
  let mousePos = new Vector2();
  let mouseMoved = false;

  function initIntro() {
    introCanvas.width = window.innerWidth;
    introCanvas.height = window.innerHeight;

    const centerNode = new Node(introCanvas.width / 2, introCanvas.height / 2);
    introNodes.push(centerNode);

    const skipIntro = () => {
      if (introPhase !== 'complete') {
        introPhase = 'complete';
        completeIntro();
      }
    };
    document.addEventListener('click', skipIntro, { once: true });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') skipIntro();
    }, { once: true });
  }

  function growNetwork() {
    if (introNodes.length >= 8) return;

    const lastNode = introNodes[introNodes.length - 1];
    const angle = (Math.PI * 2 * introNodes.length) / 8;
    const radius = 150 + Math.random() * 50;
    const x = lastNode.originalPos.x + Math.cos(angle) * radius;
    const y = lastNode.originalPos.y + Math.sin(angle) * radius;

    const newNode = new Node(x, y);
    introNodes.push(newNode);
    introLines.push(new Line(newNode, introNodes[0]));
  }

  let lastIntroUpdate = 0;
  const introUpdateInterval = 1000 / 40;

  function updateIntro(timestamp = 0) {
    if (timestamp - lastIntroUpdate < introUpdateInterval) {
      if (introPhase !== 'complete') {
        requestAnimationFrame(updateIntro);
      }
      return;
    }
    lastIntroUpdate = timestamp;

    introCtx.fillStyle = '#0a0a0a';
    introCtx.fillRect(0, 0, introCanvas.width, introCanvas.height);

    if (introPhase === 'idle' && mouseMoved) {
      introPhase = 'nodes';
      introHint.style.opacity = '0';
    }

    if (introPhase === 'nodes') {
      if (introNodes.length < 8) {
        if (Math.random() > 0.85) {
          growNetwork();
        }
      } else {
        introPhase = 'text';
        introText = new ParticleText('Code as interface', introCanvas.width / 2, introCanvas.height / 2);
        introText.formFromNodes(introNodes);
      }
    }

    if (introPhase === 'nodes' || introPhase === 'text') {
      for (const node of introNodes) {
        node.repelFrom(mousePos, 100);
        node.update();
      }
    }

    for (const line of introLines) {
      line.draw(introCtx);
    }

    for (const node of introNodes) {
      node.draw(introCtx);
    }

    if (introPhase === 'text' || introPhase === 'complete') {
      if (introText) {
        introText.update();
        introText.draw(introCtx);

        if (!introPhase.includes('complete') && introText.isFormed()) {
          setTimeout(() => {
            introPhase = 'complete';
            completeIntro();
          }, 600);
        }
      }
    }

    if (introPhase !== 'complete') {
      requestAnimationFrame(updateIntro);
    }
  }

  function completeIntro() {
    introScreen.classList.add('is-complete');
    setTimeout(() => {
      introScreen.remove();
      $('#systemInterface').hidden = false;
      initSystem();
    }, 800);
  }

  let currentSection = 'about';
  const systemInterface = $('#systemInterface');
  const bgCanvas = $('#bgCanvas');
  const bgCtx = bgCanvas.getContext('2d');
  const systemMode = $('#systemMode');
  const activeNode = $('#activeNode');
  const systemTime = $('#systemTime');

  let bgNodes = [];
  let bgLines = [];

  function initSystem() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;

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
    for (let i = 0; i < rows - 1; i += 2) {
      for (let j = 0; j < cols; j += 2) {
        const idx = i * cols + j;
        bgLines.push(new Line(bgNodes[idx], bgNodes[idx + cols]));
      }
    }

    animateBackground();
    setupNavigation();
    setupAbout();
    setupSkills();
    setupProjects();
    setupContact();
    updateSystemStatus();

    showSection('about');

    document.body.classList.add('cursor-ready');
  }

  let lastBgUpdate = 0;
  const bgUpdateInterval = 1000 / 30;

  function animateBackground(timestamp) {
    if (timestamp - lastBgUpdate < bgUpdateInterval) {
      requestAnimationFrame(animateBackground);
      return;
    }
    lastBgUpdate = timestamp;

    bgCtx.fillStyle = '#0a0a0a';
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    for (const node of bgNodes) {
      node.repelFrom(mousePos, 80);
      node.update();
    }

    for (const line of bgLines) {
      line.draw(bgCtx);
    }

    requestAnimationFrame(animateBackground);
  }

  function setupNavigation() {
    const navButtons = $$('.nav-node');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        showSection(section);
      });
    });
  }

  function showSection(name) {
    currentSection = name;

    $$('.system-section').forEach(s => s.classList.remove('active'));
    $(`#${name}`).classList.add('active');

    $$('.nav-node').forEach(n => n.classList.remove('active'));
    $(`.nav-node[data-section="${name}"]`).classList.add('active');

    systemMode.textContent = name.toUpperCase();
  }

  function setupAbout() {
    const logLines = $$('.log-line');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay) || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    });

    logLines.forEach(line => observer.observe(line));

    let lastMouseX = 0;
    document.addEventListener('mousemove', (e) => {
      const speed = Math.abs(e.clientX - lastMouseX);
      if (speed > 50 && currentSection === 'about') {
        const randomLine = logLines[Math.floor(Math.random() * logLines.length)];
        randomLine.classList.add('glitch');
        setTimeout(() => randomLine.classList.remove('glitch'), 200);
      }
      lastMouseX = e.clientX;
    });
  }

  function setupSkills() {
    const skillsCanvas = $('#skillsCanvas');
    if (!skillsCanvas) return;

    const ctx = skillsCanvas.getContext('2d');
    skillsCanvas.width = window.innerWidth;
    skillsCanvas.height = window.innerHeight;

    const skills = [
      { label: 'JavaScript', x: 0.3, y: 0.4 },
      { label: 'React', x: 0.5, y: 0.3 },
      { label: 'WebGL', x: 0.7, y: 0.45 },
      { label: 'Node.js', x: 0.4, y: 0.6 },
      { label: 'Architecture', x: 0.6, y: 0.65 },
      { label: 'Performance', x: 0.5, y: 0.5 },
    ];

    const skillNodes = skills.map(s => 
      new Node(skillsCanvas.width * s.x, skillsCanvas.height * s.y, s.label)
    );

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
    const skillsUpdateInterval = 1000 / 40;

    function animateSkills(timestamp) {
      if (currentSection !== 'skills') {
        requestAnimationFrame(animateSkills);
        return;
      }

      if (timestamp - lastSkillsUpdate < skillsUpdateInterval) {
        requestAnimationFrame(animateSkills);
        return;
      }
      lastSkillsUpdate = timestamp;

      ctx.clearRect(0, 0, skillsCanvas.width, skillsCanvas.height);
      ctx.fillStyle = '#0a0a0a';
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
        $('#skillDetail .detail-title').textContent = hoveredSkill.label;
        $('#skillDetail .detail-desc').textContent = 'System adapted to this node';
        activeNode.textContent = hoveredSkill.label.toUpperCase();
      } else {
        $('#skillDetail .detail-title').textContent = '—';
        $('#skillDetail .detail-desc').textContent = 'Hover nodes to explore';
        activeNode.textContent = '—';
      }

      requestAnimationFrame(animateSkills);
    }

    animateSkills();
  }

  function setupProjects() {
    const projectNodes = $$('.project-node');
    projectNodes.forEach((node, i) => {
      node.addEventListener('mouseenter', () => {
        projectNodes.forEach(n => n.classList.remove('active'));
        node.classList.add('active');
        bgLines.forEach(line => line.opacity = 0.05 + i * 0.05);
        systemMode.textContent = `PROJECT_0${i + 1}`;
      });

      node.addEventListener('mouseleave', () => {
        node.classList.remove('active');
        bgLines.forEach(line => line.opacity = 0.2);
        systemMode.textContent = currentSection.toUpperCase();
      });
    });
  }

  function setupContact() {
    const revealItems = $$('.reveal-item');
    let revealIndex = 0;
    let lastReveal = 0;

    document.addEventListener('mousemove', () => {
      if (currentSection !== 'contact') return;
      
      const now = Date.now();
      if (now - lastReveal > 300 && revealIndex < revealItems.length) {
        revealItems[revealIndex].classList.add('revealed');
        revealIndex++;
        lastReveal = now;
      }
    });
  }

  function updateSystemStatus() {
    function updateTime() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      systemTime.textContent = `${h}:${m}`;
    }
    updateTime();
    setInterval(updateTime, 10000);
  }

  document.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
    mouseMoved = true;

    if (document.body.classList.contains('cursor-ready')) {
      document.body.style.setProperty('--cursorX', `${e.clientX}px`);
      document.body.style.setProperty('--cursorY', `${e.clientY}px`);
      const cursor = document.body;
      cursor.style.setProperty('--cursor-x', `${e.clientX}px`);
      cursor.style.setProperty('--cursor-y', `${e.clientY}px`);
    }
  });

  const style = document.createElement('style');
  style.textContent = `
    body.cursor-ready::before {
      left: var(--cursor-x, 0);
      top: var(--cursor-y, 0);
    }
  `;
  document.head.appendChild(style);

  initIntro();
  updateIntro();
})();
