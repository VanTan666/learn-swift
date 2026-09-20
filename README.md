<p align="center">
  <img src="docs/public/swift-mark.svg" width="92" alt="Swift logo">
</p>

<h1 align="center">Swift → SwiftUI</h1>

<p align="center">
  Beginner-first курс на русском: от основ Swift до 19 практических SwiftUI-проектов.
</p>

<p align="center">
  <a href="https://learn-swift.vantan.tech/"><strong>Открыть курс →</strong></a>
</p>

<p align="center">
  <a href="https://github.com/VanTan666/learn-swift/actions/workflows/deploy.yml"><img src="https://github.com/VanTan666/learn-swift/actions/workflows/deploy.yml/badge.svg" alt="GitHub Pages"></a>
  <img src="https://img.shields.io/badge/Swift-6.4-F05138?logo=swift&logoColor=white" alt="Swift 6.4">
  <img src="https://img.shields.io/badge/VitePress-1.6-646CFF?logo=vite&logoColor=white" alt="VitePress 1.6">
</p>

## Что внутри

- 21 статья: введение, базовый Swift и короткие мосты к современным темам;
- 19 SwiftUI-проектов и 5 контрольных этапов;
- первый проект сразу после основ Swift;
- Observation, generics и concurrency появляются перед проектами, где они нужны;
- пошаговая сборка приложений от минимального компилируемого состояния;
- самостоятельная попытка перед раскрытием решения каждого шага;
- полный итоговый код в сворачиваемом reference-блоке в конце Project-статьи;
- задания, подсказки, самостоятельные изменения и optional-блоки «Глубже»;
- карта связей между теорией и проектами;
- локальный поиск, светлая и тёмная темы, адаптивная навигация;
- прогресс и кнопка «Продолжить» работают локально в браузере.

## Почему курс устроен так

Основной маршрут оставлен beginner-first. Ученик получает ровно столько теории, сколько нужно для следующей практики. Миграции, Instruments, HDR, сложные actor boundary, advanced SwiftData и новые специализированные API находятся в необязательных блоках и не мешают пройти основной путь.

Единая [version policy](docs/version-policy.md) описывает поддерживаемые версии инструментов. В статьях minimum iOS указан только там, где он действительно влияет на доступность API.

## Запуск локально

Нужен Node.js 20 или новее.

```bash
git clone https://github.com/VanTan666/learn-swift.git
cd learn-swift
npm ci
npm run dev
```

## Проверки

```bash
npm run validate-content
npm run test:resume
npm run typecheck
npm run lint
npm run build
```

## Структура

```text
docs/
├── swift/                 # теория Swift
├── projects/              # проекты и milestones
├── public/                # favicon и статические ресурсы
└── .vitepress/
    ├── data/              # карта курса и порядок продолжения
    └── theme/             # интерфейс и локальный прогресс
scripts/                   # проверки контента и маршрута
```

## Данные и хостинг

Это полностью статический сайт. Здесь нет базы данных, аккаунтов, комментариев, OAuth и собственного сервера. GitHub Pages раздаёт готовые HTML, CSS и JavaScript на `learn-swift.vantan.tech`, а отметки о прохождении остаются в `localStorage` текущего браузера.

## Происхождение материала

Структура практики сверялась с [100 Days of SwiftUI](https://www.hackingwithswift.com/100/swiftui). Тексты, объяснения и учебные примеры написаны как самостоятельный русский учебный материал, а не как построчный перевод исходных статей.

История изменений находится в [CHANGELOG.md](CHANGELOG.md).

## Как читать Project-статьи

19 проектов состоят из 110 небольших шагов. Сначала попробуй выполнить задание; затем раскрой решение, примени изменения в указанном файле и проверь ожидаемый результат. После решения разобрана новая запись и предложены небольшие проверки понимания. Полный Reference в конце соответствует основному маршруту, самостоятельный challenge идёт отдельно.

Для редакторов: `python3 scripts/check-project-swift.py` воспроизводит фрагменты из статей и сверяет финальные файлы. На macOS с Xcode команда `python3 scripts/check-project-swift.py --typecheck --model /path/to/SleepCalculator.swift` дополнительно проверяет Swift каждого шага. Файл модели генерируется Xcode из `.mlmodel`, обученной на учебном CSV BetterRest.

[Полный changelog переработки](CHANGELOG.md).
