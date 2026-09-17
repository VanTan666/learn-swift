<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { conceptsById, lessonsById, lessonPath } from '../../data/course-map'

const props = defineProps<{ familiar: string[]; fresh: string[]; returnTo?: string }>()
const familiarConcepts = computed(() => props.familiar.map((id) => conceptsById.get(id)).filter(Boolean))
const freshConcepts = computed(() => props.fresh.map((id) => conceptsById.get(id)).filter(Boolean))
function theoryLink(id: string) {
  const lesson = conceptsById.get(id)?.theoryPages[0]
  const page = lesson ? lessonsById.get(lesson) : undefined
  if (!page) return undefined
  const suffix = props.returnTo ? `?returnTo=${encodeURIComponent(props.returnTo)}` : ''
  return withBase(`${lessonPath(page)}${suffix}`)
}
</script>

<template>
  <section class="learning-card familiar-new">
    <h3>🧠 Разберём через знакомое</h3>
    <div class="concept-columns">
      <div><h4>Уже знакомо</h4><ul><li v-for="concept in familiarConcepts" :key="concept!.id"><span class="concept-badge swift">Swift</span><a v-if="theoryLink(concept!.id)" :href="theoryLink(concept!.id)">✓ {{ concept!.title }}</a><span v-else>✓ {{ concept!.title }}</span></li></ul></div>
      <div><h4>Новое</h4><ul><li v-for="concept in freshConcepts" :key="concept!.id"><span class="concept-badge swiftui">SwiftUI</span>→ {{ concept!.title }}</li></ul></div>
    </div>
  </section>
</template>
