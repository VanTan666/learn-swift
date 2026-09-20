---
title: Project 16 — Hot Prospects
description: TabView, shared data, QR-коды и notifications.
projectSlug: project-16-hot-prospects
---

# Project 16 — Hot Prospects

Hot Prospects помогает обмениваться контактами на встречах: разделяет людей на contacted/uncontacted, позволяет добавлять контакты вручную, показывает QR-код и ставит напоминания. Камерный сканер оставим дополнительным упражнением.

<ProjectPrerequisites slug="project-16-hot-prospects" />

## Стартовая точка

Создай новый **iOS → App** с именем **HotProspects** и интерфейсом SwiftUI. В сгенерированном `ContentView.swift` оставь минимальное состояние ниже. Сохрани файл `HotProspectsApp.swift`, созданный Xcode; если шаг меняет точку входа, замени существующий файл, не создавай второй `@main`.

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Начало")
    }
}
```

Сначала прочитай задание шага и попробуй выполнить его. Решение закрыто: открой его для сверки или если застрял. Применяй изменения по порядку — каждый шаг опирается на предыдущий.

### Шаг 1. Контакт и observable-модель

**Цель:** Контакт и observable-модель.

**Попробуй сам:** Создай Prospect и Prospects с двумя тестовыми контактами. Пока покажи всех в одном списке.

<details>
<summary>Показать решение шага 1</summary>

**Prospect.swift** — создай файл и включи его в target приложения.

```swift
import Foundation
struct Prospect: Identifiable {
    var id = UUID()
    var name: String
    var isContacted = false
}
```

**Prospects.swift** — создай файл и включи его в target приложения.

```swift
import Observation
@Observable
final class Prospects {
    var people = [Prospect(name: "Анна"), Prospect(name: "Борис", isContacted: true)]
}
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var prospects = Prospects()
```

В **ContentView.swift** найди этот блок:

```swift
Text("Начало")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
List(prospects.people) { Text($0.name) }
```


</details>

**Ожидаемый результат:** В списке есть Анна и Борис. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Prospects — единственный владелец массива; struct Prospect хранит запись. Это знакомая Observation из iExpense, теперь подготовленная для нескольких вкладок.

Контакт содержит факт состоявшегося общения в isContacted. Это состояние записи, поэтому оно находится в Prospect, а не в отдельной переменной каждой строки. Пока перезапуск возвращает sample-данные: observation обновляет интерфейс, но сама по себе не является persistence.

### Шаг 2. Две вкладки одного массива

**Цель:** Две вкладки одного массива.

**Попробуй сам:** Создай ProspectList с параметрами prospects и contacted. В TabView передавай один объект с разными фильтрами.

<details>
<summary>Показать решение шага 2</summary>

**ProspectList.swift** — создай файл и включи его в target приложения.

```swift
import SwiftUI
struct ProspectList: View {
    let prospects: Prospects
    let contacted: Bool
    var body: some View {
        NavigationStack {
            List {
                ForEach(prospects.people.filter { $0.isContacted == contacted }) { person in
                    Text(person.name)
                }
            }
            .navigationTitle(contacted ? "Связались" : "Новые")
        }
    }
}
```

В **ContentView.swift** найди этот блок:

```swift
List(prospects.people) { Text($0.name) }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
TabView {
            ProspectList(prospects: prospects, contacted: false)
                .tabItem { Label("Новые", systemImage: "person.badge.plus") }
            ProspectList(prospects: prospects, contacted: true)
                .tabItem { Label("Связались", systemImage: "checkmark.circle") }
        }
```


</details>

**Ожидаемый результат:** Во вкладке «Новые» видна Анна, во вкладке «Связались» — Борис. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** TabView переключает представления. Отфильтрованный результат вычисляется из общего массива; отдельные копии данных для вкладок не нужны.

Оба вызова ProspectList получают одну и ту же ссылку prospects. Различается только contacted, который задаёт условие фильтра. Tab не хранит свой список — при каждом чтении выбирает подходящие записи общего массива. Это подготовка к проверке перемещения контакта между вкладками.

### Шаг 3. Наблюдаемое изменение статуса

**Цель:** Наблюдаемое изменение статуса.

**Попробуй сам:** Добавь toggleContacted по id и кнопку в каждой строке.

<details>
<summary>Показать решение шага 3</summary>

В **Prospects.swift** добавь код перед строкой `var people = [Prospect(name: "Анна"), Prospect(name: "Борис", isContacted: true)]`:

```swift
    func toggleContacted(for person: Prospect) {
        guard let index = people.firstIndex(where: { $0.id == person.id }) else { return }
        people[index].isContacted.toggle()
    }
