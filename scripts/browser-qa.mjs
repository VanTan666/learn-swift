import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { URL } from 'node:url'
import courseMap from '../docs/.vitepress/data/course-map.json' with { type: 'json' }

const origin = process.env.SWIFT_RU_QA_ORIGIN ?? 'http://127.0.0.1:4173'
const base = (process.env.SWIFT_RU_QA_BASE ?? '').replace(/\/$/, '')
const siteUrl = (path) => `${origin}${path.startsWith(base + '/') ? path : `${base}${path === '/' ? '/' : path}`}`
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const profile = mkdtempSync(join(tmpdir(), 'swift-ru-qa-'))
const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9333', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })
const chromeExited = new Promise((resolve) => chrome.once('exit', resolve))

let socket
let nextId = 0
const pending = new Map()

try {
  await waitForHttp('http://127.0.0.1:9333/json/version')
  const target = await fetch(`http://127.0.0.1:9333/json/new?${encodeURIComponent(siteUrl('/learn'))}`, { method: 'PUT' }).then((response) => response.json())
  socket = new WebSocket(target.webSocketDebuggerUrl)
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (!message.id) return
    const request = pending.get(message.id)
    if (!request) return
    pending.delete(message.id)
    if (message.error) request.reject(new Error(message.error.message))
    else request.resolve(message.result)
  })
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })

  const routes = [
    '/', '/learn', '/projects/', '/course-map', '/version-policy',
    ...courseMap.lessons.map((lesson) => `/swift/${lesson.slug}`),
    ...courseMap.projects.map((project) => `/projects/${project.slug}`),
    ...courseMap.milestones.map((milestone) => `/projects/${milestone.slug}`)
  ]
  for (const route of routes) {
    const response = await fetch(siteUrl(route))
    assert(response.ok, `${route} вернул ${response.status}`)
  }

  await navigate('/learn')
  assert(await evaluate(`document.body.innerText.includes('Твой путь в iOS')`), 'dashboard не отрисован')
  assert(await evaluate(`document.querySelectorAll('.journey-step').length === 6`), 'маршрут должен содержать 6 этапов')

  await navigate('/projects/')
  assert(await evaluate(`document.querySelectorAll('.project-card').length === 24`), 'на странице проектов должно быть 24 карточки')

  await navigate('/swift/day-015-swift-review')
  assert(await evaluate(`document.body.innerText.includes('Базовый синтаксис Swift пройден') && document.querySelector('.course-bridge-cta a')?.getAttribute('href') === '${base}/projects/project-01-wesplit'`), 'мост Day 15 → WeSplit не найден')

  await evaluate(`localStorage.clear(); localStorage.setItem('swift-ru-progress-v1', JSON.stringify(['day-010'])); true`)
  await navigate('/swift/day-015-swift-review')
  await waitFor(`document.querySelector('a[href="${base}/swift/day-010-structs-part1"]')?.classList.contains('course-complete')`)
  assert(await evaluate(`JSON.parse(localStorage.getItem('swift-ru-progress-v1')).includes('day-010')`), 'legacy progress не прочитан')

  await navigate('/swift/day-010-structs-part1')
  assert(await evaluate(`document.querySelector('a[href="${base}/projects/project-01-wesplit#computed-properties"]') !== null`), 'Day 10 не ведёт к computed property WeSplit')
  await navigate('/projects/project-01-wesplit#computed-properties')
  assert(await evaluate(`location.hash === '#computed-properties' && document.getElementById('computed-properties') !== null`), 'deep link computed-properties не открылся')
  const repeatLink = await evaluate(`[...document.querySelectorAll('a[href*="day-010-structs-part1?returnTo="]')].find(link => link.innerText.includes('computed properties'))?.getAttribute('href')`)
  assert(repeatLink, 'ссылка повторения Day 10 не найдена')
  await navigate(repeatLink)
  await waitFor(`document.querySelector('.return-to-project')?.getAttribute('href') === '${base}/projects/project-01-wesplit#computed-properties'`)
  await evaluate(`document.querySelector('.return-to-project').click(); true`)
  await waitFor(`location.pathname === '${base}/projects/project-01-wesplit' && location.hash === '#computed-properties'`)

  await navigate('/projects/project-01-wesplit')
  assert(await evaluate(`document.body.innerText.includes('Шаг 1. Первый View') && document.querySelectorAll('.familiar-new').length >= 3`), 'WeSplit integration blocks не найдены')
  assert(await evaluate(`document.body.innerText.includes('Шаг 2. Состояние и поле суммы') && document.body.innerText.includes('Попробуй сам')`), 'WeSplit step-by-step content не найден')
  assert(await evaluate(`document.querySelectorAll('details').length >= 5 && [...document.querySelectorAll('summary')].some(summary => summary.innerText.includes('итоговые файлы'))`), 'WeSplit hidden solutions/reference не найдены')
  await evaluate(`document.querySelector('.page-progress button').click(); true`)
  await waitFor(`JSON.parse(localStorage.getItem('swift-ru-course-progress-v2')).projects['project-01-wesplit'] === true`)
  await navigate('/projects/project-01-wesplit')
  assert(await evaluate(`document.querySelector('.page-progress button')?.innerText.includes('Проект завершён')`), 'progress проекта не сохранился после reload')
  await evaluate(`document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); true`)
  await waitFor(`location.pathname === '${base}/projects/project-02-guess-the-flag'`)

  await evaluate(`const select=document.querySelector('.theme-select select'); select.value='dark'; select.dispatchEvent(new Event('change',{bubbles:true})); true`)
  await waitFor(`document.documentElement.classList.contains('dark')`)
  await navigate('/projects/project-01-wesplit')
  assert(await evaluate(`document.documentElement.classList.contains('dark')`), 'тема не сохранилась')

  await navigate('/swift/day-010-structs-part1?returnTo=%2Fprojects%2Fproject-01-wesplit%23computed-properties')
  await waitFor(`document.querySelector('.return-to-project')?.getAttribute('href') === '${base}/projects/project-01-wesplit#computed-properties'`)

  await navigate('/projects/project-01-wesplit')
  await evaluate(`document.querySelector('[aria-label*="Поиск"]')?.click(); true`)
  await waitFor(`document.querySelector('.VPLocalSearchBox input, .DocSearch-Input') !== null`)
  await evaluate(`const input=document.querySelector('.VPLocalSearchBox input, .DocSearch-Input'); input.value='computed property'; input.dispatchEvent(new Event('input',{bubbles:true})); true`)
  await waitFor(`document.body.innerText.includes('День 10') && document.body.innerText.includes('WeSplit')`)

  for (const project of courseMap.projects) {
    await navigate(`/projects/${project.slug}`)
    const steps = await evaluate(`[...document.querySelectorAll('summary')].filter(e => e.textContent.startsWith('Показать решение шага')) .map(e => ({ text: e.textContent, open: e.parentElement.open }))`)
    assert(steps.length >= 2 && steps.every(step => !step.open), `${project.slug}: решения должны быть закрыты`)
    await evaluate(`[...document.querySelectorAll('summary')].find(e => e.textContent === 'Показать решение шага 1').click(); true`)
    assert(await evaluate(`[...document.querySelectorAll('summary')].find(e => e.textContent === 'Показать решение шага 1').parentElement.open`), `${project.slug}: решение не открывается`)
    assert(await evaluate(`[...document.querySelectorAll('summary')].find(e => e.textContent === 'Показать решение шага 2').parentElement.open === false`), `${project.slug}: следующий шаг раскрыт заранее`)
  }

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await navigate('/projects/project-01-wesplit')
  assert(await evaluate(`getComputedStyle(document.querySelector('.VPNavBarHamburger')).display !== 'none'`), 'mobile menu button не видна')
  await evaluate(`document.querySelector('.VPNavBarHamburger').click(); true`)
  await waitFor(`document.querySelector('.VPNavScreen') && getComputedStyle(document.querySelector('.VPNavScreen')).display !== 'none'`)

  console.log(`✅ Browser QA: ${routes.length} routes, 19 projects with independent collapsed steps, dashboard, Day 15 bridge, legacy migration, project progress, theme, search, return link, mobile drawer.`)
} finally {
  socket?.close()
  chrome.kill('SIGTERM')
  await Promise.race([chromeExited, new Promise((resolve) => setTimeout(resolve, 1500))])
  rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
}

function send(method, params = {}) {
  const id = ++nextId
  socket.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
  return result.result.value
}

async function navigate(path) {
  const target = new URL(siteUrl(path))
  await send('Page.navigate', { url: target.href })
  await waitFor(`location.pathname === ${JSON.stringify(target.pathname)} && document.readyState === 'complete' && Boolean(document.querySelector('#app')?.__vue_app__)`, 10000)
}

async function waitFor(expression, timeout = 5000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`timeout: ${expression}`)
}

async function waitForHttp(url) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try { if ((await fetch(url)).ok) return } catch { /* Chrome запускается */ }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('Chrome DevTools не запустился')
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}
