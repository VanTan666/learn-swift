---
title: Project 5 — Word Scramble
description: Игра со словами, List, Bundle и проверкой ввода.
projectSlug: project-05-word-scramble
---

# Project 5 — Word Scramble

Игрок получает исходное слово и составляет из его букв новые. Проект хорошо показывает, как Array хранит данные интерфейса, а небольшие functions образуют последовательность проверок.

<ProjectPrerequisites slug="project-05-word-scramble" />

## Стартовая точка

Создай новый **iOS → App** с именем **WordScramble** и интерфейсом SwiftUI. В сгенерированном `ContentView.swift` оставь минимальное состояние ниже. Сохрани файл `WordScrambleApp.swift`, созданный Xcode; если шаг меняет точку входа, замени существующий файл, не создавай второй `@main`.

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Начало")
    }
}
```

Сначала прочитай задание шага и попробуй выполнить его. Решение закрыто: открой его для сверки или если застрял. Применяй изменения по порядку — каждый шаг опирается на предыдущий.

### Шаг 1. Поле нового слова

**Цель:** Поле нового слова.

**Попробуй сам:** Покажи исходное слово silkworm и TextField в List. Отключи автозаглавные буквы и автокоррекцию.

<details>
<summary>Показать решение шага 1</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var rootWord = "silkworm"
    @State private var newWord = ""
```

В **ContentView.swift** найди этот блок:

```swift
Text("Начало")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
NavigationStack {
            List {
                TextField("Новое слово", text: $newWord)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
            }
            .navigationTitle(rootWord)
        }
```


</details>

**Ожидаемый результат:** Поле принимает строчные слова, заголовок показывает исходное слово. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** `List` — системный прокручиваемый список. В этой игре используем английские слова, чтобы позднее согласовать язык ресурса и проверки словаря.

`text: $newWord` связывает строку с редактором. Отключение автокоррекции важно именно для игры: система не должна незаметно заменять попытку пользователя другим словом. `navigationTitle(rootWord)` пока отображает постоянное исходное слово. На этом этапе Return ещё ничего не добавляет — сначала проверь сам ввод.

### Шаг 2. Добавление в список

**Цель:** Добавление в список.

**Попробуй сам:** После Return нормализуй пробелы и регистр, вставь непустое слово в начало массива и очисти поле.

<details>
<summary>Показать решение шага 2</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var usedWords: [String] = []
    private func addWord() {
        let answer = newWord.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
        guard !answer.isEmpty, !usedWords.contains(answer) else { return }
        usedWords.insert(answer, at: 0)
        newWord = ""
    }
```

В **ContentView.swift** найди этот блок:

```swift
.autocorrectionDisabled()
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.autocorrectionDisabled()
                    .onSubmit(addWord)
                ForEach(usedWords, id: \.self) { Text($0) }
```


</details>

**Ожидаемый результат:** Ввод silk добавляет строку в список, пустой ввод ничего не добавляет. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** `onSubmit` запускает функцию по Return. Array хранит результат игры; SwiftUI обновляет ForEach при изменении @State.

`trimmingCharacters(in:)` удаляет пробелы по краям, а `lowercased()` приводит ответ к одной форме. Благодаря этому `Silk` и ` silk ` не становятся разными словами. `insert(..., at: 0)` помещает новую запись сверху. Проверка повторов также защищает `ForEach(id: \.self)`: в таком списке одинаковые строки не должны иметь одинаковый ключ.

### Шаг 3. Понятные ошибки проверки

**Цель:** Понятные ошибки проверки.

**Попробуй сам:** Проверь длину от трёх букв, запрет исходного слова и повторов. Для каждой причины показывай отдельное сообщение через alert.

<details>
<summary>Показать решение шага 3</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var errorMessage = ""
    @State private var showingError = false
    private func reject(_ message: String) {
        errorMessage = message
        showingError = true
    }
```

В **ContentView.swift** найди этот блок:

```swift
guard !answer.isEmpty, !usedWords.contains(answer) else { return }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
guard answer.count >= 3 else { return reject("Минимум три буквы") }
        guard answer != rootWord else { return reject("Нужно другое слово") }
        guard !usedWords.contains(answer) else { return reject("Слово уже было") }
```

В **ContentView.swift** найди этот блок:

```swift
.navigationTitle(rootWord)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.navigationTitle(rootWord)
            .alert("Слово не принято", isPresented: $showingError) {
                Button("OK", role: .cancel) { }
            } message: { Text(errorMessage) }
```


