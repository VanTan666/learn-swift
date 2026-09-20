---
title: Project 8 — Moonshot
description: Codable, локальный JSON, grids и navigation на примере Apollo.
projectSlug: project-08-moonshot
---

# Project 8 — Moonshot

Moonshot показывает миссии Apollo и астронавтов из локальных JSON-файлов. Главная задача — превратить данные в строгие Swift types, а затем построить список и detail screens.

<ProjectPrerequisites slug="project-08-moonshot" />

## Стартовая точка

Создай новый **iOS → App** с именем **Moonshot** и интерфейсом SwiftUI. В сгенерированном `ContentView.swift` оставь минимальное состояние ниже. Сохрани файл `MoonshotApp.swift`, созданный Xcode; если шаг меняет точку входа, замени существующий файл, не создавай второй `@main`.

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Начало")
    }
}
```

Сначала прочитай задание шага и попробуй выполнить его. Решение закрыто: открой его для сверки или если застрял. Применяй изменения по порядку — каждый шаг опирается на предыдущий.

### Шаг 1. Модель миссии и список

**Цель:** Модель миссии и список.

**Попробуй сам:** Создай Mission с id, name и year. Покажи Apollo 11 в простом List.

<details>
<summary>Показать решение шага 1</summary>

**Mission.swift** — создай файл и включи его в target приложения.

```swift
import Foundation
struct Mission: Identifiable, Hashable, Decodable {
    let id: Int
    let name: String
    let year: Int
}
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    private let missions = [Mission(id: 11, name: "Apollo 11", year: 1969)]
```

В **ContentView.swift** найди этот блок:

```swift
Text("Начало")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
NavigationStack {
            List(missions) { mission in
                Text("\(mission.name), \(mission.year)")
            }
            .navigationTitle("Moonshot")
        }
```


</details>

**Ожидаемый результат:** В списке есть Apollo 11 и год 1969. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Модель описывает данные отдельно от разметки. Identifiable нужен для строк; Hashable понадобится навигации, а Decodable — чтению файла. Здесь это знакомое соответствие протоколам.

У Mission целочисленный id совпадает с номером миссии. Название и год — отдельные свойства, поэтому оформление можно менять без разбора строки. Пока список получает вручную созданный массив: если строка не отображается, причина находится в модели или View, а не в чтении JSON.

### Шаг 2. Адаптивная сетка

**Цель:** Адаптивная сетка.

**Попробуй сам:** Замени List на ScrollView с LazyVGrid. Карточка содержит значок луны, название и год.

<details>
<summary>Показать решение шага 2</summary>

В **ContentView.swift** найди этот блок:

```swift
List(missions) { mission in
                Text("\(mission.name), \(mission.year)")
            }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
ScrollView {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 150))]) {
                    ForEach(missions) { mission in
                        VStack {
                            Image(systemName: "moon.stars.fill").font(.largeTitle)
                            Text(mission.name).font(.headline)
                            Text(mission.year, format: .number)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(.blue.opacity(0.12))
                    }
                }
                .padding()
            }