```

В **ProspectList.swift** найди этот блок:

```swift
Text(person.name)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Button {
                        prospects.toggleContacted(for: person)
                    } label: {
                        Label(person.name, systemImage: person.isContacted ? "checkmark.circle.fill" : "circle")
                    }
                    .accessibilityHint("Изменить статус контакта")
```


</details>

**Ожидаемый результат:** Нажатие на Анну убирает её из «Новые» и сразу показывает в «Связались». Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Это видимый результат shared observation: обе вкладки читают один экземпляр. Ищем индекс в исходном массиве по id, а не используем индекс фильтра.

Параметр person — копия структуры из отображаемой строки. Поэтому меняем не эту копию, а найденный по UUID элемент в people. После toggle обе вкладки заново читают isContacted. Проверь изменение обратно: контакт должен вернуться в исходную вкладку.

### Шаг 4. Ручное добавление и сортировка

**Цель:** Ручное добавление и сортировка.

**Попробуй сам:** Добавь TextField и кнопку добавления в toolbar. Не принимай имя из пробелов. Отсортируй фильтр по имени.

<details>
<summary>Показать решение шага 4</summary>

В **ProspectList.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var name = ""
```

В **ProspectList.swift** найди этот блок:

```swift
prospects.people.filter { $0.isContacted == contacted }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
prospects.people.filter { $0.isContacted == contacted }.sorted { $0.name < $1.name }
```

В **ProspectList.swift** найди этот блок:

```swift
.navigationTitle(contacted ? "Связались" : "Новые")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.navigationTitle(contacted ? "Связались" : "Новые")
            .toolbar {
                TextField("Имя", text: $name)
                Button("Добавить") {
                    prospects.people.append(Prospect(name: name.trimmingCharacters(in: .whitespacesAndNewlines)))
                    name = ""
                }
                .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
```


</details>

**Ожидаемый результат:** Новый контакт появляется в «Новые» в алфавитном порядке; ввод очищается. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Ручной ввод — рабочий способ пополнения списка без камеры. Filter и sort образуют вычисление над исходным массивом, не меняя его порядок и состав.

Новому Prospect по умолчанию присваивается isContacted = false. Поэтому добавление из вкладки «Связались» всё равно создаёт запись в «Новые» — это ожидаемый смысл нового контакта. Порядок сортировки не должен влиять на toggle, потому что изменение ищет запись по id.

### Шаг 5. QR-код контакта

**Цель:** QR-код контакта.

**Попробуй сам:** Добавь отдельный QRView на Core Image. В contextMenu строки открывай sheet с QR для UUID выбранного контакта.

<details>
<summary>Показать решение шага 5</summary>

**QRView.swift** — создай файл и включи его в target приложения.

```swift
import SwiftUI
import CoreImage.CIFilterBuiltins
struct QRView: View {
    let person: Prospect
    private var code: CGImage? {
        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data("swiftcourse:v1:\(person.id.uuidString)".utf8)
        guard let output = filter.outputImage?.transformed(by: .init(scaleX: 8, y: 8)) else { return nil }
        return CIContext().createCGImage(output, from: output.extent)
    }
    var body: some View {
        VStack {
            Text(person.name).font(.title)
            if let code {
                Image(decorative: code, scale: 1).interpolation(.none)
                    .resizable().scaledToFit().padding()
            } else { Text("Не удалось создать QR") }
            Text("Учебный ID: \(person.id.uuidString)").font(.caption)
        }
    }
}
```

