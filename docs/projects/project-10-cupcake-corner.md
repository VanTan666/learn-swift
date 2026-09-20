---
title: Project 10 — Cupcake Corner
description: Многоэкранный заказ, Codable, URLSession и async/await.
projectSlug: project-10-cupcake-corner
---

# Project 10 — Cupcake Corner

Cupcake Corner проводит пользователя через заказ кексов, проверяет адрес и отправляет JSON на сервер. Это первый полный цикл «форма → model → networking → результат».

<ProjectPrerequisites slug="project-10-cupcake-corner" />

## Стартовая точка

Создай новый **iOS → App** с именем **CupcakeCorner** и интерфейсом SwiftUI. В сгенерированном `ContentView.swift` оставь минимальное состояние ниже. Сохрани файл `CupcakeCornerApp.swift`, созданный Xcode; если шаг меняет точку входа, замени существующий файл, не создавай второй `@main`.

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Начало")
    }
}
```

Сначала прочитай задание шага и попробуй выполнить его. Решение закрыто: открой его для сверки или если застрял. Применяй изменения по порядку — каждый шаг опирается на предыдущий.

### Шаг 1. Заказ и количество

**Цель:** Заказ и количество.

**Попробуй сам:** Создай Order с quantity, name и city. Покажи Stepper количества кексов 1…20.

<details>
<summary>Показать решение шага 1</summary>

**Order.swift** — создай файл и включи его в target приложения.

```swift
struct Order: Codable {
    var quantity = 3
    var name = ""
    var city = ""
}
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var order = Order()
```

В **ContentView.swift** найди этот блок:

```swift
Text("Начало")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
NavigationStack {
            Form {
                Stepper("Кексов: \(order.quantity)", value: $order.quantity, in: 1...20)
            }
            .navigationTitle("Cupcake Corner")
        }
```


</details>

**Ожидаемый результат:** Количество изменяется и остаётся в разрешённом диапазоне. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Для передачи между экранами используем значение Order и Binding. Это ещё один способ общего состояния: owner один, дочерний экран редактирует ту же запись через привязку.

Order — обычный Codable struct. На первом шаге он используется только как хранилище значений: Codable пригодится при отправке, но не меняет работу Stepper. `order.quantity` читает число, `$order.quantity` позволяет контролу изменить его у владельца.

### Шаг 2. Экран адреса

**Цель:** Экран адреса.

**Попробуй сам:** Создай AddressView с @Binding order и полями имени и города. Открой через NavigationLink.

<details>
<summary>Показать решение шага 2</summary>

**AddressView.swift** — создай файл и включи его в target приложения.

```swift
import SwiftUI
struct AddressView: View {
    @Binding var order: Order
    var body: some View {
        Form {
            TextField("Имя", text: $order.name)
            TextField("Город", text: $order.city)
        }
        .navigationTitle("Адрес")
    }
}
```

В **ContentView.swift** найди этот блок:

```swift
Stepper("Кексов: \(order.quantity)", value: $order.quantity, in: 1...20)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Stepper("Кексов: \(order.quantity)", value: $order.quantity, in: 1...20)
                NavigationLink("Адрес") { AddressView(order: $order) }