```


</details>

**Ожидаемый результат:** Карточки заполняют доступную ширину; минимальная ширина колонки 150 точек. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** ScrollView отвечает за прокрутку, GridItem — за колонки. adaptive создаёт столько колонок, сколько помещается; LazyVGrid строит элементы по мере необходимости.

`GridItem(.adaptive(minimum: 150))` задаёт минимальную ширину одной колонки. Это не гарантия ровно двух колонок: узкому и широкому окну нужны разные количества. `.frame(maxWidth: .infinity)` растягивает карточку внутри уже выделенной колонки. Проверь изменение ширины Preview, прежде чем добавлять навигацию.

### Шаг 3. Навигация значением

**Цель:** Навигация значением.

**Попробуй сам:** Оберни карточку в NavigationLink(value: mission). Зарегистрируй destination для Mission с названием и годом.

<details>
<summary>Показать решение шага 3</summary>

В **ContentView.swift** найди этот блок:

```swift
                        VStack {
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
                        NavigationLink(value: mission) {
                        VStack {
```

В **ContentView.swift** найди этот блок:

```swift
                        .background(.blue.opacity(0.12))
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
                        .background(.blue.opacity(0.12))
                        }
```

В **ContentView.swift** найди этот блок:

```swift
.navigationTitle("Moonshot")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.navigationTitle("Moonshot")
            .navigationDestination(for: Mission.self) { mission in
                VStack {
                    Text(mission.name).font(.largeTitle)
                    Text("Год запуска: \(mission.year)")
                }
            }
```


</details>

**Ожидаемый результат:** Нажатие карточки открывает детали, Back возвращает к сетке. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Link передаёт Hashable-значение, destination связывает его тип с экраном. Обе части нужны: один link ещё не описывает, что открывать.

`.navigationDestination(for: Mission.self)` регистрирует обработчик типа Mission в NavigationStack. Closure получает именно выбранную миссию, поэтому детали не должны заново искать «текущий индекс». Так перестановка массива не перепутает содержимое уже открытого экрана.

### Шаг 4. Данные из JSON

**Цель:** Данные из JSON.

**Попробуй сам:** Создай missions.json и generic Bundle.decode. Загрузи [Mission] в @State; при ошибке покажи сообщение в том же экране.

<details>
<summary>Показать решение шага 4</summary>

**Bundle+Decode.swift** — создай файл и включи его в target приложения.

```swift
import Foundation
extension Bundle {
    func decode<T: Decodable>(_ file: String, as type: T.Type = T.self) throws -> T {
        guard let url = url(forResource: file, withExtension: nil) else {
            throw CocoaError(.fileNoSuchFile)
        }
        let data = try Data(contentsOf: url)
        return try JSONDecoder().decode(T.self, from: data)
    }
}
```

Создай ресурс **missions.json**, добавь в Project navigator с **Copy items if needed** и target membership приложения.

```json
[
  {"id": 11, "name": "Apollo 11", "year": 1969},
  {"id": 12, "name": "Apollo 12", "year": 1969}
]
```

В **ContentView.swift** найди этот блок:

```swift
    private let missions = [Mission(id: 11, name: "Apollo 11", year: 1969)]
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
    @State private var missions: [Mission] = []
    @State private var errorMessage: String?
    private func load() {
        do { missions = try Bundle.main.decode("missions.json") }
        catch { errorMessage = "Не удалось прочитать ресурсы: \(error.localizedDescription)" }
    }
```

В **ContentView.swift** найди этот блок:

```swift
.navigationTitle("Moonshot")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.navigationTitle("Moonshot")
            .task { load() }
            .safeAreaInset(edge: .bottom) {
                if let errorMessage { Text(errorMessage).foregroundStyle(.red) }
            }
```


</details>

**Ожидаемый результат:** Сетка показывает две миссии из файла. Неверный JSON сообщает ошибку вместо пустого экрана. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** T: Decodable ограничивает generic-функцию типами, которые можно прочитать. Тип [Mission] выводится из присваивания; перед проектом нужен Day 18. Bundle хранит ресурс, а do/catch отделяет ошибку от успешного результата.

В `decode<T: Decodable>` буква T обозначает будущий тип результата; ограничение после двоеточия задаёт доступную возможность декодирования. В вызове тип берётся из свойства `missions: [Mission]`. Это позволяет использовать одну функцию для разных файлов, но не отменяет совпадение ключей и типов Swift с JSON.

### Шаг 5. Экипаж в модели

**Цель:** Экипаж в модели.

**Попробуй сам:** Добавь вложенный CrewRole с name и role, а в Mission — crew. Обнови обе записи JSON.

<details>
<summary>Показать решение шага 5</summary>

В **Mission.swift** найди этот блок:

```swift
    let year: Int
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
    let year: Int
    struct CrewRole: Hashable, Decodable {
        let name: String
        let role: String
    }
    let crew: [CrewRole]
```

Создай ресурс **missions.json**, добавь в Project navigator с **Copy items if needed** и target membership приложения.

```json
[
  {"id": 11, "name": "Apollo 11", "year": 1969, "crew": [{"name": "armstrong", "role": "Командир"}]},
  {"id": 12, "name": "Apollo 12", "year": 1969, "crew": [{"name": "conrad", "role": "Командир"}]}
]
```


</details>

**Ожидаемый результат:** Проект снова читает JSON, навигация работает с расширенной моделью. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Вложенный тип принадлежит Mission по смыслу. JSON должен соответствовать обязательным полям модели; изменение только Swift без ресурса вызовет ошибку декодирования.

Вложенный CrewRole — небольшая запись связи: идентификатор человека и роль в миссии. Он не повторяет полное описание астронавта. У обеих миссий должен появиться ключ crew, потому что свойство не optional. Это хороший способ увидеть, что модель данных и ресурс образуют один контракт.

### Шаг 6. Справочник астронавтов

**Цель:** Справочник астронавтов.

**Попробуй сам:** Добавь astronauts.json и Astronaut. Загрузи словарь тем же decoder. В деталях сопоставь crew.name с ключом словаря; отсутствующий id покажи явно.

<details>
<summary>Показать решение шага 6</summary>

**Astronaut.swift** — создай файл и включи его в target приложения.

```swift
struct Astronaut: Decodable {
    let name: String
    let description: String
}
```

Создай ресурс **astronauts.json**, добавь в Project navigator с **Copy items if needed** и target membership приложения.

```json
{
  "armstrong": {"name": "Нил Армстронг", "description": "Командир Apollo 11."},
  "conrad": {"name": "Пит Конрад", "description": "Командир Apollo 12."}
}
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var astronauts: [String: Astronaut] = [:]
```

В **ContentView.swift** найди этот блок:

```swift
do { missions = try Bundle.main.decode("missions.json") }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
do {
            let loadedMissions: [Mission] = try Bundle.main.decode("missions.json")
            let loadedAstronauts: [String: Astronaut] = try Bundle.main.decode("astronauts.json")
            missions = loadedMissions
            astronauts = loadedAstronauts
            errorMessage = nil
        }
```

В **ContentView.swift** найди этот блок:

```swift
Text("Год запуска: \(mission.year)")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Text("Год запуска: \(mission.year)")
                    ForEach(mission.crew, id: \.name) { member in
                        if let astronaut = astronauts[member.name] {
                            VStack {
                                Text("\(astronaut.name) — \(member.role)")
                                Text(astronaut.description).foregroundStyle(.secondary)
                            }
                        } else {
                            Text("Нет данных для \(member.name)").foregroundStyle(.red)
                        }
                    }
```


</details>

**Ожидаемый результат:** У Apollo 11 показан Нил Армстронг, у Apollo 12 — Пит Конрад. Это сокращённые учебные экипажи, не полный состав миссий. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Dictionary связывает идентификатор с полной записью. Доступ по ключу возвращает Optional: несогласованность ресурсов нельзя превращать в падение через force unwrap.

Ключ словаря `armstrong` совпадает с `member.name`, но отличается от отображаемого имени. Эти строки выполняют разные задачи: ключ связывает данные, имя читает пользователь. Попробуй временно изменить один ключ в JSON и проверь явное сообщение о недостающей записи; затем восстанови ресурс.

## Глубже — необязательно

::: details Глубже: даты и изображения
Для расширенного JSON добавь `launchDate: Date?` и настрой dateDecodingStrategy под формат файла. Показывай fallback для неизвестной даты. Эмблемы миссий подключай отдельными assets после работающей навигации и справочника.
:::

## Самостоятельное изменение

<Challenge>
<template #task>Добавь переключатель между сеткой и списком, сохрани выбор между запусками.</template>
<template #knowledge>Используй состояние и функции, которые уже собрал в этом проекте.</template>
<template #hint1>@AppStorage достаточно для одного Bool; массив миссий остаётся общим.</template>
<template #hint2>Проверь обычный случай и граничные значения; сохрани основной рабочий маршрут.</template>
<template #solution>

```swift
@AppStorage("moonshotGrid") private var showsGrid = true
// Добавь Toggle в toolbar, а в body выбери Grid или List через if showsGrid.
// В обоих вариантах используй NavigationLink(value: mission).
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
    @State private var missions: [Mission] = []
    @State private var errorMessage: String?
    private func load() {
        do {
            let loadedMissions: [Mission] = try Bundle.main.decode("missions.json")
            let loadedAstronauts: [String: Astronaut] = try Bundle.main.decode("astronauts.json")
            missions = loadedMissions
            astronauts = loadedAstronauts
            errorMessage = nil
        }
        catch { errorMessage = "Не удалось прочитать ресурсы: \(error.localizedDescription)" }
    }

    @State private var astronauts: [String: Astronaut] = [:]

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 150))]) {
                    ForEach(missions) { mission in
                        NavigationLink(value: mission) {
                        VStack {
                            Image(systemName: "moon.stars.fill").font(.largeTitle)
                            Text(mission.name).font(.headline)
                            Text(mission.year, format: .number)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(.blue.opacity(0.12))
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Moonshot")
            .task { load() }
            .safeAreaInset(edge: .bottom) {
                if let errorMessage { Text(errorMessage).foregroundStyle(.red) }
            }
            .navigationDestination(for: Mission.self) { mission in
                VStack {
                    Text(mission.name).font(.largeTitle)
                    Text("Год запуска: \(mission.year)")
                    ForEach(mission.crew, id: \.name) { member in
                        if let astronaut = astronauts[member.name] {
                            VStack {
                                Text("\(astronaut.name) — \(member.role)")
                                Text(astronaut.description).foregroundStyle(.secondary)
                            }
                        } else {
                            Text("Нет данных для \(member.name)").foregroundStyle(.red)
                        }
                    }
                }
            }
        }
    }
}
```

### MoonshotApp.swift

```swift
import SwiftUI

@main
struct MoonshotApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

### Mission.swift

```swift
import Foundation
struct Mission: Identifiable, Hashable, Decodable {
    let id: Int
    let name: String
    let year: Int
    struct CrewRole: Hashable, Decodable {
        let name: String
        let role: String
    }
    let crew: [CrewRole]
}
```

### Bundle+Decode.swift

```swift
import Foundation
extension Bundle {
    func decode<T: Decodable>(_ file: String, as type: T.Type = T.self) throws -> T {
        guard let url = url(forResource: file, withExtension: nil) else {
            throw CocoaError(.fileNoSuchFile)
        }
        let data = try Data(contentsOf: url)
        return try JSONDecoder().decode(T.self, from: data)
    }
}
```

### Astronaut.swift

```swift
struct Astronaut: Decodable {
    let name: String
    let description: String
}
```

### Ресурс missions.json

```json
[
  {"id": 11, "name": "Apollo 11", "year": 1969, "crew": [{"name": "armstrong", "role": "Командир"}]},
  {"id": 12, "name": "Apollo 12", "year": 1969, "crew": [{"name": "conrad", "role": "Командир"}]}
]
```

### Ресурс astronauts.json

```json
{
  "armstrong": {"name": "Нил Армстронг", "description": "Командир Apollo 11."},
  "conrad": {"name": "Пит Конрад", "description": "Командир Apollo 12."}
}
```

</details>

<ProjectRecap slug="project-08-moonshot" />

Следующий проект переключит внимание с данных на графику: [Drawing →](/projects/project-09-drawing).
