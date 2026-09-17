---
title: День 17 — Первые тесты
description: "Постепенное знакомство с @Test и #expect на уже понятой чистой логике."
---

# День 17 — Первые тесты

Работающий пример отвечает только на вопрос «сработало сейчас?». Тест фиксирует ожидаемое поведение и повторяет проверку после изменения. Начните с расчётов WeSplit и validation Word Scramble; сеть, UI и test doubles пока не нужны.

## Первый тест

```swift
import Testing

func tip(total: Double, percent: Double) -> Double {
    total * percent / 100
}

@Test("20% от 100 равны 20")
func calculatesTip() {
    #expect(tip(total: 100, percent: 20) == 20)
}
```

`@Test` регистрирует функцию как тест, а `#expect` проверяет выражение. При падении framework показывает значения внутри выражения, поэтому отдельное сообщение часто не требуется.

::: tip Что тестировать
Начинайте с чистой логики: расчёты, validation, преобразования, сортировка и state transitions. Screenshot каждого стандартного SwiftUI control даёт меньше пользы и чаще ломается без изменения поведения.
:::

## Несколько случаев одним тестом

Параметризованный тест запускается для каждого набора arguments.

```swift
@Test(arguments: [
    (total: 100.0, percent: 10.0, expected: 10.0),
    (total: 80.0, percent: 25.0, expected: 20.0),
    (total: 0.0, percent: 20.0, expected: 0.0)
])
func calculatesTip(case value: (Double, Double, Double)) {
    #expect(tip(total: value.0, percent: value.1) == value.2)
}
```

Параметры полезны, когда меняются входные данные, а правило остаётся одним. Не складывайте в один тест несвязанные сценарии только ради сокращения файла.

## Ошибки и async-код

```swift
enum ValidationError: Error { case emptyName }

func validate(name: String) throws {
    if name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
        throw ValidationError.emptyName
    }
}

@Test
func rejectsBlankName() {
    #expect(throws: ValidationError.emptyName) {
        try validate(name: "   ")
    }
}
```

::: details Глубже: async test
Async test сам объявляется `async`:

```swift
@Test
func loadsCachedProfile() async throws {
    let client = ProfileClient(transport: FakeTransport())
    let profile = try await client.load()
    #expect(profile.name == "Анна")
}
```

Сеть в unit test заменена controllable dependency. Реальный сервер сделал бы тест медленным и нестабильным.
:::

## Suites, traits и параллельный запуск

```swift
@Suite("Order validation")
struct OrderTests {
    @Test func acceptsCompleteAddress() { /* ... */ }
    @Test func rejectsMissingCity() { /* ... */ }
}
```

Swift Testing запускает тесты параллельно, когда может. Если тесты зависят от одного глобального изменяемого значения или общего файла, это раскрывает проблему дизайна. Предпочитайте независимые fixtures; serialization включайте только там, где ресурс действительно нельзя разделить.

Tags и traits позволяют группировать проверки, ограничивать условия запуска и связывать bug с тестом. Имя теста должно описывать наблюдаемое поведение, а не внутреннюю реализацию.

::: details Глубже: test doubles

## Test doubles без тяжёлой архитектуры

Небольшой protocol создаёт seam для зависимости:

```swift
protocol ProfileTransport {
    func profileData() async throws -> Data
}

struct LiveTransport: ProfileTransport {
    func profileData() async throws -> Data {
        let url = URL(string: "https://example.com/profile")!
        return try await URLSession.shared.data(from: url).0
    }
}

struct FakeTransport: ProfileTransport {
    let data: Data
    func profileData() async throws -> Data { data }
}
```

Не нужно создавать protocol для каждого struct. Seam оправдан на границе с сетью, временем, случайностью, файловой системой или другим нестабильным окружением.

:::

::: details Глубже: Swift Package Manager и macros

## Swift Package Manager

Package отделяет reusable код от приложения и описывает его зависимости в `Package.swift`.

