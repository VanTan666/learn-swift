---
title: Project 11 — Bookworm
description: Личная библиотека со SwiftData, @Query и custom Binding.
projectSlug: project-11-bookworm
---

# Project 11 — Bookworm

Bookworm хранит прочитанные книги, авторов, жанры, ratings и отзывы. SwiftData берёт на себя persistence, а SwiftUI остаётся декларативным слоем интерфейса.

<ProjectPrerequisites slug="project-11-bookworm" />

## Стартовая точка

Создай новый **iOS → App** с именем **Bookworm** и интерфейсом SwiftUI. В сгенерированном `ContentView.swift` оставь минимальное состояние ниже. Сохрани файл `BookwormApp.swift`, созданный Xcode; если шаг меняет точку входа, замени существующий файл, не создавай второй `@main`.

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Начало")
    }
}
```

Сначала прочитай задание шага и попробуй выполнить его. Решение закрыто: открой его для сверки или если застрял. Применяй изменения по порядку — каждый шаг опирается на предыдущий.

### Шаг 1. Модель и контейнер

**Цель:** Модель и контейнер.

**Попробуй сам:** Создай @Model Book с title и author. Подключи modelContainer в существующем BookwormApp. Экран пока остаётся пустым.

<details>
<summary>Показать решение шага 1</summary>

**Book.swift** — создай файл и включи его в target приложения.

```swift
import SwiftData
@Model
final class Book {
    var title: String
    var author: String
    init(title: String, author: String) { self.title = title; self.author = author }
}
```

В **BookwormApp.swift** найди этот блок:

```swift
import SwiftUI
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
import SwiftUI
import SwiftData
```

В **BookwormApp.swift** найди этот блок:

```swift
WindowGroup { ContentView() }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
WindowGroup { ContentView() }
            .modelContainer(for: Book.self)
```


</details>

**Ожидаемый результат:** Приложение запускается с контейнером без второй точки входа. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** SwiftData сохраняет model-классы. Контейнер задаётся у App и передаёт context дочерним View; сам по себе он ещё не показывает данные.

`@Model` добавляет модели возможности SwiftData; это не UI-компонент. `.modelContainer(for:)` у Scene создаёт окружение для дочерних экранов. Если добавить только @Model и забыть контейнер, Query и modelContext не получат правильное хранилище. В проекте должен остаться ровно один struct с @main.

### Шаг 2. Чтение через Query

**Цель:** Чтение через Query.

**Попробуй сам:** Прочитай книги с сортировкой по title. Покажи строки с автором и пустое состояние при отсутствии записей.

<details>
<summary>Показать решение шага 2</summary>

В **ContentView.swift** добавь код сразу после строкой `import SwiftUI`:

```swift
import SwiftData
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @Query(sort: \Book.title) private var books: [Book]
```

В **ContentView.swift** найди этот блок:

```swift
Text("Начало")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
NavigationStack {
            List {
                ForEach(books) { book in
                    VStack(alignment: .leading) {
                        Text(book.title).font(.headline)
                        Text(book.author).foregroundStyle(.secondary)
                    }
                }
            }
            .overlay { if books.isEmpty { ContentUnavailableView("Книг нет", systemImage: "book") } }
            .navigationTitle("Bookworm")
        }
```


</details>

**Ожидаемый результат:** На новой базе показано «Книг нет». Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** @Query выполняет fetch и обновляет View после изменений моделей. Это не отдельный массив-копия, который нужно вручную синхронизировать с базой.

Запись `sort: \Book.title` указывает свойство сортировки через key path. Свойство books не заполняется вручную: Query получает записи из подключённого контейнера. Пустой массив на новой базе — правильный результат, поэтому сначала проверяем понятный пустой экран.

### Шаг 3. Добавление книги

**Цель:** Добавление книги.

**Попробуй сам:** Получай modelContext из environment. Добавь поля title/author и кнопку вставки с проверкой пробелов.

<details>
<summary>Показать решение шага 3</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @Environment(\.modelContext) private var context
    @State private var title = ""
    @State private var author = ""
    private func addBook() {
        context.insert(Book(title: title, author: author))
        title = ""; author = ""
    }
```

В **ContentView.swift** найди этот блок:

```swift
            List {
                ForEach
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
            List {
                Section("Новая книга") {
                    TextField("Название", text: $title)
                    TextField("Автор", text: $author)
                    Button("Добавить", action: addBook)
                        .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || author.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
                ForEach
```

В **ContentView.swift** найди этот блок:

```swift
            .overlay { if books.isEmpty { ContentUnavailableView("Книг нет", systemImage: "book") } }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift

```


</details>

**Ожидаемый результат:** После добавления книга появляется в отсортированном списке, поля очищаются. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** context.insert добавляет model в контекст. Изменения отслеживает Query; Array вручную менять не нужно.

