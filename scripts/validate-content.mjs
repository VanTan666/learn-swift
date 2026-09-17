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
  if (!wesplit.includes(`id="${anchor}"`)) fail(`WeSplit missing deep-link anchor: ${anchor}`)
}

function readable(path) {
  try { readFileSync(path); return true } catch { return false }
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
