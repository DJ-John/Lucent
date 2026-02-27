<template>
  <section class="home-page" aria-label="主页">
    <div class="site-letter">L</div>
  </section>
</template>

<style scoped lang="scss">
.home-page {
  min-height: calc(100vh - 96px);
  display: grid;
  place-items: center;
}

.site-letter {
  position: relative;
  font-size: clamp(7rem, 24vw, 14rem);
  font-weight: 800;
  line-height: 1;
  color: #f0f5ff;
  letter-spacing: 0.06em;
  text-shadow:
    0 0 14px rgba(146, 182, 255, 0.9),
    0 0 36px rgba(96, 141, 255, 0.8),
    0 0 72px rgba(58, 104, 235, 0.65);
  animation: letter-pulse 2.6s ease-in-out infinite;
}

.site-letter::after {
  content: '';
  position: absolute;
  inset: -22%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 165, 255, 0.35) 0%, rgba(124, 165, 255, 0) 70%);
  filter: blur(10px);
  z-index: -1;
  animation: halo-pulse 2.6s ease-in-out infinite;
}

@keyframes letter-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.9;
  }

  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

@keyframes halo-pulse {
  0%,
  100% {
    opacity: 0.45;
    transform: scale(0.9);
  }

  50% {
    opacity: 0.85;
    transform: scale(1.1);
  }
}
</style>

