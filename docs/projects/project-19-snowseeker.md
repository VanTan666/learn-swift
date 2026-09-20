---
title: Project 19 — SnowSeeker
description: Адаптивное приложение с NavigationSplitView, search и избранным.
projectSlug: project-19-snowseeker
---

# Project 19 — SnowSeeker

SnowSeeker — каталог горнолыжных курортов. На iPhone он работает как обычный navigation stack, а на iPad использует master-detail layout. Проект собирает data modeling, search, favorites и adaptive design.

<ProjectPrerequisites slug="project-19-snowseeker" />

## Стартовая точка

Создай новый **iOS → App** с именем **SnowSeeker** и интерфейсом SwiftUI. В сгенерированном `ContentView.swift` оставь минимальное состояние ниже. Сохрани файл `SnowSeekerApp.swift`, созданный Xcode; если шаг меняет точку входа, замени существующий файл, не создавай второй `@main`.

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Начало")
    }
}
```

Сначала прочитай задание шага и попробуй выполнить его. Решение закрыто: открой его для сверки или если застрял. Применяй изменения по порядку — каждый шаг опирается на предыдущий.

### Шаг 1. Каталог курортов

**Цель:** Каталог курортов.

**Попробуй сам:** Создай Resort и три sample-записи. Покажи название и страну в List.

<details>
<summary>Показать решение шага 1</summary>

**Resort.swift** — создай файл и включи его в target приложения.

```swift
struct Resort: Identifiable, Hashable {
    let id: Int
    let name: String
    let country: String
}
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    private let resorts = [
        Resort(id: 1, name: "Шамони", country: "Франция"),
        Resort(id: 2, name: "Церматт", country: "Швейцария"),
        Resort(id: 3, name: "Роза Хутор", country: "Россия")
    ]
```

В **ContentView.swift** найди этот блок:

```swift
Text("Начало")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
List(resorts) { resort in
            VStack(alignment: .leading) {
                Text(resort.name)
                Text(resort.country).foregroundStyle(.secondary)
            }
        }
```


</details>

**Ожидаемый результат:** Видны три курорта, пока без переходов. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Identifiable определяет строку, Hashable позволит использовать Resort как selection. Сначала проверяем данные независимо от адаптивной навигации.

Resort.id остаётся постоянным при фильтрации и сортировке. Имя и страна используются для отображения; они не должны менять идентичность записи. Пока массив встроен в код, можно проверить строки без сетевых зависимостей или подготовки JSON.

### Шаг 2. Выбор и NavigationSplitView

**Цель:** Выбор и NavigationSplitView.

**Попробуй сам:** Добавь optional selection. Свяжи List selection с NavigationLink(value:), а detail покажи только при выбранном курорте.

<details>
<summary>Показать решение шага 2</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var selection: Resort?
```

В **ContentView.swift** найди этот блок:

```swift
List(resorts) { resort in
            VStack(alignment: .leading) {
                Text(resort.name)
                Text(resort.country).foregroundStyle(.secondary)
            }
        }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
NavigationSplitView {
            List(resorts, selection: $selection) { resort in
                NavigationLink(value: resort) {
                    VStack(alignment: .leading) {
                        Text(resort.name)
                        Text(resort.country).foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Курорты")
        } detail: {
            if let selection {
                VStack(spacing: 12) {
                    Text(selection.name).font(.largeTitle)
                    Text(selection.country)
                }
            } else {
                ContentUnavailableView("Выберите курорт", systemImage: "snowflake")
            }
        }
```


</details>

**Ожидаемый результат:** На широком окне каталог и детали рядом; на узком выбор открывает детали с возвратом назад. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** NavigationSplitView адаптирует колонки к доступному месту. nil — обычное состояние до выбора, для него нужен явный placeholder.

