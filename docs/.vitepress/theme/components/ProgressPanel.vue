<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import { courseMap } from '../../data/course-map'
import { decorateSidebar, getCourseProgress, progressCount, saveCourseProgress, TOTAL_LESSONS, TOTAL_MILESTONES, TOTAL_PROJECTS } from './progress'

const route = useRoute()
const progress = ref(getCourseProgress())
const lessonIds = courseMap.lessons.filter((lesson) => lesson.id !== 'day-000').map((lesson) => lesson.id)
const projectIds = courseMap.projects.map((project) => project.slug)
const milestoneIds = courseMap.milestones.map((milestone) => milestone.slug)
const lessonsDone = computed(() => progressCount(progress.value.lessons, lessonIds))
const projectsDone = computed(() => progressCount(progress.value.projects, projectIds))
const milestonesDone = computed(() => progressCount(progress.value.milestones, milestoneIds))
const done = computed(() => lessonsDone.value + projectsDone.value + milestonesDone.value)
const total = TOTAL_LESSONS + TOTAL_PROJECTS + TOTAL_MILESTONES
const percentage = computed(() => Math.round(done.value / total * 100))

function refresh() {
  progress.value = getCourseProgress()
  nextTick(() => decorateSidebar(progress.value))
}
function reset() {
  if (!window.confirm('Сбросить прогресс уроков, проектов и milestones?')) return
  saveCourseProgress({ lessons: {}, projects: {}, milestones: {} })
}
onMounted(() => {
  refresh()
  window.addEventListener('swift-progress-change', refresh)
  window.addEventListener('storage', refresh)
})
onBeforeUnmount(() => {
  window.removeEventListener('swift-progress-change', refresh)
  window.removeEventListener('storage', refresh)
})
watch(() => route.path, refresh)
</script>

<template>
  <section class="progress-panel" aria-label="Прогресс курса">
    <div class="progress-heading"><strong>{{ done }} / {{ total }}</strong><span>{{ percentage }}%</span></div>
    <div class="progress-track" role="progressbar" :aria-valuenow="percentage" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: `${percentage}%` }" /></div>
    <div class="progress-breakdown">
      <span>Swift {{ lessonsDone }}/{{ TOTAL_LESSONS }}</span>
      <span>Проекты {{ projectsDone }}/{{ TOTAL_PROJECTS }}</span>
      <span>Контрольные {{ milestonesDone }}/{{ TOTAL_MILESTONES }}</span>
    </div>
    <details class="progress-settings"><summary>Настройки</summary><button type="button" @click="reset">Сбросить прогресс</button></details>
  </section>
</template>
