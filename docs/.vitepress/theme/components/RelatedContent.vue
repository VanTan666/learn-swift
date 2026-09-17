<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { courseMap, lessonPath, lessonsById, milestonesBySlug, orderedProjectContent, projectPath, projectConcepts, projectsBySlug, projectsForConcept } from '../../data/course-map'

const route = useRoute()
const lessonId = computed(() => route.path.match(/day-\d{3}/)?.[0])
const itemSlug = computed(() => route.path.match(/(?:project-\d{2}-[a-z0-9-]+|milestone-(?:\d{2}-\d{2}|final))/)?.[0])
const project = computed(() => itemSlug.value ? projectsBySlug.get(itemSlug.value) : undefined)
const relatedTheory = computed(() => project.value ? [...new Set(projectConcepts(project.value, 'swift').flatMap((concept) => concept.theoryPages))].slice(0, 6) : [])
const relatedProjects = computed(() => {
  if (!lessonId.value) return []
  const conceptIds = courseMap.concepts.filter((concept) => concept.theoryPages.includes(lessonId.value!)).map((concept) => concept.id)
  return [...new Map(conceptIds.flatMap(projectsForConcept).map((item) => [item.slug, item])).values()].slice(0, 5)
})
const next = computed(() => {
  if (!itemSlug.value) return undefined
  const order = orderedProjectContent()
  const nextSlug = order[order.indexOf(itemSlug.value) + 1]
  return nextSlug ? projectsBySlug.get(nextSlug) ?? milestonesBySlug.get(nextSlug) : undefined
})
</script>

<template>
  <section v-if="lessonId || itemSlug" class="related-content">
    <h2>Связанные материалы</h2>
    <div v-if="relatedTheory.length"><h3>Повторить теорию</h3><ul><li v-for="id in relatedTheory" :key="id"><a v-if="lessonsById.get(id)" :href="withBase(`${lessonPath(lessonsById.get(id)!)}?returnTo=${encodeURIComponent(route.path.replace(/^\/learn-swift/, ''))}`)">{{ lessonsById.get(id)?.title }} →</a></li></ul></div>
    <div v-if="relatedProjects.length"><h3>Используется в проектах</h3><ul><li v-for="item in relatedProjects" :key="item.slug"><a :href="withBase(projectPath(item.slug))">Project {{ item.project }} — {{ item.title }} →</a></li></ul></div>
    <div v-if="next"><h3>Дальше</h3><a class="next-course-card" :href="withBase(projectPath(next.slug))">{{ 'project' in next ? `Project ${next.project} — ${next.title}` : next.title }} →</a></div>
  </section>
</template>
