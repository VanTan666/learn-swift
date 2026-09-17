<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { conceptsById, projectPath, projectsForConcept } from '../../data/course-map'
const props = defineProps<{ concept: string; limit?: number }>()
const concept = computed(() => conceptsById.get(props.concept))
const projects = computed(() => projectsForConcept(props.concept).slice(0, props.limit ?? 3))
</script>

<template>
  <section v-if="concept && projects.length" class="learning-card theory-applications">
    <small>🛠 Посмотреть применение</small><h2>Где это используется?</h2>
    <p><strong>{{ concept.title }}</strong> становится частью настоящего интерфейса уже в первых проектах.</p>
    <ul><li v-for="project in projects" :key="project.slug"><a :href="withBase(`${projectPath(project.slug)}${project.anchors?.[concept.id] ? `#${project.anchors[concept.id]}` : ''}`)">Project {{ project.project }} — {{ project.title }} →</a><span>{{ project.description }}</span></li></ul>
  </section>
</template>
