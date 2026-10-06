import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import Checkpoint from './components/Checkpoint.vue'
import Challenge from './components/Challenge.vue'
import CourseDashboard from './components/CourseDashboard.vue'
import CourseContinue from './components/CourseContinue.vue'
import CourseMapView from './components/CourseMapView.vue'
import FamiliarNew from './components/FamiliarNew.vue'
import ProjectGrid from './components/ProjectGrid.vue'
import ProjectPrerequisites from './components/ProjectPrerequisites.vue'
import ProjectRecap from './components/ProjectRecap.vue'
import TheoryApplications from './components/TheoryApplications.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router }) {
    if (typeof window !== 'undefined') {
      const metricaWindow = window as Window & {
        ym?: (counterId: number, method: string, url: string, options: { referer: string; title: string }) => void
      }
      let previousUrl = window.location.href
      router.onAfterRouteChange = (to) => {
        const nextUrl = new URL(to, window.location.origin).href
        if (nextUrl === previousUrl) return
        metricaWindow.ym?.(113463034, 'hit', nextUrl, {
          referer: previousUrl,
          title: document.title
        })
        previousUrl = nextUrl
      }
    }
    app.component('Checkpoint', Checkpoint)
    app.component('Challenge', Challenge)
    app.component('CourseDashboard', CourseDashboard)
    app.component('CourseContinue', CourseContinue)
    app.component('CourseMapView', CourseMapView)
    app.component('FamiliarNew', FamiliarNew)
    app.component('ProjectGrid', ProjectGrid)
    app.component('ProjectPrerequisites', ProjectPrerequisites)
    app.component('ProjectRecap', ProjectRecap)
    app.component('TheoryApplications', TheoryApplications)
  }
} satisfies Theme
