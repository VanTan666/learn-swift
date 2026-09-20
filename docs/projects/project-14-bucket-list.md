---
title: Project 14 — Bucket List
description: MapKit, biometrics, networking и защищённое файловое хранение.
projectSlug: project-14-bucket-list
---

# Project 14 — Bucket List

Bucket List хранит памятные места на карте. Пользователь добавляет точки, редактирует название и описание, сохраняет список в файл. Защиту через Face ID или Touch ID разберём после рабочей карты в дополнительном блоке.

<ProjectPrerequisites slug="project-14-bucket-list" />

## Стартовая точка

Создай новый **iOS → App** с именем **BucketList** и интерфейсом SwiftUI. В сгенерированном `ContentView.swift` оставь минимальное состояние ниже. Сохрани файл `BucketListApp.swift`, созданный Xcode; если шаг меняет точку входа, замени существующий файл, не создавай второй `@main`.

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Начало")
    }
}
```

Сначала прочитай задание шага и попробуй выполнить его. Решение закрыто: открой его для сверки или если застрял. Применяй изменения по порядку — каждый шаг опирается на предыдущий.

### Шаг 1. Карта

**Цель:** Карта.

**Попробуй сам:** Подключи MapKit и покажи Map без собственных точек.

<details>
<summary>Показать решение шага 1</summary>

В **ContentView.swift** добавь код сразу после строкой `import SwiftUI`:

```swift
import MapKit
```

В **ContentView.swift** найди этот блок:

```swift
Text("Начало")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Map()
```


</details>

**Ожидаемый результат:** Отображается карта, которую можно перемещать и масштабировать. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Map отображает картографические данные. Для карты без текущей геолокации пользователя разрешение на location не требуется.

Map сам управляет стандартными жестами перемещения и масштаба. Пока не добавляем запрос текущей позиции: это отдельная возможность с собственным разрешением. Для проверки достаточно появления картографической подложки и реакции на жесты; при отсутствии сети новые тайлы могут загружаться не сразу.

### Шаг 2. Модель места и Marker

**Цель:** Модель места и Marker.

**Попробуй сам:** Создай Codable Location с UUID, названием, описанием, широтой и долготой. Покажи тестовую точку Эрмитажа через Marker.

<details>
<summary>Показать решение шага 2</summary>

**Location.swift** — создай файл и включи его в target приложения.

```swift
import Foundation
import MapKit
struct Location: Identifiable, Codable, Equatable {
    var id = UUID()
    var name: String
    var description = ""
    let latitude: Double
    let longitude: Double
    var coordinate: CLLocationCoordinate2D { .init(latitude: latitude, longitude: longitude) }
}
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var locations = [Location(name: "Эрмитаж", latitude: 59.9398, longitude: 30.3146)]
```

В **ContentView.swift** найди этот блок:

```swift
Map()
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Map {
            ForEach(locations) { location in
                Marker(location.name, coordinate: location.coordinate)
            }
        }
```


</details>

**Ожидаемый результат:** Карта показывает одну подписанную точку. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Координаты сохраняем как Double, а CLLocationCoordinate2D вычисляем для Map. Так модель остаётся Codable без ручного кодирования framework-типа.

Location — value type, поэтому её можно скопировать для редактирования. id отличает место от других даже при одинаковом названии. Computed coordinate создаёт framework-значение только там, где его требует Marker; сохранение по-прежнему работает с обычными числами.

### Шаг 3. Добавление точки касанием

**Цель:** Добавление точки касанием.

**Попробуй сам:** Оберни Map в MapReader. Преобразуй локальную позицию tap в координату и добавь новую Location.

<details>
<summary>Показать решение шага 3</summary>

В **ContentView.swift** найди этот блок:

```swift
Map {
            ForEach(locations) { location in
                Marker(location.name, coordinate: location.coordinate)
            }
        }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
MapReader { proxy in
            Map {
                ForEach(locations) { location in
                    Marker(location.name, coordinate: location.coordinate)
                }
            }
            .onTapGesture { position in
                guard let coordinate = proxy.convert(position, from: .local) else { return }
                locations.append(Location(name: "Новое место", latitude: coordinate.latitude, longitude: coordinate.longitude))
            }
        }