`selection` принадлежит ContentView, поэтому sidebar и detail читают одно решение пользователя. NavigationLink передаёт целый Resort как Hashable-значение. На широком окне обе колонки могут быть видны одновременно; на компактном SwiftUI превращает выбор в переход. Не определяй этот режим вручную по названию iPhone или iPad.

### Шаг 3. Поиск без потери исходного массива

**Цель:** Поиск без потери исходного массива.

**Попробуй сам:** Добавь searchable и computed visibleResorts. Фильтруй по названию без изменения resorts.

<details>
<summary>Показать решение шага 3</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var search = ""
    private var visibleResorts: [Resort] {
        resorts.filter { search.isEmpty || $0.name.localizedStandardContains(search) }
    }
```

В **ContentView.swift** найди этот блок:

```swift
List(resorts, selection: $selection)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
List(visibleResorts, selection: $selection)
```

В **ContentView.swift** найди этот блок:

```swift
.navigationTitle("Курорты")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.navigationTitle("Курорты")
            .searchable(text: $search)
```


</details>

**Ожидаемый результат:** Поиск «шам» находит Шамони, очистка возвращает все три записи. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Результат — вычисление из исходного массива и строки запроса. Мутация resorts при поиске потеряла бы данные для последующего сброса.

`localizedStandardContains` выполняет привычное пользователю строковое сравнение. Пустая строка пропускает все записи благодаря условию слева от ||. Проверь последовательность «поиск → очистка → другой поиск»: исходный массив из трёх курортов должен оставаться доступным.

### Шаг 4. Сортировка и пустой результат

**Цель:** Сортировка и пустой результат.

**Попробуй сам:** Добавь выбор сортировки по имени или стране. Покажи ContentUnavailableView.search при отсутствии результатов.

<details>
<summary>Показать решение шага 4</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    enum SortMode: String, CaseIterable { case name = "Название", country = "Страна" }
    @State private var sortMode = SortMode.name
```

В **ContentView.swift** найди этот блок:

```swift
resorts.filter { search.isEmpty || $0.name.localizedStandardContains(search) }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
resorts.filter { search.isEmpty || $0.name.localizedStandardContains(search) }
            .sorted { sortMode == .name ? $0.name < $1.name : $0.country < $1.country }
```

В **ContentView.swift** найди этот блок:

```swift
.searchable(text: $search)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.searchable(text: $search)
            .overlay { if visibleResorts.isEmpty { ContentUnavailableView.search(text: search) } }
            .toolbar {
                Picker("Сортировка", selection: $sortMode) {
                    ForEach(SortMode.allCases, id: \.self) { Text($0.rawValue) }
                }
            }
```


</details>

**Ожидаемый результат:** Сортировка меняет порядок найденного; бессмысленный запрос показывает пояснение, очистка восстанавливает список. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Filter и sort составляют один pipeline. Enum описывает допустимые режимы, не создавая второй массив состояния.

CaseIterable даёт allCases для Picker, rawValue используется как подпись. Выбор сортировки — state, результат сортировки — вычисляемое значение. При поиске без совпадений overlay объясняет пустой список, но поле поиска остаётся доступным для исправления запроса.

### Шаг 5. Избранное с общим владельцем

**Цель:** Избранное с общим владельцем.

**Попробуй сам:** Создай observable Favorites с `Set<Int>`. Добавь кнопку переключения в деталях и значок в строке каталога.

<details>
<summary>Показать решение шага 5</summary>

**Favorites.swift** — создай файл и включи его в target приложения.

```swift
import Observation
@Observable
final class Favorites {
    var ids: Set<Int> = []
    func toggle(_ id: Int) {
        if ids.contains(id) { ids.remove(id) } else { ids.insert(id) }
    }
}
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var favorites = Favorites()
```

В **ContentView.swift** найди этот блок:

```swift
Text(resort.name)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Label(resort.name, systemImage: favorites.ids.contains(resort.id) ? "heart.fill" : "mountain.2")
```

В **ContentView.swift** найди этот блок:

