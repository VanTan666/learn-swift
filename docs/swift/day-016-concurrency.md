---
title: День 16 — async/await и отмена
description: "Короткий мост к сетевому запросу в Cupcake Corner: async, await, task и ошибки."
---

# День 16 — `async/await` и отмена

Эта статья идёт прямо перед Cupcake Corner. Её цель узкая: понять один сетевой запрос, не заморозить интерфейс и корректно обработать ошибку.

## Почему обычной функции недостаточно

Сеть отвечает не сразу. Функция с `async` может приостановиться, пока ждёт результат, а `await` отмечает это место.

```swift
func loadMessage() async throws -> String {
    let url = URL(string: "https://example.com/message.txt")!
    let (data, response) = try await URLSession.shared.data(from: url)

    guard let http = response as? HTTPURLResponse,
          200..<300 ~= http.statusCode else {
        throw URLError(.badServerResponse)
    }

    return String(decoding: data, as: UTF8.self)
}
```

`async` означает «функция может приостановиться», а не «она всегда запускается в другом потоке». `throws` отдельно сообщает, что операция может завершиться ошибкой.

## Запуск из SwiftUI

`.task` связывает асинхронную работу с жизненным циклом View. Когда экран исчезает, SwiftUI запрашивает отмену task.

```swift
struct MessageView: View {
    enum LoadState {
        case idle
        case loading
        case loaded(String)
        case failed(String)
    }

    @State private var state = LoadState.idle

    var body: some View {
        Group {
            switch state {
            case .idle, .loading:
                ProgressView("Загрузка…")
            case .loaded(let message):
                Text(message)
            case .failed(let message):
                ContentUnavailableView("Не удалось загрузить", systemImage: "wifi.exclamationmark", description: Text(message))
            }
        }
        .task {
            state = .loading
            do {
                state = .loaded(try await loadMessage())
            } catch is CancellationError {
                return
            } catch {
                state = .failed(error.localizedDescription)
            }
        }
    }
}
```

Отмена не всегда ошибка для пользователя: экран мог просто исчезнуть. Остальные ошибки показывайте понятным состоянием и, когда уместно, кнопкой повтора.

## Что нужно для Cupcake Corner

1. Сделать функцию `async`.
2. Вызвать `URLSession` через `try await`.
3. Проверить HTTP status, а потом декодировать данные.
4. Различать loading, success и failure.
5. Не очищать введённый заказ при ошибке — пользователь должен суметь повторить запрос.

<Checkpoint>
<template #task>

Измените `MessageView`: добавьте кнопку повтора после ошибки. Кнопка меняет `reloadID`, а `.task(id:)` запускает новую загрузку.

</template>
<template #knowledge>

- `async`, `await`, `throws`;
- `.task(id:)`;
- enum для состояния экрана;
- отдельная обработка отмены.

</template>
<template #hint>

Храните `@State private var reloadID = 0` и увеличивайте его в Button.

</template>
<template #solution>

```swift
Button("Повторить") { reloadID += 1 }

// На контейнере экрана:
.task(id: reloadID) {
    await load()
}
```

</template>
</Checkpoint>

::: details Глубже: параллельные операции
Когда две загрузки независимы и обе нужны экрану, `async let` запускает их одновременно:

```swift
async let profile = loadProfile()
async let messages = loadMessages()
let screen = try await (profile, messages)
```

Для первого сетевого проекта это не требуется. Actors и `Sendable` разобраны отдельно после практики с базовым `async/await`.
:::

Дальше примените эти шаги в [Project 10 — Cupcake Corner →](/projects/project-10-cupcake-corner).

### Официальные источники

- [Concurrency — The Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/)
- [URLSession](https://developer.apple.com/documentation/foundation/urlsession)
