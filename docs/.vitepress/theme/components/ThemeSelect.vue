<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

type Theme = 'system' | 'light' | 'dark'
const KEY = 'swift-ru-theme-v1'
const theme = ref<Theme>('system')
let media: MediaQueryList | undefined

function apply() {
  const dark = theme.value === 'dark' || (theme.value === 'system' && media?.matches)
  document.documentElement.classList.toggle('dark', Boolean(dark))
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  localStorage.setItem(KEY, theme.value)
}

function systemChanged() {
  if (theme.value === 'system') apply()
}

onMounted(() => {
  media = window.matchMedia('(prefers-color-scheme: dark)')
  const saved = localStorage.getItem(KEY)
  theme.value = saved === 'light' || saved === 'dark' ? saved : 'system'
  media.addEventListener('change', systemChanged)
  apply()
})

onBeforeUnmount(() => media?.removeEventListener('change', systemChanged))
</script>

<template>
  <label class="theme-select">
    <span class="sr-only">Цветовая тема</span>
    <select v-model="theme" aria-label="Цветовая тема" @change="apply">
      <option value="system">Системная</option>
      <option value="light">Светлая</option>
      <option value="dark">Тёмная</option>
    </select>
  </label>
</template>
