---
title: День 10 — Структуры, часть 1
description: Свои типы, properties, methods, computed properties, observers и initializers.
---

# День 10 — Структуры, часть 1

`struct` объединяет связанные данные и поведение в новый тип. Вместо разрозненных `name`, `score` и `level` мы создаём модель игрока, которую трудно использовать неправильно.

## Properties

```swift
struct Album {
    let title: String
    let artist: String
    var isReleased: Bool
}

var album = Album(title: "Northern Lights", artist: "Mira", isReleased: false)
print(album.title)
album.isReleased = true
```

Значения внутри struct называются properties. Константный `title` не меняется, а `isReleased` можно обновить у экземпляра, объявленного через `var`.

## Methods

Функция внутри типа называется method.

```swift
struct Album {
    let title: String
    var isReleased: Bool

    func printSummary() {
        print("\(title): \(isReleased ? "выпущен" : "готовится")")
    }
}
```

Если method меняет property структуры, он помечается `mutating`.

```swift
struct Counter {
    var value = 0

    mutating func increment() {
        value += 1
    }
}

var counter = Counter()
counter.increment()
```

Struct является value type. Изменение экземпляра рассматривается как изменение всего значения, поэтому Swift требует явного `mutating`.

## Computed properties

Computed property вычисляется при обращении и не хранит отдельное значение.

```swift
struct Employee {
    let name: String
    var vacationAllocated = 20
    var vacationTaken = 0

    var vacationRemaining: Int {
        vacationAllocated - vacationTaken
    }
}

let employee = Employee(name: "Анна", vacationTaken: 6)
print(employee.vacationRemaining) // 14
```

Можно добавить `get` и `set`:

```swift
struct Employee {
    var vacationAllocated = 20
    var vacationTaken = 0

    var vacationRemaining: Int {
        get {
            vacationAllocated - vacationTaken
        }
        set {
            vacationAllocated = vacationTaken + newValue
        }
    }
}
```

В setter новое присвоенное значение доступно как `newValue`.

## Property observers

`willSet` вызывается перед изменением stored property, `didSet` — после.

```swift
struct Game {
    var score = 0 {
        willSet {
            print("Счёт станет \(newValue)")
        }
        didSet {
            print("Добавлено \(score - oldValue)")
        }
    }
}

var game = Game()
game.score += 10
```

Observers подходят для небольших реакций на изменение. Не прячьте в них тяжёлую работу: простое присваивание должно оставаться предсказуемым.

## Initializers

Swift автоматически создаёт memberwise initializer для struct.

```swift
struct Player {
    let name: String
    var score: Int
}

let player = Player(name: "Игорь", score: 0)
```

Можно написать собственный `init`.

```swift
struct Player {
    let name: String
    var score: Int

    init(name: String) {
        self.name = name
        score = 0
    }
}
```

`self.name` обозначает property, а `name` — параметр. До завершения initializer все stored properties должны получить значения.

## Value semantics

При присваивании struct копируется.

```swift
struct User {
    var name: String
}

var first = User(name: "Анна")
var second = first
second.name = "Борис"

print(first.name)  // Анна
print(second.name) // Борис
```

Это одна из главных причин, почему SwiftUI широко использует structures: локальные изменения легче отслеживать.

## Почему это важно для iOS?

Практически каждый SwiftUI View начинается как `struct`. Посмотри на первую строку настоящего приложения:

```swift
struct ContentView: View {
    var body: some View {
        Text("Hello")
    }
}
```

- `ContentView` — обычный Swift `struct`;
- `View` — protocol из SwiftUI;
- `body` — computed property;
- `some View` — тип возвращаемого значения;
- фигурные скобки образуют тело структуры.

Получается знакомая основа плюс одна новая идея: SwiftUI просит структуру соответствовать `View` и описать интерфейс в `body`.

<TheoryApplications concept="structs" :limit="3" />

## В реальном приложении: computed property

В WeSplit computed property `totalPerPerson` рассчитывает сумму на одного человека из текущего счёта, процента чаевых и числа гостей. Оно ничего не хранит и всегда соответствует state формы.

[Посмотреть расчёт в Project 1 — WeSplit →](/projects/project-01-wesplit#computed-properties)

::: tip Что запомнить
Stored property хранит значение, computed property вычисляет его. Method описывает поведение, initializer создаёт корректный экземпляр.
:::

## Synthesized conformances

Swift может автоматически создать реализации распространённых protocols, если все properties им соответствуют:

```swift
struct Task: Identifiable, Codable, Hashable {
    let id: UUID
    var title: String
    var isDone: Bool
}
```

`Identifiable` нужен спискам SwiftUI, `Codable` — кодированию, `Hashable` — Set, Dictionary keys и value-based navigation. Добавляйте conformance по реальной задаче, а не «на всякий случай».