```


</details>

**Ожидаемый результат:** Касание пустого места создаёт новую точку; Optional-преобразование не вызывает падения. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** MapProxy переводит координаты View в географические координаты. Проверяй guard let, потому что преобразование может быть недоступно.

Позиция tap измеряется внутри View, latitude и longitude — на Земле. Поэтому нельзя просто записать position.x в longitude. Proxy учитывает масштаб и положение карты. Попробуй добавить точки при двух разных масштабах: они должны оставаться привязаны к географии.

### Шаг 4. Редактирование копии

**Цель:** Редактирование копии.

**Попробуй сам:** Сделай annotation кнопкой и покажи EditLocationView через sheet(item:). Редактируй копию и возвращай её через onSave.

<details>
<summary>Показать решение шага 4</summary>

**EditLocationView.swift** — создай файл и включи его в target приложения.

```swift
import SwiftUI
struct EditLocationView: View {
    @Environment(\.dismiss) private var dismiss
    @State var location: Location
    let onSave: (Location) -> Void
    var body: some View {
        NavigationStack {
            Form {
                TextField("Название", text: $location.name)
                TextField("Описание", text: $location.description)
            }
            .toolbar {
                Button("Отмена") { dismiss() }
                Button("Сохранить") { onSave(location); dismiss() }
                    .disabled(location.name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
    }
}
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var selection: Location?
```

В **ContentView.swift** найди этот блок:

```swift
Marker(location.name, coordinate: location.coordinate)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Annotation(location.name, coordinate: location.coordinate) {
                        Button { selection = location } label: {
                            Image(systemName: "star.circle.fill").font(.title)
                        }
                        .accessibilityLabel("Изменить \(location.name)")
                    }
```

В **ContentView.swift** найди этот блок:

```swift
            .onTapGesture { position in
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
            .sheet(item: $selection) { location in
                EditLocationView(location: location) { updated in
                    guard let index = locations.firstIndex(where: { $0.id == updated.id }) else { return }
                    locations[index] = updated
                }
            }
            .onTapGesture { position in
```


</details>

**Ожидаемый результат:** Нажатие значка открывает форму; «Сохранить» заменяет место по id, отмена оставляет исходное значение. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Копия защищает ещё не подтверждённый ввод. Closure возвращает результат владельцу массива. Идентификатор остаётся прежним, даже когда название изменилось.

`.sheet(item:)` использует Optional: nil означает закрытую форму, выбранная Location — открытую. EditLocationView получает исходное значение в собственный @State и передаёт подтверждённую копию через closure. Поиск по id при сохранении нужен потому, что название пользователь мог изменить.

### Шаг 5. Файловое сохранение

**Цель:** Файловое сохранение.

**Попробуй сам:** Сохраняй JSON в documentsDirectory после добавления и редактирования. При первом запуске отсутствие файла нормально; повреждённый файл покажи как ошибку.

<details>
<summary>Показать решение шага 5</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    private let saveURL = URL.documentsDirectory.appending(path: "locations.json")
    @State private var errorMessage: String?
    @State private var canSave = true
    private func load() {
        guard FileManager.default.fileExists(atPath: saveURL.path) else { return }
        do { locations = try JSONDecoder().decode([Location].self, from: Data(contentsOf: saveURL)) }
        catch { canSave = false; errorMessage = "Не удалось прочитать места: \(error.localizedDescription)" }
    }
    private func save() {
        guard canSave else { errorMessage = "Сначала восстанови повреждённый файл мест"; return }
        do {
            try JSONEncoder().encode(locations).write(to: saveURL, options: [.atomic, .completeFileProtection])
        } catch { errorMessage = "Не удалось сохранить: \(error.localizedDescription)" }
    }
```

В **ContentView.swift** найди этот блок:

```swift
locations[index] = updated
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
locations[index] = updated
                    save()
```

В **ContentView.swift** найди этот блок:

```swift
locations.append(Location(name: "Новое место", latitude: coordinate.latitude, longitude: coordinate.longitude))
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
locations.append(Location(name: "Новое место", latitude: coordinate.latitude, longitude: coordinate.longitude))
                save()
```

В **ContentView.swift** найди этот блок:

```swift
            .sheet(item: $selection)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
            .task { load() }
            .alert("Ошибка данных", isPresented: Binding(
                get: { errorMessage != nil }, set: { if !$0 { errorMessage = nil } }
            )) { Button("OK") { errorMessage = nil } }
            message: { Text(errorMessage ?? "") }
            .sheet(item: $selection)
```


</details>

**Ожидаемый результат:** Новые точки и названия переживают перезапуск. Ошибка чтения или записи видна на карте. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Data.write с atomic заменяет файл целиком. File protection действует при блокировке устройства; это отличается от отдельного экрана входа. После ошибки чтения не перезаписываем файл автоматически.

documentsDirectory — каталог данных конкретного приложения. `.atomic` сначала подготавливает новую версию файла и затем заменяет старую, уменьшая риск частичной записи. При ошибке чтения canSave запрещает незаметно затереть повреждённый файл новыми тестовыми данными. В учебной проверке используй только созданные тобой записи.

## Глубже — необязательно

::: details Глубже: Face ID / Touch ID
Сначала попробуй закрыть карту экраном с кнопкой «Открыть». Добавь `NSFaceIDUsageDescription` в Target → Info. Следующий самостоятельный пример показывает весь цикл аутентификации; он не заменяет собранную карту и не сохраняет места. После проверки перенеси ветку карты и её загрузку внутрь `if isUnlocked`.

```swift
import SwiftUI
import MapKit
import LocalAuthentication

struct Location: Identifiable {
    let id = UUID()
    let name: String
    let coordinate: CLLocationCoordinate2D
}

struct ContentView: View {
    @State private var isUnlocked = false
    @State private var message = "Откройте список мест"
    private let locations = [
        Location(name: "Эрмитаж", coordinate: .init(latitude: 59.9398, longitude: 30.3146))
    ]

    var body: some View {
        Group {
            if isUnlocked {
                Map {
                    ForEach(locations) { location in
                        Marker(location.name, coordinate: location.coordinate)
                    }
                }
            } else {
                ContentUnavailableView {
                    Label("Места закрыты", systemImage: "lock")
                } description: {
                    Text(message)
                } actions: {
                    Button("Открыть") { Task { await authenticate() } }
                        .buttonStyle(.borderedProminent)
                }
            }
        }
    }

    @MainActor
    private func authenticate() async {
        let context = LAContext()
        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) else {
            message = "На устройстве не настроена аутентификация"
            return
        }

        do {
            isUnlocked = try await context.evaluatePolicy(
                .deviceOwnerAuthentication,
                localizedReason: "Открыть сохранённые места"
            )
        } catch {
            message = "Не удалось открыть места"
        }
    }
}
```

Политика deviceOwnerAuthentication допускает системный код-пароль. Ошибка или отмена оставляют экран закрытым. Этот экран не шифрует данные в памяти; completeFileProtection относится к файлу на заблокированном устройстве. Загрузку nearby places через сеть добавляй отдельным упражнением после карты и persistence.
:::

## Самостоятельное изменение

<Challenge>
<template #task>Добавь удаление выбранного места из формы редактирования.</template>
<template #knowledge>Используй состояние и функции, которые уже собрал в этом проекте.</template>
<template #hint1>Передай onDelete closure от владельца; удаляй по id и вызывай уже готовый save.</template>
<template #hint2>Проверь обычный случай и граничные значения; сохрани основной рабочий маршрут.</template>
<template #solution>

```swift
// Closure, передаваемая родителем в редактор:
locations.removeAll { $0.id == location.id }
save()
// После вызова onDelete редактор выполняет dismiss().
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
import MapKit


struct ContentView: View {
    @State private var locations = [Location(name: "Эрмитаж", latitude: 59.9398, longitude: 30.3146)]

    @State private var selection: Location?

    private let saveURL = URL.documentsDirectory.appending(path: "locations.json")
    @State private var errorMessage: String?
    @State private var canSave = true
    private func load() {
        guard FileManager.default.fileExists(atPath: saveURL.path) else { return }
        do { locations = try JSONDecoder().decode([Location].self, from: Data(contentsOf: saveURL)) }
        catch { canSave = false; errorMessage = "Не удалось прочитать места: \(error.localizedDescription)" }
    }
    private func save() {
        guard canSave else { errorMessage = "Сначала восстанови повреждённый файл мест"; return }
        do {
            try JSONEncoder().encode(locations).write(to: saveURL, options: [.atomic, .completeFileProtection])
        } catch { errorMessage = "Не удалось сохранить: \(error.localizedDescription)" }
    }

    var body: some View {
        MapReader { proxy in
            Map {
                ForEach(locations) { location in
                    Annotation(location.name, coordinate: location.coordinate) {
                        Button { selection = location } label: {
                            Image(systemName: "star.circle.fill").font(.title)
                        }
                        .accessibilityLabel("Изменить \(location.name)")
                    }
                }
            }
            .task { load() }
            .alert("Ошибка данных", isPresented: Binding(
                get: { errorMessage != nil }, set: { if !$0 { errorMessage = nil } }
            )) { Button("OK") { errorMessage = nil } }
            message: { Text(errorMessage ?? "") }
            .sheet(item: $selection) { location in
                EditLocationView(location: location) { updated in
                    guard let index = locations.firstIndex(where: { $0.id == updated.id }) else { return }
                    locations[index] = updated
                    save()
                }
            }
            .onTapGesture { position in
                guard let coordinate = proxy.convert(position, from: .local) else { return }
                locations.append(Location(name: "Новое место", latitude: coordinate.latitude, longitude: coordinate.longitude))
                save()
            }
        }
    }
}
```

### BucketListApp.swift

```swift
import SwiftUI

@main
struct BucketListApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

### Location.swift

```swift
import Foundation
import MapKit
struct Location: Identifiable, Codable, Equatable {
    var id = UUID()
    var name: String
    var description = ""
    let latitude: Double
    let longitude: Double
    var coordinate: CLLocationCoordinate2D { .init(latitude: latitude, longitude: longitude) }
}
```

### EditLocationView.swift

```swift
import SwiftUI
struct EditLocationView: View {
    @Environment(\.dismiss) private var dismiss
    @State var location: Location
    let onSave: (Location) -> Void
    var body: some View {
        NavigationStack {
            Form {
                TextField("Название", text: $location.name)
                TextField("Описание", text: $location.description)
            }
            .toolbar {
                Button("Отмена") { dismiss() }
                Button("Сохранить") { onSave(location); dismiss() }
                    .disabled(location.name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
    }
}
```

</details>

<ProjectRecap slug="project-14-bucket-list" />

Дальше проверим, доступен ли интерфейс разным пользователям: [Accessibility →](/projects/project-15-accessibility).
