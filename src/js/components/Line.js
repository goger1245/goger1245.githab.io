(function (global) {
  "use strict";

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

  global.SystemComponents = global.SystemComponents || {};
  global.SystemComponents.Line = Line;
})(window);