`context.insert(...)` начинает отслеживание нового объекта. Query замечает вставку и обновляет список. Поля формы — временное состояние ввода, а Book — запись базы: очищая title и author, мы не очищаем свойства уже созданной книги. Попробуй добавить две книги в обратном алфавитном порядке.

### Шаг 4. Удаление и сохранение ошибок

**Цель:** Удаление и сохранение ошибок.

**Попробуй сам:** Добавь onDelete и явный save после вставки и удаления. При ошибке откати изменения контекста и покажи alert.

<details>
<summary>Показать решение шага 4</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var errorMessage: String?
    private func save() -> Bool {
        do { try context.save(); return true }
        catch { context.rollback(); errorMessage = error.localizedDescription; return false }
    }
```

В **ContentView.swift** найди этот блок:

```swift
context.insert(Book(title: title, author: author))
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
context.insert(Book(title: title, author: author))
        guard save() else { return }
```

В **ContentView.swift** найди этот блок:

```swift
                }
            }

            .navigationTitle("Bookworm")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
                }
                .onDelete { indexes in
                    for index in indexes { context.delete(books[index]) }
                    _ = save()
                }
                if books.isEmpty { Text("Книг нет — добавь первую выше") }
            }
            .navigationTitle("Bookworm")
            .alert("Ошибка сохранения", isPresented: Binding(
                get: { errorMessage != nil }, set: { if !$0 { errorMessage = nil } }
            )) { Button("OK") { errorMessage = nil } }
            message: { Text(errorMessage ?? "") }
```


</details>

**Ожидаемый результат:** Удаление убирает книгу; после перезапуска успешные изменения остаются. Ошибка записи показана пользователю. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** SwiftData поддерживает autosave, но явный save позволяет показать результат операции здесь. rollback возвращает контекст к последнему сохранённому состоянию при ошибке.

save фиксирует изменения контекста на диске. Если он завершился ошибкой, возвращаем false и не очищаем поля формы: пользователь может повторить действие. rollback убирает несохранённые изменения context, поэтому UI снова соответствует последнему сохранённому набору.

### Шаг 5. Отзыв в деталях

**Цель:** Отзыв в деталях.

**Попробуй сам:** Добавь review с пустым default и отдельный BookDetailView с TextEditor. Открой его по нажатию книги; сохраняй кнопкой «Сохранить отзыв».

<details>
<summary>Показать решение шага 5</summary>

В **Book.swift** найди этот блок:

```swift
    var author: String
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
    var author: String
    var review: String = ""
```

**BookDetailView.swift** — создай файл и включи его в target приложения.

```swift
import SwiftUI
import SwiftData
struct BookDetailView: View {
    @Bindable var book: Book
    @Environment(\.modelContext) private var context
    @State private var message = ""
    var body: some View {
        Form {
            Text(book.author)
            TextEditor(text: $book.review).frame(minHeight: 140)
            Button("Сохранить отзыв") {
                do { try context.save(); message = "Сохранено" }
                catch { message = "Ошибка: \(error.localizedDescription)" }
            }
            Text(message)
        }
        .navigationTitle(book.title)
    }
}
```

В **ContentView.swift** найди этот блок:

```swift
                    VStack(alignment: .leading) {
                        Text(book.title).font(.headline)
                        Text(book.author).foregroundStyle(.secondary)
                    }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
                    NavigationLink { BookDetailView(book: book) } label: {
                        VStack(alignment: .leading) {
                            Text(book.title).font(.headline)
                            Text(book.author).foregroundStyle(.secondary)
                        }
                    }
```


</details>

**Ожидаемый результат:** Отзыв редактируется и остаётся после успешного сохранения и перезапуска. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** @Bindable даёт Binding к property @Model. Передаём ту же книгу, context берём из окружения. Совместимый default нужен для уже существующих учебных записей.

`@Bindable var book` позволяет TextEditor получить `$book.review`. При обычном let доступно чтение, но не такая привязка к свойству модели. Default пустой строки задаёт значение отзыва для новой property у существующих учебных записей. Кнопка сохранения показывает отдельное сообщение — видимое редактирование ещё не доказывает запись на диск.

### Шаг 6. Общий RatingView

**Цель:** Общий RatingView.

**Попробуй сам:** Добавь rating с default 3, создай пять кнопок-звёзд с @Binding rating и покажи их в деталях.

<details>
<summary>Показать решение шага 6</summary>

В **Book.swift** найди этот блок:

```swift
    var review: String = ""
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
    var review: String = ""
    var rating: Int = 3
