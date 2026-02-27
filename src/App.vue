<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { RouterView } from 'vue-router'

const INTRO_GLYPH = '\u7d77'
const INTRO_FONT_FAMILY = '"STXingkai", "STLiti", "FZShuTi", "Kaiti SC", "KaiTi", "Noto Serif SC", serif'
const splitDuration = 2200

const showIntro = ref(true)
const isSplitting = ref(false)

let splitTimer: number | null = null

const handleSealClick = (): void => {
  if (isSplitting.value) {
    return
  }

  isSplitting.value = true
  splitTimer = window.setTimeout(() => {
    showIntro.value = false
    splitTimer = null
  }, splitDuration)
}

onBeforeUnmount(() => {
  if (splitTimer) {
    window.clearTimeout(splitTimer)
  }
})
</script>

<template>
  <div class="layout-shell">
    <main class="page-wrap">
      <RouterView />
    </main>
  </div>

  <transition name="intro-fade">
    <section
      v-if="showIntro"
      class="seal-screen"
      :class="{ 'is-splitting': isSplitting }"
      aria-label="intro overlay"
    >
      <div class="split-panel split-left"></div>
      <div class="split-panel split-right"></div>
      <div class="split-crack" aria-hidden="true"></div>

      <button
        type="button"
        class="seal-trigger"
        :disabled="isSplitting"
        aria-label="click glyph to enter home"
        @click="handleSealClick"
      >
        <span class="seal-ring inner-ring" aria-hidden="true"></span>
        <span class="seal-ring outer-ring" aria-hidden="true"></span>
        <span class="seal-glyph">{{ INTRO_GLYPH }}</span>
      </button>
    </section>
  </transition>
</template>

<style scoped lang="scss">
.layout-shell {
  min-height: 100vh;
  background: radial-gradient(circle at 20% 16%, #f8fbff 0%, #edf3ff 44%, #dde7ff 100%);
  color: #1b2540;
}

.page-wrap {
  min-height: 100vh;
}

.intro-fade-enter-active,
.intro-fade-leave-active {
  transition: opacity 0.4s ease;
}

.intro-fade-enter-from,
.intro-fade-leave-to {
  opacity: 0;
}

.seal-screen {
  position: fixed;
  inset: 0;
  z-index: 999;
  overflow: hidden;
  display: grid;
  place-items: center;
}

.split-panel {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50.2%;
  background: #111a3b;
  transition: transform 2s cubic-bezier(0.22, 0.82, 0.2, 1);
}

.split-left {
  left: 0;
  transform-origin: left center;
}

.split-right {
  right: 0;
  transform-origin: right center;
}

.split-crack {
  position: absolute;
  left: 50%;
  top: 0;
  width: 2px;
  height: 100%;
  transform: translateX(-50%);
  opacity: 0;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0),
    rgba(142, 189, 255, 0.95) 25%,
    rgba(226, 240, 255, 0.95) 50%,
    rgba(142, 189, 255, 0.95) 75%,
    rgba(255, 255, 255, 0)
  );
}

.seal-trigger {
  position: relative;
  z-index: 2;
  width: min(54vw, 300px);
  aspect-ratio: 1;
  border: none;
  padding: 0;
  display: grid;
  place-items: center;
  background: transparent;
  cursor: pointer;
  overflow: visible;
  isolation: isolate;
}

.seal-ring {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
}

.inner-ring {
  inset: 12%;
  border: 2px solid rgba(170, 239, 255, 0.48);
  box-shadow:
    0 0 8px rgba(163, 236, 255, 0.5),
    0 0 18px rgba(99, 219, 255, 0.28),
    inset 0 0 10px rgba(211, 250, 255, 0.2);
}

.outer-ring {
  inset: -2%;
  border: 1.8px solid rgba(156, 189, 255, 0.4);
  box-shadow: 0 0 12px 2px rgba(118, 162, 255, 0.22);
  animation: outer-ring-breath 3.2s ease-in-out infinite;
}

.seal-glyph {
  position: relative;
  z-index: 2;
  color: #f2dfbf;
  font-family: v-bind(INTRO_FONT_FAMILY);
  font-size: clamp(7rem, 17vw, 12rem);
  line-height: 1;
  text-shadow:
    0 0 12px rgba(255, 232, 196, 0.65),
    0 0 28px rgba(128, 173, 243, 0.5),
    0 0 48px rgba(128, 173, 243, 0.36);
}

.seal-screen.is-splitting .split-left {
  transform: translateX(-100%) scaleX(0.14);
}

.seal-screen.is-splitting .split-right {
  transform: translateX(100%) scaleX(0.14);
}

.seal-screen.is-splitting .split-crack {
  animation: crack-flash 0.8s ease-out forwards;
}

.seal-screen.is-splitting .seal-trigger {
  animation: glyph-fade 0.3s ease forwards;
}

@keyframes crack-flash {
  0% {
    opacity: 0;
  }

  20% {
    opacity: 0.95;
  }

  100% {
    opacity: 0;
  }
}

@keyframes glyph-fade {
  to {
    opacity: 0;
    transform: scale(1.06);
  }
}

@keyframes outer-ring-breath {
  0%,
  100% {
    box-shadow: 0 0 12px 2px rgba(118, 162, 255, 0.2);
  }

  50% {
    box-shadow: 0 0 30px 12px rgba(118, 162, 255, 0.26);
  }
}
</style>