</details>

**Ожидаемый результат:** silk принимается один раз; silkworm, si и повтор silk объясняют ошибку. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Несколько guard образуют читаемую цепочку проверок. Ошибка хранится отдельно от массива: неуспешный ввод не меняет уже найденные слова.

После неуспешного `guard` выполняется `return`, поэтому следующие проверки и вставка не происходят. Функция `reject` меняет только состояние сообщения. Порядок проверок влияет на объяснение: короткое слово сначала получит сообщение о длине, даже если других ошибок тоже несколько. Попробуй каждый запрещённый случай отдельно.

### Шаг 4. Проверка доступных букв

**Цель:** Проверка доступных букв.

**Попробуй сам:** Напиши isPossible: по одному удаляй символы ответа из копии rootWord. Если символа больше нет, отклони слово.

<details>
<summary>Показать решение шага 4</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    private func isPossible(_ word: String) -> Bool {
        var remaining = rootWord
        for letter in word {
            guard let index = remaining.firstIndex(of: letter) else { return false }
            remaining.remove(at: index)
        }
        return true
    }
```

В **ContentView.swift** найди этот блок:

```swift
        usedWords.insert(answer, at: 0)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
        guard isPossible(answer) else { return reject("Не хватает букв исходного слова") }
        usedWords.insert(answer, at: 0)
```


</details>

**Ожидаемый результат:** milk принимается; wall отклоняется: в silkworm только одна l. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Копия строки расходуется при проверке. Это важно для повторяющихся букв: простой contains не учитывает количество. Функция не меняет rootWord.

Представь буквы как карточки на столе: использованную букву убирают, и второй раз взять её нельзя. `firstIndex(of:)` возвращает Optional, потому что нужной буквы может уже не остаться. Индекс принадлежит текущей копии строки; сразу после поиска удаляем найденный символ и продолжаем со следующим. Исходное слово сохраняется для новой попытки.

### Шаг 5. Системный словарь

**Цель:** Системный словарь.

**Попробуй сам:** Добавь UITextChecker для английского языка и отклоняй слова с найденной ошибкой.

<details>
<summary>Показать решение шага 5</summary>

В **ContentView.swift** добавь код сразу после строкой `import SwiftUI`:

```swift
import UIKit
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    private func isReal(_ word: String) -> Bool {
        let range = NSRange(location: 0, length: word.utf16.count)
        let misspelled = UITextChecker().rangeOfMisspelledWord(
            in: word, range: range, startingAt: 0, wrap: false, language: "en"
        )
        return misspelled.location == NSNotFound
    }
```

В **ContentView.swift** найди этот блок:

```swift
        usedWords.insert(answer, at: 0)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
        guard isReal(answer) else { return reject("Английское слово не найдено") }
        usedWords.insert(answer, at: 0)
```


</details>

**Ожидаемый результат:** Несуществующая комбинация букв отклоняется, известное английское слово проходит предыдущие проверки и словарь. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** UIKit UITextChecker использует NSRange в UTF-16, поэтому длина берётся из word.utf16.count. Словарь проверяет написание, а не правила нашей игры; обе проверки нужны.

Результат `rangeOfMisspelledWord` — диапазон первой ошибки. Значение `NSNotFound` означает, что такой диапазон не найден. Это другой способ сообщить отсутствие результата, чем Swift Optional; он пришёл из API UIKit. Для неанглийской версии игры нужно одновременно заменить словарь и набор исходных слов, иначе корректные слова будут отвергаться.

### Шаг 6. Слово из Bundle и новая игра

**Цель:** Слово из Bundle и новая игра.

**Попробуй сам:** Создай start.txt с исходными словами. Загружай его при запуске и по кнопке «Новая игра». Сбрасывай найденные слова только после успешного чтения.

<details>
<summary>Показать решение шага 6</summary>

Создай ресурс **start.txt**, добавь в Project navigator с **Copy items if needed** и target membership приложения.

```text
silkworm
development
playground
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    private func startGame() {
        do {
            guard let url = Bundle.main.url(forResource: "start", withExtension: "txt") else {
                throw CocoaError(.fileNoSuchFile)
            }
            let text = try String(contentsOf: url, encoding: .utf8)
            let words = text.split(whereSeparator: \.isNewline).map(String.init)
            guard let word = words.randomElement() else { throw CocoaError(.fileReadCorruptFile) }
            rootWord = word
            usedWords = []
            newWord = ""
        } catch { reject("Не удалось прочитать start.txt: проверь target membership") }
    }
