---
title: Project 16 — Hot Prospects
description: TabView, shared data, QR-коды и notifications.
projectSlug: project-16-hot-prospects
---

# Project 16 — Hot Prospects

Hot Prospects помогает обмениваться контактами на встречах: показывает QR-код, сканирует чужой, разделяет людей на contacted/uncontacted и ставит напоминания.

<ProjectPrerequisites slug="project-16-hot-prospects" />

## Рабочий vertical slice

```swift
import SwiftUI
import Observation

struct Prospect: Identifiable {
    let id = UUID()
    var name: String
    var isContacted = false
}

@Observable
final class Prospects {
    var people = [
        Prospect(name: "Анна"),
        Prospect(name: "Борис", isContacted: true)
    ]
}

struct ProspectList: View {
    let prospects: Prospects
    let contacted: Bool

    var body: some View {
        List {
            ForEach(prospects.people.filter { $0.isContacted == contacted }) { person in
                HStack {
                    Text(person.name)
                    Spacer()
                    Image(systemName: person.isContacted ? "checkmark.circle.fill" : "circle")
                }
            }
        }
    }
}

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

После рабочего shared state добавляйте QR и notifications по одному.

## Shared data между tabs

Один observable container передаётся через environment всем экранам `TabView`. Каждый tab показывает фильтр одного Array, поэтому изменения сразу видны везде.

```swift
TabView {
    ProspectsView(filter: .none).tabItem { Label("Everyone", systemImage: "person.3") }
    ProspectsView(filter: .contacted).tabItem { Label("Contacted", systemImage: "checkmark.circle") }
}
.environment(prospects)
```

## Filter и sort

Не заводи три независимых Arrays. Computed property выбирает записи по enum filter, затем сортирует по выбранному правилу.

## Context menu и swipe actions

Действия должны работать не только через скрытый long press. Для важных операций добавь видимую кнопку или swipe action и accessibility label.

## QR codes

Core Image generator принимает `Data` и создаёт `CIImage`; масштабируй его без интерполяции, иначе края станут размытыми и код хуже сканируется.

Сканер требует camera permission и строки `NSCameraUsageDescription`. До показа камеры проверь authorization status, отдельно обработай denied/restricted и предложи ручной ввод как доступный fallback. QR payload версионируй и валидируй, например `swiftcourse:v1:<uuid>`: произвольную строку с камеры нельзя сразу считать доверенной моделью контакта. В Simulator показывай явное состояние «Камера недоступна».

## Local notifications

Сначала запроси разрешение в контексте понятного действия. Затем создай content, trigger и request с уникальным identifier.

Перед запросом прочитайте `notificationSettings()`: для `.denied` покажите путь в Settings, для `.notDetermined` объясните пользу и запросите разрешение, а для разрешённого состояния планируйте уведомление. Не просите camera и notifications при первом запуске без контекста.

```swift
let content = UNMutableNotificationContent()
content.title = "Связаться с \(prospect.name)"
content.sound = .default
let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 60, repeats: false)
```

<Challenge>
<template #task>Добавь ручное редактирование контакта, отмену reminder и сохранение prospects в SwiftData.</template>
<template #knowledge>Arrays, observable state, Codable/SwiftData, context menus и notifications.</template>
<template #hint1>Используй стабильный UUID prospect как identifier notification request.</template>
<template #hint2>При отмене передай тот же identifier в `removePendingNotificationRequests`.</template>
<template #solution>

```swift
UNUserNotificationCenter.current()
    .removePendingNotificationRequests(withIdentifiers: [prospect.id.uuidString])
```

</template>
</Challenge>

<ProjectRecap slug="project-16-hot-prospects" />

Дальше применим gestures к карточкам: [Flashzilla →](/projects/project-17-flashzilla).
