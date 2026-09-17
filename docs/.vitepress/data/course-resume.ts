import { courseMap, lessonPath, projectPath, projectsBySlug, milestonesBySlug } from './course-map'

interface Progress {
  lessons: Record<string, boolean>
  projects: Record<string, boolean>
  milestones: Record<string, boolean>
}

export const courseSteps = [
  ...courseMap.learningPath.map(id => {
    const lesson = courseMap.lessons.find(item => item.id === id)
    const project = projectsBySlug.get(id)
    const milestone = milestonesBySlug.get(id)
    if (!lesson && !project && !milestone) throw new Error(`Неизвестный шаг курса: ${id}`)
    return {
      kind: lesson ? 'lessons' as const : project ? 'projects' as const : 'milestones' as const,
      id,
      path: lesson ? lessonPath(lesson) : projectPath(id),
      title: lesson?.title ?? (project ? `Project ${project.project} — ${project.title}` : milestone!.title),
      description: lesson ? 'Короткий мост к следующему проекту.' : (project || milestone)!.description,
      technologies: project?.technologies || []
    }
  })
]

export function nextCourseStep(progress: Progress) {
  return courseSteps.find(step => progress[step.kind][step.id] !== true) ?? null
}
