<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { courseMap, projectPath } from '../../data/course-map'
import { nextCourseStep } from '../../data/course-resume'
import { getCourseProgress, progressCount } from './progress'
const progress = ref(getCourseProgress())
const lessonIds = courseMap.lessons.filter((lesson) => lesson.section === 'Основы Swift').map((lesson) => lesson.id)
const bridgeLessons: Record<string, string[]> = {
  'expanding-skills': ['day-017'],
  'scaling-up': ['day-019', 'day-018'],
  'focus-on-data': ['day-016', 'day-020']
}
const stages = computed(() => [
  { title: '① Основы Swift', done: progressCount(progress.value.lessons, lessonIds), total: lessonIds.length, link: '/swift/day-001-first-steps' },
  ...courseMap.groups.map((group, index) => {
    const projects = courseMap.projects.filter((project) => project.group === group.id)
    const milestone = courseMap.milestones.find((item) => item.group === group.id)
    const bridges = bridgeLessons[group.id] ?? []
    const done = projects.filter((project) => progress.value.projects[project.slug]).length
      + (milestone && progress.value.milestones[milestone.slug] ? 1 : 0)
      + progressCount(progress.value.lessons, bridges)
    return { title: `${index === 0 ? '②' : index + 2 + '.'} ${group.title}`, done, total: projects.length + 1 + bridges.length, link: projectPath(projects[0].slug) }
  })
])
const nextStep = computed(() => nextCourseStep(progress.value))
const ready = ref(false)
function refresh() { progress.value = getCourseProgress() }
onMounted(() => {
  window.addEventListener('swift-progress-change', refresh)
  refresh(); ready.value = true
})
onBeforeUnmount(() => window.removeEventListener('swift-progress-change', refresh))
</script>

<template>
  <div class="course-dashboard">
    <section class="journey"><h2>Твой путь в iOS</h2><div v-for="(stage, index) in stages" :key="stage.title" class="journey-step"><a :href="withBase(stage.link)"><strong>{{ stage.title }}</strong><span>{{ stage.done }} / {{ stage.total }}</span></a><div class="progress-track"><span :style="{ width: `${Math.round(stage.done / stage.total * 100)}%` }" /></div><div v-if="index < stages.length - 1" class="journey-arrow">↓</div></div></section>
    <section class="continue-card">
      <template v-if="!ready"><p role="status">Загружаем твой прогресс…</p></template>
      <template v-else-if="nextStep"><small>Продолжить обучение</small><h2>{{ nextStep.title }}</h2><p>{{ nextStep.description }}</p><template v-if="nextStep.technologies.length"><h3>Научишься</h3><div class="tech-list"><span v-for="tech in nextStep.technologies" :key="tech">{{ tech }}</span></div></template><a class="cta-button" :href="withBase('/continue')">Продолжить →</a></template>
      <template v-else><small>Курс завершён</small><h2>Все шаги пройдены!</h2><p>Можно вернуться к любой теме или повторить практику.</p><a class="cta-button" :href="withBase('/course-map')">Открыть карту курса →</a></template>
    </section>
  </div>
</template>
