<script setup lang="ts">
import { withBase } from 'vitepress'
import { courseMap, lessonPath, lessonsById, projectPath, projectsForConcept } from '../../data/course-map'
const featured = ['arrays', 'closures', 'structs', 'computed-properties', 'protocols', 'optionals', 'state', 'navigation', 'swiftdata', 'accessibility']
</script>
<template><div class="concept-map"><article v-for="id in featured" :key="id" class="concept-chain"><div><span :class="['concept-badge', courseMap.concepts.find((item) => item.id === id)?.source]">{{ courseMap.concepts.find((item) => item.id === id)?.source === 'swift' ? 'Swift' : 'SwiftUI' }}</span><h2>{{ courseMap.concepts.find((item) => item.id === id)?.title }}</h2></div><div class="chain-arrow">↓</div><div class="chain-links"><a v-for="lessonId in courseMap.concepts.find((item) => item.id === id)?.theoryPages" :key="lessonId" :href="withBase(lessonPath(lessonsById.get(lessonId)!))">{{ lessonsById.get(lessonId)?.title }}</a><a v-for="project in projectsForConcept(id).slice(0, 5)" :key="project.slug" :href="withBase(projectPath(project.slug))">Project {{ project.project }} — {{ project.title }}</a></div></article></div></template>
