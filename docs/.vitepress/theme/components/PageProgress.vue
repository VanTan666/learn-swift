<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, useRoute, useRouter, withBase } from 'vitepress'
import { getCourseProgress, itemFromPath, setCompleted } from './progress'

const route = useRoute()
const router = useRouter()
const { frontmatter } = useData()
const progress = ref(getCourseProgress())
const item = computed(() => itemFromPath(route.path))
const isCompleted = computed(() => Boolean(item.value && progress.value[item.value.kind][item.value.id]))
const idleLabel = computed(() => item.value?.kind === 'projects' ? 'Завершить проект' : item.value?.kind === 'milestones' ? 'Завершить контрольную' : 'Отметить как пройденное')
const doneLabel = computed(() => item.value?.kind === 'projects' ? 'Проект завершён' : item.value?.kind === 'milestones' ? 'Контрольная завершена' : 'Урок пройден')

function refresh() { progress.value = getCourseProgress() }
function toggle() {
  if (!item.value) return
  setCompleted(item.value.kind, item.value.id, !isCompleted.value)
  refresh()
}
function handleKeydown(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  const target = event.target as HTMLElement | null
  if (target?.matches('input, textarea, select, [contenteditable="true"]')) return
  if (event.key === 'ArrowLeft' && frontmatter.value.prev?.link) router.go(withBase(frontmatter.value.prev.link))
  if (event.key === 'ArrowRight' && frontmatter.value.next?.link) router.go(withBase(frontmatter.value.next.link))
}

onMounted(() => {
  refresh()
  window.addEventListener('swift-progress-change', refresh)
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('swift-progress-change', refresh)
  window.removeEventListener('keydown', handleKeydown)
})
watch(() => route.path, refresh)
</script>

<template>
  <div v-if="item" class="page-progress">
    <button type="button" :class="{ completed: isCompleted }" @click="toggle">
      <span aria-hidden="true">{{ isCompleted ? '✓' : '○' }}</span>
      {{ isCompleted ? doneLabel : idleLabel }}
    </button>
    <p>Переход между соседними страницами: <kbd>←</kbd> и <kbd>→</kbd> вне полей ввода.</p>
  </div>
</template>
