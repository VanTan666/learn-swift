---
title: Project 12 — SwiftData Deep Dive
description: Relationships, predicates, сортировка и migration в SwiftData.
projectSlug: project-12-swiftdata
---

# Project 12 — SwiftData Deep Dive

Этот проект посвящён не отдельному приложению, а работе с растущей моделью данных. Мы фильтруем запросы, меняем сортировку и создаём relationships между models.

<ProjectPrerequisites slug="project-12-swiftdata" />

## Стартовая точка

Создай новый **iOS → App** с именем **Users** и интерфейсом SwiftUI. В сгенерированном `ContentView.swift` оставь минимальное состояние ниже. Сохрани файл `UsersApp.swift`, созданный Xcode; если шаг меняет точку входа, замени существующий файл, не создавай второй `@main`.

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Начало")
    }
}
```

Сначала прочитай задание шага и попробуй выполнить его. Решение закрыто: открой его для сверки или если застрял. Применяй изменения по порядку — каждый шаг опирается на предыдущий.

### Шаг 1. Две связанные модели

**Цель:** Две связанные модели.

**Попробуй сам:** Создай User с name, joinDate и массивом jobs; Job хранит name. Подключи обе модели к контейнеру.

<details>
<summary>Показать решение шага 1</summary>

**Models.swift** — создай файл и включи его в target приложения.

```swift
import Foundation
import SwiftData
@Model
final class User {
    var name: String
    var joinDate: Date
    @Relationship(deleteRule: .cascade) var jobs: [Job] = []
    init(name: String, joinDate: Date = .now) { self.name = name; self.joinDate = joinDate }
}
@Model
final class Job {
    var name: String
    init(name: String) { self.name = name }
}
```

В **UsersApp.swift** найди этот блок:

```swift
import SwiftUI
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
import SwiftUI
import SwiftData
```

В **UsersApp.swift** найди этот блок:

```swift
WindowGroup { ContentView() }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
WindowGroup { ContentView() }
            .modelContainer(for: [User.self, Job.self])
```


</details>

**Ожидаемый результат:** Пустой экран запускается с контейнером. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Relationship вводим до наполнения базы, чтобы не смешивать первый опыт связи с миграцией. Cascade означает, что задачи принадлежат пользователю и удаляются вместе с ним.

User хранит массив объектов Job, а не только их текстовые названия. Так задача становится отдельной сохраняемой моделью. Правило cascade описывает владение: при удалении User его jobs больше не нужны. Если бы задачи принадлежали нескольким пользователям, такое правило потребовало бы другого решения.

### Шаг 2. Добавление и чтение

**Цель:** Добавление и чтение.

**Попробуй сам:** Покажи @Query пользователей в List. Кнопка добавляет пользователя с текущей датой.

<details>
<summary>Показать решение шага 2</summary>

В **ContentView.swift** добавь код сразу после строкой `import SwiftUI`:

```swift
import SwiftData
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @Environment(\.modelContext) private var context
    @Query(sort: \User.name) private var users: [User]
```

В **ContentView.swift** найди этот блок:

```swift
Text("Начало")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
NavigationStack {
            List(users) { user in Text(user.name) }
            .navigationTitle("Users")
            .toolbar {
                Button("Добавить") { context.insert(User(name: "Пользователь \(users.count + 1)")) }
            }
        }
