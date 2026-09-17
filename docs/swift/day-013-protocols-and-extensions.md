---
title: День 13 — Протоколы и расширения
description: Protocols, extensions, protocol extensions и переиспользуемое поведение.
---

# День 13 — Протоколы и расширения

Protocol описывает способности типа, не диктуя, как они реализованы. Extension добавляет возможности существующему типу. Вместе они позволяют писать гибкий код без обязательного наследования.

## Protocol как контракт

```swift
protocol Vehicle {
    var name: String { get }
    var currentPassengers: Int { get set }
    func estimateTime(for distance: Int) -> Int
    func travel(distance: Int)
}
```

`{ get }` требует чтение property, `{ get set }` — чтение и запись. Protocol не хранит данные и не содержит обычной реализации; он перечисляет требования.

## Соответствие protocol

```swift
struct Car: Vehicle {
    let name = "Автомобиль"
    var currentPassengers = 1

    func estimateTime(for distance: Int) -> Int {
        distance / 80
    }

    func travel(distance: Int) {
        print("Едем \(distance) км")
    }
}
```

После `: Vehicle` компилятор проверяет все требования. Если забыть method или выбрать неверный тип property, код не соберётся.

## Функция принимает protocol

Код может работать с любой реализацией общей способности.

```swift
func commute(distance: Int, using vehicle: any Vehicle) {
    if vehicle.estimateTime(for: distance) > 2 {
        print("Долго добираться")
    } else {
        vehicle.travel(distance: distance)
    }
}

var car = Car()
commute(distance: 120, using: car)
```

`any Vehicle` означает значение некоторого типа, который соответствует `Vehicle`. Если важен конкретный тип и производительность, Swift также поддерживает generics с `some Vehicle`, но для начала важнее понять сам контракт.

## Несколько protocols

Тип может соответствовать нескольким protocols.

```swift
protocol Named {
    var name: String { get }
}

protocol Identifiable {
    var id: Int { get }
}

struct User: Named, Identifiable {
    let name: String
    let id: Int
}
```

Protocol composition для параметра записывается как `Named & Identifiable`.

## Extensions

Extension добавляет computed properties и methods существующему типу.

```swift
extension String {
    var trimmed: String {
        trimmingCharacters(in: .whitespacesAndNewlines)
    }

    mutating func trim() {
        self = trimmed
    }
}

var title = "  Swift  "
print(title.trimmed)
title.trim()
```

Extension не может добавить stored property, потому что это изменило бы размер уже существующего типа.

### Улучшение читаемости

```swift
extension Collection {
    var isNotEmpty: Bool {
        !isEmpty
    }
}

let names = ["Анна"]
if names.isNotEmpty {
    print("Список заполнен")
}
```

Расширение `Collection` работает с Array, Set и другими коллекциями.

## Protocol extensions

Extension protocol может предоставить реализацию по умолчанию.

```swift
protocol Person {
    var name: String { get }
    func sayHello()
}

extension Person {
    func sayHello() {
        print("Привет, я \(name)")
    }
}

struct Employee: Person {
    let name: String
}

let employee = Employee(name: "Лена")
employee.sayHello()
```

`Employee` получает готовое поведение, но может написать собственный `sayHello()`.

Это отличается от inheritance: один struct может соответствовать нескольким protocols, а общая реализация не создаёт общей ссылочной идентичности.

## Opaque return types: `some`

Запись `some Protocol` скрывает конкретный тип результата, но гарантирует один стабильный тип, соответствующий protocol.

```swift
func makeVehicle() -> some Vehicle {
    Car()
}
```

SwiftUI использует `some View`, потому что точные типы составных интерфейсов бывают огромными, а вызывающему коду достаточно знать, что результат — View.

## Зачем protocols нужны в SwiftUI?

```swift
struct ContentView: View {
    var body: some View {
        Text("Hello")
    }
}
```

`View` — protocol из SwiftUI. Запись `struct ContentView: View` означает: «`ContentView` обязуется выполнить требования protocol `View`». Основное требование — property `body`, возвращающая другой View.

Ты уже знаешь сам механизм соответствия. В SwiftUI новым является конкретный protocol `View` и набор готовых types, которые ему соответствуют.

[Посмотреть разбор строки в Project 1 — WeSplit →](/projects/project-01-wesplit#content-view)

<TheoryApplications concept="protocols" :limit="3" />

<Checkpoint>
<template #task>

Создайте protocol `Building` с properties количества комнат, стоимости и имени агента, а также method для печати описания. Реализуйте его в types `House` и `Office`.

</template>
<template #knowledge>

- требования protocol;
- соответствие нескольких structs одному protocol;
- implementation method;
- function, принимающая `any Building`.

</template>
<template #hint>

Protocol может требовать только чтение properties через `{ get }`. Общую реализацию описания можно поместить в protocol extension.

</template>
<template #solution>

```swift
protocol Building {
    var rooms: Int { get }
    var cost: Int { get }
    var agent: String { get }
    func printSummary()
}

extension Building {
    func printSummary() {
        print("Комнат: \(rooms), цена: \(cost), агент: \(agent)")
    }
}

struct House: Building {
    let rooms: Int
    let cost: Int
    let agent: String
}

struct Office: Building {
    let rooms: Int
    let cost: Int
    let agent: String
}

House(rooms: 4, cost: 12_000_000, agent: "Анна").printSummary()
```

</template>
</Checkpoint>

::: tip Что запомнить
Protocol формулирует «что умеет тип», extension добавляет «как это можно сделать». Их сочетание — одна из центральных идей Swift.
:::

::: details Глубже: `any`, `some` и generic

## Когда `any`, `some` или generic

- `any Vehicle` хранит значение неизвестного conforming type во время выполнения;
- `some Vehicle` скрывает один конкретный type, выбранный функцией;
- `<T: Vehicle>` сохраняет конкретный type вызывающего кода и позволяет связать несколько параметров.

```swift
func compare<T: Vehicle>(_ first: T, _ second: T) -> Bool {
    first.name == second.name
}
```

Полный разбор constraints, associated types и existential containers находится в [Day 18](/swift/day-018-generics-and-type-system).

:::
