(() => {
  if (!window.Components) window.Components = {};
  if (!window.SystemComponents) window.SystemComponents = {};

  class AvatarParticles {
    constructor(canvas, imagePath, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.imagePath = imagePath;
      
      this.particles = [];
      this.image = null;
      this.isLoaded = false;
      this.isFormed = false;
      this.startTime = null;
      this.lastUpdateTime = null;

      this.particleSize = options.particleSize || 1.5;
      this.samplingRate = options.samplingRate || 4;
      this.targetSize = options.targetSize || 200;
      this.onComplete = options.onComplete || null;
    }

    async load() {
      return new Promise((resolve, reject) => {
        this.image = new Image();
        this.image.crossOrigin = 'anonymous';
        this.image.onload = () => {
          this.isLoaded = true;
          this.generateParticles();
          resolve();
        };
        this.image.onerror = reject;
        this.image.src = this.imagePath;
      });
    }

    generateParticles() {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      const aspectRatio = this.image.width / this.image.height;
      let drawWidth = this.targetSize;
      let drawHeight = this.targetSize;
      
      if (aspectRatio > 1) {
        drawHeight = this.targetSize / aspectRatio;
      } else {
        drawWidth = this.targetSize * aspectRatio;
      }

      tempCanvas.width = drawWidth;
      tempCanvas.height = drawHeight;
      tempCtx.drawImage(this.image, 0, 0, drawWidth, drawHeight);

      const imageData = tempCtx.getImageData(0, 0, drawWidth, drawHeight);
      const data = imageData.data;

      const centerX = this.canvas.width / 2 - drawWidth / 2;
      const centerY = this.canvas.height / 2 - drawHeight / 2;
      const avatarCenterX = centerX + drawWidth / 2;
      const avatarCenterY = centerY + drawHeight / 2;

      const particlesData = [];
      const ALPHA_THRESHOLD = 50;
      const MAX_ANIMATION_DURATION = 4800;
      
      for (let y = 0; y < drawHeight; y += this.samplingRate) {
        for (let x = 0; x < drawWidth; x += this.samplingRate) {
          const i = (y * drawWidth + x) * 4;
          const alpha = data[i + 3];

          if (alpha > ALPHA_THRESHOLD) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const targetX = centerX + x;
            const targetY = centerY + y;

            particlesData.push({
              x: targetX,
              y: targetY,
              z: 0,
              color: `rgba(${r}, ${g}, ${b}, ${alpha / 255})`,
              size: this.particleSize,
              appearDelay: Math.random() * MAX_ANIMATION_DURATION,
              opacity: 0,
            });
          }
        }
      }

      this.particles = particlesData;
      this.imageCenterX = avatarCenterX;
      this.imageCenterY = avatarCenterY;
      this.imageDrawWidth = drawWidth;
      this.imageDrawHeight = drawHeight;
      this.imageData = { centerX, centerY, drawWidth, drawHeight };
    }

    update() {
      if (!this.isLoaded || !this.startTime) return;

      const now = Date.now();
      const elapsed = now - this.startTime;

      const MIN_UPDATE_INTERVAL = 16;
      if (this.lastUpdateTime && now - this.lastUpdateTime < MIN_UPDATE_INTERVAL) {
        return;
      }
      this.lastUpdateTime = now;

      const FADE_DURATION = 400;
      let allVisible = true;

      for (const particle of this.particles) {
        if (elapsed >= particle.appearDelay) {
          const fadeElapsed = elapsed - particle.appearDelay;
          particle.opacity = Math.min(1, fadeElapsed / FADE_DURATION);
        } else {
          particle.opacity = 0;
          allVisible = false;
        }
      }

      const TARGET_END_TIME = 4800;
      if (allVisible && !this.isFormed) {
        this.isFormed = true;
        const timeUntilText = Math.max(0, TARGET_END_TIME - elapsed);

        if (this.onComplete) {
          setTimeout(() => this.onComplete(), timeUntilText);
        }
      }
    }

    draw() {
      if (!this.isLoaded || !this.startTime) return;

      this.ctx.save();

      const borderRadius = 20;
      const { centerX, centerY, drawWidth, drawHeight } = this.imageData || {
        centerX: 0,
        centerY: 0,
        drawWidth: this.canvas.width,
        drawHeight: this.canvas.height,
      };
      const left = centerX;
      const top = centerY;
      const right = centerX + drawWidth;
      const bottom = centerY + drawHeight;

      this.ctx.beginPath();
      this.ctx.moveTo(left + borderRadius, top);
      this.ctx.lineTo(right - borderRadius, top);
      this.ctx.quadraticCurveTo(right, top, right, top + borderRadius);
      this.ctx.lineTo(right, bottom - borderRadius);
      this.ctx.quadraticCurveTo(right, bottom, right - borderRadius, bottom);
      this.ctx.lineTo(left + borderRadius, bottom);
      this.ctx.quadraticCurveTo(left, bottom, left, bottom - borderRadius);
      this.ctx.lineTo(left, top + borderRadius);
      this.ctx.quadraticCurveTo(left, top, left + borderRadius, top);
      this.ctx.closePath();
      this.ctx.clip();

      const visibleParticles = this.particles.filter(p => p.opacity > 0);
      const halfSize = this.particleSize / 2;
      const colorRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/;

      for (const particle of visibleParticles) {
        const colorMatch = particle.color.match(colorRegex);
        if (colorMatch) {
          const [, r, g, b, baseAlpha = 1] = colorMatch;
          this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${baseAlpha * particle.opacity})`;
        } else {
          this.ctx.fillStyle = particle.color;
        }

        const x = particle.x - halfSize;
        const y = particle.y - halfSize;
        
        this.ctx.fillRect(x, y, particle.size, particle.size);
      }

      this.ctx.restore();
    }

    isComplete() {
      return this.isFormed;
    }
  }

  window.Components.AvatarParticles = AvatarParticles;
  window.SystemComponents.AvatarParticles = AvatarParticles;
})();
