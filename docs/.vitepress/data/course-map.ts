import rawCourseMap from './course-map.json'

export type ConceptSource = 'swift' | 'swiftui'
export type CourseKind = 'lesson' | 'project' | 'milestone'

export interface Lesson {
  id: string
  slug: string
  title: string
  section: string
}

export interface Project {
  slug: string
  project: number
  title: string
  group: string
  difficulty: string
  description: string
  technologies: string[]
  prerequisites: string[]
  concepts: string[]
  anchors?: Record<string, string>
}

export interface Milestone {
  slug: string
  title: string
  group: string
  description: string
  prerequisites: string[]
  concepts: string[]
}

export interface CourseConcept {
  id: string
  title: string
  source: ConceptSource
  theoryPages: string[]
}

export const courseMap = rawCourseMap as {
  lessons: Lesson[]
  learningPath: string[]
  groups: { id: string; title: string; items: string[] }[]
  projects: Project[]
  milestones: Milestone[]
  concepts: CourseConcept[]
}

export const lessonPath = (lesson: Lesson) => `/swift/${lesson.slug}`
export const projectPath = (slug: string) => `/projects/${slug}`

export const lessonsById = new Map(courseMap.lessons.map((lesson) => [lesson.id, lesson]))
export const projectsBySlug = new Map(courseMap.projects.map((project) => [project.slug, project]))
export const milestonesBySlug = new Map(courseMap.milestones.map((milestone) => [milestone.slug, milestone]))
export const conceptsById = new Map(courseMap.concepts.map((concept) => [concept.id, concept]))

export function projectsForConcept(conceptId: string) {
  return courseMap.projects.filter((project) => project.concepts.includes(conceptId))
}

export function projectConcepts(project: Project, source?: ConceptSource) {
  return project.concepts
    .map((id) => conceptsById.get(id))
    .filter((concept): concept is CourseConcept => Boolean(concept && (!source || concept.source === source)))
}

export function orderedProjectContent() {
  return courseMap.groups.flatMap((group) => group.items)
}