В **ProspectList.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var selectedPerson: Prospect?
```

В **ProspectList.swift** найди этот блок:

```swift
.accessibilityHint("Изменить статус контакта")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.accessibilityHint("Изменить статус контакта")
                    .contextMenu {
                        Button("Показать QR") { selectedPerson = person }
                    }
```

В **ProspectList.swift** найди этот блок:

```swift
.navigationTitle(contacted ? "Связались" : "Новые")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.sheet(item: $selectedPerson) { QRView(person: $0) }
            .navigationTitle(contacted ? "Связались" : "Новые")
```


</details>

**Ожидаемый результат:** Долгое нажатие → «Показать QR» открывает резкий код. Он содержит учебный идентификатор, не имя и не адрес. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** QR generator принимает Data. Масштабирование без интерполяции сохраняет резкие границы. Префикс swiftcourse:v1 отделяет формат упражнения от произвольного текста.

QR здесь кодирует строку с префиксом и UUID. Это формат учебного идентификатора, а не автоматическая передача всей модели. При увеличении `.interpolation(.none)` сохраняет квадратные границы. У QRView также есть текстовый ID — данные остаются доступны без распознавания изображения.

### Шаг 6. Напоминание по явному действию

**Цель:** Напоминание по явному действию.

**Попробуй сам:** Добавь действие напоминания через 60 секунд. Проверь настройки разрешений, запроси их только при notDetermined; denied объясни пользователю.

<details>
<summary>Показать решение шага 6</summary>

В **ProspectList.swift** добавь код сразу после строкой `import SwiftUI`:

```swift
import UserNotifications
```

В **ProspectList.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var message = ""
    private func remind(_ person: Prospect) async {
        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        do {
            var allowed = settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional
            if settings.authorizationStatus == .notDetermined {
                allowed = try await center.requestAuthorization(options: [.alert, .sound])
            }
            guard allowed else { message = "Разреши уведомления в Настройках приложения"; return }
            let content = UNMutableNotificationContent()
            content.title = "Связаться с \(person.name)"
            content.sound = .default
            let request = UNNotificationRequest(identifier: person.id.uuidString, content: content,
                trigger: UNTimeIntervalNotificationTrigger(timeInterval: 60, repeats: false))
            try await center.add(request)
            message = "Напоминание запланировано"
        } catch { message = "Ошибка: \(error.localizedDescription)" }
    }
```

В **ProspectList.swift** найди этот блок:

```swift
Button("Показать QR") { selectedPerson = person }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Button("Показать QR") { selectedPerson = person }
                        Button("Напомнить через минуту") { Task { await remind(person) } }
```

В **ProspectList.swift** найди этот блок:

```swift
.sheet(item: $selectedPerson)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.safeAreaInset(edge: .bottom) { Text(message).padding() }
            .sheet(item: $selectedPerson)
```


</details>

**Ожидаемый результат:** Разрешённое напоминание планируется; отказ показывает сообщение. Для проверки доставки сверни приложение после постановки. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Notification request содержит content, trigger и identifier. UUID контакта позволяет заменить или отменить его напоминание. В foreground баннер по умолчанию может не показываться — это не ошибка планирования.

Разрешение запрашивается в момент понятного действия «Напомнить», а не при первом запуске. `.notDetermined` означает, что пользователь ещё не отвечал; `.denied` — уже отказал, и повторный request не заменит переход в настройки. Стабильный identifier позволяет обновить напоминание того же контакта, не создавая бесконечные дубликаты.

## Глубже — необязательно

::: details Advanced: сканер и persistence
Камерный сканер — отдельная интеграция: добавь NSCameraUsageDescription, обработай denied/restricted и сохрани ручной ввод. Проверяй префикс payload и UUID перед поиском записи. Этот QR передаёт ID уже известного контакта; для обмена полными контактами сначала определи формат данных. Хранение prospects в SwiftData можно добавить после работающих вкладок.
:::

## Самостоятельное изменение

<Challenge>
<template #task>Добавь отмену напоминания в contextMenu контакта.</template>
<template #knowledge>Используй состояние и функции, которые уже собрал в этом проекте.</template>
<template #hint1>Используй тот же identifier, что при создании request.</template>
<template #hint2>Проверь обычный случай и граничные значения; сохрани основной рабочий маршрут.</template>
<template #solution>

