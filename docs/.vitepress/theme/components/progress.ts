import { courseMap } from '../../data/course-map'

export const LEGACY_STORAGE_KEY = 'swift-ru-progress-v1'
export const STORAGE_KEY = 'swift-ru-course-progress-v2'
export const TOTAL_LESSONS = courseMap.lessons.filter((lesson) => lesson.id !== 'day-000').length
export const TOTAL_PROJECTS = courseMap.projects.length
export const TOTAL_MILESTONES = courseMap.milestones.length

export interface CourseProgress {
  lessons: Record<string, boolean>
  projects: Record<string, boolean>
  milestones: Record<string, boolean>
}

export const emptyProgress = (): CourseProgress => ({ lessons: {}, projects: {}, milestones: {} })

export function getCourseProgress(): CourseProgress {
  if (typeof window === 'undefined') return emptyProgress()
  const progress = emptyProgress()

  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    if (stored && typeof stored === 'object') {
      for (const kind of ['lessons', 'projects', 'milestones'] as const) {
        const values = (stored as Partial<CourseProgress>)[kind]
        if (values && typeof values === 'object') progress[kind] = { ...values }
      }
    }
  } catch { /* повреждённое значение не должно ломать курс */ }

  try {
    const legacy: unknown = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) ?? '[]')
    if (Array.isArray(legacy)) {
      for (const id of legacy) if (typeof id === 'string') progress.lessons[id] = true
    }
  } catch { /* совместимость best effort */ }

  return progress
}

export function saveCourseProgress(progress: CourseProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  const legacyLessons = Object.entries(progress.lessons).filter(([, done]) => done).map(([id]) => id)
  localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacyLessons))
  window.dispatchEvent(new CustomEvent('swift-progress-change'))
}

export function setCompleted(kind: keyof CourseProgress, id: string, completed: boolean) {
  const progress = getCourseProgress()
  progress[kind][id] = completed
  saveCourseProgress(progress)
}

export function getProgress(): Set<string> {
  return new Set(Object.entries(getCourseProgress().lessons).filter(([, done]) => done).map(([id]) => id))
}

export function saveProgress(lessons: Set<string>) {
  const progress = getCourseProgress()
  progress.lessons = Object.fromEntries([...lessons].map((id) => [id, true]))
  saveCourseProgress(progress)
}

export function itemFromPath(path: string): { kind: keyof CourseProgress; id: string } | null {
  const lesson = path.match(/day-\d{3}/)?.[0]
  if (lesson) return { kind: 'lessons', id: lesson }
  const project = path.match(/project-\d{2}-[a-z0-9-]+/)?.[0]
  if (project) return { kind: 'projects', id: project }
  const milestone = path.match(/milestone-(?:\d{2}-\d{2}|final)/)?.[0]
  if (milestone) return { kind: 'milestones', id: milestone }
  return null
}

export function lessonIdFromPath(path: string) {
  return path.match(/day-\d{3}/)?.[0] ?? null
}

export function progressCount(values: Record<string, boolean>, allowed?: string[]) {
  const ids = allowed ?? Object.keys(values)
  return ids.filter((id) => values[id]).length
}

export function decorateSidebar(progress = getCourseProgress()) {
  document.querySelectorAll<HTMLAnchorElement>('.VPSidebarItem a').forEach((link) => {
    const item = itemFromPath(link.getAttribute('href') ?? '')
    link.classList.toggle('course-complete', Boolean(item && progress[item.kind][item.id]))
  })
}
