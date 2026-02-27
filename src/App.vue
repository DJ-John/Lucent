<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

interface Particle {
  x: number
  y: number
  tx: number
  ty: number
  vx: number
  vy: number
  size: number
  delay: number
  twinkle: number
  tint: string
}

interface Point {
  x: number
  y: number
}

const navItems = [
  { label: '主页', to: '/' },
  { label: '关于', to: '/about' },
  { label: '项目', to: '/projects' },
  { label: '联系', to: '/contact' },
]

const INTRO_SEEN_KEY = 'lucent_intro_seen'
const showIntro = ref(false)
const introCanvas = ref<HTMLCanvasElement | null>(null)
const introDuration = 3200
const convergeDuration = 2200
const disperseStart = 2600

let introTimer: number | null = null
let rafId: number | null = null
let resizeDebounce: number | null = null
let ctx: CanvasRenderingContext2D | null = null
let particles: Particle[] = []
let startTime = 0
let viewportWidth = 0
let viewportHeight = 0

const randomEdgePoint = (width: number, height: number): Point => {
  const edge = Math.floor(Math.random() * 4)
  if (edge === 0) {
    return { x: Math.random() * width, y: -30 }
  }
  if (edge === 1) {
    return { x: width + 30, y: Math.random() * height }
  }
  if (edge === 2) {
    return { x: Math.random() * width, y: height + 30 }
  }
  return { x: -30, y: Math.random() * height }
}

const createLogoPoints = (width: number, height: number): Point[] => {
  const offscreen = document.createElement('canvas')
  offscreen.width = 320
  offscreen.height = 260

  const offCtx = offscreen.getContext('2d')
  if (!offCtx) {
    return []
  }

  offCtx.clearRect(0, 0, offscreen.width, offscreen.height)
  offCtx.fillStyle = '#ffffff'
  offCtx.textAlign = 'center'
  offCtx.textBaseline = 'middle'
  offCtx.font = '700 170px Inter, Segoe UI, sans-serif'
  offCtx.fillText('L', offscreen.width / 2, offscreen.height / 2 + 8)

  const { data } = offCtx.getImageData(0, 0, offscreen.width, offscreen.height)
  const points: Point[] = []
  const gap = 5

  for (let y = 0; y < offscreen.height; y += gap) {
    for (let x = 0; x < offscreen.width; x += gap) {
      const alpha = data[(y * offscreen.width + x) * 4 + 3]
      if (alpha > 100) {
        points.push({
          x: width / 2 + (x - offscreen.width / 2) * 1.05,
          y: height / 2 + (y - offscreen.height / 2) * 1.05,
        })
      }
    }
  }

  return points
}

const setupIntroAnimation = (): void => {
  const canvas = introCanvas.value
  if (!canvas) {
    return
  }

  viewportWidth = window.innerWidth
  viewportHeight = window.innerHeight

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.floor(viewportWidth * dpr)
  canvas.height = Math.floor(viewportHeight * dpr)
  canvas.style.width = `${viewportWidth}px`
  canvas.style.height = `${viewportHeight}px`

  const nextCtx = canvas.getContext('2d')
  if (!nextCtx) {
    return
  }

  ctx = nextCtx
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const points = createLogoPoints(viewportWidth, viewportHeight)
  particles = points.map((point, index) => {
    const start = randomEdgePoint(viewportWidth, viewportHeight)
    return {
      x: start.x,
      y: start.y,
      tx: point.x,
      ty: point.y,
      vx: 0,
      vy: 0,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 500,
      twinkle: Math.random() * Math.PI * 2,
      tint: index % 6 === 0 ? '#d9e8ff' : '#8eb4ff',
    }
  })

  startTime = performance.now()
  if (rafId) {
    window.cancelAnimationFrame(rafId)
  }
  animateIntro(startTime)
}

const animateIntro = (now: number): void => {
  if (!ctx || !showIntro.value) {
    return
  }

  const context = ctx
  const elapsed = now - startTime
  context.clearRect(0, 0, viewportWidth, viewportHeight)

  particles.forEach((particle) => {
    const local = elapsed - particle.delay
    if (local <= 0) {
      return
    }

    if (local < convergeDuration) {
      particle.vx += (particle.tx - particle.x) * 0.055
      particle.vy += (particle.ty - particle.y) * 0.055
      particle.vx *= 0.85
      particle.vy *= 0.85
      particle.x += particle.vx
      particle.y += particle.vy
    } else {
      const wobble = 0.8
      particle.x += (particle.tx + Math.sin(now * 0.004 + particle.twinkle) * wobble - particle.x) * 0.2
      particle.y += (particle.ty + Math.cos(now * 0.004 + particle.twinkle) * wobble - particle.y) * 0.2
    }

    let alpha = 1
    if (elapsed > disperseStart) {
      const disperseProgress = Math.min((elapsed - disperseStart) / (introDuration - disperseStart), 1)
      const dx = particle.tx - viewportWidth / 2
      const dy = particle.ty - viewportHeight / 2
      const length = Math.hypot(dx, dy) || 1
      particle.x += (dx / length) * disperseProgress * 2.8
      particle.y += (dy / length) * disperseProgress * 2.8
      alpha = 1 - disperseProgress
    }

    if (alpha <= 0.01) {
      return
    }

    context.globalAlpha = alpha
    context.fillStyle = particle.tint
    context.shadowBlur = 12
    context.shadowColor = particle.tint
    context.beginPath()
    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    context.fill()
  })

  context.globalAlpha = 1
  context.shadowBlur = 0
  rafId = window.requestAnimationFrame(animateIntro)
}