```swift
Text(selection.country)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Text(selection.country)
                    Button(favorites.ids.contains(selection.id) ? "Убрать из избранного" : "В избранное") {
                        favorites.toggle(selection.id)
                    }
```


</details>

**Ожидаемый результат:** Выбранный курорт получает сердечко и в деталях, и в каталоге. Повторное нажатие снимает отметку. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Set хранит уникальные стабильные id. Один Favorites принадлежит ContentView; разные части интерфейса читают одну модель.

`contains(id)` проверяет членство в Set, insert и remove изменяют его. Когда кнопка детали вызывает toggle, строка каталога получает новое изображение из того же объекта. Не сохраняй отдельный isFavorite внутри каждой ResortRow — такие копии легко перестают совпадать.

### Шаг 6. Сохранение избранного

**Цель:** Сохранение избранного.

**Попробуй сам:** При создании Favorites читай массив Int из UserDefaults, при toggle сохраняй Set как массив.

<details>
<summary>Показать решение шага 6</summary>

В **Favorites.swift** найди этот блок:

```swift
import Observation
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
import Observation
import Foundation
```

В **Favorites.swift** найди этот блок:

```swift
    var ids: Set<Int> = []
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
    var ids: Set<Int> = []
    init() {
        ids = Set(UserDefaults.standard.array(forKey: "favoriteResorts") as? [Int] ?? [])
    }
```

В **Favorites.swift** найди этот блок:

```swift
if ids.contains(id) { ids.remove(id) } else { ids.insert(id) }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
if ids.contains(id) { ids.remove(id) } else { ids.insert(id) }
        UserDefaults.standard.set(Array(ids), forKey: "favoriteResorts")
```


</details>

**Ожидаемый результат:** После перезапуска сердечки остаются. Неизвестные id не мешают показу каталога. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** UserDefaults умеет хранить массив целых чисел; здесь Codable не нужен. Стабильные id связывают сохранённый выбор с текущими данными.

При чтении UserDefaults тип проверяется через `as? [Int]`: отсутствующий ключ даёт пустое множество. В сохранение передаём Array(ids), потому что UserDefaults не хранит Swift Set напрямую. Порядок массива здесь не важен — избранное описывает членство, а не порядок каталога.

### Шаг 7. Отдельные адаптивные детали

**Цель:** Отдельные адаптивные детали.

**Попробуй сам:** Вынеси detail в ResortDetailView с явными параметрами resort и favorites. Используй ScrollView и семантические шрифты.

<details>
<summary>Показать решение шага 7</summary>

**ResortDetailView.swift** — создай файл и включи его в target приложения.

```swift
import SwiftUI
struct ResortDetailView: View {
    let resort: Resort
    let favorites: Favorites
    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                Text(resort.name).font(.largeTitle)
                Text(resort.country)
                Button(favorites.ids.contains(resort.id) ? "Убрать из избранного" : "В избранное") {
                    favorites.toggle(resort.id)
                }
            }
            .padding()
        }
    }
}
```

В **ContentView.swift** найди этот блок:

```swift
VStack(spacing: 12) {
                    Text(selection.name).font(.largeTitle)
                    Text(selection.country)
                    Button(favorites.ids.contains(selection.id) ? "Убрать из избранного" : "В избранное") {
                        favorites.toggle(selection.id)
                    }
                }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
ResortDetailView(resort: selection, favorites: favorites)
```


</details>

**Ожидаемый результат:** Выбор и избранное работают после выделения View; крупный текст не обрезает детали в узком окне. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Параметры показывают зависимости компонента. Адаптация определяется доступным пространством, а не названием устройства; проверь узкое и широкое окно и Dynamic Type.

ResortDetailView получает конкретный курорт и общий Favorites. Параметры let запрещают подменить входные зависимости внутри View, но вызов метода объекта Favorites всё ещё может изменить его содержимое. Проверь узкое окно, длинный текст и крупный шрифт; ScrollView должен оставлять кнопку достижимой.

## Глубже — необязательно

