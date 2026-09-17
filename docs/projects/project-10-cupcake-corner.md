---
title: Project 10 — Cupcake Corner
description: Многоэкранный заказ, Codable, URLSession и async/await.
projectSlug: project-10-cupcake-corner
---

# Project 10 — Cupcake Corner

Cupcake Corner проводит пользователя через заказ кексов, проверяет адрес и отправляет JSON на сервер. Это первый полный цикл «форма → model → networking → результат».

<ProjectPrerequisites slug="project-10-cupcake-corner" />

## Рабочий vertical slice

```swift
import SwiftUI

struct Order: Codable {
    var quantity = 3
    var name = ""
    var city = ""
}

struct ContentView: View {
    enum SubmitState { case idle, sending, sent, failed(String) }

    @State private var order = Order()
    @State private var state = SubmitState.idle

    var body: some View {
        NavigationStack {
            Form {
                Stepper("Кексов: \(order.quantity)", value: $order.quantity, in: 1...20)
                TextField("Имя", text: $order.name)
                TextField("Город", text: $order.city)

                Button("Отправить заказ") {
                    Task { await submit() }
                }
                .disabled(order.name.isEmpty || order.city.isEmpty || isSending)

                switch state {
                case .idle: EmptyView()
                case .sending: ProgressView("Отправка…")
                case .sent: Label("Заказ принят", systemImage: "checkmark.circle")
                case .failed(let message): Text(message).foregroundStyle(.red)
                }
            }
            .navigationTitle("Cupcake Corner")
        }
    }

    private var isSending: Bool {
        if case .sending = state { true } else { false }
    }

    private func submit() async {
        state = .sending
        do {
            let data = try JSONEncoder().encode(order)
            var request = URLRequest(url: URL(string: "https://example.com/order")!)
            request.httpMethod = "POST"
            request.httpBody = data
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")

            let (_, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse,
                  200..<300 ~= http.statusCode else {
                throw URLError(.badServerResponse)
            }
            state = .sent
        } catch is CancellationError {
            state = .idle
        } catch {
            state = .failed("Не удалось отправить заказ")
        }
    }
}

#Preview { ContentView() }
```

URL здесь служит местом для учебного endpoint. Экран уже компилируется и показывает idle/sending/success/failure; подставьте адрес API перед проверкой успешной отправки.

## Одна model для нескольких экранов

`Order` хранит flavour, количество, специальные пожелания и адрес. Передавая один observable object по navigation, мы избегаем несвязанных копий данных.

```swift
@Observable
class Order: Codable {
    var type = 0
    var quantity = 3
    var name = ""
    var streetAddress = ""
    var city = ""
    var zip = ""
}
```

## Computed properties для цены и validation

```swift
var cost: Decimal {
    var cost = Decimal(quantity) * 2
    cost += Decimal(type) / 2
    if extraFrosting { cost += Decimal(quantity) }
    if addSprinkles { cost += Decimal(quantity) / 2 }
    return cost
}

var hasValidAddress: Bool {
    !name.trimmingCharacters(in: .whitespaces).isEmpty &&
    !streetAddress.trimmingCharacters(in: .whitespaces).isEmpty &&
    !city.trimmingCharacters(in: .whitespaces).isEmpty &&
    !zip.trimmingCharacters(in: .whitespaces).isEmpty
}
```

UI не хранит отдельный `isValid`: он вычисляется из текущих полей, поэтому не может устареть.

## Кодируем и отправляем JSON

```swift
func placeOrder() async {
    do {
        let encoded = try JSONEncoder().encode(order)
        guard let url = URL(string: "https://example.com/order") else {
            throw URLError(.badURL)
        }

        var request = URLRequest(url: url)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpMethod = "POST"
        request.httpBody = encoded

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse,
              200..<300 ~= http.statusCode else {
            throw URLError(.badServerResponse)
        }

        try Task.checkCancellation()
        let decoded = try JSONDecoder().decode(Order.self, from: data)
        confirmationMessage = "Заказ на \(decoded.quantity) готов"
    } catch is CancellationError {
        confirmationMessage = "Отправка отменена"
    } catch {
        confirmationMessage = "Не удалось отправить заказ: \(error.localizedDescription)"
    }
}
```

`await` приостанавливает только текущую async function, не замораживая интерфейс. Успешный транспортный запрос ещё не означает успешный HTTP-ответ, поэтому проверяйте status code. Экран должен различать отправку, успех, ошибку и отмену; запуск из `.task` автоматически связывает отмену с жизненным циклом View.

## AsyncImage

`AsyncImage` загружает изображение по URL и даёт phases для loading, success и failure. Для каждой фазы покажи честное состояние, а не пустое место.

::: details Advanced: кэширование
Стандартное HTTP-кэширование `AsyncImage` появилось в iOS 27. На более ранних версиях не обещайте постоянный кэш без собственного loader. Для учебного заказа достаточно корректно показать loading и failure.
:::

<Challenge>
<template #task>Запрети адреса, состоящие только из пробелов, покажи progress во время отправки и разреши повторить запрос после ошибки.</template>
<template #knowledge>Computed properties, string trimming, async/await, errors и state.</template>
<template #hint1>Добавь `isSending` и устанавливай его через `defer { isSending = false }`.</template>
<template #hint2>Не очищай order при ошибке: пользователь должен исправить данные или повторить запрос.</template>
<template #solution>

```swift
isSending = true
defer { isSending = false }
do { /* request */ } catch { errorMessage = error.localizedDescription }
```

</template>
</Challenge>

<ProjectRecap slug="project-10-cupcake-corner" />

Следующая тема — постоянная локальная база в [Bookworm →](/projects/project-11-bookworm).
