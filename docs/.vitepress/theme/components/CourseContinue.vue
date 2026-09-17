<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, withBase } from 'vitepress'
import { nextCourseStep } from '../../data/course-resume'
import { getCourseProgress } from './progress'
const router = useRouter()
const error = ref('')
onMounted(async () => {
  await router.go(withBase(nextCourseStep(getCourseProgress())?.path ?? '/learn'))
})
</script>
<template>
  <div class="continue-loading" role="status">
    <p>{{ error || 'Открываем твой следующий шаг…' }}</p>
    <a v-if="error" :href="withBase('/learn')">Открыть учебный маршрут</a>
  </div>
</template>
<style scoped>
.continue-loading{padding:100px 24px;text-align:center;color:var(--vp-c-text-2)}.continue-loading a{display:inline-block;margin-top:20px;color:var(--vp-c-brand-1)}
</style>
