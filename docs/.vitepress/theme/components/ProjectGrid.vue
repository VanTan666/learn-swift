<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { courseMap, projectPath } from '../../data/course-map'
import { getCourseProgress } from './progress'
const progress = ref(getCourseProgress())
const groups = computed(() => courseMap.groups.map((group) => ({ ...group, projects: courseMap.projects.filter((project) => project.group === group.id), milestone: courseMap.milestones.find((item) => item.group === group.id) })))
function readiness(ids: string[]) { return ids.filter((id) => progress.value.lessons[id]).length }
function refresh() { progress.value = getCourseProgress() }
onMounted(() => window.addEventListener('swift-progress-change', refresh))
onBeforeUnmount(() => window.removeEventListener('swift-progress-change', refresh))
</script>

<template>
  <div class="project-groups">
    <section v-for="group in groups" :key="group.id" class="project-group">
      <h2>{{ group.title }}</h2><div class="project-grid">
        <article v-for="project in group.projects" :key="project.slug" class="project-card" :class="{ completed: progress.projects[project.slug] }">
          <div class="project-card-top"><span>Project {{ project.project }}</span><span>{{ progress.projects[project.slug] ? '✓ Завершён' : project.difficulty === 'beginner' ? 'Начальный' : project.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый' }}</span></div>
          <h3>{{ project.title }}</h3><p>{{ project.description }}</p><div class="tech-list"><span v-for="tech in project.technologies" :key="tech">{{ tech }}</span></div>
          <small>{{ readiness(project.prerequisites) }} / {{ project.prerequisites.length }} предварительных тем изучено</small><a :href="withBase(projectPath(project.slug))">{{ progress.projects[project.slug] ? 'Открыть снова' : 'Начать проект' }} →</a>
        </article>
        <article v-if="group.milestone" class="project-card milestone-card"><div class="project-card-top"><span>◇ Контрольная</span><span>{{ progress.milestones[group.milestone.slug] ? '✓ Завершена' : 'Проверка навыков' }}</span></div><h3>{{ group.milestone.title.replace('Контрольная: ', '') }}</h3><p>{{ group.milestone.description }}</p><a :href="withBase(projectPath(group.milestone.slug))">Перейти к заданию →</a></article>
      </div>
    </section>
  </div>
</template>