```


</details>

**Ожидаемый результат:** Адрес сохраняется при переходе назад и повторном открытии формы. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Binding не создаёт копию Order: запись изменяется у ContentView. NavigationLink с destination closure достаточен для одного перехода.

`@Binding var order: Order` объявляет привязку, которую обязан предоставить родитель. Поэтому initializer вызывается с `$order`, а не `order`. Если передать обычную копию структуры и создать новый @State в AddressView, изменения адреса перестанут надёжно возвращаться назад. Проверь это через переход туда и обратно.

### Шаг 3. Цена и проверка формы

**Цель:** Цена и проверка формы.

**Попробуй сам:** В Order вычисли цену по 2 условные единицы за кекс и допустимость имени/города после trimming. Покажи цену и кнопку локальной проверки.

<details>
<summary>Показать решение шага 3</summary>

В **Order.swift** найди этот блок:

```swift
struct Order: Codable {
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
import Foundation
struct Order: Codable {
    var cost: Decimal { Decimal(quantity) * 2 }
    var hasValidAddress: Bool {
        !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !city.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
```

В **AddressView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var message = ""
```

В **AddressView.swift** найди этот блок:

```swift
TextField("Город", text: $order.city)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
TextField("Город", text: $order.city)
            Text("Цена: \(order.cost.description)")
            Button("Проверить") { message = "Готово к отправке: \(order.quantity)" }
                .disabled(!order.hasValidAddress)
            Text(message)
```


</details>

**Ожидаемый результат:** Пробелы не считаются адресом; при корректном вводе проверка показывает число кексов. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Вычисляемые свойства не могут рассинхронизироваться с полями. Это чистая логика, к которой уже можно написать небольшой Swift Testing-тест после соответствующего bridge-урока.

Проверка пробелов выполняется над текущими строками, не над отдельно сохранённым результатом. Цена использует Decimal, чтобы демонстрировать десятичную арифметику. Здесь две условные единицы за кекс — учебное правило, не скрытая валюта или реальный тариф. Проверь quantity = 3: цена должна быть 6.

### Шаг 4. Асинхронное состояние отправки

**Цель:** Асинхронное состояние отправки.

**Попробуй сам:** Замени проверку учебной задержкой async/await. Во время ожидания блокируй повторное действие и показывай ProgressView. Подпиши результат как локальную демонстрацию.

<details>
<summary>Показать решение шага 4</summary>

В **AddressView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var isSending = false
    private func submit() async {
        isSending = true
        message = ""
        defer { isSending = false }
        do {
            try await Task.sleep(for: .seconds(1))
            message = "Локальная демонстрация завершена"
        } catch { message = "Демонстрация отменена" }
    }
```

В **AddressView.swift** найди этот блок:

```swift
Button("Проверить") { message = "Готово к отправке: \(order.quantity)" }
                .disabled(!order.hasValidAddress)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Button("Отправить учебный заказ") { Task { await submit() } }
                .disabled(!order.hasValidAddress || isSending)
            if isSending { ProgressView("Отправка…") }
```


</details>

**Ожидаемый результат:** Во время ожидания интерфейс остаётся отзывчивым; после него написано «Локальная демонстрация завершена». Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Task запускает async-функцию из синхронной кнопки. defer восстанавливает isSending и при успехе, и при ошибке; здесь ещё нет сетевого запроса и реального заказа.

`Task { await submit() }` соединяет действие кнопки с async-функцией. Внутри `Task.sleep` приостанавливает задачу, а не блокирует главный поток ожиданием. Код после await продолжает выполнение, когда ожидание завершилось. Попробуй нажать кнопку второй раз во время задержки: isSending должен блокировать дублирование.

### Шаг 5. JSON и HTTP

**Цель:** JSON и HTTP.

**Попробуй сам:** Отправь вымышленные имя и город на тестовый echo endpoint https://httpbin.org/anything. Проверь HTTP status, декодируй поле json и покажи количество из ответа.

<details>
<summary>Показать решение шага 5</summary>

В **AddressView.swift** найди этот блок:

```swift
try await Task.sleep(for: .seconds(1))
            message = "Локальная демонстрация завершена"
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
guard let url = URL(string: "https://httpbin.org/anything") else { throw URLError(.badURL) }
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONEncoder().encode(order)
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse,
                  (200..<300).contains(http.statusCode) else { throw URLError(.badServerResponse) }
            let echoed = try JSONDecoder().decode(EchoResponse.self, from: data)
            try Task.checkCancellation()
            message = "Учебный echo подтвердил: \(echoed.json.quantity) кексов"
```

В **AddressView.swift** найди этот блок:

```swift
} catch { message = "Демонстрация отменена" }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
} catch is CancellationError {
            message = "Отправка отменена"
        } catch {
            message = "Не удалось отправить: \(error.localizedDescription)"
        }
```

**EchoResponse.swift** — создай файл и включи его в target приложения.

```swift
struct EchoResponse: Decodable { let json: Order }
```


</details>

**Ожидаемый результат:** При доступном сервисе отображается подтверждение echo с количеством; без сети появляется ошибка и можно повторить. Это не магазин и не реальный заказ. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** URLSession возвращает Data и response. Успешная передача не гарантирует статус 2xx. Echo возвращает отправленный JSON в поле json; отдельный Decodable описывает этот ответ. Используй только вымышленные данные.

`httpMethod = "POST"` сообщает тип запроса, Content-Type описывает формат body. Ответ echo — объект с полем json, поэтому декодируем EchoResponse, а уже внутри него находится Order. Проверка статуса стоит до декодирования: HTML-страницу ошибки не надо пытаться читать как успешный заказ. Исходные поля не очищаются, чтобы повторить запрос после ошибки. Описание сервиса: [httpbin](https://httpbin.org/).

## Глубже — необязательно

::: details Глубже: изображение и жизненный цикл
После рабочего запроса добавь AsyncImage, отдельно обрабатывая loading, success и failure. Для ухода с экрана можно хранить handle Task и отменять его; сложные actor-boundary вопросы оставь до изучения actors/Sendable. Тестовый echo — внешний сервис и иногда недоступен: это нормальный сценарий ошибки, не повод подменять ответ успехом.
:::

## Самостоятельное изменение

<Challenge>
<template #task>Добавь streetAddress и zip, включи их в hasValidAddress и форму.</template>
<template #knowledge>Используй состояние и функции, которые уже собрал в этом проекте.</template>
<template #hint1>Order кодируется автоматически; для новых полей достаточно stored properties и TextField.</template>
<template #hint2>Проверь обычный случай и граничные значения; сохрани основной рабочий маршрут.</template>
<template #solution>

```swift
var streetAddress = ""
var zip = ""
// Добавь к hasValidAddress:
// && !streetAddress.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
// && !zip.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
```

</template>
</Challenge>

## Reference: полный код проекта

Основной маршрут, без самостоятельного challenge. Используй этот блок для сверки уже собранного приложения.

<details>
<summary>Открыть все итоговые файлы проекта</summary>

### ContentView.swift

```swift
import SwiftUI

struct ContentView: View {
    @State private var order = Order()

