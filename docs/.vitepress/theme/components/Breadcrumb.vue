<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import { courseMap, lessonsById, milestonesBySlug, projectsBySlug } from '../../data/course-map'

const route = useRoute()
const crumbs = computed(() => {
  const lessonId = route.path.match(/day-\d{3}/)?.[0]
  if (lessonId) {
    const lesson = lessonsById.get(lessonId)
    return lesson ? [lesson.section, lessonId === 'day-000' ? 'Введение' : `День ${Number(lessonId.slice(-3))}`, lesson.title.replace(/^День \d+ — /, '')] : []
  }
  const slug = route.path.match(/(?:project-\d{2}-[a-z0-9-]+|milestone-(?:\d{2}-\d{2}|final))/)?.[0]
  const item = slug ? projectsBySlug.get(slug) ?? milestonesBySlug.get(slug) : undefined
  if (!item) return []
  const group = courseMap.groups.find((candidate) => candidate.id === item.group)
  const project = 'project' in item ? `Project ${item.project}` : 'Контрольная'
  return ['100 Days of SwiftUI', group?.title ?? 'SwiftUI', project, item.title.replace(/^Контрольная: /, '')]
})
</script>

<template>
  <nav v-if="crumbs.length" class="breadcrumb" aria-label="Хлебные крошки">
    <template v-for="(crumb, index) in crumbs" :key="`${crumb}-${index}`">
      <span v-if="index" aria-hidden="true">/</span><strong v-if="index === crumbs.length - 1">{{ crumb }}</strong><span v-else>{{ crumb }}</span>
    </template>
  </nav>
</template>