```


</details>

**Ожидаемый результат:** Новая строка появляется в алфавитном порядке. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Это повторение insert и Query из Bookworm. Сначала убедись, что базовый цикл работает, прежде чем настраивать фильтр запроса.

Сначала повторяем знакомый путь: context.insert → Query → List. Дата joinDate получает .now по умолчанию в initializer, поэтому вызывающий код может указать только имя. На этом шаге никакого поиска ещё нет — все записи должны быть видимы.

### Шаг 3. Отдельный экран результата запроса

**Цель:** Отдельный экран результата запроса.

**Попробуй сам:** Вынеси List и Query в UsersView. Перенеси кнопку добавления туда же, оставь NavigationStack у ContentView.

<details>
<summary>Показать решение шага 3</summary>

**UsersView.swift** — создай файл и включи его в target приложения.

```swift
import SwiftUI
import SwiftData
struct UsersView: View {
    @Environment(\.modelContext) private var context
    @Query(sort: \User.name) private var users: [User]
    var body: some View {
        List(users) { user in Text(user.name) }
        .toolbar {
            Button("Добавить") { context.insert(User(name: "Пользователь \(UUID().uuidString.prefix(4))")) }
        }
    }
}
```

**ContentView.swift** — замени файл целиком; здесь меняется его связная структура.

```swift
import SwiftUI
struct ContentView: View {
    var body: some View {
        NavigationStack {
            UsersView().navigationTitle("Users")
        }
    }
}
```


</details>

**Ожидаемый результат:** Добавление и список работают как прежде после выделения View. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** У Query будет собственный initializer, поэтому его владелец выделен отдельно. Родитель будет хранить параметры поиска, дочерний View — результат запроса.

Перенос Query в UsersView не создаёт новую базу. View остаётся внутри того же NavigationStack и наследует контейнер из App. Имя свойства `_users` появится в initializer следующим изменением: это техническое хранилище property wrapper, а не второй список пользователей.

### Шаг 4. Динамический Predicate

**Цель:** Динамический Predicate.

**Попробуй сам:** Добавь searchable в ContentView. Передавай текст в UsersView; инициализируй _users через Query с Predicate.

<details>
<summary>Показать решение шага 4</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var search = ""
```

В **ContentView.swift** найди этот блок:

```swift
UsersView().navigationTitle("Users")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
UsersView(search: search).navigationTitle("Users")
                .searchable(text: $search)
```

В **UsersView.swift** найди этот блок:

```swift
    @Query(sort: \User.name) private var users: [User]
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
    @Query private var users: [User]
    init(search: String) {
        _users = Query(filter: #Predicate<User> { user in
            search.isEmpty || user.name.localizedStandardContains(search)
        }, sort: [SortDescriptor(\User.name)])
    }
```


</details>

**Ожидаемый результат:** Поиск сокращает список; очистка строки восстанавливает результаты. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Property wrapper хранится в _users. Predicate описывает запрос к store, а не последующую фильтрацию всего массива в памяти.

`#Predicate<User>` принимает условие для одной модели user. При пустом search левая часть `||` разрешает все записи; иначе сравнивается имя. Predicate должен переводиться в запрос хранилища, поэтому сюда нельзя произвольно вставлять любую Swift-функцию. Мы используем поддерживаемое строковое сравнение.

### Шаг 5. Переключаемая сортировка

**Цель:** Переключаемая сортировка.

**Попробуй сам:** Добавь Toggle порядка имени и передавай направление в initializer UsersView.

<details>
<summary>Показать решение шага 5</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var reverse = false
```

В **ContentView.swift** найди этот блок:

```swift
UsersView(search: search)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
UsersView(search: search, reverse: reverse)
```

В **ContentView.swift** найди этот блок:

```swift
.searchable(text: $search)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.searchable(text: $search)
                .toolbar { Toggle("Обратный порядок", isOn: $reverse) }
