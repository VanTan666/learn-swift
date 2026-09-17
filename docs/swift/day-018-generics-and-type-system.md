---
title: День 18 — Generics для Moonshot
description: Generic functions и constraints для reusable JSON decoder в Moonshot.
---

# День 18 — Generics для Moonshot

Generics позволяют написать алгоритм один раз и сохранить точную информацию о типе. Они встречаются в `Array<Element>`, `Result<Success, Failure>`, декодировании JSON и почти во всём SwiftUI.

## Generic function

```swift
func firstMatch<T>(in values: [T], where matches: (T) -> Bool) -> T? {
    for value in values where matches(value) {
        return value
    }
    return nil
}

let firstEven = firstMatch(in: [3, 7, 8, 10]) { $0.isMultiple(of: 2) }
```

`T` — placeholder конкретного типа, который компилятор выводит в месте вызова. Внутри функции нельзя предполагать, что `T` умеет складываться или сравниваться: это нужно выразить constraint.

## Constraints и `where`

```swift
func uniqueSorted<T>(_ values: [T]) -> [T]
where T: Hashable & Comparable {
    Array(Set(values)).sorted()
}
```

`Hashable` нужен для `Set`, `Comparable` — для `sorted()`. Constraint превращает скрытое предположение в проверяемый контракт.

## Generic type

```swift
enum Loadable<Value> {
    case idle
    case loading
    case loaded(Value)
    case failed(String)
}
```

Один enum может описать `Loadable<[Article]>`, `Loadable<Profile>` и другие значения без `Any` и ручных преобразований.

::: details Глубже: `any`, `some` и associated types

## `any`, `some` и `<T: Protocol>`

```swift
protocol Named {
    var name: String { get }
}

struct User: Named { let name: String }
struct Team: Named { let name: String }

func printName<T: Named>(_ value: T) {
    print(value.name)
}

func makeGuest() -> some Named {
    User(name: "Гость")
}

let directory: [any Named] = [
    User(name: "Анна"),
    Team(name: "iOS")
]
```

- `<T: Named>` принимает конкретный тип и сохраняет его для компилятора;
- `any Named` создаёт existential box и позволяет хранить разные conforming types вместе;
- `some Named` скрывает один конкретный тип, выбранный реализацией — как `some View`.

Начинайте с generic parameter, когда операция должна сохранить тип. Выбирайте `any P`, когда разнородные значения действительно нужны в одной коллекции.

## Associated types

```swift
protocol Store {
    associatedtype Item
    func load() async throws -> [Item]
}

struct UserStore: Store {
    func load() async throws -> [User] {
        [User(name: "Анна")]
    }
}
```

`associatedtype` связывает protocol с типом реализации. Для `UserStore` значение `Item` всегда равно `User`.

:::

<Checkpoint>
<template #task>

Напишите generic function `clamped(_:to:)`, которая ограничивает значение закрытым диапазоном. Она должна работать для `Int`, `Double`, `Date` и других `Comparable` types.

</template>
<template #knowledge>

- generic parameter;
- constraint `Comparable`;
- `ClosedRange<T>`.

</template>
<template #hint>

Сравните значение с `range.lowerBound` и `range.upperBound`, затем верните одну из трёх величин.

</template>
<template #solution>

```swift
func clamped<T: Comparable>(_ value: T, to range: ClosedRange<T>) -> T {
    if value < range.lowerBound { return range.lowerBound }
    if value > range.upperBound { return range.upperBound }
    return value
}

print(clamped(14, to: 0...10)) // 10
```

</template>
</Checkpoint>

### Официальные источники

- [Generics — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics/)
- [Opaque and boxed protocol types](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/opaquetypes/)