```swift
Button("Отменить напоминание") {
    UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [person.id.uuidString])
}
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
    @State private var prospects = Prospects()

    var body: some View {
        TabView {
            ProspectList(prospects: prospects, contacted: false)
                .tabItem { Label("Новые", systemImage: "person.badge.plus") }
            ProspectList(prospects: prospects, contacted: true)
                .tabItem { Label("Связались", systemImage: "checkmark.circle") }
        }
    }
}
```

### HotProspectsApp.swift

```swift
import SwiftUI

@main
struct HotProspectsApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

### Prospect.swift

```swift
import Foundation
struct Prospect: Identifiable {
    var id = UUID()
    var name: String
    var isContacted = false
}
```

### Prospects.swift

```swift
import Observation
@Observable
final class Prospects {
    func toggleContacted(for person: Prospect) {
        guard let index = people.firstIndex(where: { $0.id == person.id }) else { return }
        people[index].isContacted.toggle()
    }

    var people = [Prospect(name: "Анна"), Prospect(name: "Борис", isContacted: true)]
}
```

### ProspectList.swift

```swift
import SwiftUI
import UserNotifications

struct ProspectList: View {
    let prospects: Prospects
    let contacted: Bool
    @State private var name = ""

    @State private var selectedPerson: Prospect?

    @State private var message = ""
    private func remind(_ person: Prospect) async {
        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        do {
            var allowed = settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional
            if settings.authorizationStatus == .notDetermined {
                allowed = try await center.requestAuthorization(options: [.alert, .sound])
            }
            guard allowed else { message = "Разреши уведомления в Настройках приложения"; return }
            let content = UNMutableNotificationContent()
            content.title = "Связаться с \(person.name)"
            content.sound = .default
            let request = UNNotificationRequest(identifier: person.id.uuidString, content: content,
                trigger: UNTimeIntervalNotificationTrigger(timeInterval: 60, repeats: false))
            try await center.add(request)
            message = "Напоминание запланировано"
        } catch { message = "Ошибка: \(error.localizedDescription)" }
    }

    var body: some View {
        NavigationStack {
            List {
                ForEach(prospects.people.filter { $0.isContacted == contacted }.sorted { $0.name < $1.name }) { person in
                    Button {
                        prospects.toggleContacted(for: person)
                    } label: {
                        Label(person.name, systemImage: person.isContacted ? "checkmark.circle.fill" : "circle")
                    }
                    .accessibilityHint("Изменить статус контакта")
                    .contextMenu {
                        Button("Показать QR") { selectedPerson = person }
                        Button("Напомнить через минуту") { Task { await remind(person) } }
                    }
                }
            }
            .safeAreaInset(edge: .bottom) { Text(message).padding() }
            .sheet(item: $selectedPerson) { QRView(person: $0) }
            .navigationTitle(contacted ? "Связались" : "Новые")
            .toolbar {
                TextField("Имя", text: $name)
                Button("Добавить") {
                    prospects.people.append(Prospect(name: name.trimmingCharacters(in: .whitespacesAndNewlines)))
                    name = ""
                }
                .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
    }
}
```

### QRView.swift

```swift
import SwiftUI
import CoreImage.CIFilterBuiltins
struct QRView: View {
    let person: Prospect
    private var code: CGImage? {
        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data("swiftcourse:v1:\(person.id.uuidString)".utf8)
        guard let output = filter.outputImage?.transformed(by: .init(scaleX: 8, y: 8)) else { return nil }
        return CIContext().createCGImage(output, from: output.extent)
    }
    var body: some View {
        VStack {
            Text(person.name).font(.title)
            if let code {
                Image(decorative: code, scale: 1).interpolation(.none)
                    .resizable().scaledToFit().padding()
            } else { Text("Не удалось создать QR") }
            Text("Учебный ID: \(person.id.uuidString)").font(.caption)
        }
    }
}
```

</details>

<ProjectRecap slug="project-16-hot-prospects" />

Дальше применим gestures к карточкам: [Flashzilla →](/projects/project-17-flashzilla).