const handleResize = (): void => {
  if (!showIntro.value) {
    return
  }

  if (resizeDebounce) {
    window.clearTimeout(resizeDebounce)
  }

  resizeDebounce = window.setTimeout(() => {
    setupIntroAnimation()
  }, 150)
}

const markIntroSeen = (): void => {
  try {
    window.localStorage.setItem(INTRO_SEEN_KEY, '1')
  } catch {
    // Ignore storage errors and fall back to showing intro next time.
  }
}

const shouldShowIntro = (): boolean => {
  try {
    return window.localStorage.getItem(INTRO_SEEN_KEY) !== '1'
  } catch {
    return true
  }
}

const finishIntro = (): void => {
  showIntro.value = false
  markIntroSeen()

  if (introTimer) {
    window.clearTimeout(introTimer)
    introTimer = null
  }

  if (rafId) {
    window.cancelAnimationFrame(rafId)
    rafId = null
  }

  window.removeEventListener('resize', handleResize)
}

const startIntro = async (): Promise<void> => {
  showIntro.value = true
  await nextTick()

  setupIntroAnimation()
  window.addEventListener('resize', handleResize)

  introTimer = window.setTimeout(() => {
    finishIntro()
  }, introDuration)
}

onMounted(() => {
  if (shouldShowIntro()) {
    void startIntro()
  }
})

onBeforeUnmount(() => {
  if (introTimer) {
    window.clearTimeout(introTimer)
  }

  if (resizeDebounce) {
    window.clearTimeout(resizeDebounce)
  }

  if (rafId) {
    window.cancelAnimationFrame(rafId)
  }

  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="layout-shell">
    <header class="topbar">
      <span class="brand">Lucent</span>
      <nav class="nav-links">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          active-class="is-active"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </header>

    <main class="page-wrap">
      <RouterView v-slot="{ Component, route }">
        <transition name="route-fade" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </RouterView>
    </main>
  </div>

  <transition name="intro-fade">
    <section v-if="showIntro" class="intro-screen" aria-label="开场动画">
      <canvas ref="introCanvas" class="intro-canvas" aria-hidden="true"></canvas>
      <div class="intro-content">
        <p>粒子正在汇聚，准备进入主页</p>
        <div class="intro-progress" role="presentation">
          <span></span>
        </div>
      </div>
    </section>
  </transition>
</template>

<style scoped lang="scss">
.layout-shell {
  min-height: 100vh;
  padding: 1.25rem 1.25rem 2rem;
  background: radial-gradient(circle at 20% 20%, #1d2555 0%, #0a0f20 45%, #060913 100%);
  color: #eaf0ff;
}

.topbar {
  width: min(980px, 92vw);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.brand {
  font-weight: 700;
  font-size: 1.05rem;
}

.nav-links {
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.nav-link {
  color: #d9e4ff;
  text-decoration: none;
  border: 1px solid rgba(217, 228, 255, 0.28);
  border-radius: 999px;
  padding: 0.28rem 0.78rem;
  font-size: 0.88rem;
}

.nav-link:hover {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.52);
}

.nav-link.is-active {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.75);
  background: rgba(123, 161, 255, 0.16);
}

.page-wrap {
  width: min(980px, 92vw);
  margin: 1.25rem auto 0;
}

.route-fade-enter-active,
.route-fade-leave-active,
.intro-fade-enter-active,
.intro-fade-leave-active {
  transition: opacity 0.32s ease;
}

.route-fade-enter-from,
.route-fade-leave-to,
.intro-fade-enter-from,
.intro-fade-leave-to {
  opacity: 0;
}

.intro-screen {
  position: fixed;
  inset: 0;
  text-align: center;
  background: linear-gradient(150deg, #04050b 0%, #121a3d 55%, #1f2d65 100%);
  overflow: hidden;
  z-index: 999;
}

.intro-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.intro-content {
  position: absolute;
  left: 50%;
  bottom: 10vh;
  transform: translateX(-50%);
  z-index: 2;
  display: grid;
  place-items: center;
  width: min(520px, 88vw);
  gap: 0.8rem;
  padding: 1rem 1.2rem;
}

.intro-screen p {
  color: rgba(234, 240, 255, 0.85);
  font-size: 0.98rem;
}

.intro-progress {
  width: min(60vw, 360px);
  height: 5px;
  margin-top: 0.7rem;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.2);
}

.intro-progress span {
  display: block;
  width: 100%;
  height: 100%;
  transform-origin: left;
  background: linear-gradient(90deg, #79a0ff 0%, #f0f6ff 100%);
  animation: loading 3s ease-out forwards;
}

@keyframes loading {
  0% {
    transform: scaleX(0);
  }

  100% {
    transform: scaleX(1);
  }
}

@media (max-width: 640px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

