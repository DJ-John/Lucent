<script setup lang="ts">
const homeLine = '西格玛四：真是吵闹啊！'
</script>

<template>
  <section class="home-page" aria-label="home">
    <p class="home-line">{{ homeLine }}</p>
  </section>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.25rem;
}

.home-line {
  margin: 0;
  color: #1b2540;
  font-size: clamp(1.3rem, 3.5vw, 2.3rem);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-align: center;
}
</style>
