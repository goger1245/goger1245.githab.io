(function (global) {
  "use strict";

  const { Vector2 } = global.SystemUtils;

  class ParticleText {
    constructor(text, x, y) {
      this.text = text;
      this.x = x;
      this.y = y;
      this.particles = [];
    }

    // Samples text pixels and maps them to particles starting from node positions
    formFromNodes(nodes) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 800;
      canvas.height = 100;
      
      ctx.font = "32px Inter, Space Mono, monospace";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(this.text, 400, 60);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const SAMPLING_RATE = 6;
      const ALPHA_THRESHOLD = 128;
      const SCALE = 0.8;
      const CENTER_X = 400;
      const CENTER_Y = 50;

      for (let y = 0; y < canvas.height; y += SAMPLING_RATE) {
        for (let x = 0; x < canvas.width; x += SAMPLING_RATE) {
          const i = (y * canvas.width + x) * 4;
          if (data[i + 3] > ALPHA_THRESHOLD) {
            this.particles.push({
              target: new Vector2(
                this.x + (x - CENTER_X) * SCALE,
                this.y + (y - CENTER_Y)
              ),
              current: nodes[this.particles.length % nodes.length].pos.clone(),
              vel: new Vector2(),
            });
          }
        }
      }
    }

    // Spring-damper physics for smooth particle movement
    update(dt = 1) {
      const SPRING_CONSTANT = 0.10;
      const DAMPING = 0.86;
      const k = SPRING_CONSTANT * dt;
      const damping = Math.pow(DAMPING, dt);

      for (const particle of this.particles) {
        const force = particle.target.clone().sub(particle.current);
        force.mult(k);
        particle.vel.add(force);
        particle.vel.mult(damping);
        particle.current.add(particle.vel);
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.fillStyle = "rgba(232, 232, 232, 0.9)";
      for (const particle of this.particles) {
        ctx.fillRect(particle.current.x, particle.current.y, 2, 2);
      }
      ctx.restore();
    }

    isFormed() {
      const DISTANCE_THRESHOLD = 2;
      return this.particles.every((p) => p.current.dist(p.target) < DISTANCE_THRESHOLD);
    }
  }

  global.SystemComponents = global.SystemComponents || {};
  global.SystemComponents.ParticleText = ParticleText;
})(window);