::: details Глубже: восстановление selection
Для восстановления выбранного курорта после перезапуска сохраняй его стабильный ID. После загрузки каталога найди соответствующую модель; если её больше нет, верни состояние без выбора. Deep links и крупный сетевой каталог добавляй после основного маршрута.
:::

## Самостоятельное изменение

<Challenge>
<template #task>Добавь режим «Только избранное» перед поиском и сортировкой.</template>
<template #knowledge>Используй состояние и функции, которые уже собрал в этом проекте.</template>
<template #hint1>Не меняй исходный resorts; добавь ещё один filter в visibleResorts.</template>
<template #hint2>Проверь обычный случай и граничные значения; сохрани основной рабочий маршрут.</template>
<template #solution>

```swift
@State private var favoritesOnly = false
// Первый filter в pipeline:
// .filter { !favoritesOnly || favorites.ids.contains($0.id) }
// В toolbar:
Toggle("Только избранное", isOn: $favoritesOnly)
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
    private let resorts = [
        Resort(id: 1, name: "Шамони", country: "Франция"),
        Resort(id: 2, name: "Церматт", country: "Швейцария"),
        Resort(id: 3, name: "Роза Хутор", country: "Россия")
    ]

    @State private var selection: Resort?

    @State private var search = ""
    private var visibleResorts: [Resort] {
        resorts.filter { search.isEmpty || $0.name.localizedStandardContains(search) }
            .sorted { sortMode == .name ? $0.name < $1.name : $0.country < $1.country }
    }

    enum SortMode: String, CaseIterable { case name = "Название", country = "Страна" }
    @State private var sortMode = SortMode.name

    @State private var favorites = Favorites()

    var body: some View {
        NavigationSplitView {
            List(visibleResorts, selection: $selection) { resort in
                NavigationLink(value: resort) {
                    VStack(alignment: .leading) {
                        Label(resort.name, systemImage: favorites.ids.contains(resort.id) ? "heart.fill" : "mountain.2")
                        Text(resort.country).foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Курорты")
            .searchable(text: $search)
            .overlay { if visibleResorts.isEmpty { ContentUnavailableView.search(text: search) } }
            .toolbar {
                Picker("Сортировка", selection: $sortMode) {
                    ForEach(SortMode.allCases, id: \.self) { Text($0.rawValue) }
                }
            }
        } detail: {
            if let selection {
                ResortDetailView(resort: selection, favorites: favorites)
            } else {
                ContentUnavailableView("Выберите курорт", systemImage: "snowflake")
            }
        }
    }
}
```

### SnowSeekerApp.swift

```swift
import SwiftUI

@main
struct SnowSeekerApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

### Resort.swift

```swift
struct Resort: Identifiable, Hashable {
    let id: Int
    let name: String
    let country: String
}
```

### Favorites.swift

```swift
import Observation
import Foundation
@Observable
final class Favorites {
    var ids: Set<Int> = []
    init() {
        ids = Set(UserDefaults.standard.array(forKey: "favoriteResorts") as? [Int] ?? [])
    }
    func toggle(_ id: Int) {
        if ids.contains(id) { ids.remove(id) } else { ids.insert(id) }
        UserDefaults.standard.set(Array(ids), forKey: "favoriteResorts")
    }
}
```

### ResortDetailView.swift

```swift
import SwiftUI
struct ResortDetailView: View {
    let resort: Resort
    let favorites: Favorites
    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                Text(resort.name).font(.largeTitle)
                Text(resort.country)
                Button(favorites.ids.contains(resort.id) ? "Убрать из избранного" : "В избранное") {
                    favorites.toggle(resort.id)
                }
            }
            .padding()
        }
    }
}
```

</details>

<ProjectRecap slug="project-19-snowseeker" />

Ты прошёл последовательность от `let` и `var` до адаптивного SwiftUI-приложения. Заверши курс через [Final Exam →](/projects/milestone-final).
