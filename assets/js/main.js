document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero-canvas');
  const loader = document.getElementById('loader');
  const scrollHint = document.getElementById('scroll-hint');
  let ctx = null;

  // Read frame config from the page's data attributes on <body>
  const body = document.body;
  const framePath = body.dataset.framePath;
  const framePrefix = body.dataset.framePrefix;
  const frameSuffix = body.dataset.frameSuffix;
  const totalFrames = parseInt(body.dataset.frameTotalFrames, 10);

  let frames = [];
  let currentFrameIndex = 0;

  if (canvas && framePath) {
    ctx = canvas.getContext('2d');

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (frames[currentFrameIndex]) {
        drawFrame(frames[currentFrameIndex]);
      }
    }

    function drawFrame(img) {
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const cR = canvas.width / canvas.height;
      const iR = img.width / img.height;
      let dw, dh, ox, oy;
      if (iR > cR) {
        dh = canvas.height;
        dw = img.width * (canvas.height / img.height);
        ox = (canvas.width - dw) / 2;
        oy = 0;
      } else {
        dw = canvas.width;
        dh = img.height * (canvas.width / img.width);
        ox = 0;
        oy = (canvas.height - dh) / 2;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, ox, oy, dw, dh);
    }

    function updateAnimation() {
      const hero = document.getElementById('hero');
      if (!hero) return;
      const scrollY = window.scrollY;
      const maxScroll = hero.offsetHeight - window.innerHeight;
      let progress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;

      if (scrollHint) {
        scrollHint.style.opacity = Math.max(1 - progress * 5, 0);
      }

      const target = Math.min(Math.floor(progress * totalFrames), totalFrames - 1);
      if (target !== currentFrameIndex && frames[target]) {
        currentFrameIndex = target;
        drawFrame(frames[currentFrameIndex]);
      } else if (currentFrameIndex === 0 && frames[0]) {
        drawFrame(frames[0]);
      }
    }

    function preloadFrames() {
      if (loader) loader.style.display = 'block';
      let loaded = 0;
      for (let i = 0; i < totalFrames; i++) {
        const img = new Image();
        img.src = `${framePath}${framePrefix}${String(i).padStart(3, '0')}${frameSuffix}`;
        img.onload = () => {
          loaded++;
          if (loaded === 1 && frames[0] && frames[0].complete) drawFrame(frames[0]);
          if (loaded === totalFrames) {
            if (loader) loader.style.display = 'none';
            updateAnimation();
          }
        };
        img.onerror = () => {
          loaded++;
          if (loaded === totalFrames) {
            if (loader) loader.style.display = 'none';
            updateAnimation();
          }
        };
        frames.push(img);
      }
    }

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', () => requestAnimationFrame(updateAnimation));

    resizeCanvas();
    preloadFrames();
  }
});
