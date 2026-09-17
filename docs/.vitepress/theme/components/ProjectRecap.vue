<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { conceptsById, lessonPath, lessonsById, projectConcepts, projectsBySlug } from '../../data/course-map'
const props = defineProps<{ slug: string }>()
const project = computed(() => projectsBySlug.get(props.slug))
const swift = computed(() => project.value ? projectConcepts(project.value, 'swift') : [])
const swiftui = computed(() => project.value ? projectConcepts(project.value, 'swiftui') : [])
function theory(id: string) {
  const lessonId = conceptsById.get(id)?.theoryPages[0]
  const lesson = lessonId ? lessonsById.get(lessonId) : undefined
  return lesson ? withBase(`${lessonPath(lesson)}?returnTo=${encodeURIComponent(`/projects/${props.slug}`)}`) : ''
}
</script>

<template>
  <section v-if="project" class="learning-card project-recap">
    <h2>Что ты сейчас использовал</h2>
    <div class="concept-columns">
      <div><h3><span class="concept-badge swift">Swift</span> Знакомые основы</h3><ul><li v-for="concept in swift" :key="concept.id"><a v-if="theory(concept.id)" :href="theory(concept.id)">✓ {{ concept.title }}</a><span v-else>✓ {{ concept.title }}</span></li></ul></div>
      <div><h3><span class="concept-badge swiftui">SwiftUI</span> Новое в проекте</h3><ul><li v-for="concept in swiftui" :key="concept.id">+ {{ concept.title }}</li></ul></div>
    </div>
  </section>
</template>
