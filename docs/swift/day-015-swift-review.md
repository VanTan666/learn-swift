---
title: День 15 — Повторение Swift
description: Сжатое повторение всех основ Swift перед переходом к SwiftUI.
---

# День 15 — Повторение Swift

За две недели мы прошли основные строительные блоки языка. Сегодня не добавляем крупную тему, а связываем знания в одну картину. Если какая-то часть кажется размытой, вернитесь к соответствующему уроку и измените пример своими руками.

## Значения и типы

```swift
let appName = "Habit"   // String, менять нельзя
var streak = 7          // Int, можно менять
let progress: Double = 0.7
let isPremium = false   // Bool
```

- `let` используйте по умолчанию;
- `var` — когда значение действительно меняется;
- type inference выводит тип из начального значения;
- type annotation выбирает или документирует конкретный тип.

## Коллекции и enums

```swift
let orderedTasks = ["Код", "Тест", "Commit"]
let scores = ["Анна": 10, "Иван": 8]
let uniqueTags: Set = ["swift", "ios"]

enum Status {
    case idle
    case loading
    case loaded(count: Int)
    case failed(message: String)
}
```

Array сохраняет порядок, Dictionary связывает ключ и значение, Set обеспечивает уникальность. enum моделирует конечные состояния и может хранить associated values.

## Условия и циклы

```swift
let score = 82

if score >= 80 {
    print("Отлично")
} else {
    print("Продолжаем")
}

for number in 1...3 {
    print(number)
}
```

`switch` особенно полезен вместе с enum, потому что компилятор проверяет полноту вариантов.

```swift
let status = Status.loaded(count: 12)

switch status {
case .idle:
    print("Ожидание")
case .loading:
    print("Загрузка")
case .loaded(let count):
    print("Получено: \(count)")
case .failed(let message):
    print(message)
}
```

## Functions и errors

```swift
enum ValidationError: Error {
    case emptyName
}

func normalizedName(_ name: String, uppercase: Bool = false) throws -> String {
    let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else {
        throw ValidationError.emptyName
    }

    return uppercase ? trimmed.uppercased() : trimmed
}
```

Функция получает вход через параметры, возвращает результат и при необходимости выбрасывает ошибку. Labels делают место вызова естественным, defaults упрощают частый сценарий, tuple возвращает небольшой фиксированный набор значений.

## Closures

```swift
let numbers = [5, 2, 8, 1]
let labels = numbers
    .filter { $0 > 2 }
    .sorted()
    .map { "Значение: \($0)" }
```

Closure — функция-значение. Она может быть аргументом, результатом или сохранённой переменной. Trailing closure syntax делает вызовы с поведением компактными и лежит в основе синтаксиса SwiftUI.

## Structs и classes

```swift
struct Profile {
    let id: Int
    var name: String

    var displayName: String {
        name.isEmpty ? "Гость" : name
    }

    mutating func rename(to newName: String) {
        name = newName
    }
}
```

Struct — value type: при присваивании создаётся независимое значение. Class — reference type: несколько переменных могут наблюдать один объект. Начинайте со struct и выбирайте class для общей идентичности, inheritance или class-based API.

## Protocols и extensions

```swift
protocol Summarizable {
    var summary: String { get }
}

extension Summarizable {
    func printSummary() {
        print(summary)
    }
}

extension Profile: Summarizable {
    var summary: String {
        "#\(id): \(displayName)"
    }
}
```

Protocol задаёт контракт. Extension добавляет возможности существующему типу. Protocol extension предоставляет общее поведение множеству несвязанных типов.

## Optionals

```swift
func printFirst(_ names: [String]?) {
    guard let first = names?.first else {
        print("Список пуст")
        return
    }

    print(first)
}
```

Основные инструменты:

- `if let` — извлечь значение в локальной ветке;
- `guard let` — проверить обязательное значение и выйти раньше;
- `??` — выбрать разумный fallback;
- `?.` — безопасно продолжить цепочку;
- `try?` — превратить ошибку в отсутствие результата, если причина не нужна.

## Как всё соединяется

Небольшой пример использует сразу несколько тем:

```swift
protocol Describable {
    var description: String { get }
}

struct Task: Describable {
    let title: String
    var isDone = false

    var description: String {
        "\(isDone ? "✓" : "○") \(title)"
    }

    mutating func complete() {
        isDone = true
    }
}

var tasks: [Task] = [
    Task(title: "Повторить closures"),
    Task(title: "Собрать первый экран")
]

tasks[0].complete()

for task in tasks {
    print(task.description)
}
```

Здесь Array хранит models, struct задаёт собственный value type, protocol описывает способность, computed property формирует строку, mutating method меняет состояние, цикл выводит элементы, а ternary operator выбирает значок.

## Самопроверка

Попробуйте ответить без запуска кода:

1. Почему `let` предпочтительнее `var`, если изменение не нужно?
2. Чем `0..<5` отличается от `0...5`?
3. Когда Dictionary подходит лучше Array?
4. Почему throwing function вызывают с `try`?
5. Что получает closure в `sorted(by:)` и что возвращает?
6. Чем computed property отличается от stored property?
7. Почему копия struct меняется независимо, а class — нет?
8. Как protocol extension уменьшает повторение?
9. Как безопасно получить первое значение optional Array?

Если можете объяснить ответы своими словами и написать небольшой пример, базовый синтаксис уже на месте. Новые темы будут появляться позже прямо перед проектом, в котором понадобятся.

::: info Следующий шаг
Переходите прямо к [Project 1 — WeSplit](/projects/project-01-wesplit). Testing, Observation, generics и concurrency встретятся позже just-in-time, когда у каждой темы появится практическая задача.
:::

## Мини-проект перед SwiftUI

Соберите консольный трекер задач: Array из `Task`, функции добавления и завершения, enum для фильтра, вывод через closure-сортировку. Не копируйте пример целиком — сначала запишите требования и выберите типы самостоятельно.

::: tip Что запомнить
Синтаксис забывается и быстро восстанавливается. Гораздо важнее понимать модель: какие состояния допустимы, кому принадлежит изменение и как типы помогают исключить ошибки.
:::

## 🎉 Базовый синтаксис Swift пройден

До этого момента ты изучал сам язык Swift: переменные, Arrays, условия, functions, structs, protocols, optionals и другие базовые возможности.

Теперь начинается SwiftUI. Это не новый язык: знакомый Swift никуда не исчезает. SwiftUI постоянно использует его, чтобы описывать интерфейс и реакцию на действия пользователя.

<FamiliarNew
  :familiar="['variables', 'double', 'arrays', 'ranges', 'closures', 'structs', 'computed-properties', 'protocols', 'optionals']"
  :fresh="['view', 'state', 'form', 'section', 'navigation-stack', 'picker', 'text-field', 'foreach']"
/>

В первом проекте:

- Array наполнит варианты `Picker`;
- Range и closure построят строки `ForEach`;
- `struct ContentView` станет экраном;
- computed property рассчитает сумму;
- protocol `View` свяжет структуру со SwiftUI;
- Optional поможет выбрать формат валюты.

<div class="course-bridge-cta">
  <strong>Теперь применим знания в настоящем SwiftUI-приложении.</strong>
  <a href="/learn-swift/projects/project-01-wesplit">Начать Project 1 — WeSplit →</a>
</div>
