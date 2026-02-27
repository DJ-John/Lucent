<script setup lang="ts">
const avatarSrc = '/avatar.png'
const homeLine = '西格玛四：真是吵闹啊！'
</script>

<template>
  <section class="home-page" aria-label="home">
    <img class="avatar" :src="avatarSrc" alt="avatar" />
    <p class="home-line">{{ homeLine }}</p>
  </section>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  gap: 0;
  padding: 1.25rem;
}

.avatar {
  width: clamp(96px, 16vw, 156px);
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 24px rgba(27, 37, 64, 0.2);
}

.home-line {
  margin: -0.25rem 0 0;
  color: #1b2540;
  font-size: clamp(1.3rem, 3.5vw, 2.3rem);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-align: center;
}
</style>