```swift
// swift-tools-version: 6.4
import PackageDescription

let package = Package(
    name: "CourseLogic",
    platforms: [.iOS(.v17)],
    products: [.library(name: "CourseLogic", targets: ["CourseLogic"])],
    targets: [
        .target(name: "CourseLogic"),
        .testTarget(name: "CourseLogicTests", dependencies: ["CourseLogic"])
    ]
)
```

Commands для package:

```text
swift build
swift test
swift package update
```

В приложении Xcode local package удобен для логики, которая не зависит от конкретного экрана. Не разбивайте маленький учебный проект на десятки modules заранее: граница package должна уменьшать связанность или давать повторное использование.

## Что такое macros

Macros преобразуют Swift syntax во время компиляции. Вы уже встречали их:

- `@Observable` добавляет machinery наблюдения;
- `@Model` создаёт SwiftData model;
- `@Test` описывает тест;
- `#expect` анализирует проверяемое выражение;
- `#Preview` создаёт preview declaration.

`@...` — attached macro, связанная с declaration; `#...` — freestanding macro, которая появляется как самостоятельное выражение или declaration. Macro генерирует Swift-код, но не выполняет сетевой запрос и не заменяет runtime feature.

На начальном этапе важнее научиться читать expansion и сообщения компилятора, чем писать собственный macro. В Xcode доступно раскрытие generated expansion.

:::

## `#Preview` для SwiftUI

```swift
#Preview("Пустой список") {
    NavigationStack {
        ExpenseList(items: [])
    }
}
```

Preview помогает быстро проверять state и Dynamic Type, но не заменяет unit test, accessibility audit и запуск на устройстве.

<Checkpoint>
<template #task>

Вынесите расчёт чаевых из WeSplit в отдельный type и напишите тесты для нулевой суммы, обычного процента и деления между несколькими людьми. Добавьте проверку недопустимого количества участников.

</template>
<template #knowledge>

- `@Test`, `#expect` и проверка errors;
- чистая логика без SwiftUI;
- параметризованные cases;
- ясные имена поведения.

</template>
<template #hint>

Функция расчёта не должна читать `@State`. Передайте сумму, процент и число людей обычными parameters.

</template>
<template #solution>

```swift
enum SplitError: Error { case invalidPeopleCount }

func amountPerPerson(total: Double, tip: Double, people: Int) throws -> Double {
    guard people > 0 else { throw SplitError.invalidPeopleCount }
    return total * (1 + tip / 100) / Double(people)
}

@Test(arguments: [(100.0, 0.0, 2, 50.0), (100.0, 20.0, 4, 30.0)])
func splitsBill(total: Double, tip: Double, people: Int, expected: Double) throws {
    #expect(try amountPerPerson(total: total, tip: tip, people: people) == expected)
}

@Test func rejectsZeroPeople() {
    #expect(throws: SplitError.invalidPeopleCount) {
        try amountPerPerson(total: 100, tip: 10, people: 0)
    }
}
```

</template>
</Checkpoint>

## Что забрать с собой

- тест проверяет публично наблюдаемое поведение;
- Swift Testing использует `@Test`, `#expect`, suites и parameterized arguments;
- async test остаётся обычным structured async-кодом;
- зависимости от сети, времени и файлов передаются извне;
- package — полезная граница, а не обязательный слой каждого проекта;
- macros генерируют код на этапе компиляции и уже являются частью повседневного Swift.

Не пытайтесь сразу покрыть весь проект. Добавляйте по одному тесту после каждой понятой чистой функции; дальше переходите к [Project 4 — BetterRest →](/projects/project-04-betterrest).

### Официальные источники

- [Swift Testing](https://developer.apple.com/xcode/swift-testing/)
- [Swift Package Manager](https://www.swift.org/package-manager/)
- [Macros — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/macros/)
- [Swift 6.4 Released](https://www.swift.org/blog/swift-6.4-released/)