```

В **ContentView.swift** найди этот блок:

```swift
.navigationTitle(rootWord)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.navigationTitle(rootWord)
            .onAppear(perform: startGame)
            .toolbar { Button("Новая игра", action: startGame) }
```


</details>

**Ожидаемый результат:** После перезапуска выбирается слово из файла; новая игра очищает список. При отсутствии файла появляется сообщение. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** `Bundle` ищет встроенный ресурс, а `String(contentsOf:)` может бросить ошибку. Пустые строки фильтруются до случайного выбора: последний перевод строки не станет заданием.

Target membership означает, что Xcode включит файл внутрь собранного приложения. Наличие файла в папке проекта само по себе этого не гарантирует. `randomElement()` возвращает Optional для пустого массива, поэтому пустой ресурс обрабатываем явно. При ошибке старый раунд остаётся доступным: очищение списка стоит после успешного чтения.

## Самостоятельное изменение

<Challenge>
<template #task>Покажи сумму длин всех найденных слов как счёт. После новой игры он должен стать нулём.</template>
<template #knowledge>Используй состояние и функции, которые уже собрал в этом проекте.</template>
<template #hint1>Вычисляй счёт из usedWords, не храни второе независимое значение.</template>
<template #hint2>Проверь обычный случай и граничные значения; сохрани основной рабочий маршрут.</template>
<template #solution>

```swift
private var score: Int { usedWords.reduce(0) { $0 + $1.count } }
// Добавь в List:
Text("Счёт: \(score)")
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
import UIKit


struct ContentView: View {
    @State private var rootWord = "silkworm"
    @State private var newWord = ""

    @State private var usedWords: [String] = []
    private func addWord() {
        let answer = newWord.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
        guard answer.count >= 3 else { return reject("Минимум три буквы") }
        guard answer != rootWord else { return reject("Нужно другое слово") }
        guard !usedWords.contains(answer) else { return reject("Слово уже было") }
        guard isPossible(answer) else { return reject("Не хватает букв исходного слова") }
        guard isReal(answer) else { return reject("Английское слово не найдено") }
        usedWords.insert(answer, at: 0)
        newWord = ""
    }

    @State private var errorMessage = ""
    @State private var showingError = false
    private func reject(_ message: String) {
        errorMessage = message
        showingError = true
    }

    private func isPossible(_ word: String) -> Bool {
        var remaining = rootWord
        for letter in word {
            guard let index = remaining.firstIndex(of: letter) else { return false }
            remaining.remove(at: index)
        }
        return true
    }

    private func isReal(_ word: String) -> Bool {
        let range = NSRange(location: 0, length: word.utf16.count)
        let misspelled = UITextChecker().rangeOfMisspelledWord(
            in: word, range: range, startingAt: 0, wrap: false, language: "en"
        )
        return misspelled.location == NSNotFound
    }

    private func startGame() {
        do {
            guard let url = Bundle.main.url(forResource: "start", withExtension: "txt") else {
                throw CocoaError(.fileNoSuchFile)
            }
            let text = try String(contentsOf: url, encoding: .utf8)
            let words = text.split(whereSeparator: \.isNewline).map(String.init)
            guard let word = words.randomElement() else { throw CocoaError(.fileReadCorruptFile) }
            rootWord = word
            usedWords = []
            newWord = ""
        } catch { reject("Не удалось прочитать start.txt: проверь target membership") }
    }

    var body: some View {
        NavigationStack {
            List {
                TextField("Новое слово", text: $newWord)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .onSubmit(addWord)
                ForEach(usedWords, id: \.self) { Text($0) }
            }
            .navigationTitle(rootWord)
            .onAppear(perform: startGame)
            .toolbar { Button("Новая игра", action: startGame) }
            .alert("Слово не принято", isPresented: $showingError) {
                Button("OK", role: .cancel) { }
            } message: { Text(errorMessage) }
        }
    }
}
```

### WordScrambleApp.swift

```swift
import SwiftUI

@main
struct WordScrambleApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

### Ресурс start.txt

```text
silkworm
development
playground
```

</details>

<ProjectRecap slug="project-05-word-scramble" />

Дальше интерфейс начнёт двигаться: [Project 6 — Animations →](/projects/project-06-animations).
