(function (global) {
  "use strict";

  const { Vector2 } = global.SystemUtils;

  class Node {
    constructor(x, y, label = "") {
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

    // Repulsion force decreases with distance, only active within strength radius
    repelFrom(target, strength = 50) {
      const force = this.pos.clone().sub(target);
      const dist = force.mag();
      if (dist < strength && dist > 0) {
        force.normalize().mult((strength - dist) * 0.1);
        this.applyForce(force);
      }
    }

    // Physics update: velocity, acceleration, friction, and return to original position
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
      ctx.fillStyle = highlight
        ? "rgba(74, 222, 128, 0.9)"
        : "rgba(232, 232, 232, 0.8)";
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      if (highlight) {
        ctx.strokeStyle = "rgba(74, 222, 128, 0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (this.label && highlight) {
        ctx.font = "11px Space Mono";
        ctx.fillStyle = "#e8e8e8";
        ctx.textAlign = "center";
        ctx.fillText(this.label, this.pos.x, this.pos.y - 20);
      }
      ctx.restore();
    }
  }

  global.SystemComponents = global.SystemComponents || {};
  global.SystemComponents.Node = Node;
})(window);
