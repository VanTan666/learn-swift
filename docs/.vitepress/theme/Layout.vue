<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import Breadcrumb from './components/Breadcrumb.vue'
import PageProgress from './components/PageProgress.vue'
import ProgressPanel from './components/ProgressPanel.vue'
import RelatedContent from './components/RelatedContent.vue'
import ReturnToProject from './components/ReturnToProject.vue'
import ThemeSelect from './components/ThemeSelect.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <ThemeSelect />
    </template>
    <template #sidebar-nav-before>
      <ProgressPanel />
    </template>
    <template #doc-before>
      <ReturnToProject />
      <Breadcrumb />
    </template>
    <template #doc-after>
      <RelatedContent />
      <PageProgress />
    </template>
  </Layout>
</template>
