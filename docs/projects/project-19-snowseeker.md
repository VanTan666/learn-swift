---
title: Project 19 — SnowSeeker
description: Адаптивное приложение с NavigationSplitView, search и избранным.
projectSlug: project-19-snowseeker
---

# Project 19 — SnowSeeker

SnowSeeker — каталог горнолыжных курортов. На iPhone он работает как обычный navigation stack, а на iPad использует master-detail layout. Проект собирает data modeling, search, favorites и adaptive design.

<ProjectPrerequisites slug="project-19-snowseeker" />

## Рабочий vertical slice

```swift
import SwiftUI

struct Resort: Identifiable, Hashable {
    let id: Int
    let name: String
    let country: String
}

struct ContentView: View {
    private let resorts = [
        Resort(id: 1, name: "Шамони", country: "Франция"),
        Resort(id: 2, name: "Церматт", country: "Швейцария"),
        Resort(id: 3, name: "Роза Хутор", country: "Россия")
    ]
    @State private var selection: Resort?
    @State private var search = ""

    private var visibleResorts: [Resort] {
        search.isEmpty ? resorts : resorts.filter {
            $0.name.localizedStandardContains(search)
        }
    }

    var body: some View {
        NavigationSplitView {
            List(visibleResorts, selection: $selection) { resort in
                NavigationLink(value: resort) {
                    VStack(alignment: .leading) {
                        Text(resort.name)
                        Text(resort.country).foregroundStyle(.secondary)
                    }
                }
            }
            .searchable(text: $search)
            .navigationTitle("Курорты")
        } detail: {
            if let selection {
                VStack(spacing: 12) {
                    Text(selection.name).font(.largeTitle.bold())
                    Text(selection.country)
                }
            } else {
                ContentUnavailableView("Выберите курорт", systemImage: "snowflake")
            }
        }
    }
}

#Preview { ContentView() }
```

Проверьте узкое и широкое окно, пустой search result и выбор курорта. Favorites добавляйте после устойчивой navigation.

## NavigationSplitView

```swift
@State private var selectedResort: Resort?

NavigationSplitView {
    List(resorts, selection: $selectedResort) { resort in
        NavigationLink(value: resort) { ResortRow(resort: resort) }
    }
} detail: {
    if let selectedResort {
        ResortView(resort: selectedResort)
    } else {
        ContentUnavailableView("Выберите курорт", systemImage: "snowflake")
    }
}
```

Optional selected model естественно описывает момент, когда пользователь ещё ничего не выбрал.

## Search и sort

Search text и sort order — state. Computed property фильтрует и сортирует исходный Array, не создавая второго источника истины.

```swift
var filteredResorts: [Resort] {
    let result = searchText.isEmpty ? resorts : resorts.filter {
        $0.name.localizedStandardContains(searchText)
    }
    return result.sorted(using: sortOrder)
}
```

## Adaptive layout

`horizontalSizeClass` помогает выбрать компактное или просторное представление, но не привязывай решение к конкретной модели устройства. Окно iPad может стать узким в multitasking, а крупный Dynamic Type меняет полезную ширину. Для локального выбора компоновки предпочитайте `ViewThatFits`; проверяйте resizable window, split view, rotation и максимальный Dynamic Type.

## Favorites

Отдельный observable favorites store хранит Set идентификаторов. Set быстро отвечает, находится ли курорт в избранном, а Codable сохраняет выбор локально.

Храните selection как стабильный `Resort.ID`, если состояние должно пережить перезапуск или deep link. После загрузки данных восстановите model по ID и покажите fallback, если запись была удалена.

## Reusable details

Разбивай большой detail screen на небольшие View с явными inputs. Environment используй для действительно общих зависимостей, а не чтобы скрыть каждый параметр.

<Challenge>
<template #task>Добавь filter по стране/размеру/цене, favorites-only режим и полноценный empty state для поиска.</template>
<template #knowledge>Arrays, Sets, optionals, computed properties, navigation, search и adaptive layout.</template>
<template #hint1>Построй один pipeline: исходный Array → favorites filter → text filter → sort.</template>
<template #hint2>Не меняй исходный Array при поиске: иначе сброс запроса не восстановит данные.</template>
<template #solution>

```swift
var visibleResorts: [Resort] {
    resorts
        .filter { !favoritesOnly || favorites.contains($0.id) }
        .filter { searchText.isEmpty || $0.name.localizedStandardContains(searchText) }
        .sorted { $0.name < $1.name }
}
```

</template>
</Challenge>

<ProjectRecap slug="project-19-snowseeker" />

Ты прошёл последовательность от `let` и `var` до адаптивного SwiftUI-приложения. Заверши курс через [Final Exam →](/projects/milestone-final).
