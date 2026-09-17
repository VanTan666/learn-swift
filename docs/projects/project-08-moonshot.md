---
title: Project 8 — Moonshot
description: Codable, локальный JSON, grids и navigation на примере Apollo.
projectSlug: project-08-moonshot
---

# Project 8 — Moonshot

Moonshot показывает миссии Apollo и астронавтов из локальных JSON-файлов. Главная задача — превратить данные в строгие Swift types, а затем построить список и detail screens.

<ProjectPrerequisites slug="project-08-moonshot" />

## Рабочий vertical slice

```swift
import SwiftUI

struct Mission: Identifiable, Hashable, Decodable {
    let id: Int
    let name: String
    let year: Int
}

struct ContentView: View {
    private let missions = [
        Mission(id: 11, name: "Apollo 11", year: 1969),
        Mission(id: 12, name: "Apollo 12", year: 1969),
        Mission(id: 13, name: "Apollo 13", year: 1970)
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 150))]) {
                    ForEach(missions) { mission in
                        NavigationLink(value: mission) {
                            VStack {
                                Image(systemName: "moon.stars.fill")
                                    .font(.largeTitle)
                                Text(mission.name).font(.headline)
                                Text(mission.year, format: .number)
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(.blue.opacity(0.12))
                            .clipShape(.rect(cornerRadius: 12))
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Moonshot")
            .navigationDestination(for: Mission.self) { mission in
                VStack(spacing: 12) {
                    Text(mission.name).font(.largeTitle.bold())
                    Text("Год запуска: \(mission.year)")
                }
            }
        }
    }
}

#Preview { ContentView() }
```

Этот slice проверяет grid и value navigation без файлов. После запуска замените sample Array результатом generic decoder из следующего раздела.

## Модели Codable

```swift
struct Astronaut: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let description: String
}

struct Mission: Codable, Identifiable, Hashable {
    struct CrewRole: Codable, Hashable {
        let name: String
        let role: String
    }
    let id: Int
    let launchDate: Date?
    let crew: [CrewRole]
}
```

Nested struct показывает, что тип стоит объявлять рядом с местом использования. Optional date честно моделирует отсутствие даты.

## Один reusable decoder

Повторяющийся код чтения `Bundle` удобно вынести в generic extension. Здесь данные только читаются, поэтому достаточно более точного ограничения `Decodable`.

```swift
extension Bundle {
    func decode<T: Decodable>(_ file: String, as type: T.Type = T.self) throws -> T {
        guard let url = url(forResource: file, withExtension: nil) else {
            throw CocoaError(.fileNoSuchFile)
        }

        let data = try Data(contentsOf: url)
        let formatter = DateFormatter()
        formatter.dateFormat = "y-MM-dd"

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .formatted(formatter)
        return try decoder.decode(T.self, from: data)
    }
}
```

В настоящем проекте добавьте собственную ошибку с именем файла и исходной причиной: так неверный JSON находится за минуты. Не используйте `try!`, пока содержимое ресурса не проверяется тестом.

## ScrollView и LazyVGrid

`ScrollView` прокручивает произвольный контент. `LazyVGrid` создаёт только нужные на экране элементы, что полезно для длинных коллекций.

```swift
let columns = [GridItem(.adaptive(minimum: 150))]

ScrollView {
    LazyVGrid(columns: columns) {
        ForEach(missions) { mission in
            NavigationLink(value: mission) { MissionCard(mission: mission) }
        }
    }
}
.navigationDestination(for: Mission.self) { mission in
    MissionView(mission: mission, astronauts: astronauts)
}
```

Value-based navigation требует, чтобы `Mission` соответствовал `Hashable`. `NavigationLink(value:)` без соответствующего `.navigationDestination(for:)` не знает, какой экран открыть.

## Связываем crew с Dictionary

Mission хранит идентификаторы астронавтов, а отдельный Dictionary быстро находит полную модель по ключу. Если ID не найден, это ошибка согласованности локальных данных — обработай её явно.

<Challenge>
<template #task>Добавь переключатель между grid и list, сохрани выбранный режим и покажи дату запуска в локальном формате.</template>
<template #knowledge>Enums, state, conditions, Codable и optionals.</template>
<template #hint1>Создай enum `DisplayMode` и меняй content через `if` или `switch`.</template>
<template #hint2>Форматируй `Date?` через computed property с fallback «Дата неизвестна».</template>
<template #solution>

```swift
var formattedLaunchDate: String {
    launchDate?.formatted(date: .abbreviated, time: .omitted) ?? "Дата неизвестна"
}
```

</template>
</Challenge>

<ProjectRecap slug="project-08-moonshot" />

Следующий проект переключит внимание с данных на графику: [Drawing →](/projects/project-09-drawing).
