<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
const returnTo = ref('')
onMounted(() => {
  const value = new window.URLSearchParams(window.location.search).get('returnTo') ?? ''
  if (/^\/projects\/[a-z0-9-]+(?:#[a-z0-9-]+)?$/.test(value)) returnTo.value = value
})
</script>
<template><a v-if="returnTo" class="return-to-project" :href="withBase(returnTo)">← Вернуться в проект</a></template>