    var body: some View {
        NavigationStack {
            Form {
                Stepper("Кексов: \(order.quantity)", value: $order.quantity, in: 1...20)
                NavigationLink("Адрес") { AddressView(order: $order) }
            }
            .navigationTitle("Cupcake Corner")
        }
    }
}
```

### CupcakeCornerApp.swift

```swift
import SwiftUI

@main
struct CupcakeCornerApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

### Order.swift

```swift
import Foundation
struct Order: Codable {
    var cost: Decimal { Decimal(quantity) * 2 }
    var hasValidAddress: Bool {
        !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !city.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
    var quantity = 3
    var name = ""
    var city = ""
}
```

### AddressView.swift

```swift
import SwiftUI
struct AddressView: View {
    @Binding var order: Order
    @State private var message = ""

    @State private var isSending = false
    private func submit() async {
        isSending = true
        message = ""
        defer { isSending = false }
        do {
            guard let url = URL(string: "https://httpbin.org/anything") else { throw URLError(.badURL) }
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONEncoder().encode(order)
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse,
                  (200..<300).contains(http.statusCode) else { throw URLError(.badServerResponse) }
            let echoed = try JSONDecoder().decode(EchoResponse.self, from: data)
            try Task.checkCancellation()
            message = "Учебный echo подтвердил: \(echoed.json.quantity) кексов"
        } catch is CancellationError {
            message = "Отправка отменена"
        } catch {
            message = "Не удалось отправить: \(error.localizedDescription)"
        }
    }

    var body: some View {
        Form {
            TextField("Имя", text: $order.name)
            TextField("Город", text: $order.city)
            Text("Цена: \(order.cost.description)")
            Button("Отправить учебный заказ") { Task { await submit() } }
                .disabled(!order.hasValidAddress || isSending)
            if isSending { ProgressView("Отправка…") }
            Text(message)
        }
        .navigationTitle("Адрес")
    }
}
```

### EchoResponse.swift

```swift
struct EchoResponse: Decodable { let json: Order }
```

</details>

<ProjectRecap slug="project-10-cupcake-corner" />

Следующая тема — постоянная локальная база в [Bookworm →](/projects/project-11-bookworm).
