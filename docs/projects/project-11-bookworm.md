---
title: Project 11 — Bookworm
description: Личная библиотека со SwiftData, @Query и custom Binding.
projectSlug: project-11-bookworm
---

# Project 11 — Bookworm

Bookworm хранит прочитанные книги, авторов, жанры, ratings и отзывы. SwiftData берёт на себя persistence, а SwiftUI остаётся декларативным слоем интерфейса.

<ProjectPrerequisites slug="project-11-bookworm" />

## Рабочий vertical slice

```swift
import SwiftUI
import SwiftData

@Model
final class Book {
    var title: String
    var author: String

    init(title: String, author: String) {
        self.title = title
        self.author = author
    }
}

struct ContentView: View {
    @Environment(\.modelContext) private var context
    @Query(sort: \Book.title) private var books: [Book]
    @State private var title = ""
    @State private var author = ""

    var body: some View {
        NavigationStack {
            List {
                Section("Новая книга") {
                    TextField("Название", text: $title)
                    TextField("Автор", text: $author)
                    Button("Добавить", action: addBook)
                        .disabled(title.isEmpty || author.isEmpty)
                }

                Section("Библиотека") {
                    ForEach(books) { book in
                        VStack(alignment: .leading) {
                            Text(book.title).font(.headline)
                            Text(book.author).foregroundStyle(.secondary)
                        }
                    }
                    .onDelete { indexes in
                        for index in indexes { context.delete(books[index]) }
                    }
                }
            }
            .navigationTitle("Bookworm")
        }
    }

    private func addBook() {
        context.insert(Book(title: title, author: author))
        title = ""
        author = ""
    }
}

@main
struct BookwormApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
            .modelContainer(for: Book.self)
    }
}
```

В новом App-проекте замените сгенерированные `ContentView` и `App` этими объявлениями. Сначала проверьте add/delete и перезапуск, затем добавляйте rating и review.

## Model и container

```swift
@Model
final class Book {
    var title: String
    var author: String
    var genre: String
    var review: String
    var rating: Int
    var date: Date
}
```

`@Model` делает class сохраняемой SwiftData model. В корне приложения `.modelContainer(for: Book.self)` создаёт container и передаёт context дочерним View.

Preview и тесты не должны писать в реальную пользовательскую базу. Создайте in-memory configuration и наполните её небольшими fixtures:

```swift
let configuration = ModelConfiguration(isStoredInMemoryOnly: true)
let container = try ModelContainer(for: Book.self, configurations: configuration)
```

На пустом результате показывайте `ContentUnavailableView` с понятным действием добавления.

::: details Advanced: ограничения и индексы
Новые `#Unique` и `#Index` полезны на свежих SDK. Они не нужны для понимания первого SwiftData-проекта; добавляйте их только после рабочей модели, контейнера, вставки и удаления.
:::

## @Query читает данные

```swift
@Query(sort: [SortDescriptor(\Book.title), SortDescriptor(\Book.author)])
private var books: [Book]
```

Это не вручную обновляемый Array: SwiftData выполняет fetch и SwiftUI обновляет список при изменениях context.

## Добавление и удаление

```swift
@Environment(\.modelContext) private var modelContext

modelContext.insert(Book(title: title, author: author, genre: genre,
                         review: review, rating: rating, date: .now))
```

Для удаления передай model object в `modelContext.delete`. Изменения сохраняются автоматически в подходящий момент; для критичного workflow можно вызвать `save()` и обработать ошибку.

## Custom rating View

Reusable `RatingView` получает `@Binding var rating: Int`. Родитель владеет значением, а дочерний View показывает символы и меняет его через Binding.

```swift
ForEach(1..<maximumRating + 1, id: \.self) { number in
    Button { rating = number } label: {
        Image(systemName: number > rating ? "star" : "star.fill")
    }
}
```

<Challenge>
<template #task>Добавь validation формы, отдельный стиль для низкой оценки и подтверждение перед удалением книги.</template>
<template #knowledge>SwiftData context, Binding, conditions, computed properties и alerts.</template>
<template #hint1>Кнопка Save может использовать `.disabled(title.isEmpty || author.isEmpty)`.</template>
<template #hint2>Не удаляй из Array вручную: передай выбранную model в context.</template>
<template #solution>

```swift
Button("Удалить", role: .destructive) {
    modelContext.delete(book)
    dismiss()
}
```

</template>
</Challenge>

<ProjectRecap slug="project-11-bookworm" />

Теперь разберём SwiftData глубже: [Project 12 →](/projects/project-12-swiftdata).
