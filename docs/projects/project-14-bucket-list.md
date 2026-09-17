---
title: Project 14 — Bucket List
description: MapKit, biometrics, networking и защищённое файловое хранение.
projectSlug: project-14-bucket-list
---

# Project 14 — Bucket List

Bucket List хранит памятные места на карте. Пользователь добавляет annotation, редактирует название и описание, получает сведения о nearby places и открывает данные после Face ID или Touch ID.

<ProjectPrerequisites slug="project-14-bucket-list" />

## Рабочий vertical slice

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

Добавьте `NSFaceIDUsageDescription` перед запуском на устройстве. Этот slice показывает честный locked/unlocked flow; добавление и сохранение точек идут следующим шагом.

## Location как value type

```swift
struct Location: Identifiable, Codable, Equatable {
    let id: UUID
    var name: String
    var description: String
    let latitude: Double
    let longitude: Double
}
```

Map показывает Array locations, а Binding к выбранной location позволяет редактировать копию и затем заменить соответствующий элемент по `id`.

## Map и annotations

```swift
MapReader { proxy in
    Map {
        ForEach(locations) { location in
            Annotation(location.name, coordinate: location.coordinate) {
                Image(systemName: "star.circle")
            }
        }
    }
}
```

Gesture position преобразуется в coordinate через `MapProxy`. Проверяй Optional результат преобразования.

## Файл вместо UserDefaults

JSON Array сохраняется в documents directory через `Data.write(to:options:)`. Опция `.completeFileProtection` шифрует файл, когда устройство заблокировано.

## Biometrics

`LAContext` сначала проверяет доступность политики, затем асинхронно оценивает её. Политика `.deviceOwnerAuthentication` разрешает системный fallback на код-пароль; вариант `WithBiometrics` допускает только биометрию. Любая ветка — успех, отказ, отмена — должна обновить UI на main actor.

```swift
if context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) {
    let success = try await context.evaluatePolicy(.deviceOwnerAuthentication,
                                                    localizedReason: "Откройте сохранённые места")
    isUnlocked = success
}
```

Для Face ID добавьте `NSFaceIDUsageDescription` в конфигурацию приложения.

::: details Глубже: границы защиты
`.completeFileProtection` защищает файл на заблокированном устройстве. Экран аутентификации сам по себе не шифрует уже прочитанные данные в памяти. Для учебного проекта достаточно различать эти два механизма; полноценную security model проектируют отдельно.
:::

<Challenge>
<template #task>Добавь сортировку locations, обработку недоступной biometrics и понятный empty state карты.</template>
<template #knowledge>Protocols, Comparable, errors, optionals, Codable и MapKit.</template>
<template #hint1>Реализуй `Comparable` по `name`, затем используй `locations.sorted()`.</template>
<template #hint2>Если biometrics нет, предложи системную device-owner authentication, а не блокируй приложение навсегда.</template>
<template #solution>

```swift
static func < (lhs: Location, rhs: Location) -> Bool {
    lhs.name.localizedStandardCompare(rhs.name) == .orderedAscending
}
```

</template>
</Challenge>

<ProjectRecap slug="project-14-bucket-list" />

Дальше проверим, доступен ли интерфейс разным пользователям: [Accessibility →](/projects/project-15-accessibility).
