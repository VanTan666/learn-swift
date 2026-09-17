import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import test from 'node:test'
import { build } from 'esbuild'

const compiled = await build({ entryPoints: ['docs/.vitepress/data/course-resume.ts'], bundle: true, platform: 'node', format: 'esm', write: false })
const { nextCourseStep, courseSteps } = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].text).toString('base64'))
const empty = () => ({ lessons: {}, projects: {}, milestones: {} })

test('новый ученик начинает с первого урока, после десяти уроков — с дня 11', () => {
  const progress = empty()
  assert.equal(nextCourseStep(progress).path, '/swift/day-001-first-steps')
  for (let day=1; day<=10; day++) progress.lessons[`day-${String(day).padStart(3,'0')}`] = true
  assert.equal(nextCourseStep(progress).path, '/swift/day-011-structs-part2')
})

test('пропущенный урок не теряется при отметках более поздних уроков', () => {
  const progress = empty()
  progress.lessons = {'day-001':true, 'day-002':false, 'day-003':true, 'day-015':true}
  assert.equal(nextCourseStep(progress).id, 'day-002')
})

test('после основ сразу идёт WeSplit, затем testing появляется после первой контрольной', () => {
  const progress = empty()
  for (let day=1; day<=15; day++) progress.lessons[`day-${String(day).padStart(3,'0')}`] = true
  assert.equal(nextCourseStep(progress).id, 'project-01-wesplit')
  for (const id of ['project-01-wesplit','project-02-guess-the-flag','project-03-views-and-modifiers']) progress.projects[id] = true
  assert.equal(nextCourseStep(progress).id, 'milestone-01-03')
  progress.milestones['milestone-01-03'] = true
  assert.equal(nextCourseStep(progress).id, 'day-017')
})

test('мосты Observation, generics и async/await стоят прямо перед нужными проектами', () => {
  const index = id => courseSteps.findIndex(step => step.id === id)
  assert.equal(index('day-019') + 1, index('project-07-iexpense'))
  assert.equal(index('day-018') + 1, index('project-08-moonshot'))
  assert.equal(index('day-016') + 1, index('project-10-cupcake-corner'))
  assert.ok(index('day-020') > index('project-10-cupcake-corner'))
})

test('полностью пройденный курс не отправляет снова на первый шаг', () => {
  const progress = empty()
  assert.equal(courseSteps.length, 44)
  for (const step of courseSteps) progress[step.kind][step.id] = true
  assert.equal(nextCourseStep(progress), null)
})
