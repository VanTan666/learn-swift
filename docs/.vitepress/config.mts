import { defineConfig } from 'vitepress'
import { courseMap, lessonPath, milestonesBySlug, projectPath, projectsBySlug } from './data/course-map'

const projectSidebar = courseMap.groups.map((group, index) => ({
  text: group.title,
  collapsed: index > 0,
  items: group.items.map((slug) => {
    const item = projectsBySlug.get(slug) ?? milestonesBySlug.get(slug)
    return {
      text: item && 'project' in item ? `Project ${item.project} — ${item.title}` : `◇ ${item?.title.replace('Контрольная: ', 'Контрольная — ')}`,
      link: projectPath(slug)
    }
  })
}))

const orderedPages = [
  { title: courseMap.lessons[0].title, link: lessonPath(courseMap.lessons[0]), slug: courseMap.lessons[0].slug },
  ...courseMap.learningPath.map((id) => {
    const lesson = courseMap.lessons.find((item) => item.id === id)
    if (lesson) return { title: lesson.title, link: lessonPath(lesson), slug: lesson.slug }
    const item = projectsBySlug.get(id) ?? milestonesBySlug.get(id)!
    return { title: 'project' in item ? `Project ${item.project} — ${item.title}` : item.title, link: projectPath(id), slug: id }
  })
]

export default defineConfig({
  base: '/learn-swift/',
  lang: 'ru-RU',
  title: 'Swift → SwiftUI',
  description: 'Русский beginner-first курс Swift и 19 практических проектов SwiftUI',
  cleanUrls: true,
  appearance: false,
  lastUpdated: false,
  sitemap: { hostname: 'https://vantan666.github.io/learn-swift/' },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/learn-swift/swift-mark.svg' }],
    ['script', {}, `(() => {
      let theme = 'system';
      try { theme = localStorage.getItem('swift-ru-theme-v1') || 'system'; } catch {}
      const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    })()`],
    ['meta', { name: 'theme-color', content: '#f05a28' }],
    ['meta', { name: 'color-scheme', content: 'light dark' }]
  ],
  markdown: {
    lineNumbers: false,
    codeCopyButtonTitle: 'Копировать код',
    externalLinks: { target: '_blank', rel: 'noopener noreferrer' }
  },
  themeConfig: {
    logo: { src: '/swift-mark.svg', alt: 'Swift' },
    siteTitle: 'Swift → SwiftUI',
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: 'Поиск', buttonAriaLabel: 'Поиск по курсу' },
          modal: {
            noResultsText: 'Ничего не найдено',
            resetButtonTitle: 'Сбросить поиск',
            footer: { selectText: 'выбрать', navigateText: 'перейти', closeText: 'закрыть' }
          }
        }
      }
    },
    nav: [
      { text: 'Твой путь', link: '/learn' },
      { text: 'Основы Swift', link: lessonPath(courseMap.lessons[1]) },
      { text: 'Проекты', link: '/projects/' },
      { text: 'Карта курса', link: '/course-map' },
      { text: 'Версии', link: '/version-policy' }
    ],
    sidebar: [
      { text: 'Введение', items: [{ text: courseMap.lessons[0].title, link: lessonPath(courseMap.lessons[0]) }] },
      { text: 'Версии курса', items: [{ text: 'Version policy', link: '/version-policy' }] },
      { text: 'Основы Swift', collapsed: false, items: courseMap.lessons.filter((lesson) => lesson.section === 'Основы Swift').map((lesson) => ({ text: lesson.title, link: lessonPath(lesson) })) },
      { text: 'Мосты к проектам', collapsed: true, items: courseMap.lessons.filter((lesson) => lesson.section !== 'Основы Swift' && lesson.id !== 'day-000').map((lesson) => ({ text: lesson.title, link: lessonPath(lesson) })) },
      { text: 'SwiftUI', items: [{ text: 'Все проекты', link: '/projects/' }, { text: 'Карта связей', link: '/course-map' }] },
      ...projectSidebar
    ],
    outline: { label: 'На этой странице', level: [2, 3] },
    docFooter: { prev: 'Предыдущая', next: 'Следующая' },
    returnToTopLabel: 'Наверх',
    sidebarMenuLabel: 'Меню',
    darkModeSwitchLabel: 'Тема',
    lightModeSwitchTitle: 'Светлая тема',
    darkModeSwitchTitle: 'Тёмная тема',
    socialLinks: [{ icon: 'github', link: 'https://github.com/VanTan666/learn-swift' }]
  },
  transformPageData(pageData) {
    const index = orderedPages.findIndex(({ slug }) => pageData.relativePath.includes(slug))
    if (index < 0) return
    const lesson = courseMap.lessons.find(({ slug }) => pageData.relativePath.includes(slug))
    pageData.frontmatter.lessonId = lesson?.id
    pageData.frontmatter.lessonIndex = lesson ? courseMap.lessons.indexOf(lesson) : undefined
    pageData.frontmatter.prev = index > 0 ? { text: orderedPages[index - 1].title, link: orderedPages[index - 1].link } : false
    pageData.frontmatter.next = index < orderedPages.length - 1 ? { text: orderedPages[index + 1].title, link: orderedPages[index + 1].link } : false
  }
})
