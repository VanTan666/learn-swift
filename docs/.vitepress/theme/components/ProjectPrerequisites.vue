<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { lessonsById, projectsBySlug, lessonPath } from '../../data/course-map'
import { getCourseProgress } from './progress'

const props = defineProps<{ slug: string }>()
const project = computed(() => projectsBySlug.get(props.slug))
const progress = ref(getCourseProgress())
const done = computed(() => project.value?.prerequisites.filter((id) => progress.value.lessons[id]).length ?? 0)
const percent = computed(() => project.value ? Math.round(done.value / project.value.prerequisites.length * 100) : 0)
function refresh() { progress.value = getCourseProgress() }
onMounted(() => window.addEventListener('swift-progress-change', refresh))
onBeforeUnmount(() => window.removeEventListener('swift-progress-change', refresh))
</script>

<template>
  <section v-if="project" class="learning-card prerequisites">
    <div class="card-heading"><div><small>Перед началом</small><h2>Готовность к проекту</h2></div><strong>{{ percent }}%</strong></div>
    <div class="progress-track"><span :style="{ width: `${percent}%` }" /></div>
    <p>{{ done }} из {{ project.prerequisites.length }} рекомендуемых тем изучено. Проект всегда доступен — это не ограничение.</p>
    <ul class="prerequisite-list">
      <li v-for="id in project.prerequisites" :key="id">
        <span :class="{ done: progress.lessons[id] }">{{ progress.lessons[id] ? '✓' : '○' }}</span>
        <a v-if="lessonsById.get(id)" :href="withBase(`${lessonPath(lessonsById.get(id)!)}?returnTo=${encodeURIComponent(`/projects/${slug}`)}`)">{{ lessonsById.get(id)?.title }}</a>
      </li>
    </ul>
  </section>
</template>