```

**RatingView.swift** — создай файл и включи его в target приложения.

```swift
import SwiftUI
struct RatingView: View {
    @Binding var rating: Int
    var body: some View {
        HStack {
            ForEach(1...5, id: \.self) { number in
                Button { rating = number } label: {
                    Image(systemName: number <= rating ? "star.fill" : "star")
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Оценить на \(number) из 5")
            }
        }
    }
}
```

В **BookDetailView.swift** найди этот блок:

```swift
            Text(book.author)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
            Text(book.author)
            RatingView(rating: $book.rating)
```


</details>

**Ожидаемый результат:** Нажатие звезды меняет оценку, кнопка сохранения сохраняет её вместе с отзывом. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Родитель владеет значением, RatingView получает Binding. Этот компонент можно переиспользовать вне SwiftData: он ничего не знает о Book и context.

Каждая кнопка присваивает номер выбранной звезды. `.buttonStyle(.plain)` помогает избежать поведения строки Form, при котором нажатие могло бы восприниматься как действие всей строки. Label доступности говорит «Оценить на N из 5», то есть действие, а не просто имя изображения star.fill.

## Глубже — необязательно

::: details Advanced: отдельная база для Preview
Не используй пользовательский store в тестах и Preview. `ModelConfiguration(isStoredInMemoryOnly: true)` создаёт временную базу. Индексы, ограничения и миграции изучай после уверенной работы с model, context и Query.
:::

## Самостоятельное изменение

<Challenge>
<template #task>Добавь genre с default «Другое» и Picker жанра в детали.</template>
<template #knowledge>Используй состояние и функции, которые уже собрал в этом проекте.</template>
<template #hint1>Используй тот же @Bindable book; отдельное состояние жанра не требуется.</template>
<template #hint2>Проверь обычный случай и граничные значения; сохрани основной рабочий маршрут.</template>
<template #solution>

```swift
// В Book:
var genre: String = "Другое"
// В Form BookDetailView:
Picker("Жанр", selection: $book.genre) {
    ForEach(["Другое", "Роман", "Научпоп"], id: \.self) { Text($0) }
}
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
import SwiftData


struct ContentView: View {
    @Query(sort: \Book.title) private var books: [Book]

    @Environment(\.modelContext) private var context
    @State private var title = ""
    @State private var author = ""
    private func addBook() {
        context.insert(Book(title: title, author: author))
        guard save() else { return }
        title = ""; author = ""
    }

    @State private var errorMessage: String?
    private func save() -> Bool {
        do { try context.save(); return true }
        catch { context.rollback(); errorMessage = error.localizedDescription; return false }
    }

    var body: some View {
        NavigationStack {
            List {
                Section("Новая книга") {
                    TextField("Название", text: $title)
                    TextField("Автор", text: $author)
                    Button("Добавить", action: addBook)
                        .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || author.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
                ForEach(books) { book in
                    NavigationLink { BookDetailView(book: book) } label: {
                        VStack(alignment: .leading) {
                            Text(book.title).font(.headline)
                            Text(book.author).foregroundStyle(.secondary)
                        }
                    }
                }
                .onDelete { indexes in
                    for index in indexes { context.delete(books[index]) }
                    _ = save()
                }
                if books.isEmpty { Text("Книг нет — добавь первую выше") }
            }
            .navigationTitle("Bookworm")
            .alert("Ошибка сохранения", isPresented: Binding(
                get: { errorMessage != nil }, set: { if !$0 { errorMessage = nil } }
            )) { Button("OK") { errorMessage = nil } }
            message: { Text(errorMessage ?? "") }
        }
    }
}
```

### BookwormApp.swift

```swift
import SwiftUI
import SwiftData

@main
struct BookwormApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
            .modelContainer(for: Book.self)
    }
}
```

### Book.swift

```swift
import SwiftData
@Model
final class Book {
    var title: String
    var author: String
    var review: String = ""
    var rating: Int = 3
    init(title: String, author: String) { self.title = title; self.author = author }
}
```

### BookDetailView.swift

```swift
import SwiftUI
import SwiftData
struct BookDetailView: View {
    @Bindable var book: Book
    @Environment(\.modelContext) private var context
    @State private var message = ""
    var body: some View {
        Form {
            Text(book.author)
            RatingView(rating: $book.rating)
            TextEditor(text: $book.review).frame(minHeight: 140)
            Button("Сохранить отзыв") {
                do { try context.save(); message = "Сохранено" }
                catch { message = "Ошибка: \(error.localizedDescription)" }
            }
            Text(message)
        }
        .navigationTitle(book.title)
    }
}
```

### RatingView.swift

```swift
import SwiftUI
struct RatingView: View {
    @Binding var rating: Int
    var body: some View {
        HStack {
            ForEach(1...5, id: \.self) { number in
                Button { rating = number } label: {
                    Image(systemName: number <= rating ? "star.fill" : "star")
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Оценить на \(number) из 5")
            }
        }
    }
}
```

</details>

<ProjectRecap slug="project-11-bookworm" />

Теперь разберём SwiftData глубже: [Project 12 →](/projects/project-12-swiftdata).
