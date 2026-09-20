import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const docs = resolve(root, 'docs')
const map = JSON.parse(readFileSync(resolve(docs, '.vitepress/data/course-map.json'), 'utf8'))
const errors = []
const fail = (message) => errors.push(`❌ ${message}`)
const duplicates = (values) => values.filter((value, index) => values.indexOf(value) !== index)

const lessonIds = new Set(map.lessons.map((item) => item.id))
const projectSlugs = new Set(map.projects.map((item) => item.slug))
const milestoneSlugs = new Set(map.milestones.map((item) => item.slug))
const contentSlugs = new Set([...projectSlugs, ...milestoneSlugs])
const conceptIds = new Set(map.concepts.map((item) => item.id))
const groupIds = new Set(map.groups.map((item) => item.id))

for (const [label, values] of [
  ['lesson id', [...lessonIds]], ['project slug', [...projectSlugs]],
  ['milestone slug', [...milestoneSlugs]], ['concept id', [...conceptIds]]
]) {
  for (const value of duplicates(values)) fail(`повторяется ${label}: ${value}`)
}

for (let day = 0; day <= 15; day += 1) {
  const id = `day-${String(day).padStart(3, '0')}`
  const lesson = map.lessons.find((item) => item.id === id)
  if (!lesson) fail(`нет metadata для ${id}`)
  else if (!readable(resolve(docs, 'swift', `${lesson.slug}.md`))) fail(`нет страницы ${lesson.slug}.md`)
}

for (const project of map.projects) {
  if (!groupIds.has(project.group)) fail(`${project.slug} references unknown group: ${project.group}`)
  for (const lesson of project.prerequisites) if (!lessonIds.has(lesson)) fail(`${project.slug} references unknown lesson: ${lesson}`)
  for (const concept of project.concepts) if (!conceptIds.has(concept)) fail(`${project.slug} references unknown concept: ${concept}`)
  validatePage(project.slug, 'projectSlug')
  const projectSource = source(`projects/${project.slug}.md`)
  if (!projectSource.includes('## Стартовая точка') && !projectSource.includes('## Стартовая точка и пошаговая сборка')) fail(`${project.slug} missing step-by-step starting point`)
  if (!projectSource.includes('Попробуй сам')) fail(`${project.slug} missing independent attempt marker`)
  if (!projectSource.includes('Ожидаемый результат')) fail(`${project.slug} missing expected-result marker`)
  if (!projectSource.includes('Новые концепции')) fail(`${project.slug} missing new-concepts marker`)
  if (projectSource.includes('## Рабочий vertical slice')) fail(`${project.slug} still uses legacy vertical-slice heading`)
  validateProjectSteps(project.slug, projectSource)
}

for (const milestone of map.milestones) {
  if (!groupIds.has(milestone.group)) fail(`${milestone.slug} references unknown group: ${milestone.group}`)
  for (const prerequisite of milestone.prerequisites) if (!projectSlugs.has(prerequisite)) fail(`${milestone.slug} references unknown project: ${prerequisite}`)
  for (const concept of milestone.concepts) if (!conceptIds.has(concept)) fail(`${milestone.slug} references unknown concept: ${concept}`)
  validatePage(milestone.slug, 'milestoneSlug')
}

for (const group of map.groups) {
  for (const slug of group.items) if (!contentSlugs.has(slug)) fail(`${group.id} references missing content: ${slug}`)
}

for (const concept of map.concepts) {
  for (const lesson of concept.theoryPages) if (!lessonIds.has(lesson)) fail(`${concept.id} references unknown theory page: ${lesson}`)
}

const projectFiles = readdirSync(resolve(docs, 'projects')).filter((file) => file.endsWith('.md') && file !== 'index.md')
if (projectFiles.length !== 24) fail(`ожидалось 24 Project/Milestone страницы, найдено ${projectFiles.length}`)
for (const file of projectFiles) if (!contentSlugs.has(file.replace(/\.md$/, ''))) fail(`страница отсутствует в course-map: ${file}`)

