---
title: День 20 — Actors и Sendable
description: "Необязательное углубление после первого async/await-проекта: actor isolation и data-race safety."
---

# День 20 — Actors и `Sendable`

Вы уже выполнили сетевой запрос через `async/await`. Теперь можно отделить ожидание от безопасности общего изменяемого состояния. Этот материал не нужен, чтобы закончить Cupcake Corner; возвращайтесь к нему, когда несколько tasks работают с одними данными.

## Actor защищает своё состояние

```swift
actor ImageCache {
    private var values: [URL: Data] = [:]

    func value(for url: URL) -> Data? { values[url] }
    func insert(_ data: Data, for url: URL) { values[url] = data }
}

let cache = ImageCache()
await cache.insert(data, for: url)
```

`await` здесь не означает сеть. Оно предупреждает, что actor сам упорядочивает доступ к своему состоянию.

## Main actor для UI

```swift
@MainActor
@Observable
final class ProfileModel {
    var name = ""
    var isLoading = false

    func reload() async {
        isLoading = true
        defer { isLoading = false }

        do {
            name = try await loadProfile().name
        } catch {
            name = "Не удалось загрузить профиль"
        }
    }
}
```

Main actor изолирует состояние интерфейса. В beginner-проекте достаточно держать UI model на main actor и не добавлять `DispatchQueue.main.async` поверх современного async-кода.

## `Sendable`

`Sendable` описывает значение, которое можно безопасно передать между concurrent domains.

```swift
struct UserSummary: Sendable {
    let id: UUID
    let name: String
}
```

Value types из безопасных значений обычно подходят естественно. Изменяемый class не становится безопасным от простого добавления `Sendable`; чаще его изолируют actor-ом или оставляют у одного владельца.

::: details Advanced: настройки Swift 6
Современный app target может использовать default actor isolation `MainActor`. Настройки language mode и isolation меняют диагностику компилятора, поэтому при чтении чужого проекта сначала проверьте Build Settings. `@unchecked Sendable` отключает проверку и требует отдельного доказательства thread safety; в учебных проектах лучше упростить модель.
:::

<Checkpoint>
<template #task>

Создайте actor-счётчик загрузок с methods `increment()` и `current()`. Запустите два вызова и прочитайте результат через `await`.

</template>
<template #knowledge>

- actor isolation;
- `await` при пересечении actor boundary;
- отличие UI state от shared mutable state.

</template>
<template #solution>

```swift
actor LoadCounter {
    private var value = 0
    func increment() { value += 1 }
    func current() -> Int { value }
}
```

</template>
</Checkpoint>

### Официальные источники

- [Data Race Safety — Swift 6 Migration Guide](https://www.swift.org/migration/documentation/swift-6-concurrency-migration-guide/dataracesafety/)
- [Concurrency — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/)
