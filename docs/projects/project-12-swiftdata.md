---
title: Project 12 — SwiftData Deep Dive
description: Relationships, predicates, сортировка и migration в SwiftData.
projectSlug: project-12-swiftdata
---

# Project 12 — SwiftData Deep Dive

Этот проект посвящён не отдельному приложению, а работе с растущей моделью данных. Мы фильтруем запросы, меняем сортировку и создаём relationships между models.

<ProjectPrerequisites slug="project-12-swiftdata" />

## Рабочий vertical slice

```swift
import SwiftUI
import SwiftData

@Model
final class User {
    var name: String
    var joinDate: Date

    init(name: String, joinDate: Date = .now) {
        self.name = name
        self.joinDate = joinDate
    }
}

struct ContentView: View {
    @Environment(\.modelContext) private var context
    @Query(sort: \User.name) private var users: [User]
    @State private var filter = ""

    private var visibleUsers: [User] {
        filter.isEmpty ? users : users.filter { $0.name.localizedStandardContains(filter) }
    }

    var body: some View {
        NavigationStack {
            List(visibleUsers) { user in
                Text(user.name)
            }
            .searchable(text: $filter)
            .navigationTitle("Users")
            .toolbar {
                Button("Добавить", systemImage: "plus") {
                    context.insert(User(name: "Пользователь \(users.count + 1)"))
                }
            }
        }
    }
}

@main
struct UsersApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
            .modelContainer(for: User.self)
    }
}
```

Этот slice намеренно фильтрует небольшой fetched Array в памяти. После того как insert/search работают, следующий раздел показывает dynamic `@Query` для запроса к store.

## Динамический @Query

Query можно настроить в initializer View, сохранив сам wrapper в `_users`.

```swift
struct UsersView: View {
    @Query var users: [User]

    init(minimumJoinDate: Date, sort: [SortDescriptor<User>]) {
        _users = Query(filter: #Predicate<User> { user in
            user.joinDate >= minimumJoinDate
        }, sort: sort)
    }
}
```

Predicate описывается type-safe Swift expression. Он должен быть достаточно простым, чтобы SwiftData преобразовала его в запрос хранилища.

## Relationships

```swift
@Model
class User {
    var name: String
    @Relationship(deleteRule: .cascade) var jobs = [Job]()
}
```

Delete rule — часть модели данных: `.cascade` удалит связанные jobs вместе с user. Выбирай правило по смыслу владения, а не по удобству.

## FetchDescriptor и подсчёт

Когда `@Query` не подходит, создай `FetchDescriptor` и вызови context вручную. Для количества записей используй `fetchCount`, чтобы не загружать все models в память.

## Изменения schema

Добавление обязательной property без default может сломать существующее хранилище. Планируй migration: новая schema должна объяснить, как преобразовать старые данные.

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

## SwiftData и Core Data

SwiftData даёт Swift-first API, но использует знакомые идеи persistence: context, fetch, relationships и migrations. Абстракция уменьшает boilerplate, но не отменяет проектирование данных.

<Challenge>
<template #task>Добавь фильтр по имени, переключаемую сортировку и relationship User → Job. Проверь удаление родительской model.</template>
<template #knowledge>Closures, optionals, classes, predicates, Query и relationships.</template>
<template #hint1>Передавай filter string и descriptors в initializer отдельного `UsersView`.</template>
<template #hint2>Для поиска без учёта регистра используй поддерживаемое Predicate-сравнение, не фильтруй весь Array после fetch.</template>
<template #solution>

```swift
_users = Query(filter: #Predicate<User> { user in
    filter.isEmpty || user.name.localizedStandardContains(filter)
}, sort: sort)
```

</template>
</Challenge>

<ProjectRecap slug="project-12-swiftdata" />

Закрепи data flow в [Milestone Projects 10–12 →](/projects/milestone-10-12).