```

В **UsersView.swift** найди этот блок:

```swift
init(search: String)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
init(search: String, reverse: Bool)
```

В **UsersView.swift** найди этот блок:

```swift
SortDescriptor(\User.name)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
SortDescriptor(\User.name, order: reverse ? .reverse : .forward)
```


</details>

**Ожидаемый результат:** Переключатель разворачивает порядок текущих результатов поиска. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** SortDescriptor задаёт сортировку в запросе. Поисковая строка и направление — входы View, поэтому смена любого из них создаёт соответствующий Query.

`.forward` и `.reverse` относятся к порядку SortDescriptor, а не к порядку исходного массива в памяти. Комбинация filter и sort описывает один запрос. Проверь сначала поиск, затем переключи порядок: фильтр должен сохраниться, а поменяться должна только последовательность найденного.

### Шаг 6. Изменение relationship и удаление

**Цель:** Изменение relationship и удаление.

**Попробуй сам:** В строке показывай jobs.count и кнопку добавления задачи. Добавь onDelete пользователя. После каждой операции явно сохраняй context с видимой ошибкой.

<details>
<summary>Показать решение шага 6</summary>

В **UsersView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var message = ""
    private func save() {
        do { try context.save(); message = "Сохранено" }
        catch { context.rollback(); message = "Ошибка: \(error.localizedDescription)" }
    }
```

В **UsersView.swift** найди этот блок:

```swift
List(users) { user in Text(user.name) }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
List {
            ForEach(users) { user in
                VStack(alignment: .leading) {
                    Text(user.name)
                    Text("Задач: \(user.jobs.count)")
                    Button("Добавить задачу") {
                        user.jobs.append(Job(name: "Новая задача"))
                        save()
                    }
                }
            }
            .onDelete { indexes in
                for index in indexes { context.delete(users[index]) }
                save()
            }
            Text(message)
        }
```

В **UsersView.swift** найди этот блок:

```swift
context.insert(User(name: "Пользователь \(UUID().uuidString.prefix(4))"))
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
context.insert(User(name: "Пользователь \(UUID().uuidString.prefix(4))")); save()
```


</details>

**Ожидаемый результат:** Количество задач растёт у выбранного пользователя. Удаление пользователя удаляет его задачи; остальные пользователи сохраняются. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Добавление Job в relationship связывает модели. Cascade применяется при удалении родителя. Ошибка save должна быть видимой, чтобы не перепутать изменение памяти с записью на диск.

`user.jobs.append(...)` связывает новую задачу с конкретным объектом. Счётчик читает relationship, поэтому обновляется после добавления. При удалении используем объекты из текущего Query, затем save применяет правило cascade. Не удаляй строки из результата Query вручную.

### Шаг 7. Проверка числа задач в store

**Цель:** Проверка числа задач в store.

**Попробуй сам:** Добавь кнопку fetchCount для Job. Покажи результат в message; проверь количество до и после удаления пользователя.

<details>
<summary>Показать решение шага 7</summary>

В **UsersView.swift** найди этот блок:

```swift
        .toolbar {
            Button("Добавить")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
        .toolbar {
            Button("Посчитать задачи") {
                do { message = "Всего задач: \(try context.fetchCount(FetchDescriptor<Job>()))" }
                catch { message = "Ошибка подсчёта: \(error.localizedDescription)" }
            }
            Button("Добавить")
```


</details>

**Ожидаемый результат:** Удаление пользователя с двумя задачами уменьшает общее число Job на два. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** FetchDescriptor нужен для явного запроса вне @Query. fetchCount считает записи без загрузки всего массива; это удобная проверка правила cascade.

`FetchDescriptor<Job>()` без фильтра означает все задачи в хранилище. fetchCount возвращает число, а не массив Job. Создай два разных User, добавь задачи обоим, удали одного и пересчитай: должны исчезнуть только принадлежавшие ему задачи.

## Глубже — необязательно

::: details Advanced: исполняемый migration plan
Для реального обновления зафиксируйте версии schema и явный migration plan. Добавление optional property или property с совместимым default обычно допускает lightweight migration:

```swift
enum AppSchemaV1: VersionedSchema {
    static var versionIdentifier = Schema.Version(1, 0, 0)
    static var models: [any PersistentModel.Type] { [User.self] }

    @Model final class User {
        var name: String
        init(name: String) { self.name = name }
    }
}

enum AppSchemaV2: VersionedSchema {
    static var versionIdentifier = Schema.Version(2, 0, 0)
    static var models: [any PersistentModel.Type] { [User.self] }

    @Model final class User {
        var name: String
        var notes: String?
        init(name: String, notes: String? = nil) {
            self.name = name
            self.notes = notes
        }
    }
}

enum AppMigrationPlan: SchemaMigrationPlan {
    static var schemas: [any VersionedSchema.Type] {
        [AppSchemaV1.self, AppSchemaV2.self]
    }

    static var stages: [MigrationStage] {
        [.lightweight(fromVersion: AppSchemaV1.self, toVersion: AppSchemaV2.self)]
    }
}
```

Перед релизом создайте store старой версии с тестовыми данными, откройте его новым container с `AppMigrationPlan` и проверьте, что записи и relationships сохранились. Для учебного проекта этот блок можно пропустить.
:::

## Самостоятельное изменение

<Challenge>
<template #task>Добавь фильтр пользователей по минимальной дате регистрации.</template>
<template #knowledge>Используй состояние и функции, которые уже собрал в этом проекте.</template>
<template #hint1>Передай дату в initializer и добавь условие к Predicate.</template>
<template #hint2>Проверь обычный случай и граничные значения; сохрани основной рабочий маршрут.</template>
<template #solution>

```swift
// Дополнительное условие внутри существующего Predicate:
// && user.joinDate >= minimumJoinDate
// minimumJoinDate передаётся параметром initializer UsersView.
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
    @State private var search = ""

    @State private var reverse = false

    var body: some View {
        NavigationStack {
            UsersView(search: search, reverse: reverse).navigationTitle("Users")
                .searchable(text: $search)
                .toolbar { Toggle("Обратный порядок", isOn: $reverse) }
        }
    }
}
```

### UsersApp.swift

```swift
import SwiftUI
import SwiftData

@main
struct UsersApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
            .modelContainer(for: [User.self, Job.self])
    }
}
```

### Models.swift

```swift
import Foundation
import SwiftData
@Model
final class User {
    var name: String
    var joinDate: Date
    @Relationship(deleteRule: .cascade) var jobs: [Job] = []
    init(name: String, joinDate: Date = .now) { self.name = name; self.joinDate = joinDate }
}
@Model
final class Job {
    var name: String
    init(name: String) { self.name = name }
}
```

### UsersView.swift

```swift
import SwiftUI
import SwiftData
struct UsersView: View {
    @Environment(\.modelContext) private var context
    @Query private var users: [User]
    init(search: String, reverse: Bool) {
        _users = Query(filter: #Predicate<User> { user in
            search.isEmpty || user.name.localizedStandardContains(search)
        }, sort: [SortDescriptor(\User.name, order: reverse ? .reverse : .forward)])
    }
    @State private var message = ""
    private func save() {
        do { try context.save(); message = "Сохранено" }
        catch { context.rollback(); message = "Ошибка: \(error.localizedDescription)" }
    }

    var body: some View {
        List {
            ForEach(users) { user in
                VStack(alignment: .leading) {
                    Text(user.name)
                    Text("Задач: \(user.jobs.count)")
                    Button("Добавить задачу") {
                        user.jobs.append(Job(name: "Новая задача"))
                        save()
                    }
                }
            }
            .onDelete { indexes in
                for index in indexes { context.delete(users[index]) }
                save()
            }
            Text(message)
        }
        .toolbar {
            Button("Посчитать задачи") {
                do { message = "Всего задач: \(try context.fetchCount(FetchDescriptor<Job>()))" }
                catch { message = "Ошибка подсчёта: \(error.localizedDescription)" }
            }
            Button("Добавить") { context.insert(User(name: "Пользователь \(UUID().uuidString.prefix(4))")); save() }
        }
    }
}
```

</details>

<ProjectRecap slug="project-12-swiftdata" />

Закрепи data flow в [Milestone Projects 10–12 →](/projects/milestone-10-12).