const validPaths = new Set([
  '/', '/learn', '/projects/', '/course-map',
  ...map.lessons.map((item) => `/swift/${item.slug}`),
  ...[...contentSlugs].map((slug) => `/projects/${slug}`)
])
for (const file of [
  ...readdirSync(resolve(docs, 'swift')).filter((item) => item.endsWith('.md')).map((item) => resolve(docs, 'swift', item)),
  ...readdirSync(resolve(docs, 'projects')).filter((item) => item.endsWith('.md')).map((item) => resolve(docs, 'projects', item))
]) {
  const content = readFileSync(file, 'utf8')
  for (const [, target] of content.matchAll(/\]\((\/(?:swift|projects)\/[^)#?]+)(?:[?#][^)]*)?\)/g)) {
    if (!validPaths.has(target)) fail(`${file.replace(`${root}/`, '')} links to missing page: ${target}`)
  }
}

for (const anchor of ['content-view', 'state', 'arrays', 'foreach', 'computed-properties', 'formatting']) {
  const wesplit = readFileSync(resolve(docs, 'projects/project-01-wesplit.md'), 'utf8')
  const count = wesplit.match(new RegExp(`id="${anchor}"`, 'g'))?.length ?? 0
  if (count !== 1) fail(`WeSplit anchor ${anchor} must occur exactly once, found ${count}`)
}

const milestoneOne = source('projects/milestone-01-03.md')
if (!milestoneOne.includes('enum LengthUnit')) fail('Milestone 1 solution must use enum units')
if (milestoneOne.includes('let units = ["Метры"')) fail('Milestone 1 regressed to string units')
if (milestoneOne.slice(0, milestoneOne.indexOf('<Challenge>')).includes('Swift Testing')) fail('Milestone 1 requires Swift Testing before Day 17')

const projectThree = source('projects/project-03-views-and-modifiers.md')
if (projectThree.includes('struct Card<Content: View>')) fail('Project 3 introduces generic Card before Day 18')

const daySevenCheckpoint = source('swift/day-007-functions-part1.md').split('<Checkpoint>')[1] ?? ''
if (daySevenCheckpoint.includes('guard let') || daySevenCheckpoint.includes('.reduce(')) fail('Day 7 checkpoint uses future syntax')

const betterRest = source('projects/project-04-betterrest.md')
if (!betterRest.includes('/data/SleepCalculator.csv') || !betterRest.includes('prediction.actualSleep')) fail('BetterRest Core ML path is incomplete')
if (betterRest.includes('/* prediction */')) fail('BetterRest contains a prediction placeholder')
if (!readable(resolve(docs, 'public/data/SleepCalculator.csv'))) fail('BetterRest training CSV is missing')

if (!source('projects/project-09-drawing.md').includes('struct Spirograph: Shape')) fail('Drawing is missing a complete Spirograph')
if (source('swift/day-000-how-to-become-ios-developer.md').includes('Day 1–19')) fail('Day 0 describes the old linear route')

const milestoneTenCore = source('projects/milestone-10-12.md').split('<Challenge>')[0]
if (/migration/i.test(milestoneTenCore)) fail('Milestone 10–12 requires migration in its core requirements')

const iExpenseSlice = source('projects/project-07-iexpense.md').split('## Рабочий vertical slice')[1]?.split('\n## ')[0] ?? ''
if (iExpenseSlice.includes('try?')) fail('iExpense vertical slice silently ignores persistence errors')
if (!source('projects/project-16-hot-prospects.md').includes('toggleContacted')) fail('Hot Prospects slice does not demonstrate shared mutation')

function readable(path) {
  try { readFileSync(path); return true } catch { return false }
}

function validateProjectSteps(slug, content) {
  // Ignore fenced examples: headings inside Swift comments are not article structure.
  const structure = content.replace(/```[^\n]*\n[\s\S]*?```/g, '[code]')
  const steps = [...structure.matchAll(/^### Шаг (\d+)\.[^\n]*$/gm)]
  if (steps.length < 2) fail(`${slug}: нужны самостоятельные шаги сборки`)
  const reference = structure.indexOf('## Reference: полный код')
  if (reference < 0) fail(`${slug}: отсутствует итоговый Reference`)
  const challenge = structure.indexOf('<Challenge>')
  if (challenge < 0 || reference < challenge) fail(`${slug}: Reference должен идти после challenge`)
  for (const [index, match] of steps.entries()) {
    if (Number(match[1]) !== index + 1) fail(`${slug}: нарушена нумерация шагов`)
    const end = steps[index + 1]?.index ?? Math.min(...[
      structure.indexOf('\n## ', match.index + 1),
      structure.indexOf('<Checkpoint>', match.index + 1),
      structure.indexOf('<Challenge>', match.index + 1)
    ].filter((position) => position >= 0))
    const step = structure.slice(match.index, end < 0 ? reference : end)
    const attempt = step.indexOf('**Попробуй сам:**')
    const solution = step.indexOf('<details>')
    const close = step.indexOf('</details>')
    const result = step.indexOf('**Ожидаемый результат:**')
    const explanation = step.indexOf('**Новые концепции:**')
    if (!(attempt >= 0 && attempt < solution && solution < close && close < result && result < explanation)) {
      fail(`${slug}, шаг ${index + 1}: порядок попытка → скрытое решение → результат → объяснение`)
    }
    if (!step.includes(`Показать решение шага ${index + 1}`)) fail(`${slug}: нет подписанного решения шага ${index + 1}`)
    const outsideSolution = step.slice(0, solution) + step.slice(close + '</details>'.length)
    if (outsideSolution.includes('[code]')) fail(`${slug}, шаг ${index + 1}: код решения раскрыт вне details`)
    const answer = step.slice(solution, close)
    if (!answer.includes('[code]') && !/Create ML|\.mlmodel/.test(answer)) fail(`${slug}: пустое решение шага ${index + 1}`)
    if (answer.includes('[code]') && !/\.swift|Внутри|В \*\*|Создай ресурс/.test(answer)) fail(`${slug}: не указано место изменения кода в шаге ${index + 1}`)
  }
  if (structure.includes('<details open')) fail(`${slug}: решения должны быть закрыты по умолчанию`)
  const ref = structure.slice(reference)
  if (!ref.includes('<details>') || !ref.includes('App.swift') || !ref.includes('ContentView.swift')) {
    fail(`${slug}: Reference должен включать экран и точку входа приложения`)
  }
}

function source(relativePath) {
  return readFileSync(resolve(docs, relativePath), 'utf8')
}

function validatePage(slug, metadataKey) {
  const path = resolve(docs, 'projects', `${slug}.md`)
  if (!readable(path)) return fail(`нет страницы ${slug}.md`)
  const content = readFileSync(path, 'utf8')
  if (!content.includes(`${metadataKey}: ${slug}`)) fail(`${slug} missing ${metadataKey} metadata`)
  const prose = content.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '').replace(/^---[\s\S]*?---/m, '')
  const cyrillic = (prose.match(/[А-Яа-яЁё]{3,}/g) ?? []).length
  if (cyrillic < 50) fail(`${slug} слишком короткий для полноценного русского материала`)
  const englishParagraph = prose.split('\n').some((line) => {
    const plain = line.replace(/<[^>]+>/g, '').replace(/\[[^\]]+\]\([^)]+\)/g, '')
    return !/[А-Яа-яЁё]/.test(plain) && (plain.match(/\b[A-Za-z]{3,}\b/g) ?? []).length >= 12
  })
  if (englishParagraph) fail(`${slug} содержит крупный английский фрагмент вне code blocks`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`✅ Контент валиден: ${map.lessons.length} уроков, ${map.projects.length} проектов, ${map.milestones.length} milestones, ${map.concepts.length} concepts.`)
