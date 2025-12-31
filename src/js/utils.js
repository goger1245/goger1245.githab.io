(function (global) {
  "use strict";

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

  global.SystemUtils = Object.freeze({
    Vector2,
    lerp,
    map,
  });
})(window);
